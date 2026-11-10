import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Shield,
  FileCheck,
  Building2,
  ListOrdered,
  Map,
  AlertTriangle,
  BarChart,
  Settings,
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const adminNavItems = [
  { path: '/admin/dashboard', label: 'Overview', icon: Shield },
  { path: '/admin/applications', label: 'Gaushala Applications', icon: FileCheck },
  { path: '/admin/gaushalas', label: 'Registered Gaushalas', icon: Building2 },
  { path: '/admin/requests', label: 'Request Monitoring', icon: ListOrdered },
  { path: '/admin/map', label: 'Network Map', icon: Map },
  { path: '/admin/complaints', label: 'Complaints', icon: AlertTriangle },
  { path: '/admin/analytics', label: 'Platform Analytics', icon: BarChart },
  { path: '/admin/settings', label: 'Settings', icon: Settings }
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex text-stone-800">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-stone-900 text-stone-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo & Super Admin Header */}
          <div className="h-20 flex items-center px-6 border-b border-stone-800 justify-between bg-stone-950">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain brightness-110" />
              <div>
                <span className="font-bold text-lg text-white leading-none block">GauAashray</span>
                <span className="text-[10px] uppercase font-semibold text-[#D6A23A] tracking-wider">
                  Super Admin
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    active
                      ? 'bg-[#80501D] text-white font-semibold'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[#D6A23A]' : 'text-stone-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Admin User Footer */}
          <div className="p-4 border-t border-stone-800 bg-stone-950">
            <div className="flex items-center justify-between">
              <div className="truncate mr-2">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-stone-400">Super Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-[#80501D] bg-[#FAF6ED] px-2.5 py-1 rounded-md">
              Central Network Control
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/notifications"
              className="relative p-2 text-stone-600 hover:text-[#80501D] rounded-xl transition"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link
              to="/home"
              className="text-xs font-medium text-stone-500 hover:text-stone-900 hidden sm:block px-2.5 py-1 rounded-lg hover:bg-stone-100"
            >
              Public Site
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

