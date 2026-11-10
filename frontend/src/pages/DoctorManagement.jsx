import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Stethoscope,
  Plus,
  Phone,
  Mail,
  Clock,
  Award,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function DoctorManagement() {
  const { user, branches, activeBranch } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    qualification: 'B.V.Sc & A.H',
    registrationNumber: '',
    specialization: 'General Veterinary Medicine',
    workingHours: '09:00 AM - 06:00 PM',
    assignedBranchId: ''
  });

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/doctors');
      if (res.data.success) {
        setDoctors(res.data.doctors || []);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [activeBranch]);

  const handleToggleAvailability = async (id, current) => {
    const nextStatus = current === 'AVAILABLE' ? 'ON_LEAVE' : 'AVAILABLE';
    try {
      await api.put(`/doctors/${id}`, { availabilityStatus: nextStatus });
      fetchDoctors();
    } catch (err) {
      alert('Error updating doctor availability');
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/doctors', {
        ...formData,
        assignedBranchId: formData.assignedBranchId || activeBranch?._id || branches[0]?._id
      });
      setAddModal(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        qualification: 'B.V.Sc & A.H',
        registrationNumber: '',
        specialization: 'General Veterinary Medicine',
        workingHours: '09:00 AM - 06:00 PM',
        assignedBranchId: ''
      });
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering doctor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#593713]">Veterinary Doctor Management</h1>
          <p className="text-xs text-stone-500">
            Registered doctors, specializations, credentials and live availability
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              ...formData,
              assignedBranchId: activeBranch?._id || branches[0]?._id || ''
            });
            setAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#80501D] hover:bg-[#593713] text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Register New Doctor
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-stone-400">
          No doctors registered yet. Add your veterinary doctors to receive patient requests.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((d) => (
            <div
              key={d._id}
              className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg">
                    {d.name.charAt(0)}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      d.availabilityStatus === 'AVAILABLE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {d.availabilityStatus}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-stone-900 text-base">Dr. {d.name}</h3>
                  <p className="text-xs font-semibold text-[#80501D]">{d.qualification}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{d.specialization}</p>
                </div>

                <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    {d.phone}
                  </p>
                  {d.registrationNumber && (
                    <p className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[#D6A23A]" />
                      Reg: {d.registrationNumber}
                    </p>
                  )}
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    {d.workingHours}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">
                  Branch: {d.assignedBranch?.name || 'Main Branch'}
                </span>
                <button
                  onClick={() => handleToggleAvailability(d._id, d.availabilityStatus)}
                  className="text-xs font-semibold text-[#80501D] hover:underline"
                >
                  {d.availabilityStatus === 'AVAILABLE' ? 'Mark On Leave' : 'Mark Available'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Doctor Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-stone-900">Register Veterinary Doctor</h3>

            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Doctor Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alok Verma"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Mobile"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Qualification *
                  </label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="B.V.Sc & A.H"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Reg Number
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="VCI-XXXX"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g. Bovine Trauma & Surgery"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Assign Branch
                </label>
                <select
                  value={formData.assignedBranchId}
                  onChange={(e) => setFormData({ ...formData, assignedBranchId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm"
                >
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
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
                  className="px-4 py-2 bg-[#80501D] hover:bg-[#593713] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

