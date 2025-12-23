import React from 'react';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface FloatingButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  onClick,
  icon = <Plus className="w-6 h-6" />,
  label,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-40',
        'flex items-center gap-2 px-5 py-4 rounded-2xl',
        'gradient-primary text-primary-foreground font-medium',
        'shadow-material-lg hover:shadow-material-xl',
        'transform transition-all duration-300 ease-material',
        'hover:scale-105 active:scale-95',
        'ripple',
        className
      )}
      aria-label={label || 'Add'}
    >
      {icon}
      {label && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
};
