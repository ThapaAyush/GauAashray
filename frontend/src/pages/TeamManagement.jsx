import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Users, Truck, Plus, Phone, CheckCircle2, Loader2 } from 'lucide-react';

export default function TeamManagement() {
  const { user, branches, activeBranch } = useAuth();
  const [members, setMembers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [addVehicleModal, setAddVehicleModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [newMember, setNewMember] = useState({
    name: '',
    phone: '',
    role: 'RESCUE_WORKER',
    assignedBranchId: ''
  });

  const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: '',
    type: 'AMBULANCE',
    capacity: 2,
    driverId: '',
    assignedBranchId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, vRes] = await Promise.all([
        api.get('/team/members'),
        api.get('/team/vehicles')
      ]);
      setMembers(mRes.data.members || []);
      setVehicles(vRes.data.vehicles || []);
    } catch (err) {
      console.error('Error fetching team:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeBranch]);

  const handleCreateMember = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/team/members', {
        ...newMember,
        assignedBranchId: newMember.assignedBranchId || activeBranch?._id || branches[0]?._id
      });
      setAddMemberModal(false);
      setNewMember({ name: '', phone: '', role: 'RESCUE_WORKER', assignedBranchId: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding member');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/team/vehicles', {
        ...newVehicle,
        assignedBranchId: newVehicle.assignedBranchId || activeBranch?._id || branches[0]?._id
      });
      setAddVehicleModal(false);
      setNewVehicle({ vehicleNumber: '', type: 'AMBULANCE', capacity: 2, driverId: '', assignedBranchId: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding vehicle');
    } finally {
      setSaving(false);
    }
  };

  const drivers = members.filter((m) => m.role === 'DRIVER');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#593713]">Staff & Rescue Teams</h1>
        <p className="text-xs text-stone-500">
          Rescue managers, workers, drivers and emergency transport fleet
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rescue Staff Members */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#80501D]" />
                <h2 className="text-base font-bold text-stone-900">Rescue Staff Members</h2>
              </div>
              <button
                onClick={() => setAddMemberModal(true)}
                className="px-3 py-1.5 bg-[#80501D] text-white rounded-xl text-xs font-bold hover:bg-[#593713] transition"
              >
                + Add Staff
              </button>
            </div>

            {members.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">No staff members registered.</p>
            ) : (
              <div className="divide-y divide-stone-100">
                {members.map((m) => (
                  <div key={m._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-stone-800 text-sm">{m.name}</h4>
                      <p className="text-stone-500">
                        {m.role.replace('_', ' ')} • Branch: {m.assignedBranch?.name || 'Main'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-stone-700">{m.phone}</span>
                      <span className="block text-[10px] text-green-700 font-bold">
                        {m.isAvailable ? 'Available' : 'Busy'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rescue Fleet & Vehicles */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#80501D]" />
                <h2 className="text-base font-bold text-stone-900">Rescue Transport Fleet</h2>
              </div>
              <button
                onClick={() => setAddVehicleModal(true)}
                className="px-3 py-1.5 bg-[#80501D] text-white rounded-xl text-xs font-bold hover:bg-[#593713] transition"
              >
                + Add Vehicle
              </button>
            </div>

            {vehicles.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">No vehicles registered.</p>
            ) : (
              <div className="divide-y divide-stone-100">
                {vehicles.map((v) => (
                  <div key={v._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-mono font-bold text-stone-900 text-sm">{v.vehicleNumber}</h4>
                      <p className="text-stone-500">
                        Type: <strong className="text-[#80501D]">{v.type}</strong> • Capacity: {v.capacity} cows
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-stone-600 block">
                        Driver: {v.driver?.name || 'Unassigned'}
                      </span>
                      <span className="text-[10px] font-bold text-green-700">
                        {v.isAvailable ? 'Active' : 'In Service'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {addMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900">Register Rescue Staff</h3>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                >
                  <option value="RESCUE_MANAGER">Rescue Manager</option>
                  <option value="RESCUE_WORKER">Rescue Worker</option>
                  <option value="DRIVER">Ambulance Driver</option>
                  <option value="TRANSPORT_STAFF">Transport Staff</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddMemberModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#80501D] text-white text-xs font-bold rounded-xl"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {addVehicleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900">Add Rescue Vehicle</h3>

            <form onSubmit={handleCreateVehicle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={newVehicle.vehicleNumber}
                  onChange={(e) => setNewVehicle({ ...newVehicle, vehicleNumber: e.target.value })}
                  placeholder="e.g. DL1L-4421"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={newVehicle.type}
                    onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  >
                    <option value="AMBULANCE">Cow Ambulance</option>
                    <option value="RESCUE_VAN">Rescue Van</option>
                    <option value="TRUCK">Transport Truck</option>
                    <option value="PICKUP">Pickup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Cow Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newVehicle.capacity}
                    onChange={(e) => setNewVehicle({ ...newVehicle, capacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Assigned Driver
                </label>
                <select
                  value={newVehicle.driverId}
                  onChange={(e) => setNewVehicle({ ...newVehicle, driverId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                >
                  <option value="">Select driver</option>
                  {drivers.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddVehicleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#80501D] text-white text-xs font-bold rounded-xl"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

