import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ScanLine, 
  History, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart3 
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function Dashboard() {
  const navigate = useNavigate();
  const [scans, setScans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    fetch('http://localhost:3001/api/scans', {
      headers: {
        'Authorization': `Bearer ${user?.token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setScans(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch scans", err);
        setIsLoading(false);
      });
  }, []);

  const recentScans = scans.slice(0, 5);

  // Compute real metrics from fetched scans
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const scansToday = scans.filter(s => new Date(s.timestamp) >= todayStart).length;
  const violationsTotal = scans.filter(s => s.verdict === 'Non-compliant' || s.status === 'Violation').length;
  const complianceRate = scans.length > 0 
    ? Math.round(((scans.length - violationsTotal) / scans.length) * 100) 
    : 0;
  const pendingReports = scans.filter(s => s.status === 'Pending' || s.status === 'Review').length;

  // Build violation chart from last 7 days of real data
  const violationData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd   = new Date(dayStart.getTime() + 86400000);
    return {
      name: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      violations: scans.filter(s => {
        const ts = new Date(s.timestamp);
        return ts >= dayStart && ts < dayEnd && (s.verdict === 'Non-compliant' || s.status === 'Violation');
      }).length
    };
  });

  const columns = [
    { key: 'productName', header: 'Product' },
    { key: 'location', header: 'Location' },
    { 
      key: 'timestamp', 
      header: 'Date & Time',
      render: (val: string) => {
        try {
          return format(parseISO(val), 'MMM d, yyyy h:mm a');
        } catch(e) {
          return val;
        }
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (val: string) => <StatusBadge status={val} />
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, {user?.name || 'Officer'}. Here's your summary for today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/inspector-dashboard/history')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200"
          >
            <History className="w-4 h-4" />
            View History
          </button>
          <button 
            onClick={() => navigate('/inspector-dashboard/scan')}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            <ScanLine className="w-4 h-4" />
            Scan New Product
          </button>
        </div>
      </div>

      {/* Metrics — computed from real backend data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Scans Today" 
          value={isLoading ? '—' : scansToday} 
          trend="up" 
          trendValue="" 
          icon={<ScanLine className="w-5 h-5" />} 
        />
        <MetricCard 
          title="Violations Found" 
          value={isLoading ? '—' : violationsTotal} 
          trend={violationsTotal > 0 ? 'up' : 'down'} 
          trendValue="" 
          icon={<AlertTriangle className="w-5 h-5 text-status-error" />} 
        />
        <MetricCard 
          title="Compliance Rate" 
          value={isLoading ? '—' : `${complianceRate}%`} 
          trend={complianceRate >= 80 ? 'up' : 'down'} 
          trendValue="" 
          icon={<CheckCircle2 className="w-5 h-5 text-status-success" />} 
        />
        <MetricCard 
          title="Pending Reports" 
          value={isLoading ? '—' : pendingReports} 
          trend="neutral" 
          trendValue="" 
          icon={<FileText className="w-5 h-5" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-500" />
              Violations This Week
            </h3>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={violationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-colors-slate-800)' }}
                />
                <Bar dataKey="violations" radius={[4, 4, 0, 0]}>
                  {violationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.violations > 5 ? '#EF4444' : '#FF9933'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Scans */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Recent Scans</h3>
            <button 
              onClick={() => navigate('/inspector-dashboard/history')}
              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              View All
            </button>
          </div>
          <div className="flex-1 p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <DataTable 
                columns={columns} 
                data={recentScans} 
                onRowClick={(row) => navigate(`/inspector-dashboard/report/${row.id}`)}
                className="border-0 rounded-none shadow-none"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
