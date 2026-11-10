import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Building2, Shield, Phone, Mail, MapPin, Loader2 } from 'lucide-react';

export default function AdminGaushalas() {
  const [gaushalas, setGaushalas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGaushalas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/gaushalas');
      if (res.data.success) {
        setGaushalas(res.data.gaushalas || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGaushalas();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'APPROVED' ? 'SUSPENDED' : 'APPROVED';
    if (!window.confirm(`Change Gaushala status to ${nextStatus}?`)) return;

    try {
      await api.put(`/admin/gaushalas/${id}/status`, { status: nextStatus });
      fetchGaushalas();
    } catch (err) {
      alert('Error updating Gaushala status');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-stone-900">Registered Gaushala Organizations</h1>
        <p className="text-xs text-stone-500">
          Supervise approved organizations, branches, shelter capacities and active network status
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gaushalas.map((g) => (
            <div
              key={g._id}
              className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#80501D] block">
                      {g.registrationId || 'PENDING'}
                    </span>
                    <h3 className="font-bold text-stone-900 text-base">{g.name}</h3>
                  </div>
                  <StatusBadge status={g.status} />
                </div>

                <div className="space-y-1.5 text-xs text-stone-600">
                  <p className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    {g.address}, {g.city}, {g.state}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    Owner: {g.owner?.name} ({g.owner?.phone})
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-stone-100 text-center text-xs">
                  <div className="bg-stone-50 p-2 rounded-xl">
                    <p className="font-bold text-stone-800">{g.branchCount || 1}</p>
                    <span className="text-[10px] text-stone-400">Branches</span>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-xl">
                    <p className="font-bold text-[#557B42]">{g.cowCount || 0}</p>
                    <span className="text-[10px] text-stone-400">Cows</span>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-xl">
                    <p className="font-bold text-blue-700">{g.doctorCount || 0}</p>
                    <span className="text-[10px] text-stone-400">Doctors</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">
                  Capacity: {g.totalCapacity} Cows
                </span>

                <button
                  onClick={() => handleToggleStatus(g._id, g.status)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                    g.status === 'APPROVED'
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                      : 'bg-green-50 hover:bg-green-100 text-green-800'
                  }`}
                >
                  {g.status === 'APPROVED' ? 'Suspend Organization' : 'Reactivate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

