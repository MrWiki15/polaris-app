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

export interface AppData {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  clients: Client[];
  events: CalendarEvent[];
  goals: FinancialGoal[];
  debts: Debt[];
  recurringPayments: RecurringPayment[];
  suppliers: Supplier[];
  supplierOrders: SupplierOrder[];
  customTags: string[];
  settings: {
    currency: string;
    currencySymbol: string;
    language: string;
    theme: "light" | "dark" | "system";
    businessName?: string;
    businessLogo?: string;
    businessPhone?: string;
    businessAddress?: string;
  };
}

const STORAGE_KEY = "negocio360_data";

const defaultData: AppData = {
  sales: [],
  expenses: [],
  products: [],
  clients: [],
  events: [],
  goals: [],
  debts: [],
  recurringPayments: [],
  suppliers: [],
  supplierOrders: [],
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
  },
};

// Generate demo data for a better first experience
const generateDemoData = (): AppData => {
  const today = new Date();
  const sales: Sale[] = [];
  const expenses: Expense[] = [];
  const products: Product[] = [
    {
      id: "1",
      name: "Café molido 250g",
      quantity: 45,
      cost: 150,
      price: 220,
      category: "Alimentos",
      minStock: 10,
    },
    {
      id: "2",
      name: "Azúcar 1kg",
      quantity: 30,
      cost: 80,
      price: 120,
      category: "Alimentos",
      minStock: 15,
    },
    {
      id: "3",
      name: "Aceite 1L",
      quantity: 8,
      cost: 200,
      price: 280,
      category: "Alimentos",
      minStock: 10,
    },
    {
      id: "4",
      name: "Jabón de baño",
      quantity: 60,
      cost: 25,
      price: 45,
      category: "Higiene",
      minStock: 20,
    },
    {
      id: "5",
      name: "Detergente 500ml",
      quantity: 25,
      cost: 90,
      price: 140,
      category: "Limpieza",
      minStock: 10,
    },
    {
      id: "6",
      name: "Arroz 2kg",
      quantity: 40,
      cost: 180,
      price: 250,
      category: "Alimentos",
      minStock: 15,
    },
  ];

  const clients: Client[] = [
    {
      id: "c1",
      name: "María González",
      phone: "5355123456",
      type: "cliente",
      createdAt: today.toISOString(),
    },
    {
      id: "c2",
      name: "Distribuidora El Sol",
      phone: "5355987654",
      type: "proveedor",
      createdAt: today.toISOString(),
    },
  ];

  const events: CalendarEvent[] = [
    {
      id: "e1",
      title: "Pago a proveedor",
      date: new Date(today.getTime() + 86400000 * 3)
        .toISOString()
        .split("T")[0],
      type: "pago",
      completed: false,
    },
    {
      id: "e2",
      title: "Revisar inventario",
      date: new Date(today.getTime() + 86400000 * 7)
        .toISOString()
        .split("T")[0],
      type: "recordatorio",
      completed: false,
    },
  ];

  const goals: FinancialGoal[] = [
    {
      id: "g1",
      title: "Meta de ventas mensuales",
      targetAmount: 10000,
      currentAmount: 0,
      deadline: new Date(today.getFullYear(), today.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0],
      category: "ventas",
      createdAt: today.toISOString(),
    },
  ];

  const debts: Debt[] = [];

  const recurringPayments: RecurringPayment[] = [
    {
      id: "rp1",
      name: "Alquiler local",
      amount: 5000,
      category: "Alquiler",
      frequency: "mensual",
      dayOfMonth: 1,
      isActive: true,
      createdAt: today.toISOString(),
    },
    {
      id: "rp2",
      name: "Electricidad",
      amount: 1200,
      category: "Servicios",
      frequency: "mensual",
      dayOfMonth: 15,
      isActive: true,
      createdAt: today.toISOString(),
    },
  ];

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

  // Generate sales for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const numSales = Math.floor(Math.random() * 5) + 2;

    for (let j = 0; j < numSales; j++) {
      sales.push({
        id: `sale-${i}-${j}`,
        date: date.toISOString().split("T")[0],
        amount: Math.floor(Math.random() * 500) + 100,
        category:
          saleCategories[Math.floor(Math.random() * saleCategories.length)],
        description: `Venta del día`,
      });
    }
  }

  // Generate expenses for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const numExpenses = Math.floor(Math.random() * 3) + 1;

    for (let j = 0; j < numExpenses; j++) {
      expenses.push({
        id: `expense-${i}-${j}`,
        date: date.toISOString().split("T")[0],
        amount: Math.floor(Math.random() * 300) + 50,
        category:
          expenseCategories[
            Math.floor(Math.random() * expenseCategories.length)
          ],
        description: `Gasto del día`,
      });
    }
  }

  return {
    sales,
    expenses,
    products,
    clients,
    events,
    goals,
    debts,
    recurringPayments,
    suppliers: [
      {
        id: "s1",
        name: "Distribuidora El Sol",
        phone: "5355987654",
        createdAt: today.toISOString(),
      },
    ],
    supplierOrders: [],
    customTags,
    settings: defaultData.settings,
  };
};

export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure all arrays exist (for backwards compatibility)
      return {
        ...defaultData,
        ...parsed,
        clients: parsed.clients || [],
        events: parsed.events || [],
        goals: parsed.goals || [],
        debts: parsed.debts || [],
        recurringPayments: parsed.recurringPayments || [],
        suppliers: parsed.suppliers || [],
        supplierOrders: parsed.supplierOrders || [],
        customTags: parsed.customTags || defaultData.customTags,
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
  const today = new Date().toISOString().split("T")[0];
  return sales.filter((s) => s.date === today);
};

export const getTodaysExpenses = (expenses: Expense[]): Expense[] => {
  const today = new Date().toISOString().split("T")[0];
  return expenses.filter((e) => e.date === today);
};

export const getYesterdaysSales = (sales: Sale[]): Sale[] => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split("T")[0];
  return sales.filter((s) => s.date === dateStr);
};

export const getWeekSales = (sales: Sale[]): Sale[] => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return sales.filter((s) => new Date(s.date) >= weekAgo);
};

export const getMonthSales = (sales: Sale[]): Sale[] => {
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  return sales.filter((s) => new Date(s.date) >= monthAgo);
};

export const getLowStockProducts = (products: Product[]): Product[] => {
  return products.filter((p) => p.quantity <= (p.minStock || 10));
};

export const getInventoryValue = (products: Product[]): number => {
  return products.reduce((sum, p) => sum + p.quantity * p.cost, 0);
};

export const formatCurrency = (
  amount: number,
  symbol: string = "$"
): string => {
  return `${symbol}${amount.toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const calculateOptimalPrice = (
  cost: number,
  targetMargin: number = 30
): number => {
  return Math.ceil(cost * (1 + targetMargin / 100));
};

// Cash flow projection helpers
export const getDailyBalance = (
  sales: Sale[],
  expenses: Expense[],
  date: string
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
  days: number = 30
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
  daysAhead: number = 7
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
  expenses: Expense[]
): { total: number; paid: number; percentage: number } => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const monthlyRecurring = recurringPayments.filter(
    (rp) => rp.isActive && rp.frequency === "mensual"
  );
  const total = monthlyRecurring.length;

  // Check which recurring payments have been paid this month
  const paid = monthlyRecurring.filter((rp) => {
    return expenses.some(
      (e) =>
        e.recurringId === rp.id &&
        new Date(e.date).getMonth() === currentMonth &&
        new Date(e.date).getFullYear() === currentYear
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
  daysAhead: number = 7
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
  orders: SupplierOrder[]
): Product[] => {
  const pendingProductIds = new Set(
    orders
      .filter((o) => o.status === "pending" || o.status === "ordered")
      .flatMap((o) => o.items.map((i) => i.productId).filter(Boolean))
  );

  return products.filter(
    (p) => p.quantity <= (p.minStock || 10) && !pendingProductIds.has(p.id)
  );
};
