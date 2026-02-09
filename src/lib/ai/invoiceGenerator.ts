import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AppData } from "@/lib/storage";

export interface InvoiceDraftItem {
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceDraft {
  items: InvoiceDraftItem[];
  terms?: string;
  notes?: string;
  taxRate?: number;
  businessName?: string;
  businessAddress?: string;
  businessEmail?: string;
  clientName?: string;
  clientAddress?: string;
  clientEmail?: string;
}

function getGeminiClient() {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("API key missing. Add VITE_GOOGLE_AI_API_KEY to .env");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function generateInvoiceDraft(params: {
  appData: AppData;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  clientName?: string;
  clientAddress?: string;
  clientEmail?: string;
  currencySymbol: string;
  brief?: string;
}): Promise<InvoiceDraft> {
  const {
    appData,
    businessName,
    businessAddress,
    businessPhone,
    businessEmail,
    clientName,
    clientAddress,
    clientEmail,
    currencySymbol,
    brief,
  } = params;

  const topProducts = (appData.products || [])
    .slice(0, 12)
    .map((p) => `${p.name} (${currencySymbol}${p.price})`)
    .join(", ");

  const recentSales = (appData.sales || [])
    .slice(0, 12)
    .map((s) => `${s.description || "Venta"} ${currencySymbol}${s.amount}`)
    .join(", ");

  const prompt = `Eres Polo, un asistente financiero extremadamente profesional y objetivo. Genera un borrador de factura con items, términos, notas Y EXTRAE información de empresa/cliente del brief del usuario. Usa un tono profesional y conciso. No inventes datos sensibles.

  ## Datos del negocio actual
  - Nombre: ${businessName || "(no definido)"}
  - Dirección: ${businessAddress || "(no definida)"}
  - Teléfono: ${businessPhone || "(no definido)"}
  - Email: ${businessEmail || "(no definido)"}

  ## Cliente actual
  - Nombre: ${clientName || "Cliente general"}
  - Dirección: ${clientAddress || "(no definida)"}
  - Email: ${clientEmail || "(no definido)"}

  ## Productos disponibles
  ${topProducts || "(sin productos)"}

  ## Ventas recientes
  ${recentSales || "(sin ventas)"}

  ## Brief del usuario
  ${brief || "(sin brief)"}

  ## Tarea
  1) Genera entre 2 y 6 items de factura con descripción, cantidad y precio unitario basados en el brief.
  2) EXTRAE del brief: nombre de la empresa del usuario, datos del cliente (nombre), si están disponibles.
     - Si el brief menciona "mi empresa se llama X", usa X como businessName.
     - Si el brief menciona "a la empresa Y" o "al cliente Y", usa Y como clientName.
     - Si no hay información clara, devuelve null para esos campos (no los rellenes si no están en el brief).
  3) Sugiere terms (condiciones de pago) y notes (nota breve de cortesía) si aplica.
  4) Sugiere una tasa de impuesto (taxRate) razonable si aplica.

  Devuelve SOLO JSON con este formato:
  {
    "items": [
      {"description": "string", "quantity": 1, "price": 10}
    ],
    "businessName": "string u null",
    "clientName": "string u null",
    "terms": "string",
    "notes": "string",
    "taxRate": 0
  }`;

  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: { maxOutputTokens: 1024 },
  });

  const result = await model.generateContent(prompt);
  const responseText =
    result.response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!responseText) {
    throw new Error("No response from Gemini");
  }

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse invoice draft JSON");
  }

  return JSON.parse(jsonMatch[0]) as InvoiceDraft;
}
