import React from 'react';
import {
  Check,
  Clock,
  AlertCircle,
  ShieldCheck,
  Send,
  Navigation,
  HeartHandshake,
  Truck,
  Home,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Calendar,
  FileText
} from 'lucide-react';

const RESCUE_STAGES = [
  { key: 'Reported', label: 'Reported', shortLabel: 'Reported', icon: AlertCircle },
  { key: 'Assigned', label: 'Assigned', shortLabel: 'Assigned', icon: ShieldCheck },
  { key: 'Team Dispatched', label: 'Dispatched', shortLabel: 'Dispatch', icon: Send },
  { key: 'On The Way', label: 'On The Way', shortLabel: 'En Route', icon: Navigation },
  { key: 'Rescued', label: 'Rescued', shortLabel: 'Rescued', icon: HeartHandshake },
  { key: 'Transporting', label: 'Transporting', shortLabel: 'Transit', icon: Truck },
  { key: 'Received at Gaushala', label: 'Received at Gaushala', shortLabel: 'Shelter', icon: Home },
  { key: 'Completed', label: 'Completed', shortLabel: 'Completed', icon: CheckCircle2 }
];

const MEDICAL_STAGES = [
  { key: 'New', label: 'Request Submitted', shortLabel: 'Submitted', icon: AlertCircle },
  { key: 'Accepted', label: 'Shelter Accepted', shortLabel: 'Accepted', icon: ShieldCheck },
  { key: 'Doctor Assigned', label: 'Doctor Assigned', shortLabel: 'Dr Assigned', icon: Stethoscope },
  { key: 'Scheduled', label: 'Visit Scheduled', shortLabel: 'Scheduled', icon: Calendar },
  { key: 'On The Way', label: 'Doctor En Route', shortLabel: 'En Route', icon: Navigation },
  { key: 'Visit Completed', label: 'Visit Completed', shortLabel: 'Completed', icon: CheckCircle2 }
];

const SURRENDER_STAGES = [
  { key: 'Submitted', label: 'Application Submitted', shortLabel: 'Submitted', icon: FileText },
  { key: 'Under Review', label: 'Under Review', shortLabel: 'Review', icon: Clock },
  { key: 'Approved', label: 'Approved', shortLabel: 'Approved', icon: ShieldCheck },
  { key: 'Pickup Scheduled', label: 'Pickup Scheduled', shortLabel: 'Scheduled', icon: Calendar },
  { key: 'In Transit', label: 'In Transit', shortLabel: 'In Transit', icon: Truck },
  { key: 'Received', label: 'Received at Shelter', shortLabel: 'Received', icon: Home },
  { key: 'Completed', label: 'Completed', shortLabel: 'Completed', icon: CheckCircle2 }
];

export default function TrackingStepper({
  currentStatus = 'Reported',
  history = [],
  requestType = null
}) {
  // Determine request type
  let detectedType = requestType ? requestType.toUpperCase() : null;
  if (!detectedType) {
    if (['New', 'Doctor Assigned', 'Scheduled', 'Visit Completed'].includes(currentStatus)) {
      detectedType = 'MEDICAL';
    } else if (
      [
        'Submitted',
        'Under Review',
        'Inspection Required',
        'Approved',
        'Pickup Scheduled',
        'In Transit',
        'Received',
        'Rejected'
      ].includes(currentStatus)
    ) {
      detectedType = 'SURRENDER';
    } else {
      detectedType = 'RESCUE';
    }
  }

  let stages = RESCUE_STAGES;
  let workflowTitle = 'Rescue Workflow Sequence';
  let isFailed = currentStatus === 'Cancelled' || currentStatus === 'Rejected';
  let failureMessage = 'This request was cancelled or marked as duplicate.';

  if (detectedType === 'MEDICAL') {
    stages = MEDICAL_STAGES;
    workflowTitle = 'Veterinary Doctor Visit Sequence';
    failureMessage = 'This veterinary doctor request was cancelled.';
  } else if (detectedType === 'SURRENDER') {
    stages = SURRENDER_STAGES;
    workflowTitle = 'Surrender & Intake Sequence';
    failureMessage =
      currentStatus === 'Rejected'
        ? 'This cow surrender application could not be approved at this time.'
        : 'This surrender request was cancelled.';
  }

  // Calculate stage index based on type
  const getStageIndex = (status) => {
    if (detectedType === 'MEDICAL') {
      if (status === 'Contacted') return 1;
      if (status === 'Completed' || status === 'Visit Completed') return stages.length - 1;
      const idx = stages.findIndex((s) => s.key === status);
      return idx >= 0 ? idx : 0;
    }

    if (detectedType === 'SURRENDER') {
      if (status === 'Contacted' || status === 'Inspection Required') return 1;
      if (status === 'Completed') return stages.length - 1;
      const idx = stages.findIndex((s) => s.key === status);
      return idx >= 0 ? idx : 0;
    }

    // Default RESCUE
    if (status === 'Under Verification') return 0;
    const idx = stages.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const currentIndex = getStageIndex(currentStatus);

  const isFinished =
    detectedType === 'MEDICAL'
      ? currentStatus === 'Visit Completed' || currentStatus === 'Completed'
      : detectedType === 'SURRENDER'
      ? currentStatus === 'Received' || currentStatus === 'Completed'
      : currentStatus === 'Completed';

  const progressPercent = isFailed
    ? 100
    : isFinished
    ? 100
    : Math.min(100, Math.max(12, ((currentIndex + 1) / stages.length) * 100));

  const gridColsClass =
    stages.length === 6
      ? 'grid-cols-3 sm:grid-cols-6'
      : stages.length === 7
      ? 'grid-cols-4 sm:grid-cols-7'
      : 'grid-cols-4 md:grid-cols-8';

  return (
    <div className="py-3 space-y-4">
      {/* Cancelled / Rejected Banner */}
      {isFailed && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-800 text-xs font-semibold">
          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{failureMessage}</span>
        </div>
      )}

      {/* Progress Bar Track */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500">
          <span>{workflowTitle}</span>
          {!isFailed && (
            <span
              className={
                isFinished
                  ? 'text-green-700 font-bold flex items-center gap-1'
                  : 'text-[#80501D] font-bold'
              }
            >
              {isFinished ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600 inline" />
                  All {stages.length} Stages Completed
                </>
              ) : (
                `Step ${currentIndex + 1} of ${stages.length}: ${stages[currentIndex]?.label}`
              )}
            </span>
          )}
        </div>

        <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/60">
          <div
            style={{ width: `${progressPercent}%` }}
            className={`h-full transition-all duration-500 ease-out ${
              isFailed
                ? 'bg-rose-500'
                : 'bg-gradient-to-r from-[#80501D] via-[#D6A23A] to-[#557B42]'
            }`}
          />
        </div>
      </div>

      {/* Steps Visual Stepper Grid */}
      <div className={`grid ${gridColsClass} gap-1.5 sm:gap-2`}>
        {stages.map((stage, idx) => {
          const isCompleted =
            !isFailed && (currentIndex > idx || (isFinished && currentIndex === idx));
          const isCurrent = !isFailed && !isFinished && currentIndex === idx;
          const Icon = stage.icon;

          return (
            <div
              key={stage.key}
              title={stage.label}
              className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all ${
                isCompleted
                  ? 'border-green-300 bg-green-50/80 text-green-900 shadow-xs'
                  : isCurrent
                  ? 'border-[#80501D] bg-[#FAF6ED] ring-2 ring-[#80501D]/20 shadow-xs'
                  : 'border-stone-200/80 bg-white text-stone-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 text-xs transition ${
                  isCompleted
                    ? 'bg-green-600 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-[#80501D] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" />
                ) : isCurrent ? (
                  <Icon className="w-3.5 h-3.5 animate-pulse" />
                ) : (
                  <span className="text-[10px] font-bold">{idx + 1}</span>
                )}
              </div>

              <span
                className={`text-[10px] font-semibold leading-tight line-clamp-1 ${
                  isCompleted
                    ? 'text-green-800 font-bold'
                    : isCurrent
                    ? 'text-[#80501D] font-bold'
                    : 'text-stone-500'
                }`}
              >
                {stage.shortLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* History Log Timeline */}
      {history && history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-stone-100">
          <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2.5">
            Progress Log & Activity
          </h4>
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {history
              .slice()
              .reverse()
              .map((h, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 text-xs p-2 rounded-xl bg-stone-50/80 border border-stone-100"
                >
                  <span className="w-2 h-2 rounded-full bg-[#80501D] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-stone-800">{h.status}</span>
                      <span className="text-[11px] text-stone-400">
                        {h.timestamp
                          ? new Date(h.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : ''}
                      </span>
                    </div>
                    {h.note && <p className="text-stone-600 text-[11px] mt-0.5">{h.note}</p>}
                    {h.updatedByName && (
                      <p className="text-[10px] text-stone-400 mt-0.5">By: {h.updatedByName}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
