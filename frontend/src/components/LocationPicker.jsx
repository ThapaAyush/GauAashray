import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2 } from 'lucide-react';

export default function LocationPicker({
  address = '',
  landmark = '',
  latitude,
  longitude,
  onLocationChange
}) {
  const [detecting, setDetecting] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(Boolean(latitude && longitude));

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setGpsSuccess(true);
        setDetecting(false);
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
        // Fallback to Delhi NCR coordinates if denied
        onLocationChange({
          latitude: 28.6139,
          longitude: 77.2090,
          address,
          landmark
        });
        alert('Could not retrieve precise GPS. Defaulting to current city coordinates.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-stone-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#80501D]" />
          Incident / Home Location
        </label>
        <button
          type="button"
          onClick={detectLocation}
          disabled={detecting}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#80501D] hover:text-[#593713] bg-[#FAF6ED] px-2.5 py-1 rounded-lg border border-[#D6A23A]/40 transition hover:bg-[#FAF6ED]/80"
        >
          {detecting ? (
            'Detecting...'
          ) : gpsSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              GPS Locked
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5" />
              Use My Location
            </>
          )}
        </button>
      </div>

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
          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#D6A23A] bg-white text-sm"
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
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#D6A23A] bg-white text-xs text-stone-600"
        />
      </div>
    </div>
  );
}

