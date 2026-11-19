import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { HeartPulse, Lock, Mail, ArrowRight, ShieldCheck, Building2, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [intendedRoute, setIntendedRoute] = useState<string | null>(null);

  // Helper to determine the authorized default dashboard for each of the 3 roles
  const getRoleDashboard = (role: string): string => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'FACILITY_REPRESENTATIVE':
        return '/rep/dashboard';
      case 'USER':
      default:
        return '/patient/dashboard';
    }
  };

  // If already authenticated, redirect immediately away from login to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRoleDashboard(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const performLogin = async (emailToUse: string, passToUse: string, targetPath?: string) => {
    setError(null);
    setSubmitting(true);

    try {
      const loggedUser = await login(emailToUse, passToUse);
      toast(`Welcome back, ${loggedUser.name}!`, 'success');

      // STRICTLY OPEN THE DASHBOARD FOR THE 3 ROLES
      let destination = targetPath || getRoleDashboard(loggedUser.role);

      // Check if user came specifically from an authenticated sub-route matching their role
      const from = (location.state as any)?.from;
      if (from && from.pathname) {
        const dest = from.pathname;
        const isAuthProtectedPath =
          dest.startsWith('/patient') ||
          dest.startsWith('/user') ||
          dest.startsWith('/rep') ||
          dest.startsWith('/admin');

        if (isAuthProtectedPath) {
          if (dest.startsWith('/admin') && loggedUser.role === 'ADMIN') {
            destination = `${dest}${from.search || ''}`;
          } else if (
            dest.startsWith('/rep') &&
            (loggedUser.role === 'FACILITY_REPRESENTATIVE' || loggedUser.role === 'ADMIN')
          ) {
            destination = `${dest}${from.search || ''}`;
          } else if (
            (dest.startsWith('/patient') || dest.startsWith('/user')) &&
            loggedUser.role === 'USER'
          ) {
            destination = `${dest}${from.search || ''}`;
          }
        }
      }

      navigate(destination, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string, targetPath: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    await performLogin(demoEmail, demoPass, targetPath);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-ivory-warm">
      <div className="max-w-md w-full space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-deep to-forest-deep text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-accent/20">
            <HeartPulse className="w-6 h-6 text-mint-soft stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-charcoal-dark tracking-tight">
            Sign In to Medi<span className="text-emerald-accent">Guide</span>
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-secondary">
            Access facility discovery, cost comparisons, saved bookmarks, and management.
          </p>
        </div>

        {/* Exactly 3 Role Test Accounts */}
        <div className="p-4 rounded-2xl bg-mint-soft/80 border border-border-subtle space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-deep">
              ⚡ 3 MediGuide Roles (Click to Sign In Directly)
            </p>
            <span className="text-[10px] font-bold text-emerald-accent bg-white px-2 py-0.5 rounded-full border border-border-subtle">
              3 Roles
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Role 1: Patient / Healthcare Seeker */}
            <button
              type="button"
              onClick={() => handleQuickLogin('user.rahul@example.com', 'UserPassword123!', '/patient/dashboard')}
              className="p-3 rounded-xl bg-white border border-border-subtle hover:border-emerald-accent hover:shadow-subtle text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 font-bold text-charcoal-dark group-hover:text-emerald-accent transition-colors">
                <User className="w-4 h-4 text-emerald-accent" />
                <span>Patient</span>
              </div>
              <p className="text-[10px] text-charcoal-secondary mt-1 leading-snug">Healthcare Seeker Portal</p>
            </button>

            {/* Role 2: Healthcare Facility Representative */}
            <button
              type="button"
              onClick={() => handleQuickLogin('rep.rubyhall@mediguide.org', 'RepPassword123!', '/rep/dashboard')}
              className="p-3 rounded-xl bg-white border border-border-subtle hover:border-emerald-accent hover:shadow-subtle text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 font-bold text-charcoal-dark group-hover:text-teal-deep transition-colors">
                <Building2 className="w-4 h-4 text-teal-deep" />
                <span>Facility Rep</span>
              </div>
              <p className="text-[10px] text-charcoal-secondary mt-1 leading-snug">Hospital / Clinic Representative</p>
            </button>

            {/* Role 3: Platform Administrator */}
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@mediguide.org', 'AdminPassword123!', '/admin/dashboard')}
              className="p-3 rounded-xl bg-white border border-border-subtle hover:border-emerald-accent hover:shadow-subtle text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 font-bold text-charcoal-dark group-hover:text-emerald-accent transition-colors">
                <ShieldCheck className="w-4 h-4 text-emerald-accent" />
                <span>Administrator</span>
              </div>
              <p className="text-[10px] text-charcoal-secondary mt-1 leading-snug">Platform Operations Center</p>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl border border-border-subtle shadow-card p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-bold text-charcoal-dark uppercase tracking-wider mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  id="login-email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-warm-25 focus:bg-white text-sm focus:border-teal-deep focus:ring-1 focus:ring-teal-deep/20 text-charcoal-dark"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold text-charcoal-dark uppercase tracking-wider"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-teal-deep hover:text-emerald-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  id="login-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-warm-25 focus:bg-white text-sm focus:border-teal-deep focus:ring-1 focus:ring-teal-deep/20 text-charcoal-dark"
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-button"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-emerald-accent hover:bg-forest-deep active:bg-forest-dark text-white font-bold text-sm shadow-brand hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-border-subtle text-center text-xs text-charcoal-secondary">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              state={location.state}
              className="font-bold text-teal-deep hover:text-emerald-accent hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
