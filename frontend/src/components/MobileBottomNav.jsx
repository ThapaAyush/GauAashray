import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Building2, HeartPulse, Compass, User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  const isHomeActive = location.pathname === '/' || location.pathname === '/home';
  const isRescueActive = location.pathname === '/report-cow';
  const isGaushalasActive = location.pathname.startsWith('/gaushala') && location.pathname !== '/gaushala/dashboard';
  const isTrackActive = location.pathname === '/track-request' || location.pathname === '/my-requests';
  const isAccountActive =
    location.pathname === '/profile' ||
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname.startsWith('/gaushala');

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      data-allow-guest="true"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-[#EFE8DD] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]"
    >
      <div className="max-w-md mx-auto px-2 flex items-center justify-around h-16">
        
        {/* Tab 1: Home */}
        <NavLink
          to="/home"
          data-allow-guest="true"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 touch-manipulation ${
            isHomeActive ? 'text-[#80501D]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5 stroke-[2.2]" />
            {isHomeActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#80501D] rounded-full" />
            )}
          </div>
          <span className={`text-[10px] mt-1 tracking-tight ${isHomeActive ? 'font-extrabold' : 'font-medium'}`}>
            Home
          </span>
        </NavLink>

        {/* Tab 2: Shelters / Gaushalas */}
        <NavLink
          to="/gaushalas"
          data-allow-guest="true"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 touch-manipulation ${
            isGaushalasActive ? 'text-[#80501D]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <Building2 className="w-5 h-5 stroke-[2.2]" />
            {isGaushalasActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#80501D] rounded-full" />
            )}
          </div>
          <span className={`text-[10px] mt-1 tracking-tight ${isGaushalasActive ? 'font-extrabold' : 'font-medium'}`}>
            Shelters
          </span>
        </NavLink>

        {/* Tab 3: Center Elevated Emergency Rescue SOS Button */}
        <div className="relative flex-1 flex flex-col items-center justify-center -top-3">
          <NavLink
            to="/report-cow"
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-lg shadow-red-600/35 border-4 border-white transition-transform duration-150 active:scale-90 touch-manipulation"
            aria-label="Emergency Cow Rescue SOS"
          >
            {/* Pulsing ring indicator */}
            <span className="absolute inset-0 rounded-full bg-red-400 opacity-40 animate-ping group-active:animate-none pointer-events-none" />
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </NavLink>
          <span className={`text-[10px] mt-0.5 tracking-tight font-black uppercase text-red-700 ${isRescueActive ? 'underline' : ''}`}>
            Rescue
          </span>
        </div>

        {/* Tab 4: Track / Radar */}
        <NavLink
          to="/track-request"
          data-allow-guest="true"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 touch-manipulation ${
            isTrackActive ? 'text-[#80501D]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <Compass className="w-5 h-5 stroke-[2.2]" />
            <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            {isTrackActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#80501D] rounded-full" />
            )}
          </div>
          <span className={`text-[10px] mt-1 tracking-tight ${isTrackActive ? 'font-extrabold' : 'font-medium'}`}>
            Track Live
          </span>
        </NavLink>

        {/* Tab 5: Account / Profile */}
        <NavLink
          to={user ? '/profile' : '/login'}
          data-allow-guest="true"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 touch-manipulation ${
            isAccountActive ? 'text-[#80501D]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            {user ? (
              <User className="w-5 h-5 stroke-[2.2]" />
            ) : (
              <LogIn className="w-5 h-5 stroke-[2.2]" />
            )}
            {isAccountActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#80501D] rounded-full" />
            )}
          </div>
          <span className={`text-[10px] mt-1 tracking-tight ${isAccountActive ? 'font-extrabold' : 'font-medium'}`}>
            {user ? 'Account' : 'Sign In'}
          </span>
        </NavLink>

      </div>
    </nav>
  );
}
