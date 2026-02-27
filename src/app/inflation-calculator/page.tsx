"use client";
import React, { useState, useEffect } from 'react';
import { fetchGlobalData } from '../services/worldbank';
import { useLocalStorage } from '../hooks/useLocalStorage';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import InflationCalculator from '../components/InflationCalculator';
import { GB, US, CA, FR, DE, IT, JP, AU, MX, KR, ES, SE, CH, TR, NG, CN, RU, BR, CL, AR, IN, NO, NL, PT, BE, ID, ZA, PL, SA, EG } from 'country-flag-icons/react/3x2';

const countryFlags: { [key: string]: React.ComponentType<any> } = {
  UK: GB, USA: US, Canada: CA, France: FR, Germany: DE, Italy: IT, Japan: JP,
  Australia: AU, Mexico: MX, SouthKorea: KR, Spain: ES, Sweden: SE, Switzerland: CH,
  Turkey: TR, Nigeria: NG, China: CN, Russia: RU, Brazil: BR, Chile: CL,
  Argentina: AR, India: IN, Norway: NO, Netherlands: NL, Portugal: PT, Belgium: BE,
  Indonesia: ID, SouthAfrica: ZA, Poland: PL, SaudiArabia: SA, Egypt: EG
};

export default function InflationCalculatorPage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cpiData, setCpiData] = useState<any[]>([]);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showUnderstanding, setShowUnderstanding] = useState(false);
  const [showAccuracy, setShowAccuracy] = useState(false);

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
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchGlobalData();
        setCpiData(data.cpiData);
      } catch (err) {
        console.error('Error loading CPI data:', err);
        setError('Failed to load inflation data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Multi-Country Inflation Calculator
            </h1>
            <div className="flex items-center space-x-2">
              <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Light</span>
              <button
                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full p-1 transition-colors duration-200 ${
                  isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white transform transition-transform ${
                  isDarkMode ? 'translate-x-5 sm:translate-x-6' : ''
                }`} />
              </button>
              <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dark</span>
            </div>
          </div>
          <p className={`text-base sm:text-lg ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            See how the value of money has changed over time across different economies. 
            Understand the impact of inflation on your purchasing power.
          </p>
        </div>

        {/* Static intro content - always visible for SEO */}
        <div className={`rounded-lg p-4 sm:p-6 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
          <h2 className="text-lg sm:text-xl font-semibold mb-3">How the Inflation Calculator Works</h2>
          <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            This calculator shows you the real impact of inflation on purchasing power over time.
            Enter an amount, select a base country and year, and see what that money would be worth
            in a different year &mdash; or compare the same amount across multiple economies. The
            calculations use official consumer price index (CPI) data from the World Bank and
            national statistical agencies to provide accurate historical purchasing power comparisons.
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Select multiple countries to compare how inflation has affected different currencies.
            Use the chart view to visualize purchasing power erosion over your selected time period.
          </p>
        </div>

        {/* Calculator */}
        <InflationCalculator
          cpiData={cpiData}
          isDarkMode={isDarkMode}
          countryFlags={countryFlags}
        />

        {/* Information Sections */}
        <div className="mt-8 space-y-4">
          {/* How the Calculator Works */}
          <div className={`rounded-lg shadow-lg overflow-hidden ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <button
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className={`w-full px-6 py-4 text-left flex justify-between items-center ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
            >
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                How the Inflation Calculator Works
              </h3>
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  showHowItWorks ? 'rotate-180' : ''
                } ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showHowItWorks && (
              <div className={`px-6 py-4 border-t ${
                isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'
              }`}>
                <p className="mb-4">
                  Our inflation calculator works for amounts between 1 and 1 trillion in any supported currency.
                </p>
                <p className="mb-4">
                  For example, imagine you want to know what goods and services costing $23 in 1975 
                  would have cost in 1985:
                </p>
                <div className={`p-4 rounded-lg mb-4 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <p className="mb-2">• The price index for 1975 = 17.78</p>
                  <p className="mb-2">• The price index for 1985 = 44.6</p>
                  <p className="mb-4">
                    The calculator increases the cost in 1975 by the change in prices between 
                    1975 and 1985 with this formula:
                  </p>
                  <div className={`p-3 rounded font-mono text-sm ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    Cost in 1985 = Cost in 1975 × (1985 CPI / 1975 CPI)
                    <br />
                    $57.68 = $23 × (44.6 / 17.78)
                  </div>
                </div>
                <p>
                  So the cost in 1985 of the same goods and services has risen to $57.68.
                </p>
              </div>
            )}
          </div>

          {/* Understanding Your Results */}
          <div className={`rounded-lg shadow-lg overflow-hidden ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <button
              onClick={() => setShowUnderstanding(!showUnderstanding)}
              className={`w-full px-6 py-4 text-left flex justify-between items-center ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
            >
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Understanding Your Results
              </h3>
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  showUnderstanding ? 'rotate-180' : ''
                } ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showUnderstanding && (
              <div className={`px-6 py-4 border-t ${
                isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'
              }`}>
                <p className="mb-4">
                  This calculator shows how the value of money changes. Prices for things we buy 
                  tend to go up over time, which is called inflation.
                </p>
                <p className="mb-4">
                  When prices go up, the same amount of money buys you less stuff. This is a 
                  decrease in 'purchasing power'.
                </p>
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-900'
                  }`}>
                    Average Inflation Rate
                  </h4>
                  <p className="mb-3">
                    The calculator also shows the average yearly inflation rate between two years.
                    For example, if you compare 1975 to 1985, the formula is:
                  </p>
                  <div className={`p-3 rounded font-mono text-sm ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    Average Inflation = (((CPI_end / CPI_start) ^ (1 / years)) - 1) × 100
                  </div>
                </div>
                <div className={`mt-4 p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-red-50'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    isDarkMode ? 'text-red-400' : 'text-red-900'
                  }`}>
                    Deflation
                  </h4>
                  <p>
                    If prices fell between the two years you selected, average inflation will be 
                    negative. This is called deflation. For example, prices fell in almost every 
                    year between 1920 and 1933, resulting in negative inflation.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Data Accuracy */}
          <div className={`rounded-lg shadow-lg overflow-hidden ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <button
              onClick={() => setShowAccuracy(!showAccuracy)}
              className={`w-full px-6 py-4 text-left flex justify-between items-center ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
            >
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Data Accuracy and Sources
              </h3>
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  showAccuracy ? 'rotate-180' : ''
                } ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showAccuracy && (
              <div className={`px-6 py-4 border-t ${
                isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'
              }`}>
                <p className="mb-4">
                  Our inflation calculator is designed for illustrative and general reference 
                  purposes only. The calculations are approximate and provide a rough guide to 
                  the buying power of currency for goods and services.
                </p>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Data Sources:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>World Bank Consumer Price Index (CPI) data (base year 2010 = 100)</li>
                    <li>Federal Reserve Economic Data (FRED) for USA-specific data</li>
                    <li>Coverage period: 1960-2024 (varies by country)</li>
                  </ul>
                </div>
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-yellow-50'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    isDarkMode ? 'text-yellow-400' : 'text-yellow-900'
                  }`}>
                    Important Notes:
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      • Over long periods, the definitions of goods and services in the price 
                      index have changed significantly.
                    </li>
                    <li>
                      • A family's consumption today is very different from that of a typical 
                      family decades ago.
                    </li>
                    <li>
                      • Changes in household spending reflect higher incomes and a wider range 
                      of available goods and services.
                    </li>
                    <li>
                      • Comparisons over longer periods and further back in time are generally 
                      less accurate than comparisons over shorter recent periods.
                    </li>
                    <li>
                      • Data availability varies significantly by country - some countries have 
                      complete data from 1960, while others have limited historical coverage.
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className={`mt-8 p-4 rounded-lg border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 text-gray-400' 
            : 'bg-gray-50 border-gray-200 text-gray-600'
        }`}>
          <p className="text-sm">
            This inflation calculator uses Consumer Price Index (CPI) data to measure price 
            changes over time. The CPI measures the average change in prices paid by consumers 
            for a market basket of goods and services. Data coverage and accuracy varies by 
            country and time period.
          </p>
        </div>
      </div>
    </div>
  );
}

