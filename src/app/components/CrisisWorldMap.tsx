'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { 
  crisisEvents, 
  getCrisisTypeColor, 
  getCrisisTypeLabel, 
  getSeverityLabel,
  getCrisisGenerationColor,
  classifyCrisisGeneration,
  type CrisisEvent, 
  type CrisisType,
  type CrisisGeneration
} from '../data/economicCycles';

// World map TopoJSON URL
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Country coordinates for crisis markers
const countryCoordinates: Record<string, [number, number]> = {
  US: [-95.7129, 37.0902],
  GB: [-1.5, 52.5],
  DE: [10.4515, 51.1657],
  FR: [2.2137, 46.2276],
  JP: [138.2529, 36.2048],
  CN: [104.1954, 35.8617],
  RU: [105.3188, 61.5240],
  AR: [-63.6167, -38.4161],
  BR: [-51.9253, -14.2350],
  MX: [-102.5528, 23.6345],
  GR: [21.8243, 39.0742],
  IE: [-8.2439, 53.4129],
  AT: [14.5501, 47.5162],
  TH: [100.9925, 15.8700],
  TR: [35.2433, 38.9637],
  VE: [-66.5897, 6.4238],
  IS: [-19.0208, 64.9631],
  CY: [33.4299, 35.1264],
  WORLD: [0, 20],
};

interface CrisisWorldMapProps {
  isDarkMode: boolean;
  selectedCrisis?: CrisisEvent | null;
  onSelectCrisis?: (crisis: CrisisEvent | null) => void;
  filterType?: CrisisType | 'all';
  filterDecade?: number | 'all';
  filterGeneration?: CrisisGeneration | 'all';
}

// Generation model names for display
const generationModelNames: Record<CrisisGeneration, string> = {
  '1st': 'Fundamental-Based (Krugman 1979)',
  '2nd': 'Self-Fulfilling (Obstfeld 1994)',
  '3rd': 'Balance Sheet (1999)'
};

// Memoized Geography component
const MemoizedGeography = memo(({ 
  geo, 
  isDarkMode 
}: { 
  geo: any; 
  isDarkMode: boolean;
}) => (
  <Geography
    geography={geo}
    fill={isDarkMode ? '#1a2744' : '#e8e8e8'}
    stroke={isDarkMode ? '#2d4a6f' : '#d0d0d0'}
    strokeWidth={0.5}
    style={{
      default: { outline: 'none' },
      hover: { outline: 'none' },
      pressed: { outline: 'none' },
    }}
  />
));

MemoizedGeography.displayName = 'MemoizedGeography';

const CrisisWorldMap: React.FC<CrisisWorldMapProps> = ({
  isDarkMode,
  selectedCrisis,
  onSelectCrisis,
  filterType = 'all',
  filterDecade = 'all',
  filterGeneration = 'all'
}) => {
  const [position, setPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1 });
  const [hoveredCrisis, setHoveredCrisis] = useState<CrisisEvent | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Helper to get crisis generation (either explicit or calculated)
  const getCrisisGen = useCallback((crisis: CrisisEvent): CrisisGeneration => {
    return crisis.crisisGeneration || classifyCrisisGeneration(crisis);
  }, []);

  // Filter crises based on current filters
  const filteredCrises = useMemo(() => {
    return crisisEvents.filter(crisis => {
      if (filterType !== 'all' && crisis.type !== filterType) return false;
      if (filterDecade !== 'all') {
        const decade = Math.floor(crisis.year / 10) * 10;
        if (decade !== filterDecade) return false;
      }
      if (filterGeneration !== 'all') {
        const crisisGen = getCrisisGen(crisis);
        if (crisisGen !== filterGeneration) return false;
      }
      return true;
    });
  }, [filterType, filterDecade, filterGeneration, getCrisisGen]);

  // Group crises by location to avoid overlapping markers
  const crisesByLocation = useMemo(() => {
    const grouped: Record<string, CrisisEvent[]> = {};
    filteredCrises.forEach(crisis => {
      const key = crisis.countryCode;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(crisis);
    });
    return grouped;
  }, [filteredCrises]);

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
    setPosition({ coordinates: [0, 20], zoom: 1 });
    onSelectCrisis?.(null);
  }, [onSelectCrisis]);

  const handleMarkerClick = (crises: CrisisEvent[]) => {
    // If multiple crises at location, cycle through them or show the most severe
    const mostSevere = crises.reduce((a, b) => a.severity > b.severity ? a : b);
    onSelectCrisis?.(selectedCrisis?.id === mostSevere.id ? null : mostSevere);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className={`relative rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className={`p-2 rounded-lg shadow-lg transition-colors ${
            isDarkMode 
              ? 'bg-gray-800 hover:bg-gray-700 text-white' 
              : 'bg-white hover:bg-gray-100 text-gray-800'
          }`}
          title="Zoom In"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className={`p-2 rounded-lg shadow-lg transition-colors ${
            isDarkMode 
              ? 'bg-gray-800 hover:bg-gray-700 text-white' 
              : 'bg-white hover:bg-gray-100 text-gray-800'
          }`}
          title="Zoom Out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={handleReset}
          className={`p-2 rounded-lg shadow-lg transition-colors ${
            isDarkMode 
              ? 'bg-gray-800 hover:bg-gray-700 text-white' 
              : 'bg-white hover:bg-gray-100 text-gray-800'
          }`}
          title="Reset View"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className={`absolute bottom-4 left-4 z-10 p-3 rounded-lg shadow-lg ${
        isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
      }`}>
        <h4 className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Crisis Types
        </h4>
        <div className="space-y-1">
          {(['banking', 'sovereign_debt', 'currency', 'inflation', 'stock_market'] as CrisisType[]).map(type => (
            <div key={type} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getCrisisTypeColor(type) }}
              />
              <span className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {getCrisisTypeLabel(type)}
              </span>
            </div>
          ))}
        </div>
        <div className={`mt-2 pt-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h4 className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Crisis Models
          </h4>
          <div className="space-y-1">
            {(['1st', '2nd', '3rd'] as CrisisGeneration[]).map(gen => (
              <div key={gen} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded text-[8px] font-bold text-white flex items-center justify-center"
                  style={{ backgroundColor: getCrisisGenerationColor(gen) }}
                >
                  {gen.charAt(0)}
                </div>
                <span className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {gen} Gen
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className={`mt-2 pt-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <span className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Size = Severity
          </span>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className={`absolute top-4 left-4 z-10 p-3 rounded-lg shadow-lg ${
        isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
      }`}>
        <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {filteredCrises.length}
        </div>
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Crises Shown
        </div>
      </div>

      {/* Map */}
      <div onMouseMove={handleMouseMove}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 130,
          }}
          style={{ width: '100%', height: '450px' }}
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            onMoveEnd={handleMoveEnd}
          >
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

            {/* Crisis Markers */}
            {Object.entries(crisesByLocation).map(([countryCode, crises]) => {
              const coords = countryCoordinates[countryCode];
              if (!coords) return null;

              // Get the most severe crisis for the marker
              const primaryCrisis = crises.reduce((a, b) => a.severity > b.severity ? a : b);
              const isSelected = selectedCrisis?.id === primaryCrisis.id;
              const isHovered = hoveredCrisis?.id === primaryCrisis.id;
              
              // Size based on severity and number of crises
              const baseSize = 6 + primaryCrisis.severity * 2;
              const size = baseSize + Math.min(crises.length - 1, 3) * 2;

              return (
                <Marker
                  key={countryCode}
                  coordinates={coords}
                  onClick={() => handleMarkerClick(crises)}
                  onMouseEnter={() => setHoveredCrisis(primaryCrisis)}
                  onMouseLeave={() => setHoveredCrisis(null)}
                >
                  {/* Outer ring for multiple crises */}
                  {crises.length > 1 && (
                    <circle
                      r={size + 4}
                      fill="none"
                      stroke={isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}
                      strokeWidth={2}
                      strokeDasharray="2,2"
                    />
                  )}
                  
                  {/* Selection ring */}
                  {isSelected && (
                    <circle
                      r={size + 6}
                      fill="none"
                      stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
                      strokeWidth={3}
                      className="animate-pulse"
                    />
                  )}

                  {/* Main marker */}
                  <circle
                    r={size}
                    fill={getCrisisTypeColor(primaryCrisis.type)}
                    opacity={isHovered || isSelected ? 1 : 0.8}
                    stroke={isDarkMode ? '#1f2937' : '#ffffff'}
                    strokeWidth={isHovered || isSelected ? 2 : 1}
                    className="transition-all duration-200 cursor-pointer"
                  />

                  {/* Crisis count badge */}
                  {crises.length > 1 && (
                    <g>
                      <circle
                        cx={size - 2}
                        cy={-size + 2}
                        r={8}
                        fill={isDarkMode ? '#1f2937' : '#ffffff'}
                        stroke={getCrisisTypeColor(primaryCrisis.type)}
                        strokeWidth={2}
                      />
                      <text
                        x={size - 2}
                        y={-size + 6}
                        textAnchor="middle"
                        className="text-[10px] font-bold"
                        fill={getCrisisTypeColor(primaryCrisis.type)}
                      >
                        {crises.length}
                      </text>
                    </g>
                  )}
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Tooltip */}
      {hoveredCrisis && (
        <div
          className={`fixed z-50 p-3 rounded-lg shadow-xl border max-w-xs pointer-events-none ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-700 text-white' 
              : 'bg-white border-gray-200 text-gray-900'
          }`}
          style={{
            left: Math.min(tooltipPosition.x + 15, window.innerWidth - 300),
            top: tooltipPosition.y + 15,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getCrisisTypeColor(hoveredCrisis.type) }}
            />
            <span className="font-semibold text-sm">{hoveredCrisis.name}</span>
          </div>
          <div className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <div className="flex justify-between gap-4">
              <span>Year:</span>
              <span className="font-medium">
                {hoveredCrisis.year}
                {hoveredCrisis.endYear && ` - ${hoveredCrisis.endYear}`}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Country:</span>
              <span className="font-medium">{hoveredCrisis.country}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Type:</span>
              <span className="font-medium">{getCrisisTypeLabel(hoveredCrisis.type)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Severity:</span>
              <span className="font-medium">{getSeverityLabel(hoveredCrisis.severity)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Crisis Model:</span>
              <span 
                className="font-medium px-1.5 py-0.5 rounded text-white text-[10px]"
                style={{ backgroundColor: getCrisisGenerationColor(getCrisisGen(hoveredCrisis)) }}
              >
                {getCrisisGen(hoveredCrisis)} Gen
              </span>
            </div>
            {hoveredCrisis.gdpDecline && (
              <div className="flex justify-between gap-4">
                <span>GDP Decline:</span>
                <span className="font-medium text-red-500">-{hoveredCrisis.gdpDecline}%</span>
              </div>
            )}
          </div>
          <p className={`text-[10px] mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Click for details
          </p>
        </div>
      )}

      {/* Selected Crisis Details */}
      {selectedCrisis && (
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${
          isDarkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getCrisisTypeColor(selectedCrisis.type) }}
                />
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedCrisis.name} ({selectedCrisis.year})
                </h4>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>
                  {getCrisisTypeLabel(selectedCrisis.type)}
                </span>
                <span 
                  className="text-xs px-2 py-0.5 rounded text-white"
                  style={{ backgroundColor: getCrisisGenerationColor(getCrisisGen(selectedCrisis)) }}
                >
                  {getCrisisGen(selectedCrisis)} Gen: {generationModelNames[getCrisisGen(selectedCrisis)]}
                </span>
              </div>
              <p className={`text-sm mb-3 max-w-3xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedCrisis.description}
              </p>
            </div>
            <button
              onClick={() => onSelectCrisis?.(null)}
              className={`p-1 rounded-full hover:bg-gray-700/50 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            {/* Key Metrics */}
            {selectedCrisis.gdpDecline && (
              <div className={`p-2 rounded ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                <div className={`text-xs ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>GDP Decline</div>
                <div className="text-lg font-bold text-red-500">-{selectedCrisis.gdpDecline}%</div>
              </div>
            )}
            {selectedCrisis.recoveryYears && (
              <div className={`p-2 rounded ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                <div className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Recovery Time</div>
                <div className={`text-lg font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {selectedCrisis.recoveryYears} years
                </div>
              </div>
            )}
            {selectedCrisis.peakInflation && (
              <div className={`p-2 rounded ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                <div className={`text-xs ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>Peak Inflation</div>
                <div className="text-lg font-bold text-orange-500">{selectedCrisis.peakInflation.toLocaleString()}%</div>
              </div>
            )}
            {selectedCrisis.currencyDecline && (
              <div className={`p-2 rounded ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
                <div className={`text-xs ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>Currency Fall</div>
                <div className="text-lg font-bold text-amber-500">-{selectedCrisis.currencyDecline}%</div>
              </div>
            )}
            {selectedCrisis.bankFailures && (
              <div className={`p-2 rounded ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                <div className={`text-xs ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Bank Failures</div>
                <div className="text-lg font-bold text-purple-500">{selectedCrisis.bankFailures.toLocaleString()}</div>
              </div>
            )}
            {selectedCrisis.debtToGdp && (
              <div className={`p-2 rounded ${isDarkMode ? 'bg-violet-900/30' : 'bg-violet-50'}`}>
                <div className={`text-xs ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>Debt/GDP</div>
                <div className="text-lg font-bold text-violet-500">{selectedCrisis.debtToGdp}%</div>
              </div>
            )}
          </div>

          {/* Causes and Consequences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <h5 className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                CAUSES
              </h5>
              <div className="flex flex-wrap gap-1">
                {selectedCrisis.causes.map((cause, idx) => (
                  <span 
                    key={idx}
                    className={`text-xs px-2 py-1 rounded ${
                      isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {cause}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h5 className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                CONSEQUENCES
              </h5>
              <div className="flex flex-wrap gap-1">
                {selectedCrisis.consequences.map((consequence, idx) => (
                  <span 
                    key={idx}
                    className={`text-xs px-2 py-1 rounded ${
                      isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {consequence}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrisisWorldMap;

