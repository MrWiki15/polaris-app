import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { projectCashFlow, formatCurrency } from '@/lib/storage';
import { AlertTriangle, TrendingDown, Calendar, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CashFlowAlerts: React.FC = () => {
  const { data } = useApp();
  const { sales, expenses, recurringPayments, settings } = data;

  const projections = React.useMemo(() => 
    projectCashFlow(sales, expenses, recurringPayments, 7),
    [sales, expenses, recurringPayments]
  );

  const criticalDays = projections.filter(p => p.projectedBalance < 0);
  const warningDays = projections.filter(p => p.projectedBalance >= 0 && p.alerts.some(a => a.includes('Balance bajo')));
  const upcomingPayments = projections.filter(p => p.alerts.some(a => a.startsWith('Pago:')));

  if (criticalDays.length === 0 && warningDays.length === 0 && upcomingPayments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <Zap className="w-5 h-5 text-warning" />
        Alertas de Flujo de Caja
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Critical alerts */}
        {criticalDays.map((day, idx) => (
          <div
            key={`critical-${idx}`}
            className="flex items-start gap-3 p-4 rounded-xl border bg-destructive/5 border-destructive/20"
          >
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive text-sm">Balance negativo proyectado</p>
              <p className="text-xs text-muted-foreground">
                {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
              <p className="text-sm font-semibold text-destructive mt-1">
                {formatCurrency(day.projectedBalance, settings.currencySymbol)}
              </p>
            </div>
          </div>
        ))}

        {/* Warning alerts */}
        {warningDays.slice(0, 2).map((day, idx) => (
          <div
            key={`warning-${idx}`}
            className="flex items-start gap-3 p-4 rounded-xl border bg-warning/5 border-warning/20"
          >
            <TrendingDown className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning text-sm">Balance bajo</p>
              <p className="text-xs text-muted-foreground">
                {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
              <p className="text-sm font-semibold mt-1">
                {formatCurrency(day.projectedBalance, settings.currencySymbol)}
              </p>
            </div>
          </div>
        ))}

        {/* Upcoming payments */}
        {upcomingPayments.slice(0, 3).map((day, idx) => {
          const paymentAlert = day.alerts.find(a => a.startsWith('Pago:'));
          return (
            <div
              key={`payment-${idx}`}
              className="flex items-start gap-3 p-4 rounded-xl border bg-info/5 border-info/20"
            >
              <Calendar className="w-5 h-5 text-info shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-info text-sm">{paymentAlert?.replace('Pago: ', '')}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CashFlowAlerts;
