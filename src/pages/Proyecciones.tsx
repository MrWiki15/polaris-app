import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { MetricCard } from '@/components/ui/MetricCard';
import { formatCurrency } from '@/lib/storage';
import { TrendingUp, Calculator, Target, Zap } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export const Proyecciones: React.FC = () => {
  const { data } = useApp();
  const { sales, expenses, settings } = data;

  // Calculate current averages
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  
  const monthlySales = sales.filter(s => new Date(s.date) >= monthAgo);
  const monthlyExpenses = expenses.filter(e => new Date(e.date) >= monthAgo);
  
  const avgMonthlySales = monthlySales.reduce((sum, s) => sum + s.amount, 0);
  const avgMonthlyExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Simulation controls
  const [salesIncrease, setSalesIncrease] = useState(10);
  const [expenseReduction, setExpenseReduction] = useState(5);

  // Calculate projections
  const projectedSales = avgMonthlySales * (1 + salesIncrease / 100);
  const projectedExpenses = avgMonthlyExpenses * (1 - expenseReduction / 100);
  const projectedProfit = projectedSales - projectedExpenses;
  const currentProfit = avgMonthlySales - avgMonthlyExpenses;
  const profitChange = currentProfit > 0 
    ? ((projectedProfit - currentProfit) / currentProfit * 100)
    : projectedProfit > 0 ? 100 : 0;

  // Generate projection data for chart
  const projectionData = useMemo(() => {
    const data = [];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    
    for (let i = 0; i < 6; i++) {
      // Current scenario (with slight random variation)
      const currentSales = avgMonthlySales * (1 + (Math.random() - 0.5) * 0.1);
      const currentExpense = avgMonthlyExpenses * (1 + (Math.random() - 0.5) * 0.1);
      
      // Projected scenario (gradual improvement)
      const progressFactor = (i + 1) / 6;
      const projSales = avgMonthlySales + (projectedSales - avgMonthlySales) * progressFactor;
      const projExpense = avgMonthlyExpenses - (avgMonthlyExpenses - projectedExpenses) * progressFactor;
      
      data.push({
        name: monthNames[i],
        'Ventas actuales': Math.round(currentSales),
        'Ventas proyectadas': Math.round(projSales),
        'Gastos actuales': Math.round(currentExpense),
        'Gastos proyectados': Math.round(projExpense),
      });
    }
    
    return data;
  }, [avgMonthlySales, avgMonthlyExpenses, projectedSales, projectedExpenses]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Calculator className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Simulador de Proyecciones</h2>
        </div>
        <p className="text-muted-foreground">
          Ajusta los parámetros para ver cómo afectarían tus ganancias
        </p>
      </div>

      {/* Simulation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Increase */}
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <span className="font-medium">Aumentar Ventas</span>
            </div>
            <span className="text-2xl font-bold text-success">+{salesIncrease}%</span>
          </div>
          <Slider
            value={[salesIncrease]}
            onValueChange={(value) => setSalesIncrease(value[0])}
            max={50}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Expense Reduction */}
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-warning" />
              <span className="font-medium">Reducir Gastos</span>
            </div>
            <span className="text-2xl font-bold text-warning">-{expenseReduction}%</span>
          </div>
          <Slider
            value={[expenseReduction]}
            onValueChange={(value) => setExpenseReduction(value[0])}
            max={30}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>0%</span>
            <span>30%</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Ventas proyectadas"
          value={formatCurrency(projectedSales, settings.currencySymbol)}
          subtitle={`Actual: ${formatCurrency(avgMonthlySales, settings.currencySymbol)}`}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="success"
        />
        <MetricCard
          title="Gastos proyectados"
          value={formatCurrency(projectedExpenses, settings.currencySymbol)}
          subtitle={`Actual: ${formatCurrency(avgMonthlyExpenses, settings.currencySymbol)}`}
          icon={<Target className="w-5 h-5" />}
          variant="warning"
        />
        <MetricCard
          title="Beneficio proyectado"
          value={formatCurrency(projectedProfit, settings.currencySymbol)}
          subtitle={`Actual: ${formatCurrency(currentProfit, settings.currencySymbol)}`}
          icon={<Zap className="w-5 h-5" />}
          variant="primary"
        />
        <MetricCard
          title="Mejora del beneficio"
          value={`${profitChange > 0 ? '+' : ''}${profitChange.toFixed(0)}%`}
          icon={<Calculator className="w-5 h-5" />}
          variant={profitChange > 0 ? 'success' : 'destructive'}
        />
      </div>

      {/* Projection Chart */}
      <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
        <h3 className="font-semibold mb-4">Proyección a 6 Meses</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="colorVentasProj" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorGastosProj" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0}/>
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
                dataKey="Ventas actuales" 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5"
                fill="transparent" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="Ventas proyectadas" 
                stroke="hsl(var(--chart-2))" 
                fillOpacity={1} 
                fill="url(#colorVentasProj)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="Gastos actuales" 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5"
                fill="transparent" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="Gastos proyectados" 
                stroke="hsl(var(--chart-3))" 
                fillOpacity={1} 
                fill="url(#colorGastosProj)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-info/5 border border-info/20 rounded-2xl p-5">
        <h3 className="font-semibold text-info mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Consejos para alcanzar las metas
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-info">•</span>
            <span>Para aumentar ventas: ofrece promociones, diversifica productos, mejora la atención al cliente</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-info">•</span>
            <span>Para reducir gastos: negocia con proveedores, optimiza inventario, reduce desperdicios</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-info">•</span>
            <span>Revisa tu inventario regularmente para evitar productos estancados</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Proyecciones;
