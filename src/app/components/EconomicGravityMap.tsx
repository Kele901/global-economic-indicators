'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  ZoomableGroup,
} from 'react-simple-maps';

// World map TopoJSON URL (free, reliable source)
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Historical economic centers data
export interface HistoricalPoint {
  year: number;
  label: string;
  center: string;
  lat: number;
  lon: number;
  description: string;
  details: {
    mainCities: string;
    keyTrade: string;
    innovations: string;
    economicSystem: string;
  };
}

interface EconomicGravityMapProps {
  historicalData: HistoricalPoint[];
  selectedPoint: HistoricalPoint | null;
  onSelectPoint: (point: HistoricalPoint | null) => void;
  isDarkMode: boolean;
}

// Memoized Geography component for performance
const MemoizedGeography = memo(({ 
  geo, 
  isDarkMode 
}: { 
  geo: any; 
  isDarkMode: boolean;
}) => (
  <Geography
    geography={geo}
    fill={isDarkMode ? '#1e3a5f' : '#c8e6c9'}
    stroke={isDarkMode ? '#2d4a6f' : '#81c784'}
    strokeWidth={0.5}
    style={{
      default: { outline: 'none' },
      hover: { 
        fill: isDarkMode ? '#2d5a8f' : '#a5d6a7',
        outline: 'none',
        transition: 'all 0.2s'
      },
      pressed: { outline: 'none' },
    }}
  />
));

MemoizedGeography.displayName = 'MemoizedGeography';

const EconomicGravityMap: React.FC<EconomicGravityMapProps> = ({
  historicalData,
  selectedPoint,
  onSelectPoint,
  isDarkMode,
}) => {
  const [position, setPosition] = useState({ coordinates: [20, 30] as [number, number], zoom: 1 });
  const [tooltipContent, setTooltipContent] = useState<HistoricalPoint | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [hoveredPoint, setHoveredPoint] = useState<HistoricalPoint | null>(null);

  // Handle zoom
  const handleZoomIn = useCallback(() => {
    if (position.zoom >= 4) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  }, [position.zoom]);

  const handleZoomOut = useCallback(() => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  }, [position.zoom]);

  const handleMoveEnd = useCallback((position: { coordinates: [number, number]; zoom: number }) => {
    setPosition(position);
  }, []);

  const handleReset = useCallback(() => {
    setPosition({ coordinates: [20, 30], zoom: 1 });
    onSelectPoint(null);
  }, [onSelectPoint]);

  // Generate trail lines between consecutive points
  const trailLines = useMemo(() => {
    const lines: { from: [number, number]; to: [number, number]; key: string }[] = [];
    
    // Helper function to calculate waypoints dynamically based on route
    const calculateWaypoints = (
      fromLon: number,
      fromLat: number,
      toLon: number,
      toLat: number
    ): [number, number][] => {
      // Normalize longitudes to [0, 360] for easier calculation
      const normalizeLon = (lon: number) => lon < 0 ? lon + 360 : lon;
      const denormalizeLon = (lon: number) => lon > 180 ? lon - 360 : lon;
      
      const fromLonNorm = normalizeLon(fromLon);
      const toLonNorm = normalizeLon(toLon);
      
      // Calculate both eastward and westward distances
      const eastwardDist = toLonNorm >= fromLonNorm
        ? toLonNorm - fromLonNorm
        : (360 - fromLonNorm) + toLonNorm;
      const westwardDist = 360 - eastwardDist;
      
      // Determine which direction is shorter
      const goEastward = eastwardDist <= westwardDist;
      const totalDist = Math.min(eastwardDist, westwardDist);
      
      // Calculate number of waypoints needed (aim for ~30-40 degree segments)
      const numWaypoints = Math.max(3, Math.min(5, Math.ceil(totalDist / 35)));
      
      const waypoints: [number, number][] = [[fromLon, fromLat]];
      
      for (let i = 1; i <= numWaypoints; i++) {
        const t = i / (numWaypoints + 1); // Interpolation factor [0, 1]
        
        let currentLonNorm: number;
        if (goEastward) {
          // Eastward route
          if (toLonNorm >= fromLonNorm) {
            currentLonNorm = fromLonNorm + (eastwardDist * t);
          } else {
            // Crossing date line eastward
            currentLonNorm = (fromLonNorm + (eastwardDist * t)) % 360;
          }
        } else {
          // Westward route
          if (fromLonNorm >= toLonNorm) {
            currentLonNorm = fromLonNorm - (westwardDist * t);
          } else {
            // Crossing date line westward
            currentLonNorm = (fromLonNorm - (westwardDist * t) + 360) % 360;
          }
        }
        
        // Denormalize back to [-180, 180]
        const currentLon = denormalizeLon(currentLonNorm);
        
        // Interpolate latitude
        const currentLat = fromLat + ((toLat - fromLat) * t);
        
        waypoints.push([currentLon, currentLat]);
      }
      
      waypoints.push([toLon, toLat]);
      return waypoints;
    };
    
    for (let i = 0; i < historicalData.length - 1; i++) {
      const from = historicalData[i];
      const to = historicalData[i + 1];
      
      // Calculate longitude difference (accounting for date line crossing)
      const lonDiff1 = Math.abs(to.lon - from.lon);
      const lonDiff2 = 360 - lonDiff1; // Alternative path around the globe
      const lonDiff = Math.min(lonDiff1, lonDiff2);
      
      // For lines that span more than 100 degrees longitude,
      // add intermediate waypoints to avoid Mercator projection artifacts
      if (lonDiff > 100) {
        // Calculate waypoints dynamically based on actual route
        const waypoints = calculateWaypoints(from.lon, from.lat, to.lon, to.lat);
        
        // Create line segments between waypoints
        for (let j = 0; j < waypoints.length - 1; j++) {
          lines.push({
            from: waypoints[j],
            to: waypoints[j + 1],
            key: `trail-${from.year}-${to.year}-segment-${j}`,
          });
        }
      } else {
        lines.push({
          from: [from.lon, from.lat] as [number, number],
          to: [to.lon, to.lat] as [number, number],
          key: `trail-${from.year}-${to.year}`,
        });
      }
    }
    return lines;
  }, [historicalData]);

  // Theme colors
  const colors = {
    ocean: isDarkMode ? '#0a1929' : '#e3f2fd',
    land: isDarkMode ? '#1e3a5f' : '#c8e6c9',
    landBorder: isDarkMode ? '#2d4a6f' : '#81c784',
    trail: isDarkMode ? '#60a5fa' : '#3b82f6',
    marker: isDarkMode ? '#60a5fa' : '#3b82f6',
    markerSelected: isDarkMode ? '#f59e0b' : '#f59e0b',
    markerHover: isDarkMode ? '#93c5fd' : '#60a5fa',
    text: isDarkMode ? '#e5e7eb' : '#374151',
    cardBg: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    cardBorder: isDarkMode ? '#374151' : '#e5e7eb',
  };

  return (
    <div className="relative w-full">
      {/* Map Container */}
      <div 
        className={`relative w-full rounded-xl overflow-hidden border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
        style={{ 
          aspectRatio: '16/9',
          minHeight: '300px',
          maxHeight: '600px',
          backgroundColor: colors.ocean
        }}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 140,
            center: [20, 30],
          }}
          style={{
            width: '100%',
            height: '100%',
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
            <rect x={-800} y={-600} width={2000} height={1200} fill={colors.ocean} />
            
            {/* Countries */}
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <MemoizedGeography
                    key={geo.rsmKey}
                    geo={geo}
                    isDarkMode={isDarkMode}
                  />
                ))
              }
            </Geographies>

            {/* Trail lines connecting historical points */}
            {trailLines.map((line) => (
              <Line
                key={line.key}
                from={line.from}
                to={line.to}
                stroke={colors.trail}
                strokeWidth={2 / position.zoom}
                strokeLinecap="round"
                strokeDasharray="5,3"
                strokeOpacity={0.7}
              />
            ))}

            {/* Historical point markers */}
            {historicalData.map((point, index) => {
              const isSelected = selectedPoint?.year === point.year;
              const isHovered = hoveredPoint?.year === point.year;
              const markerSize = isSelected ? 12 : 8;
              
              return (
                <Marker
                  key={point.year}
                  coordinates={[point.lon, point.lat]}
                  onClick={() => onSelectPoint(isSelected ? null : point)}
                  onMouseEnter={() => {
                    setTooltipContent(point);
                    setHoveredPoint(point);
                  }}
                  onMouseLeave={() => {
                    setTooltipContent(null);
                    setHoveredPoint(null);
                  }}
                  style={{
                    default: { cursor: 'pointer' },
                    hover: { cursor: 'pointer' },
                    pressed: { cursor: 'pointer' },
                  }}
                >
                  {/* Outer glow for selected */}
                  {isSelected && (
                    <>
                      <circle
                        r={18 / position.zoom}
                        fill={colors.markerSelected}
                        fillOpacity={0.2}
                        className="animate-pulse"
                      />
                      <circle
                        r={14 / position.zoom}
                        fill="none"
                        stroke={colors.markerSelected}
                        strokeWidth={2 / position.zoom}
                        strokeOpacity={0.5}
                      />
                    </>
                  )}
                  
                  {/* Main marker */}
                  <circle
                    r={markerSize / position.zoom}
                    fill={isSelected ? colors.markerSelected : colors.marker}
                    stroke="#fff"
                    strokeWidth={2 / position.zoom}
                    style={{
                      transition: 'all 0.2s ease-out',
                    }}
                  />
                  
                  {/* Index number */}
                  <text
                    textAnchor="middle"
                    y={4 / position.zoom}
                    style={{
                      fontFamily: 'system-ui',
                      fontSize: `${10 / position.zoom}px`,
                      fontWeight: 'bold',
                      fill: '#fff',
                      pointerEvents: 'none',
                    }}
                  >
                    {index + 1}
                  </text>
                  
                  {/* Label text - only visible on hover */}
                  {isHovered && (
                    <text
                      x={15 / position.zoom}
                      y={4 / position.zoom}
                      style={{
                        fontFamily: 'system-ui',
                        fontSize: `${11 / position.zoom}px`,
                        fontWeight: 'bold',
                        fill: colors.markerSelected,
                        pointerEvents: 'none',
                        opacity: 1,
                        textShadow: isDarkMode 
                          ? '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)' 
                          : '1px 1px 2px rgba(255,255,255,0.9), -1px -1px 2px rgba(255,255,255,0.9)',
                        transition: 'all 0.2s ease-out',
                      }}
                    >
                      {point.center}
                    </text>
                  )}
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={handleZoomIn}
            disabled={position.zoom >= 4}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-all ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50' 
                : 'bg-white hover:bg-gray-100 text-gray-700 disabled:opacity-50'
            } shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            disabled={position.zoom <= 1}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-all ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50' 
                : 'bg-white hover:bg-gray-100 text-gray-700 disabled:opacity-50'
            } shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            title="Zoom out"
          >
            −
          </button>
          <button
            onClick={handleReset}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-white hover:bg-gray-100 text-gray-700'
            } shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            title="Reset view"
          >
            ⟲
          </button>
        </div>

        {/* Mobile hint */}
        <div className={`absolute bottom-4 left-4 text-xs px-3 py-1.5 rounded-full ${
          isDarkMode ? 'bg-gray-800/80 text-gray-300' : 'bg-white/80 text-gray-600'
        } backdrop-blur-sm hidden sm:block`}>
          🖱️ Drag to pan • Scroll to zoom
        </div>
        <div className={`absolute bottom-4 left-4 text-xs px-3 py-1.5 rounded-full ${
          isDarkMode ? 'bg-gray-800/80 text-gray-300' : 'bg-white/80 text-gray-600'
        } backdrop-blur-sm sm:hidden`}>
          👆 Pinch to zoom • Drag to pan
        </div>
        
        {/* Hover Tooltip - positioned inside map container */}
        {tooltipContent && hoveredPoint && (
          <div 
            className={`absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none z-50 transition-all duration-200 ${
              isDarkMode ? 'bg-gray-800/95' : 'bg-white/95'
            } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg shadow-xl p-3 max-w-xs backdrop-blur-sm`}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${colors.marker}`} />
                <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {tooltipContent.center}
                </h4>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {tooltipContent.label}
              </p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
                {tooltipContent.description}
              </p>
              <div className={`mt-2 pt-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="font-semibold">Cities:</span> {tooltipContent.details.mainCities}
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="font-semibold">Trade:</span> {tooltipContent.details.keyTrade}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Point Info Card */}
      {selectedPoint && (
        <div 
          className={`mt-4 p-4 sm:p-6 rounded-xl border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } shadow-lg`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
                }`}>
                  {historicalData.findIndex(p => p.year === selectedPoint.year) + 1}
                </span>
                <div>
                  <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedPoint.center}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedPoint.label}
                  </p>
                </div>
              </div>
              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-3`}>
                {selectedPoint.description}
              </p>
            </div>
            <button
              onClick={() => onSelectPoint(null)}
              className={`self-start p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <span className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Major Cities:
                </span>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {selectedPoint.details.mainCities}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <span className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Key Trade:
                </span>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {selectedPoint.details.keyTrade}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <span className={`font-semibold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  Innovations:
                </span>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {selectedPoint.details.innovations}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <span className={`font-semibold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                  Economic System:
                </span>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {selectedPoint.details.economicSystem}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between`}>
            <button
              onClick={() => {
                const currentIndex = historicalData.findIndex(p => p.year === selectedPoint.year);
                if (currentIndex > 0) {
                  onSelectPoint(historicalData[currentIndex - 1]);
                }
              }}
              disabled={historicalData.findIndex(p => p.year === selectedPoint.year) === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous Era
            </button>
            <button
              onClick={() => {
                const currentIndex = historicalData.findIndex(p => p.year === selectedPoint.year);
                if (currentIndex < historicalData.length - 1) {
                  onSelectPoint(historicalData[currentIndex + 1]);
                }
              }}
              disabled={historicalData.findIndex(p => p.year === selectedPoint.year) === historicalData.length - 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              Next Era
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className={`mt-4 p-4 rounded-xl border ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Timeline Legend
        </h4>
        <div className="flex flex-wrap gap-3">
          {historicalData.map((point, index) => (
            <button
              key={point.year}
              onClick={() => onSelectPoint(selectedPoint?.year === point.year ? null : point)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedPoint?.year === point.year
                  ? isDarkMode 
                    ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-500' 
                    : 'bg-amber-100 text-amber-700 ring-2 ring-amber-400'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                selectedPoint?.year === point.year
                  ? 'bg-amber-500 text-white'
                  : isDarkMode ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {index + 1}
              </span>
              {point.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EconomicGravityMap;

