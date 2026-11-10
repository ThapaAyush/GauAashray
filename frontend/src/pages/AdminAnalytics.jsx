import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, TrendingUp, Layers, HeartPulse, Building2, Stethoscope, Loader2 } from 'lucide-react';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then((res) => {
        if (res.data.success) {
          setData(res.data.analytics);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-stone-900">Platform Analytics & Intelligence</h1>
        <p className="text-xs text-stone-500">
          City distributions, rescue conditions, and nationwide shelter intake trends
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Totals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-stone-200 text-center">
              <HeartPulse className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-3xl font-black text-stone-900">{data?.totalRescued || 0}</p>
              <p className="text-xs text-stone-500 font-medium">Cows Rescued</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 text-center">
              <Layers className="w-6 h-6 text-[#557B42] mx-auto mb-2" />
              <p className="text-3xl font-black text-stone-900">{data?.totalSheltered || 0}</p>
              <p className="text-xs text-stone-500 font-medium">Under Permanent Shelter</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 text-center">
              <Stethoscope className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-black text-stone-900">{data?.totalVisits || 0}</p>
              <p className="text-xs text-stone-500 font-medium">Doctor Visits Concluded</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 text-center">
              <Building2 className="w-6 h-6 text-[#80501D] mx-auto mb-2" />
              <p className="text-3xl font-black text-stone-900">{data?.totalSurrendered || 0}</p>
              <p className="text-xs text-stone-500 font-medium">Surrenders Integrated</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* City Distribution */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-stone-900">
                City-wise Gaushala Activity
              </h3>
              <div className="space-y-2">
                {data?.cityDistribution?.map((c) => (
                  <div key={c._id} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100">
                    <span className="font-semibold text-stone-800">{c._id || 'Unknown City'}</span>
                    <span className="font-bold text-[#80501D] bg-[#FAF6ED] px-2.5 py-0.5 rounded-full">
                      {c.count} Shelters
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Condition Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-stone-900">
                Rescue Incident Case Breakdown
              </h3>
              <div className="space-y-2">
                {data?.conditionDistribution?.map((cd) => (
                  <div key={cd._id} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100">
                    <span className="font-semibold text-stone-800">{cd._id} Case</span>
                    <span className="font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full">
                      {cd.count} Reports
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

