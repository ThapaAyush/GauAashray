import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import TrackingStepper from '../components/TrackingStepper';
import StatusBadge from '../components/StatusBadge';
import {
  Search,
  Compass,
  AlertCircle,
  Loader2,
  MapPin,
  Building,
  ShieldCheck,
  Stethoscope,
  Calendar,
  Home,
  Radio,
  CheckCircle,
  PhoneCall
} from 'lucide-react';

export default function TrackRequest() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [trackingId, setTrackingId] = useState(initialId);
  const [rescue, setRescue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = async (idToSearch, silent = false) => {
    if (!idToSearch) return;
    if (!silent) setLoading(true);
    setError('');
    try {
      const res = await api.get(`/rescue/track/${idToSearch.trim()}`);
      if (res.data.success) {
        setRescue(res.data.rescue);
        setSearchParams({ id: idToSearch.trim() });
      }
    } catch (err) {
      if (!silent) {
        setRescue(null);
        setError(
          err.response?.data?.message || 'No request found for this Tracking ID.'
        );
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchTracking(initialId);
      // Auto-poll every 12 seconds for real-time status updates
      const timer = setInterval(() => {
        fetchTracking(initialId, true);
      }, 12000);
      return () => clearInterval(timer);
    }
  }, [initialId]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTracking(trackingId);
  };

  // Dynamic header based on request type
  const isMedical = rescue?.type === 'MEDICAL';
  const isSurrender = rescue?.type === 'SURRENDER';

  const badgeText = isMedical
    ? 'Veterinary Doctor Visit Tracking'
    : isSurrender
    ? 'Cow Surrender & Intake Tracking'
    : 'Live Rescue & Intake Tracking';

  const headingText = isMedical
    ? 'Track Doctor Visit'
    : isSurrender
    ? 'Track Cow Surrender'
    : 'Track Cow Rescue';

  const subText = isMedical
    ? 'Live appointment and veterinarian dispatch status for your cow'
    : isSurrender
    ? 'Live review, approval, and shelter intake status'
    : 'Enter your unique Tracking ID to see live dispatch and shelter arrival status';

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#80501D] bg-[#FAF6ED] mb-2">
          {isMedical ? (
            <Stethoscope className="w-3.5 h-3.5 text-[#80501D]" />
          ) : isSurrender ? (
            <Home className="w-3.5 h-3.5 text-[#557B42]" />
          ) : (
            <Compass className="w-3.5 h-3.5 text-[#D6A23A]" />
          )}
          {badgeText}
        </span>
        <h1 className="text-3xl font-extrabold text-[#593713]">{headingText}</h1>
        <p className="text-xs text-stone-500 mt-1">{subText}</p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-sm border border-stone-200">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="e.g. RSC-2026-7842, MED-2026-1029, SUR-2026-4401"
            required
            className="flex-1 min-h-[48px] px-4 py-3 rounded-2xl border border-stone-200 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#D6A23A] bg-stone-50/50"
          />
          <button
            type="submit"
            disabled={loading}
            className="min-h-[48px] px-6 py-3 bg-[#80501D] hover:bg-[#593713] active:scale-[0.98] text-white rounded-2xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm touch-manipulation cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Track Incident</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Request Details Card */}
      {rescue && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-stone-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {isMedical
                    ? 'Medical Request Ref'
                    : isSurrender
                    ? 'Surrender Application Ref'
                    : 'Incident Reference'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-600">
                  {rescue.type || 'RESCUE'}
                </span>
              </div>
              <h2 className="text-xl font-black text-stone-900 font-mono mt-0.5">
                {rescue.trackingId}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={rescue.status} />
              {rescue.urgency === 'Critical Emergency' && (
                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  CRITICAL
                </span>
              )}
            </div>
          </div>

          {/* Stepper */}
          <TrackingStepper
            currentStatus={rescue.status}
            history={rescue.statusHistory}
            requestType={rescue.type || 'RESCUE'}
          />

          {/* GPS 5-Shelter Dispatch Radar Section */}
          {!rescue.assignedGaushala && rescue.broadcastedGaushalas && rescue.broadcastedGaushalas.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <Radio className="w-4 h-4 text-amber-600" />
                  <span>GPS Radar: Alerted {rescue.broadcastedGaushalas.length} Nearest Registered Gaushalas</span>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full">
                  Fast Response Queue
                </span>
              </div>
              <p className="text-[11px] text-amber-800/90 leading-relaxed">
                Your request has been broadcasted simultaneously to the closest {rescue.broadcastedGaushalas.length} shelters based on GPS coordinates. The first shelter to accept will take over this request, and live tracking will start from that organization.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {rescue.broadcastedGaushalas.map((b, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/90 border border-amber-100 text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-[#80501D] text-[10px] font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <p className="font-bold text-stone-800 text-xs truncate">{b.gaushalaName}</p>
                        <p className="text-[10px] text-stone-500 truncate">{b.city || 'Nearest Shelter'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {b.distanceKm && (
                        <span className="text-[10px] font-semibold text-[#80501D] bg-[#FAF6ED] px-2 py-0.5 rounded-md">
                          ~{b.distanceKm} km
                        </span>
                      )}
                      <span className="text-[9px] font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-full">
                        Awaiting
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assigned Gaushala Banner (Claimed & Selected) */}
          {rescue.assignedGaushala && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Assigned First-Responder Shelter</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Exclusively Assigned
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 pt-1">
                <div>
                  <h3 className="text-base font-black text-stone-900 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-[#557B42]" />
                    {rescue.assignedGaushala.name}
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {rescue.assignedGaushala.city}
                    {rescue.assignedBranch ? ` • Branch: ${rescue.assignedBranch.name}` : ''}
                  </p>
                </div>
                {rescue.assignedGaushala.phone && (
                  <a
                    href={`tel:${rescue.assignedGaushala.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-[#80501D] border border-stone-200 text-xs font-bold shadow-xs transition shrink-0"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#557B42]" />
                    Call Shelter
                  </a>
                )}
              </div>
              {rescue.broadcastedGaushalas && rescue.broadcastedGaushalas.length > 0 && (
                <p className="text-[11px] text-emerald-800/80 pt-1.5 border-t border-emerald-100">
                  ✓ Claimed first from the 5 nearest GPS-alerted shelters. Closed to all other shelters.
                </p>
              )}
            </div>
          )}

          {/* Assigned Doctor Card (for Medical) */}
          {rescue.assignedDoctor && (
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    Assigned Veterinary Doctor
                  </span>
                  <p className="font-bold text-stone-900 text-sm">
                    Dr. {rescue.assignedDoctor.name}
                  </p>
                  <p className="text-[11px] text-blue-800">
                    {rescue.assignedDoctor.specialization}
                  </p>
                </div>
              </div>
              {rescue.scheduledDate && (
                <div className="sm:text-right bg-white/80 px-3 py-1.5 rounded-xl border border-blue-200">
                  <span className="text-[10px] text-stone-400 block font-semibold uppercase">
                    Scheduled Visit
                  </span>
                  <p className="font-bold text-stone-800 text-xs flex items-center gap-1 sm:justify-end">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    {new Date(rescue.scheduledDate).toLocaleDateString()}
                  </p>
                  {rescue.scheduledTimeSlot && (
                    <p className="text-[10px] text-stone-500">{rescue.scheduledTimeSlot}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Scheduled Pickup Banner (for Surrender) */}
          {rescue.pickupDate && (
            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 flex items-center gap-2.5 text-xs text-emerald-950">
              <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Intake / Pickup Scheduled for:{' '}
                <strong>{new Date(rescue.pickupDate).toLocaleDateString()}</strong>
              </span>
            </div>
          )}

          {/* Key Facts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100 text-xs">
            <div className="space-y-2">
              <div>
                <span className="text-stone-400 font-semibold uppercase text-[10px]">
                  {isMedical
                    ? 'Patient Cow Details'
                    : isSurrender
                    ? 'Surrendered Cow'
                    : 'Condition'}
                </span>
                <p className="font-bold text-stone-800">{rescue.cowCondition}</p>
              </div>

              <div>
                <span className="text-stone-400 font-semibold uppercase text-[10px]">Location</span>
                <p className="font-medium text-stone-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  {rescue.cityArea}
                  {rescue.landmark && ` (Near ${rescue.landmark})`}
                </p>
              </div>

              {rescue.description && (
                <div>
                  <span className="text-stone-400 font-semibold uppercase text-[10px]">
                    {isMedical
                      ? 'Symptoms & Notes'
                      : isSurrender
                      ? 'Surrender Details'
                      : 'Description'}
                  </span>
                  <p className="text-stone-600 italic">"{rescue.description}"</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-stone-400 font-semibold uppercase text-[10px]">
                  {isMedical || isSurrender ? 'Owner / Applicant' : 'Reporter'}
                </span>
                <p className="text-stone-700">
                  {rescue.reporterName} ({rescue.reporterPhoneMasked})
                </p>
              </div>

              <div>
                <span className="text-stone-400 font-semibold uppercase text-[10px]">
                  Submitted At
                </span>
                <p className="text-stone-700">
                  {new Date(rescue.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Photo Preview if available */}
          {rescue.photographs && rescue.photographs.length > 0 && (
            <div className="pt-4 border-t border-stone-100">
              <span className="text-stone-400 font-semibold uppercase text-[10px] block mb-2">
                Attached Photograph
              </span>
              <div className="flex gap-2 overflow-x-auto">
                {rescue.photographs.map((p, idx) => (
                  <img
                    key={idx}
                    src={p}
                    alt={`Cow ${idx}`}
                    className="h-28 w-28 object-cover rounded-xl border border-stone-200"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-[11px] text-stone-500 bg-[#FAF6ED] p-3 rounded-xl border border-[#D6A23A]/30">
            <span className="flex items-center gap-1 text-[#80501D] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#557B42]" />
              Data Privacy Protected
            </span>
            <span>Contact phone number and exact street address are masked publicly.</span>
          </div>
        </div>
      )}
    </div>
  );
}
