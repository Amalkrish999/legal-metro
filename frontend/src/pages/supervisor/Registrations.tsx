import { useState, useEffect } from 'react';
import { DataTable } from '../../components/DataTable';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Registrations() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    fetch('http://localhost:3001/api/supervisory/registrations', {
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
    { key: 'companyName', header: 'Company Name' },
    { key: 'regNo', header: 'Registration No.' },
    { key: 'type', header: 'Entity Type' },
    { key: 'district', header: 'District' },
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
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Registration Oversight (Rule 27)</h1>
        <p className="text-slate-500 dark:text-slate-400">View registered manufacturers, packers, and importers.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
         <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by company or reg no..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
        {isLoading ? (
           <div className="p-8 text-center">Loading registrations...</div>
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
