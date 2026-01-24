'use client';

import { useState, useEffect } from 'react';
import { fetchGlobalData } from '../services/worldbank';
import CountryComparisonDashboard from '../components/CountryComparisonDashboard';
import AdSense from '../components/AdSense';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Static content component that renders immediately (helps with SEO and AdSense compliance)
const StaticIntroContent = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className={`rounded-lg p-4 sm:p-6 mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
    <h2 className="text-lg sm:text-xl font-semibold mb-3">Compare Global Economies</h2>
    <p className="text-sm sm:text-base mb-4">
      Our Country Comparison tool allows you to analyze and compare key economic indicators across 
      30+ major economies worldwide. Using data from the World Bank, IMF, OECD, and other trusted sources, 
      you can explore relationships between different economic metrics and identify global trends.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
        <h3 className="font-medium mb-2">Available Metrics</h3>
        <ul className="text-xs sm:text-sm space-y-1">
          <li>• GDP Growth & Per Capita Income</li>
          <li>• Inflation & Interest Rates</li>
          <li>• Employment & Unemployment</li>
          <li>• Trade Balance & FDI</li>
          <li>• Government Debt & Spending</li>
        </ul>
      </div>
      <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
        <h3 className="font-medium mb-2">Analysis Features</h3>
        <ul className="text-xs sm:text-sm space-y-1">
          <li>• Side-by-side country comparisons</li>
          <li>• Historical trend analysis</li>
          <li>• Multi-metric correlation views</li>
          <li>• Exportable charts and data</li>
          <li>• Real-time data updates</li>
        </ul>
      </div>
    </div>
  </div>
);

export default function ComparePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);

  useEffect(() => {
    // Apply theme changes to DOM
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
    
    // Dispatch event for other components
    window.dispatchEvent(new Event('themeChange'));
  }, [isDarkMode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const globalData = await fetchGlobalData();
        setData(globalData);
      } catch (err) {
        setError('Failed to fetch economic data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Content is ready when not loading and no error
  const contentReady = !loading && !error && data;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
        {/* Header - always visible */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Economic Indicators Comparison</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Compare key economic indicators across multiple countries to analyze trends, patterns, and relationships between different economies.
            </p>
          </div>
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

        {/* Static intro content - always visible, provides content for Google */}
        <StaticIntroContent isDarkMode={isDarkMode} />

        {/* Only show ads when content is ready */}
        <AdSense show={contentReady} />
        
        {/* Loading state */}
        {loading && (
          <LoadingSpinner 
            message="Loading Comparison Data"
            subtitle="Preparing economic indicators for comparison across 30+ countries..."
          />
        )}

        {/* Error state */}
        {error && <ErrorMessage message={error} />}
        
        {/* Main content */}
        {contentReady && <CountryComparisonDashboard data={data} isDarkMode={isDarkMode} />}
        
        {/* Bottom ad - only when content is ready */}
        <AdSense show={contentReady} />

        {/* Additional static content for SEO */}
        <div className={`rounded-lg p-4 sm:p-6 mt-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <h2 className="text-lg font-semibold mb-3">Understanding Economic Comparisons</h2>
          <p className="text-sm mb-3">
            Comparing economic indicators across countries helps identify patterns in global development, 
            understand the impact of different policies, and make informed decisions about investments, 
            trade, and economic policy.
          </p>
          <p className="text-sm">
            Our data is updated regularly from official sources including the World Bank's World Development 
            Indicators, the International Monetary Fund's World Economic Outlook, and the OECD's economic 
            statistics database.
          </p>
        </div>
      </div>
    </div>
  );
} 