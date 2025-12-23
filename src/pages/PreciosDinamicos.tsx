import React, { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { 
  Tag, 
  TrendingUp,
  AlertTriangle,
  Check,
  Info
} from 'lucide-react';
import { formatCurrency, calculateOptimalPrice } from '@/lib/storage';
import { cn } from '@/lib/utils';

export const PreciosDinamicos: React.FC = () => {
  const { data, updateProduct } = useApp();
  const { products, settings } = data;

  const priceAnalysis = useMemo(() => {
    return products.map(product => {
      const margin = product.price > 0 ? ((product.price - product.cost) / product.price * 100) : 0;
      const markup = product.cost > 0 ? ((product.price - product.cost) / product.cost * 100) : 0;
      
      // Suggested prices for different margins
      const suggestions = {
        conservative: calculateOptimalPrice(product.cost, 20),
        optimal: calculateOptimalPrice(product.cost, 35),
        aggressive: calculateOptimalPrice(product.cost, 50),
      };
      
      let status: 'good' | 'warning' | 'danger' = 'good';
      if (margin < 15) status = 'danger';
      else if (margin < 25) status = 'warning';
      
      return {
        ...product,
        margin,
        markup,
        suggestions,
        status,
      };
    });
  }, [products]);

  const avgMargin = priceAnalysis.length > 0
    ? priceAnalysis.reduce((sum, p) => sum + p.margin, 0) / priceAnalysis.length
    : 0;

  const lowMarginCount = priceAnalysis.filter(p => p.status !== 'good').length;

  const handleApplySuggestion = (productId: string, newPrice: number) => {
    updateProduct(productId, { price: newPrice });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-chart-5/10 to-chart-5/5 rounded-2xl p-4 sm:p-6 border border-chart-5/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-chart-5/10 rounded-xl">
            <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-chart-5" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold">Precios Dinámicos</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Analiza y optimiza los precios de tus productos
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-4 shadow-soft border border-border">
          <div className="text-muted-foreground text-sm mb-1">Margen promedio</div>
          <div className={cn(
            'text-2xl font-bold',
            avgMargin >= 30 ? 'text-success' : avgMargin >= 20 ? 'text-warning' : 'text-destructive'
          )}>
            {avgMargin.toFixed(1)}%
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-soft border border-border">
          <div className="text-muted-foreground text-sm mb-1">Productos analizados</div>
          <div className="text-2xl font-bold">{products.length}</div>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-soft border border-border col-span-2 sm:col-span-1">
          <div className="text-muted-foreground text-sm mb-1">Precios a revisar</div>
          <div className={cn(
            'text-2xl font-bold',
            lowMarginCount > 0 ? 'text-warning' : 'text-success'
          )}>
            {lowMarginCount}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-info/5 border border-info/20 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-info mb-1">Recomendaciones de precios</p>
          <p className="text-muted-foreground">
            Basamos los precios sugeridos en tu costo. Margen conservador (20%), óptimo (35%) y agresivo (50%).
            Un margen saludable está entre 25-40% para la mayoría de productos.
          </p>
        </div>
      </div>

      {/* Products Analysis */}
      {priceAnalysis.length > 0 ? (
        <div className="space-y-4">
          {priceAnalysis.map((product) => (
            <div
              key={product.id}
              className={cn(
                'bg-card rounded-2xl p-4 shadow-soft border transition-all',
                product.status === 'danger' ? 'border-destructive/50' :
                product.status === 'warning' ? 'border-warning/50' : 'border-border'
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h4 className="font-semibold">{product.name}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>Costo: {formatCurrency(product.cost, settings.currencySymbol)}</span>
                    <span>•</span>
                    <span>Precio: {formatCurrency(product.price, settings.currencySymbol)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {product.status === 'good' && (
                    <span className="flex items-center gap-1 text-success text-sm">
                      <Check className="w-4 h-4" />
                      Margen saludable
                    </span>
                  )}
                  {product.status === 'warning' && (
                    <span className="flex items-center gap-1 text-warning text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      Margen bajo
                    </span>
                  )}
                  {product.status === 'danger' && (
                    <span className="flex items-center gap-1 text-destructive text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      Margen crítico
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-muted rounded-xl p-3">
                  <div className="text-xs text-muted-foreground">Margen actual</div>
                  <div className={cn(
                    'text-lg font-bold',
                    product.margin >= 30 ? 'text-success' : 
                    product.margin >= 20 ? 'text-warning' : 'text-destructive'
                  )}>
                    {product.margin.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <div className="text-xs text-muted-foreground">Markup</div>
                  <div className="text-lg font-bold">{product.markup.toFixed(0)}%</div>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <div className="text-xs text-muted-foreground">Ganancia/unidad</div>
                  <div className="text-lg font-bold text-success">
                    {formatCurrency(product.price - product.cost, settings.currencySymbol)}
                  </div>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <div className="text-xs text-muted-foreground">Stock × Ganancia</div>
                  <div className="text-lg font-bold">
                    {formatCurrency((product.price - product.cost) * product.quantity, settings.currencySymbol)}
                  </div>
                </div>
              </div>

              {/* Price Suggestions */}
              <div className="border-t border-border pt-4">
                <div className="text-sm font-medium mb-2">Precios sugeridos:</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleApplySuggestion(product.id, product.suggestions.conservative)}
                    className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm"
                  >
                    <span className="text-muted-foreground">20%:</span>
                    <span className="font-medium">{formatCurrency(product.suggestions.conservative, settings.currencySymbol)}</span>
                    <TrendingUp className="w-3 h-3 text-primary" />
                  </button>
                  <button
                    onClick={() => handleApplySuggestion(product.id, product.suggestions.optimal)}
                    className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-sm border border-primary/20"
                  >
                    <span className="text-primary">35%:</span>
                    <span className="font-medium">{formatCurrency(product.suggestions.optimal, settings.currencySymbol)}</span>
                    <TrendingUp className="w-3 h-3 text-primary" />
                  </button>
                  <button
                    onClick={() => handleApplySuggestion(product.id, product.suggestions.aggressive)}
                    className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm"
                  >
                    <span className="text-muted-foreground">50%:</span>
                    <span className="font-medium">{formatCurrency(product.suggestions.aggressive, settings.currencySymbol)}</span>
                    <TrendingUp className="w-3 h-3 text-primary" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No hay productos para analizar</p>
          <p className="text-sm">Agrega productos en Inventario primero</p>
        </div>
      )}
    </div>
  );
};

export default PreciosDinamicos;
