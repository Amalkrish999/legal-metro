import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { ShieldAlert, Moon, Sun, LogOut } from 'lucide-react';

interface SidebarProps {
  navItems: { name: string; path: string; icon: any }[];
  isMobileMenuOpen: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  handleLogout: () => void;
  title: string;
  subtitle: string;
}

export function Sidebar({ 
  navItems, 
  isMobileMenuOpen, 
  isDarkMode, 
  toggleDarkMode, 
  handleLogout,
  title,
  subtitle
}: SidebarProps) {
  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
      isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="hidden md:flex flex-col items-center justify-center p-6 bg-primary text-white">
        <ShieldAlert className="w-10 h-10 text-accent mb-2" />
        <h1 className="text-center font-bold leading-tight">
          {title}<br/>
          <span className="font-normal text-sm opacity-80">{subtitle}</span>
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3 mt-4 md:mt-0">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.split('/').length <= 2} // Exact match for root dashboards
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light" 
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <button 
          onClick={toggleDarkMode}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-status-error hover:bg-status-error/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
