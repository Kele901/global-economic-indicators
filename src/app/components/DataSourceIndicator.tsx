// Component to show data source for individual metrics

'use client';

import React from 'react';
import { Database, Zap, Info } from 'lucide-react';

interface DataSourceIndicatorProps {
  isRealData: boolean;
  metric: string;
  source?: string;
  lastUpdated?: string;
  isDarkMode: boolean;
  size?: 'sm' | 'md';
}

const DataSourceIndicator: React.FC<DataSourceIndicatorProps> = ({
  isRealData,
  metric,
  source,
  lastUpdated,
  isDarkMode,
  size = 'sm'
}) => {
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className={`inline-flex items-center space-x-1 ${textSize} ${
      isDarkMode ? 'text-gray-400' : 'text-gray-500'
    }`}>
      {isRealData ? (
        <>
          <Zap className={`${iconSize} text-green-500`} />
          <span className="text-green-600">Live</span>
        </>
      ) : (
        <>
          <Database className={`${iconSize} text-blue-500`} />
          <span className="text-blue-600">Demo</span>
        </>
      )}
      
      {source && (
        <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          • {source}
        </span>
      )}
      
      {lastUpdated && isRealData && (
        <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          • {new Date(lastUpdated).toLocaleDateString()}
        </span>
      )}
    </div>
  );
};

export default DataSourceIndicator;
