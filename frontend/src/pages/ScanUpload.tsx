import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js';
import { UploadBox } from '../components/UploadBox';
import { StatusBadge } from '../components/StatusBadge';
import { CheckCircle2, AlertCircle, Save, ArrowRight, ScanLine, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { runComplianceCheck } from '../lib/ruleEngine';
import { parseOCRText } from '../lib/ocrParser';
import rules from '../config/rules.json';
import { format } from 'date-fns';

export function ScanUpload() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [images, setImages] = useState<File[]>([]);
  const [, setIsAnalyzing] = useState(false);
  
  const [extractionMode, setExtractionMode] = useState<'ocr' | 'demo'>('ocr');
  const [demoScenario, setDemoScenario] = useState('compliant');
  
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [rawOcrText, setRawOcrText] = useState('');
  const [showRawText, setShowRawText] = useState(false);

  const [extractedData, setExtractedData] = useState<Record<string, string>>({
    manufacturerName: '',
    manufacturerAddress: '',
    commodityName: '',
    netQuantity: '',
    mrp: '',
    mfgDate: '',
    bestBeforeDate: '',
    consumerCareDetails: '',
    countryOfOrigin: '',
    fontSizeMm: ''
  });

  // Feature 1: Net Quantity Verification
  const [quantityVerified, setQuantityVerified] = useState(false);
  const [measuredQuantity, setMeasuredQuantity] = useState('');

  // Feature 2: Location & Timestamp
  const [scanLocation, setScanLocation] = useState('');
  const [scanTimestamp, setScanTimestamp] = useState('');
  const [locationError, setLocationError] = useState(false);

  // Feature 3: Previous Inspection History
  const [searchBusiness, setSearchBusiness] = useState('');
  const [pastInspections, setPastInspections] = useState<any[]>([]);
  const [isSearchingHistory, setIsSearchingHistory] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Feature 4: Observations
  const [observations, setObservations] = useState('');

  // Feature 6: Image Quality
  const [showQualityWarning, setShowQualityWarning] = useState(false);
  const [qualityWarningText, setQualityWarningText] = useState('');

  const captureLocation = () => {
    setScanTimestamp(new Date().toISOString());
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setScanLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          setLocationError(false);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setLocationError(true);
        }
      );
    } else {
      setLocationError(true);
    }
  };

  const handleSearchHistory = async () => {
    if (!searchBusiness.trim()) return;
    setIsSearchingHistory(true);
    setHasSearched(true);
    try {
      const res = await fetch('http://localhost:3001/api/scans', {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      const filtered = data.filter((s: any) => 
        s.manufacturer?.toLowerCase().includes(searchBusiness.toLowerCase())
      );
      setPastInspections(filtered);
    } catch (err) {
      console.error(err);
      toast('Failed to search history', 'error');
    }
    setIsSearchingHistory(false);
  };

  const handleUpload = (files: File[]) => {
    setImages(files);
  };

  const checkImageQuality = async (file: File): Promise<{ isDark: boolean, isBlurry: boolean }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve({ isDark: false, isBlurry: false });
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let brightnessSum = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          brightnessSum += (data[i] + data[i+1] + data[i+2]) / 3;
        }
        const avgBrightness = brightnessSum / (data.length / 4);
        
        // Simple heuristic: if avg brightness < 60, it's very dark
        const isDark = avgBrightness < 60;
        resolve({ isDark, isBlurry: false }); // Skipping blur for now to keep it lightweight
      };
      img.onerror = () => resolve({ isDark: false, isBlurry: false });
      img.src = URL.createObjectURL(file);
    });
  };

  const startAnalysis = async () => {
    if (images.length === 0) return;
    captureLocation();

    if (extractionMode === 'ocr') {
      const quality = await checkImageQuality(images[0]);
      if (quality.isDark) {
        setQualityWarningText('This image looks dark. OCR results may be inaccurate.');
        setShowQualityWarning(true);
        return; // wait for user input
      }
    }
    proceedWithAnalysis();
  };

  const proceedWithAnalysis = async () => {
    setShowQualityWarning(false);
    setStep(2);
    setIsAnalyzing(true);
    setOcrProgress(0);
    setOcrStatus('');
    setRawOcrText('');
    
    if (extractionMode === 'demo') {
      setTimeout(() => {
        setIsAnalyzing(false);
        
        if (demoScenario === 'compliant') {
          setExtractedData({
            manufacturerName: 'Parle Products Pvt. Ltd.',
            manufacturerAddress: 'Mumbai, Maharashtra 400057',
            commodityName: 'Biscuits',
            netQuantity: '1 kg',
            mrp: '150.00',
            mfgDate: '10-2026',
            bestBeforeDate: '04-2027',
            consumerCareDetails: '1800-123-456',
            countryOfOrigin: 'India',
            fontSizeMm: '2.5'
          });
        } else if (demoScenario === 'nonCompliantMRPFont') {
          setExtractedData({
            manufacturerName: 'Parle Products Pvt. Ltd.',
            manufacturerAddress: 'Mumbai, Maharashtra 400057',
            commodityName: 'Biscuits',
            netQuantity: '1 kg',
            mrp: '0', 
            mfgDate: '10-2026',
            bestBeforeDate: '04-2027',
            consumerCareDetails: '1800-123-456',
            countryOfOrigin: 'India',
            fontSizeMm: '0.8' 
          });
        } else if (demoScenario === 'nonCompliantManufacturer') {
          setExtractedData({
            manufacturerName: '',
            manufacturerAddress: '',
            commodityName: 'Biscuits',
            netQuantity: '1 kg',
            mrp: '150.00',
            mfgDate: '10-2026',
            bestBeforeDate: '',
            consumerCareDetails: '1800-123-456',
            countryOfOrigin: 'India',
            fontSizeMm: '2.5'
          });
        }

        setStep(3);
      }, 1500);
    } else {
      // Live OCR Mode via Tesseract.js
      try {
        const imageFile = images[0]; 
        const worker = await Tesseract.createWorker('eng', 1, {
          workerPath: '/tesseract/worker.min.js',
          langPath: '/tesseract',
          corePath: '/tesseract/tesseract-core.wasm.js',
          logger: m => {
            console.log('[Tesseract Progress]', m.status, m.progress);
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.floor(m.progress * 100));
            }
            setOcrStatus(m.status);
          }
        });
        
        // Wrap recognize in a 30-second timeout using Promise.race
        const timeoutPromise = new Promise<{ data: { text: string } }>((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), 30000)
        );
        
        const { data: { text } } = await Promise.race([
          worker.recognize(imageFile),
          timeoutPromise
        ]);
        
        await worker.terminate();

        setRawOcrText(text);

        if (!text || text.trim().length < 5) {
          toast("Couldn't read the label clearly. Try a clearer photo or enter details manually.", 'error');
        } else {
          const parsed = parseOCRText(text);
          // fontSizeMm cannot be read from OCR — default to '2' (2mm) as per standard label requirement
          // Officer can manually correct this in the editable form
          const parsedWithFont = { ...parsed, fontSizeMm: parsed.fontSizeMm || '2' };
          setExtractedData(prev => ({
            ...prev,
            ...parsedWithFont
          }));

          toast("Text extracted successfully. Please review and correct fields.", 'info');
        }
        
        setIsAnalyzing(false);
        setStep(3);
      } catch (err: any) {
        console.error('[OCR Error]', err);
        if (err.message === 'TIMEOUT') {
          toast("OCR is taking too long. Check your connection or try demo mode.", 'error');
        } else {
          toast("OCR Processing failed. Please enter details manually.", 'error');
        }
        setIsAnalyzing(false);
        setStep(3);
      }
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setExtractedData(prev => ({ ...prev, [field]: value }));
  };


  const complianceResult = useMemo(() => {
    console.log('--- RAW OCR TEXT ---');
    console.log(rawOcrText);

    console.log('--- PARSED FIELD VALUES ---');
    console.log('manufacturerName:', extractedData.manufacturerName);
    console.log('manufacturerAddress:', extractedData.manufacturerAddress);
    console.log('commodityName:', extractedData.commodityName);
    console.log('netQuantity:', extractedData.netQuantity);
    console.log('mrp (raw value + type):', extractedData.mrp, typeof extractedData.mrp);
    console.log('mfgDate:', extractedData.mfgDate);
    console.log('consumerCareDetails:', extractedData.consumerCareDetails);
    console.log('countryOfOrigin:', extractedData.countryOfOrigin);
    console.log('fontSizeMm (raw value + type):', extractedData.fontSizeMm, typeof extractedData.fontSizeMm);

    const result = runComplianceCheck(extractedData, rules);

    console.log('--- RULE ENGINE RESULTS ---');
    console.log(JSON.stringify(result, null, 2));

    return result;
  }, [extractedData, rawOcrText]);


  const isQuantityValid = () => {
    if (!quantityVerified || !measuredQuantity || !extractedData.netQuantity) return true;
    // Basic ±3% logic parsing numbers only for demo
    const declaredMatch = extractedData.netQuantity.match(/[\d.]+/);
    const measuredMatch = measuredQuantity.match(/[\d.]+/);
    if (declaredMatch && measuredMatch) {
      const declared = parseFloat(declaredMatch[0]);
      const measured = parseFloat(measuredMatch[0]);
      if (declared > 0) {
        const errorPercent = Math.abs(measured - declared) / declared * 100;
        return errorPercent <= 3;
      }
    }
    return true; // Default to pass if unparseable
  };

  const finalVerdict = complianceResult.overallVerdict === 'Compliant' && isQuantityValid() ? 'Compliant' : 'Violation';

  const handleSubmit = async () => {
    const violations = complianceResult.results
      .filter(r => r.status === 'fail')
      .map(r => ({ rule: r.name, description: r.note, pass: false }));
    
    if (quantityVerified && !isQuantityValid()) {
       violations.push({ rule: 'Net Quantity Verification', description: 'Measured quantity falls outside the ±3% permissible error tolerance.', pass: false });
    }

    // CHECKPOINT 1: Log what the rule engine produced
    console.log('Scan complete - data being stored:', JSON.stringify({
      image: images.length > 0 ? 'image exists' : 'NO IMAGE',
      ruleResults: complianceResult.results,
      verdict: finalVerdict,
      extractedData,
      violations
    }, null, 2));

    const formData = new FormData();
    // Fix: Map extractedData keys correctly to backend column names
    formData.append('productName',      extractedData.commodityName       || 'Unknown Product');
    formData.append('manufacturer',     extractedData.manufacturerName     || '');
    formData.append('netQuantity',      extractedData.netQuantity          || '');
    formData.append('mrp',              extractedData.mrp                  || '');
    formData.append('mfgDate',          extractedData.mfgDate              || '');
    formData.append('bbDate',           extractedData.bestBeforeDate       || '');
    formData.append('customerCare',     extractedData.consumerCareDetails  || '');
    formData.append('countryOfOrigin',  extractedData.countryOfOrigin      || '');
    formData.append('location',         scanLocation || user?.district || user?.state || 'Unknown Location');
    formData.append('timestamp',        scanTimestamp || new Date().toISOString());
    formData.append('status',           finalVerdict);
    formData.append('verdict',          finalVerdict);
    formData.append('quantityVerified', String(quantityVerified));
    formData.append('measuredQuantity', measuredQuantity);
    formData.append('quantityPassed',   String(isQuantityValid()));
    formData.append('district',         user?.district || 'South Delhi');
    formData.append('inspectorId',      user?.officerId || 'LMO-DL-104');
    formData.append('observations',     observations);
    formData.append('violations',       JSON.stringify(violations));
    formData.append('ruleResults',      JSON.stringify(complianceResult.results));

    images.forEach(img => {
      formData.append('images', img);
    });

    // CHECKPOINT 2: Log how data is being passed to backend
    console.log('Navigating to report with data:', {
      productName:     extractedData.commodityName,
      manufacturer:    extractedData.manufacturerName,
      verdict:         finalVerdict,
      violations:      violations.length,
      hasImage:        images.length > 0
    });

    try {
      const res = await fetch('http://localhost:3001/api/scans', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user?.token}` },
        body: formData
      });
      const data = await res.json();
      console.log('Save response:', JSON.stringify(data));
      if (!data.id) {
        console.error('Backend did not return scan ID:', data);
        toast('Failed to save scan — no ID returned', 'error');
        return;
      }
      console.log('Scan saved with ID:', data.id, '— navigating to report');
      navigate(`/inspector-dashboard/report/${data.id}`);
    } catch (err) {
      console.error(err);
      toast('Failed to save scan to backend', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 relative">
      
      {/* Feature 6: Image Quality Warning Modal */}
      {showQualityWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl max-w-md w-full border border-slate-200 dark:border-slate-700 mx-4">
            <div className="flex items-center gap-3 text-status-warning mb-4">
              <AlertCircle className="w-8 h-8" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Image Quality Warning</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{qualityWarningText}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setShowQualityWarning(false); setImages([]); setStep(1); }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Retake Photo
              </button>
              <button 
                onClick={proceedWithAnalysis}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Scan</h1>
          <p className="text-slate-500 dark:text-slate-400">Capture package details to check compliance.</p>
        </div>
        
        {step === 1 && (
          <div className="flex items-center gap-4">
             <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
               <button 
                 onClick={() => setExtractionMode('ocr')}
                 className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors", extractionMode === 'ocr' ? "bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
               >Live OCR</button>
               <button 
                 onClick={() => setExtractionMode('demo')}
                 className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors", extractionMode === 'demo' ? "bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
               >Demo Data</button>
             </div>

             {extractionMode === 'demo' && (
                <div className="relative">
                  <select 
                    value={demoScenario}
                    onChange={(e) => setDemoScenario(e.target.value)}
                    className="pl-3 pr-8 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white appearance-none outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="compliant">Fully compliant product</option>
                    <option value="nonCompliantMRPFont">Non-compliant (missing MRP + small font)</option>
                    <option value="nonCompliantManufacturer">Non-compliant (missing manufacturer details)</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
             )}
          </div>
        )}
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <UploadBox onFilesSelected={handleUpload} className="mb-6" />
            
            <div className="flex justify-end">
              <button 
                onClick={startAnalysis}
                disabled={images.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Extract Text ({extractionMode === 'ocr' ? 'Tesseract OCR' : 'Demo Mode'})
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Feature 3: Previous Inspection History Panel */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-[400px]">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Previous Inspections</h3>
            <p className="text-xs text-slate-500 mb-4">Check past history for a business.</p>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="Business name..." 
                value={searchBusiness}
                onChange={e => setSearchBusiness(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchHistory()}
                className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:border-primary"
              />
              <button 
                onClick={handleSearchHistory}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-sm font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                Search
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {isSearchingHistory ? (
                <div className="text-center text-sm text-slate-500 mt-4">Searching...</div>
              ) : hasSearched && pastInspections.length === 0 ? (
                <div className="text-center text-sm text-slate-500 mt-4">No previous inspection history found for this business.</div>
              ) : (
                pastInspections.map(insp => (
                  <div key={insp.id} onClick={() => window.open(`/inspector-dashboard/report/${insp.id}`, '_blank')} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-primary transition-colors bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm line-clamp-1">{insp.productName}</span>
                      <StatusBadge status={insp.verdict === 'Compliant' ? 'Compliant' : 'Violation'} />
                    </div>
                    <div className="text-xs text-slate-500 flex justify-between mt-2">
                      <span>{format(new Date(insp.timestamp), 'dd MMM yyyy')}</span>
                      {insp.verdict !== 'Compliant' && <span className="text-status-error font-medium">{JSON.parse(insp.violations || '[]').length} Violations</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 relative mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <ScanLine className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analyzing Package...</h2>
          
          {extractionMode === 'ocr' ? (
            <div className="w-full max-w-sm mt-4">
              <div className="flex justify-between text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">
                <span>{ocrStatus || 'Initializing'}</span>
                <span>{ocrProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 mt-2">Loading mock extraction scenario...</p>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className={cn(
            "p-6 rounded-xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors",
            complianceResult.overallVerdict === 'Compliant' 
              ? "bg-status-success/10 border-status-success/30" 
              : "bg-status-error/10 border-status-error/30"
          )}>
            <div className="flex items-center gap-4">
              {complianceResult.overallVerdict === 'Compliant' ? (
                <div className="p-3 bg-status-success/20 rounded-full">
                  <CheckCircle2 className="w-8 h-8 text-status-success" />
                </div>
              ) : (
                <div className="p-3 bg-status-error/20 rounded-full">
                  <AlertCircle className="w-8 h-8 text-status-error" />
                </div>
              )}
              <div>
                <h2 className={cn(
                  "text-xl font-bold mb-1",
                  finalVerdict === 'Compliant' ? "text-green-800 dark:text-green-400" : "text-red-800 dark:text-red-400"
                )}>
                  {finalVerdict === 'Compliant' 
                    ? "Compliant — all declarations verified" 
                    : `Non-compliant — violations found`}
                </h2>
                <p className={cn(
                  "text-sm font-medium",
                  finalVerdict === 'Compliant' ? "text-green-700/80 dark:text-green-400/80" : "text-red-700/80 dark:text-red-400/80"
                )}>
                  {finalVerdict === 'Compliant' 
                    ? 'All mandatory rules and verifications passed.' 
                    : 'Product fails to meet mandatory packaging declarations or quantity checks.'}
                </p>
                {/* Feature 2: Location & Timestamp Display */}
                <div className="mt-2 flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1 bg-white/50 dark:bg-black/20 px-2 py-1 rounded">
                    <ScanLine className="w-3 h-3" />
                    {scanTimestamp ? format(new Date(scanTimestamp), 'dd MMM yyyy, h:mm a') : 'Capturing...'}
                  </div>
                  <div className="flex items-center gap-1 bg-white/50 dark:bg-black/20 px-2 py-1 rounded">
                    <span>📍</span>
                    {locationError ? (
                       <input 
                         type="text" 
                         value={scanLocation} 
                         onChange={e => setScanLocation(e.target.value)} 
                         placeholder="Enter location manually" 
                         className="bg-transparent border-b border-slate-400 outline-none w-32 focus:border-primary text-xs"
                       />
                    ) : (
                       <span>{scanLocation || 'Getting location...'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={handleSubmit}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Generate Report
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-semibold text-slate-900 dark:text-white">Rule Checklist</h3>
                <p className="text-xs text-slate-500">Legal Metrology (Packaged Commodities) Rules, 2011</p>
              </div>
              <div className="p-0">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {complianceResult.results.map(res => (
                      <tr key={res.ruleId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 w-12 font-medium text-slate-500 align-top">{res.ruleId}</td>
                        <td className="p-4">
                          <div className="font-medium text-slate-900 dark:text-slate-100">{res.name}</div>
                          {res.status === 'fail' && res.note && (
                            <div className="mt-2 border border-status-error/30 bg-status-error/5 rounded-md p-3">
                              {/* Feature 5: Violation Explanation */}
                              <p className="text-sm text-status-error font-medium mb-1">Why did this fail?</p>
                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                {res.note} — This requirement is mandated under the Legal Metrology (Packaged Commodities) Rules, 2011 to ensure complete transparency for the consumer.
                              </p>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-right align-top">
                           <StatusBadge status={res.status === 'pass' ? 'Compliant' : 'Violation'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Feature 1: Net Quantity Verification Section */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Net Quantity Verification</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Physically verify quantity</span>
                    <div className="relative inline-flex items-center">
                      <input type="checkbox" checked={quantityVerified} onChange={(e) => setQuantityVerified(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </div>
                  </label>
                </div>

                {!quantityVerified ? (
                  <p className="text-sm text-slate-500 italic">Physical quantity verification: Not performed during this inspection.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Declared Quantity (OCR)</label>
                        <input type="text" value={extractedData.netQuantity || ''} disabled className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Measured Quantity *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 480 g"
                          value={measuredQuantity} 
                          onChange={(e) => setMeasuredQuantity(e.target.value)} 
                          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-lg text-sm" 
                        />
                      </div>
                    </div>
                    {measuredQuantity && extractedData.netQuantity && (
                      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium">Result: {isQuantityValid() ? 'Within tolerance (±3%)' : 'Outside tolerance (±3%)'}</span>
                        <StatusBadge status={isQuantityValid() ? 'Compliant' : 'Violation'} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Extracted Data</h3>
                  <p className="text-xs text-slate-500">Edit fields to dynamically re-run rules.</p>
                </div>
                
                {extractionMode === 'ocr' && rawOcrText && (
                  <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <button 
                      onClick={() => setShowRawText(!showRawText)}
                      className="flex items-center justify-between w-full p-4 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none"
                    >
                      <span>View Raw OCR Text</span>
                      {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showRawText && (
                      <div className="px-4 pb-4">
                        <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap max-h-48 overflow-y-auto">
                          {rawOcrText}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="p-4 space-y-4">
                  {rules.map(rule => (
                    <div key={rule.ruleId}>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {rule.name}
                      </label>
                      <input 
                        type="text"
                        value={extractedData[rule.field] || ''}
                        onChange={(e) => handleFieldChange(rule.field, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                        placeholder={rule.field === 'bestBeforeDate' ? "Optional" : "Not detected — enter manually"}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Evidence Images</h3>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square">
                      <img src={URL.createObjectURL(img)} alt={`Scan ${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Feature 4: Officer Observations */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Officer Observations</h3>
                <textarea 
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Add any manual remarks or observations not captured by the automated checklist"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all text-sm min-h-[100px]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
