import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import { DEPARTMENT_PERMISSIONS } from "@/components/layout/AppLayout";

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
  const navigate = useNavigate();
  const { data, deleteExpense, currentProject, currentProjectMember } =
    useApp();
  const { expenses, settings } = data;
  const isPremium = settings.isPremium || false;
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filter, setFilter] = useState<FilterPeriod>("week");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredExpenses = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    let result = expenses;

    switch (filter) {
      case "today":
        result = result.filter((e) => e.date === today);
        break;
      case "week":
        result = result.filter((e) => new Date(e.date) >= weekAgo);
        break;
      case "month":
        result = result.filter((e) => new Date(e.date) >= monthAgo);
        break;
    }

    if (departmentFilter) {
      const term = departmentFilter.toLowerCase();
      result = result.filter((e) => {
        const desc = e.description?.toLowerCase() || "";
        return desc.startsWith(term + ":") || desc.includes(term);
      });
    }

    const min = minAmount ? Number(minAmount) : undefined;
    const max = maxAmount ? Number(maxAmount) : undefined;

    if (min !== undefined) {
      result = result.filter((e) => e.amount >= min);
    }
    if (max !== undefined) {
      result = result.filter((e) => e.amount <= max);
    }

    if (startDate) {
      const from = new Date(startDate);
      result = result.filter((e) => new Date(e.date) >= from);
    }
    if (endDate) {
      const to = new Date(endDate);
      result = result.filter((e) => new Date(e.date) <= to);
    }

    return result;
  }, [
    expenses,
    filter,
    departmentFilter,
    minAmount,
    maxAmount,
    startDate,
    endDate,
  ]);

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

  const handleView = (expense: Expense) => {
    navigate(`/gastos/${expense.id}`);
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
    permissions.includes("/gastos");

  return (
    <div className="space-y-6 pb-24">
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
            Modo proyecto: {currentProject?.name} (Gastos)
          </div>
        </div>
      )}
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
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {isProjectSelected && (
          <div className="space-y-1">
            <Label>Departamento</Label>
            <Input
              placeholder="Ej. Dirección, Ventas..."
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            />
          </div>
        )}
        <div className="space-y-1">
          <Label>Fecha desde</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Fecha hasta</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Rango de monto</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Mín."
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Máx."
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={filteredExpenses.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )}
        columns={columns}
        onEdit={handleEdit}
        onView={handleView}
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
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
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
          ],
        )}
        filename="gastos"
        isPremium={isPremium}
      />
      {/* Form Modal */}
      {showForm && !editingExpense && (
        <ExpenseForm
          onClose={() => {
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
};

export default Gastos;
