/**
 * React Hook for Sales Prediction
 * Handles loading states, caching, and error management
 */

import { useQuery } from "@tanstack/react-query";
import { predictSales, getSalesInsights, comparePeriods } from "@/lib/ai/salesPredictor";

interface Sale {
  date: string;
  amount: number;
}

/**
 * Predict future sales
 * Results are cached for 1 hour to respect API rate limits
 */
export function useSalesPrediction(sales: Sale[], daysAhead: number = 30) {
  return useQuery({
    queryKey: ["sales-prediction", sales.length, daysAhead],
    queryFn: () =>
      predictSales(
        sales.map((s) => ({ date: s.date, amount: s.amount })),
        daysAhead
      ),
    enabled: sales.length >= 7,
    staleTime: 3600000, // 1 hour
    gcTime: 3600000, // 1 hour
    retry: 2,
  });
}

/**
 * Get AI-powered sales insights
 * Cached for 4 hours
 */
export function useSalesInsights(sales: Sale[]) {
  return useQuery({
    queryKey: ["sales-insights", sales.length],
    queryFn: () =>
      getSalesInsights(sales.map((s) => ({ date: s.date, amount: s.amount }))),
    enabled: sales.length >= 7,
    staleTime: 14400000, // 4 hours
    gcTime: 14400000, // 4 hours
  });
}

/**
 * Compare two periods of sales
 */
export function useSalesComparison(salesPeriod1: Sale[], salesPeriod2: Sale[]) {
  return useQuery({
    queryKey: ["sales-comparison", salesPeriod1.length, salesPeriod2.length],
    queryFn: () =>
      comparePeriods(
        salesPeriod1.map((s) => ({ date: s.date, amount: s.amount })),
        salesPeriod2.map((s) => ({ date: s.date, amount: s.amount }))
      ),
    enabled: salesPeriod1.length >= 7 && salesPeriod2.length >= 7,
    staleTime: 14400000, // 4 hours
  });
}
