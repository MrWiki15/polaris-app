import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { 
  CreditCard, 
  Plus,
  Edit2,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Check,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Debt, formatCurrency } from '@/lib/storage';
import { cn } from '@/lib/utils';

export const Deudas: React.FC = () => {
  const { data, addDebt, updateDebt, deleteDebt } = useApp();
  const { debts, settings } = data;

  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [filter, setFilter] = useState<'all' | 'me_deben' | 'debo' | 'paid'>('all');
  const [formData, setFormData] = useState({
    personName: '',
    amount: '',
    type: 'me_deben' as Debt['type'],
    description: '',
    dueDate: '',
  });

  const filteredDebts = useMemo(() => {
    if (filter === 'paid') return debts.filter(d => d.paid);
    if (filter === 'all') return debts.filter(d => !d.paid);
    return debts.filter(d => d.type === filter && !d.paid);
  }, [debts, filter]);

  const summary = useMemo(() => {
    const active = debts.filter(d => !d.paid);
    const meOwed = active.filter(d => d.type === 'me_deben').reduce((sum, d) => sum + d.amount, 0);
    const iOwe = active.filter(d => d.type === 'debo').reduce((sum, d) => sum + d.amount, 0);
    return { meOwed, iOwe, balance: meOwed - iOwe };
  }, [debts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const debtData = {
      personName: formData.personName,
      amount: parseFloat(formData.amount),
      type: formData.type,
      description: formData.description || undefined,
      dueDate: formData.dueDate || undefined,
      paid: false,
    };

    if (editingDebt) {
      updateDebt(editingDebt.id, debtData);
    } else {
      addDebt(debtData);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingDebt(null);
    setFormData({
      personName: '',
      amount: '',
      type: 'me_deben',
      description: '',
      dueDate: '',
    });
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setFormData({
      personName: debt.personName,
      amount: debt.amount.toString(),
      type: debt.type,
      description: debt.description || '',
      dueDate: debt.dueDate || '',
    });
    setShowForm(true);
  };

  const handleTogglePaid = (debt: Debt) => {
    updateDebt(debt.id, { paid: !debt.paid });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta deuda?')) {
      deleteDebt(id);
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-2xl p-4 sm:p-6 border border-destructive/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-xl">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Control de Deudas</h2>
              <p className="text-sm text-muted-foreground">
                Gestiona créditos y deudas pendientes
              </p>
            </div>
          </div>
          <Button onClick={() => setShowForm(true)} className="gradient-primary">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Nueva Deuda</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-card rounded-2xl p-3 sm:p-4 shadow-soft border border-border">
          <div className="flex items-center gap-2 text-success mb-1">
            <ArrowDownCircle className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Me deben</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-success">
            {formatCurrency(summary.meOwed, settings.currencySymbol)}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-3 sm:p-4 shadow-soft border border-border">
          <div className="flex items-center gap-2 text-destructive mb-1">
            <ArrowUpCircle className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Debo</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-destructive">
            {formatCurrency(summary.iOwe, settings.currencySymbol)}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-3 sm:p-4 shadow-soft border border-border">
          <div className="text-xs sm:text-sm text-muted-foreground mb-1">Balance</div>
          <div className={cn(
            'text-lg sm:text-xl font-bold',
            summary.balance >= 0 ? 'text-success' : 'text-destructive'
          )}>
            {summary.balance >= 0 ? '+' : ''}{formatCurrency(summary.balance, settings.currencySymbol)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'Pendientes' },
          { key: 'me_deben', label: 'Me deben' },
          { key: 'debo', label: 'Debo' },
          { key: 'paid', label: 'Pagadas' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              filter === f.key
                ? 'bg-primary text-primary-foreground shadow-material'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div 
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={resetForm}
          />
          <div className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl shadow-material-xl max-h-[90vh] overflow-auto">
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-muted" />
            </div>
            
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">
                {editingDebt ? 'Editar Deuda' : 'Nueva Deuda'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'me_deben' }))}
                    className={cn(
                      'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all',
                      formData.type === 'me_deben'
                        ? 'border-success bg-success/5'
                        : 'border-border hover:border-muted-foreground'
                    )}
                  >
                    <ArrowDownCircle className="w-4 h-4 text-success" />
                    <span>Me deben</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'debo' }))}
                    className={cn(
                      'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all',
                      formData.type === 'debo'
                        ? 'border-destructive bg-destructive/5'
                        : 'border-border hover:border-muted-foreground'
                    )}
                  >
                    <ArrowUpCircle className="w-4 h-4 text-destructive" />
                    <span>Debo</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Persona / Empresa</Label>
                <Input
                  placeholder="Nombre..."
                  value={formData.personName}
                  onChange={(e) => setFormData(prev => ({ ...prev, personName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Monto ({settings.currencySymbol})</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha de vencimiento (opcional)</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Descripción (opcional)</Label>
                <Input
                  placeholder="Notas..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 gradient-primary">
                  {editingDebt ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Debts List */}
      {filteredDebts.length > 0 ? (
        <div className="space-y-3">
          {filteredDebts.map((debt) => (
            <div
              key={debt.id}
              className={cn(
                'bg-card rounded-2xl p-4 shadow-soft border transition-all',
                debt.paid ? 'opacity-60 border-border' :
                isOverdue(debt.dueDate) ? 'border-destructive/50' : 'border-border'
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleTogglePaid(debt)}
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors mt-1',
                    debt.paid
                      ? 'bg-success border-success text-success-foreground'
                      : debt.type === 'me_deben'
                        ? 'border-success hover:bg-success/10'
                        : 'border-destructive hover:bg-destructive/10'
                  )}
                >
                  {debt.paid && <Check className="w-4 h-4" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {debt.type === 'me_deben' ? (
                      <ArrowDownCircle className="w-4 h-4 text-success" />
                    ) : (
                      <ArrowUpCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className={cn('font-medium', debt.paid && 'line-through')}>
                      {debt.personName}
                    </span>
                  </div>
                  
                  <div className={cn(
                    'text-lg font-bold',
                    debt.type === 'me_deben' ? 'text-success' : 'text-destructive'
                  )}>
                    {debt.type === 'me_deben' ? '+' : '-'}{formatCurrency(debt.amount, settings.currencySymbol)}
                  </div>
                  
                  {debt.description && (
                    <p className="text-sm text-muted-foreground mt-1">{debt.description}</p>
                  )}
                  
                  {debt.dueDate && (
                    <div className={cn(
                      'flex items-center gap-1 text-xs mt-2',
                      isOverdue(debt.dueDate) && !debt.paid ? 'text-destructive' : 'text-muted-foreground'
                    )}>
                      <Calendar className="w-3 h-3" />
                      <span>
                        {isOverdue(debt.dueDate) && !debt.paid ? 'Vencido: ' : 'Vence: '}
                        {new Date(debt.dueDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8"
                    onClick={() => handleEdit(debt)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(debt.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{filter === 'paid' ? 'No hay deudas pagadas' : 'No hay deudas pendientes'}</p>
        </div>
      )}
    </div>
  );
};

export default Deudas;
