import React from 'react';

interface LoadingSpinnerProps {
  /** Optional message to display while loading */
  message?: string;
  /** Optional subtitle with additional context */
  subtitle?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading Economic Data',
  subtitle = 'Fetching the latest indicators from World Bank, IMF, OECD, and other trusted sources...'
}) => (
  <div className="flex flex-col justify-center items-center h-[400px] px-4">
    <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-b-2 border-blue-500 mb-6"></div>
    <h2 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">
      {message}
    </h2>
    <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
      {subtitle}
    </p>
    <div className="mt-6 text-xs text-gray-400 dark:text-gray-500 text-center max-w-sm">
      <p>Our data is sourced from official international databases including:</p>
      <p className="mt-1 font-medium">World Bank • IMF • OECD • FRED • BIS</p>
    </div>
  </div>
);

export default LoadingSpinner; 