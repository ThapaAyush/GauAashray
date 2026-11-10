import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { KeyRound, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function ForgotPassword() {
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneOrEmail) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/forgot-password', { phoneOrEmail });
      if (res.data.success) {
        navigate('/reset-password', {
          state: {
            phoneOrEmail,
            devOtp: res.data.devOtp
          }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error generating reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 bg-[#F8F7F3] flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Logo" className="h-16 w-auto mx-auto object-contain" />
          <h2 className="mt-2 text-2xl font-bold text-[#593713]">Forgot Password</h2>
          <p className="text-xs text-stone-500">
            Enter your registered mobile or email to receive reset instructions
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-stone-200">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Registered Mobile or Email
              </label>
              <input
                type="text"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                placeholder="e.g. 9811122233"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#80501D] hover:bg-[#593713] transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Request Reset OTP'}
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

