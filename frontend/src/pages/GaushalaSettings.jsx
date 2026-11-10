import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Settings, CheckCircle2, Loader2 } from 'lucide-react';

export default function GaushalaSettings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [totalCapacity, setTotalCapacity] = useState(50);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    api.get('/gaushalas/my-profile')
      .then((res) => {
        if (res.data.success && res.data.gaushala) {
          const g = res.data.gaushala;
          setProfile(g);
          setName(g.name || '');
          setAddress(g.address || '');
          setCity(g.city || '');
          setState(g.state || '');
          setTotalCapacity(g.totalCapacity || 50);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');
    try {
      await api.put('/gaushalas/my-profile', {
        name,
        address,
        city,
        state,
        totalCapacity
      });
      setSavedMsg('Profile settings updated successfully!');
      setTimeout(() => setSavedMsg(''), 4000);
    } catch (err) {
      alert('Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#593713]">Organization Settings</h1>
        <p className="text-xs text-stone-500">
          Update organization profile, verified address, and intake capacities
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#80501D] animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          {savedMsg && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{savedMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Gaushala Organization Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A23A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Registered Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Organization-Wide Total Shelter Capacity
              </label>
              <input
                type="number"
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#80501D] hover:bg-[#593713] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

