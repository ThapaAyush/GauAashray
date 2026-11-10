import React from 'react';
import { Settings, Server, Database, Cloud, Bell, ShieldCheck } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-stone-900">System Infrastructure Settings</h1>
        <p className="text-xs text-stone-500">
          Super Admin platform health, services integration, and security environment parameters
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b pb-2">
          Service Connections & Environmental Checks
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#80501D]" />
                MongoDB Atlas & Geospatial
              </span>
              <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                CONNECTED
              </span>
            </div>
            <p className="text-stone-500">
              MongoDB 2dsphere indexes active on Gaushala, Branch, and Rescue collections.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800 flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-blue-600" />
                Media & Image Storage
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                ACTIVE / LOCAL FALLBACK
              </span>
            </div>
            <p className="text-stone-500">
              Cloudinary configured with seamless local upload fallback at <code>/uploads</code>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-purple-600" />
                Real-Time Socket.IO
              </span>
              <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                ONLINE
              </span>
            </div>
            <p className="text-stone-500">
              Bi-directional WebSocket active for live alerts to users, Gaushalas, and Super Admin.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-600" />
                SMS & WhatsApp Gateway
              </span>
              <span className="text-[10px] font-bold text-stone-600 bg-stone-200 px-2 py-0.5 rounded-full">
                IN-APP NOTIFICATIONS
              </span>
            </div>
            <p className="text-stone-500">
              In-app notification infrastructure active. External gateway simulator enabled.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF6ED] border border-[#D6A23A]/30 text-xs space-y-1">
          <p className="font-bold text-[#80501D]">Security & Isolation Guardrails:</p>
          <p className="text-stone-600">
            Multi-tenant organization boundary isolation is enforced strictly at the database query level.
            Staff and branch owners cannot view or manipulate records belonging to unauthorized Gaushalas.
          </p>
        </div>
      </div>
    </div>
  );
}

