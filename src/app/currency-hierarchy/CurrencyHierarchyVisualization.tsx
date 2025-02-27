// Client-side component for currency hierarchy visualization
'use client';

import React, { useState, useEffect } from 'react';
import AdSense from '../components/AdSense';
import { calculateCurrencyPairs } from '../services/forex';

interface CurrencyInfo {
  code: string;
  name: string;
  description: string;
  tier: number;
  x: number;
  y: number;
  exchangeRates?: {
    [key: string]: number;
  };
}

const currencyData: { [key: string]: CurrencyInfo } = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    description: 'Global reserve currency, dominates international trade and foreign exchange reserves.',
    tier: 1,
    x: 600,
    y: 225
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    description: 'Second most traded currency, official currency of the Eurozone.',
    tier: 2,
    x: 200,
    y: 375
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    description: 'Major Asian currency, known for its role in carry trades.',
    tier: 2,
    x: 400,
    y: 375
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    description: 'Oldest currency still in use, major reserve currency.',
    tier: 2,
    x: 600,
    y: 375
  },
  CNH: {
    code: 'CNH',
    name: 'Offshore Chinese Yuan',
    description: 'Offshore trading version of the Chinese Yuan, increasingly important in global trade.',
    tier: 2,
    x: 800,
    y: 375
  },
  CHF: {
    code: 'CHF',
    name: 'Swiss Franc',
    description: 'Traditional safe-haven currency, known for stability.',
    tier: 2,
    x: 1000,
    y: 375
  },
  CNY: {
    code: 'CNY',
    name: 'Chinese Yuan',
    description: 'Growing international currency, backed by world\'s second-largest economy.',
    tier: 3,
    x: 120,
    y: 525
  },
  KRW: {
    code: 'KRW',
    name: 'South Korean Won',
    description: 'Major Asian economy currency, important in technology trade.',
    tier: 3,
    x: 240,
    y: 525
  },
  HKD: {
    code: 'HKD',
    name: 'Hong Kong Dollar',
    description: 'Major financial hub currency, pegged to USD.',
    tier: 3,
    x: 360,
    y: 525
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    description: 'Commodity currency, closely tied to natural resources.',
    tier: 3,
    x: 480,
    y: 525
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    description: 'Major commodity currency, highly traded in Asian markets.',
    tier: 3,
    x: 600,
    y: 525
  },
  NZD: {
    code: 'NZD',
    name: 'New Zealand Dollar',
    description: 'Commodity currency, known for high interest rates.',
    tier: 3,
    x: 720,
    y: 525
  },
  SGD: {
    code: 'SGD',
    name: 'Singapore Dollar',
    description: 'Major Asian financial hub currency, known for stability.',
    tier: 3,
    x: 840,
    y: 525
  },
  SEK: {
    code: 'SEK',
    name: 'Swedish Krona',
    description: 'Important European currency outside Eurozone.',
    tier: 3,
    x: 960,
    y: 525
  },
  NOK: {
    code: 'NOK',
    name: 'Norwegian Krone',
    description: 'Oil-linked currency, stable European economy.',
    tier: 3,
    x: 1080,
    y: 525
  },
  MXN: {
    code: 'MXN',
    name: 'Mexican Peso',
    description: 'Most traded currency in Latin America.',
    tier: 4,
    x: 195,
    y: 675
  },
  BRL: {
    code: 'BRL',
    name: 'Brazilian Real',
    description: 'Major South American currency.',
    tier: 4,
    x: 300,
    y: 675
  },
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    description: 'Currency of one of the world\'s largest economies.',
    tier: 4,
    x: 450,
    y: 675
  },
  ZAR: {
    code: 'ZAR',
    name: 'South African Rand',
    description: 'Most traded African currency.',
    tier: 4,
    x: 600,
    y: 675
  },
  RUB: {
    code: 'RUB',
    name: 'Russian Ruble',
    description: 'Major commodity currency.',
    tier: 4,
    x: 750,
    y: 675
  },
  TRY: {
    code: 'TRY',
    name: 'Turkish Lira',
    description: 'Important regional currency in the Middle East.',
    tier: 4,
    x: 900,
    y: 675
  }
};

const CurrencyHierarchyVisualization: React.FC = () => {
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

  const getPathCoordinates = (path: string | undefined): { x: number, y: number } | null => {
    if (!path) return null;
    
    const parts = path.split(' ');
    if (parts.length < 3) return null;
    
    const midPoint = parts[2];
    if (!midPoint) return null;
    
    const coords = midPoint.split(',');
    if (coords.length !== 2) return null;
    
    const [x, y] = coords.map(Number);
    if (isNaN(x) || isNaN(y)) return null;
    
    return { x, y };
  };

  const ConnectionPath = ({ 
    from, 
    to, 
    path, 
    selected = false 
  }: { 
    from: string; 
    to: string; 
    path: string; 
    selected?: boolean;
  }) => {
    const rate = exchangeRates[from]?.[to];
    const formattedRate = rate ? formatRate(rate) : '';
    const coordinates = getPathCoordinates(path);
    const x = coordinates?.x ?? 0;
    const y = coordinates?.y ?? 0;
    
    return (
      <g>
        <path 
          d={path} 
          stroke={selected ? "#60A5FA" : "url(#connectionGradient)"} 
          strokeWidth={selected ? "3" : "2"} 
          opacity={selected ? "0.8" : "0.5"} 
          fill="none"
          filter={selected ? "url(#glow1)" : undefined}
        />
        {rate && (
          <g transform={`translate(${x},${y})`}>
            <rect
              x="-35"
              y="-14"
              width="70"
              height="28"
              rx="6"
              fill="#1F2937"
              stroke="#3B82F6"
              strokeWidth="1"
              filter="url(#dropShadow)"
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fontFamily="'Helvetica Neue', Arial, sans-serif"
              fontSize="13"
              fill="#F3F4F6"
              className="font-medium"
            >
              {formattedRate}
            </text>
          </g>
        )}
      </g>
    );
  };

  const renderCurrencyNode = (currency: CurrencyInfo) => {
    const isSelected = selectedCurrency === currency.code;
    const radius = currency.tier === 1 ? 45 : currency.tier === 2 ? 40 : currency.tier === 3 ? 35 : 30;
    
    return (
      <g
        key={currency.code}
        transform={`translate(${currency.x},${currency.y})`}
        onClick={() => setSelectedCurrency(currency.code)}
        className="cursor-pointer"
        filter="url(#dropShadow)"
      >
        <circle
          r={radius}
          fill={isSelected ? "#2563EB" : "#1F2937"}
          stroke={isSelected ? "#60A5FA" : "#3B82F6"}
          strokeWidth={isSelected ? 3 : 2}
          className="transition-all duration-200"
          filter={isSelected ? "url(#glow1)" : undefined}
        />
        <text
          y="-8"
          textAnchor="middle"
          fill={isSelected ? "#F3F4F6" : "#D1D5DB"}
          fontSize="16"
          className="font-semibold"
        >
          {currency.code}
        </text>
        <text
          y="12"
          textAnchor="middle"
          fill={isSelected ? "#E5E7EB" : "#9CA3AF"}
          fontSize="12"
        >
          {currency.name}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-gray-900 rounded-xl shadow-2xl">
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-xl z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-xl z-10">
            <div className="text-red-500 bg-gray-800 px-4 py-2 rounded-lg shadow-lg">
              {error}
            </div>
          </div>
        )}
        <svg 
          viewBox="0 0 1200 900" 
          className="w-full min-h-[600px] bg-gray-900 rounded-xl"
        >
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.6" />
            </linearGradient>
            <filter id="glow1">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="dropShadow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="1" dy="1"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect x="0" y="0" width="1200" height="900" fill="#111827" rx="12"/>

          {/* Grid lines */}
          <g stroke="#1F2937" strokeWidth="1">
            <line x1="0" y1="225" x2="1200" y2="225"/>
            <line x1="0" y1="375" x2="1200" y2="375"/>
            <line x1="0" y1="525" x2="1200" y2="525"/>
            <line x1="0" y1="675" x2="1200" y2="675"/>
            <line x1="300" y1="0" x2="300" y2="900"/>
            <line x1="600" y1="0" x2="600" y2="900"/>
            <line x1="900" y1="0" x2="900" y2="900"/>
          </g>

          {/* Title */}
          <text
            x="600"
            y="90"
            textAnchor="middle"
            className="text-4xl font-bold"
            fill="#F3F4F6"
            filter="url(#dropShadow)"
          >
            Currency Hierarchy
          </text>

          {/* Legend */}
          <g transform="translate(50, 50)">
            <rect width="250" height="120" rx="8" fill="#1F2937" filter="url(#dropShadow)"/>
            <text x="20" y="40" fill="#F3F4F6" fontSize="16">
              Tier 1: Reserve Currency
            </text>
            <text x="20" y="70" fill="#D1D5DB" fontSize="16">
              Tier 2: Major Currency
            </text>
            <text x="20" y="100" fill="#9CA3AF" fontSize="16">
              Tier 3: Secondary Currency
            </text>
          </g>

          {/* Currency Nodes */}
          {Object.values(currencyData).map(currency => renderCurrencyNode(currency))}

          {/* Connection paths */}
          <g>
            {/* USD to Tier 2 connections */}
            <ConnectionPath 
              from="USD" 
              to="EUR" 
              path="M600,270 Q600,322 200,375" 
              selected={selectedCurrency === 'USD'} 
            />
            <ConnectionPath 
              from="USD" 
              to="JPY" 
              path="M600,270 Q600,322 400,375" 
              selected={selectedCurrency === 'USD'} 
            />
            <ConnectionPath 
              from="USD" 
              to="GBP" 
              path="M600,270 L600,375" 
              selected={selectedCurrency === 'USD'} 
            />
            <ConnectionPath 
              from="USD" 
              to="CNH" 
              path="M600,270 Q600,322 800,375" 
              selected={selectedCurrency === 'USD'} 
            />
            <ConnectionPath 
              from="USD" 
              to="CHF" 
              path="M600,270 Q600,322 1000,375" 
              selected={selectedCurrency === 'USD'} 
            />

            {/* EUR to Tier 3 connections */}
            <ConnectionPath 
              from="EUR" 
              to="CNY" 
              path="M200,411 Q200,468 120,525" 
              selected={selectedCurrency === 'EUR'} 
            />
            <ConnectionPath 
              from="EUR" 
              to="KRW" 
              path="M200,411 Q200,468 240,525" 
              selected={selectedCurrency === 'EUR'} 
            />
            <ConnectionPath 
              from="EUR" 
              to="SEK" 
              path="M200,411 Q200,468 960,525" 
              selected={selectedCurrency === 'EUR'} 
            />
            <ConnectionPath 
              from="EUR" 
              to="NOK" 
              path="M200,411 Q200,468 1080,525" 
              selected={selectedCurrency === 'EUR'} 
            />

            {/* JPY to Tier 3 connections */}
            <ConnectionPath 
              from="JPY" 
              to="HKD" 
              path="M400,411 Q400,468 360,525" 
              selected={selectedCurrency === 'JPY'} 
            />
            <ConnectionPath 
              from="JPY" 
              to="SGD" 
              path="M400,411 Q400,468 840,525" 
              selected={selectedCurrency === 'JPY'} 
            />

            {/* GBP to Tier 3 connections */}
            <ConnectionPath 
              from="GBP" 
              to="CAD" 
              path="M600,411 Q600,468 480,525" 
              selected={selectedCurrency === 'GBP'} 
            />
            <ConnectionPath 
              from="GBP" 
              to="AUD" 
              path="M600,411 Q600,468 600,525" 
              selected={selectedCurrency === 'GBP'} 
            />

            {/* CNH to Tier 3 connections */}
            <ConnectionPath 
              from="CNH" 
              to="NZD" 
              path="M800,411 Q800,468 720,525" 
              selected={selectedCurrency === 'CNH'} 
            />

            {/* CHF to Tier 3 connections */}
            <ConnectionPath 
              from="CHF" 
              to="SEK" 
              path="M1000,411 Q1000,468 960,525" 
              selected={selectedCurrency === 'CHF'} 
            />
            <ConnectionPath 
              from="CHF" 
              to="NOK" 
              path="M1000,411 Q1000,468 1080,525" 
              selected={selectedCurrency === 'CHF'} 
            />

            {/* Tier 3 to Tier 4 connections */}
            <ConnectionPath 
              from="CNY" 
              to="MXN" 
              path="M120,552 Q120,613 195,675" 
              selected={selectedCurrency === 'CNY'} 
            />
            <ConnectionPath 
              from="KRW" 
              to="BRL" 
              path="M240,552 Q240,613 300,675" 
              selected={selectedCurrency === 'KRW'} 
            />
            <ConnectionPath 
              from="HKD" 
              to="INR" 
              path="M360,552 Q360,613 450,675" 
              selected={selectedCurrency === 'HKD'} 
            />
            <ConnectionPath 
              from="CAD" 
              to="ZAR" 
              path="M480,552 Q480,613 600,675" 
              selected={selectedCurrency === 'CAD'} 
            />
            <ConnectionPath 
              from="NZD" 
              to="RUB" 
              path="M720,552 Q720,613 750,675" 
              selected={selectedCurrency === 'NZD'} 
            />
            <ConnectionPath 
              from="SGD" 
              to="TRY" 
              path="M840,552 Q840,613 900,675" 
              selected={selectedCurrency === 'SGD'} 
            />
          </g>
        </svg>
      </div>
      <div className="mt-8">
        <AdSense />
      </div>
    </div>
  );
};

export default CurrencyHierarchyVisualization; 