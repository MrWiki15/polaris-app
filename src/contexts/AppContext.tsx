import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  AppData, 
  Sale, 
  Expense, 
  Product,
  Client,
  CalendarEvent,
  FinancialGoal,
  Debt,
  RecurringPayment,
  loadData, 
  saveData, 
  generateId 
} from '@/lib/storage';

interface AppContextType {
  data: AppData;
  // Sales
  addSale: (sale: Omit<Sale, 'id'>) => void;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  // Expenses
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  // Products
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Clients
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  // Events
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  // Goals
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, goal: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;
  // Debts
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  // Recurring Payments
  addRecurringPayment: (payment: Omit<RecurringPayment, 'id' | 'createdAt'>) => void;
  updateRecurringPayment: (id: string, payment: Partial<RecurringPayment>) => void;
  deleteRecurringPayment: (id: string) => void;
  payRecurringPayment: (paymentId: string) => void;
  // Custom Tags
  addCustomTag: (tag: string) => void;
  deleteCustomTag: (tag: string) => void;
  // Settings
  updateSettings: (settings: Partial<AppData['settings']>) => void;
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  // Refresh data
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [data, setData] = useState<AppData>(() => loadData());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('negocio360_theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('negocio360_theme', theme);
  }, [theme]);

  // Save data whenever it changes
  useEffect(() => {
    saveData(data);
  }, [data]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const refreshData = () => {
    setData(loadData());
  };

  // Sales operations
  const addSale = (sale: Omit<Sale, 'id'>) => {
    const newSale: Sale = { ...sale, id: generateId() };
    
    // If sale has a productId, update inventory
    if (sale.productId && sale.quantity) {
      setData(prev => ({
        ...prev,
        sales: [newSale, ...prev.sales],
        products: prev.products.map(p => 
          p.id === sale.productId 
            ? { ...p, quantity: Math.max(0, p.quantity - (sale.quantity || 0)) }
            : p
        )
      }));
    } else {
      setData(prev => ({ ...prev, sales: [newSale, ...prev.sales] }));
    }
  };

  const updateSale = (id: string, saleUpdate: Partial<Sale>) => {
    setData(prev => ({
      ...prev,
      sales: prev.sales.map(s => s.id === id ? { ...s, ...saleUpdate } : s)
    }));
  };

  const deleteSale = (id: string) => {
    setData(prev => ({
      ...prev,
      sales: prev.sales.filter(s => s.id !== id)
    }));
  };

  // Expenses operations
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expense, id: generateId() };
    setData(prev => ({ ...prev, expenses: [newExpense, ...prev.expenses] }));
  };

  const updateExpense = (id: string, expenseUpdate: Partial<Expense>) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => e.id === id ? { ...e, ...expenseUpdate } : e)
    }));
  };

  const deleteExpense = (id: string) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id)
    }));
  };

  // Products operations
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...product, id: generateId() };
    setData(prev => ({ ...prev, products: [newProduct, ...prev.products] }));
  };

  const updateProduct = (id: string, productUpdate: Partial<Product>) => {
    setData(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...productUpdate } : p)
    }));
  };

  const deleteProduct = (id: string) => {
    setData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
  };

  // Clients operations
  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = { ...client, id: generateId(), createdAt: new Date().toISOString() };
    setData(prev => ({ ...prev, clients: [newClient, ...prev.clients] }));
  };

  const updateClient = (id: string, clientUpdate: Partial<Client>) => {
    setData(prev => ({
      ...prev,
      clients: prev.clients.map(c => c.id === id ? { ...c, ...clientUpdate } : c)
    }));
  };

  const deleteClient = (id: string) => {
    setData(prev => ({
      ...prev,
      clients: prev.clients.filter(c => c.id !== id)
    }));
  };

  // Events operations
  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = { ...event, id: generateId() };
    setData(prev => ({ ...prev, events: [newEvent, ...prev.events] }));
  };

  const updateEvent = (id: string, eventUpdate: Partial<CalendarEvent>) => {
    setData(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === id ? { ...e, ...eventUpdate } : e)
    }));
  };

  const deleteEvent = (id: string) => {
    setData(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== id)
    }));
  };

  // Goals operations
  const addGoal = (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => {
    const newGoal: FinancialGoal = { ...goal, id: generateId(), createdAt: new Date().toISOString() };
    setData(prev => ({ ...prev, goals: [newGoal, ...prev.goals] }));
  };

  const updateGoal = (id: string, goalUpdate: Partial<FinancialGoal>) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, ...goalUpdate } : g)
    }));
  };

  const deleteGoal = (id: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id)
    }));
  };

  // Debts operations
  const addDebt = (debt: Omit<Debt, 'id' | 'createdAt'>) => {
    const newDebt: Debt = { ...debt, id: generateId(), createdAt: new Date().toISOString() };
    setData(prev => ({ ...prev, debts: [newDebt, ...prev.debts] }));
  };

  const updateDebt = (id: string, debtUpdate: Partial<Debt>) => {
    setData(prev => ({
      ...prev,
      debts: prev.debts.map(d => d.id === id ? { ...d, ...debtUpdate } : d)
    }));
  };

  const deleteDebt = (id: string) => {
    setData(prev => ({
      ...prev,
      debts: prev.debts.filter(d => d.id !== id)
    }));
  };

  // Recurring Payments operations
  const addRecurringPayment = (payment: Omit<RecurringPayment, 'id' | 'createdAt'>) => {
    const newPayment: RecurringPayment = { ...payment, id: generateId(), createdAt: new Date().toISOString() };
    setData(prev => ({ ...prev, recurringPayments: [newPayment, ...prev.recurringPayments] }));
  };

  const updateRecurringPayment = (id: string, paymentUpdate: Partial<RecurringPayment>) => {
    setData(prev => ({
      ...prev,
      recurringPayments: prev.recurringPayments.map(rp => rp.id === id ? { ...rp, ...paymentUpdate } : rp)
    }));
  };

  const deleteRecurringPayment = (id: string) => {
    setData(prev => ({
      ...prev,
      recurringPayments: prev.recurringPayments.filter(rp => rp.id !== id)
    }));
  };

  const payRecurringPayment = (paymentId: string) => {
    const payment = data.recurringPayments.find(rp => rp.id === paymentId);
    if (!payment) return;
    
    const today = new Date().toISOString().split('T')[0];
    const newExpense: Expense = {
      id: generateId(),
      date: today,
      amount: payment.amount,
      category: payment.category,
      description: `Pago recurrente: ${payment.name}`,
      isRecurring: true,
      recurringId: payment.id
    };
    
    setData(prev => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
      recurringPayments: prev.recurringPayments.map(rp => 
        rp.id === paymentId ? { ...rp, lastPaidDate: today } : rp
      )
    }));
  };

  // Custom Tags operations
  const addCustomTag = (tag: string) => {
    if (!data.customTags.includes(tag)) {
      setData(prev => ({ ...prev, customTags: [...prev.customTags, tag] }));
    }
  };

  const deleteCustomTag = (tag: string) => {
    setData(prev => ({
      ...prev,
      customTags: prev.customTags.filter(t => t !== tag)
    }));
  };

  // Settings operations
  const updateSettings = (settings: Partial<AppData['settings']>) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings }
    }));
  };

  return (
    <AppContext.Provider value={{
      data,
      addSale,
      updateSale,
      deleteSale,
      addExpense,
      updateExpense,
      deleteExpense,
      addProduct,
      updateProduct,
      deleteProduct,
      addClient,
      updateClient,
      deleteClient,
      addEvent,
      updateEvent,
      deleteEvent,
      addGoal,
      updateGoal,
      deleteGoal,
      addDebt,
      updateDebt,
      deleteDebt,
      addRecurringPayment,
      updateRecurringPayment,
      deleteRecurringPayment,
      payRecurringPayment,
      addCustomTag,
      deleteCustomTag,
      updateSettings,
      theme,
      toggleTheme,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
};
