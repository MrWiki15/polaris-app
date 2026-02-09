import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  handleCors,
  methodNotAllowed,
  sendError,
  sendSuccess,
} from "../_utils/response";
import { withAuth, AuthenticatedRequest } from "../_middleware/auth";
import { getUserData, saveUserData } from "../_utils/supabase";
import { validateBody, saleSchema } from "../_utils/validation";

/**
 * GET /api/sales/[id] - Get sale by ID
 * PUT /api/sales/[id] - Update sale
 * DELETE /api/sales/[id] - Delete sale
 */
async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const userId = req.user!.userId;
  const saleId = req.query.id as string;

  if (!saleId) {
    return sendError(res, "ID de venta requerido", 400);
  }

  try {
    const backup = await getUserData(userId);
    if (!backup) {
      return sendError(res, "No hay datos guardados", 404);
    }

    const data =
      typeof backup.data === "string" ? JSON.parse(backup.data) : backup.data;
    const saleIndex = data.sales.findIndex((s: any) => s.id === saleId);

    if (saleIndex === -1) {
      return sendError(res, "Venta no encontrada", 404);
    }

    if (req.method === "GET") {
      // Get sale by ID
      return sendSuccess(res, { sale: data.sales[saleIndex] });
    } else if (req.method === "PUT") {
      // Update sale
      const validated = validateBody(req.body, saleSchema.partial(), res);
      if (!validated) return;

      data.sales[saleIndex] = {
        ...data.sales[saleIndex],
        ...validated,
      };

      await saveUserData(userId, data);
      return sendSuccess(res, { sale: data.sales[saleIndex] });
    } else if (req.method === "DELETE") {
      // Delete sale
      data.sales.splice(saleIndex, 1);
      await saveUserData(userId, data);
      return sendSuccess(res, { message: "Venta eliminada exitosamente" });
    } else {
      return methodNotAllowed(res, ["GET", "PUT", "DELETE"]);
    }
  } catch (error: any) {
    console.error("Sale endpoint error:", error);
    return sendError(res, error.message || "Error al procesar venta", 500);
  }
}

export default withAuth(handler);
