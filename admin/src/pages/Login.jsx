import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ShieldCheck, Database, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Set permanent credentials as requested
  const [identifier, setIdentifier] = useState('ayush108ayush108@gmail.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('Please provide your mobile number/email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6ED] flex flex-col justify-center items-center px-4 py-8 relative selection:bg-[#D6A23A] selection:text-white">
      {/* Background soft ambient accents */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#D6A23A]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#80501D]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-[#E8E1D5] mb-3">
            <img src="/logo.png" alt="GauAashray Logo" className="h-12 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#593713] tracking-tight">GauAashray</h1>
          <p className="text-xs uppercase tracking-widest text-[#8F7253] font-bold mt-1">Super Admin Command Center</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8F4E6] text-[#35632A] border border-[#C5E4C0]">
            <Database className="w-3 h-3 text-[#419634]" />
            <span>MongoDB Atlas Live Connected</span>
          </div>
        </div>

        {/* Login Card Matching User's Design */}
        <div className="bg-white rounded-2xl border border-[#E8E1D5] shadow-lg shadow-[#593713]/5 p-7 md:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#372A1C]">Welcome Admin</h2>
            <p className="text-sm text-[#7D6B58] mt-0.5">Sign in to manage users, gaushalas, and rescue operations.</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Identifier field */}
            <div>
              <label className="block text-xs font-bold text-[#593713] tracking-wider uppercase mb-1.5">
                MOBILE NUMBER OR EMAIL
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9811122233 or admin@gauaashray.org"
                className="w-full px-4 py-3 rounded-xl border border-[#D9CEBF] focus:border-[#80501D] focus:ring-2 focus:ring-[#80501D]/20 outline-none text-[#372A1C] text-sm placeholder:text-[#AD9F8F] transition-all bg-[#FAF8F5]/50 focus:bg-white"
                required
              />
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#593713] tracking-wider uppercase">
                  PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password is permanently saved as: 123456 in your MongoDB Atlas database.')}
                  className="text-xs text-[#80501D] hover:text-[#593713] font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-[#D9CEBF] focus:border-[#80501D] focus:ring-2 focus:ring-[#80501D]/20 outline-none text-[#372A1C] text-sm placeholder:text-[#AD9F8F] transition-all bg-[#FAF8F5]/50 focus:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8F7E6F] hover:text-[#593713] transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-[#80501D]" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#80501D] hover:bg-[#6A4116] active:bg-[#593713] text-white font-semibold text-sm shadow-md shadow-[#80501D]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Credentials badge indicator */}
          <div className="mt-6 pt-5 border-t border-[#EFE8DD] text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF6ED] text-[#70563C] text-xs border border-[#E4D9C9]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#80501D]" />
              <span>Configured Super Admin: <strong>ayush108ayush108@gmail.com</strong></span>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6 text-xs text-[#8F7E6F]">
          <p>Running separately on Port 5174 &bull; GauAashray Administration System</p>
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-2 text-[#80501D] font-semibold hover:underline"
          >
            &larr; Switch to Public & Gaushala Website (Port 5173)
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;

