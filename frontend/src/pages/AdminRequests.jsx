import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { HeartPulse, Stethoscope, Home, MapPin, Loader2 } from 'lucide-react';

export default function AdminRequests() {
  const [activeTab, setActiveTab] = useState('RESCUE');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/requests?type=${activeTab}`);
      if (res.data.success) {
        setRequests(res.data.requests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Platform Request Monitoring</h1>
          <p className="text-xs text-stone-500">
            Central audit of all citizen rescue, veterinary, and surrender requests nationwide
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-stone-200">
          <button
            onClick={() => setActiveTab('RESCUE')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'RESCUE' ? 'bg-[#80501D] text-white shadow-sm' : 'text-stone-600'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            Rescue Operations
          </button>

          <button
            onClick={() => setActiveTab('MEDICAL')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'MEDICAL' ? 'bg-[#80501D] text-white shadow-sm' : 'text-stone-600'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Veterinary Doctor
          </button>

          <button
            onClick={() => setActiveTab('SURRENDER')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'SURRENDER' ? 'bg-[#80501D] text-white shadow-sm' : 'text-stone-600'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Cow Surrender
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-sm">No requests found.</div>
        ) : (
          <div className="divide-y divide-stone-100">
            {requests.map((r) => (
              <div key={r._id} className="p-5 hover:bg-stone-50/80 transition flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-stone-900">
                      {r.trackingId || r.requestId}
                    </span>
                    <StatusBadge status={r.status} />
                    {r.urgency === 'Critical Emergency' && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        CRITICAL
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-800 font-semibold">
                    {r.cowCondition ? `${r.cowCondition} Cow` : r.cowName ? `Cow: ${r.cowName}` : 'Incident Report'}
                  </p>
                  <p className="text-xs text-stone-500 flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    {r.addressText}
                  </p>
                  {r.assignedGaushala && (
                    <p className="text-xs text-[#80501D] font-medium">
                      Assigned: {r.assignedGaushala.name} ({r.assignedGaushala.city})
                    </p>
                  )}
                </div>

                <div className="text-right text-xs text-stone-400">
                  <p>{new Date(r.createdAt).toLocaleDateString()}</p>
                  <p className="text-[11px] text-stone-500">{r.reporterName || r.ownerName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

