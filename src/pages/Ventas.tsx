import React, { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { DataTable } from "@/components/ui/DataTable";
import { SaleForm } from "@/components/forms/SaleForm";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency, getWeekSales, getMonthSales } from "@/lib/storage";
import { ShoppingCart, Calendar, TrendingUp } from "lucide-react";
import { Sale } from "@/lib/storage";
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
  const { data, deleteSale } = useApp();
  const { sales, serviceIncomes, services, settings } = data;
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [filter, setFilter] = useState<FilterPeriod>("week");

  // Filter sales
  const filteredSales = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    switch (filter) {
      case "today":
        return sales.filter((s) => s.date === today);
      case "week":
        return sales.filter((s) => new Date(s.date) >= weekAgo);
      case "month":
        return sales.filter((s) => new Date(s.date) >= monthAgo);
      default:
        return sales;
    }
  }, [sales, filter]);

  // Metrics
  const weekSales = useMemo(() => getWeekSales(sales), [sales]);
  const monthSales = useMemo(() => getMonthSales(sales), [sales]);

  const totalFiltered = filteredSales.reduce((sum, s) => sum + s.amount, 0);
  const weekTotal = weekSales.reduce((sum, s) => sum + s.amount, 0);
  const monthTotal = monthSales.reduce((sum, s) => sum + s.amount, 0);
  const avgSale =
    filteredSales.length > 0 ? totalFiltered / filteredSales.length : 0;

  // Chart data
  const chartData = useMemo(() => {
    const days: { [key: string]: number } = {};
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = date.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
      });
      days[dateStr] = 0;
      last7Days.push({ dateStr, dayName });
    }

    sales.forEach((s) => {
      if (days[s.date] !== undefined) {
        days[s.date] += s.amount;
      }
    });

    return last7Days.map((d) => ({
      name: d.dayName,
      ventas: days[d.dateStr],
    }));
  }, [sales]);

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setShowForm(true);
  };

  const handleDelete = (sale: Sale) => {
    if (confirm("¿Eliminar esta venta?")) {
      deleteSale(sale.id);
    }
  };

  const columns = [
    {
      key: "date",
      header: "Fecha",
      render: (sale: Sale) => new Date(sale.date).toLocaleDateString("es-ES"),
    },
    {
      key: "amount",
      header: "Monto",
      render: (sale: Sale) => (
        <span className="font-semibold text-success">
          {formatCurrency(sale.amount, settings.currencySymbol)}
        </span>
      ),
    },
    {
      key: "category",
      header: "Categoría",
      render: (sale: Sale) => (
        <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-sm">
          {sale.category}
        </span>
      ),
    },
    {
      key: "description",
      header: "Descripción",
      render: (sale: Sale) => sale.description || "-",
      className: "hidden sm:table-cell",
    },
  ];

  const serviceColumns = [
    {
      key: "date",
      header: "Fecha",
      render: (r: any) => new Date(r.date).toLocaleDateString("es-ES"),
    },
    {
      key: "amount",
      header: "Monto",
      render: (r: any) => (
        <span className="font-semibold text-success">
          {formatCurrency(r.amount, settings.currencySymbol)}
        </span>
      ),
    },
    {
      key: "service",
      header: "Servicio",
      render: (r: any) => services.find(s => s.id === r.serviceId)?.name || "-",
    },
    {
      key: "description",
      header: "Descripción",
      render: (r: any) => r.description || "-",
      className: "hidden sm:table-cell",
    },
  ];

  return (
    <div className=" space-y-4 pb-24">
      {/* Metrics */}
      <div className=" grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Ingresos por productos (últimos 7 días)"
          value={formatCurrency(weekTotal, settings.currencySymbol)}
          icon={<ShoppingCart className="w-5 h-5" />}
          subtitle={`${weekSales.length} ventas`}
          variant="success"
        />
        <MetricCard
          title="Ingresos del mes (total)"
          value={formatCurrency(monthTotal + (() => { const ma = new Date(); ma.setMonth(ma.getMonth() - 1); return serviceIncomes.filter(si => new Date(si.date) >= ma).reduce((sum, si) => sum + si.amount, 0); })(), settings.currencySymbol)}
          icon={<Calendar className="w-5 h-5" />}
          subtitle={`Productos + Servicios`}
          variant="primary"
        />
        <MetricCard
          title="Ingresos por servicios (últimos 30 días)"
          value={formatCurrency((() => { const ma = new Date(); ma.setMonth(ma.getMonth() - 1); return serviceIncomes.filter(si => new Date(si.date) >= ma).reduce((sum, si) => sum + si.amount, 0); })(), settings.currencySymbol)}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="default"
        />
      </div>

      {/* Chart */}
      <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
        <h3 className="font-semibold mb-4">Tendencia de Ingresos</h3>
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

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
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

      {/* Table */}
      <DataTable
        data={filteredSales.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No hay ingresos por productos"
      />

      <div className="mt-6">
        <h3 className="font-semibold mb-3">Ingresos por servicios</h3>
        <DataTable
          data={serviceIncomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
          columns={serviceColumns}
          onEdit={undefined}
          onDelete={undefined}
          emptyMessage="No hay ingresos por servicios"
        />
      </div>

      {/* Floating Button */}
      <FloatingButton
        onClick={() => {
          setEditingSale(null);
          setShowForm(true);
        }}
        label="Nuevo ingreso (producto)"
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
