import React from 'react';

const Loader = ({ size = 'lg', className = '' }) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const circleSize = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <div 
          className={`${circleSize[size]} absolute top-0 left-0 rounded-full bg-agardex-blue animate-blob-circle`}
        />
        
        <div 
          className={`${circleSize[size]} absolute top-0 left-0 rounded-full bg-agardex-teal animate-blob-circle-reverse`}
        />
      </div>
    </div>
  );
};

export default Loader;