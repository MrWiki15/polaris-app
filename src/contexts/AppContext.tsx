import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  AppData, 
  Sale, 
  Expense, 
  Product, 
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
    setData(prev => ({ ...prev, sales: [newSale, ...prev.sales] }));
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
      updateSettings,
      theme,
      toggleTheme,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
};
