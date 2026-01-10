import React, { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { DataTable } from "@/components/ui/DataTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { ExportButtons } from "@/components/ui/ExportButtons";
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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatCurrency,
  getRecurringPaymentCompliance,
  RecurringPayment,
} from "@/lib/storage";
import {
  RefreshCw,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ExportData } from "@/lib/exportUtils";

const CATEGORIES = [
  "Alquiler",
  "Servicios",
  "Salarios",
  "Seguros",
  "Suscripciones",
  "Otros",
];

export const PagosRecurrentes: React.FC = () => {
  const {
    data,
    addRecurringPayment,
    updateRecurringPayment,
    deleteRecurringPayment,
    payRecurringPayment,
  } = useApp();
  const { recurringPayments, expenses, settings } = data;
  const isPremium = settings.isPremium || false;

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RecurringPayment | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    amount: string;
    category: string;
    frequency: "weekly" | "monthly" | "yearly";
    dayOfMonth: string;
    isActive: boolean;
  }>({
    name: "",
    amount: "",
    category: "Servicios",
    frequency: "monthly",
    dayOfMonth: "1",
    isActive: true,
  });

  const compliance = React.useMemo(
    () => getRecurringPaymentCompliance(recurringPayments, expenses),
    [recurringPayments, expenses]
  );

  const monthlyTotal = recurringPayments
    .filter((rp) => rp.isActive && rp.frequency === "monthly")
    .reduce((sum, rp) => sum + rp.amount, 0);

  const activeCount = recurringPayments.filter((rp) => rp.isActive).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const paymentData = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      category: formData.category,
      frequency: formData.frequency,
      dayOfMonth: parseInt(formData.dayOfMonth),
      isActive: formData.isActive,
    };

    if (editing) {
      updateRecurringPayment(editing.id, paymentData);
      toast.success("Pago actualizado");
    } else {
      addRecurringPayment(paymentData);
      toast.success("Pago recurrente agregado");
    }

    setShowForm(false);
    setEditing(null);
    setFormData({
      name: "",
      amount: "",
      category: "Servicios",
      frequency: "monthly",
      dayOfMonth: "1",
      isActive: true,
    });
  };

  const handleEdit = (payment: RecurringPayment) => {
    setEditing(payment);
    setFormData({
      name: payment.name,
      amount: payment.amount.toString(),
      category: payment.category,
      frequency: payment.frequency,
      dayOfMonth: payment.dayOfMonth?.toString() || "1",
      isActive: payment.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = (payment: RecurringPayment) => {
    if (confirm("¿Eliminar este pago recurrente?")) {
      deleteRecurringPayment(payment.id);
      toast.success("Pago eliminado");
    }
  };

  const handlePay = (payment: RecurringPayment) => {
    payRecurringPayment(payment.id);
    toast.success(`Pago registrado: ${payment.name}`);
  };

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const columns = [
    {
      key: "name",
      header: "Nombre",
      render: (rp: RecurringPayment) => (
        <div>
          <span className="font-medium">{rp.name}</span>
          <span
            className={cn(
              "ml-2 text-xs px-2 py-0.5 rounded-full",
              rp.isActive
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground"
            )}
          >
            {rp.isActive ? "Activo" : "Inactivo"}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Monto",
      render: (rp: RecurringPayment) => (
        <span className="font-semibold">
          {formatCurrency(rp.amount, settings.currencySymbol)}
        </span>
      ),
    },
    {
      key: "category",
      header: "Categoría",
      render: (rp: RecurringPayment) => (
        <span className="px-2 py-1 bg-muted rounded-lg text-sm">
          {rp.category}
        </span>
      ),
      className: "hidden sm:table-cell",
    },
    {
      key: "dayOfMonth",
      header: "Día",
      render: (rp: RecurringPayment) => `Día ${rp.dayOfMonth}`,
      className: "hidden sm:table-cell",
    },
    {
      key: "status",
      header: "Estado",
      render: (rp: RecurringPayment) => {
        const isPaid = expenses.some(
          (e) =>
            e.recurringId === rp.id &&
            new Date(e.date).getMonth() === currentMonth &&
            new Date(e.date).getFullYear() === currentYear
        );

        return isPaid ? (
          <span className="flex items-center gap-1 text-success text-sm">
            <CheckCircle className="w-4 h-4" /> Pagado
          </span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePay(rp)}
            className="h-7 text-xs"
          >
            Registrar pago
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-4 items-start sm:items-center justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <MetricCard
            title="Total mensual"
            value={formatCurrency(monthlyTotal, settings.currencySymbol)}
            icon={<DollarSign className="w-5 h-5" />}
            variant="primary"
          />
          <MetricCard
            title="Cumplimiento"
            value={`${compliance.percentage.toFixed(0)}%`}
            subtitle={`${compliance.paid}/${compliance.total} pagados`}
            icon={<CheckCircle className="w-5 h-5" />}
            variant={compliance.percentage >= 80 ? "success" : "warning"}
          />
          <MetricCard
            title="Pagos activos"
            value={activeCount.toString()}
            icon={<RefreshCw className="w-5 h-5" />}
            variant="default"
          />
        </div>
        <ExportButtons
          data={useMemo<ExportData>(
            () => ({
              title: "Reporte de Pagos Recurrentes",
              headers: [
                "Nombre",
                "Monto",
                "Categoría",
                "Frecuencia",
                "Día del mes",
                "Estado",
              ],
              rows: recurringPayments.map((payment) => [
                payment.name,
                payment.amount,
                payment.category,
                payment.frequency === "monthly"
                  ? "Mensual"
                  : payment.frequency === "weekly"
                  ? "Semanal"
                  : payment.frequency === "yearly"
                  ? "Anual"
                  : "Diaria",
                payment.dayOfMonth?.toString() || "-",
                payment.isActive ? "Activo" : "Inactivo",
              ]),
              summary: [
                {
                  label: "Total pagos recurrentes",
                  value: recurringPayments.length,
                },
                { label: "Pagos activos", value: activeCount },
                {
                  label: "Total mensual",
                  value: formatCurrency(monthlyTotal, settings.currencySymbol),
                },
                {
                  label: "Cumplimiento",
                  value: `${compliance.percentage.toFixed(0)}%`,
                },
              ],
            }),
            [
              recurringPayments,
              activeCount,
              monthlyTotal,
              compliance.percentage,
              settings.currencySymbol,
            ]
          )}
          filename="pagos-recurrentes"
          isPremium={isPremium}
        />
      </div>

      <DataTable
        data={recurringPayments}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No hay pagos recurrentes registrados"
      />

      <FloatingButton
        onClick={() => {
          setEditing(null);
          setFormData({
            name: "",
            amount: "",
            category: "Servicios",
            frequency: "monthly",
            dayOfMonth: "1",
            isActive: true,
          });
          setShowForm(true);
        }}
        label="Nuevo Pago"
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Pago" : "Nuevo Pago Recurrente"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ej: Alquiler local"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monto</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Día del mes</Label>
                <Input
                  type="number"
                  min="1"
                  max="28"
                  value={formData.dayOfMonth}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dayOfMonth: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, category: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Activo</Label>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {editing ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PagosRecurrentes;
