import { useState, useEffect } from 'react';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { MetricCard } from '../../components/MetricCard';
import { Check, X, Undo2, AlertTriangle, Clock, ArrowLeft, ShieldAlert, CheckCircle2, History } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function CaseReview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [remarks, setRemarks] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [rejectReason, setRejectReason] = useState('Insufficient evidence');

  const fetchReviews = () => {
    if (!user?.token) return;
    fetch(`http://localhost:3001/api/supervisory/pending-reviews?scope=${encodeURIComponent(user?.scope || '')}&role=${encodeURIComponent(user?.role || '')}`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        // Calculate priority & overdue
        const processed = data.map((scan: any) => {
          const daysPending = differenceInDays(new Date(), parseISO(scan.timestamp));
          const isOverdue = daysPending > 3;
          
          let priority = 'Low';
          const ruleFails = scan.violations?.length || 0;
          if (ruleFails >= 3) priority = 'High';
          else if (ruleFails > 0) priority = 'Medium';
          
          return { ...scan, daysPending, isOverdue, priority };
        });
        
        // Sort High first
        processed.sort((a: any, b: any) => {
          const pVal = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return pVal[b.priority as keyof typeof pVal] - pVal[a.priority as keyof typeof pVal];
        });

        setReviews(processed);
        setIsLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchReviews();
  }, [user]);

  const handleAction = async (action: 'approve' | 'reject' | 'return' | 'escalate') => {
    if (!selectedScan) return;
    
    const reason = action === 'reject' ? `${rejectReason}: ${remarks}` : remarks;
    if ((action === 'reject' || action === 'return' || action === 'escalate') && !remarks && action !== 'reject') {
       toast('Please provide a reason in the remarks.', 'error');
       return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/supervisory/reviews/${selectedScan.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ 
          action, 
          reason, 
          reviewerId: user?.officerId,
          reviewerName: user?.name,
          reviewerRole: user?.role
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast(`Case ${action}d successfully.`, 'success');
      setSelectedScan(null);
      setRemarks('');
      fetchReviews();
    } catch (err) {
      console.error(err);
      toast('Failed to process review', 'error');
    }
  };

  const columns = [
    { key: 'priority', header: 'Priority', render: (val: string) => (
      <span className={`px-2 py-1 rounded text-xs font-bold ${
        val === 'High' ? 'bg-red-100 text-red-700' : 
        val === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
      }`}>{val}</span>
    )},
    { key: 'productName', header: 'Product' },
    { key: 'inspectorId', header: 'Inspector ID' },
    { key: 'verdict', header: 'Verdict', render: (val: string) => <span className={val === 'Compliant' ? 'text-status-success font-medium' : 'text-status-error font-medium'}>{val}</span> },
    { 
      key: 'timestamp', 
      header: 'Submitted',
      render: (val: string, row: any) => (
        <div className="flex items-center gap-2">
          {format(parseISO(val), 'MMM d, yyyy')}
          {row.isOverdue && <span className="flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase"><Clock className="w-3 h-3" /> Overdue</span>}
        </div>
      )
    },
    { key: 'status', header: 'Status', render: (val: string) => <StatusBadge status={val} /> }
  ];

  const displayedReviews = filterOverdue ? reviews.filter(r => r.isOverdue) : reviews;
  const overdueCount = reviews.filter(r => r.isOverdue).length;

  if (selectedScan) {
    const scan = selectedScan;
    const shouldSuggestEscalation = scan.priority === 'High' || (scan.violations && scan.violations.length >= 2);
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedScan(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Queue
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Embedded ReportPreview Layout (Read Only) */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-white text-black p-4">
                <div className="p-4 border-b border-gray-200 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <ShieldAlert className="w-12 h-12 text-primary" />
                    <div>
                      <h1 className="text-2xl font-bold text-black uppercase tracking-wide">Inspection Report</h1>
                      <p className="text-gray-600 font-medium">Department of Consumer Affairs, Legal Metrology</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p><strong>Report ID:</strong> LMO-DL-{String(scan.id).padStart(5, '0')}</p>
                    <p><strong>Date:</strong> {scan.timestamp ? format(parseISO(scan.timestamp), 'dd MMM yyyy') : 'N/A'}</p>
                  </div>
                </div>

                <div className="p-4 space-y-8">
                  <div className={`p-4 rounded-lg flex items-center gap-3 border ${
                    scan.verdict === 'Compliant' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    {scan.verdict === 'Compliant' ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                    <span className="font-bold text-lg">VERDICT: {(scan.verdict || 'Unknown').toUpperCase()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-black border-b border-gray-200 pb-2 mb-4">Inspection Details</h3>
                        <table className="w-full text-sm">
                          <tbody className="divide-y divide-gray-100">
                            <tr><td className="py-2 font-medium w-1/3">Officer ID:</td><td className="py-2 text-gray-800">{scan.inspectorId || 'N/A'}</td></tr>
                            <tr><td className="py-2 font-medium">Product:</td><td className="py-2 text-gray-800">{scan.productName || 'N/A'}</td></tr>
                            <tr><td className="py-2 font-medium">Location:</td><td className="py-2 text-gray-800">{scan.location}</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-black border-b border-gray-200 pb-2 mb-4">Extracted Package Data</h3>
                        <table className="w-full text-sm border-collapse">
                          <tbody>
                            <tr className="border-b border-gray-100"><td className="py-2 font-medium w-1/2">Manufacturer:</td><td className="py-2">{scan.manufacturer || 'N/A'}</td></tr>
                            <tr className="border-b border-gray-100"><td className="py-2 font-medium">Net Quantity:</td><td className="py-2">{scan.netQuantity || 'N/A'}</td></tr>
                            <tr className="border-b border-gray-100"><td className="py-2 font-medium">MRP:</td><td className="py-2">{scan.mrp || 'N/A'}</td></tr>
                            <tr className="border-b border-gray-100"><td className="py-2 font-medium">Mfg Date:</td><td className="py-2">{scan.mfgDate || 'N/A'}</td></tr>
                          </tbody>
                        </table>
                      </div>
                      
                      {scan.ruleResults && scan.ruleResults.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold text-black border-b border-gray-200 pb-2 mb-4">Compliance Checklist</h3>
                          <ul className="space-y-2">
                            {scan.ruleResults.map((r: any, i: number) => (
                              <li key={i} className={`flex items-start gap-3 p-2 rounded-lg text-sm ${r.status === 'pass' ? 'bg-green-50' : 'bg-red-50'}`}>
                                <span className={`mt-0.5 font-bold shrink-0 ${r.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>{r.status === 'pass' ? '✓' : '✗'}</span>
                                <div>
                                  <p className={`font-medium ${r.status === 'pass' ? 'text-green-800' : 'text-red-800'}`}>{r.name}</p>
                                  {r.status !== 'pass' && <p className="text-gray-600 text-xs mt-0.5">{r.note}</p>}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-black border-b border-gray-200 pb-2 mb-4">Evidence</h3>
                        {scan.imageUrl ? (
                          <div className="rounded-lg border border-gray-200 overflow-hidden w-full max-h-[200px] bg-gray-100 flex items-center justify-center">
                            <img src={scan.imageUrl} alt="Evidence" className="h-full w-auto object-contain" />
                          </div>
                        ) : (
                          <div className="p-4 bg-gray-50 text-center text-gray-500 italic rounded-lg">No image attached</div>
                        )}
                      </div>

                      {scan.violations && scan.violations.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold text-red-600 border-b border-red-200 pb-2 mb-4">Violations Identified</h3>
                          <ul className="space-y-3">
                            {scan.violations.map((v: any, i: number) => (
                              <li key={i} className="bg-red-50 border border-red-100 p-3 rounded-lg">
                                <p className="font-bold text-sm text-red-600">{v.rule}</p>
                                <p className="text-sm text-gray-800">{v.description}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="text-lg font-bold text-black border-b border-gray-200 pb-2 mb-4">Officer Remarks</h3>
                        <div className="w-full p-4 rounded-lg border border-gray-300 bg-gray-50 text-black min-h-[80px] whitespace-pre-wrap">
                          {scan.observations || "No additional remarks or observations provided."}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Trail */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-lg border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-slate-500" /> Audit Trail
              </h3>
              <div className="space-y-4">
                {scan.auditLog && scan.auditLog.length > 0 ? scan.auditLog.map((log: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5" />
                      {idx !== scan.auditLog.length - 1 && <div className="w-px h-full bg-slate-200 dark:bg-slate-700 mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">{log.action}</p>
                      <p className="text-xs text-slate-500">
                        by {log.actor} • {format(parseISO(log.timestamp), 'MMM d, yyyy h:mm a')}
                      </p>
                      {log.remarks && <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-700">{log.remarks}</p>}
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-500">No audit trail available.</p>}
              </div>
            </div>

          </div>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4 sticky top-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Review Actions</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Reviewer Remarks</label>
                <textarea 
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white p-3 outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                  placeholder="Enter remarks for the inspector or record..."
                />
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button onClick={() => handleAction('approve')} className="flex items-center justify-center gap-2 py-3 bg-status-success text-white rounded-lg text-sm font-bold hover:bg-green-600 transition-colors shadow-sm">
                  <Check className="w-4 h-4" /> {scan.verdict === 'Non-compliant' ? 'Approve finding — confirm violation' : 'Approve Inspection'}
                </button>
                
                <div className="border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 p-3 rounded-lg flex flex-col gap-3">
                  <select 
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm p-2 outline-none"
                  >
                    <option value="Insufficient evidence">Insufficient evidence</option>
                    <option value="Incorrect assessment">Incorrect assessment</option>
                    <option value="Policy violation">Policy violation</option>
                    <option value="Other">Other</option>
                  </select>
                  <button onClick={() => handleAction('reject')} className="flex items-center justify-center gap-2 py-2 bg-status-error text-white rounded text-sm font-bold hover:bg-red-600 transition-colors shadow-sm">
                    <X className="w-4 h-4" /> Reject Verdict
                  </button>
                </div>
                
                <button onClick={() => handleAction('return')} className="flex items-center justify-center gap-2 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                  <Undo2 className="w-4 h-4" /> Return for Correction
                </button>
                
                {user?.role !== 'Controller' && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 mt-2 flex flex-col gap-2">
                    {shouldSuggestEscalation && (
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/30 p-2 rounded">
                        <AlertTriangle className="w-3 h-3 inline mr-1 -mt-0.5" />
                        This case involves 2+ prior or severe violations — consider escalating.
                      </p>
                    )}
                    <button onClick={() => handleAction('escalate')} className="flex items-center justify-center gap-2 py-2 bg-slate-800 text-white dark:bg-slate-900 border border-slate-900 text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors shadow-sm">
                      <AlertTriangle className="w-4 h-4" /> Escalate to Senior Officer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Case Review Queue</h1>
          <p className="text-slate-500 dark:text-slate-400">Review pending inspection reports submitted within your scope.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div onClick={() => setFilterOverdue(false)} className={`cursor-pointer transition-all ${!filterOverdue ? 'ring-2 ring-primary scale-[1.02]' : 'opacity-70 hover:opacity-100'}`}>
          <MetricCard 
            title="Total Pending" 
            value={reviews.length} 
            trend="neutral" trendValue="" icon={<Clock className="w-5 h-5 text-blue-500" />} 
          />
        </div>
        <div onClick={() => setFilterOverdue(true)} className={`cursor-pointer transition-all ${filterOverdue ? 'ring-2 ring-status-error scale-[1.02]' : 'opacity-70 hover:opacity-100'}`}>
          <MetricCard 
            title="Overdue (>3 days)" 
            value={overdueCount} 
            trend="neutral" trendValue="" icon={<AlertTriangle className="w-5 h-5 text-status-error" />} 
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
           <div className="p-8 text-center">Loading pending reviews...</div>
        ) : displayedReviews.length === 0 ? (
           <div className="p-8 text-center text-slate-500">No cases match your criteria.</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={displayedReviews} 
            onRowClick={(row) => setSelectedScan(row)}
            className="border-0 shadow-none rounded-none"
          />
        )}
      </div>
    </div>
  );
}
