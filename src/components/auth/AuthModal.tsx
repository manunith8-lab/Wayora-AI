import React, { useState } from 'react';
import { X, User as UserIcon, Mail, Lock, Sparkles, CheckCircle2, LogOut, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';
import { User } from '../../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: User | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentUser = authService.getCurrentUser();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          throw new Error('Please enter your actual name.');
        }
        const user = await authService.signUp(name, email, password);
        onAuthSuccess?.(user);
        onClose();
      } else {
        const user = await authService.signIn(email, password);
        onAuthSuccess?.(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    authService.signOut();
    onAuthSuccess?.(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-forest-100 dark:border-slate-800 p-6 sm:p-8 text-charcoal dark:text-gray-100 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-charcoal dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition"
        >
          <X size={18} />
        </button>

        {currentUser ? (
          /* Signed In State */
          <div className="text-center space-y-5 pt-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-forest-900 text-gold-400 flex items-center justify-center text-xl font-bold shadow-lg">
              {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'ME'}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                Active Voyager Account
              </span>
              <h3 className="font-serif text-2xl font-bold text-forest-900 dark:text-white">
                {currentUser.name || 'Valued Explorer'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentUser.email}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-forest-50 dark:bg-slate-800 border border-forest-100 dark:border-slate-700 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-forest-900 dark:text-gray-200">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Personalized trip recommendations enabled</span>
              </div>
              <div className="flex items-center gap-2 text-forest-900 dark:text-gray-200">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Private conversation history isolated to your profile</span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-slate-800 text-red-600 dark:text-red-400 font-bold text-xs hover:bg-red-50 dark:hover:bg-red-950/40 transition flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              <span>Sign Out of Wayora</span>
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 mx-auto rounded-xl bg-forest-900 dark:bg-forest-800 text-gold-400 flex items-center justify-center mb-2 shadow-sm">
                <Sparkles size={20} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-forest-900 dark:text-white">
                {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {mode === 'signin'
                  ? 'Sign in to access your personal trips and saved conversations.'
                  : 'Start planning personalized global journeys with your own profile.'}
              </p>
            </div>

            {/* Tab switch */}
            <div className="grid grid-cols-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError('');
                }}
                className={`py-2 rounded-xl transition ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-slate-900 text-forest-900 dark:text-gold-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-charcoal'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className={`py-2 rounded-xl transition ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-forest-900 dark:text-gold-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-charcoal'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Your Actual Full Name
                  </label>
                  <div className="relative">
                    <UserIcon size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-charcoal dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-charcoal dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-charcoal dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 font-bold text-xs sm:text-sm hover:bg-forest-800 dark:hover:bg-gold-400 disabled:opacity-50 transition shadow-md flex items-center justify-center gap-2"
              >
                <span>{mode === 'signin' ? 'Sign In to Wayora' : 'Complete Registration'}</span>
                <ArrowRight size={14} />
              </button>
            </form>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-gray-400 hover:text-forest-900 dark:hover:text-gold-400 transition"
              >
                Continue as Guest Explorer →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
