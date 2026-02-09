import { VercelRequest, VercelResponse } from "@vercel/node";
import { generateAccessToken, verifyRefreshToken } from "../_utils/jwt";
import {
  handleCors,
  methodNotAllowed,
  sendError,
  sendSuccess,
} from "../_utils/response";
import { validateBody, authSchemas } from "../_utils/validation";

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 * Returns new access token (24h)
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
    const validated = validateBody(req.body, authSchemas.refresh, res);
    if (!validated) return;

    const { refreshToken } = validated;

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
    });

    return sendSuccess(res, {
      accessToken: newAccessToken,
      expiresIn: 86400, // 24 hours in seconds
    });
  } catch (error: any) {
    console.error("Refresh error:", error);
    return sendError(res, error.message || "Refresh token inválido", 401);
  }
}
