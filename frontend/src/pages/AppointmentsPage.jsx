import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Calendar, Phone, MapPin, Clock, Stethoscope, FileText, CheckCircle2, Loader2 } from 'lucide-react';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Medical Record Creation Modal
  const [recordModal, setRecordModal] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('1 Tablet');
  const [frequency, setFrequency] = useState('Twice daily');
  const [duration, setDuration] = useState('5 days');
  const [medicines, setMedicines] = useState([]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/doctors/appointments');
      if (res.data.success) {
        setAppointments(res.data.appointments || []);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const addMedicine = () => {
    if (!medicineName) return;
    setMedicines([...medicines, { name: medicineName, dosage, frequency, duration }]);
    setMedicineName('');
  };

  const removeMedicine = (idx) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    if (!recordModal || !diagnosis || !treatment) return;

    setSubmitting(true);
    try {
      const reqId = recordModal.medicalRequest?._id || recordModal.medicalRequest;
      await api.post(`/medical/${reqId}/records`, {
        doctorId: recordModal.doctor?._id || recordModal.doctor,
        diagnosis,
        treatment,
        medicines,
        prescriptionNotes
      });
      setRecordModal(null);
      setDiagnosis('');
      setTreatment('');
      setMedicines([]);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating medical record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#593713]">Doctor Appointments & Visits</h1>
        <p className="text-xs text-stone-500">
          Monitor scheduled clinical visits and log official medical treatments
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-stone-400">
          No appointments recorded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {appointments.map((a) => (
            <div
              key={a._id}
              className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                    {a.timeSlot}
                  </span>
                  <StatusBadge status={a.status} />
                </div>

                <div>
                  <h3 className="font-bold text-stone-900 text-base">{a.customerName}</h3>
                  <p className="text-xs text-stone-600">
                    Cow: <strong className="text-[#80501D]">{a.cowName || 'Cow'}</strong>
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    {a.customerPhone}
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    {a.locationAddress}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    {new Date(a.scheduledDate).toLocaleDateString()}
                  </p>
                  {a.doctor && (
                    <p className="flex items-center gap-1.5 text-blue-700 font-semibold pt-1">
                      <Stethoscope className="w-3.5 h-3.5" />
                      Dr. {a.doctor.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100">
                {a.status !== 'VISIT_COMPLETED' ? (
                  <button
                    onClick={() => {
                      setRecordModal(a);
                      setDiagnosis('');
                      setTreatment('');
                      setMedicines([]);
                    }}
                    className="w-full py-2 px-3 bg-[#80501D] hover:bg-[#593713] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Complete Visit & Log Medical Record
                  </button>
                ) : (
                  <div className="text-center py-1 bg-green-50 rounded-xl text-green-800 text-xs font-semibold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Visit Completed & Recorded
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log Medical Record Modal */}
      {recordModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="font-bold text-lg text-stone-900">Official Clinical Medical Record</h3>
              <p className="text-xs text-stone-500">
                Patient: {recordModal.cowName} • Owner: {recordModal.customerName}
              </p>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Clinical Diagnosis *
                </label>
                <textarea
                  rows={2}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Ruminal acidosis with secondary dehydration"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Administered Treatment *
                </label>
                <textarea
                  rows={2}
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="e.g. IV fluids, anti-inflammatory injection, magnesium hydroxide oral drench"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              {/* Medicines prescription */}
              <div className="space-y-2 border-t pt-2">
                <label className="block text-xs font-semibold text-stone-700 uppercase">
                  Prescribe Medicines
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    placeholder="Medicine name"
                    className="col-span-2 px-3 py-1.5 rounded-xl border border-stone-200 text-xs"
                  />
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="Dosage (e.g. 1 bolus)"
                    className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs"
                  />
                  <input
                    type="text"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="Frequency"
                    className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={addMedicine}
                  className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold"
                >
                  + Add Medicine to Prescription
                </button>

                {medicines.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {medicines.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs bg-stone-50 p-2 rounded-lg"
                      >
                        <span>
                          <strong>{m.name}</strong> ({m.dosage}, {m.frequency})
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMedicine(i)}
                          className="text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Prescription & Dietary Notes
                </label>
                <textarea
                  rows={2}
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                  placeholder="e.g. Feed dry hay, avoid green sorghum for 3 days"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRecordModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#80501D] hover:bg-[#593713] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Sign & Complete Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

