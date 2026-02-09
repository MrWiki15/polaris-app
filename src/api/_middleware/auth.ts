import { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyAccessToken, extractToken, TokenPayload } from "../_utils/jwt";
import { sendError } from "../_utils/response";

export interface AuthenticatedRequest extends VercelRequest {
  user?: TokenPayload;
}

/**
 * Middleware to authenticate requests using JWT
 * Extracts and verifies the Bearer token from Authorization header
 */
export async function authenticate(
  req: AuthenticatedRequest,
  res: VercelResponse,
  next: () => void | Promise<void>,
) {
  try {
    const authHeader = req.headers.authorization as string;
    const token = extractToken(authHeader);

    if (!token) {
      return sendError(res, "Token de autorización requerido", 401);
    }

    const payload = verifyAccessToken(token);
    req.user = payload;

    await next();
  } catch (error: any) {
    return sendError(res, error.message || "No autorizado", 401);
  }
}

/**
 * Wrapper to easily create authenticated endpoints
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void>,
) {
  return async (req: AuthenticatedRequest, res: VercelResponse) => {
    await authenticate(req, res, async () => {
      await handler(req, res);
    });
  };
}
