import React, { useEffect, useState } from "react";
import { ServiceIncome, Service } from "@/lib/storage";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ServiceIncomeFormProps {
  services: Service[];
  onSubmit: (income: Omit<ServiceIncome, "id">) => void;
  onCancel: () => void;
  isOpen: boolean;
  currencySymbol?: string;
}

export const ServiceIncomeForm: React.FC<ServiceIncomeFormProps> = ({
  services,
  onSubmit,
  onCancel,
  isOpen,
  currencySymbol = "$",
}) => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [price, setPrice] = useState("");
  const [selectedMargin, setSelectedMargin] = useState<number | "" | "custom">(
    "",
  );
  const [investorPercent, setInvestorPercent] = useState<number | "">("");
  const [description, setDescription] = useState("");

  const selectedService = services.find((s) => s.id === selectedServiceId);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setSelectedServiceId("");
    setPrice("");
    setSelectedMargin("");
    setDescription("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedServiceId) {
      alert("Debes seleccionar un servicio");
      return;
    }

    if (!date) {
      alert("La fecha es requerida");
      return;
    }

    if (selectedService?.priceType === "variable" && !price) {
      alert("Debes ingresar el precio para servicios de precio variable");
      return;
    }

    if (selectedService?.priceType === "variable" && selectedMargin === "") {
      alert("Debes seleccionar un margen para servicios de precio variable");
      return;
    }

    if (selectedMargin === "custom") {
      alert("Si elegiste margen personalizado, debes ingresar un valor en %");
      return;
    }

    const gross =
      selectedService?.priceType === "variable"
        ? parseFloat(price)
        : selectedService?.price || 0;

    const marginPercent =
      typeof selectedMargin === "number"
        ? selectedMargin
        : selectedService?.priceType === "fixed"
          ? 100
          : undefined;

    const investorPct =
      investorPercent !== "" ? Number(investorPercent) : undefined;

    const ownerNet =
      marginPercent !== undefined ? (gross * marginPercent) / 100 : gross;

    onSubmit({
      date,
      serviceId: selectedServiceId,
      amount: ownerNet,
      gross,
      selectedMargin: marginPercent,
      investorPercent: investorPct,
      description: description.trim() || undefined,
    });

    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Ingreso por Servicio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="income-date">Fecha *</Label>
            <Input
              id="income-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-select">Selecciona un servicio *</Label>
            <Select
              value={selectedServiceId}
              onValueChange={setSelectedServiceId}
            >
              <SelectTrigger id="service-select">
                <SelectValue placeholder="Elige un servicio..." />
              </SelectTrigger>
              <SelectContent>
                {services.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-2">
                    No hay servicios disponibles
                  </div>
                ) : (
                  services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex flex-col">
                        <span>{service.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {service.priceType === "fixed"
                            ? `Precio fijo: ${currencySymbol}${service.price}`
                            : "Precio variable"}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedService?.priceType === "variable" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="service-price">Precio cobrado ($) *</Label>
                <Input
                  id="service-price"
                  type="number"
                  placeholder="Ej: 50.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  step="0.01"
                  min="0"
                />
                <p className="text-xs text-gray-500">
                  El precio que cobraste por este servicio
                </p>
              </div>

              <div className="space-y-2">
                <Label>Selecciona el margen de ganancia *</Label>
                <div className="space-y-2">
                  {selectedService.minMargin !== undefined && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedMargin(selectedService.minMargin!)
                      }
                      className={cn(
                        "w-full p-3 rounded-lg border-2 transition-all text-left",
                        selectedMargin === selectedService.minMargin
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Margen Mínimo</div>
                          <div className="text-xs text-muted-foreground">
                            Ganancia mínima posible
                          </div>
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {selectedService.minMargin}%
                        </div>
                      </div>
                    </button>
                  )}

                  {selectedService.standardMargin !== undefined && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedMargin(selectedService.standardMargin!)
                      }
                      className={cn(
                        "w-full p-3 rounded-lg border-2 transition-all text-left",
                        selectedMargin === selectedService.standardMargin
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Margen Estándar</div>
                          <div className="text-xs text-muted-foreground">
                            Ganancia recomendada
                          </div>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {selectedService.standardMargin}%
                        </div>
                      </div>
                    </button>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="investor-percent">
                      Gasto del servicio (opcional %)
                    </Label>
                    <Input
                      id="investor-percent"
                      type="number"
                      placeholder="Ej: 5"
                      value={
                        investorPercent === "" ? "" : String(investorPercent)
                      }
                      onChange={(e) =>
                        setInvestorPercent(
                          e.target.value ? parseFloat(e.target.value) : "",
                        )
                      }
                      step="0.01"
                      min="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Si indicas un % aquí se registrará como gasto automático
                      al guardar el ingreso.
                    </p>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setSelectedMargin("custom")}
                      className={cn(
                        "w-full p-3 rounded-lg border-2 transition-all text-left",
                        selectedMargin === "custom"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            Margen Personalizado
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Ingresa otro margen
                          </div>
                        </div>
                        <div className="text-lg font-bold text-purple-600">
                          Otro
                        </div>
                      </div>
                    </button>
                  </div>

                  {selectedMargin === "custom" && (
                    <Input
                      type="number"
                      placeholder="Ingresa el margen en %"
                      value={
                        typeof selectedMargin === "number" ? selectedMargin : ""
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedMargin(val ? parseFloat(val) : "custom");
                      }}
                      step="0.01"
                      min="0"
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {selectedService?.priceType === "fixed" && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Precio fijo:</strong> {currencySymbol}
                {selectedService.price}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="income-description">Descripción (opcional)</Label>
            <Input
              id="income-description"
              placeholder="Ej: Consultoría - 2 horas"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">Registrar Ingreso</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
