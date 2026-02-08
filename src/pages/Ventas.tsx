import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { DataTable } from "@/components/ui/DataTable";
import { SaleForm } from "@/components/forms/SaleForm";
import { ServiceIncomeForm } from "@/components/forms/ServiceIncomeForm";
import { MetricCard } from "@/components/ui/MetricCard";
import { ExportButtons } from "@/components/ui/ExportButtons";
import {
  formatCurrency,
  getWeekSales,
  getMonthSales,
  Sale,
  ServiceIncome,
} from "@/lib/storage";
import { ShoppingCart, Calendar, TrendingUp } from "lucide-react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENT_PERMISSIONS } from "@/components/layout/AppLayout";

type FilterPeriod = "today" | "week" | "month" | "all";
type SaleOrServiceIncome = (Sale | ServiceIncome) & {
  type?: string;
  displayName?: string;
};

export const Ventas: React.FC = () => {
  const navigate = useNavigate();
  const {
    data,
    deleteSale,
    deleteServiceIncome,
    addServiceIncome,
    addExpense,
    supabaseAuth,
    currentProject,
    currentProjectMember,
  } = useApp();
  const { sales, serviceIncomes, services, settings, products } = data;
  const queryClient = useQueryClient();
  const isPremium = settings.isPremium || false;
  const [showForm, setShowForm] = useState(false);
  const [showServiceIncomeForm, setShowServiceIncomeForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [filter, setFilter] = useState<FilterPeriod>("week");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "product" | "service">(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState("");

  const inProjectVentasMode =
    !!currentProject &&
    !!supabaseAuth.user &&
    currentProjectMember?.departament === "ventas";

  const {
    data: projectData,
    isLoading: loadingProject,
    error: projectError,
  } = useQuery({
    queryKey: ["project-data-sales", currentProject?.id],
    enabled: inProjectVentasMode && !!currentProject?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id,data")
        .eq("id", currentProject?.id)
        .single();
      if (error) throw error;
      return (data?.data || {}) as { sales?: Sale[] };
    },
  });

  const projectSales = useMemo(
    () => (projectData?.sales || []) as Sale[],
    [projectData],
  );

  const projectSalesMutation = useMutation({
    mutationFn: async (newSales: Sale[]) => {
      if (!currentProject?.id) return;
      const { error } = await supabase
        .from("projects")
        .update({
          data: {
            ...(projectData || {}),
            sales: newSales,
          },
        })
        .eq("id", currentProject.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-data-sales", currentProject?.id],
      });
    },
  });

  const [projectSaleForm, setProjectSaleForm] = useState({
    date: new Date().toLocaleDateString("en-CA"),
    amount: "",
    category: "Ventas",
    description: "",
  });

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
      today.getTime() - today.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .split("T")[0];

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    monthAgo.setHours(0, 0, 0, 0);

    const sourceSales = inProjectVentasMode ? projectSales : sales;

    const productSales = sourceSales.map((s) => ({
      ...s,
      type: "product" as const,
      displayCategory: s.category,
      displayName: s.description || "Venta de producto",
    }));

    const serviceSales = inProjectVentasMode
      ? []
      : serviceIncomes.map((s) => {
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

    let result = [...productSales, ...serviceSales];

    // Date filtering
    if (startDate && endDate) {
      const from = new Date(startDate);
      const to = new Date(endDate);
      result = result.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= from && itemDate <= to;
      });
    } else {
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
      result = result.filter((item) => checkDate(item.date));
    }

    // Amount filtering
    if (minAmount) {
      result = result.filter((item) => item.amount >= parseFloat(minAmount));
    }
    if (maxAmount) {
      result = result.filter((item) => item.amount <= parseFloat(maxAmount));
    }

    // Type filtering
    if (typeFilter !== "all") {
      result = result.filter((item) => item.type === typeFilter);
    }

    // Category/Search filtering
    if (categoryFilter) {
      const term = categoryFilter.toLowerCase();
      result = result.filter(
        (item) =>
          item.category?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.displayName?.toLowerCase().includes(term),
      );
    }

    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [
    sales,
    serviceIncomes,
    services,
    filter,
    inProjectVentasMode,
    projectSales,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    typeFilter,
    categoryFilter,
  ]);

  // Metrics
  const weekSales = useMemo(
    () => getWeekSales(inProjectVentasMode ? projectSales : sales),
    [sales, projectSales, inProjectVentasMode],
  );

  // Calculate totals based on filtered unified list
  const totalFiltered = filteredIncomes.reduce((sum, s) => sum + s.amount, 0);

  const weekProductsGross = weekSales.reduce((sum, s) => sum + s.amount, 0);
  const weekProductsNet = weekSales.reduce((sum, s) => {
    if (s.productId) {
      const product = products.find((p) => p.id === s.productId);
      const qty = s.quantity || 1;
      const cost = product ? (product.cost || 0) * qty : 0;
      return sum + (s.amount - cost);
    }
    // Manual sales considered full net
    return sum + s.amount;
  }, 0);

  // Calculate service totals for cards (gross and net for last 30 days)
  const { serviceGross30, serviceNet30 } = useMemo(() => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    monthAgo.setHours(0, 0, 0, 0);

    const incomes = serviceIncomes.filter((si) => {
      const cleanDate = si.date.split("T")[0];
      return new Date(cleanDate + "T12:00:00") >= monthAgo;
    });

    const gross = incomes.reduce((sum, si) => sum + (si.amount || 0), 0);
    const net = incomes.reduce((sum, si) => sum + (si.amount || 0), 0);
    return { serviceGross30: gross, serviceNet30: net };
  }, [serviceIncomes]);

  const monthTotalAll = useMemo(() => {
    // Recalculate correctly for current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const sourceSales = inProjectVentasMode ? projectSales : sales;

    const prodSum = sourceSales
      .filter((s) => {
        const cleanDate = s.date.split("T")[0];
        const d = new Date(cleanDate + "T12:00:00");
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, s) => sum + s.amount, 0);

    const svcSum = inProjectVentasMode
      ? 0
      : serviceIncomes
          .filter((s) => {
            const cleanDate = s.date.split("T")[0];
            const d = new Date(cleanDate + "T12:00:00");
            return (
              d.getMonth() === currentMonth && d.getFullYear() === currentYear
            );
          })
          .reduce((sum, s) => sum + s.amount, 0);

    return prodSum + svcSum;
  }, [sales, serviceIncomes, projectSales, inProjectVentasMode]);

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
    permissions.includes("/ingresos");

  // Chart data
  const chartData = useMemo(() => {
    const days: { [key: string]: number } = {};
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      // Use local date string generation
      const dateStr = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000,
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
    const sourceSales = inProjectVentasMode ? projectSales : sales;

    sourceSales.forEach((s) => {
      const cleanDate = s.date.split("T")[0];
      if (days[cleanDate] !== undefined) {
        days[cleanDate] += s.amount;
      }
    });

    // Add services
    if (!inProjectVentasMode) {
      serviceIncomes.forEach((s) => {
        const cleanDate = s.date.split("T")[0];
        if (days[cleanDate] !== undefined) {
          days[cleanDate] += s.amount;
        }
      });
    }

    return last7Days.map((d) => ({
      name: d.dayName,
      ventas: days[d.dateStr],
    }));
  }, [sales, serviceIncomes, projectSales, inProjectVentasMode]);

  const handleEdit = (item: SaleOrServiceIncome) => {
    if (item.type === "service") {
      // For service income, we can't edit inline yet, so show the detail page
      navigate(`/ingresos/${item.id}`);
    } else {
      setEditingSale(item as Sale);
      setShowForm(true);
    }
  };

  const handleView = (item: SaleOrServiceIncome) => {
    navigate(`/ingresos/${item.id}`);
  };

  const handleDelete = (item: SaleOrServiceIncome) => {
    if (inProjectVentasMode) return;
    if (confirm("¿Eliminar este ingreso?")) {
      if (item.type === "service") {
        deleteServiceIncome(item.id);
      } else {
        deleteSale(item.id);
      }
    }
  };

  const handleSaveServiceIncome = (
    income: Omit<import("@/lib/storage").ServiceIncome, "id">,
  ) => {
    addServiceIncome(income);
    setShowServiceIncomeForm(false);
  };

  const columns = [
    {
      key: "date",
      header: "Fecha",
      render: (item: SaleOrServiceIncome) => formatDate(item.date),
    },
    {
      key: "amount",
      header: "Monto",
      render: (item: SaleOrServiceIncome) => (
        <span className="font-semibold text-success">
          {formatCurrency(item.amount, settings.currencySymbol)}
        </span>
      ),
    },
    {
      key: "category",
      header: "Categoría/Servicio",
      render: (item: SaleOrServiceIncome) => (
        <span
          className={cn(
            "px-2 py-1 rounded-lg text-sm",
            item.type === "service"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              : "bg-primary/10 text-primary",
          )}
        >
          {item.type === "service" ? item.displayName : (item as Sale).category}
        </span>
      ),
    },
    {
      key: "description",
      header: "Descripción",
      render: (item: SaleOrServiceIncome) => item.description || "-",
      className: "hidden sm:table-cell",
    },
  ];

  const handleProjectSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDate = projectSaleForm.date.split("T")[0];
    const amount = parseFloat(projectSaleForm.amount);
    if (!amount || !cleanDate) return;
    const newSale: Sale = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: cleanDate,
      amount,
      category: projectSaleForm.category,
      description: projectSaleForm.description || undefined,
    };
    const newSales = [newSale, ...projectSales];
    projectSalesMutation.mutate(newSales);
    setProjectSaleForm({
      date: new Date().toLocaleDateString("en-CA"),
      amount: "",
      category: "Ventas",
      description: "",
    });
  };

  return (
    <div className=" space-y-4 pb-24">
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
      {inProjectVentasMode && (
        <div className="mb-4 rounded-xl border border-border p-3 bg-muted/40 text-sm">
          <div className="font-medium">
            Modo proyecto: {currentProject?.name} (Ventas)
          </div>
          {loadingProject && <div>Cargando datos del proyecto...</div>}
          {projectError && (
            <div className="text-red-600">
              Error al cargar datos del proyecto.
            </div>
          )}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <MetricCard
          title="Ingresos por productos (últimos 7 días)"
          value={formatCurrency(weekProductsGross, settings.currencySymbol)}
          icon={<ShoppingCart className="w-5 h-5" />}
          subtitle={`${weekSales.length} ventas · Neto: ${formatCurrency(weekProductsNet, settings.currencySymbol)}`}
          variant="success"
        />
        <MetricCard
          title="Ingresos por servicios (últimos 30 días)"
          value={formatCurrency(serviceGross30, settings.currencySymbol)}
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle={`Neto: ${formatCurrency(serviceNet30, settings.currencySymbol)}`}
          variant="default"
        />
        <MetricCard
          title="Ingresos del mes (total)"
          value={formatCurrency(monthTotalAll, settings.currencySymbol)}
          icon={<Calendar className="w-5 h-5" />}
          subtitle={`Productos + Servicios`}
          variant="primary"
        />
      </div>

      {/* Chart */}
      <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-soft border border-border">
        <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
          Tendencia de Ingresos (Productos + Servicios)
        </h3>
        <div className="h-56 sm:h-64">
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
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between overflow-hidden">
        <div className="w-full sm:flex-1 flex gap-2 overflow-x-auto pb-2">
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
                "px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all",
                filter === f.key
                  ? "bg-primary text-primary-foreground shadow-material"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
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
        onEdit={inProjectVentasMode ? undefined : handleEdit}
        onView={inProjectVentasMode ? undefined : handleView}
        onDelete={inProjectVentasMode ? undefined : handleDelete}
        emptyMessage="No hay ingresos registrados"
      />

      {!inProjectVentasMode && (
        <div className="fixed bottom-8 right-6 flex flex-col gap-3">
          <FloatingButton
            onClick={() => {
              setEditingSale(null);
              setShowForm(true);
            }}
            label="Nuevo ingreso "
          />
        </div>
      )}

      {inProjectVentasMode && (
        <div className="mt-4 bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4">
          <h3 className="font-semibold text-base">
            Nuevo ingreso para {currentProject?.name}
          </h3>
          <form
            onSubmit={handleProjectSaleSubmit}
            className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="space-y-1 sm:col-span-1">
              <Label className="text-xs sm:text-sm">Fecha</Label>
              <Input
                type="date"
                value={projectSaleForm.date}
                onChange={(e) =>
                  setProjectSaleForm((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
                className="text-xs sm:text-sm py-1 sm:py-2"
                required
              />
            </div>
            <div className="space-y-1 sm:col-span-1">
              <Label className="text-xs sm:text-sm">Monto</Label>
              <Input
                type="number"
                step="0.01"
                value={projectSaleForm.amount}
                onChange={(e) =>
                  setProjectSaleForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                className="text-xs sm:text-sm py-1 sm:py-2"
                required
              />
            </div>
            <div className="space-y-1 sm:col-span-1">
              <Label className="text-xs sm:text-sm">Categoría</Label>
              <Input
                value={projectSaleForm.category}
                onChange={(e) =>
                  setProjectSaleForm((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="text-xs sm:text-sm py-1 sm:py-2"
              />
            </div>
            <div className="space-y-1 sm:col-span-1">
              <Label className="text-xs sm:text-sm">Descripción</Label>
              <Input
                value={projectSaleForm.description}
                onChange={(e) =>
                  setProjectSaleForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="text-xs sm:text-sm py-1 sm:py-2"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1 flex justify-start sm:justify-end">
              <Button
                type="submit"
                disabled={
                  projectSalesMutation.isPending || !projectSaleForm.amount
                }
                className="w-full sm:w-auto"
                size="sm"
              >
                Registrar ingreso
              </Button>
            </div>
          </form>
        </div>
      )}

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
          [filteredIncomes, totalFiltered, settings.currencySymbol],
        )}
        filename="ventas_servicios"
        isPremium={isPremium}
      />

      {/* Form Modals */}
      {showForm && (
        <SaleForm
          onClose={() => {
            setShowForm(false);
            setEditingSale(null);
          }}
          editingSale={editingSale || undefined}
        />
      )}

      {showServiceIncomeForm && (
        <ServiceIncomeForm
          services={services}
          onSubmit={handleSaveServiceIncome}
          onCancel={() => setShowServiceIncomeForm(false)}
          isOpen={showServiceIncomeForm}
          currencySymbol={settings.currencySymbol}
        />
      )}
    </div>
  );
};

export default Ventas;
