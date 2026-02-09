import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  handleCors,
  methodNotAllowed,
  sendError,
  sendSuccess,
} from "../_utils/response";
import { withAuth, AuthenticatedRequest } from "../_middleware/auth";
import { getUserData, saveUserData } from "../_utils/supabase";
import { validateBody, clientSchema } from "../_utils/validation";

/**
 * GET /api/clients/[id] - Get client by ID
 * PUT /api/clients/[id] - Update client
 * DELETE /api/clients/[id] - Delete client
 */
async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const userId = req.user!.userId;
  const clientId = req.query.id as string;

  if (!clientId) {
    return sendError(res, "ID de cliente requerido", 400);
  }

  try {
    const backup = await getUserData(userId);
    if (!backup) {
      return sendError(res, "No hay datos guardados", 404);
    }

    const data =
      typeof backup.data === "string" ? JSON.parse(backup.data) : backup.data;
    const clientIndex = data.clients.findIndex((c: any) => c.id === clientId);

    if (clientIndex === -1) {
      return sendError(res, "Cliente no encontrado", 404);
    }

    if (req.method === "GET") {
      return sendSuccess(res, { client: data.clients[clientIndex] });
    } else if (req.method === "PUT") {
      const validated = validateBody(req.body, clientSchema.partial(), res);
      if (!validated) return;

      data.clients[clientIndex] = {
        ...data.clients[clientIndex],
        ...validated,
      };

      await saveUserData(userId, data);
      return sendSuccess(res, { client: data.clients[clientIndex] });
    } else if (req.method === "DELETE") {
      data.clients.splice(clientIndex, 1);
      await saveUserData(userId, data);
      return sendSuccess(res, { message: "Cliente eliminado exitosamente" });
    } else {
      return methodNotAllowed(res, ["GET", "PUT", "DELETE"]);
    }
  } catch (error: any) {
    console.error("Client endpoint error:", error);
    return sendError(res, error.message || "Error al procesar cliente", 500);
  }
}

export default withAuth(handler);
