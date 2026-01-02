import React, { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { DataTable } from "@/components/ui/DataTable";
import { SaleForm } from "@/components/forms/SaleForm";
import { MetricCard } from "@/components/ui/MetricCard";
import { ExportButtons } from "@/components/ui/ExportButtons";
import { formatCurrency, getWeekSales, getMonthSales } from "@/lib/storage";
import { ShoppingCart, Calendar, TrendingUp } from "lucide-react";
import { Sale } from "@/lib/storage";
import { ExportData } from "@/lib/exportUtils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

type FilterPeriod = "today" | "week" | "month" | "all";

export const Ventas: React.FC = () => {
  const { data, deleteSale, deleteServiceIncome } = useApp();
  const { sales, serviceIncomes, services, settings } = data;
  const isPremium = settings.isPremium || false;
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [filter, setFilter] = useState<FilterPeriod>("week");

  // Helper function to format date correctly (String-based to avoid timezone shifts)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    // Handle potential ISO strings (e.g. 2023-10-05T00:00:00.000Z) by taking the first part
    const cleanDate = dateStr.split("T")[0];
    const parts = cleanDate.split("-");
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  // Combine and filter incomes
  const filteredIncomes = useMemo(() => {
    const today = new Date();
    const todayStr = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    monthAgo.setHours(0, 0, 0, 0);

    const checkDate = (dateStr: string) => {
      const cleanDate = dateStr.split("T")[0];
      if (filter === "all") return true;
      if (filter === "today") return cleanDate === todayStr;

      // Create date at noon to avoid timezone shifting
      const date = new Date(cleanDate + "T12:00:00");
      if (filter === "week") return date >= weekAgo;
      if (filter === "month") return date >= monthAgo;
      return true;
    };

    const productSales = sales.map((s) => ({
      ...s,
      type: "product" as const,
      displayCategory: s.category,
      displayName: s.description || "Venta de producto",
    }));

    const serviceSales = serviceIncomes.map((s) => {
      const service = services.find((svc) => svc.id === s.serviceId);
      return {
        ...s,
        type: "service" as const,
        displayCategory: "Servicio",
        displayName: service?.name || "Servicio",
        // Map service fields to match Sale structure where needed
        category: "Servicio",
        productId: undefined,
        quantity: undefined,
      };
    });

    return [...productSales, ...serviceSales]
      .filter((item) => checkDate(item.date))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, serviceIncomes, services, filter]);

  // Metrics
  const weekSales = useMemo(() => getWeekSales(sales), [sales]);

  // Calculate totals based on filtered unified list
  const totalFiltered = filteredIncomes.reduce((sum, s) => sum + s.amount, 0);

  const weekTotalProducts = weekSales.reduce((sum, s) => sum + s.amount, 0);

  // Calculate service totals for cards
  const serviceStats = useMemo(() => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    monthAgo.setHours(0, 0, 0, 0);

    return serviceIncomes
      .filter((si) => {
        const cleanDate = si.date.split("T")[0];
        return new Date(cleanDate + "T12:00:00") >= monthAgo;
      })
      .reduce((sum, si) => sum + si.amount, 0);
  }, [serviceIncomes]);

  const monthTotalAll = useMemo(() => {
    // Recalculate correctly for current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const prodSum = sales
      .filter((s) => {
        const cleanDate = s.date.split("T")[0];
        const d = new Date(cleanDate + "T12:00:00");
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, s) => sum + s.amount, 0);

    const svcSum = serviceIncomes
      .filter((s) => {
        const cleanDate = s.date.split("T")[0];
        const d = new Date(cleanDate + "T12:00:00");
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, s) => sum + s.amount, 0);

    return prodSum + svcSum;
  }, [sales, serviceIncomes]);

  // Chart data
  const chartData = useMemo(() => {
    const days: { [key: string]: number } = {};
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      // Use local date string generation
      const dateStr = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];

      const dayName = date.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
      });
      days[dateStr] = 0;
      last7Days.push({ dateStr, dayName });
    }

    // Add sales
    sales.forEach((s) => {
      const cleanDate = s.date.split("T")[0];
      if (days[cleanDate] !== undefined) {
        days[cleanDate] += s.amount;
      }
    });

    // Add services
    serviceIncomes.forEach((s) => {
      const cleanDate = s.date.split("T")[0];
      if (days[cleanDate] !== undefined) {
        days[cleanDate] += s.amount;
      }
    });

    return last7Days.map((d) => ({
      name: d.dayName,
      ventas: days[d.dateStr],
    }));
  }, [sales, serviceIncomes]);

  const handleEdit = (item: any) => {
    setEditingSale(item);
    setShowForm(true);
  };

  const handleDelete = (item: any) => {
    if (confirm("¿Eliminar este ingreso?")) {
      if (item.type === "service") {
        deleteServiceIncome(item.id);
      } else {
        deleteSale(item.id);
      }
    }
  };

  const columns = [
    {
      key: "date",
      header: "Fecha",
      render: (item: any) => formatDate(item.date),
    },
    {
      key: "amount",
      header: "Monto",
      render: (item: any) => (
        <span className="font-semibold text-success">
          {formatCurrency(item.amount, settings.currencySymbol)}
        </span>
      ),
    },
    {
      key: "category",
      header: "Categoría/Servicio",
      render: (item: any) => (
        <span
          className={cn(
            "px-2 py-1 rounded-lg text-sm",
            item.type === "service"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              : "bg-primary/10 text-primary"
          )}
        >
          {item.type === "service" ? item.displayName : item.category}
        </span>
      ),
    },
    {
      key: "description",
      header: "Descripción",
      render: (item: any) => item.description || "-",
      className: "hidden sm:table-cell",
    },
  ];

  return (
    <div className=" space-y-4 pb-24">
      {/* Metrics */}
      <div className=" grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Ingresos por productos (últimos 7 días)"
          value={formatCurrency(weekTotalProducts, settings.currencySymbol)}
          icon={<ShoppingCart className="w-5 h-5" />}
          subtitle={`${weekSales.length} ventas`}
          variant="success"
        />
        <MetricCard
          title="Ingresos del mes (total)"
          value={formatCurrency(monthTotalAll, settings.currencySymbol)}
          icon={<Calendar className="w-5 h-5" />}
          subtitle={`Productos + Servicios`}
          variant="primary"
        />
        <MetricCard
          title="Ingresos por servicios (últimos 30 días)"
          value={formatCurrency(serviceStats, settings.currencySymbol)}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="default"
        />
      </div>

      {/* Chart */}
      <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
        <h3 className="font-semibold mb-4">
          Tendencia de Ingresos (Productos + Servicios)
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
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
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="hsl(var(--success))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--success))", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters and Export */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
          {[
            { key: "today", label: "Hoy" },
            { key: "week", label: "Semana" },
            { key: "month", label: "Mes" },
            { key: "all", label: "Todo" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as FilterPeriod)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                filter === f.key
                  ? "bg-primary text-primary-foreground shadow-material"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={filteredIncomes}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No hay ingresos registrados"
      />

      {/* Floating Button */}
      <FloatingButton
        onClick={() => {
          setEditingSale(null);
          setShowForm(true);
        }}
        label="Nuevo ingreso (producto)"
      />

      <ExportButtons
        data={useMemo<ExportData>(
          () => ({
            title: "Reporte de Ingresos",
            headers: ["Fecha", "Monto", "Categoría/Servicio", "Descripción"],
            rows: filteredIncomes.map((item) => [
              formatDate(item.date),
              item.amount,
              item.type === "service" ? item.displayName : item.category,
              item.description || "-",
            ]),
            summary: [
              { label: "Total de ingresos", value: filteredIncomes.length },
              {
                label: "Total monto",
                value: formatCurrency(totalFiltered, settings.currencySymbol),
              },
            ],
          }),
          [filteredIncomes, totalFiltered, settings.currencySymbol]
        )}
        filename="ventas_servicios"
        isPremium={isPremium}
      />

      {/* Form Modal */}
      {showForm && (
        <SaleForm
          onClose={() => {
            setShowForm(false);
            setEditingSale(null);
          }}
          editingSale={editingSale || undefined}
        />
      )}
    </div>
  );
};

export default Ventas;
