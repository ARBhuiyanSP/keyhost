import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage, FiLoader, FiCamera } from 'react-icons/fi';

const compressImage = (file, maxWidth = 1000, maxHeight = 1000, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const SingleImageUpload = ({ value, onChange, label = "Upload Photo", className = "" }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsProcessing(true);
    try {
      const base64 = await compressImage(file);
      onChange(base64);
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to process image');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-all overflow-hidden bg-gray-50 group ${value ? 'border-none' : ''}`}
      >
        {value ? (
          <>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <FiCamera className="text-white text-2xl" />
            </div>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
            >
              <FiX size={14} />
            </button>
          </>
        ) : (
          <>
            {isProcessing ? (
              <FiLoader className="animate-spin text-primary-500 text-2xl" />
            ) : (
              <>
                <FiCamera className="text-gray-400 text-2xl mb-1" />
                <span className="text-[10px] font-bold text-gray-500 uppercase">{label}</span>
              </>
            )}
          </>
        )}
      </div>
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        onChange={handleFileSelect} 
        className="hidden" 
      />
    </div>
  );
};

export default SingleImageUpload;
