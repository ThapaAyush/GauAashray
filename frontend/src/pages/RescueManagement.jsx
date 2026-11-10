import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import TrackingStepper from '../components/TrackingStepper';
import {
  HeartPulse,
  Truck,
  Users,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Zap,
  ShieldCheck,
  Send,
  Navigation,
  HeartHandshake,
  Home,
  ArrowRight,
  Sparkles,
  Check,
  X
} from 'lucide-react';

const RESCUE_SEQUENCE_STEPS = [
  {
    step: 1,
    status: 'Assigned',
    label: 'Assigned',
    desc: 'Shelter accepted & case registered in queue',
    icon: ShieldCheck,
    badge: null
  },
  {
    step: 2,
    status: 'Team Dispatched',
    label: 'Team Dispatched',
    desc: 'Rescue vehicle & staff departed shelter',
    icon: Send,
    badge: null
  },
  {
    step: 3,
    status: 'On The Way',
    label: 'On The Way',
    desc: 'Ambulance en route to cow GPS coordinates',
    icon: Navigation,
    badge: null
  },
  {
    step: 4,
    status: 'Rescued',
    label: 'Rescued',
    desc: 'Cow safely secured with on-site first aid',
    icon: HeartHandshake,
    badge: null
  },
  {
    step: 5,
    status: 'Transporting',
    label: 'Transporting',
    desc: 'Ambulance transit returning to Gaushala',
    icon: Truck,
    badge: null
  },
  {
    step: 6,
    status: 'Received at Gaushala',
    label: 'Received at Gaushala',
    desc: 'Arrived at shelter & admitted to cow records',
    icon: Home,
    badge: 'Cow DB Intake ✨'
  },
  {
    step: 7,
    status: 'Completed',
    label: 'Completed',
    desc: 'Intake finalized & ongoing medical care active',
    icon: CheckCircle2,
    badge: 'Closed'
  }
];

const RESCUE_STATUSES = [
  'Assigned',
  'Team Dispatched',
  'On The Way',
  'Rescued',
  'Transporting',
  'Received at Gaushala',
  'Completed',
  'Cancelled'
];

export default function RescueManagement() {
  const { user, activeBranch } = useAuth();
  const [rescues, setRescues] = useState([]);
  const [broadcastCount, setBroadcastCount] = useState(0);
  const [teamMembers, setTeamMembers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedRescue, setSelectedRescue] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status update modal
  const [updateModal, setUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [cowName, setCowName] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, tRes, vRes] = await Promise.all([
        api.get('/rescue/gaushala/requests'),
        api.get('/team/members').catch(() => ({ data: { members: [] } })),
        api.get('/team/vehicles').catch(() => ({ data: { vehicles: [] } }))
      ]);

      const list = rRes.data.requests || [];
      const assignedOnly = list.filter((r) => !r.isBroadcast);
      const pendingBroadcasts = list.filter((r) => r.isBroadcast).length;

      setBroadcastCount(pendingBroadcasts);
      setRescues(assignedOnly);
      setTeamMembers(tRes.data.members || []);
      setVehicles(vRes.data.vehicles || []);

      if (assignedOnly.length > 0 && !selectedRescue) {
        setSelectedRescue(assignedOnly[0]);
      }
    } catch (err) {
      console.error('Error fetching rescue data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeBranch]);

  const openUpdateModal = (rescue) => {
    setSelectedRescue(rescue);
    setNewStatus(rescue.status);
    setStatusNote('');
    setSelectedTeam(rescue.assignedTeam?.map((t) => (typeof t === 'object' ? t._id : t)) || []);
    setSelectedVehicle(rescue.assignedVehicle?._id || rescue.assignedVehicle || '');
    setCowName(`Rescued Cow (${rescue.trackingId})`);
    setUpdateModal(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRescue) return;

    setUpdating(true);
    try {
      await api.put(`/rescue/${selectedRescue._id}/status`, {
        status: newStatus,
        note: statusNote,
        teamMemberIds: selectedTeam,
        vehicleId: selectedVehicle || null,
        cowName
      });
      setUpdateModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating rescue status');
    } finally {
      setUpdating(false);
    }
  };

  const toggleTeamMember = (id) => {
    if (selectedTeam.includes(id)) {
      setSelectedTeam(selectedTeam.filter((t) => t !== id));
    } else {
      setSelectedTeam([...selectedTeam, id]);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#593713]">Rescue Operations & Dispatch</h1>
          <p className="text-xs text-stone-500">
            Dispatch teams, track ambulances, and intake rescued cows into shelter records
          </p>
        </div>
      </div>

      {/* 5-Nearest Broadcast Notification Banner */}
      {broadcastCount > 0 && (
        <div className="bg-amber-50 border-2 border-[#D6A23A] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D6A23A]/20 flex items-center justify-center text-[#80501D] shrink-0">
              <Zap className="w-5 h-5 text-[#80501D]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">
                ⚡ {broadcastCount} New Broadcast Rescue{broadcastCount > 1 ? 's' : ''} Awaiting Acceptance
              </h4>
              <p className="text-xs text-stone-600">
                Broadcasted to 5 nearest shelters. First shelter to accept claims and dispatches team!
              </p>
            </div>
          </div>
          <a
            href="/gaushala/requests"
            className="px-4 py-2 bg-[#557B42] hover:bg-[#436233] text-white text-xs font-bold rounded-xl transition shadow-xs text-center shrink-0"
          >
            View & Claim Now →
          </a>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
        </div>
      ) : rescues.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-stone-400">
          No rescue cases assigned to this Gaushala branch.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Rescue List (Left Column) */}
          <div className="lg:col-span-5 space-y-3">
            {rescues.map((r) => {
              const isSelected = selectedRescue?._id === r._id;
              return (
                <div
                  key={r._id}
                  onClick={() => setSelectedRescue(r)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'border-[#80501D] bg-[#FAF6ED] shadow-sm'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-stone-900">{r.trackingId}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <h4 className="font-bold text-stone-800 text-sm mt-1">{r.cowCondition} Cow</h4>
                  <p className="text-xs text-stone-500 truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    {r.addressText}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 mt-2 border-t border-stone-200/50">
                    <span>{r.reporterName}</span>
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Rescue Detail Card (Right Column) */}
          {selectedRescue && (
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400">Case Details</span>
                  <h2 className="text-xl font-black text-stone-900 font-mono">
                    {selectedRescue.trackingId}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedRescue.status} />
                  <button
                    onClick={() => openUpdateModal(selectedRescue)}
                    className="px-4 py-2 bg-[#80501D] hover:bg-[#593713] text-white text-xs font-bold rounded-xl shadow-sm transition"
                  >
                    Update Status & Team
                  </button>
                </div>
              </div>

              {/* Progress Stepper */}
              <TrackingStepper
                currentStatus={selectedRescue.status}
                history={selectedRescue.statusHistory}
              />

              {/* Photo & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-stone-100">
                <div className="space-y-2">
                  <div>
                    <span className="text-stone-400 font-semibold uppercase text-[10px]">Condition</span>
                    <p className="font-bold text-stone-800">{selectedRescue.cowCondition}</p>
                  </div>
                  <div>
                    <span className="text-stone-400 font-semibold uppercase text-[10px]">Location</span>
                    <p className="font-medium text-stone-700">{selectedRescue.addressText}</p>
                    {selectedRescue.landmark && (
                      <p className="text-stone-500 italic">Near: {selectedRescue.landmark}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-stone-400 font-semibold uppercase text-[10px]">Reporter</span>
                    <p className="font-medium text-stone-700">
                      {selectedRescue.reporterName} ({selectedRescue.reporterPhone})
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-stone-400 font-semibold uppercase text-[10px]">
                      Assigned Rescue Staff
                    </span>
                    {selectedRescue.assignedTeam && selectedRescue.assignedTeam.length > 0 ? (
                      <div className="space-y-1 mt-1">
                        {selectedRescue.assignedTeam.map((t, idx) => (
                          <p key={idx} className="font-medium text-stone-800 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-[#80501D]" />
                            {typeof t === 'object' ? `${t.name} (${t.role})` : 'Assigned Staff'}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-stone-400 italic">None assigned yet</p>
                    )}
                  </div>

                  <div>
                    <span className="text-stone-400 font-semibold uppercase text-[10px]">
                      Assigned Vehicle / Ambulance
                    </span>
                    {selectedRescue.assignedVehicle ? (
                      <p className="font-bold text-[#80501D] flex items-center gap-1 mt-0.5">
                        <Truck className="w-3.5 h-3.5" />
                        {typeof selectedRescue.assignedVehicle === 'object'
                          ? `${selectedRescue.assignedVehicle.vehicleNumber} (${selectedRescue.assignedVehicle.type})`
                          : 'Vehicle Assigned'}
                      </p>
                    ) : (
                      <p className="text-stone-400 italic">No ambulance assigned</p>
                    )}
                  </div>

                  {selectedRescue.createdCowId && (
                    <div className="p-2.5 rounded-xl bg-green-50 border border-green-200">
                      <p className="text-green-800 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Intake registered in Digital Cow Database
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Update Modal */}
      {updateModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200/80 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-[#FAF6ED] via-white to-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#80501D] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Truck className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base sm:text-lg text-stone-900">
                      Update Rescue Progress
                    </h3>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 border border-stone-200">
                      {selectedRescue?.trackingId}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Advance the rescue lifecycle and record team dispatch notes
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setUpdateModal(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleStatusSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Incident Quick Summary Banner */}
              {selectedRescue && (
                <div className="p-3.5 rounded-2xl bg-[#FAF6ED]/70 border border-[#D6A23A]/30 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-800">{selectedRescue.cowCondition} Cow</span>
                    {selectedRescue.urgency === 'Critical Emergency' ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-200">
                        🚨 Critical Emergency
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium text-[10px] border border-stone-200">
                        Normal Priority
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-600 truncate max-w-sm">
                    <MapPin className="w-3.5 h-3.5 text-[#80501D] shrink-0" />
                    <span className="truncate">{selectedRescue.addressText}</span>
                  </div>
                </div>
              )}

              {/* 1. Workflow Sequence Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#80501D] text-white text-[10px] font-bold flex items-center justify-center">
                      1
                    </span>
                    Change Incident Status
                  </label>
                  <span className="text-[11px] font-medium text-stone-500">
                    Target: <strong className="text-[#80501D]">{newStatus || 'Select stage'}</strong>
                  </span>
                </div>

                {/* Quick Advance Button */}
                {(() => {
                  const currentIdx = RESCUE_SEQUENCE_STEPS.findIndex(
                    (s) => s.status === selectedRescue?.status
                  );
                  const nextStep =
                    currentIdx >= 0 && currentIdx < RESCUE_SEQUENCE_STEPS.length - 1
                      ? RESCUE_SEQUENCE_STEPS[currentIdx + 1]
                      : null;

                  if (nextStep && newStatus !== nextStep.status) {
                    return (
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-[#80501D] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                            {nextStep.step}
                          </span>
                          <div className="text-xs truncate">
                            <span className="text-stone-500 font-medium">Recommended next stage: </span>
                            <span className="font-bold text-[#80501D]">{nextStep.label}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewStatus(nextStep.status)}
                          className="px-3.5 py-1.5 bg-[#80501D] hover:bg-[#593713] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                        >
                          Advance to Step {nextStep.step}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Step Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-stone-200/80 rounded-2xl p-2.5 bg-stone-50/50 max-h-56 overflow-y-auto">
                  {RESCUE_SEQUENCE_STEPS.map((s) => {
                    const isSelected = newStatus === s.status;
                    const isCurrent = selectedRescue?.status === s.status;
                    const StepIcon = s.icon;
                    const isCompletedStage = s.status === 'Completed';
                    const showGreenCheck = isCompletedStage && (isSelected || isCurrent);

                    return (
                      <div
                        key={s.status}
                        onClick={() => setNewStatus(s.status)}
                        className={`flex items-start justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                          showGreenCheck
                            ? 'border-green-500 bg-green-50/80 ring-2 ring-green-500/30 shadow-xs'
                            : isSelected
                            ? 'border-[#80501D] bg-[#FAF6ED] ring-2 ring-[#80501D]/25 shadow-xs'
                            : 'border-stone-200/80 bg-white hover:bg-stone-50/80'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition ${
                              showGreenCheck
                                ? 'bg-green-600 text-white shadow-xs'
                                : isSelected
                                ? 'bg-[#80501D] text-white shadow-xs'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {showGreenCheck ? (
                              <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                            ) : (
                              s.step
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-xs font-bold ${
                                  showGreenCheck
                                    ? 'text-green-900'
                                    : isSelected
                                    ? 'text-[#80501D]'
                                    : 'text-stone-800'
                                }`}
                              >
                                {s.label}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-stone-200 text-stone-700">
                                  Current
                                </span>
                              )}
                              {s.badge && (
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${
                                    showGreenCheck
                                      ? 'bg-green-200 text-green-900 border-green-300 font-bold'
                                      : 'bg-green-100 text-green-800 border-green-200'
                                  }`}
                                >
                                  {s.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{s.desc}</p>
                          </div>
                        </div>

                        <div className="shrink-0 pl-1">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition mt-0.5 ${
                              showGreenCheck
                                ? 'border-green-600 bg-green-600 shadow-xs'
                                : isSelected
                                ? 'border-[#80501D] bg-[#80501D]'
                                : 'border-stone-300 bg-white'
                            }`}
                          >
                            {showGreenCheck ? (
                              <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                            ) : isSelected ? (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cancel option */}
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => setNewStatus('Cancelled')}
                    className={`text-xs flex items-center gap-1.5 px-3 py-1 rounded-xl border transition cursor-pointer ${
                      newStatus === 'Cancelled'
                        ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold ring-2 ring-rose-400'
                        : 'text-stone-400 hover:text-rose-600 hover:bg-rose-50 border-transparent hover:border-rose-200'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Cancel incident (False alarm / duplicate)</span>
                    {newStatus === 'Cancelled' && (
                      <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-bold">
                        Selected
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Digital Cow Intake Card (When Stage is 'Received at Gaushala' or 'Completed') */}
              {(newStatus === 'Received at Gaushala' || newStatus === 'Completed') && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400/60 rounded-2xl space-y-2.5 shadow-xs animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-green-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-green-700" />
                      Digital Cow Database Intake
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-200 text-green-900">
                      Auto-generates Cow ID
                    </span>
                  </div>
                  <input
                    type="text"
                    value={cowName}
                    onChange={(e) => setCowName(e.target.value)}
                    placeholder="e.g. Rescued Gauri"
                    className="w-full px-3.5 py-2 rounded-xl border border-green-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-green-500 shadow-xs"
                  />
                  <p className="text-[11px] text-green-700">
                    ✨ Rescued cow will be registered with a unique ID (e.g. COW-2026-XXXX) into your shelter herd with arrival records.
                  </p>
                </div>
              )}

              {/* 2. Dispatch Resources: Vehicle & Staff */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#80501D] text-white text-[10px] font-bold flex items-center justify-center">
                    2
                  </span>
                  Dispatch Vehicle & Rescue Staff
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Ambulance selector */}
                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#80501D]" />
                        Dispatch Vehicle / Ambulance
                      </span>
                      {selectedVehicle && (
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                          Assigned
                        </span>
                      )}
                    </div>

                    {vehicles.length > 0 ? (
                      <select
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#D6A23A] bg-stone-50/60"
                      >
                        <option value="">No vehicle assigned</option>
                        {vehicles.map((v) => (
                          <option key={v._id} value={v._id}>
                            {v.vehicleNumber} ({v.type}) - Cap: {v.capacity}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-center">
                        <p className="text-[11px] text-stone-500 font-medium">No ambulances registered yet</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">Optional — can dispatch without registered van</p>
                      </div>
                    )}
                  </div>

                  {/* Rescue Staff selector */}
                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#80501D]" />
                        Assign Rescue Staff ({selectedTeam.length} selected)
                      </span>
                    </div>

                    {teamMembers.length > 0 ? (
                      <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto pr-1">
                        {teamMembers.map((m) => {
                          const isAssigned = selectedTeam.includes(m._id);
                          return (
                            <button
                              type="button"
                              key={m._id}
                              onClick={() => toggleTeamMember(m._id)}
                              className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                                isAssigned
                                  ? 'bg-[#80501D] text-white shadow-xs'
                                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/60'
                              }`}
                            >
                              <span>{m.name}</span>
                              <span className={`text-[10px] font-normal ${isAssigned ? 'text-amber-200' : 'text-stone-400'}`}>
                                {m.role.replace('_', ' ')}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-center">
                        <p className="text-[11px] text-stone-500 font-medium">No staff profiles registered yet</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">Optional — you can add staff in Team tab</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Progress Log Note */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#80501D] text-white text-[10px] font-bold flex items-center justify-center">
                      3
                    </span>
                    Log Progress Note
                  </label>
                  <span className="text-[11px] text-stone-400 font-medium">Recorded in incident history</span>
                </div>

                {/* Quick note suggestion chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">Quick:</span>
                  {[
                    'Ambulance dispatched to site',
                    'Reached spot and secured cow safely',
                    'Cow transport en route to shelter',
                    'Admitted safely to Gaushala clinic'
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setStatusNote(preset)}
                      className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200/70 transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Ambulance DL1L-4421 dispatched with Manoj Kumar driver"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#D6A23A] bg-stone-50/50"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setUpdateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2.5 bg-[#80501D] hover:bg-[#593713] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-amber-300" />
                      <span>Save Progress</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

