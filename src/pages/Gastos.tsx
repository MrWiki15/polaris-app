import React, { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { DataTable } from "@/components/ui/DataTable";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { MetricCard } from "@/components/ui/MetricCard";
import { ExportButtons } from "@/components/ui/ExportButtons";
import { formatCurrency } from "@/lib/storage";
import { Receipt, Calendar, PieChart } from "lucide-react";
import { Expense } from "@/lib/storage";
import { ExportData } from "@/lib/exportUtils";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

type FilterPeriod = "today" | "week" | "month" | "all";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(262 83% 58%)",
  "hsl(199 89% 48%)",
];

export const Gastos: React.FC = () => {
  const { data, deleteExpense } = useApp();
  const { expenses, settings } = data;
  const isPremium = settings.isPremium || false;
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filter, setFilter] = useState<FilterPeriod>("week");

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    switch (filter) {
      case "today":
        return expenses.filter((e) => e.date === today);
      case "week":
        return expenses.filter((e) => new Date(e.date) >= weekAgo);
      case "month":
        return expenses.filter((e) => new Date(e.date) >= monthAgo);
      default:
        return expenses;
    }
  }, [expenses, filter]);

  // Metrics
  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const weekExpenses = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return expenses.filter((e) => new Date(e.date) >= weekAgo);
  }, [expenses]);

  const monthExpenses = useMemo(() => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return expenses.filter((e) => new Date(e.date) >= monthAgo);
  }, [expenses]);

  const weekTotal = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown for pie chart
  const categoryData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    filteredExpenses.forEach((e) => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [filteredExpenses]);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = (expense: Expense) => {
    if (confirm("¿Eliminar este gasto?")) {
      deleteExpense(expense.id);
    }
  };

  const columns = [
    {
      key: "date",
      header: "Fecha",
      render: (expense: Expense) =>
        new Date(expense.date).toLocaleDateString("es-ES"),
    },
    {
      key: "amount",
      header: "Monto",
      render: (expense: Expense) => (
        <span className="font-semibold text-destructive">
          -{formatCurrency(expense.amount, settings.currencySymbol)}
        </span>
      ),
    },
    {
      key: "category",
      header: "Categoría",
      render: (expense: Expense) => (
        <span className="px-2 py-1 bg-destructive/10 text-destructive rounded-lg text-sm">
          {expense.category}
        </span>
      ),
    },
    {
      key: "description",
      header: "Descripción",
      render: (expense: Expense) => expense.description || "-",
      className: "hidden sm:table-cell",
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Gastos esta semana"
          value={formatCurrency(weekTotal, settings.currencySymbol)}
          icon={<Receipt className="w-5 h-5" />}
          subtitle={`${weekExpenses.length} transacciones`}
          variant="destructive"
        />
        <MetricCard
          title="Gastos del mes"
          value={formatCurrency(monthTotal, settings.currencySymbol)}
          icon={<Calendar className="w-5 h-5" />}
          subtitle={`${monthExpenses.length} transacciones`}
          variant="warning"
        />
        <MetricCard
          title="Total período"
          value={formatCurrency(totalFiltered, settings.currencySymbol)}
          icon={<PieChart className="w-5 h-5" />}
          subtitle={`${filteredExpenses.length} gastos`}
          variant="default"
        />
      </div>

      {/* Chart */}
      {categoryData.length > 0 && (
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
          <h3 className="font-semibold mb-4">Gastos por Categoría</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {categoryData.map((_, index) => (
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
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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
                  ? "bg-destructive text-destructive-foreground shadow-material"
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
        data={filteredExpenses.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No hay gastos registrados"
      />

      {/* Floating Button */}
      <FloatingButton
        onClick={() => {
          setEditingExpense(null);
          setShowForm(true);
        }}
        label="Nuevo Gasto"
        className="gradient-destructive"
      />

      <ExportButtons
        data={useMemo<ExportData>(
          () => ({
            title: "Reporte de Gastos",
            headers: ["Fecha", "Monto", "Categoría", "Descripción"],
            rows: filteredExpenses
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((expense) => [
                new Date(expense.date).toLocaleDateString("es-ES"),
                expense.amount,
                expense.category,
                expense.description || "-",
              ]),
            summary: [
              { label: "Total de gastos", value: filteredExpenses.length },
              {
                label: "Total monto",
                value: formatCurrency(totalFiltered, settings.currencySymbol),
              },
              {
                label: "Gastos esta semana",
                value: formatCurrency(weekTotal, settings.currencySymbol),
              },
              {
                label: "Gastos del mes",
                value: formatCurrency(monthTotal, settings.currencySymbol),
              },
            ],
          }),
          [
            filteredExpenses,
            totalFiltered,
            weekTotal,
            monthTotal,
            settings.currencySymbol,
          ]
        )}
        filename="gastos"
        isPremium={isPremium}
      />

      {/* Form Modal */}
      {showForm && (
        <ExpenseForm
          onClose={() => {
            setShowForm(false);
            setEditingExpense(null);
          }}
          editingExpense={editingExpense || undefined}
        />
      )}
    </div>
  );
};

export default Gastos;
