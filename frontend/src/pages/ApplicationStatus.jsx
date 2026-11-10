import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Clock, CheckCircle2, XCircle, AlertTriangle, RefreshCw, LayoutDashboard, LogOut } from 'lucide-react';

export default function ApplicationStatus() {
  const { user, refreshUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gaushalas/my-profile');
      if (res.data.success) {
        setProfile(res.data.gaushala);
        await refreshUser();
      }
    } catch (err) {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const status = profile?.status || user?.gaushala?.status || 'PENDING';

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-[#F8F7F3] flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Logo" className="h-16 w-auto mx-auto object-contain" />
          <h2 className="mt-3 text-2xl font-bold text-[#593713]">
            Gaushala Application Status
          </h2>
          <p className="text-xs text-stone-500">
            Verification status for {profile?.name || user?.name}
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-stone-200 text-center space-y-5">
          {/* Status Icon */}
          <div className="flex justify-center">
            {status === 'APPROVED' && (
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            )}
            {(status === 'PENDING' || status === 'UNDER_REVIEW') && (
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Clock className="w-10 h-10 animate-pulse" />
              </div>
            )}
            {status === 'CHANGES_REQUIRED' && (
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <AlertTriangle className="w-10 h-10" />
              </div>
            )}
            {status === 'REJECTED' && (
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <XCircle className="w-10 h-10" />
              </div>
            )}
          </div>

          <div>
            <StatusBadge status={status} />
            <h3 className="text-lg font-bold text-stone-900 mt-2">
              {status === 'APPROVED' && 'Gaushala Approved!'}
              {status === 'PENDING' && 'Application Under Initial Review'}
              {status === 'UNDER_REVIEW' && 'Credentials Being Verified'}
              {status === 'CHANGES_REQUIRED' && 'Additional Details Required'}
              {status === 'REJECTED' && 'Application Rejected'}
              {status === 'SUSPENDED' && 'Account Suspended'}
            </h3>
            <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto">
              {status === 'APPROVED' &&
                'Your organization has been officially verified by Super Admin. You can now access full shelter operations, accept rescues and manage cows.'}
              {status === 'PENDING' &&
                'Thank you for registering. Central administration is reviewing your submitted registration documents and shelter facilities.'}
              {status === 'UNDER_REVIEW' &&
                'Your documents and veterinary facilities are actively being cross-checked. You will receive real-time notification upon decision.'}
              {status === 'CHANGES_REQUIRED' &&
                (profile?.changesRequestedNotes || 'Please update your documents or details per the admin note.')}
              {status === 'REJECTED' &&
                (profile?.rejectionReason || 'Application does not meet current verification guidelines.')}
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2 space-y-2">
            {status === 'APPROVED' ? (
              <button
                onClick={() => navigate('/gaushala/dashboard')}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#80501D] hover:bg-[#593713] shadow-md transition flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Gaushala Dashboard
              </button>
            ) : (
              <button
                onClick={fetchProfile}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-[#80501D] bg-[#FAF6ED] hover:bg-[#FAF6ED]/80 border border-[#D6A23A]/40 transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh Status
              </button>
            )}

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full py-2 px-4 text-xs text-stone-500 hover:text-stone-800 transition flex items-center justify-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

