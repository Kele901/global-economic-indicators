// Component for toggling between mock and real data

'use client';

import React, { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface RealDataToggleProps {
  isRealData: boolean;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  onToggle: () => void;
  onRefresh: () => void;
  isDarkMode: boolean;
}

const RealDataToggle: React.FC<RealDataToggleProps> = ({
  isRealData,
  loading,
  error,
  lastUpdated,
  onToggle,
  onRefresh,
  isDarkMode
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`p-4 rounded-lg border ${
        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
      }`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  return (
    <div className={`p-4 rounded-lg border ${
      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isRealData 
              ? isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
              : isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
          }`}>
            <Database className={`w-5 h-5 ${
              isRealData 
                ? isDarkMode ? 'text-green-400' : 'text-green-600'
                : isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </div>
          <div>
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Data Source
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {isRealData ? 'Live API Data' : 'Mock Data'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            disabled={loading || !isRealData}
            className={`p-2 rounded-lg transition-colors ${
              loading || !isRealData
                ? isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-100 text-gray-400'
                : isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onToggle}
            disabled={loading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isRealData
                ? isDarkMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                : isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {isRealData ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>Live Data</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Mock Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Information */}
      <div className="space-y-2">
        {loading && (
          <div className={`flex items-center space-x-2 text-sm ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Fetching latest data...</span>
          </div>
        )}

        {error && (
          <div className={`flex items-center space-x-2 text-sm ${
            isDarkMode ? 'text-red-400' : 'text-red-600'
          }`}>
            <WifiOff className="w-4 h-4" />
            <span>Error: {error}</span>
          </div>
        )}

        {lastUpdated && !loading && !error && (
          <div className={`flex items-center space-x-2 text-sm ${
            isDarkMode ? 'text-green-400' : 'text-green-600'
          }`}>
            <Wifi className="w-4 h-4" />
            <span>
              Last updated: {new Date(lastUpdated).toLocaleDateString()} at{' '}
              {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          </div>
        )}

        {isRealData && (
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>Data sources: World Bank, UN Comtrade, OECD</p>
            <p>Updates: Hourly (cached for performance)</p>
            <p>⚠️ UN Comtrade: 100 requests/hour limit</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealDataToggle;
