import React, { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { DataTable } from "@/components/ui/DataTable";
import { ProductForm } from "@/components/forms/ProductForm";
import { MetricCard } from "@/components/ui/MetricCard";
import { ExportButtons } from "@/components/ui/ExportButtons";
import { BarcodeScanner } from "@/components/inventory/BarcodeScanner";
import {
  formatCurrency,
  getInventoryValue,
  getLowStockProducts,
} from "@/lib/storage";
import { ExportData } from "@/lib/exportUtils";
import {
  Package,
  AlertTriangle,
  DollarSign,
  Layers,
  ScanBarcode,
} from "lucide-react";
import { Product } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type FilterType = "all" | "low-stock" | "in-stock";

export const Inventario: React.FC = () => {
  const { data, deleteProduct, currentProject } = useApp();
  const { products, settings } = data;
  const isPremium = settings.isPremium || false;
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [expFrom, setExpFrom] = useState("");
  const [expTo, setExpTo] = useState("");

  // Metrics
  const inventoryValue = useMemo(() => getInventoryValue(products), [products]);
  const lowStockProducts = useMemo(
    () => getLowStockProducts(products),
    [products]
  );
  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);

  // Potential revenue
  const potentialRevenue = useMemo(() => {
    return products.reduce((sum, p) => sum + p.quantity * p.price, 0);
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply stock filter
    switch (filter) {
      case "low-stock":
        filtered = filtered.filter((p) => p.quantity <= (p.minStock || 10));
        break;
      case "in-stock":
        filtered = filtered.filter((p) => p.quantity > (p.minStock || 10));
        break;
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.category?.toLowerCase().includes(term) ||
          p.barcode?.includes(term)
      );
    }

    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;

    if (min !== undefined) {
      filtered = filtered.filter((p) => p.price >= min);
    }
    if (max !== undefined) {
      filtered = filtered.filter((p) => p.price <= max);
    }

    if (expFrom) {
      const from = new Date(expFrom);
      filtered = filtered.filter(
        (p) => p.expirationDate && new Date(p.expirationDate) >= from
      );
    }
    if (expTo) {
      const to = new Date(expTo);
      filtered = filtered.filter(
        (p) => p.expirationDate && new Date(p.expirationDate) <= to
      );
    }

    return filtered;
  }, [products, filter, searchTerm, minPrice, maxPrice, expFrom, expTo]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (product: Product) => {
    if (confirm(`¿Eliminar "${product.name}"?`)) {
      deleteProduct(product.id);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Producto",
      render: (product: Product) => (
        <div>
          <span className="font-medium">{product.name}</span>
          {product.category && (
            <span className="block text-xs text-muted-foreground">
              {product.category}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Stock",
      render: (product: Product) => {
        const isLow = product.quantity <= (product.minStock || 10);
        const isEmpty = product.quantity === 0;
        return (
          <span
            className={cn(
              "px-2 py-1 rounded-lg text-sm font-medium",
              isEmpty
                ? "bg-destructive/10 text-destructive"
                : isLow
                ? "bg-warning/10 text-warning"
                : "bg-success/10 text-success"
            )}
          >
            {product.quantity} uds
          </span>
        );
      },
    },
    {
      key: "cost",
      header: "Costo",
      render: (product: Product) =>
        formatCurrency(product.cost, settings.currencySymbol),
      className: "hidden sm:table-cell",
    },
    {
      key: "price",
      header: "Precio",
      render: (product: Product) => (
        <div className="flex flex-col">
          <span className="font-semibold text-success">
            {formatCurrency(product.price, settings.currencySymbol)}
          </span>
          {product.additionalPrices && product.additionalPrices.length > 0 && (
            <span className="text-[10px] text-muted-foreground">
              +{product.additionalPrices.length} precios
            </span>
          )}
        </div>
      ),
    },
    {
      key: "margin",
      header: "Margen",
      render: (product: Product) => {
        const margin = (
          ((product.price - product.cost) / product.cost) *
          100
        ).toFixed(0);
        return (
          <span
            className={cn(
              "text-sm font-medium",
              Number(margin) > 0 ? "text-success" : "text-destructive"
            )}
          >
            {margin}%
          </span>
        );
      },
      className: "hidden md:table-cell",
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      {!!currentProject && (
        <div className="mb-4 rounded-xl border border-border p-3 bg-muted/40 text-sm">
          <div className="font-medium">
            Modo proyecto: {currentProject?.name} (Inventario)
          </div>
        </div>
      )}
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Valor del inventario"
          value={formatCurrency(inventoryValue, settings.currencySymbol)}
          icon={<DollarSign className="w-5 h-5" />}
          variant="primary"
        />
        <MetricCard
          title="Ingreso potencial"
          value={formatCurrency(potentialRevenue, settings.currencySymbol)}
          icon={<Package className="w-5 h-5" />}
          variant="success"
        />
        <MetricCard
          title="Productos"
          value={totalProducts.toString()}
          icon={<Layers className="w-5 h-5" />}
          subtitle={`${totalUnits} unidades totales`}
          variant="default"
        />
        <MetricCard
          title="Stock bajo"
          value={lowStockProducts.length.toString()}
          icon={<AlertTriangle className="w-5 h-5" />}
          subtitle="Productos a reponer"
          variant={lowStockProducts.length > 0 ? "warning" : "default"}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Buscar por nombre, categoría o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowScanner(true)}
              title="Escanear código"
            >
              <ScanBarcode className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            {[
              { key: "all", label: "Todos" },
              { key: "low-stock", label: "Stock bajo" },
              { key: "in-stock", label: "Disponibles" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as FilterType)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                  filter === f.key
                    ? "bg-primary text-primary-foreground shadow-material"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Precio mínimo
            </div>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="0"
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Precio máximo
            </div>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="0"
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Vencimiento entre
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={expFrom}
                onChange={(e) => setExpFrom(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                type="date"
                value={expTo}
                onChange={(e) => setExpTo(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={filteredProducts}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No hay productos en el inventario"
      />

      {/* Floating Button */}
      <FloatingButton
        onClick={() => {
          setEditingProduct(null);
          setShowForm(true);
        }}
        label="Nuevo Producto"
      />

      <ExportButtons
        data={useMemo<ExportData>(
          () => ({
            title: "Reporte de Inventario",
            headers: [
              "Producto",
              "Categoría",
              "Stock",
              "Costo",
              "Precio",
              "Margen %",
              "Valor Total",
            ],
            rows: filteredProducts.map((product) => {
              const margin =
                product.cost > 0
                  ? (
                      ((product.price - product.cost) / product.cost) *
                      100
                    ).toFixed(0)
                  : "0";
              const totalValue = product.quantity * product.cost;
              return [
                product.name,
                product.category || "-",
                product.quantity,
                product.cost,
                product.price,
                `${margin}%`,
                totalValue,
              ];
            }),
            summary: [
              { label: "Total productos", value: filteredProducts.length },
              {
                label: "Valor del inventario",
                value: formatCurrency(inventoryValue, settings.currencySymbol),
              },
              {
                label: "Ingreso potencial",
                value: formatCurrency(
                  potentialRevenue,
                  settings.currencySymbol
                ),
              },
              {
                label: "Productos con stock bajo",
                value: lowStockProducts.length,
              },
            ],
          }),
          [
            filteredProducts,
            inventoryValue,
            potentialRevenue,
            lowStockProducts,
            settings.currencySymbol,
          ]
        )}
        filename="inventario"
        isPremium={isPremium}
      />

      {/* Form Modal */}
      {showForm && (
        <ProductForm
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          editingProduct={editingProduct || undefined}
        />
      )}

      {showScanner && (
        <BarcodeScanner
          onScan={(code) => {
            setSearchTerm(code);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default Inventario;
