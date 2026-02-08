/**
 * AI Sales Forecast Component
 * Displays Gemini-powered sales predictions
 */

import React, { useMemo } from "react";
import { useSalesPrediction, useSalesInsights } from "@/hooks/use-sales-prediction";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Bar,
} from "recharts";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  TrendingUp,
  Brain,
  AlertCircle,
  Lightbulb,
  CheckCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface Sale {
  date: string;
  amount: number;
}

interface SalesForecastProps {
  sales: Sale[];
  daysAhead?: number;
  className?: string;
}

/**
 * Main forecast component with AI insights
 */
export const AISalesForecast: React.FC<SalesForecastProps> = ({
  sales,
  daysAhead = 30,
  className,
}) => {
  const { data: forecast, isLoading, error } = useSalesPrediction(
    sales,
    daysAhead
  );
  const { data: insights, isLoading: insightsLoading } =
    useSalesInsights(sales);

  // Combine historical and predicted data for chart
  const chartData = useMemo(() => {
    if (!forecast) return [];

    const historical = sales.map((s) => ({
      date: new Date(s.date).toLocaleDateString("es-ES", {
        month: "2-digit",
        day: "2-digit",
      }),
      historical: s.amount,
      predicted: undefined,
      type: "historical",
    }));

    const predicted = forecast.dates.map((date, idx) => ({
      date: new Date(date).toLocaleDateString("es-ES", {
        month: "2-digit",
        day: "2-digit",
      }),
      historical: undefined,
      predicted: forecast.predicted[idx],
      type: "predicted",
    }));

    // Keep last 10 historical days to show context
    const relevantHistorical = historical.slice(-10);
    return [...relevantHistorical, ...predicted];
  }, [sales, forecast]);

  if (error) {
    return (
      <Card className={cn("p-6 border-destructive/50 bg-destructive/5", className)}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive">Error en predicción</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : "No se pudo conectar con la IA"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              ✓ Verifica que VITE_GOOGLE_AI_API_KEY esté configurada en .env
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with AI badge */}
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Pronóstico IA</h3>
        <span className="ml-auto px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">
          {forecast ? `${forecast.confidence}% confianza` : "Analizando..."}
        </span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <Card className="p-8 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">
            Analizando datos con IA... (esto toma 10-30 segundos)
          </p>
        </Card>
      )}

      {/* Forecast Chart */}
      {forecast && !isLoading && (
        <>
          <Card className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="rgba(0,0,0,0.5)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="rgba(0,0,0,0.5)"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                  }}
                  formatter={(value) =>
                    value !== undefined ? formatCurrency(value) : "-"
                  }
                />
                <Legend />

                {/* Historical sales */}
                <Line
                  type="monotone"
                  dataKey="historical"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                  name="Histórico"
                  isAnimationActive={true}
                />

                {/* Predicted sales */}
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Pronóstico IA"
                  isAnimationActive={true}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-4">
              📊 Línea sólida: datos históricos | Línea punteada: pronóstico
            </p>
          </Card>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricBox
              label="Venta Promedio Predicha"
              value={formatCurrency(
                forecast.predicted.reduce((a, b) => a + b) / forecast.predicted.length
              )}
              trend={
                forecast.trend === "growing"
                  ? "↑ Creciente"
                  : forecast.trend === "declining"
                    ? "↓ Decreciente"
                    : "→ Estable"
              }
            />
            <MetricBox
              label="Total Predicción"
              value={formatCurrency(
                forecast.predicted.reduce((a, b) => a + b)
              )}
              trend={`Próximos ${daysAhead} días`}
            />
            <MetricBox
              label="Confianza del Modelo"
              value={`${forecast.confidence}%`}
              trend={
                forecast.confidence > 80
                  ? "✓ Muy confiable"
                  : forecast.confidence > 60
                    ? "○ Aceptable"
                    : "⚠ Baja"
              }
            />
            <MetricBox
              label="Recomendaciones"
              value={`${forecast.recommendations.length}`}
              trend="Acciones sugeridas"
            />
          </div>

          {/* Analysis Section */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-600" />
              Análisis IA
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              {forecast.analysis}
            </p>

            {/* Recommendations */}
            {forecast.recommendations.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Recomendaciones:</h5>
                <ul className="space-y-1">
                  {forecast.recommendations.map((rec, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Insights Card */}
      {insights && !insightsLoading && (
        <Card className="p-6 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold">Insights del Negocio</h4>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resumen</p>
              <p className="text-sm mt-1">{insights.summary}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                💪 Fortaleza
              </p>
              <p className="text-sm mt-1">{insights.strength}</p>
            </div>

            {insights.concerns.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  ⚠️ Preocupaciones
                </p>
                <ul className="text-sm mt-1 space-y-1">
                  {insights.concerns.map((concern, idx) => (
                    <li key={idx}>• {concern}</li>
                  ))}
                </ul>
              </div>
            )}

            {insights.opportunities.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  🎯 Oportunidades
                </p>
                <ul className="text-sm mt-1 space-y-1">
                  {insights.opportunities.map((opp, idx) => (
                    <li key={idx}>• {opp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

/**
 * Reusable metric box for forecasts
 */
const MetricBox: React.FC<{
  label: string;
  value: string;
  trend: string;
}> = ({ label, value, trend }) => (
  <Card className="p-4">
    <p className="text-xs text-muted-foreground font-medium">{label}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
    <p className="text-xs text-muted-foreground mt-2">{trend}</p>
  </Card>
);
