import React, { useState, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileHeart,
  Database,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Shield,
  RefreshCw,
  Camera,
  Trash2,
  User,
  Phone,
  Mail,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout, updateProfile, deleteAvatar } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Profile modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalError, setModalError] = useState('');
  const fileInputRef = useRef(null);

  const openProfileModal = () => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setAvatar(user.avatar || '');
    }
    setModalSuccess('');
    setModalError('');
    setProfileModalOpen(true);
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setModalError('Please select a valid image file.');
      return;
    }

    setUploadingAvatar(true);
    setModalError('');
    setModalSuccess('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (uploadRes.data.success && uploadRes.data.url) {
        const newUrl = uploadRes.data.url;
        setAvatar(newUrl);
        await updateProfile({ avatar: newUrl });
        setModalSuccess('Profile image updated and saved to database!');
        setTimeout(() => setModalSuccess(''), 4000);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error uploading image.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatar();
      setAvatar('');
      setModalSuccess('Profile image deleted from database.');
      setTimeout(() => setModalSuccess(''), 4000);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error deleting avatar.');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError('');
    setModalSuccess('');
    try {
      const res = await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        avatar
      });
      if (res?.success) {
        setModalSuccess('Admin profile updated and saved to database successfully!');
        setTimeout(() => setModalSuccess(''), 4000);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/users', label: 'Users Management', icon: Users },
    { to: '/gaushalas', label: 'Gaushala Organizations', icon: Building2 },
    { to: '/requests', label: 'Rescue & Care Requests', icon: FileHeart }
  ];

  return (
    <div className="min-h-screen bg-[#FAF6ED] flex flex-col md:flex-row text-[#372A1C]">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-[#E8E1D5] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="GauAashray" className="h-8 w-auto" />
          <div>
            <h1 className="font-extrabold text-sm text-[#593713] leading-none">GauAashray</h1>
            <span className="text-[10px] text-[#8F7253] font-semibold">SUPER ADMIN</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-[#593713] hover:bg-[#FAF6ED]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-[#E8E1D5] flex flex-col z-40 transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand logo header */}
        <div className="p-5 border-b border-[#EFE8DD] flex items-center gap-3">
          <img src="/logo.png" alt="GauAashray Logo" className="h-10 w-auto object-contain" />
          <div>
            <div className="font-extrabold text-base text-[#593713] tracking-tight">GauAashray</div>
            <div className="text-[11px] font-bold text-[#80501D] tracking-wider uppercase">Admin Portal</div>
          </div>
        </div>

        {/* Database status indicator */}
        <div className="px-5 py-3 bg-[#FAF6ED]/70 border-b border-[#EFE8DD] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#35632A] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#419634] animate-pulse"></span>
            <span>MongoDB Atlas</span>
          </div>
          <span className="text-[10px] bg-white border border-[#D9CEBF] px-1.5 py-0.5 rounded text-[#7D6B58] font-mono">
            Cluster 0
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#80501D] text-white shadow-sm shadow-[#80501D]/20'
                      : 'text-[#655240] hover:bg-[#FAF6ED] hover:text-[#593713]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-4 mt-4 border-t border-[#EFE8DD]">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#80501D] bg-[#FAF3E7] hover:bg-[#F3E6D0] transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                Public Website (5173)
              </span>
              <span className="text-[10px]">&rarr;</span>
            </a>
          </div>
        </nav>

        {/* Super Admin User info, Profile Edit & logout */}
        <div className="p-4 border-t border-[#EFE8DD] bg-[#FAF8F5]">
          <div
            onClick={openProfileModal}
            className="flex items-center gap-3 mb-3 p-2 rounded-xl hover:bg-[#FAF6ED] cursor-pointer transition border border-transparent hover:border-[#E8E1D5]"
            title="Click to edit profile & avatar"
          >
            <div className="w-10 h-10 rounded-full bg-[#80501D] text-white font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden border border-[#D6A23A]">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name ? user.name.slice(0, 2).toUpperCase() : 'AT'}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#372A1C] truncate">{user?.name || 'Ayush Thapa'}</div>
              <div className="text-[11px] text-[#7D6B58] truncate">{user?.email || 'ayush108ayush108@gmail.com'}</div>
              <span className="inline-block mt-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-[#E8F4E6] text-[#35632A] rounded">
                Super Admin
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={openProfileModal}
              className="flex-1 py-1.5 rounded-lg text-xs font-bold text-[#80501D] bg-[#FAF3E7] hover:bg-[#F3E6D0] transition-colors"
            >
              My Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-700 hover:bg-red-50 border border-red-200 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Admin Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E8E1D5] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE8DD] mb-5">
              <div>
                <h3 className="text-lg font-bold text-[#372A1C]">Admin Profile</h3>
                <p className="text-xs text-[#7D6B58]">Update your personal details & profile image in MongoDB.</p>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="p-1.5 rounded-lg text-[#7D6B58] hover:bg-[#FAF6ED]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar Circle with Upload & Delete */}
            <div className="text-center mb-6">
              <div className="relative inline-block mx-auto">
                <div className="w-24 h-24 rounded-full bg-[#FAF6ED] border-2 border-[#D6A23A] text-[#80501D] font-bold text-3xl flex items-center justify-center shadow-md overflow-hidden relative">
                  {avatar ? (
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(name || 'A').charAt(0).toUpperCase()}</span>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 p-2 rounded-full bg-[#80501D] hover:bg-[#593713] text-white shadow-md border-2 border-white transition transform hover:scale-105"
                  title="Upload new image"
                >
                  <Camera className="w-4 h-4" />
                </button>

                {/* Delete button */}
                {avatar && (
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    className="absolute -top-1 -right-1 p-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md border-2 border-white transition transform hover:scale-105"
                    title="Delete image"
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
              <p className="text-[11px] text-[#8F7E6F] mt-2">Click camera to upload, or trash to remove</p>
            </div>

            {modalSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-[#593713] uppercase mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D9CEBF] text-sm focus:border-[#80501D] outline-none"
                    required
                  />
                  <User className="w-4 h-4 text-[#8F7E6F] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#593713] uppercase mb-1">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D9CEBF] text-sm focus:border-[#80501D] outline-none font-mono"
                    required
                  />
                  <Phone className="w-4 h-4 text-[#8F7E6F] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#593713] uppercase mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D9CEBF] text-sm focus:border-[#80501D] outline-none"
                    required
                  />
                  <Mail className="w-4 h-4 text-[#8F7E6F] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7D6B58] hover:bg-[#FAF6ED]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#80501D] text-white text-xs font-bold hover:bg-[#684117] flex items-center gap-1.5 disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;


