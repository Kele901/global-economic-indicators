'use client';

import React, { useState, useMemo, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { passportStrengthAllCountries, getPassportTier } from '../data/culturalMetrics';

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface PassportStrengthMapProps {
  isDarkMode: boolean;
}

const getColorScale = (score: number | null, isDarkMode: boolean): string => {
  if (score === null || score === undefined || score === 0) {
    return isDarkMode ? '#1E293B' : '#E2E8F0';
  }

  if (isDarkMode) {
    if (score >= 185) return '#15803D';
    if (score >= 180) return '#16A34A';
    if (score >= 170) return '#22C55E';
    if (score >= 160) return '#4ADE80';
    if (score >= 145) return '#2DD4BF';
    if (score >= 130) return '#06B6D4';
    if (score >= 110) return '#FACC15';
    if (score >= 80)  return '#F59E0B';
    if (score >= 60)  return '#F97316';
    if (score >= 40)  return '#EF4444';
    return '#B91C1C';
  }

  if (score >= 185) return '#166534';
  if (score >= 180) return '#15803D';
  if (score >= 170) return '#22C55E';
  if (score >= 160) return '#86EFAC';
  if (score >= 145) return '#5EEAD4';
  if (score >= 130) return '#67E8F9';
  if (score >= 110) return '#FDE047';
  if (score >= 80)  return '#FBBF24';
  if (score >= 60)  return '#FB923C';
  if (score >= 40)  return '#F87171';
  return '#DC2626';
};

const PassportStrengthMap: React.FC<PassportStrengthMapProps> = memo(({ isDarkMode }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [0, 30],
    zoom: 1,
  });

  const countryValues = useMemo(() => {
    const map: Record<string, { name: string; score: number; rank: number }> = {};
    Object.entries(passportStrengthAllCountries).forEach(([iso, data]) => {
      map[iso] = data;
    });
    return map;
  }, []);

  const handleZoomIn = () => {
    if (position.zoom >= 8) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleReset = () => {
    setPosition({ coordinates: [0, 30], zoom: 1 });
  };

  const handleMoveEnd = (pos: { coordinates: [number, number]; zoom: number }) => {
    setPosition(pos);
  };

  return (
    <div className="relative w-full">
      {/* Zoom controls */}
      <div className={`absolute top-3 right-3 z-10 flex flex-col gap-1 rounded-lg shadow-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
      }`}>
        <button
          onClick={handleZoomIn}
          disabled={position.zoom >= 8}
          className={`px-2.5 py-1.5 text-lg font-bold leading-none rounded-t-lg transition-colors disabled:opacity-30 ${
            isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Zoom in"
        >+</button>
        <button
          onClick={handleZoomOut}
          disabled={position.zoom <= 1}
          className={`px-2.5 py-1.5 text-lg font-bold leading-none transition-colors disabled:opacity-30 ${
            isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Zoom out"
        >&minus;</button>
        <button
          onClick={handleReset}
          className={`px-2.5 py-1.5 text-xs font-medium leading-none rounded-b-lg border-t transition-colors ${
            isDarkMode ? 'hover:bg-gray-700 text-gray-300 border-gray-600' : 'hover:bg-gray-100 text-gray-600 border-gray-200'
          }`}
          title="Reset view"
        >Reset</button>
      </div>

      <div className={`absolute bottom-14 left-3 z-10 text-[10px] px-2 py-1 rounded ${
        isDarkMode ? 'bg-gray-800/80 text-gray-400' : 'bg-white/80 text-gray-500'
      }`}>
        Drag to pan &middot; Scroll to zoom
      </div>

      <div className="w-full h-[450px]" style={{ cursor: position.zoom > 1 ? 'grab' : 'default' }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 130, center: [0, 30] }}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            translateExtent={[[-200, -200], [1200, 600]]}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isoCode = geo.id;
                  const countryInfo = countryValues[isoCode];
                  const score = countryInfo?.score ?? null;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getColorScale(score, isDarkMode)}
                      stroke={isDarkMode ? '#1F2937' : '#FFFFFF'}
                      strokeWidth={0.5}
                      onMouseEnter={(e) => {
                        const name = countryInfo?.name || geo.properties?.name || 'Unknown';
                        if (countryInfo) {
                          const tier = getPassportTier(countryInfo.score);
                          setTooltipContent(
                            `${name} — Rank #${countryInfo.rank} · ${countryInfo.score} visa-free destinations · ${tier.label}`
                          );
                        } else {
                          setTooltipContent(`${name}: No data`);
                        }
                        setTooltipPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setTooltipContent('')}
                      style={{
                        default: { outline: 'none' },
                        hover: { outline: 'none', fill: isDarkMode ? '#8B5CF6' : '#7C3AED', cursor: 'pointer' },
                        pressed: { outline: 'none' },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {tooltipContent && (
        <div
          className={`fixed z-50 px-3 py-2 rounded-lg text-sm shadow-lg pointer-events-none ${
            isDarkMode ? 'bg-gray-800 text-gray-100 border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'
          }`}
          style={{ left: tooltipPosition.x + 10, top: tooltipPosition.y - 40 }}
        >
          {tooltipContent}
        </div>
      )}

      <div className="mt-3 flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          {(isDarkMode
            ? ['#B91C1C','#EF4444','#F97316','#F59E0B','#FACC15','#06B6D4','#2DD4BF','#4ADE80','#22C55E','#16A34A','#15803D']
            : ['#DC2626','#F87171','#FB923C','#FBBF24','#FDE047','#67E8F9','#5EEAD4','#86EFAC','#22C55E','#15803D','#166534']
          ).map((color, i) => (
            <div key={i} className="w-6 h-3 first:rounded-l-sm last:rounded-r-sm" style={{ backgroundColor: color }} />
          ))}
        </div>
        <div className={`flex justify-between w-[270px] text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <span>Weakest</span>
          <span>24</span>
          <span>60</span>
          <span>110</span>
          <span>145</span>
          <span>185</span>
          <span>Strongest</span>
        </div>
        <div className={`flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm mr-1 align-middle" style={{ backgroundColor: isDarkMode ? '#15803D' : '#166534' }} />Excellent (180+)</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm mr-1 align-middle" style={{ backgroundColor: isDarkMode ? '#4ADE80' : '#86EFAC' }} />Very Strong (160-179)</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm mr-1 align-middle" style={{ backgroundColor: isDarkMode ? '#06B6D4' : '#67E8F9' }} />Strong (130-159)</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm mr-1 align-middle" style={{ backgroundColor: isDarkMode ? '#F59E0B' : '#FBBF24' }} />Moderate (80-129)</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm mr-1 align-middle" style={{ backgroundColor: isDarkMode ? '#F97316' : '#FB923C' }} />Weak (50-79)</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm mr-1 align-middle" style={{ backgroundColor: isDarkMode ? '#EF4444' : '#F87171' }} />Very Weak (&lt;50)</span>
        </div>
      </div>
    </div>
  );
});

PassportStrengthMap.displayName = 'PassportStrengthMap';

export default PassportStrengthMap;
