'use client';

import React, { useState, useEffect } from 'react';
import AdSense from '../components/AdSense';
import { calculateCurrencyPairs } from '../services/forex';
import { useLocalStorage } from '../hooks/useLocalStorage';

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

const CurrencyHierarchyPage = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [hoveredCurrency, setHoveredCurrency] = useState<string | null>(null);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: { [key: string]: number } }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);

  useEffect(() => {
    // Initialize theme on mount
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
      document.body.classList.toggle('dark', isDarkMode);
    }
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
      } catch (err) {
        setError('Failed to fetch exchange rates');
        console.error('Error fetching rates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    // Refresh rates every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCurrencyClick = (currency: string) => {
    setSelectedCurrency(selectedCurrency === currency ? null : currency);
  };

  const handleCurrencyHover = (
    event: React.MouseEvent<SVGElement>,
    currency: string | null
  ) => {
    if (currency) {
      const rect = event.currentTarget.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + scrollTop
      });
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

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Global Currency Hierarchy</h1>
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
      
      {/* Loading and Error States */}
      {loading && (
        <div className="mb-4 text-blue-600 dark:text-blue-400">
          Loading exchange rates...
        </div>
      )}
      {error && (
        <div className="mb-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      
      <div className="w-full overflow-x-auto relative bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 transition-colors duration-200">
        {/* Tooltip with Exchange Rate */}
        {hoveredCurrency && currencyData[hoveredCurrency] && (
          <div
            className="absolute z-10 bg-black bg-opacity-80 text-white p-2 rounded pointer-events-none"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y - 40}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div>{currencyData[hoveredCurrency].name}</div>
            {selectedCurrency && exchangeRates[selectedCurrency]?.[hoveredCurrency] && (
              <div className="text-sm opacity-80">
                1 {selectedCurrency} = {formatRate(exchangeRates[selectedCurrency]?.[hoveredCurrency])} {hoveredCurrency}
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
          />
          
          {/* Grid lines */}
          <g stroke={isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"} strokeWidth="1">
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

      {/* Currency Details Panel with Exchange Rates - Moved below SVG */}
      {selectedCurrency && currencyData[selectedCurrency] && (
        <div className={`mt-8 p-4 rounded-lg shadow-lg transition-all duration-200 ${isDarkMode ? 'bg-[#0A192F]' : 'bg-white'}`}>
          <h2 className="text-xl font-bold mb-2 dark:text-white">
            {currencyData[selectedCurrency].code} - {currencyData[selectedCurrency].name}
          </h2>
          <p className="text-gray-600 dark:text-gray-100 mb-4">
            {currencyData[selectedCurrency].description}
          </p>
          
          {/* Exchange Rates Section */}
          {exchangeRates[selectedCurrency] && (
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Exchange Rates</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(exchangeRates[selectedCurrency] || {})
                  .sort(([, rateA], [, rateB]) => (rateB || 0) - (rateA || 0))
                  .map(([currency, rate]) => (
                    <div 
                      key={currency}
                      className={`p-3 rounded transition-all duration-200 ${isDarkMode ? 'bg-[#112240]' : 'bg-gray-50'}`}
                    >
                      <div className="font-medium dark:text-gray-100">{currency}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-200">
                        1 {selectedCurrency} = {formatRate(rate)} {currency}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <AdSense />
      </div>
    </div>
  );
};

export default CurrencyHierarchyPage; 