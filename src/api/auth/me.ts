import { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors, methodNotAllowed, sendSuccess } from "../_utils/response";
import { withAuth, AuthenticatedRequest } from "../_middleware/auth";

/**
 * GET /api/auth/me
 * Get current authenticated user info
 */
async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

  // Only allow GET
  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  return sendSuccess(res, {
    user: req.user,
  });
}

export default withAuth(handler);
