import { z } from "zod";
import { VercelResponse } from "@vercel/node";
import { sendValidationError } from "./response";

/**
 * Validate request body against a Zod schema
 */
export function validateBody<T>(
  body: any,
  schema: z.ZodSchema<T>,
  res: VercelResponse,
): T | null {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendValidationError(res, error.errors);
    } else {
      sendValidationError(res, { message: "Validation error" });
    }
    return null;
  }
}

/**
 * Common validation schemas
 */
export const authSchemas = {
  login: z.object({
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
  }),

  register: z.object({
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
  }),

  refresh: z.object({
    refreshToken: z.string().min(1, "Refresh token requerido"),
  }),
};

export const saleSchema = z.object({
  date: z.string(),
  amount: z.number().positive("El monto debe ser positivo"),
  category: z.string().min(1, "Categoría requerida"),
  description: z.string().optional(),
  productId: z.string().optional(),
  quantity: z.number().optional(),
  tags: z.array(z.string()).optional(),
  clientId: z.string().optional(),
});

export const expenseSchema = z.object({
  date: z.string(),
  amount: z.number().positive("El monto debe ser positivo"),
  category: z.string().min(1, "Categoría requerida"),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isRecurring: z.union([z.boolean(), z.string()]).optional(),
  recurringId: z.string().optional(),
  recurringTime: z.string().optional(),
  clientId: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  quantity: z.number().nonnegative("La cantidad debe ser 0 o mayor"),
  cost: z.number().nonnegative("El costo debe ser 0 o mayor"),
  price: z.number().nonnegative("El precio debe ser 0 o mayor"),
  category: z.string().optional(),
  minStock: z.number().optional(),
  expirationDate: z.string().optional(),
  barcode: z.string().optional(),
  supplierId: z.string().optional(),
  additionalPrices: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
      }),
    )
    .optional(),
  isNft: z.boolean().optional(),
  nftAddress: z.string().optional(),
  nftMarketplace: z.string().optional(),
  type: z.enum(["simple", "compound"]).optional(),
  components: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number(),
      }),
    )
    .optional(),
});

export const clientSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  type: z.enum(["cliente", "proveedor"]),
  notes: z.string().optional(),
});

export const serviceSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  priceType: z.enum(["fixed", "variable"]),
  price: z.number().optional(),
  description: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number(),
      }),
    )
    .optional(),
  associatedExpense: z
    .object({
      category: z.string(),
      percent: z.number(),
    })
    .optional(),
});

export const serviceIncomeSchema = z.object({
  date: z.string(),
  serviceId: z.string().min(1, "Service ID requerido"),
  amount: z.number().positive("El monto debe ser positivo"),
  quantity: z.number().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  clientId: z.string().optional(),
});

export const settingsSchema = z.object({
  currency: z.string().optional(),
  currencySymbol: z.string().optional(),
  language: z.string().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  businessName: z.string().optional(),
  businessLogo: z.string().optional(),
  businessPhone: z.string().optional(),
  businessAddress: z.string().optional(),
  businessEmail: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  isPremium: z.boolean().optional(),
});
