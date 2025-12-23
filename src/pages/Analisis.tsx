import React, { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { MetricCard } from '@/components/ui/MetricCard';
import { formatCurrency } from '@/lib/storage';
import { TrendingUp, TrendingDown, Percent, Target, Lightbulb, BarChart3 } from 'lucide-react';
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
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export const Analisis: React.FC = () => {
  const { data } = useApp();
  const { sales, expenses, products, settings } = data;

  // Calculate metrics
  const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalSales - totalExpenses;
  const profitMargin = totalSales > 0 ? (profit / totalSales * 100) : 0;

  // Monthly trend data
  const monthlyData = useMemo(() => {
    const months: { [key: string]: { ventas: number; gastos: number; balance: number } } = {};
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      months[monthKey] = { ventas: 0, gastos: 0, balance: 0 };
      last6Months.push({ key: monthKey, name: monthName });
    }

    sales.forEach(s => {
      const monthKey = s.date.substring(0, 7);
      if (months[monthKey]) {
        months[monthKey].ventas += s.amount;
      }
    });

    expenses.forEach(e => {
      const monthKey = e.date.substring(0, 7);
      if (months[monthKey]) {
        months[monthKey].gastos += e.amount;
      }
    });

    return last6Months.map(m => ({
      name: m.name,
      ventas: months[m.key].ventas,
      gastos: months[m.key].gastos,
      balance: months[m.key].ventas - months[m.key].gastos,
    }));
  }, [sales, expenses]);

  // Sales by category
  const salesByCategory = useMemo(() => {
    const categories: { [key: string]: number } = {};
    sales.forEach(s => {
      categories[s.category] = (categories[s.category] || 0) + s.amount;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [sales]);

  // Generate insights
  const insights = useMemo(() => {
    const tips: { icon: React.ReactNode; title: string; text: string; type: 'success' | 'warning' | 'info' }[] = [];

    // Best selling category
    if (salesByCategory.length > 0) {
      tips.push({
        icon: <Target className="w-5 h-5" />,
        title: 'Categoría más rentable',
        text: `"${salesByCategory[0].name}" genera el ${((salesByCategory[0].value / totalSales) * 100).toFixed(0)}% de tus ventas`,
        type: 'success',
      });
    }

    // Profit margin analysis
    if (profitMargin > 30) {
      tips.push({
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'Margen saludable',
        text: `Tu margen de beneficio del ${profitMargin.toFixed(0)}% está por encima del promedio`,
        type: 'success',
      });
    } else if (profitMargin > 0) {
      tips.push({
        icon: <Lightbulb className="w-5 h-5" />,
        title: 'Oportunidad de mejora',
        text: 'Considera reducir gastos o aumentar precios para mejorar el margen',
        type: 'warning',
      });
    }

    // Low stock products affecting sales
    const lowStockCount = products.filter(p => p.quantity <= (p.minStock || 10)).length;
    if (lowStockCount > 0) {
      tips.push({
        icon: <BarChart3 className="w-5 h-5" />,
        title: 'Stock afectando ventas',
        text: `${lowStockCount} productos con stock bajo pueden limitar tus ventas`,
        type: 'warning',
      });
    }

    // Month comparison
    if (monthlyData.length >= 2) {
      const currentMonth = monthlyData[monthlyData.length - 1];
      const lastMonth = monthlyData[monthlyData.length - 2];
      const growth = lastMonth.ventas > 0 
        ? ((currentMonth.ventas - lastMonth.ventas) / lastMonth.ventas * 100)
        : 0;
      
      if (growth > 0) {
        tips.push({
          icon: <TrendingUp className="w-5 h-5" />,
          title: 'Crecimiento positivo',
          text: `Las ventas crecieron ${growth.toFixed(0)}% respecto al mes anterior`,
          type: 'success',
        });
      } else if (growth < 0) {
        tips.push({
          icon: <TrendingDown className="w-5 h-5" />,
          title: 'Ventas decreciendo',
          text: `Las ventas bajaron ${Math.abs(growth).toFixed(0)}% respecto al mes anterior`,
          type: 'warning',
        });
      }
    }

    return tips;
  }, [salesByCategory, totalSales, profitMargin, products, monthlyData]);

  return (
    <div className="space-y-6 pb-20">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Ingresos"
          value={formatCurrency(totalSales, settings.currencySymbol)}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="success"
        />
        <MetricCard
          title="Total Gastos"
          value={formatCurrency(totalExpenses, settings.currencySymbol)}
          icon={<TrendingDown className="w-5 h-5" />}
          variant="destructive"
        />
        <MetricCard
          title="Beneficio Neto"
          value={formatCurrency(Math.abs(profit), settings.currencySymbol)}
          subtitle={profit >= 0 ? 'Ganancia' : 'Pérdida'}
          icon={profit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          variant={profit >= 0 ? 'primary' : 'destructive'}
        />
        <MetricCard
          title="Margen de Beneficio"
          value={`${profitMargin.toFixed(1)}%`}
          icon={<Percent className="w-5 h-5" />}
          variant={profitMargin > 20 ? 'success' : 'warning'}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Trend */}
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
          <h3 className="font-semibold mb-4">Tendencia Mensual</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGastosArea" x1="0" y1="0" x2="0" y2="1">
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
                  }}
                  formatter={(value: number) => formatCurrency(value, settings.currencySymbol)}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="ventas" 
                  name="Ingresos"
                  stroke="hsl(var(--chart-2))" 
                  fillOpacity={1} 
                  fill="url(#colorIngresos)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="gastos" 
                  name="Gastos"
                  stroke="hsl(var(--chart-4))" 
                  fillOpacity={1} 
                  fill="url(#colorGastosArea)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
          <h3 className="font-semibold mb-4">Ventas por Categoría</h3>
          <div className="h-64">
            {salesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {salesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value, settings.currencySymbol)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No hay datos suficientes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Balance Chart */}
      <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
        <h3 className="font-semibold mb-4">Balance Mensual</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
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
              <Bar 
                dataKey="balance" 
                name="Balance"
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Insights Inteligentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={cn(
                  'p-4 rounded-2xl border transition-all',
                  insight.type === 'success' && 'bg-success/5 border-success/20',
                  insight.type === 'warning' && 'bg-warning/5 border-warning/20',
                  insight.type === 'info' && 'bg-info/5 border-info/20',
                )}
              >
                <div className={cn(
                  'flex items-center gap-2 mb-2',
                  insight.type === 'success' && 'text-success',
                  insight.type === 'warning' && 'text-warning',
                  insight.type === 'info' && 'text-info',
                )}>
                  {insight.icon}
                  <span className="font-semibold">{insight.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analisis;
