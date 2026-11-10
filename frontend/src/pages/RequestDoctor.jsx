import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import LocationPicker from '../components/LocationPicker';
import api from '../services/api';
import { Stethoscope, AlertCircle, Loader2, CheckCircle2, ArrowRight, Compass } from 'lucide-react';

export default function RequestDoctor() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ownerName: user?.name || '',
    ownerPhone: user?.phone || '',
    cowName: '',
    cowAge: '',
    symptoms: '',
    problemDescription: '',
    urgency: 'Normal',
    photographs: [],
    addressText: '',
    latitude: 28.6139,
    longitude: 77.2090
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ownerName || !formData.ownerPhone || !formData.symptoms || !formData.addressText) {
      setError('Please provide owner name, contact, symptoms and address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/medical', formData);
      if (res.data.success) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit doctor request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-blue-700 bg-blue-100 mb-2">
          <Stethoscope className="w-3.5 h-3.5" />
          Veterinary Doctor Assistance
        </span>
        <h1 className="text-3xl font-extrabold text-[#593713]">Request a Doctor</h1>
        <p className="text-xs text-stone-500 mt-1">
          Connect with registered Gaushala veterinary doctors for your cows
        </p>
      </div>

      {result ? (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-200 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">
              Doctor Request Scheduled
            </span>
            <h2 className="text-2xl font-black text-stone-900 mt-1 font-mono">
              {result.requestId}
            </h2>
            <p className="text-xs text-stone-600 mt-2 max-w-md mx-auto">
              Your veterinary care request has been broadcasted simultaneously to the 5 nearest Gaushala clinics based on your GPS location. You can track live doctor assignment and dispatch in real time.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(`/track-request?id=${result.requestId}`)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#80501D] hover:bg-[#593713] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#D6A23A]" />
              Track Live Request
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/my-requests')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#FAF6ED] hover:bg-[#FAF6ED]/80 text-[#80501D] border border-[#D6A23A]/40 font-bold text-sm transition"
            >
              View In My Requests
            </button>
            <button
              onClick={() => {
                setResult(null);
                setFormData({
                  ...formData,
                  cowName: '',
                  cowAge: '',
                  symptoms: '',
                  problemDescription: '',
                  photographs: []
                });
              }}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition"
            >
              Book Another Visit
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <ImageUpload
              value={formData.photographs}
              onChange={(urls) => setFormData({ ...formData, photographs: urls })}
              label="Cow Photograph (Optional)"
              maxFiles={2}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Cow Name (If Any)
                </label>
                <input
                  type="text"
                  value={formData.cowName}
                  onChange={(e) => setFormData({ ...formData, cowName: e.target.value })}
                  placeholder="e.g. Surabhi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Cow Age (If Known)
                </label>
                <input
                  type="text"
                  value={formData.cowAge}
                  onChange={(e) => setFormData({ ...formData, cowAge: e.target.value })}
                  placeholder="e.g. 4 Years"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                />
              </div>
            </div>

            {/* Urgency Selector (Section 9) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Urgency Level *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Normal', 'Urgent', 'Emergency'].map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setFormData({ ...formData, urgency: lvl })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                      formData.urgency === lvl
                        ? lvl === 'Emergency'
                          ? 'border-red-600 bg-red-600 text-white'
                          : lvl === 'Urgent'
                          ? 'border-amber-500 bg-amber-500 text-white'
                          : 'border-[#80501D] bg-[#80501D] text-white'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Primary Symptoms / Health Issue *
              </label>
              <textarea
                rows={2}
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                placeholder="e.g. Fever, digestive difficulty, limping, decreased milk"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
              />
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
                  placeholder="e.g. Rahul Sharma"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Contact Mobile Number *
                </label>
                <input
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  placeholder="For doctor call"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[#80501D] hover:bg-[#593713] shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Finding Nearest Veterinary Doctor...
                </>
              ) : (
                <>
                  <Stethoscope className="w-4 h-4 text-[#D6A23A]" />
                  Submit Doctor Request
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

