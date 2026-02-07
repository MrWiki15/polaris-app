import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/storage";
import {
  ArrowLeft,
  Package,
  Tag,
  Barcode,
  TrendingUp,
  AlertTriangle,
  Layers,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Item: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data } = useApp();
  const { products, settings } = data;

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
          <Button onClick={() => navigate("/inventario")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a inventario
          </Button>
        </div>
      </div>
    );
  }

  const margin = (
    ((product.price - product.cost) / product.cost) *
    100
  ).toFixed(1);
  const isLowStock = product.quantity <= (product.minStock || 10);

  const componentProducts =
    product.type === "compound" && product.components
      ? product.components.map((comp) => ({
          ...comp,
          product: products.find((p) => p.id === comp.productId),
        }))
      : [];

  return (
    <div className="p-4 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/inventario")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold">Detalles del Producto</h1>
        <div className="w-12" />
      </div>

      {/* Type Badge */}
      {product.type === "compound" && (
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-blue-600 dark:text-blue-400">
            Producto Compuesto
          </span>
        </div>
      )}

      {/* Main Info Card */}
      <Card className="p-6 space-y-6">
        {/* Nombre y categoría */}
        <div className="space-y-2">
          <h2 className="text-4xl font-bold">{product.name}</h2>
          {product.category && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="px-3 py-1 rounded-lg text-sm font-medium bg-primary/10 text-primary">
                {product.category}
              </span>
            </div>
          )}
        </div>

        {/* Stock Status */}
        <div
          className={cn(
            "p-4 rounded-lg border",
            isLowStock
              ? "bg-warning/10 border-warning/30"
              : "bg-success/10 border-success/30",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package
                className={cn(
                  "w-5 h-5",
                  isLowStock ? "text-warning" : "text-success",
                )}
              />
              <span className="text-sm text-muted-foreground">Stock</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {product.quantity}{" "}
                <span className="text-lg text-muted-foreground">uds</span>
              </div>
              {product.minStock && (
                <p className="text-sm text-muted-foreground">
                  Mínimo: {product.minStock}
                </p>
              )}
            </div>
          </div>
          {isLowStock && (
            <div className="flex items-center gap-2 mt-2 text-warning text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Stock bajo - Considera reabastecer</span>
            </div>
          )}
        </div>

        {/* Precios */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Costo</p>
            <p className="text-2xl font-bold">
              {formatCurrency(product.cost, settings.currencySymbol)}
            </p>
          </div>
          <div className="space-y-1 border-l border-r border-border pl-4 pr-4">
            <p className="text-sm text-muted-foreground">Precio de venta</p>
            <p className="text-2xl font-bold text-success">
              {formatCurrency(product.price, settings.currencySymbol)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Margen</p>
            <p
              className={cn(
                "text-2xl font-bold",
                Number(margin) > 0 ? "text-success" : "text-destructive",
              )}
            >
              {margin}%
            </p>
          </div>
        </div>

        {/* Valor del inventario */}
        <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Valor en inventario</span>
          </div>
          <p className="text-2xl font-bold">
            {formatCurrency(
              product.quantity * product.cost,
              settings.currencySymbol,
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {product.quantity} unidades ×{" "}
            {formatCurrency(product.cost, settings.currencySymbol)} costo
          </p>
        </div>

        {/* Ingresos potenciales */}
        <div className="space-y-2 p-4 bg-success/5 rounded-lg border border-success/20">
          <div className="flex items-center gap-2 text-success">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Ingreso potencial</span>
          </div>
          <p className="text-2xl font-bold text-success">
            {formatCurrency(
              product.quantity * product.price,
              settings.currencySymbol,
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            Si vendes todo el stock actual
          </p>
        </div>

        {/* Código de barras */}
        {product.barcode && (
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Barcode className="w-4 h-4" />
              <span className="text-sm">Código de barras</span>
            </div>
            <code className="block font-mono text-lg font-bold">
              {product.barcode}
            </code>
          </div>
        )}

        {/* Precios adicionales */}
        {product.additionalPrices && product.additionalPrices.length > 0 && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
            <span className="text-sm font-medium">Precios adicionales</span>
            <div className="space-y-2">
              {product.additionalPrices.map((price) => (
                <div
                  key={price.id}
                  className="flex items-center justify-between p-2 bg-background rounded border border-border"
                >
                  <span className="font-medium">{price.name}</span>
                  <span className="font-bold">
                    {formatCurrency(price.price, settings.currencySymbol)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Componentes (si es compuesto) */}
        {product.type === "compound" && componentProducts.length > 0 && (
          <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Layers className="w-4 h-4" />
              <span className="font-medium">Componentes</span>
            </div>
            <div className="space-y-2">
              {componentProducts.map((component) => (
                <button
                  key={component.productId}
                  onClick={() => navigate(`/item/${component.productId}`)}
                  className="w-full text-left p-3 bg-background rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">
                        {component.product?.name || "Producto desconocido"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {component.product?.category || "Sin categoría"}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-medium">
                      x{component.quantity}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">
                        Stock actual:
                      </span>
                      <p className="font-medium">
                        {component.product?.quantity || 0} uds
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Se necesita:
                      </span>
                      <p className="font-medium">
                        {component.quantity * (product.minStock || 0)} uds para
                        stock min
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Item;
