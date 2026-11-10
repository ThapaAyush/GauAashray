import React from 'react';

const statusStyles = {
  // Rescue & Surrender
  'Reported': 'bg-amber-100 text-amber-800 border-amber-300',
  'Under Verification': 'bg-blue-100 text-blue-800 border-blue-300',
  'Assigned': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  'Team Dispatched': 'bg-purple-100 text-purple-800 border-purple-300',
  'On The Way': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  'Rescued': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Transporting': 'bg-teal-100 text-teal-800 border-teal-300',
  'Received at Gaushala': 'bg-green-100 text-green-900 border-green-400 font-semibold',
  'Completed': 'bg-green-100 text-green-800 border-green-300',
  'Cancelled': 'bg-rose-100 text-rose-800 border-rose-300',

  // Medical
  'New': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Contacted': 'bg-sky-100 text-sky-800 border-sky-300',
  'Accepted': 'bg-blue-100 text-blue-800 border-blue-300',
  'Doctor Assigned': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  'Scheduled': 'bg-purple-100 text-purple-800 border-purple-300',
  'Visit Completed': 'bg-green-100 text-green-800 border-green-300',

  // Surrender
  'Submitted': 'bg-amber-100 text-amber-800 border-amber-300',
  'Under Review': 'bg-blue-100 text-blue-800 border-blue-300',
  'Inspection Required': 'bg-orange-100 text-orange-800 border-orange-300',
  'Approved': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Pickup Scheduled': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  'In Transit': 'bg-teal-100 text-teal-800 border-teal-300',
  'Received': 'bg-green-100 text-green-800 border-green-300',
  'Rejected': 'bg-red-100 text-red-800 border-red-300',

  // Application
  'PENDING': 'bg-amber-100 text-amber-800 border-amber-300',
  'UNDER_REVIEW': 'bg-blue-100 text-blue-800 border-blue-300',
  'APPROVED': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'REJECTED': 'bg-red-100 text-red-800 border-red-300',
  'CHANGES_REQUIRED': 'bg-orange-100 text-orange-800 border-orange-300',
  'SUSPENDED': 'bg-stone-200 text-stone-800 border-stone-400',

  // Cow health
  'HEALTHY': 'bg-green-100 text-green-800 border-green-300',
  'IN_TREATMENT': 'bg-amber-100 text-amber-800 border-amber-300',
  'CRITICAL': 'bg-rose-100 text-rose-800 border-rose-300',
  'QUARANTINE': 'bg-purple-100 text-purple-800 border-purple-300',
  'DECEASED': 'bg-stone-200 text-stone-700 border-stone-400'
};

export default function StatusBadge({ status }) {
  const normalized = status ? status.trim() : 'Unknown';
  const style = statusStyles[normalized] || 'bg-stone-100 text-stone-800 border-stone-300';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75"></span>
      {normalized}
    </span>
  );
}

