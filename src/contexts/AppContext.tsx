/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  AppData,
  Sale,
  Expense,
  Product,
  Client,
  Worker,
  CalendarEvent,
  FinancialGoal,
  ReinvestmentGoal,
  ReinvestmentExecution,
  Debt,
  RecurringPayment,
  Supplier,
  SupplierOrder,
  Service,
  ServiceIncome,
  DepartmentBudgetTransaction,
  loadData,
  saveData,
  generateId,
  formatCurrency,
  defaultData,
} from "@/lib/storage";
import { useSupabaseSync } from "@/hooks/use-supabase-sync";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { supabase } from "@/lib/supabase";

type ProjectMember = {
  email: string;
  departament: string;
  role: string;
};

type SelectedProject = {
  id: number;
  name: string;
  members: ProjectMember[];
  departaments?: string[];
  wallets?: {
    name: string;
    address: string;
    privateKey: string;
  }[];
  initial_balance?: string | null;
};

interface SyncState {
  isSyncing: boolean;
  isOnline: boolean;
  lastSyncTime: string | null;
}

interface AppContextType {
  data: AppData;
  supabaseSyncState?: SyncState;
  currentProject: SelectedProject | null;
  currentProjectMember: ProjectMember | null;
  setCurrentProject: (
    project: SelectedProject | null,
    member: ProjectMember | null,
  ) => void;
  // Sales
  addSale: (sale: Omit<Sale, "id">) => void;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  // Expenses
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  // Products
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Clients
  addClient: (client: Omit<Client, "id" | "createdAt">) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  // Workers
  addWorker: (worker: Omit<Worker, "id" | "createdAt">) => void;
  updateWorker: (id: string, worker: Partial<Worker>) => void;
  deleteWorker: (id: string) => void;
  // Events
  addEvent: (event: Omit<CalendarEvent, "id">) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  // Goals
  addGoal: (goal: Omit<FinancialGoal, "id" | "createdAt">) => void;
  updateGoal: (id: string, goal: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;
  addReinvestmentGoal: (
    goal: Omit<ReinvestmentGoal, "id" | "createdAt">,
  ) => void;
  addReinvestmentExecution: (
    execution: Omit<ReinvestmentExecution, "id">,
  ) => void;
  addDepartmentBudgetTransaction: (
    tx: Omit<DepartmentBudgetTransaction, "id" | "createdAt">,
  ) => void;
  updateDepartmentBudgetTransaction: (
    id: string,
    update: Partial<DepartmentBudgetTransaction>,
  ) => void;
  // Debts
  addDebt: (debt: Omit<Debt, "id" | "createdAt">) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  // Recurring Payments
  addRecurringPayment: (
    payment: Omit<RecurringPayment, "id" | "createdAt">,
  ) => void;
  updateRecurringPayment: (
    id: string,
    payment: Partial<RecurringPayment>,
  ) => void;
  deleteRecurringPayment: (id: string) => void;
  payRecurringPayment: (paymentId: string) => void;
  // Suppliers
  addSupplier: (supplier: Omit<Supplier, "id" | "createdAt">) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  // Supplier Orders
  addSupplierOrder: (order: Omit<SupplierOrder, "id" | "createdAt">) => void;
  updateSupplierOrder: (id: string, order: Partial<SupplierOrder>) => void;
  deleteSupplierOrder: (id: string) => void;
  receiveSupplierOrder: (orderId: string) => void;
  // Services Catalog
  addService: (service: Omit<Service, "id" | "createdAt">) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  // Service Incomes
  addServiceIncome: (income: Omit<ServiceIncome, "id">) => void;
  updateServiceIncome: (id: string, income: Partial<ServiceIncome>) => void;
  deleteServiceIncome: (id: string) => void;
  // Custom Tags
  addCustomTag: (tag: string) => void;
  updateCustomTag: (oldTag: string, newTag: string) => void;
  deleteCustomTag: (tag: string) => void;
  // Settings
  updateSettings: (settings: Partial<AppData["settings"]>) => void;
  // Theme
  theme: "light" | "dark";
  toggleTheme: () => void;
  // Refresh data
  refreshData: () => void;
  // Auth
  supabaseSync: {
    isSyncing: boolean;
    isOnline: boolean;
    lastSyncTime: string | null;
    checkSyncStatus: () => Promise<{
      hasLocalChanges: boolean;
      hasRemoteChanges: boolean;
      localTime: number;
      remoteTime: number;
    } | null>;
    restoreFromCloud: () => Promise<AppData | null>;
    syncConflict: {
      cloudStats: { products: number; sales: number; clients: number };
      localStats: { products: number; sales: number; clients: number };
    } | null;
    resolveConflict: () => void;
    saveToSupabase: (data: AppData, force?: boolean) => Promise<void>;
    isInitialCheckDone: boolean;
  };
  supabaseAuth: ReturnType<typeof useSupabaseAuth>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [data, setData] = useState<AppData>(() => loadData());
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("negocio360_theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const [currentProject, setCurrentProjectState] =
    useState<SelectedProject | null>(null);
  const [currentProjectMember, setCurrentProjectMember] =
    useState<ProjectMember | null>(null);

  const isProjectMode = !!currentProject;

  // Supabase auth and sync
  const supabaseAuth = useSupabaseAuth();
  const isPremium = data.settings.isPremium || true;
  //const isPremium = true;
  const supabaseSync = useSupabaseSync(supabaseAuth.user?.id, isPremium);
  const { isSyncing, isOnline, lastSyncTime, saveToSupabase } = supabaseSync;

  const loadProjectData = useCallback(async (projectId: number) => {
    try {
      const { data: projectData, error } = await supabase
        .from("projects")
        .select("data")
        .eq("id", projectId)
        .single();

      if (error) {
        console.error("Error loading project data:", error);
        setData(defaultData);
        return;
      }

      const payload = (projectData as any)?.data as AppData | undefined;
      if (payload && typeof payload === "object") {
        setData({
          ...defaultData,
          ...payload,
        });
      } else {
        setData(defaultData);
      }
    } catch (err) {
      console.error("Unexpected error loading project data:", err);
      setData(defaultData);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("negocio360_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!isProjectMode) {
      saveData(data);
      localStorage.setItem("negocio360_data_updated", Date.now().toString());
    }
  }, [data, isProjectMode]);

  useEffect(() => {
    if (
      !isProjectMode &&
      isPremium &&
      isOnline &&
      supabaseAuth.isAuthenticated &&
      supabaseSync.isInitialCheckDone
    ) {
      const timer = setTimeout(() => {
        // We do NOT force save here; we let the internal check handle conflicts
        saveToSupabase(data);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    data,
    isPremium,
    isOnline,
    supabaseAuth.isAuthenticated,
    saveToSupabase,
    isProjectMode,
    supabaseSync.isInitialCheckDone,
  ]);

  // Automatically save project data to Supabase when in project mode
  useEffect(() => {
    if (!isProjectMode || !supabaseAuth.isAuthenticated || !isPremium) return;

    const timer = setTimeout(() => {
      const saveProject = async () => {
        try {
          await supabase
            .from("projects")
            .update({ data })
            .eq("id", currentProject?.id);
        } catch (err) {
          console.error("Error saving project data:", err);
        }
      };

      saveProject();
    }, 1000); // Debounce saves to prevent too many requests

    return () => clearTimeout(timer);
  }, [
    data,
    isProjectMode,
    currentProject?.id,
    supabaseAuth.isAuthenticated,
    isPremium,
  ]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const refreshData = () => {
    if (currentProject) {
      loadProjectData(currentProject.id);
    } else {
      setData(loadData());
    }
  };

  const setCurrentProject = (
    project: SelectedProject | null,
    member: ProjectMember | null,
  ) => {
    setCurrentProjectState(project);
    setCurrentProjectMember(member);
    if (project) {
      loadProjectData(project.id);
    } else {
      setData(loadData());
    }
  };

  // Sales operations
  const addSale = (sale: Omit<Sale, "id">) => {
    const newSale: Sale = { ...sale, id: generateId() };

    // If sale has a productId, update inventory
    if (sale.productId && sale.quantity) {
      setData((prev) => {
        const product = prev.products.find((p) => p.id === sale.productId);
        let updatedProducts = [...prev.products];

        // Update the main product
        updatedProducts = updatedProducts.map((p) =>
          p.id === sale.productId
            ? { ...p, quantity: Math.max(0, p.quantity - (sale.quantity || 0)) }
            : p,
        );

        // If it's a compound product, also reduce its components
        if (product && product.type === "compound" && product.components) {
          updatedProducts = updatedProducts.map((p) => {
            const component = product.components?.find(
              (c) => c.productId === p.id,
            );
            if (component) {
              const totalToReduce = component.quantity * (sale.quantity || 0);
              return {
                ...p,
                quantity: Math.max(0, p.quantity - totalToReduce),
              };
            }
            return p;
          });
        }

        return {
          ...prev,
          sales: [newSale, ...prev.sales],
          products: updatedProducts,
        };
      });
    } else {
      setData((prev) => ({ ...prev, sales: [newSale, ...prev.sales] }));
    }
  };

  const updateSale = (id: string, saleUpdate: Partial<Sale>) => {
    setData((prev) => ({
      ...prev,
      sales: prev.sales.map((s) => (s.id === id ? { ...s, ...saleUpdate } : s)),
    }));
  };

  const deleteSale = (id: string) => {
    setData((prev) => ({
      ...prev,
      sales: prev.sales.filter((s) => s.id !== id),
    }));
  };

  // Expenses operations
  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense: Expense = { ...expense, id: generateId() };
    setData((prev) => ({ ...prev, expenses: [newExpense, ...prev.expenses] }));
  };

  const updateExpense = (id: string, expenseUpdate: Partial<Expense>) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) =>
        e.id === id ? { ...e, ...expenseUpdate } : e,
      ),
    }));
  };

  const deleteExpense = (id: string) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  };

  // Products operations
  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = { ...product, id: generateId() };
    setData((prev) => ({ ...prev, products: [newProduct, ...prev.products] }));
  };

  const updateProduct = (id: string, productUpdate: Partial<Product>) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === id ? { ...p, ...productUpdate } : p,
      ),
    }));
  };

  const deleteProduct = (id: string) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));
  };

  // Clients operations
  const addClient = (client: Omit<Client, "id" | "createdAt">) => {
    const newClient: Client = {
      ...client,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, clients: [newClient, ...prev.clients] }));
  };

  const updateClient = (id: string, clientUpdate: Partial<Client>) => {
    setData((prev) => ({
      ...prev,
      clients: prev.clients.map((c) =>
        c.id === id ? { ...c, ...clientUpdate } : c,
      ),
    }));
  };

  const deleteClient = (id: string) => {
    setData((prev) => ({
      ...prev,
      clients: prev.clients.filter((c) => c.id !== id),
    }));
  };

  // Workers operations (premium feature)
  const addWorker = (worker: Omit<Worker, "id" | "createdAt">) => {
    const newWorker: Worker = {
      ...worker,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    setData((prev) => {
      const newWorkers = [newWorker, ...prev.workers];

      // Recalculate total salaries
      const totalSalary = newWorkers.reduce((s, w) => s + (w.salary || 0), 0);

      // Update or create Salaries recurring payment
      const existing = prev.recurringPayments.find(
        (rp) => rp.name === "Salarios" || rp.category === "Salarios",
      );
      let newRecurringPayments = prev.recurringPayments;
      if (existing) {
        newRecurringPayments = prev.recurringPayments.map((rp) =>
          rp.id === existing.id
            ? { ...rp, amount: totalSalary, dayOfMonth: 10, isActive: true }
            : rp,
        );
      } else {
        const rp: RecurringPayment = {
          id: generateId(),
          name: "Salarios",
          amount: totalSalary,
          category: "Salarios",
          frequency: "mensual",
          dayOfMonth: 10,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        newRecurringPayments = [rp, ...prev.recurringPayments];
      }

      // Remove existing salary events and create monthly events (next 12 months)
      const withoutSalaryEvents = prev.events.filter(
        (e) => e.title !== "Pago salarios",
      );
      const eventsToAdd: CalendarEvent[] = [];
      const today = new Date();
      let start = new Date(today.getFullYear(), today.getMonth(), 10);
      if (today.getDate() > 10) {
        start = new Date(today.getFullYear(), today.getMonth() + 1, 10);
      }
      for (let i = 0; i < 12; i++) {
        const d = new Date(start.getFullYear(), start.getMonth() + i, 10);
        const dateStr = d.toISOString().split("T")[0];
        eventsToAdd.push({
          id: generateId(),
          title: "Pago salarios",
          date: dateStr,
          type: "pago",
          description: `Pago de salarios: ${formatCurrency(
            totalSalary,
            prev.settings.currencySymbol,
          )}`,
          completed: false,
        });
      }

      return {
        ...prev,
        workers: newWorkers,
        recurringPayments: newRecurringPayments,
        events: [...eventsToAdd, ...withoutSalaryEvents],
      };
    });
  };

  const updateWorker = (id: string, workerUpdate: Partial<Worker>) => {
    setData((prev) => {
      const newWorkers = prev.workers.map((w) =>
        w.id === id ? { ...w, ...workerUpdate } : w,
      );
      const totalSalary = newWorkers.reduce((s, w) => s + (w.salary || 0), 0);

      const newRecurringPayments = prev.recurringPayments.map((rp) =>
        rp.name === "Salarios" || rp.category === "Salarios"
          ? { ...rp, amount: totalSalary, dayOfMonth: 10, isActive: true }
          : rp,
      );

      // Update salary events descriptions
      const updatedEvents = prev.events.map((e) =>
        e.title === "Pago salarios"
          ? {
              ...e,
              description: `Pago de salarios: ${formatCurrency(
                totalSalary,
                prev.settings.currencySymbol,
              )}`,
            }
          : e,
      );

      return {
        ...prev,
        workers: newWorkers,
        recurringPayments: newRecurringPayments,
        events: updatedEvents,
      };
    });
  };

  const deleteWorker = (id: string) => {
    setData((prev) => {
      const newWorkers = prev.workers.filter((w) => w.id !== id);
      const totalSalary = newWorkers.reduce((s, w) => s + (w.salary || 0), 0);

      const newRecurringPayments = prev.recurringPayments
        .map((rp) =>
          rp.name === "Salarios" || rp.category === "Salarios"
            ? { ...rp, amount: totalSalary }
            : rp,
        )
        .filter(Boolean as any);

      const updatedEvents = prev.events.map((e) =>
        e.title === "Pago salarios"
          ? {
              ...e,
              description: `Pago de salarios: ${formatCurrency(
                totalSalary,
                prev.settings.currencySymbol,
              )}`,
            }
          : e,
      );

      return {
        ...prev,
        workers: newWorkers,
        recurringPayments: newRecurringPayments,
        events: updatedEvents,
      };
    });
  };

  // Events operations
  const addEvent = (event: Omit<CalendarEvent, "id">) => {
    const newEvent: CalendarEvent = { ...event, id: generateId() };
    setData((prev) => ({ ...prev, events: [newEvent, ...prev.events] }));
  };

  const updateEvent = (id: string, eventUpdate: Partial<CalendarEvent>) => {
    setData((prev) => ({
      ...prev,
      events: prev.events.map((e) =>
        e.id === id ? { ...e, ...eventUpdate } : e,
      ),
    }));
  };

  const deleteEvent = (id: string) => {
    setData((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
    }));
  };

  // Goals operations
  const addGoal = (goal: Omit<FinancialGoal, "id" | "createdAt">) => {
    const newGoal: FinancialGoal = {
      ...goal,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, goals: [newGoal, ...prev.goals] }));
  };

  const updateGoal = (id: string, goalUpdate: Partial<FinancialGoal>) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...goalUpdate } : g)),
    }));
  };

  const deleteGoal = (id: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  };

  const addReinvestmentGoal = (
    goal: Omit<ReinvestmentGoal, "id" | "createdAt">,
  ) => {
    const newGoal: ReinvestmentGoal = {
      ...goal,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      reinvestmentGoals: [newGoal, ...(prev.reinvestmentGoals || [])],
    }));
  };

  const addReinvestmentExecution = (
    execution: Omit<ReinvestmentExecution, "id">,
  ) => {
    const newExecution: ReinvestmentExecution = {
      ...execution,
      id: generateId(),
    };
    setData((prev) => ({
      ...prev,
      reinvestmentExecutions: [
        newExecution,
        ...(prev.reinvestmentExecutions || []),
      ],
    }));
  };

  const addDepartmentBudgetTransaction = (
    tx: Omit<DepartmentBudgetTransaction, "id" | "createdAt">,
  ) => {
    const newTx: DepartmentBudgetTransaction = {
      ...tx,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      departmentBudgetTransactions: [
        newTx,
        ...(prev.departmentBudgetTransactions || []),
      ],
    }));
  };

  const updateDepartmentBudgetTransaction = (
    id: string,
    update: Partial<DepartmentBudgetTransaction>,
  ) => {
    setData((prev) => ({
      ...prev,
      departmentBudgetTransactions: (
        prev.departmentBudgetTransactions || []
      ).map((tx) => (tx.id === id ? { ...tx, ...update } : tx)),
    }));
  };

  // Debts operations
  const addDebt = (debt: Omit<Debt, "id" | "createdAt">) => {
    const newDebt: Debt = {
      ...debt,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, debts: [newDebt, ...prev.debts] }));
  };

  const updateDebt = (id: string, debtUpdate: Partial<Debt>) => {
    setData((prev) => ({
      ...prev,
      debts: prev.debts.map((d) => (d.id === id ? { ...d, ...debtUpdate } : d)),
    }));
  };

  const deleteDebt = (id: string) => {
    setData((prev) => ({
      ...prev,
      debts: prev.debts.filter((d) => d.id !== id),
    }));
  };

  // Recurring Payments operations
  const addRecurringPayment = (
    payment: Omit<RecurringPayment, "id" | "createdAt">,
  ) => {
    const newPayment: RecurringPayment = {
      ...payment,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      recurringPayments: [newPayment, ...prev.recurringPayments],
    }));
  };

  const updateRecurringPayment = (
    id: string,
    paymentUpdate: Partial<RecurringPayment>,
  ) => {
    setData((prev) => ({
      ...prev,
      recurringPayments: prev.recurringPayments.map((rp) =>
        rp.id === id ? { ...rp, ...paymentUpdate } : rp,
      ),
    }));
  };

  const deleteRecurringPayment = (id: string) => {
    setData((prev) => ({
      ...prev,
      recurringPayments: prev.recurringPayments.filter((rp) => rp.id !== id),
    }));
  };

  const payRecurringPayment = (paymentId: string) => {
    const payment = data.recurringPayments.find((rp) => rp.id === paymentId);
    if (!payment) return;

    const today = new Date().toISOString().split("T")[0];
    const newExpense: Expense = {
      id: generateId(),
      date: today,
      amount: payment.amount,
      category: payment.category,
      description: `Pago recurrente: ${payment.name}`,
      isRecurring: true,
      recurringId: payment.id,
    };

    setData((prev) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
      recurringPayments: prev.recurringPayments.map((rp) =>
        rp.id === paymentId ? { ...rp, lastPaidDate: today } : rp,
      ),
    }));
  };

  // Custom Tags operations
  const addCustomTag = (tag: string) => {
    if (!data.customTags.includes(tag)) {
      setData((prev) => ({ ...prev, customTags: [...prev.customTags, tag] }));
    }
  };

  const updateCustomTag = (oldTag: string, newTag: string) => {
    if (!data.customTags.includes(newTag)) {
      setData((prev) => ({
        ...prev,
        customTags: prev.customTags.map((t) => (t === oldTag ? newTag : t)),
      }));
    }
  };

  const deleteCustomTag = (tag: string) => {
    setData((prev) => ({
      ...prev,
      customTags: prev.customTags.filter((t) => t !== tag),
    }));
  };

  // Suppliers operations
  const addSupplier = (supplier: Omit<Supplier, "id" | "createdAt">) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      suppliers: [newSupplier, ...prev.suppliers],
    }));
  };

  const updateSupplier = (id: string, supplierUpdate: Partial<Supplier>) => {
    setData((prev) => ({
      ...prev,
      suppliers: prev.suppliers.map((s) =>
        s.id === id ? { ...s, ...supplierUpdate } : s,
      ),
    }));
  };

  const deleteSupplier = (id: string) => {
    setData((prev) => ({
      ...prev,
      suppliers: prev.suppliers.filter((s) => s.id !== id),
    }));
  };

  // Supplier Orders operations
  const addSupplierOrder = (order: Omit<SupplierOrder, "id" | "createdAt">) => {
    const newOrder: SupplierOrder = {
      ...order,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      supplierOrders: [newOrder, ...prev.supplierOrders],
    }));
  };

  const updateSupplierOrder = (
    id: string,
    orderUpdate: Partial<SupplierOrder>,
  ) => {
    setData((prev) => ({
      ...prev,
      supplierOrders: prev.supplierOrders.map((o) =>
        o.id === id ? { ...o, ...orderUpdate } : o,
      ),
    }));
  };

  const deleteSupplierOrder = (id: string) => {
    setData((prev) => ({
      ...prev,
      supplierOrders: prev.supplierOrders.filter((o) => o.id !== id),
    }));
  };

  const receiveSupplierOrder = (orderId: string) => {
    const order = data.supplierOrders.find((o) => o.id === orderId);
    if (!order) return;

    // Update inventory with received items
    setData((prev) => ({
      ...prev,
      supplierOrders: prev.supplierOrders.map((o) =>
        o.id === orderId ? { ...o, status: "received" as const } : o,
      ),
      products: prev.products.map((p) => {
        const orderedItem = order.items.find((i) => i.productId === p.id);
        if (orderedItem) {
          return { ...p, quantity: p.quantity + orderedItem.quantity };
        }
        return p;
      }),
    }));
  };

  // Services catalog operations
  const addService = (service: Omit<Service, "id" | "createdAt">) => {
    const newService: Service = {
      ...service,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, services: [newService, ...prev.services] }));
  };

  const updateService = (id: string, serviceUpdate: Partial<Service>) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.id === id ? { ...s, ...serviceUpdate } : s,
      ),
    }));
  };

  const deleteService = (id: string) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
  };

  // Service incomes operations
  const addService = (service: Omit<Service, "id" | "createdAt">) => {
    const newService: Service = {
      ...service,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, services: [newService, ...prev.services] }));
  };

  const updateService = (id: string, serviceUpdate: Partial<Service>) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.id === id ? { ...s, ...serviceUpdate } : s,
      ),
    }));
  };

  const deleteService = (id: string) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
  };

  // Service incomes operations
  const addServiceIncome = (income: Omit<ServiceIncome, "id">) => {
    const newIncome: ServiceIncome = { ...income, id: generateId() };

    setData((prev) => {
      let updatedData = {
        ...prev,
        serviceIncomes: [newIncome, ...prev.serviceIncomes],
      };

      // Find the service to get linked items
      const service = prev.services.find((s) => s.id === income.serviceId);
      if (service?.items && service.items.length > 0) {
        // Build a map of total reductions per product id, handling compound products recursively
        const reductions = new Map<string, number>();
        const qtyMultiplier = income.quantity || 1;

        const accumulateReduction = (productId: string, qty: number) => {
          const prod = prev.products.find((p) => p.id === productId);
          if (!prod) return;

          if (
            prod.type === "compound" &&
            prod.components &&
            prod.components.length > 0
          ) {
            prod.components.forEach((comp) => {
              accumulateReduction(comp.productId, comp.quantity * qty);
            });
          } else {
            const prevVal = reductions.get(productId) || 0;
            reductions.set(productId, prevVal + qty);
          }
        };

        service.items.forEach((it) => {
          accumulateReduction(it.productId, it.quantity * qtyMultiplier);
        });

        const updatedProducts = updatedData.products.map((p) => {
          const toReduce = reductions.get(p.id) || 0;
          if (!toReduce) return p;
          return { ...p, quantity: Math.max(0, p.quantity - toReduce) };
        });

        updatedData = { ...updatedData, products: updatedProducts };
      }

      // If service has associated expense, create it
      if (service?.associatedExpense) {
        const expenseAmount =
          (income.amount * service.associatedExpense.percent) / 100;
        const newExpense: Expense = {
          id: generateId(),
          date: income.date,
          amount: expenseAmount,
          category: service.associatedExpense.category,
          description: `Gasto asociado a servicio: ${service.name}`,
        };
        updatedData = {
          ...updatedData,
          expenses: [newExpense, ...updatedData.expenses],
        };
      }

      // Also record a Sale so that cashflow and balances include this income
      const newSale: Sale = {
        id: generateId(),
        date: income.date,
        amount: income.amount,
        category: "Servicio",
        description: (prev.services.find((s) => s.id === income.serviceId)
          ?.name || "Servicio") as string,
      };

      updatedData = { ...updatedData, sales: [newSale, ...updatedData.sales] };

      return updatedData;
    });
  };

  const updateServiceIncome = (
    id: string,
    incomeUpdate: Partial<ServiceIncome>,
  ) => {
    setData((prev) => ({
      ...prev,
      serviceIncomes: prev.serviceIncomes.map((i) =>
        i.id === id ? { ...i, ...incomeUpdate } : i,
      ),
    }));
  };

  const deleteServiceIncome = (id: string) => {
    setData((prev) => ({
      ...prev,
      serviceIncomes: prev.serviceIncomes.filter((i) => i.id !== id),
    }));
  };

  // Settings operations
  const updateSettings = (settings: Partial<AppData["settings"]>) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  };

  return (
    <AppContext.Provider
      value={{
        data,
        supabaseSyncState: {
          isSyncing,
          isOnline,
          lastSyncTime,
        },
        supabaseSync: {
          isSyncing,
          isOnline,
          lastSyncTime,
          checkSyncStatus: supabaseSync.checkSyncStatus,
          restoreFromCloud: supabaseSync.restoreFromCloud,
          saveToSupabase: supabaseSync.saveToSupabase,
          syncConflict: supabaseSync.syncConflict,
          resolveConflict: supabaseSync.resolveConflict,
          isInitialCheckDone: supabaseSync.isInitialCheckDone,
        },
        currentProject,
        currentProjectMember,
        setCurrentProject,
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
        addWorker,
        updateWorker,
        deleteWorker,
        addEvent,
        updateEvent,
        deleteEvent,
        addGoal,
        updateGoal,
        deleteGoal,
        addReinvestmentGoal,
        addReinvestmentExecution,
        addDepartmentBudgetTransaction,
        updateDepartmentBudgetTransaction,
        addDebt,
        updateDebt,
        deleteDebt,
        addRecurringPayment,
        updateRecurringPayment,
        deleteRecurringPayment,
        payRecurringPayment,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addSupplierOrder,
        updateSupplierOrder,
        deleteSupplierOrder,
        receiveSupplierOrder,
        addService,
        updateService,
        deleteService,
        addServiceIncome,
        updateServiceIncome,
        deleteServiceIncome,
        addCustomTag,
        updateCustomTag,
        deleteCustomTag,
        updateSettings,
        theme,
        toggleTheme,
        refreshData,
        supabaseAuth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
