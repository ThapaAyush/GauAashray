import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function LocationPicker({
  address = '',
  landmark = '',
  latitude,
  longitude,
  onLocationChange
}) {
  const [detecting, setDetecting] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(Boolean(latitude && longitude));
  const [statusNotice, setStatusNotice] = useState('');

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setStatusNotice('Geolocation is not supported on this device/browser.');
      return;
    }

    setDetecting(true);
    setStatusNotice('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setGpsSuccess(true);
        setDetecting(false);
        setStatusNotice('GPS location detected successfully.');
        onLocationChange({
          latitude: lat,
          longitude: lng,
          address: address || `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          landmark
        });
      },
      (err) => {
        setDetecting(false);
        console.warn('Geolocation error:', err.message);
        setStatusNotice('Could not retrieve precise GPS. Switched to standard city center.');
        onLocationChange({
          latitude: 28.6139,
          longitude: 77.2090,
          address,
          landmark
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-sm font-bold text-stone-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#80501D] shrink-0" />
          <span>Incident / Home Location *</span>
        </label>
        
        <button
          type="button"
          onClick={detectLocation}
          disabled={detecting}
          data-allow-guest="true"
          className="inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold text-[#80501D] bg-[#FAF6ED] hover:bg-[#FAF6ED]/80 active:scale-95 border border-[#D6A23A]/40 transition shadow-2xs touch-manipulation cursor-pointer"
        >
          {detecting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Detecting GPS...</span>
            </>
          ) : gpsSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              <span>GPS Locked</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5 text-[#D6A23A]" />
              <span>Use My Location (GPS)</span>
            </>
          )}
        </button>
      </div>

      {statusNotice && (
        <div className="text-xs py-1.5 px-3 rounded-lg bg-amber-50 border border-amber-200 text-[#80501D] flex items-center gap-1.5 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      <div>
        <input
          type="text"
          value={address}
          onChange={(e) =>
            onLocationChange({
              address: e.target.value,
              landmark,
              latitude: latitude || 28.6139,
              longitude: longitude || 77.2090
            })
          }
          placeholder="Street address, colony, road or landmark"
          required
          className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#D6A23A] bg-white text-sm"
        />
      </div>

      <div>
        <input
          type="text"
          value={landmark}
          onChange={(e) =>
            onLocationChange({
              address,
              landmark: e.target.value,
              latitude: latitude || 28.6139,
              longitude: longitude || 77.2090
            })
          }
          placeholder="Nearby landmark (optional - e.g. Near Metro Pillar 42)"
          className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#D6A23A] bg-white text-xs text-stone-600"
        />
      </div>
    </div>
  );
}

