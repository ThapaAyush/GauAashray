import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [phoneOrEmail, setPhoneOrEmail] = useState(location.state?.phoneOrEmail || '');
  const [otp, setOtp] = useState(location.state?.devOtp || '');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneOrEmail || !otp || !newPassword) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/reset-password', {
        phoneOrEmail,
        otp,
        newPassword
      });
      if (res.data.success) {
        alert('Password reset successful! Please log in.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 bg-[#F8F7F3] flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Logo" className="h-16 w-auto mx-auto object-contain" />
          <h2 className="mt-2 text-2xl font-bold text-[#593713]">Reset Password</h2>
          <p className="text-xs text-stone-500">Enter the verification OTP and choose a new password</p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-stone-200">
          {location.state?.devOtp && (
            <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#D6A23A]" />
              <span>Dev Reset OTP: <strong>{location.state.devOtp}</strong></span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Phone / Email
              </label>
              <input
                type="text"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                6-Digit Verification OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="e.g. 123456"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#80501D] hover:bg-[#593713] transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set New Password'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-xs text-[#80501D] font-bold hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

