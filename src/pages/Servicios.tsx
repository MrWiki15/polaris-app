import React, { useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MetricCard } from "@/components/ui/MetricCard";
import { ExportButtons } from "@/components/ui/ExportButtons";
import { formatCurrency } from "@/lib/storage";
import {
  ClipboardList,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExportData } from "@/lib/exportUtils";

export const Servicios: React.FC = () => {
  const {
    data,
    addService,
    updateService,
    deleteService,
    addServiceIncome,
    deleteServiceIncome,
  } = useApp();
  const { services, serviceIncomes, settings, clients } = data;
  const isPremium = settings.isPremium || false;

  const [view, setView] = useState<"catalog" | "record">("catalog");
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    isVariablePrice: false,
    price: "",
    description: "",
  });

  const [recordForm, setRecordForm] = useState({
    date: new Date().toISOString().split("T")[0],
    serviceId: "",
    clientId: "",
    amount: "",
    description: "",
    multiplier: 1,
  });

  const totalMonthlyServices = useMemo(() => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return serviceIncomes
      .filter((s) => new Date(s.date) >= monthAgo)
      .reduce((sum, s) => sum + s.amount, 0);
  }, [serviceIncomes]);

  const onSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: serviceForm.name.trim(),
      isVariablePrice: serviceForm.isVariablePrice,
      price: serviceForm.isVariablePrice
        ? undefined
        : parseFloat(serviceForm.price || "0"),
      description: serviceForm.description.trim() || undefined,
    };
    if (!payload.name) return;
    if (editingServiceId) {
      updateService(editingServiceId, payload);
      setEditingServiceId(null);
    } else {
      addService({ ...payload, createdAt: new Date().toISOString() });
    }
    setServiceForm({
      name: "",
      isVariablePrice: false,
      price: "",
      description: "",
    });
  };

  const onEditService = (id: string) => {
    const s = services.find((x) => x.id === id);
    if (!s) return;
    setEditingServiceId(id);
    setServiceForm({
      name: s.name,
      isVariablePrice: !!s.isVariablePrice,
      price: s.price?.toString() || "",
      description: s.description || "",
    });
    setView("catalog");
  };

  const onDeleteService = (id: string) => {
    if (confirm("¿Eliminar este servicio?")) deleteService(id);
  };

  const onSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordForm.serviceId) return;
    const svc = services.find((s) => s.id === recordForm.serviceId);
    if (!svc) return;

    const amount = svc.isVariablePrice
      ? parseFloat(recordForm.amount || "0")
      : (svc.price || 0) * (recordForm.multiplier || 1);

    addServiceIncome({
      date: recordForm.date,
      serviceId: svc.id,
      clientId: recordForm.clientId,
      amount,
      description: recordForm.description.trim() || undefined,
      tags:
        !svc.isVariablePrice && (recordForm.multiplier || 1) > 1
          ? [`x${recordForm.multiplier}`]
          : undefined,
    });

    setRecordForm({
      date: new Date().toISOString().split("T")[0],
      serviceId: "",
      clientId: "",
      amount: "",
      description: "",
      multiplier: 1,
    });
    setView("catalog");
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          <MetricCard
            title="Ingresos por servicios (últimos 30 días)"
            value={formatCurrency(
              totalMonthlyServices,
              settings.currencySymbol
            )}
            icon={<DollarSign className="w-5 h-5" />}
            variant="primary"
          />
          <MetricCard
            title="Servicios activos"
            value={`${services.length}`}
            icon={<ClipboardList className="w-5 h-5" />}
            variant="default"
          />
          <MetricCard
            title="Registros de servicios"
            value={`${serviceIncomes.length}`}
            icon={<Calendar className="w-5 h-5" />}
            variant="success"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className={cn(
            "px-4 py-2 rounded-xl border-2",
            view === "catalog" ? "border-primary bg-primary/5" : "border-border"
          )}
          onClick={() => setView("catalog")}
        >
          Catálogo de servicios
        </button>
        <button
          className={cn(
            "px-4 py-2 rounded-xl border-2",
            view === "record" ? "border-primary bg-primary/5" : "border-border"
          )}
          onClick={() => setView("record")}
        >
          Registrar servicio realizado
        </button>
      </div>

      {view === "catalog" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
            <h3 className="font-semibold mb-4">
              {editingServiceId ? "Editar servicio" : "Nuevo servicio"}
            </h3>
            <form onSubmit={onSaveService} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="svc_name">Nombre</Label>
                <Input
                  id="svc_name"
                  placeholder="Ej: Pintar casa"
                  value={serviceForm.name}
                  onChange={(e) =>
                    setServiceForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de precio</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setServiceForm((p) => ({ ...p, isVariablePrice: false }))
                    }
                    className={cn(
                      "p-3 rounded-xl border-2",
                      !serviceForm.isVariablePrice
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    Precio fijo
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setServiceForm((p) => ({ ...p, isVariablePrice: true }))
                    }
                    className={cn(
                      "p-3 rounded-xl border-2",
                      serviceForm.isVariablePrice
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    Precio variable
                  </button>
                </div>
              </div>
              {!serviceForm.isVariablePrice && (
                <div className="space-y-2">
                  <Label htmlFor="svc_price">Precio</Label>
                  <Input
                    id="svc_price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm((p) => ({ ...p, price: e.target.value }))
                    }
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="svc_desc">Descripción (opcional)</Label>
                <Input
                  id="svc_desc"
                  placeholder="Detalles del servicio"
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="gap-2">
                  <Plus className="w-4 h-4" />
                  {editingServiceId ? "Actualizar" : "Guardar servicio"}
                </Button>
                {editingServiceId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingServiceId(null);
                      setServiceForm({
                        name: "",
                        isVariablePrice: false,
                        price: "",
                        description: "",
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
            <h3 className="font-semibold mb-4">Mis servicios</h3>
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No has agregado servicios aún.
              </p>
            ) : (
              <div className="space-y-2">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border"
                  >
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.isVariablePrice
                          ? "Precio variable"
                          : `Precio: ${formatCurrency(
                              s.price || 0,
                              settings.currencySymbol
                            )}`}
                      </div>
                      {s.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {s.description}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditService(s.id)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteService(s.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
          <h3 className="font-semibold mb-4">Registrar servicio realizado</h3>
          <form onSubmit={onSaveRecord} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rec_date">Fecha</Label>
              <Input
                id="rec_date"
                type="date"
                value={recordForm.date}
                onChange={(e) =>
                  setRecordForm((p) => ({ ...p, date: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Servicio</Label>
              <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded-xl p-2">
                {services.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">
                    Agrega servicios en el catálogo primero.
                  </p>
                ) : (
                  services.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() =>
                        setRecordForm((p) => ({ ...p, serviceId: s.id }))
                      }
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-lg transition-all text-left",
                        recordForm.serviceId === s.id
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-muted hover:bg-muted/80 border-2 border-transparent"
                      )}
                    >
                      <div>
                        <span className="font-medium text-sm">{s.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {s.isVariablePrice
                            ? "Precio variable"
                            : formatCurrency(
                                s.price || 0,
                                settings.currencySymbol
                              )}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {!services.find((s) => s.id === recordForm.serviceId)
              ?.isVariablePrice &&
              recordForm.serviceId && (
                <div className="space-y-2">
                  <Label>Cantidad (multiplicador)</Label>
                  <div className="flex flex-wrap gap-2">
                    {[2, 3, 4, 5, 6].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() =>
                          setRecordForm((p) => ({ ...p, multiplier: m }))
                        }
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                          recordForm.multiplier === m
                            ? "bg-primary text-primary-foreground shadow-material"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        x{m}
                      </button>
                    ))}
                  </div>
                  <div className="p-4 bg-success/10 rounded-xl border border-success/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total</span>
                      <span className="text-xl font-bold text-success">
                        {formatCurrency(
                          (services.find((s) => s.id === recordForm.serviceId)
                            ?.price || 0) * (recordForm.multiplier || 1),
                          settings.currencySymbol
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            {services.find((s) => s.id === recordForm.serviceId)
              ?.isVariablePrice && (
              <div className="space-y-2">
                <Label htmlFor="rec_amount">Monto cobrado</Label>
                <Input
                  id="rec_amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={recordForm.amount}
                  onChange={(e) =>
                    setRecordForm((p) => ({ ...p, amount: e.target.value }))
                  }
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Cliente</Label>
              <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded-xl p-2">
                {clients.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">
                    Agrega clientes en el CRM primero.
                  </p>
                ) : (
                  clients
                    .filter((c) => c.type === "cliente")
                    .map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() =>
                          setRecordForm((p) => ({ ...p, clientId: s.id }))
                        }
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg transition-all text-left",
                          recordForm.clientId === s.id
                            ? "bg-primary/10 border-2 border-primary"
                            : "bg-muted hover:bg-muted/80 border-2 border-transparent"
                        )}
                      >
                        <div>
                          <span className="font-medium text-sm">{s.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {s.phone}
                          </span>
                        </div>
                      </button>
                    ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rec_desc">Detalles (opcional)</Label>
              <Input
                id="rec_desc"
                placeholder="Describe brevemente el servicio"
                value={recordForm.description}
                onChange={(e) =>
                  setRecordForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>

            <Button type="submit" className="gap-2">
              <Plus className="w-4 h-4" />
              Registrar ingreso por servicio
            </Button>
          </form>

          <div className="mt-6">
            <h4 className="font-semibold mb-3">Servicios realizados</h4>
            {serviceIncomes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay registros aún.
              </p>
            ) : (
              <div className="space-y-2">
                {serviceIncomes.map((r) => {
                  const svc = services.find((s) => s.id === r.serviceId);
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {new Date(r.date).toLocaleDateString("es-ES")} ·{" "}
                          {svc?.name || "Servicio"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {r.description || "-"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-success">
                          {formatCurrency(r.amount, settings.currencySymbol)}
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteServiceIncome(r.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <ExportButtons
        data={useMemo<ExportData>(
          () => ({
            title: "Reporte de Servicios",
            headers: ["Fecha", "Servicio", "Monto", "Descripción"],
            rows: serviceIncomes
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((income) => {
                const service = services.find((s) => s.id === income.serviceId);
                return [
                  new Date(income.date).toLocaleDateString("es-ES"),
                  service?.name || "Servicio eliminado",
                  income.amount,
                  income.description || "-",
                ];
              }),
            summary: [
              { label: "Total servicios", value: services.length },
              { label: "Total registros", value: serviceIncomes.length },
              {
                label: "Ingresos últimos 30 días",
                value: formatCurrency(
                  totalMonthlyServices,
                  settings.currencySymbol
                ),
              },
            ],
          }),
          [
            serviceIncomes,
            services,
            totalMonthlyServices,
            settings.currencySymbol,
          ]
        )}
        filename="servicios"
        isPremium={isPremium}
      />
    </div>
  );
};

export default Servicios;
