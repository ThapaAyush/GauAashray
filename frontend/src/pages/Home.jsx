import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    HeartPulse,
    Stethoscope,
    Home as HomeIcon,
    MapPin,
    Clock,
    ShieldCheck,
    Phone,
    ArrowRight,
    CheckCircle,
    Truck,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import api from '../services/api';

const HERO_IMAGES = [
    {
        url: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1200&q=80',
        alt: 'Desi Indian Cow and Calf',
        tag: 'गौमाता रक्षा',
        title: 'Safe Shelters & Compassionate Veterinary Care'
    },
    {
        url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1200&q=80',
        alt: 'Mother Cow and Calf Grazing',
        tag: 'गौ सेवा परमो धर्म:',
        title: 'Protecting Indigenous & Rescued Cows Nationwide'
    },
    {
        url: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=1200&q=80',
        alt: 'Peaceful Herd in Meadow',
        tag: 'अहिंसा एवं करुणा',
        title: '24/7 Rapid Emergency Ambulance & On-Site Rescue'
    },
    {
        url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80',
        alt: 'Healthy Cattle in Open Pasture',
        tag: 'गौ संवर्धन',
        title: 'Loving Care and Natural Green Pastures'
    }
];

export default function Home() {
    const [nearbyGaushalas, setNearbyGaushalas] = useState([]);
    const [stats, setStats] = useState({
        rescued: 0,
        sheltered: 0,
        doctors: 0,
        gaushalas: 0
    });
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Auto-advance hero image every 30 seconds
    useEffect(() => {
        if (isHovered) return;
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 30000);
        return () => clearInterval(interval);
    }, [isHovered]);

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
    };

    useEffect(() => {
        // Load nearby gaushalas
        api.get('/gaushalas/nearby?radius=60')
            .then((res) => {
                if (res.data.success && res.data.gaushalas) {
                    setNearbyGaushalas(res.data.gaushalas.slice(0, 3));
                }
            })
            .catch(() => { });

        // Load live network stats
        api.get('/gaushalas/directory')
            .then((res) => {
                if (res.data.success && res.data.stats) {
                    setStats({
                        rescued: res.data.stats.totalRescues || 0,
                        sheltered: res.data.stats.totalCowsSheltered || 0,
                        doctors: res.data.stats.totalActiveDoctors || 0,
                        gaushalas: res.data.stats.totalListedGaushalas || 0
                    });
                }
            })
            .catch(() => { });
    }, []);

    return (
        <div className="space-y-16 pb-12">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF6ED] to-[#F8F7F3] pt-12 pb-20 border-b border-[#E8E1D5]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Left Hero Content */}
                        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#80501D] bg-white border border-[#D6A23A]/40 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                National Cow Protection & Rescue Network
                            </span>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#593713] tracking-tight leading-tight">
                                Every Cow <br className="hidden sm:block" />
                                <span className="text-[#80501D]">Deserves Care.</span>
                            </h1>

                            <p className="text-lg sm:text-xl text-stone-600 font-medium">
                                Find help. Save lives.
                            </p>

                            {/* Quick Action Badges */}
                            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                <Link
                                    to="/report-cow"
                                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition transform hover:-translate-y-0.5"
                                >
                                    <HeartPulse className="w-5 h-5" />
                                    Report Street Cow
                                </Link>

                                <Link
                                    to="/request-doctor"
                                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#80501D] hover:bg-[#593713] text-white font-bold text-sm shadow-md transition transform hover:-translate-y-0.5"
                                >
                                    <Stethoscope className="w-5 h-5 text-[#D6A23A]" />
                                    Request Doctor
                                </Link>
                            </div>

                            {/* Verified Trust Tag */}
                            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-stone-500">
                                <div className="flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-[#557B42]" />
                                    Verified Gaushalas
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Truck className="w-4 h-4 text-[#80501D]" />
                                    Equipped Ambulances
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Phone className="w-4 h-4 text-[#D6A23A]" />
                                    24/7 Response
                                </div>
                            </div>
                        </div>

                        {/* Right Hero Image Slider Card */}
                        <div className="lg:col-span-5 relative group">
                            <div
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-900 h-80 sm:h-96"
                            >
                                {HERO_IMAGES.map((img, idx) => (
                                    <div
                                        key={img.url}
                                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                            idx === currentImageIndex
                                                ? 'opacity-100 z-10'
                                                : 'opacity-0 z-0 pointer-events-none'
                                        }`}
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.alt}
                                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6">
                                            <p className="text-xs uppercase tracking-wider font-bold text-[#D6A23A]">
                                                {img.tag}
                                            </p>
                                            <h3 className="text-lg font-bold text-white mt-0.5 leading-snug">
                                                {img.title}
                                            </h3>
                                        </div>
                                    </div>
                                ))}

                                {/* 30-Second Subtle Progress Line */}
                                <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-white/20">
                                    <div
                                        key={currentImageIndex}
                                        className={`h-full bg-[#D6A23A] ${
                                            isHovered ? 'w-full opacity-60' : 'animate-progress-30s'
                                        }`}
                                    />
                                </div>

                                {/* Prev / Next Floating Navigation Controls */}
                                <button
                                    type="button"
                                    data-allow-guest="true"
                                    onClick={handlePrevImage}
                                    aria-label="Previous Image"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-xs cursor-pointer shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    data-allow-guest="true"
                                    onClick={handleNextImage}
                                    aria-label="Next Image"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-xs cursor-pointer shadow-sm"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>

                                {/* Dot Indicators for Images */}
                                <div className="absolute bottom-3 right-6 z-20 flex items-center gap-1.5" data-allow-guest="true">
                                    {HERO_IMAGES.map((_, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            data-allow-guest="true"
                                            onClick={() => setCurrentImageIndex(idx)}
                                            aria-label={`Go to slide ${idx + 1}`}
                                            className={`transition-all duration-300 rounded-full cursor-pointer ${
                                                idx === currentImageIndex
                                                    ? 'w-5 h-2 bg-[#D6A23A]'
                                                    : 'w-2 h-2 bg-white/60 hover:bg-white'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3 Large Primary Service Cards (Section 7) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: Report Street Cow */}
                    <div className="bg-white rounded-3xl p-8 border border-red-100 shadow-xl shadow-red-900/5 hover:border-red-300 transition duration-300 flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 group-hover:scale-110 transition">
                                <HeartPulse className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-stone-900">REPORT A STREET COW</h3>
                                <p className="text-xs text-stone-500 mt-1">
                                    Injured, sick, abandoned or accident cases on streets.
                                </p>
                            </div>
                        </div>
                        <div className="pt-6">
                            <Link
                                to="/report-cow"
                                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition"
                            >
                                Report Cow
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Card 2: Request A Doctor */}
                    <div className="bg-white rounded-3xl p-8 border border-blue-100 shadow-xl shadow-blue-900/5 hover:border-blue-300 transition duration-300 flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-110 transition">
                                <Stethoscope className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-stone-900">REQUEST A DOCTOR</h3>
                                <p className="text-xs text-stone-500 mt-1">
                                    Veterinary doctors for home visits and treatments.
                                </p>
                            </div>
                        </div>
                        <div className="pt-6">
                            <Link
                                to="/request-doctor"
                                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#80501D] hover:bg-[#593713] text-white font-bold text-sm transition"
                            >
                                Request Doctor
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Card 3: Surrender A Cow */}
                    <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl shadow-emerald-900/5 hover:border-emerald-300 transition duration-300 flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#557B42] group-hover:scale-110 transition">
                                <HomeIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-stone-900">SURRENDER A COW</h3>
                                <p className="text-xs text-stone-500 mt-1">
                                    Transfer cows to verified shelters with permanent shelter.
                                </p>
                            </div>
                        </div>
                        <div className="pt-6">
                            <Link
                                to="/surrender-cow"
                                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#557B42] hover:bg-[#436333] text-white font-bold text-sm transition"
                            >
                                Give a Cow
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Nearby Gaushalas Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-[#593713]">Nearby Verified Gaushalas</h2>
                        <p className="text-xs text-stone-500">Equipped with shelter and veterinary teams</p>
                    </div>
                    <Link
                        to="/gaushalas"
                        className="text-xs font-bold text-[#80501D] hover:underline flex items-center gap-1 bg-[#FAF6ED] px-3 py-1.5 rounded-xl border border-[#D6A23A]/30"
                    >
                        View All ({stats.gaushalas} Listed)
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {nearbyGaushalas.length > 0 ? (
                        nearbyGaushalas.map((g) => (
                            <div
                                key={g.id}
                                className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition space-y-3"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-stone-900 text-sm">{g.name}</h3>
                                        <p className="text-xs text-stone-500">{g.gaushalaName}</p>
                                    </div>
                                    {g.distanceKm && (
                                        <span className="text-xs font-semibold text-[#80501D] bg-[#FAF6ED] px-2 py-0.5 rounded-full">
                                            {g.distanceKm} km
                                        </span>
                                    )}
                                </div>

                                <div className="text-xs text-stone-600 space-y-1">
                                    <p className="flex items-center gap-1.5 truncate">
                                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                        {g.address}, {g.city}
                                    </p>
                                    <p className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                        {g.operatingHours}
                                    </p>
                                </div>

                                <div className="pt-2 flex flex-wrap gap-1">
                                    {g.services?.map((s) => (
                                        <span
                                            key={s}
                                            className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-8 bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
                            Loading nearby verified Gaushala network...
                        </div>
                    )}
                </div>
            </section>

            {/* How GauAashray Works (Minimal Text) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <div className="bg-[#FAF6ED] rounded-3xl p-8 border border-[#E8E1D5]">
                    <h2 className="text-xl font-bold text-[#593713] text-center mb-8">
                        How GauAashray Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="space-y-2">
                            <div className="w-10 h-10 rounded-full bg-[#80501D] text-white font-bold flex items-center justify-center mx-auto text-sm">
                                1
                            </div>
                            <h3 className="font-bold text-stone-800 text-sm">Report Location & Condition</h3>
                            <p className="text-xs text-stone-600">
                                Tap current location, attach photo and choose condition.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="w-10 h-10 rounded-full bg-[#D6A23A] text-white font-bold flex items-center justify-center mx-auto text-sm">
                                2
                            </div>
                            <h3 className="font-bold text-stone-800 text-sm">Geospatial Distribution</h3>
                            <p className="text-xs text-stone-600">
                                Nearest verified Gaushala receives the incident with distance ranking.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="w-10 h-10 rounded-full bg-[#557B42] text-white font-bold flex items-center justify-center mx-auto text-sm">
                                3
                            </div>
                            <h3 className="font-bold text-stone-800 text-sm">Rescue & Safe Shelter</h3>
                            <p className="text-xs text-stone-600">
                                Ambulance dispatched, cow rescued, medical care provided.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section - 100% Real Database Counts */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center shadow-xs">
                        <p className="text-3xl font-extrabold text-[#80501D]">{stats.rescued}</p>
                        <p className="text-xs text-stone-500 font-medium mt-1">Rescues Recorded</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center shadow-xs">
                        <p className="text-3xl font-extrabold text-[#557B42]">{stats.sheltered}</p>
                        <p className="text-xs text-stone-500 font-medium mt-1">Cows in Daily Shelter</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center shadow-xs">
                        <p className="text-3xl font-extrabold text-[#D6A23A]">{stats.doctors}</p>
                        <p className="text-xs text-stone-500 font-medium mt-1">Registered Doctors</p>
                    </div>
                    <Link
                        to="/gaushalas"
                        className="bg-white p-6 rounded-2xl border border-stone-200 text-center shadow-xs hover:border-[#80501D] transition block group"
                    >
                        <p className="text-3xl font-extrabold text-[#593713] group-hover:scale-105 transition">
                            {stats.gaushalas}
                        </p>
                        <p className="text-xs text-[#80501D] font-bold mt-1 flex items-center justify-center gap-1">
                            Listed Gaushalas →
                        </p>
                    </Link>
                </div>
            </section>
        </div>
    );
}