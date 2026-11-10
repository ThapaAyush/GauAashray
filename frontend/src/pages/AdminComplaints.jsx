import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { AlertTriangle, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolveModal, setResolveModal] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/complaints');
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolveModal) return;

    setSaving(true);
    try {
      await api.put(`/admin/complaints/${resolveModal._id}`, {
        status: 'RESOLVED',
        adminNotes
      });
      setResolveModal(null);
      setAdminNotes('');
      fetchComplaints();
    } catch (err) {
      alert('Error updating complaint');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-stone-900">Complaint Investigation & Redressal</h1>
        <p className="text-xs text-stone-500">
          Investigate reports regarding delayed response, misconduct or unauthorized service rejections
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-stone-400 text-sm">
          No complaints registered in system.
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-stone-900">{c.subject}</span>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                    {c.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.status} />
                  <span className="text-xs text-stone-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-xl">
                {c.description}
              </p>

              <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                <span>
                  Complainant: <strong>{c.complainantName}</strong> ({c.complainantPhone})
                </span>
                {c.gaushala && (
                  <span className="text-[#80501D] font-semibold">
                    Regarding: {c.gaushala.name}
                  </span>
                )}
              </div>

              {c.adminNotes && (
                <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <strong>Resolution:</strong> {c.adminNotes}
                </div>
              )}

              {c.status === 'OPEN' && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setResolveModal(c);
                      setAdminNotes('');
                    }}
                    className="px-4 py-1.5 bg-[#80501D] text-white text-xs font-bold rounded-xl hover:bg-[#593713]"
                  >
                    Investigate & Resolve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {resolveModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900">Resolve Complaint</h3>
            <p className="text-xs text-stone-500">Subject: {resolveModal.subject}</p>

            <form onSubmit={handleResolve} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Investigation & Resolution Notes *
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Spoke with Gaushala manager. Ambulance delayed due to roadblock, reporter informed."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  Mark Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

