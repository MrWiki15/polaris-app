import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { getExpiringProducts, formatCurrency } from '@/lib/storage';
import { AlertTriangle, Clock, Package, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ExpirationAlertsProps {
  onSuggestPromotion?: (product: { id: string; name: string; price: number }) => void;
}

export const ExpirationAlerts: React.FC<ExpirationAlertsProps> = ({ onSuggestPromotion }) => {
  const { data } = useApp();
  const { products, settings } = data;
  
  const expiringProducts = getExpiringProducts(products, 14);
  
  if (expiringProducts.length === 0) {
    return null;
  }

  const getStatusColor = (status: 'expired' | 'critical' | 'warning') => {
    switch (status) {
      case 'expired': return 'bg-destructive/10 border-destructive/30 text-destructive';
      case 'critical': return 'bg-warning/10 border-warning/30 text-warning';
      case 'warning': return 'bg-amber-500/10 border-amber-500/30 text-amber-600';
    }
  };

  const getStatusIcon = (status: 'expired' | 'critical' | 'warning') => {
    switch (status) {
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <Clock className="w-4 h-4" />;
      case 'warning': return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (item: { status: 'expired' | 'critical' | 'warning'; daysUntilExpiration: number }) => {
    if (item.status === 'expired') return 'Vencido';
    if (item.daysUntilExpiration === 0) return 'Vence hoy';
    if (item.daysUntilExpiration === 1) return 'Vence mañana';
    return `Vence en ${item.daysUntilExpiration} días`;
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-warning/10">
          <AlertTriangle className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h3 className="font-semibold">Alertas de Caducidad</h3>
          <p className="text-xs text-muted-foreground">{expiringProducts.length} productos próximos a vencer</p>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {expiringProducts.map(item => (
          <div
            key={item.product.id}
            className={cn(
              'p-3 rounded-xl border flex items-center justify-between gap-3',
              getStatusColor(item.status)
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-background/50">
                <Package className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{item.product.name}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span>{item.product.quantity} uds</span>
                  <span>•</span>
                  <span>{formatCurrency(item.product.price, settings.currencySymbol)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 text-xs font-medium">
                {getStatusIcon(item.status)}
                <span>{getStatusLabel(item)}</span>
              </div>
              {onSuggestPromotion && item.status !== 'expired' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                  onClick={() => onSuggestPromotion(item.product)}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  Promo
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {expiringProducts.some(p => p.status === 'expired') && (
        <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-sm">
          <p className="font-medium text-destructive">⚠️ Tienes productos vencidos</p>
          <p className="text-xs text-muted-foreground mt-1">
            Considera retirarlos del inventario o aplicar descuentos importantes
          </p>
        </div>
      )}
    </div>
  );
};
