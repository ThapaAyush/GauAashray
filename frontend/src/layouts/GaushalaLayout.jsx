import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  LayoutDashboard,
  Inbox,
  HeartPulse,
  Stethoscope,
  Calendar,
  Layers,
  GitBranch,
  Users,
  Truck,
  FileText,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Building,
  Menu,
  X
} from 'lucide-react';

const navItems = [
  { path: '/gaushala/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/gaushala/requests', label: 'Incoming Requests', icon: Inbox },
  { path: '/gaushala/rescue', label: 'Rescue Management', icon: HeartPulse },
  { path: '/gaushala/doctors', label: 'Doctor Management', icon: Stethoscope },
  { path: '/gaushala/appointments', label: 'Appointments', icon: Calendar },
  { path: '/gaushala/cows', label: 'Cow Management', icon: Layers },
  { path: '/gaushala/branches', label: 'Branches', icon: GitBranch },
  { path: '/gaushala/team', label: 'Staff & Team', icon: Users },
  { path: '/gaushala/transport', label: 'Transport', icon: Truck },
  { path: '/gaushala/medical-records', label: 'Medical Records', icon: FileText },
  { path: '/gaushala/reports', label: 'Reports', icon: BarChart3 },
  { path: '/gaushala/settings', label: 'Settings', icon: Settings }
];

export default function GaushalaLayout() {
  const { user, activeBranch, setActiveBranch, branches, switchRole, logout } = useAuth();
  const { unreadCount } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If user is pending or not approved, redirect to application status
  if (user?.gaushala && typeof user.gaushala === 'object' && user.gaushala.status !== 'APPROVED') {
    navigate('/application-status');
    return null;
  }

  const handleSwitchToPublic = async () => {
    try {
      await switchRole('PUBLIC_USER');
      navigate('/home');
    } catch (e) {
      navigate('/home');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E8E1D5] transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-[#FAF6ED] justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
              <div>
                <span className="font-bold text-lg text-[#80501D] leading-none block">GauAashray</span>
                <span className="text-[10px] uppercase font-semibold text-[#D6A23A] tracking-wider">
                  Gaushala Console
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    active
                      ? 'bg-[#80501D] text-white shadow-sm font-semibold'
                      : 'text-stone-600 hover:text-[#80501D] hover:bg-[#FAF6ED]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[#D6A23A]' : 'text-stone-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer User Info */}
          <div className="p-4 border-t border-[#E8E1D5] bg-[#FAF6ED]/60">
            <div className="flex items-center justify-between">
              <div className="truncate mr-2">
                <p className="text-xs font-bold text-stone-800 truncate">{user?.name}</p>
                <p className="text-[10px] text-stone-500 truncate">{user?.phone}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#E8E1D5] flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Active Branch Selector (Multi-Branch Management) */}
            {branches.length > 0 ? (
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#80501D]" />
                <span className="text-xs text-stone-500 hidden sm:inline">Active Branch:</span>
                <select
                  value={activeBranch?._id || ''}
                  onChange={(e) => {
                    const sel = branches.find((b) => b._id === e.target.value);
                    if (sel) setActiveBranch(sel);
                  }}
                  className="text-xs font-semibold text-[#80501D] bg-[#FAF6ED] px-3 py-1.5 rounded-lg border border-[#D6A23A]/40 focus:outline-none"
                >
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="text-xs font-semibold text-[#80501D]">
                {user?.gaushala?.name || 'My Gaushala'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Switcher: Gaushala -> Public User */}
            <button
              onClick={handleSwitchToPublic}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#80501D] bg-[#FAF6ED] border border-[#D6A23A] hover:bg-[#F3ECE0] transition shadow-sm"
              title="User can only be on one side at a time. Click to switch to Public User side."
            >
              <span>Switch to Public User Side &rarr;</span>
            </button>

            <Link
              to="/profile"
              className="text-xs font-medium text-stone-600 hover:text-[#80501D] px-2.5 py-1 rounded-lg hover:bg-stone-100"
            >
              My Profile
            </Link>

            <Link
              to="/notifications"
              className="relative p-2 text-stone-600 hover:text-[#80501D] hover:bg-[#FAF6ED] rounded-xl transition"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Dynamic Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

