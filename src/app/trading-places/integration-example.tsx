// Example integration of real data APIs into Trading Places page
// This shows how to modify the existing page to use real data

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTradeData } from '../hooks/useTradeData';
import RealDataToggle from '../components/RealDataToggle';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Example of how to modify the existing TradingPlacesPage component
const EnhancedTradingPlacesPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [enableRealData, setEnableRealData] = useLocalStorage('enableRealData', false);
  
  // Use the real data hook
  const {
    data: realTradeData,
    loading,
    error,
    lastUpdated,
    isRealData,
    refreshData,
    toggleRealData
  } = useTradeData({
    countries: ['US', 'CN', 'DE', 'JP', 'GB', 'IN', 'BR', 'KR', 'CA', 'AU', 'MX', 'RU', 'SA'],
    enableRealData,
    refreshInterval: 3600000 // 1 hour
  });

  // Combine real data with mock data fallback
  const tradeData = useMemo(() => {
    if (enableRealData && realTradeData.length > 0) {
      return {
        countries: realTradeData,
        globalStats: {
          // Calculate global stats from real data
          totalWorldTrade: realTradeData.reduce((sum, country) => 
            sum + (country.exports || 0) + (country.imports || 0), 0
          ),
          topTradingNations: realTradeData
            .sort((a, b) => (b.exports || 0) - (a.exports || 0))
            .slice(0, 5)
            .map(country => country.country),
          // ... other calculated stats
        }
      };
    }
    
    // Fallback to mock data (your existing mockTradeData)
    return mockTradeData;
  }, [enableRealData, realTradeData]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="w-full max-w-7xl mx-auto p-4 space-y-8">
        {/* Header with data toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Trading Places</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Global Trade Data & Statistics {isRealData ? '(Live Data)' : '(Demo Data)'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <div className="flex items-center space-x-2">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Light</span>
              <button
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${isDarkMode ? 'translate-x-6' : ''}`} />
              </button>
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Dark</span>
            </div>
          </div>
        </div>

        {/* Real Data Toggle Component */}
        <RealDataToggle
          isRealData={isRealData}
          loading={loading}
          error={error}
          lastUpdated={lastUpdated}
          onToggle={() => setEnableRealData(!enableRealData)}
          onRefresh={refreshData}
          isDarkMode={isDarkMode}
        />

        {/* Rest of your existing Trading Places content */}
        {/* Use `tradeData` instead of `mockTradeData` throughout */}
        
        {/* Example of using the enhanced data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Data Quality
            </h3>
            <p className={`text-2xl font-bold ${
              isRealData 
                ? isDarkMode ? 'text-green-400' : 'text-green-600'
                : isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {isRealData ? 'Live' : 'Demo'}
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {isRealData ? 'World Bank API' : 'Educational Mock'}
            </p>
          </div>
          
          {/* Your existing global stats cards */}
        </div>

        {/* Rest of your existing components */}
      </div>
    </div>
  );
};

export default EnhancedTradingPlacesPage;
