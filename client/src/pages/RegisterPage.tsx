import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { HeartPulse, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { user, isAuthenticated, register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to user dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/user/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your entry.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      const newUser = await register(name, email, phone, password);
      toast(`Registration successful! Welcome, ${newUser.name}.`, 'success');
      navigate('/patient/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-ivory-warm">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-deep to-forest-deep text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-accent/20">
            <HeartPulse className="w-6 h-6 text-mint-soft stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-charcoal-dark tracking-tight">
            Create Patient Account
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-secondary">
            Bookmark healthcare providers, compare procedure costs, and report inaccurate information.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-border-subtle shadow-card p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="register-name"
                className="block text-xs font-bold text-charcoal-dark uppercase tracking-wider mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-charcoal-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  id="register-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Verma"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-warm-25 focus:bg-white text-sm focus:border-teal-deep focus:ring-1 focus:ring-teal-deep/20 text-charcoal-dark"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-xs font-bold text-charcoal-dark uppercase tracking-wider mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  id="register-email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-warm-25 focus:bg-white text-sm focus:border-teal-deep focus:ring-1 focus:ring-teal-deep/20 text-charcoal-dark"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="register-phone"
                className="block text-xs font-bold text-charcoal-dark uppercase tracking-wider mb-1.5"
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-charcoal-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  id="register-phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-warm-25 focus:bg-white text-sm focus:border-teal-deep focus:ring-1 focus:ring-teal-deep/20 text-charcoal-dark"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="register-password"
                  className="block text-xs font-bold text-charcoal-dark uppercase tracking-wider mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    id="register-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-warm-25 focus:bg-white text-sm focus:border-teal-deep focus:ring-1 focus:ring-teal-deep/20 text-charcoal-dark"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="block text-xs font-bold text-charcoal-dark uppercase tracking-wider mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    id="register-confirm-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-warm-25 focus:bg-white text-sm focus:border-teal-deep focus:ring-1 focus:ring-teal-deep/20 text-charcoal-dark"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              id="register-submit-button"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-emerald-accent hover:bg-forest-deep active:bg-forest-dark text-white font-bold text-sm shadow-brand hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-border-subtle text-center text-xs text-charcoal-secondary">
            Already have an account?{' '}
            <Link
              to="/login"
              state={location.state}
              className="font-bold text-teal-deep hover:text-emerald-accent hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
