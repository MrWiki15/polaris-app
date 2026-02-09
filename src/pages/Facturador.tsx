import React, { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  FileText,
  Download,
  Plus,
  Trash2,
  Users,
  Upload,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { DEPARTMENT_PERMISSIONS } from "@/components/layout/AppLayout";
import jsPDF from "jspdf";
import { generateInvoiceDraft } from "@/lib/ai/invoiceGenerator";

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export const Facturador: React.FC = () => {
  const {
    data,
    addSale,
    currentProject,
    currentProjectMember,
    updateSettings,
  } = useApp();
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
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, price: 0 },
  ]);
  const [invoiceNumber, setInvoiceNumber] = useState(
    `FAC-${Date.now().toString().slice(-6)}`,
  );
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date.toISOString().split("T")[0];
  });
  const [taxRate, setTaxRate] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [terms, setTerms] = useState("Gracias por su preferencia.");
  const [notes, setNotes] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState<string>(
    settings.businessLogo || "",
  );
  const [businessName, setBusinessName] = useState(settings.businessName || "");
  const [businessPhone, setBusinessPhone] = useState(
    settings.businessPhone || "",
  );
  const [businessAddress, setBusinessAddress] = useState(
    settings.businessAddress || "",
  );
  const [businessEmail, setBusinessEmail] = useState(
    settings.businessEmail || "",
  );
  const [aiBrief, setAiBrief] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [registerAsSale, setRegisterAsSale] = useState(true);

  const customerClients = useMemo(
    () => clients.filter((c) => c.type === "cliente"),
    [clients],
  );

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }, [items]);
  const taxAmount = useMemo(() => (total * taxRate) / 100, [total, taxRate]);
  const grandTotal = useMemo(() => total + taxAmount, [total, taxAmount]);
  const amountDue = useMemo(
    () => Math.max(0, grandTotal - amountPaid),
    [grandTotal, amountPaid],
  );

  const handleSelectClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setSelectedClientId(clientId);
      setClientName(client.name);
      setClientPhone(client.phone || "");
      setClientEmail(client.email || "");
      setClientAddress(client.address || "");
    }
  };

  const handleLogoUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoDataUrl(result);
      updateSettings({ businessLogo: result });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateWithPolo = async () => {
    setAiLoading(true);
    try {
      const draft = await generateInvoiceDraft({
        appData: data,
        businessName,
        businessAddress,
        businessPhone,
        businessEmail,
        clientName,
        clientAddress,
        clientEmail,
        currencySymbol: settings.currencySymbol,
        brief: aiBrief,
      });

      if (draft.items?.length) {
        setItems(
          draft.items.map((item) => ({
            description: item.description,
            quantity: item.quantity || 1,
            price: item.price || 0,
          })),
        );
      }
      if (typeof draft.taxRate === "number") {
        setTaxRate(draft.taxRate);
      }
      if (draft.terms) setTerms(draft.terms);
      if (draft.notes) setNotes(draft.notes);

      // Actualiza datos de empresa y cliente si Polo los extrajo
      if (draft.businessName) {
        setBusinessName(draft.businessName);
      }
      if (draft.clientName) {
        setClientName(draft.clientName);
      }

      toast({
        title: "Plantilla generada",
        description: "Polo generó una propuesta editable para tu factura.",
      });
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        description: "No se pudo generar la plantilla con Polo.",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
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
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 12;
    const rightX = pageWidth - marginX;
    const contentWidth = pageWidth - marginX * 2;
    const themePrimary = { r: 86, g: 170, b: 235 };
    const themeLight = { r: 230, g: 244, b: 255 };
    const themeLine = { r: 195, g: 225, b: 245 };
    const textMuted = { r: 90, g: 110, b: 125 };

    const getImageFormat = (dataUrl: string) => {
      const match = dataUrl.match(/^data:image\/(png|jpg|jpeg);/i);
      if (!match) return "PNG";
      const type = match[1].toLowerCase();
      if (type === "jpg" || type === "jpeg") return "JPEG";
      return "PNG";
    };

    // Header band
    doc.setFillColor(themeLight.r, themeLight.g, themeLight.b);
    doc.rect(0, 0, pageWidth, 42, "F");
    doc.setDrawColor(themeLine.r, themeLine.g, themeLine.b);
    doc.setLineWidth(0.6);
    doc.line(0, 42, pageWidth, 42);

    // Logo and business info
    if (logoDataUrl) {
      try {
        doc.addImage(
          logoDataUrl,
          getImageFormat(logoDataUrl),
          marginX,
          8,
          24,
          24,
        );
      } catch (err) {
        console.log(err);
        // Ignore invalid image
      }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(themePrimary.r, themePrimary.g, themePrimary.b);
    doc.text(businessName || settings.businessName || "Polaris", rightX, 18, {
      align: "right",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
    if (businessPhone) {
      doc.text(`Tel: ${businessPhone}`, rightX, 25, { align: "right" });
    }
    if (businessEmail) {
      doc.text(businessEmail, rightX, 31, { align: "right" });
    }
    if (businessAddress) {
      doc.text(businessAddress, rightX, 37, { align: "right" });
    }

    // Invoice info
    const headerBottom = 42;
    const infoTop = headerBottom + 12;
    doc.setTextColor(themePrimary.r, themePrimary.g, themePrimary.b);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("FACTURA", marginX, infoTop);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Número: ${invoiceNumber}`, marginX, infoTop + 7);
    doc.text(`Fecha emisión: ${issueDate}`, marginX, infoTop + 13);
    doc.text(`Vence: ${dueDate}`, marginX, infoTop + 19);

    // Amount due
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
    doc.text("Monto adeudado", rightX, infoTop + 7, { align: "right" });
    doc.setFontSize(18);
    doc.setTextColor(themePrimary.r, themePrimary.g, themePrimary.b);
    doc.text(
      formatCurrency(amountDue, settings.currencySymbol),
      rightX,
      infoTop + 18,
      {
        align: "right",
      },
    );

    // Client info box
    const clientBoxTop = infoTop + 28;
    doc.setFillColor(themeLight.r, themeLight.g, themeLight.b);
    doc.rect(marginX, clientBoxTop, contentWidth, 34, "F");
    doc.setDrawColor(themeLine.r, themeLine.g, themeLine.b);
    doc.rect(marginX, clientBoxTop, contentWidth, 34);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Facturado a:", marginX + 6, clientBoxTop + 10);
    doc.setFont("helvetica", "normal");
    doc.text(clientName || "Cliente general", marginX + 6, clientBoxTop + 17);
    if (clientAddress) {
      doc.text(clientAddress, marginX + 6, clientBoxTop + 23);
    }
    if (clientEmail) {
      doc.text(clientEmail, marginX + 6, clientBoxTop + 29);
    }
    if (clientPhone) {
      doc.text(`Tel: ${clientPhone}`, rightX, clientBoxTop + 17, {
        align: "right",
      });
    }

    // Table header
    const tableTop = clientBoxTop + 52;
    const descX = marginX + 6;
    const qtyX = marginX + contentWidth * 0.6;
    const priceX = marginX + contentWidth * 0.75;
    const totalX = rightX - 2;

    doc.setFillColor(themePrimary.r, themePrimary.g, themePrimary.b);
    doc.rect(marginX, tableTop - 6, contentWidth, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Descripción", descX, tableTop);
    doc.text("Cant.", qtyX, tableTop);
    doc.text("Precio", priceX, tableTop);
    doc.text("Total", totalX, tableTop, { align: "right" });

    // Table content
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    let y = tableTop + 12;

    items
      .filter((i) => i.description)
      .forEach((item, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(246, 250, 255);
          doc.rect(marginX, y - 5, contentWidth, 8, "F");
        }
        doc.text(item.description.substring(0, 50), descX, y);
        doc.text(item.quantity.toString(), qtyX, y);
        doc.text(
          formatCurrency(item.price, settings.currencySymbol),
          priceX,
          y,
        );
        doc.text(
          formatCurrency(item.quantity * item.price, settings.currencySymbol),
          totalX,
          y,
          { align: "right" },
        );
        doc.setDrawColor(themeLine.r, themeLine.g, themeLine.b);
        doc.line(marginX, y + 3, rightX, y + 3);
        y += 8;
      });

    // Totals
    y += 6;
    doc.setDrawColor(themeLine.r, themeLine.g, themeLine.b);
    doc.line(marginX, y, rightX, y);
    y += 8;

    const totalsBoxWidth = contentWidth * 0.45;
    const totalsBoxX = rightX - totalsBoxWidth;
    const totalsBoxY = y - 4;
    const totalsBoxHeight = 34;
    doc.setFillColor(themeLight.r, themeLight.g, themeLight.b);
    doc.rect(totalsBoxX, totalsBoxY, totalsBoxWidth, totalsBoxHeight, "F");
    doc.setDrawColor(themeLine.r, themeLine.g, themeLine.b);
    doc.rect(totalsBoxX, totalsBoxY, totalsBoxWidth, totalsBoxHeight);

    const totalsLabelX = totalsBoxX + 6;
    const totalsValueX = rightX - 4;
    let totalsY = totalsBoxY + 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text("Subtotal", totalsLabelX, totalsY);
    doc.text(
      formatCurrency(total, settings.currencySymbol),
      totalsValueX,
      totalsY,
      {
        align: "right",
      },
    );
    totalsY += 6;
    doc.text(`Impuesto (${taxRate}%)`, totalsLabelX, totalsY);
    doc.text(
      formatCurrency(taxAmount, settings.currencySymbol),
      totalsValueX,
      totalsY,
      {
        align: "right",
      },
    );
    totalsY += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Total", totalsLabelX, totalsY);
    doc.text(
      formatCurrency(grandTotal, settings.currencySymbol),
      totalsValueX,
      totalsY,
      {
        align: "right",
      },
    );
    totalsY += 6;
    doc.setFont("helvetica", "normal");
    doc.text("Pagado", totalsLabelX, totalsY);
    doc.text(
      formatCurrency(amountPaid, settings.currencySymbol),
      totalsValueX,
      totalsY,
      {
        align: "right",
      },
    );
    totalsY += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Adeudado", totalsLabelX, totalsY);
    doc.text(
      formatCurrency(amountDue, settings.currencySymbol),
      totalsValueX,
      totalsY,
      {
        align: "right",
      },
    );

    // Terms & Notes
    const termsTop = Math.min(
      pageHeight - 50,
      totalsBoxY + totalsBoxHeight + 12,
    );
    doc.setFillColor(250, 252, 255);
    doc.rect(marginX, termsTop, contentWidth, 28, "F");
    doc.setDrawColor(themeLine.r, themeLine.g, themeLine.b);
    doc.rect(marginX, termsTop, contentWidth, 28);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
    doc.text("Términos:", marginX + 6, termsTop + 9);
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(terms || "", marginX + 6, termsTop + 15);
    if (notes) {
      doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
      doc.text("Notas:", marginX + 6, termsTop + 22);
      doc.setTextColor(0, 0, 0);
      doc.text(notes, marginX + 22, termsTop + 22);
    }

    // Footer
    doc.setDrawColor(themeLine.r, themeLine.g, themeLine.b);
    doc.line(marginX, pageHeight - 16, rightX, pageHeight - 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
    doc.text("Generado con Polaris", pageWidth / 2, pageHeight - 8, {
      align: "center",
    });

    // Save
    doc.save(`factura_${invoiceNumber}.pdf`);

    // Register as sale if enabled
    if (registerAsSale && grandTotal > 0) {
      addSale({
        date: new Date().toISOString().split("T")[0],
        amount: grandTotal,
        category: "Ventas",
        description: `Factura ${invoiceNumber}${
          clientName ? ` - ${clientName}` : ""
        }`,
      });
      toast({
        title: "Venta registrada",
        description: `Se registró una venta por ${formatCurrency(
          grandTotal,
          settings.currencySymbol,
        )}`,
      });
    }

    // Reset for next invoice
    setInvoiceNumber(`FAC-${Date.now().toString().slice(-6)}`);
    setItems([{ description: "", quantity: 1, price: 0 }]);
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setClientAddress("");
    setSelectedClientId("");
    const nextIssueDate = new Date().toISOString().split("T")[0];
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + 15);
    setIssueDate(nextIssueDate);
    setDueDate(nextDue.toISOString().split("T")[0]);

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
          {/* Business Info */}
          <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-soft border border-border">
            <h3 className="font-semibold mb-4">Datos del negocio</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Nombre del negocio</Label>
                <Input
                  id="businessName"
                  placeholder="Tu negocio"
                  value={businessName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBusinessName(value);
                    updateSettings({ businessName: value });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessPhone">Teléfono</Label>
                <Input
                  id="businessPhone"
                  placeholder="+53..."
                  value={businessPhone}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBusinessPhone(value);
                    updateSettings({ businessPhone: value });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessEmail">Email</Label>
                <Input
                  id="businessEmail"
                  placeholder="contacto@empresa.com"
                  value={businessEmail}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBusinessEmail(value);
                    updateSettings({ businessEmail: value });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessAddress">Dirección</Label>
                <Input
                  id="businessAddress"
                  placeholder="Calle, ciudad"
                  value={businessAddress}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBusinessAddress(value);
                    updateSettings({ businessAddress: value });
                  }}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Logotipo</Label>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <label className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Subir logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                    />
                  </label>
                  {logoDataUrl && (
                    <img
                      src={logoDataUrl}
                      alt="Logo"
                      className="h-12 w-12 rounded object-cover border border-border"
                    />
                  )}
                  {logoDataUrl && (
                    <button
                      type="button"
                      className="text-xs text-destructive"
                      onClick={() => {
                        setLogoDataUrl("");
                        updateSettings({ businessLogo: "" });
                      }}
                    >
                      Quitar logo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-soft border border-border">
            <h3 className="font-semibold mb-4">Datos del cliente</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Label htmlFor="clientPhone">Teléfono</Label>
                <Input
                  id="clientPhone"
                  placeholder="+53..."
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  placeholder="cliente@correo.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientAddress">Dirección</Label>
                <Input
                  id="clientAddress"
                  placeholder="Dirección del cliente"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Invoice Meta */}
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
                <Label htmlFor="issueDate">Fecha de emisión</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Fecha de vencimiento</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Impuesto (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amountPaid">Monto pagado</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) =>
                    setAmountPaid(parseFloat(e.target.value) || 0)
                  }
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
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(total, settings.currencySymbol)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Impuesto</span>
                <span>
                  {formatCurrency(taxAmount, settings.currencySymbol)}
                </span>
              </div>
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">
                  {formatCurrency(grandTotal, settings.currencySymbol)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Monto adeudado</span>
                <span>
                  {formatCurrency(amountDue, settings.currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          {/* Terms & Notes */}
          <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-soft border border-border">
            <h3 className="font-semibold mb-4">Condiciones y notas</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="terms">Términos</Label>
                <textarea
                  id="terms"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Condiciones de pago, garantías, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Nota breve de cortesía o detalles adicionales"
                />
              </div>
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
          <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-soft border border-border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Polo - Factura inteligente
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Polo puede generar una plantilla editable a partir de datos
              básicos.
            </p>
            <div className="space-y-3">
              <textarea
                value={aiBrief}
                onChange={(e) => setAiBrief(e.target.value)}
                className="w-full min-h-[90px] px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Describe brevemente el tipo de servicio, alcance o detalles que quieres en la factura..."
              />
              <Button
                className="w-full"
                variant="outline"
                onClick={handleGenerateWithPolo}
                disabled={aiLoading}
              >
                {aiLoading ? "Generando..." : "Generar con Polo"}
              </Button>
            </div>
          </div>

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
