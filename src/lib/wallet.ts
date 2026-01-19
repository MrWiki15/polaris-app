import {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  Hbar,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TransactionId,
  TokenMintTransaction,
} from "@hashgraph/sdk";
import { supabase } from "@/lib/supabase";
import { decrypt } from "@/lib/crypto";
import { ethers } from "ethers";
import type { AppData } from "@/lib/storage";

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

export const createHederaWallet = async (customNonce?: number) => {
  try {
    // Genera una nueva clave para la cuenta
    const newKey = PrivateKey.generateECDSA();

    // Crea la cuenta con balance inicial
    const transaction = new AccountCreateTransaction()
      .setKey(newKey.publicKey)
      .setInitialBalance(Hbar.fromTinybars(1000))
      .setMaxTransactionFee(new Hbar(2)); // Aumentar fee máximo

    // Usar un timestamp único para cada transacción
    const now = Date.now();
    const uniqueTimestamp = customNonce ? now + customNonce : now;

    const transactionId = new TransactionId({
      accountId: client.operatorAccountId,
      validStart: new Date(uniqueTimestamp),
    });

    transaction.setTransactionId(transactionId);

    // Congelar con un timeout más largo
    const frozenTransaction = await transaction.freezeWith(client);

    // Ejecutar con retry en caso de error
    let attempts = 0;
    let txResponse;

    while (attempts < 3) {
      try {
        txResponse = await frozenTransaction.execute(client);
        break;
      } catch (error) {
        attempts++;
        if (attempts === 3) throw error;
        // Esperar antes de reintentar
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }

    // Obtener recibo con reintentos
    const receipt = await txResponse.getReceipt(client);

    if (!receipt.accountId) {
      throw new Error("No se pudo crear la cuenta");
    }

    return {
      accountId: receipt.accountId.toString(),
      privateKey: newKey.toString(),
    };
  } catch (error) {
    console.error("Error en createHederaWallet:", error.message);
    throw error;
  }
};

export const createHederaNftCollection = async (collectionName: string) => {
  const symbol =
    collectionName
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 6)
      .toUpperCase() || "NFT";

  const supplyKey = PrivateKey.fromString(operatorKey as string);
  const metadataKey = PrivateKey.generateECDSA();

  const tokenCreateTx = new TokenCreateTransaction()
    .setTokenName(collectionName)
    .setTokenSymbol(symbol)
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(operatorId as string)
    .setSupplyType(TokenSupplyType.Infinite)
    .setSupplyKey(supplyKey)
    .setMetadataKey(metadataKey)
    .freezeWith(client);

  const signedTx = await tokenCreateTx.sign(supplyKey);
  const submitTx = await signedTx.execute(client);
  const receipt = await submitTx.getReceipt(client);

  if (!receipt.tokenId) {
    throw new Error("No se pudo crear la colección NFT");
  }

  return {
    tokenId: receipt.tokenId.toString(),
    supplyKey: supplyKey.toString(),
    metadataKey: metadataKey.toString(),
  };
};

export const upDataToPinata = async (data: any) => {
  const pinataKeySecret = import.meta.env.VITE_PINATA_KEY_SECRET as
    | string
    | undefined;
  const pinataUrl = import.meta.env.VITE_PINATA_URL;

  if (!pinataKeySecret) {
    throw new Error("VITE_PINATA_KEY_SECRET no configurada");
  }

  const response = await fetch(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${pinataKeySecret}`,
      },
      body: JSON.stringify({
        pinataContent: data,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Error al subir datos a Pinata: ${response.status}`);
  }

  const json = await response.json();
  const ipfsHash: string = json.IpfsHash || json.ipfsHash;

  if (!ipfsHash) {
    throw new Error("Respuesta de Pinata inválida, falta IpfsHash");
  }

  return {
    ipfsHash,
    uri: `ipfs://${ipfsHash}`,
    gatewayUrl: `${pinataUrl}/ipfs/${ipfsHash}`,
  };
};

export const mintNftForCollection = async (projectId: number) => {
  const { data: project, error } = await supabase
    .from("projects")
    .select("id, name, created_at, data, history, collection")
    .eq("id", projectId)
    .single();

  if (error || !project) {
    throw new Error("Proyecto no encontrado");
  }

  const appData = ((project as any).data || {}) as AppData;
  const history = ((project as any).history || []) as any[];
  const collection = (project as any).collection as
    | {
        tokenId: string;
        supplyKey: string;
        metadataKey: string;
      }
    | undefined;

  if (!collection || !collection.tokenId || !collection.supplyKey) {
    throw new Error("Colección NFT del proyecto no configurada");
  }

  const now = new Date();
  const endDateIso = now.toISOString().split("T")[0];

  const periodEntries = history.filter(
    (h) => h && h.type === "period" && typeof h.endDate === "string",
  );

  let startDateIso: string;

  if (periodEntries.length > 0) {
    periodEntries.sort((a, b) => {
      const aTime = new Date(a.endDate).getTime();
      const bTime = new Date(b.endDate).getTime();
      return aTime - bTime;
    });
    const lastPeriod = periodEntries[periodEntries.length - 1];
    startDateIso = lastPeriod.endDate.split("T")[0];
  } else if ((project as any).created_at) {
    startDateIso = new Date((project as any).created_at)
      .toISOString()
      .split("T")[0];
  } else {
    startDateIso = endDateIso;
  }

  const normalizeDate = (value: string | undefined | null): string | null => {
    if (!value) return null;
    return value.split("T")[0];
  };

  const isInRange = (value: string | undefined | null): boolean => {
    const d = normalizeDate(value);
    if (!d) return false;
    return d >= startDateIso && d <= endDateIso;
  };

  const sales = appData.sales || [];
  const expenses = appData.expenses || [];
  const products = appData.products || [];
  const serviceIncomes = appData.serviceIncomes || [];

  const ingresosVentas = sales
    .filter((s) => isInRange(s.date))
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const ingresosServicios = serviceIncomes
    .filter((s) => isInRange(s.date))
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const ingresosTotales = ingresosVentas + ingresosServicios;

  const gastosTotales = expenses
    .filter((e) => isInRange(e.date))
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const inventoryItems = products.map((p) => {
    const quantity = p.quantity || 0;
    const cost = p.cost || 0;
    const price = p.price || 0;
    const totalCost = quantity * cost;
    const totalPrice = quantity * price;
    return {
      id: p.id,
      name: p.name,
      quantity,
      cost,
      price,
      totalCost,
      totalPrice,
    };
  });

  const inventarioTotalCoste = inventoryItems.reduce(
    (sum, item) => sum + item.totalCost,
    0,
  );
  const inventarioTotalPrecio = inventoryItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );

  const metadata = {
    projectId: projectId,
    projectName: (project as any).name,
    period: {
      startDate: startDateIso,
      endDate: endDateIso,
    },
    totals: {
      ingresos: ingresosTotales,
      gastos: gastosTotales,
      inventarioCoste: inventarioTotalCoste,
      inventarioPrecio: inventarioTotalPrecio,
    },
    inventory: inventoryItems,
  };

  const pinataResult = await upDataToPinata(metadata);

  const uriForNft = pinataResult.uri;

  let metadataBytes: Uint8Array;
  if (typeof TextEncoder !== "undefined") {
    metadataBytes = new TextEncoder().encode(uriForNft);
  } else {
    const buffer = (Buffer as any).from(uriForNft);
    metadataBytes = new Uint8Array(buffer);
  }

  const supplyKey = PrivateKey.fromString(collection.supplyKey);

  const mintTx = new TokenMintTransaction()
    .setTokenId(collection.tokenId)
    .setMetadata([metadataBytes])
    .setMaxTransactionFee(new Hbar(5));

  const frozenMint = await mintTx.freezeWith(client);
  const signedMint = await frozenMint.sign(supplyKey);
  const submitMint = await signedMint.execute(client);
  const mintReceipt = await submitMint.getReceipt(client);

  const serials: any[] = (mintReceipt as any).serials || [];
  const serialNumberRaw = serials[0];
  const serialNumber =
    typeof serialNumberRaw === "number"
      ? serialNumberRaw
      : serialNumberRaw && typeof serialNumberRaw.toNumber === "function"
        ? serialNumberRaw.toNumber()
        : Number(serialNumberRaw || 0);

  const periodEntry = {
    id:
      typeof crypto !== "undefined" && (crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: "period",
    startDate: startDateIso,
    endDate: endDateIso,
    totals: {
      ingresos: ingresosTotales,
      gastos: gastosTotales,
      inventarioCoste: inventarioTotalCoste,
      inventarioPrecio: inventarioTotalPrecio,
    },
    ipfsHash: pinataResult.ipfsHash,
    ipfsUri: pinataResult.uri,
    ipfsGatewayUrl: pinataResult.gatewayUrl,
    tokenId: collection.tokenId,
    serialNumber,
  };

  const newHistory = [...history, periodEntry];

  await supabase
    .from("projects")
    .update({ history: newHistory })
    .eq("id", projectId);

  return {
    projectId,
    period: {
      startDate: startDateIso,
      endDate: endDateIso,
    },
    totals: {
      ingresos: ingresosTotales,
      gastos: gastosTotales,
      inventarioCoste: inventarioTotalCoste,
      inventarioPrecio: inventarioTotalPrecio,
    },
    ipfs: pinataResult,
    tokenId: collection.tokenId,
    serialNumber,
  };
};
