import React, { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Wallet,
  PiggyBank,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ExportButtons } from "@/components/ui/ExportButtons";
import { FinancialGoal, formatCurrency } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { ExportData } from "@/lib/exportUtils";

const goalCategories = [
  { value: "ventas", label: "Ventas", icon: TrendingUp, color: "text-success" },
  { value: "ahorro", label: "Ahorro", icon: PiggyBank, color: "text-primary" },
  {
    value: "reduccion_gastos",
    label: "Reducir gastos",
    icon: Wallet,
    color: "text-warning",
  },
  {
    value: "otro",
    label: "Otro",
    icon: MoreHorizontal,
    color: "text-muted-foreground",
  },
];

export const Metas: React.FC = () => {
  const { data, addGoal, updateGoal, deleteGoal } = useApp();
  const { goals, sales, settings } = data;
  const isPremium = settings.isPremium || false;

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    deadline: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
    category: "ventas" as FinancialGoal["category"],
  });

  // Auto-calculate sales goals
  const goalsWithProgress = useMemo(() => {
    return goals.map((goal) => {
      let currentAmount = goal.currentAmount;

      // Auto-update sales goals based on actual sales
      if (goal.category === "ventas") {
        const goalMonth = goal.deadline.substring(0, 7);
        const monthSales = sales
          .filter((s) => s.date.startsWith(goalMonth))
          .reduce((sum, s) => sum + s.amount, 0);
        currentAmount = monthSales;
      }

      const progress =
        goal.targetAmount > 0
          ? Math.min(100, (currentAmount / goal.targetAmount) * 100)
          : 0;

      return { ...goal, currentAmount, progress };
    });
  }, [goals, sales]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const goalData = {
      title: formData.title,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      deadline: formData.deadline,
      category: formData.category,
    };

    if (editingGoal) {
      updateGoal(editingGoal.id, goalData);
    } else {
      addGoal(goalData);
    }

    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingGoal(null);
    setFormData({
      title: "",
      targetAmount: "",
      currentAmount: "",
      deadline: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        .toISOString()
        .split("T")[0],
      category: "ventas",
    });
  };

  const handleEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline,
      category: goal.category,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar esta meta?")) {
      deleteGoal(id);
    }
  };

  const handleUpdateProgress = (goalId: string, newAmount: number) => {
    updateGoal(goalId, { currentAmount: newAmount });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-info/10 to-info/5 rounded-2xl p-4 sm:p-6 border border-info/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info/10 rounded-xl">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-info" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">
                Metas Financieras
              </h2>
              <p className="text-sm text-muted-foreground">
                {goalsWithProgress.filter((g) => g.progress >= 100).length}{" "}
                completadas de {goals.length}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <ExportButtons
              data={useMemo<ExportData>(
                () => ({
                  title: "Reporte de Metas Financieras",
                  headers: [
                    "Título",
                    "Categoría",
                    "Meta",
                    "Actual",
                    "Progreso %",
                    "Fecha Límite",
                    "Estado",
                  ],
                  rows: goalsWithProgress.map((goal) => {
                    const catInfo = goalCategories.find(
                      (c) => c.value === goal.category
                    );
                    const isComplete = goal.progress >= 100;
                    return [
                      goal.title,
                      catInfo?.label || goal.category,
                      goal.targetAmount,
                      goal.currentAmount,
                      `${goal.progress.toFixed(0)}%`,
                      new Date(goal.deadline).toLocaleDateString("es-ES"),
                      isComplete ? "Completada" : "En progreso",
                    ];
                  }),
                  summary: [
                    { label: "Total metas", value: goals.length },
                    {
                      label: "Metas completadas",
                      value: goalsWithProgress.filter((g) => g.progress >= 100)
                        .length,
                    },
                    {
                      label: "Metas en progreso",
                      value: goalsWithProgress.filter((g) => g.progress < 100)
                        .length,
                    },
                  ],
                }),
                [goalsWithProgress, goals.length]
              )}
              filename="metas"
              isPremium={isPremium}
            />
            <Button
              onClick={() => setShowForm(true)}
              className="gradient-primary"
            >
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Nueva Meta</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={resetForm}
          />
          <div className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl shadow-material-xl max-h-[90vh] overflow-auto">
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-muted" />
            </div>

            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">
                {editingGoal ? "Editar Meta" : "Nueva Meta"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <div className="grid grid-cols-2 gap-2">
                  {goalCategories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          category: cat.value as FinancialGoal["category"],
                        }))
                      }
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border-2 transition-all",
                        formData.category === cat.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <cat.icon className={cn("w-4 h-4", cat.color)} />
                      <span className="text-sm">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  placeholder="Ej: Meta de ventas de diciembre"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Meta ({settings.currencySymbol})</Label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={formData.targetAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        targetAmount: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                {formData.category !== "ventas" && (
                  <div className="space-y-2">
                    <Label>Actual ({settings.currencySymbol})</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.currentAmount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          currentAmount: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Fecha límite</Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deadline: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {formData.category === "ventas" && (
                <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                  Las metas de ventas se actualizan automáticamente con tus
                  ventas registradas.
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={resetForm}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 gradient-primary">
                  {editingGoal ? "Guardar" : "Crear"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals List */}
      {goalsWithProgress.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goalsWithProgress.map((goal) => {
            const catInfo = goalCategories.find(
              (c) => c.value === goal.category
            );
            const Icon = catInfo?.icon || Target;
            const isComplete = goal.progress >= 100;
            const daysLeft = Math.ceil(
              (new Date(goal.deadline).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={goal.id}
                className={cn(
                  "bg-card rounded-2xl p-4 sm:p-5 shadow-soft border transition-all",
                  isComplete
                    ? "border-success/50 bg-success/5"
                    : "border-border"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-xl",
                        isComplete ? "bg-success/20" : "bg-muted"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          isComplete ? "text-success" : catInfo?.color
                        )}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">{goal.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {daysLeft > 0
                          ? `${daysLeft} días restantes`
                          : daysLeft === 0
                          ? "Vence hoy"
                          : "Vencida"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8"
                      onClick={() => handleEdit(goal)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(goal.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progreso</span>
                    <span
                      className={cn(
                        "font-semibold",
                        isComplete && "text-success"
                      )}
                    >
                      {goal.progress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={goal.progress} className="h-3" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {formatCurrency(
                        goal.currentAmount,
                        settings.currencySymbol
                      )}
                    </span>
                    <span className="text-muted-foreground">
                      de{" "}
                      {formatCurrency(
                        goal.targetAmount,
                        settings.currencySymbol
                      )}
                    </span>
                  </div>
                </div>

                {goal.category !== "ventas" && !isComplete && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Nuevo valor"
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const value = parseFloat(
                              (e.target as HTMLInputElement).value
                            );
                            if (!isNaN(value)) {
                              handleUpdateProgress(goal.id, value);
                              (e.target as HTMLInputElement).value = "";
                            }
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          const input = (
                            e.target as HTMLElement
                          ).parentElement?.querySelector("input");
                          const value = parseFloat(input?.value || "0");
                          if (!isNaN(value)) {
                            handleUpdateProgress(goal.id, value);
                            if (input) input.value = "";
                          }
                        }}
                      >
                        Actualizar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No hay metas definidas</p>
          <Button
            variant="link"
            onClick={() => setShowForm(true)}
            className="mt-2"
          >
            Crear la primera
          </Button>
        </div>
      )}
    </div>
  );
};

export default Metas;
