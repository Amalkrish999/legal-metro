import { useState, useEffect } from 'react';
import { FileText, Plus, BellRing } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../../components/DataTable';

export function PolicyManager() {
  const [circulars, setCirculars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    fetch('http://localhost:3001/api/admin/circulars', {
      headers: { 'Authorization': `Bearer ${user?.token}` }
    })
      .then(res => res.json())
      .then(data => {
        setCirculars(data);
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);

  const columns = [
    { key: 'title', header: 'Circular / Notification Title' },
    { key: 'date', header: 'Issue Date', render: (val: string) => new Date(val).toLocaleDateString() },
    { key: 'applicableStates', header: 'Applicable Scope' },
    {
      key: 'actions',
      header: 'Document',
      render: () => (
        <a href="#" className="flex items-center gap-1 text-primary hover:text-primary-dark text-sm font-medium">
          <FileText className="w-4 h-4" /> View PDF
        </a>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Policy & Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage central circulars and rule amendments.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> Issue New Circular
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
             <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
               <BellRing className="w-5 h-5 text-slate-500" /> Issued Circulars
             </h2>
          </div>
          {isLoading ? (
             <div className="p-8 text-center">Loading circulars...</div>
          ) : (
            <DataTable 
              columns={columns} 
              data={circulars} 
              className="border-0 shadow-none rounded-none"
            />
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="font-bold text-lg border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 text-slate-900 dark:text-white">Quick Issue</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary" placeholder="Enter circular title" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Scope</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary">
                    <option>All India</option>
                    <option>North Zone</option>
                    <option>South Zone</option>
                  </select>
               </div>
               <button className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium py-2 rounded-lg transition-colors">
                 Generate Preview
               </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
