import { useState, useEffect } from 'react';
import { DataTable } from '../../components/DataTable';
import { Search, Download, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function StatePerformance() {
  const [states, setStates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetch('http://localhost:3001/api/admin/states', {
      headers: { 'Authorization': `Bearer ${user?.token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStates(data);
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);

  const filtered = states.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.controllerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'name', header: 'State / UT' },
    { key: 'controllerName', header: 'Controller' },
    { key: 'scansDone', header: 'Total Scans', render: (val: number) => val.toLocaleString() },
    { key: 'violationsFound', header: 'Violations Found', render: (val: number) => val.toLocaleString() },
    { 
      key: 'complianceRate', 
      header: 'Compliance Rate',
      render: (val: number) => (
        <div className="flex items-center gap-2">
          <span className={`font-medium ${val >= 85 ? 'text-status-success' : 'text-status-warning'}`}>{val}%</span>
          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
             <div className={`h-full ${val >= 85 ? 'bg-status-success' : 'bg-status-warning'}`} style={{ width: `${val}%` }} />
          </div>
        </div>
      )
    },
    { key: 'lastUpdated', header: 'Last Data Sync', render: (val: string) => new Date(val).toLocaleDateString() },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <button 
          onClick={(e) => { e.stopPropagation(); navigate('/admin'); }} 
          className="flex items-center gap-1 text-primary hover:text-primary-dark text-sm font-medium"
        >
          View Dashboard <ArrowRight className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">State Performance</h1>
          <p className="text-slate-500 dark:text-slate-400">Monitor and compare compliance metrics across all states and UTs.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 transition-colors">
          <Download className="w-4 h-4" /> Export Data
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by state or controller name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">Loading states...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filtered} 
            onRowClick={() => navigate('/admin')}
            className="border-0 shadow-none rounded-none"
          />
        )}
      </div>
    </div>
  );
}
