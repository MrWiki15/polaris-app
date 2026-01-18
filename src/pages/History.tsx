/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { DataTable } from "@/components/ui/DataTable";
import { formatCurrency } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

type FilterPeriod = "today" | "week" | "month" | "all";

interface ActivityEntry {
  id: string;
  date: string;
  timestamp: number;
  kind: string;
  amount?: number;
  summary: string;
  detail: any;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const clean = dateStr.split("T")[0];
  const [y, m, d] = clean.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
  return dt.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const History: React.FC = () => {
  const { data, currentProject, currentProjectMember } = useApp();
  const {
    sales,
    expenses,
    serviceIncomes,
    services,
    clients,
    workers,
    suppliers,
    supplierOrders,
    events,
    goals,
    debts,
    recurringPayments,
    settings,
  } = data;
  const [filter, setFilter] = useState<FilterPeriod>("week");
  const [selected, setSelected] = useState<ActivityEntry | null>(null);

  const isPersonalMode = !currentProject;
  const isDepartmentDirector =
    !!currentProject && currentProjectMember?.role === "direccion";

  const entries = useMemo(() => {
    const all: ActivityEntry[] = [];

    const toTs = (dateStr: string) =>
      new Date(
        dateStr.includes("T") ? dateStr : dateStr + "T12:00:00"
      ).getTime();
    const toDate = (iso: string) => iso.split("T")[0];

    sales.forEach((s) =>
      all.push({
        id: "sale-" + s.id,
        date: s.date,
        timestamp: toTs(s.date),
        kind: "Ingreso",
        amount: s.amount,
        summary: s.description || s.category,
        detail: s,
      })
    );

    expenses.forEach((e) =>
      all.push({
        id: "exp-" + e.id,
        date: e.date,
        timestamp: toTs(e.date),
        kind: e.isRecurring ? "Pago recurrente" : "Gasto",
        amount: e.amount,
        summary: e.description || e.category,
        detail: e,
      })
    );

    serviceIncomes.forEach((si) => {
      const svc = services.find((s) => s.id === si.serviceId);
      all.push({
        id: "svc-inc-" + si.id,
        date: si.date,
        timestamp: toTs(si.date),
        kind: "Servicio",
        amount: si.amount,
        summary: svc?.name || "Servicio",
        detail: { ...si, service: svc },
      });
    });

    clients.forEach((c) =>
      all.push({
        id: "client-" + c.id,
        date: toDate(c.createdAt),
        timestamp: toTs(c.createdAt),
        kind: "Cliente",
        summary: c.name,
        detail: c,
      })
    );

    workers.forEach((w) =>
      all.push({
        id: "worker-" + w.id,
        date: toDate(w.createdAt),
        timestamp: toTs(w.createdAt),
        kind: "Trabajador",
        summary: w.name,
        detail: w,
      })
    );

    suppliers.forEach((s) =>
      all.push({
        id: "supplier-" + s.id,
        date: toDate(s.createdAt),
        timestamp: toTs(s.createdAt),
        kind: "Proveedor",
        summary: s.name,
        detail: s,
      })
    );

    supplierOrders.forEach((o) =>
      all.push({
        id: "supplier-order-" + o.id,
        date: toDate(o.createdAt),
        timestamp: toTs(o.createdAt),
        kind: "Orden proveedor",
        amount: o.totalAmount,
        summary: `Orden #${o.id.split("-")[0]} (${o.status})`,
        detail: o,
      })
    );

    services.forEach((s) =>
      all.push({
        id: "service-" + s.id,
        date: toDate(s.createdAt),
        timestamp: toTs(s.createdAt),
        kind: "Servicio creado",
        summary: s.name,
        detail: s,
      })
    );

    events.forEach((ev) =>
      all.push({
        id: "event-" + ev.id,
        date: ev.date,
        timestamp: toTs(ev.date),
        kind: "Evento",
        summary: ev.title,
        detail: ev,
      })
    );

    goals.forEach((g) =>
      all.push({
        id: "goal-" + g.id,
        date: toDate(g.createdAt),
        timestamp: toTs(g.createdAt),
        kind: "Meta",
        summary: g.title,
        detail: g,
      })
    );

    debts.forEach((d) =>
      all.push({
        id: "debt-" + d.id,
        date: toDate(d.createdAt),
        timestamp: toTs(d.createdAt),
        kind: d.type === "me_deben" ? "Me deben" : "Debo",
        amount: d.amount,
        summary: d.personName,
        detail: d,
      })
    );

    recurringPayments.forEach((rp) =>
      all.push({
        id: "recurring-" + rp.id,
        date: toDate(rp.createdAt),
        timestamp: toTs(rp.createdAt),
        kind: "Pago recurrente (config)",
        amount: rp.amount,
        summary: rp.name,
        detail: rp,
      })
    );

    return all
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((e) => ({ ...e, date: e.date.split("T")[0] }));
  }, [
    sales,
    expenses,
    serviceIncomes,
    services,
    clients,
    workers,
    suppliers,
    supplierOrders,
    events,
    goals,
    debts,
    recurringPayments,
  ]);

  const filtered = useMemo(() => {
    const today = new Date();
    const todayStr = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    monthAgo.setHours(0, 0, 0, 0);

    const checkDate = (dateStr: string, ts: number) => {
      if (filter === "all") return true;
      if (filter === "today") return dateStr === todayStr;
      if (filter === "week") return ts >= weekAgo.getTime();
      if (filter === "month") return ts >= monthAgo.getTime();
      return true;
    };

    return entries.filter((e) => checkDate(e.date, e.timestamp));
  }, [entries, filter]);

  const columns = [
    {
      key: "date",
      header: "Fecha",
      render: (item: ActivityEntry) => formatDate(item.date),
    },
    {
      key: "kind",
      header: "Tipo",
      render: (item: ActivityEntry) => (
        <span
          className={cn(
            "px-2 py-1 rounded-lg text-sm",
            item.kind === "Ingreso"
              ? "bg-success/10 text-success"
              : item.kind === "Gasto" || item.kind.startsWith("Pago recurrente")
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-muted-foreground"
          )}
        >
          {item.kind}
        </span>
      ),
    },
    {
      key: "summary",
      header: "Resumen",
      render: (item: ActivityEntry) => item.summary || "-",
      className: "hidden sm:table-cell",
    },
    {
      key: "amount",
      header: "Monto",
      render: (item: ActivityEntry) =>
        item.amount !== undefined ? (
          <span className="font-semibold text-success">
            {formatCurrency(item.amount || 0, settings.currencySymbol)}
          </span>
        ) : (
          "-"
        ),
    },
  ];

  if (currentProject && !isDepartmentDirector) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center p-4 text-center">
        <h2 className="mb-2 text-xl font-semibold">
          Acceso restringido al historial
        </h2>
        <p className="max-w-md text-muted-foreground">
          El historial del proyecto solo está disponible para usuarios con rol
          de dirección del departamento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="flex flex-col gap-1">
        {isPersonalMode ? (
          <span className="text-xs text-muted-foreground">
            Historial personal (datos locales)
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            Historial del proyecto {currentProject?.name} · Departamento:{" "}
            {currentProjectMember?.departament || "Dirección"}
          </span>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: "today", label: "Hoy" },
          { key: "week", label: "Semana" },
          { key: "month", label: "Mes" },
          { key: "all", label: "Todo" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as FilterPeriod)}
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

      <DataTable
        data={filtered}
        columns={columns}
        onEdit={(item: ActivityEntry) => setSelected(item)}
        onDelete={undefined}
        emptyMessage="No hay actividad registrada"
      />

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div
            className={cn(
              "relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl shadow-material-xl",
              "animate-slide-in-up sm:animate-scale-in",
              "max-h-[80vh] overflow-auto"
            )}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">
                {selected.kind} · {formatDate(selected.date)}
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <Label>Resumen</Label>
                <div className="text-sm">{selected.summary || "-"}</div>
              </div>
              {selected.amount !== undefined && (
                <div className="space-y-1">
                  <Label>Monto</Label>
                  <div className="text-sm font-semibold text-success">
                    {formatCurrency(
                      selected.amount || 0,
                      settings.currencySymbol
                    )}
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <Label>Detalles</Label>
                <pre className="text-xs bg-muted rounded-xl p-3 overflow-auto">
                  {JSON.stringify(selected.detail, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
