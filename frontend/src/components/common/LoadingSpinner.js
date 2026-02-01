import React from 'react';

const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin`}>
        <div className="w-full h-full border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
