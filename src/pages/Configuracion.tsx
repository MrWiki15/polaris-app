import React, { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  DollarSign,
  Globe,
  Download,
  Upload,
  Trash2,
  Sun,
  Moon,
  Check,
  AlertTriangle,
  Cloud,
  LogOut,
  LogIn,
  FlameKindling,
  Presentation,
  CropIcon,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { exportData, importData, resetData, saveData } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Toast } from "@/components/ui/toast";

const currencies = [
  { code: "CUP", symbol: "$", name: "Peso Cubano" },
  { code: "USD", symbol: "$", name: "Dólar Estadounidense" },
  { code: "MLC", symbol: "MLC", name: "Moneda Libremente Convertible" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "MXN", symbol: "$", name: "Peso Mexicano" },
];

import { DataComparisonModal } from "@/components/ui/DataComparisonModal";
import type { AppData } from "@/lib/storage";

export const Configuracion: React.FC = () => {
  const {
    data,
    updateSettings,
    theme,
    toggleTheme,
    refreshData,
    supabaseAuth,
    supabaseSync,
  } = useApp();
  const { settings } = data;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    hasLocalChanges: boolean;
    hasRemoteChanges: boolean;
    localTime: number;
    remoteTime: number;
  } | null>(null);

  const [forceUploadComparison, setForceUploadComparison] = useState<{
    cloudStats: { products: number; sales: number; clients: number };
    localStats: { products: number; sales: number; clients: number };
  } | null>(null);

  const [importComparison, setImportComparison] = useState<{
    cloudData: AppData;
    cloudStats: { products: number; sales: number; clients: number };
    localStats: { products: number; sales: number; clients: number };
  } | null>(null);

  useEffect(() => {
    const check = async () => {
      if (supabaseAuth.isAuthenticated && supabaseSync) {
        const status = await supabaseSync.checkSyncStatus();
        setSyncStatus(status);
      }
    };
    check();
    // Set up an interval to check periodically
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [supabaseAuth.isAuthenticated, supabaseSync]);

  const getStats = (data: AppData) => ({
    products: data.products?.length || 0,
    sales: data.sales?.length || 0,
    clients: data.clients?.length || 0,
  });

  const handleCloudImport = async () => {
    setIsLoading(true);
    try {
      const cloudData = await supabaseSync.restoreFromCloud();
      if (cloudData) {
        const cloudStats = getStats(cloudData);
        const localStats = getStats(data);
        setImportComparison({ cloudData, cloudStats, localStats });
      } else {
        toast({
          title: "Error",
          description: "No se encontraron datos en la nube",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Ocurrió un error al obtener datos de la nube",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmImport = async () => {
    if (!importComparison) return;

    setIsLoading(true);
    try {
      const { cloudData } = importComparison;
      saveData(cloudData);
      localStorage.setItem("negocio360_data_updated", Date.now().toString());
      refreshData();
      toast({
        title: "Datos importados",
        description: "La información se ha descargado de la nube correctamente",
      });

      // Refresh status
      const status = await supabaseSync.checkSyncStatus();
      setSyncStatus(status);
      setImportComparison(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceUpload = async () => {
    setIsLoading(true);
    try {
      const cloudData = await supabaseSync.restoreFromCloud();
      // Even if null (no cloud data), we can proceed, but if null we create 0-stats
      const cloudStats = cloudData
        ? getStats(cloudData)
        : { products: 0, sales: 0, clients: 0 };
      const localStats = getStats(data);

      setForceUploadComparison({ cloudStats, localStats });
    } catch (err) {
      // If error (e.g. network), we still might want to allow force upload but let's show stats as unknown or 0?
      // Better to just show current local stats and 0 for cloud if we can't reach it?
      // Or maybe error out.
      toast({
        title: "Advertencia",
        description:
          "No se pudo verificar el estado actual de la nube. Mostrando comparación estimada.",
        variant: "destructive",
      });
      const localStats = getStats(data);
      setForceUploadComparison({
        cloudStats: { products: 0, sales: 0, clients: 0 },
        localStats,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmForceUpload = async () => {
    setIsLoading(true);
    try {
      await supabaseSync.saveToSupabase(data, true);
      toast({
        title: "Sincronización Forzada Exitosa",
        description: "Tus datos locales han sobrescrito la nube.",
      });
      const status = await supabaseSync.checkSyncStatus();
      setSyncStatus(status);
      setForceUploadComparison(null);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Falló la subida forzada de datos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const dataStr = exportData();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `negocio360_backup_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Respaldo creado",
      description: "El archivo se ha descargado correctamente",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (importData(content)) {
        refreshData();
        toast({
          title: "Datos restaurados",
          description: "La información se ha importado correctamente",
        });
      } else {
        toast({
          title: "Error al importar",
          description: "El archivo no es válido",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleReset = () => {
    resetData();
    refreshData();
    setShowResetConfirm(false);
    toast({
      title: "Datos eliminados",
      description: "Todos los datos han sido borrados",
    });
  };

  const handleAuth = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor completa email y contraseña",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const result =
      authMode === "login"
        ? await supabaseAuth.login(email, password)
        : await supabaseAuth.register(email, password);
    setIsLoading(false);

    if (result.success) {
      if (authMode === "register") {
        toast({
          title: "¡Cuenta creada! ✉️",
          description:
            "Hemos enviado un enlace de verificación a tu email. Por favor verifica tu email para completar el registro.",
        });
      } else {
        toast({
          title: "Éxito",
          description: "Sesión iniciada correctamente",
        });
      }
      setEmail("");
      setPassword("");
    } else {
      toast({
        title: "Error",
        description: result.error || "Algo salió mal",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabaseAuth.logout();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  const handleCurrencyChange = (currency: (typeof currencies)[0]) => {
    updateSettings({
      currency: currency.code,
      currencySymbol: currency.symbol,
    });
    toast({
      title: "Moneda actualizada",
      description: `Ahora usas ${currency.name} (${currency.symbol})`,
    });
  };

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto">
      {/* Supabase Auth - Premium Only */}

      <section className="bg-card rounded-2xl p-5 shadow-soft border border-border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Supabase - Sincronización en la Nube
        </h3>

        {supabaseAuth.isAuthenticated ? (
          <div className="space-y-4">
            <div className="p-4 bg-success/10 rounded-xl border border-success/20">
              <p className="text-sm text-muted-foreground mb-1">
                Sesión iniciada como:
              </p>
              <p className="font-semibold text-success">
                {supabaseAuth.user?.email}
              </p>
            </div>

            {supabaseSync?.syncConflict && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-200 dark:bg-red-950/20 dark:border-red-700 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-100">
                      ⚠️ Conflicto de Sincronización
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                      Hemos detectado diferencias entre tus datos locales y la
                      nube. Por favor utiliza el modal emergente para resolverlo
                      o selecciona una acción abajo.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-red-100 dark:border-red-900/50">
                    <p className="font-semibold mb-2 text-center text-red-700 dark:text-red-300">
                      Local (Actual)
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Productos:</span>
                        <span className="font-mono">
                          {supabaseSync.syncConflict.localStats.products}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ventas:</span>
                        <span className="font-mono">
                          {supabaseSync.syncConflict.localStats.sales}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Clientes:</span>
                        <span className="font-mono">
                          {supabaseSync.syncConflict.localStats.clients}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-green-100 dark:border-green-900/50">
                    <p className="font-semibold mb-2 text-center text-green-700 dark:text-green-300">
                      Nube (Respaldo)
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Productos:</span>
                        <span className="font-mono">
                          {supabaseSync.syncConflict.cloudStats.products}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ventas:</span>
                        <span className="font-mono">
                          {supabaseSync.syncConflict.cloudStats.sales}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Clientes:</span>
                        <span className="font-mono">
                          {supabaseSync.syncConflict.cloudStats.clients}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/20"
                    onClick={async () => {
                      if (
                        confirm(
                          "¿Estás seguro? Esto borrará tus datos locales y descargará la copia de la nube.",
                        )
                      ) {
                        setIsLoading(true);
                        try {
                          const cloudData =
                            await supabaseSync.restoreFromCloud();
                          if (cloudData) {
                            saveData(cloudData);
                            localStorage.setItem(
                              "negocio360_data_updated",
                              Date.now().toString(),
                            );
                            refreshData();
                            supabaseSync.resolveConflict();
                            toast({
                              title: "Restaurado",
                              description: "Datos recuperados de la nube",
                            });
                          }
                        } finally {
                          setIsLoading(false);
                        }
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar de Nube (Recomendado)
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                    onClick={() => {
                      if (
                        confirm(
                          "¿PELIGRO: Estás a punto de borrar los datos de la nube y reemplazarlos con tus datos locales vacíos o incompletos? Esta acción no se puede deshacer.",
                        )
                      ) {
                        supabaseSync.saveToSupabase(data, true);
                        supabaseSync.resolveConflict();
                        toast({
                          title: "Sincronización Forzada",
                          description: "Se ha sobrescrito la nube",
                        });
                      }
                    }}
                  >
                    Sobrescribir Nube (Peligroso)
                  </Button>
                </div>
              </div>
            )}

            {syncStatus?.hasLocalChanges && !supabaseSync?.syncConflict && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 dark:bg-amber-950/20 dark:border-amber-700">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  <div>
                    <p className="font-semibold text-amber-900 dark:text-amber-100">
                      Datos desactualizados en la nube
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Tienes datos guardados en local que no están en la base de
                      datos.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex-1"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
              <Button
                onClick={handleCloudImport}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                <Cloud className="w-4 h-4 mr-2" />
                Importar de Nube
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleForceUpload}
                variant="outline"
                className="w-full text-amber-700 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/20"
                disabled={isLoading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Forzar subida a la Nube
              </Button>
            </div>
          </div>
        ) : supabaseAuth.verificationPending && supabaseAuth.registeredEmail ? (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 dark:bg-amber-950/20 dark:border-amber-700">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-0.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    Verifica tu email
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                    Hemos enviado un enlace de verificación a:
                  </p>
                  <p className="text-sm font-mono text-amber-700 dark:text-amber-300 mb-3">
                    {supabaseAuth.registeredEmail}
                  </p>
                  <ol className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
                    <li>1. Abre tu correo electrónico</li>
                    <li>
                      2. Busca el email de "Supabase" con el asunto de
                      verificación
                    </li>
                    <li>3. Haz clic en el botón "Confirmar tu email"</li>
                    <li>4. Vuelve aquí e inicia sesión con tus credenciales</li>
                  </ol>
                  <Button
                    onClick={() => supabaseAuth.clearVerificationPending()}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Entendido, ya verifiqué
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setAuthMode("login")}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  authMode === "login"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                Iniciar Sesión
              </button>

              <button
                onClick={() => {
                  setAuthMode("register");
                }}
                className={cn(
                  "flex-1 px-3  py-2 rounded-lg text-sm font-medium transition-all",
                  authMode === "register"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                Registrarse
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              onClick={handleAuth}
              className="w-full"
              disabled={isLoading}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isLoading
                ? "Cargando..."
                : authMode === "login"
                  ? "Iniciar Sesión"
                  : "Crear Cuenta"}
            </Button>

            {supabaseAuth.error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
                {supabaseAuth.error}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Theme */}
      <section className="bg-card rounded-2xl p-5 shadow-soft border border-border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          {theme === "light" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
          Apariencia
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => theme === "dark" && toggleTheme()}
            className={cn(
              "flex-1 p-4 rounded-xl border-2 transition-all",
              theme === "light"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground",
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <Sun className="w-5 h-5" />
              <span className="font-medium">Claro</span>
              {theme === "light" && <Check className="w-4 h-4 text-primary" />}
            </div>
          </button>
          <button
            onClick={() => theme === "light" && toggleTheme()}
            className={cn(
              "flex-1 p-4 rounded-xl border-2 transition-all",
              theme === "dark"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground",
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <Moon className="w-5 h-5" />
              <span className="font-medium">Oscuro</span>
              {theme === "dark" && <Check className="w-4 h-4 text-primary" />}
            </div>
          </button>
        </div>
      </section>

      {/* Currency */}
      <section className="bg-card rounded-2xl p-5 shadow-soft border border-border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Moneda
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleCurrencyChange(currency)}
              className={cn(
                "p-3 rounded-xl border-2 transition-all text-left",
                settings.currency === currency.code
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground",
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-lg">{currency.symbol}</span>
                  <span className="text-sm text-muted-foreground ml-1">
                    {currency.code}
                  </span>
                </div>
                {settings.currency === currency.code && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currency.name}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Language */}
      <section className="bg-card rounded-2xl p-5 shadow-soft border border-border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Idioma
        </h3>
        <div className="flex gap-3">
          <button className="flex-1 p-4 rounded-xl border-2 border-primary bg-primary/5">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">🇪🇸</span>
              <span className="font-medium">Español</span>
              <Check className="w-4 h-4 text-primary" />
            </div>
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Más idiomas próximamente
        </p>
      </section>

      {/* Backup & Restore */}
      <section className="bg-card rounded-2xl p-5 shadow-soft border border-border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Respaldo y Restauración
        </h3>
        <div className="space-y-3">
          <Button
            onClick={handleExport}
            variant="outline"
            className="w-full justify-start gap-3"
          >
            <Download className="w-5 h-5" />
            Exportar datos (JSON)
          </Button>

          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <div className="w-full flex items-center gap-3 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer">
              <Upload className="w-5 h-5" />
              <span>Importar datos (JSON)</span>
            </div>
          </label>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          Zona de peligro
        </h3>

        {!showResetConfirm ? (
          <Button
            onClick={() => setShowResetConfirm(true)}
            variant="outline"
            className="w-full justify-start gap-3 border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-5 h-5" />
            Eliminar todos los datos
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-destructive">
              ¿Estás seguro? Esta acción eliminará permanentemente todos tus
              datos.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowResetConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleReset}
                variant="destructive"
                className="flex-1"
              >
                Sí, eliminar todo
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Version */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Polaris v1.0.3</p>
        <p>Todos los datos se guardan localmente en tu dispositivo</p>
      </div>

      {importComparison && (
        <DataComparisonModal
          isOpen={!!importComparison}
          onClose={() => setImportComparison(null)}
          title="Confirmar Importación"
          description="Se descargarán los siguientes datos desde la nube. Reemplazarán a los datos actuales."
          localStats={importComparison.localStats}
          cloudStats={importComparison.cloudStats}
          onConfirm={confirmImport}
          onCancel={() => setImportComparison(null)}
          confirmLabel="Confirmar y Descargar"
          confirmIcon={<Download className="w-4 h-4" />}
          cancelLabel="Cancelar"
          variant="default"
        />
      )}

      {forceUploadComparison && (
        <DataComparisonModal
          isOpen={!!forceUploadComparison}
          onClose={() => setForceUploadComparison(null)}
          title="Confirmar Subida Forzada"
          description="¡ATENCIÓN! Esto sobrescribirá PERMANENTEMENTE los datos de la nube con los datos de este dispositivo."
          localStats={forceUploadComparison.localStats}
          cloudStats={forceUploadComparison.cloudStats}
          onConfirm={confirmForceUpload}
          onCancel={() => setForceUploadComparison(null)}
          confirmLabel="Sí, sobrescribir Nube"
          confirmIcon={<Upload className="w-4 h-4" />}
          cancelLabel="Cancelar"
          variant="destructive"
        />
      )}
    </div>
  );
};

export default Configuracion;
