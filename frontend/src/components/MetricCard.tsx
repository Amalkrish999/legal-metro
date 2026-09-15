import React from 'react';
import { cn } from '../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ title, value, trend, trendValue, icon, className }: MetricCardProps) {
  return (
    <div className={cn("bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
        </div>
        {icon && (
          <div className="p-2.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light rounded-lg">
            {icon}
          </div>
        )}
      </div>
      
      {trend && (
        <div className="flex items-center gap-1 mt-4 text-sm">
          {trend === 'up' && <TrendingUp className="w-4 h-4 text-status-success" />}
          {trend === 'down' && <TrendingDown className="w-4 h-4 text-status-error" />}
          {trend === 'neutral' && <Minus className="w-4 h-4 text-slate-400" />}
          
          <span className={cn("font-medium", {
            'text-status-success': trend === 'up',
            'text-status-error': trend === 'down',
            'text-slate-500': trend === 'neutral'
          })}>
            {trendValue}
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-xs ml-1">vs yesterday</span>
        </div>
      )}
    </div>
  );
}
