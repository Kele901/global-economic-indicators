'use client';

import React, { useState, useEffect } from 'react';
import AdSense from '../components/AdSense';
import { calculateCurrencyPairs } from '../services/forex';

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
  CNY: {
    code: 'CNY',
    name: 'Chinese Yuan',
    description: 'Growing international currency, backed by world\'s second-largest economy.',
    tier: 3
  },
  CHF: {
    code: 'CHF',
    name: 'Swiss Franc',
    description: 'Traditional safe-haven currency, known for stability.',
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
  }
};

const CurrencyHierarchyPage = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [hoveredCurrency, setHoveredCurrency] = useState<string | null>(null);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: { [key: string]: number } }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const formatRate = (rate: number) => {
    return rate.toFixed(4);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Global Currency Hierarchy</h1>
      
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
      
      {/* Currency Details Panel with Exchange Rates */}
      {selectedCurrency && currencyData[selectedCurrency] && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2">
            {currencyData[selectedCurrency].code} - {currencyData[selectedCurrency].name}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {currencyData[selectedCurrency].description}
          </p>
          
          {/* Exchange Rates Section */}
          {exchangeRates[selectedCurrency] && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Exchange Rates</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(exchangeRates[selectedCurrency])
                  .sort(([, rateA], [, rateB]) => rateB - rateA)
                  .map(([currency, rate]) => (
                    <div 
                      key={currency}
                      className="p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <div className="font-medium">{currency}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        1 {selectedCurrency} = {formatRate(rate)} {currency}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="w-full overflow-x-auto relative">
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
                1 {selectedCurrency} = {formatRate(exchangeRates[selectedCurrency][hoveredCurrency])} {hoveredCurrency}
              </div>
            )}
          </div>
        )}

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" className="w-full h-auto">
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
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1"/>
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.7"/>
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          
          {/* Background */}
          <rect width="800" height="600" fill="url(#bgGradient)"/>
          
          {/* Grid lines */}
          <g stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1">
            {/* Horizontal lines */}
            <line x1="0" y1="150" x2="800" y2="150"/>
            <line x1="0" y1="250" x2="800" y2="250"/>
            <line x1="0" y1="350" x2="800" y2="350"/>
            <line x1="0" y1="450" x2="800" y2="450"/>
            
            {/* Vertical lines */}
            <line x1="200" y1="100" x2="200" y2="500"/>
            <line x1="400" y1="100" x2="400" y2="500"/>
            <line x1="600" y1="100" x2="600" y2="500"/>
          </g>
          
          {/* Title */}
          <text x="400" y="60" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#ffffff" opacity="0.9">GLOBAL CURRENCY HIERARCHY</text>
          <line x1="250" y1="70" x2="550" y2="70" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1"/>
          
          {/* Legend */}
          <g transform="translate(620, 100)">
            <rect x="-10" y="-10" width="170" height="210" rx="10" ry="10" fill="#ffffff" fillOpacity="0.05"/>
            <text x="0" y="10" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#ffffff" opacity="0.9">CURRENCY TIERS</text>
            
            {/* Tier 1 */}
            <circle cx="10" cy="40" r="10" fill="url(#tier1Gradient)" filter="url(#glow1)"/>
            <text x="30" y="45" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="12" fill="#ffffff" opacity="0.8">Tier 1: Global Reserve</text>
            
            {/* Tier 2 */}
            <circle cx="10" cy="70" r="10" fill="url(#tier2Gradient)" filter="url(#glow2)"/>
            <text x="30" y="75" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="12" fill="#ffffff" opacity="0.8">Tier 2: Major</text>
            
            {/* Tier 3 */}
            <circle cx="10" cy="100" r="10" fill="url(#tier3Gradient)" filter="url(#glow2)"/>
            <text x="30" y="105" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="12" fill="#ffffff" opacity="0.8">Tier 3: Regional</text>
            
            {/* Tier 4 */}
            <circle cx="10" cy="130" r="10" fill="url(#tier4Gradient)" filter="url(#glow2)"/>
            <text x="30" y="135" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="12" fill="#ffffff" opacity="0.8">Tier 4: Local</text>
            
            {/* Connection types */}
            <line x1="0" y1="160" x2="20" y2="160" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="2"/>
            <text x="30" y="165" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="12" fill="#ffffff" opacity="0.8">Strong influence</text>
            
            <line x1="0" y1="190" x2="20" y2="190" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="4"/>
            <text x="30" y="195" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="12" fill="#ffffff" opacity="0.8">Moderate influence</text>
          </g>
          
          {/* Connections - drawn first so nodes appear on top */}
          {/* Connections from USD to Tier 2 */}
          <path d="M400,175 Q300,200 200,230" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" strokeOpacity="0.7"/>
          <path d="M400,175 L400,230" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" strokeOpacity="0.7"/>
          <path d="M400,175 Q500,200 600,230" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" strokeOpacity="0.7"/>
          
          {/* Connections from Tier 2 to Tier 3 */}
          {/* EUR connections */}
          <path d="M200,270 Q150,300 100,335" stroke="url(#connectionGradient)" strokeWidth="1.5" fill="none" strokeOpacity="0.6"/>
          <path d="M200,270 Q215,300 230,335" stroke="url(#connectionGradient)" strokeWidth="1.5" fill="none" strokeOpacity="0.6"/>
          
          {/* JPY connections */}
          <path d="M400,270 Q380,300 360,335" stroke="url(#connectionGradient)" strokeWidth="1.5" fill="none" strokeOpacity="0.6"/>
          <path d="M400,270 Q445,300 490,335" stroke="url(#connectionGradient)" strokeWidth="1.5" fill="none" strokeOpacity="0.6"/>
          
          {/* GBP connections */}
          <path d="M600,270 Q610,300 620,335" stroke="url(#connectionGradient)" strokeWidth="1.5" fill="none" strokeOpacity="0.6"/>
          
          {/* USD direct influence on Tier 3 */}
          <path d="M400,175 Q250,260 100,335" stroke="url(#connectionGradient)" strokeWidth="1" fill="none" strokeOpacity="0.4" strokeDasharray="4"/>
          <path d="M400,175 Q380,260 360,335" stroke="url(#connectionGradient)" strokeWidth="1" fill="none" strokeOpacity="0.4" strokeDasharray="4"/>
          <path d="M400,175 Q445,260 490,335" stroke="url(#connectionGradient)" strokeWidth="1" fill="none" strokeOpacity="0.4" strokeDasharray="4"/>
          <path d="M400,175 Q510,260 620,335" stroke="url(#connectionGradient)" strokeWidth="1" fill="none" strokeOpacity="0.4" strokeDasharray="4"/>
          
          {/* Connections from Tier 3 to Tier 4 */}
          {/* CNY connections */}
          <path d="M100,365 Q115,400 130,438" stroke="url(#connectionGradient)" strokeWidth="1" fill="none" strokeOpacity="0.5"/>
          
          {/* CHF connections */}
          <path d="M230,365 Q250,400 270,438" stroke="url(#connectionGradient)" strokeWidth="1" fill="none" strokeOpacity="0.5"/>
          
          {/* CAD connections */}
          <path d="M360,365 Q350,400 340,438" stroke="url(#connectionGradient)" strokeWidth="1" fill="none" strokeOpacity="0.5"/>
          
          {/* AUD connections */}
          <path d="M490,365 Q450,400 410,438" stroke="url(#connectionGradient)" strokeWidth="1" fill="none" strokeOpacity="0.5"/>
          <path d="M490,365 Q485,400 480,438" stroke="url(#connectionGradient)" strokeWidth="1" fill="none" strokeOpacity="0.5"/>
          
          {/* SGD connections */}
          <path d="M620,365 Q585,400 550,438" stroke="url(#connectionGradient)" strokeWidth="1" fill="none" strokeOpacity="0.5"/>
          <path d="M620,365 Q620,400 620,438" stroke="url(#connectionGradient)" strokeWidth="1" fill="none" strokeOpacity="0.5"/>
          
          {/* EUR direct influence on Tier 4 */}
          <path d="M200,270 Q200,350 200,438" stroke="url(#connectionGradient)" strokeWidth="1" fill="none" strokeOpacity="0.3" strokeDasharray="4"/>
          <path d="M200,270 Q340,350 480,438" stroke="url(#connectionGradient)" strokeWidth="1" fill="none" strokeOpacity="0.3" strokeDasharray="4"/>
          
          {/* USD direct influence on some Tier 4 */}
          <path d="M400,175 Q265,300 130,438" stroke="url(#connectionGradient)" strokeWidth="0.5" fill="none" strokeOpacity="0.3" strokeDasharray="4"/>
          <path d="M400,175 Q405,300 410,438" stroke="url(#connectionGradient)" strokeWidth="0.5" fill="none" strokeOpacity="0.3" strokeDasharray="4"/>
          <path d="M400,175 Q510,300 620,438" stroke="url(#connectionGradient)" strokeWidth="0.5" fill="none" strokeOpacity="0.3" strokeDasharray="4"/>
          
          {/* Tier 1: Global Reserve Currencies */}
          {/* USD */}
          <g
            style={getCurrencyStyle('USD')}
            onClick={() => handleCurrencyClick('USD')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'USD')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="400" cy="150" r="30" fill="url(#tier1Gradient)" filter="url(#glow1)"/>
            <text x="400" y="155" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#ffffff">USD</text>
          </g>
          
          {/* Tier 2: Major Currencies */}
          {/* EUR */}
          <g
            style={getCurrencyStyle('EUR')}
            onClick={() => handleCurrencyClick('EUR')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'EUR')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="200" cy="250" r="24" fill="url(#tier2Gradient)" filter="url(#glow2)"/>
            <text x="200" y="255" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#ffffff">EUR</text>
          </g>
          
          {/* JPY */}
          <g
            style={getCurrencyStyle('JPY')}
            onClick={() => handleCurrencyClick('JPY')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'JPY')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="400" cy="250" r="24" fill="url(#tier2Gradient)" filter="url(#glow2)"/>
            <text x="400" y="255" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#ffffff">JPY</text>
          </g>
          
          {/* GBP */}
          <g
            style={getCurrencyStyle('GBP')}
            onClick={() => handleCurrencyClick('GBP')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'GBP')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="600" cy="250" r="24" fill="url(#tier2Gradient)" filter="url(#glow2)"/>
            <text x="600" y="255" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#ffffff">GBP</text>
          </g>
          
          {/* Tier 3: Regional Currencies */}
          {/* CNY */}
          <g
            style={getCurrencyStyle('CNY')}
            onClick={() => handleCurrencyClick('CNY')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'CNY')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="100" cy="350" r="18" fill="url(#tier3Gradient)" filter="url(#glow2)"/>
            <text x="100" y="355" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="12" fontWeight="bold" fill="#ffffff">CNY</text>
          </g>
          
          {/* CHF */}
          <g
            style={getCurrencyStyle('CHF')}
            onClick={() => handleCurrencyClick('CHF')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'CHF')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="230" cy="350" r="18" fill="url(#tier3Gradient)" filter="url(#glow2)"/>
            <text x="230" y="355" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="12" fontWeight="bold" fill="#ffffff">CHF</text>
          </g>
          
          {/* CAD */}
          <g
            style={getCurrencyStyle('CAD')}
            onClick={() => handleCurrencyClick('CAD')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'CAD')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="360" cy="350" r="18" fill="url(#tier3Gradient)" filter="url(#glow2)"/>
            <text x="360" y="355" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="12" fontWeight="bold" fill="#ffffff">CAD</text>
          </g>
          
          {/* AUD */}
          <g
            style={getCurrencyStyle('AUD')}
            onClick={() => handleCurrencyClick('AUD')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'AUD')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="490" cy="350" r="18" fill="url(#tier3Gradient)" filter="url(#glow2)"/>
            <text x="490" y="355" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="12" fontWeight="bold" fill="#ffffff">AUD</text>
          </g>
          
          {/* SGD */}
          <g
            style={getCurrencyStyle('SGD')}
            onClick={() => handleCurrencyClick('SGD')}
            onMouseEnter={(e) => handleCurrencyHover(e, 'SGD')}
            onMouseLeave={() => handleCurrencyHover(null, null)}
          >
            <circle cx="620" cy="350" r="18" fill="url(#tier3Gradient)" filter="url(#glow2)"/>
            <text x="620" y="355" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="12" fontWeight="bold" fill="#ffffff">SGD</text>
          </g>
          
          {/* Tier 4: Local Currencies */}
          {/* MXN */}
          <circle cx="130" cy="450" r="14" fill="url(#tier4Gradient)" filter="url(#glow2)"/>
          <text x="130" y="455" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="10" fontWeight="bold" fill="#ffffff">MXN</text>
          
          {/* BRL */}
          <circle cx="200" cy="450" r="14" fill="url(#tier4Gradient)" filter="url(#glow2)"/>
          <text x="200" y="455" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="10" fontWeight="bold" fill="#ffffff">BRL</text>
          
          {/* ZAR */}
          <circle cx="270" cy="450" r="14" fill="url(#tier4Gradient)" filter="url(#glow2)"/>
          <text x="270" y="455" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="10" fontWeight="bold" fill="#ffffff">ZAR</text>
          
          {/* THB */}
          <circle cx="340" cy="450" r="14" fill="url(#tier4Gradient)" filter="url(#glow2)"/>
          <text x="340" y="455" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="10" fontWeight="bold" fill="#ffffff">THB</text>
          
          {/* INR */}
          <circle cx="410" cy="450" r="14" fill="url(#tier4Gradient)" filter="url(#glow2)"/>
          <text x="410" y="455" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="10" fontWeight="bold" fill="#ffffff">INR</text>
          
          {/* PLN */}
          <circle cx="480" cy="450" r="14" fill="url(#tier4Gradient)" filter="url(#glow2)"/>
          <text x="480" y="455" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="10" fontWeight="bold" fill="#ffffff">PLN</text>
          
          {/* TRY */}
          <circle cx="550" cy="450" r="14" fill="url(#tier4Gradient)" filter="url(#glow2)"/>
          <text x="550" y="455" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="10" fontWeight="bold" fill="#ffffff">TRY</text>
          
          {/* AED */}
          <circle cx="620" cy="450" r="14" fill="url(#tier4Gradient)" filter="url(#glow2)"/>
          <text x="620" y="455" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="10" fontWeight="bold" fill="#ffffff">AED</text>
          
          {/* Footer with currency explanations */}
          <rect x="100" y="510" width="600" height="80" rx="10" ry="10" fill="#ffffff" fillOpacity="0.05"/>
          <text x="400" y="530" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="10" fill="#ffffff" opacity="0.7">
            Currency codes: USD (US Dollar), EUR (Euro), JPY (Japanese Yen), GBP (British Pound), CNY (Chinese Yuan),
          </text>
          <text x="400" y="550" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="10" fill="#ffffff" opacity="0.7">
            CHF (Swiss Franc), CAD (Canadian Dollar), AUD (Australian Dollar), SGD (Singapore Dollar),
          </text>
          <text x="400" y="570" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="10" fill="#ffffff" opacity="0.7">
            MXN (Mexican Peso), BRL (Brazilian Real), ZAR (South African Rand), THB (Thai Baht),
          </text>
          <text x="400" y="590" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="10" fill="#ffffff" opacity="0.7">
            INR (Indian Rupee), PLN (Polish Złoty), TRY (Turkish Lira), AED (UAE Dirham)
          </text>
        </svg>
      </div>
      <div className="mt-8">
        <AdSense />
      </div>
    </div>
  );
};

export default CurrencyHierarchyPage; 