import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ROLES = [
  'Inspector',
  'Assistant Controller',
  'Deputy Controller',
  'Additional Controller',
  'Controller',
  'Assistant Director',
  'Deputy Director',
  'Joint Director',
  'Additional Director',
  'Director'
];

const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'];

const TN_DISTRICTS = [
  "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar", "Chengalpattu", "Ariyalur"
];

const DISTRICTS = ['North District', 'South District', 'East District', 'West District', 'Central District', 'Gurgaon District', ...TN_DISTRICTS].sort();
const ZONES = ['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone', 'Imports Subject', 'Coimbatore Zone'];

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [role, setRole] = useState('Inspector');
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Location Fields
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [zone, setZone] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  // Conditional Logic
  const isStateLevel = ['Inspector', 'Assistant Controller', 'Deputy Controller', 'Additional Controller', 'Controller'].includes(role);
  const isCentralLevel = ['Assistant Director', 'Deputy Director', 'Joint Director', 'Additional Director', 'Director'].includes(role);
  const isStateHead = role === 'Controller';
  const isCentralHead = role === 'Director';

  const handleDemoClick = (demoRole: string, demoId: string, demoState: string | null, demoDistrict: string | null, demoZone: string | null) => {
    setRole(demoRole);
    setOfficerId(demoId);
    setPassword('password123');
    if (demoState) setState(demoState);
    if (demoDistrict) setDistrict(demoDistrict);
    if (demoZone) setZone(demoZone);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (isStateLevel && !isStateHead && (!state || !district)) {
      toast('Please select your assigned State and District.', 'error');
      setIsLoading(false);
      return;
    }
    if (isStateHead && !state) {
      toast('Please select your assigned State.', 'error');
      setIsLoading(false);
      return;
    }
    if (isCentralLevel && !isCentralHead && !zone) {
      toast('Please select your assigned Zone/Subject.', 'error');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerId, password, role, state, district, zone
        })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Login failed');

      // Simulate a small network delay for effect
      setTimeout(() => {
        login(data);
        setIsLoading(false);
        toast('Login successful!', 'success');
        
        // Redirect based on role category
        if (isCentralLevel) {
          navigate('/admin-dashboard');
        } else if (['Assistant Controller', 'Deputy Controller', 'Additional Controller', 'Controller'].includes(role)) {
          navigate('/supervisory-dashboard');
        } else {
          navigate('/inspector-dashboard');
        }
      }, 800);

    } catch (err: any) {
      toast(err.message, 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors">
      
      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-col w-1/2 bg-primary text-white p-12 justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="relative z-10 max-w-lg">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-white/20 shadow-xl">
            <ShieldAlert className="w-12 h-12 text-accent drop-shadow-md" />
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight text-white drop-shadow-sm">Department of Consumer Affairs</h1>
          <h2 className="text-2xl font-light text-primary-light mb-8">Legal Metrology Integrated Portal</h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            A unified national enforcement dashboard ensuring fair trade practices and accuracy in weights, measures, and packaged commodities across India.
          </p>
          
          <div className="mt-12 space-y-4">
             <div className="flex items-center gap-3 text-slate-200">
               <CheckCircle2 className="w-5 h-5 text-accent" /> <span className="font-medium">Real-time inspection tracking</span>
             </div>
             <div className="flex items-center gap-3 text-slate-200">
               <CheckCircle2 className="w-5 h-5 text-accent" /> <span className="font-medium">Multi-tier supervisory oversight</span>
             </div>
             <div className="flex items-center gap-3 text-slate-200">
               <CheckCircle2 className="w-5 h-5 text-accent" /> <span className="font-medium">National compliance analytics</span>
             </div>
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 md:p-16 relative">
        
        <div className="max-w-md w-full mx-auto">
          
          <div className="mb-8 lg:hidden flex items-center gap-3">
             <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
               <ShieldAlert className="w-7 h-7 text-accent" />
             </div>
             <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Dept of Consumer Affairs</h1>
                <p className="text-sm font-medium text-slate-500">Legal Metrology Portal</p>
             </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Secure Login</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Authenticate with your government credentials.</p>
          </div>



          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Designation / Role
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setState(''); setDistrict(''); setZone(''); // reset locs on role change
                  }}
                  className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Officer ID & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Officer ID</label>
                <input
                  type="text"
                  required
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="e.g. INS-DL-1042"
                />
              </div>
              <div>
                 <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs font-medium text-primary hover:text-primary-dark">
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Conditional Location Fields */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
               <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                 <ShieldAlert className="w-4 h-4 text-primary" /> Scope of Authority
               </h3>
               
               {isStateLevel ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">State / UT</label>
                        <select value={state} onChange={(e) => setState(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none">
                          <option value="">Select State...</option>
                          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                     </div>
                     {!isStateHead && (
                        <div>
                          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">District</label>
                          <select value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!state} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none disabled:opacity-50">
                            <option value="">Select District...</option>
                            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                       </div>
                     )}
                  </div>
               ) : (
                  <div className="grid grid-cols-1 gap-4">
                     {isCentralHead ? (
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg">
                           <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
                           <span className="text-sm font-bold text-slate-900 dark:text-white">All India Scope Active</span>
                        </div>
                     ) : (
                       <div>
                          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Zone / Subject Area</label>
                          <select value={zone} onChange={(e) => setZone(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none">
                            <option value="">Select Zone...</option>
                            {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                          </select>
                       </div>
                     )}
                  </div>
               )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300" />
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Helper */}
          <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700">
             <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Demo Quick Login</h4>
             <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleDemoClick('Inspector', 'INS-DL-1042', 'Delhi', 'South District', null)} className="text-left px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                   Inspector (DL)
                </button>
                <button onClick={() => handleDemoClick('Assistant Controller', 'AC-HR-0231', 'Haryana', 'Gurgaon District', null)} className="text-left px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                   Asst. Controller (HR)
                </button>
                <button onClick={() => handleDemoClick('Controller', 'CTRL-TN-01', 'Tamil Nadu', null, null)} className="text-left px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                   Controller (TN)
                </button>
                <button onClick={() => handleDemoClick('Assistant Controller', 'AC-TN-CBE-01', 'Tamil Nadu', 'Coimbatore', null)} className="text-left px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                   AC (Coimbatore)
                </button>
                <button onClick={() => handleDemoClick('Deputy Controller', 'DC-TN-CBE-01', 'Tamil Nadu', 'Coimbatore', null)} className="text-left px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                   DC (Coimbatore)
                </button>
                <button onClick={() => handleDemoClick('Additional Controller', 'ADC-TN-CBE-01', 'Tamil Nadu', null, 'Coimbatore Zone')} className="text-left px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                   ADC (Coimbatore Zone)
                </button>
                <button onClick={() => handleDemoClick('Deputy Director', 'DD-CEN-0088', null, null, 'South Zone')} className="text-left px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                   Deputy Director (SZ)
                </button>
                <button onClick={() => handleDemoClick('Director', 'DIR-IND-0001', null, null, null)} className="text-left px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors col-span-2 text-center bg-primary/5 border-primary/20 text-primary">
                   Director (All India)
                </button>
                <div className="col-span-2 mt-1 relative">
                  <select 
                    className="w-full text-left px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors appearance-none focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const index = TN_DISTRICTS.indexOf(e.target.value);
                      const code = String(index + 1).padStart(3, '0');
                      handleDemoClick('Inspector', `INS-TN-${code}`, 'Tamil Nadu', e.target.value, null);
                      e.target.value = ""; // Reset after selection
                    }}
                  >
                    <option value="">Inspector (Tamil Nadu) — Select District...</option>
                    {TN_DISTRICTS.map((d, i) => (
                      <option key={d} value={d}>{d} (INS-TN-{String(i + 1).padStart(3, '0')})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
             </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Government of India • Ministry of Consumer Affairs<br/>
              Unauthorized access is strictly prohibited.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
