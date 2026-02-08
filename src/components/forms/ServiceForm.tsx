import React, { useEffect, useState } from "react";
import { Service, Product } from "@/lib/storage";
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
import { Trash2 } from "lucide-react";

interface ServiceFormProps {
  service?: Service;
  products?: Product[];
  onSubmit: (service: Omit<Service, "id" | "createdAt">) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  service,
  products = [],
  onSubmit,
  onCancel,
  isOpen,
}) => {
  const [name, setName] = useState("");
  const [priceType, setPriceType] = useState<"fixed" | "variable">("fixed");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>(
    [],
  );
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("");
  const [hasExpense, setHasExpense] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expensePercent, setExpensePercent] = useState("");

  useEffect(() => {
    if (service) {
      setName(service.name);
      setPriceType(service.priceType);
      setPrice(service.price ? service.price.toString() : "");
      setDescription(service.description || "");
      setItems(service.items || []);
      setHasExpense(!!service.associatedExpense);
      setExpenseCategory(service.associatedExpense?.category || "");
      setExpensePercent(
        service.associatedExpense?.percent
          ? service.associatedExpense.percent.toString()
          : "",
      );
    } else {
      resetForm();
    }
  }, [service, isOpen]);

  const resetForm = () => {
    setName("");
    setPriceType("fixed");
    setPrice("");
    setDescription("");
    setItems([]);
    setSelectedProductId("");
    setSelectedQuantity("");
    setHasExpense(false);
    setExpenseCategory("");
    setExpensePercent("");
  };

  const handleAddItem = () => {
    if (!selectedProductId || !selectedQuantity) {
      alert("Selecciona un producto y cantidad");
      return;
    }

    const quantity = parseFloat(selectedQuantity);
    if (quantity <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    const existingItem = items.find(
      (item) => item.productId === selectedProductId,
    );
    if (existingItem) {
      setItems(
        items.map((item) =>
          item.productId === selectedProductId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        ),
      );
    } else {
      setItems([...items, { productId: selectedProductId, quantity }]);
    }

    setSelectedProductId("");
    setSelectedQuantity("");
  };

  const handleRemoveItem = (productId: string) => {
    setItems(items.filter((item) => item.productId !== productId));
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

    const serviceData: Omit<Service, "id" | "createdAt"> = {
      name: name.trim(),
      priceType,
      price: priceType === "fixed" ? parseFloat(price) : undefined,
      description: description.trim() || undefined,
      items: items.length > 0 ? items : undefined,
    };

    if (hasExpense && expenseCategory && expensePercent) {
      serviceData.associatedExpense = {
        category: expenseCategory.trim(),
        percent: parseFloat(expensePercent),
      };
    }

    onSubmit(serviceData);
    resetForm();
  };

  const getProductName = (productId: string) => {
    return (
      products.find((p) => p.id === productId)?.name || "Producto desconocido"
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
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

          <div className="space-y-2">
            <Label htmlFor="service-description">Descripción</Label>
            <Input
              id="service-description"
              placeholder="Describe el servicio..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Items del Inventario */}
          <div className="space-y-2 pt-4 border-t">
            <Label>Items del Inventario Vinculados</Label>
            <div className="flex gap-2">
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecciona producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} (Disponible: {product.quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Cantidad"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(e.target.value)}
                step="0.01"
                min="0"
                className="w-24"
              />
              <Button
                type="button"
                onClick={handleAddItem}
                variant="outline"
                size="sm"
              >
                Añadir
              </Button>
            </div>

            {items.length > 0 && (
              <div className="space-y-2 mt-3">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between bg-muted p-2 rounded"
                  >
                    <span className="text-sm">
                      {getProductName(item.productId)} - {item.quantity}{" "}
                      unidades
                    </span>
                    <Button
                      type="button"
                      onClick={() => handleRemoveItem(item.productId)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gasto Asociado */}
          <div className="space-y-2 pt-4 border-t">
            <Label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                title="Añadir gasto asociado al servicio"
                checked={hasExpense}
                onChange={(e) => setHasExpense(e.target.checked)}
                className="w-4 h-4"
              />
              Gasto Asociado
            </Label>

            {hasExpense && (
              <div className="space-y-2">
                <div>
                  <Label htmlFor="expense-category">Categoría de Gasto</Label>
                  <Input
                    id="expense-category"
                    placeholder="Ej: Comisión, Inversor"
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="expense-percent">
                    Porcentaje del Ingreso (%)
                  </Label>
                  <Input
                    id="expense-percent"
                    type="number"
                    placeholder="Ej: 20"
                    value={expensePercent}
                    onChange={(e) => setExpensePercent(e.target.value)}
                    step="0.01"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            )}
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
