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

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * GET /api/clients - List all clients
 * POST /api/clients - Create new client
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
      // List all clients
      const { type } = req.query;
      let clients = data.clients || [];

      if (type) {
        clients = clients.filter((c: any) => c.type === type);
      }

      return sendSuccess(res, { clients });
    } else if (req.method === "POST") {
      // Create new client
      const validated = validateBody(req.body, clientSchema, res);
      if (!validated) return;

      const newClient = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        ...validated,
      };

      data.clients = [...(data.clients || []), newClient];
      await saveUserData(userId, data);

      return sendSuccess(res, { client: newClient }, 201);
    } else {
      return methodNotAllowed(res, ["GET", "POST"]);
    }
  } catch (error: any) {
    console.error("Clients endpoint error:", error);
    return sendError(res, error.message || "Error al procesar clientes", 500);
  }
}

export default withAuth(handler);
