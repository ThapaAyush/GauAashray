import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Building2,
  FileCheck,
  HeartPulse,
  Stethoscope,
  Home,
  Layers,
  AlertTriangle,
  Users,
  CheckCircle2,
  ArrowRight,
  Shield,
  Loader2
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.stats);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-stone-900">Platform Super Administration</h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Central authority overseeing Gaushala approvals, platform requests, complaints and network integrity
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/applications"
              className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm hover:shadow-md transition space-y-2 group"
            >
              <div className="flex items-center justify-between text-amber-600">
                <span className="text-[11px] font-bold uppercase tracking-wider">Pending Apps</span>
                <FileCheck className="w-5 h-5 group-hover:scale-110 transition" />
              </div>
              <p className="text-3xl font-black text-amber-700">{stats?.pendingApplications || 0}</p>
              <p className="text-xs text-stone-500">Gaushalas awaiting approval</p>
            </Link>

            <Link
              to="/admin/gaushalas"
              className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition space-y-2 group"
            >
              <div className="flex items-center justify-between text-[#80501D]">
                <span className="text-[11px] font-bold uppercase tracking-wider">Approved Gaushalas</span>
                <Building2 className="w-5 h-5 group-hover:scale-110 transition" />
              </div>
              <p className="text-3xl font-black text-[#80501D]">{stats?.approvedGaushalas || 0}</p>
              <p className="text-xs text-stone-500">Verified shelters in network</p>
            </Link>

            <Link
              to="/admin/requests"
              className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition space-y-2 group"
            >
              <div className="flex items-center justify-between text-red-600">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Rescues</span>
                <HeartPulse className="w-5 h-5 group-hover:scale-110 transition" />
              </div>
              <p className="text-3xl font-black text-red-600">{stats?.totalRescues || 0}</p>
              <p className="text-xs text-stone-500">
                {stats?.activeRescues || 0} active in progress
              </p>
            </Link>

            <Link
              to="/admin/complaints"
              className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition space-y-2 group"
            >
              <div className="flex items-center justify-between text-rose-600">
                <span className="text-[11px] font-bold uppercase tracking-wider">Open Complaints</span>
                <AlertTriangle className="w-5 h-5 group-hover:scale-110 transition" />
              </div>
              <p className="text-3xl font-black text-rose-700">{stats?.totalComplaints || 0}</p>
              <p className="text-xs text-stone-500">Citizen feedback cases</p>
            </Link>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 text-xs">
              <span className="text-stone-400 font-semibold block">Total Registered Cows</span>
              <p className="text-xl font-bold text-stone-900 mt-1">{stats?.totalCows || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 text-xs">
              <span className="text-stone-400 font-semibold block">Doctor Requests</span>
              <p className="text-xl font-bold text-stone-900 mt-1">{stats?.totalDoctorRequests || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 text-xs">
              <span className="text-stone-400 font-semibold block">Surrender Applications</span>
              <p className="text-xl font-bold text-stone-900 mt-1">{stats?.totalSurrenders || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 text-xs">
              <span className="text-stone-400 font-semibold block">Public Users</span>
              <p className="text-xl font-bold text-stone-900 mt-1">{stats?.totalUsers || 0}</p>
            </div>
          </div>

          {/* Quick Action Navigation Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-stone-900 text-sm">Review Pending Applications</h3>
              <p className="text-xs text-stone-500">
                Inspect Gaushala registration documents and approve new shelters into the network.
              </p>
              <Link
                to="/admin/applications"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#80501D] hover:underline pt-2"
              >
                Go to Applications <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-stone-900 text-sm">Interactive Network Map</h3>
              <p className="text-xs text-stone-500">
                Live geospatial visualization of branches and active street emergency incidents.
              </p>
              <Link
                to="/admin/map"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#80501D] hover:underline pt-2"
              >
                Open Network Map <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-stone-900 text-sm">Investigate Complaints</h3>
              <p className="text-xs text-stone-500">
                Review complaints about delayed rescues, misconduct or refused requests.
              </p>
              <Link
                to="/admin/complaints"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#80501D] hover:underline pt-2"
              >
                Resolve Complaints <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

