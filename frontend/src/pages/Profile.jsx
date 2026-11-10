import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User,
  Phone,
  Mail,
  Building,
  LogOut,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  MapPin,
  Check,
  X,
  PlusCircle,
  Building2
} from 'lucide-react';

export default function Profile() {
  const { user, activeRole, switchRole, logout, updateProfile, deleteAvatar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // Profile fields state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');

  // Gaushala profile state
  const [gaushalaData, setGaushalaData] = useState(null);
  const [loadingGaushala, setLoadingGaushala] = useState(false);

  // Gaushala registration modal for existing user
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '',
    registrationId: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    totalCapacity: 50
  });
  const [registeringGaushala, setRegisteringGaushala] = useState(false);

  // Status & loading states
  const [saving, setSaving] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentRole = activeRole || user?.activeRole || user?.role || 'PUBLIC_USER';
  const hasGaushala = Boolean(user?.gaushala || user?.role === 'GAUSHALA_OWNER' || gaushalaData);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  // Load gaushala profile data if available
  const fetchGaushalaInfo = async () => {
    setLoadingGaushala(true);
    try {
      const res = await api.get('/gaushalas/my-profile');
      if (res.data.success && res.data.gaushala) {
        setGaushalaData(res.data.gaushala);
      }
    } catch (e) {
      // Not registered yet or error
    } finally {
      setLoadingGaushala(false);
    }
  };

  useEffect(() => {
    fetchGaushalaInfo();
  }, [user]);

  // Handle avatar upload
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size cannot exceed 5MB.');
      return;
    }

    setUploadingAvatar(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data.success && uploadRes.data.url) {
        const newAvatarUrl = uploadRes.data.url;
        setAvatar(newAvatarUrl);
        await updateProfile({ avatar: newAvatarUrl });
        setSuccessMsg('Profile picture updated and saved to MongoDB successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload profile picture.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle avatar deletion
  const handleDeleteAvatar = async () => {
    if (!avatar && !user?.avatar) return;
    setDeletingAvatar(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await deleteAvatar();
      setAvatar('');
      setSuccessMsg('Profile picture deleted. Restored initial letter circle.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete profile picture.');
    } finally {
      setDeletingAvatar(false);
    }
  };

  // Handle profile details update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('Mobile number is required.');
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        avatar: avatar
      });

      if (res?.success) {
        setSuccessMsg('Profile details saved successfully in MongoDB database!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle role mode switch
  const handleSwitchSide = async (targetSide) => {
    if (targetSide === currentRole) return;
    setSwitching(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await switchRole(targetSide);
      setSuccessMsg(`Switched to ${targetSide === 'PUBLIC_USER' ? 'Public User' : 'Gaushala Owner'} side.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error switching side.');
    } finally {
      setSwitching(false);
    }
  };

  // Handle registering Gaushala for existing user
  const handleRegisterExistingGaushala = async (e) => {
    e.preventDefault();
    setRegisteringGaushala(true);
    setErrorMsg('');
    try {
      const res = await api.post('/gaushalas/register-existing', regForm);
      if (res.data.success) {
        setSuccessMsg('Gaushala profile activated successfully! You are now switched to Gaushala Owner mode.');
        setRegModalOpen(false);
        await switchRole('GAUSHALA_OWNER');
        fetchGaushalaInfo();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error registering Gaushala.');
    } finally {
      setRegisteringGaushala(false);
    }
  };

  const initialLetter = (name || user?.name || 'A').charAt(0).toUpperCase();

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      {/* Top Profile Header with Avatar Upload & Delete Controls */}
      <div className="text-center">
        <div className="relative inline-block mx-auto">
          {/* Avatar circle */}
          <div className="w-24 h-24 rounded-full bg-[#FAF6ED] border-2 border-[#D6A23A] text-[#80501D] font-bold text-3xl flex items-center justify-center shadow-md overflow-hidden relative">
            {avatar ? (
              <img
                src={avatar}
                alt={name || user?.name}
                className="w-full h-full object-cover"
                onError={() => setAvatar('')}
              />
            ) : (
              <span>{initialLetter}</span>
            )}

            {/* Uploading overlay */}
            {(uploadingAvatar || deletingAvatar) && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar || deletingAvatar}
            className="absolute -bottom-1 -right-1 p-2 rounded-full bg-[#80501D] hover:bg-[#593713] text-white shadow-md border-2 border-white transition transform hover:scale-105"
            title="Upload new profile picture"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Delete Button (visible when avatar exists) */}
          {avatar && (
            <button
              type="button"
              onClick={handleDeleteAvatar}
              disabled={uploadingAvatar || deletingAvatar}
              className="absolute -top-1 -right-1 p-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md border-2 border-white transition transform hover:scale-105"
              title="Delete profile picture"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <h1 className="text-2xl font-bold text-stone-900 mt-3">{name || user?.name}</h1>
        <p className="text-xs text-stone-500 font-mono mt-0.5">{phone || user?.phone}</p>
      </div>

      {/* Single Active Side Warning / Switcher Banner */}
      <div className="bg-gradient-to-r from-[#FAF6ED] to-[#F5ECE0] p-5 rounded-2xl border border-[#D6A23A]/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#419634] animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#80501D]">
              Active Side Right Now:
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#80501D] text-white">
              {currentRole === 'GAUSHALA_OWNER' ? 'Gaushala Owner Side' : 'Public User Side'}
            </span>
          </div>
          <p className="text-xs text-[#70563C] mt-1.5 leading-relaxed">
            You can only be on <strong>one side at a time</strong>. Your navigation, permissions, and tools reflect this active side.
          </p>
        </div>

        {hasGaushala && (
          <button
            onClick={() => handleSwitchSide(currentRole === 'GAUSHALA_OWNER' ? 'PUBLIC_USER' : 'GAUSHALA_OWNER')}
            disabled={switching}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#80501D] hover:bg-[#684117] text-white text-xs font-bold transition shadow-sm self-start sm:self-auto shrink-0"
          >
            {switching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>Switch to {currentRole === 'GAUSHALA_OWNER' ? 'Public User' : 'Gaushala Owner'} Side</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION: BOTH PROFILES SHOWN IN THE PROFILE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">
            Your Account Profiles (Both Available)
          </h2>
          <span className="text-[11px] text-[#80501D] font-medium">One Account &bull; Switch Anytime</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PROFILE 1: Public User Card (Matching User's Card Design) */}
          <div
            className={`p-5 rounded-2xl border-2 transition duration-200 flex flex-col justify-between ${
              currentRole === 'PUBLIC_USER'
                ? 'bg-white border-[#80501D] shadow-md ring-2 ring-[#80501D]/20'
                : 'bg-stone-50/60 border-stone-200 hover:border-[#D6A23A] opacity-90'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF6ED] text-[#80501D] flex items-center justify-center shrink-0 border border-[#EADBCE]">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">Public User</h3>
                    <p className="text-[11px] text-stone-500 leading-snug">
                      Report street cows, request veterinary doctors, or surrender cows.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                {currentRole === 'PUBLIC_USER' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F4E6] text-[#35632A] border border-[#C5E4C0]">
                    <Check className="w-3.5 h-3.5" />
                    Active Side Right Now
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                    Inactive (Click switch to enter)
                  </span>
                )}
              </div>

              {/* Citizen Details */}
              <div className="space-y-1.5 text-xs text-stone-600 bg-[#FAF8F5] p-3 rounded-xl border border-stone-200 mb-4">
                <div className="flex justify-between">
                  <span className="text-stone-400">Citizen Name:</span>
                  <span className="font-semibold text-stone-800">{name || user?.name}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-stone-400">Phone:</span>
                  <span className="font-semibold text-stone-800">{phone || user?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Status:</span>
                  <span className="font-semibold text-emerald-700">Verified Citizen</span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div>
              {currentRole === 'PUBLIC_USER' ? (
                <div className="w-full py-2.5 px-4 rounded-xl bg-[#FAF6ED] text-[#80501D] text-xs font-bold text-center border border-[#D6A23A]/40 flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Currently On This Side</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSwitchSide('PUBLIC_USER')}
                  disabled={switching}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#80501D] hover:bg-[#684117] text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>Switch to Public User Side</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* PROFILE 2: Gaushala Owner / Shelter Card (Matching User's Card Design) */}
          <div
            className={`p-5 rounded-2xl border-2 transition duration-200 flex flex-col justify-between ${
              currentRole === 'GAUSHALA_OWNER'
                ? 'bg-white border-[#80501D] shadow-md ring-2 ring-[#80501D]/20'
                : 'bg-stone-50/60 border-stone-200 hover:border-[#D6A23A] opacity-90'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF6ED] text-[#80501D] flex items-center justify-center shrink-0 border border-[#EADBCE]">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">Gaushala Owner / Shelter</h3>
                    <p className="text-[11px] text-stone-500 leading-snug">
                      Register an organization, manage multiple branches, doctors and rescue teams.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                {currentRole === 'GAUSHALA_OWNER' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F4E6] text-[#35632A] border border-[#C5E4C0]">
                    <Check className="w-3.5 h-3.5" />
                    Active Side Right Now
                  </span>
                ) : hasGaushala ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                    Inactive (Click switch to enter)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Available to Activate
                  </span>
                )}
              </div>

              {/* Gaushala Shelter Details if exists */}
              {hasGaushala ? (
                <div className="space-y-1.5 text-xs text-stone-600 bg-[#FAF8F5] p-3 rounded-xl border border-stone-200 mb-4">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Shelter:</span>
                    <span className="font-semibold text-[#80501D]">
                      {gaushalaData?.name || (typeof user?.gaushala === 'object' ? user?.gaushala?.name : 'Registered Gaushala')}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-stone-400">Reg ID:</span>
                    <span className="font-semibold text-stone-800">
                      {gaushalaData?.registrationId || 'GAUSH-OWNER'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Location:</span>
                    <span className="font-semibold text-stone-800">
                      {gaushalaData?.city || 'Registered City'}, {gaushalaData?.state || 'India'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 mb-4">
                  <p className="font-semibold">Activate your Gaushala profile on this same account.</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">No need for a second phone number or email.</p>
                </div>
              )}
            </div>

            {/* Action */}
            <div>
              {currentRole === 'GAUSHALA_OWNER' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/gaushala/dashboard')}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#80501D] hover:bg-[#684117] text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <span>Open Gaushala Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : hasGaushala ? (
                <button
                  type="button"
                  onClick={() => handleSwitchSide('GAUSHALA_OWNER')}
                  disabled={switching}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#80501D] hover:bg-[#684117] text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>Switch to Gaushala Owner Side</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setRegModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#557B42] hover:bg-[#426133] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Activate Gaushala Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: EDIT ACCOUNT PROFILE INFORMATION */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-stone-200 space-y-5">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Edit Account Profile Details
          </h2>
          <span className="text-[11px] text-[#80501D] font-medium">MongoDB Atlas Database Connected</span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-sm">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#80501D] focus:ring-1 focus:ring-[#80501D] outline-none text-stone-800 font-medium"
                required
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9811122233"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#80501D] focus:ring-1 focus:ring-[#80501D] outline-none text-stone-800 font-mono"
                required
              />
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#80501D] focus:ring-1 focus:ring-[#80501D] outline-none text-stone-800 font-medium"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Save Profile Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-4 rounded-xl bg-[#80501D] hover:bg-[#684117] active:bg-[#593713] text-white font-bold text-sm shadow-md shadow-[#80501D]/20 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Sign Out Button */}
        <div className="pt-4 border-t border-stone-100">
          <button
            onClick={logout}
            className="w-full py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out of Account
          </button>
        </div>
      </div>

      {/* Modal: Register Gaushala for Existing User */}
      {regModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Activate Gaushala Shelter Profile</h3>
                <p className="text-xs text-stone-500">
                  Linked directly to your existing account ({phone || user?.phone})
                </p>
              </div>
              <button
                onClick={() => setRegModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterExistingGaushala} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Gaushala Name</label>
                <input
                  type="text"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  placeholder="e.g. Shri Radhe Gaushala"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-[#80501D] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Registration ID</label>
                  <input
                    type="text"
                    value={regForm.registrationId}
                    onChange={(e) => setRegForm({ ...regForm, registrationId: e.target.value })}
                    placeholder="e.g. GAUSH-505"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-[#80501D] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Capacity</label>
                  <input
                    type="number"
                    value={regForm.totalCapacity}
                    onChange={(e) => setRegForm({ ...regForm, totalCapacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-[#80501D] outline-none"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Full Address</label>
                <input
                  type="text"
                  value={regForm.address}
                  onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                  placeholder="Street / Sector / Village"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-[#80501D] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={regForm.city}
                    onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                    placeholder="e.g. Delhi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-[#80501D] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">State</label>
                  <input
                    type="text"
                    value={regForm.state}
                    onChange={(e) => setRegForm({ ...regForm, state: e.target.value })}
                    placeholder="e.g. Delhi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-[#80501D] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Pincode</label>
                  <input
                    type="text"
                    value={regForm.pincode}
                    onChange={(e) => setRegForm({ ...regForm, pincode: e.target.value })}
                    placeholder="110001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-[#80501D] outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRegModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registeringGaushala}
                  className="px-5 py-2.5 rounded-xl bg-[#80501D] text-white text-xs font-bold hover:bg-[#684117] flex items-center gap-1.5 disabled:opacity-60"
                >
                  {registeringGaushala && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Activate Gaushala Shelter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
