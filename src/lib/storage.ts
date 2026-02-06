// LocalStorage utilities for offline-first data persistence

export interface Sale {
  id: string;
  date: string;
  amount: number;
  category: string;
  description?: string;
  productId?: string;
  quantity?: number;
  tags?: string[];
  clientId?: string;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description?: string;
  tags?: string[];
  isRecurring?: boolean | string;
  recurringId?: string;
  recurringTime?: string;
  clientId?: string;
}

export interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: "diaria" | "semanal" | "mensual" | "anual";
  dayOfMonth?: number;
  isActive: boolean;
  lastPaidDate?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  cost: number;
  price: number;
  category?: string;
  minStock?: number;
  expirationDate?: string;
  barcode?: string;
  supplierId?: string;
  additionalPrices?: {
    id: string;
    name: string;
    price: number;
  }[];
  isNft?: boolean;
  nftAddress?: string;
  nftMarketplace?:
    | "Kabila Market"
    | "SentX"
    | "Open Sea"
    | "Magic Eden"
    | "Blur"
    | "Otro";
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface SupplierOrder {
  id: string;
  supplierId: string;
  items: {
    productId?: string;
    productName: string;
    quantity: number;
    cost: number;
  }[];
  status: "pending" | "ordered" | "received" | "cancelled";
  totalAmount: number;
  expectedDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  type: "cliente" | "proveedor";
  notes?: string;
  createdAt: string;
}

export interface Worker {
  id: string;
  name: string;
  role?: string;
  salary: number;
  phone?: string;
  email?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: "recordatorio" | "cita" | "pago" | "otro";
  description?: string;
  completed: boolean;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: "ventas" | "ahorro" | "reduccion_gastos" | "otro";
  createdAt: string;
}

export interface ReinvestmentGoal {
  id: string;
  name: string;
  percentage: number;
  dayOfMonth: number;
  isActive: boolean;
  createdAt: string;
}

export interface ReinvestmentExecution {
  id: string;
  goalId: string;
  date: string;
  amount: number;
}

export interface Debt {
  id: string;
  personName: string;
  amount: number;
  type: "me_deben" | "debo";
  description?: string;
  dueDate?: string;
  paid: boolean;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  isVariablePrice: boolean;
  price?: number;
  description?: string;
  createdAt: string;
}

export interface ServiceIncome {
  id: string;
  date: string;
  serviceId: string;
  amount: number;
  description?: string;
  tags?: string[];
  clientId?: string;
}

export interface DepartmentBudgetTransaction {
  id: string;
  projectId?: number;
  type: "assignment" | "request" | "emergency_withdrawal";
  fromDepartment: string;
  toDepartment: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  createdBy: string;
  createdByDepartment?: string;
  approvedAt?: string;
  approvedBy?: string;
  reason?: string;
}

export interface AppData {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  clients: Client[];
  workers: Worker[];
  events: CalendarEvent[];
  goals: FinancialGoal[];
  reinvestmentGoals?: ReinvestmentGoal[];
  reinvestmentExecutions?: ReinvestmentExecution[];
  debts: Debt[];
  recurringPayments: RecurringPayment[];
  suppliers: Supplier[];
  supplierOrders: SupplierOrder[];
  services: Service[];
  serviceIncomes: ServiceIncome[];
  customTags: string[];
  departmentBudgetTransactions?: DepartmentBudgetTransaction[];
  settings: {
    currency: string;
    currencySymbol: string;
    language: string;
    theme: "light" | "dark" | "system";
    businessName?: string;
    businessLogo?: string;
    businessPhone?: string;
    businessAddress?: string;
    isPremium?: boolean;
  };
}

const STORAGE_KEY = "negocio360_data";

export const defaultData: AppData = {
  sales: [],
  expenses: [],
  products: [],
  clients: [],
  workers: [],
  events: [],
  goals: [],
  reinvestmentGoals: [],
  reinvestmentExecutions: [],
  debts: [],
  recurringPayments: [],
  suppliers: [],
  supplierOrders: [],
  services: [],
  serviceIncomes: [],
  customTags: [
    "Promoción",
    "Delivery",
    "Compra de insumos",
    "Servicio",
    "Temporada",
  ],
  settings: {
    currency: "CUP",
    currencySymbol: "$",
    language: "es",
    theme: "system",
    isPremium: true,
  },
  departmentBudgetTransactions: [],
};

// Generate demo data for a better first experience
const generateDemoData = (): AppData => {
  const today = new Date();
  const sales: Sale[] = [];
  const expenses: Expense[] = [];
  const products: Product[] = [];

  const clients: Client[] = [];

  const events: CalendarEvent[] = [];

  const goals: FinancialGoal[] = [];

  const debts: Debt[] = [];

  const recurringPayments: RecurringPayment[] = [];
  const workers: Worker[] = [];

  const customTags = [
    "Promoción",
    "Delivery",
    "Compra de insumos",
    "Servicio",
    "Temporada",
    "Mayoreo",
    "Online",
  ];

  const saleCategories = [
    "Alimentos",
    "Bebidas",
    "Higiene",
    "Limpieza",
    "Otros",
  ];
  const expenseCategories = [
    "Compras",
    "Transporte",
    "Servicios",
    "Salarios",
    "Otros",
  ];

  return {
    sales,
    expenses,
    products,
    clients,
    workers,
    events,
    goals,
    debts,
    recurringPayments,
    suppliers: [],
    supplierOrders: [],
    services: [],
    serviceIncomes: [],
    customTags,
    settings: defaultData.settings,
  };
};

export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);

      return {
        ...defaultData,
        ...parsed,
        clients: parsed.clients || [],
        workers: parsed.workers || [],
        events: parsed.events || [],
        goals: parsed.goals || [],
        reinvestmentGoals: parsed.reinvestmentGoals || [],
        reinvestmentExecutions: parsed.reinvestmentExecutions || [],
        debts: parsed.debts || [],
        recurringPayments: parsed.recurringPayments || [],
        suppliers: parsed.suppliers || [],
        supplierOrders: parsed.supplierOrders || [],
        services: parsed.services || [],
        serviceIncomes: parsed.serviceIncomes || [],
        customTags: parsed.customTags || defaultData.customTags,
        departmentBudgetTransactions:
          parsed.departmentBudgetTransactions ||
          defaultData.departmentBudgetTransactions ||
          [],
      };
    }
    // First time: generate demo data
    const demoData = generateDemoData();
    saveData(demoData);
    return demoData;
  } catch (error) {
    console.error("Error loading data:", error);
    return defaultData;
  }
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving data:", error);
  }
};

export const exportData = (): string => {
  const data = loadData();
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString) as AppData;
    saveData(data);
    return true;
  } catch (error) {
    console.error("Error importing data:", error);
    return false;
  }
};

export const resetData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper functions for calculations
export const getTodaysSales = (sales: Sale[]): Sale[] => {
  if (!sales) return [];
  const today = new Date().toISOString().split("T")[0];
  return sales.filter((s) => s.date === today);
};

export const getTodaysExpenses = (expenses: Expense[]): Expense[] => {
  if (!expenses) return [];
  const today = new Date().toISOString().split("T")[0];
  return expenses.filter((e) => e.date === today);
};

export const getYesterdaysSales = (sales: Sale[]): Sale[] => {
  if (!sales) return [];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split("T")[0];
  return sales.filter((s) => s.date === dateStr);
};

export const getWeekSales = (sales: Sale[]): Sale[] => {
  if (!sales) return [];
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return sales.filter((s) => new Date(s.date) >= weekAgo);
};

export const getMonthSales = (sales: Sale[]): Sale[] => {
  if (!sales) return [];
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  return sales.filter((s) => new Date(s.date) >= monthAgo);
};

export const getLowStockProducts = (products: Product[]): Product[] => {
  if (!products) return [];
  return products.filter((p) => p.quantity <= (p.minStock || 10));
};

export const getInventoryValue = (products: Product[]): number => {
  if (!products) return 0;
  return products.reduce((sum, p) => sum + p.quantity * p.cost, 0);
};

export const formatCurrency = (
  amount: number,
  symbol: string = "$",
): string => {
  return `${symbol}${amount.toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const calculateOptimalPrice = (
  cost: number,
  targetMargin: number = 30,
): number => {
  return Math.ceil(cost * (1 + targetMargin / 100));
};

// Cash flow projection helpers
export const getDailyBalance = (
  sales: Sale[],
  expenses: Expense[],
  date: string,
): number => {
  const daySales = sales
    .filter((s) => s.date === date)
    .reduce((sum, s) => sum + s.amount, 0);
  const dayExpenses = expenses
    .filter((e) => e.date === date)
    .reduce((sum, e) => sum + e.amount, 0);
  return daySales - dayExpenses;
};

export const getBalanceHistory = (
  sales: Sale[],
  expenses: Expense[],
  days: number = 30,
): { date: string; balance: number; cumulative: number }[] => {
  const history: { date: string; balance: number; cumulative: number }[] = [];
  let cumulative = 0;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dailyBalance = getDailyBalance(sales, expenses, dateStr);
    cumulative += dailyBalance;
    history.push({ date: dateStr, balance: dailyBalance, cumulative });
  }

  return history;
};

export const projectCashFlow = (
  sales: Sale[],
  expenses: Expense[],
  recurringPayments: RecurringPayment[],
  daysAhead: number = 7,
): { date: string; projectedBalance: number; alerts: string[] }[] => {
  const projections: {
    date: string;
    projectedBalance: number;
    alerts: string[];
  }[] = [];

  // Calculate average daily sales from last 30 days
  const last30DaysSales = sales.filter((s) => {
    const saleDate = new Date(s.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return saleDate >= thirtyDaysAgo;
  });
  const avgDailySales =
    last30DaysSales.reduce((sum, s) => sum + s.amount, 0) / 30;

  // Get current balance
  const currentBalance =
    sales.reduce((sum, s) => sum + s.amount, 0) -
    expenses.reduce((sum, e) => sum + e.amount, 0);
  let runningBalance = currentBalance;

  for (let i = 1; i <= daysAhead; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    const dayOfMonth = date.getDate();
    const alerts: string[] = [];

    // Add projected sales
    runningBalance += avgDailySales;

    // Subtract recurring payments due
    recurringPayments
      .filter((rp) => rp.isActive && rp.dayOfMonth === dayOfMonth)
      .forEach((rp) => {
        runningBalance -= rp.amount;
        alerts.push(`Pago: ${rp.name} (${formatCurrency(rp.amount)})`);
      });

    // Check for negative balance
    if (runningBalance < 0) {
      alerts.unshift("⚠️ Balance proyectado negativo");
    } else if (runningBalance < avgDailySales * 2) {
      alerts.unshift("⚡ Balance bajo");
    }

    projections.push({
      date: dateStr,
      projectedBalance: runningBalance,
      alerts,
    });
  }

  return projections;
};

export const getRecurringPaymentCompliance = (
  recurringPayments: RecurringPayment[],
  expenses: Expense[],
): { total: number; paid: number; percentage: number } => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const monthlyRecurring = recurringPayments.filter(
    (rp) => rp.isActive && rp.frequency === "mensual",
  );
  const total = monthlyRecurring.length;

  // Check which recurring payments have been paid this month
  const paid = monthlyRecurring.filter((rp) => {
    return expenses.some(
      (e) =>
        e.recurringId === rp.id &&
        new Date(e.date).getMonth() === currentMonth &&
        new Date(e.date).getFullYear() === currentYear,
    );
  }).length;

  return {
    total,
    paid,
    percentage: total > 0 ? (paid / total) * 100 : 100,
  };
};

// Expiration alerts helper
export const getExpiringProducts = (
  products: Product[],
  daysAhead: number = 7,
): {
  product: Product;
  daysUntilExpiration: number;
  status: "expired" | "critical" | "warning";
}[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return products
    .filter((p) => p.expirationDate)
    .map((p) => {
      const expDate = new Date(p.expirationDate!);
      expDate.setHours(0, 0, 0, 0);
      const diffTime = expDate.getTime() - today.getTime();
      const daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let status: "expired" | "critical" | "warning" = "warning";
      if (daysUntilExpiration <= 0) status = "expired";
      else if (daysUntilExpiration <= 3) status = "critical";

      return { product: p, daysUntilExpiration, status };
    })
    .filter((item) => item.daysUntilExpiration <= daysAhead)
    .sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);
};

// Pending orders helper
export const getPendingOrders = (orders: SupplierOrder[]): SupplierOrder[] => {
  return orders.filter((o) => o.status === "pending" || o.status === "ordered");
};

// Critical stock helper (products with low stock and no pending orders)
export const getCriticalStockProducts = (
  products: Product[],
  orders: SupplierOrder[],
): Product[] => {
  const pendingProductIds = new Set(
    orders
      .filter((o) => o.status === "pending" || o.status === "ordered")
      .flatMap((o) => o.items.map((i) => i.productId).filter(Boolean)),
  );

  return products.filter(
    (p) => p.quantity <= (p.minStock || 10) && !pendingProductIds.has(p.id),
  );
};
