import { MapPin, Menu, ShieldAlert, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopHeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
  mobileTitle: string;
}

export function TopHeader({ isMobileMenuOpen, setIsMobileMenuOpen, mobileTitle }: TopHeaderProps) {
  const { user } = useAuth();
  
  // Default to Inspector if no user context
  const name = user?.name || 'Officer';
  const role = user?.role || 'Inspector';
  const scope = user?.scope || user?.officerId || 'Unknown Scope';
  const initial = name.charAt(0);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-primary text-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-accent" />
          <span className="font-semibold text-lg">{mobileTitle}</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
        
        {role !== 'Inspector' ? (
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 shadow-sm">
            <MapPin className="w-4 h-4 text-primary dark:text-primary-light" />
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Viewing as:</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white px-2">
              {role} — {scope}
            </span>
          </div>
        ) : (
          <div></div> // Empty div for flex-between spacing
        )}

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{role} {role === 'Inspector' ? scope : ''}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-primary font-bold shadow-sm">
            {initial}
          </div>
        </div>
      </header>
    </>
  );
}
