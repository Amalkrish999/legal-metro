import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-status-success" />,
    error: <AlertCircle className="w-5 h-5 text-status-error" />,
    info: <Info className="w-5 h-5 text-primary" />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
  };

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm w-full animate-in slide-in-from-right-8 fade-in duration-300",
      bgColors[type]
    )}>
      {icons[type]}
      <p className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">
        {message}
      </p>
      <button onClick={onClose} className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
        <X className="w-4 h-4 text-slate-500" />
      </button>
    </div>
  );
}
