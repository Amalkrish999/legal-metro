import { useState, useEffect } from 'react';
import { DataTable } from '../../components/DataTable';
import { Search, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Enforcements() {
  const [enforcements, setEnforcements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    fetch('http://localhost:3001/api/supervisory/enforcements', {
      headers: { 'Authorization': `Bearer ${user?.token}` }
    })
      .then(res => res.json())
      .then(data => {
        setEnforcements(data);
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);

  const columns = [
    { key: 'companyName', header: 'Entity Name' },
    { key: 'violationType', header: 'Violation Type' },
    { key: 'noticeDate', header: 'Notice Date', render: (val: string) => val ? new Date(val).toLocaleDateString() : 'N/A' },
    { key: 'remarks', header: 'Remarks' },
    { 
      key: 'status', 
      header: 'Status',
      render: (val: string) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
          val === 'Closed' ? 'bg-slate-100 text-slate-600 border-slate-200' : 
          val === 'Issued' ? 'bg-blue-100 text-blue-800 border-blue-200' :
          'bg-amber-100 text-amber-800 border-amber-200'
        }`}>
          {val}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Enforcement Actions</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage notices, penalties, and prosecutions.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> Issue New Notice
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
         <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by company or violation type..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
        {isLoading ? (
           <div className="p-8 text-center">Loading enforcement actions...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={enforcements} 
            className="border-0 shadow-none rounded-none"
          />
        )}
      </div>
    </div>
  );
}
