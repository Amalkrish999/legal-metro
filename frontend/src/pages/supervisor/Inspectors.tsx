import { useState, useEffect } from 'react';
import { Search, Download, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../../components/DataTable';

export function Inspectors() {
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInspector, setSelectedInspector] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (!user?.token) return;
    fetch(`http://localhost:3001/api/supervisory/inspectors/performance?scope=${encodeURIComponent(user?.scope || '')}`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setInspectors(data);
        setIsLoading(false);
      })
      .catch(console.error);
  }, [user]);

  const loadInspectorHistory = (inspector: any) => {
    setSelectedInspector(inspector);
    setHistoryLoading(true);
    // Fetch all history and filter by this inspector
    // In a real app we'd have a specific endpoint for this
    if (!user?.token) return;
    fetch(`http://localhost:3001/api/supervisory/pending-reviews?scope=${encodeURIComponent(user?.scope || '')}`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        // Since we are mocking, we just query pending and maybe the DB has more. 
        // For accurate history, we should fetch ALL scans for this inspector.
        // As a workaround for this demo, we'll fetch from standard scans endpoint if it exists or just use a mock array
      })
      .catch(console.error)
      .finally(() => setHistoryLoading(false));
  };

  const filtered = inspectors.filter(i => 
    i.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.inspectorId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'name', header: 'Inspector Name' },
    { key: 'inspectorId', header: 'Officer ID' },
    { key: 'totalScans', header: 'Total Scans' },
    { key: 'pendingReviews', header: 'Pending Reviews', render: (val: number) => val > 0 ? <span className="text-amber-600 font-bold">{val}</span> : val },
    { key: 'approvedCount', header: 'Approved', render: (val: number) => <span className="text-status-success font-medium">{val}</span> },
    { key: 'rejectedCount', header: 'Rejected', render: (val: number) => <span className="text-status-error font-medium">{val}</span> },
    { key: 'avgTurnaround', header: 'Avg Turnaround' }
  ];

  if (selectedInspector) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inspector History: {selectedInspector.name}</h1>
            <p className="text-slate-500 dark:text-slate-400">{selectedInspector.inspectorId} • Activity Log</p>
          </div>
          <button onClick={() => setSelectedInspector(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-8 text-center text-slate-500">
            {historyLoading ? 'Loading history...' : 'History view requires full scans endpoint integration. Displaying aggregate view.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inspector Performance</h1>
          <p className="text-slate-500 dark:text-slate-400">Track and monitor officers in your jurisdiction.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 transition-colors">
          <Download className="w-4 h-4" /> Export Roster
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">Loading performance data...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filtered} 
            onRowClick={loadInspectorHistory}
            className="border-0 shadow-none rounded-none"
          />
        )}
      </div>
    </div>
  );
}
