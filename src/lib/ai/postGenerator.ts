import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AppData, Product } from "@/lib/storage";

type PostKind =
  | "ventas"
  | "producto"
  | "promocion"
  | "logro"
  | "agradecimiento"
  | "rifa";

export interface SocialPostPlan {
  content: string;
  hashtags: string[];
  strategy?: string;
  contentType?: string;
}

function getGeminiClient() {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("API key missing. Add VITE_GOOGLE_AI_API_KEY to .env");
  }
  return new GoogleGenerativeAI(apiKey);
}

const formatProduct = (product?: Product | null) => {
  if (!product) return "(sin producto)";
  return `${product.name} | precio: ${product.price} | stock: ${product.quantity}`;
};

export async function generateSocialPost(params: {
  appData: AppData;
  businessName: string;
  businessPhone?: string;
  currencySymbol: string;
  socialNetwork: string;
  postType: PostKind;
  brief?: string;
  product?: Product | null;
}): Promise<SocialPostPlan> {
  const {
    appData,
    businessName,
    businessPhone,
    currencySymbol,
    socialNetwork,
    postType,
    brief,
    product,
  } = params;

  const totalSales = (appData.sales || []).reduce(
    (sum, sale) => sum + sale.amount,
    0,
  );
  const totalExpenses = (appData.expenses || []).reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const productsCount = (appData.products || []).length;
  const customersCount = (appData.clients || []).filter(
    (c) => c.type === "cliente",
  ).length;

  const prompt = `Eres Polo, un estratega de marketing digital. Genera contenido para redes con tono profesional y amigable.

## Contexto del negocio
- Nombre: ${businessName}
- Telefono: ${businessPhone || "(no definido)"}
- Ventas totales: ${currencySymbol}${totalSales.toFixed(2)}
- Gastos totales: ${currencySymbol}${totalExpenses.toFixed(2)}
- Productos: ${productsCount}
- Clientes: ${customersCount}

## Tipo de post
${postType}

## Red social
${socialNetwork}

## Producto seleccionado
${formatProduct(product)}

## Brief opcional del usuario
${brief || "(sin brief)"}

## Instrucciones
- El contenido debe ser listo para publicar y adaptado a la red social.
- Usa un tono profesional y amigable.
- Si el tipo es "rifa", incluye una mecanica simple y clara, sin inventar datos sensibles.
- Recomienda el tipo de contenido ideal (reel, carrusel, imagen, historia, hilo).
- Devuelve hashtags relevantes (5 a 12).
- Devuelve una estrategia breve (1-3 frases) para que el post sea exitoso.
- No inventes precios si no estan en el producto. Si no hay datos suficientes, usa lenguaje general.

Devuelve SOLO JSON con este formato:
{
  "content": "string",
  "hashtags": ["#tag1", "#tag2"],
  "strategy": "string",
  "contentType": "string"
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
    throw new Error("Could not parse social post JSON");
  }

  return JSON.parse(jsonMatch[0]) as SocialPostPlan;
}
