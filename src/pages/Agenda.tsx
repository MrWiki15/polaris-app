import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { 
  Calendar as CalendarIcon, 
  Plus,
  Clock,
  Check,
  Bell,
  CreditCard,
  MoreHorizontal,
  Trash2,
  Edit2,
  AlertTriangle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarEvent } from '@/lib/storage';
import { cn } from '@/lib/utils';

const eventTypes = [
  { value: 'recordatorio', label: 'Recordatorio', icon: Bell, color: 'text-warning' },
  { value: 'cita', label: 'Cita', icon: Clock, color: 'text-primary' },
  { value: 'pago', label: 'Pago', icon: CreditCard, color: 'text-destructive' },
  { value: 'otro', label: 'Otro', icon: MoreHorizontal, color: 'text-muted-foreground' },
];

export const Agenda: React.FC = () => {
  const { data, addEvent, updateEvent, deleteEvent } = useApp();
  const { events, debts, goals } = data;

  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    type: 'recordatorio' as CalendarEvent['type'],
    description: '',
  });

  const today = new Date().toISOString().split('T')[0];

  // Auto-generate alerts from debts and goals
  const autoAlerts = useMemo(() => {
    const alerts: { title: string; date: string; type: 'debt' | 'goal'; id: string }[] = [];
    
    // Overdue debts
    debts.filter(d => !d.paid && d.dueDate && d.dueDate <= today).forEach(debt => {
      alerts.push({
        title: `Deuda vencida: ${debt.personName}`,
        date: debt.dueDate!,
        type: 'debt',
        id: debt.id,
      });
    });

    // Upcoming debts (next 7 days)
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const weekStr = weekFromNow.toISOString().split('T')[0];
    
    debts.filter(d => !d.paid && d.dueDate && d.dueDate > today && d.dueDate <= weekStr).forEach(debt => {
      alerts.push({
        title: `Pago próximo: ${debt.personName}`,
        date: debt.dueDate!,
        type: 'debt',
        id: debt.id,
      });
    });

    // Goals deadlines
    goals.filter(g => g.deadline >= today).forEach(goal => {
      const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 7 && daysLeft > 0) {
        alerts.push({
          title: `Meta por vencer: ${goal.title}`,
          date: goal.deadline,
          type: 'goal',
          id: goal.id,
        });
      }
    });

    return alerts;
  }, [debts, goals, today]);

  // Organize events by date
  const organizedEvents = useMemo(() => {
    const upcoming = events
      .filter(e => e.date >= today && !e.completed)
      .sort((a, b) => a.date.localeCompare(b.date));
    
    const past = events
      .filter(e => e.date < today || e.completed)
      .sort((a, b) => b.date.localeCompare(a.date));

    return { upcoming, past };
  }, [events, today]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEvent) {
      updateEvent(editingEvent.id, {
        title: formData.title,
        date: formData.date,
        time: formData.time || undefined,
        type: formData.type,
        description: formData.description || undefined,
      });
    } else {
      addEvent({
        title: formData.title,
        date: formData.date,
        time: formData.time || undefined,
        type: formData.type,
        description: formData.description || undefined,
        completed: false,
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      type: 'recordatorio',
      description: '',
    });
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time || '',
      type: event.type,
      description: event.description || '',
    });
    setShowForm(true);
  };

  const handleToggleComplete = (event: CalendarEvent) => {
    updateEvent(event.id, { completed: !event.completed });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este evento?')) {
      deleteEvent(id);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    if (dateStr === today) return 'Hoy';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Mañana';
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const EventCard = ({ event }: { event: CalendarEvent }) => {
    const typeInfo = eventTypes.find(t => t.value === event.type);
    const Icon = typeInfo?.icon || Bell;
    
    return (
      <div className={cn(
        'flex items-start gap-3 p-4 bg-card rounded-xl border border-border transition-all',
        event.completed && 'opacity-60'
      )}>
        <button
          onClick={() => handleToggleComplete(event)}
          className={cn(
            'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
            event.completed
              ? 'bg-success border-success text-success-foreground'
              : 'border-muted-foreground hover:border-primary'
          )}
        >
          {event.completed && <Check className="w-4 h-4" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={cn('w-4 h-4', typeInfo?.color)} />
            <span className={cn(
              'font-medium',
              event.completed && 'line-through'
            )}>
              {event.title}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDate(event.date)}</span>
            {event.time && <span>• {event.time}</span>}
          </div>
          {event.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>

        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8"
            onClick={() => handleEdit(event)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 text-destructive hover:bg-destructive/10"
            onClick={() => handleDelete(event.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-warning/10 to-warning/5 rounded-2xl p-4 sm:p-6 border border-warning/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-xl">
              <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Agenda</h2>
              <p className="text-sm text-muted-foreground">
                {organizedEvents.upcoming.length} eventos próximos
              </p>
            </div>
          </div>
          <Button onClick={() => setShowForm(true)} className="gradient-primary">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Nuevo</span>
          </Button>
        </div>
      </div>

      {/* Auto Alerts from Debts & Goals */}
      {autoAlerts.length > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4">
          <h3 className="font-semibold text-destructive mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alertas automáticas
          </h3>
          <div className="space-y-2">
            {autoAlerts.map((alert, idx) => (
              <div
                key={`${alert.type}-${alert.id}-${idx}`}
                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
              >
                {alert.type === 'debt' ? (
                  <CreditCard className="w-4 h-4 text-destructive" />
                ) : (
                  <Bell className="w-4 h-4 text-warning" />
                )}
                <div className="flex-1">
                  <span className="font-medium text-sm">{alert.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {formatDate(alert.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">
                {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
              </h3>
              <Button size="icon" variant="ghost" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  placeholder="Ej: Reunión con proveedor"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora (opcional)</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <div className="grid grid-cols-2 gap-2">
                  {eventTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: type.value as CalendarEvent['type'] }))}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-xl border-2 transition-all',
                        formData.type === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-muted-foreground'
                      )}
                    >
                      <type.icon className={cn('w-4 h-4', type.color)} />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descripción (opcional)</Label>
                <Input
                  placeholder="Notas adicionales..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 gradient-primary">
                  {editingEvent ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-6">
        {/* Upcoming */}
        <div>
          <h3 className="font-semibold mb-3">Próximos eventos</h3>
          {organizedEvents.upcoming.length > 0 ? (
            <div className="space-y-2">
              {organizedEvents.upcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay eventos próximos</p>
            </div>
          )}
        </div>

        {/* Past/Completed */}
        {organizedEvents.past.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 text-muted-foreground">Completados / Pasados</h3>
            <div className="space-y-2">
              {organizedEvents.past.slice(0, 5).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agenda;
