import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Building2, 
  ShoppingCart, 
  FileSignature,
  FileText,
  LogOut, 
  Menu,
  X,
  ShieldAlert,
  Moon,
  Sun,
  MapPin
} from 'lucide-react';
import { cn } from '../lib/utils';

import { useAuth } from '../context/AuthContext';

export function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const navItems = [
    { name: 'National Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'State Performance', path: '/admin/states', icon: Map },
    { name: 'National Registry', path: '/admin/registrations', icon: Building2 },
    { name: 'E-Commerce Monitor', path: '/admin/ecommerce', icon: ShoppingCart },
    { name: 'Policy Manager', path: '/admin/policy', icon: FileSignature },
    { name: 'National Reports', path: '/admin/reports', icon: FileText },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-primary text-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-accent" />
          <span className="font-semibold text-lg">Central Admin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Desktop & Mobile */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="hidden md:flex flex-col items-center justify-center p-6 bg-primary text-white">
          <ShieldAlert className="w-10 h-10 text-accent mb-2" />
          <h1 className="text-center font-bold leading-tight">
            Central Admin<br/>
            <span className="font-normal text-sm opacity-80">Legal Metrology</span>
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3 mt-4 md:mt-0">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 md:min-h-screen overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
          
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 shadow-sm">
            <MapPin className="w-4 h-4 text-primary dark:text-primary-light" />
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Viewing as:</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white px-2">
              {user?.role} — {user?.scope}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name || 'Director'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role || 'Admin'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-primary font-bold shadow-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
