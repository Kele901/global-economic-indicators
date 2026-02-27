'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AdSense from '../components/AdSense';
import { calculateCurrencyPairs } from '../services/forex';
import { useLocalStorage } from '../hooks/useLocalStorage';
import InfoPanel from '../components/InfoPanel';
import { economicMetrics } from '../data/economicMetrics';
import { CENTRAL_BANK_RATES, CURRENCY_REGIMES, SAFE_HAVEN_CURRENCIES, REER_DATA } from '../data/currencyHierarchyData';

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
  symbol: string;
  country: string;
  dailyVolume: string;
  exchangeRates?: {
    [key: string]: number;
  };
}

const TIER_COLORS: Record<number, { border: string; bg: string; text: string }> = {
  1: { border: '#3B82F6', bg: 'rgba(59,130,246,0.15)', text: '#60A5FA' },
  2: { border: '#D97706', bg: 'rgba(217,119,6,0.15)', text: '#FBBF24' },
  3: { border: '#059669', bg: 'rgba(5,150,105,0.15)', text: '#34D399' },
  4: { border: '#E11D48', bg: 'rgba(225,29,72,0.15)', text: '#FB7185' },
};

const currencyData: { [key: string]: CurrencyInfo } = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', country: 'United States', dailyVolume: '$6.6T', description: 'Global reserve currency, dominates international trade and foreign exchange reserves.', tier: 1 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', country: 'Eurozone', dailyVolume: '$2.3T', description: 'Second most traded currency, official currency of the Eurozone.', tier: 2 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', country: 'Japan', dailyVolume: '$1.25T', description: 'Major Asian currency, known for its role in carry trades.', tier: 2 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', country: 'United Kingdom', dailyVolume: '$968B', description: 'Oldest currency still in use, major reserve currency.', tier: 2 },
  CNH: { code: 'CNH', name: 'Offshore Chinese Yuan', symbol: '¥', country: 'China (Offshore)', dailyVolume: '$526B', description: 'Offshore trading version of the Chinese Yuan, increasingly important in global trade.', tier: 2 },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', country: 'Switzerland', dailyVolume: '$390B', description: 'Traditional safe-haven currency, known for stability.', tier: 2 },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', country: 'China', dailyVolume: '$526B', description: 'Growing international currency, backed by world\'s second-largest economy.', tier: 3 },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', country: 'Hong Kong', dailyVolume: '$219B', description: 'Major Asian financial center currency, pegged to USD.', tier: 3 },
  SEK: { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', country: 'Sweden', dailyVolume: '$134B', description: 'Important Scandinavian currency, highly traded in Europe.', tier: 3 },
  NOK: { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', country: 'Norway', dailyVolume: '$119B', description: 'Major oil currency, closely tied to petroleum exports.', tier: 3 },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', country: 'New Zealand', dailyVolume: '$107B', description: 'Major commodity currency, known as the Kiwi dollar.', tier: 3 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', country: 'Canada', dailyVolume: '$332B', description: 'Commodity currency, closely tied to natural resources.', tier: 3 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', country: 'Australia', dailyVolume: '$420B', description: 'Major commodity currency, highly traded in Asian markets.', tier: 3 },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', country: 'Singapore', dailyVolume: '$164B', description: 'Major Asian financial hub currency, known for stability.', tier: 3 },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', country: 'Mexico', dailyVolume: '$114B', description: 'Most traded currency in Latin America.', tier: 4 },
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', country: 'Brazil', dailyVolume: '$72B', description: 'Major South American currency.', tier: 4 },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', country: 'India', dailyVolume: '$56B', description: 'Currency of one of the world\'s largest economies.', tier: 4 },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', country: 'South Africa', dailyVolume: '$64B', description: 'Most traded African currency.', tier: 4 },
  RUB: { code: 'RUB', name: 'Russian Ruble', symbol: '₽', country: 'Russia', dailyVolume: '$26B', description: 'Major commodity currency, subject to capital controls.', tier: 4 },
  TRY: { code: 'TRY', name: 'Turkish Lira', symbol: '₺', country: 'Turkey', dailyVolume: '$71B', description: 'Important regional currency in the Middle East.', tier: 4 },
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
      const container = (event.currentTarget as SVGElement).closest('.relative');
      const containerRect = container?.getBoundingClientRect() ?? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      const containerScrollTop = (container as HTMLElement)?.scrollTop ?? 0;

      const tooltipW = 280;
      const tooltipH = 220;
      const pad = 12;
      let x = rect.left + rect.width / 2 - containerRect.left;
      let y = rect.top - containerRect.top + containerScrollTop - pad;

      x = Math.max(tooltipW / 2 + pad, Math.min(x, containerRect.width - tooltipW / 2 - pad));

      if (y - tooltipH < 0) {
        y = rect.bottom - containerRect.top + containerScrollTop + pad;
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
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Global Currency Hierarchy</h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Explore the tiered structure of global currencies, from reserve currencies to regional and local ones
          </p>
        </div>
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

      {/* Static intro content - always visible for SEO */}
      <div className={`rounded-lg p-4 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
        <p className="text-sm mb-3">
          The global currency hierarchy reflects the relative importance and stability of different currencies 
          in international trade, finance, and reserves. Understanding this structure helps explain exchange 
          rate dynamics and international monetary relationships.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
            <span className="font-semibold text-blue-500">Tier 1:</span> Global Reserve (USD)
          </div>
          <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
            <span className="font-semibold text-orange-500">Tier 2:</span> Major Currencies
          </div>
          <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
            <span className="font-semibold text-green-500">Tier 3:</span> Regional Currencies
          </div>
          <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
            <span className="font-semibold text-red-500">Tier 4:</span> Local Currencies
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
        {/* Refined Tooltip */}
        {hoveredCurrency && currencyData[hoveredCurrency] && (() => {
          const cd = currencyData[hoveredCurrency];
          const tier = cd.tier;
          const tc = TIER_COLORS[tier];
          const cbRate = CENTRAL_BANK_RATES.find(r => r.currency === hoveredCurrency || (hoveredCurrency === 'CNH' && r.currency === 'CNY'));
          const reer = REER_DATA.find(r => r.currency === hoveredCurrency || (hoveredCurrency === 'CNH' && r.currency === 'CNY'));
          const safeHaven = SAFE_HAVEN_CURRENCIES.find(r => r.currency === hoveredCurrency || (hoveredCurrency === 'CNH' && r.currency === 'CNY'));
          const trendArrow = cbRate?.trend === 'rising' ? '▲' : cbRate?.trend === 'falling' ? '▼' : '—';
          const trendColor = cbRate?.trend === 'rising' ? '#F87171' : cbRate?.trend === 'falling' ? '#34D399' : '#9CA3AF';
          return (
            <div
              className="absolute z-50 pointer-events-none shadow-2xl transition-all duration-150 ease-out"
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y}px`,
                transform: 'translate(-50%, -100%)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              <div
                className="rounded-lg overflow-hidden backdrop-blur-sm"
                style={{
                  borderLeft: `4px solid ${tc.border}`,
                  background: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.97)',
                  minWidth: '260px',
                  maxWidth: '300px',
                }}
              >
                <div className="p-3">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cd.code}</span>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{cd.name}</span>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: tc.bg, color: tc.text }}
                    >
                      Tier {tier}
                    </span>
                  </div>

                  {/* Country + Symbol */}
                  <div className={`text-xs mb-2.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {cd.country} &middot; {cd.symbol} &middot; Vol: {cd.dailyVolume}
                  </div>

                  {/* Key stats row */}
                  <div className={`flex gap-3 text-[11px] mb-2.5 pb-2.5 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid' }}>
                    {cbRate && (
                      <div>
                        <div className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{cbRate.bankAbbrev}</div>
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {cbRate.rate}% <span style={{ color: trendColor, fontSize: '10px' }}>{trendArrow}</span>
                        </div>
                      </div>
                    )}
                    {reer && (
                      <div>
                        <div className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>REER</div>
                        <div className={`font-semibold ${reer.isOvervalued ? 'text-rose-400' : isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          {reer.deviation > 0 ? '+' : ''}{reer.deviation.toFixed(1)}%
                        </div>
                      </div>
                    )}
                    {safeHaven && (
                      <div>
                        <div className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Safe Haven</div>
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {safeHaven.score}/100
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Exchange rate */}
                  {selectedCurrency && exchangeRates[selectedCurrency]?.[hoveredCurrency] && (
                    <div className="mb-2">
                      <div className="font-medium text-sm" style={{ color: '#34D399' }}>
                        1 {selectedCurrency} = {formatRate(exchangeRates[selectedCurrency]?.[hoveredCurrency])} {hoveredCurrency}
                      </div>
                      {lastUpdated && (
                        <div className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          Updated: {formatLastUpdated(lastUpdated)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick converter */}
                  {converterAmount && converterFromCurrency && converterFromCurrency !== hoveredCurrency && exchangeRates[converterFromCurrency]?.[hoveredCurrency] && (
                    <div className={`pt-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} style={{ borderTopWidth: '1px', borderTopStyle: 'solid' }}>
                      <div className={`text-[10px] mb-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Quick Convert</div>
                      <div className="text-sm font-medium" style={{ color: '#60A5FA' }}>
                        {converterAmount} {converterFromCurrency} = {formatConvertedAmount(
                          parseFloat(converterAmount) * (exchangeRates[converterFromCurrency]?.[hoveredCurrency] || 0),
                          hoveredCurrency
                        )} {hoveredCurrency}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 900" 
          className="w-full h-auto min-h-[600px]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="tier1Gradient" cx="50%" cy="30%" r="65%" fx="50%" fy="30%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </radialGradient>
            <radialGradient id="tier2Gradient" cx="50%" cy="30%" r="65%" fx="50%" fy="30%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>
            <radialGradient id="tier3Gradient" cx="50%" cy="30%" r="65%" fx="50%" fy="30%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </radialGradient>
            <radialGradient id="tier4Gradient" cx="50%" cy="30%" r="65%" fx="50%" fy="30%">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="100%" stopColor="#E11D48" />
            </radialGradient>

            <filter id="glow1" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
            <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
            <filter id="glow3" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
            <filter id="cardShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.15"/>
            </filter>

            <linearGradient id="connT1T2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.5"/>
            </linearGradient>
            <linearGradient id="connT2T3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#059669" stopOpacity="0.4"/>
            </linearGradient>
            <linearGradient id="connT3T4" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#E11D48" stopOpacity="0.35"/>
            </linearGradient>

            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isDarkMode ? "#ffffff" : "#000000"} stopOpacity="0.1"/>
              <stop offset="50%" stopColor={isDarkMode ? "#ffffff" : "#000000"} stopOpacity="0.7"/>
              <stop offset="100%" stopColor={isDarkMode ? "#ffffff" : "#000000"} stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          
          {/* Background */}
          <rect width="1200" height="900" fill={isDarkMode ? "rgb(17, 24, 39)" : "#f8fafc"} rx="12" ry="12"/>
          <rect x="2" y="2" width="1196" height="896" fill="none" stroke={isDarkMode ? "rgba(75, 85, 99, 0.3)" : "rgba(0, 0, 0, 0.08)"} strokeWidth="1" rx="11" ry="11"/>

          {/* Tier zone bands */}
          <rect x="0" y="120" width="1200" height="100" rx="0" fill={isDarkMode ? "rgba(59, 130, 246, 0.06)" : "rgba(59, 130, 246, 0.04)"}/>
          <rect x="0" y="290" width="1200" height="100" rx="0" fill={isDarkMode ? "rgba(217, 119, 6, 0.06)" : "rgba(217, 119, 6, 0.04)"}/>
          <rect x="0" y="460" width="1200" height="100" rx="0" fill={isDarkMode ? "rgba(5, 150, 105, 0.06)" : "rgba(5, 150, 105, 0.04)"}/>
          <rect x="0" y="630" width="1200" height="100" rx="0" fill={isDarkMode ? "rgba(225, 29, 72, 0.06)" : "rgba(225, 29, 72, 0.04)"}/>

          {/* Tier zone labels */}
          <text x="28" y="138" fontFamily="system-ui, -apple-system, sans-serif" fontSize="10" fontWeight="600" letterSpacing="1.5" fill={isDarkMode ? "rgba(96, 165, 250, 0.45)" : "rgba(37, 99, 235, 0.3)"}>TIER 1 &middot; GLOBAL RESERVE</text>
          <text x="28" y="308" fontFamily="system-ui, -apple-system, sans-serif" fontSize="10" fontWeight="600" letterSpacing="1.5" fill={isDarkMode ? "rgba(251, 191, 36, 0.45)" : "rgba(217, 119, 6, 0.3)"}>TIER 2 &middot; MAJOR</text>
          <text x="28" y="478" fontFamily="system-ui, -apple-system, sans-serif" fontSize="10" fontWeight="600" letterSpacing="1.5" fill={isDarkMode ? "rgba(52, 211, 153, 0.45)" : "rgba(5, 150, 105, 0.3)"}>TIER 3 &middot; REGIONAL</text>
          <text x="28" y="648" fontFamily="system-ui, -apple-system, sans-serif" fontSize="10" fontWeight="600" letterSpacing="1.5" fill={isDarkMode ? "rgba(251, 113, 133, 0.45)" : "rgba(225, 29, 72, 0.3)"}>TIER 4 &middot; LOCAL</text>
          
          {/* Title */}
          <text x="600" y="52" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontSize="34" fontWeight="700" letterSpacing="2" fill={isDarkMode ? "#ffffff" : "#111827"} opacity="0.9">GLOBAL CURRENCY HIERARCHY</text>
          <line x1="420" y1="68" x2="780" y2="68" stroke={isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"} strokeWidth="1"/>
          <text x="600" y="88" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontSize="12" fill={isDarkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)"} letterSpacing="3">TREE OF GLOBAL FOREX INFLUENCE</text>

          {/* Legend - compact frosted card */}
          <g transform="translate(848, 30)">
            <rect x="-12" y="-14" width="340" height="44" rx="8" ry="8" fill={isDarkMode ? "rgba(31, 41, 55, 0.85)" : "rgba(255, 255, 255, 0.9)"} stroke={isDarkMode ? "rgba(75, 85, 99, 0.4)" : "rgba(0, 0, 0, 0.1)"} strokeWidth="1" filter="url(#cardShadow)"/>
            <circle cx="8" cy="8" r="6" fill="url(#tier1Gradient)"/>
            <text x="20" y="12" fontFamily="system-ui, -apple-system, sans-serif" fontSize="11" fill={isDarkMode ? "#e5e7eb" : "#374151"}>Reserve</text>
            <circle cx="88" cy="8" r="6" fill="url(#tier2Gradient)"/>
            <text x="100" y="12" fontFamily="system-ui, -apple-system, sans-serif" fontSize="11" fill={isDarkMode ? "#e5e7eb" : "#374151"}>Major</text>
            <circle cx="158" cy="8" r="6" fill="url(#tier3Gradient)"/>
            <text x="170" y="12" fontFamily="system-ui, -apple-system, sans-serif" fontSize="11" fill={isDarkMode ? "#e5e7eb" : "#374151"}>Regional</text>
            <circle cx="242" cy="8" r="6" fill="url(#tier4Gradient)"/>
            <text x="254" y="12" fontFamily="system-ui, -apple-system, sans-serif" fontSize="11" fill={isDarkMode ? "#e5e7eb" : "#374151"}>Local</text>
          </g>

          {/* Tier 1: USD - top center with double-ring */}
          <g
            style={getCurrencyStyle('USD')}
            onClick={() => handleCurrencyClick('USD')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'USD')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="600" cy="170" r="58" fill="none" stroke={isDarkMode ? "rgba(96, 165, 250, 0.3)" : "rgba(29, 78, 216, 0.2)"} strokeWidth="2"/>
            <circle cx="600" cy="170" r="52" fill="url(#tier1Gradient)" filter="url(#glow1)"/>
            <text x="600" y="170" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, -apple-system, sans-serif" fontSize="26" fontWeight="700" fill="#ffffff">USD</text>
            <text x="600" y="235" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontSize="10" fontWeight="600" letterSpacing="1" fill={isDarkMode ? "rgba(96, 165, 250, 0.7)" : "rgba(37, 99, 235, 0.6)"}>GLOBAL RESERVE</text>
          </g>

          {/* Tier 2: Major currencies */}
          <g
            style={getCurrencyStyle('EUR')}
            onClick={() => handleCurrencyClick('EUR')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'EUR')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="200" cy="340" r="43" fill="none" stroke={isDarkMode ? "rgba(251, 191, 36, 0.25)" : "rgba(217, 119, 6, 0.15)"} strokeWidth="1.5"/>
            <circle cx="200" cy="340" r="38" fill="url(#tier2Gradient)" filter="url(#glow2)"/>
            <text x="200" y="340" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="700" fill="#ffffff">EUR</text>
          </g>
          <g
            style={getCurrencyStyle('JPY')}
            onClick={() => handleCurrencyClick('JPY')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'JPY')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="400" cy="340" r="43" fill="none" stroke={isDarkMode ? "rgba(251, 191, 36, 0.25)" : "rgba(217, 119, 6, 0.15)"} strokeWidth="1.5"/>
            <circle cx="400" cy="340" r="38" fill="url(#tier2Gradient)" filter="url(#glow2)"/>
            <text x="400" y="340" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="700" fill="#ffffff">JPY</text>
          </g>
          <g
            style={getCurrencyStyle('GBP')}
            onClick={() => handleCurrencyClick('GBP')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'GBP')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="600" cy="340" r="43" fill="none" stroke={isDarkMode ? "rgba(251, 191, 36, 0.25)" : "rgba(217, 119, 6, 0.15)"} strokeWidth="1.5"/>
            <circle cx="600" cy="340" r="38" fill="url(#tier2Gradient)" filter="url(#glow2)"/>
            <text x="600" y="340" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="700" fill="#ffffff">GBP</text>
          </g>
          <g
            style={getCurrencyStyle('CNH')}
            onClick={() => handleCurrencyClick('CNH')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'CNH')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="800" cy="340" r="43" fill="none" stroke={isDarkMode ? "rgba(251, 191, 36, 0.25)" : "rgba(217, 119, 6, 0.15)"} strokeWidth="1.5"/>
            <circle cx="800" cy="340" r="38" fill="url(#tier2Gradient)" filter="url(#glow2)"/>
            <text x="800" y="340" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="700" fill="#ffffff">CNH</text>
          </g>
          <g
            style={getCurrencyStyle('CHF')}
            onClick={() => handleCurrencyClick('CHF')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'CHF')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="1000" cy="340" r="43" fill="none" stroke={isDarkMode ? "rgba(251, 191, 36, 0.25)" : "rgba(217, 119, 6, 0.15)"} strokeWidth="1.5"/>
            <circle cx="1000" cy="340" r="38" fill="url(#tier2Gradient)" filter="url(#glow2)"/>
            <text x="1000" y="340" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="700" fill="#ffffff">CHF</text>
          </g>

          {/* Tier 3: Regional currencies */}
          <g
            style={getCurrencyStyle('CNY')}
            onClick={() => handleCurrencyClick('CNY')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'CNY')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="100" cy="510" r="28" fill="url(#tier3Gradient)" filter="url(#glow3)"/>
            <text x="100" y="510" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, -apple-system, sans-serif" fontSize="15" fontWeight="700" fill="#ffffff">CNY</text>
          </g>
          <g
            style={getCurrencyStyle('HKD')}
            onClick={() => handleCurrencyClick('HKD')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'HKD')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="267" cy="510" r="28" fill="url(#tier3Gradient)" filter="url(#glow3)"/>
            <text x="267" y="510" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, -apple-system, sans-serif" fontSize="15" fontWeight="700" fill="#ffffff">HKD</text>
          </g>
          <g
            style={getCurrencyStyle('SEK')}
            onClick={() => handleCurrencyClick('SEK')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'SEK')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="433" cy="510" r="28" fill="url(#tier3Gradient)" filter="url(#glow3)"/>
            <text x="433" y="510" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, -apple-system, sans-serif" fontSize="15" fontWeight="700" fill="#ffffff">SEK</text>
          </g>
          <g
            style={getCurrencyStyle('NOK')}
            onClick={() => handleCurrencyClick('NOK')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'NOK')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="600" cy="510" r="28" fill="url(#tier3Gradient)" filter="url(#glow3)"/>
            <text x="600" y="510" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, -apple-system, sans-serif" fontSize="15" fontWeight="700" fill="#ffffff">NOK</text>
          </g>
          <g
            style={getCurrencyStyle('NZD')}
            onClick={() => handleCurrencyClick('NZD')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'NZD')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="767" cy="510" r="28" fill="url(#tier3Gradient)" filter="url(#glow3)"/>
            <text x="767" y="510" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, -apple-system, sans-serif" fontSize="15" fontWeight="700" fill="#ffffff">NZD</text>
          </g>
          <g
            style={getCurrencyStyle('CAD')}
            onClick={() => handleCurrencyClick('CAD')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'CAD')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="933" cy="510" r="28" fill="url(#tier3Gradient)" filter="url(#glow3)"/>
            <text x="933" y="510" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, -apple-system, sans-serif" fontSize="15" fontWeight="700" fill="#ffffff">CAD</text>
          </g>
          <g
            style={getCurrencyStyle('AUD')}
            onClick={() => handleCurrencyClick('AUD')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'AUD')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="1100" cy="510" r="28" fill="url(#tier3Gradient)" filter="url(#glow3)"/>
            <text x="1100" y="510" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, -apple-system, sans-serif" fontSize="15" fontWeight="700" fill="#ffffff">AUD</text>
          </g>

          {/* Tier 4: Local currencies */}
          <g
            style={getCurrencyStyle('MXN')}
            onClick={() => handleCurrencyClick('MXN')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'MXN')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="150" cy="680" r="22" fill="url(#tier4Gradient)" filter="url(#glow3)"/>
            <text x="150" y="680" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, -apple-system, sans-serif" fontSize="13" fontWeight="700" fill="#ffffff">MXN</text>
          </g>
          <g
            style={getCurrencyStyle('BRL')}
            onClick={() => handleCurrencyClick('BRL')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'BRL')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="330" cy="680" r="22" fill="url(#tier4Gradient)" filter="url(#glow3)"/>
            <text x="330" y="680" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, -apple-system, sans-serif" fontSize="13" fontWeight="700" fill="#ffffff">BRL</text>
          </g>
          <g
            style={getCurrencyStyle('INR')}
            onClick={() => handleCurrencyClick('INR')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'INR')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="510" cy="680" r="22" fill="url(#tier4Gradient)" filter="url(#glow3)"/>
            <text x="510" y="680" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, -apple-system, sans-serif" fontSize="13" fontWeight="700" fill="#ffffff">INR</text>
          </g>
          <g
            style={getCurrencyStyle('ZAR')}
            onClick={() => handleCurrencyClick('ZAR')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'ZAR')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="690" cy="680" r="22" fill="url(#tier4Gradient)" filter="url(#glow3)"/>
            <text x="690" y="680" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, -apple-system, sans-serif" fontSize="13" fontWeight="700" fill="#ffffff">ZAR</text>
          </g>
          <g
            style={getCurrencyStyle('RUB')}
            onClick={() => handleCurrencyClick('RUB')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'RUB')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="870" cy="680" r="22" fill="url(#tier4Gradient)" filter="url(#glow3)"/>
            <text x="870" y="680" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, -apple-system, sans-serif" fontSize="13" fontWeight="700" fill="#ffffff">RUB</text>
          </g>
          <g
            style={getCurrencyStyle('TRY')}
            onClick={() => handleCurrencyClick('TRY')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'TRY')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="1050" cy="680" r="22" fill="url(#tier4Gradient)" filter="url(#glow3)"/>
            <text x="1050" y="680" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, -apple-system, sans-serif" fontSize="13" fontWeight="700" fill="#ffffff">TRY</text>
          </g>

          {/* Tree connection paths - Tier 1 to Tier 2 */}
          <g stroke="url(#connT1T2)" strokeWidth="2.5" fill="none" opacity="0.5">
            <path d="M600,222 C600,262 200,262 200,302"/>
            <path d="M600,222 C600,262 400,262 400,302"/>
            <path d="M600,222 C600,255 600,270 600,302"/>
            <path d="M600,222 C600,262 800,262 800,302"/>
            <path d="M600,222 C600,262 1000,262 1000,302"/>
          </g>

          {/* Tree connection paths - Tier 2 to Tier 3 */}
          <g stroke="url(#connT2T3)" strokeWidth="2" fill="none" opacity="0.4">
            <path d="M200,378 C200,430 100,430 100,482"/>
            <path d="M200,378 C200,430 267,430 267,482"/>
            <path d="M400,378 C400,430 433,430 433,482"/>
            <path d="M400,378 C400,430 600,430 600,482"/>
            <path d="M600,378 C600,430 767,430 767,482"/>
            <path d="M600,378 C600,430 933,430 933,482"/>
            <path d="M800,378 C800,430 1100,430 1100,482"/>
          </g>

          {/* Tree connection paths - Tier 3 to Tier 4 */}
          <g stroke="url(#connT3T4)" strokeWidth="1.5" fill="none" opacity="0.35">
            <path d="M100,538 C100,598 150,598 150,658"/>
            <path d="M100,538 C100,598 330,598 330,658"/>
            <path d="M267,538 C267,598 330,598 330,658"/>
            <path d="M267,538 C267,598 510,598 510,658"/>
            <path d="M433,538 C433,598 510,598 510,658"/>
            <path d="M433,538 C433,598 690,598 690,658"/>
            <path d="M600,538 C600,598 690,598 690,658"/>
            <path d="M600,538 C600,598 870,598 870,658"/>
            <path d="M767,538 C767,598 870,598 870,658"/>
            <path d="M767,538 C767,598 1050,598 1050,658"/>
            <path d="M933,538 C933,598 150,598 150,658"/>
            <path d="M933,538 C933,598 1050,598 1050,658"/>
            <path d="M1100,538 C1100,598 690,598 690,658"/>
            <path d="M1100,538 C1100,598 870,598 870,658"/>
          </g>

          {/* Glowing highlight for selected currency connections */}
          {selectedCurrency && (
            <g stroke={isDarkMode ? "#ffffff" : "#1e3a5f"} strokeWidth="3" opacity="0.6" fill="none" filter="url(#glow2)">
              {selectedCurrency === 'USD' && (
                <>
                  <path d="M600,222 C600,262 200,262 200,302"/>
                  <path d="M600,222 C600,262 400,262 400,302"/>
                  <path d="M600,222 C600,255 600,270 600,302"/>
                  <path d="M600,222 C600,262 800,262 800,302"/>
                  <path d="M600,222 C600,262 1000,262 1000,302"/>
                </>
              )}
              {selectedCurrency === 'EUR' && (
                <>
                  <path d="M200,378 C200,430 100,430 100,482"/>
                  <path d="M200,378 C200,430 267,430 267,482"/>
                </>
              )}
              {selectedCurrency === 'JPY' && (
                <>
                  <path d="M400,378 C400,430 433,430 433,482"/>
                  <path d="M400,378 C400,430 600,430 600,482"/>
                </>
              )}
              {selectedCurrency === 'GBP' && (
                <>
                  <path d="M600,378 C600,430 767,430 767,482"/>
                  <path d="M600,378 C600,430 933,430 933,482"/>
                </>
              )}
              {selectedCurrency === 'CNH' && (
                <path d="M800,378 C800,430 1100,430 1100,482"/>
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Click-to-open Currency Detail Panel */}
      {selectedCurrency && currencyData[selectedCurrency] && (() => {
        const cd = currencyData[selectedCurrency];
        const tier = cd.tier;
        const tc = TIER_COLORS[tier];
        const cbRate = CENTRAL_BANK_RATES.find(r => r.currency === selectedCurrency || (selectedCurrency === 'CNH' && r.currency === 'CNY'));
        const regime = CURRENCY_REGIMES.find(r => r.currency === selectedCurrency || (selectedCurrency === 'CNH' && r.currency === 'CNY'));
        const safeHaven = SAFE_HAVEN_CURRENCIES.find(r => r.currency === selectedCurrency || (selectedCurrency === 'CNH' && r.currency === 'CNY'));
        const reer = REER_DATA.find(r => r.currency === selectedCurrency || (selectedCurrency === 'CNH' && r.currency === 'CNY'));
        const tierLabel = tier === 1 ? 'Global Reserve' : tier === 2 ? 'Major' : tier === 3 ? 'Regional' : 'Local';
        const rates = exchangeRates[selectedCurrency] || {};

        return (
          <div
            className={`mt-6 rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
            style={{ borderTop: `3px solid ${tc.border}` }}
          >
            {/* Panel Header */}
            <div className={`px-5 py-4 flex items-center justify-between ${isDarkMode ? 'bg-gray-800/80' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: `linear-gradient(135deg, ${tc.text}, ${tc.border})` }}
                >
                  {cd.symbol}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cd.code}</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{cd.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: tc.bg, color: tc.text }}>
                      Tier {tier} &middot; {tierLabel}
                    </span>
                  </div>
                  <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {cd.country} &middot; Daily Volume: {cd.dailyVolume}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCurrency(null)}
                className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Panel Body - Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: isDarkMode ? 'rgb(55,65,81)' : 'rgb(229,231,235)' }}>

              {/* Central Bank */}
              <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-[10px] font-semibold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Central Bank</div>
                {cbRate ? (
                  <>
                    <div className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cbRate.bank}</div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cbRate.rate}%</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        cbRate.trend === 'rising' ? 'bg-red-500/15 text-red-400' :
                        cbRate.trend === 'falling' ? 'bg-emerald-500/15 text-emerald-400' :
                        isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {cbRate.trend === 'rising' ? '▲' : cbRate.trend === 'falling' ? '▼' : '—'} {cbRate.trend}
                      </span>
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div>Previous: {cbRate.previousRate}%</div>
                      <div>Next Meeting: {cbRate.nextMeeting}</div>
                    </div>
                  </>
                ) : (
                  <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No data available</div>
                )}
              </div>

              {/* Currency Regime */}
              <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-[10px] font-semibold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Currency Regime</div>
                {regime ? (
                  <>
                    <div className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{regime.description}</div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Flexibility</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div
                            key={i}
                            className="w-4 h-1.5 rounded-full"
                            style={{
                              background: i <= regime.flexibility ? tc.border : isDarkMode ? 'rgb(55,65,81)' : 'rgb(229,231,235)',
                            }}
                          />
                        ))}
                      </div>
                      <span className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{regime.flexibility}/5</span>
                    </div>
                    {regime.peggedTo && (
                      <div className={`text-xs mb-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                        Pegged to: {regime.peggedTo}
                      </div>
                    )}
                    <div className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{regime.details}</div>
                  </>
                ) : (
                  <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No data available</div>
                )}
              </div>

              {/* Safe Haven */}
              <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-[10px] font-semibold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Safe Haven Status</div>
                {safeHaven ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        safeHaven.category === 'primary' ? 'bg-blue-500/15 text-blue-400' :
                        safeHaven.category === 'secondary' ? 'bg-cyan-500/15 text-cyan-400' :
                        safeHaven.category === 'neutral' ? (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600') :
                        'bg-rose-500/15 text-rose-400'
                      }`}>
                        {safeHaven.category.replace('_', ' ')}
                      </span>
                      <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{safeHaven.score}</span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>/100</span>
                    </div>
                    {/* Score bar */}
                    <div className={`w-full h-1.5 rounded-full mb-2.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${safeHaven.score}%`,
                          background: safeHaven.score >= 70 ? '#3B82F6' : safeHaven.score >= 40 ? '#F59E0B' : '#EF4444',
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {safeHaven.characteristics.slice(0, 3).map((c, i) => (
                        <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No data available</div>
                )}
              </div>

              {/* REER Valuation */}
              <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-[10px] font-semibold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>REER Valuation</div>
                {reer ? (
                  <>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reer.current.toFixed(1)}</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        reer.isOvervalued ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        {reer.isOvervalued ? 'Overvalued' : 'Undervalued'}
                      </span>
                    </div>
                    <div className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      vs historical avg of {reer.historicalAverage}
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <div className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Deviation</div>
                        <div className={`text-sm font-semibold ${reer.deviation > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {reer.deviation > 0 ? '+' : ''}{reer.deviation.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Trend</div>
                        <div className={`text-sm font-semibold ${
                          reer.trend === 'appreciating' ? 'text-emerald-400' :
                          reer.trend === 'depreciating' ? 'text-rose-400' :
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {reer.trend}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No data available</div>
                )}
              </div>
            </div>

            {/* Live Exchange Rates row */}
            {Object.keys(rates).length > 0 && (
              <div className={`px-5 py-3 ${isDarkMode ? 'bg-gray-800/60 border-t border-gray-700' : 'bg-gray-50/80 border-t border-gray-200'}`}>
                <div className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Live Exchange Rates</div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {Object.entries(rates).slice(0, 12).map(([code, rate]) => (
                    <div key={code} className="flex items-baseline gap-1">
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{code}</span>
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatRate(rate)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description footer */}
            <div className={`px-5 py-3 ${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{cd.description}</p>
            </div>
          </div>
        );
      })()}

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

      {/* Only show ads when exchange rates have loaded */}
      <div className="mt-8">
        <AdSense show={Object.keys(exchangeRates).length > 0} />
      </div>
    </div>
  );
};

export default CurrencyHierarchyPage; 