import React, { useState } from "react";
import { ScanBarcode, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { BarcodeScanner } from "../inventory/BarcodeScanner";

interface ProductFormProps {
  onClose: () => void;
  editingProduct?: {
    id: string;
    name: string;
    quantity: number;
    cost: number;
    price: number;
    category?: string;
    minStock?: number;
    barcode?: string;
  };
}

const categories = [
  "Alimentos",
  "Bebidas",
  "Higiene",
  "Limpieza",
  "Electrónica",
  "Ropa",
  "Otros",
];

export const ProductForm: React.FC<ProductFormProps> = ({
  onClose,
  editingProduct,
}) => {
  const { addProduct, updateProduct, data } = useApp();
  const { settings, suppliers } = data;
  const isPremium = settings.isPremium || false;

  const [formData, setFormData] = useState({
    name: editingProduct?.name || "",
    quantity: editingProduct?.quantity?.toString() || "",
    cost: editingProduct?.cost?.toString() || "",
    price: editingProduct?.price?.toString() || "",
    category: editingProduct?.category || categories[0],
    minStock: editingProduct?.minStock?.toString() || "10",
    barcode: editingProduct?.barcode || "",
    supplierId: (editingProduct as any)?.supplierId || "",
  });
  // Add state for scanner
  const [showScanner, setShowScanner] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      quantity: parseInt(formData.quantity),
      cost: parseFloat(formData.cost),
      price: parseFloat(formData.price),
      category: formData.category,
      minStock: parseInt(formData.minStock) || 10,
      barcode: formData.barcode || undefined,
      supplierId: formData.supplierId || undefined,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }

    onClose();
  };

  const handleScan = (code: string) => {
    setFormData((prev) => ({ ...prev, barcode: code }));
    setShowScanner(false);
  };

  const margin =
    formData.cost && formData.price
      ? (
          ((parseFloat(formData.price) - parseFloat(formData.cost)) /
            parseFloat(formData.cost)) *
          100
        ).toFixed(1)
      : "0";

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
            {editingProduct ? "Editar Producto" : "Nuevo Producto"}
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
            <Label htmlFor="barcode">Código de barras</Label>
            <div className="flex gap-2">
              <Input
                id="barcode"
                placeholder="Escanea o escribe el código"
                value={formData.barcode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, barcode: e.target.value }))
                }
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowScanner(true)}
                title="Escanear código"
              >
                <ScanBarcode className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre del producto</Label>
            <Input
              id="name"
              placeholder="Ej: Café molido 250g"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, quantity: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Stock mínimo</Label>
              <Input
                id="minStock"
                type="number"
                placeholder="10"
                value={formData.minStock}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, minStock: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Costo</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.cost}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cost: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Precio de venta</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                required
              />
            </div>
          </div>

          {isPremium && (
            <div className="space-y-2">
              <Label htmlFor="supplier">Proveedor (opcional)</Label>
              <select
                id="supplier"
                value={formData.supplierId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    supplierId: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">Sin proveedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Margin indicator */}
          {formData.cost && formData.price && (
            <div
              className={cn(
                "p-3 rounded-xl text-center",
                parseFloat(margin) > 0
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              <span className="font-medium">Margen: {margin}%</span>
            </div>
          )}

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
                      ? "bg-primary text-primary-foreground shadow-material"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

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
              className="flex-1 gradient-primary hover:opacity-90"
              disabled={
                !formData.name ||
                !formData.quantity ||
                !formData.cost ||
                !formData.price
              }
            >
              {editingProduct ? "Guardar" : "Agregar"}
            </Button>
          </div>
        </form>
      </div>

      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};
