import { Download, FileText } from 'lucide-react';

export function Reports() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400">Generate aggregated compliance reports.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 max-w-3xl">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Export Summary Report</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date Range</label>
            <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all">
              <option>Last 30 Days</option>
              <option>This Quarter</option>
              <option>This Year</option>
              <option>Custom Range...</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Product Category</label>
            <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all">
              <option>All Categories</option>
              <option>Food Products</option>
              <option>Electronics</option>
              <option>Cosmetics</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t border-slate-200 dark:border-slate-700 pt-6">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm transition-colors">
            <FileText className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
