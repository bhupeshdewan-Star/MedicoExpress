import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';

export default function Login() {
  const { login } = useAuth() as any;
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setError('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Authentication credentials rejected.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-2xl p-8">
        
        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <Logo size={90} className="mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl tracking-tight text-slate-900 dark:text-slate-100">ClinCommand OS™</h2>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">Medical Affairs Operations Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-md flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin / med_manager"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-button bg-white dark:bg-slate-950 text-sm focus:border-brand-teal"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-button bg-white dark:bg-slate-950 text-sm focus:border-brand-teal"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-teal text-white rounded-button text-sm font-semibold hover:bg-brand-teal-dark transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Credentials helper panel */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 leading-relaxed space-y-1">
          <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Dev Sandbox Access:</span>
          <div>• Admin Login: <code className="text-brand-teal-dark font-semibold">admin</code></div>
          <div>• Manager Login: <code className="text-brand-teal-dark font-semibold">med_manager</code></div>
          <div>• Password: <code className="text-slate-700 dark:text-slate-300">password123</code></div>
        </div>

      </div>
    </div>
  );
}
