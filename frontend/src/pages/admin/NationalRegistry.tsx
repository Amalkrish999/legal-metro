import { useState, useEffect } from 'react';
import { DataTable } from '../../components/DataTable';
import { Search, Globe, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function NationalRegistry() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    fetch('http://localhost:3001/api/admin/registrations', {
      headers: { 'Authorization': `Bearer ${user?.token}` }
    })
      .then(res => res.json())
      .then(data => {
        setRegistrations(data);
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);

  const columns = [
    { key: 'companyName', header: 'Entity Name' },
    { key: 'regNo', header: 'Registration No.' },
    { 
      key: 'type', 
      header: 'Category',
      render: (val: string) => (
        <span className="flex items-center gap-1.5 font-medium">
          {val === 'Importer' && <Globe className="w-3.5 h-3.5 text-primary" />}
          {val}
        </span>
      )
    },
    { key: 'district', header: 'State/District' },
    { 
      key: 'status', 
      header: 'Status',
      render: (val: string) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
          val === 'Active' ? 'bg-green-100 text-green-800 border-green-200' : 
          val === 'Expired' ? 'bg-red-100 text-red-800 border-red-200' :
          'bg-amber-100 text-amber-800 border-amber-200'
        }`}>
          {val}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: any) => row.status === 'Under Review' ? (
        <button className="flex items-center gap-1 px-3 py-1 bg-primary text-white rounded text-xs font-medium hover:bg-primary-dark">
          <CheckCircle2 className="w-3 h-3" /> Review
        </button>
      ) : (
        <button className="text-slate-400 hover:text-primary text-sm font-medium">View</button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">National Registry (Rule 27)</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage central registrations with a focus on Importers.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
         <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search registry..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 font-medium">Filter:</span>
            <select className="bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none">
               <option value="all">All Types</option>
               <option value="importers">Importers Only</option>
               <option value="pending">Pending Approval</option>
            </select>
          </div>
        </div>
        {isLoading ? (
           <div className="p-8 text-center">Loading registry...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={registrations} 
            className="border-0 shadow-none rounded-none"
          />
        )}
      </div>
    </div>
  );
}
