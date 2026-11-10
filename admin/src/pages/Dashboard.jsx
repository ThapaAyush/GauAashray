import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Users,
  Building2,
  Ambulance,
  HeartPulse,
  Home,
  CheckCircle2,
  Clock,
  Database,
  ArrowRight,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading dashboard statistics from MongoDB.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E1D5] shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#593713]">Dashboard Overview</h1>
          <p className="text-sm text-[#7D6B58] mt-1">
            Real-time telemetry and management controls powered by MongoDB Atlas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FAF6ED] text-[#80501D] border border-[#D9CEBF] hover:bg-[#F3ECE0] transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Stats</span>
          </button>
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#E8F4E6] text-[#35632A] text-xs font-bold border border-[#C5E4C0]">
            <Database className="w-3.5 h-3.5" />
            <span>MongoDB: Connected</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D5] shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#8F7E6F] uppercase tracking-wider">Registered Citizens</p>
              <h3 className="text-3xl font-extrabold text-[#372A1C] mt-2">
                {loading ? '...' : stats?.totalUsers ?? 0}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-[#F0EBE1] text-[#80501D]">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center justify-between text-xs">
            <span className="text-[#7D6B58]">Public community accounts</span>
            <Link to="/users" className="font-semibold text-[#80501D] hover:underline flex items-center gap-1">
              Manage Users &rarr;
            </Link>
          </div>
        </div>

        {/* Total Gaushalas */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D5] shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#8F7E6F] uppercase tracking-wider">Gaushala Shelters</p>
              <h3 className="text-3xl font-extrabold text-[#372A1C] mt-2">
                {loading ? '...' : stats?.totalGaushalas ?? 0}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-[#E8F4E6] text-[#35632A]">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center justify-between text-xs">
            <span className="text-[#35632A] font-medium">
              {stats?.approvedGaushalas ?? 0} Approved / Active
            </span>
            <Link to="/gaushalas" className="font-semibold text-[#80501D] hover:underline flex items-center gap-1">
              View Gaushalas &rarr;
            </Link>
          </div>
        </div>

        {/* Rescues In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D5] shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#8F7E6F] uppercase tracking-wider">Active Rescues</p>
              <h3 className="text-3xl font-extrabold text-[#D9534F] mt-2">
                {loading ? '...' : stats?.activeRescues ?? 0}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-red-50 text-red-600">
              <Ambulance className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center justify-between text-xs">
            <span className="text-[#7D6B58]">{stats?.completedRescues ?? 0} completed safely</span>
            <Link to="/requests" className="font-semibold text-[#80501D] hover:underline flex items-center gap-1">
              Track Rescues &rarr;
            </Link>
          </div>
        </div>

        {/* Medical Requests */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D5] shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#8F7E6F] uppercase tracking-wider">Medical Requests</p>
              <h3 className="text-3xl font-extrabold text-[#372A1C] mt-2">
                {loading ? '...' : stats?.totalDoctorRequests ?? 0}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
              <HeartPulse className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center justify-between text-xs">
            <span className="text-[#7D6B58]">Veterinary Doctor visits</span>
            <Link to="/requests" className="font-semibold text-[#80501D] hover:underline flex items-center gap-1">
              Details &rarr;
            </Link>
          </div>
        </div>

        {/* Surrender Requests */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D5] shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#8F7E6F] uppercase tracking-wider">Surrender Requests</p>
              <h3 className="text-3xl font-extrabold text-[#372A1C] mt-2">
                {loading ? '...' : stats?.totalSurrenders ?? 0}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
              <Home className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center justify-between text-xs">
            <span className="text-[#7D6B58]">Shelter admissions</span>
            <Link to="/requests" className="font-semibold text-[#80501D] hover:underline flex items-center gap-1">
              Details &rarr;
            </Link>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D5] shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#8F7E6F] uppercase tracking-wider">Pending Gaushala Approvals</p>
              <h3 className="text-3xl font-extrabold text-[#E67E22] mt-2">
                {loading ? '...' : stats?.pendingApplications ?? 0}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center justify-between text-xs">
            <span className="text-[#7D6B58]">Requires Super Admin sign-off</span>
            <Link to="/gaushalas" className="font-semibold text-[#80501D] hover:underline flex items-center gap-1">
              Review &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* User Management Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E1D5] shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-[#80501D]/10 text-[#80501D]">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#372A1C]">User & Gaushala Owners Database</h2>
          </div>
          <p className="text-sm text-[#7D6B58] mb-4">
            Search, filter, edit details (name, phone, role, status), reset passwords, or delete user accounts directly in MongoDB.
          </p>
          <Link
            to="/users"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#80501D] hover:bg-[#684117] text-white text-xs font-bold transition-colors"
          >
            <span>Open User Management</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Gaushala Management Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E1D5] shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-[#557B42]/10 text-[#557B42]">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#372A1C]">Gaushala Organization Control</h2>
          </div>
          <p className="text-sm text-[#7D6B58] mb-4">
            Review registered Gaushalas, edit capacities, addresses, and available services, or suspend/reactivate listings in real-time.
          </p>
          <Link
            to="/gaushalas"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#557B42] hover:bg-[#436234] text-white text-xs font-bold transition-colors"
          >
            <span>Open Gaushala Management</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

