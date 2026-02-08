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
  const [quantity, setQuantity] = useState("1");
  const [amount, setAmount] = useState("");
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
    setQuantity("1");
    setAmount("");
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

    if (!amount) {
      alert("El monto es requerido");
      return;
    }

    const qty = parseFloat(quantity) || 1;
    const amountNum = parseFloat(amount);

    if (amountNum <= 0) {
      alert("El monto debe ser mayor a 0");
      return;
    }

    onSubmit({
      date,
      serviceId: selectedServiceId,
      amount: amountNum,
      quantity: qty > 1 ? qty : undefined,
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

          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad de servicios</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Ej: 1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              step="0.01"
              min="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto ({currencySymbol}) *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Ej: 50.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
            />
            {selectedService?.priceType === "fixed" &&
              selectedService.price && (
                <p className="text-xs text-muted-foreground">
                  Precio sugerido: {currencySymbol}
                  {selectedService.price} (cantidad: {quantity})
                </p>
              )}
          </div>

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
