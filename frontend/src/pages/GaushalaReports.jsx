import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart3, TrendingUp, CheckCircle2, Warehouse, HeartPulse, Loader2 } from 'lucide-react';

export default function GaushalaReports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/gaushalas/stats')
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.stats);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#593713]">Shelter Performance & Reports</h1>
        <p className="text-xs text-stone-500">
          Monthly rescue turnaround, shelter intake, and medical visit completion rates
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Cows Under Daily Shelter Care
            </span>
            <p className="text-4xl font-extrabold text-[#557B42]">{stats?.totalCows || 0}</p>
            <p className="text-xs text-stone-500">
              Active residents housed safely across all organization branches.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Emergency Rescues Completed
            </span>
            <p className="text-4xl font-extrabold text-[#80501D]">{stats?.activeRescues || 0} Active</p>
            <p className="text-xs text-stone-500">
              Coordinated ambulance and rescue operations dispatched.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Available Intake Capacity
            </span>
            <p className="text-4xl font-extrabold text-[#D6A23A]">{stats?.availableCapacity || 0}</p>
            <p className="text-xs text-stone-500">
              Remaining shelter slots for incoming surrenders or rescued cows.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

