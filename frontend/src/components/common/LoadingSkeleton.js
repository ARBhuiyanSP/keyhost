import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const LoadingSkeleton = ({ 
  type = 'default', 
  count = 1, 
  height = 20, 
  width = '100%',
  className = '' 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
            <Skeleton height={200} className="mb-4" />
            <Skeleton height={24} width="80%" className="mb-2" />
            <Skeleton height={16} width="60%" className="mb-4" />
            <div className="flex justify-between items-center">
              <Skeleton height={20} width="40%" />
              <Skeleton height={32} width="30%" />
            </div>
          </div>
        );

      case 'property-card':
        return (
          <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
            <Skeleton height={200} />
            <div className="p-4">
              <Skeleton height={20} width="80%" className="mb-2" />
              <Skeleton height={16} width="60%" className="mb-2" />
              <div className="flex justify-between items-center">
                <Skeleton height={16} width="40%" />
                <Skeleton height={16} width="30%" />
              </div>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
            <div className="p-6">
              {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                  <Skeleton height={40} width={40} circle />
                  <div className="flex-1">
                    <Skeleton height={16} width="60%" className="mb-2" />
                    <Skeleton height={14} width="40%" />
                  </div>
                  <Skeleton height={20} width="20%" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'list':
        return (
          <div className={className}>
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                <Skeleton height={48} width={48} />
                <div className="flex-1">
                  <Skeleton height={16} width="70%" className="mb-2" />
                  <Skeleton height={14} width="50%" />
                </div>
                <Skeleton height={20} width="25%" />
              </div>
            ))}
          </div>
        );

      case 'dashboard-stats':
        return (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Skeleton height={48} width={48} className="mr-4" />
                  <div>
                    <Skeleton height={14} width="60%" className="mb-2" />
                    <Skeleton height={24} width="40%" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Skeleton height={16} width="20%" />
                  <Skeleton height={14} width="40%" className="ml-2" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'form':
        return (
          <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="mb-6">
                <Skeleton height={16} width="30%" className="mb-2" />
                <Skeleton height={40} />
              </div>
            ))}
            <div className="flex space-x-4">
              <Skeleton height={40} width="100px" />
              <Skeleton height={40} width="100px" />
            </div>
          </div>
        );

      default:
        return (
          <Skeleton 
            count={count} 
            height={height} 
            width={width} 
            className={className}
          />
        );
    }
  };

  return (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      {renderSkeleton()}
    </SkeletonTheme>
  );
};

export default LoadingSkeleton;
