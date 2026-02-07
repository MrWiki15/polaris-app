import React, { useEffect, useState } from "react";
import { Service } from "@/lib/storage";
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

interface ServiceFormProps {
  service?: Service;
  onSubmit: (service: Omit<Service, "id" | "createdAt">) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  service,
  onSubmit,
  onCancel,
  isOpen,
}) => {
  const [name, setName] = useState("");
  const [priceType, setPriceType] = useState<"fixed" | "variable">("fixed");
  const [price, setPrice] = useState("");
  const [minMargin, setMinMargin] = useState("");
  const [standardMargin, setStandardMargin] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (service) {
      setName(service.name);
      setPriceType(service.priceType);
      setPrice(service.price ? service.price.toString() : "");
      setMinMargin(service.minMargin ? service.minMargin.toString() : "");
      setStandardMargin(
        service.standardMargin ? service.standardMargin.toString() : "",
      );
      setDescription(service.description || "");
    } else {
      resetForm();
    }
  }, [service, isOpen]);

  const resetForm = () => {
    setName("");
    setPriceType("fixed");
    setPrice("");
    setMinMargin("");
    setStandardMargin("");
    setDescription("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("El nombre del servicio es requerido");
      return;
    }

    if (priceType === "fixed" && !price) {
      alert("El precio es requerido para servicios con precio fijo");
      return;
    }

    if (priceType === "variable" && (!minMargin || !standardMargin)) {
      alert(
        "Margen mínimo y estándar son requeridos para servicios con precio variable",
      );
      return;
    }

    onSubmit({
      name: name.trim(),
      priceType,
      price: priceType === "fixed" ? parseFloat(price) : undefined,
      minMargin: priceType === "variable" ? parseFloat(minMargin) : undefined,
      standardMargin:
        priceType === "variable" ? parseFloat(standardMargin) : undefined,
      description: description.trim() || undefined,
    });

    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {service ? "Editar Servicio" : "Nuevo Servicio"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service-name">Nombre del Servicio *</Label>
            <Input
              id="service-name"
              placeholder="Ej: Consultoría"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price-type">Tipo de Precio *</Label>
            <Select
              value={priceType}
              onValueChange={(value: "fixed" | "variable") =>
                setPriceType(value)
              }
            >
              <SelectTrigger id="price-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Precio Fijo</SelectItem>
                <SelectItem value="variable">Precio Variable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {priceType === "fixed" && (
            <div className="space-y-2">
              <Label htmlFor="service-price">Precio ($) *</Label>
              <Input
                id="service-price"
                type="number"
                placeholder="Ej: 50.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
          )}

          {priceType === "variable" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="min-margin">Margen Mínimo (%) *</Label>
                <Input
                  id="min-margin"
                  type="number"
                  placeholder="Ej: 20"
                  value={minMargin}
                  onChange={(e) => setMinMargin(e.target.value)}
                  step="0.01"
                  min="0"
                />
                <p className="text-xs text-gray-500">
                  Ganancia mínima que puedes tener en este servicio
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="standard-margin">Margen Estándar (%) *</Label>
                <Input
                  id="standard-margin"
                  type="number"
                  placeholder="Ej: 35"
                  value={standardMargin}
                  onChange={(e) => setStandardMargin(e.target.value)}
                  step="0.01"
                  min="0"
                />
                <p className="text-xs text-gray-500">
                  Ganancia estándar/recomendada para este servicio
                </p>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="service-description">Descripción</Label>
            <Input
              id="service-description"
              placeholder="Describe el servicio..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {service ? "Actualizar" : "Crear"} Servicio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
