import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { getBalanceHistory, formatCurrency } from "@/lib/storage";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";
import { Calendar, TrendingUp, TrendingDown, Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type Period = "7d" | "30d" | "90d" | "365d";

export const BalanceHistory: React.FC = () => {
  const { data } = useApp();
  const { sales, expenses, settings } = data;
  const isPremium = settings.isPremium || false;
  const [period, setPeriod] = useState<Period>("30d");

  const periodDays = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 };

  const historyData = React.useMemo(() => {
    const history = getBalanceHistory(sales, expenses, periodDays[period]);

    // Format for display based on period
    return history.map((h, idx) => {
      const date = new Date(h.date);
      let label = "";

      if (period === "7d") {
        label = date.toLocaleDateString("es-ES", {
          weekday: "short",
          day: "numeric",
        });
      } else if (period === "30d") {
        label =
          idx % 5 === 0
            ? date.toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
              })
            : "";
      } else if (period === "90d") {
        label =
          idx % 15 === 0
            ? date.toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
              })
            : "";
      } else {
        // 365d - mostrar cada mes
        label =
          idx % 30 === 0
            ? date.toLocaleDateString("es-ES", {
                month: "short",
                year: "2-digit",
              })
            : "";
      }

      return {
        ...h,
        label,
        displayDate: date.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };
    });
  }, [sales, expenses, period]);

  const totalBalance =
    historyData.length > 0 ? historyData[historyData.length - 1].cumulative : 0;
  const startBalance =
    historyData.length > 0
      ? historyData[0].cumulative - historyData[0].balance
      : 0;
  const change = totalBalance - startBalance;
  const changePercent =
    startBalance !== 0 ? (change / Math.abs(startBalance)) * 100 : 0;

  // Find best and worst days
  const bestDay =
    historyData.length > 0
      ? historyData.reduce(
          (best, day) => (day.balance > best.balance ? day : best),
          historyData[0]
        )
      : null;
  const worstDay =
    historyData.length > 0
      ? historyData.reduce(
          (worst, day) => (day.balance < worst.balance ? day : worst),
          historyData[0]
        )
      : null;

  return (
    <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Historial de Balance
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold">
              {formatCurrency(totalBalance, settings.currencySymbol)}
            </span>
            <span
              className={cn(
                "flex items-center text-sm font-medium px-2 py-0.5 rounded-full",
                change >= 0
                  ? "text-success bg-success/10"
                  : "text-destructive bg-destructive/10"
              )}
            >
              {change >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {changePercent >= 0 ? "+" : ""}
              {changePercent.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(["7d", "30d", "90d"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {p === "7d" ? "7 días" : p === "30d" ? "30 días" : "90 días"}
            </button>
          ))}
          {isPremium ? (
            <button
              onClick={() => setPeriod("365d")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1",
                period === "365d"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Crown className="w-3 h-3" />
              365 días
            </button>
          ) : (
            <button
              onClick={() => {
                toast({
                  title: "Funcionalidad Premium",
                  description:
                    "Los gráficos de 365 días están disponibles solo para usuarios premium",
                });
              }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 bg-muted text-muted-foreground hover:bg-muted/80 opacity-60 cursor-not-allowed"
              disabled
            >
              <Lock className="w-3 h-3" />
              365 días
            </button>
          )}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historyData}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickFormatter={(value) =>
                formatCurrency(value, settings.currencySymbol)
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
              }}
              formatter={(value: number, name: string) => [
                formatCurrency(value, settings.currencySymbol),
                name === "cumulative" ? "Balance acumulado" : "Balance del día",
              ]}
              labelFormatter={(_, payload) =>
                payload[0]?.payload?.displayDate || ""
              }
            />
            <ReferenceLine
              y={0}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorBalance)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Mejor día</p>
          <p className="font-semibold text-success">
            {formatCurrency(bestDay?.balance || 0, settings.currencySymbol)}
          </p>
          <p className="text-xs text-muted-foreground">
            {bestDay
              ? new Date(bestDay.date).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                })
              : "-"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Peor día</p>
          <p
            className={cn(
              "font-semibold",
              (worstDay?.balance || 0) < 0
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            {formatCurrency(worstDay?.balance || 0, settings.currencySymbol)}
          </p>
          <p className="text-xs text-muted-foreground">
            {worstDay
              ? new Date(worstDay.date).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                })
              : "-"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BalanceHistory;
