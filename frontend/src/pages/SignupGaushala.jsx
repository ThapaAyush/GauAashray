import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import LocationPicker from '../components/LocationPicker';
import { AlertCircle, Loader2, Building, ShieldCheck } from 'lucide-react';

export default function SignupGaushala() {
  const [formData, setFormData] = useState({
    ownerName: '',
    phone: '',
    email: '',
    password: '',
    gaushalaName: '',
    registrationId: '',
    address: '',
    state: '',
    city: '',
    pincode: '',
    latitude: 28.6139,
    longitude: 77.2090,
    totalCapacity: 50,
    currentCows: 0,
    doctorsCount: 1,
    rescueStaffCount: 2,
    availableServices: ['RESCUE', 'VETERINARY', 'SURRENDER', 'AMBULANCE'],
    photographs: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerGaushala } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleServiceToggle = (service) => {
    const current = [...formData.availableServices];
    if (current.includes(service)) {
      setFormData({ ...formData, availableServices: current.filter((s) => s !== service) });
    } else {
      setFormData({ ...formData, availableServices: [...current, service] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ownerName || !formData.phone || !formData.password || !formData.gaushalaName || !formData.address) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await registerGaushala(formData);
      navigate('/application-status');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#F8F7F3]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group">
            <img src="/logo.png" alt="Logo" className="h-16 w-auto mx-auto object-contain" />
          </Link>
          <h2 className="mt-2 text-2xl font-bold text-[#593713]">
            Register Your Gaushala Organization
          </h2>
          <p className="text-xs text-stone-500">
            Join the centralized verified cow rescue & shelter network
          </p>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-stone-200">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Owner Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#80501D] border-b pb-1">
                1. Organization Owner Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Owner Full Name *
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Sharma"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit number"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@gaushala.org"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Set Portal Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                  />
                </div>
              </div>
            </div>

            {/* Gaushala Organization Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#80501D] border-b pb-1">
                2. Gaushala Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Gaushala Name *
                  </label>
                  <input
                    type="text"
                    name="gaushalaName"
                    value={formData.gaushalaName}
                    onChange={handleChange}
                    placeholder="e.g. Shri Krishna Gaushala Trust"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Registration ID / Trust No. (Optional)
                  </label>
                  <input
                    type="text"
                    name="registrationId"
                    value={formData.registrationId}
                    onChange={handleChange}
                    placeholder="e.g. REG-2024-998"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                  />
                </div>
              </div>

              {/* Location Picker */}
              <LocationPicker
                address={formData.address}
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={(loc) => {
                  setFormData({
                    ...formData,
                    address: loc.address,
                    latitude: loc.latitude,
                    longitude: loc.longitude
                  });
                }}
              />

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Delhi"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Delhi"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="110085"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Capacity & Resources */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#80501D] border-b pb-1">
                3. Capacity & Available Resources
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    name="totalCapacity"
                    value={formData.totalCapacity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Current Cows</label>
                  <input
                    type="number"
                    name="currentCows"
                    value={formData.currentCows}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Doctors</label>
                  <input
                    type="number"
                    name="doctorsCount"
                    value={formData.doctorsCount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Rescue Staff</label>
                  <input
                    type="number"
                    name="rescueStaffCount"
                    value={formData.rescueStaffCount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-2">
                  Eligible Services Provided
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['RESCUE', 'VETERINARY', 'SURRENDER', 'AMBULANCE'].map((service) => (
                    <button
                      type="button"
                      key={service}
                      onClick={() => handleServiceToggle(service)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                        formData.availableServices.includes(service)
                          ? 'border-[#80501D] bg-[#FAF6ED] text-[#80501D]'
                          : 'border-stone-200 bg-white text-stone-400'
                      }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photographs */}
              <ImageUpload
                value={formData.photographs}
                onChange={(urls) => setFormData({ ...formData, photographs: urls })}
                label="Gaushala Photographs"
                maxFiles={3}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[#80501D] hover:bg-[#593713] shadow-md transition flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                'Submit Application for Review'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

