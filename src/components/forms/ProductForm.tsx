import React, { useState } from "react";
import { ScanBarcode, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { BarcodeScanner } from "../inventory/BarcodeScanner";
import { generateId } from "@/lib/storage";

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
    supplierId?: string;
    additionalPrices?: { id: string; name: string; price: number }[];
    isNft?: boolean;
    nftAddress?: string;
    nftMarketplace?: string;
    type?: "simple" | "compound";
    components?: { productId: string; quantity: number }[];
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
  const { settings, clients: suppliers } = data;
  const isPremium = settings.isPremium || false;

  const [formData, setFormData] = useState({
    name: editingProduct?.name || "",
    quantity: editingProduct?.quantity?.toString() || "",
    cost: editingProduct?.cost?.toString() || "",
    price: editingProduct?.price?.toString() || "",
    category: editingProduct?.category || categories[0],
    minStock: editingProduct?.minStock?.toString() || "10",
    barcode: editingProduct?.barcode || "",
    supplierId: editingProduct?.supplierId || "",
    additionalPrices: editingProduct?.additionalPrices || [],
    isNft: editingProduct?.isNft || false,
    nftAddress: editingProduct?.nftAddress || "",
    nftMarketplace: editingProduct?.nftMarketplace || "",
    type: (editingProduct?.type || "simple") as "simple" | "compound",
    components: editingProduct?.components || [],
  });
  // Add state for scanner
  const [showScanner, setShowScanner] = useState(false);
  const [newPrice, setNewPrice] = useState({ name: "", price: "" });
  const [newComponent, setNewComponent] = useState({
    productId: "",
    quantity: "",
  });

  const handleAddPrice = () => {
    if (!newPrice.name || !newPrice.price) return;
    setFormData((prev) => ({
      ...prev,
      additionalPrices: [
        ...prev.additionalPrices,
        {
          id: generateId(),
          name: newPrice.name,
          price: parseFloat(newPrice.price),
        },
      ],
    }));
    setNewPrice({ name: "", price: "" });
  };

  const handleRemovePrice = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalPrices: prev.additionalPrices.filter((p) => p.id !== id),
    }));
  };

  const handleAddComponent = () => {
    if (!newComponent.productId || !newComponent.quantity) return;
    setFormData((prev) => ({
      ...prev,
      components: [
        ...prev.components,
        {
          productId: newComponent.productId,
          quantity: parseInt(newComponent.quantity),
        },
      ],
    }));
    setNewComponent({ productId: "", quantity: "" });
  };

  const handleRemoveComponent = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.productId !== productId),
    }));
  };

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
      additionalPrices: formData.additionalPrices,
      isNft: formData.isNft,
      nftAddress:
        formData.isNft && formData.nftAddress ? formData.nftAddress : undefined,
      nftMarketplace:
        formData.isNft && formData.nftMarketplace
          ? formData.nftMarketplace
          : undefined,
      type: formData.type,
      components:
        formData.type === "compound" ? formData.components : undefined,
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
          "max-h-[90vh] overflow-auto",
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

          <div className="space-y-2">
            <Label>Tipo de producto</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    type: "simple",
                    components: [],
                  }))
                }
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg font-medium transition-all",
                  formData.type === "simple"
                    ? "bg-primary text-primary-foreground shadow-material"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                Simple
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: "compound" }))
                }
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg font-medium transition-all",
                  formData.type === "compound"
                    ? "bg-primary text-primary-foreground shadow-material"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                Compuesto
              </button>
            </div>
          </div>

          {formData.type === "compound" && (
            <div className="space-y-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <Label className="text-sm font-medium">Componentes</Label>
              <p className="text-xs text-muted-foreground">
                Selecciona los productos simples que forman este producto
                compuesto
              </p>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <select
                    value={newComponent.productId}
                    onChange={(e) =>
                      setNewComponent((prev) => ({
                        ...prev,
                        productId: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  >
                    <option value="">Selecciona un producto simple</option>
                    {data.products
                      .filter(
                        (p) =>
                          p.type !== "compound" && p.id !== editingProduct?.id,
                      )
                      .map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                  </select>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Cantidad"
                    value={newComponent.quantity}
                    onChange={(e) =>
                      setNewComponent((prev) => ({
                        ...prev,
                        quantity: e.target.value,
                      }))
                    }
                    className="w-20"
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={handleAddComponent}
                    disabled={!newComponent.productId || !newComponent.quantity}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.components.length > 0 && (
                  <div className="space-y-2">
                    {formData.components.map((component) => {
                      const prod = data.products.find(
                        (p) => p.id === component.productId,
                      );
                      return (
                        <div
                          key={component.productId}
                          className="flex items-center justify-between p-2 bg-background rounded-lg border border-border"
                        >
                          <div className="flex-1">
                            <span className="text-sm font-medium">
                              {prod?.name}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              x{component.quantity}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveComponent(component.productId)
                            }
                            className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

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

          {/* Additional Prices */}
          <div className="space-y-3 p-3 bg-muted/50 rounded-xl border border-border">
            <Label className="text-sm font-medium">Precios adicionales</Label>

            <div className="flex gap-2">
              <Input
                placeholder="Nombre (ej: Mayorista)"
                value={newPrice.name}
                onChange={(e) =>
                  setNewPrice((prev) => ({ ...prev, name: e.target.value }))
                }
                className="flex-1"
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Precio"
                value={newPrice.price}
                onChange={(e) =>
                  setNewPrice((prev) => ({ ...prev, price: e.target.value }))
                }
                className="w-24"
              />
              <Button
                type="button"
                size="icon"
                onClick={handleAddPrice}
                disabled={!newPrice.name || !newPrice.price}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {formData.additionalPrices.length > 0 && (
              <div className="space-y-2">
                {formData.additionalPrices.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 bg-background rounded-lg border border-border"
                  >
                    <span className="text-sm font-medium">{p.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">
                        {settings.currencySymbol}
                        {p.price}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePrice(p.id)}
                        className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                {suppliers
                  .filter((s) => s.type === "proveedor")
                  .map((supplier) => {
                    return (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    );
                  })}
              </select>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Es NFT</Label>
              <Switch
                checked={formData.isNft}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isNft: checked,
                    ...(checked ? {} : { nftAddress: "", nftMarketplace: "" }),
                  }))
                }
              />
            </div>
            {formData.isNft && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="nftAddress">Dirección del NFT</Label>
                  <Input
                    id="nftAddress"
                    placeholder="Dirección del NFT o contrato"
                    value={formData.nftAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        nftAddress: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nftMarketplace">Marketplace</Label>
                  <Select
                    value={formData.nftMarketplace}
                    onValueChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        nftMarketplace: v,
                      }))
                    }
                  >
                    <SelectTrigger id="nftMarketplace">
                      <SelectValue placeholder="Selecciona un marketplace" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kabila Market">
                        Kabila Market
                      </SelectItem>
                      <SelectItem value="SentX">SentX</SelectItem>
                      <SelectItem value="Open Sea">Open Sea</SelectItem>
                      <SelectItem value="Magic Eden">Magic Eden</SelectItem>
                      <SelectItem value="Blur">Blur</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Margin indicator */}
          {formData.cost && formData.price && (
            <div
              className={cn(
                "p-3 rounded-xl text-center",
                parseFloat(margin) > 0
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive",
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
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
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
