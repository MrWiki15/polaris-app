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

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * GET /api/services - List all services
 * POST /api/services - Create new service
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
      // List all services
      const services = data.services || [];
      return sendSuccess(res, { services });
    } else if (req.method === "POST") {
      // Create new service
      const validated = validateBody(req.body, serviceSchema, res);
      if (!validated) return;

      const newService = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        ...validated,
      };

      data.services = [...(data.services || []), newService];
      await saveUserData(userId, data);

      return sendSuccess(res, { service: newService }, 201);
    } else {
      return methodNotAllowed(res, ["GET", "POST"]);
    }
  } catch (error: any) {
    console.error("Services endpoint error:", error);
    return sendError(res, error.message || "Error al procesar servicios", 500);
  }
}

export default withAuth(handler);
