import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { generateAccessToken, generateRefreshToken } from "../_utils/jwt";
import {
  handleCors,
  methodNotAllowed,
  sendError,
  sendSuccess,
} from "../_utils/response";
import { validateBody, authSchemas } from "../_utils/validation";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * POST /api/auth/login
 * Login with email and password
 * Returns access token (24h) and refresh token (30d)
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
    const validated = validateBody(req.body, authSchemas.login, res);
    if (!validated) return;

    const { email, password } = validated;

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return sendError(res, "Credenciales inválidas", 401);
    }

    if (!data.user) {
      return sendError(res, "Error al iniciar sesión", 500);
    }

    // Generate JWT tokens
    const payload = {
      userId: data.user.id,
      email: data.user.email || "",
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return sendSuccess(res, {
      accessToken,
      refreshToken,
      expiresIn: 86400, // 24 hours in seconds
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return sendError(res, error.message || "Error al iniciar sesión", 500);
  }
}
