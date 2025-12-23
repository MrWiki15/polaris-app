import React, { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { MetricCard } from '@/components/ui/MetricCard';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle,
  Lightbulb,
  ShoppingCart,
  Receipt
} from 'lucide-react';
import { 
  formatCurrency, 
  getTodaysSales, 
  getTodaysExpenses, 
  getYesterdaysSales, 
  getWeekSales,
  getLowStockProducts,
  getInventoryValue
} from '@/lib/storage';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { cn } from '@/lib/utils';

export const Dashboard: React.FC = () => {
  const { data } = useApp();
  const { sales, expenses, products, settings } = data;

  // Calculate metrics
  const todaySales = useMemo(() => getTodaysSales(sales), [sales]);
  const todayExpenses = useMemo(() => getTodaysExpenses(expenses), [expenses]);
  const yesterdaySales = useMemo(() => getYesterdaysSales(sales), [sales]);
  const weekSales = useMemo(() => getWeekSales(sales), [sales]);
  const lowStockProducts = useMemo(() => getLowStockProducts(products), [products]);
  const inventoryValue = useMemo(() => getInventoryValue(products), [products]);

  const todaySalesTotal = todaySales.reduce((sum, s) => sum + s.amount, 0);
  const todayExpensesTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const todayBalance = todaySalesTotal - todayExpensesTotal;
  const yesterdaySalesTotal = yesterdaySales.reduce((sum, s) => sum + s.amount, 0);

  // Calculate trend
  const salesTrend = yesterdaySalesTotal > 0 
    ? ((todaySalesTotal - yesterdaySalesTotal) / yesterdaySalesTotal * 100)
    : 0;

  // Prepare chart data for last 7 days
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
      
      const daySales = sales.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.amount, 0);
      const dayExpenses = expenses.filter(e => e.date === dateStr).reduce((sum, e) => sum + e.amount, 0);
      
      days.push({
        name: dayName,
        ventas: daySales,
        gastos: dayExpenses,
        balance: daySales - dayExpenses,
      });
    }
    return days;
  }, [sales, expenses]);

  // Generate insights
  const insights = useMemo(() => {
    const tips: { icon: React.ReactNode; text: string; type: 'success' | 'warning' | 'info' }[] = [];

    if (lowStockProducts.length > 0) {
      tips.push({
        icon: <AlertTriangle className="w-5 h-5" />,
        text: `${lowStockProducts.length} producto(s) con stock bajo`,
        type: 'warning',
      });
    }

    if (todayBalance > 0) {
      tips.push({
        icon: <TrendingUp className="w-5 h-5" />,
        text: `Día positivo: ganancia de ${formatCurrency(todayBalance, settings.currencySymbol)}`,
        type: 'success',
      });
    }

    if (salesTrend > 10) {
      tips.push({
        icon: <Lightbulb className="w-5 h-5" />,
        text: 'Ventas en aumento respecto a ayer',
        type: 'success',
      });
    }

    if (todayExpensesTotal > todaySalesTotal && todaySalesTotal > 0) {
      tips.push({
        icon: <AlertTriangle className="w-5 h-5" />,
        text: 'Los gastos superan las ventas hoy',
        type: 'warning',
      });
    }

    return tips;
  }, [lowStockProducts, todayBalance, salesTrend, todayExpensesTotal, todaySalesTotal, settings.currencySymbol]);

  return (
    <div className="space-y-6 pb-20">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Ventas de hoy"
          value={formatCurrency(todaySalesTotal, settings.currencySymbol)}
          icon={<ShoppingCart className="w-5 h-5" />}
          trend={{ value: Math.round(salesTrend), label: 'vs ayer' }}
          variant="primary"
        />
        <MetricCard
          title="Gastos de hoy"
          value={formatCurrency(todayExpensesTotal, settings.currencySymbol)}
          icon={<Receipt className="w-5 h-5" />}
          variant="destructive"
        />
        <MetricCard
          title="Balance del día"
          value={formatCurrency(Math.abs(todayBalance), settings.currencySymbol)}
          subtitle={todayBalance >= 0 ? 'Ganancia' : 'Pérdida'}
          icon={todayBalance >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          variant={todayBalance >= 0 ? 'success' : 'destructive'}
        />
        <MetricCard
          title="Valor inventario"
          value={formatCurrency(inventoryValue, settings.currencySymbol)}
          subtitle={`${products.length} productos`}
          icon={<Package className="w-5 h-5" />}
          variant="default"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Overview */}
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
          <h3 className="font-semibold mb-4">Resumen Semanal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number) => formatCurrency(value, settings.currencySymbol)}
                />
                <Area 
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="hsl(var(--chart-2))" 
                  fillOpacity={1} 
                  fill="url(#colorVentas)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="gastos" 
                  stroke="hsl(var(--chart-4))" 
                  fillOpacity={1} 
                  fill="url(#colorGastos)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Balance Chart */}
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
          <h3 className="font-semibold mb-4">Balance Diario</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => formatCurrency(value, settings.currencySymbol)}
                />
                <Legend />
                <Bar 
                  dataKey="ventas" 
                  name="Ventas"
                  fill="hsl(var(--chart-2))" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="gastos" 
                  name="Gastos"
                  fill="hsl(var(--chart-4))" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights & Alerts */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Alertas e Insights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border transition-all',
                  insight.type === 'success' && 'bg-success/5 border-success/20 text-success',
                  insight.type === 'warning' && 'bg-warning/5 border-warning/20 text-warning',
                  insight.type === 'info' && 'bg-info/5 border-info/20 text-info',
                )}
              >
                {insight.icon}
                <span className="text-sm font-medium">{insight.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-warning/5 border border-warning/20 rounded-2xl p-5">
          <h3 className="font-semibold text-warning mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Productos con Stock Bajo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.slice(0, 6).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-card rounded-xl border border-border"
              >
                <span className="font-medium truncate">{product.name}</span>
                <span className={cn(
                  'px-2 py-1 rounded-lg text-xs font-bold',
                  product.quantity === 0 
                    ? 'bg-destructive/10 text-destructive' 
                    : 'bg-warning/10 text-warning'
                )}>
                  {product.quantity} uds
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
