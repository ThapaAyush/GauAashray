import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse,
  Stethoscope,
  Home,
  Compass,
  Building2,
  ShieldCheck,
  Heart,
  Mail,
  MapPin,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  Users
} from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[#FAF6ED] border-t-2 border-[#D6A23A]/25 pt-14 pb-8 mt-20 text-stone-700 relative overflow-hidden">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D6A23A]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-[#557B42]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Pre-Footer: 4 Pillars of Gau Seva Highlights Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Feature 1 */}
          <Link
            to="/report-cow"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-4 rounded-2xl bg-white/90 hover:bg-white border border-[#E8E1D5] hover:border-red-300 shadow-xs hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group flex items-start gap-3.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white transition">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-stone-900 group-hover:text-red-700 transition">
                  Street Cow Rescue
                </h4>
                <span className="text-[9px] font-black uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                  SOS
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                24/7 emergency reporting for sick or injured street cattle.
              </p>
            </div>
          </Link>

          {/* Feature 2 */}
          <Link
            to="/request-doctor"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-4 rounded-2xl bg-white/90 hover:bg-white border border-[#E8E1D5] hover:border-blue-300 shadow-xs hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group flex items-start gap-3.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-stone-900 group-hover:text-blue-700 transition">
                  Doorstep Vet Care
                </h4>
                <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  Home Visit
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                Qualified veterinary doctors dispatched for doorstep care.
              </p>
            </div>
          </Link>

          {/* Feature 3 */}
          <Link
            to="/surrender-cow"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-4 rounded-2xl bg-white/90 hover:bg-white border border-[#E8E1D5] hover:border-emerald-300 shadow-xs hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group flex items-start gap-3.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-stone-900 group-hover:text-emerald-800 transition">
                  Permanent Shelter
                </h4>
                <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Intake
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                Dignified lifetime sanctuary with verified gaushala partners.
              </p>
            </div>
          </Link>

          {/* Feature 4 */}
          <Link
            to="/track-request"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-4 rounded-2xl bg-white/90 hover:bg-white border border-[#E8E1D5] hover:border-[#D6A23A] shadow-xs hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group flex items-start gap-3.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#80501D] flex items-center justify-center shrink-0 group-hover:bg-[#80501D] group-hover:text-white transition">
              <Compass className="w-5 h-5 text-[#D6A23A] group-hover:text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#80501D] transition">
                  Live GPS Radar
                </h4>
                <span className="flex items-center gap-1 text-[9px] font-black uppercase text-[#80501D] bg-[#FAF6ED] px-1.5 py-0.5 rounded border border-[#D6A23A]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                Automated 5-nearest shelter broadcast & dispatch tracking.
              </p>
            </div>
          </Link>
        </div>

        {/* Main Footer Links & Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pt-4">
          {/* Brand & Mission Column (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="GauAashray Logo"
                className="h-12 w-auto object-contain group-hover:scale-105 transition"
              />
              <div>
                <h3 className="text-2xl font-black text-[#80501D] leading-none tracking-tight">
                  GauAashray
                </h3>
                <span className="text-xs font-hindi text-[#D6A23A] font-bold tracking-wide">
                  गौआश्रय • सेवा एवं सुरक्षा
                </span>
              </div>
            </Link>

            <p className="text-xs text-stone-600 leading-relaxed max-w-sm">
              India&apos;s unified digital coordination platform connecting compassionate citizens,
              veterinary doctors, and government-registered Gaushalas for the emergency rescue,
              healthcare, and lifetime shelter of street and abandoned cattle.
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center gap-2 text-stone-700">
                <ShieldCheck className="w-4 h-4 text-[#557B42] shrink-0" />
                <span className="font-semibold">Verified Non-Profit Gaushala Network</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700">
                <Compass className="w-4 h-4 text-[#D6A23A] shrink-0" />
                <span className="font-semibold">5-Nearest GPS Geo-Dispatch Engine</span>
              </div>
            </div>
          </div>

          {/* Citizen Services Column (Span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#80501D] pb-1 border-b border-[#E8E1D5]">
              Citizen Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/report-cow"
                  className="flex items-center justify-between text-stone-600 hover:text-red-700 hover:translate-x-0.5 transition py-0.5"
                >
                  <span>Report Street Cow</span>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                    Emergency
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/request-doctor"
                  className="flex items-center justify-between text-stone-600 hover:text-blue-700 hover:translate-x-0.5 transition py-0.5"
                >
                  <span>Request Vet Doctor</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    Home Visit
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/surrender-cow"
                  className="flex items-center justify-between text-stone-600 hover:text-emerald-800 hover:translate-x-0.5 transition py-0.5"
                >
                  <span>Surrender Cow to Shelter</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Intake
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/track-request"
                  className="flex items-center justify-between text-stone-600 hover:text-[#80501D] hover:translate-x-0.5 transition py-0.5"
                >
                  <span>Track Live Incident</span>
                  <span className="text-[10px] font-bold text-[#80501D] bg-[#FAF6ED] border border-[#D6A23A]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    GPS Radar
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/gaushalas"
                  className="text-stone-600 hover:text-[#80501D] hover:translate-x-0.5 transition block py-0.5"
                >
                  Verified Gaushala Directory
                </Link>
              </li>
              <li>
                <Link
                  to="/my-requests"
                  className="text-stone-600 hover:text-[#80501D] hover:translate-x-0.5 transition block py-0.5"
                >
                  My Submitted Requests
                </Link>
              </li>
            </ul>
          </div>

          {/* Shelter Operations Column (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#80501D] pb-1 border-b border-[#E8E1D5]">
              For Shelters
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/signup/gaushala"
                  className="text-stone-600 hover:text-[#80501D] hover:translate-x-0.5 transition block py-0.5 font-semibold"
                >
                  Register New Gaushala
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-stone-600 hover:text-[#80501D] hover:translate-x-0.5 transition block py-0.5"
                >
                  Staff Portal Login
                </Link>
              </li>
              <li>
                <Link
                  to="/application-status"
                  className="text-stone-600 hover:text-[#80501D] hover:translate-x-0.5 transition block py-0.5"
                >
                  Verification Status
                </Link>
              </li>
              <li>
                <Link
                  to="/gaushalas"
                  className="text-stone-600 hover:text-[#80501D] hover:translate-x-0.5 transition block py-0.5"
                >
                  Shelter Network Map
                </Link>
              </li>
              <li>
                <a
                  href="#standards"
                  onClick={(e) => e.preventDefault()}
                  className="text-stone-500 hover:text-stone-800 transition block py-0.5"
                >
                  Intake Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Mission Newsletter & Contact Strip (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-[#D6A23A]/30 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FAF6ED] text-[#80501D] flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[#D6A23A]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 leading-tight">
                    Gau Seva Newsletter
                  </h4>
                  <p className="text-[10px] text-stone-500">
                    Monthly rescue stories & medical updates
                  </p>
                </div>
              </div>

              {subscribed ? (
                <div className="p-2.5 rounded-xl bg-green-50 border border-green-200 text-[11px] font-semibold text-green-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Thank you for joining our mission!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 px-3 rounded-xl bg-[#80501D] hover:bg-[#593713] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Stay Connected</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              <p className="text-[10px] text-stone-400">
                100% spam-free. You can unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar / Copyright & Trust Badges */}
        <div className="border-t border-[#E8E1D5] pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <p>© {new Date().getFullYear()} GauAashray Foundation. All rights reserved.</p>
            <span className="hidden sm:inline text-stone-300">•</span>
            <p className="text-stone-600 font-medium">
              Dedicated to Cattle Welfare, Dharma & Ahimsa 🌿
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <Link to="/gaushalas" className="hover:text-[#80501D] transition">
              Shelter Directory
            </Link>
            <span className="text-stone-300">•</span>
            <Link to="/report-cow" className="hover:text-[#80501D] transition">
              Report Incident
            </Link>
            <span className="text-stone-300">•</span>
            <Link to="/track-request" className="hover:text-[#80501D] transition">
              GPS Tracking
            </Link>
            <span className="text-stone-300">•</span>
            <span className="flex items-center gap-1 font-semibold text-[#557B42]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Shelter Network
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
