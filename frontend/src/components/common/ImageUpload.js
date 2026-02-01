import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';

const ImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  className = ""
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    
    // Validate files
    for (const file of fileArray) {
      if (!acceptedTypes.includes(file.type)) {
        alert(`File ${file.name} is not a supported image type`);
        return;
      }
      
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
        return;
      }
    }

    if (images.length + fileArray.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setIsUploading(true);
    
    try {
      // Convert files to base64
      const newImages = await Promise.all(
        fileArray.map((file, index) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              console.log(`Image ${index + 1} converted:`, e.target.result.substring(0, 50) + '...');
              resolve({
                id: Date.now() + Math.random(),
                file,
                preview: e.target.result, // Base64 string
                name: file.name,
                size: file.size
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      const updatedImages = [...images, ...newImages];
      console.log('Total images now:', updatedImages.length);
      onImagesChange(updatedImages);
      alert(`${fileArray.length} image(s) added successfully`);
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to process images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    onImagesChange(updatedImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {isUploading ? 'Uploading...' : 'Upload Images'}
        </p>
        <p className="text-sm text-gray-600">
          Drag and drop images here, or click to select
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Supports: JPEG, PNG, WebP • Max size: {maxSize / (1024 * 1024)}MB • Max files: {maxImages}
        </p>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Uploaded Images ({images.length}/{maxImages})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.preview}
                  alt={image.name}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiX className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                  <p className="truncate">{image.name}</p>
                  <p>{(image.size / 1024).toFixed(1)} KB</p>
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
