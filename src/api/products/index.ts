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

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * GET /api/products - List all products
 * POST /api/products - Create new product
 */
async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const userId = req.user!.userId;

  try {
    const backup = await getUserData(userId);
    let data: any = {
      sales: [],
      expenses: [],
      products: [],
      clients: [],
      workers: [],
      events: [],
      goals: [],
      debts: [],
      recurringPayments: [],
      suppliers: [],
      supplierOrders: [],
      services: [],
      serviceIncomes: [],
      customTags: [],
      customCategories: [],
      settings: {},
    };

    if (backup) {
      data =
        typeof backup.data === "string" ? JSON.parse(backup.data) : backup.data;
    }

    if (req.method === "GET") {
      // List all products
      const { category, lowStock } = req.query;
      let products = data.products || [];

      if (category) {
        products = products.filter((p: any) => p.category === category);
      }

      if (lowStock === "true") {
        products = products.filter(
          (p: any) => p.minStock && p.quantity <= p.minStock,
        );
      }

      return sendSuccess(res, { products });
    } else if (req.method === "POST") {
      // Create new product
      const validated = validateBody(req.body, productSchema, res);
      if (!validated) return;

      const newProduct = {
        id: generateId(),
        ...validated,
      };

      data.products = [...(data.products || []), newProduct];
      await saveUserData(userId, data);

      return sendSuccess(res, { product: newProduct }, 201);
    } else {
      return methodNotAllowed(res, ["GET", "POST"]);
    }
  } catch (error: any) {
    console.error("Products endpoint error:", error);
    return sendError(res, error.message || "Error al procesar productos", 500);
  }
}

export default withAuth(handler);
