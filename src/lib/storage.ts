// LocalStorage utilities for offline-first data persistence

export interface Sale {
  id: string;
  date: string;
  amount: number;
  category: string;
  description?: string;
  productId?: string;
  quantity?: number;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  cost: number;
  price: number;
  category?: string;
  minStock?: number;
}

export interface AppData {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  settings: {
    currency: string;
    currencySymbol: string;
    language: string;
    theme: 'light' | 'dark' | 'system';
  };
}

const STORAGE_KEY = 'negocio360_data';

const defaultData: AppData = {
  sales: [],
  expenses: [],
  products: [],
  settings: {
    currency: 'CUP',
    currencySymbol: '$',
    language: 'es',
    theme: 'system',
  },
};

// Generate demo data for a better first experience
const generateDemoData = (): AppData => {
  const today = new Date();
  const sales: Sale[] = [];
  const expenses: Expense[] = [];
  const products: Product[] = [
    { id: '1', name: 'Café molido 250g', quantity: 45, cost: 150, price: 220, category: 'Alimentos', minStock: 10 },
    { id: '2', name: 'Azúcar 1kg', quantity: 30, cost: 80, price: 120, category: 'Alimentos', minStock: 15 },
    { id: '3', name: 'Aceite 1L', quantity: 8, cost: 200, price: 280, category: 'Alimentos', minStock: 10 },
    { id: '4', name: 'Jabón de baño', quantity: 60, cost: 25, price: 45, category: 'Higiene', minStock: 20 },
    { id: '5', name: 'Detergente 500ml', quantity: 25, cost: 90, price: 140, category: 'Limpieza', minStock: 10 },
    { id: '6', name: 'Arroz 2kg', quantity: 40, cost: 180, price: 250, category: 'Alimentos', minStock: 15 },
  ];

  const saleCategories = ['Alimentos', 'Bebidas', 'Higiene', 'Limpieza', 'Otros'];
  const expenseCategories = ['Compras', 'Transporte', 'Servicios', 'Salarios', 'Otros'];

  // Generate sales for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const numSales = Math.floor(Math.random() * 5) + 2;
    
    for (let j = 0; j < numSales; j++) {
      sales.push({
        id: `sale-${i}-${j}`,
        date: date.toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 500) + 100,
        category: saleCategories[Math.floor(Math.random() * saleCategories.length)],
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
        date: date.toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 300) + 50,
        category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
        description: `Gasto del día`,
      });
    }
  }

  return {
    sales,
    expenses,
    products,
    settings: defaultData.settings,
  };
};

export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // First time: generate demo data
    const demoData = generateDemoData();
    saveData(demoData);
    return demoData;
  } catch (error) {
    console.error('Error loading data:', error);
    return defaultData;
  }
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
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
    console.error('Error importing data:', error);
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
  const today = new Date().toISOString().split('T')[0];
  return sales.filter(s => s.date === today);
};

export const getTodaysExpenses = (expenses: Expense[]): Expense[] => {
  const today = new Date().toISOString().split('T')[0];
  return expenses.filter(e => e.date === today);
};

export const getYesterdaysSales = (sales: Sale[]): Sale[] => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];
  return sales.filter(s => s.date === dateStr);
};

export const getWeekSales = (sales: Sale[]): Sale[] => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return sales.filter(s => new Date(s.date) >= weekAgo);
};

export const getMonthSales = (sales: Sale[]): Sale[] => {
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  return sales.filter(s => new Date(s.date) >= monthAgo);
};

export const getLowStockProducts = (products: Product[]): Product[] => {
  return products.filter(p => p.quantity <= (p.minStock || 10));
};

export const getInventoryValue = (products: Product[]): number => {
  return products.reduce((sum, p) => sum + (p.quantity * p.cost), 0);
};

export const formatCurrency = (amount: number, symbol: string = '$'): string => {
  return `${symbol}${amount.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};
