import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  handleCors,
  methodNotAllowed,
  sendError,
  sendSuccess,
} from "../_utils/response";
import { withAuth, AuthenticatedRequest } from "../_middleware/auth";
import { getUserData, saveUserData } from "../_utils/supabase";
import { validateBody, expenseSchema } from "../_utils/validation";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * GET /api/expenses - List all expenses
 * POST /api/expenses - Create new expense
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
      // List all expenses
      const { category, startDate, endDate, limit } = req.query;
      let expenses = data.expenses || [];

      if (category) {
        expenses = expenses.filter((e: any) => e.category === category);
      }

      if (startDate) {
        expenses = expenses.filter((e: any) => e.date >= startDate);
      }
      if (endDate) {
        expenses = expenses.filter((e: any) => e.date <= endDate);
      }

      if (limit) {
        expenses = expenses.slice(0, parseInt(limit as string));
      }

      return sendSuccess(res, { expenses });
    } else if (req.method === "POST") {
      // Create new expense
      const validated = validateBody(req.body, expenseSchema, res);
      if (!validated) return;

      const newExpense = {
        id: generateId(),
        ...validated,
      };

      data.expenses = [...(data.expenses || []), newExpense];
      await saveUserData(userId, data);

      return sendSuccess(res, { expense: newExpense }, 201);
    } else {
      return methodNotAllowed(res, ["GET", "POST"]);
    }
  } catch (error: any) {
    console.error("Expenses endpoint error:", error);
    return sendError(res, error.message || "Error al procesar gastos", 500);
  }
}

export default withAuth(handler);
