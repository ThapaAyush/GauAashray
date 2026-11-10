import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ImageUpload from '../components/ImageUpload';
import {
  Layers,
  Plus,
  Search,
  Filter,
  ArrowRightLeft,
  Syringe,
  Skull,
  MapPin,
  CheckCircle2,
  Loader2,
  Tag
} from 'lucide-react';

export default function CowManagement() {
  const { user, branches, activeBranch } = useAuth();
  const [cows, setCows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [conditionFilter, setConditionFilter] = useState('ALL');

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [transferModal, setTransferModal] = useState(null);
  const [vaccineModal, setVaccineModal] = useState(null);
  const [deceasedModal, setDeceasedModal] = useState(null);

  // Add Cow Form
  const [newCow, setNewCow] = useState({
    name: '',
    breed: 'Desi / Indigenous',
    gender: 'COW',
    ageYears: '',
    source: 'DONATED',
    healthCondition: 'HEALTHY',
    tagNumber: '',
    notes: '',
    branchId: '',
    photographs: []
  });

  // Transfer Form
  const [targetBranchId, setTargetBranchId] = useState('');
  const [transferReason, setTransferReason] = useState('Capacity balancing');

  // Vaccine Form
  const [vaccineName, setVaccineName] = useState('FMD (Foot & Mouth Disease)');
  const [doctorName, setDoctorName] = useState('');

  // Deceased Form
  const [deceasedReason, setDeceasedReason] = useState('Old age / natural passing');

  const [saving, setSaving] = useState(false);

  const fetchCows = async () => {
    setLoading(true);
    try {
      let url = `/cows?search=${search}`;
      if (conditionFilter !== 'ALL') url += `&healthCondition=${conditionFilter}`;
      if (activeBranch) url += `&branchId=${activeBranch._id}`;

      const res = await api.get(url);
      if (res.data.success) {
        setCows(res.data.cows || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching cows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCows();
  }, [activeBranch, conditionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCows();
  };

  const handleCreateCow = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/cows', {
        ...newCow,
        branchId: newCow.branchId || activeBranch?._id || branches[0]?._id
      });
      setAddModal(false);
      setNewCow({
        name: '',
        breed: 'Desi / Indigenous',
        gender: 'COW',
        ageYears: '',
        source: 'DONATED',
        healthCondition: 'HEALTHY',
        tagNumber: '',
        notes: '',
        branchId: '',
        photographs: []
      });
      fetchCows();
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering cow');
    } finally {
      setSaving(false);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferModal || !targetBranchId) return;

    setSaving(true);
    try {
      await api.put(`/cows/${transferModal._id}/transfer`, {
        targetBranchId,
        reason: transferReason
      });
      setTransferModal(null);
      fetchCows();
    } catch (err) {
      alert(err.response?.data?.message || 'Error transferring cow');
    } finally {
      setSaving(false);
    }
  };

  const handleVaccineSubmit = async (e) => {
    e.preventDefault();
    if (!vaccineModal || !vaccineName) return;

    setSaving(true);
    try {
      await api.put(`/cows/${vaccineModal._id}`, {
        vaccination: {
          vaccineName,
          doctorName: doctorName || 'Staff Vet',
          dateAdministered: new Date()
        }
      });
      setVaccineModal(null);
      fetchCows();
    } catch (err) {
      alert('Error recording vaccine');
    } finally {
      setSaving(false);
    }
  };

  const handleDeceasedSubmit = async (e) => {
    e.preventDefault();
    if (!deceasedModal) return;

    setSaving(true);
    try {
      await api.put(`/cows/${deceasedModal._id}/deceased`, {
        deceasedReason
      });
      setDeceasedModal(null);
      fetchCows();
    } catch (err) {
      alert('Error updating deceased record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#593713]">Digital Cow Database</h1>
          <p className="text-xs text-stone-500">
            {total} registered cows in shelter care across organization branches
          </p>
        </div>

        <button
          onClick={() => {
            setNewCow({
              ...newCow,
              branchId: activeBranch?._id || branches[0]?._id || ''
            });
            setAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#80501D] hover:bg-[#593713] text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Register New Cow
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Cow ID, tag number, name, or breed..."
            className="flex-1 px-4 py-2.5 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-2xl transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-stone-200 text-xs font-semibold text-stone-700 focus:outline-none"
          >
            <option value="ALL">All Health Conditions</option>
            <option value="HEALTHY">Healthy</option>
            <option value="IN_TREATMENT">In Treatment</option>
            <option value="CRITICAL">Critical</option>
            <option value="QUARANTINE">Quarantine</option>
            <option value="DECEASED">Deceased Records</option>
          </select>
        </div>
      </div>

      {/* Cow Cards Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
        </div>
      ) : cows.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-stone-400">
          No cow records matching current filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cows.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-black text-stone-900 block">
                      {c.cowId}
                    </span>
                    <h3 className="font-bold text-stone-900 text-base">{c.name}</h3>
                  </div>
                  <StatusBadge status={c.healthCondition} />
                </div>

                {/* Photo */}
                <div className="h-40 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                  <img
                    src={
                      c.photographs && c.photographs[0]
                        ? c.photographs[0]
                        : 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={c.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1 text-xs text-stone-600">
                  <p>
                    Breed: <strong>{c.breed}</strong> ({c.gender})
                  </p>
                  <p>
                    Source: <span className="font-semibold">{c.source}</span> • Age: {c.ageYears ? `${c.ageYears} yrs` : 'Unknown'}
                  </p>
                  {c.tagNumber && (
                    <p className="flex items-center gap-1 text-stone-700">
                      <Tag className="w-3.5 h-3.5 text-stone-400" />
                      Tag: <span className="font-mono font-bold">{c.tagNumber}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-1 text-stone-500 truncate">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    Branch: {c.currentBranch?.name || 'Main Branch'}
                  </p>
                  {c.notes && <p className="text-[11px] text-stone-500 italic truncate">"{c.notes}"</p>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-100 grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  onClick={() => {
                    setTransferModal(c);
                    setTargetBranchId(branches.find((b) => b._id !== c.currentBranch?._id)?._id || '');
                  }}
                  className="p-1.5 rounded-lg bg-stone-50 hover:bg-[#FAF6ED] text-[#80501D] font-semibold text-center border border-stone-200 flex items-center justify-center gap-1"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  Transfer
                </button>

                <button
                  onClick={() => setVaccineModal(c)}
                  className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold text-center border border-stone-200 flex items-center justify-center gap-1"
                >
                  <Syringe className="w-3 h-3 text-[#557B42]" />
                  Vaccine
                </button>

                {c.healthCondition !== 'DECEASED' && (
                  <button
                    onClick={() => setDeceasedModal(c)}
                    className="p-1.5 rounded-lg bg-stone-50 hover:bg-red-50 text-stone-600 hover:text-red-700 font-semibold text-center border border-stone-200 flex items-center justify-center gap-1"
                  >
                    <Skull className="w-3 h-3" />
                    Deceased
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register New Cow Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-stone-900">Register Cow in Database</h3>

            <form onSubmit={handleCreateCow} className="space-y-4">
              <ImageUpload
                value={newCow.photographs}
                onChange={(urls) => setNewCow({ ...newCow, photographs: urls })}
                label="Cow Photographs"
                maxFiles={2}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Cow Name
                  </label>
                  <input
                    type="text"
                    value={newCow.name}
                    onChange={(e) => setNewCow({ ...newCow, name: e.target.value })}
                    placeholder="e.g. Gauri"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Breed
                  </label>
                  <input
                    type="text"
                    value={newCow.breed}
                    onChange={(e) => setNewCow({ ...newCow, breed: e.target.value })}
                    placeholder="e.g. Gir / Sahiwal / Desi"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Gender
                  </label>
                  <select
                    value={newCow.gender}
                    onChange={(e) => setNewCow({ ...newCow, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  >
                    <option value="COW">Cow (गौमाता)</option>
                    <option value="BULL">Bull (नंदी)</option>
                    <option value="CALF">Calf (बछड़ा/बछड़ी)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    value={newCow.ageYears}
                    onChange={(e) => setNewCow({ ...newCow, ageYears: e.target.value })}
                    placeholder="e.g. 4"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Source
                  </label>
                  <select
                    value={newCow.source}
                    onChange={(e) => setNewCow({ ...newCow, source: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  >
                    <option value="RESCUE">Rescue</option>
                    <option value="SURRENDER">Surrender</option>
                    <option value="BORN">Born in Shelter</option>
                    <option value="DONATED">Donated</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Ear Tag / ID Number
                  </label>
                  <input
                    type="text"
                    value={newCow.tagNumber}
                    onChange={(e) => setNewCow({ ...newCow, tagNumber: e.target.value })}
                    placeholder="e.g. TAG-DEL-201"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Assigned Branch
                  </label>
                  <select
                    value={newCow.branchId}
                    onChange={(e) => setNewCow({ ...newCow, branchId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  >
                    {branches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Health Notes
                </label>
                <textarea
                  rows={2}
                  value={newCow.notes}
                  onChange={(e) => setNewCow({ ...newCow, notes: e.target.value })}
                  placeholder="Physical markings, health background, calm nature..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#80501D] hover:bg-[#593713] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Register Cow'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Branch Modal */}
      {transferModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900">
              Transfer Cow: {transferModal.name} ({transferModal.cowId})
            </h3>
            <p className="text-xs text-stone-500">
              Current Branch: {transferModal.currentBranch?.name || 'Main Branch'}
            </p>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Target Destination Branch
                </label>
                <select
                  value={targetBranchId}
                  onChange={(e) => setTargetBranchId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                >
                  <option value="">Select branch</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({b.city}) - Cap left: {(b.totalCapacity || 50) - (b.currentCows || 0)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Reason for Transfer
                </label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#80501D] text-white text-xs font-bold rounded-xl"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vaccine Modal */}
      {vaccineModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900">
              Record Vaccination: {vaccineModal.name}
            </h3>

            <form onSubmit={handleVaccineSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Vaccine Name
                </label>
                <input
                  type="text"
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Administering Doctor
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Alok Verma"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVaccineModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#557B42] text-white text-xs font-bold rounded-xl"
                >
                  Save Vaccination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deceased Modal */}
      {deceasedModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-red-700">
              Mark Cow Deceased: {deceasedModal.name}
            </h3>
            <p className="text-xs text-stone-500">
              Record passing with proper legal and religious dignity
            </p>

            <form onSubmit={handleDeceasedSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Cause of Passing
                </label>
                <textarea
                  rows={2}
                  value={deceasedReason}
                  onChange={(e) => setDeceasedReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeceasedModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl"
                >
                  Confirm Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

