import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage, FiCheckCircle, FiLoader } from 'react-icons/fi';

/**
 * Compress an image File using canvas before converting to base64.
 * Always outputs JPEG — iOS Safari does NOT support canvas.toDataURL('image/webp')
 * and silently falls back to PNG, which can be LARGER than the original.
 */
const compressImage = (file, maxWidth = 1600, maxHeight = 1600, quality = 0.75) => {
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
        // White background needed when converting PNG (with transparency) to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // ALWAYS JPEG — universal support including iOS Safari
        // WebP in canvas.toDataURL() is NOT supported on iOS → falls back to PNG → LARGER size
        const compressed = canvas.toDataURL('image/jpeg', quality);

        // Safety: If the original file actually was smaller than our compressed version,
        // it means the image is already highly optimized. Use original.
        if (compressed.length > e.target.result.length) {
          const harder = canvas.toDataURL('image/jpeg', 0.6);
          // If even harder compression is larger, just use the original!
          if (harder.length > e.target.result.length) {
            resolve(e.target.result);
          } else {
            resolve(harder);
          }
        } else {
          resolve(compressed);
        }
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const ImageUpload = ({
  images = [],
  onImagesChange,
  maxImages = 10,
  maxSize = 10 * 1024 * 1024, // Accept up to 10MB raw — we compress client-side
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  className = ""
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Validate file types
    for (const file of fileArray) {
      if (!acceptedTypes.includes(file.type)) {
        alert(`File "${file.name}" is not a supported image type. Use JPEG, PNG, or WebP.`);
        return;
      }

      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum raw size is ${maxSize / (1024 * 1024)}MB.`);
        return;
      }
    }

    if (images.length + fileArray.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed. You can add ${maxImages - images.length} more.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const newImages = [];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];

        // Compress the image before converting to base64
        const compressedBase64 = await compressImage(file);

        // Estimate compressed size from base64 length
        const compressedSizeBytes = Math.round((compressedBase64.length * 3) / 4);

        newImages.push({
          id: Date.now() + Math.random(),
          file,
          preview: compressedBase64,      // Compressed base64
          name: file.name,
          size: file.size,                // Original size (for display)
          compressedSize: compressedSizeBytes
        });

        // Update progress
        setUploadProgress(Math.round(((i + 1) / fileArray.length) * 100));
      }

      const updatedImages = [...images, ...newImages];
      onImagesChange(updatedImages);

    } catch (error) {
      console.error('Image processing error:', error);
      alert('Failed to process one or more images. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelect(files);
  };

  const handleDragOver = (e) => e.preventDefault();

  const removeImage = (imageId) => {
    onImagesChange(images.filter(img => img.id !== imageId));
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        style={{ opacity: isUploading ? 0.7 : 1 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <>
            <FiLoader className="w-12 h-12 text-primary-500 mx-auto mb-4 animate-spin" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Compressing & processing images...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3 max-w-xs mx-auto">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{uploadProgress}% complete</p>
          </>
        ) : (
          <>
            <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Upload Images</p>
            <p className="text-sm text-gray-600">
              Drag and drop images here, or click to select
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Supports: JPEG, PNG, WebP • Up to {maxSize / (1024 * 1024)}MB each •{' '}
              Images are auto-compressed for fast upload • Max {maxImages} files
            </p>
          </>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Uploaded Images ({images.length}/{maxImages})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.preview}
                  alt={image.name}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />

                {/* Cover badge for first image */}
                {index === 0 ? (
                  <div className="absolute top-1 left-1 bg-primary-600 text-white text-xs px-2 py-0.5 rounded font-medium">
                    Cover
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newImages = [...images];
                      const [selected] = newImages.splice(index, 1);
                      newImages.unshift(selected);
                      onImagesChange(newImages);
                    }}
                    className="absolute top-1 left-1 bg-white/90 text-gray-700 text-[10px] px-2 py-0.5 rounded font-bold opacity-0 group-hover:opacity-100 transition shadow hover:bg-primary-600 hover:text-white"
                  >
                    Set as Cover
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(image.id); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  <FiX className="w-4 h-4" />
                </button>

                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1.5 rounded-b-lg">
                  <p className="truncate">{image.name}</p>
                  {image.compressedSize ? (
                    <p className="flex items-center gap-1">
                      <FiCheckCircle className="w-3 h-3 text-green-400" />
                      {formatBytes(image.compressedSize)}
                      {image.size > 0 && (
                        <span className="text-gray-400 ml-1">
                          (was {formatBytes(image.size)})
                        </span>
                      )}
                    </p>
                  ) : (
                    <p>{formatBytes(image.size)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
