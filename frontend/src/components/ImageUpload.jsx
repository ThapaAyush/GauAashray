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
          <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 group shadow-2xs">
            <img src={url} alt={`Upload ${i}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              data-allow-guest="true"
              aria-label="Remove image"
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-stone-900/80 hover:bg-red-600 active:scale-90 text-white rounded-full transition touch-manipulation shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {value.length < maxFiles && (
          <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-[#D6A23A]/60 hover:border-[#80501D] active:scale-95 bg-[#FAF6ED]/70 hover:bg-[#FAF6ED] rounded-2xl cursor-pointer transition p-3 text-center group touch-manipulation">
            {uploading ? (
              <Loader2 className="w-7 h-7 text-[#80501D] animate-spin" />
            ) : (
              <>
                <Camera className="w-7 h-7 text-[#80501D] group-hover:scale-110 transition mb-1.5" />
                <span className="text-xs font-bold text-[#80501D]">Add Photo</span>
                <span className="text-[10px] text-stone-400 mt-0.5">Camera / Gallery</span>
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

