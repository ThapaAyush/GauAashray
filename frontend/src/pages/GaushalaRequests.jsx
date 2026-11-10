import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  HeartPulse,
  Stethoscope,
  Home,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Radio,
  AlertCircle,
  Loader2,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function GaushalaRequests() {
  const { user, activeBranch } = useAuth();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('RESCUE');
  const [rescues, setRescues] = useState([]);
  const [medical, setMedical] = useState([]);
  const [surrenders, setSurrenders] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time flash notification banner
  const [claimedBanner, setClaimedBanner] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Modals / action states
  const [assignDoctorModal, setAssignDoctorModal] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledSlot, setScheduledSlot] = useState('10:00 AM - 01:00 PM');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [rRes, mRes, sRes, dRes] = await Promise.all([
        api.get('/rescue/gaushala/requests').catch(() => ({ data: { requests: [] } })),
        api.get('/medical/gaushala/requests').catch(() => ({ data: { requests: [] } })),
        api.get('/surrender/gaushala/requests').catch(() => ({ data: { requests: [] } })),
        api.get('/doctors').catch(() => ({ data: { doctors: [] } }))
      ]);

      setRescues(rRes.data.requests || []);
      setMedical(mRes.data.requests || []);
      setSurrenders(sRes.data.requests || []);
      setDoctors(dRes.data.doctors || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeBranch]);

  // Realtime Socket Listeners for 5-Gaushala Broadcast Events
  useEffect(() => {
    if (!socket) return;

    // 1. When another Gaushala claims a request, immediately remove it from this Gaushala's list!
    const handleRequestClaimed = (data) => {
      const { requestId, trackingId, claimedBy } = data;

      // Check if this request is in our rescue list
      setRescues((prev) => {
        const found = prev.find((r) => r._id === requestId);
        if (found) {
          setClaimedBanner({
            trackingId,
            claimedBy,
            type: 'Rescue',
            message: `Rescue ${trackingId} was accepted by ${claimedBy} and removed from your queue.`
          });
        }
        return prev.filter((r) => r._id !== requestId);
      });

      // Check medical list
      setMedical((prev) => {
        const found = prev.find((m) => m._id === requestId);
        if (found) {
          setClaimedBanner({
            trackingId,
            claimedBy,
            type: 'Veterinary Doctor',
            message: `Doctor request ${trackingId} was accepted by ${claimedBy} and removed from your queue.`
          });
        }
        return prev.filter((m) => m._id !== requestId);
      });

      // Check surrender list
      setSurrenders((prev) => {
        const found = prev.find((s) => s._id === requestId);
        if (found) {
          setClaimedBanner({
            trackingId,
            claimedBy,
            type: 'Surrender',
            message: `Surrender ${trackingId} was accepted by ${claimedBy} and removed from your queue.`
          });
        }
        return prev.filter((s) => s._id !== requestId);
      });
    };

    // 2. When a new broadcast arrives, refetch so it pops up instantly
    const handleNewBroadcast = (data) => {
      fetchRequests();
    };

    // 3. When this Gaushala declines a request
    const handleRequestDeclined = (data) => {
      const { requestId } = data;
      setRescues((prev) => prev.filter((r) => r._id !== requestId));
      setMedical((prev) => prev.filter((m) => m._id !== requestId));
      setSurrenders((prev) => prev.filter((s) => s._id !== requestId));
    };

    socket.on('broadcast_request_claimed', handleRequestClaimed);
    socket.on('new_broadcast_request', handleNewBroadcast);
    socket.on('broadcast_request_declined', handleRequestDeclined);

    return () => {
      socket.off('broadcast_request_claimed', handleRequestClaimed);
      socket.off('new_broadcast_request', handleNewBroadcast);
      socket.off('broadcast_request_declined', handleRequestDeclined);
    };
  }, [socket]);

  // Rescue Accept (Claims the request for this Gaushala, removes from other 4)
  const handleAcceptRescue = async (id) => {
    setActionLoadingId(id);
    try {
      const res = await api.put(`/rescue/${id}/accept`, {
        branchId: activeBranch?._id || null
      });

      // Update local state to mark as assigned
      setRescues((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: 'Assigned', isBroadcast: false } : r))
      );
      fetchRequests();
    } catch (err) {
      if (err.response?.status === 409 || err.response?.data?.alreadyClaimed) {
        const claimedBy = err.response?.data?.claimedBy || 'another Gaushala';
        alert(`⚡ This request was already accepted by ${claimedBy}! It will be removed from your queue.`);
        setRescues((prev) => prev.filter((r) => r._id !== id));
      } else {
        alert(err.response?.data?.message || 'Error accepting rescue request.');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Rescue Decline
  const handleRejectRescue = async (id) => {
    const reason = prompt('State reason for declining this request:');
    if (reason === null) return;

    setActionLoadingId(id);
    try {
      await api.put(`/rescue/${id}/reject`, { reason: reason || 'Capacity or resources full' });
      // Instantly remove from queue
      setRescues((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error declining request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Medical Accept
  const handleAcceptMedical = async (id) => {
    setActionLoadingId(id);
    try {
      await api.put(`/medical/${id}/accept`, {
        branchId: activeBranch?._id || null
      });
      fetchRequests();
    } catch (err) {
      if (err.response?.status === 409 || err.response?.data?.alreadyClaimed) {
        const claimedBy = err.response?.data?.claimedBy || 'another Gaushala';
        alert(`⚡ This request was already accepted by ${claimedBy}! It will be removed from your queue.`);
        setMedical((prev) => prev.filter((m) => m._id !== id));
      } else {
        alert(err.response?.data?.message || 'Error accepting doctor request.');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Medical Decline
  const handleRejectMedical = async (id) => {
    const reason = prompt('State reason for declining:');
    if (reason === null) return;

    setActionLoadingId(id);
    try {
      await api.put(`/medical/${id}/reject`, { reason });
      setMedical((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error declining request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Doctor Assign
  const handleAssignDoctor = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !assignDoctorModal) return;

    try {
      await api.post(`/medical/${assignDoctorModal._id}/assign-doctor`, {
        doctorId: selectedDoctorId,
        scheduledDate,
        scheduledTimeSlot: scheduledSlot
      });
      setAssignDoctorModal(null);
      fetchRequests();
    } catch (err) {
      if (err.response?.status === 409 || err.response?.data?.alreadyClaimed) {
        alert('This request was claimed by another shelter.');
        setMedical((prev) => prev.filter((m) => m._id !== assignDoctorModal._id));
        setAssignDoctorModal(null);
      } else {
        alert(err.response?.data?.message || 'Error assigning doctor');
      }
    }
  };

  // Surrender Accept
  const handleAcceptSurrender = async (id) => {
    setActionLoadingId(id);
    try {
      await api.put(`/surrender/${id}/accept`, {
        branchId: activeBranch?._id || null
      });
      fetchRequests();
    } catch (err) {
      if (err.response?.status === 409 || err.response?.data?.alreadyClaimed) {
        const claimedBy = err.response?.data?.claimedBy || 'another Gaushala';
        alert(`⚡ This request was already accepted by ${claimedBy}!`);
        setSurrenders((prev) => prev.filter((s) => s._id !== id));
      } else {
        alert(err.response?.data?.message || 'Error accepting surrender request.');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Surrender Decline
  const handleRejectSurrender = async (id) => {
    const reason = prompt('State reason for declining:');
    if (reason === null) return;

    setActionLoadingId(id);
    try {
      await api.put(`/surrender/${id}/reject`, { reason });
      setSurrenders((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error declining surrender request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Surrender Update
  const handleSurrenderAction = async (id, status) => {
    try {
      await api.put(`/surrender/${id}/status`, { status });
      fetchRequests();
    } catch (err) {
      alert('Error updating surrender status.');
    }
  };

  // Separate Broadcasts from Assigned for the active tab
  const getCounts = (list) => {
    const broadcastCount = list.filter((item) => item.isBroadcast).length;
    return {
      total: list.length,
      broadcasts: broadcastCount,
      assigned: list.length - broadcastCount
    };
  };

  const rescueCounts = getCounts(rescues);
  const medicalCounts = getCounts(medical);
  const surrenderCounts = getCounts(surrenders);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Real-time Claimed Banner Alert */}
      {claimedBanner && (
        <div className="bg-amber-50 border-2 border-[#D6A23A] rounded-2xl p-4 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D6A23A]/20 flex items-center justify-center shrink-0 text-[#80501D]">
              <Zap className="w-5 h-5 text-[#80501D]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#80501D] uppercase tracking-wide">
                ⚡ Instant Queue Update (First to Accept Model)
              </p>
              <p className="text-sm text-stone-800 font-semibold">{claimedBanner.message}</p>
            </div>
          </div>
          <button
            onClick={() => setClaimedBanner(null)}
            className="text-stone-400 hover:text-stone-700 font-bold px-3 py-1 rounded-lg hover:bg-amber-100/50 text-sm transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#593713]">Incoming Public Requests</h1>
            {(rescueCounts.broadcasts > 0 || medicalCounts.broadcasts > 0 || surrenderCounts.broadcasts > 0) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D6A23A] text-white animate-pulse">
                <Radio className="w-3 h-3" />
                Live Broadcasts
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Requests are broadcasted to the 5 nearest Gaushalas. The first shelter to accept claims the request.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <button
            onClick={() => setActiveTab('RESCUE')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'RESCUE'
                ? 'bg-[#80501D] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            Rescue ({rescues.length})
            {rescueCounts.broadcasts > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#D6A23A] animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('MEDICAL')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'MEDICAL'
                ? 'bg-[#80501D] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Doctor ({medical.length})
            {medicalCounts.broadcasts > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#D6A23A] animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('SURRENDER')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'SURRENDER'
                ? 'bg-[#80501D] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Surrender ({surrenders.length})
            {surrenderCounts.broadcasts > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#D6A23A] animate-ping" />
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
          <p className="text-xs text-stone-500 mt-2">Loading incoming requests...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ================= RESCUE TAB ================= */}
          {activeTab === 'RESCUE' && (
            <>
              {rescues.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-stone-400 text-sm">
                  No rescue requests for this shelter branch.
                </div>
              ) : (
                <div className="space-y-4">
                  {rescues.map((r) => {
                    const isBroadcast = r.isBroadcast;
                    const distance = r.broadcastDistanceKm || r.calculatedDistanceKm;

                    return (
                      <div
                        key={r._id}
                        className={`bg-white p-6 rounded-3xl border transition space-y-4 ${
                          isBroadcast
                            ? 'border-2 border-[#D6A23A] shadow-md hover:shadow-lg bg-gradient-to-br from-white via-amber-50/10 to-amber-50/30'
                            : 'border-stone-200 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {/* 5-Nearest Broadcast Header Ribbon */}
                        {isBroadcast && (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FAF6ED] border border-[#D6A23A]/40 px-4 py-2 rounded-2xl">
                            <div className="flex items-center gap-2">
                              <span className="flex h-2.5 w-2.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D6A23A] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#80501D]"></span>
                              </span>
                              <p className="text-xs font-bold text-[#80501D]">
                                ⚡ FAST RESPONSE QUEUE • Broadcasted to 5 Nearest Shelters
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-stone-600">
                                First shelter to click Accept claims this case
                              </span>
                              {distance && (
                                <span className="font-bold text-xs bg-white text-[#80501D] px-2.5 py-0.5 rounded-full border border-[#D6A23A]/40 shadow-xs">
                                  📍 {distance} km away
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Top ID & Time Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-stone-900">
                              {r.trackingId}
                            </span>
                            <StatusBadge status={isBroadcast ? 'Under Verification' : r.status} />
                            {isBroadcast && (
                              <span className="text-[10px] font-bold text-[#80501D] bg-[#FAF6ED] border border-[#D6A23A]/40 px-2 py-0.5 rounded-full">
                                AWAITING CLAIM
                              </span>
                            )}
                            {r.urgency === 'Critical Emergency' && (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full animate-pulse">
                                CRITICAL EMERGENCY
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-stone-400">
                            {!isBroadcast && distance && (
                              <span className="font-semibold text-[#80501D] bg-[#FAF6ED] px-2.5 py-0.5 rounded-full">
                                {distance} km away
                              </span>
                            )}
                            <span>{new Date(r.createdAt).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Main Body */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          {r.photographs && r.photographs[0] && (
                            <div className="md:col-span-2">
                              <img
                                src={r.photographs[0]}
                                alt="Incident"
                                className="w-full h-24 object-cover rounded-2xl border border-stone-200"
                              />
                            </div>
                          )}

                          <div className={r.photographs && r.photographs[0] ? 'md:col-span-6' : 'md:col-span-8'}>
                            <h3 className="font-bold text-stone-900 text-base">{r.cowCondition} Cow</h3>
                            <p className="text-xs text-stone-600 mt-0.5">{r.description || 'No additional note'}</p>
                            <p className="text-xs text-stone-500 mt-2 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              {r.addressText} {r.landmark && `(Near: ${r.landmark})`}
                            </p>
                            <p className="text-xs text-stone-700 mt-1 flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              Reporter: <span className="font-semibold">{r.reporterName}</span> ({r.reporterPhone})
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="md:col-span-4 flex flex-col items-stretch justify-center gap-2">
                            {isBroadcast ? (
                              <>
                                <button
                                  onClick={() => handleAcceptRescue(r._id)}
                                  disabled={actionLoadingId === r._id}
                                  className="w-full py-2.5 px-4 bg-[#557B42] hover:bg-[#436233] text-white text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                  {actionLoadingId === r._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-4 h-4" />
                                      Accept & Claim Request
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleRejectRescue(r._id)}
                                  disabled={actionLoadingId === r._id}
                                  className="w-full py-2 px-3 border border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                                >
                                  Decline & Pass to Other Shelters
                                </button>
                              </>
                            ) : (
                              <a
                                href={`/gaushala/rescue`}
                                className="w-full py-2.5 px-3 bg-[#80501D] hover:bg-[#593713] text-white text-xs font-bold rounded-xl text-center transition shadow-sm flex items-center justify-center gap-2"
                              >
                                Manage Rescue Dispatch →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ================= MEDICAL TAB ================= */}
          {activeTab === 'MEDICAL' && (
            <>
              {medical.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-stone-400 text-sm">
                  No veterinary doctor requests at this time.
                </div>
              ) : (
                <div className="space-y-4">
                  {medical.map((m) => {
                    const isBroadcast = m.isBroadcast;

                    return (
                      <div
                        key={m._id}
                        className={`bg-white p-6 rounded-3xl border transition space-y-4 ${
                          isBroadcast
                            ? 'border-2 border-[#D6A23A] shadow-md bg-gradient-to-br from-white via-amber-50/10 to-amber-50/30'
                            : 'border-stone-200 shadow-sm'
                        }`}
                      >
                        {isBroadcast && (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FAF6ED] border border-[#D6A23A]/40 px-4 py-2 rounded-2xl">
                            <p className="text-xs font-bold text-[#80501D] flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-[#80501D]" />
                              ⚡ VETERINARY BROADCAST • 5 Nearest Gaushalas
                            </p>
                            <span className="text-[11px] font-semibold text-stone-600">
                              First clinic to accept confirms appointment assignment
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-stone-900">{m.requestId}</span>
                            <StatusBadge status={isBroadcast ? 'New' : m.status} />
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                              Urgency: {m.urgency}
                            </span>
                          </div>
                          <span className="text-xs text-stone-400">{new Date(m.createdAt).toLocaleString()}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          <div className="md:col-span-8 space-y-1">
                            <h3 className="font-bold text-stone-900 text-base">
                              {m.cowName || 'Cow'} • Age: {m.cowAge || 'Unknown'}
                            </h3>
                            <p className="text-xs text-stone-700">
                              <strong>Symptoms:</strong> {m.symptoms}
                            </p>
                            <p className="text-xs text-stone-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              {m.addressText}
                            </p>
                            <p className="text-xs text-stone-700 flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              Owner: <span className="font-semibold">{m.ownerName}</span> ({m.ownerPhone})
                            </p>
                            {m.assignedDoctor && (
                              <p className="text-xs text-blue-700 font-semibold pt-1">
                                Assigned Doctor: Dr. {m.assignedDoctor.name} ({m.assignedDoctor.qualification})
                              </p>
                            )}
                          </div>

                          <div className="md:col-span-4 flex flex-col gap-2">
                            {isBroadcast ? (
                              <>
                                <button
                                  onClick={() => handleAcceptMedical(m._id)}
                                  disabled={actionLoadingId === m._id}
                                  className="w-full py-2.5 px-3 bg-[#557B42] hover:bg-[#436233] text-white text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Accept & Claim Request
                                </button>
                                <button
                                  onClick={() => handleRejectMedical(m._id)}
                                  disabled={actionLoadingId === m._id}
                                  className="w-full py-2 px-3 border border-stone-200 text-stone-500 hover:bg-stone-50 text-xs font-semibold rounded-xl transition cursor-pointer"
                                >
                                  Decline & Remove
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setAssignDoctorModal(m);
                                  setSelectedDoctorId(doctors[0]?._id || '');
                                }}
                                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                              >
                                {m.assignedDoctor ? 'Reassign Doctor' : 'Assign Doctor & Schedule'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ================= SURRENDER TAB ================= */}
          {activeTab === 'SURRENDER' && (
            <>
              {surrenders.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-stone-400 text-sm">
                  No cow surrender requests.
                </div>
              ) : (
                <div className="space-y-4">
                  {surrenders.map((s) => {
                    const isBroadcast = s.isBroadcast;

                    return (
                      <div
                        key={s._id}
                        className={`bg-white p-6 rounded-3xl border transition space-y-4 ${
                          isBroadcast
                            ? 'border-2 border-[#D6A23A] shadow-md bg-gradient-to-br from-white via-amber-50/10 to-amber-50/30'
                            : 'border-stone-200 shadow-sm'
                        }`}
                      >
                        {isBroadcast && (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FAF6ED] border border-[#D6A23A]/40 px-4 py-2 rounded-2xl">
                            <p className="text-xs font-bold text-[#80501D] flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-[#80501D]" />
                              ⚡ SURRENDER BROADCAST • 5 Nearest Gaushalas with Capacity
                            </p>
                            <span className="text-[11px] font-semibold text-stone-600">
                              First shelter to accept conducts verification & intake
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-stone-900">{s.requestId}</span>
                            <StatusBadge status={isBroadcast ? 'Under Review' : s.status} />
                          </div>
                          <span className="text-xs text-stone-400">{new Date(s.createdAt).toLocaleString()}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          <div className="md:col-span-8 space-y-1">
                            <h3 className="font-bold text-stone-900 text-base">
                              {s.cowName || 'Cow'} • Breed: {s.breed || 'Desi'} • Reason: {s.reason}
                            </h3>
                            <p className="text-xs text-stone-600">
                              Number of Cows: <strong>{s.numberOfCows || 1}</strong> • Health: {s.healthCondition}
                            </p>
                            <p className="text-xs text-stone-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              {s.addressText}
                            </p>
                            <p className="text-xs text-stone-700 flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              Owner: <span className="font-semibold">{s.ownerName}</span> ({s.ownerPhone})
                            </p>
                          </div>

                          <div className="md:col-span-4 flex flex-col gap-2">
                            {isBroadcast ? (
                              <>
                                <button
                                  onClick={() => handleAcceptSurrender(s._id)}
                                  disabled={actionLoadingId === s._id}
                                  className="w-full py-2.5 px-3 bg-[#557B42] hover:bg-[#436233] text-white text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Accept & Review Intake
                                </button>
                                <button
                                  onClick={() => handleRejectSurrender(s._id)}
                                  disabled={actionLoadingId === s._id}
                                  className="w-full py-2 px-3 border border-stone-200 text-stone-500 hover:bg-stone-50 text-xs font-semibold rounded-xl transition cursor-pointer"
                                >
                                  Decline
                                </button>
                              </>
                            ) : (
                              <>
                                {s.status === 'Under Review' && (
                                  <>
                                    <button
                                      onClick={() => handleSurrenderAction(s._id, 'Inspection Required')}
                                      className="w-full py-2 px-3 bg-[#80501D] hover:bg-[#593713] text-white text-xs font-bold rounded-xl transition"
                                    >
                                      Schedule Inspection
                                    </button>
                                    <button
                                      onClick={() => handleSurrenderAction(s._id, 'Approved')}
                                      className="w-full py-2 px-3 bg-[#557B42] hover:bg-[#436233] text-white text-xs font-bold rounded-xl transition"
                                    >
                                      Approve Shelter Intake
                                    </button>
                                  </>
                                )}
                                {s.status === 'Approved' && (
                                  <button
                                    onClick={() => handleSurrenderAction(s._id, 'Received')}
                                    className="w-full py-2.5 px-3 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl transition"
                                  >
                                    Mark Received at Gaushala
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Assign Doctor Modal */}
      {assignDoctorModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900">
              Assign Veterinary Doctor & Schedule Visit
            </h3>
            <p className="text-xs text-stone-500">
              For case {assignDoctorModal.requestId} ({assignDoctorModal.cowName})
            </p>

            <form onSubmit={handleAssignDoctor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Select Registered Doctor
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none"
                >
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      Dr. {d.name} ({d.specialization}) - {d.availabilityStatus}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Scheduled Visit Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Time Slot
                </label>
                <input
                  type="text"
                  value={scheduledSlot}
                  onChange={(e) => setScheduledSlot(e.target.value)}
                  placeholder="e.g. 10:00 AM - 01:00 PM"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignDoctorModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
