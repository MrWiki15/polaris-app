import React, { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { MetricCard } from "@/components/ui/MetricCard";
import { ExportButtons } from "@/components/ui/ExportButtons";
import {
  formatCurrency,
  getPendingOrders,
  getCriticalStockProducts,
  Supplier,
  SupplierOrder,
} from "@/lib/storage";
import {
  Truck,
  Package,
  AlertTriangle,
  ClipboardList,
  Plus,
  X,
  Check,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ExportData } from "@/lib/exportUtils";

type ViewMode = "suppliers" | "orders";

export const Proveedores: React.FC = () => {
  const {
    data,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addSupplierOrder,
    updateSupplierOrder,
    deleteSupplierOrder,
    receiveSupplierOrder,
  } = useApp();
  const { suppliers, supplierOrders, products, settings } = data;
  const isPremium = settings.isPremium || false;

  const [viewMode, setViewMode] = useState<ViewMode>("suppliers");
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Form states
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const [orderForm, setOrderForm] = useState<{
    supplierId: string;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      cost: number;
    }[];
    expectedDate: string;
    notes: string;
  }>({ supplierId: "", items: [], expectedDate: "", notes: "" });

  // Metrics
  const pendingOrders = useMemo(
    () => getPendingOrders(supplierOrders),
    [supplierOrders]
  );
  const criticalStock = useMemo(
    () => getCriticalStockProducts(products, supplierOrders),
    [products, supplierOrders]
  );
  const totalPendingValue = pendingOrders.reduce(
    (sum, o) => sum + o.totalAmount,
    0
  );

  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, supplierForm);
    } else {
      addSupplier(supplierForm);
    }
    setSupplierForm({ name: "", phone: "", email: "", address: "", notes: "" });
    setShowSupplierForm(false);
    setEditingSupplier(null);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierForm({
      name: supplier.name,
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      notes: supplier.notes || "",
    });
    setShowSupplierForm(true);
  };

  const handleDeleteSupplier = (id: string) => {
    if (confirm("¿Eliminar este proveedor?")) {
      deleteSupplier(id);
    }
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = orderForm.items.reduce(
      (sum, i) => sum + i.quantity * i.cost,
      0
    );
    addSupplierOrder({
      supplierId: orderForm.supplierId,
      items: orderForm.items,
      status: "pending",
      totalAmount,
      expectedDate: orderForm.expectedDate || undefined,
      notes: orderForm.notes || undefined,
    });
    setOrderForm({ supplierId: "", items: [], expectedDate: "", notes: "" });
    setShowOrderForm(false);
  };

  const addItemToOrder = () => {
    setOrderForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { productId: "", productName: "", quantity: 1, cost: 0 },
      ],
    }));
  };

  const updateOrderItem = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setOrderForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item;
        if (field === "productId") {
          const product = products.find((p) => p.id === value);
          return {
            ...item,
            productId: value as string,
            productName: product?.name || "",
            cost: product?.cost || 0,
          };
        }
        return { ...item, [field]: value };
      }),
    }));
  };

  const removeOrderItem = (index: number) => {
    setOrderForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const getSupplierName = (id: string) =>
    suppliers.find((s) => s.id === id)?.name || "Desconocido";

  const getStatusBadge = (status: SupplierOrder["status"]) => {
    const styles = {
      pending: "bg-warning/10 text-warning",
      ordered: "bg-primary/10 text-primary",
      received: "bg-success/10 text-success",
      cancelled: "bg-muted text-muted-foreground",
    };
    const labels = {
      pending: "Pendiente",
      ordered: "Ordenado",
      received: "Recibido",
      cancelled: "Cancelado",
    };
    return (
      <span
        className={cn(
          "px-2 py-1 rounded-lg text-xs font-medium",
          styles[status]
        )}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Proveedores"
          value={suppliers.length.toString()}
          icon={<Truck className="w-5 h-5" />}
          variant="primary"
        />
        <MetricCard
          title="Pedidos pendientes"
          value={pendingOrders.length.toString()}
          icon={<ClipboardList className="w-5 h-5" />}
          subtitle={formatCurrency(totalPendingValue, settings.currencySymbol)}
          variant="warning"
        />
        <MetricCard
          title="Stock crítico"
          value={criticalStock.length.toString()}
          icon={<AlertTriangle className="w-5 h-5" />}
          subtitle="Sin pedidos activos"
          variant={criticalStock.length > 0 ? "destructive" : "default"}
        />
        <MetricCard
          title="Productos"
          value={products.length.toString()}
          icon={<Package className="w-5 h-5" />}
          variant="default"
        />
      </div>

      {/* Critical Stock Alert */}
      {criticalStock.length > 0 && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-destructive">
              Productos con stock crítico
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {criticalStock.slice(0, 5).map((p) => (
              <span
                key={p.id}
                className="px-3 py-1 bg-background rounded-lg text-sm"
              >
                {p.name} ({p.quantity} uds)
              </span>
            ))}
            {criticalStock.length > 5 && (
              <span className="px-3 py-1 bg-background rounded-lg text-sm text-muted-foreground">
                +{criticalStock.length - 5} más
              </span>
            )}
          </div>
        </div>
      )}

      {/* View Toggle and Export */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1">
          <button
            onClick={() => setViewMode("suppliers")}
            className={cn(
              "flex-1 py-3 rounded-xl font-medium transition-all",
              viewMode === "suppliers"
                ? "bg-primary text-primary-foreground shadow-material"
                : "bg-muted text-muted-foreground"
            )}
          >
            Proveedores
          </button>
          <button
            onClick={() => setViewMode("orders")}
            className={cn(
              "flex-1 py-3 rounded-xl font-medium transition-all",
              viewMode === "orders"
                ? "bg-primary text-primary-foreground shadow-material"
                : "bg-muted text-muted-foreground"
            )}
          >
            Pedidos
          </button>
        </div>
        {viewMode === "suppliers" ? (
          <ExportButtons
            data={useMemo<ExportData>(
              () => ({
                title: "Reporte de Proveedores",
                headers: ["Nombre", "Teléfono", "Email", "Dirección", "Notas"],
                rows: suppliers.map((supplier) => [
                  supplier.name,
                  supplier.phone || "-",
                  supplier.email || "-",
                  supplier.address || "-",
                  supplier.notes || "-",
                ]),
                summary: [
                  { label: "Total proveedores", value: suppliers.length },
                ],
              }),
              [suppliers]
            )}
            filename="proveedores"
            isPremium={isPremium}
          />
        ) : (
          <ExportButtons
            data={useMemo<ExportData>(
              () => ({
                title: "Reporte de Pedidos a Proveedores",
                headers: [
                  "Proveedor",
                  "Estado",
                  "Total",
                  "Fecha Esperada",
                  "Productos",
                  "Notas",
                ],
                rows: supplierOrders.map((order) => {
                  const supplier = suppliers.find(
                    (s) => s.id === order.supplierId
                  );
                  const statusLabels = {
                    pending: "Pendiente",
                    ordered: "Ordenado",
                    received: "Recibido",
                    cancelled: "Cancelado",
                  };
                  return [
                    supplier?.name || "Desconocido",
                    statusLabels[order.status],
                    order.totalAmount,
                    order.expectedDate
                      ? new Date(order.expectedDate).toLocaleDateString("es-ES")
                      : "-",
                    order.items.length.toString(),
                    order.notes || "-",
                  ];
                }),
                summary: [
                  { label: "Total pedidos", value: supplierOrders.length },
                  { label: "Pedidos pendientes", value: pendingOrders.length },
                  {
                    label: "Valor pendiente",
                    value: formatCurrency(
                      totalPendingValue,
                      settings.currencySymbol
                    ),
                  },
                ],
              }),
              [
                supplierOrders,
                suppliers,
                pendingOrders.length,
                totalPendingValue,
                settings.currencySymbol,
              ]
            )}
            filename="pedidos-proveedores"
            isPremium={isPremium}
          />
        )}
      </div>

      {/* Content */}
      {viewMode === "suppliers" ? (
        <div className="space-y-3">
          {suppliers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay proveedores registrados</p>
            </div>
          ) : (
            suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-card rounded-2xl border border-border p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{supplier.name}</h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                      {supplier.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {supplier.phone}
                        </span>
                      )}
                      {supplier.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {supplier.email}
                        </span>
                      )}
                      {supplier.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {supplier.address}
                        </span>
                      )}
                    </div>
                    {supplier.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {supplier.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditSupplier(supplier)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSupplier(supplier.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {supplierOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay pedidos registrados</p>
            </div>
          ) : (
            supplierOrders.map((order) => (
              <div
                key={order.id}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                <div
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder === order.id ? null : order.id
                    )
                  }
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {getSupplierName(order.supplierId)}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>{order.items.length} productos</span>
                      <span>•</span>
                      <span className="font-medium">
                        {formatCurrency(
                          order.totalAmount,
                          settings.currencySymbol
                        )}
                      </span>
                      {order.expectedDate && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(order.expectedDate).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {expandedOrder === order.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>

                {expandedOrder === order.id && (
                  <div className="border-t border-border p-4 space-y-3">
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{item.productName}</span>
                          <span className="text-muted-foreground">
                            {item.quantity} x{" "}
                            {formatCurrency(item.cost, settings.currencySymbol)}
                          </span>
                        </div>
                      ))}
                    </div>
                    {order.notes && (
                      <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                        {order.notes}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2">
                      {order.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateSupplierOrder(order.id, {
                                status: "ordered",
                              })
                            }
                          >
                            Marcar como ordenado
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              updateSupplierOrder(order.id, {
                                status: "cancelled",
                              })
                            }
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                      {order.status === "ordered" && (
                        <Button
                          size="sm"
                          className="gradient-primary"
                          onClick={() => receiveSupplierOrder(order.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Marcar recibido
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto text-destructive"
                        onClick={() => {
                          if (confirm("¿Eliminar este pedido?"))
                            deleteSupplierOrder(order.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Floating Button */}
      <FloatingButton
        onClick={() =>
          viewMode === "suppliers"
            ? setShowSupplierForm(true)
            : setShowOrderForm(true)
        }
        label={viewMode === "suppliers" ? "Nuevo Proveedor" : "Nuevo Pedido"}
      />

      {/* Supplier Form Modal */}
      {showSupplierForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => {
              setShowSupplierForm(false);
              setEditingSupplier(null);
            }}
          />
          <div className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl shadow-material-xl max-h-[90vh] overflow-auto">
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-muted" />
            </div>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">
                {editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
              </h2>
              <button
                onClick={() => {
                  setShowSupplierForm(false);
                  setEditingSupplier(null);
                }}
                className="p-2 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSupplierSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={supplierForm.name}
                  onChange={(e) =>
                    setSupplierForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Nombre del proveedor"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={supplierForm.phone}
                    onChange={(e) =>
                      setSupplierForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Teléfono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) =>
                      setSupplierForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input
                  value={supplierForm.address}
                  onChange={(e) =>
                    setSupplierForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Dirección"
                />
              </div>
              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  value={supplierForm.notes}
                  onChange={(e) =>
                    setSupplierForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Notas adicionales"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowSupplierForm(false);
                    setEditingSupplier(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 gradient-primary">
                  {editingSupplier ? "Guardar" : "Agregar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setShowOrderForm(false)}
          />
          <div className="relative w-full sm:max-w-lg bg-card rounded-t-3xl sm:rounded-2xl shadow-material-xl max-h-[90vh] overflow-auto">
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-muted" />
            </div>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Nuevo Pedido</h2>
              <button
                onClick={() => setShowOrderForm(false)}
                className="p-2 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleOrderSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Proveedor *</Label>
                <select
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                  value={orderForm.supplierId}
                  onChange={(e) =>
                    setOrderForm((prev) => ({
                      ...prev,
                      supplierId: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Seleccionar proveedor</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Productos</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={addItemToOrder}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Agregar
                  </Button>
                </div>
                <div className="space-y-2">
                  {orderForm.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <select
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                          value={item.productId}
                          onChange={(e) =>
                            updateOrderItem(index, "productId", e.target.value)
                          }
                        >
                          <option value="">Producto</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Input
                        type="number"
                        placeholder="Cant."
                        className="w-20"
                        value={item.quantity}
                        onChange={(e) =>
                          updateOrderItem(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        min={1}
                      />
                      <Input
                        type="number"
                        placeholder="Costo"
                        className="w-24"
                        value={item.cost}
                        onChange={(e) =>
                          updateOrderItem(
                            index,
                            "cost",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        step="0.01"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeOrderItem(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {orderForm.items.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Agrega productos al pedido
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fecha esperada de entrega</Label>
                <Input
                  type="date"
                  value={orderForm.expectedDate}
                  onChange={(e) =>
                    setOrderForm((prev) => ({
                      ...prev,
                      expectedDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  value={orderForm.notes}
                  onChange={(e) =>
                    setOrderForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Notas del pedido"
                  rows={2}
                />
              </div>

              {orderForm.items.length > 0 && (
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <span className="text-sm text-muted-foreground">Total: </span>
                  <span className="font-semibold">
                    {formatCurrency(
                      orderForm.items.reduce(
                        (sum, i) => sum + i.quantity * i.cost,
                        0
                      ),
                      settings.currencySymbol
                    )}
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowOrderForm(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 gradient-primary"
                  disabled={
                    !orderForm.supplierId || orderForm.items.length === 0
                  }
                >
                  Crear Pedido
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proveedores;
