import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type AuthPageProps = {
  onNavigate: (page: 'home' | 'dashboard') => void;
};

export default function AuthPage({ onNavigate }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signIn(form.email, form.password);
      if (error) setError(error.message);
      else onNavigate('dashboard');
    } else {
      if (!form.name.trim()) { setError('Please enter your name'); setLoading(false); return; }
      const { error } = await signUp(form.email, form.password, form.name);
      if (error) setError(error.message);
      else onNavigate('dashboard');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-luxury-gradient pt-20 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Back */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 font-poppins text-sm text-warm-500 hover:text-champagne-600 transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to Home
        </button>

        <div className="bg-white shadow-luxury p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="font-playfair text-3xl text-warm-800">Kala Vibez</h1>
            <div className="gold-divider mt-3 mb-4" />
            <p className="font-poppins text-sm text-warm-500">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-cream-200 mb-7">
            <button
              onClick={() => { setMode('signin'); setError(''); }}
              className={`flex-1 py-3 font-poppins text-sm transition-all ${
                mode === 'signin' ? 'border-b-2 border-champagne-500 text-champagne-600' : 'text-warm-400 hover:text-warm-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-3 font-poppins text-sm transition-all ${
                mode === 'signup' ? 'border-b-2 border-champagne-500 text-champagne-600' : 'text-warm-400 hover:text-warm-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="font-poppins text-xs text-warm-600 mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="input-luxury"
                />
              </div>
            )}

            <div>
              <label className="font-poppins text-xs text-warm-600 mb-1.5 block">Email</label>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="input-luxury"
              />
            </div>

            <div>
              <label className="font-poppins text-xs text-warm-600 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-luxury pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-700"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="font-poppins text-xs text-red-500 bg-red-50 p-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <p className="text-center font-poppins text-xs text-warm-400 mt-6">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(''); }} className="text-champagne-600 hover:text-champagne-700 font-medium">
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
