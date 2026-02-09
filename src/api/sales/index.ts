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

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * GET /api/sales - List all sales
 * POST /api/sales - Create new sale
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
      // List all sales
      const { category, startDate, endDate, limit } = req.query;
      let sales = data.sales || [];

      // Filter by category
      if (category) {
        sales = sales.filter((s: any) => s.category === category);
      }

      // Filter by date range
      if (startDate) {
        sales = sales.filter((s: any) => s.date >= startDate);
      }
      if (endDate) {
        sales = sales.filter((s: any) => s.date <= endDate);
      }

      // Limit results
      if (limit) {
        sales = sales.slice(0, parseInt(limit as string));
      }

      return sendSuccess(res, { sales });
    } else if (req.method === "POST") {
      // Create new sale
      const validated = validateBody(req.body, saleSchema, res);
      if (!validated) return;

      const newSale = {
        id: generateId(),
        ...validated,
      };

      data.sales = [...(data.sales || []), newSale];
      await saveUserData(userId, data);

      return sendSuccess(res, { sale: newSale }, 201);
    } else {
      return methodNotAllowed(res, ["GET", "POST"]);
    }
  } catch (error: any) {
    console.error("Sales endpoint error:", error);
    return sendError(res, error.message || "Error al procesar ventas", 500);
  }
}

export default withAuth(handler);
