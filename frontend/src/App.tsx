import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ScanUpload } from './pages/ScanUpload';
import { ScanHistory } from './pages/ScanHistory';
import { Profile } from './pages/Profile';
import { ReportPreview } from './pages/ReportPreview';

import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { RootLayout } from './components/RootLayout';
import { 
  LayoutDashboard, ScanLine, History, User, Users, ClipboardCheck, Scale, Building2, FileText, Map, ShoppingCart, FileSignature
} from 'lucide-react';



import { Overview as SupOverview } from './pages/supervisor/Overview';
import { Inspectors } from './pages/supervisor/Inspectors';
import { CaseReview } from './pages/supervisor/CaseReview';
import { Enforcements } from './pages/supervisor/Enforcements';
import { Registrations } from './pages/supervisor/Registrations';
import { Reports as SupReports } from './pages/supervisor/Reports';

import { NationalOverview } from './pages/admin/NationalOverview';
import { StatePerformance } from './pages/admin/StatePerformance';
import { NationalRegistry } from './pages/admin/NationalRegistry';
import { EcommerceMonitor } from './pages/admin/EcommerceMonitor';
import { PolicyManager } from './pages/admin/PolicyManager';
import { NationalReports } from './pages/admin/NationalReports';

const inspectorNavItems = [
  { name: 'Dashboard', path: '/inspector-dashboard', icon: LayoutDashboard },
  { name: 'Scan Product', path: '/inspector-dashboard/scan', icon: ScanLine },
  { name: 'History', path: '/inspector-dashboard/history', icon: History },
  { name: 'Profile', path: '/inspector-dashboard/profile', icon: User },
];

const supervisorNavItems = [
  { name: 'Overview', path: '/supervisory-dashboard', icon: LayoutDashboard },
  { name: 'Inspectors', path: '/supervisory-dashboard/inspectors', icon: Users },
  { name: 'Case Review', path: '/supervisory-dashboard/review', icon: ClipboardCheck },
  { name: 'Enforcements', path: '/supervisory-dashboard/enforcements', icon: Scale },
  { name: 'Registrations', path: '/supervisory-dashboard/registrations', icon: Building2 },
  { name: 'Reports', path: '/supervisory-dashboard/reports', icon: FileText },
];

const adminNavItems = [
  { name: 'National Overview', path: '/admin-dashboard', icon: LayoutDashboard },
  { name: 'State Performance', path: '/admin-dashboard/states', icon: Map },
  { name: 'National Registry', path: '/admin-dashboard/registrations', icon: Building2 },
  { name: 'E-Commerce Monitor', path: '/admin-dashboard/ecommerce', icon: ShoppingCart },
  { name: 'Policy Manager', path: '/admin-dashboard/policy', icon: FileSignature },
  { name: 'National Reports', path: '/admin-dashboard/reports', icon: FileText },
];

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Inspector Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Inspector']} />}>
            <Route element={<RootLayout navItems={inspectorNavItems} title="Department of Consumer Affairs" subtitle="Legal Metrology" mobileTitle="LM Portal" />}>
              <Route path="/inspector-dashboard" element={<Dashboard />} />
              <Route path="/inspector-dashboard/scan" element={<ScanUpload />} />
              <Route path="/inspector-dashboard/history" element={<ScanHistory />} />
              <Route path="/inspector-dashboard/profile" element={<Profile />} />
              <Route path="/inspector-dashboard/report/:id" element={<ReportPreview />} />
            </Route>
          </Route>

          {/* Supervisor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Supervisor']} />}>
            <Route path="/supervisory-dashboard" element={<RootLayout navItems={supervisorNavItems} title="Supervisory Portal" subtitle="Legal Metrology" mobileTitle="LM Supervisor" />}>
              <Route index element={<SupOverview />} />
              <Route path="inspectors" element={<Inspectors />} />
              <Route path="review" element={<CaseReview />} />
              <Route path="enforcements" element={<Enforcements />} />
              <Route path="registrations" element={<Registrations />} />
              <Route path="reports" element={<SupReports />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/admin-dashboard" element={<RootLayout navItems={adminNavItems} title="Central Admin" subtitle="Legal Metrology" mobileTitle="Central Admin" />}>
              <Route index element={<NationalOverview />} />
              <Route path="states" element={<StatePerformance />} />
              <Route path="registrations" element={<NationalRegistry />} />
              <Route path="ecommerce" element={<EcommerceMonitor />} />
              <Route path="policy" element={<PolicyManager />} />
              <Route path="reports" element={<NationalReports />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ToastProvider>
  );
}

export default App;
