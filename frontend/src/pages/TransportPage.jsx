import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Truck, MapPin, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

export default function TransportPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/team/vehicles');
      if (res.data.success) {
        setVehicles(res.data.vehicles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const toggleAvailability = async (id, current) => {
    try {
      await api.put(`/team/vehicles/${id}`, { isAvailable: !current });
      fetchVehicles();
    } catch (err) {
      alert('Error updating status');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#593713]">Transport & Cow Ambulances</h1>
        <p className="text-xs text-stone-500">
          Emergency response fleet tracking and dispatch readiness
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-stone-400">
          No vehicles in fleet. Add an ambulance from Staff & Rescue Teams.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((v) => (
            <div
              key={v._id}
              className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#80501D] flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      v.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {v.isAvailable ? 'Ready for Dispatch' : 'On Active Mission'}
                  </span>
                </div>

                <div>
                  <h3 className="font-mono text-lg font-black text-stone-900">{v.vehicleNumber}</h3>
                  <p className="text-xs font-semibold text-[#80501D]">{v.type}</p>
                  <p className="text-xs text-stone-500">Capacity: {v.capacity} Cow(s)</p>
                </div>

                <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
                  <p className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    Branch: {v.assignedBranch?.name || 'Main'}
                  </p>
                  <p className="text-stone-700">
                    Driver: <strong>{v.driver?.name || 'Unassigned'}</strong>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100">
                <button
                  onClick={() => toggleAvailability(v._id, v.isAvailable)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 hover:bg-[#FAF6ED] text-xs font-semibold text-stone-700 transition"
                >
                  {v.isAvailable ? 'Mark as Out on Call' : 'Mark Available at Base'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

