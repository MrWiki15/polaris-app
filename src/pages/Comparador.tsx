import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency } from "@/lib/storage";
import { cn } from "@/lib/utils";

const parsePair = (pair: string | undefined) => {
  if (!pair) return null;
  const decoded = decodeURIComponent(pair);
  const parts = decoded.split("_vs_");
  if (parts.length !== 2) return null;
  const parse = (p: string) => {
    const [type, id] = p.split(":");
    return { type, id };
  };
  return { left: parse(parts[0]), right: parse(parts[1]) };
};

const computeMetrics = (type: string, id: string, data: any) => {
  const { sales, products, serviceIncomes, expenses } = data;

  let name = id;
  let revenue = 0;
  let expense = 0;
  const explain: string[] = [];

  if (type === "product") {
    const product = products.find((p: any) => p.id === id);
    name = product?.name || id;
    const relatedSales = sales.filter((s: any) => s.productId === id);
    revenue = relatedSales.reduce(
      (s: number, r: any) => s + (r.amount || 0),
      0,
    );
    const cogs = relatedSales.reduce((s: number, r: any) => {
      const qty = r.quantity || 0;
      return s + qty * (product?.cost || 0);
    }, 0);
    expense = cogs;
    explain.push(
      `Ventas totales: ${formatCurrency(revenue, data.settings.currencySymbol)}`,
    );
    explain.push(
      `Costo de ventas estimado: ${formatCurrency(cogs, data.settings.currencySymbol)}`,
    );
  } else if (type === "service") {
    const service = data.services.find((s: any) => s.id === id);
    name = service?.name || id;
    const related = serviceIncomes.filter((si: any) => si.serviceId === id);
    revenue = related.reduce(
      (s: number, r: any) => s + (r.gross ?? r.amount ?? 0),
      0,
    );
    // treat investorPercent as expense if present
    const investorExpenses = related.reduce(
      (s: number, r: any) =>
        s + ((r.gross || r.amount || 0) * (r.investorPercent || 0)) / 100,
      0,
    );
    expense = investorExpenses;
    explain.push(
      `Ingresos por servicio: ${formatCurrency(revenue, data.settings.currencySymbol)}`,
    );
    if (investorExpenses > 0)
      explain.push(
        `Pagos a inversores u otros: ${formatCurrency(investorExpenses, data.settings.currencySymbol)}`,
      );
  } else if (type === "supplier") {
    const supplier = data.suppliers.find((s: any) => s.id === id);
    name = supplier?.name || id;
    const supplierProducts = products
      .filter((p: any) => p.supplierId === id)
      .map((p: any) => p.id);
    const relatedSales = sales.filter((s: any) =>
      supplierProducts.includes(s.productId),
    );
    revenue = relatedSales.reduce(
      (s: number, r: any) => s + (r.amount || 0),
      0,
    );
    const cogs = relatedSales.reduce((s: number, r: any) => {
      const prod = products.find((p: any) => p.id === r.productId);
      const qty = r.quantity || 0;
      return s + qty * (prod?.cost || 0);
    }, 0);
    expense = cogs;
    explain.push(
      `Ventas de productos suministrados: ${formatCurrency(revenue, data.settings.currencySymbol)}`,
    );
    explain.push(
      `Costo estimado de esos productos: ${formatCurrency(cogs, data.settings.currencySymbol)}`,
    );
  } else if (type === "client") {
    const client = data.clients.find((c: any) => c.id === id);
    name = client?.name || id;
    const clientSales = sales.filter((s: any) => s.clientId === id);
    const clientService = serviceIncomes.filter(
      (si: any) => si.clientId === id,
    );
    revenue =
      clientSales.reduce((s: number, r: any) => s + (r.amount || 0), 0) +
      clientService.reduce((s: number, r: any) => s + (r.amount || 0), 0);
    const clientExpenses = expenses
      .filter((e: any) => e.clientId === id)
      .reduce((s: number, r: any) => s + (r.amount || 0), 0);
    expense = clientExpenses;
    explain.push(
      `Ingresos desde cliente: ${formatCurrency(revenue, data.settings.currencySymbol)}`,
    );
    if (clientExpenses > 0)
      explain.push(
        `Gastos asociados al cliente: ${formatCurrency(clientExpenses, data.settings.currencySymbol)}`,
      );
  } else if (type === "worker") {
    const worker = data.workers.find((w: any) => w.id === id);
    name = worker?.name || id;
    revenue = 0;
    expense = worker?.salary || 0;
    explain.push(
      `Salario estimado: ${formatCurrency(expense, data.settings.currencySymbol)}`,
    );
  } else if (type === "tag") {
    const tag = id;
    name = tag;
    const tagSales = sales.filter((s: any) => (s.tags || []).includes(tag));
    const tagExpenses = expenses.filter((e: any) =>
      (e.tags || []).includes(tag),
    );
    revenue = tagSales.reduce((s: number, r: any) => s + (r.amount || 0), 0);
    expense = tagExpenses.reduce((s: number, r: any) => s + (r.amount || 0), 0);
    explain.push(
      `Ventas con etiqueta: ${formatCurrency(revenue, data.settings.currencySymbol)}`,
    );
    if (expense > 0)
      explain.push(
        `Gastos con etiqueta: ${formatCurrency(expense, data.settings.currencySymbol)}`,
      );
  }

  const profit = revenue - expense;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return { name, revenue, expense, profit, margin, explain };
};

const Comparador: React.FC = () => {
  const { pair } = useParams<{ pair: string }>();
  const nav = useNavigate();
  const parsed = parsePair(pair);
  const { data } = useApp();

  const leftMetrics = useMemo(() => {
    if (!parsed) return null;
    return computeMetrics(parsed.left.type, parsed.left.id, data);
  }, [parsed, data]);

  const rightMetrics = useMemo(() => {
    if (!parsed) return null;
    return computeMetrics(parsed.right.type, parsed.right.id, data);
  }, [parsed, data]);

  if (!parsed || !leftMetrics || !rightMetrics) {
    return (
      <div className="p-6">
        <div className="mb-4">
          Comparación inválida o parámetros no válidos.
        </div>
        <button
          className="px-3 py-1 bg-primary text-primary-foreground rounded-lg"
          onClick={() => nav(-1)}
        >
          Volver
        </button>
      </div>
    );
  }

  const betterByProfit =
    leftMetrics.profit >= rightMetrics.profit ? "left" : "right";
  const diff = Math.abs(leftMetrics.profit - rightMetrics.profit);
  const base = Math.max(1, Math.abs(rightMetrics.profit));
  const percent = (diff / base) * 100;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Comparador</h2>
          <p className="text-sm text-muted-foreground">Comparación rápida entre elementos seleccionados</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded-lg bg-muted text-sm" onClick={() => nav(-1)}>Volver</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={cn("p-6 rounded-2xl border shadow-sm", betterByProfit === "left" ? "border-success/40 bg-success/5" : "bg-card")}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">{leftMetrics.name}</h3>
            {betterByProfit === "left" && <span className="text-xs bg-success/10 text-success px-2 py-1 rounded">Mejor</span>}
          </div>
          <div className="flex items-end gap-6">
            <div>
              <div className="text-xs text-muted-foreground">Ingresos</div>
              <div className="text-xl font-semibold">{formatCurrency(leftMetrics.revenue, data.settings.currencySymbol)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Gastos</div>
              <div className="text-xl font-semibold text-destructive">{formatCurrency(leftMetrics.expense, data.settings.currencySymbol)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Beneficio</div>
              <div className="text-2xl font-bold">{formatCurrency(leftMetrics.profit, data.settings.currencySymbol)}</div>
              <div className="text-xs text-muted-foreground">Margen {leftMetrics.margin.toFixed(1)}%</div>
            </div>
          </div>

          <div className="mt-3 text-xs text-muted-foreground space-y-1">
            {leftMetrics.explain.map((t: string, i: number) => (
              <div key={i}>• {t}</div>
            ))}
          </div>
        </div>

        <div className={cn("p-6 rounded-2xl border shadow-sm", betterByProfit === "right" ? "border-success/40 bg-success/5" : "bg-card")}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">{rightMetrics.name}</h3>
            {betterByProfit === "right" && <span className="text-xs bg-success/10 text-success px-2 py-1 rounded">Mejor</span>}
          </div>
          <div className="flex items-end gap-6">
            <div>
              <div className="text-xs text-muted-foreground">Ingresos</div>
              <div className="text-xl font-semibold">{formatCurrency(rightMetrics.revenue, data.settings.currencySymbol)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Gastos</div>
              <div className="text-xl font-semibold text-destructive">{formatCurrency(rightMetrics.expense, data.settings.currencySymbol)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Beneficio</div>
              <div className="text-2xl font-bold">{formatCurrency(rightMetrics.profit, data.settings.currencySymbol)}</div>
              <div className="text-xs text-muted-foreground">Margen {rightMetrics.margin.toFixed(1)}%</div>
            </div>
          </div>

          <div className="mt-3 text-xs text-muted-foreground space-y-1">
            {rightMetrics.explain.map((t: string, i: number) => (
              <div key={i}>• {t}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl border bg-muted/20">
        <p className="font-medium">Resultado</p>
        <div className="mt-2 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Diferencia de beneficio</div>
            <div className="text-lg font-semibold">{formatCurrency(diff, data.settings.currencySymbol)} • {percent.toFixed(1)}%</div>
            <div className="w-full bg-muted h-2 rounded-full mt-2 overflow-hidden">
              <div style={{ width: `${Math.min(100, percent)}%` }} className="h-2 bg-primary" />
            </div>
          </div>
          <div className="w-48 text-sm text-muted-foreground">
            <div>{betterByProfit === "left" ? leftMetrics.name : rightMetrics.name} tiene un beneficio {percent.toFixed(1)}% mayor.</div>
            <div className="mt-1">Explicación basada en ingresos y gastos registrados.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comparador;
