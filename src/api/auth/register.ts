import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { encrypt } from "../../lib/crypto";
import { generateAccessToken, generateRefreshToken } from "../_utils/jwt";
import {
  handleCors,
  methodNotAllowed,
  sendError,
  sendSuccess,
} from "../_utils/response";
import { validateBody, authSchemas } from "../_utils/validation";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Create a Hedera wallet for new user
 */
async function createHederaWallet() {
  // This is a simplified version - you should implement proper Hedera wallet creation
  // or import from your existing lib/wallet.ts
  return {
    accountId: `0.0.${Math.floor(Math.random() * 1000000)}`,
    privateKey: `302e...${Math.random().toString(36).substring(2)}`,
  };
}

/**
 * POST /api/auth/register
 * Register new user with email and password
 * Creates user in Supabase and generates wallet
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

  // Only allow POST
  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  try {
    // Validate request body
    const validated = validateBody(req.body, authSchemas.register, res);
    if (!validated) return;

    const { email, password } = validated;

    // Register with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return sendError(res, error.message, 400);
    }

    if (!data.user) {
      return sendError(res, "Error al crear usuario", 500);
    }

    // Create Hedera wallet for new user
    try {
      const wallet = await createHederaWallet();
      const passphrase = process.env.VITE_ENCRIPTED_KEY || "";
      const encryptedKey = encrypt(wallet.privateKey, passphrase);

      await supabase.from("wallets").insert({
        userId: data.user.id,
        address: wallet.accountId,
        privateKey: encryptedKey,
      });
    } catch (walletError) {
      console.error("Wallet creation error:", walletError);
      // Continue even if wallet creation fails
    }

    // Generate JWT tokens
    const payload = {
      userId: data.user.id,
      email: data.user.email || "",
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return sendSuccess(
      res,
      {
        accessToken,
        refreshToken,
        expiresIn: 86400, // 24 hours in seconds
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        message:
          "Usuario registrado exitosamente. Por favor verifica tu email.",
      },
      201,
    );
  } catch (error: any) {
    console.error("Register error:", error);
    return sendError(res, error.message || "Error al registrar usuario", 500);
  }
}
