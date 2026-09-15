import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, Download, ArrowLeft, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import html2pdf from 'html2pdf.js';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function ReportPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [scan, setScan] = useState<any>(null);
  const [escalate, setEscalate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3001/api/scans/${id}`, {
      headers: { 'Authorization': `Bearer ${user?.token}` }
    })
      .then(res => res.json())
      .then(data => {
        // CHECKPOINT 3: Log what the Report page received
        console.log('Report page received:', JSON.stringify({
          id: data.id,
          productName: data.productName,
          manufacturer: data.manufacturer,
          verdict: data.verdict,
          status: data.status,
          ruleResults: data.ruleResults,
          violations: data.violations,
          imageUrl: data.imageUrl ? 'image present' : 'NO IMAGE'
        }, null, 2));
        setScan({
          ...data,
          ruleResults: data.ruleResults ? JSON.parse(data.ruleResults) : [],
          auditLog: data.auditLog ? JSON.parse(data.auditLog) : []
        });
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [id, user?.token]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading report...</div>;
  }

  if (!scan) {
    return <div className="p-8 text-center text-status-error">Report not found.</div>;
  }

  const handlePrint = () => {
    console.log('Generate Report clicked');
    console.log('Report data being used:', JSON.stringify(scan, null, 2));

    const element = document.getElementById('report-content');

    console.log('Target element exists:', !!element);
    console.log('Element height/width:', element?.offsetHeight, element?.offsetWidth);

    if (!element) {
      console.error("Error: Element 'report-content' not found in DOM.");
      return;
    }

    const opt = {
      margin:       10,
      filename:     `LMO-Report-${String(scan.id).padStart(5, '0')}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: true },
      jsPDF:        { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
    toast('PDF download started!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between no-print mb-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Save Draft
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            Generate PDF
          </button>
          <button 
            onClick={async () => {
              console.log('Submit for Review clicked');
              setIsSubmitting(true);
              try {
                const nextStatus = scan.verdict === 'Compliant' ? 'closed_compliant' : 'pending_review';
                await fetch(`http://localhost:3001/api/scans/${id}/status`, {
                  method: 'PUT',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                  },
                  body: JSON.stringify({ status: nextStatus })
                });
                setScan({ ...scan, status: nextStatus });
                toast(nextStatus === 'closed_compliant' ? 'Scan automatically closed as Compliant.' : 'Scan submitted for review successfully!', 'success');
              } catch (e) {
                console.error("Failed to submit", e);
                toast('Failed to process. Please try again.', 'error');
              }
              setIsSubmitting(false);
            }}
            disabled={isSubmitting || scan.status === 'pending_review' || scan.status === 'closed_compliant' || scan.status === 'Pending' || scan.status === 'Review'}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            {isSubmitting ? 'Processing...' : (scan.status === 'pending_review' || scan.status === 'closed_compliant' || scan.status === 'Pending' || scan.status === 'Review') ? 'Submitted ✓' : 'Submit for Review'}
          </button>
        </div>
      </div>

      {/* The Printable Report */}
      {scan.status === 'returned_for_correction' && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm text-amber-900 mb-6 no-print">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-800">Returned for Correction</h3>
              <p className="mt-1">A supervisor has returned this report. Please address the feedback below and resubmit.</p>
              {scan.auditLog && scan.auditLog.length > 0 && scan.auditLog.filter((l: any) => l.action === 'return').pop() && (
                <div className="mt-3 p-3 bg-white/60 rounded border border-amber-200/50">
                  <p className="text-sm font-medium">Reviewer Remarks:</p>
                  <p className="text-sm mt-1">{scan.auditLog.filter((l: any) => l.action === 'return').pop().remarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div id="report-content" className="bg-white text-black p-4">
          
          {/* Report Header */}
          <div className="p-4 border-b border-gray-200 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <ShieldAlert className="w-12 h-12 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-black uppercase tracking-wide">
                  Inspection Report
                </h1>
                <p className="text-gray-600 font-medium">Department of Consumer Affairs, Legal Metrology</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p><strong>Report ID:</strong> LMO-DL-{String(scan.id).padStart(5, '0')}</p>
              <p><strong>Date:</strong> {scan.timestamp ? format(parseISO(scan.timestamp), 'dd MMM yyyy') : 'N/A'}</p>
              <p><strong>Time:</strong> {scan.timestamp ? format(parseISO(scan.timestamp), 'h:mm a') : 'N/A'}</p>
            </div>
          </div>

          <div className="p-4 space-y-8">
            
            {/* Verdict Banner */}
            <div className={`p-4 rounded-lg flex items-center gap-3 border ${
              scan.verdict === 'Compliant' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {scan.verdict === 'Compliant' ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              <span className="font-bold text-lg">VERDICT: {(scan.verdict || 'Unknown').toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-2 gap-8">
              
              {/* Product & Inspection Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-black border-b border-gray-200 pb-2 mb-4">
                    Inspection Details
                  </h3>
                  <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-100">
                    <tr><td className="py-2 font-medium w-1/3">Officer Name:</td><td className="py-2 text-gray-800">{user?.name || scan.inspectorId || 'N/A'}</td></tr>
                    <tr><td className="py-2 font-medium">Officer ID:</td><td className="py-2 text-gray-800">{user?.officerId || scan.inspectorId || 'N/A'}</td></tr>
                    <tr><td className="py-2 font-medium">Product:</td><td className="py-2 text-gray-800">{scan.productName || 'N/A'}</td></tr>
                    <tr><td className="py-2 font-medium">Location:</td><td className="py-2 text-gray-800">{scan.location}</td></tr>
                    <tr><td className="py-2 font-medium">Product Category:</td><td className="py-2 text-gray-800">Packaged Commodity</td></tr>
                  </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-black border-b border-gray-200 pb-2 mb-4">
                    Extracted Package Data
                  </h3>
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      <tr className="border-b border-gray-100"><td className="py-2 font-medium w-1/2">Manufacturer:</td><td className="py-2">{scan.manufacturer || 'N/A'}</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2 font-medium">Net Quantity:</td><td className="py-2">{scan.netQuantity || 'N/A'}</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2 font-medium">MRP:</td><td className="py-2">{scan.mrp || 'N/A'}</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2 font-medium">Mfg Date:</td><td className="py-2">{scan.mfgDate || 'N/A'}</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2 font-medium">Customer Care:</td><td className="py-2">{scan.customerCare || 'N/A'}</td></tr>
                    </tbody>
                  </table>
                </div>

                {scan.ruleResults && scan.ruleResults.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-black border-b border-gray-200 pb-2 mb-4">
                      Compliance Checklist
                    </h3>
                    <ul className="space-y-2">
                      {scan.ruleResults.map((r: any, i: number) => (
                        <li key={i} className={`flex items-start gap-3 p-2 rounded-lg text-sm ${
                          r.status === 'pass' ? 'bg-green-50' : 'bg-red-50'
                        }`}>
                          <span className={`mt-0.5 font-bold shrink-0 ${
                            r.status === 'pass' ? 'text-green-600' : 'text-red-600'
                          }`}>{r.status === 'pass' ? '✓' : '✗'}</span>
                          <div>
                            <p className={`font-medium ${
                              r.status === 'pass' ? 'text-green-800' : 'text-red-800'
                            }`}>{r.name}</p>
                            {r.status !== 'pass' && <p className="text-gray-600 text-xs mt-0.5">{r.note}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Feature 1: Quantity Verification Display */}
                {scan.quantityVerified === 1 || scan.quantityVerified === true ? (
                  <div>
                    <h3 className="text-lg font-bold text-black border-b border-gray-200 pb-2 mb-4">
                      Physical Verification
                    </h3>
                    <div className={`p-3 rounded-lg border ${scan.quantityPassed === 1 || scan.quantityPassed === true ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <table className="w-full text-sm border-collapse">
                        <tbody>
                          <tr><td className="py-1 font-medium w-1/2">Declared Quantity:</td><td className="py-1">{scan.netQuantity}</td></tr>
                          <tr><td className="py-1 font-medium">Measured Quantity:</td><td className="py-1">{scan.measuredQuantity}</td></tr>
                          <tr><td className="py-1 font-medium text-gray-800 mt-2 block">Status:</td><td className="py-1 mt-2 block font-bold">{scan.quantityPassed === 1 || scan.quantityPassed === true ? 'Within tolerance (Pass)' : 'Outside tolerance (Fail)'}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </div>

            {/* Evidence & Violations */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-black border-b border-gray-200 pb-2 mb-4">
                  Evidence
                </h3>
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
                  <h3 className="text-lg font-bold text-red-600 border-b border-red-200 pb-2 mb-4">
                    Violations Identified
                  </h3>
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
            </div>
          </div>
          
          {/* Notes & Actions */}
          <div className="pt-6 border-t border-gray-200 space-y-4">
            <h3 className="text-lg font-bold text-black">Officer Remarks</h3>
            
            <div className="space-y-4">
              {/* Feature 4: Observations Display */}
              <div className="w-full p-4 rounded-lg border border-gray-300 bg-gray-50 text-black min-h-[100px] whitespace-pre-wrap">
                {scan.observations || "No additional remarks or observations provided."}
              </div>
              
              <div className="no-print flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Escalate to Controller</h4>
                  <p className="text-sm text-slate-500">Mark this report for immediate senior review.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={escalate} onChange={() => setEscalate(!escalate)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-status-error"></div>
                </label>
              </div>
            </div>

            <div className="hidden print:flex justify-between mt-16 pt-8 border-t border-black px-8">
              <div className="text-center">
                <div className="w-40 border-b border-black mb-2"></div>
                <p className="font-bold">Inspector Signature</p>
                <p className="text-sm">{user?.name || 'Inspector'}</p>
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-black mb-2"></div>
                <p className="font-bold">Date &amp; Seal</p>
              </div>
            </div>
          </div>

        </div>
        </div>
      </div>
    </div>
  );
}
