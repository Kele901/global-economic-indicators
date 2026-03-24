'use client';

import React, { useState, useMemo, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const COUNTRY_NAME_TO_ISO: { [key: string]: string } = {
  'USA': '840', 'Canada': '124', 'UK': '826', 'France': '250',
  'Germany': '276', 'Italy': '380', 'Japan': '392', 'Australia': '036',
  'Mexico': '484', 'SouthKorea': '410', 'Spain': '724', 'Sweden': '752',
  'Switzerland': '756', 'Turkey': '792', 'Nigeria': '566', 'China': '156',
  'Russia': '643', 'Brazil': '076', 'Chile': '152', 'Argentina': '032',
  'India': '356', 'Norway': '578', 'Netherlands': '528', 'Portugal': '620',
  'Belgium': '056', 'Indonesia': '360', 'SouthAfrica': '710', 'Poland': '616',
  'SaudiArabia': '682', 'Egypt': '818', 'Israel': '376', 'Singapore': '702',
};

const ISO_TO_COUNTRY_NAME: { [key: string]: string } = Object.fromEntries(
  Object.entries(COUNTRY_NAME_TO_ISO).map(([name, iso]) => [iso, name])
);

const COUNTRY_DISPLAY_NAMES: { [key: string]: string } = {
  'USA': 'United States', 'UK': 'United Kingdom', 'SouthKorea': 'South Korea',
  'SouthAfrica': 'South Africa', 'SaudiArabia': 'Saudi Arabia',
};

interface HeritageWorldMapProps {
  isDarkMode: boolean;
  heritageData: { [country: string]: { total: number; cultural: number; natural: number; mixed: number } };
}

const getColorScale = (value: number, isDarkMode: boolean): string => {
  if (value === null || value === undefined || value === 0) {
    return isDarkMode ? '#374151' : '#E5E7EB';
  }
  if (value <= 5) return isDarkMode ? '#4C1D95' : '#DDD6FE';
  if (value <= 10) return isDarkMode ? '#5B21B6' : '#C4B5FD';
  if (value <= 20) return isDarkMode ? '#6D28D9' : '#A78BFA';
  if (value <= 30) return isDarkMode ? '#7C3AED' : '#8B5CF6';
  if (value <= 40) return isDarkMode ? '#8B5CF6' : '#7C3AED';
  if (value <= 50) return isDarkMode ? '#A78BFA' : '#6D28D9';
  return isDarkMode ? '#C4B5FD' : '#5B21B6';
};

const HeritageWorldMap: React.FC<HeritageWorldMapProps> = memo(({ isDarkMode, heritageData }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const countryValues = useMemo(() => {
    const map: { [iso: string]: { name: string; total: number; cultural: number; natural: number; mixed: number } } = {};
    Object.entries(heritageData).forEach(([country, data]) => {
      const iso = COUNTRY_NAME_TO_ISO[country];
      if (iso) {
        map[iso] = { name: COUNTRY_DISPLAY_NAMES[country] || country, ...data };
      }
    });
    return map;
  }, [heritageData]);

  return (
    <div className="relative w-full">
      <div className="w-full h-[450px]">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 130, center: [0, 30] }}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isoCode = geo.id;
                  const countryInfo = countryValues[isoCode];
                  const value = countryInfo?.total || 0;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getColorScale(value, isDarkMode)}
                      stroke={isDarkMode ? '#1F2937' : '#FFFFFF'}
                      strokeWidth={0.5}
                      onMouseEnter={(e) => {
                        const name = countryInfo?.name || geo.properties?.name || 'Unknown';
                        if (countryInfo) {
                          setTooltipContent(
                            `${name}: ${countryInfo.total} sites (${countryInfo.cultural}C / ${countryInfo.natural}N / ${countryInfo.mixed}M)`
                          );
                        } else {
                          setTooltipContent(`${name}: No data`);
                        }
                        setTooltipPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setTooltipContent('')}
                      style={{
                        default: { outline: 'none' },
                        hover: { outline: 'none', fill: isDarkMode ? '#A78BFA' : '#7C3AED', cursor: 'pointer' },
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

      <div className={`flex items-center justify-center gap-2 mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <span>0</span>
        {[
          isDarkMode ? '#4C1D95' : '#DDD6FE',
          isDarkMode ? '#5B21B6' : '#C4B5FD',
          isDarkMode ? '#6D28D9' : '#A78BFA',
          isDarkMode ? '#7C3AED' : '#8B5CF6',
          isDarkMode ? '#8B5CF6' : '#7C3AED',
          isDarkMode ? '#A78BFA' : '#6D28D9',
        ].map((color, i) => (
          <div key={i} className="w-8 h-3 rounded-sm" style={{ backgroundColor: color }} />
        ))}
        <span>50+</span>
        <span className="ml-2">Heritage Sites</span>
      </div>
    </div>
  );
});

HeritageWorldMap.displayName = 'HeritageWorldMap';

export default HeritageWorldMap;
