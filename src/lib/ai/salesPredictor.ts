import { GoogleGenerativeAI } from "@google/generative-ai";

interface SalesData {
  date: string;
  amount: number;
}

interface PredictionResult {
  dates: string[];
  predicted: number[];
  confidence: number;
  analysis: string;
  trend: "growing" | "stable" | "declining";
  recommendations: string[];
}

interface TimeSeriesAnalysis {
  avgDaily: number;
  avgWeekly: number;
  avgMonthly: number;
  volatility: number;
  trend: "growing" | "stable" | "declining";
  seasonality: string;
}

/**
 * Initialize Gemini API client
 * Free tier: No credit card needed, generous limits
 */
function getGeminiClient() {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "API key missing. Add VITE_GOOGLE_AI_API_KEY to .env\nGet free key at: https://aistudio.google.com/apikey",
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Analyze historical sales data using statistical methods
 */
function analyzeTimeSeries(sales: SalesData[]): TimeSeriesAnalysis {
  if (sales.length === 0) {
    return {
      avgDaily: 0,
      avgWeekly: 0,
      avgMonthly: 0,
      volatility: 0,
      trend: "stable",
      seasonality: "no data",
    };
  }

  // Calculate basic statistics
  const amounts = sales.map((s) => s.amount);
  const avgDaily = amounts.reduce((a, b) => a + b, 0) / amounts.length;

  // Weekly average
  const weeklyGroups: number[][] = [];
  for (let i = 0; i < amounts.length; i += 7) {
    weeklyGroups.push(amounts.slice(i, i + 7));
  }
  const avgWeekly = weeklyGroups.length
    ? weeklyGroups.reduce(
        (sum, week) => sum + week.reduce((a, b) => a + b) / week.length,
        0,
      ) / weeklyGroups.length
    : avgDaily;

  // Monthly average
  const monthlyGroups: number[][] = [];
  for (let i = 0; i < amounts.length; i += 30) {
    monthlyGroups.push(amounts.slice(i, i + 30));
  }
  const avgMonthly = monthlyGroups.length
    ? monthlyGroups.reduce(
        (sum, month) => sum + month.reduce((a, b) => a + b) / month.length,
        0,
      ) / monthlyGroups.length
    : avgDaily;

  // Volatility (standard deviation)
  const mean = avgDaily;
  const variance =
    amounts.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / amounts.length;
  const volatility = Math.sqrt(variance);

  // Trend detection (last 30 days vs first 30 days)
  const last30 = amounts.slice(-30);
  const first30 = amounts.slice(0, 30);
  const lastAvg = last30.reduce((a, b) => a + b) / last30.length;
  const firstAvg = first30.reduce((a, b) => a + b) / first30.length;
  const trendPercent = ((lastAvg - firstAvg) / firstAvg) * 100;

  const trend: "growing" | "stable" | "declining" =
    trendPercent > 10 ? "growing" : trendPercent < -10 ? "declining" : "stable";

  return {
    avgDaily,
    avgWeekly,
    avgMonthly,
    volatility,
    trend,
    seasonality: detectSeasonality(sales),
  };
}

/**
 * Detect seasonal patterns in sales
 */
function detectSeasonality(sales: SalesData[]): string {
  if (sales.length < 60) return "insufficient data";

  const months: { [key: string]: number[] } = {};

  sales.forEach((sale) => {
    const date = new Date(sale.date);
    const month = date.getMonth();
    const key = `month_${month}`;

    if (!months[key]) months[key] = [];
    months[key].push(sale.amount);
  });

  const monthlyAverages = Object.entries(months)
    .map(([_, values]) => values.reduce((a, b) => a + b) / values.length)
    .sort((a, b) => b - a);

  const maxMonth = monthlyAverages[0];
  const minMonth = monthlyAverages[monthlyAverages.length - 1];
  const seasonalityRatio = maxMonth / minMonth;

  if (seasonalityRatio > 1.5) return "strong seasonal pattern detected";
  if (seasonalityRatio > 1.2) return "moderate seasonal pattern";
  return "minimal seasonal variation";
}

/**
 * Generate future dates for prediction
 */
function generateFutureDates(lastDate: Date, daysAhead: number): string[] {
  const dates: string[] = [];
  const currentDate = new Date(lastDate);

  for (let i = 1; i <= daysAhead; i++) {
    currentDate.setDate(currentDate.getDate() + 1);
    dates.push(currentDate.toISOString().split("T")[0]);
  }

  return dates;
}

/**
 * Create a detailed prompt for Gemini to analyze and predict
 */
function createAnalysisProm(
  sales: SalesData[],
  analysis: TimeSeriesAnalysis,
  futureDays: number,
): string {
  const recentSales = sales.slice(-30).map((s) => ({
    date: s.date,
    amount: s.amount,
  }));

  return `
Eres un analista financiero y científico de datos experto. Analiza los siguientes datos de ventas y proporciona un pronóstico detallado en español.

## Análisis de Datos de Ventas:
- Registros totales: ${sales.length} días
- Promedio diario: $${analysis.avgDaily.toFixed(2)}
- Promedio semanal: $${analysis.avgWeekly.toFixed(2)}
- Promedio mensual: $${analysis.avgMonthly.toFixed(2)}
- Volatilidad (desviación estándar): $${analysis.volatility.toFixed(2)}
- Tendencia: ${analysis.trend.toUpperCase()}
- Estacionalidad: ${analysis.seasonality}

## Últimos 30 días:
${recentSales.map((s) => `- ${s.date}: $${s.amount}`).join("\n")}

## Tarea:
Proporciona un pronóstico para los próximos ${futureDays} días. Considera:
1. La tendencia histórica (${analysis.trend})
2. Volatilidad y varianza
3. Patrones estacionales
4. El impulso actual de los últimos 30 días

Devuelve tu análisis en ESTE FORMATO JSON EXACTO (en español):
{
  "forecast": [
    {"day": 1, "predictedAmount": NUMBER},
    {"day": 2, "predictedAmount": NUMBER},
    ...
    {"day": ${futureDays}, "predictedAmount": NUMBER}
  ],
  "confidence": NUMBER (0-100),
  "analysis": "explicación detallada del pronóstico (en español)",
  "recommendations": ["recomendación 1", "recomendación 2", "recomendación 3"],
  "methodNotes": "explica qué métodos estadísticos o heurísticos usaste"
}

Asegúrate de que el pronóstico refleje la tendencia y sea consistente con los patrones históricos. Responde únicamente con JSON válido cuando sea posible.
`;
}

/**
 * Predict sales using Gemini Flash (FREE API)
 * Best for: 30-90 day forecasts
 * Confidence: High for trending data, Medium for volatile data
 */
export async function predictSales(
  sales: SalesData[],
  daysAhead: number = 30,
): Promise<PredictionResult> {
  try {
    if (sales.length < 7) {
      throw new Error(
        "Need at least 7 days of sales data for reliable prediction",
      );
    }

    // Analyze historical data
    const analysis = analyzeTimeSeries(sales);

    // Generate prompt for Gemini
    const prompt = createAnalysisProm(sales, analysis, daysAhead);

    // Call Gemini API (FREE TIER)
    const client = getGeminiClient();
    const model = client.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });

    let responseText: string | undefined;
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (apiError: any) {
      console.error("Gemini API Error:", apiError);
      throw new Error(
        `Gemini API error: ${apiError.message || "Unknown error"}. ` +
          `Model 'gemini-2.5-flash-lite' may not be available. ` +
          `Check your API key at https://aistudio.google.com/apikey`,
      );
    }

    // Validate and parse the JSON response
    if (!responseText) {
      throw new Error("No response from Gemini API");
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse Gemini response");
    }

    const forecastData = JSON.parse(jsonMatch[0]);

    // Generate dates for predictions
    const lastDate = new Date(sales[sales.length - 1].date);
    const futureDates = generateFutureDates(lastDate, daysAhead);

    // Extract predicted values
    const predicted = forecastData.forecast.map(
      (f: { predictedAmount: number }) => f.predictedAmount,
    );

    return {
      dates: futureDates,
      predicted,
      confidence: forecastData.confidence,
      analysis: forecastData.analysis,
      trend: analysis.trend,
      recommendations: forecastData.recommendations || [],
    };
  } catch (error) {
    console.error("Sales prediction error:", error);
    throw error;
  }
}

/**
 * Get insights about sales performance
 * Useful for dashboard summaries
 */
export async function getSalesInsights(sales: SalesData[]): Promise<{
  summary: string;
  strength: string;
  concerns: string[];
  opportunities: string[];
}> {
  const analysis = analyzeTimeSeries(sales);

  const prompt = `
Analiza estos datos de ventas y proporciona insights de negocio en español:
- Promedio diario: $${analysis.avgDaily.toFixed(2)}
- Tendencia: ${analysis.trend}
- Volatilidad: ${analysis.volatility.toFixed(2)}
- Patrón: ${analysis.seasonality}

Proporciona un resumen breve (1-2 frases), la principal fortaleza, 2-3 preocupaciones y 2-3 oportunidades.
Devuelve la respuesta en formato JSON:
{
  "summary": "resumen breve (español)",
  "strength": "fortaleza principal",
  "concerns": ["preocupación 1", "preocupación 2"],
  "opportunities": ["oportunidad 1", "oportunidad 2"]
}
`;

  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      maxOutputTokens: 1024,
    },
  });
  const result = await model.generateContent(prompt);
  const responseText =
    result.response.candidates?.[0]?.content?.parts?.[0]?.text;

  const jsonMatch = responseText?.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      summary: "Unable to generate insights",
      strength: "Data available for analysis",
      concerns: ["Need more data"],
      opportunities: ["Monitor sales trends"],
    };
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Compare two time periods
 */
export async function comparePeriods(
  salesPeriod1: SalesData[],
  salesPeriod2: SalesData[],
): Promise<{
  periodA_avg: number;
  periodB_avg: number;
  change_percent: number;
  analysis: string;
}> {
  const analysis1 = analyzeTimeSeries(salesPeriod1);
  const analysis2 = analyzeTimeSeries(salesPeriod2);

  const prompt = `
Compara estos dos períodos de ventas (en español):
Periodo 1: Promedio ${analysis1.avgDaily}, Tendencia ${analysis1.trend}
Periodo 2: Promedio ${analysis2.avgDaily}, Tendencia ${analysis2.trend}

¿Qué cambió? Proporciona un análisis de 2-3 frases y devuelve JSON:
{
  "comparison": "comparación detallada (español)",
  "growth": PERCENTAGE_CHANGE
}
`;

  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      maxOutputTokens: 1024,
    },
  });
  const result = await model.generateContent(prompt);
  const responseText =
    result.response.candidates?.[0]?.content?.parts?.[0]?.text;

  const jsonMatch = responseText?.match(/\{[\s\S]*\}/);
  const data = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

  return {
    periodA_avg: analysis1.avgDaily,
    periodB_avg: analysis2.avgDaily,
    change_percent:
      ((analysis2.avgDaily - analysis1.avgDaily) / analysis1.avgDaily) * 100 ||
      0,
    analysis: data.comparison || "Comparison available",
  };
}
