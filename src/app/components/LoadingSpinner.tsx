import React from 'react';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-[400px]">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
  </div>
);

export default LoadingSpinner; 