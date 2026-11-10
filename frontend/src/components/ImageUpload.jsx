import React, { useState } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function ImageUpload({ value = [], onChange, maxFiles = 3, label = "Upload Photographs" }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (value.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed.`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      if (files.length === 1) {
        formData.append('file', files[0]);
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success && res.data.url) {
          onChange([...value, res.data.url]);
        }
      } else {
        files.forEach((f) => formData.append('files', f));
        const res = await api.post('/upload/multiple', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success && res.data.urls) {
          onChange([...value, ...res.data.urls]);
        }
      }
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const removeImage = (index) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-stone-700">{label}</label>
        <span className="text-xs text-stone-500">
          {value.length}/{maxFiles}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {value.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100 group">
            <img src={url} alt={`Upload ${i}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1.5 right-1.5 p-1 bg-stone-900/70 hover:bg-red-600 text-white rounded-full transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {value.length < maxFiles && (
          <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-[#D6A23A]/50 hover:border-[#80501D] bg-[#FAF6ED]/50 hover:bg-[#FAF6ED] rounded-xl cursor-pointer transition p-2 text-center group">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-[#80501D] animate-spin" />
            ) : (
              <>
                <Camera className="w-6 h-6 text-[#80501D] group-hover:scale-110 transition mb-1" />
                <span className="text-xs font-medium text-[#80501D]">Add Photo</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple={maxFiles > 1}
              disabled={uploading}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

