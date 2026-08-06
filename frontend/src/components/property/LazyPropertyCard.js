import React from 'react';
import { useInView } from 'react-intersection-observer';

const LazyPropertyCard = ({ children, aspectClass = 'aspect-[4/3]', heightClass = 'sm:h-48', viewMode = 'grid' }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '300px 0px', // Preload ahead of scrolling
  });

  return (
    <div ref={ref} className="h-full w-full">
      {inView ? children : (
        viewMode === 'list' ? (
          <div className="flex w-full h-32 animate-pulse bg-white border border-gray-100 rounded-xl p-3">
            <div className="w-1/3 h-full bg-gray-200 rounded-xl"></div>
            <div className="flex-1 ml-4 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col h-full bg-white rounded-xl">
            <div className={`relative rounded-xl overflow-hidden bg-gray-200 animate-pulse ${aspectClass} ${heightClass}`}>
              <div className="w-full h-full bg-gray-200" />
            </div>
            <div className="space-y-2 mt-3 w-full animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default LazyPropertyCard;
