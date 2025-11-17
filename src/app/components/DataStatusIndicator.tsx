'use client';

import React from 'react';
import { getCacheAge, clearDataCache } from '../services/worldbank';

interface DataStatusIndicatorProps {
  isDarkMode: boolean;
  onRefresh?: () => void;
}

const DataStatusIndicator: React.FC<DataStatusIndicatorProps> = ({ isDarkMode, onRefresh }) => {
  const [cacheInfo, setCacheInfo] = React.useState<{ age: number | null; formatted: string }>({ age: null, formatted: 'No cached data' });
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    updateCacheInfo();
    const interval = setInterval(updateCacheInfo, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const updateCacheInfo = () => {
    const info = getCacheAge();
    setCacheInfo(info);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    clearDataCache();
    
    if (onRefresh) {
      await onRefresh();
    }
    
    setTimeout(() => {
      setIsRefreshing(false);
      updateCacheInfo();
    }, 1000);
  };

  const getStatusColor = () => {
    if (!cacheInfo.age) return isDarkMode ? 'text-gray-400' : 'text-gray-500';
    
    const hours = cacheInfo.age / (1000 * 60 * 60);
    if (hours < 1) return isDarkMode ? 'text-green-400' : 'text-green-600';
    if (hours < 12) return isDarkMode ? 'text-blue-400' : 'text-blue-600';
    return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
  };

  const getStatusText = () => {
    if (!cacheInfo.age) return 'Loading fresh data...';
    
    const hours = cacheInfo.age / (1000 * 60 * 60);
    if (hours < 1) return `Fresh data (${cacheInfo.formatted})`;
    if (hours < 12) return `Recent data (${cacheInfo.formatted})`;
    return `Cached data (${cacheInfo.formatted})`;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-600' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center gap-2 flex-1">
        <div className={`w-2 h-2 rounded-full ${
          !cacheInfo.age ? 'animate-pulse bg-blue-500' : 'bg-current'
        } ${getStatusColor()}`} />
        <span className={`text-xs sm:text-sm ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`text-xs sm:text-sm px-3 py-1 rounded-md transition-colors ${
          isDarkMode
            ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600'
            : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300'
        } disabled:cursor-not-allowed flex items-center gap-2`}
        title="Clear cache and reload data from World Bank API"
      >
        {isRefreshing ? (
          <>
            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Refreshing...
          </>
        ) : (
          <>
            <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </>
        )}
      </button>
    </div>
  );
};

export default DataStatusIndicator;

