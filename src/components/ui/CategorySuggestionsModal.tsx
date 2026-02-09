import React, { useState } from "react";
import { suggestCategories } from "@/lib/ai/categorySuggester";
import type { AppData } from "@/lib/storage";
import { Sparkles, X, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CategorySuggestionsModalProps {
  isOpen: boolean;
  appData: AppData;
  onClose: () => void;
  onAddTag: (tag: string) => void;
}

export const CategorySuggestionsModal: React.FC<
  CategorySuggestionsModalProps
> = ({ isOpen, appData, onClose, onAddTag }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleLoadSuggestions = async () => {
    setLoading(true);
    setError(null);
    setSuggestions([]);
    setSelectedTags(new Set());

    try {
      const categories = await suggestCategories(appData);
      setSuggestions(categories);
    } catch (err: any) {
      console.log(err);
      setError(err.message || "Error al obtener sugerencias");
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    const newSet = new Set(selectedTags);
    if (newSet.has(tag)) {
      newSet.delete(tag);
    } else {
      newSet.add(tag);
    }
    setSelectedTags(newSet);
  };

  const handleAddSelected = () => {
    const tags = Array.from(selectedTags);
    tags.forEach((tag) => onAddTag(tag));

    toast({
      title: "Etiquetas agregadas",
      description: `Se añadieron ${tags.length} nuevas etiqueta${tags.length > 1 ? "s" : ""}.`,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto border border-border">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Sugerencias de Polo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {suggestions.length === 0 && !loading && !error && (
            <div className="text-center text-muted-foreground">
              <p className="mb-4">
                Polo analizará tus gastos, ingresos e inventario para sugerirte
                etiquetas personalizadas.
              </p>
              <button
                onClick={handleLoadSuggestions}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Obtener sugerencias
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin mb-3">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Polo está analizando tus datos...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
              Error: {error}
            </div>
          )}

          {suggestions.length > 0 && !loading && (
            <>
              <p className="text-sm text-muted-foreground">
                Polo sugiere estas nuevas etiquetas basada en tu actividad:
              </p>
              <div className="space-y-2">
                {suggestions.map((tag) => (
                  <label
                    key={tag}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.has(tag)}
                      onChange={() => toggleTag(tag)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="flex-1 text-sm">{tag}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleAddSelected}
                disabled={selectedTags.size === 0}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar{" "}
                {selectedTags.size > 0
                  ? `${selectedTags.size} etiqueta${selectedTags.size > 1 ? "s" : ""}`
                  : "seleccionadas"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
