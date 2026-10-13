// CareNova Authentication Portal (Sign In, Registration, Password Reset)
// Forest Teal (#0B343B), Deep Navy (#102D3E), Primary Teal (#168B83), Fresh Mint (#A8E6D5 / #64D8C1)
// Lead Architect: Aryan More

import React, { useState } from 'react';
import {
  Activity,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const AuthPortal: React.FC = () => {
  const { signIn, signUp, resetPassword, isDemoMode } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          setErrorMessage('Please use a password with at least 6 characters.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage('Welcome to CareNova! Your account is ready.');
        }
      } else if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMessage(error.message);
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage('Password recovery link has been sent to your email.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F9F8] dark:bg-[#0B1720] flex items-center justify-center p-4 relative text-[#183447] dark:text-[#EAF7F4] transition-colors duration-200">
      {/* Top Floating Theme Toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        className="absolute top-5 right-5 p-2.5 rounded-2xl bg-white dark:bg-[#17363A] border border-[#D8ECE7] dark:border-[#234E54] text-[#168B83] dark:text-[#64D8C1] shadow-xs hover:scale-105 transition-all"
      >
        {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-sky-600" />}
      </button>

      <div className="max-w-md w-full bg-white dark:bg-[#17363A] rounded-3xl p-8 shadow-xl border border-[#D8ECE7] dark:border-[#234E54] animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#168B83] via-[#1aa39a] to-[#64D8C1] mx-auto flex items-center justify-center text-white shadow-xl shadow-[#168B83]/20 mb-3">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[#0B343B] dark:text-[#EAF7F4] tracking-tight">
            CareNova
          </h1>
          <p className="text-xs text-[#168B83] dark:text-[#64D8C1] font-bold uppercase tracking-wider mt-0.5">
            Your Personal Health Companion
          </p>
          <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] mt-2">
            {mode === 'signin' && 'Sign in to access your vitals, trackers, and health reports.'}
            {mode === 'signup' && 'Create your free account to track your daily health easily.'}
            {mode === 'reset' && 'Enter your email to receive simple instructions to reset your password.'}
          </p>
        </div>

        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div className="mb-6 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Offline Demo Mode Active:</strong> You can enter any details or continue to explore all features.
            </span>
          </div>
        )}

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-[#7E9FA8] dark:text-[#789B96]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] text-[#0B343B] dark:text-[#EAF7F4] placeholder-[#7E9FA8] dark:placeholder-[#789B96] rounded-xl text-xs outline-none focus:border-[#168B83] font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#7E9FA8] dark:text-[#789B96]" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] text-[#0B343B] dark:text-[#EAF7F4] placeholder-[#7E9FA8] dark:placeholder-[#789B96] rounded-xl text-xs outline-none focus:border-[#168B83] font-medium"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1]">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-[11px] text-[#168B83] dark:text-[#64D8C1] hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#7E9FA8] dark:text-[#789B96]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] text-[#0B343B] dark:text-[#EAF7F4] placeholder-[#7E9FA8] dark:placeholder-[#789B96] rounded-xl text-xs outline-none focus:border-[#168B83] font-medium"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#168B83] hover:bg-[#12726B] text-white font-bold text-xs shadow-lg shadow-[#168B83]/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-40"
          >
            <span>
              {loading
                ? 'Please wait...'
                : mode === 'signin'
                ? 'Sign In to CareNova'
                : mode === 'signup'
                ? 'Create My Account'
                : 'Send Recovery Email'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-6 pt-4 border-t border-[#D8ECE7] dark:border-[#234E54] text-center text-xs text-[#476A76] dark:text-[#A9C5C1] space-y-2">
          {mode === 'signin' && (
            <p>
              New to CareNova?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[#168B83] dark:text-[#64D8C1] font-bold hover:underline"
              >
                Create an account
              </button>
            </p>
          )}

          {(mode === 'signup' || mode === 'reset') && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-[#168B83] dark:text-[#64D8C1] font-bold hover:underline"
              >
                Sign in here
              </button>
            </p>
          )}

          <div className="text-[11px] text-[#7E9FA8] dark:text-[#789B96] pt-2">
            CareNova Healthcare Platform • Created by Aryan More
          </div>
        </div>
      </div>
    </div>
  );
};
