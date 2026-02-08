import React, { useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { MetricCard } from "@/components/ui/MetricCard";
import { ExportButtons } from "@/components/ui/ExportButtons";
import { formatCurrency } from "@/lib/storage";
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Target,
  Lightbulb,
  BarChart3,
  Crown,
  Lock,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ExportData } from "@/lib/exportUtils";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { DEPARTMENT_PERMISSIONS } from "@/components/layout/AppLayout";
import { useNavigate } from "react-router-dom";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

type AnalysisPeriod = "6m" | "12m" | "24m";

export const Analisis: React.FC = () => {
  const { data, currentProject, currentProjectMember } = useApp();
  const { sales, expenses, products, settings, clients, suppliers } = data;
  const isPremium = settings.isPremium || false;
  const [analysisPeriod, setAnalysisPeriod] = useState<AnalysisPeriod>("6m");

  const isProjectSelected = !!currentProject;
  const department = currentProjectMember?.departament;
  const permissions = department
    ? DEPARTMENT_PERMISSIONS[department]
    : undefined;
  const isAuthorizedForPage =
    !isProjectSelected ||
    !department ||
    !permissions ||
    permissions.includes("all") ||
    permissions.includes("/analisis");

  // Calculate metrics
  const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalSales - totalExpenses;
  const profitMargin = totalSales > 0 ? (profit / totalSales) * 100 : 0;

  // Monthly trend data
  const monthlyData = useMemo(() => {
    const months: {
      [key: string]: { ventas: number; gastos: number; balance: number };
    } = {};
    const monthCount =
      analysisPeriod === "6m" ? 6 : analysisPeriod === "12m" ? 12 : 24;
    const lastMonths = [];

    for (let i = monthCount - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const monthName = date.toLocaleDateString("es-ES", {
        month: "short",
        year: monthCount > 12 ? "2-digit" : undefined,
      });
      months[monthKey] = { ventas: 0, gastos: 0, balance: 0 };
      lastMonths.push({ key: monthKey, name: monthName });
    }

    sales.forEach((s) => {
      const monthKey = s?.date?.substring(0, 7);
      if (months[monthKey]) {
        months[monthKey].ventas += s.amount;
      }
    });

    expenses.forEach((e) => {
      const monthKey = e?.date?.substring(0, 7);
      if (months[monthKey]) {
        months[monthKey].gastos += e.amount;
      }
    });

    return lastMonths.map((m) => ({
      name: m.name,
      ventas: months[m.key].ventas,
      gastos: months[m.key].gastos,
      balance: months[m.key].ventas - months[m.key].gastos,
    }));
  }, [sales, expenses, analysisPeriod]);

  // Sales by category
  const salesByCategory = useMemo(() => {
    const categories: { [key: string]: number } = {};
    sales.forEach((s) => {
      categories[s.category] = (categories[s.category] || 0) + s.amount;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [sales]);

  // Premium: Top 10 most frequent clients
  const topClients = useMemo(() => {
    if (!isPremium) return [];
    const clientMap: {
      [key: string]: { name: string; count: number; revenue: number };
    } = {};

    sales.forEach((s) => {
      if (s.clientId) {
        if (!clientMap[s.clientId]) {
          const client = clients.find((c) => c.id === s.clientId);
          clientMap[s.clientId] = {
            name: client?.name || "Desconocido",
            count: 0,
            revenue: 0,
          };
        }
        clientMap[s.clientId].count += 1;
        clientMap[s.clientId].revenue += s.amount;
      }
    });

    return Object.values(clientMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [sales, clients, isPremium]);

  // Premium: Client with highest revenue
  const topRevenueClient = useMemo(() => {
    if (!isPremium) return null;
    const clientMap: {
      [key: string]: { name: string; revenue: number };
    } = {};

    sales.forEach((s) => {
      if (s.clientId) {
        if (!clientMap[s.clientId]) {
          const client = clients.find((c) => c.id === s.clientId);
          clientMap[s.clientId] = {
            name: client?.name || "Desconocido",
            revenue: 0,
          };
        }
        clientMap[s.clientId].revenue += s.amount;
      }
    });

    const topClient = Object.values(clientMap).sort(
      (a, b) => b.revenue - a.revenue
    )[0];
    return topClient || null;
  }, [sales, clients, isPremium]);

  // Premium: Supplier with most products
  const topSupplierByProducts = useMemo(() => {
    if (!isPremium) return null;
    const supplierMap: {
      [key: string]: { name: string; count: number };
    } = {};

    products.forEach((p) => {
      if (p.supplierId) {
        if (!supplierMap[p.supplierId]) {
          const supplier = suppliers.find((s) => s.id === p.supplierId);
          supplierMap[p.supplierId] = {
            name: supplier?.name || "Desconocido",
            count: 0,
          };
        }
        supplierMap[p.supplierId].count += 1;
      }
    });

    const topSupplier = Object.entries(supplierMap)
      .map(([id, data]) => data)
      .sort((a, b) => b.count - a.count)[0];
    return topSupplier || null;
  }, [products, suppliers, isPremium]);

  // Premium: Most profitable supplier by margin
  const topSupplierByMargin = useMemo(() => {
    if (!isPremium) return null;
    const supplierMap: {
      [key: string]: {
        name: string;
        totalCost: number;
        totalRevenue: number;
        count: number;
      };
    } = {};

    products.forEach((p) => {
      if (p.supplierId) {
        if (!supplierMap[p.supplierId]) {
          const supplier = suppliers.find((s) => s.id === p.supplierId);
          supplierMap[p.supplierId] = {
            name: supplier?.name || "Desconocido",
            totalCost: 0,
            totalRevenue: 0,
            count: 0,
          };
        }
        supplierMap[p.supplierId].totalCost += p.cost * p.quantity;
        supplierMap[p.supplierId].totalRevenue += p.price * p.quantity;
        supplierMap[p.supplierId].count += 1;
      }
    });

    const suppliersWithMargin = Object.values(supplierMap)
      .map((s) => ({
        name: s.name,
        margin:
          s.totalCost > 0
            ? (((s.totalRevenue - s.totalCost) / s.totalCost) * 100).toFixed(1)
            : 0,
        revenue: s.totalRevenue,
        count: s.count,
      }))
      .sort(
        (a, b) =>
          parseFloat(b.margin as string) - parseFloat(a.margin as string)
      );

    return suppliersWithMargin[0] || null;
  }, [products, suppliers, isPremium]);

  // Generate insights
  const insights = useMemo(() => {
    const tips: {
      icon: React.ReactNode;
      title: string;
      text: string;
      type: "success" | "warning" | "info";
    }[] = [];

    // Best selling category
    if (salesByCategory.length > 0) {
      tips.push({
        icon: <Target className="w-5 h-5" />,
        title: "Categoría más rentable",
        text: `"${salesByCategory[0].name}" genera el ${(
          (salesByCategory[0].value / totalSales) *
          100
        ).toFixed(0)}% de tus ventas`,
        type: "success",
      });
    }

    // Profit margin analysis
    if (profitMargin > 30) {
      tips.push({
        icon: <TrendingUp className="w-5 h-5" />,
        title: "Margen saludable",
        text: `Tu margen de beneficio del ${profitMargin.toFixed(
          0
        )}% está por encima del promedio`,
        type: "success",
      });
    } else if (profitMargin > 0) {
      tips.push({
        icon: <Lightbulb className="w-5 h-5" />,
        title: "Oportunidad de mejora",
        text: "Considera reducir gastos o aumentar precios para mejorar el margen",
        type: "warning",
      });
    }

    // Low stock products affecting sales
    const lowStockCount = products.filter(
      (p) => p.quantity <= (p.minStock || 10)
    ).length;
    if (lowStockCount > 0) {
      tips.push({
        icon: <BarChart3 className="w-5 h-5" />,
        title: "Stock afectando ventas",
        text: `${lowStockCount} productos con stock bajo pueden limitar tus ventas`,
        type: "warning",
      });
    }

    // Month comparison
    if (monthlyData.length >= 2) {
      const currentMonth = monthlyData[monthlyData.length - 1];
      const lastMonth = monthlyData[monthlyData.length - 2];
      const growth =
        lastMonth.ventas > 0
          ? ((currentMonth.ventas - lastMonth.ventas) / lastMonth.ventas) * 100
          : 0;

      if (growth > 0) {
        tips.push({
          icon: <TrendingUp className="w-5 h-5" />,
          title: "Crecimiento positivo",
          text: `Las ventas crecieron ${growth.toFixed(
            0
          )}% respecto al mes anterior`,
          type: "success",
        });
      } else if (growth < 0) {
        tips.push({
          icon: <TrendingDown className="w-5 h-5" />,
          title: "Ventas decreciendo",
          text: `Las ventas bajaron ${Math.abs(growth).toFixed(
            0
          )}% respecto al mes anterior`,
          type: "warning",
        });
      }
    }

    return tips;
  }, [salesByCategory, totalSales, profitMargin, products, monthlyData]);

  // Prepare export data
  const exportData = useMemo<ExportData>(
    () => ({
      title: "Análisis Financiero",
      headers: ["Mes", "Ingresos", "Gastos", "Balance"],
      rows: monthlyData.map((month) => [
        month.name,
        month.ventas,
        month.gastos,
        month.balance,
      ]),
      summary: [
        {
          label: "Total Ingresos",
          value: formatCurrency(totalSales, settings.currencySymbol),
        },
        {
          label: "Total Gastos",
          value: formatCurrency(totalExpenses, settings.currencySymbol),
        },
        {
          label: "Beneficio Neto",
          value: formatCurrency(profit, settings.currencySymbol),
        },
        { label: "Margen de Beneficio", value: `${profitMargin.toFixed(1)}%` },
      ],
    }),
    [
      monthlyData,
      totalSales,
      totalExpenses,
      profit,
      profitMargin,
      settings.currencySymbol,
    ]
  );

  // Comparator state
  const navigate = useNavigate();
  const entityTypes = [
    "product",
    "service",
    "supplier",
    "client",
    "worker",
    "tag",
  ];

  const getItemsForType = (type: string) => {
    switch (type) {
      case "product":
        return products.map((p) => ({ id: p.id, name: p.name }));
      case "service":
        return data.services.map((s) => ({ id: s.id, name: s.name }));
      case "supplier":
        return data.suppliers.map((s) => ({ id: s.id, name: s.name }));
      case "client":
        return clients.map((c) => ({ id: c.id, name: c.name }));
      case "worker":
        return data.workers.map((w) => ({ id: w.id, name: w.name }));
      case "tag":
        return (data.customTags || []).map((t) => ({ id: t, name: t }));
      default:
        return [];
    }
  };

  const [leftType, setLeftType] = useState<string>("product");
  const [leftId, setLeftId] = useState<string | undefined>(
    products[0]?.id
  );
  const [rightType, setRightType] = useState<string>("service");
  const [rightId, setRightId] = useState<string | undefined>(
    data.services[0]?.id
  );

  const handleCompare = () => {
    if (!leftId || !rightId) {
      toast({ title: "Seleccione ambos elementos para comparar" });
      return;
    }
    const pair = `${leftType}:${leftId}_vs_${rightType}:${rightId}`;
    navigate(`/compar/${encodeURIComponent(pair)}`);
  };

  return (
    <div className="space-y-6 pb-20">
      {isProjectSelected && !isAuthorizedForPage && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-2">Acceso restringido</h2>
            <p className="text-sm text-muted-foreground">
              Solo el personal autorizado puede acceder a esta sección en el
              proyecto seleccionado.
            </p>
          </div>
        </div>
      )}
      {isProjectSelected && (
        <div className="mb-4 rounded-xl border border-border p-3 bg-muted/40 text-sm">
          <div className="font-medium">
            Modo proyecto: {currentProject?.name} (Análisis)
          </div>
        </div>
      )}
      {/* Key Metrics */}
      {/* Quick Comparator */}
      <div className="bg-card rounded-2xl p-4 shadow-soft border border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Comparador Rápido</div>
            <div className="text-xs text-muted-foreground mt-1">Compara rápidamente dos elementos y ve cuál es más rentable</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 items-center w-full md:w-auto mt-3 md:mt-0">
            <div className="col-span-1">
              <label className="block text-xs text-muted-foreground mb-1">Tipo (izquierda)</label>
              <select
                aria-label="Tipo izquierdo"
                value={leftType}
                onChange={(e) => {
                  const t = e.target.value;
                  setLeftType(t);
                  const items = getItemsForType(t);
                  setLeftId(items[0]?.id);
                }}
                className="w-full px-3 py-2 rounded-lg bg-muted text-sm border border-border focus:outline-none"
              >
                {entityTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs text-muted-foreground mb-1">Elemento (izquierda)</label>
              <select
                aria-label="Elemento izquierdo"
                value={leftId}
                onChange={(e) => setLeftId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-muted text-sm border border-border focus:outline-none"
              >
                {getItemsForType(leftType).map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs text-muted-foreground mb-1">Tipo (derecha)</label>
              <select
                aria-label="Tipo derecho"
                value={rightType}
                onChange={(e) => {
                  const t = e.target.value;
                  setRightType(t);
                  const items = getItemsForType(t);
                  setRightId(items[0]?.id);
                }}
                className="w-full px-3 py-2 rounded-lg bg-muted text-sm border border-border focus:outline-none"
              >
                {entityTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs text-muted-foreground mb-1">Elemento (derecha)</label>
              <select
                aria-label="Elemento derecho"
                value={rightId}
                onChange={(e) => setRightId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-muted text-sm border border-border focus:outline-none"
              >
                {getItemsForType(rightType).map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 md:mt-0">
            <button
              onClick={handleCompare}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium shadow-sm hover:shadow-md"
            >
              Comparar
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Ingresos"
          value={formatCurrency(totalSales, settings.currencySymbol)}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="success"
        />
        <MetricCard
          title="Total Gastos"
          value={formatCurrency(totalExpenses, settings.currencySymbol)}
          icon={<TrendingDown className="w-5 h-5" />}
          variant="destructive"
        />
        <MetricCard
          title="Beneficio Neto"
          value={formatCurrency(Math.abs(profit), settings.currencySymbol)}
          subtitle={profit >= 0 ? "Ganancia" : "Pérdida"}
          icon={
            profit >= 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )
          }
          variant={profit >= 0 ? "primary" : "destructive"}
        />
        <MetricCard
          title="Margen de Beneficio"
          value={`${profitMargin.toFixed(1)}%`}
          icon={<Percent className="w-5 h-5" />}
          variant={profitMargin > 20 ? "success" : "warning"}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Trend */}
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="font-semibold">Tendencia Mensual</h3>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setAnalysisPeriod("6m")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  analysisPeriod === "6m"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                6 meses
              </button>
              {isPremium ? (
                <>
                  <button
                    onClick={() => setAnalysisPeriod("12m")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1",
                      analysisPeriod === "12m"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <Crown className="w-3 h-3" />
                    12 meses
                  </button>
                  <button
                    onClick={() => setAnalysisPeriod("24m")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1",
                      analysisPeriod === "24m"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <Crown className="w-3 h-3" />
                    24 meses
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
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 bg-muted text-muted-foreground hover:bg-muted/80 opacity-60 cursor-not-allowed"
                    disabled
                  >
                    <Lock className="w-3 h-3" />
                    12 meses
                  </button>
                  <button
                    onClick={() => {
                      toast({
                        title: "Funcionalidad Premium",
                        description:
                          "Los períodos extendidos están disponibles solo para usuarios premium",
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 bg-muted text-muted-foreground hover:bg-muted/80 opacity-60 cursor-not-allowed"
                    disabled
                  >
                    <Lock className="w-3 h-3" />
                    24 meses
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient
                    id="colorIngresos"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
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
                  <linearGradient
                    id="colorGastosArea"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
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
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
                <Area
                  type="monotone"
                  dataKey="ventas"
                  name="Ingresos"
                  stroke="hsl(var(--chart-2))"
                  fillOpacity={1}
                  fill="url(#colorIngresos)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="gastos"
                  name="Gastos"
                  stroke="hsl(var(--chart-4))"
                  fillOpacity={1}
                  fill="url(#colorGastosArea)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
          <h3 className="font-semibold mb-4">Ventas por Categoría</h3>
          <div className="h-64">
            {salesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {salesByCategory.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      formatCurrency(value, settings.currencySymbol)
                    }
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No hay datos suficientes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Premium Analysis: Clients */}
      {isPremium && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Clients */}
          <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Top 10 Clientes Recurrentes</h3>
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {topClients.length > 0 ? (
                topClients.map((client, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{client.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {client.count} compra{client.count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {formatCurrency(
                          client.revenue,
                          settings.currencySymbol
                        )}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Sin clientes registrados en las ventas
                </div>
              )}
            </div>
          </div>

          {/* Top Revenue Client */}
          <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Cliente con Mayor Ganancia</h3>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            {topRevenueClient ? (
              <div className="space-y-4">
                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-sm text-muted-foreground mb-1">Cliente</p>
                  <p className="font-semibold text-lg">
                    {topRevenueClient.name}
                  </p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">
                    Ingresos Generados
                  </p>
                  <p className="font-semibold text-lg text-primary">
                    {formatCurrency(
                      topRevenueClient.revenue,
                      settings.currencySymbol
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Sin datos disponibles
              </div>
            )}
          </div>

          {/* Supplier with Most Products */}
          <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Proveedor con Más Productos</h3>
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            {topSupplierByProducts ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-muted-foreground mb-1">
                    Proveedor
                  </p>
                  <p className="font-semibold text-lg">
                    {topSupplierByProducts.name}
                  </p>
                </div>
                <div className="p-4 bg-info/10 rounded-lg border border-info/20">
                  <p className="text-sm text-muted-foreground mb-1">
                    Productos Suministrados
                  </p>
                  <p className="font-semibold text-lg text-info">
                    {topSupplierByProducts.count} producto
                    {topSupplierByProducts.count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Sin datos disponibles
              </div>
            )}
          </div>

          {/* Most Profitable Supplier by Margin */}
          <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Proveedor Más Rentable (Margen)</h3>
              <Percent className="w-5 h-5 text-amber-500" />
            </div>
            {topSupplierByMargin ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <p className="text-sm text-muted-foreground mb-1">
                    Proveedor
                  </p>
                  <p className="font-semibold text-lg">
                    {topSupplierByMargin.name}
                  </p>
                </div>
                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-sm text-muted-foreground mb-1">
                    Margen de Ganancia
                  </p>
                  <p className="font-semibold text-lg text-success">
                    {topSupplierByMargin.margin}%
                  </p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">
                    Ingresos Total
                  </p>
                  <p className="font-semibold text-sm text-primary">
                    {formatCurrency(
                      topSupplierByMargin.revenue,
                      settings.currencySymbol
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Sin datos disponibles
              </div>
            )}
          </div>
        </div>
      )}

      {/* Balance Chart */}
      <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
        <h3 className="font-semibold mb-4">Balance Mensual</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
              <Bar
                dataKey="balance"
                name="Balance"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Insights Inteligentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-2xl border transition-all",
                  insight.type === "success" &&
                    "bg-success/5 border-success/20",
                  insight.type === "warning" &&
                    "bg-warning/5 border-warning/20",
                  insight.type === "info" && "bg-info/5 border-info/20"
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-2 mb-2",
                    insight.type === "success" && "text-success",
                    insight.type === "warning" && "text-warning",
                    insight.type === "info" && "text-info"
                  )}
                >
                  {insight.icon}
                  <span className="font-semibold">{insight.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header with Export */}
      <div className="flex justify-end">
        <ExportButtons
          data={exportData}
          filename="analisis"
          isPremium={isPremium}
        />
      </div>
    </div>
  );
};

export default Analisis;
