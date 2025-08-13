'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

// Historical economic centers of gravity (approximate coordinates and data)
const historicalData = [
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

const ThemeToggle = ({ isDarkMode, onToggle }: { isDarkMode: boolean; onToggle: () => void }) => {
  return (
    <button
      onClick={onToggle}
      className={`
        fixed top-4 right-4 p-2 rounded-full 
        transition-all duration-300 ease-in-out
        ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
        border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}
        shadow-lg
      `}
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? (
        <SunIcon className="w-6 h-6 text-yellow-400" />
      ) : (
        <MoonIcon className="w-6 h-6 text-gray-600" />
      )}
    </button>
  );
};

const EconomicGravityPage = () => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [selectedPoint, setSelectedPoint] = useState<(typeof historicalData)[0] | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Dispatch theme change event for navbar synchronization
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('themeChange'));
    }
  };

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
    <div className={`w-full max-w-6xl mx-auto p-3 sm:p-4 ${themeColors.text} ${themeColors.background} min-h-screen`}>
      <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Economic Center of Gravity Through History</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-100 max-w-xl">
            Tracking the shift of global economic power from ancient civilizations to modern times. Explore how economic dominance has moved across continents and empires throughout human history.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Light</span>
          <button
            className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full p-1 transition-colors duration-200 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white transform transition-transform duration-200 ${isDarkMode ? 'translate-x-5 sm:translate-x-6' : ''}`} />
          </button>
          <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Dark</span>
        </div>
      </div>

      {/* World Map Visualization */}
      <div className={`mb-8 sm:mb-12 p-4 sm:p-6 rounded-2xl ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-gray-700' 
          : 'bg-gradient-to-br from-white via-gray-50 to-white border border-gray-100'
      }`}>
        <h2 className={`text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 flex items-center ${themeColors.text}`}>
          <span className={`inline-block w-2 h-2 rounded-full mr-2 sm:mr-3 ${themeColors.accent}`} />
          Global Economic Center of Gravity
        </h2>
        <div className="relative w-full h-[600px] mb-6">
          {/* World Map with points overlay */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <img 
              src="/World map.jpg" 
              alt="World Map"
              className="w-full h-full object-cover"
              style={{ 
                filter: isDarkMode ? 'brightness(0.7) contrast(1.2)' : 'brightness(1) contrast(1)'
              }}
            />
            
            {/* SVG overlay for points and trails */}
            <svg 
              viewBox="0 0 1000 500" 
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Economic center points and trails */}
              <g className="pointer-events-auto">
                {historicalData.map((point, index) => {
                  // Convert lat/lon to SVG coordinates
                  const x = (point.lon + 180) * (1000 / 360);
                  const y = (90 - point.lat) * (500 / 180);
                  
                  // Draw trail to next point if it exists
                  const nextPoint = historicalData[index + 1];
                  const trail = nextPoint && (
                    <path
                      key={`trail-${point.year}`}
                      d={`M ${x} ${y} L ${(nextPoint.lon + 180) * (1000 / 360)} ${(90 - nextPoint.lat) * (500 / 180)}`}
                      stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
                      strokeWidth="2"
                      strokeDasharray="4"
                      opacity="0.8"
                    />
                  );

                  return (
                    <g key={point.year}>
                      {trail}
                      <circle
                        cx={x}
                        cy={y}
                        r={selectedPoint?.year === point.year ? 8 : 4}
                        fill={isDarkMode ? '#60a5fa' : '#3b82f6'}
                        opacity={selectedPoint?.year === point.year ? 1 : 0.8}
                        className="transition-all duration-300 cursor-pointer hover:opacity-100"
                        onClick={() => setSelectedPoint(point)}
                        filter="url(#glow)"
                      />
                      {selectedPoint?.year === point.year && (
                        <g>
                          <circle
                            cx={x}
                            cy={y}
                            r="12"
                            fill="none"
                            stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
                            strokeWidth="2"
                            opacity="0.3"
                            className="animate-ping"
                          />
                          {/* Enhanced info box */}
                          <rect
                            x={x + 15}
                            y={y - 85}
                            width="220"
                            height="120"
                            rx="6"
                            fill={isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)'}
                            stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                            strokeWidth="1"
                            className="drop-shadow-lg"
                          />
                          <text
                            x={x + 25}
                            y={y - 65}
                            fill={isDarkMode ? '#e5e7eb' : '#374151'}
                            fontSize="14"
                            fontWeight="bold"
                          >
                            {point.center}
                          </text>
                          <text
                            x={x + 25}
                            y={y - 45}
                            fill={isDarkMode ? '#9ca3af' : '#6b7280'}
                            fontSize="11"
                          >
                            {point.label}
                          </text>
                          <line
                            x1={x + 25}
                            y1={y - 35}
                            x2={x + 210}
                            y2={y - 35}
                            stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                            strokeWidth="1"
                          />
                          <foreignObject
                            x={x + 25}
                            y={y - 30}
                            width="200"
                            height="60"
                          >
                            <div className={`text-[10px] leading-tight ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                              <p><span className="font-semibold">Major Cities:</span> {point.details.mainCities}</p>
                              <p><span className="font-semibold">Key Trade:</span> {point.details.keyTrade}</p>
                              <p><span className="font-semibold">Innovations:</span> {point.details.innovations}</p>
                              <p><span className="font-semibold">Economy:</span> {point.details.economicSystem}</p>
                            </div>
                          </foreignObject>
                        </g>
                      )}
                      {/* Hover tooltip */}
                      <g 
                        className="opacity-0 hover:opacity-100 transition-opacity duration-200"
                        style={{ pointerEvents: 'none' }}
                      >
                        <rect
                          x={x + 10}
                          y={y - 25}
                          width="100"
                          height="20"
                          rx="4"
                          fill={isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)'}
                          stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                          strokeWidth="1"
                        />
                        <text
                          x={x + 15}
                          y={y - 10}
                          fill={isDarkMode ? '#e5e7eb' : '#374151'}
                          fontSize="11"
                        >
                          {point.center}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
              
              {/* Add glow effect for points */}
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
            </svg>
          </div>
        </div>
        <div className={`text-sm ${themeColors.textSecondary} italic`}>
          Click on any point to see details. The trail shows the movement of economic power over time.
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className={`p-4 sm:p-6 md:p-8 rounded-2xl mb-8 sm:mb-12 ${themeColors.cardBg} border ${themeColors.border} shadow-lg ${themeColors.shadow}`}>
        <h2 className={`text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 flex items-center ${themeColors.text}`}>
          <span className={`inline-block w-2 h-2 rounded-full mr-2 sm:mr-3 ${themeColors.accent}`} />
          Historical Timeline
        </h2>
        <div className="h-[400px] sm:h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gdpShareData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
              <XAxis 
                dataKey="label" 
                stroke={themeColors.textSecondary}
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 10, fill: isDarkMode ? '#e5e7eb' : '#374151' }}
              />
              <YAxis 
                stroke={themeColors.textSecondary}
                tick={{ fontSize: 10, fill: isDarkMode ? '#e5e7eb' : '#374151' }}
                label={{ 
                  value: 'Share of Global GDP (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: isDarkMode ? '#e5e7eb' : '#374151', fontSize: 10 }
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  color: isDarkMode ? '#e5e7eb' : '#374151',
                  fontSize: '12px'
                }}
              />
              <Legend 
                verticalAlign="top"
                height={30}
                wrapperStyle={{
                  paddingBottom: '15px',
                  fontSize: '12px',
                  color: isDarkMode ? '#e5e7eb' : '#374151'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="Asia" 
                stroke="#f97316" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                fillOpacity={1}
                fill="url(#asiaGradient)"
              />
              <Line 
                type="monotone" 
                dataKey="Europe" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                fillOpacity={1}
                fill="url(#europeGradient)"
              />
              <Line type="monotone" dataKey="Americas" stroke="#22c55e" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="Africa" stroke="#eab308" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="Oceania" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {historicalData.map((point) => (
          <div
            key={point.year}
            className={`p-6 rounded-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 border ${themeColors.border} ${
              selectedPoint?.year === point.year
                ? `bg-gradient-to-br ${themeColors.selectedCardBg} shadow-lg`
                : `${themeColors.cardBg} hover:${themeColors.cardHoverBg}`
            }`}
            onClick={() => setSelectedPoint(point)}
          >
            <div className="flex items-center mb-3">
              <span className={`inline-block w-2 h-2 rounded-full mr-3 ${themeColors.accent}`} />
              <h3 className={`text-lg font-bold ${themeColors.text}`}>{point.label}</h3>
            </div>
            <p className={`text-sm mb-3 font-medium ${themeColors.accent}`}>
              {point.center}
            </p>
            <p className={themeColors.textTertiary}>
              {point.description}
            </p>
          </div>
        ))}
      </div>

      {/* Detailed Analysis */}
      <div className={`p-8 rounded-2xl mb-12 ${themeColors.cardBg} border ${themeColors.border} shadow-lg ${themeColors.shadow}`}>
        <h2 className={`text-2xl font-bold mb-8 flex items-center ${themeColors.text}`}>
          <span className={`inline-block w-2 h-2 rounded-full mr-3 ${themeColors.accent}`} />
          Historical Analysis
        </h2>
        <div className="space-y-8">
          {[
            {
              title: 'Ancient Period (2000 BCE - 500 BCE)',
              content: 'The economic center began in Mesopotamia with the development of sophisticated agricultural systems and irrigation networks. Sumerian city-states pioneered the first writing systems for trade records and contracts. The rise of Bronze Age civilizations established long-distance trade networks, while innovations like the potter\'s wheel and metallurgy spurred economic growth. Egyptian and Phoenician maritime trade expanded commercial horizons, while the emergence of standardized weights and measures facilitated regional commerce. The period concluded with the rise of Greek city-states introducing coined money and sophisticated banking practices.',
              events: [
                '3000 BCE: Development of cuneiform writing system for trade records',
                '2500 BCE: Construction of the Great Pyramid, demonstrating advanced economic organization',
                '2000 BCE: Establishment of the Assyrian merchant colonies',
                '1750 BCE: Code of Hammurabi standardizes commercial laws and contracts',
                '1200 BCE: Bronze Age collapse disrupts Mediterranean trade networks',
                '600 BCE: Introduction of Lydian coins, first standardized currency'
              ]
            },
            {
              title: 'Classical Period (500 BCE - 500 CE)',
              content: 'This era saw unprecedented economic integration under major empires. The Roman Empire created a vast economic network with standardized currency, banking systems, and trade laws. The Silk Road emerged as a crucial East-West trade artery, connecting Roman markets with Han Dynasty China. Mediterranean shipping routes became highly developed, with specialized merchant vessels and maritime insurance. The period witnessed significant technological advances in agriculture, including the heavy plow and water mill. Urban centers grew dramatically, with Rome reaching a population of over one million, requiring complex systems of grain distribution and public works.',
              events: [
                '500 BCE: Athens emerges as major Mediterranean trading power',
                '330 BCE: Alexander\'s conquests create vast trading network',
                '200 BCE: Han Dynasty establishes Silk Road trade',
                '27 BCE: Augustus establishes Roman Imperial economic system',
                '100 CE: Peak of Roman trade network spanning three continents',
                '300 CE: Roman gold solidus becomes international trade currency'
              ]
            },
            {
              title: 'Medieval Period (500 CE - 1500 CE)',
              content: 'The Islamic Golden Age transformed the economic landscape, with Baghdad becoming a global center of trade, science, and innovation. Muslim merchants pioneered new financial instruments like the suftaja (bill of exchange) and partnership arrangements. The Byzantine Empire maintained sophisticated monetary systems and trade networks. In Europe, the rise of feudalism gave way to the Commercial Revolution, with Italian city-states like Venice and Florence pioneering modern banking practices. The Hanseatic League created a powerful northern European trade network. Chinese innovations like paper money and the compass revolutionized commerce, while the Mongol Empire\'s Pax Mongolica facilitated unprecedented Eurasian trade integration.',
              events: [
                '750 CE: Abbasid Caliphate establishes Baghdad as trade hub',
                '1000 CE: Song Dynasty introduces paper money',
                '1095 CE: Crusades stimulate European-Middle Eastern trade',
                '1200 CE: Formation of Hanseatic League',
                '1347 CE: Black Death reshapes European labor markets',
                '1450 CE: Medici Bank pioneers modern banking practices'
              ]
            },
            {
              title: 'Modern Period (1500 CE - Present)',
              content: 'The age of exploration and colonization shifted economic power to Western Europe, with Portuguese and Spanish maritime empires giving way to Dutch and British dominance. The Industrial Revolution fundamentally transformed production methods, urban development, and global trade patterns. Steam power, mechanization, and later electricity revolutionized manufacturing and transportation. The 19th century saw the rise of industrial capitalism, joint-stock companies, and modern banking systems. The 20th century brought American economic dominance, mass production techniques, and the rise of multinational corporations. The Digital Revolution and globalization have recently shifted economic gravity toward East Asia, with China\'s economic reforms and technological advancement reshaping global trade. Modern innovations in AI, renewable energy, and digital finance continue to transform the global economic landscape.',
              events: [
                '1494: Double-entry bookkeeping system published',
                '1602: Dutch East India Company creates first stock market',
                '1776: Industrial Revolution begins in Britain',
                '1844: Telegraph revolutionizes financial communications',
                '1914: Federal Reserve System established',
                '1944: Bretton Woods establishes post-war monetary system',
                '1971: End of gold standard',
                '1978: China begins market reforms',
                '1994: Launch of World Wide Web',
                '2008: Global Financial Crisis',
                '2020: Digital acceleration due to global pandemic'
              ]
            }
          ].map((period, index) => (
            <div 
              key={index}
              className={`p-6 rounded-xl transition-all duration-300 border ${themeColors.border} ${themeColors.cardBg} hover:${themeColors.cardHoverBg}`}
            >
              <h3 className={`text-xl font-bold mb-4 ${themeColors.text}`}>{period.title}</h3>
              <p className={`${themeColors.textSecondary} mb-6`}>{period.content}</p>
              <div className={`mt-4 border-t ${themeColors.border} pt-4`}>
                <h4 className={`text-lg font-semibold mb-3 ${themeColors.text}`}>Key Economic Events:</h4>
                <ul className={`list-disc pl-5 space-y-2 ${themeColors.textSecondary}`}>
                  {period.events.map((event, i) => (
                    <li key={i}>{event}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology Note */}
      <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center ${themeColors.text}`}>
          <span className={`inline-block w-2 h-2 rounded-full mr-3 ${themeColors.accent}`} />
          Methodology Note
        </h3>
        <p className={themeColors.textTertiary}>
          This visualization is based on historical economic data and research from various academic sources.
          GDP shares are approximated for ancient periods where exact data is unavailable.
          Modern period data (1500 CE onwards) is derived from economic historians' estimates and World Bank data.
        </p>
      </div>
    </div>
  );
};

export default EconomicGravityPage; 