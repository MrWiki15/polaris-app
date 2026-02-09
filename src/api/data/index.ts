import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  handleCors,
  methodNotAllowed,
  sendError,
  sendSuccess,
} from "../_utils/response";
import { withAuth, AuthenticatedRequest } from "../_middleware/auth";
import { getUserData, saveUserData } from "../_utils/supabase";

/**
 * GET /api/data
 * Get all company data for authenticated user
 *
 * PUT /api/data
 * Update all company data for authenticated user
 */
async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

  const userId = req.user!.userId;

  try {
    if (req.method === "GET") {
      // Get all data
      const backup = await getUserData(userId);

      if (!backup) {
        return sendSuccess(res, {
          data: null,
          message: "No hay datos guardados",
        });
      }

      const data =
        typeof backup.data === "string" ? JSON.parse(backup.data) : backup.data;

      return sendSuccess(res, {
        data,
        updatedAt: backup.updated_at,
      });
    } else if (req.method === "PUT") {
      // Update all data
      const { data } = req.body;

      if (!data) {
        return sendError(res, "Datos requeridos", 400);
      }

      await saveUserData(userId, data);

      return sendSuccess(res, {
        message: "Datos actualizados exitosamente",
        updatedAt: new Date().toISOString(),
      });
    } else {
      return methodNotAllowed(res, ["GET", "PUT"]);
    }
  } catch (error: any) {
    console.error("Data endpoint error:", error);
    return sendError(res, error.message || "Error al procesar datos", 500);
  }
}

export default withAuth(handler);
