import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import LocationPicker from '../components/LocationPicker';
import api from '../services/api';
import { Home, AlertCircle, Loader2, CheckCircle2, ArrowRight, ShieldCheck, Compass } from 'lucide-react';

const REASONS = [
  'Unable to maintain',
  'Financial difficulty',
  'Health or age-related difficulty',
  'Relocation',
  'Other'
];

export default function SurrenderCow() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ownerName: user?.name || '',
    ownerPhone: user?.phone || '',
    cowName: '',
    breed: 'Desi / Indigenous',
    approximateAge: '',
    healthCondition: 'Healthy',
    reason: 'Unable to maintain',
    numberOfCows: 1,
    photographs: [],
    addressText: '',
    latitude: 28.6139,
    longitude: 77.2090,
    ownershipConfirmed: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ownerName || !formData.ownerPhone || !formData.addressText) {
      setError('Please provide all mandatory details.');
      return;
    }

    if (!formData.ownershipConfirmed) {
      setError('Please confirm lawful ownership of the cow before proceeding.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/surrender', formData);
      if (res.data.success) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit surrender application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#557B42] bg-emerald-100 mb-2">
          <Home className="w-3.5 h-3.5" />
          Shelter Cow Transfer
        </span>
        <h1 className="text-3xl font-extrabold text-[#593713]">Surrender a Cow</h1>
        <p className="text-xs text-stone-500 mt-1">
          Provide lifelong shelter, care and protection at verified Gaushalas
        </p>
      </div>

      {result ? (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-stone-200 text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#557B42] flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[11px] font-extrabold text-stone-500 uppercase tracking-widest">
              Application Under Review
            </span>
            <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-100 border border-stone-200">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-mono tracking-wider">
                {result.requestId}
              </h2>
            </div>
            <p className="text-xs text-stone-600 mt-3 max-w-md mx-auto leading-relaxed">
              Your surrender application has been broadcasted to the <strong>5 nearest Gaushalas</strong> with shelter capacity based on your GPS location. You can track live review, approval, and scheduled pickup in real time.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/track-request?id=${result.requestId}`)}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-2xl bg-[#80501D] hover:bg-[#593713] active:scale-[0.98] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 touch-manipulation cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#D6A23A]" />
              <span>Track Live Request</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-requests')}
              className="w-full sm:w-auto min-h-[48px] px-5 py-3.5 rounded-2xl bg-[#FAF6ED] hover:bg-[#FAF6ED]/80 active:scale-[0.98] text-[#80501D] border border-[#D6A23A]/40 font-bold text-sm transition touch-manipulation cursor-pointer"
            >
              View In My Requests
            </button>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setFormData({
                  ...formData,
                  cowName: '',
                  photographs: [],
                  ownershipConfirmed: false
                });
              }}
              className="w-full sm:w-auto min-h-[48px] px-5 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 active:scale-[0.98] text-stone-700 font-semibold text-sm transition touch-manipulation cursor-pointer"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-stone-200">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Important Notice */}
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
            <p className="font-bold">Important Notice:</p>
            <p>
              GauAashray operates on strict ethical shelter management. Every surrender request requires
              manual verification of ownership and shelter capacity before pickup is scheduled.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <ImageUpload
              value={formData.photographs}
              onChange={(urls) => setFormData({ ...formData, photographs: urls })}
              label="Cow Photograph(s) *"
              maxFiles={3}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Cow Name
                </label>
                <input
                  type="text"
                  value={formData.cowName}
                  onChange={(e) => setFormData({ ...formData, cowName: e.target.value })}
                  placeholder="e.g. Nandini"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Breed (If known)
                </label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  placeholder="e.g. Sahiwal / Gir / Desi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Approximate Age
                </label>
                <input
                  type="text"
                  value={formData.approximateAge}
                  onChange={(e) => setFormData({ ...formData, approximateAge: e.target.value })}
                  placeholder="e.g. 5 Years"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                />
              </div>
            </div>

            {/* Reason for Surrender */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Reason for Surrender *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {REASONS.map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setFormData({ ...formData, reason: r })}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition ${
                      formData.reason === r
                        ? 'border-[#80501D] bg-[#FAF6ED] text-[#80501D] font-bold'
                        : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Number of Cows
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.numberOfCows}
                  onChange={(e) => setFormData({ ...formData, numberOfCows: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Current Health Condition
                </label>
                <select
                  value={formData.healthCondition}
                  onChange={(e) => setFormData({ ...formData, healthCondition: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                >
                  <option value="Healthy">Healthy</option>
                  <option value="Sick">Sick / Under Treatment</option>
                  <option value="Aged">Aged / Senior Cow</option>
                  <option value="Special Needs">Special Needs / Disabled</option>
                </select>
              </div>
            </div>

            <LocationPicker
              address={formData.addressText}
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={(loc) => {
                setFormData({
                  ...formData,
                  addressText: loc.address,
                  latitude: loc.latitude,
                  longitude: loc.longitude
                });
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Owner Full Name *
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="e.g. Ramesh Patel"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  placeholder="10-digit number"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                />
              </div>
            </div>

            {/* Ownership Confirmation */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ownershipConfirmed}
                  onChange={(e) => setFormData({ ...formData, ownershipConfirmed: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded text-[#80501D] focus:ring-[#D6A23A]"
                />
                <span className="text-xs text-stone-700">
                  I confirm that I am the legal caretaker/owner of this cow and freely request transfer
                  to a verified Gaushala for lifelong protection without commercial sale.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[52px] py-3.5 px-4 rounded-2xl font-black text-sm text-white bg-[#557B42] hover:bg-[#436333] active:scale-[0.98] shadow-md transition flex items-center justify-center gap-2 touch-manipulation cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <Home className="w-5 h-5" />
                  <span>Submit Surrender Request</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

