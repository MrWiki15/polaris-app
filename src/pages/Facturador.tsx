import React, { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { FileText, Download, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { DEPARTMENT_PERMISSIONS } from "@/components/layout/AppLayout";
import jsPDF from "jspdf";

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export const Facturador: React.FC = () => {
  const { data, addSale, currentProject, currentProjectMember } = useApp();
  const { settings, products, clients } = data;

  const isProjectSelected = !!currentProject;
  const department = currentProjectMember?.departament;
  const permissions = department
    ? DEPARTMENT_PERMISSIONS[department]
    : undefined;
  const isAuthorizedForPage =
    !isProjectSelected ||
    !department ||
    !permissions ||
    permissions.includes("all") ||
    permissions.includes("/herramientas/facturador");

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, price: 0 },
  ]);
  const [invoiceNumber, setInvoiceNumber] = useState(
    `FAC-${Date.now().toString().slice(-6)}`,
  );
  const [registerAsSale, setRegisterAsSale] = useState(true);

  const customerClients = useMemo(
    () => clients.filter((c) => c.type === "cliente"),
    [clients],
  );

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }, [items]);

  const handleSelectClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setSelectedClientId(clientId);
      setClientName(client.name);
      setClientPhone(client.phone || "");
    }
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number,
  ) => {
    const newItems = [...items];
    if (field === "description") {
      newItems[index][field] = value as string;
    } else {
      newItems[index][field] = parseFloat(value as string) || 0;
    }
    setItems(newItems);
  };

  const addProductToInvoice = (product: (typeof products)[0]) => {
    const existingIndex = items.findIndex(
      (i) => i.description === product.name,
    );
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      setItems(newItems);
    } else {
      setItems([
        ...items.filter((i) => i.description),
        {
          description: product.name,
          quantity: 1,
          price: product.price,
        },
      ]);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(settings.businessName || "Polaris", 20, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (settings.businessPhone) {
      doc.text(`Tel: ${settings.businessPhone}`, pageWidth - 20, 20, {
        align: "right",
      });
    }
    if (settings.businessAddress) {
      doc.text(settings.businessAddress, pageWidth - 20, 28, {
        align: "right",
      });
    }

    // Invoice info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURA", 20, 55);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Número: ${invoiceNumber}`, 20, 62);
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-ES")}`, 20, 69);

    // Client info
    doc.setFont("helvetica", "bold");
    doc.text("Cliente:", pageWidth - 80, 55);
    doc.setFont("helvetica", "normal");
    doc.text(clientName || "Cliente general", pageWidth - 80, 62);
    if (clientPhone) {
      doc.text(`Tel: ${clientPhone}`, pageWidth - 80, 69);
    }

    // Table header
    const tableTop = 85;
    doc.setFillColor(243, 244, 246);
    doc.rect(15, tableTop - 6, pageWidth - 30, 10, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Descripción", 20, tableTop);
    doc.text("Cant.", 120, tableTop);
    doc.text("Precio", 145, tableTop);
    doc.text("Total", 175, tableTop);

    // Table content
    doc.setFont("helvetica", "normal");
    let y = tableTop + 12;

    items
      .filter((i) => i.description)
      .forEach((item) => {
        doc.text(item.description.substring(0, 40), 20, y);
        doc.text(item.quantity.toString(), 120, y);
        doc.text(formatCurrency(item.price, settings.currencySymbol), 145, y);
        doc.text(
          formatCurrency(item.quantity * item.price, settings.currencySymbol),
          175,
          y,
        );
        y += 8;
      });

    // Total
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, y, pageWidth - 15, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL:", 145, y);
    doc.text(formatCurrency(total, settings.currencySymbol), 175, y);

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text("Gracias por su compra", pageWidth / 2, 280, { align: "center" });
    doc.text("Generado con Polaris", pageWidth / 2, 285, { align: "center" });

    // Save
    doc.save(`factura_${invoiceNumber}.pdf`);

    // Register as sale if enabled
    if (registerAsSale && total > 0) {
      addSale({
        date: new Date().toISOString().split("T")[0],
        amount: total,
        category: "Ventas",
        description: `Factura ${invoiceNumber}${
          clientName ? ` - ${clientName}` : ""
        }`,
      });
      toast({
        title: "Venta registrada",
        description: `Se registró una venta por ${formatCurrency(
          total,
          settings.currencySymbol,
        )}`,
      });
    }

    // Reset for next invoice
    setInvoiceNumber(`FAC-${Date.now().toString().slice(-6)}`);
    setItems([{ description: "", quantity: 1, price: 0 }]);
    setClientName("");
    setClientPhone("");
    setSelectedClientId("");

    toast({
      title: "Factura generada",
      description: "El PDF se ha descargado correctamente",
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {isProjectSelected && !isAuthorizedForPage && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-2">Acceso restringido</h2>
            <p className="text-sm text-muted-foreground">
              Solo el personal autorizado puede acceder a esta sección en el
              proyecto seleccionado.
            </p>
          </div>
        </div>
      )}
      {isProjectSelected && (
        <div className="mb-4 rounded-xl border border-border p-3 bg-muted/40 text-sm">
          <div className="font-medium">
            Modo proyecto: {currentProject?.name} (Facturador)
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 sm:p-6 border border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold">Facturador Offline</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Genera facturas PDF y regístralas automáticamente como ventas
        </p>
      </div>

      {/* Invoice Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Invoice & Client Info */}
          <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-soft border border-border">
            <h3 className="font-semibold mb-4">Información de la factura</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Número de factura</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientName">Nombre del cliente</Label>
                <Input
                  id="clientName"
                  placeholder="Cliente general"
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    setSelectedClientId("");
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Teléfono (opcional)</Label>
                <Input
                  id="clientPhone"
                  placeholder="+53..."
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Registrar como venta</Label>
                <button
                  type="button"
                  onClick={() => setRegisterAsSale(!registerAsSale)}
                  className={cn(
                    "w-full p-3 rounded-xl border-2 transition-all text-sm font-medium",
                    registerAsSale
                      ? "border-success bg-success/10 text-success"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {registerAsSale
                    ? "✓ Sí, registrar venta"
                    : "No registrar venta"}
                </button>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-soft border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Productos / Servicios</h3>
              <Button size="sm" variant="outline" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Agregar</span>
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-2 sm:items-end p-3 bg-muted/50 rounded-xl"
                >
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Descripción</Label>
                    <Input
                      placeholder="Producto o servicio"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                    />
                  </div>
                  <div className="w-full sm:w-20 space-y-1">
                    <Label className="text-xs">Cant.</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                    />
                  </div>
                  <div className="w-full sm:w-28 space-y-1">
                    <Label className="text-xs">Precio</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(index, "price", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0">
                    <span className="font-semibold text-success sm:hidden">
                      {formatCurrency(
                        item.quantity * item.price,
                        settings.currencySymbol,
                      )}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <span className="font-semibold text-lg">Total</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(total, settings.currencySymbol)}
              </span>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            className="w-full gradient-primary text-lg py-6"
            onClick={generatePDF}
            disabled={!items.some((i) => i.description)}
          >
            <Download className="w-5 h-5 mr-2" />
            Generar Factura PDF
          </Button>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Clients from CRM */}
          {customerClients.length > 0 && (
            <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-soft border border-border">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Clientes del CRM
              </h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {customerClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left",
                      selectedClientId === client.id
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-muted hover:bg-muted/80 border-2 border-transparent",
                    )}
                  >
                    <div>
                      <span className="font-medium text-sm">{client.name}</span>
                      {client.phone && (
                        <span className="block text-xs text-muted-foreground">
                          {client.phone}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-soft border border-border">
            <h3 className="font-semibold mb-3">Agregar del inventario</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {products.length > 0 ? (
                products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addProductToInvoice(product)}
                    className="w-full flex items-center justify-between p-3 bg-muted hover:bg-muted/80 rounded-xl transition-colors text-left"
                  >
                    <div>
                      <span className="font-medium text-sm">
                        {product.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {formatCurrency(product.price, settings.currencySymbol)}
                      </span>
                    </div>
                    <Plus className="w-4 h-4 text-primary" />
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay productos en el inventario
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Facturador;
