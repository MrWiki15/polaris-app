import React, { useMemo, useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { FileText, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/storage";
import {
  generateExecutiveReport,
  ExecutiveReport,
} from "@/lib/ai/reportGenerator";
import jsPDF from "jspdf";
import { DEPARTMENT_PERMISSIONS } from "@/components/layout/AppLayout";

const POLARIS_LOGO_PATH = "/SVG/ICON_V02.svg";

const formatDate = (value: Date) => value.toISOString().split("T")[0];

export const Reportes: React.FC = () => {
  const { data, currentProject, currentProjectMember } = useApp();
  const { sales, expenses, products, clients, debts, goals, settings } = data;

  const [aiBrief, setAiBrief] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [report, setReport] = useState<ExecutiveReport | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string>("");

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
    permissions.includes("/reportes");

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch(POLARIS_LOGO_PATH);
        const text = await response.text();
        const base64 = btoa(unescape(encodeURIComponent(text)));
        setLogoDataUrl(`data:image/svg+xml;base64,${base64}`);
      } catch (error) {
        console.log(error);
        setLogoDataUrl("");
      }
    };

    loadLogo();
  }, []);

  const { summary, dateRange } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);

    const periodSales = sales.filter((s) => new Date(s.date) >= start);
    const periodExpenses = expenses.filter((e) => new Date(e.date) >= start);

    const totalSales = periodSales.reduce((sum, s) => sum + s.amount, 0);
    const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
    const net = totalSales - totalExpenses;

    const topProducts = [...products]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map((p) => `${p.name} (stock: ${p.quantity})`)
      .join(", ");

    const expenseCategories = periodExpenses
      .map((e) => e.category)
      .filter(Boolean)
      .slice(0, 8)
      .join(", ");

    const overdueDebts = debts.filter((d) => !d.paid && d.dueDate).length;
    const openGoals = goals.filter(
      (g) => g.currentAmount < g.targetAmount,
    ).length;

    const summaryText =
      `Rango: ${formatDate(start)} a ${formatDate(end)}\n` +
      `Ventas: ${formatCurrency(totalSales, settings.currencySymbol)}\n` +
      `Gastos: ${formatCurrency(totalExpenses, settings.currencySymbol)}\n` +
      `Resultado neto: ${formatCurrency(net, settings.currencySymbol)}\n` +
      `Productos en inventario: ${products.length}\n` +
      `Clientes: ${clients.length}\n` +
      `Deudas vencidas: ${overdueDebts}\n` +
      `Metas en progreso: ${openGoals}\n` +
      `Top inventario: ${topProducts || "(sin productos)"}\n` +
      `Categorias de gasto frecuentes: ${expenseCategories || "(sin datos)"}\n` +
      `Brief adicional: ${aiBrief || "(sin brief)"}`;

    return {
      summary: summaryText,
      dateRange: `${formatDate(start)} - ${formatDate(end)}`,
    };
  }, [
    sales,
    expenses,
    products,
    clients,
    debts,
    goals,
    settings.currencySymbol,
    aiBrief,
  ]);

  const generatePDF = (reportData: ExecutiveReport) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 18;
    const rightX = pageWidth - marginX;
    const contentWidth = pageWidth - marginX * 2;

    const themePrimary = { r: 86, g: 170, b: 235 };
    const themeLight = { r: 230, g: 244, b: 255 };
    const themeLine = { r: 195, g: 225, b: 245 };
    const textMuted = { r: 90, g: 110, b: 125 };

    let y = 20;

    const addPageIfNeeded = (extraSpace: number) => {
      if (y + extraSpace > pageHeight - 18) {
        doc.addPage();
        y = 20;
      }
    };

    const addTitle = (title: string) => {
      addPageIfNeeded(16);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(themePrimary.r, themePrimary.g, themePrimary.b);
      doc.text(title, marginX, y);
      y += 6;
      doc.setDrawColor(themeLine.r, themeLine.g, themeLine.b);
      doc.line(marginX, y, rightX, y);
      y += 6;
    };

    const addParagraph = (text: string, fontSize = 9) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fontSize);
      doc.setTextColor(0, 0, 0);
      const lines = doc.splitTextToSize(text, contentWidth);
      addPageIfNeeded(lines.length * 5 + 2);
      doc.text(lines, marginX, y);
      y += lines.length * 5 + 2;
    };

    const addBulletList = (items: string[]) => {
      items.forEach((item) => {
        const lines = doc.splitTextToSize(`• ${item}`, contentWidth);
        addPageIfNeeded(lines.length * 5 + 2);
        doc.text(lines, marginX, y);
        y += lines.length * 5 + 2;
      });
    };

    // Header
    doc.setFillColor(themeLight.r, themeLight.g, themeLight.b);
    doc.rect(0, 0, pageWidth, 32, "F");
    doc.setDrawColor(themeLine.r, themeLine.g, themeLine.b);
    doc.line(0, 32, pageWidth, 32);

    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, "SVG", marginX, 6, 16, 16);
      } catch (error) {
        console.log(error);
        // Ignore invalid logo
      }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(themePrimary.r, themePrimary.g, themePrimary.b);
    doc.text("Reporte Ejecutivo", marginX + 20, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
    doc.text(`Periodo: ${dateRange}`, marginX + 20, 24);
    doc.text("My Business Studio", rightX, 18, { align: "right" });

    y = 42;

    addTitle("Principio rector");
    addParagraph(
      "Un reporte ejecutivo no informa: permite decidir. Si no conduce a una decision clara, esta mal hecho.",
      10,
    );

    addTitle("Resumen ejecutivo");
    addBulletList(reportData.executiveSummary.facts);
    addParagraph(`Impacto: ${reportData.executiveSummary.impact}`);
    addParagraph(
      `Recomendacion: ${reportData.executiveSummary.recommendation}`,
    );

    addTitle("Contexto minimo necesario");
    addParagraph(`Que cambio: ${reportData.context.changes}`);
    addParagraph(`Desde cuando: ${reportData.context.since}`);
    addParagraph(`A que afecta: ${reportData.context.affected}`);

    addTitle("Metricas clave");
    reportData.metrics.slice(0, 5).forEach((metric) => {
      addParagraph(`${metric.name}: ${metric.value}`);
      addParagraph(`Por que importa: ${metric.why}`, 8);
      if (metric.trend) {
        addParagraph(`Tendencia: ${metric.trend}`, 8);
      }
      y += 2;
    });

    addTitle("Analisis de causa raiz");
    addParagraph(reportData.rootCause.analysis);
    addParagraph(`Evidencia: ${reportData.rootCause.evidence}`);

    addTitle("Impacto de negocio");
    addParagraph(reportData.businessImpact);

    addTitle("Recomendacion clara");
    addParagraph(`Accion: ${reportData.recommendation.action}`);
    addParagraph(`Prioridad: ${reportData.recommendation.priority}`);
    addParagraph(
      `Impacto esperado: ${reportData.recommendation.expectedImpact}`,
    );

    addTitle("Alternativas y trade-offs");
    reportData.alternatives.slice(0, 3).forEach((alt) => {
      addParagraph(
        `Opcion: ${alt.option} | Impacto: ${alt.impact} | Riesgo: ${alt.risk} | Tiempo: ${alt.time}`,
        8,
      );
    });

    addTitle("Proximos pasos");
    reportData.nextSteps.slice(0, 5).forEach((step) => {
      addParagraph(
        `Quien: ${step.owner}. Que: ${step.what}. Cuando: ${step.when}. ${step.note || ""}`,
        8,
      );
    });

    addTitle("Que pasa si no se actua");
    addParagraph(reportData.risksIfNoAction);

    addTitle("Checklist de calidad");
    addParagraph(
      "Un reporte ejecutivo debe responder: Que paso, por que paso, impacto, decision recomendada y que pasa si no se actua. Todo lo demas es ruido.",
      8,
    );
    addParagraph("Que NO debe tener:");
    addBulletList([
      "Detalles tecnicos",
      "Graficas sin interpretacion",
      "Metricas sin conclusion",
      "Texto largo",
      "Opiniones sin datos",
    ]);
    addParagraph("Senales de que un reporte es malo:");
    addBulletList([
      "Adjunto dashboard",
      "Ver detalles en el anexo",
      "Hay muchas metricas",
      "Seguiremos monitoreando",
    ]);

    doc.save(`reporte_ejecutivo_${formatDate(new Date())}.pdf`);
  };

  const handleGenerate = async () => {
    setAiLoading(true);
    try {
      const aiReport = await generateExecutiveReport({
        appData: data,
        summary,
      });
      setReport(aiReport);
      generatePDF(aiReport);
      toast({
        title: "Reporte generado",
        description: "El PDF ejecutivo se descargo correctamente.",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "No se pudo generar",
        description: "Intenta de nuevo en unos segundos.",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  if (!isAuthorizedForPage) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center p-4 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Acceso Restringido</h2>
        <p className="max-w-md text-muted-foreground">
          No tienes permisos para ver esta pagina.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {!!currentProject && (
        <div className="mb-4 rounded-xl border border-border p-3 bg-muted/40 text-sm">
          <div className="font-medium">
            Modo proyecto: {currentProject?.name} (Reportes)
          </div>
        </div>
      )}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 sm:p-6 border border-primary/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-xl">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold">Reportes Ejecutivos</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Reportes narrativos con IA para decisiones ejecutivas en 5-10 minutos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border space-y-4">
          <div>
            <h3 className="font-semibold text-base sm:text-lg">
              Generar con Polo
            </h3>
            <p className="text-sm text-muted-foreground">
              Polo analiza el ultimo mes usando datos locales y sincronizados.
            </p>
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Brief opcional: enfoque, preocupaciones o decision a evaluar"
              value={aiBrief}
              onChange={(e) => setAiBrief(e.target.value)}
              rows={4}
            />
          </div>
          <Button
            onClick={handleGenerate}
            className="gradient-primary w-full"
            disabled={aiLoading}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {aiLoading ? "Generando..." : "Generar reporte con Polo"}
          </Button>
          <div className="text-xs text-muted-foreground">
            El reporte incluye resumen ejecutivo, causas raiz, impacto y
            recomendaciones.
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Download className="w-4 h-4" />
            PDF multipagina con estilo Polaris
          </div>
          <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            {report ? (
              <div className="space-y-2">
                <div className="font-medium text-foreground">
                  Ultimo reporte:
                </div>
                <div>Resumen: {report.executiveSummary.recommendation}</div>
                <div>Impacto: {report.executiveSummary.impact}</div>
              </div>
            ) : (
              "Genera un reporte para ver aqui un resumen rapido."
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Si no conduce a una decision clara, esta mal hecho.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
