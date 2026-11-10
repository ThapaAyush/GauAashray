import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  GitBranch,
  Layers,
  HeartPulse,
  Stethoscope,
  Warehouse,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  Phone,
  MapPin
} from 'lucide-react';

export default function GaushalaDashboard() {
  const { user, activeBranch } = useAuth();
  const [stats, setStats] = useState(null);
  const [incomingRescues, setIncomingRescues] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sRes, rRes, aRes] = await Promise.all([
        api.get('/gaushalas/stats').catch(() => ({ data: { stats: {} } })),
        api.get('/rescue/gaushala/requests?status=Under Verification').catch(() => ({ data: { requests: [] } })),
        api.get('/doctors/appointments').catch(() => ({ data: { appointments: [] } }))
      ]);

      setStats(sRes.data.stats || {});
      setIncomingRescues(rRes.data.requests?.slice(0, 4) || []);
      setUpcomingAppointments(aRes.data.appointments?.slice(0, 4) || []);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeBranch]);

  const handleAcceptRescue = async (id) => {
    try {
      await api.put(`/rescue/${id}/accept`);
      fetchDashboardData();
    } catch (err) {
      alert('Error accepting request.');
    }
  };

  const handleRejectRescue = async (id) => {
    const reason = prompt('Please specify reason for declining:');
    if (!reason) return;
    try {
      await api.put(`/rescue/${id}/reject`, { reason });
      fetchDashboardData();
    } catch (err) {
      alert('Error rejecting request.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#593713]">
            {user?.gaushala?.name || 'Gaushala Console'}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Operational center for multi-branch rescue and cow shelter management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/gaushala/requests"
            className="px-4 py-2 bg-[#80501D] hover:bg-[#593713] text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Review Incoming Requests
          </Link>
        </div>
      </div>

      {/* Section 11 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Branches</span>
            <GitBranch className="w-4 h-4 text-[#80501D]" />
          </div>
          <p className="text-2xl font-extrabold text-stone-900">{stats?.totalBranches || 1}</p>
          <span className="text-[10px] text-stone-500">Active centers</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Cows</span>
            <Layers className="w-4 h-4 text-[#557B42]" />
          </div>
          <p className="text-2xl font-extrabold text-[#557B42]">{stats?.totalCows || 0}</p>
          <span className="text-[10px] text-stone-500">In shelter care</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Rescues</span>
            <HeartPulse className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-extrabold text-red-600">{stats?.activeRescues || 0}</p>
          <span className="text-[10px] text-stone-500">In progress</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Doctors</span>
            <Stethoscope className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600">{stats?.totalDoctors || 0}</p>
          <span className="text-[10px] text-stone-500">Registered vets</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Capacity Left</span>
            <Warehouse className="w-4 h-4 text-[#D6A23A]" />
          </div>
          <p className="text-2xl font-extrabold text-[#D6A23A]">{stats?.availableCapacity || 0}</p>
          <span className="text-[10px] text-stone-500">Available slots</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Visits</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-600">{stats?.pendingAppointments || 0}</p>
          <span className="text-[10px] text-stone-500">Scheduled visits</span>
        </div>
      </div>

      {/* Main Grid: Urgent New Requests & Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Urgent New Incoming Requests */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-stone-900">New Rescue Requests</h2>
              <p className="text-xs text-stone-500">
                Matched to your shelter branches based on distance & capability
              </p>
            </div>
            <Link
              to="/gaushala/requests"
              className="text-xs font-bold text-[#80501D] hover:underline flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-stone-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#80501D]" />
            </div>
          ) : incomingRescues.length === 0 ? (
            <div className="py-12 text-center text-stone-400 space-y-1">
              <HeartPulse className="w-8 h-8 mx-auto text-stone-300" />
              <p className="text-xs font-semibold">No pending rescue incidents awaiting verification.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incomingRescues.map((r) => (
                <div
                  key={r._id}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-[#FAF6ED]/40 transition space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-900">
                          {r.trackingId}
                        </span>
                        <StatusBadge status={r.status} />
                        {r.calculatedDistanceKm && (
                          <span className="text-[10px] font-semibold text-[#80501D] bg-[#FAF6ED] px-2 py-0.5 rounded-full">
                            {r.calculatedDistanceKm} km away
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-stone-900 mt-1">
                        {r.cowCondition} Cow
                      </p>
                    </div>

                    {r.photographs && r.photographs[0] && (
                      <img
                        src={r.photographs[0]}
                        alt="Cow"
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                      />
                    )}
                  </div>

                  <p className="text-xs text-stone-600 flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    {r.addressText}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                    <span className="text-xs text-stone-600 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      {r.reporterName} ({r.reporterPhone})
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRejectRescue(r._id)}
                        className="px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAcceptRescue(r._id)}
                        className="px-3 py-1 rounded-lg bg-[#80501D] hover:bg-[#593713] text-white text-xs font-semibold transition shadow-sm"
                      >
                        Accept & Dispatch
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Doctor Visits */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-stone-900">Upcoming Doctor Visits</h2>
              <p className="text-xs text-stone-500">Scheduled clinical home visits</p>
            </div>
            <Link
              to="/gaushala/appointments"
              className="text-xs font-bold text-[#80501D] hover:underline flex items-center gap-1"
            >
              All Visits
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="py-12 text-center text-stone-400 space-y-1">
              <Calendar className="w-8 h-8 mx-auto text-stone-300" />
              <p className="text-xs font-semibold">No upcoming appointments scheduled.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((a) => (
                <div
                  key={a._id}
                  className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800">{a.customerName}</span>
                    <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      {a.timeSlot}
                    </span>
                  </div>
                  <p className="text-stone-600">
                    Cow: <span className="font-semibold">{a.cowName || 'Cow'}</span>
                  </p>
                  <p className="text-stone-500 truncate">{a.locationAddress}</p>
                  {a.doctor && (
                    <p className="text-blue-700 font-semibold pt-1">
                      Assigned: Dr. {a.doctor.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

