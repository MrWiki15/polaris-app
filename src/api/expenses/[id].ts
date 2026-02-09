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

/**
 * GET /api/expenses/[id] - Get expense by ID
 * PUT /api/expenses/[id] - Update expense
 * DELETE /api/expenses/[id] - Delete expense
 */
async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const userId = req.user!.userId;
  const expenseId = req.query.id as string;

  if (!expenseId) {
    return sendError(res, "ID de gasto requerido", 400);
  }

  try {
    const backup = await getUserData(userId);
    if (!backup) {
      return sendError(res, "No hay datos guardados", 404);
    }

    const data =
      typeof backup.data === "string" ? JSON.parse(backup.data) : backup.data;
    const expenseIndex = data.expenses.findIndex(
      (e: any) => e.id === expenseId,
    );

    if (expenseIndex === -1) {
      return sendError(res, "Gasto no encontrado", 404);
    }

    if (req.method === "GET") {
      return sendSuccess(res, { expense: data.expenses[expenseIndex] });
    } else if (req.method === "PUT") {
      const validated = validateBody(req.body, expenseSchema.partial(), res);
      if (!validated) return;

      data.expenses[expenseIndex] = {
        ...data.expenses[expenseIndex],
        ...validated,
      };

      await saveUserData(userId, data);
      return sendSuccess(res, { expense: data.expenses[expenseIndex] });
    } else if (req.method === "DELETE") {
      data.expenses.splice(expenseIndex, 1);
      await saveUserData(userId, data);
      return sendSuccess(res, { message: "Gasto eliminado exitosamente" });
    } else {
      return methodNotAllowed(res, ["GET", "PUT", "DELETE"]);
    }
  } catch (error: any) {
    console.error("Expense endpoint error:", error);
    return sendError(res, error.message || "Error al procesar gasto", 500);
  }
}

export default withAuth(handler);
