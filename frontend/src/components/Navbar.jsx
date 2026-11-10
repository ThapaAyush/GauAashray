import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Bell,
  User,
  LogOut,
  Menu,
  X,
  HeartPulse,
  Stethoscope,
  Home,
  Shield,
  LayoutDashboard,
  Compass,
  Building2,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Navbar() {
  const { user, activeRole, switchRole, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const servicesRef = useRef(null);
  const userDropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  const isServicesActive = ['/report-cow', '/request-doctor', '/surrender-cow'].includes(location.pathname);

  const currentRole = activeRole || user?.activeRole || user?.role || 'PUBLIC_USER';
  const hasGaushalaAccess = user && (user.role === 'GAUSHALA_OWNER' || user.gaushala || user.role === 'SUPER_ADMIN');

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setServicesDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setServicesDropdownOpen(false);
  }, [location.pathname]);

  const handleToggleMode = async () => {
    if (switching) return;
    setSwitching(true);
    try {
      if (currentRole === 'GAUSHALA_OWNER') {
        await switchRole('PUBLIC_USER');
        navigate('/home');
      } else {
        await switchRole('GAUSHALA_OWNER');
        navigate('/gaushala/dashboard');
      }
    } catch (e) {
      navigate('/profile');
    } finally {
      setSwitching(false);
      setUserDropdownOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EFE8DD] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          
          {/* ================= LEFT: BRAND LOGO ================= */}
          <Link
            to="/"
            id="navbar-brand-logo"
            data-allow-guest="true"
            className="flex items-center gap-3 shrink-0 group py-1"
          >
            <img
              src="/logo.png"
              alt="GauAashray Logo"
              className="h-11 sm:h-12 w-auto object-contain group-hover:scale-105 transition transform duration-200 shrink-0"
            />
            <div className="flex flex-col leading-none">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#80501D] group-hover:text-[#593713] transition">
                GauAashray
              </span>
              <span className="text-[11px] font-hindi text-[#D6A23A] font-bold tracking-wider mt-0.5">
                गौआश्रय
              </span>
            </div>
          </Link>

          {/* ================= CENTER: PRIMARY NAVIGATION ================= */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-semibold">
            {/* Home */}
            <Link
              to="/home"
              className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
                isActive('/home') || isActive('/')
                  ? 'text-[#80501D] bg-[#FAF6ED] font-bold'
                  : 'text-stone-700 hover:text-[#80501D] hover:bg-[#FAF6ED]/60'
              }`}
            >
              Home
            </Link>

            {/* Listed Gaushalas Directory */}
            <Link
              to="/gaushalas"
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                isActive('/gaushalas')
                  ? 'text-[#80501D] bg-[#FAF6ED] font-bold'
                  : 'text-stone-700 hover:text-[#80501D] hover:bg-[#FAF6ED]/60'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#80501D]" />
              <span>Listed Gaushalas</span>
            </Link>

            {/* Emergency & Care Services Dropdown */}
            <div className="relative" ref={servicesRef}>
              <button
                type="button"
                data-allow-guest="true"
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  isServicesActive || servicesDropdownOpen
                    ? 'text-[#80501D] bg-[#FAF6ED] font-bold'
                    : 'text-stone-700 hover:text-[#80501D] hover:bg-[#FAF6ED]/60'
                }`}
              >
                <span>Services</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#80501D] transition-transform duration-200 ${
                    servicesDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E8E1D5] p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#8F7E6F] border-b border-[#FAF6ED]">
                    Emergency & Community Services
                  </div>

                  <Link
                    to="/report-cow"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-red-50/70 transition group"
                  >
                    <div className="p-2 rounded-lg bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition shrink-0">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 group-hover:text-red-700">
                        Report Street Cow
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Emergency rescue & injury care dispatch
                      </p>
                    </div>
                  </Link>

                  <Link
                    to="/request-doctor"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 transition group"
                  >
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition shrink-0">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 group-hover:text-blue-700">
                        Request Vet Doctor
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Doorstep veterinary doctor home visits
                      </p>
                    </div>
                  </Link>

                  <Link
                    to="/surrender-cow"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-emerald-50/70 transition group"
                  >
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition shrink-0">
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-700">
                        Surrender Cow
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Permanent shelter & elderly cow care
                      </p>
                    </div>
                  </Link>

                  <div className="my-1 border-t border-[#FAF6ED]" />

                  <Link
                    to="/track-request"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition group"
                  >
                    <div className="p-2 rounded-lg bg-[#FAF6ED] text-[#80501D] border border-[#D6A23A]/30 group-hover:bg-[#80501D] group-hover:text-white transition shrink-0">
                      <Compass className="w-4 h-4 text-[#D6A23A] group-hover:text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 group-hover:text-[#80501D] flex items-center gap-1.5">
                        Track Live Request
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Real-time GPS dispatch & shelter progress
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Track Status */}
            <Link
              to="/track-request"
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                isActive('/track-request')
                  ? 'text-[#80501D] bg-[#FAF6ED] font-bold'
                  : 'text-stone-700 hover:text-[#80501D] hover:bg-[#FAF6ED]/60'
              }`}
            >
              <Compass className="w-4 h-4 text-[#D6A23A]" />
              <span>Track</span>
            </Link>

            {/* My Requests (Citizen) */}
            {user && (
              <Link
                to="/my-requests"
                className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
                  isActive('/my-requests')
                    ? 'text-[#80501D] bg-[#FAF6ED] font-bold'
                    : 'text-stone-700 hover:text-[#80501D] hover:bg-[#FAF6ED]/60'
                }`}
              >
                My Requests
              </Link>
            )}
          </div>

          {/* ================= RIGHT: ROLE SWITCHER, ADMIN BADGE, PROFILE ================= */}
          <div className="hidden md:flex items-center gap-2 sm:gap-2.5 shrink-0">
            {user ? (
              <>
                {/* DUAL-MODE TOGGLE PILL */}
                {hasGaushalaAccess && (
                  <button
                    type="button"
                    onClick={handleToggleMode}
                    disabled={switching}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs border whitespace-nowrap ${
                      currentRole === 'GAUSHALA_OWNER'
                        ? 'bg-[#80501D] text-white border-[#684117] hover:bg-[#684117]'
                        : 'bg-[#FAF6ED] text-[#80501D] border-[#D6A23A]/70 hover:bg-[#F3ECE0]'
                    }`}
                    title={
                      currentRole === 'GAUSHALA_OWNER'
                        ? 'Active: Gaushala Owner. Click to switch to Public User side.'
                        : 'Active: Citizen User. Click to switch to Gaushala Owner side.'
                    }
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        currentRole === 'GAUSHALA_OWNER' ? 'bg-[#D6A23A]' : 'bg-[#419634]'
                      }`}
                    ></span>
                    <span>{currentRole === 'GAUSHALA_OWNER' ? 'Gaushala Mode' : 'Citizen Mode'}</span>
                    <span
                      className={`text-[10px] font-normal px-1 py-0.2 rounded transition ${
                        currentRole === 'GAUSHALA_OWNER'
                          ? 'bg-white/20 text-white'
                          : 'bg-[#80501D]/10 text-[#80501D]'
                      }`}
                    >
                      {switching ? '...' : '⇄ Switch'}
                    </span>
                  </button>
                )}

                {/* SUPER ADMIN SHORTCUT */}
                {user.role === 'SUPER_ADMIN' && (
                  <a
                    href={import.meta.env.VITE_ADMIN_URL || 'https://gau-aashray-admin.vercel.app'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-stone-900 text-white rounded-full hover:bg-stone-800 transition shadow-xs whitespace-nowrap"
                    title="Open Super Admin Portal"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#D6A23A]" />
                    <span>Admin</span>
                  </a>
                )}

                {/* GAUSHALA DASHBOARD CONSOLE (If on Gaushala side) */}
                {currentRole === 'GAUSHALA_OWNER' && (
                  <Link
                    to="/gaushala/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#FAF6ED] text-[#80501D] border border-[#D6A23A] rounded-full hover:bg-[#F3ECE0] transition whitespace-nowrap"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#80501D]" />
                    <span>Dashboard</span>
                  </Link>
                )}

                {/* NOTIFICATIONS BELL */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-xl text-stone-600 hover:text-[#80501D] hover:bg-[#FAF6ED] transition shrink-0"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* USER AVATAR & DROPDOWN */}
                <div className="relative shrink-0" ref={userDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-[#80501D]/20 transition"
                    aria-label="User Account Menu"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#FAF6ED] border-2 border-[#D6A23A] flex items-center justify-center text-[#80501D] font-bold text-sm overflow-hidden shadow-xs shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        (user.name || 'A').charAt(0).toUpperCase()
                      )}
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E8E1D5] py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-2.5 border-b border-[#FAF6ED]">
                        <p className="font-bold text-sm text-stone-900 truncate">{user.name}</p>
                        <p className="text-xs text-stone-500 truncate font-mono">{user.phone}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#80501D] bg-[#FAF6ED] px-2.5 py-0.5 rounded-full border border-[#D6A23A]/30">
                            Active: {currentRole === 'GAUSHALA_OWNER' ? 'Gaushala Owner' : 'Public User'}
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Switch Role Item */}
                      {hasGaushalaAccess && (
                        <button
                          type="button"
                          onClick={handleToggleMode}
                          className="w-full text-left flex items-center justify-between px-4 py-2.5 text-xs font-bold text-[#80501D] bg-[#FAF8F5] hover:bg-[#FAF6ED] border-b border-[#FAF6ED] transition"
                        >
                          <span className="flex items-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5" />
                            Switch to {currentRole === 'GAUSHALA_OWNER' ? 'Citizen' : 'Gaushala'} Side
                          </span>
                          <span className="text-xs">&rarr;</span>
                        </button>
                      )}

                      {/* Profile Link (Displays Both Profiles) */}
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-[#FAF6ED] transition"
                      >
                        <User className="w-4 h-4 text-[#80501D]" />
                        <span>My Profile (Both Profiles)</span>
                      </Link>

                      {currentRole === 'GAUSHALA_OWNER' && (
                        <Link
                          to="/gaushala/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-[#FAF6ED] transition"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#80501D]" />
                          <span>Gaushala Management</span>
                        </Link>
                      )}

                      {user.role === 'SUPER_ADMIN' && (
                        <a
                          href={import.meta.env.VITE_ADMIN_URL || 'https://gau-aashray-admin.vercel.app'}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-[#FAF6ED] transition"
                        >
                          <span className="flex items-center gap-2.5">
                            <Shield className="w-4 h-4 text-[#80501D]" />
                            <span>Super Admin Panel</span>
                          </span>
                          <ExternalLink className="w-3 h-3 text-stone-400" />
                        </a>
                      )}

                      <div className="pt-1 mt-1 border-t border-[#FAF6ED]">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                            navigate('/login');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Public Logged Out Buttons */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-[#80501D] hover:bg-[#FAF6ED] rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#80501D] hover:bg-[#593713] rounded-xl shadow-xs transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* ================= MOBILE HAMBURGER BUTTON ================= */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            {user && (
              <button
                type="button"
                onClick={handleToggleMode}
                className="text-[11px] font-bold px-2 py-1 rounded-full bg-[#FAF6ED] text-[#80501D] border border-[#D6A23A]"
              >
                {currentRole === 'GAUSHALA_OWNER' ? '🏢 Gaushala' : '👤 Citizen'}
              </button>
            )}

            <button
              type="button"
              data-allow-guest="true"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-700 hover:bg-[#FAF6ED] transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* ================= MOBILE DRAWER ================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#EFE8DD] bg-white px-4 pt-3 pb-6 space-y-1.5 animate-fadeIn">
          {/* Active Side Notice on Mobile */}
          {user && hasGaushalaAccess && (
            <div className="p-3 mb-2 rounded-xl bg-[#FAF6ED] border border-[#D6A23A]/40 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-[#8F7E6F] uppercase">Current Active Side:</p>
                <p className="text-xs font-extrabold text-[#80501D]">
                  {currentRole === 'GAUSHALA_OWNER' ? 'Gaushala Owner Side' : 'Public User Side'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleMode}
                disabled={switching}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#80501D] text-white hover:bg-[#684117] transition"
              >
                Switch &rarr;
              </button>
            </div>
          )}

          <Link
            to="/home"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-stone-800 hover:bg-[#FAF6ED]"
          >
            Home
          </Link>

          <Link
            to="/gaushalas"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#80501D] bg-[#FAF6ED]"
          >
            <Building2 className="w-4 h-4 text-[#80501D]" />
            <span>Listed Gaushalas</span>
          </Link>

          <div className="pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-stone-400 px-3.5">
            Emergency & Care Services
          </div>

          <Link
            to="/report-cow"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-700 bg-red-50/70"
          >
            <HeartPulse className="w-4 h-4 text-red-600" />
            <span>Report Street Cow</span>
          </Link>

          <Link
            to="/request-doctor"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50/70"
          >
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span>Request Vet Doctor</span>
          </Link>

          <Link
            to="/surrender-cow"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-emerald-800 bg-emerald-50/70"
          >
            <Home className="w-4 h-4 text-emerald-600" />
            <span>Surrender Cow</span>
          </Link>

          <Link
            to="/track-request"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#80501D] bg-[#FAF6ED] border border-[#D6A23A]/30"
          >
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-[#D6A23A]" />
              <span>Track Live Request</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </Link>

          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#80501D] bg-[#FAF8F5]"
              >
                <User className="w-4 h-4 text-[#80501D]" />
                <span>My Profile (Both Profiles)</span>
              </Link>

              <Link
                to="/my-requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-stone-800 hover:bg-[#FAF6ED]"
              >
                My Requests
              </Link>

              {currentRole === 'GAUSHALA_OWNER' && (
                <Link
                  to="/gaushala/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#80501D] text-center"
                >
                  Gaushala Dashboard Console
                </Link>
              )}

              {user.role === 'SUPER_ADMIN' && (
                <a
                  href={import.meta.env.VITE_ADMIN_URL || 'https://gau-aashray-admin.vercel.app'}
                  target="_blank"
                  rel="noreferrer"
                  className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-white bg-stone-900 text-center"
                >
                  Open Super Admin Portal &rarr;
                </a>
              )}

              <div className="pt-2 border-t border-[#FAF6ED]">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  Sign Out ({user.name})
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl border border-[#80501D] text-[#80501D] font-bold text-xs"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl bg-[#80501D] text-white font-bold text-xs"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
