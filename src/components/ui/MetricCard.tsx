import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'primary';
  className?: string;
}

const variantStyles = {
  default: {
    bg: 'bg-card',
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
  },
  success: {
    bg: 'bg-card',
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
  },
  warning: {
    bg: 'bg-card',
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
  },
  destructive: {
    bg: 'bg-card',
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
  },
  primary: {
    bg: 'gradient-primary',
    iconBg: 'bg-primary-foreground/20',
    iconColor: 'text-primary-foreground',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
}) => {
  const styles = variantStyles[variant];
  const isPrimary = variant === 'primary';

  const TrendIcon = trend 
    ? trend.value > 0 
      ? TrendingUp 
      : trend.value < 0 
        ? TrendingDown 
        : Minus
    : null;

  const trendColor = trend
    ? trend.value > 0 
      ? isPrimary ? 'text-primary-foreground' : 'text-success'
      : trend.value < 0 
        ? isPrimary ? 'text-primary-foreground/70' : 'text-destructive'
        : 'text-muted-foreground'
    : '';

  return (
    <div className={cn(
      'rounded-2xl p-5 shadow-material transition-all duration-300 hover:shadow-material-md',
      styles.bg,
      isPrimary ? 'text-primary-foreground' : 'text-card-foreground',
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'p-3 rounded-xl',
          styles.iconBg
        )}>
          <div className={styles.iconColor}>
            {icon}
          </div>
        </div>
        {trend && TrendIcon && (
          <div className={cn('flex items-center gap-1 text-sm font-medium', trendColor)}>
            <TrendIcon className="w-4 h-4" />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      <div>
        <p className={cn(
          'text-sm font-medium mb-1',
          isPrimary ? 'text-primary-foreground/80' : 'text-muted-foreground'
        )}>
          {title}
        </p>
        <p className="text-2xl font-bold number-animate">{value}</p>
        {subtitle && (
          <p className={cn(
            'text-xs mt-1',
            isPrimary ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}>
            {subtitle}
          </p>
        )}
        {trend && (
          <p className={cn(
            'text-xs mt-1',
            isPrimary ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}>
            {trend.label}
          </p>
        )}
      </div>
    </div>
  );
};
