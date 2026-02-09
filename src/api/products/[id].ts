import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  handleCors,
  methodNotAllowed,
  sendError,
  sendSuccess,
} from "../_utils/response";
import { withAuth, AuthenticatedRequest } from "../_middleware/auth";
import { getUserData, saveUserData } from "../_utils/supabase";
import { validateBody, productSchema } from "../_utils/validation";

/**
 * GET /api/products/[id] - Get product by ID
 * PUT /api/products/[id] - Update product
 * DELETE /api/products/[id] - Delete product
 */
async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const userId = req.user!.userId;
  const productId = req.query.id as string;

  if (!productId) {
    return sendError(res, "ID de producto requerido", 400);
  }

  try {
    const backup = await getUserData(userId);
    if (!backup) {
      return sendError(res, "No hay datos guardados", 404);
    }

    const data =
      typeof backup.data === "string" ? JSON.parse(backup.data) : backup.data;
    const productIndex = data.products.findIndex(
      (p: any) => p.id === productId,
    );

    if (productIndex === -1) {
      return sendError(res, "Producto no encontrado", 404);
    }

    if (req.method === "GET") {
      return sendSuccess(res, { product: data.products[productIndex] });
    } else if (req.method === "PUT") {
      const validated = validateBody(req.body, productSchema.partial(), res);
      if (!validated) return;

      data.products[productIndex] = {
        ...data.products[productIndex],
        ...validated,
      };

      await saveUserData(userId, data);
      return sendSuccess(res, { product: data.products[productIndex] });
    } else if (req.method === "DELETE") {
      data.products.splice(productIndex, 1);
      await saveUserData(userId, data);
      return sendSuccess(res, { message: "Producto eliminado exitosamente" });
    } else {
      return methodNotAllowed(res, ["GET", "PUT", "DELETE"]);
    }
  } catch (error: any) {
    console.error("Product endpoint error:", error);
    return sendError(res, error.message || "Error al procesar producto", 500);
  }
}

export default withAuth(handler);
