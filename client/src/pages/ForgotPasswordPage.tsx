import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  HeartPulse,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Smartphone,
  Check,
} from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Email, 2: Code, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [phoneHint, setPhoneHint] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Request Reset Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) return;

    try {
      setSubmitting(true);
      const res = await api.forgotPassword(email);
      if (res.success) {
        setPreviewCode(res.preview_code);
        setPhoneHint(res.phone_hint);
        setStep(2);
        toast('Verification code sent to your registered email and phone.', 'success');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code. Please check your email.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify Code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code || code.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.verifyResetCode(email, code);
      if (res.success) {
        setStep(3);
        toast('Code verified successfully! Please enter your new password.', 'success');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.resetPassword({
        email,
        code,
        new_password: newPassword,
      });

      if (res.success) {
        setStep(4);
        toast('Password reset successfully! You can now sign in.', 'success');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-deep to-forest-deep text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-accent/20">
            <KeyRound className="w-6 h-6 text-mint-soft stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-charcoal-dark tracking-tight">
            Account Recovery
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-secondary">
            {step === 1 && 'Enter your registered email address to receive a recovery code.'}
            {step === 2 && 'Enter the 6-digit verification code sent to your email and phone.'}
            {step === 3 && 'Choose a strong new password for your MediGuide account.'}
            {step === 4 && 'Your password has been successfully updated.'}
          </p>
        </div>

        {/* Wizard Progress Stepper */}
        {step < 4 && (
          <div className="flex items-center justify-between px-6 py-2 bg-slate-100 rounded-2xl text-xs font-bold text-slate-500">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-brand-700' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-300'}`}>1</span>
              <span>Email</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200" />
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-brand-700' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-brand-600 text-white' : 'bg-slate-300'}`}>2</span>
              <span>Verify Code</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200" />
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-brand-700' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-brand-600 text-white' : 'bg-slate-300'}`}>3</span>
              <span>New Password</span>
            </div>
          </div>
        )}

        {/* Card Body */}
        <div className="bg-white rounded-3xl border border-border-subtle shadow-card p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-dark uppercase tracking-wider mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-charcoal-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user.rahul@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-warm-25 focus:bg-white text-sm focus:border-teal-deep focus:ring-1 focus:ring-teal-deep/20 text-charcoal-dark"
                  />
                </div>
              </div>

              {/* Quick helper for demo evaluation */}
              <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-200 text-[11px] text-brand-900 space-y-1">
                <span className="font-bold">💡 Quick autofill test accounts:</span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {['user.rahul@example.com', 'rep.rubyhall@mediguide.org', 'admin@mediguide.org'].map((acc) => (
                    <button
                      key={acc}
                      type="button"
                      onClick={() => setEmail(acc)}
                      className="px-2 py-0.5 rounded bg-white border border-brand-300 hover:bg-brand-100 font-semibold text-brand-800 transition-colors"
                    >
                      {acc.split('@')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-emerald-accent hover:bg-forest-deep active:bg-forest-dark text-white font-bold text-sm shadow-brand hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{submitting ? 'Dispatching code...' : 'Send Verification Code'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Verify Code */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              {/* Simulated Notification Dispatch Banner */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>SMS / WhatsApp Alert Dispatched</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  "MediGuide Security: Your password reset verification code is{' '}
                  <strong className="text-emerald-900 font-extrabold text-xs">{previewCode}</strong>. Valid for 15 minutes."
                </p>
                {previewCode && (
                  <button
                    type="button"
                    onClick={() => setCode(previewCode)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Check className="w-3 h-3" />
                    <span>Auto-Fill Code ({previewCode})</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-dark uppercase tracking-wider mb-1.5">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 123456"
                  className="w-full px-4 py-2.5 text-center text-xl font-mono tracking-widest rounded-xl border border-border-subtle bg-warm-25 focus:bg-white focus:border-teal-deep focus:ring-1 focus:ring-teal-deep/20 text-charcoal-dark"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Code valid for 15 minutes</span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-bold text-teal-deep hover:underline"
                >
                  Change email
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-emerald-accent hover:bg-forest-deep active:bg-forest-dark text-white font-bold text-sm shadow-brand hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{submitting ? 'Verifying...' : 'Verify Code'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 3: Enter New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-dark uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-warm-25 focus:bg-white text-sm focus:border-teal-deep focus:ring-1 focus:ring-teal-deep/20 text-charcoal-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-dark uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-warm-25 focus:bg-white text-sm focus:border-teal-deep focus:ring-1 focus:ring-teal-deep/20 text-charcoal-dark"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-emerald-accent hover:bg-forest-deep active:bg-forest-dark text-white font-bold text-sm shadow-brand hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{submitting ? 'Updating password...' : 'Update Password & Save'}</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Password Updated Successfully!</h3>
                <p className="text-xs text-slate-500">
                  Your password has been changed. You can now use your new credentials to sign in.
                </p>
              </div>
              <Link
                to="/login"
                className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition-all inline-flex items-center justify-center gap-2"
              >
                <span>Sign In to Your Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Back to sign in */}
          {step < 4 && (
            <div className="pt-3 border-t border-border-subtle text-center text-xs text-charcoal-secondary">
              Remember your password?{' '}
              <Link to="/login" className="font-bold text-teal-deep hover:text-emerald-accent hover:underline">
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
