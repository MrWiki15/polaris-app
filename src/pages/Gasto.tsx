import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/storage";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  Repeat,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Gasto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data } = useApp();
  const { expenses, settings, clients } = data;

  const expense = expenses.find((e) => e.id === id);

  if (!expense) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Gasto no encontrado</h1>
          <Button onClick={() => navigate("/gastos")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a gastos
          </Button>
        </div>
      </div>
    );
  }

  const client = expense.clientId
    ? clients.find((c) => c.id === expense.clientId)
    : null;

  const isRecurring =
    typeof expense.isRecurring === "string"
      ? expense.isRecurring === "true"
      : expense.isRecurring;

  return (
    <div className="p-4 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/gastos")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold">Detalles del Gasto</h1>
        <div className="w-12" />
      </div>

      {/* Main Info Card */}
      <Card className="p-6 space-y-6">
        {/* Monto principal */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Monto</span>
          </div>
          <div className="text-4xl font-bold text-destructive">
            {formatCurrency(expense.amount, settings.currencySymbol)}
          </div>
        </div>

        {/* Grid de información */}
        <div className="grid grid-cols-2 gap-4">
          {/* Fecha */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Fecha</span>
            </div>
            <p className="font-medium">{formatDate(expense.date)}</p>
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag className="w-4 h-4" />
              <span className="text-sm">Categoría</span>
            </div>
            <span className="inline-block px-3 py-1 rounded-lg text-sm font-medium bg-destructive/10 text-destructive">
              {expense.category}
            </span>
          </div>
        </div>

        {/* Descripción */}
        {expense.description && (
          <div className="space-y-2 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span className="text-sm">Descripción</span>
            </div>
            <p className="text-foreground">{expense.description}</p>
          </div>
        )}

        {/* Recurrencia */}
        {isRecurring && (
          <div className="space-y-2 p-4 bg-warning/5 rounded-lg border border-warning/20">
            <div className="flex items-center gap-2 text-warning">
              <Repeat className="w-4 h-4" />
              <span className="text-sm font-medium">Gasto Recurrente</span>
            </div>
            {expense.recurringTime && (
              <p className="text-sm text-foreground">
                Frecuencia: <strong>{expense.recurringTime}</strong>
              </p>
            )}
            {expense.recurringId && (
              <p className="text-xs text-muted-foreground">
                ID de recurrencia: {expense.recurringId}
              </p>
            )}
          </div>
        )}

        {/* Cliente (si aplica) */}
        {client && (
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Proveedor</span>
            </div>
            <div>
              <p className="font-medium">{client.name}</p>
              {client.phone && (
                <p className="text-sm text-muted-foreground">{client.phone}</p>
              )}
              {client.email && (
                <p className="text-sm text-muted-foreground">{client.email}</p>
              )}
            </div>
          </div>
        )}

        {/* Tags (si aplica) */}
        {expense.tags && expense.tags.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">Etiquetas</span>
            <div className="flex flex-wrap gap-2">
              {expense.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-full text-xs bg-muted text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Gasto;
