import { supabase } from "@/lib/supabase";

export type PersonalWallet = {
  id: string;
  userId: string;
  name: string;
  balance: number;
  createdAt: string;
};

export type PersonalWalletTransfer = {
  id: string;
  userId: string;
  fromWalletId: string;
  toWalletId: string;
  fromWalletName: string;
  toWalletName: string;
  amount: number;
  createdAt: string;
};

/**
 * Obtiene todas las wallets personales del usuario
 */
export const getPersonalWallets = async (
  userId: string,
): Promise<PersonalWallet[]> => {
  const { data, error } = await supabase
    .from("personal_wallets")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: true });

  if (error) {
    console.error("Error fetching personal wallets:", error);
    return [];
  }
  return (data || []) as PersonalWallet[];
};

/**
 * Crea una nueva wallet personal
 */
export const createPersonalWallet = async (
  userId: string,
  name: string,
  initialBalance: number = 0,
): Promise<PersonalWallet | null> => {
  const { data, error } = await supabase
    .from("personal_wallets")
    .insert([
      {
        userId,
        name,
        balance: initialBalance,
        createdAt: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating personal wallet:", error);
    return null;
  }
  return data as PersonalWallet;
};

/**
 * Actualiza el balance de una wallet
 */
export const updateWalletBalance = async (
  walletId: string,
  newBalance: number,
): Promise<boolean> => {
  const { error } = await supabase
    .from("personal_wallets")
    .update({ balance: newBalance })
    .eq("id", walletId);

  if (error) {
    console.error("Error updating wallet balance:", error);
    return false;
  }
  return true;
};

/**
 * Registra una transferencia entre wallets personales
 */
export const createTransfer = async (
  userId: string,
  fromWalletId: string,
  toWalletId: string,
  fromWalletName: string,
  toWalletName: string,
  amount: number,
): Promise<PersonalWalletTransfer | null> => {
  const { data, error } = await supabase
    .from("personal_wallet_transfers")
    .insert([
      {
        userId,
        fromWalletId,
        toWalletId,
        fromWalletName,
        toWalletName,
        amount,
        createdAt: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating transfer:", error);
    return null;
  }
  return data as PersonalWalletTransfer;
};

/**
 * Obtiene el historial de transferencias del usuario
 */
export const getTransferHistory = async (
  userId: string,
): Promise<PersonalWalletTransfer[]> => {
  const { data, error } = await supabase
    .from("personal_wallet_transfers")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching transfer history:", error);
    return [];
  }
  return (data || []) as PersonalWalletTransfer[];
};

/**
 * Realiza una transferencia completa: actualiza balances y registra la transferencia
 */
export const performTransfer = async (
  userId: string,
  fromWallet: PersonalWallet,
  toWallet: PersonalWallet,
  amount: number,
): Promise<boolean> => {
  try {
    // Validações básicas
    if (fromWallet.balance < amount) {
      console.error("Insufficient balance");
      return false;
    }

    // Actualizar balance de la wallet origen
    const updateFromSuccess = await updateWalletBalance(
      fromWallet.id,
      Number((fromWallet.balance - amount).toFixed(2)),
    );

    if (!updateFromSuccess) {
      return false;
    }

    // Actualizar balance de la wallet destino
    const updateToSuccess = await updateWalletBalance(
      toWallet.id,
      Number((toWallet.balance + amount).toFixed(2)),
    );

    if (!updateToSuccess) {
      // Revertir cambio en wallet origen si falla el destino
      await updateWalletBalance(
        fromWallet.id,
        Number(fromWallet.balance.toFixed(2)),
      );
      return false;
    }

    // Registrar la transferencia
    const transfer = await createTransfer(
      userId,
      fromWallet.id,
      toWallet.id,
      fromWallet.name,
      toWallet.name,
      amount,
    );

    if (!transfer) {
      // Revertir cambios si falla el registro
      await updateWalletBalance(
        fromWallet.id,
        Number(fromWallet.balance.toFixed(2)),
      );
      await updateWalletBalance(
        toWallet.id,
        Number((toWallet.balance - amount).toFixed(2)),
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error performing transfer:", err);
    return false;
  }
};

/**
 * Actualiza el nombre de una wallet
 */
export const updateWalletName = async (
  walletId: string,
  newName: string,
): Promise<boolean> => {
  const { error } = await supabase
    .from("personal_wallets")
    .update({ name: newName })
    .eq("id", walletId);

  if (error) {
    console.error("Error updating wallet name:", error);
    return false;
  }
  return true;
};

/**
 * Elimina una wallet personal (no permite eliminar la wallet Principal)
 */
export const deletePersonalWallet = async (
  walletId: string,
): Promise<boolean> => {
  const { error } = await supabase
    .from("personal_wallets")
    .delete()
    .eq("id", walletId);

  if (error) {
    console.error("Error deleting wallet:", error);
    return false;
  }
  return true;
};
