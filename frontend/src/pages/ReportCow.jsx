import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import LocationPicker from '../components/LocationPicker';
import api from '../services/api';
import {
  HeartPulse,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Compass
} from 'lucide-react';

const CONDITIONS = [
  'Injured',
  'Sick',
  'Abandoned',
  'Wandering',
  'Healthy but unattended',
  'Accident case',
  'Other'
];

export default function ReportCow() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    reporterName: user?.name || '',
    reporterPhone: user?.phone || '',
    cowCondition: 'Injured',
    urgency: 'Normal',
    description: '',
    photographs: [],
    addressText: '',
    landmark: '',
    latitude: 28.6139,
    longitude: 77.2090
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reporterName || !formData.reporterPhone || !formData.addressText) {
      setError('Please provide your name, phone number and incident location.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/rescue', formData);
      if (res.data.success) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rescue report. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-red-700 bg-red-100 mb-2">
          <HeartPulse className="w-3.5 h-3.5" />
          Street Cow Emergency Response
        </span>
        <h1 className="text-3xl font-extrabold text-[#593713]">Report a Street Cow</h1>
        <p className="text-xs text-stone-500 mt-1">
          Nearest verified Gaushala rescue team will be dispatched automatically
        </p>
      </div>

      {result ? (
        /* Confirmation Screen */
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-200 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">
              Incident Registered & Broadcasted
            </span>
            <h2 className="text-2xl font-black text-stone-900 mt-1 font-mono">
              {result.trackingId}
            </h2>
            <p className="text-xs text-stone-600 mt-2 max-w-md mx-auto">
              Your report has been broadcasted simultaneously to the <strong>5 nearest registered Gaushalas</strong>.
              The first shelter to accept will claim the case and dispatch their rescue team.
            </p>
          </div>

          {result.nearestShelters && result.nearestShelters.length > 0 && (
            <div className="bg-[#FAF6ED] p-4 rounded-2xl border border-[#D6A23A]/30 text-xs text-stone-700 max-w-md mx-auto space-y-2">
              <p className="font-bold text-[#80501D] flex items-center justify-center gap-1.5">
                <span>📡</span> Alert Sent to {result.nearestShelters.length} Nearest Shelters:
              </p>
              <div className="space-y-1 text-left">
                {result.nearestShelters.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-[#D6A23A]/20">
                    <span className="font-semibold text-stone-900 truncate">{s.gaushalaName}</span>
                    <span className="font-bold text-[#80501D] text-[11px] shrink-0">~{s.distanceKm} km</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(`/track-request?id=${result.trackingId}`)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#80501D] hover:bg-[#593713] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#D6A23A]" />
              Track Rescue Live
            </button>
            <button
              onClick={() => {
                setResult(null);
                setFormData({
                  ...formData,
                  description: '',
                  photographs: [],
                  addressText: '',
                  landmark: ''
                });
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm transition"
            >
              Report Another Incident
            </button>
          </div>
        </div>
      ) : (
        /* Report Form */
        <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-stone-200">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photographs */}
            <ImageUpload
              value={formData.photographs}
              onChange={(urls) => setFormData({ ...formData, photographs: urls })}
              label="Cow Photograph(s) *"
              maxFiles={3}
            />

            {/* Condition Options (Section 8) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Cow Condition *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CONDITIONS.map((cond) => {
                  const isSelected = formData.cowCondition === cond;
                  return (
                    <button
                      type="button"
                      key={cond}
                      onClick={() => {
                        const isCritical = cond === 'Accident case' || cond === 'Injured';
                        setFormData({
                          ...formData,
                          cowCondition: cond,
                          urgency: isCritical ? 'Critical Emergency' : formData.urgency
                        });
                      }}
                      className={`p-3 rounded-xl border text-xs font-medium text-left transition ${isSelected
                          ? 'border-red-600 bg-red-50 text-red-800 font-bold'
                          : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 text-stone-700'
                        }`}
                    >
                      {cond}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Urgency Switch - Interactive Emergency Card */}
            {(() => {
              const isCritical = formData.urgency === 'Critical Emergency';
              return (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      urgency: prev.urgency === 'Critical Emergency' ? 'Normal' : 'Critical Emergency'
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setFormData((prev) => ({
                        ...prev,
                        urgency: prev.urgency === 'Critical Emergency' ? 'Normal' : 'Critical Emergency'
                      }));
                    }
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-4 ${
                    isCritical
                      ? 'bg-gradient-to-r from-red-50 via-rose-50/80 to-red-50 border-red-500 shadow-md shadow-red-500/10'
                      : 'bg-stone-50/80 border-stone-200 hover:border-[#D6A23A] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Icon container with pulsing live ping when SOS is active */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all relative ${
                        isCritical
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-2 ring-red-400/50'
                          : 'bg-stone-200/80 text-stone-600'
                      }`}
                    >
                      {isCritical && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                        </span>
                      )}
                      <ShieldAlert className={`w-5 h-5 ${isCritical ? 'animate-bounce' : ''}`} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-extrabold tracking-tight ${
                            isCritical ? 'text-red-900' : 'text-stone-800'
                          }`}
                        >
                          Critical Emergency?
                        </span>
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-600 text-white shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            SOS Priority
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-stone-200 text-stone-600">
                            Normal
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs mt-0.5 leading-snug ${
                          isCritical ? 'text-red-700 font-semibold' : 'text-stone-500'
                        }`}
                      >
                        {isCritical
                          ? 'High-priority SOS alert will broadcast immediately to 5 nearest rescue vans!'
                          : 'Priority notification to multiple nearby rescue vans and ambulance units.'}
                      </p>
                    </div>
                  </div>

                  {/* Modern Animated Toggle Switch */}
                  <div className="flex items-center shrink-0">
                    <div
                      className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                        isCritical ? 'bg-red-600 shadow-inner' : 'bg-stone-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center ${
                          isCritical ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      >
                        {isCritical ? (
                          <span className="w-2 h-2 rounded-full bg-red-600"></span>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Brief Description (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. White cow sitting on road divider, unable to stand up on hind legs"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
              />
            </div>

            {/* Location Picker */}
            <LocationPicker
              address={formData.addressText}
              landmark={formData.landmark}
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={(loc) => {
                setFormData({
                  ...formData,
                  addressText: loc.address,
                  landmark: loc.landmark,
                  latitude: loc.latitude,
                  longitude: loc.longitude
                });
              }}
            />

            {/* Reporter Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  value={formData.reporterName}
                  onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Contact Mobile Number *
                </label>
                <input
                  type="tel"
                  value={formData.reporterPhone}
                  onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
                  placeholder="For rescue team call"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Matching Nearby Gaushala Ambulance...
                </>
              ) : (
                <>
                  <HeartPulse className="w-4 h-4" />
                  Dispatch Emergency Rescue Report
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}











































