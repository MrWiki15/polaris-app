/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { MetricCard } from "@/components/ui/MetricCard";
import { ExportButtons } from "@/components/ui/ExportButtons";
import { CashFlowAlerts } from "@/components/dashboard/CashFlowAlerts";
import { RecurringPaymentsCard } from "@/components/dashboard/RecurringPaymentsCard";
import { BalanceHistory } from "@/components/dashboard/BalanceHistory";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  Lightbulb,
  ShoppingCart,
  Receipt,
  Crown,
  Lock,
} from "lucide-react";
import { ExportData } from "@/lib/exportUtils";
import { toast } from "@/hooks/use-toast";
import {
  formatCurrency,
  getTodaysSales,
  getTodaysExpenses,
  getYesterdaysSales,
  getWeekSales,
  getLowStockProducts,
  getInventoryValue,
} from "@/lib/storage";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { GoalsState } from "@/components/dashboard/GoalsState";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type ChartPeriod = "7d" | "30d" | "90d" | "365d";

export const Dashboard: React.FC = () => {
  const { data, supabaseAuth, currentProject } = useApp();
  const { sales, expenses, products, settings } = data;
  const isPremium = settings.isPremium || false;
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("7d");

  const inProjectDashboardMode =
    !!currentProject && !!supabaseAuth.user && !!currentProject.id;

  const {
    data: projectData,
    isLoading: loadingProject,
    error: projectError,
  } = useQuery({
    queryKey: ["project-data-dashboard", currentProject?.id],
    enabled: inProjectDashboardMode && !!currentProject?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id,data")
        .eq("id", currentProject?.id)
        .single();
      if (error) throw error;
      return (data?.data || {}) as {
        sales?: any[];
        expenses?: any[];
        products?: any[];
      };
    },
  });

  const dashboardSales = (
    inProjectDashboardMode ? projectData?.sales || [] : sales || []
  ) as any[];
  const dashboardExpenses = (
    inProjectDashboardMode ? projectData?.expenses || [] : expenses || []
  ) as any[];
  const dashboardProducts = (
    inProjectDashboardMode ? projectData?.products || [] : products || []
  ) as any[];

  // Calculate metrics
  const todaySales = useMemo(
    () => getTodaysSales(dashboardSales),
    [dashboardSales],
  );
  const todayExpenses = useMemo(
    () => getTodaysExpenses(dashboardExpenses),
    [dashboardExpenses],
  );
  const yesterdaySales = useMemo(
    () => getYesterdaysSales(dashboardSales),
    [dashboardSales],
  );
  const weekSales = useMemo(
    () => getWeekSales(dashboardSales),
    [dashboardSales],
  );
  const lowStockProducts = useMemo(
    () => getLowStockProducts(dashboardProducts),
    [dashboardProducts],
  );
  const inventoryValue = useMemo(
    () => getInventoryValue(dashboardProducts),
    [dashboardProducts],
  );

  const todaySalesTotal = todaySales.reduce((sum, s) => sum + s.amount, 0);
  const todayExpensesTotal = todayExpenses.reduce(
    (sum, e) => sum + e.amount,
    0,
  );
  const todayBalance = todaySalesTotal - todayExpensesTotal;
  const yesterdaySalesTotal = yesterdaySales.reduce(
    (sum, s) => sum + s.amount,
    0,
  );

  // Calculate trend
  const salesTrend =
    yesterdaySalesTotal > 0
      ? ((todaySalesTotal - yesterdaySalesTotal) / yesterdaySalesTotal) * 100
      : 0;

  // Prepare chart data based on selected period
  const chartData = useMemo(() => {
    const periodDays = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 };
    const daysToShow = periodDays[chartPeriod];
    const days = [];

    // Determine grouping based on period
    const groupBy =
      chartPeriod === "7d"
        ? "day"
        : chartPeriod === "30d"
          ? "day"
          : chartPeriod === "90d"
            ? "week"
            : "month";

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToShow);

    if (groupBy === "day") {
      // Show daily data
      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        let dayName = "";
        if (chartPeriod === "7d") {
          dayName = date.toLocaleDateString("es-ES", { weekday: "short" });
        } else {
          // Para 30 días, mostrar cada 3 días para evitar saturación
          if (i % 3 === 0 || i === daysToShow - 1) {
            dayName = date.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
            });
          } else {
            dayName = "";
          }
        }

        const daySales = dashboardSales
          .filter((s) => s.date === dateStr)
          .reduce((sum, s) => sum + s.amount, 0);
        const dayExpenses = dashboardExpenses
          .filter((e) => e.date === dateStr)
          .reduce((sum, e) => sum + e.amount, 0);

        days.push({
          name: dayName,
          ventas: daySales,
          gastos: dayExpenses,
          balance: daySales - dayExpenses,
        });
      }
    } else if (groupBy === "week") {
      // Show weekly data
      const weeks = Math.ceil(daysToShow / 7);
      for (let i = weeks - 1; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - i * 7 - 6);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekSales = dashboardSales
          .filter((s) => {
            const saleDate = new Date(s.date);
            return saleDate >= weekStart && saleDate <= weekEnd;
          })
          .reduce((sum, s) => sum + s.amount, 0);
        const weekExpenses = dashboardExpenses
          .filter((e) => {
            const expDate = new Date(e.date);
            return expDate >= weekStart && expDate <= weekEnd;
          })
          .reduce((sum, e) => sum + e.amount, 0);

        const weekLabel = weekStart.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        });
        days.push({
          name: weekLabel,
          ventas: weekSales,
          gastos: weekExpenses,
          balance: weekSales - weekExpenses,
        });
      }
    } else {
      // Show monthly data (for 365d)
      const months = Math.ceil(daysToShow / 30);
      for (let i = months - 1; i >= 0; i--) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);

        const monthSales = dashboardSales
          .filter((s) => {
            const saleDate = new Date(s.date);
            return saleDate >= monthStart && saleDate <= monthEnd;
          })
          .reduce((sum, s) => sum + s.amount, 0);
        const monthExpenses = dashboardExpenses
          .filter((e) => {
            const expDate = new Date(e.date);
            return expDate >= monthStart && expDate <= monthEnd;
          })
          .reduce((sum, e) => sum + e.amount, 0);

        days.push({
          name: monthStart.toLocaleDateString("es-ES", { month: "short" }),
          ventas: monthSales,
          gastos: monthExpenses,
          balance: monthSales - monthExpenses,
        });
      }
    }

    return days;
  }, [dashboardSales, dashboardExpenses, chartPeriod]);

  // Generate insights
  const insights = useMemo(() => {
    const tips: {
      icon: React.ReactNode;
      text: string;
      type: "success" | "warning" | "info";
    }[] = [];

    if (lowStockProducts.length > 0) {
      tips.push({
        icon: <AlertTriangle className="w-5 h-5" />,
        text: `${lowStockProducts.length} producto(s) con stock bajo`,
        type: "warning",
      });
    }

    if (todayBalance > 0) {
      tips.push({
        icon: <TrendingUp className="w-5 h-5" />,
        text: `Día positivo: ganancia de ${formatCurrency(
          todayBalance,
          settings.currencySymbol,
        )}`,
        type: "success",
      });
    }

    if (salesTrend > 10) {
      tips.push({
        icon: <Lightbulb className="w-5 h-5" />,
        text: "Ventas en aumento respecto a ayer",
        type: "success",
      });
    }

    if (todayExpensesTotal > todaySalesTotal && todaySalesTotal > 0) {
      tips.push({
        icon: <AlertTriangle className="w-5 h-5" />,
        text: "Los gastos superan las ventas hoy",
        type: "warning",
      });
    }

    return tips;
  }, [
    lowStockProducts,
    todayBalance,
    salesTrend,
    todayExpensesTotal,
    todaySalesTotal,
    settings.currencySymbol,
  ]);

  // Prepare export data
  const exportData = useMemo<ExportData>(
    () => ({
      title: "Dashboard - Resumen General",
      headers: ["Fecha", "Ventas", "Gastos", "Balance"],
      rows: chartData.map((day) => [
        day.name,
        day.ventas,
        day.gastos,
        day.balance,
      ]),
      summary: [
        {
          label: "Ventas de hoy",
          value: formatCurrency(todaySalesTotal, settings.currencySymbol),
        },
        {
          label: "Gastos de hoy",
          value: formatCurrency(todayExpensesTotal, settings.currencySymbol),
        },
        {
          label: "Balance del día",
          value: formatCurrency(todayBalance, settings.currencySymbol),
        },
        {
          label: "Valor inventario",
          value: formatCurrency(inventoryValue, settings.currencySymbol),
        },
        { label: "Productos con stock bajo", value: lowStockProducts.length },
      ],
    }),
    [
      chartData,
      todaySalesTotal,
      todayExpensesTotal,
      todayBalance,
      inventoryValue,
      lowStockProducts.length,
      settings.currencySymbol,
    ],
  );

  return (
    <div className="space-y-6 lg:space-y-8 pb-20 max-w-7xl lg:max-w-full">
      {!!currentProject && (
        <div className="mb-4 rounded-xl border border-border p-3 bg-muted/40 text-sm">
          <div className="font-medium">
            Modo proyecto: {currentProject?.name} (Dashboard)
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
          Hola, {settings.businessName || "Emprendedor"} 👋
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
        <MetricCard
          title="Ventas de hoy"
          value={formatCurrency(todaySalesTotal, settings.currencySymbol)}
          icon={<ShoppingCart className="w-5 h-5" />}
          trend={{ value: Math.round(salesTrend), label: "vs ayer" }}
          variant="primary"
        />
        <MetricCard
          title="Gastos de hoy"
          value={formatCurrency(todayExpensesTotal, settings.currencySymbol)}
          icon={<Receipt className="w-5 h-5" />}
          variant="destructive"
        />
        <MetricCard
          title="Balance del día"
          value={formatCurrency(
            Math.abs(todayBalance),
            settings.currencySymbol,
          )}
          subtitle={todayBalance >= 0 ? "Ganancia" : "Pérdida"}
          icon={
            todayBalance >= 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )
          }
          variant={todayBalance >= 0 ? "success" : "destructive"}
        />
        <MetricCard
          title="Valor inventario"
          value={formatCurrency(inventoryValue, settings.currencySymbol)}
          subtitle={`${products.length} productos`}
          icon={<Package className="w-5 h-5" />}
          variant="default"
        />
      </div>

      {/* Cash Flow Alerts */}
      <CashFlowAlerts />

      {/* Charts & Recurring Payments */}
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Weekly Overview */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-3 sm:p-4 md:p-6 lg:p-7 shadow-soft border border-border">
          <div className="flex flex-col gap-3 mb-5">
            <h3 className="font-semibold text-sm sm:text-base lg:text-lg">
              Resumen de Período
            </h3>
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setChartPeriod("7d")}
                className={cn(
                  "px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded text-xs sm:text-sm md:text-base font-medium transition-all whitespace-nowrap",
                  chartPeriod === "7d"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                7d
              </button>
              {isPremium ? (
                <>
                  <button
                    onClick={() => setChartPeriod("30d")}
                    className={cn(
                      "px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded text-xs sm:text-sm md:text-base font-medium transition-all flex items-center gap-0.5 sm:gap-1 whitespace-nowrap",
                      chartPeriod === "30d"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    <Crown className="w-3 h-3 hidden sm:inline" />
                    30d
                  </button>
                  <button
                    onClick={() => setChartPeriod("90d")}
                    className={cn(
                      "px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded text-xs sm:text-sm md:text-base font-medium transition-all flex items-center gap-0.5 sm:gap-1 whitespace-nowrap",
                      chartPeriod === "90d"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    <Crown className="w-3 h-3 hidden sm:inline" />
                    90d
                  </button>
                  <button
                    onClick={() => setChartPeriod("365d")}
                    className={cn(
                      "px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded text-xs sm:text-sm md:text-base font-medium transition-all flex items-center gap-0.5 sm:gap-1 whitespace-nowrap",
                      chartPeriod === "365d"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    <Crown className="w-3 h-3 hidden sm:inline" />
                    365d
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      toast({
                        title: "Funcionalidad Premium",
                        description:
                          "Los períodos extendidos están disponibles solo para usuarios premium",
                      });
                    }}
                    className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded text-xs sm:text-sm md:text-base font-medium transition-all flex items-center gap-0.5 sm:gap-1 bg-muted text-muted-foreground hover:bg-muted/80 opacity-60 cursor-not-allowed whitespace-nowrap"
                    disabled
                  >
                    <Lock className="w-3 h-3 hidden sm:inline" />
                    30d
                  </button>
                  <button
                    onClick={() => {
                      toast({
                        title: "Funcionalidad Premium",
                        description:
                          "Los períodos extendidos están disponibles solo para usuarios premium",
                      });
                    }}
                    className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded text-xs sm:text-sm md:text-base font-medium transition-all flex items-center gap-0.5 sm:gap-1 bg-muted text-muted-foreground hover:bg-muted/80 opacity-60 cursor-not-allowed whitespace-nowrap"
                    disabled
                  >
                    <Lock className="w-3 h-3 hidden sm:inline" />
                    90d
                  </button>
                  <button
                    onClick={() => {
                      toast({
                        title: "Funcionalidad Premium",
                        description:
                          "Los períodos extendidos están disponibles solo para usuarios premium",
                      });
                    }}
                    className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded text-xs sm:text-sm md:text-base font-medium transition-all flex items-center gap-0.5 sm:gap-1 bg-muted text-muted-foreground hover:bg-muted/80 opacity-60 cursor-not-allowed whitespace-nowrap"
                    disabled
                  >
                    <Lock className="w-3 h-3 hidden sm:inline" />
                    365d
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="h-48 sm:h-56 md:h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--chart-2))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--chart-2))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--chart-4))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--chart-4))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: number) =>
                    formatCurrency(value, settings.currencySymbol)
                  }
                />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="hsl(var(--chart-2))"
                  fillOpacity={1}
                  fill="url(#colorVentas)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="gastos"
                  stroke="hsl(var(--chart-4))"
                  fillOpacity={1}
                  fill="url(#colorGastos)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Balance Chart */}
        <div className="bg-card rounded-2xl p-3 sm:p-4 md:p-6 lg:p-7 shadow-soft border border-border">
          <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base lg:text-lg">
            Balance del Período
          </h3>
          <div className="h-48 sm:h-56 md:h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number) =>
                    formatCurrency(value, settings.currencySymbol)
                  }
                />
                <Legend />
                <Bar
                  dataKey="ventas"
                  name="Ventas"
                  fill="hsl(var(--chart-2))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="gastos"
                  name="Gastos"
                  fill="hsl(var(--chart-4))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4 lg:space-y-6 lg:col-span-2">
          {/* Balance History */}
          <BalanceHistory />

          <Separator className="my-2 lg:hidden" />

          <GoalsState />
        </div>

        <div className="space-y-4 lg:space-y-6">
          {/* Recurring Payments Card */}
          <RecurringPaymentsCard />
        </div>
      </div>

      {/* Insights & Alerts */}
      {insights.length > 0 && (
        <div className="space-y-3 lg:space-y-4">
          <h3 className="font-semibold text-sm sm:text-base lg:text-lg">
            Alertas e Insights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border transition-all",
                  insight.type === "success" &&
                    "bg-success/5 border-success/20 text-success",
                  insight.type === "warning" &&
                    "bg-warning/5 border-warning/20 text-warning",
                  insight.type === "info" &&
                    "bg-info/5 border-info/20 text-info",
                )}
              >
                {insight.icon}
                <span className="text-sm font-medium">{insight.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-warning/5 border border-warning/20 rounded-2xl p-3 sm:p-4 md:p-6 lg:p-7">
          <h3 className="font-semibold text-warning mb-4 flex items-center gap-2 text-sm sm:text-base lg:text-lg">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            Productos con Stock Bajo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {lowStockProducts.slice(0, 6).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-card rounded-xl border border-border"
              >
                <span className="font-medium truncate">{product.name}</span>
                <span
                  className={cn(
                    "px-2 py-1 rounded-lg text-xs font-bold",
                    product.quantity === 0
                      ? "bg-destructive/10 text-destructive"
                      : "bg-warning/10 text-warning",
                  )}
                >
                  {product.quantity} uds
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export */}
      <div className="flex justify-end">
        <ExportButtons
          data={exportData}
          filename="dashboard"
          isPremium={isPremium}
        />
      </div>
    </div>
  );
};

export default Dashboard;
