'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import InfoPanel from '../components/InfoPanel';
import { economicMetrics } from '../data/economicMetrics';
import dynamic from 'next/dynamic';
import type { HistoricalPoint } from '../components/EconomicGravityMap';

// Dynamically import the map component to avoid SSR issues
const EconomicGravityMap = dynamic(
  () => import('../components/EconomicGravityMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading map...</span>
      </div>
    )
  }
);

// Historical economic centers of gravity (approximate coordinates and data)
const historicalData: HistoricalPoint[] = [
  { 
    year: -2000, 
    label: '2000 BCE', 
    center: 'Mesopotamia', 
    lat: 33.2232, 
    lon: 43.6793, 
    description: 'Ancient Mesopotamian civilizations dominated through agriculture and trade',
    details: {
      mainCities: 'Ur, Babylon, Nineveh',
      keyTrade: 'Grain, textiles, metals',
      innovations: 'Writing, wheel, irrigation',
      economicSystem: 'Temple-based economy, early banking'
    }
  },
  { 
    year: -1000, 
    label: '1000 BCE', 
    center: 'Mediterranean', 
    lat: 37.9838, 
    lon: 23.7275, 
    description: 'Greek civilization and Mediterranean trade networks',
    details: {
      mainCities: 'Athens, Corinth, Thebes',
      keyTrade: 'Olive oil, wine, pottery',
      innovations: 'Coinage, maritime trade',
      economicSystem: 'City-state based trade networks'
    }
  },
  { 
    year: -500, 
    label: '500 BCE', 
    center: 'Persia', 
    lat: 32.6546, 
    lon: 51.6680, 
    description: 'Persian Empire and Silk Road beginnings',
    details: {
      mainCities: 'Persepolis, Susa, Ecbatana',
      keyTrade: 'Spices, precious metals, textiles',
      innovations: 'Royal road system, standardized currency',
      economicSystem: 'Imperial taxation and trade routes'
    }
  },
  { 
    year: 0, 
    label: '1 CE', 
    center: 'Roman Empire', 
    lat: 41.9028, 
    lon: 12.4964, 
    description: 'Height of Roman Empire\'s economic power',
    details: {
      mainCities: 'Rome, Alexandria, Antioch',
      keyTrade: 'Grain, wine, precious metals',
      innovations: 'Road networks, banking system',
      economicSystem: 'Monetary economy, state commerce'
    }
  },
  { 
    year: 500, 
    label: '500 CE', 
    center: 'Constantinople', 
    lat: 41.0082, 
    lon: 28.9784, 
    description: 'Byzantine Empire\'s trade dominance',
    details: {
      mainCities: 'Constantinople, Thessalonica, Ravenna',
      keyTrade: 'Silk, spices, precious stones',
      innovations: 'Greek fire, advanced architecture',
      economicSystem: 'State-controlled commerce'
    }
  },
  { 
    year: 1000, 
    label: '1000 CE', 
    center: 'Baghdad', 
    lat: 33.3152, 
    lon: 44.3661, 
    description: 'Islamic Golden Age',
    details: {
      mainCities: 'Baghdad, Cairo, Damascus',
      keyTrade: 'Paper, textiles, scientific instruments',
      innovations: 'Algebra, advanced astronomy',
      economicSystem: 'Advanced banking and trade'
    }
  },
  { 
    year: 1500, 
    label: '1500 CE', 
    center: 'Venice/Ottoman', 
    lat: 45.4408, 
    lon: 12.3155, 
    description: 'Renaissance Europe and Ottoman Empire',
    details: {
      mainCities: 'Venice, Florence, Istanbul',
      keyTrade: 'Luxury goods, spices, art',
      innovations: 'Double-entry bookkeeping, joint-stock companies',
      economicSystem: 'Maritime trade, banking houses'
    }
  },
  { 
    year: 1700, 
    label: '1700 CE', 
    center: 'Western Europe', 
    lat: 48.8566, 
    lon: 2.3522, 
    description: 'Early Industrial Revolution',
    details: {
      mainCities: 'London, Amsterdam, Paris',
      keyTrade: 'Textiles, colonial goods, machinery',
      innovations: 'Steam power, mechanization',
      economicSystem: 'Early industrial capitalism'
    }
  },
  { 
    year: 1800, 
    label: '1800 CE', 
    center: 'London', 
    lat: 51.5074, 
    lon: -0.1278, 
    description: 'British Empire and Industrial Revolution',
    details: {
      mainCities: 'London, Manchester, Liverpool',
      keyTrade: 'Industrial goods, raw materials',
      innovations: 'Mass production, railways',
      economicSystem: 'Industrial capitalism'
    }
  },
  { 
    year: 1900, 
    label: '1900 CE', 
    center: 'Atlantic', 
    lat: 40.7128, 
    lon: -74.0060, 
    description: 'Rise of American economic power',
    details: {
      mainCities: 'New York, Chicago, London',
      keyTrade: 'Industrial goods, oil, automobiles',
      innovations: 'Mass production, electricity',
      economicSystem: 'Corporate capitalism'
    }
  },
  { 
    year: 2000, 
    label: '2000 CE', 
    center: 'North Atlantic', 
    lat: 42.3601, 
    lon: -71.0589, 
    description: 'American-European economic dominance',
    details: {
      mainCities: 'New York, London, Tokyo',
      keyTrade: 'Financial services, technology',
      innovations: 'Internet, digital revolution',
      economicSystem: 'Global financial capitalism'
    }
  },
  { 
    year: 2023, 
    label: '2023 CE', 
    center: 'East Asia', 
    lat: 34.3416, 
    lon: 108.9398, 
    description: 'Shift towards Asian economic power',
    details: {
      mainCities: 'Shanghai, Beijing, Tokyo',
      keyTrade: 'Electronics, AI, renewable energy',
      innovations: 'AI, quantum computing',
      economicSystem: 'Mixed state/market capitalism'
    }
  }
];

// GDP share data (approximate percentages)
const gdpShareData = historicalData.map(point => ({
  year: point.year,
  label: point.label,
  Asia: point.year <= 1500 ? 60 - (point.year + 2000) * 0.01 : 20 + (point.year - 1500) * 0.04,
  Europe: point.year <= 1500 ? 20 + (point.year + 2000) * 0.01 : 40 - (point.year - 1500) * 0.02,
  Americas: point.year <= 1500 ? 10 : 20 + (point.year - 1500) * 0.02,
  Africa: point.year <= 1500 ? 10 : 5,
  Oceania: point.year <= 1500 ? 0 : 2
}));

const EconomicGravityPage = () => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [selectedPoint, setSelectedPoint] = useState<HistoricalPoint | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Dispatch theme change event when isDarkMode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('themeChange'));
    }
  }, [isDarkMode]);

  // Define unified theme colors
  const themeColors = {
    background: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    cardHoverBg: isDarkMode ? 'bg-gray-700' : 'bg-gray-50',
    selectedCardBg: isDarkMode ? 'from-blue-900 to-indigo-900' : 'from-blue-50 to-indigo-50',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    accent: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    shadow: isDarkMode ? 'shadow-blue-900/20' : 'shadow-blue-100',
  };

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 ${themeColors.text} ${themeColors.background} min-h-screen`}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Economic Center of Gravity Through History</h1>
          <p className={`${themeColors.textSecondary} max-w-xl`}>
            Tracking the shift of global economic power from ancient civilizations to modern times. Explore how economic dominance has moved across continents and empires throughout human history.
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

      {/* World Map Visualization - NEW RESPONSIVE MAP */}
      <div className={`mb-12 p-4 sm:p-6 rounded-2xl relative ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-gray-700' 
          : 'bg-gradient-to-br from-white via-gray-50 to-white border border-gray-100'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className={`text-xl sm:text-2xl font-bold flex items-center ${themeColors.text}`}>
            <span className={`inline-block w-2 h-2 rounded-full mr-3 bg-blue-500`} />
            Global Economic Center of Gravity
          </h2>
          {/* Info Panel for Economic Center of Gravity */}
          <InfoPanel
            metric={economicMetrics.economicCenterOfGravity}
            isDarkMode={isDarkMode}
            position="top-right"
            size="small"
          />
        </div>
        
        {/* Responsive Interactive Map */}
        <EconomicGravityMap
          historicalData={historicalData}
          selectedPoint={selectedPoint}
          onSelectPoint={setSelectedPoint}
          isDarkMode={isDarkMode}
        />
        
        <div className={`mt-4 text-sm ${themeColors.textSecondary} italic`}>
          Click on any numbered marker to see details. Use the buttons or pinch/scroll to zoom. The trail shows the movement of economic power over time.
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className={`p-4 sm:p-8 rounded-2xl mb-12 relative ${themeColors.cardBg} border ${themeColors.border} shadow-lg ${themeColors.shadow} backdrop-blur-sm`}>
        <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center ${themeColors.text}`}>
          <span className={`inline-block w-2 h-2 rounded-full mr-3 bg-blue-500`} />
          Historical Timeline
        </h2>
        
        <p className={`text-sm mb-6 ${themeColors.textSecondary} max-w-2xl`}>
          Track the shifting balance of global economic power across continents and time periods. 
          The chart shows the relative share of global GDP by region, revealing how economic 
          dominance has moved from ancient civilizations to modern economic powerhouses.
        </p>
        <div className="h-[300px] sm:h-[400px] md:h-[500px] relative">
          {/* Info Panel for GDP Share by Region */}
          <div className="absolute top-0 right-0 z-10">
            <InfoPanel
              metric={economicMetrics.gdpShareByRegion}
              isDarkMode={isDarkMode}
              position="top-right"
              size="small"
            />
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gdpShareData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
              {/* Define gradients for enhanced visual appeal */}
              <defs>
                <linearGradient id="asiaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="europeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="americasGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="africaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#eab308" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#eab308" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="oceaniaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              
              {/* Enhanced grid with better opacity and styling */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                strokeWidth={0.5}
                vertical={false}
              />
              
              {/* Enhanced X-axis with better styling */}
              <XAxis 
                dataKey="label" 
                stroke={themeColors.textSecondary}
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ 
                  fontSize: 10, 
                  fill: isDarkMode ? '#9ca3af' : '#6b7280',
                  fontWeight: 500
                }}
                axisLine={{ 
                  stroke: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  strokeWidth: 1
                }}
                tickLine={{ 
                  stroke: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                  strokeWidth: 1
                }}
                interval={0}
              />
              
              {/* Enhanced Y-axis with better styling */}
              <YAxis 
                stroke={themeColors.textSecondary}
                tick={{ 
                  fontSize: 10, 
                  fill: isDarkMode ? '#9ca3af' : '#6b7280',
                  fontWeight: 500
                }}
                axisLine={{ 
                  stroke: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  strokeWidth: 1
                }}
                tickLine={{ 
                  stroke: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                  strokeWidth: 1
                }}
                width={35}
                label={{ 
                  value: 'GDP Share (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { 
                    textAnchor: 'middle', 
                    fill: isDarkMode ? '#9ca3af' : '#6b7280',
                    fontSize: 11,
                    fontWeight: 600
                  },
                  offset: 10
                }}
              />
              
              {/* Enhanced tooltip with better styling and information */}
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
                  color: isDarkMode ? '#e5e7eb' : '#374151',
                  fontSize: '12px',
                  padding: '12px 16px'
                }}
                labelStyle={{
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: isDarkMode ? '#60a5fa' : '#3b82f6'
                }}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`,
                  name
                ]}
              />
              
              {/* Enhanced legend with better styling */}
              <Legend 
                verticalAlign="top"
                height={36}
                wrapperStyle={{
                  paddingBottom: '10px',
                  fontSize: '11px',
                  fontWeight: 500
                }}
                iconType="circle"
                iconSize={8}
              />
              
              {/* Enhanced line charts with gradients and better styling */}
              <Line 
                type="monotone" 
                dataKey="Asia" 
                stroke="#f97316" 
                strokeWidth={2}
                dot={{ 
                  r: 3, 
                  fill: '#f97316',
                  stroke: isDarkMode ? '#1f2937' : '#ffffff',
                  strokeWidth: 2
                }}
                activeDot={{ 
                  r: 6, 
                  fill: '#f97316',
                  stroke: isDarkMode ? '#1f2937' : '#ffffff',
                  strokeWidth: 2
                }}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Line 
                type="monotone" 
                dataKey="Europe" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ 
                  r: 3, 
                  fill: '#3b82f6',
                  stroke: isDarkMode ? '#1f2937' : '#ffffff',
                  strokeWidth: 2
                }}
                activeDot={{ 
                  r: 6, 
                  fill: '#3b82f6',
                  stroke: isDarkMode ? '#1f2937' : '#ffffff',
                  strokeWidth: 2
                }}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Line 
                type="monotone" 
                dataKey="Americas" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ 
                  r: 3, 
                  fill: '#22c55e',
                  stroke: isDarkMode ? '#1f2937' : '#ffffff',
                  strokeWidth: 2
                }}
                activeDot={{ 
                  r: 6, 
                  fill: '#22c55e',
                  stroke: isDarkMode ? '#1f2937' : '#ffffff',
                  strokeWidth: 2
                }}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Line 
                type="monotone" 
                dataKey="Africa" 
                stroke="#eab308" 
                strokeWidth={2}
                dot={{ 
                  r: 3, 
                  fill: '#eab308',
                  stroke: isDarkMode ? '#1f2937' : '#ffffff',
                  strokeWidth: 2
                }}
                activeDot={{ 
                  r: 6, 
                  fill: '#eab308',
                  stroke: isDarkMode ? '#1f2937' : '#ffffff',
                  strokeWidth: 2
                }}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Line 
                type="monotone" 
                dataKey="Oceania" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ 
                  r: 3, 
                  fill: '#8b5cf6',
                  stroke: isDarkMode ? '#1f2937' : '#ffffff',
                  strokeWidth: 2
                }}
                activeDot={{ 
                  r: 6, 
                  fill: '#8b5cf6',
                  stroke: isDarkMode ? '#1f2937' : '#ffffff',
                  strokeWidth: 2
                }}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Timeline insights and analysis */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${themeColors.border} hover:shadow-md transition-all duration-300`}>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
              <h4 className={`font-semibold text-sm ${themeColors.text}`}>Ancient Era</h4>
            </div>
            <p className={`text-xs ${themeColors.textSecondary}`}>
              Asia dominated with advanced agriculture, trade networks, and early civilizations
            </p>
            <div className="mt-2 text-xs text-orange-500 font-medium">
              Peak: 60-70% of global GDP
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${themeColors.border} hover:shadow-md transition-all duration-300`}>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <h4 className={`font-semibold text-sm ${themeColors.text}`}>Medieval Period</h4>
            </div>
            <p className={`text-xs ${themeColors.textSecondary}`}>
              Europe began its rise through trade, banking, and maritime exploration
            </p>
            <div className="mt-2 text-xs text-blue-500 font-medium">
              Peak: 40-50% of global GDP
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${themeColors.border} hover:shadow-md transition-all duration-300`}>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <h4 className={`font-semibold text-sm ${themeColors.text}`}>Modern Era</h4>
            </div>
            <p className={`text-xs ${themeColors.textSecondary}`}>
              Americas emerged as economic powerhouses through industrialization
            </p>
            <div className="mt-2 text-xs text-green-500 font-medium">
              Peak: 25-30% of global GDP
            </div>
          </div>
        </div>
        
        {/* Enhanced chart statistics */}
        <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border`}>
          <h4 className={`font-semibold text-sm mb-3 ${themeColors.text} flex items-center`}>
            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Key Economic Shifts
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="text-center">
              <div className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>2000 BCE</div>
              <div className={themeColors.textSecondary}>Asia: 70%</div>
            </div>
            <div className="text-center">
              <div className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>500 CE</div>
              <div className={themeColors.textSecondary}>Asia: 65%</div>
            </div>
            <div className="text-center">
              <div className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>1500 CE</div>
              <div className={themeColors.textSecondary}>Europe: 45%</div>
            </div>
            <div className="text-center">
              <div className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>2000 CE</div>
              <div className={themeColors.textSecondary}>Americas: 28%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Points - Compact Grid */}
      <div className={`mb-12 p-4 sm:p-6 rounded-2xl ${themeColors.cardBg} border ${themeColors.border}`}>
        <h2 className={`text-xl sm:text-2xl font-bold mb-6 flex items-center ${themeColors.text}`}>
          <span className={`inline-block w-2 h-2 rounded-full mr-3 bg-blue-500`} />
          Historical Economic Centers
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {historicalData.map((point, index) => (
            <button
              key={point.year}
              className={`p-4 rounded-xl text-left transition-all duration-300 transform hover:-translate-y-1 border ${themeColors.border} ${
                selectedPoint?.year === point.year
                  ? `bg-gradient-to-br ${themeColors.selectedCardBg} shadow-lg ring-2 ring-blue-500`
                  : `${themeColors.cardBg} hover:shadow-md`
              }`}
              onClick={() => setSelectedPoint(selectedPoint?.year === point.year ? null : point)}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                  selectedPoint?.year === point.year 
                    ? 'bg-amber-500 text-white' 
                    : isDarkMode ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <h3 className={`text-sm font-bold ${themeColors.text}`}>{point.center}</h3>
                  <p className={`text-xs ${themeColors.textTertiary}`}>{point.label}</p>
                </div>
              </div>
              <p className={`text-xs ${themeColors.textSecondary} line-clamp-2`}>
                {point.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className={`p-4 sm:p-8 rounded-2xl mb-12 ${themeColors.cardBg} border ${themeColors.border} shadow-lg ${themeColors.shadow}`}>
        <h2 className={`text-xl sm:text-2xl font-bold mb-6 sm:mb-8 flex items-center ${themeColors.text}`}>
          <span className={`inline-block w-2 h-2 rounded-full mr-3 bg-blue-500`} />
          Historical Analysis
        </h2>
        <div className="space-y-6 sm:space-y-8">
          {[
            {
              title: 'Ancient Period (2000 BCE - 500 BCE)',
              content: 'The economic center began in Mesopotamia with the development of sophisticated agricultural systems and irrigation networks. Sumerian city-states pioneered the first writing systems for trade records and contracts. The rise of Bronze Age civilizations established long-distance trade networks, while innovations like the potter\'s wheel and metallurgy spurred economic growth.',
              events: [
                '3000 BCE: Development of cuneiform writing system',
                '2500 BCE: Great Pyramid construction demonstrates economic organization',
                '1750 BCE: Code of Hammurabi standardizes commercial laws',
                '600 BCE: Introduction of Lydian coins'
              ]
            },
            {
              title: 'Classical Period (500 BCE - 500 CE)',
              content: 'This era saw unprecedented economic integration under major empires. The Roman Empire created a vast economic network with standardized currency, banking systems, and trade laws. The Silk Road emerged as a crucial East-West trade artery, connecting Roman markets with Han Dynasty China.',
              events: [
                '500 BCE: Athens emerges as trading power',
                '330 BCE: Alexander\'s conquests create vast network',
                '27 BCE: Augustus establishes Roman economic system',
                '100 CE: Peak of Roman trade network'
              ]
            },
            {
              title: 'Medieval Period (500 CE - 1500 CE)',
              content: 'The Islamic Golden Age transformed the economic landscape, with Baghdad becoming a global center of trade, science, and innovation. In Europe, Italian city-states like Venice and Florence pioneered modern banking practices.',
              events: [
                '750 CE: Abbasid Caliphate establishes Baghdad as trade hub',
                '1000 CE: Song Dynasty introduces paper money',
                '1200 CE: Formation of Hanseatic League',
                '1450 CE: Medici Bank pioneers modern banking'
              ]
            },
            {
              title: 'Modern Period (1500 CE - Present)',
              content: 'The age of exploration shifted economic power to Western Europe. The Industrial Revolution transformed production methods. The 20th century brought American economic dominance. The Digital Revolution and globalization have recently shifted economic gravity toward East Asia.',
              events: [
                '1602: Dutch East India Company creates first stock market',
                '1776: Industrial Revolution begins in Britain',
                '1944: Bretton Woods monetary system established',
                '1978: China begins market reforms',
                '2020: Digital acceleration due to pandemic'
              ]
            }
          ].map((period, index) => (
            <details 
              key={index}
              className={`group rounded-xl border ${themeColors.border} ${themeColors.cardBg} overflow-hidden`}
            >
              <summary className={`p-4 sm:p-6 cursor-pointer list-none flex items-center justify-between ${
                isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
              } transition-colors`}>
                <h3 className={`text-base sm:text-xl font-bold ${themeColors.text}`}>{period.title}</h3>
                <svg 
                  className={`w-5 h-5 ${themeColors.textSecondary} transition-transform group-open:rotate-180`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className={`px-4 sm:px-6 pb-4 sm:pb-6 border-t ${themeColors.border}`}>
                <p className={`${themeColors.textSecondary} mt-4 mb-4 text-sm`}>{period.content}</p>
                <div>
                  <h4 className={`text-sm sm:text-base font-semibold mb-3 ${themeColors.text}`}>Key Economic Events:</h4>
                  <ul className={`space-y-2 text-sm ${themeColors.textSecondary}`}>
                    {period.events.map((event, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                        {event}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Methodology Note */}
      <div className={`p-4 sm:p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
        <h3 className={`text-base sm:text-lg font-bold mb-4 flex items-center ${themeColors.text}`}>
          <span className={`inline-block w-2 h-2 rounded-full mr-3 bg-blue-500`} />
          Methodology Note
        </h3>
        <p className={`text-sm ${themeColors.textTertiary}`}>
          This visualization is based on historical economic data and research from various academic sources.
          GDP shares are approximated for ancient periods where exact data is unavailable.
          Modern period data (1500 CE onwards) is derived from economic historians' estimates and World Bank data.
        </p>
      </div>
    </div>
  );
};

export default EconomicGravityPage;
