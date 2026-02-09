/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ethers } from "ethers";
import {
  getUserWallet,
  type UserWallet,
  getPusdBalance,
  getPusdTransfers,
  sendPusd,
  mintNftForCollection,
  getHederaBalance,
  sendHbar,
  getHederaTransactions,
  type HederaTransaction,
} from "@/lib/wallet";
import type { Expense, AppData } from "@/lib/storage";
import {
  Wallet as WalletIcon,
  Send,
  Copy,
  Download,
  Settings,
  ExternalLink,
  Calendar,
  Award,
  Repeat2,
  Edit2,
  Trash2,
} from "lucide-react";
import {
  getPersonalWallets,
  createPersonalWallet,
  performTransfer,
  getTransferHistory,
  updateWalletName,
  deletePersonalWallet,
  updateWalletBalance,
  type PersonalWallet,
  type PersonalWalletTransfer,
} from "@/lib/personalWallets";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { generateId } from "@/lib/storage";

type ProjectWalletTransactionType =
  | "assignment"
  | "emergency_withdrawal"
  | "expense";

type ProjectWalletTransaction = {
  id: string;
  date: string;
  type: ProjectWalletTransactionType;
  fromDepartament: string;
  toDepartament: string;
  amount: number;
  description?: string;
  createdBy: string;
};

type ProjectWalletRequestType = "assignment" | "emergency_withdrawal";

type ProjectWalletRequest = {
  id: string;
  date: string;
  requestType: ProjectWalletRequestType;
  fromDepartament: string;
  targetDepartament?: string;
  amount: number;
  description?: string;
  createdBy: string;
  status: "pending" | "approved" | "rejected";
  approvedByDireccion?: string;
  approvedByEconomia?: string;
};

type ProjectWalletData = {
  transactions: ProjectWalletTransaction[];
  requests: ProjectWalletRequest[];
};

type ProjectDataPayload = AppData & {
  projectWallet?: ProjectWalletData;
};

type ProjectWallet = {
  name: string;
  address: string;
  privateKey: string;
};

type PeriodHistory = {
  id: string;
  type: "period";
  startDate: string;
  endDate: string;
  totals: {
    ingresos: number;
    gastos: number;
    inventarioCoste: number;
    inventarioPrecio: number;
  };
  ipfsHash: string;
  ipfsUri: string;
  ipfsGatewayUrl: string;
  tokenId: string;
  serialNumber: number;
};

type ProjectDetails = {
  id: number;
  name: string;
  wallets: ProjectWallet[];
  initial_balance?: string | null;
  data?: ProjectDataPayload | null;
  history?: PeriodHistory[];
};

const DEPARTAMENT_LABELS: Record<string, string> = {
  direccion: "Dirección",
  economia: "Economía",
  recursos_humanos: "Recursos Humanos",
  marketing: "Marketing",
  ventas: "Ventas",
  logistica: "Logística",
};

export default function Wallet() {
  const {
    supabaseAuth,
    data,
    currentProject,
    currentProjectMember,
    addReinvestmentGoal,
    addReinvestmentExecution,
  } = useApp();
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [hederaAccountId, setHederaAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [amountUsd, setAmountUsd] = useState("");
  const [balance, setBalance] = useState<string>("0.00");
  const [transfers, setTransfers] = useState<
    {
      hash: string;
      timestamp: number;
      from: string;
      to: string;
      amount: string;
      direction: "sent" | "received";
    }[]
  >([]);
  const [goalName, setGoalName] = useState("");
  const [goalPercentage, setGoalPercentage] = useState("25");
  const [goalDay, setGoalDay] = useState("1");
  const [goalWallet, setGoalWallet] = useState<string>("");
  const [personalWallets, setPersonalWallets] = useState<PersonalWallet[]>([]);
  const [transferHistory, setTransferHistory] = useState<
    PersonalWalletTransfer[]
  >([]);
  const [newWalletName, setNewWalletName] = useState("");
  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [editingWalletName, setEditingWalletName] = useState("");
  const isPersonalMode = !currentProject;
  const toNumber = (value: string | number | undefined | null) => {
    const n = typeof value === "number" ? value : Number(value || 0);
    return Number.isFinite(n) ? n : 0;
  };
  const transferableBalance = useMemo(() => {
    return toNumber(balance);
  }, [balance]);

  // Total ingresos brutos de ventas (no ganancia, sino monto total)
  const salesRevenue = useMemo(() => {
    const sales = data.sales || [];
    return sales.reduce((total, sale) => {
      return total + (sale.amount || 0);
    }, 0);
  }, [data.sales]);

  // Total de gastos registrados
  const totalExpenses = useMemo(() => {
    const expenses = data.expenses || [];
    return expenses.reduce((total, expense) => {
      return total + (expense.amount || 0);
    }, 0);
  }, [data.expenses]);

  // Total transferencias OUT desde la wallet principal a otras wallets
  const transfersOut = useMemo(() => {
    const principal = personalWallets.find((w) => w.name === "Principal");
    if (!principal) return 0;
    return transferHistory.reduce((total, transfer) => {
      if (transfer.fromWalletId === principal.id) {
        return total + transfer.amount;
      }
      return total;
    }, 0);
  }, [personalWallets, transferHistory]);

  // Balance de la wallet principal en modo personal
  // = PUSD balance + ingresos de ventas - gastos - transferencias OUT
  const nonTransferableBalance = useMemo(() => {
    if (!isPersonalMode) return 0;
    return salesRevenue - totalExpenses - transfersOut;
  }, [salesRevenue, totalExpenses, transfersOut, isPersonalMode]);

  // Ganancia potencial del inventario disponible (para referencia)
  const symbolicBalance = useMemo(() => {
    const products = data.products || [];
    return products.reduce((total, p) => {
      const unitProfit = p.price - p.cost;
      const productProfit = unitProfit * p.quantity;
      return total + productProfit;
    }, 0);
  }, [data.products]);

  // Balance total de la wallet principal = PUSD + ingresos netos - gastos - transferencias OUT
  // NO incluye el valor representativo del inventario
  const totalBalance = useMemo(() => {
    if (!isPersonalMode) return 0;
    return transferableBalance + nonTransferableBalance;
  }, [transferableBalance, nonTransferableBalance, isPersonalMode]);
  const formatUsd = (value: number) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const totalReinvested = useMemo(() => {
    const executions = data.reinvestmentExecutions || [];
    return executions.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [data.reinvestmentExecutions]);

  // Ganancia neta disponible para reinvertir (después de gastos/transferencias)
  const remainingNonTransferable = useMemo(() => {
    if (!isPersonalMode) return 0;
    // Solo la ganancia del inventario puede ser reinvertida
    return Math.max(0, symbolicBalance - totalReinvested);
  }, [symbolicBalance, totalReinvested, isPersonalMode]);

  const reinvestmentGoals = useMemo(() => {
    return data.reinvestmentGoals || [];
  }, [data.reinvestmentGoals]);

  const [assignmentDept, setAssignmentDept] = useState("");
  const [assignmentAmount, setAssignmentAmount] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [deptRequestAmount, setDeptRequestAmount] = useState("");
  const [deptRequestDescription, setDeptRequestDescription] = useState("");
  const [deptExpenseAmount, setDeptExpenseAmount] = useState("");
  const [deptExpenseCategory, setDeptExpenseCategory] = useState(
    "Gasto de departamento",
  );
  const [deptExpenseDescription, setDeptExpenseDescription] = useState("");
  const [emergencyDept, setEmergencyDept] = useState("");
  const [emergencyAmount, setEmergencyAmount] = useState("");
  const [emergencyDescription, setEmergencyDescription] = useState("");
  const [emergencyRequestDept, setEmergencyRequestDept] = useState("");
  const [emergencyRequestAmount, setEmergencyRequestAmount] = useState("");
  const [emergencyRequestDescription, setEmergencyRequestDescription] =
    useState("");

  const queryClient = useQueryClient();
  const [closingPeriod, setClosingPeriod] = useState(false);

  const {
    data: projectDetails,
    isLoading: loadingProjectWallet,
    error: projectWalletError,
  } = useQuery({
    queryKey: ["project-wallet", currentProject?.id],
    enabled: !!currentProject?.id,
    queryFn: async (): Promise<ProjectDetails | null> => {
      if (!currentProject?.id) return null;
      const { data: project, error } = await supabase
        .from("projects")
        .select("id,name,wallets,initial_balance,data,history")
        .eq("id", currentProject.id)
        .single();
      if (error) {
        throw error;
      }
      return project as unknown as ProjectDetails;
    },
  });

  const projectWalletData: ProjectWalletData | null = useMemo(() => {
    if (!projectDetails || !projectDetails.data) return null;
    const raw = (projectDetails.data.projectWallet || {}) as ProjectWalletData;
    return {
      transactions: raw.transactions || [],
      requests: raw.requests || [],
    };
  }, [projectDetails]);

  const projectWalletMutation = useMutation({
    mutationFn: async (newData: ProjectDataPayload) => {
      if (!currentProject?.id) return;
      const { error } = await supabase
        .from("projects")
        .update({ data: newData })
        .eq("id", currentProject.id);
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-wallet", currentProject?.id],
      });
    },
  });

  // Project balance calculations (similar to personal mode)
  const projectTransferableBalance = useMemo(() => {
    if (!projectDetails?.data) return 0;
    const initialBalance = toNumber(projectDetails.initial_balance || 0);
    const expenses = projectDetails.data.expenses || [];
    const serviceIncomes = projectDetails.data.serviceIncomes || [];

    const expensesTotal = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const serviceIncomesTotal = serviceIncomes.reduce(
      (sum, s) => sum + (s.amount || 0),
      0,
    );

    return initialBalance + serviceIncomesTotal - expensesTotal;
  }, [projectDetails]);

  const projectNonTransferableBalance = useMemo(() => {
    if (!projectDetails?.data) return 0;
    const sales = projectDetails.data.sales || [];
    const products = projectDetails.data.products || [];
    return sales.reduce((total, sale) => {
      const quantity = sale.quantity || 1;
      let costTotal = 0;
      if (sale.productId) {
        const product = products.find((p) => p.id === sale.productId);
        if (product) {
          costTotal = product.cost * quantity;
        }
      }
      const profit = sale.amount - costTotal;
      return total + profit;
    }, 0);
  }, [projectDetails?.data]);

  const projectSymbolicBalance = useMemo(() => {
    if (!projectDetails?.data) return 0;
    const products = projectDetails.data.products || [];
    return products.reduce((total, p) => {
      const unitProfit = p.price - p.cost;
      const productProfit = unitProfit * p.quantity;
      return total + productProfit;
    }, 0);
  }, [projectDetails?.data]);

  const projectTotalBalance = useMemo(() => {
    return (
      projectTransferableBalance +
      projectNonTransferableBalance +
      projectSymbolicBalance
    );
  }, [
    projectTransferableBalance,
    projectNonTransferableBalance,
    projectSymbolicBalance,
  ]);

  const getDepartamentLabel = (id: string) => {
    return DEPARTAMENT_LABELS[id] || id;
  };

  const calculateProjectProfit = (): number => {
    if (!projectDetails || !projectDetails.data) return 0;
    const projectData = projectDetails.data;
    const sales = projectData.sales || [];
    const products = projectData.products || [];
    return sales.reduce((total, sale) => {
      const quantity = sale.quantity || 1;
      let costTotal = 0;
      if (sale.productId) {
        const product = products.find((p) => p.id === sale.productId);
        if (product) {
          const unitCost = Number(product.cost || 0);
          costTotal = unitCost * quantity;
        }
      }
      const amount = Number(sale.amount || 0);
      return total + (amount - costTotal);
    }, 0);
  };

  const calculateDepartmentBudget = (dept: string): number => {
    if (!projectDetails) return 0;
    const initialBalance = Number(projectDetails.initial_balance || "0") || 0;
    let balanceValue = 0;
    if (dept === "direccion") {
      balanceValue += initialBalance + calculateProjectProfit();
    }
    const txs = projectWalletData?.transactions || [];
    for (const t of txs) {
      if (t.toDepartament === dept) {
        balanceValue += t.amount;
      }
      if (t.fromDepartament === dept) {
        balanceValue -= t.amount;
      }
    }
    return balanceValue;
  };

  const handleCreateGoal = () => {
    const percentage = Number(goalPercentage);
    const day = Number(goalDay);
    if (!goalName || !percentage || percentage <= 0 || percentage > 100) {
      toast({
        title: "Datos inválidos",
        description: "Revisa el nombre y el porcentaje",
        variant: "destructive",
      });
      return;
    }
    if (!day || day < 1 || day > 31) {
      toast({
        title: "Día inválido",
        description: "El día debe estar entre 1 y 31",
        variant: "destructive",
      });
      return;
    }
    if (!goalWallet) {
      toast({
        title: "Wallet requerida",
        description: "Selecciona una wallet para reinvertir",
        variant: "destructive",
      });
      return;
    }
    addReinvestmentGoal({
      name: goalName,
      percentage,
      dayOfMonth: day,
      isActive: true,
      walletId: goalWallet,
    });
    setGoalName("");
    setGoalPercentage("25");
    setGoalWallet("");
  };

  const handleExecuteReinvestment = async (
    goal: (typeof reinvestmentGoals)[0],
  ) => {
    if (!supabaseAuth.user?.id) return;

    const amount = (remainingNonTransferable * goal.percentage) / 100;
    if (amount <= 0) {
      toast({
        title: "Sin ganancias disponibles",
        description: "No hay ganancias suficientes para reinvertir",
      });
      return;
    }

    // Obtener la wallet principal (origen)
    const principal = personalWallets.find((w) => w.name === "Principal");
    if (!principal || principal.balance < amount) {
      toast({
        title: "Saldo insuficiente",
        description:
          "La wallet Principal no tiene suficiente saldo para reinvertir",
        variant: "destructive",
      });
      return;
    }

    // Si no hay walletId, usar la wallet principal como destino
    let targetWalletId = goal.walletId;
    if (!targetWalletId) {
      targetWalletId = principal.id;
    }

    if (!targetWalletId) {
      toast({
        title: "Error",
        description: "No hay wallet disponible para la reinversión",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Restar de la wallet principal
      const newPrincipalBalance = principal.balance - amount;
      await updateWalletBalance(principal.id, newPrincipalBalance);

      // Sumar a la wallet destino (si es diferente de principal)
      if (targetWalletId !== principal.id) {
        const targetWallet = personalWallets.find(
          (w) => w.id === targetWalletId,
        );
        if (targetWallet) {
          const newTargetBalance = targetWallet.balance + amount;
          await updateWalletBalance(targetWalletId, newTargetBalance);
        }
      }

      addReinvestmentExecution({
        goalId: goal.id,
        date: new Date().toISOString(),
        amount,
      });

      // Recargar wallets
      const updated = await getPersonalWallets(supabaseAuth.user.id);
      setPersonalWallets(updated);

      const targetWallet = personalWallets.find((w) => w.id === targetWalletId);
      toast({
        title: "Reinversión registrada",
        description: `Se transfirió ${formatUsd(amount)} de Principal a ${
          targetWallet?.name || "la wallet"
        }`,
      });
    } catch (err) {
      console.error("Error en reinversión:", err);
      toast({
        title: "Error",
        description: "No se pudo registrar la reinversión",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!supabaseAuth.user?.id) return;
      setLoading(true);

      if (isPersonalMode) {
        // Load personal Plume wallet (PUSD)
        const w = await getUserWallet(supabaseAuth.user.id);
        setWallet(w);
        setHederaAccountId(null);
        try {
          const b = await getPusdBalance(supabaseAuth.user.id);
          setBalance(
            ethers.formatUnits
              ? ethers.formatUnits(b.raw, b.decimals)
              : (Number(b.raw) / Math.pow(10, b.decimals)).toString(),
          );
        } catch {
          setBalance("0.00");
        }
        try {
          const t = await getPusdTransfers(supabaseAuth.user.id);
          setTransfers(t);
        } catch {
          setTransfers([]);
        }
        // Load personal wallets from Supabase
        try {
          const wallets = await getPersonalWallets(supabaseAuth.user.id);
          if (wallets.length === 0) {
            // Initialize main wallet if none exist
            const main = await createPersonalWallet(
              supabaseAuth.user.id,
              "Principal",
              Number(totalBalance || 0),
            );
            if (main) {
              setPersonalWallets([main]);
            }
          } else {
            // Sync Principal wallet balance with totalBalance
            const principal = wallets.find((w) => w.name === "Principal");
            if (principal && principal.balance !== Number(totalBalance || 0)) {
              await updateWalletBalance(
                principal.id,
                Number(totalBalance || 0),
              );
            }
            setPersonalWallets(wallets);
          }
        } catch (err) {
          console.error("Error cargando wallets personales", err);
        }
        // Load transfer history
        try {
          const history = await getTransferHistory(supabaseAuth.user.id);
          setTransferHistory(history);
        } catch (err) {
          console.error("Error cargando historial de transferencias", err);
        }
      } else {
        // Load project Hedera wallet (HBAR) + project balances
        setWallet(null);
        if (projectDetails?.wallets && projectDetails.wallets.length > 0) {
          const projectWallet = projectDetails.wallets[0];
          // projectWallet.address should contain the Hedera account ID
          setHederaAccountId(projectWallet.address);

          // Use the project total balance (transferable + non-transferable + symbolic)
          setBalance(projectTotalBalance.toString());

          try {
            const t = await getHederaTransactions(projectWallet.address);
            setTransfers(t);
          } catch {
            setTransfers([]);
          }
        }
      }

      setLoading(false);
    };
    load();
  }, [
    supabaseAuth.user?.id,
    isPersonalMode,
    projectDetails,
    projectTotalBalance,
    totalBalance,
  ]);

  // Sync Principal wallet balance when totalBalance changes (new sales, etc.)
  useEffect(() => {
    const syncPrincipalBalance = async () => {
      if (
        !isPersonalMode ||
        !supabaseAuth.user?.id ||
        personalWallets.length === 0
      )
        return;

      const principal = personalWallets.find((w) => w.name === "Principal");
      if (principal && principal.balance !== Number(totalBalance || 0)) {
        try {
          setLoading(true);
          await updateWalletBalance(principal.id, Number(totalBalance || 0));
          // Reload wallets to reflect updated balance
          const updated = await getPersonalWallets(supabaseAuth.user.id);
          setPersonalWallets(updated);
        } catch (err) {
          console.error("Error syncing principal wallet balance:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    syncPrincipalBalance();
  }, [totalBalance, isPersonalMode, supabaseAuth.user?.id, personalWallets]);

  const persistPersonalWallets = (wallets: PersonalWallet[]) => {
    try {
      const key = `personal_wallets_${supabaseAuth.user?.id}`;
      localStorage.setItem(key, JSON.stringify(wallets));
    } catch (err) {
      console.error("Error guardando wallets personales", err);
    }
  };

  const handleCreatePersonalWallet = async () => {
    if (!newWalletName || !supabaseAuth.user?.id) {
      toast({ title: "Nombre requerido", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const w = await createPersonalWallet(
        supabaseAuth.user.id,
        newWalletName,
        0,
      );
      if (w) {
        const wallets = await getPersonalWallets(supabaseAuth.user.id);
        setPersonalWallets(wallets);
        setNewWalletName("");
        toast({
          title: "Wallet creada",
          description: `Wallet ${w.name} creada`,
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear la wallet",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        description: "Error creando wallet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransferBetweenPersonal = async () => {
    if (!supabaseAuth.user?.id) return;
    const from = personalWallets.find((p) => p.id === transferFrom);
    const to = personalWallets.find((p) => p.id === transferTo);
    const amount = Number(transferAmount || 0);

    if (!from || !to) {
      toast({ title: "Selecciona wallets válidas", variant: "destructive" });
      return;
    }
    if (amount <= 0) {
      toast({ title: "Monto inválido", variant: "destructive" });
      return;
    }
    if (from.balance < amount) {
      toast({ title: "Saldo insuficiente", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const success = await performTransfer(
        supabaseAuth.user.id,
        from,
        to,
        amount,
      );
      if (success) {
        // Reload wallets and history
        const wallets = await getPersonalWallets(supabaseAuth.user.id);
        const history = await getTransferHistory(supabaseAuth.user.id);
        setPersonalWallets(wallets);
        setTransferHistory(history);
        setTransferAmount("");
        setTransferFrom("");
        setTransferTo("");
        toast({ title: "Transferencia registrada" });
      } else {
        toast({
          title: "Error",
          description: "No se pudo realizar la transferencia",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        description: "Error en la transferencia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditWalletName = async () => {
    if (
      !editingWalletId ||
      !editingWalletName.trim() ||
      !supabaseAuth.user?.id
    ) {
      toast({ title: "Nombre inválido", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const success = await updateWalletName(
        editingWalletId,
        editingWalletName,
      );
      if (success) {
        const wallets = await getPersonalWallets(supabaseAuth.user.id);
        setPersonalWallets(wallets);
        setEditingWalletId(null);
        setEditingWalletName("");
        toast({ title: "Wallet actualizada" });
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.log(err);
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWallet = async (walletId: string) => {
    if (!supabaseAuth.user?.id) return;
    const wallet = personalWallets.find((w) => w.id === walletId);
    if (!wallet) return;

    // Prevent deleting Principal wallet
    if (wallet.name === "Principal") {
      toast({
        title: "No puedes eliminar",
        description: "No se puede eliminar la wallet Principal",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const success = await deletePersonalWallet(walletId);
      if (success) {
        const wallets = await getPersonalWallets(supabaseAuth.user.id);
        setPersonalWallets(wallets);
        toast({ title: "Wallet eliminada" });
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.log(err);
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = async () => {
    const addressToCopy = isPersonalMode ? wallet?.address : hederaAccountId;
    if (!addressToCopy) return;
    await navigator.clipboard.writeText(addressToCopy);
    toast({ title: "Dirección copiada", description: "Se copió tu dirección" });
  };

  const handleSend = async () => {
    if (!supabaseAuth.user?.id) return;
    if (!toAddress || !amountUsd) {
      toast({
        title: "Datos requeridos",
        description: "Ingresa dirección y monto",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading(true);

      if (isPersonalMode) {
        // Personal mode: send PUSD
        const res = await sendPusd(supabaseAuth.user.id, toAddress, amountUsd);
        toast({
          title: "Enviado",
          description: `Tx: ${res.hash}`,
        });
        setToAddress("");
        setAmountUsd("");
        const b = await getPusdBalance(supabaseAuth.user.id);
        setBalance(
          ethers.formatUnits
            ? ethers.formatUnits(b.raw, b.decimals)
            : (Number(b.raw) / Math.pow(10, b.decimals)).toString(),
        );
        const t = await getPusdTransfers(supabaseAuth.user.id);
        setTransfers(t);
      } else {
        // Project mode: send HBAR
        if (!hederaAccountId || !projectDetails?.wallets?.[0]) {
          throw new Error("No Hedera wallet configured for project");
        }
        const projectWallet = projectDetails.wallets[0];
        const res = await sendHbar(
          hederaAccountId,
          projectWallet.privateKey,
          toAddress,
          amountUsd,
        );
        toast({
          title: "Enviado",
          description: `Tx: ${res.hash}`,
        });
        setToAddress("");
        setAmountUsd("");
        const b = await getHederaBalance(hederaAccountId);
        setBalance(b.hbar);
        const t = await getHederaTransactions(hederaAccountId);
        setTransfers(t);
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Error al enviar",
        description: "Revisa la dirección, monto y saldo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isProjectDirector =
    !!currentProject &&
    !!currentProjectMember?.role &&
    currentProjectMember.role.toLowerCase().includes("director");
  const isDireccionDept = currentProjectMember?.departament === "direccion";
  const isEconomiaDept = currentProjectMember?.departament === "economia";

  const canAccessProjectWallet = !currentProject
    ? true
    : isDireccionDept || isEconomiaDept || isProjectDirector;

  if (!isPersonalMode) {
    if (!canAccessProjectWallet) {
      return (
        <div className="space-y-6 pb-28">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-xl">
                <WalletIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Wallet del proyecto</h2>
                <p className="text-sm text-muted-foreground">
                  No tienes acceso a la wallet en este proyecto
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const mainDept =
      isDireccionDept || isEconomiaDept
        ? "direccion"
        : currentProjectMember?.departament || "direccion";

    const mainBalance = calculateDepartmentBudget(mainDept);

    const allWallets = projectDetails?.wallets || [];
    const visibleTransactions = (projectWalletData?.transactions || []).filter(
      (t) =>
        isDireccionDept ||
        isEconomiaDept ||
        t.fromDepartament === currentProjectMember?.departament ||
        t.toDepartament === currentProjectMember?.departament,
    );

    const pendingRequests = (projectWalletData?.requests || []).filter(
      (r) => r.status === "pending",
    );

    const handleDirectAssignment = () => {
      if (!projectDetails || !projectDetails.data) return;
      if (!assignmentDept) {
        toast({
          title: "Selecciona un departamento",
          variant: "destructive",
        });
        return;
      }
      const amount = Number(assignmentAmount || "0");
      if (!amount || amount <= 0) {
        toast({
          title: "Monto inválido",
          description: "Ingresa un monto mayor que 0",
          variant: "destructive",
        });
        return;
      }
      const currentData = projectDetails.data as ProjectDataPayload;
      const raw = currentData.projectWallet || {};
      const transactions: ProjectWalletTransaction[] = raw.transactions || [];
      const requests: ProjectWalletRequest[] = raw.requests || [];
      const newTx: ProjectWalletTransaction = {
        id: generateId(),
        date: new Date().toISOString(),
        type: "assignment",
        fromDepartament: "direccion",
        toDepartament: assignmentDept,
        amount,
        description: assignmentDescription || "Asignación de presupuesto",
        createdBy: supabaseAuth.user?.email || "",
      };
      const newWallet: ProjectWalletData = {
        transactions: [newTx, ...transactions],
        requests,
      };
      const newData = {
        ...currentData,
        projectWallet: newWallet,
      };
      projectWalletMutation.mutate(newData);
      setAssignmentAmount("");
      setAssignmentDept("");
      setAssignmentDescription("");
      toast({
        title: "Presupuesto asignado",
        description: "Se registró la asignación de presupuesto",
      });
    };

    const handleDepartmentBudgetRequest = () => {
      if (!projectDetails || !projectDetails.data) return;
      if (!currentProjectMember?.departament) return;
      const amount = Number(deptRequestAmount || "0");
      if (!amount || amount <= 0) {
        toast({
          title: "Monto inválido",
          description: "Ingresa un monto mayor que 0",
          variant: "destructive",
        });
        return;
      }
      const currentData = projectDetails.data as ProjectDataPayload;
      const raw = currentData.projectWallet || {};
      const transactions: ProjectWalletTransaction[] = raw.transactions || [];
      const requests: ProjectWalletRequest[] = raw.requests || [];
      const newRequest: ProjectWalletRequest = {
        id: generateId(),
        date: new Date().toISOString(),
        requestType: "assignment",
        fromDepartament: currentProjectMember.departament,
        amount,
        description:
          deptRequestDescription || "Solicitud de asignación de presupuesto",
        createdBy: supabaseAuth.user?.email || "",
        status: "pending",
      };
      const newWallet: ProjectWalletData = {
        transactions,
        requests: [newRequest, ...requests],
      };
      const newData = {
        ...currentData,
        projectWallet: newWallet,
      };
      projectWalletMutation.mutate(newData);
      setDeptRequestAmount("");
      setDeptRequestDescription("");
      toast({
        title: "Solicitud enviada",
        description: "Se envió la solicitud de presupuesto a dirección",
      });
    };

    const handleDirectEmergencyWithdrawal = () => {
      if (!projectDetails || !projectDetails.data) return;
      if (!emergencyDept) return;
      const amount = Number(emergencyAmount || "0");
      if (!amount || amount <= 0) {
        toast({
          title: "Monto inválido",
          description: "Ingresa un monto mayor que 0",
          variant: "destructive",
        });
        return;
      }
      const currentData = projectDetails.data as ProjectDataPayload;
      const raw = currentData.projectWallet || {};
      const transactions: ProjectWalletTransaction[] = raw.transactions || [];
      const requests: ProjectWalletRequest[] = raw.requests || [];
      const newTx: ProjectWalletTransaction = {
        id: generateId(),
        date: new Date().toISOString(),
        type: "emergency_withdrawal",
        fromDepartament: emergencyDept,
        toDepartament: "direccion",
        amount,
        description:
          emergencyDescription || "Extracción de capital de emergencia",
        createdBy: supabaseAuth.user?.email || "",
      };
      const newWallet: ProjectWalletData = {
        transactions: [newTx, ...transactions],
        requests,
      };
      const newData = {
        ...currentData,
        projectWallet: newWallet,
      };
      projectWalletMutation.mutate(newData);
      setEmergencyDept("");
      setEmergencyAmount("");
      setEmergencyDescription("");
      toast({
        title: "Extracción registrada",
        description:
          "Se registró la extracción de emergencia del departamento seleccionado",
      });
    };

    const handleEconomyEmergencyRequest = () => {
      if (!projectDetails || !projectDetails.data) return;
      if (!emergencyRequestDept) return;
      const amount = Number(emergencyRequestAmount || "0");
      if (!amount || amount <= 0) {
        toast({
          title: "Monto inválido",
          description: "Ingresa un monto mayor que 0",
          variant: "destructive",
        });
        return;
      }
      const currentData = projectDetails.data as ProjectDataPayload;
      const raw = currentData.projectWallet || {};
      const transactions: ProjectWalletTransaction[] = raw.transactions || [];
      const requests: ProjectWalletRequest[] = raw.requests || [];
      const newRequest: ProjectWalletRequest = {
        id: generateId(),
        date: new Date().toISOString(),
        requestType: "emergency_withdrawal",
        fromDepartament: "economia",
        targetDepartament: emergencyRequestDept,
        amount,
        description:
          emergencyRequestDescription ||
          "Solicitud de extracción de capital de emergencia",
        createdBy: supabaseAuth.user?.email || "",
        status: "pending",
      };
      const newWallet: ProjectWalletData = {
        transactions,
        requests: [newRequest, ...requests],
      };
      const newData = {
        ...currentData,
        projectWallet: newWallet,
      };
      projectWalletMutation.mutate(newData);
      setEmergencyRequestDept("");
      setEmergencyRequestAmount("");
      setEmergencyRequestDescription("");
      toast({
        title: "Solicitud enviada",
        description:
          "Se envió la solicitud de extracción de emergencia a dirección",
      });
    };

    const handleApproveRequest = (
      mode: "direccion" | "economia",
      id: string,
    ) => {
      if (!projectDetails || !projectDetails.data) return;
      const currentData = projectDetails.data as ProjectDataPayload;
      const raw = currentData.projectWallet || {};
      const transactions: ProjectWalletTransaction[] = raw.transactions || [];
      const requests: ProjectWalletRequest[] = raw.requests || [];
      const updatedRequests: ProjectWalletRequest[] = [];
      const newTransactions: ProjectWalletTransaction[] = [...transactions];

      for (const req of requests) {
        if (req.id !== id) {
          updatedRequests.push(req);
          continue;
        }
        const updated: ProjectWalletRequest = { ...req };
        if (mode === "direccion") {
          updated.approvedByDireccion = supabaseAuth.user?.email || "";
        } else {
          updated.approvedByEconomia = supabaseAuth.user?.email || "";
        }
        if (
          updated.approvedByDireccion &&
          updated.approvedByEconomia &&
          updated.status === "pending"
        ) {
          updated.status = "approved";
          if (updated.requestType === "assignment") {
            const tx: ProjectWalletTransaction = {
              id: generateId(),
              date: new Date().toISOString(),
              type: "assignment",
              fromDepartament: "direccion",
              toDepartament: updated.fromDepartament,
              amount: updated.amount,
              description:
                updated.description || "Asignación aprobada desde solicitud",
              createdBy: supabaseAuth.user?.email || "",
            };
            newTransactions.unshift(tx);
          } else if (
            updated.requestType === "emergency_withdrawal" &&
            updated.targetDepartament
          ) {
            const tx: ProjectWalletTransaction = {
              id: generateId(),
              date: new Date().toISOString(),
              type: "emergency_withdrawal",
              fromDepartament: updated.targetDepartament,
              toDepartament: "direccion",
              amount: updated.amount,
              description:
                updated.description ||
                "Extracción de emergencia aprobada desde solicitud",
              createdBy: supabaseAuth.user?.email || "",
            };
            newTransactions.unshift(tx);
          }
        }
        updatedRequests.push(updated);
      }

      const newWallet: ProjectWalletData = {
        transactions: newTransactions,
        requests: updatedRequests,
      };
      const newData: ProjectDataPayload = {
        ...currentData,
        projectWallet: newWallet,
      };
      projectWalletMutation.mutate(newData);
      toast({
        title: "Solicitud actualizada",
        description: "Se actualizó el estado de la solicitud",
      });
    };

    const handleRejectRequest = (id: string) => {
      if (!projectDetails || !projectDetails.data) return;
      const currentData = projectDetails.data as ProjectDataPayload;
      const raw = currentData.projectWallet || {};
      const transactions: ProjectWalletTransaction[] = raw.transactions || [];
      const requests: ProjectWalletRequest[] = raw.requests || [];
      const updatedRequests = requests.map((r) =>
        r.id === id ? { ...r, status: "rejected" } : r,
      );
      const newWallet: ProjectWalletData = {
        transactions,
        requests: updatedRequests,
      };
      const newData: ProjectDataPayload = {
        ...currentData,
        projectWallet: newWallet,
      };
      projectWalletMutation.mutate(newData);
      toast({
        title: "Solicitud rechazada",
        description: "Se marcó la solicitud como rechazada",
      });
    };

    const handleDepartmentExpense = () => {
      if (!projectDetails || !projectDetails.data) return;
      if (!currentProjectMember?.departament) return;
      const amount = Number(deptExpenseAmount || "0");
      if (!amount || amount <= 0) {
        toast({
          title: "Monto inválido",
          description: "Ingresa un monto mayor que 0",
          variant: "destructive",
        });
        return;
      }
      const dept = currentProjectMember.departament;
      const available = calculateDepartmentBudget(dept);
      if (amount > available) {
        toast({
          title: "Saldo insuficiente",
          description:
            "El monto supera el presupuesto disponible del departamento",
          variant: "destructive",
        });
        return;
      }

      const currentData = projectDetails.data as ProjectDataPayload;
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];

      const descriptionText =
        deptExpenseDescription ||
        "Gasto registrado desde wallet de departamento";
      const categoryText = deptExpenseCategory || "Gasto de departamento";

      const expense: Expense = {
        id: generateId(),
        date: dateStr,
        amount,
        category: categoryText,
        description: `${getDepartamentLabel(dept)}: ${descriptionText}`,
      };

      const raw = currentData.projectWallet || {};
      const transactions: ProjectWalletTransaction[] = raw.transactions || [];
      const requests: ProjectWalletRequest[] = raw.requests || [];

      const tx: ProjectWalletTransaction = {
        id: generateId(),
        date: today.toISOString(),
        type: "expense",
        fromDepartament: dept,
        toDepartament: "externo",
        amount,
        description: descriptionText,
        createdBy: supabaseAuth.user?.email || "",
      };

      const newWallet: ProjectWalletData = {
        transactions: [tx, ...transactions],
        requests,
      };

      const newData: ProjectDataPayload = {
        ...currentData,
        expenses: [expense, ...(currentData.expenses || [])],
        projectWallet: newWallet,
      };

      projectWalletMutation.mutate(newData);
      setDeptExpenseAmount("");
      setDeptExpenseDescription("");
      toast({
        title: "Gasto registrado",
        description:
          "El gasto se registró y se descontó del presupuesto del departamento",
      });
    };

    return (
      <div className="space-y-6 pb-28">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-xl">
              <WalletIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Wallet del proyecto</h2>
              <p className="text-sm text-muted-foreground">
                Presupuestos por departamento en USD
              </p>
            </div>

            {currentProject &&
              currentProjectMember?.departament === "direccion" &&
              currentProjectMember?.role
                ?.toLowerCase()
                ?.includes("direccion") && (
                <div className="ml-auto">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Configuración"
                      >
                        <Settings className="w-5 h-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Configuración de wallet</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 mt-2">
                        <div>
                          <div className="text-sm text-muted-foreground mb-3">
                            Acciones sobre periodos y certificaciones.
                          </div>
                          <Button
                            onClick={async () => {
                              if (!currentProject?.id) return;
                              try {
                                setClosingPeriod(true);
                                const res = await mintNftForCollection(
                                  currentProject.id,
                                );
                                toast({
                                  title: "Periodo cerrado",
                                  description: `NFT minteado: ${res.tokenId} #${res.serialNumber}`,
                                });
                                queryClient.invalidateQueries({
                                  queryKey: [
                                    "project-wallet",
                                    currentProject.id,
                                  ],
                                });
                                queryClient.invalidateQueries({
                                  queryKey: ["projects", currentProject.id],
                                });
                              } catch (err: any) {
                                console.log(err);
                                toast({
                                  title: "Error",
                                  description: err?.message || String(err),
                                  variant: "destructive",
                                });
                              } finally {
                                setClosingPeriod(false);
                              }
                            }}
                            disabled={closingPeriod}
                            className="w-full"
                          >
                            {closingPeriod ? "Cerrando..." : "Cerrar periodo"}
                          </Button>
                        </div>

                        {projectDetails?.history &&
                          projectDetails.history.length > 0 && (
                            <div className="border-t border-border pt-4">
                              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                Períodos cerrados
                              </h3>
                              <div className="space-y-3">
                                {projectDetails.history
                                  .filter((h: any) => h.type === "period")
                                  .reverse()
                                  .map((period: PeriodHistory) => (
                                    <div
                                      key={period.id}
                                      className="border border-border rounded-lg p-3 space-y-2"
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                          <Calendar className="w-4 h-4 text-primary" />
                                          <div>
                                            <div className="text-sm font-medium">
                                              {new Date(
                                                period.startDate,
                                              ).toLocaleDateString()}{" "}
                                              -{" "}
                                              {new Date(
                                                period.endDate,
                                              ).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              NFT #{period.serialNumber}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                          <span className="text-muted-foreground">
                                            Ingresos:
                                          </span>
                                          <div className="font-medium">
                                            ${period.totals.ingresos.toFixed(2)}
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">
                                            Gastos:
                                          </span>
                                          <div className="font-medium">
                                            ${period.totals.gastos.toFixed(2)}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <a
                                          href={`https://hashscan.io/testnet/token/${period.tokenId}?serial=${period.serialNumber}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                        >
                                          HashScan{" "}
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                        <a
                                          href={period.ipfsGatewayUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                        >
                                          IPFS{" "}
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
          </div>

          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="text-4xl sm:text-5xl font-bold tracking-tight">
                {loadingProjectWallet ? "..." : formatUsd(mainBalance)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {isDireccionDept
                  ? "Saldo total gestionado por dirección"
                  : isEconomiaDept
                    ? "Saldo del proyecto gestionado por dirección"
                    : "Presupuesto disponible de tu departamento"}
              </div>
            </div>

            {(isDireccionDept || isEconomiaDept) && (
              <div className="space-y-4">
                <div className="text-sm font-medium">
                  Saldos por departamento
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                  {allWallets.map((w) => {
                    const deptBalance = calculateDepartmentBudget(w.name);
                    return (
                      <div
                        key={w.name}
                        className="border border-border rounded-xl p-2 sm:p-3"
                      >
                        <div className="text-xs text-muted-foreground mb-1 text-xxs sm:text-xs">
                          {getDepartamentLabel(w.name)}
                        </div>
                        <div className="text-base sm:text-lg font-semibold">
                          {formatUsd(deptBalance)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isDireccionDept && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-sm">
                    Asignar presupuesto a departamento
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <Label>Departamento</Label>
                      <select
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        value={assignmentDept}
                        onChange={(e) => setAssignmentDept(e.target.value)}
                      >
                        <option value="">Selecciona</option>
                        {allWallets
                          .filter((w) => w.name !== "direccion")
                          .map((w) => (
                            <option key={w.name} value={w.name}>
                              {getDepartamentLabel(w.name)}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <Label>Monto</Label>
                      <Input
                        type="number"
                        value={assignmentAmount}
                        onChange={(e) => setAssignmentAmount(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>Descripción</Label>
                      <Input
                        value={assignmentDescription}
                        onChange={(e) =>
                          setAssignmentDescription(e.target.value)
                        }
                        placeholder="Opcional"
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleDirectAssignment}
                      disabled={projectWalletMutation.isPending}
                    >
                      Asignar presupuesto
                    </Button>
                  </div>
                </div>
                <div className="border border-border rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-sm">
                    Extracción de emergencia
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <Label>Departamento origen</Label>
                      <select
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        value={emergencyDept}
                        onChange={(e) => setEmergencyDept(e.target.value)}
                      >
                        <option value="">Selecciona</option>
                        {allWallets
                          .filter((w) => w.name !== "direccion")
                          .map((w) => (
                            <option key={w.name} value={w.name}>
                              {getDepartamentLabel(w.name)}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <Label>Monto</Label>
                      <Input
                        type="number"
                        value={emergencyAmount}
                        onChange={(e) => setEmergencyAmount(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>Descripción</Label>
                      <Input
                        value={emergencyDescription}
                        onChange={(e) =>
                          setEmergencyDescription(e.target.value)
                        }
                        placeholder="Opcional"
                      />
                    </div>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handleDirectEmergencyWithdrawal}
                      disabled={projectWalletMutation.isPending}
                    >
                      Registrar extracción
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {isEconomiaDept && (
              <div className="border border-border rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-sm">
                  Solicitar extracción de emergencia a dirección
                </h3>
                <div className="space-y-2">
                  <div>
                    <Label>Departamento origen</Label>
                    <select
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                      value={emergencyRequestDept}
                      onChange={(e) => setEmergencyRequestDept(e.target.value)}
                    >
                      <option value="">Selecciona</option>
                      {allWallets
                        .filter((w) => w.name !== "direccion")
                        .map((w) => (
                          <option key={w.name} value={w.name}>
                            {getDepartamentLabel(w.name)}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <Label>Monto</Label>
                    <Input
                      type="number"
                      value={emergencyRequestAmount}
                      onChange={(e) =>
                        setEmergencyRequestAmount(e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Input
                      value={emergencyRequestDescription}
                      onChange={(e) =>
                        setEmergencyRequestDescription(e.target.value)
                      }
                      placeholder="Opcional"
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleEconomyEmergencyRequest}
                    disabled={projectWalletMutation.isPending}
                  >
                    Enviar solicitud
                  </Button>
                </div>
              </div>
            )}

            {!isDireccionDept && !isEconomiaDept && isProjectDirector && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-sm">
                    Solicitar asignación de presupuesto
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <Label>Monto</Label>
                      <Input
                        type="number"
                        value={deptRequestAmount}
                        onChange={(e) => setDeptRequestAmount(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>Descripción</Label>
                      <Input
                        value={deptRequestDescription}
                        onChange={(e) =>
                          setDeptRequestDescription(e.target.value)
                        }
                        placeholder="Opcional"
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleDepartmentBudgetRequest}
                      disabled={projectWalletMutation.isPending}
                    >
                      Enviar solicitud a dirección
                    </Button>
                  </div>
                </div>
                <div className="border border-border rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-sm">
                    Registrar gasto del departamento
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <Label>Monto</Label>
                      <Input
                        type="number"
                        value={deptExpenseAmount}
                        onChange={(e) => setDeptExpenseAmount(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>Categoría</Label>
                      <Input
                        value={deptExpenseCategory}
                        onChange={(e) => setDeptExpenseCategory(e.target.value)}
                        placeholder="Gasto de departamento"
                      />
                    </div>
                    <div>
                      <Label>Explicación del gasto</Label>
                      <Input
                        value={deptExpenseDescription}
                        onChange={(e) =>
                          setDeptExpenseDescription(e.target.value)
                        }
                        placeholder="¿En qué se usó el presupuesto?"
                      />
                    </div>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handleDepartmentExpense}
                      disabled={projectWalletMutation.isPending}
                    >
                      Registrar gasto
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {pendingRequests.length > 0 &&
              (isDireccionDept || isEconomiaDept) && (
                <div className="border border-border rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-sm">
                    Solicitudes pendientes
                  </h3>
                  <div className="space-y-2">
                    {pendingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                      >
                        <div>
                          <div className="font-medium">
                            {req.requestType === "assignment"
                              ? `Asignación para ${getDepartamentLabel(
                                  req.fromDepartament,
                                )}`
                              : `Extracción de ${
                                  req.targetDepartament
                                    ? getDepartamentLabel(req.targetDepartament)
                                    : "departamento"
                                }`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(req.date).toLocaleString()} ·{" "}
                            {formatUsd(req.amount)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleApproveRequest(
                                isDireccionDept ? "direccion" : "economia",
                                req.id,
                              )
                            }
                            disabled={projectWalletMutation.isPending}
                          >
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRejectRequest(req.id)}
                            disabled={projectWalletMutation.isPending}
                          >
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="border border-border rounded-xl p-4">
              <h3 className="font-semibold mb-3 text-sm">
                Movimientos de presupuesto
              </h3>
              {loadingProjectWallet ? (
                <p className="text-sm text-muted-foreground">Cargando...</p>
              ) : visibleTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay movimientos registrados
                </p>
              ) : (
                <div className="space-y-2">
                  {visibleTransactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                    >
                      <div>
                        <div className="font-medium">
                          {t.type === "assignment" &&
                            "Asignación de presupuesto"}
                          {t.type === "emergency_withdrawal" &&
                            "Extracción de emergencia"}
                          {t.type === "expense" && "Gasto de departamento"}
                          {" · "}
                          {t.type === "expense" ? (
                            getDepartamentLabel(t.fromDepartament)
                          ) : (
                            <>
                              {getDepartamentLabel(t.fromDepartament)} →{" "}
                              {getDepartamentLabel(t.toDepartament)}
                            </>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(t.date).toLocaleString()}
                        </div>
                      </div>
                      <div className="font-semibold">{formatUsd(t.amount)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6 pb-28">
      <div className="bg-card border border-border rounded-2xl p-3 sm:p-6 shadow-soft">
        <div className="space-y-3 sm:space-y-6">
          {!isPersonalMode && (
            <div className="text-center py-3 sm:py-6">
              <div className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                {loading
                  ? "..."
                  : formatUsd(
                      isPersonalMode ? totalBalance : projectTotalBalance,
                    )}
              </div>

              <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                Saldo total del proyecto
              </div>
            </div>
          )}

          {!isPersonalMode ? (
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-xs sm:text-sm"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Recibir
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Recibir saldo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    {isPersonalMode ? (
                      wallet ? (
                        <>
                          <Label>Tu dirección</Label>
                          <div className="flex items-center gap-2">
                            <Input readOnly value={wallet.address} />
                            <Button variant="secondary" onClick={copyAddress}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No se encontró tu wallet
                        </p>
                      )
                    ) : hederaAccountId ? (
                      <>
                        <Label>Dirección del proyecto (Hedera)</Label>
                        <div className="flex items-center gap-2">
                          <Input readOnly value={hederaAccountId} />
                          <Button variant="secondary" onClick={copyAddress}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No se encontró la wallet del proyecto
                      </p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="text-xs sm:text-sm">
                    <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Enviar saldo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Enviar saldo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label>
                        Dirección destino{" "}
                        {isPersonalMode ? "(Ethereum/Plume)" : "(Hedera)"}
                      </Label>
                      <Input
                        placeholder={isPersonalMode ? "0x..." : "0.0.xxxxx"}
                        value={toAddress}
                        onChange={(e) => setToAddress(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>
                        Monto {isPersonalMode ? "(PUSD)" : "(HBAR)"}
                      </Label>
                      <Input
                        placeholder="10"
                        value={amountUsd}
                        onChange={(e) => setAmountUsd(e.target.value)}
                      />
                    </div>
                    <Button
                      disabled={loading}
                      onClick={handleSend}
                      className="w-full"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-4">
              <div className="py-2">
                {loading && (
                  <div className="flex items-center justify-center py-4 sm:py-8 px-2">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin">
                        <WalletIcon className="w-8 h-8 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Cargando wallets...
                      </span>
                    </div>
                  </div>
                )}
                {!loading && (
                  <div className="flex gap-2 sm:gap-4 px-2 overflow-x-auto snap-x snap-mandatory touch-pan-x">
                    {personalWallets.map((p) => {
                      const created = p.createdAt
                        ? new Date(p.createdAt)
                        : new Date();
                      const exp = new Date(created);
                      exp.setFullYear(exp.getFullYear() + 3);
                      const expStr = `${String(exp.getMonth() + 1).padStart(2, "0")}/${String(
                        exp.getFullYear(),
                      ).slice(-2)}`;
                      const cardNumber =
                        (p.id || "")
                          .replace(/-/g, "")
                          .slice(0, 16)
                          .match(/.{1,4}/g)
                          ?.join(" ") || p.id.slice(0, 16);

                      return (
                        <div
                          key={p.id}
                          className="min-w-[280px] sm:min-w-[350px] snap-start"
                        >
                          <div
                            className={`relative rounded-2xl p-3 sm:p-4 h-40 sm:h-56 shadow-lg overflow-hidden flex flex-col justify-between ${
                              p.name === "Principal"
                                ? "bg-gradient-to-r from-primary to-primary/80 text-white"
                                : "bg-gradient-to-r from-primary  text-foreground border border-border"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <img
                                src={"/public/SVG/P001.svg"}
                                className="h-4 sm:h-6"
                              />
                              <div className="text-xxs sm:text-xs opacity-80">
                                {p.name}
                              </div>
                            </div>

                            <div className="mt-1">
                              <div className="text-xs sm:text-sm opacity-80">
                                Balance
                              </div>
                              <div className="text-lg sm:text-2xl font-semibold">
                                {formatUsd(p.balance)}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs opacity-80 text-xxs sm:text-xs">
                              <div>
                                <div className="font-mono tracking-widest text-xs sm:text-sm">
                                  {cardNumber}
                                </div>
                                <div className="flex gap-2 sm:gap-4 mt-1">
                                  <div className="text-xs">EXP {expStr}</div>
                                  <div className="text-xs">
                                    ID {p.id.slice(0, 8)}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <div className="flex gap-1">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setEditingWalletId(p.id);
                                          setEditingWalletName(p.name);
                                        }}
                                        disabled={p.name === "Principal"}
                                        title={
                                          p.name === "Principal"
                                            ? "No se puede editar"
                                            : "Editar"
                                        }
                                      >
                                        <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          Editar nombre de wallet
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-3">
                                        <Label>Nuevo nombre</Label>
                                        <Input
                                          value={editingWalletName}
                                          onChange={(e) =>
                                            setEditingWalletName(e.target.value)
                                          }
                                          placeholder="Nombre de la wallet"
                                        />
                                        <Button
                                          className="w-full"
                                          onClick={handleEditWalletName}
                                          disabled={loading}
                                        >
                                          Guardar
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteWallet(p.id)}
                                    disabled={p.name === "Principal" || loading}
                                    title={
                                      p.name === "Principal"
                                        ? "No se puede eliminar"
                                        : "Eliminar"
                                    }
                                  >
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="border border-border rounded-xl p-3 sm:p-4">
                  <h4 className="font-semibold text-xs sm:text-sm mb-2">
                    Crear nueva wallet
                  </h4>
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      value={newWalletName}
                      onChange={(e) => setNewWalletName(e.target.value)}
                      placeholder="Reinversion"
                    />
                    <Button
                      className="w-full"
                      onClick={handleCreatePersonalWallet}
                    >
                      Crear wallet
                    </Button>
                  </div>
                </div>

                <div className="border border-border rounded-xl p-3 sm:p-4">
                  <h4 className="font-semibold text-xs sm:text-sm mb-2">
                    Transferir entre wallets
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <Label>Desde</Label>
                      <select
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        value={transferFrom}
                        onChange={(e) => setTransferFrom(e.target.value)}
                      >
                        <option value="">Selecciona</option>
                        {personalWallets.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} · {formatUsd(p.balance)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Hacia</Label>
                      <select
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        value={transferTo}
                        onChange={(e) => setTransferTo(e.target.value)}
                      >
                        <option value="">Selecciona</option>
                        {personalWallets.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} · {formatUsd(p.balance)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Monto (USD)</Label>
                      <Input
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="10"
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleTransferBetweenPersonal}
                    >
                      Transferir
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border border-border rounded-xl p-3 sm:p-4">
            <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
              Historial
            </h3>
            {loading ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : transfers.length === 0 && transferHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay transacciones
              </p>
            ) : (
              <div className="space-y-1 sm:space-y-2">
                {/* Mostrar transferencias internas primero (más recientes) */}
                {isPersonalMode && transferHistory.length > 0 && (
                  <>
                    {transferHistory.slice(0, 10).map((t) => (
                      <div
                        key={`internal-${t.id}`}
                        className="flex items-start justify-between rounded-lg border border-primary/20 bg-primary/5 p-2 sm:p-3 gap-2"
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <Repeat2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-medium truncate">
                              Transferencia: {t.fromWalletName} →{" "}
                              {t.toWalletName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatUsd(t.amount)}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {/* Mostrar transacciones on-chain */}
                {transfers.map((t) => (
                  <div
                    key={t.hash}
                    className="flex items-start justify-between rounded-lg border border-border p-2 sm:p-3 gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-medium">
                        {t.direction === "sent" ? "Enviado" : "Recibido"}{" "}
                        {Number(t.amount).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {t.direction === "sent" ? `a ${t.to}` : `de ${t.from}`}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(t.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isPersonalMode && (
            <div className="border border-border rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-sm sm:text-base">
                Objetivos de reinversión mensual
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <Label>Nombre del objetivo</Label>
                  <Input
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="Reinvertir en inventario"
                  />
                </div>
                <div>
                  <Label>Wallet destino para reinvertir</Label>
                  <select
                    value={goalWallet}
                    onChange={(e) => setGoalWallet(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    aria-label="Seleccionar wallet destino para reinversión"
                  >
                    <option value="">Selecciona una wallet</option>
                    {personalWallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label>Porcentaje de ganancias</Label>
                    <Input
                      type="number"
                      value={goalPercentage}
                      onChange={(e) => setGoalPercentage(e.target.value)}
                      min={1}
                      max={100}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Día del mes</Label>
                    <Input
                      type="number"
                      value={goalDay}
                      onChange={(e) => setGoalDay(e.target.value)}
                      min={1}
                      max={31}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateGoal}>Crear objetivo</Button>
              </div>

              {reinvestmentGoals.length > 0 && (
                <div className="space-y-2">
                  {reinvestmentGoals.map((goal) => {
                    const suggestedAmount =
                      (remainingNonTransferable * goal.percentage) / 100;
                    const targetWallet = personalWallets.find(
                      (w) => w.id === goal.walletId,
                    );
                    const walletLabel = targetWallet?.name || "Principal";
                    return (
                      <div
                        key={goal.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div>
                          <div className="text-sm font-medium">{goal.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Cada mes, el día {goal.dayOfMonth} se enviara{" "}
                            {goal.percentage}% de tus ganancias para →{" "}
                            {walletLabel} · Aproximado:{" "}
                            {formatUsd(suggestedAmount)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExecuteReinvestment(goal)}
                        >
                          Realizar reinversión
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {data.reinvestmentExecutions &&
                data.reinvestmentExecutions.length > 0 && (
                  <div className="pt-2 border-t border-border mt-2">
                    <h4 className="text-sm font-semibold mb-2">
                      Historial de reinversiones
                    </h4>
                    <div className="space-y-2">
                      {data.reinvestmentExecutions.map((item) => {
                        const goal = reinvestmentGoals.find(
                          (g) => g.id === item.goalId,
                        );
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div>
                              <div className="font-medium">
                                {goal?.name || "Reinversión"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(item.date).toLocaleDateString()} ·{" "}
                                {formatUsd(item.amount)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
