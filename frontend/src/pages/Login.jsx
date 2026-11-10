import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Phone, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function Login() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/home';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId || !password) {
      setError('Please provide phone number/email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await login(loginId, password);
      if (data && data.user) {
        if (data.user.role === 'SUPER_ADMIN') {
          navigate('/admin/dashboard');
        } else if (data.user.role === 'GAUSHALA_OWNER') {
          if (data.user.gaushala?.status === 'APPROVED') {
            navigate('/gaushala/dashboard');
          } else {
            navigate('/application-status');
          }
        } else {
          navigate(from === '/login' ? '/home' : from);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid credentials. Please verify your phone and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper for 1-click test sign in
  const fillCredentials = (id, pass) => {
    setLoginId(id);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8F7F3]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo */}
        <Link to="/" className="inline-block group">
          <img
            src="/logo.png"
            alt="GauAashray Logo"
            className="h-20 w-auto mx-auto object-contain group-hover:scale-105 transition"
          />
        </Link>
        <h2 className="mt-3 text-3xl font-extrabold text-[#593713] tracking-tight">
          GauAashray
        </h2>
        <p className="mt-1 text-xs font-semibold text-[#80501D]">
          Every Cow Deserves Care, Shelter & Love.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-stone-200">
          {location.state?.message && !error && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-[#80501D] font-bold">
              <Lock className="w-4 h-4 shrink-0 text-[#80501D] mt-0.5" />
              <span>{location.state.message}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Mobile Number or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. 9811122233 or admin@gauaashray.org"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#D6A23A] bg-white text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#80501D] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#D6A23A] bg-white text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#80501D] hover:bg-[#593713] shadow-md transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Create Account link */}
          <div className="mt-6 text-center text-xs text-stone-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#80501D] font-bold hover:underline">
              Create Account
            </Link>
          </div>

          {/* Quick Demo Credentials for Reviewers */}
          <div className="mt-8 pt-6 border-t border-stone-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#D6A23A]" />
              Quick Test Credentials
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => fillCredentials('admin@gauaashray.org', 'Admin@GauAashray2026')}
                className="p-2 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 text-left transition truncate"
              >
                🛡️ Super Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('9811122233', 'Owner@GauAashray2026')}
                className="p-2 rounded-lg bg-[#80501D] text-white font-medium hover:bg-[#593713] text-left transition truncate"
              >
                🐄 Approved Gaushala
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('9833344455', 'Owner@GauAashray2026')}
                className="p-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 text-left transition truncate"
              >
                ⏳ Pending Gaushala
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('9899900011', 'User@GauAashray2026')}
                className="p-2 rounded-lg bg-[#557B42] text-white font-medium hover:bg-[#436333] text-left transition truncate"
              >
                👤 Public User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

