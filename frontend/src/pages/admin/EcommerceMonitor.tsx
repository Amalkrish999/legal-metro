import { useState, useEffect } from 'react';
import { DataTable } from '../../components/DataTable';
import { Search, MapPin, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function EcommerceMonitor() {
  const [violations, setViolations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    fetch('http://localhost:3001/api/admin/ecommerce', {
      headers: { 'Authorization': `Bearer ${user?.token}` }
    })
      .then(res => res.json())
      .then(data => {
        setViolations(data);
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);

  const columns = [
    { key: 'platform', header: 'Platform' },
    { key: 'product', header: 'Product Listing' },
    { key: 'seller', header: 'Seller Details' },
    { key: 'violationType', header: 'Violation Type' },
    { 
      key: 'isCrossState', 
      header: 'Cross-State',
      render: (val: boolean) => val ? (
        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
          <MapPin className="w-3 h-3" /> Yes
        </span>
      ) : (
        <span className="text-xs font-medium text-slate-500">No</span>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (val: string) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
          val === 'Resolved' ? 'bg-green-100 text-green-800 border-green-200' : 
          val === 'Pending' ? 'bg-red-100 text-red-800 border-red-200' :
          'bg-blue-100 text-blue-800 border-blue-200'
        }`}>
          {val}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Action',
      render: (_: any, row: any) => row.status === 'Pending' ? (
        <button className="flex items-center gap-1 text-primary hover:text-primary-dark text-sm font-medium">
          <Send className="w-3.5 h-3.5" /> Forward
        </button>
      ) : <span className="text-slate-400 text-sm">-</span>
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">E-Commerce & Cross-State Monitor</h1>
        <p className="text-slate-500 dark:text-slate-400">Track and forward digital compliance violations.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
         <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search platform or seller..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
        {isLoading ? (
           <div className="p-8 text-center">Loading e-commerce violations...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={violations} 
            className="border-0 shadow-none rounded-none"
          />
        )}
      </div>
    </div>
  );
}
