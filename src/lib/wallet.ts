import {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  Hbar,
} from "@hashgraph/sdk";
import { supabase } from "@/lib/supabase";
import { decrypt } from "@/lib/crypto";
import { ethers } from "ethers";

export type UserWallet = {
  id: string;
  userId: string;
  address: string;
  private_key: string;
};

export const getUserWallet = async (
  userId: string,
): Promise<UserWallet | null> => {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("userId", userId)
    .limit(1)
    .maybeSingle();
  if (error) {
    return null;
  }
  return data as UserWallet | null;
};

const getProvider = (): ethers.Provider => {
  const rpcUrl = import.meta.env.VITE_RPC_URL || "";
  if (rpcUrl) {
    return new ethers.JsonRpcProvider(rpcUrl);
  }
  return ethers.getDefaultProvider();
};

export const getDecryptedPrivateKey = async (
  encrypted: string,
): Promise<string> => {
  const passphrase = import.meta.env.VITE_ENCRIPTED_KEY || "";
  const pk = await decrypt(encrypted, passphrase);
  return pk;
};

export const sendFunds = async (
  userId: string,
  toAddress: string,
  amountEth: string,
) => {
  const walletRow = await getUserWallet(userId);
  if (!walletRow) {
    throw new Error("Wallet no encontrada");
  }
  const privateKey = await getDecryptedPrivateKey(walletRow.private_key);
  const provider = getProvider();
  const signer = new ethers.Wallet(privateKey, provider);
  const tx = await signer.sendTransaction({
    to: toAddress,
    value: ethers.parseEther(amountEth),
  });
  const receipt = await tx.wait();
  return { hash: tx.hash, receipt };
};

const PUSD_ADDRESS = "0xdddD73F5Df1F0DC31373357beAC77545dC5A6f3F";
const API_BASE =
  (import.meta.env.VITE_PLUME_API_BASE as string) ||
  "https://explorer-plume-mainnet-1.t.conduit.xyz";
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 value) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

const fetchJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json();
};

const getTokenDecimals = async (): Promise<number> => {
  try {
    const json = await fetchJson(`${API_BASE}/api/v2/tokens/${PUSD_ADDRESS}`);
    const d = json?.decimals;
    if (typeof d === "number") return d;
    if (typeof d === "string") return parseInt(d, 10);
  } catch {}
  return 18;
};

export const getPusdBalance = async (
  userId: string,
): Promise<{ raw: bigint; decimals: number }> => {
  const walletRow = await getUserWallet(userId);
  if (!walletRow) {
    throw new Error("Wallet no encontrada");
  }
  const decimals = await getTokenDecimals();
  const url = `${API_BASE}/api?module=account&action=tokenbalance&contractaddress=${PUSD_ADDRESS}&address=${walletRow.address}`;
  const data = await fetchJson(url);
  const rawResult = data?.result ?? "0";
  const raw = BigInt(rawResult);
  return { raw, decimals };
};

export const sendPusd = async (
  userId: string,
  toAddress: string,
  amount: string,
) => {
  const walletRow = await getUserWallet(userId);
  if (!walletRow) {
    throw new Error("Wallet no encontrada");
  }
  const provider = getProvider();
  const privateKey = await getDecryptedPrivateKey(walletRow.private_key);
  const signer = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(PUSD_ADDRESS, ERC20_ABI, signer);
  const decimals: number = await contract.decimals();
  const value = ethers.parseUnits(amount, decimals);
  const tx = await contract.transfer(toAddress, value);
  const receipt = await tx.wait();
  return { hash: tx.hash, receipt };
};

export type TokenTransfer = {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  amount: string;
  direction: "sent" | "received";
};

export const getPusdTransfers = async (
  userId: string,
): Promise<TokenTransfer[]> => {
  const walletRow = await getUserWallet(userId);
  if (!walletRow) {
    return [];
  }
  const decimals = await getTokenDecimals();
  const url = `${API_BASE}/api?module=account&action=tokentx&contractaddress=${PUSD_ADDRESS}&address=${walletRow.address}&page=1&offset=50&sort=desc`;
  const data = await fetchJson(url);
  const list = (data?.result ?? []) as Array<any>;
  const mapped: TokenTransfer[] = list.map((it) => {
    const amount = ethers.formatUnits(BigInt(it.value || "0"), decimals);
    const direction: "sent" | "received" =
      it.from && it.from.toLowerCase() === walletRow.address.toLowerCase()
        ? "sent"
        : "received";
    const ts = it.timeStamp ? Number(it.timeStamp) * 1000 : Date.now();
    return {
      hash: it.hash,
      timestamp: ts,
      from: it.from,
      to: it.to,
      amount,
      direction,
    };
  });
  return mapped.sort((a, b) => b.timestamp - a.timestamp);
};

//Hedera

const operatorId = import.meta.env.VITE_OPERATOR_ID;
const operatorKey = import.meta.env.VITE_OPERATOR_KEY;
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

export const createHederaWallet = async () => {
  // Genera una nueva clave para la cuenta
  const newKey = PrivateKey.generateECDSA();

  // Crea la cuenta con balance inicial
  const transaction = new AccountCreateTransaction()
    .setKey(newKey.publicKey) // Usar .setKey() en lugar de .setKeyWithAlias()
    .setInitialBalance(Hbar.fromTinybars(1000));

  // Ejecuta la transacción
  const txResponse = await transaction.execute(client);
  const receipt = await txResponse.getReceipt(client);

  if (!receipt.accountId) {
    throw new Error("No se pudo crear la cuenta");
  }

  console.log("Nueva cuenta ID: " + receipt.accountId.toString());

  return {
    accountId: receipt.accountId.toString(), // Dirección de la cuenta
    privateKey: newKey.toString(), // Private key en formato string
  };
};
