import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AppData, FinancialGoal } from "@/lib/storage";

export interface GoalDraft {
  title: string;
  targetAmount: number;
  currentAmount?: number;
  deadline: string;
  category: FinancialGoal["category"];
}

export interface GoalPlanResult {
  goals: GoalDraft[];
  rationale?: string;
}

function getGeminiClient() {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("API key missing. Add VITE_GOOGLE_AI_API_KEY to .env");
  }
  return new GoogleGenerativeAI(apiKey);
}

const sumAmounts = (values: number[]) => values.reduce((s, v) => s + v, 0);

export async function generateFinancialGoals(params: {
  appData: AppData;
  currencySymbol: string;
  brief?: string;
}): Promise<GoalPlanResult> {
  const { appData, currencySymbol, brief } = params;
  const today = new Date();
  const last30 = new Date();
  last30.setDate(today.getDate() - 30);

  const salesLast30 = (appData.sales || []).filter(
    (s) => new Date(s.date) >= last30,
  );
  const expensesLast30 = (appData.expenses || []).filter(
    (e) => new Date(e.date) >= last30,
  );

  const totalSales30 = sumAmounts(salesLast30.map((s) => s.amount));
  const totalExpenses30 = sumAmounts(expensesLast30.map((e) => e.amount));
  const avgTicket = salesLast30.length ? totalSales30 / salesLast30.length : 0;

  const topCategories = (appData.expenses || [])
    .map((e) => e.category)
    .filter(Boolean)
    .slice(0, 8)
    .join(", ");

  const goalsCount = (appData.goals || []).length;

  const prompt = `Eres Polo, un asistente financiero profesional. Genera metas financieras realistas y adaptadas al usuario. Usa los datos reales y no inventes informacion sensible.

## Datos resumidos
- Ventas ultimos 30 dias: ${currencySymbol}${totalSales30.toFixed(2)}
- Gastos ultimos 30 dias: ${currencySymbol}${totalExpenses30.toFixed(2)}
- Ticket promedio: ${currencySymbol}${avgTicket.toFixed(2)}
- Categorias de gasto comunes: ${topCategories || "(sin datos)"}
- Metas actuales: ${goalsCount}

## Brief opcional
${brief || "(sin brief)"}

## Reglas
- Genera entre 2 y 4 metas.
- Usa fechas limite realistas dentro de los proximos 3 a 6 meses.
- Evita metas imposibles si ventas son bajas.
- Categorias permitidas: ventas, ahorro, reduccion_gastos, otro.
- Devuelve SOLO JSON valido.

Devuelve SOLO JSON con este formato:
{
  "goals": [
    {
      "title": "string",
      "targetAmount": 1000,
      "currentAmount": 0,
      "deadline": "YYYY-MM-DD",
      "category": "ventas|ahorro|reduccion_gastos|otro"
    }
  ],
  "rationale": "string"
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
    throw new Error("Could not parse goals JSON");
  }

  return JSON.parse(jsonMatch[0]) as GoalPlanResult;
}
