import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  FileHeart,
  Ambulance,
  HeartPulse,
  Home,
  RefreshCw,
  Loader2,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';

const RequestsPage = () => {
  const [requestType, setRequestType] = useState('RESCUE'); // RESCUE | MEDICAL | SURRENDER
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/requests', {
        params: { type: requestType }
      });
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [requestType]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E1D5] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#593713]">Platform Requests</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF6ED] text-[#80501D] border border-[#D9CEBF]">
              {requests.length} Cases
            </span>
          </div>
          <p className="text-sm text-[#7D6B58] mt-1">
            Real-time feed of emergency rescue calls, vet doctor visits, and surrender admissions from MongoDB.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FAF6ED] text-[#80501D] border border-[#D9CEBF] hover:bg-[#F3ECE0] transition-colors disabled:opacity-60 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E1D5] pb-1">
        <button
          onClick={() => setRequestType('RESCUE')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            requestType === 'RESCUE'
              ? 'bg-[#80501D] text-white shadow-sm'
              : 'text-[#7D6B58] hover:bg-[#FAF6ED]'
          }`}
        >
          <Ambulance className="w-4 h-4" />
          <span>Emergency Rescues</span>
        </button>

        <button
          onClick={() => setRequestType('MEDICAL')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            requestType === 'MEDICAL'
              ? 'bg-[#80501D] text-white shadow-sm'
              : 'text-[#7D6B58] hover:bg-[#FAF6ED]'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Doctor / Medical</span>
        </button>

        <button
          onClick={() => setRequestType('SURRENDER')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            requestType === 'SURRENDER'
              ? 'bg-[#80501D] text-white shadow-sm'
              : 'text-[#7D6B58] hover:bg-[#FAF6ED]'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Surrenders</span>
        </button>
      </div>

      {/* Table / List */}
      <div className="bg-white rounded-2xl border border-[#E8E1D5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-[#7D6B58]">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#80501D] mb-3" />
            <p className="text-sm font-semibold">Fetching {requestType.toLowerCase()} requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-[#7D6B58]">
            <FileHeart className="w-10 h-10 mx-auto text-[#D9CEBF] mb-2" />
            <p className="text-base font-bold text-[#372A1C]">No {requestType.toLowerCase()} requests recorded</p>
            <p className="text-xs mt-1">New requests submitted from the portal will appear here immediately.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E1D5] text-[11px] uppercase tracking-wider text-[#7D6B58] font-bold">
                  <th className="py-3.5 px-5">Tracking ID</th>
                  <th className="py-3.5 px-4">Condition / Details</th>
                  <th className="py-3.5 px-4">Citizen Contact</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Assigned Gaushala</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DD] text-sm">
                {requests.map((r) => (
                  <tr key={r._id} className="hover:bg-[#FAF6ED]/50 transition-colors">
                    {/* Tracking ID */}
                    <td className="py-3.5 px-5 font-mono text-xs font-bold text-[#80501D]">
                      {r.trackingId || r._id.slice(-6).toUpperCase()}
                    </td>

                    {/* Condition */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#372A1C] text-xs">
                        {r.cowCondition || r.reason || r.healthIssue || 'General Care'}
                      </div>
                      {r.urgency && (
                        <span className="text-[10px] font-bold text-red-600 uppercase">
                          Urgency: {r.urgency}
                        </span>
                      )}
                    </td>

                    {/* Reporter */}
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-bold text-[#372A1C]">{r.reporterName || 'Citizen'}</div>
                      <div className="text-[#7D6B58] font-mono">{r.reporterPhone || '—'}</div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-xs">
                      <div className="flex items-center gap-1 text-[#593713]">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-[#80501D]" />
                        <span className="line-clamp-1">{r.addressText || r.address || 'Location provided'}</span>
                      </div>
                    </td>

                    {/* Assigned Gaushala */}
                    <td className="py-3.5 px-4 text-xs">
                      {r.assignedGaushala ? (
                        <div>
                          <span className="font-bold text-[#372A1C]">{r.assignedGaushala.name}</span>
                          <div className="text-[11px] text-[#7D6B58]">{r.assignedGaushala.city}</div>
                        </div>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-200">
                          Broadcasting to 5 Nearest
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF6ED] text-[#80501D] border border-[#D9CEBF]">
                        {r.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-5 text-right text-xs text-[#7D6B58] font-mono">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsPage;

