'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AdSense from '../components/AdSense';
import { calculateCurrencyPairs } from '../services/forex';
import { useLocalStorage } from '../hooks/useLocalStorage';
import InfoPanel from '../components/InfoPanel';
import { economicMetrics } from '../data/economicMetrics';

// Dynamically import new components to avoid SSR issues with charts
const HistoricalRateChart = dynamic(() => import('../components/HistoricalRateChart'), { ssr: false });
const CurrencyStrengthIndex = dynamic(() => import('../components/CurrencyStrengthIndex'), { ssr: false });
const CentralBankRatesPanel = dynamic(() => import('../components/CentralBankRatesPanel'), { ssr: false });
const CurrencyCorrelationMatrix = dynamic(() => import('../components/CurrencyCorrelationMatrix'), { ssr: false });
const ReserveCurrencyChart = dynamic(() => import('../components/ReserveCurrencyChart'), { ssr: false });
const SafeHavenIndicator = dynamic(() => import('../components/SafeHavenIndicator'), { ssr: false });
const REERDisplay = dynamic(() => import('../components/REERDisplay'), { ssr: false });
const EconomicCalendar = dynamic(() => import('../components/EconomicCalendar'), { ssr: false });
const CurrencyRegimeInfo = dynamic(() => import('../components/CurrencyRegimeInfo'), { ssr: false });

// Tab configuration
type TabId = 'hierarchy' | 'history' | 'strength' | 'central-banks' | 'correlation' | 'reserves' | 'safe-haven' | 'valuation' | 'calendar' | 'regimes';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

interface CurrencyInfo {
  code: string;
  name: string;
  description: string;
  tier: number;
  exchangeRates?: {
    [key: string]: number;
  };
}

const currencyData: { [key: string]: CurrencyInfo } = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    description: 'Global reserve currency, dominates international trade and foreign exchange reserves.',
    tier: 1
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    description: 'Second most traded currency, official currency of the Eurozone.',
    tier: 2
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    description: 'Major Asian currency, known for its role in carry trades.',
    tier: 2
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    description: 'Oldest currency still in use, major reserve currency.',
    tier: 2
  },
  CNH: {
    code: 'CNH',
    name: 'Offshore Chinese Yuan',
    description: 'Offshore trading version of the Chinese Yuan, increasingly important in global trade.',
    tier: 2
  },
  CHF: {
    code: 'CHF',
    name: 'Swiss Franc',
    description: 'Traditional safe-haven currency, known for stability.',
    tier: 2
  },
  CNY: {
    code: 'CNY',
    name: 'Chinese Yuan',
    description: 'Growing international currency, backed by world\'s second-largest economy.',
    tier: 3
  },
  HKD: {
    code: 'HKD',
    name: 'Hong Kong Dollar',
    description: 'Major Asian financial center currency, pegged to USD.',
    tier: 3
  },
  SEK: {
    code: 'SEK',
    name: 'Swedish Krona',
    description: 'Important Scandinavian currency, highly traded in Europe.',
    tier: 3
  },
  NOK: {
    code: 'NOK',
    name: 'Norwegian Krone',
    description: 'Major oil currency, closely tied to petroleum exports.',
    tier: 3
  },
  NZD: {
    code: 'NZD',
    name: 'New Zealand Dollar',
    description: 'Major commodity currency, known as the Kiwi dollar.',
    tier: 3
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    description: 'Commodity currency, closely tied to natural resources.',
    tier: 3
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    description: 'Major commodity currency, highly traded in Asian markets.',
    tier: 3
  },
  SGD: {
    code: 'SGD',
    name: 'Singapore Dollar',
    description: 'Major Asian financial hub currency, known for stability.',
    tier: 3
  },
  MXN: {
    code: 'MXN',
    name: 'Mexican Peso',
    description: 'Most traded currency in Latin America.',
    tier: 4
  },
  BRL: {
    code: 'BRL',
    name: 'Brazilian Real',
    description: 'Major South American currency.',
    tier: 4
  },
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    description: 'Currency of one of the world\'s largest economies.',
    tier: 4
  },
  ZAR: {
    code: 'ZAR',
    name: 'South African Rand',
    description: 'Most traded African currency.',
    tier: 4
  },
  RUB: {
    code: 'RUB',
    name: 'Russian Ruble',
    description: 'Major commodity currency.',
    tier: 4
  },
  TRY: {
    code: 'TRY',
    name: 'Turkish Lira',
    description: 'Important regional currency in the Middle East.',
    tier: 4
  }
};

const navigationTabs: Tab[] = [
  { id: 'hierarchy', label: 'Currency Hierarchy', icon: '🏦' },
  { id: 'history', label: 'Historical Rates', icon: '📈' },
  { id: 'strength', label: 'Strength Index', icon: '💪' },
  { id: 'central-banks', label: 'Central Banks', icon: '🏛️' },
  { id: 'correlation', label: 'Correlation', icon: '🔗' },
  { id: 'reserves', label: 'Reserve Status', icon: '🌐' },
  { id: 'safe-haven', label: 'Safe Haven', icon: '🛡️' },
  { id: 'valuation', label: 'Valuation (REER)', icon: '⚖️' },
  { id: 'calendar', label: 'Economic Calendar', icon: '📅' },
  { id: 'regimes', label: 'Regimes', icon: '🔄' },
];

const CurrencyHierarchyPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>('hierarchy');
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [hoveredCurrency, setHoveredCurrency] = useState<string | null>(null);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: { [key: string]: number } }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(5 * 60 * 1000); // 5 minutes default
  const [converterAmount, setConverterAmount] = useState<string>('100');
  const [converterFromCurrency, setConverterFromCurrency] = useState<string>('USD');
  const [converterResults, setConverterResults] = useState<{ [key: string]: number }>({});

  // Define Tier 4 currencies for tooltip positioning
  const tier4Currencies = ['MXN', 'BRL', 'INR', 'ZAR', 'RUB', 'TRY'];

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
    const fetchRates = async () => {
      setLoading(true);
      setError(null);
      try {
        const currencies = Object.keys(currencyData);
        const rates: { [key: string]: { [key: string]: number } } = {};

        // Fetch rates for each currency
        for (const currency of currencies) {
          const pairs = await calculateCurrencyPairs(
            currency,
            currencies.filter(c => c !== currency)
          );
          rates[currency] = {};
          pairs.forEach(pair => {
            rates[currency][pair.to] = pair.rate;
          });
        }

        setExchangeRates(rates);
        setLastUpdated(new Date().toISOString());
      } catch (err) {
        setError('Failed to fetch exchange rates');
        console.error('Error fetching rates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    // Refresh rates every 5 minutes
    const interval = setInterval(fetchRates, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Calculate converter results when exchange rates or converter inputs change
  useEffect(() => {
    if (exchangeRates[converterFromCurrency] && converterAmount) {
      const amount = parseFloat(converterAmount);
      if (!isNaN(amount) && amount > 0) {
        const results: { [key: string]: number } = {};
        const currencies = Object.keys(currencyData);
        
        currencies.forEach(currency => {
          if (currency !== converterFromCurrency) {
            const rate = exchangeRates[converterFromCurrency]?.[currency];
            if (rate) {
              results[currency] = amount * rate;
            }
          }
        });
        
        setConverterResults(results);
      }
    }
  }, [exchangeRates, converterFromCurrency, converterAmount]);

  const handleCurrencyClick = (currency: string) => {
    setSelectedCurrency(selectedCurrency === currency ? null : currency);
  };

  const handleManualRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const currencies = Object.keys(currencyData);
      const rates: { [key: string]: { [key: string]: number } } = {};

      // Fetch rates for each currency
      for (const currency of currencies) {
        const pairs = await calculateCurrencyPairs(
          currency,
          currencies.filter(c => c !== currency)
        );
        rates[currency] = {};
        pairs.forEach(pair => {
          rates[currency][pair.to] = pair.rate;
        });
      }

      setExchangeRates(rates);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError('Failed to fetch exchange rates');
      console.error('Error fetching rates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
  };

  const handleConverterCurrencyChange = (currency: string) => {
    setConverterFromCurrency(currency);
    setSelectedCurrency(currency);
  };

  const handleConverterAmountChange = (amount: string) => {
    setConverterAmount(amount);
  };

  const handleCurrencyHover = (
    event: React.MouseEvent<SVGElement>,
    currency: string | null
  ) => {
    if (currency) {
      const rect = event.currentTarget.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate base position
      let x = rect.left + rect.width / 2;
      let y = rect.top + scrollTop;
      
      // Aggressive handling for right-side currencies (like TRY at x=900)
      if (x > viewportWidth * 0.5) {
        // For currencies on the right half, position tooltip to the left with more offset
        x = x - 300;
      }
      
      // Extra aggressive handling for currencies at the very right edge
      if (x > viewportWidth * 0.7) {
        // For currencies very close to the right edge, position tooltip much further left
        x = x - 400;
      }
      
      // Super aggressive for extreme right edge currencies
      if (x > viewportWidth * 0.8) {
        // For currencies at the extreme right edge, force tooltip to left side
        x = 200;
      }
      
      // Specific positioning for known right-edge currencies
      if (currency === 'TRY' || currency === 'RUB' || currency === 'AUD') {
        // Force these currencies to have tooltips on the left side of the screen
        x = Math.min(250, viewportWidth * 0.3);
      }
      
      // Adjust horizontal position to keep tooltip within viewport
      if (x < 120) {
        x = 120; // Keep tooltip away from left edge
      } else if (x > viewportWidth - 120) {
        x = viewportWidth - 120; // Keep tooltip away from right edge
      }
      
      // Final fallback: if tooltip would still be off-screen, force it to center
      if (x < 100 || x > viewportWidth - 100) {
        x = viewportWidth / 2; // Center the tooltip as a last resort
      }
      
      // Ultimate safety override for right-edge currencies
      if (currency === 'TRY' || currency === 'RUB' || currency === 'AUD') {
        // These currencies ALWAYS get tooltips in the left third of the screen
        x = Math.max(150, Math.min(300, viewportWidth * 0.25));
        console.log(`${currency} Ultimate Safety Override:`, { x, viewportWidth });
      }
      
      // Special positioning for Tier 4 currencies - keep them closer to their actual positions
      if (tier4Currencies.includes(currency)) {
        // For Tier 4 currencies, use a more moderate leftward shift to keep them closer
        const originalX = rect.left + rect.width / 2;
        if (originalX > viewportWidth * 0.7) {
          // Only shift significantly if they're very close to the right edge
          x = originalX - 200;
        } else if (originalX > viewportWidth * 0.6) {
          // Moderate shift for currencies in the right third
          x = originalX - 150;
        } else {
          // Keep close to original position for currencies in the left/middle
          x = originalX - 50;
        }
        
        // Ensure the tooltip stays within viewport bounds
        if (x < 120) {
          x = 120;
        } else if (x > viewportWidth - 120) {
          x = viewportWidth - 120;
        }
      }
      
      // Special vertical positioning for TRY
      if (currency === 'TRY') {
        // Position TRY tooltip higher on the screen
        y = Math.max(100, y - 100);
      }
      
      // Special vertical positioning for all Tier 4 currencies
      if (tier4Currencies.includes(currency)) {
        // Position all Tier 4 currency tooltips higher on the screen
        y = Math.max(100, y - 80);
      }
      
      // Debug logging for TRY positioning
      if (currency === 'TRY') {
        console.log('TRY Tooltip Positioning:', {
          originalX: rect.left + rect.width / 2,
          adjustedX: x,
          originalY: rect.top + scrollTop,
          adjustedY: y,
          viewportWidth,
          rect: { left: rect.left, right: rect.right, width: rect.width },
          finalX: x,
          currency: currency
        });
      }
      
      // Debug logging for all right-edge currencies
      if (x > viewportWidth * 0.6) {
        console.log(`${currency} Tooltip (Right Edge):`, {
          originalX: rect.left + rect.width / 2,
          adjustedX: x,
          viewportWidth,
          finalX: x
        });
      }
      
      // Adjust vertical position to keep tooltip within viewport
      if (y < 100) {
        y = rect.bottom + scrollTop + 20; // Show tooltip below if too close to top
      } else if (y > viewportHeight - 100) {
        y = rect.top + scrollTop - 20; // Show tooltip above if too close to bottom
      }
      
      setTooltipPosition({ x, y });
    }
    setHoveredCurrency(currency);
  };

  const getCurrencyStyle = (currency: string) => {
    const isSelected = selectedCurrency === currency;
    const isHovered = hoveredCurrency === currency;
    
    return {
      transform: isSelected ? 'scale(1.2)' : 'scale(1)',
      filter: isSelected || isHovered ? 'brightness(1.2)' : 'none',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    };
  };

  const formatRate = (rate: number | undefined) => {
    if (typeof rate !== 'number' || isNaN(rate)) {
      return 'N/A';
    }
    try {
      return rate.toFixed(4);
    } catch (error) {
      console.error('Error formatting rate:', error);
      return 'N/A';
    }
  };

  const formatLastUpdated = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      
      if (diffMins < 1) {
        return `${diffSecs} seconds ago`;
      } else if (diffMins < 60) {
        return `${diffMins} minutes ago`;
      } else {
        return date.toLocaleTimeString();
      }
    } catch (error) {
      return 'Unknown';
    }
  };

  const formatConvertedAmount = (amount: number, currency: string): string => {
    if (isNaN(amount) || amount <= 0) return '0.00';
    
    // Format based on currency type
    if (currency === 'JPY' || currency === 'KRW' || currency === 'INR') {
      // For currencies with low unit values, show 2 decimal places
      return amount.toFixed(2);
    } else if (currency === 'BTC' || currency === 'ETH') {
      // For cryptocurrencies, show 6 decimal places
      return amount.toFixed(6);
    } else {
      // For most currencies, show 2 decimal places
      return amount.toFixed(2);
    }
  };

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Global Currency Hierarchy</h1>
        <div className="flex items-center space-x-4">
          {/* Live Exchange Rate Controls - only show on hierarchy tab */}
          {activeTab === 'hierarchy' && (
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Refresh:
              </span>
              <select
                value={refreshInterval / 1000 / 60}
                onChange={(e) => handleRefreshIntervalChange(parseInt(e.target.value) * 60 * 1000)}
                className={`px-2 py-1 rounded border text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
              >
                <option value={1}>1 min</option>
                <option value={5}>5 min</option>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
              </select>
              <button
                onClick={handleManualRefresh}
                disabled={loading}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {loading ? 'Refreshing...' : 'Refresh Now'}
              </button>
            </div>
          )}
          
          {/* Last Updated Indicator - only show on hierarchy tab */}
          {activeTab === 'hierarchy' && lastUpdated && (
            <div className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
              Live: {formatLastUpdated(lastUpdated)}
            </div>
          )}
          
          {/* Theme Toggle */}
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

      {/* Tab Navigation */}
      <div className={`flex flex-wrap gap-2 mb-6 p-1 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {navigationTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? isDarkMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500 text-white'
                : isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
      
      {/* Loading and Error States - only show on hierarchy tab */}
      {activeTab === 'hierarchy' && loading && (
        <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-800'}`}>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            <span>Fetching live exchange rates...</span>
          </div>
        </div>
      )}
      {activeTab === 'hierarchy' && error && (
        <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-800'}`}>
          <div className="flex items-center space-x-2">
            <span>⚠️ {error}</span>
            <button
              onClick={handleManualRefresh}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-red-700 hover:bg-red-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Render tab content based on active tab */}
      {activeTab === 'history' && <HistoricalRateChart isDarkMode={isDarkMode} />}
      {activeTab === 'strength' && <CurrencyStrengthIndex isDarkMode={isDarkMode} />}
      {activeTab === 'central-banks' && <CentralBankRatesPanel isDarkMode={isDarkMode} />}
      {activeTab === 'correlation' && <CurrencyCorrelationMatrix isDarkMode={isDarkMode} />}
      {activeTab === 'reserves' && <ReserveCurrencyChart isDarkMode={isDarkMode} />}
      {activeTab === 'safe-haven' && <SafeHavenIndicator isDarkMode={isDarkMode} />}
      {activeTab === 'valuation' && <REERDisplay isDarkMode={isDarkMode} />}
      {activeTab === 'calendar' && <EconomicCalendar isDarkMode={isDarkMode} />}
      {activeTab === 'regimes' && <CurrencyRegimeInfo isDarkMode={isDarkMode} />}

      {/* Hierarchy Tab Content */}
      {activeTab === 'hierarchy' && (
        <>
          {/* Existing hierarchy content */}
      
      <div className={`w-full overflow-x-auto relative rounded-lg shadow-lg p-4 transition-colors duration-200 ${
        isDarkMode 
          ? 'bg-gray-900 border border-gray-700' 
          : 'bg-white border border-gray-200'
      }`}>
        
        {/* Info Panel for Currency Hierarchy */}
        <InfoPanel
          metric={economicMetrics.currencyStrength}
          isDarkMode={isDarkMode}
          position="top-right"
          size="medium"
        />
        {/* Tooltip with Exchange Rate */}
        {hoveredCurrency && currencyData[hoveredCurrency] && (
          <div
            className="absolute z-50 bg-black bg-opacity-95 text-white p-3 rounded-lg pointer-events-none shadow-xl transition-all duration-200 ease-out animate-in fade-in-0 zoom-in-95"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y - (hoveredCurrency === 'TRY' ? 60 : tier4Currencies.includes(hoveredCurrency) ? 50 : 35)}px`,
              transform: 'translateX(-50%)',
              minWidth: '200px',
              maxWidth: '250px'
            }}
          >
            <div className="font-semibold text-sm mb-1">{currencyData[hoveredCurrency].name}</div>
            <div className="text-xs text-gray-300 mb-2">Tier {currencyData[hoveredCurrency].tier}</div>
            {selectedCurrency && exchangeRates[selectedCurrency]?.[hoveredCurrency] && (
              <div className="text-sm">
                <div className="font-medium text-green-400">
                  1 {selectedCurrency} = {formatRate(exchangeRates[selectedCurrency]?.[hoveredCurrency])} {hoveredCurrency}
                </div>
                {lastUpdated && (
                  <div className="text-xs text-gray-400 mt-1">
                    Updated: {formatLastUpdated(lastUpdated)}
                  </div>
                )}
              </div>
            )}
            
            {/* Quick Converter in Tooltip */}
            {converterAmount && converterFromCurrency && converterFromCurrency !== hoveredCurrency && (
              <div className="mt-2 pt-2 border-t border-gray-600">
                <div className="text-xs text-gray-300 mb-1">Quick Convert:</div>
                <div className="text-sm text-blue-300">
                  {converterAmount} {converterFromCurrency} = {
                    formatConvertedAmount(
                      parseFloat(converterAmount) * (exchangeRates[converterFromCurrency]?.[hoveredCurrency] || 0),
                      hoveredCurrency
                    )
                  } {hoveredCurrency}
                </div>
              </div>
            )}
          </div>
        )}

        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 900" 
          className="w-full h-auto min-h-[600px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Gradient Definitions */}
          <defs>
            {/* Background gradient */}
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#121438" />
              <stop offset="100%" stopColor="#1e1f45" />
            </linearGradient>
            
            {/* Node gradients */}
            <radialGradient id="tier1Gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#4fc3f7" />
              <stop offset="100%" stopColor="#2196f3" />
            </radialGradient>
            
            <radialGradient id="tier2Gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#ffb74d" />
              <stop offset="100%" stopColor="#ff9800" />
            </radialGradient>
            
            <radialGradient id="tier3Gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#81c784" />
              <stop offset="100%" stopColor="#4caf50" />
            </radialGradient>
            
            <radialGradient id="tier4Gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#e57373" />
              <stop offset="100%" stopColor="#f44336" />
            </radialGradient>
            
            {/* Glow filters */}
            <filter id="glow1" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
            
            <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
            
            {/* Connection gradient */}
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isDarkMode ? "#ffffff" : "#000000"} stopOpacity="0.1"/>
              <stop offset="50%" stopColor={isDarkMode ? "#ffffff" : "#000000"} stopOpacity="0.7"/>
              <stop offset="100%" stopColor={isDarkMode ? "#ffffff" : "#000000"} stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          
          {/* Background */}
          <rect 
            width="1200" 
            height="900" 
            fill={isDarkMode ? "rgb(17, 24, 39)" : "#f8fafc"}
            stroke={isDarkMode ? "rgb(55, 65, 81)" : "rgb(229, 231, 235)"}
            strokeWidth="2"
            rx="8"
            ry="8"
          />
          
          {/* Inner border for better definition in dark mode */}
          <rect 
            x="4" 
            y="4" 
            width="1192" 
            height="892" 
            fill="none"
            stroke={isDarkMode ? "rgba(75, 85, 99, 0.4)" : "rgba(0, 0, 0, 0.1)"}
            strokeWidth="1"
            rx="6"
            ry="6"
          />
          
          {/* Grid lines */}
          <g stroke={isDarkMode ? "rgba(75, 85, 99, 0.3)" : "rgba(0, 0, 0, 0.05)"} strokeWidth="1">
            {/* Horizontal lines */}
            <line x1="0" y1="225" x2="1200" y2="225"/>
            <line x1="0" y1="375" x2="1200" y2="375"/>
            <line x1="0" y1="525" x2="1200" y2="525"/>
            <line x1="0" y1="675" x2="1200" y2="675"/>
            
            {/* Vertical lines */}
            <line x1="300" y1="150" x2="300" y2="750"/>
            <line x1="600" y1="150" x2="600" y2="750"/>
            <line x1="900" y1="150" x2="900" y2="750"/>
          </g>
          
          {/* Title */}
          <text 
            x="600" 
            y="90" 
            textAnchor="middle" 
            fontFamily="'Helvetica Neue', Arial, sans-serif" 
            fontSize="42" 
            fontWeight="bold" 
            fill={isDarkMode ? "#ffffff" : "#000000"} 
            opacity="0.9"
          >
            GLOBAL CURRENCY HIERARCHY
          </text>
          <line 
            x1="375" 
            y1="105" 
            x2="825" 
            y2="105" 
            stroke={isDarkMode ? "#ffffff" : "#000000"} 
            strokeOpacity="0.3" 
            strokeWidth="1"
          />
          
          {/* Legend - moved to the right */}
          <g transform="translate(930, 150)">
            <rect 
              x="-10" 
              y="-10" 
              width="250" 
              height="210" 
              rx="10" 
              ry="10" 
              fill={isDarkMode ? "rgb(31, 41, 55)" : "#000000"} 
              fillOpacity={isDarkMode ? "1" : "0.05"}
              stroke={isDarkMode ? "rgb(75, 85, 99)" : "rgba(0, 0, 0, 0.1)"}
              strokeWidth="1"
            />
            <text 
              x="0" 
              y="10" 
              fontFamily="'Helvetica Neue', Arial, sans-serif" 
              fontSize="20" 
              fontWeight="bold" 
              fill={isDarkMode ? "#ffffff" : "#000000"} 
              opacity="0.9"
            >
              CURRENCY TIERS
            </text>
            
            {/* Update legend items with larger text and spacing */}
            <circle cx="15" cy="50" r="12" fill="url(#tier1Gradient)" filter="url(#glow1)"/>
            <text 
              x="40" 
              y="55" 
              fontFamily="'Helvetica Neue', Arial, sans-serif" 
              fontSize="16" 
              fill={isDarkMode ? "#ffffff" : "#000000"} 
              opacity="0.8"
            >
              Tier 1: Global Reserve
            </text>
            
            <circle cx="15" cy="90" r="12" fill="url(#tier2Gradient)" filter="url(#glow2)"/>
            <text 
              x="40" 
              y="95" 
              fontFamily="'Helvetica Neue', Arial, sans-serif" 
              fontSize="16" 
              fill={isDarkMode ? "#ffffff" : "#000000"} 
              opacity="0.8"
            >
              Tier 2: Major
            </text>
            
            <circle cx="15" cy="130" r="12" fill="url(#tier3Gradient)" filter="url(#glow2)"/>
            <text 
              x="40" 
              y="135" 
              fontFamily="'Helvetica Neue', Arial, sans-serif" 
              fontSize="16" 
              fill={isDarkMode ? "#ffffff" : "#000000"} 
              opacity="0.8"
            >
              Tier 3: Regional
            </text>
            
            <circle cx="15" cy="170" r="12" fill="url(#tier4Gradient)" filter="url(#glow2)"/>
            <text 
              x="40" 
              y="175" 
              fontFamily="'Helvetica Neue', Arial, sans-serif" 
              fontSize="16" 
              fill={isDarkMode ? "#ffffff" : "#000000"} 
              opacity="0.8"
            >
              Tier 4: Local
            </text>
          </g>

          {/* Update currency positions for larger SVG */}
          {/* USD */}
          <g
            style={getCurrencyStyle('USD')}
            onClick={() => handleCurrencyClick('USD')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'USD')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="600" cy="225" r="45" fill="url(#tier1Gradient)" filter="url(#glow1)"/>
            <text x="600" y="235" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="24" fontWeight="bold" fill="#ffffff">USD</text>
          </g>

          {/* Update Tier 2 currencies */}
          {/* EUR */}
          <g
            style={getCurrencyStyle('EUR')}
            onClick={() => handleCurrencyClick('EUR')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'EUR')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="200" cy="375" r="36" fill="url(#tier2Gradient)" filter="url(#glow2)"/>
            <text x="200" y="385" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#ffffff">EUR</text>
          </g>

          {/* JPY */}
          <g
            style={getCurrencyStyle('JPY')}
            onClick={() => handleCurrencyClick('JPY')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'JPY')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="400" cy="375" r="36" fill="url(#tier2Gradient)" filter="url(#glow2)"/>
            <text x="400" y="385" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#ffffff">JPY</text>
          </g>

          {/* GBP */}
          <g
            style={getCurrencyStyle('GBP')}
            onClick={() => handleCurrencyClick('GBP')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'GBP')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="600" cy="375" r="36" fill="url(#tier2Gradient)" filter="url(#glow2)"/>
            <text x="600" y="385" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#ffffff">GBP</text>
          </g>

          {/* CNH */}
          <g
            style={getCurrencyStyle('CNH')}
            onClick={() => handleCurrencyClick('CNH')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'CNH')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="800" cy="375" r="36" fill="url(#tier2Gradient)" filter="url(#glow2)"/>
            <text x="800" y="385" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#ffffff">CNH</text>
          </g>

          {/* CHF */}
          <g
            style={getCurrencyStyle('CHF')}
            onClick={() => handleCurrencyClick('CHF')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'CHF')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="1000" cy="375" r="36" fill="url(#tier2Gradient)" filter="url(#glow2)"/>
            <text x="1000" y="385" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#ffffff">CHF</text>
          </g>

          {/* Update Tier 3 currencies with new positions */}
          {/* CNY */}
          <g
            style={getCurrencyStyle('CNY')}
            onClick={() => handleCurrencyClick('CNY')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'CNY')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="150" cy="525" r="27" fill="url(#tier3Gradient)" filter="url(#glow2)"/>
            <text x="150" y="535" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#ffffff">CNY</text>
          </g>

          {/* HKD */}
          <g
            style={getCurrencyStyle('HKD')}
            onClick={() => handleCurrencyClick('HKD')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'HKD')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="300" cy="525" r="27" fill="url(#tier3Gradient)" filter="url(#glow2)"/>
            <text x="300" y="535" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#ffffff">HKD</text>
          </g>

          {/* SEK */}
          <g
            style={getCurrencyStyle('SEK')}
            onClick={() => handleCurrencyClick('SEK')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'SEK')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="450" cy="525" r="27" fill="url(#tier3Gradient)" filter="url(#glow2)"/>
            <text x="450" y="535" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#ffffff">SEK</text>
          </g>

          {/* NOK */}
          <g
            style={getCurrencyStyle('NOK')}
            onClick={() => handleCurrencyClick('NOK')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'NOK')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="600" cy="525" r="27" fill="url(#tier3Gradient)" filter="url(#glow2)"/>
            <text x="600" y="535" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#ffffff">NOK</text>
          </g>

          {/* NZD */}
          <g
            style={getCurrencyStyle('NZD')}
            onClick={() => handleCurrencyClick('NZD')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'NZD')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="750" cy="525" r="27" fill="url(#tier3Gradient)" filter="url(#glow2)"/>
            <text x="750" y="535" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#ffffff">NZD</text>
          </g>

          {/* CAD */}
          <g
            style={getCurrencyStyle('CAD')}
            onClick={() => handleCurrencyClick('CAD')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'CAD')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="900" cy="525" r="27" fill="url(#tier3Gradient)" filter="url(#glow2)"/>
            <text x="900" y="535" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#ffffff">CAD</text>
          </g>

          {/* AUD */}
          <g
            style={getCurrencyStyle('AUD')}
            onClick={() => handleCurrencyClick('AUD')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'AUD')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="1050" cy="525" r="27" fill="url(#tier3Gradient)" filter="url(#glow2)"/>
            <text x="1050" y="535" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#ffffff">AUD</text>
          </g>

          {/* Update Tier 4 currencies */}
          {/* MXN */}
          <g
            style={getCurrencyStyle('MXN')}
            onClick={() => handleCurrencyClick('MXN')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'MXN')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="195" cy="675" r="21" fill="url(#tier4Gradient)" filter="url(#glow2)"/>
            <text x="195" y="680" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#ffffff">MXN</text>
          </g>

          {/* BRL */}
          <g
            style={getCurrencyStyle('BRL')}
            onClick={() => handleCurrencyClick('BRL')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'BRL')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="300" cy="675" r="21" fill="url(#tier4Gradient)" filter="url(#glow2)"/>
            <text x="300" y="680" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#ffffff">BRL</text>
          </g>

          {/* INR */}
          <g
            style={getCurrencyStyle('INR')}
            onClick={() => handleCurrencyClick('INR')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'INR')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="450" cy="675" r="21" fill="url(#tier4Gradient)" filter="url(#glow2)"/>
            <text x="450" y="680" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#ffffff">INR</text>
          </g>

          {/* ZAR */}
          <g
            style={getCurrencyStyle('ZAR')}
            onClick={() => handleCurrencyClick('ZAR')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'ZAR')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="600" cy="675" r="21" fill="url(#tier4Gradient)" filter="url(#glow2)"/>
            <text x="600" y="680" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#ffffff">ZAR</text>
          </g>

          {/* RUB */}
          <g
            style={getCurrencyStyle('RUB')}
            onClick={() => handleCurrencyClick('RUB')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'RUB')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="750" cy="675" r="21" fill="url(#tier4Gradient)" filter="url(#glow2)"/>
            <text x="750" y="680" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#ffffff">RUB</text>
          </g>

          {/* TRY */}
          <g
            style={getCurrencyStyle('TRY')}
            onClick={() => handleCurrencyClick('TRY')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'TRY')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="900" cy="675" r="21" fill="url(#tier4Gradient)" filter="url(#glow2)"/>
            <text x="900" y="680" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#ffffff">TRY</text>
          </g>

          {/* Connection paths */}
          <g stroke="url(#connectionGradient)" strokeWidth="2" opacity="0.4">
            {/* USD to Tier 2 connections */}
            <path d="M600,270 Q600,322 200,375" fill="none"/>
            <path d="M600,270 Q600,322 400,375" fill="none"/>
            <path d="M600,270 L600,375" fill="none"/>
            <path d="M600,270 Q600,322 800,375" fill="none"/>
            <path d="M600,270 Q600,322 1000,375" fill="none"/>

            {/* Tier 2 to Tier 3 connections */}
            <path d="M200,411 Q200,468 150,525" fill="none"/>
            <path d="M200,411 Q200,468 300,525" fill="none"/>
            
            <path d="M400,411 Q400,468 450,525" fill="none"/>
            <path d="M400,411 Q400,468 600,525" fill="none"/>
            
            <path d="M600,411 Q600,468 750,525" fill="none"/>
            <path d="M600,411 Q600,468 900,525" fill="none"/>
            
            <path d="M800,411 Q800,468 1050,525" fill="none"/>

            {/* Tier 3 to Tier 4 connections */}
            {/* CNY connections */}
            <path d="M150,552 Q150,613 195,675" fill="none"/>
            <path d="M150,552 Q150,613 300,675" fill="none"/>
            
            {/* HKD connections */}
            <path d="M300,552 Q300,613 300,675" fill="none"/>
            <path d="M300,552 Q300,613 450,675" fill="none"/>
            
            {/* SEK connections */}
            <path d="M450,552 Q450,613 450,675" fill="none"/>
            <path d="M450,552 Q450,613 600,675" fill="none"/>
            
            {/* NOK connections */}
            <path d="M600,552 Q600,613 600,675" fill="none"/>
            <path d="M600,552 Q600,613 750,675" fill="none"/>
            
            {/* NZD connections */}
            <path d="M750,552 Q750,613 750,675" fill="none"/>
            <path d="M750,552 Q750,613 900,675" fill="none"/>
            
            {/* CAD connections */}
            <path d="M900,552 Q900,613 195,675" fill="none"/>
            <path d="M900,552 Q900,613 900,675" fill="none"/>
            
            {/* AUD connections */}
            <path d="M1050,552 Q1050,613 600,675" fill="none"/>
            <path d="M1050,552 Q1050,613 750,675" fill="none"/>
          </g>

          {/* Add glowing effect for selected currency connections */}
          {selectedCurrency && (
            <g stroke={isDarkMode ? "#ffffff" : "#000000"} strokeWidth="3" opacity="0.6" filter="url(#glow1)">
              {selectedCurrency === 'USD' && (
                <>
                  <path d="M600,270 Q600,322 200,375" fill="none"/>
                  <path d="M600,270 Q600,322 400,375" fill="none"/>
                  <path d="M600,270 L600,375" fill="none"/>
                  <path d="M600,270 Q600,322 800,375" fill="none"/>
                  <path d="M600,270 Q600,322 1000,375" fill="none"/>
                </>
              )}
              {selectedCurrency === 'EUR' && (
                <>
                  <path d="M200,411 Q200,468 150,525" fill="none"/>
                  <path d="M200,411 Q200,468 300,525" fill="none"/>
                </>
              )}
              {selectedCurrency === 'JPY' && (
                <>
                  <path d="M400,411 Q400,468 450,525" fill="none"/>
                  <path d="M400,411 Q400,468 600,525" fill="none"/>
                </>
              )}
              {selectedCurrency === 'GBP' && (
                <>
                  <path d="M600,411 Q600,468 750,525" fill="none"/>
                  <path d="M600,411 Q600,468 900,525" fill="none"/>
                </>
              )}
              {selectedCurrency === 'CNH' && (
                <path d="M800,411 Q800,468 1050,525" fill="none"/>
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Interactive Currency Converter Bar */}
      <div className={`mt-8 p-4 rounded-lg shadow-lg transition-all duration-200 ${
        isDarkMode ? 'bg-[#0A192F] border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex items-center space-x-3">
            <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Convert:
            </span>
            <input
              type="number"
              value={converterAmount}
              onChange={(e) => handleConverterAmountChange(e.target.value)}
              min="0"
              step="0.01"
              className={`w-24 px-3 py-2 rounded-lg border text-center font-semibold ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
              placeholder="100"
            />
            <select
              value={converterFromCurrency}
              onChange={(e) => handleConverterCurrencyChange(e.target.value)}
              className={`px-3 py-2 rounded-lg border font-medium ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            >
              {Object.keys(currencyData).map(currency => (
                <option key={currency} value={currency}>
                  {currency} - {currencyData[currency].name}
                </option>
              ))}
            </select>
          </div>
          
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {lastUpdated && (
              <span className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Live rates updated {formatLastUpdated(lastUpdated)}</span>
              </span>
            )}
          </div>
        </div>
        
        {/* Conversion Results Grid */}
        {Object.keys(converterResults).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
            <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {converterAmount} {converterFromCurrency} equals:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(converterResults)
                .sort(([, amountA], [, amountB]) => amountB - amountA)
                .map(([currency, amount]) => (
                  <div
                    key={currency}
                    className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-[#112240] border-gray-700 hover:border-blue-500' 
                        : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleCurrencyClick(currency)}
                  >
                    <div className="text-center">
                      <div className={`text-lg font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {formatConvertedAmount(amount, currency)}
                      </div>
                      <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {currency}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {currencyData[currency]?.name}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Currency Details Panel with Exchange Rates - Moved below SVG */}
      {selectedCurrency && currencyData[selectedCurrency] && (
        <div className={`mt-8 p-6 rounded-lg shadow-lg transition-all duration-200 ${isDarkMode ? 'bg-[#0A192F]' : 'bg-white'}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold mb-2 dark:text-white">
                {currencyData[selectedCurrency].code} - {currencyData[selectedCurrency].name}
              </h2>
              <p className="text-gray-600 dark:text-gray-100 mb-2">
                {currencyData[selectedCurrency].description}
              </p>
              <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
              }`}>
                Tier {currencyData[selectedCurrency].tier}
              </div>
            </div>
            
            {/* Live Status */}
            {lastUpdated && (
              <div className={`text-right ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium">Live Rates</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatLastUpdated(lastUpdated)}
                </div>
              </div>
            )}
          </div>
          
          {/* Quick Conversion Display */}
          {converterAmount && converterFromCurrency && selectedCurrency !== converterFromCurrency && (
            <div className={`mb-4 p-3 rounded-lg ${
              isDarkMode ? 'bg-[#112240] border border-gray-700' : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {converterAmount} {converterFromCurrency} = {
                    formatConvertedAmount(
                      parseFloat(converterAmount) * (exchangeRates[converterFromCurrency]?.[selectedCurrency] || 0),
                      selectedCurrency
                    )
                  } {selectedCurrency}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Exchange Rate: 1 {converterFromCurrency} = {formatRate(exchangeRates[converterFromCurrency]?.[selectedCurrency])} {selectedCurrency}
                </div>
              </div>
            </div>
          )}
          
          {/* Exchange Rates Section */}
          {exchangeRates[selectedCurrency] && (
            <div>
              <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center space-x-2">
                <span>Exchange Rates</span>
                <button
                  onClick={handleManualRefresh}
                  disabled={loading}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : isDarkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {loading ? '↻' : '↻'}
                </button>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Object.entries(exchangeRates[selectedCurrency] || {})
                  .sort(([, rateA], [, rateB]) => (rateB || 0) - (rateA || 0))
                  .map(([currency, rate]) => (
                    <div 
                      key={currency}
                      className={`p-4 rounded-lg transition-all duration-200 border ${
                        isDarkMode 
                          ? 'bg-[#112240] border-gray-700 hover:border-blue-500' 
                          : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold dark:text-gray-100">{currency}</div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                        }`}>
                          Live
                        </div>
                      </div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatRate(rate)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        1 {selectedCurrency} = {formatRate(rate)} {currency}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
        </>
      )}

      <div className="mt-8">
        <AdSense />
      </div>
    </div>
  );
};

export default CurrencyHierarchyPage; 