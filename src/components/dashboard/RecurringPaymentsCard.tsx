import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { getRecurringPaymentCompliance, formatCurrency } from '@/lib/storage';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const RecurringPaymentsCard: React.FC = () => {
  const { data, payRecurringPayment } = useApp();
  const { recurringPayments, expenses, settings } = data;

  const compliance = React.useMemo(() => 
    getRecurringPaymentCompliance(recurringPayments, expenses),
    [recurringPayments, expenses]
  );

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const monthlyPayments = recurringPayments.filter(rp => rp.isActive && rp.frequency === 'monthly');
  
  const getPaymentStatus = (rp: typeof recurringPayments[0]) => {
    const isPaid = expenses.some(e => 
      e.recurringId === rp.id && 
      new Date(e.date).getMonth() === currentMonth &&
      new Date(e.date).getFullYear() === currentYear
    );
    
    const dayOfMonth = today.getDate();
    const isOverdue = !isPaid && rp.dayOfMonth && dayOfMonth > rp.dayOfMonth;
    const isDueSoon = !isPaid && rp.dayOfMonth && dayOfMonth <= rp.dayOfMonth && (rp.dayOfMonth - dayOfMonth) <= 3;
    
    return { isPaid, isOverdue, isDueSoon };
  };

  const handlePay = (rp: typeof recurringPayments[0]) => {
    payRecurringPayment(rp.id);
    toast.success(`Pago registrado: ${rp.name}`);
  };

  if (monthlyPayments.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Pagos Recurrentes
        </h3>
        <div className="text-right">
          <span className="text-2xl font-bold">{compliance.percentage.toFixed(0)}%</span>
          <p className="text-xs text-muted-foreground">{compliance.paid}/{compliance.total} pagados</p>
        </div>
      </div>

      <Progress value={compliance.percentage} className="h-2 mb-4" />

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {monthlyPayments.map(rp => {
          const status = getPaymentStatus(rp);
          return (
            <div
              key={rp.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-xl border transition-all',
                status.isPaid && 'bg-success/5 border-success/20',
                status.isOverdue && 'bg-destructive/5 border-destructive/20',
                status.isDueSoon && !status.isPaid && 'bg-warning/5 border-warning/20',
                !status.isPaid && !status.isOverdue && !status.isDueSoon && 'bg-muted/50 border-border'
              )}
            >
              <div className="flex items-center gap-3">
                {status.isPaid ? (
                  <Check className="w-4 h-4 text-success" />
                ) : status.isOverdue ? (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                ) : (
                  <Clock className="w-4 h-4 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium text-sm">{rp.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Día {rp.dayOfMonth} • {formatCurrency(rp.amount, settings.currencySymbol)}
                  </p>
                </div>
              </div>
              
              {!status.isPaid && (
                <Button
                  size="sm"
                  variant={status.isOverdue ? 'destructive' : 'outline'}
                  onClick={() => handlePay(rp)}
                  className="h-8 text-xs"
                >
                  Pagar
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecurringPaymentsCard;
