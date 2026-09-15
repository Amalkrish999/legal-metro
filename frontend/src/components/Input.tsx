import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, required, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
            {required && <span className="text-status-error ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            type={inputType}
            className={cn(
              "w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none transition-all",
              error 
                ? "border-status-error focus:ring-2 focus:ring-status-error" 
                : "border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary focus:border-transparent",
              isPassword && "pr-10",
              className
            )}
            ref={ref}
            required={required}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm font-medium text-status-error">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
