import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface SaleFormProps {
  onClose: () => void;
  editingSale?: {
    id: string;
    date: string;
    amount: number;
    category: string;
    description?: string;
  };
}

const categories = ['Alimentos', 'Bebidas', 'Higiene', 'Limpieza', 'Electrónica', 'Ropa', 'Otros'];

export const SaleForm: React.FC<SaleFormProps> = ({ onClose, editingSale }) => {
  const { addSale, updateSale } = useApp();
  const [formData, setFormData] = useState({
    date: editingSale?.date || new Date().toISOString().split('T')[0],
    amount: editingSale?.amount?.toString() || '',
    category: editingSale?.category || categories[0],
    description: editingSale?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const saleData = {
      date: formData.date,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description || undefined,
    };

    if (editingSale) {
      updateSale(editingSale.id, saleData);
    } else {
      addSale(saleData);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn(
        'relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl shadow-material-xl',
        'animate-slide-in-up sm:animate-scale-in',
        'max-h-[90vh] overflow-auto'
      )}>
        {/* Handle bar for mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-muted" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {editingSale ? 'Editar Venta' : 'Nueva Venta'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
              className="text-lg font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    formData.category === cat
                      ? 'bg-primary text-primary-foreground shadow-material'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              placeholder="Añadir nota..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-primary hover:opacity-90"
              disabled={!formData.amount}
            >
              {editingSale ? 'Guardar' : 'Registrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
