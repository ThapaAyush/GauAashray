import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { HeartPulse, Stethoscope, Home, Compass, Calendar, MapPin, Loader2 } from 'lucide-react';

export default function MyRequests() {
  const [activeTab, setActiveTab] = useState('RESCUE');
  const [rescues, setRescues] = useState([]);
  const [medical, setMedical] = useState([]);
  const [surrenders, setSurrenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, mRes, sRes] = await Promise.all([
        api.get('/rescue/my-requests').catch(() => ({ data: { requests: [] } })),
        api.get('/medical/my-requests').catch(() => ({ data: { requests: [] } })),
        api.get('/surrender/my-requests').catch(() => ({ data: { requests: [] } }))
      ]);

      setRescues(rRes.data.requests || []);
      setMedical(mRes.data.requests || []);
      setSurrenders(sRes.data.requests || []);
    } catch (err) {
      console.error('Error fetching user requests:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#593713]">My Submitted Requests</h1>
          <p className="text-xs text-stone-500">Track and monitor your live assistance cases</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-stone-200">
          <button
            onClick={() => setActiveTab('RESCUE')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'RESCUE'
                ? 'bg-[#80501D] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            Rescue ({rescues.length})
          </button>

          <button
            onClick={() => setActiveTab('MEDICAL')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'MEDICAL'
                ? 'bg-[#80501D] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Doctor ({medical.length})
          </button>

          <button
            onClick={() => setActiveTab('SURRENDER')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'SURRENDER'
                ? 'bg-[#80501D] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Surrender ({surrenders.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
          <p className="text-xs text-stone-500 mt-2">Loading your requests...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Rescue List */}
          {activeTab === 'RESCUE' && (
            <>
              {rescues.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-3">
                  <p className="text-sm font-semibold text-stone-700">No rescue reports submitted yet.</p>
                  <Link
                    to="/report-cow"
                    className="inline-block px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
                  >
                    Report a Street Cow
                  </Link>
                </div>
              ) : (
                rescues.map((r) => (
                  <div
                    key={r._id}
                    className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-stone-900">
                          {r.trackingId}
                        </span>
                        <StatusBadge status={r.status} />
                        {r.urgency === 'Critical Emergency' && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-stone-800">{r.cowCondition} Cow</p>
                      <p className="text-xs text-stone-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        {r.addressText}
                      </p>
                      {r.assignedGaushala && (
                        <p className="text-xs text-[#80501D] font-medium">
                          Assigned: {r.assignedGaushala.name}
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <span className="text-[11px] text-stone-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                      <Link
                        to={`/track-request?id=${r.trackingId}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FAF6ED] hover:bg-[#FAF6ED]/80 text-[#80501D] border border-[#D6A23A]/40 text-xs font-bold transition"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        Track Live
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Doctor Requests */}
          {activeTab === 'MEDICAL' && (
            <>
              {medical.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-3">
                  <p className="text-sm font-semibold text-stone-700">No doctor requests found.</p>
                  <Link
                    to="/request-doctor"
                    className="inline-block px-4 py-2 bg-[#80501D] text-white rounded-xl text-xs font-bold hover:bg-[#593713]"
                  >
                    Request a Veterinary Doctor
                  </Link>
                </div>
              ) : (
                medical.map((m) => (
                  <div
                    key={m._id}
                    className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-stone-900">{m.requestId}</span>
                        <StatusBadge status={m.status} />
                      </div>
                      <p className="text-sm font-bold text-stone-800">
                        {m.cowName} • <span className="font-normal text-xs text-stone-600">{m.symptoms}</span>
                      </p>
                      <p className="text-xs text-stone-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        {m.addressText}
                      </p>
                      {m.assignedDoctor && (
                        <p className="text-xs text-blue-700 font-semibold">
                          Assigned: Dr. {m.assignedDoctor.name} ({m.assignedDoctor.specialization})
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <span className="text-[11px] text-stone-400">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                      {m.scheduledDate && (
                        <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                          Scheduled: {new Date(m.scheduledDate).toLocaleDateString()}
                        </span>
                      )}
                      <Link
                        to={`/track-request?id=${m.requestId}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FAF6ED] hover:bg-[#FAF6ED]/80 text-[#80501D] border border-[#D6A23A]/40 text-xs font-bold transition"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        Track Live
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Surrender Requests */}
          {activeTab === 'SURRENDER' && (
            <>
              {surrenders.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-3">
                  <p className="text-sm font-semibold text-stone-700">No surrender applications yet.</p>
                  <Link
                    to="/surrender-cow"
                    className="inline-block px-4 py-2 bg-[#557B42] text-white rounded-xl text-xs font-bold hover:bg-[#436333]"
                  >
                    Submit Cow Surrender
                  </Link>
                </div>
              ) : (
                surrenders.map((s) => (
                  <div
                    key={s._id}
                    className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-stone-900">{s.requestId}</span>
                        <StatusBadge status={s.status} />
                      </div>
                      <p className="text-sm font-bold text-stone-800">
                        {s.cowName} ({s.breed}) • Reason: {s.reason}
                      </p>
                      <p className="text-xs text-stone-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        {s.addressText}
                      </p>
                      {s.assignedGaushala && (
                        <p className="text-xs text-[#557B42] font-semibold">
                          Reviewing Shelter: {s.assignedGaushala.name}
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <span className="text-[11px] text-stone-400">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                      <Link
                        to={`/track-request?id=${s.requestId}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FAF6ED] hover:bg-[#FAF6ED]/80 text-[#80501D] border border-[#D6A23A]/40 text-xs font-bold transition"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        Track Live
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

