import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Building2,
  Search,
  Filter,
  Edit,
  CheckCircle,
  XCircle,
  AlertOctagon,
  X,
  Loader2,
  RefreshCw,
  MapPin,
  Users,
  ShieldCheck,
  Power
} from 'lucide-react';

const GaushalasPage = () => {
  const [gaushalas, setGaushalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingGaushala, setEditingGaushala] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    registrationId: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    totalCapacity: 50,
    status: 'APPROVED',
    availableServices: []
  });
  const [saving, setSaving] = useState(false);

  const fetchGaushalas = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/gaushalas');
      if (res.data.success) {
        setGaushalas(res.data.gaushalas);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching Gaushalas from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGaushalas();
  }, []);

  const openEditModal = (g) => {
    setEditingGaushala(g);
    setEditForm({
      name: g.name || '',
      registrationId: g.registrationId || '',
      address: g.address || '',
      city: g.city || '',
      state: g.state || '',
      pincode: g.pincode || '',
      totalCapacity: g.totalCapacity || 50,
      status: g.status || 'APPROVED',
      availableServices: g.availableServices || []
    });
    setEditModalOpen(true);
  };

  const handleToggleService = (service) => {
    setEditForm((prev) => {
      const exists = prev.availableServices.includes(service);
      return {
        ...prev,
        availableServices: exists
          ? prev.availableServices.filter((s) => s !== service)
          : [...prev.availableServices, service]
      };
    });
  };

  const handleSaveGaushala = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.put(`/admin/gaushalas/${editingGaushala._id}`, editForm);
      if (res.data.success) {
        setSuccessMsg(`Gaushala "${editForm.name}" updated successfully.`);
        setEditModalOpen(false);
        fetchGaushalas();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating Gaushala.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusChange = async (gaushalaId, newStatus) => {
    try {
      const res = await api.put(`/admin/gaushalas/${gaushalaId}/status`, { status: newStatus });
      if (res.data.success) {
        setSuccessMsg(`Status updated to ${newStatus}.`);
        fetchGaushalas();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error changing status.');
    }
  };

  const filteredGaushalas = gaushalas.filter((g) => {
    const matchesSearch =
      g.name?.toLowerCase().includes(search.toLowerCase()) ||
      g.city?.toLowerCase().includes(search.toLowerCase()) ||
      g.state?.toLowerCase().includes(search.toLowerCase()) ||
      g.owner?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E1D5] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#593713]">Gaushala Organizations</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF6ED] text-[#80501D] border border-[#D9CEBF]">
              {gaushalas.length} Total
            </span>
          </div>
          <p className="text-sm text-[#7D6B58] mt-1">
            Real-time shelter profiles, owner details, capacity, and active status stored in MongoDB Atlas.
          </p>
        </div>
        <button
          onClick={fetchGaushalas}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FAF6ED] text-[#80501D] border border-[#D9CEBF] hover:bg-[#F3ECE0] transition-colors disabled:opacity-60 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Shelters</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E1D5] shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F7E6F]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by shelter name, owner, city or state..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9CEBF] text-sm focus:border-[#80501D] focus:ring-1 focus:ring-[#80501D] outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#7D6B58]" />
          <span className="text-xs font-bold text-[#7D6B58] uppercase">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#D9CEBF] text-xs font-semibold text-[#372A1C] bg-white focus:border-[#80501D] outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved / Active</option>
            <option value="PENDING">Pending Review</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Gaushala Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-[#7D6B58]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#80501D] mb-3" />
          <p className="text-sm font-semibold">Loading Gaushalas from MongoDB Atlas...</p>
        </div>
      ) : filteredGaushalas.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-[#7D6B58] border border-[#E8E1D5]">
          <Building2 className="w-10 h-10 mx-auto text-[#D9CEBF] mb-2" />
          <p className="text-base font-bold text-[#372A1C]">No Gaushalas found</p>
          <p className="text-xs mt-1">Try searching with a different city or status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredGaushalas.map((g) => {
            const isApproved = g.status === 'APPROVED';
            const isSuspended = g.status === 'SUSPENDED';

            return (
              <div
                key={g._id}
                className="bg-white rounded-2xl border border-[#E8E1D5] shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Title & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#372A1C] leading-snug">{g.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#7D6B58] mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#80501D]" />
                        <span>
                          {g.city}, {g.state} {g.pincode ? `(${g.pincode})` : ''}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F4E6] text-[#35632A] border border-[#CDE5C9]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Approved
                        </span>
                      ) : isSuspended ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3.5 h-3.5" />
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE8DD] mb-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#593713]">Owner Account:</span>
                      <span className="font-semibold text-[#372A1C]">{g.owner?.name || 'Assigned Owner'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#7D6B58] mt-1 font-mono">
                      <span>Phone: {g.owner?.phone || '—'}</span>
                      <span>{g.owner?.email || ''}</span>
                    </div>
                  </div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="p-2.5 rounded-xl bg-[#FAF6ED] border border-[#EAE2D5]">
                      <div className="text-[10px] font-bold text-[#8F7E6F] uppercase">Capacity</div>
                      <div className="text-base font-extrabold text-[#372A1C] mt-0.5">{g.totalCapacity || 50}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#FAF6ED] border border-[#EAE2D5]">
                      <div className="text-[10px] font-bold text-[#8F7E6F] uppercase">Cows In Care</div>
                      <div className="text-base font-extrabold text-[#557B42] mt-0.5">{g.cowCount || 0}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#FAF6ED] border border-[#EAE2D5]">
                      <div className="text-[10px] font-bold text-[#8F7E6F] uppercase">Branches</div>
                      <div className="text-base font-extrabold text-[#80501D] mt-0.5">{g.branchCount || 1}</div>
                    </div>
                  </div>

                  {/* Available Services */}
                  <div className="mb-4">
                    <div className="text-[10px] font-bold uppercase text-[#8F7E6F] mb-1.5">Enabled Services:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {g.availableServices && g.availableServices.length > 0 ? (
                        g.availableServices.map((svc) => (
                          <span
                            key={svc}
                            className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FAF3E7] text-[#80501D] border border-[#E8DEC8]"
                          >
                            {svc}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#AD9F8F]">None specified</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-4 border-t border-[#EFE8DD] flex items-center justify-between gap-2">
                  <button
                    onClick={() => openEditModal(g)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#80501D] bg-[#FAF3E7] hover:bg-[#F3E6D0] transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {isSuspended ? (
                      <button
                        onClick={() => handleQuickStatusChange(g._id, 'APPROVED')}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>Reactivate</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleQuickStatusChange(g._id, 'SUSPENDED')}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>Suspend</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Gaushala Modal */}
      {editModalOpen && editingGaushala && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-[#E8E1D5] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE8DD] mb-5">
              <div>
                <h3 className="text-lg font-bold text-[#372A1C]">Edit Gaushala Organization</h3>
                <p className="text-xs text-[#7D6B58]">Modifying shelter information saved in MongoDB.</p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-lg text-[#7D6B58] hover:bg-[#FAF6ED]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGaushala} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-[#593713] uppercase mb-1">Gaushala Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEBF] text-sm focus:border-[#80501D] outline-none"
                  required
                />
              </div>

              {/* Reg ID & Capacity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#593713] uppercase mb-1">Registration ID</label>
                  <input
                    type="text"
                    value={editForm.registrationId}
                    onChange={(e) => setEditForm({ ...editForm, registrationId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEBF] text-sm focus:border-[#80501D] outline-none"
                    placeholder="e.g. GAUSH-108"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#593713] uppercase mb-1">Total Capacity</label>
                  <input
                    type="number"
                    value={editForm.totalCapacity}
                    onChange={(e) => setEditForm({ ...editForm, totalCapacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEBF] text-sm focus:border-[#80501D] outline-none"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-[#593713] uppercase mb-1">Full Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEBF] text-sm focus:border-[#80501D] outline-none"
                  required
                />
              </div>

              {/* City, State, Pincode */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#593713] uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEBF] text-sm focus:border-[#80501D] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#593713] uppercase mb-1">State</label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEBF] text-sm focus:border-[#80501D] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#593713] uppercase mb-1">Pincode</label>
                  <input
                    type="text"
                    value={editForm.pincode}
                    onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEBF] text-sm focus:border-[#80501D] outline-none"
                    required
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-[#593713] uppercase mb-1">Organization Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEBF] text-sm focus:border-[#80501D] outline-none bg-white"
                >
                  <option value="APPROVED">APPROVED (Active on Platform)</option>
                  <option value="PENDING">PENDING (Under Review)</option>
                  <option value="SUSPENDED">SUSPENDED (Temporarily Hidden)</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              {/* Available Services Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-[#593713] uppercase mb-2">Available Services</label>
                <div className="grid grid-cols-2 gap-2">
                  {['RESCUE', 'VETERINARY', 'SURRENDER', 'AMBULANCE'].map((svc) => (
                    <label
                      key={svc}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E8E1D5] hover:bg-[#FAF8F5] cursor-pointer text-xs font-semibold"
                    >
                      <input
                        type="checkbox"
                        checked={editForm.availableServices.includes(svc)}
                        onChange={() => handleToggleService(svc)}
                        className="rounded text-[#80501D] focus:ring-[#80501D]"
                      />
                      <span>{svc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFE8DD]">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#7D6B58] hover:bg-[#FAF6ED]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#80501D] text-white text-xs font-bold hover:bg-[#684117] disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Organization</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaushalasPage;

