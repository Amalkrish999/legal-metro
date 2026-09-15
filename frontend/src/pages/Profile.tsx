import { useState, useEffect } from 'react';
import { User, Mail, MapPin, BadgeCent, ShieldAlert, Moon, Sun, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Profile() {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Derive display values from auth context
  const displayName = user?.name || 'Unknown Officer';
  const displayId   = user?.officerId || 'N/A';
  const displayScope = user?.scope || (user?.district ? `${user.state}, ${user.district}` : user?.state || 'N/A');
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const emailHandle = displayId.toLowerCase().replace(/-/g, '.');

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Officer Profile</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your details and application settings.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-primary h-32 relative">
          <div className="absolute -bottom-12 left-8 w-24 h-24 bg-white dark:bg-slate-700 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center shadow-sm">
            <span className="text-3xl font-bold text-primary dark:text-white">{initials}</span>
          </div>
        </div>
        
        <div className="pt-16 p-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{displayName}</h2>
              <p className="text-slate-500 dark:text-slate-400">{user?.role || 'Legal Metrology Inspector'}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-success/10 text-status-success text-sm font-medium border border-status-success/20">
              <ShieldAlert className="w-4 h-4" />
              Active Duty
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-400">
                  <BadgeCent className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Officer ID</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{displayId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Jurisdiction</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{displayScope}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Official Email</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{emailHandle}@lmo.gov.in</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Reporting To</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Asst. Controller (South)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Application Settings</h3>
        
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-100 text-amber-600'}`}>
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Better visibility for outdoor field inspections.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={isDarkMode} onChange={toggleDarkMode} className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Push Notifications</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Receive alerts for escalated reports.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        </div>

      </div>

    </div>
  );
}
