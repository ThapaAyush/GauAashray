import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Map, MapPin, Building, AlertCircle, Compass, Loader2 } from 'lucide-react';

export default function AdminNetworkMap() {
  const [mapData, setMapData] = useState({ branches: [], incidents: [] });
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    api.get('/admin/map')
      .then((res) => {
        if (res.data.success) {
          setMapData({
            branches: res.data.branches || [],
            incidents: res.data.incidents || []
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-stone-900">National Network Map</h1>
        <p className="text-xs text-stone-500">
          Geospatial tracking of approved shelter branches and active street emergency incidents
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map Visual Canvas */}
          <div className="lg:col-span-8 bg-stone-900 rounded-3xl p-6 text-white min-h-[460px] relative overflow-hidden flex flex-col justify-between shadow-xl">
            {/* Background grid pattern simulating map tiles */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: 'radial-gradient(#D6A23A 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />

            {/* Map Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#D6A23A] animate-spin" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
                  Live Geospatial Grid (2dsphere)
                </span>
              </div>
              <span className="text-[11px] bg-stone-800 text-stone-300 px-3 py-1 rounded-full border border-stone-700">
                {mapData.branches.length} Branches • {mapData.incidents.length} Live Incidents
              </span>
            </div>

            {/* Simulated Nodes Representation */}
            <div className="relative z-10 py-12 flex flex-wrap items-center justify-around gap-6">
              {mapData.branches.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => setActiveItem({ type: 'BRANCH', ...b })}
                  className="group flex flex-col items-center focus:outline-none transition transform hover:scale-110"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#80501D] border-2 border-[#D6A23A] flex items-center justify-center text-white shadow-lg group-hover:bg-[#593713]">
                    <Building className="w-6 h-6 text-[#D6A23A]" />
                  </div>
                  <span className="mt-2 text-[11px] font-bold text-white bg-black/60 px-2 py-0.5 rounded max-w-[140px] truncate">
                    {b.name}
                  </span>
                  <span className="text-[9px] text-[#D6A23A] font-mono">
                    [{b.coordinates[0].toFixed(2)}, {b.coordinates[1].toFixed(2)}]
                  </span>
                </button>
              ))}

              {mapData.incidents.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => setActiveItem({ type: 'INCIDENT', ...inc })}
                  className="group flex flex-col items-center focus:outline-none transition transform hover:scale-110"
                >
                  <div className="w-10 h-10 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-white shadow-lg animate-bounce">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <span className="mt-2 text-[11px] font-bold text-red-300 bg-black/60 px-2 py-0.5 rounded font-mono">
                    {inc.trackingId}
                  </span>
                  <span className="text-[9px] text-stone-400">
                    {inc.condition}
                  </span>
                </button>
              ))}
            </div>

            {/* Map Legend */}
            <div className="relative z-10 flex items-center justify-between text-xs text-stone-400 border-t border-stone-800 pt-3">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#80501D] border border-[#D6A23A]" />
                  Approved Gaushala Branch
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-600" />
                  Active Street Rescue Incident
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar Info Card */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-stone-900 border-b pb-2">
              Selected Point Details
            </h3>

            {activeItem ? (
              <div className="space-y-3 text-xs text-stone-700">
                {activeItem.type === 'BRANCH' ? (
                  <>
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                      VERIFIED GAUSHALA BRANCH
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm mt-1">{activeItem.name}</h4>
                    <p className="text-stone-500">{activeItem.gaushalaName}</p>
                    <p className="font-mono text-[11px] text-[#80501D]">
                      Coordinates: [{activeItem.coordinates.join(', ')}]
                    </p>
                    <div className="pt-2 border-t space-y-1">
                      <p>
                        Total Capacity: <strong>{activeItem.totalCapacity} Cows</strong>
                      </p>
                      <p>
                        Current Shelter Residents: <strong>{activeItem.currentCows || 0}</strong>
                      </p>
                      <p>
                        Operating Hours: <strong>{activeItem.operatingHours}</strong>
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                      ACTIVE RESCUE CASE
                    </span>
                    <h4 className="font-mono font-bold text-stone-900 text-base mt-1">
                      {activeItem.trackingId}
                    </h4>
                    <p>
                      Condition: <strong>{activeItem.condition}</strong>
                    </p>
                    <p>
                      Location: <strong>{activeItem.address}</strong>
                    </p>
                    <p className="font-mono text-[11px] text-stone-500">
                      Coordinates: [{activeItem.coordinates.join(', ')}]
                    </p>
                    <div className="pt-2">
                      <StatusBadge status={activeItem.status} />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-xs text-stone-400 py-8 text-center">
                Click any Gaushala branch or rescue incident on the map to inspect live parameters.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

