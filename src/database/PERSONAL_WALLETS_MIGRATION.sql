-- Extensión necesaria (si no está instalada)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla para wallets personales del usuario
CREATE TABLE IF NOT EXISTS personal_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  name TEXT NOT NULL,
  balance DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_id FOREIGN KEY ("userId") REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabla para historial de transferencias entre wallets personales
CREATE TABLE IF NOT EXISTS personal_wallet_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "fromWalletId" UUID NOT NULL,
  "toWalletId" UUID NOT NULL,
  "fromWalletName" TEXT NOT NULL,
  "toWalletName" TEXT NOT NULL,
  amount DECIMAL(18, 2) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pwt_user_id FOREIGN KEY ("userId") REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_from_wallet FOREIGN KEY ("fromWalletId") REFERENCES personal_wallets(id) ON DELETE CASCADE,
  CONSTRAINT fk_to_wallet FOREIGN KEY ("toWalletId") REFERENCES personal_wallets(id) ON DELETE CASCADE
);

-- Índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_personal_wallets_userId ON personal_wallets("userId");
CREATE INDEX IF NOT EXISTS idx_personal_wallet_transfers_userId ON personal_wallet_transfers("userId");
CREATE INDEX IF NOT EXISTS idx_personal_wallet_transfers_createdAt ON personal_wallet_transfers("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_personal_wallet_transfers_fromWallet ON personal_wallet_transfers("fromWalletId");
CREATE INDEX IF NOT EXISTS idx_personal_wallet_transfers_toWallet ON personal_wallet_transfers("toWalletId");

-- Habilitar RLS (Row Level Security) para personal_wallets
ALTER TABLE personal_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wallets" ON personal_wallets
  FOR SELECT USING ("userId" = auth.uid());
CREATE POLICY "Users can insert own wallets" ON personal_wallets
  FOR INSERT WITH CHECK ("userId" = auth.uid());
CREATE POLICY "Users can update own wallets" ON personal_wallets
  FOR UPDATE USING ("userId" = auth.uid()) WITH CHECK ("userId" = auth.uid());
CREATE POLICY "Users can delete own wallets" ON personal_wallets
  FOR DELETE USING ("userId" = auth.uid());

-- Habilitar RLS para personal_wallet_transfers
ALTER TABLE personal_wallet_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transfers" ON personal_wallet_transfers
  FOR SELECT USING ("userId" = auth.uid());
CREATE POLICY "Users can insert own transfers" ON personal_wallet_transfers
  FOR INSERT WITH CHECK ("userId" = auth.uid());
CREATE POLICY "Users can update own transfers" ON personal_wallet_transfers
  FOR UPDATE USING ("userId" = auth.uid()) WITH CHECK ("userId" = auth.uid());
CREATE POLICY "Users can delete own transfers" ON personal_wallet_transfers
  FOR DELETE USING ("userId" = auth.uid());