import React, { useState } from "react";
import { X, Package, DollarSign, ScanBarcode, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagSelector } from "@/components/forms/TagSelector";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { formatCurrency, Service, ServiceIncome } from "@/lib/storage";
import { BarcodeScanner } from "@/components/inventory/BarcodeScanner";
import { toast } from "sonner";

interface SaleFormProps {
  onClose: () => void;
  editingSale?: {
    id: string;
    date: string;
    amount: number;
    category: string;
    description?: string;
    productId?: string;
    quantity?: number;
    serviceId?: string;
    tags?: string[];
    clientId?: string;
  };
}

export const SaleForm: React.FC<SaleFormProps> = ({ onClose, editingSale }) => {
  const {
    addSale,
    updateSale,
    addServiceIncome,
    updateServiceIncome,
    addExpense,
    data,
  } = useApp();
  const { products, settings, services, clients } = data;
  const isPremium = settings.isPremium || false;

  const [saleType, setSaleType] = useState<"manual" | "inventory" | "service">(
    editingSale?.productId
      ? "inventory"
      : editingSale?.serviceId
        ? "service"
        : "manual",
  );
  const [categories, setCategories] = useState([
    "Alimentos",
    "Bebidas",
    "Higiene",
    "Limpieza",
    "Electrónica",
    "Ropa",
    "Remesa",
    "Recargas",
    "Envios",
    "Otros",
  ]);

  // Helper to ensure we only get the YYYY-MM-DD part
  const getInitialDate = () => {
    if (editingSale?.date) {
      return editingSale.date.split("T")[0];
    }
    // Returns local date in YYYY-MM-DD format
    return new Date().toLocaleDateString("en-CA");
  };

  const [formData, setFormData] = useState({
    date: getInitialDate(),
    amount: editingSale?.amount?.toString() || "",
    category: editingSale?.category || categories[0],
    description: editingSale?.description || "",
    productId: editingSale?.productId || "",
    quantity: editingSale?.quantity?.toString() || "1",
    serviceId: editingSale?.serviceId || "",
    tags: editingSale?.tags || [],
    clientId: editingSale?.clientId || "",
  });
  const [showScanner, setShowScanner] = useState(false);
  const [showImputFromNewCategory, setShowInputFromNewCategory] =
    useState(false);
  const [newCategory, setNewcategory] = useState("");
  const [selectedPriceVariant, setSelectedPriceVariant] =
    useState<string>("default");
  const [serviceSelectedMargin, setServiceSelectedMargin] = useState<
    number | "" | "custom"
  >("");
  const [serviceInvestorPercent, setServiceInvestorPercent] = useState<
    number | ""
  >("");
  const [selectedService, setSelectedService] = useState<Service | undefined>();

  const handleScan = (code: string) => {
    const product = products.find((p) => p.barcode === code);
    if (product) {
      setFormData((prev) => ({
        ...prev,
        productId: product.id,
        quantity: "1",
      }));
      setSaleType("inventory");
      setSelectedPriceVariant("default");
      toast.success(`Producto encontrado: ${product.name}`);
    } else {
      toast.error("Producto no encontrado en el inventario");
    }
    setShowScanner(false);
  };

  const handleAddCategory = () => {
    setCategories((prev) => [...prev, newCategory]);
    setFormData((prev) => ({
      ...prev,
      category: newCategory,
    }));
    setNewcategory("");
    setShowInputFromNewCategory(false);
  };

  const selectedProduct = products.find((p) => p.id === formData.productId);

  const getSelectedPrice = () => {
    if (!selectedProduct) return 0;
    if (selectedPriceVariant === "default") return selectedProduct.price;
    const variant = selectedProduct.additionalPrices?.find(
      (p) => p.id === selectedPriceVariant,
    );
    return variant ? variant.price : selectedProduct.price;
  };

  const unitPrice = getSelectedPrice();
  const calculatedAmount = unitPrice * parseInt(formData.quantity || "1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure we only send the date part
    const cleanDate = formData.date.split("T")[0];

    if (saleType === "service") {
      const svc = services.find((s) => s.id === formData.serviceId);
      if (!svc) return;

      // Validar que si es precio variable, el usuario ingresó un monto
      if (svc.priceType === "variable" && !formData.amount) {
        alert(
          "Debes ingresar el monto cobrado para servicios de precio variable",
        );
        return;
      }

      // Validar que si seleccionó margen personalizado, tiene un número
      if (serviceSelectedMargin === "custom") {
        alert("Si elegiste margen personalizado, debes ingresar un valor en %");
        return;
      }

      const gross =
        svc.priceType === "variable"
          ? parseFloat(formData.amount)
          : svc.price || 0;
      const marginPercent =
        typeof serviceSelectedMargin === "number"
          ? serviceSelectedMargin
          : svc.priceType === "variable"
            ? undefined
            : 100;
      const ownerNet =
        marginPercent !== undefined ? (gross * marginPercent) / 100 : gross;
      const investorPct =
        serviceInvestorPercent !== ""
          ? Number(serviceInvestorPercent)
          : undefined;

      const serviceData: Omit<ServiceIncome, "id"> = {
        date: cleanDate,
        amount: ownerNet,
        gross,
        serviceId: formData.serviceId,
        selectedMargin: marginPercent,
        investorPercent: investorPct,
        description: formData.description || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        clientId: formData.clientId || undefined,
      };

      if (editingSale) {
        updateServiceIncome(editingSale.id, serviceData);
      } else {
        addServiceIncome(serviceData);
        if (investorPct && investorPct > 0) {
          const expenseAmount = (gross * investorPct) / 100;
          addExpense({
            date: cleanDate,
            amount: expenseAmount,
            category: `Gasto - ${svc.name}`,
            description: `Gasto (${investorPct}%) por ${svc.name}`,
          });
        }
      }
    } else if (saleType === "inventory") {
      // Validar productos compuestos
      if (selectedProduct?.type === "compound" && selectedProduct.components) {
        const quantity = parseInt(formData.quantity);
        for (const component of selectedProduct.components) {
          const componentProduct = products.find(
            (p) => p.id === component.productId,
          );
          const requiredQuantity = component.quantity * quantity;
          if (
            !componentProduct ||
            componentProduct.quantity < requiredQuantity
          ) {
            alert(
              `No hay suficiente ${componentProduct?.name || "producto"} en inventario. ` +
                `Necesitas ${requiredQuantity} unidades pero solo hay ${componentProduct?.quantity || 0}.`,
            );
            return;
          }
        }
      }

      let description = formData.description;
      if (selectedProduct) {
        description = `Ingreso: ${selectedProduct.name} x${formData.quantity}`;
        if (selectedPriceVariant !== "default") {
          const variant = selectedProduct.additionalPrices?.find(
            (p) => p.id === selectedPriceVariant,
          );
          if (variant) {
            description += ` (${variant.name})`;
          }
        }
      }

      const saleData = {
        date: cleanDate,
        amount: calculatedAmount,
        category: selectedProduct?.category
          ? selectedProduct.category
          : formData.category,
        description: description || undefined,
        productId: formData.productId,
        quantity: parseInt(formData.quantity),
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        clientId: formData.clientId || undefined,
      };

      if (editingSale) {
        updateSale(editingSale.id, saleData);
      } else {
        addSale(saleData);
      }
    } else {
      const description = formData.description;

      const saleData = {
        date: cleanDate,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: description || undefined,
        productId: undefined,
        quantity: undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        clientId: formData.clientId || undefined,
      };

      if (editingSale) {
        updateSale(editingSale.id, saleData);
      } else {
        addSale(saleData);
      }
    }

    onClose();
  };

  const availableProducts = products.filter((p) => p.quantity > 0);

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
            {editingSale ? "Editar Ingreso" : "Nuevo Ingreso"}
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
          {/* Sale Type Toggle */}
          {!editingSale && (
            <div className="space-y-2">
              <Label>Tipo de ingreso</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSaleType("manual")}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                    saleType === "manual"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground",
                  )}
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Manual</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSaleType("inventory")}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                    saleType === "inventory"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground",
                  )}
                >
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-medium">Inventario</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSaleType("service")}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                    saleType === "service"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground",
                  )}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Servicio</span>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              required
            />
          </div>

          {saleType === "inventory" ? (
            <>
              {/* Product Selection */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Producto</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-primary"
                    onClick={() => setShowScanner(true)}
                  >
                    <ScanBarcode className="w-4 h-4 mr-2" />
                    Escanear
                  </Button>
                </div>
                {availableProducts.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto space-y-2 border border-border rounded-xl p-2">
                    {availableProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            productId: product.id,
                          }))
                        }
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg transition-all text-left",
                          formData.productId === product.id
                            ? "bg-primary/10 border-2 border-primary"
                            : "bg-muted hover:bg-muted/80 border-2 border-transparent",
                        )}
                      >
                        <div>
                          <span className="font-medium text-sm">
                            {product.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            Stock: {product.quantity} |{" "}
                            {formatCurrency(
                              product.price,
                              settings.currencySymbol,
                            )}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-xl">
                    No hay productos disponibles
                  </p>
                )}
              </div>

              {/* Price Selection */}
              {selectedProduct &&
                selectedProduct.additionalPrices &&
                selectedProduct.additionalPrices.length > 0 && (
                  <div className="space-y-2">
                    <Label>Precio de venta</Label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPriceVariant("default")}
                        className={cn(
                          "px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                          selectedPriceVariant === "default"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:bg-muted",
                        )}
                      >
                        Principal (
                        {formatCurrency(
                          selectedProduct.price,
                          settings.currencySymbol,
                        )}
                        )
                      </button>
                      {selectedProduct.additionalPrices.map((price) => (
                        <button
                          key={price.id}
                          type="button"
                          onClick={() => setSelectedPriceVariant(price.id)}
                          className={cn(
                            "px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                            selectedPriceVariant === price.id
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border hover:bg-muted",
                          )}
                        >
                          {price.name} (
                          {formatCurrency(price.price, settings.currencySymbol)}
                          )
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Quantity */}
              {selectedProduct && (
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedProduct.quantity}
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        quantity: e.target.value,
                      }))
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Disponible: {selectedProduct.quantity} unidades
                  </p>
                </div>
              )}

              {/* Calculated Amount */}
              {selectedProduct && (
                <div className="p-4 bg-success/10 rounded-xl border border-success/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Total de la ingreso
                    </span>
                    <span className="text-xl font-bold text-success">
                      {formatCurrency(
                        calculatedAmount,
                        settings.currencySymbol,
                      )}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : saleType === "service" ? (
            <>
              <div className="space-y-2">
                <Label>Servicio</Label>
                {services.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto space-y-2 border border-border rounded-xl p-2">
                    {services.map((svc) => (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            serviceId: svc.id,
                          }));
                          setSelectedService(svc);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg transition-all text-left",
                          formData.serviceId === svc.id
                            ? "bg-primary/10 border-2 border-primary"
                            : "bg-muted hover:bg-muted/80 border-2 border-transparent",
                        )}
                      >
                        <div>
                          <span className="font-medium text-sm">
                            {svc.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {svc.priceType === "variable"
                              ? "Precio variable"
                              : formatCurrency(
                                  svc.price || 0,
                                  settings.currencySymbol,
                                )}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-xl">
                    No hay servicios en el catálogo
                  </p>
                )}
              </div>

              {selectedService?.priceType === "variable" && (
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto cobrado ($) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              )}

              {selectedService?.priceType !== "variable" && selectedService && (
                <div className="p-4 bg-success/10 rounded-xl border border-success/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Monto del servicio
                    </span>
                    <span className="text-xl font-bold text-success">
                      {formatCurrency(
                        selectedService.price || 0,
                        settings.currencySymbol,
                      )}
                    </span>
                  </div>
                </div>
              )}

              {selectedService && (
                <div className="space-y-3">
                  <Label>Margen a aplicar</Label>
                  <div className="space-y-2">
                    {selectedService.minMargin !== undefined && (
                      <button
                        type="button"
                        onClick={() =>
                          setServiceSelectedMargin(selectedService.minMargin!)
                        }
                        className={cn(
                          "w-full p-3 rounded-lg border-2 transition-all text-left",
                          serviceSelectedMargin === selectedService.minMargin
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
                          <div className="text-lg font-bold">
                            {selectedService.minMargin}%
                          </div>
                        </div>
                      </button>
                    )}

                    {selectedService.standardMargin !== undefined && (
                      <button
                        type="button"
                        onClick={() =>
                          setServiceSelectedMargin(
                            selectedService.standardMargin!,
                          )
                        }
                        className={cn(
                          "w-full p-3 rounded-lg border-2 transition-all text-left",
                          serviceSelectedMargin ===
                            selectedService.standardMargin
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
                          <div className="text-lg font-bold">
                            {selectedService.standardMargin}%
                          </div>
                        </div>
                      </button>
                    )}

                    <div>
                      <button
                        type="button"
                        onClick={() => setServiceSelectedMargin("custom")}
                        className={cn(
                          "w-full p-3 rounded-lg border-2 transition-all text-left",
                          serviceSelectedMargin === "custom"
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
                          <div className="text-lg font-bold">Otro</div>
                        </div>
                      </button>
                      {serviceSelectedMargin === "custom" && (
                        <Input
                          type="number"
                          placeholder="Ingresa el margen en %"
                          value={
                            typeof serviceSelectedMargin === "number"
                              ? serviceSelectedMargin
                              : ""
                          }
                          onChange={(e) =>
                            setServiceSelectedMargin(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : "custom",
                            )
                          }
                          step="0.01"
                          min="0"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="investor-percent">
                      Gasto del servicio (opcional %)
                    </Label>
                    <Input
                      id="investor-percent"
                      type="number"
                      placeholder="Ej: 5"
                      value={
                        serviceInvestorPercent === ""
                          ? ""
                          : String(serviceInvestorPercent)
                      }
                      onChange={(e) =>
                        setServiceInvestorPercent(
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
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Detalles (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Describe brevemente el servicio"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="amount">Monto</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  required
                  className="text-lg font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Añadir nota..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          )}

          {isPremium && (
            <div className="space-y-2">
              <Label htmlFor="client">Cliente (opcional)</Label>
              <select
                id="client"
                value={formData.clientId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, clientId: e.target.value }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">Sin cliente</option>
                {clients
                  .filter((c) => c.type === "cliente")
                  .map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
              </select>
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
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
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

          {/* Tags */}
          <TagSelector
            selectedTags={formData.tags}
            onTagsChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
          />

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
                saleType === "manual"
                  ? !formData.amount
                  : saleType === "inventory"
                    ? !formData.productId || !formData.quantity
                    : !formData.serviceId ||
                      (selectedService?.priceType === "variable" &&
                        !formData.amount)
              }
            >
              {editingSale ? "Guardar" : "Registrar"}
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
