import { Download, FileText, PieChart, BarChart2 } from 'lucide-react';

export function NationalReports() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">National Analytics & Reports</h1>
        <p className="text-slate-500 dark:text-slate-400">Generate comprehensive national compliance reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Compliance Summary</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Detailed breakdown of national compliance rates by state, category, and violation severity.</p>
          
          <div className="space-y-4 mb-6">
            <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none">
              <option>This Quarter vs Last Quarter</option>
              <option>Year to Date</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark">
              <Download className="w-4 h-4" /> PDF Report
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Violation Trends</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Analysis of top recurring violations, targeted industries, and fine recovery metrics.</p>
          
          <div className="space-y-4 mb-6">
             <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none">
              <option>All Product Categories</option>
              <option>Food & Beverages</option>
              <option>Electronics</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600">
              <FileText className="w-4 h-4" /> Export CSV Raw Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
