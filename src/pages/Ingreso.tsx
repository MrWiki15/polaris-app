import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/storage";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  Package,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Ingreso: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data } = useApp();
  const { sales, products, settings, clients } = data;

  const sale = sales.find((s) => s.id === id);

  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ingreso no encontrado</h1>
          <Button onClick={() => navigate("/ingresos")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a ingresos
          </Button>
        </div>
      </div>
    );
  }

  const product = sale.productId
    ? products.find((p) => p.id === sale.productId)
    : null;

  const client = sale.clientId
    ? clients.find((c) => c.id === sale.clientId)
    : null;

  return (
    <div className="p-4 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/ingresos")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold">Detalles del Ingreso</h1>
        <div className="w-12" />
      </div>

      {/* Main Info Card */}
      <Card className="p-6 space-y-6">
        {/* Monto principal */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Monto</span>
          </div>
          <div className="text-4xl font-bold text-success">
            {formatCurrency(sale.amount, settings.currencySymbol)}
          </div>
        </div>

        {/* Grid de información */}
        <div className="grid grid-cols-2 gap-4">
          {/* Fecha */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Fecha</span>
            </div>
            <p className="font-medium">{formatDate(sale.date)}</p>
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag className="w-4 h-4" />
              <span className="text-sm">Categoría</span>
            </div>
            <span className="inline-block px-3 py-1 rounded-lg text-sm font-medium bg-primary/10 text-primary">
              {sale.category}
            </span>
          </div>
        </div>

        {/* Descripción */}
        {sale.description && (
          <div className="space-y-2 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span className="text-sm">Descripción</span>
            </div>
            <p className="text-foreground">{sale.description}</p>
          </div>
        )}

        {/* Producto (si aplica) */}
        {product && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="w-4 h-4" />
              <span className="text-sm font-medium">Producto</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{product.name}</p>
                  {product.category && (
                    <p className="text-sm text-muted-foreground">
                      {product.category}
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium bg-success/10 text-success px-2 py-1 rounded">
                  x{sale.quantity}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Costo</span>
                  <p className="font-medium">
                    {formatCurrency(product.cost, settings.currencySymbol)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Precio</span>
                  <p className="font-medium">
                    {formatCurrency(product.price, settings.currencySymbol)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Margen</span>
                  <p className="font-medium">
                    {(
                      ((product.price - product.cost) / product.cost) *
                      100
                    ).toFixed(0)}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cliente (si aplica) */}
        {client && (
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Cliente</span>
            </div>
            <div>
              <p className="font-medium">{client.name}</p>
              {client.phone && (
                <p className="text-sm text-muted-foreground">{client.phone}</p>
              )}
              {client.email && (
                <p className="text-sm text-muted-foreground">{client.email}</p>
              )}
            </div>
          </div>
        )}

        {/* Tags (si aplica) */}
        {sale.tags && sale.tags.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">Etiquetas</span>
            <div className="flex flex-wrap gap-2">
              {sale.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-full text-xs bg-muted text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Ingreso;
