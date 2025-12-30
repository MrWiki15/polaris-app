import React, { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportData, importData, resetData } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const currencies = [
  { code: "CUP", symbol: "$", name: "Peso Cubano" },
  { code: "USD", symbol: "$", name: "Dólar Estadounidense" },
  { code: "MLC", symbol: "MLC", name: "Moneda Libremente Convertible" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "MXN", symbol: "$", name: "Peso Mexicano" },
];

export const Configuracion: React.FC = () => {
  const { data, updateSettings, theme, toggleTheme, refreshData } = useApp();
  const { settings } = data;
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
                : "border-border hover:border-muted-foreground"
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
                : "border-border hover:border-muted-foreground"
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
                  : "border-border hover:border-muted-foreground"
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
        <p>UP v0.0.3</p>
        <p>Todos los datos se guardan localmente en tu dispositivo</p>
      </div>
    </div>
  );
};

export default Configuracion;
