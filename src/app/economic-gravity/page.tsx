'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import InfoPanel from '../components/InfoPanel';
import { economicMetrics } from '../data/economicMetrics';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line as MapLine,
  ZoomableGroup,
} from 'react-simple-maps';

// World map topology URL
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

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
        fixed top-4 right-4 p-2 rounded-full z-50
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

// Memoized Geography component for performance
const MemoizedGeography = memo(({ geo, isDarkMode }: { geo: any; isDarkMode: boolean }) => (
  <Geography
    geography={geo}
    fill={isDarkMode ? '#374151' : '#d1d5db'}
    stroke={isDarkMode ? '#4b5563' : '#9ca3af'}
    strokeWidth={0.5}
    style={{
      default: { outline: 'none' },
      hover: { outline: 'none', fill: isDarkMode ? '#4b5563' : '#9ca3af' },
      pressed: { outline: 'none' }
    }}
  />
));
MemoizedGeography.displayName = 'MemoizedGeography';

// Mobile-friendly info tooltip
interface TooltipProps {
  point: typeof historicalData[0];
  isDarkMode: boolean;
  onClose: () => void;
}

const InfoTooltip = ({ point, isDarkMode, onClose }: TooltipProps) => {
  return (
    <div 
      className={`fixed inset-x-4 bottom-4 sm:absolute sm:inset-auto sm:bottom-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-full sm:mt-2 z-50 p-4 rounded-xl shadow-2xl border backdrop-blur-sm max-w-sm mx-auto ${
        isDarkMode 
          ? 'bg-gray-800/95 border-gray-700 text-white' 
          : 'bg-white/95 border-gray-200 text-gray-900'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        onClick={onClose}
        className={`absolute top-2 right-2 p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <div className="pr-6">
        <h3 className="font-bold text-lg mb-1">{point.center}</h3>
        <p className={`text-sm mb-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{point.label}</p>
        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{point.description}</p>
        
        <div className="space-y-2 text-xs">
          <div className="flex">
            <span className={`font-semibold w-24 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Major Cities:</span>
            <span>{point.details.mainCities}</span>
          </div>
          <div className="flex">
            <span className={`font-semibold w-24 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Key Trade:</span>
            <span>{point.details.keyTrade}</span>
          </div>
          <div className="flex">
            <span className={`font-semibold w-24 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Innovations:</span>
            <span>{point.details.innovations}</span>
          </div>
          <div className="flex">
            <span className={`font-semibold w-24 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Economy:</span>
            <span>{point.details.economicSystem}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Interactive World Map Component
interface WorldMapProps {
  isDarkMode: boolean;
  selectedPoint: typeof historicalData[0] | null;
  onPointSelect: (point: typeof historicalData[0] | null) => void;
}

const WorldMap = ({ isDarkMode, selectedPoint, onPointSelect }: WorldMapProps) => {
  const [position, setPosition] = useState({ coordinates: [20, 30] as [number, number], zoom: 1 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleZoomIn = useCallback(() => {
    if (position.zoom >= 4) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  }, [position.zoom]);

  const handleZoomOut = useCallback(() => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  }, [position.zoom]);

  const handleReset = useCallback(() => {
    setPosition({ coordinates: [20, 30], zoom: 1 });
  }, []);

  const handleMoveEnd = useCallback((position: { coordinates: [number, number]; zoom: number }) => {
    setPosition(position);
  }, []);

  return (
    <div className="relative w-full">
      {/* Zoom Controls */}
      <div className={`absolute top-2 right-2 sm:top-4 sm:right-4 z-20 flex flex-col gap-1 sm:gap-2 ${
        isDarkMode ? 'text-white' : 'text-gray-700'
      }`}>
        <button
          onClick={handleZoomIn}
          className={`p-1.5 sm:p-2 rounded-lg shadow-lg transition-all ${
            isDarkMode 
              ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' 
              : 'bg-white hover:bg-gray-100 border border-gray-200'
          }`}
          aria-label="Zoom in"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className={`p-1.5 sm:p-2 rounded-lg shadow-lg transition-all ${
            isDarkMode 
              ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' 
              : 'bg-white hover:bg-gray-100 border border-gray-200'
          }`}
          aria-label="Zoom out"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={handleReset}
          className={`p-1.5 sm:p-2 rounded-lg shadow-lg transition-all ${
            isDarkMode 
              ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' 
              : 'bg-white hover:bg-gray-100 border border-gray-200'
          }`}
          aria-label="Reset view"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Map Container */}
      <div className={`w-full rounded-xl overflow-hidden ${
        isDarkMode ? 'bg-gray-900' : 'bg-blue-50'
      }`}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 130,
            center: [20, 30]
          }}
          style={{
            width: '100%',
            height: 'auto',
          }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            minZoom={1}
            maxZoom={4}
          >
            {/* Ocean background */}
            <rect x="-200" y="-200" width="1200" height="800" fill={isDarkMode ? '#1e3a5f' : '#bfdbfe'} />
            
            {/* Countries */}
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <MemoizedGeography key={geo.rsmKey} geo={geo} isDarkMode={isDarkMode} />
                ))
              }
            </Geographies>

            {/* Trail lines connecting historical points */}
            {historicalData.map((point, index) => {
              const nextPoint = historicalData[index + 1];
              if (!nextPoint) return null;
              
              return (
                <MapLine
                  key={`line-${point.year}`}
                  from={[point.lon, point.lat]}
                  to={[nextPoint.lon, nextPoint.lat]}
                  stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
                  strokeWidth={2 / position.zoom}
                  strokeDasharray="5,5"
                  strokeLinecap="round"
                  opacity={0.6}
                />
              );
            })}

            {/* Markers for each historical point */}
            {historicalData.map((point, index) => {
              const isSelected = selectedPoint?.year === point.year;
              const markerSize = isSelected ? 12 : 8;
              
              return (
                <Marker
                  key={`marker-${point.year}`}
                  coordinates={[point.lon, point.lat]}
                  onClick={() => onPointSelect(isSelected ? null : point)}
                >
                  {/* Outer glow for selected */}
                  {isSelected && (
                    <circle
                      r={16 / position.zoom}
                      fill={isDarkMode ? '#60a5fa' : '#3b82f6'}
                      opacity={0.3}
                      className="animate-pulse"
                    />
                  )}
                  {/* Main marker */}
                  <circle
                    r={markerSize / position.zoom}
                    fill={isDarkMode ? '#60a5fa' : '#3b82f6'}
                    stroke={isDarkMode ? '#1e3a8a' : '#1d4ed8'}
                    strokeWidth={2 / position.zoom}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Index number */}
                  <text
                    textAnchor="middle"
                    y={4 / position.zoom}
                    style={{
                      fontFamily: 'system-ui',
                      fontSize: `${10 / position.zoom}px`,
                      fill: '#fff',
                      fontWeight: 'bold',
                      pointerEvents: 'none'
                    }}
                  >
                    {index + 1}
                  </text>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Selected Point Info Tooltip - Mobile Friendly */}
      {selectedPoint && (
        <InfoTooltip 
          point={selectedPoint} 
          isDarkMode={isDarkMode} 
          onClose={() => onPointSelect(null)} 
        />
      )}

      {/* Instructions */}
      <div className={`mt-3 text-xs sm:text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <span className="hidden sm:inline">Click on markers to see details • Drag to pan • Scroll to zoom</span>
        <span className="sm:hidden">Tap markers for details • Pinch to zoom • Drag to pan</span>
      </div>
    </div>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Economic Center of Gravity Through History</h1>
          <p className={`text-sm sm:text-base ${themeColors.textSecondary} max-w-xl`}>
            Tracking the shift of global economic power from ancient civilizations to modern times. Explore how economic dominance has moved across continents and empires throughout human history.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Light</span>
          <button
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${isDarkMode ? 'translate-x-6' : ''}`} />
          </button>
          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Dark</span>
        </div>
      </div>

      {/* World Map Visualization */}
      <div className={`mb-8 sm:mb-12 p-4 sm:p-6 rounded-2xl relative ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-gray-700' 
          : 'bg-gradient-to-br from-white via-gray-50 to-white border border-gray-100'
      }`}>
        <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center ${themeColors.text}`}>
          <span className={`inline-block w-2 h-2 rounded-full mr-3 ${themeColors.accent}`} />
          Global Economic Center of Gravity
        </h2>
        
        {/* Info Panel */}
        <div className="absolute top-4 right-4 z-10 hidden lg:block">
          <InfoPanel
            metric={economicMetrics.economicCenterOfGravity}
            isDarkMode={isDarkMode}
            position="top-right"
            size="large"
          />
        </div>
        
        {/* Responsive World Map */}
        <WorldMap 
          isDarkMode={isDarkMode}
          selectedPoint={selectedPoint}
          onPointSelect={setSelectedPoint}
        />

        {/* Timeline Legend - Mobile Friendly */}
        <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'}`}>
          <h4 className={`text-sm font-semibold mb-3 ${themeColors.text}`}>Timeline Reference</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
            {historicalData.slice(0, 6).map((point, index) => (
              <button
                key={point.year}
                onClick={() => setSelectedPoint(point)}
                className={`p-2 rounded-lg text-center transition-all ${
                  selectedPoint?.year === point.year
                    ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
                } border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
              >
                <div className="font-bold">{index + 1}</div>
                <div className="truncate">{point.label}</div>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs mt-2">
            {historicalData.slice(6).map((point, index) => (
              <button
                key={point.year}
                onClick={() => setSelectedPoint(point)}
                className={`p-2 rounded-lg text-center transition-all ${
                  selectedPoint?.year === point.year
                    ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
                } border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
              >
                <div className="font-bold">{index + 7}</div>
                <div className="truncate">{point.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className={`p-4 sm:p-8 rounded-2xl mb-8 sm:mb-12 relative ${themeColors.cardBg} border ${themeColors.border} shadow-lg ${themeColors.shadow} backdrop-blur-sm`}>
        <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center ${themeColors.text}`}>
          <span className={`inline-block w-2 h-2 rounded-full mr-3 ${themeColors.accent}`} />
          Historical Timeline
        </h2>
        
        <p className={`text-xs sm:text-sm mb-4 sm:mb-6 ${themeColors.textSecondary} max-w-2xl`}>
          Track the shifting balance of global economic power across continents and time periods. 
          The chart shows the relative share of global GDP by region, revealing how economic 
          dominance has moved from ancient civilizations to modern economic powerhouses.
        </p>
        <div className="h-[300px] sm:h-[400px] md:h-[500px] relative">
          {/* Info Panel for GDP Share by Region */}
          <div className="hidden lg:block">
            <InfoPanel
              metric={economicMetrics.gdpShareByRegion}
              isDarkMode={isDarkMode}
              position="top-right"
              size="medium"
            />
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gdpShareData} margin={{ top: 20, right: 10, left: 0, bottom: 60 }}>
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
                  fontSize: 9, 
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
                  padding: '10px 14px'
                }}
                labelStyle={{
                  fontWeight: 600,
                  marginBottom: '6px',
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
                  color: isDarkMode ? '#9ca3af' : '#6b7280',
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
                dot={{ r: 3, fill: '#f97316', stroke: isDarkMode ? '#1f2937' : '#ffffff', strokeWidth: 1 }}
                activeDot={{ r: 6, fill: '#f97316', stroke: isDarkMode ? '#1f2937' : '#ffffff', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Europe" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 3, fill: '#3b82f6', stroke: isDarkMode ? '#1f2937' : '#ffffff', strokeWidth: 1 }}
                activeDot={{ r: 6, fill: '#3b82f6', stroke: isDarkMode ? '#1f2937' : '#ffffff', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Americas" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ r: 3, fill: '#22c55e', stroke: isDarkMode ? '#1f2937' : '#ffffff', strokeWidth: 1 }}
                activeDot={{ r: 6, fill: '#22c55e', stroke: isDarkMode ? '#1f2937' : '#ffffff', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Africa" 
                stroke="#eab308" 
                strokeWidth={2}
                dot={{ r: 3, fill: '#eab308', stroke: isDarkMode ? '#1f2937' : '#ffffff', strokeWidth: 1 }}
                activeDot={{ r: 6, fill: '#eab308', stroke: isDarkMode ? '#1f2937' : '#ffffff', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Oceania" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ r: 3, fill: '#8b5cf6', stroke: isDarkMode ? '#1f2937' : '#ffffff', strokeWidth: 1 }}
                activeDot={{ r: 6, fill: '#8b5cf6', stroke: isDarkMode ? '#1f2937' : '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Timeline insights and analysis */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${themeColors.border} hover:shadow-md transition-all duration-300`}>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
              <h4 className={`font-semibold text-xs sm:text-sm ${themeColors.text}`}>Ancient Era</h4>
            </div>
            <p className={`text-xs ${themeColors.textSecondary}`}>
              Asia dominated with advanced agriculture and early civilizations
            </p>
            <div className="mt-2 text-xs text-orange-500 font-medium">
              Peak: 60-70% of global GDP
            </div>
          </div>
          <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${themeColors.border} hover:shadow-md transition-all duration-300`}>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <h4 className={`font-semibold text-xs sm:text-sm ${themeColors.text}`}>Medieval Period</h4>
            </div>
            <p className={`text-xs ${themeColors.textSecondary}`}>
              Europe rose through trade, banking, and maritime exploration
            </p>
            <div className="mt-2 text-xs text-blue-500 font-medium">
              Peak: 40-50% of global GDP
            </div>
          </div>
          <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${themeColors.border} hover:shadow-md transition-all duration-300 sm:col-span-2 md:col-span-1`}>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <h4 className={`font-semibold text-xs sm:text-sm ${themeColors.text}`}>Modern Era</h4>
            </div>
            <p className={`text-xs ${themeColors.textSecondary}`}>
              Americas emerged through industrialization and innovation
            </p>
            <div className="mt-2 text-xs text-green-500 font-medium">
              Peak: 25-30% of global GDP
            </div>
          </div>
        </div>
      </div>

      {/* Historical Points - Mobile Optimized Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {historicalData.map((point) => (
          <div
            key={point.year}
            className={`p-4 sm:p-6 rounded-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 border ${themeColors.border} ${
              selectedPoint?.year === point.year
                ? `bg-gradient-to-br ${themeColors.selectedCardBg} shadow-lg`
                : `${themeColors.cardBg} hover:${themeColors.cardHoverBg}`
            }`}
            onClick={() => setSelectedPoint(point)}
          >
            <div className="flex items-center mb-2 sm:mb-3">
              <span className={`inline-block w-2 h-2 rounded-full mr-3 ${themeColors.accent}`} />
              <h3 className={`text-base sm:text-lg font-bold ${themeColors.text}`}>{point.label}</h3>
            </div>
            <p className={`text-xs sm:text-sm mb-2 sm:mb-3 font-medium ${themeColors.accent}`}>
              {point.center}
            </p>
            <p className={`text-xs sm:text-sm ${themeColors.textTertiary}`}>
              {point.description}
            </p>
          </div>
        ))}
      </div>

      {/* Detailed Analysis */}
      <div className={`p-4 sm:p-8 rounded-2xl mb-8 sm:mb-12 ${themeColors.cardBg} border ${themeColors.border} shadow-lg ${themeColors.shadow}`}>
        <h2 className={`text-xl sm:text-2xl font-bold mb-6 sm:mb-8 flex items-center ${themeColors.text}`}>
          <span className={`inline-block w-2 h-2 rounded-full mr-3 ${themeColors.accent}`} />
          Historical Analysis
        </h2>
        <div className="space-y-6 sm:space-y-8">
          {[
            {
              title: 'Ancient Period (2000 BCE - 500 BCE)',
              content: 'The economic center began in Mesopotamia with the development of sophisticated agricultural systems and irrigation networks. Sumerian city-states pioneered the first writing systems for trade records and contracts.',
              events: [
                '3000 BCE: Development of cuneiform writing system',
                '2500 BCE: Great Pyramid construction',
                '1750 BCE: Code of Hammurabi standardizes laws',
                '600 BCE: First standardized currency'
              ]
            },
            {
              title: 'Classical Period (500 BCE - 500 CE)',
              content: 'This era saw unprecedented economic integration under major empires. The Roman Empire created a vast economic network with standardized currency, banking systems, and trade laws.',
              events: [
                '500 BCE: Athens emerges as trading power',
                '200 BCE: Han Dynasty establishes Silk Road',
                '27 BCE: Augustus establishes Roman economy',
                '100 CE: Peak of Roman trade network'
              ]
            },
            {
              title: 'Medieval Period (500 CE - 1500 CE)',
              content: 'The Islamic Golden Age transformed the economic landscape, with Baghdad becoming a global center of trade, science, and innovation. Muslim merchants pioneered new financial instruments.',
              events: [
                '750 CE: Baghdad established as trade hub',
                '1000 CE: Song Dynasty introduces paper money',
                '1200 CE: Formation of Hanseatic League',
                '1450 CE: Medici Bank pioneers banking'
              ]
            },
            {
              title: 'Modern Period (1500 CE - Present)',
              content: 'The age of exploration shifted power to Western Europe. The Industrial Revolution transformed production methods. The Digital Revolution and globalization have shifted gravity toward East Asia.',
              events: [
                '1602: Dutch East India Company founded',
                '1776: Industrial Revolution begins',
                '1944: Bretton Woods system established',
                '1978: China begins market reforms'
              ]
            }
          ].map((period, index) => (
            <div 
              key={index}
              className={`p-4 sm:p-6 rounded-xl transition-all duration-300 border ${themeColors.border} ${themeColors.cardBg}`}
            >
              <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${themeColors.text}`}>{period.title}</h3>
              <p className={`text-xs sm:text-sm ${themeColors.textSecondary} mb-4 sm:mb-6`}>{period.content}</p>
              <div className={`mt-4 border-t ${themeColors.border} pt-4`}>
                <h4 className={`text-sm sm:text-base font-semibold mb-2 sm:mb-3 ${themeColors.text}`}>Key Events:</h4>
                <ul className={`list-disc pl-5 space-y-1 sm:space-y-2 text-xs sm:text-sm ${themeColors.textSecondary}`}>
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
      <div className={`p-4 sm:p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
        <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center ${themeColors.text}`}>
          <span className={`inline-block w-2 h-2 rounded-full mr-3 ${themeColors.accent}`} />
          Methodology Note
        </h3>
        <p className={`text-xs sm:text-sm ${themeColors.textTertiary}`}>
          This visualization is based on historical economic data and research from various academic sources.
          GDP shares are approximated for ancient periods where exact data is unavailable.
          Modern period data (1500 CE onwards) is derived from economic historians' estimates and World Bank data.
        </p>
      </div>
    </div>
  );
};

export default EconomicGravityPage;
