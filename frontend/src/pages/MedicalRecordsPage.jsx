import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Stethoscope, Calendar, ShieldCheck, Loader2 } from 'lucide-react';

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/medical/records')
      .then((res) => {
        if (res.data.success) {
          setRecords(res.data.records || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#593713]">Clinical Medical Records</h1>
        <p className="text-xs text-stone-500">
          Confidential veterinary treatment histories and medication prescriptions
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-stone-400">
          No medical records logged yet. Records are generated when completing doctor appointments.
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#80501D]" />
                  <h3 className="font-bold text-stone-900 text-sm">
                    Diagnosis: <span className="text-[#80501D]">{r.diagnosis}</span>
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>{new Date(r.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                    Administered Treatment
                  </span>
                  <p className="text-stone-800 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                    {r.treatment}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                    Prescribed Medicines
                  </span>
                  {r.medicines && r.medicines.length > 0 ? (
                    <div className="space-y-1.5 bg-stone-50 p-3 rounded-xl border border-stone-100">
                      {r.medicines.map((m, i) => (
                        <p key={i} className="text-stone-800">
                          • <strong>{m.name}</strong> — {m.dosage}, {m.frequency} for {m.duration}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-stone-400 italic">No external medicines prescribed</p>
                  )}
                </div>
              </div>

              {r.prescriptionNotes && (
                <div className="text-xs text-stone-600 bg-[#FAF6ED] p-3 rounded-xl border border-[#D6A23A]/30">
                  <strong>Doctor Notes:</strong> {r.prescriptionNotes}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
                <span className="flex items-center gap-1 text-blue-700 font-semibold">
                  <Stethoscope className="w-3.5 h-3.5" />
                  Dr. {r.doctor?.name} ({r.doctor?.qualification})
                </span>
                <span className="flex items-center gap-1 text-[#557B42]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Confidential Medical Record
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

