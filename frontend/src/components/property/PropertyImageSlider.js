import React, { useState, useEffect, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PropertyImageSlider = ({ property, className = '' }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Removed getImageUrl hardcoding flag to use native proxy

  // Helper to ensure images load correctly on cPanel/shared hosting via the API URL
  const fixImageUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    return url;
  };

  // Get images array or fallback to main_image
  const images = useMemo(() => {
    // Check if images array exists and has items
    if (property?.images && Array.isArray(property.images) && property.images.length > 0) {
      const imageUrls = property.images
        .map(img => {
          // Handle different image object structures
          let rawUrl = null;
          if (typeof img === 'string') rawUrl = img;
          else if (img && typeof img === 'object') {
            rawUrl = img.image_url || img.url || (typeof img.url === 'string' ? img.url : null);
          }
          return fixImageUrl(rawUrl);
        })
        .filter(Boolean);

      if (imageUrls.length > 0) {
        return imageUrls;
      }
    }

    // Fallback to main_image
    if (property?.main_image) {
      let mainImageUrl = typeof property.main_image === 'string'
        ? property.main_image
        : property.main_image.image_url || property.main_image.url;

      mainImageUrl = fixImageUrl(mainImageUrl);
      if (mainImageUrl) {
        return [mainImageUrl];
      }
    }

    // Fallback to main_image_url (from backend)
    if (property?.main_image_url) {
      return [fixImageUrl(property.main_image_url)];
    }

    // Final fallback
    return ['/images/placeholder.svg'];
  }, [property?.images, property?.main_image, property?.main_image_url]);


  const goToPrevious = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={(e) => {
        e.stopPropagation();
        setIsHovered(true);
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        setIsHovered(false);
      }}
      onClick={(e) => {
        // Prevent card click when clicking on slider controls
        if (e.target.closest('button') || e.target.closest('.slider-controls')) {
          e.stopPropagation();
        }
      }}
    >
      <div className="relative w-full h-full">
        {images.map((imgSrc, index) => (
          <img
            key={index}
            src={imgSrc}
            alt={property?.title ? `${property.title} - Image ${index + 1}` : 'Property'}
            className={`absolute top-0 left-0 w-full h-full object-cover rounded-t-lg transition-opacity duration-700 ease-in-out ${
              index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            onError={(e) => {
              e.target.src = '/images/placeholder.svg';
            }}
          />
        ))}
      </div>

      {/* Navigation buttons - only show if more than 1 image */}
      {images.length > 1 && (
        <div className="slider-controls">
          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious(e);
            }}
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 p-2.5 bg-white/95 hover:bg-white rounded-full shadow-lg transition-all duration-200 z-30 flex items-center justify-center opacity-100 pointer-events-auto md:opacity-0 md:pointer-events-none ${isHovered ? 'md:opacity-100 md:pointer-events-auto' : ''
              }`}
            aria-label="Previous image"
            onMouseEnter={(e) => {
              e.stopPropagation();
              setIsHovered(true);
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <FiChevronLeft className="w-5 h-5 text-gray-900" />
          </button>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext(e);
            }}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2.5 bg-white/95 hover:bg-white rounded-full shadow-lg transition-all duration-200 z-30 flex items-center justify-center opacity-100 pointer-events-auto md:opacity-0 md:pointer-events-none ${isHovered ? 'md:opacity-100 md:pointer-events-auto' : ''
              }`}
            aria-label="Next image"
            onMouseEnter={(e) => {
              e.stopPropagation();
              setIsHovered(true);
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <FiChevronRight className="w-5 h-5 text-gray-900" />
          </button>

          {/* Image indicators */}
          <div
            className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1.5 transition-all duration-200 z-30 ${isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            onMouseEnter={(e) => {
              e.stopPropagation();
              setIsHovered(true);
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setIsHovered(true);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className={`rounded-full transition-all duration-200 ${index === currentImageIndex
                  ? 'bg-white w-2 h-2'
                  : 'bg-white/60 w-1.5 h-1.5 hover:bg-white/80'
                  }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>

          {/* Image counter */}
          <div
            className={`absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md transition-all duration-200 z-30 ${isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyImageSlider;

