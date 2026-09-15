import { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle2, AlertTriangle, MapPin, ListPlus } from 'lucide-react';
import { MetricCard } from '../../components/MetricCard';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function Overview() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [districtData, setDistrictData] = useState<any[]>([]);
  // Initialize scope from user context
  const [scope, setScope] = useState(user?.scope || 'Full State');
  
  useEffect(() => {
    if (!user?.token) return;

    const fetchOverview = () => {
      fetch(`http://localhost:3001/api/supervisory/overview?scope=${encodeURIComponent(scope)}&role=${encodeURIComponent(user?.role || '')}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          setData(data);
        })
        .catch(console.error);
        
      fetch(`http://localhost:3001/api/supervisory/districts/summary?scope=${encodeURIComponent(scope)}&role=${encodeURIComponent(user?.role || '')}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          setDistrictData(Array.isArray(data) ? data : []);
        })
        .catch(console.error);
    };

    fetchOverview();
  }, [scope, user]);

  if (!data) return <div className="p-8 text-center">Loading overview...</div>;

  const columns = [
    { key: 'inspectorId', header: 'Inspector ID' },
    { key: 'productName', header: 'Product' },
    { key: 'verdict', header: 'Verdict', render: (val: string) => <span className={val === 'Compliant' ? 'text-status-success font-medium' : 'text-status-error font-medium'}>{val}</span> },
    { 
      key: 'timestamp', 
      header: 'Submitted',
      render: (val: string) => {
        try { return format(parseISO(val), 'MMM d, yyyy h:mm a') } catch(e) { return val; }
      }
    },
    { key: 'status', header: 'Status', render: (val: string) => <StatusBadge status={val} /> }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Supervisory Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Aggregated enforcement metrics</p>
        </div>
        
        {/* Scope Selector Override for testing */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 px-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scope</label>
          <select 
            value={scope} 
            onChange={(e) => setScope(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none border-b border-slate-300 focus:border-primary pb-1"
          >
            <option value="Full State">Full State / All India</option>
            <option value="Tamil Nadu - Chennai">Tamil Nadu - Chennai</option>
            <option value="Tamil Nadu - Coimbatore">Tamil Nadu - Coimbatore</option>
            <option value="Delhi - South District">Delhi - South District</option>
            <option value="Haryana - Gurgaon District">Haryana - Gurgaon District</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard 
          title="Total Inspections" 
          value={data.totalScans} 
          trend="neutral" 
          trendValue="" 
          icon={<FileText className="w-5 h-5" />} 
        />
        <MetricCard 
          title="Pending Reviews" 
          value={data.pendingReviews} 
          trend="neutral" 
          trendValue="" 
          icon={<ListPlus className="w-5 h-5 text-amber-500" />} 
        />
        <MetricCard 
          title="Violations Found" 
          value={data.violations} 
          trend="neutral" 
          trendValue="" 
          icon={<AlertTriangle className="w-5 h-5 text-status-error" />} 
        />
        <MetricCard 
          title="Avg. Compliance" 
          value={`${data.complianceRate}%`} 
          trend="neutral" 
          trendValue="" 
          icon={<CheckCircle2 className="w-5 h-5 text-status-success" />} 
        />
        <MetricCard 
          title="Active Inspectors" 
          value={data.activeInspectors} 
          trend="neutral" 
          trendValue="" 
          icon={<Users className="w-5 h-5" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Submissions */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-slate-900 dark:text-white">Recent Submissions in Scope</h3>
            <p className="text-xs text-slate-500">Last 5 inspection reports</p>
          </div>
          <div className="flex-1 overflow-auto">
            {data.recentSubmissions && data.recentSubmissions.length > 0 ? (
              <DataTable 
                columns={columns} 
                data={data.recentSubmissions} 
                className="border-0 shadow-none rounded-none"
              />
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">No recent submissions found in this scope.</div>
            )}
          </div>
        </div>

        {/* Geographical Enforcement View */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-slate-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">District Enforcement</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">Activity by district. Districts below average highlighted.</p>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                <XAxis type="number" hide />
                <YAxis dataKey="district" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={85} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'var(--tw-colors-slate-800)' }} />
                <Bar dataKey="totalScans" radius={[0, 4, 4, 0]}>
                  {districtData.map((entry, index) => {
                    // Highlight if scans are very low (e.g., < 2)
                    const isLowActivity = entry.totalScans < 2;
                    return <Cell key={`cell-${index}`} fill={isLowActivity ? '#EF4444' : '#0B3D91'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
