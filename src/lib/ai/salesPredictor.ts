import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  SALES_FORECAST_TEMPLATE,
  SALES_INSIGHTS_TEMPLATE,
  PERIOD_COMPARISON_TEMPLATE,
} from "./promptConfig";
import {
  salesPredictionCache,
  salesInsightsCache,
  periodComparisonCache,
} from "./cache";

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
 * Create a detailed prompt for Gemini to analyze and predict (OPTIMIZED)
 * Reduced from ~450 tokens to ~180 tokens (60% reduction)
 */
function createAnalysisProm(
  sales: SalesData[],
  analysis: TimeSeriesAnalysis,
  futureDays: number,
): string {
  const recentSales = sales.slice(-14).map((s) => `${s.date}:$${s.amount}`);

  const analysisText = `Datos: ${sales.length}d | Prom:$${analysis.avgDaily.toFixed(0)} | Vol:${analysis.volatility.toFixed(0)} | Trend:${analysis.trend} | Patrón:${analysis.seasonality}

Últimos 14d: ${recentSales.join(" | ")}`;

  return SALES_FORECAST_TEMPLATE(analysisText);
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

    // Check cache first - significant savings for repeated predictions
    const cacheKey = { sales: sales.slice(-30), daysAhead };
    const cached = salesPredictionCache.get(cacheKey);
    if (cached) {
      console.log("[CACHE HIT] Sales prediction reused (saved ~1200 tokens)");
      return cached;
    }

    // Analyze historical data
    const analysis = analyzeTimeSeries(sales);

    // Generate prompt for Gemini (60% smaller than before)
    const prompt = createAnalysisProm(sales, analysis, daysAhead);

    // Call Gemini API (FREE TIER)
    const client = getGeminiClient();
    const model = client.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        maxOutputTokens: 1200, // Reduced from 2048 (save 848 tokens)
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

    const result = {
      dates: futureDates,
      predicted,
      confidence: forecastData.confidence,
      analysis: forecastData.analysis,
      trend: analysis.trend,
      recommendations: forecastData.recommendations || [],
    };

    // Cache the result (estimated ~1200 tokens for response)
    salesPredictionCache.set(cacheKey, result, 1200);

    return result;
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

  // Check cache first
  const cacheKey = { type: "insights", analysis };
  const cached = salesInsightsCache.get(cacheKey);
  if (cached) {
    console.log("[CACHE HIT] Sales insights reused (saved ~400 tokens)");
    return cached;
  }

  const prompt = SALES_INSIGHTS_TEMPLATE(analysis); // Optimized: 55% smaller

  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      maxOutputTokens: 600, // Reduced from 1024 (save 424 tokens)
    },
  });
  const result = await model.generateContent(prompt);
  const responseText =
    result.response.candidates?.[0]?.content?.parts?.[0]?.text;

  const jsonMatch = responseText?.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    const fallback = {
      summary: "Unable to generate insights",
      strength: "Data available for analysis",
      concerns: ["Need more data"],
      opportunities: ["Monitor sales trends"],
    };
    return fallback;
  }

  const data = JSON.parse(jsonMatch[0]);

  // Cache the result (estimated ~400 tokens)
  salesInsightsCache.set(cacheKey, data, 400);

  return data;
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

  // Check cache
  const cacheKey = { p1Avg: analysis1.avgDaily, p2Avg: analysis2.avgDaily };
  const cached = periodComparisonCache.get(cacheKey);
  if (cached) {
    console.log("[CACHE HIT] Period comparison reused (saved ~400 tokens)");
    return cached;
  }

  const prompt = PERIOD_COMPARISON_TEMPLATE(
    { avg: analysis1.avgDaily, trend: analysis1.trend },
    { avg: analysis2.avgDaily, trend: analysis2.trend },
  ); // Optimized: 58% smaller

  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      maxOutputTokens: 600, // Reduced from 1024 (save 424 tokens)
    },
  });
  const result = await model.generateContent(prompt);
  const responseText =
    result.response.candidates?.[0]?.content?.parts?.[0]?.text;

  const jsonMatch = responseText?.match(/\{[\s\S]*\}/);
  const data = jsonMatch
    ? JSON.parse(jsonMatch[0])
    : { comparison: "Unable to compare", growth: 0 };

  const comparison = {
    periodA_avg: analysis1.avgDaily,
    periodB_avg: analysis2.avgDaily,
    change_percent:
      ((analysis2.avgDaily - analysis1.avgDaily) / analysis1.avgDaily) * 100 ||
      0,
    analysis: data.comparison || "Comparison available",
  };

  // Cache the result (estimated ~400 tokens)
  periodComparisonCache.set(cacheKey, comparison, 400);

  return comparison;
}
