import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Search,
  Filter,
  Loader2,
  Building,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [viewModal, setViewModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [changesModal, setChangesModal] = useState(null);
  const [changesNotes, setChangesNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let url = '/admin/applications';
      if (statusFilter !== 'ALL') url += `?status=${statusFilter}`;
      const res = await api.get(url);
      if (res.data.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleApprove = async (appId) => {
    if (!window.confirm('Approve this Gaushala organization into the live public network?')) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/applications/${appId}/approve`, {
        notes: 'Verified and approved by Super Admin.'
      });
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModal || !rejectionReason) return;

    setActionLoading(true);
    try {
      await api.put(`/admin/applications/${rejectModal._id}/reject`, {
        rejectionReason
      });
      setRejectModal(null);
      setRejectionReason('');
      fetchApplications();
    } catch (err) {
      alert('Error rejecting application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangesSubmit = async (e) => {
    e.preventDefault();
    if (!changesModal || !changesNotes) return;

    setActionLoading(true);
    try {
      await api.put(`/admin/applications/${changesModal._id}/request-changes`, {
        notes: changesNotes
      });
      setChangesModal(null);
      setChangesNotes('');
      fetchApplications();
    } catch (err) {
      alert('Error requesting changes');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = applications.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const gName = a.gaushala?.name?.toLowerCase() || '';
    const oName = a.owner?.name?.toLowerCase() || '';
    const city = a.gaushala?.city?.toLowerCase() || '';
    return gName.includes(q) || oName.includes(q) || city.includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Gaushala Applications</h1>
          <p className="text-xs text-stone-500">
            Verify legal credentials, inspect shelter capacity and grant official operational status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold bg-white text-stone-700"
          >
            <option value="ALL">All Application Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CHANGES_REQUIRED">Changes Required</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-sm">No applications found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-6 py-3.5">Organization / ID</th>
                  <th className="px-6 py-3.5">Owner Contact</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((app) => (
                  <tr key={app._id} className="hover:bg-stone-50/80 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-stone-900 text-sm">{app.gaushala?.name}</p>
                      <span className="font-mono text-[11px] text-[#80501D]">
                        {app.gaushala?.registrationId || 'Pending ID generation'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-800">{app.owner?.name}</p>
                      <p className="text-stone-500">{app.owner?.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-stone-600">
                      {app.gaushala?.city}, {app.gaushala?.state}
                    </td>
                    <td className="px-6 py-4 text-stone-400">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setViewModal(app)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                      >
                        Inspect
                      </button>

                      {app.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(app._id)}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setChangesModal(app);
                              setChangesNotes('');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-800 transition"
                          >
                            Changes
                          </button>
                          <button
                            onClick={() => {
                              setRejectModal(app);
                              setRejectionReason('');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Application Modal */}
      {viewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-lg text-stone-900">{viewModal.gaushala?.name}</h3>
                <p className="text-xs text-stone-500">
                  Application ID: <span className="font-mono">{viewModal._id}</span>
                </p>
              </div>
              <StatusBadge status={viewModal.status} />
            </div>

            <div className="space-y-3 text-xs text-stone-700">
              <div className="bg-stone-50 p-3 rounded-xl space-y-1">
                <p>
                  <strong>Owner:</strong> {viewModal.owner?.name} ({viewModal.owner?.phone})
                </p>
                <p>
                  <strong>Email:</strong> {viewModal.owner?.email || 'N/A'}
                </p>
                <p>
                  <strong>Address:</strong> {viewModal.gaushala?.address}, {viewModal.gaushala?.city},{' '}
                  {viewModal.gaushala?.state} - {viewModal.gaushala?.pincode}
                </p>
                <p>
                  <strong>GPS Coordinates:</strong> [
                  {viewModal.gaushala?.location?.coordinates?.join(', ')}]
                </p>
                <p>
                  <strong>Capacity:</strong> {viewModal.gaushala?.totalCapacity} Cows (Current:{' '}
                  {viewModal.gaushala?.currentCows || 0})
                </p>
                <p>
                  <strong>Eligible Services:</strong>{' '}
                  {viewModal.gaushala?.availableServices?.join(', ')}
                </p>
              </div>

              {/* Review notes if any */}
              {viewModal.reviewNotes && (
                <div className="p-3 bg-[#FAF6ED] rounded-xl border border-[#D6A23A]/30">
                  <strong>Review Notes:</strong> {viewModal.reviewNotes}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setViewModal(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 rounded-xl hover:bg-stone-100"
              >
                Close
              </button>

              {viewModal.status === 'PENDING' && (
                <button
                  type="button"
                  onClick={() => {
                    handleApprove(viewModal._id);
                    setViewModal(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  Approve Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-red-700">
              Reject Application: {rejectModal.gaushala?.name}
            </h3>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="State clear reasons why verification failed..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Changes Modal */}
      {changesModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-orange-700">
              Request Changes: {changesModal.gaushala?.name}
            </h3>
            <form onSubmit={handleChangesSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Changes Required *
                </label>
                <textarea
                  rows={3}
                  value={changesNotes}
                  onChange={(e) => setChangesNotes(e.target.value)}
                  placeholder="e.g. Upload clear copy of trust deed or update doctor registration proof"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setChangesModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl"
                >
                  Send Changes Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

