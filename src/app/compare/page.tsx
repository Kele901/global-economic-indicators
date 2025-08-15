'use client';

import { useState, useEffect } from 'react';
import { fetchGlobalData } from '../services/worldbank';
import CountryComparisonDashboard from '../components/CountryComparisonDashboard';
import AdSense from '../components/AdSense';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function ComparePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);

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

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="w-full max-w-7xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Country Comparison</h1>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="w-full max-w-7xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Country Comparison</h1>
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="w-full max-w-7xl mx-auto p-4 space-y-8">
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

        <AdSense />
        
        {data && <CountryComparisonDashboard data={data} isDarkMode={isDarkMode} />}
        
        <AdSense />
      </div>
    </div>
  );
} 