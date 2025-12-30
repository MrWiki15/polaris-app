import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagSelector } from "@/components/forms/TagSelector";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";

interface ExpenseFormProps {
  onClose: () => void;
  editingExpense?: {
    id: string;
    date: string;
    amount: number;
    category: string;
    description?: string;
    tags?: string[];
    isRecurring: boolean | string;
    recurringId: string;
    recurringTime: "diario" | "semanal" | "mensual" | "anual";
  };
}

const categories = [
  "Compras",
  "Transporte",
  "Servicios",
  "Salarios",
  "Alquiler",
  "Suministros",
  "Otros",
];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onClose,
  editingExpense,
}) => {
  const { addExpense, updateExpense, addRecurringPayment, data } = useApp();
  const { settings, clients } = data;
  const isPremium = settings.isPremium || false;

  const [formData, setFormData] = useState({
    date: editingExpense?.date || new Date().toISOString().split("T")[0],
    amount: editingExpense?.amount?.toString() || "",
    category: editingExpense?.category || categories[0],
    description: editingExpense?.description || "",
    tags: editingExpense?.tags || [],
    isRecurring: editingExpense?.isRecurring || false,
    recurringId: editingExpense?.recurringId || "",
    recurringTime: "menusal",
    clientId: (editingExpense as any)?.clientId || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const expenseData = {
      date: formData.date,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      isRecurring: formData.isRecurring || false,
      recurringId: formData.recurringId || "",
      clientId: formData.clientId || undefined,
    };

    const newReccurring = {
      name: formData.description || "",
      amount: parseFloat(formData.amount) || 0,
      category: formData.category || "",
      frequency: formData.recurringTime || "diaria",
      isActive: true,
      createdAt: formData.date || "",
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData);
    } else {
      addExpense(expenseData);
      addRecurringPayment(newReccurring);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl shadow-material-xl",
          "animate-slide-in-up sm:animate-scale-in",
          "max-h-[90vh] overflow-auto"
        )}
      >
        {/* Handle bar for mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-muted" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {editingExpense ? "Editar Gasto" : "Nuevo Gasto"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              required
              className="text-lg font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, category: cat }))
                  }
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    formData.category === cat
                      ? "bg-destructive text-destructive-foreground shadow-material"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <TagSelector
            selectedTags={formData.tags}
            onTagsChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
          />

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              placeholder="Añadir nota..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Checkbox
              about="example"
              className="mr-4 mt-2"
              onCheckedChange={(e) => {
                const x = e.valueOf();
                setFormData((prev) => ({
                  ...prev,
                  isRecurring: x,
                }));
              }}
            />
            <Label htmlFor="description">Es recurrente ?</Label>
          </div>

          {formData.isRecurring && (
            <div className="space-y-2 flex flex-col justify-start items-start">
              <Label className="my-2" htmlFor="description">
                Tipo de recurrencia: {formData.recurringTime}
              </Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      recurringTime: "diario",
                    }))
                  }
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  Diaria
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      recurringTime: "semanal",
                    }))
                  }
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  Semanal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      recurringTime: "mensual",
                    }))
                  }
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  Mensual
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, recurringTime: "anual" }))
                  }
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  Anual
                </button>
              </div>
            </div>
          )}

          {isPremium && (
            <div className="space-y-2">
              <Label htmlFor="client">Cliente (opcional)</Label>
              <select
                id="client"
                value={formData.clientId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, clientId: e.target.value }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">Sin cliente</option>
                {clients
                  .filter((c) => c.type === "cliente")
                  .map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-destructive hover:bg-destructive/90"
              disabled={!formData.amount}
            >
              {editingExpense ? "Guardar" : "Registrar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
