import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  Palette,
  Download,
  Upload,
  Trash2,
  Sun,
  Moon,
  Tag,
  Edit2,
  X,
  Check,
  AlertCircle,
  DollarSign,
  CropIcon,
  AlertTriangle,
  LogOut,
  Cloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exportData, importData, resetData } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useSupabaseSync } from "@/hooks/use-supabase-sync";

const currencies = [
  { code: "CUP", symbol: "$", name: "Peso Cubano" },
  { code: "USD", symbol: "$", name: "Dólar Estadounidense" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "MXN", symbol: "$", name: "Peso Mexicano" },
];

export const Configuracion: React.FC = () => {
  const {
    data,
    updateSettings,
    addCustomTag,
    updateCustomTag,
    deleteCustomTag,
    addCustomCategory,
    updateCustomCategory,
    deleteCustomCategory,
    theme,
    toggleTheme,
    refreshData,
  } = useApp();

  const supabaseAuth = useSupabaseAuth();
  const isPremium = data.settings.isPremium || true;
  const supabaseSync = useSupabaseSync(supabaseAuth.user?.id, isPremium);

  const { settings } = data;

  // Estados para edición
  const [newTag, setNewTag] = useState("");
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editedTagValue, setEditedTagValue] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedCategoryValue, setEditedCategoryValue] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handles para tags
  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) {
      toast({ title: "Campo requerido", variant: "destructive" });
      return;
    }
    if (data.customTags.includes(trimmedTag)) {
      toast({
        title: "Esta etiqueta ya existe",
        variant: "destructive",
      });
      return;
    }
    addCustomTag(trimmedTag);
    setNewTag("");
    toast({ title: "Etiqueta agregada" });
  };

  const handleUpdateTag = (oldTag: string) => {
    const trimmedTag = editedTagValue.trim();
    if (!trimmedTag) {
      toast({ title: "Campo requerido", variant: "destructive" });
      return;
    }
    if (trimmedTag !== oldTag && data.customTags.includes(trimmedTag)) {
      toast({
        title: "Esta etiqueta ya existe",
        variant: "destructive",
      });
      return;
    }
    if (trimmedTag !== oldTag) {
      updateCustomTag(oldTag, trimmedTag);
      toast({ title: "Etiqueta actualizada" });
    }
    setEditingTag(null);
    setEditedTagValue("");
  };

  const handleDeleteTag = (tag: string) => {
    deleteCustomTag(tag);
    toast({ title: "Etiqueta eliminada" });
  };

  // Handles para categorías
  const handleAddCategory = () => {
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory) {
      toast({ title: "Campo requerido", variant: "destructive" });
      return;
    }
    if (data.customCategories.includes(trimmedCategory)) {
      toast({
        title: "Esta categoría ya existe",
        variant: "destructive",
      });
      return;
    }
    addCustomCategory(trimmedCategory);
    setNewCategory("");
    toast({ title: "Categoría agregada" });
  };

  const handleUpdateCategory = (oldCategory: string) => {
    const trimmedCategory = editedCategoryValue.trim();
    if (!trimmedCategory) {
      toast({ title: "Campo requerido", variant: "destructive" });
      return;
    }
    if (
      trimmedCategory !== oldCategory &&
      data.customCategories.includes(trimmedCategory)
    ) {
      toast({
        title: "Esta categoría ya existe",
        variant: "destructive",
      });
      return;
    }
    if (trimmedCategory !== oldCategory) {
      updateCustomCategory(oldCategory, trimmedCategory);
      toast({ title: "Categoría actualizada" });
    }
    setEditingCategory(null);
    setEditedCategoryValue("");
  };

  const handleDeleteCategory = (category: string) => {
    deleteCustomCategory(category);
    toast({ title: "Categoría eliminada" });
  };

  const handleCurrencyChange = (currency: {
    code: string;
    symbol: string;
    name: string;
  }) => {
    updateSettings({ currency: currency.code });
    toast({ title: `Moneda cambiada a ${currency.name}` });
  };

  const handleLogout = () => {
    supabaseAuth.logout();
    toast({ title: "Sesión cerrada" });
  };

  const handleForceUpload = async () => {
    if (
      !confirm(
        "¿Estás seguro? Esto sobrescribirá los datos en la nube con tus datos locales.",
      )
    ) {
      return;
    }
    setIsLoading(true);
    try {
      await supabaseSync.saveToSupabase(data, true);
      toast({ title: "Datos subidos a la nube correctamente" });
    } catch (error) {
      toast({
        title: "Error al subir datos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Respaldo y restauración
  const handleExport = () => {
    const dataStr = exportData();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `respaldo_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Respaldo descargado" });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (importData(content)) {
        refreshData();
        toast({ title: "Datos restaurados correctamente" });
      } else {
        toast({
          title: "El archivo no es válido",
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
      title: "Todos tus datos han sido eliminados",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Usuario & Sesión */}
      {supabaseAuth.isAuthenticated && (
        <section className="bg-card rounded-2xl p-5 shadow-soft border border-border">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Sesión
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Conectado como:
              </p>
              <p className="font-semibold text-primary">
                {supabaseAuth.user?.email}
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
            <Button
              onClick={handleForceUpload}
              disabled={isLoading}
              variant="outline"
              className="w-full justify-start gap-2 text-amber-700 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/20"
            >
              <Upload className="w-4 h-4" />
              {isLoading ? "Subiendo..." : "Forzar Subida a Nube"}
            </Button>
          </div>
        </section>
      )}

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

      {/* Theme */}
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

      {/* Tags */}
      <section className="bg-card rounded-2xl p-5 shadow-soft border border-border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Etiquetas Personalizadas
        </h3>

        {/* Add New Tag Form */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Nueva etiqueta..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button
            onClick={handleAddTag}
            variant="default"
            size="sm"
            className="whitespace-nowrap"
          >
            Crear
          </Button>
        </div>

        {/* Tags List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {data.customTags.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay etiquetas personalizadas aún
            </p>
          ) : (
            data.customTags.map((tag) => (
              <div
                key={tag}
                className="flex items-center justify-between bg-background rounded-lg p-3 border border-border hover:border-primary/40 transition-colors"
              >
                {editingTag === tag ? (
                  // Edit Mode
                  <div className="flex flex-1 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Editar etiqueta..."
                      value={editedTagValue}
                      onChange={(e) => setEditedTagValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleUpdateTag(tag);
                        if (e.key === "Escape") setEditingTag(null);
                      }}
                      autoFocus
                      className="flex-1 px-2 py-1 rounded border border-primary/50 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      onClick={() => handleUpdateTag(tag)}
                      className="flex items-center justify-center w-8 h-8 rounded hover:bg-primary/10 text-primary transition-colors"
                      title="Guardar"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingTag(null)}
                      className="flex items-center justify-center w-8 h-8 rounded hover:bg-destructive/10 text-destructive transition-colors"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {tag}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTag(tag);
                          setEditedTagValue(tag);
                        }}
                        className="flex items-center justify-center w-8 h-8 rounded hover:bg-primary/10 text-primary transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTag(tag)}
                        className="flex items-center justify-center w-8 h-8 rounded hover:bg-destructive/10 text-destructive transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-card rounded-2xl p-5 shadow-soft border border-border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <CropIcon className="w-5 h-5" />
          Categorías Personalizadas
        </h3>

        {/* Add New Category Form */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Nueva categoría..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button
            onClick={handleAddCategory}
            variant="default"
            size="sm"
            className="whitespace-nowrap"
          >
            Crear
          </Button>
        </div>

        {/* Categories List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {data.customCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay categorías personalizadas aún
            </p>
          ) : (
            data.customCategories.map((category) => (
              <div
                key={category}
                className="flex items-center justify-between bg-background rounded-lg p-3 border border-border hover:border-primary/40 transition-colors"
              >
                {editingCategory === category ? (
                  // Edit Mode
                  <div className="flex flex-1 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Editar categoría..."
                      value={editedCategoryValue}
                      onChange={(e) => setEditedCategoryValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleUpdateCategory(category);
                        if (e.key === "Escape") setEditingCategory(null);
                      }}
                      autoFocus
                      className="flex-1 px-2 py-1 rounded border border-primary/50 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      onClick={() => handleUpdateCategory(category)}
                      className="flex items-center justify-center w-8 h-8 rounded hover:bg-primary/10 text-primary transition-colors"
                      title="Guardar"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="flex items-center justify-center w-8 h-8 rounded hover:bg-destructive/10 text-destructive transition-colors"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {category}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setEditedCategoryValue(category);
                        }}
                        className="flex items-center justify-center w-8 h-8 rounded hover:bg-primary/10 text-primary transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="flex items-center justify-center w-8 h-8 rounded hover:bg-destructive/10 text-destructive transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
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
        <p>Polaris v1.0.4</p>
        <p>Todos los datos se guardan localmente en tu dispositivo</p>
      </div>
    </div>
  );
};

export default Configuracion;
