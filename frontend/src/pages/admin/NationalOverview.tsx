import { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle2, AlertTriangle, MapPin, TrendingUp, Map } from 'lucide-react';
import { MetricCard } from '../../components/MetricCard';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function NationalOverview() {
  const [data, setData] = useState<any>(null);
  const [scope, setScope] = useState('All India');
  
  useEffect(() => {
    const fetchOverview = () => {
      fetch(`http://localhost:3001/api/admin/overview?scope=${scope}`)
        .then(res => res.json())
        .then(setData)
        .catch(console.error);
    };

    fetchOverview();

    const handleScopeChange = (e: any) => {
      setScope(e.detail);
    };
    
    window.addEventListener('admin-scope-changed', handleScopeChange);
    return () => window.removeEventListener('admin-scope-changed', handleScopeChange);
  }, [scope]);

  const trendData = [
    { month: 'Apr', rate: 75 }, { month: 'May', rate: 78 }, { month: 'Jun', rate: 76 }, 
    { month: 'Jul', rate: 82 }, { month: 'Aug', rate: 85 }, { month: 'Sep', rate: 83 }
  ];

  if (!data) return (
    <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium">Loading national overview...</p>
      </div>
    </div>
  );


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">National Compliance Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">Viewing aggregated data for: {scope}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Scans (National)" 
          value={data.totalScans.toLocaleString()} 
          trend="up" 
          trendValue="18%" 
          icon={<FileText className="w-5 h-5" />} 
        />
        <MetricCard 
          title="Total Violations" 
          value={data.violations.toLocaleString()} 
          trend="down" 
          trendValue="2%" 
          icon={<AlertTriangle className="w-5 h-5 text-status-error" />} 
        />
        <MetricCard 
          title="National Compliance" 
          value={`${data.complianceRate}%`} 
          trend="up" 
          trendValue="4%" 
          icon={<CheckCircle2 className="w-5 h-5 text-status-success" />} 
        />
        <MetricCard 
          title="Central Registrations" 
          value={data.activeRegistrations.toLocaleString()} 
          trend="up" 
          trendValue="120" 
          icon={<Users className="w-5 h-5" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* State Comparison Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-slate-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">State-wise Compliance Rate</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stateData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'var(--tw-colors-slate-800)' }} />
                <Bar dataKey="complianceRate" radius={[4, 4, 0, 0]}>
                  {data.stateData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill="#0B3D91" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6-Month Trend */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-slate-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">6-Month Trend</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} hide />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'var(--tw-colors-slate-800)' }} />
                <Line type="monotone" dataKey="rate" stroke="#FF9933" strokeWidth={3} dot={{ r: 4, fill: '#FF9933' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Choropleth Map Placeholder */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col h-96 relative">
           <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 z-10">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Map className="w-5 h-5 text-slate-500" />
              National Enforcement Density Map
            </h3>
          </div>
          <div className="flex-1 bg-slate-100 dark:bg-slate-700 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #FF9933 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
             
             {/* Mock SVG India Outline Placeholder */}
             <svg viewBox="0 0 100 100" className="absolute w-3/4 h-3/4 opacity-30 text-primary animate-pulse">
                <path fill="currentColor" d="M50 0 C 70 20, 80 50, 70 80 C 50 100, 30 100, 20 80 C 10 50, 30 20, 50 0 Z" />
             </svg>
             
             <p className="text-slate-500 dark:text-slate-400 font-medium z-10 bg-white/90 dark:bg-slate-800/90 px-6 py-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 backdrop-blur-sm">
               Interactive Choropleth Map Placeholder<br/>
               <span className="text-sm font-normal">(Darker regions = Higher violation density)</span>
             </p>

             <MapPin className="absolute top-1/3 left-1/3 w-8 h-8 text-status-error drop-shadow-lg" />
             <MapPin className="absolute bottom-1/4 right-1/3 w-6 h-6 text-status-warning drop-shadow-lg" />
             <MapPin className="absolute top-1/2 right-1/4 w-10 h-10 text-status-success drop-shadow-lg" />
          </div>
        </div>

      </div>
    </div>
  );
}
