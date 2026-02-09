import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  handleCors,
  methodNotAllowed,
  sendError,
  sendSuccess,
} from "../_utils/response";
import { withAuth, AuthenticatedRequest } from "../_middleware/auth";
import { getUserData, saveUserData } from "../_utils/supabase";
import { validateBody, serviceSchema } from "../_utils/validation";

/**
 * GET /api/services/[id] - Get service by ID
 * PUT /api/services/[id] - Update service
 * DELETE /api/services/[id] - Delete service
 */
async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const userId = req.user!.userId;
  const serviceId = req.query.id as string;

  if (!serviceId) {
    return sendError(res, "ID de servicio requerido", 400);
  }

  try {
    const backup = await getUserData(userId);
    if (!backup) {
      return sendError(res, "No hay datos guardados", 404);
    }

    const data =
      typeof backup.data === "string" ? JSON.parse(backup.data) : backup.data;
    const serviceIndex = data.services.findIndex(
      (s: any) => s.id === serviceId,
    );

    if (serviceIndex === -1) {
      return sendError(res, "Servicio no encontrado", 404);
    }

    if (req.method === "GET") {
      return sendSuccess(res, { service: data.services[serviceIndex] });
    } else if (req.method === "PUT") {
      const validated = validateBody(req.body, serviceSchema.partial(), res);
      if (!validated) return;

      data.services[serviceIndex] = {
        ...data.services[serviceIndex],
        ...validated,
      };

      await saveUserData(userId, data);
      return sendSuccess(res, { service: data.services[serviceIndex] });
    } else if (req.method === "DELETE") {
      data.services.splice(serviceIndex, 1);
      await saveUserData(userId, data);
      return sendSuccess(res, { message: "Servicio eliminado exitosamente" });
    } else {
      return methodNotAllowed(res, ["GET", "PUT", "DELETE"]);
    }
  } catch (error: any) {
    console.error("Service endpoint error:", error);
    return sendError(res, error.message || "Error al procesar servicio", 500);
  }
}

export default withAuth(handler);
