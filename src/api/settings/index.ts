import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  handleCors,
  methodNotAllowed,
  sendError,
  sendSuccess,
} from "../_utils/response";
import { withAuth, AuthenticatedRequest } from "../_middleware/auth";
import { getUserData, saveUserData } from "../_utils/supabase";
import { validateBody, settingsSchema } from "../_utils/validation";

/**
 * GET /api/settings
 * Get company settings for authenticated user
 *
 * PUT /api/settings
 * Update company settings for authenticated user
 */
async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

  const userId = req.user!.userId;

  try {
    if (req.method === "GET") {
      // Get settings
      const backup = await getUserData(userId);

      if (!backup) {
        return sendSuccess(res, {
          settings: {
            currency: "USD",
            currencySymbol: "$",
            language: "es",
            theme: "system",
          },
        });
      }

      const data =
        typeof backup.data === "string" ? JSON.parse(backup.data) : backup.data;
      const settings = data.settings || {};

      return sendSuccess(res, {
        settings,
      });
    } else if (req.method === "PUT") {
      // Update settings
      const validated = validateBody(req.body, settingsSchema, res);
      if (!validated) return;

      // Get current data
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
          typeof backup.data === "string"
            ? JSON.parse(backup.data)
            : backup.data;
      }

      // Update only settings
      data.settings = {
        ...data.settings,
        ...validated,
      };

      await saveUserData(userId, data);

      return sendSuccess(res, {
        message: "Configuración actualizada exitosamente",
        settings: data.settings,
      });
    } else {
      return methodNotAllowed(res, ["GET", "PUT"]);
    }
  } catch (error: any) {
    console.error("Settings endpoint error:", error);
    return sendError(
      res,
      error.message || "Error al procesar configuración",
      500,
    );
  }
}

export default withAuth(handler);
