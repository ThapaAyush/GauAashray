import React from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotification();

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#593713]">Notifications & Alerts</h1>
          <p className="text-xs text-stone-500">Live operational and dispatch updates</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-[#80501D] hover:bg-[#FAF6ED] transition"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-stone-400 space-y-2">
            <Bell className="w-10 h-10 mx-auto text-stone-300" />
            <p className="text-sm font-medium">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {notifications.map((n) => (
              <div
                key={n._id || n.id}
                onClick={() => !n.isRead && n._id && markAsRead(n._id)}
                className={`p-4 sm:p-5 transition flex items-start justify-between gap-4 cursor-pointer ${
                  !n.isRead ? 'bg-[#FAF6ED]/50 hover:bg-[#FAF6ED]' : 'hover:bg-stone-50/70'
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">{n.title}</span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#80501D]" />
                    )}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>

                {n.link && (
                  <Link
                    to={n.link}
                    className="p-2 text-stone-400 hover:text-[#80501D] rounded-lg hover:bg-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

