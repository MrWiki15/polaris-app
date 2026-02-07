import React, { useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/MetricCard";
import { ExportButtons } from "@/components/ui/ExportButtons";
import { formatCurrency, Service } from "@/lib/storage";
import {
  ClipboardList,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Calendar,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExportData } from "@/lib/exportUtils";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { DEPARTMENT_PERMISSIONS } from "@/components/layout/AppLayout";
import { ServiceForm } from "@/components/forms/ServiceForm";

export const Servicios: React.FC = () => {
  const {
    data,
    addService,
    updateService,
    deleteService,
    currentProject,
    currentProjectMember,
  } = useApp();
  const { services, serviceIncomes, settings } = data;
  const isPremium = settings.isPremium || false;
  const supabaseAuth = useSupabaseAuth();

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
    permissions.includes("/servicios");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const totalMonthlyServices = useMemo(() => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return serviceIncomes
      .filter((s) => new Date(s.date) >= monthAgo)
      .reduce((sum, s) => sum + s.amount, 0);
  }, [serviceIncomes]);

  const handleSaveService = (
    serviceData: Omit<Service, "id" | "createdAt">,
  ) => {
    if (editingService) {
      updateService(editingService.id, serviceData);
    } else {
      addService({
        ...serviceData,
        id: "",
        createdAt: new Date().toISOString(),
      });
    }
    setEditingService(null);
    setIsFormOpen(false);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleDeleteService = (id: string) => {
    if (confirm("¿Eliminar este servicio?")) {
      deleteService(id);
    }
  };

  const handleOpenNewServiceForm = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

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
            Modo proyecto: {currentProject?.name} (Servicios)
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          <MetricCard
            title="Ingresos por servicios (últimos 30 días)"
            value={formatCurrency(
              totalMonthlyServices,
              settings.currencySymbol,
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

      <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Catálogo de servicios</h3>
          <Button
            onClick={handleOpenNewServiceForm}
            className="gap-2"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo servicio
          </Button>
        </div>

        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No has agregado servicios aún. Crea uno para empezar.
          </p>
        ) : (
          <div className="space-y-2">
            {services.map((service) => (
              <div
                key={service.id}
                className="p-4 rounded-xl border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditService(service)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-3">
                  {service.priceType === "fixed" ? (
                    <div className="flex items-center gap-1 text-sm bg-primary/10 px-3 py-1 rounded-lg">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="font-medium">
                        {formatCurrency(
                          service.price || 0,
                          settings.currencySymbol,
                        )}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1 text-sm bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-lg text-blue-700 dark:text-blue-300">
                        <Percent className="w-4 h-4" />
                        <span>Mín: {service.minMargin}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-lg text-green-700 dark:text-green-300">
                        <Percent className="w-4 h-4" />
                        <span>Est: {service.standardMargin}%</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ServiceForm
        service={editingService || undefined}
        onSubmit={handleSaveService}
        onCancel={() => {
          setEditingService(null);
          setIsFormOpen(false);
        }}
        isOpen={isFormOpen}
      />

      <ExportButtons
        data={useMemo<ExportData>(
          () => ({
            title: "Catálogo de Servicios",
            headers: ["Nombre", "Tipo", "Precio/Margen", "Descripción"],
            rows: services.map((service) => [
              service.name,
              service.priceType === "fixed" ? "Precio Fijo" : "Precio Variable",
              service.priceType === "fixed"
                ? formatCurrency(service.price || 0, settings.currencySymbol)
                : `Min: ${service.minMargin}%, Est: ${service.standardMargin}%`,
              service.description || "-",
            ]),
            summary: [
              { label: "Total servicios", value: services.length },
              {
                label: "Servicios fijos",
                value: services.filter((s) => s.priceType === "fixed").length,
              },
              {
                label: "Servicios variables",
                value: services.filter((s) => s.priceType === "variable")
                  .length,
              },
            ],
          }),
          [services, settings.currencySymbol],
        )}
        filename="catalogo-servicios"
        isPremium={isPremium}
      />
    </div>
  );
};

export default Servicios;
