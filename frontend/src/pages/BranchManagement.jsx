import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LocationPicker from '../components/LocationPicker';
import {
  GitBranch,
  Plus,
  Building,
  MapPin,
  Clock,
  Phone,
  Layers,
  Users,
  Stethoscope,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export default function BranchManagement() {
  const { user, activeBranch, setActiveBranch, branches, setBranches } = useAuth();
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newBranch, setNewBranch] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    totalCapacity: 50,
    operatingHours: '24/7 Emergency Service',
    availableServices: ['RESCUE', 'VETERINARY', 'SURRENDER'],
    latitude: 28.6139,
    longitude: 77.2090
  });

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gaushalas/my-branches');
      if (res.data.success) {
        setBranches(res.data.branches || []);
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/gaushalas/branches', newBranch);
      setAddModal(false);
      setNewBranch({
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        totalCapacity: 50,
        operatingHours: '24/7 Emergency Service',
        availableServices: ['RESCUE', 'VETERINARY', 'SURRENDER'],
        latitude: 28.6139,
        longitude: 77.2090
      });
      fetchBranches();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating branch');
    } finally {
      setSaving(false);
    }
  };

  const toggleService = (srv) => {
    const list = [...newBranch.availableServices];
    if (list.includes(srv)) {
      setNewBranch({ ...newBranch, availableServices: list.filter((s) => s !== srv) });
    } else {
      setNewBranch({ ...newBranch, availableServices: [...list, srv] });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#593713]">Multi-Branch Management</h1>
          <p className="text-xs text-stone-500">
            One organization account managing independent shelter locations, capacities and staff
          </p>
        </div>

        <button
          onClick={() => setAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#80501D] hover:bg-[#593713] text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add New Branch Center
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((b) => {
            const isCurrent = activeBranch?._id === b._id;
            const remaining = (b.totalCapacity || 50) - (b.currentCows || 0);
            return (
              <div
                key={b._id}
                className={`bg-white rounded-3xl p-6 border shadow-sm transition space-y-4 flex flex-col justify-between ${
                  isCurrent ? 'border-[#80501D] ring-2 ring-[#80501D]/20' : 'border-stone-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#80501D] block">
                        {b.branchId}
                      </span>
                      <h3 className="font-bold text-stone-900 text-base">{b.name}</h3>
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={() => setActiveBranch(b)}
                        className="text-[10px] font-bold text-stone-600 bg-stone-100 hover:bg-[#FAF6ED] hover:text-[#80501D] px-2.5 py-1 rounded-full transition"
                      >
                        Set Active
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-stone-600">
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      {b.address}, {b.city}, {b.state}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      {b.phone || 'Standard helpline'}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      {b.operatingHours}
                    </p>
                  </div>

                  {/* Resource counts */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-stone-100 text-center text-xs">
                    <div className="bg-stone-50 p-2 rounded-xl">
                      <p className="font-bold text-stone-800">{b.currentCows || 0}</p>
                      <span className="text-[10px] text-stone-400">Cows</span>
                    </div>
                    <div className="bg-stone-50 p-2 rounded-xl">
                      <p className="font-bold text-blue-700">{b.doctorCount || 0}</p>
                      <span className="text-[10px] text-stone-400">Doctors</span>
                    </div>
                    <div className="bg-stone-50 p-2 rounded-xl">
                      <p className="font-bold text-[#557B42]">{remaining}</p>
                      <span className="text-[10px] text-stone-400">Slots Left</span>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="pt-1 flex flex-wrap gap-1">
                    {b.availableServices?.map((s) => (
                      <span
                        key={s}
                        className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#FAF6ED] text-[#80501D] rounded"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Branch Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-stone-900">Add New Branch Location</h3>

            <form onSubmit={handleCreateBranch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Branch Name *
                </label>
                <input
                  type="text"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  placeholder="e.g. Shri Krishna Gaushala - North Shelter"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              {/* Location Picker */}
              <LocationPicker
                address={newBranch.address}
                latitude={newBranch.latitude}
                longitude={newBranch.longitude}
                onLocationChange={(loc) => {
                  setNewBranch({
                    ...newBranch,
                    address: loc.address,
                    latitude: loc.latitude,
                    longitude: loc.longitude
                  });
                }}
              />

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={newBranch.city}
                    onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={newBranch.state}
                    onChange={(e) => setNewBranch({ ...newBranch, state: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    value={newBranch.pincode}
                    onChange={(e) => setNewBranch({ ...newBranch, pincode: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Branch Phone
                  </label>
                  <input
                    type="tel"
                    value={newBranch.phone}
                    onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Max Cow Capacity
                  </label>
                  <input
                    type="number"
                    value={newBranch.totalCapacity}
                    onChange={(e) => setNewBranch({ ...newBranch, totalCapacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1.5">
                  Available Services
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['RESCUE', 'VETERINARY', 'SURRENDER'].map((srv) => (
                    <button
                      type="button"
                      key={srv}
                      onClick={() => toggleService(srv)}
                      className={`py-1.5 px-2 rounded-xl border text-xs font-semibold ${
                        newBranch.availableServices.includes(srv)
                          ? 'border-[#80501D] bg-[#FAF6ED] text-[#80501D]'
                          : 'border-stone-200 text-stone-400'
                      }`}
                    >
                      {srv}
                    </button>
                  ))}
                </div>
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
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

