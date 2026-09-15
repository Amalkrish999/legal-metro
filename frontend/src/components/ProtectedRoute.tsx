import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Define logic for mapping roles to categories
  const isInspector = user.role === 'Inspector';
  const isSupervisor = ['Assistant Controller', 'Deputy Controller', 'Additional Controller', 'Controller'].includes(user.role);
  const isAdmin = ['Assistant Director', 'Deputy Director', 'Joint Director', 'Additional Director', 'Director'].includes(user.role);

  let category = '';
  if (isInspector) category = 'Inspector';
  if (isSupervisor) category = 'Supervisor';
  if (isAdmin) category = 'Admin';

  if (!allowedRoles.includes(category)) {
    // Redirect to their default dashboard if they try to access unauthorized route
    if (category === 'Admin') return <Navigate to="/admin-dashboard" replace />;
    if (category === 'Supervisor') return <Navigate to="/supervisory-dashboard" replace />;
    return <Navigate to="/inspector-dashboard" replace />;
  }

  return <Outlet />;
}
