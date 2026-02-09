import type {
  AppData,
  AppNotification,
  CalendarEvent,
  Debt,
  FinancialGoal,
  Product,
  RecurringPayment,
} from "@/lib/storage";
import { formatCurrency } from "@/lib/storage";

const DAY_MS = 24 * 60 * 60 * 1000;

const toDate = (dateStr: string) => {
  const clean = dateStr.split("T")[0];
  return new Date(clean + "T00:00:00");
};

const toIsoDate = (date: Date) => date.toISOString().split("T")[0];

const daysBetween = (from: Date, to: Date) =>
  Math.round((to.getTime() - from.getTime()) / DAY_MS);

const getNextRecurringDate = (payment: RecurringPayment, today: Date) => {
  const base = payment.lastPaidDate || payment.createdAt;
  const baseDate = toDate(base);

  if (payment.frequency === "diaria") {
    let next = new Date(baseDate.getTime() + DAY_MS);
    while (next < today) next = new Date(next.getTime() + DAY_MS);
    return next;
  }

  if (payment.frequency === "semanal") {
    let next = new Date(baseDate.getTime() + 7 * DAY_MS);
    while (next < today) next = new Date(next.getTime() + 7 * DAY_MS);
    return next;
  }

  if (payment.frequency === "mensual") {
    const day = payment.dayOfMonth || baseDate.getDate();
    let next = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, day);
    if (next < today) {
      const monthsDiff =
        (today.getFullYear() - baseDate.getFullYear()) * 12 +
        (today.getMonth() - baseDate.getMonth());
      next = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth() + monthsDiff,
        day,
      );
      if (next < today) {
        next = new Date(
          baseDate.getFullYear(),
          baseDate.getMonth() + monthsDiff + 1,
          day,
        );
      }
    }
    return next;
  }

  const nextYear = new Date(
    baseDate.getFullYear() + 1,
    baseDate.getMonth(),
    baseDate.getDate(),
  );
  if (nextYear >= today) return nextYear;

  const yearDiff = today.getFullYear() - baseDate.getFullYear();
  const candidate = new Date(
    baseDate.getFullYear() + yearDiff,
    baseDate.getMonth(),
    baseDate.getDate(),
  );
  return candidate < today
    ? new Date(
        baseDate.getFullYear() + yearDiff + 1,
        baseDate.getMonth(),
        baseDate.getDate(),
      )
    : candidate;
};

const buildLowStockNotifications = (products: Product[]): AppNotification[] =>
  products
    .filter(
      (p) => typeof p.minStock === "number" && p.quantity <= (p.minStock || 0),
    )
    .map((p) => ({
      id: `low-stock-${p.id}`,
      title: "Stock bajo",
      message: `${p.name} tiene ${p.quantity} unidades (minimo ${p.minStock ?? 0}).`,
      type: "warning",
      category: "inventario",
      source: "system",
      createdAt: new Date().toISOString(),
      action: { label: "Ver producto", path: `/inventario/${p.id}` },
      metadata: { entityId: p.id, entityType: "product" },
    }));

const buildExpiringNotifications = (
  products: Product[],
  today: Date,
): AppNotification[] =>
  products
    .filter((p) => !!p.expirationDate)
    .map((p) => ({ product: p, exp: toDate(p.expirationDate as string) }))
    .filter(({ exp }) => {
      const diff = daysBetween(today, exp);
      return diff >= 0 && diff <= 7;
    })
    .map(({ product, exp }) => ({
      id: `expiring-${product.id}`,
      title: "Producto por vencer",
      message: `${product.name} vence el ${toIsoDate(exp)}.`,
      type: "warning",
      category: "inventario",
      source: "system",
      createdAt: exp.toISOString(),
      action: { label: "Ver producto", path: `/inventario/${product.id}` },
      metadata: { entityId: product.id, entityType: "product" },
    }));

const buildEventNotifications = (
  events: CalendarEvent[],
  today: Date,
): AppNotification[] =>
  events
    .filter((e) => !e.completed)
    .map((e) => ({ event: e, eventDate: toDate(e.date) }))
    .filter(({ eventDate }) => {
      const diff = daysBetween(today, eventDate);
      return diff >= 0 && diff <= 2;
    })
    .map(({ event, eventDate }) => ({
      id: `event-${event.id}`,
      title: "Evento proximo",
      message: `${event.title} el ${toIsoDate(eventDate)}${event.time ? " a las " + event.time : ""}.`,
      type: event.type === "pago" ? "warning" : "info",
      category: "calendario",
      source: "system",
      createdAt: eventDate.toISOString(),
      action: { label: "Ver agenda", path: "/herramientas/agenda" },
      metadata: { entityId: event.id, entityType: "event" },
    }));

const buildGoalNotifications = (
  goals: FinancialGoal[],
  today: Date,
  currencySymbol: string,
): AppNotification[] =>
  goals
    .map((g) => ({ goal: g, deadline: toDate(g.deadline) }))
    .filter(({ goal, deadline }) => {
      const diff = daysBetween(today, deadline);
      return diff >= 0 && diff <= 7 && goal.currentAmount < goal.targetAmount;
    })
    .map(({ goal, deadline }) => ({
      id: `goal-${goal.id}`,
      title: "Meta por vencer",
      message: `${goal.title} vence el ${toIsoDate(deadline)}. Progreso: ${formatCurrency(
        goal.currentAmount,
        currencySymbol,
      )} / ${formatCurrency(goal.targetAmount, currencySymbol)}.`,
      type: "info",
      category: "metas",
      source: "system",
      createdAt: deadline.toISOString(),
      action: { label: "Ver metas", path: "/herramientas/metas" },
      metadata: { entityId: goal.id, entityType: "goal" },
    }));

const buildDebtNotifications = (
  debts: Debt[],
  today: Date,
  currencySymbol: string,
): AppNotification[] =>
  debts
    .filter((d) => !!d.dueDate && !d.paid)
    .map((d) => ({ debt: d, due: toDate(d.dueDate as string) }))
    .filter(({ due }) => {
      const diff = daysBetween(today, due);
      return diff <= 0 || diff <= 3;
    })
    .map(({ debt, due }) => {
      const overdue = daysBetween(today, due) < 0;
      const title =
        debt.type === "me_deben" ? "Cobro pendiente" : "Pago pendiente";
      return {
        id: `debt-${debt.id}`,
        title: overdue ? `${title} vencido` : title,
        message: `${debt.personName} · ${formatCurrency(debt.amount, currencySymbol)} · vence ${toIsoDate(due)}.`,
        type: overdue ? "error" : "warning",
        category: "deudas",
        source: "system",
        createdAt: due.toISOString(),
        action: { label: "Ver deudas", path: "/herramientas/deudas" },
        metadata: { entityId: debt.id, entityType: "debt" },
      };
    });

const buildRecurringNotifications = (
  payments: RecurringPayment[],
  today: Date,
  currencySymbol: string,
): AppNotification[] =>
  payments
    .filter((p) => p.isActive)
    .map((p) => ({ payment: p, next: getNextRecurringDate(p, today) }))
    .filter(({ next }) => {
      const diff = daysBetween(today, next);
      return diff <= 0 || diff <= 3;
    })
    .map(({ payment, next }) => {
      const overdue = daysBetween(today, next) < 0;
      return {
        id: `recurring-${payment.id}`,
        title: overdue
          ? "Pago recurrente vencido"
          : "Pago recurrente por vencer",
        message: `${payment.name} · ${formatCurrency(payment.amount, currencySymbol)} · ${toIsoDate(next)}.`,
        type: overdue ? "error" : "warning",
        category: "recurrencia",
        source: "system",
        createdAt: next.toISOString(),
        action: {
          label: "Ver recurrencia",
          path: "/herramientas/pagos-recurrentes",
        },
        metadata: { entityId: payment.id, entityType: "recurring" },
      };
    });

export const buildSystemNotifications = (data: AppData): AppNotification[] => {
  const today = toDate(new Date().toISOString());
  const currencySymbol = data.settings.currencySymbol || "$";

  return [
    ...buildLowStockNotifications(data.products),
    ...buildExpiringNotifications(data.products, today),
    ...buildEventNotifications(data.events, today),
    ...buildGoalNotifications(data.goals, today, currencySymbol),
    ...buildDebtNotifications(data.debts, today, currencySymbol),
    ...buildRecurringNotifications(
      data.recurringPayments,
      today,
      currencySymbol,
    ),
  ];
};

export const mergeSystemNotifications = (
  existing: AppNotification[],
  generated: AppNotification[],
): AppNotification[] => {
  const existingMap = new Map(
    existing.filter((n) => n.source === "system").map((n) => [n.id, n]),
  );
  const manual = existing.filter((n) => n.source !== "system");

  const mergedSystem = generated.map((n) => {
    const prev = existingMap.get(n.id);
    if (!prev) return n;
    return {
      ...n,
      createdAt: prev.createdAt || n.createdAt,
      readAt: prev.readAt,
    };
  });

  return [...manual, ...mergedSystem].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

export const areNotificationsEqual = (
  a: AppNotification[],
  b: AppNotification[],
): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const left = a[i];
    const right = b[i];
    if (
      left.id !== right.id ||
      left.readAt !== right.readAt ||
      left.type !== right.type ||
      left.category !== right.category ||
      left.title !== right.title ||
      left.message !== right.message ||
      left.createdAt !== right.createdAt ||
      left.action?.path !== right.action?.path
    ) {
      return false;
    }
  }
  return true;
};
