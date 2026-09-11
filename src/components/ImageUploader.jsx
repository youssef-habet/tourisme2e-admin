import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

/**
 * ImageUploader — Composant réutilisable pour uploader plusieurs images
 * Props:
 *   - value: string (URLs séparées par virgule, format actuel de la DB)
 *   - onChange: (newValue: string) => void — appelé avec les URLs séparées par virgule
 *   - label: string
 *   - maxImages: number (défaut: 10)
 */
const ImageUploader = ({ value = '', onChange, label = 'Photos', maxImages = 10 }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Parse URLs from comma-separated string
  const urls = value
    ? value.split(',').map(u => u.trim()).filter(Boolean)
    : [];

  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return;
    if (urls.length + files.length > maxImages) {
      setUploadError(`Maximum ${maxImages} images autorisées`);
      return;
    }

    setUploading(true);
    setUploadError('');
    const newUrls = [...urls];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Seules les images sont acceptées (jpg, png, webp...)');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`${file.name} est trop grand (max 10MB)`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Backend returns { url: "..." } or just a string
        const uploadedUrl = response.data?.url || response.data?.fileUrl || response.data;
        if (uploadedUrl) {
          newUrls.push(typeof uploadedUrl === 'string' ? uploadedUrl : JSON.stringify(uploadedUrl));
        }
      } catch (err) {
        console.error('Upload error:', err);
        const status = err.response?.status;
        if (status === 403) {
          setUploadError('Accès refusé. Assurez-vous d\'être connecté en tant qu\'admin.');
        } else if (status === 404) {
          setUploadError('Endpoint upload non disponible sur le serveur.');
        } else {
          setUploadError(err.response?.data?.message || `Erreur upload: ${file.name}`);
        }
        break;
      }
    }

    onChange(newUrls.join(','));
    setUploading(false);
  };

  const removeImage = (index) => {
    const newUrls = urls.filter((_, i) => i !== index);
    onChange(newUrls.join(','));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  };

  const getImageSrc = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;

    const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
    if (url.startsWith('/api/v1')) return url;
    return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-bold text-slate-700">{label}</label>
      )}

      {/* Drop Zone */}
      {urls.length < maxImages && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
            ${dragOver
              ? 'border-teal-500 bg-teal-50'
              : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'
            }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => uploadFiles(e.target.files)}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-teal-600">
              <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" style={{borderWidth:'3px'}} />
              <span className="text-sm font-medium">Upload en cours...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Upload size={28} className={dragOver ? 'text-teal-500' : ''} />
              <div>
                <p className="text-sm font-bold text-slate-600">
                  Cliquez ou glissez des images ici
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  JPG, PNG, WEBP — max 10MB par image — {urls.length}/{maxImages} images
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {uploadError && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-100 flex items-center gap-2">
          <X size={14} />
          {uploadError}
        </div>
      )}

      {/* Preview Grid */}
      {urls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {urls.map((url, idx) => (
            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
              <img
                src={getImageSrc(url)}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback icon */}
              <div className="hidden w-full h-full items-center justify-center text-slate-400">
                <ImageIcon size={24} />
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
              >
                <X size={12} />
              </button>
              {/* Index badge */}
              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1 rounded">
                {idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {urls.length === 0 && !uploading && (
        <p className="text-xs text-slate-400 text-center py-1">Aucune image ajoutée</p>
      )}
    </div>
  );
};

export default ImageUploader;
