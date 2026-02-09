import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AppData } from "@/lib/storage";

function getGeminiClient() {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("API key missing. Add VITE_GOOGLE_AI_API_KEY to .env");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function suggestCategories(appData: AppData): Promise<string[]> {
  try {
    // Build a summary of the user's expenses, incomes, and inventory
    const expensesByTag = new Map<string, number>();
    const incomesByTag = new Map<string, number>();
    const productsByCategory = new Map<string, number>();

    // Analyze expenses
    (appData.expenses || []).forEach((e) => {
      if (e.category) {
        expensesByTag.set(
          e.category,
          (expensesByTag.get(e.category) || 0) + e.amount,
        );
      }
    });

    // Analyze incomes/sales
    (appData.sales || []).forEach((s) => {
      if (s.description) {
        incomesByTag.set(
          s.description,
          (incomesByTag.get(s.description) || 0) + s.amount,
        );
      }
    });

    // Analyze products
    (appData.products || []).forEach((p) => {
      if (p.category) {
        productsByCategory.set(
          p.category,
          (productsByCategory.get(p.category) || 0) + 1,
        );
      }
    });

    const expenseSummary = Array.from(expensesByTag.entries())
      .map(([tag, amount]) => `${tag}: $${amount.toFixed(2)}`)
      .join(", ");

    const incomeSummary = Array.from(incomesByTag.entries())
      .map(([tag, amount]) => `${tag}: $${amount.toFixed(2)}`)
      .join(", ");

    const productSummary = Array.from(productsByCategory.entries())
      .map(([cat, count]) => `${cat}: ${count} productos`)
      .join(", ");

    const existingTags = appData.customTags || [];

    const prompt = `Eres Polo, un asistente financiero profesional. Analiza después información comercial del usuario y sugiere nuevas categorías/etiquetas personalizadas que le serían útiles para organizar mejor sus gastos, ingresos e inventario.

## Datos del negocio del usuario:

### Gastos por categoría:
${expenseSummary || "(Sin gastos registrados)"}

### Ingresos por descripción:
${incomeSummary || "(Sin ingresos registrados)"}

### Inventario por categoría:
${productSummary || "(Sin productos registrados)"}

### Etiquetas ya existentes:
${existingTags.join(", ") || "(Sin etiquetas personalizadas)"}

## Tarea:
Sugiere entre 5 y 10 nuevas categorías/etiquetas que NO existan ya. Basate en los patrones que ves en los datos (ej. si hay muchos gastos de "alquiler", sugiere "infraestructura"; si hay ventas de "software", sugiere "servicios digitales").

Devuelve **SOLO** un arreglo JSON con los nombres de las etiquetas sugeridas (en minúsculas, una palabra o dos máximo), sin explicaciones adicionales:

["etiqueta1", "etiqueta2", "etiqueta3", ...]`;

    const client = getGeminiClient();
    const model = client.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: { maxOutputTokens: 512 },
    });

    const result = await model.generateContent(prompt);
    const responseText =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error("No response from Gemini");
    }

    // Extract JSON array from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Could not parse suggestions as JSON");
    }

    const suggestions = JSON.parse(jsonMatch[0]) as string[];

    // Filter out duplicates and existing tags
    const filtered = suggestions.filter(
      (tag) =>
        !existingTags.includes(tag) &&
        suggestions.indexOf(tag) === suggestions.lastIndexOf(tag),
    );

    return filtered.slice(0, 10); // Return max 10 suggestions
  } catch (err) {
    console.error("Category suggestion error:", err);
    throw err;
  }
}
