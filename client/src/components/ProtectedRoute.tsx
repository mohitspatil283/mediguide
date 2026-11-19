import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'USER' | 'FACILITY_REPRESENTATIVE' | 'ADMIN'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-charcoal-secondary">
        <p className="animate-pulse text-sm">Verifying security credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve intended destination including pathname and search query params
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role as any)) {
    const roleDashboard =
      role === 'ADMIN'
        ? '/admin/dashboard'
        : role === 'FACILITY_REPRESENTATIVE'
        ? '/rep/dashboard'
        : '/patient/dashboard';

    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-white border border-border-subtle shadow-card text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200">
          <ShieldAlert className="w-6 h-6 text-rose-600" />
        </div>
        <h2 className="text-xl font-heading font-bold text-charcoal-dark">
          Access Restricted (403 Forbidden)
        </h2>
        <p className="text-xs text-charcoal-secondary leading-relaxed">
          Your account role (<span className="font-semibold uppercase text-charcoal-dark">{role}</span>) does not have authorization to view this protected portal.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link
            to={roleDashboard}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest-deep hover:bg-forest-dark text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <span>Go to Your Dashboard</span>
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border-subtle hover:bg-sage-pale text-charcoal-dark font-medium text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Public Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
