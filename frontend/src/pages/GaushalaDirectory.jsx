import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Building2,
  MapPin,
  Phone,
  ShieldCheck,
  Search,
  Filter,
  HeartPulse,
  Stethoscope,
  Home as HomeIcon,
  Users,
  Compass,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function GaushalaDirectory() {
  const [gaushalas, setGaushalas] = useState([]);
  const [stats, setStats] = useState({
    totalListedGaushalas: 0,
    totalActiveBranches: 0,
    totalCapacity: 0,
    totalCowsSheltered: 0,
    totalActiveDoctors: 0
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [stateOptions, setStateOptions] = useState([]);

  // Expanded branches drawer (independent map per gaushala)
  const [expandedIds, setExpandedIds] = useState({});

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedService !== 'ALL') params.service = selectedService;
      if (selectedState !== 'ALL') params.state = selectedState;

      const res = await api.get('/gaushalas/directory', { params });
      if (res.data.success) {
        setGaushalas(res.data.gaushalas || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        if (res.data.filters?.states) {
          setStateOptions(res.data.filters.states);
        }
      }
    } catch (err) {
      console.error('Error fetching Gaushala directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, [selectedService, selectedState]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDirectory();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Top Hero Section */}
      <section className="bg-gradient-to-b from-[#FAF6ED] to-[#F8F7F3] pt-12 pb-16 border-b border-[#E8E1D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#80501D] bg-white border border-[#D6A23A]/40 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#557B42]" />
            National Verified Network
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#593713] tracking-tight">
            Listed Gaushalas on <span className="text-[#80501D]">GauAashray</span>
          </h1>

          <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto">
            Browse verified cow shelters, rescue teams, and veterinary clinics registered across India.
          </p>

          {/* KPI Stat Cards */}
          <div className="pt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs text-center">
              <span className="text-2xl sm:text-3xl font-black text-[#80501D]">
                {stats.totalListedGaushalas}
              </span>
              <p className="text-xs font-bold text-stone-700 mt-1">Listed Gaushalas</p>
              <p className="text-[10px] text-stone-400">Verified Organizations</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs text-center">
              <span className="text-2xl sm:text-3xl font-black text-[#557B42]">
                {stats.totalActiveBranches}
              </span>
              <p className="text-xs font-bold text-stone-700 mt-1">Active Branches</p>
              <p className="text-[10px] text-stone-400">Shelter Care Centers</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs text-center">
              <span className="text-2xl sm:text-3xl font-black text-[#D6A23A]">
                {stats.totalCapacity}
              </span>
              <p className="text-xs font-bold text-stone-700 mt-1">Total Capacity</p>
              <p className="text-[10px] text-stone-400">Cow Shelter Slots</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs text-center">
              <span className="text-2xl sm:text-3xl font-black text-[#593713]">
                {stats.totalActiveDoctors}
              </span>
              <p className="text-xs font-bold text-stone-700 mt-1">Registered Doctors</p>
              <p className="text-[10px] text-stone-400">Veterinary Care</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Directory & Filter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Search & Filter Controls */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Gaushala name, city, state, or PIN code..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#80501D] bg-stone-50/50"
              />
            </div>

            {/* State Filter */}
            <div className="w-full md:w-56">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:border-[#80501D]"
              >
                <option value="ALL">All States</option>
                {stateOptions.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Service Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-stone-400 font-bold uppercase text-[10px] shrink-0 mr-1">
              Services:
            </span>
            <button
              onClick={() => setSelectedService('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                selectedService === 'ALL'
                  ? 'bg-[#80501D] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All Services
            </button>
            <button
              onClick={() => setSelectedService('RESCUE')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition shrink-0 ${
                selectedService === 'RESCUE'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              Emergency Rescue
            </button>
            <button
              onClick={() => setSelectedService('VETERINARY')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition shrink-0 ${
                selectedService === 'VETERINARY'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Veterinary Clinic
            </button>
            <button
              onClick={() => setSelectedService('SURRENDER')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition shrink-0 ${
                selectedService === 'SURRENDER'
                  ? 'bg-[#557B42] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <HomeIcon className="w-3.5 h-3.5" />
              Cow Surrender
            </button>
          </div>
        </div>

        {/* Directory Results Counter */}
        <div className="flex items-center justify-between text-xs text-stone-500 px-2">
          <span>
            Showing <strong className="text-stone-900">{gaushalas.length}</strong> verified Gaushala
            {gaushalas.length === 1 ? '' : 's'}
          </span>
          {(searchTerm || selectedService !== 'ALL' || selectedState !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedService('ALL');
                setSelectedState('ALL');
              }}
              className="text-[#80501D] font-bold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Gaushala Cards Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
            <p className="text-xs text-stone-500 mt-2">Loading Gaushala network...</p>
          </div>
        ) : gaushalas.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl border border-stone-200 text-center space-y-3">
            <Building2 className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-bold text-stone-800 text-base">No Gaushalas Matched</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              No registered Gaushalas found matching your search. Try resetting your search term or filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedService('ALL');
                setSelectedState('ALL');
              }}
              className="px-4 py-2 bg-[#80501D] text-white text-xs font-bold rounded-xl"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {gaushalas.map((g) => {
              const gaushalaId = String(g.id || g._id);
              const isExpanded = Boolean(expandedIds[gaushalaId]);

              return (
                <div
                  key={gaushalaId}
                  className="bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-6 sm:p-7 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-stone-900 text-lg">{g.name}</h3>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#557B42] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                            <ShieldCheck className="w-3 h-3" />
                            VERIFIED
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                          REG: {g.registrationId}
                        </p>
                      </div>
                    </div>

                    {/* Address & Contact */}
                    <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-100 pt-3">
                      <p className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#80501D] shrink-0 mt-0.5" />
                        <span>
                          {g.address}, {g.city}, {g.state} - {g.pincode}
                        </span>
                      </p>
                      {g.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[#D6A23A] shrink-0" />
                          <a
                            href={`tel:${g.phone}`}
                            className="font-semibold text-stone-800 hover:text-[#80501D]"
                          >
                            +91 {g.phone}
                          </a>
                        </p>
                      )}
                    </div>

                    {/* Capacity & Doctor Stats */}
                    <div className="grid grid-cols-3 gap-2 bg-[#FAF6ED] p-3 rounded-2xl border border-[#D6A23A]/20 text-center text-xs">
                      <div>
                        <span className="font-extrabold text-[#80501D] text-sm block">
                          {g.totalCapacity}
                        </span>
                        <span className="text-[10px] text-stone-500">Max Capacity</span>
                      </div>
                      <div>
                        <span className="font-extrabold text-[#557B42] text-sm block">
                          {g.availableSlots}
                        </span>
                        <span className="text-[10px] text-stone-500">Slots Open</span>
                      </div>
                      <div>
                        <span className="font-extrabold text-stone-800 text-sm block">
                          {g.branchCount || 1}
                        </span>
                        <span className="text-[10px] text-stone-500">Branch(es)</span>
                      </div>
                    </div>

                    {/* Available Services */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                        Available Services
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {g.availableServices?.map((srv) => (
                          <span
                            key={srv}
                            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg"
                          >
                            {srv === 'RESCUE'
                              ? '🚨 Emergency Rescue'
                              : srv === 'VETERINARY'
                              ? '🩺 Vet Clinic'
                              : srv === 'SURRENDER'
                              ? '🏡 Cow Surrender'
                              : srv}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Branches Dropdown if multiple */}
                    {g.branches && g.branches.length > 0 && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => toggleExpand(gaushalaId)}
                          className="w-full flex items-center justify-between text-xs font-bold text-[#80501D] hover:text-[#593713] py-2 px-3 rounded-xl bg-amber-50/70 hover:bg-amber-100/60 border border-amber-200/60 transition cursor-pointer"
                        >
                          <span>
                            {g.branches.length} Registered Shelter {g.branches.length === 1 ? 'Branch' : 'Branches'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#80501D]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#80501D]" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-2.5 space-y-2 pl-2.5 border-l-2 border-[#D6A23A] text-xs animate-in fade-in duration-200">
                            {g.branches.map((b, bIdx) => (
                              <div key={b.id || b._id || bIdx} className="bg-stone-50 p-2.5 rounded-xl space-y-1 border border-stone-200/60">
                                <p className="font-bold text-stone-900">{b.name}</p>
                                <p className="text-[11px] text-stone-500">
                                  {b.address}, {b.city} ({b.operatingHours || '24/7'})
                                </p>
                                {b.phone && (
                                  <p className="text-[11px] text-stone-700 font-semibold">
                                    Phone: +91 {b.phone}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                    {g.phone ? (
                      <a
                        href={`tel:${g.phone}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-800 text-xs font-bold text-center transition flex items-center justify-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#80501D]" />
                        Call Shelter
                      </a>
                    ) : (
                      <span className="flex-1 text-center text-xs text-stone-400">Verified Shelter</span>
                    )}

                    <Link
                      to="/report-cow"
                      className="flex-1 py-2 px-3 rounded-xl bg-[#80501D] hover:bg-[#593713] text-white text-xs font-bold text-center transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <HeartPulse className="w-3.5 h-3.5" />
                      Report Cow
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

