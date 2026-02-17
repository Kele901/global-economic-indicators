'use client';

import React, { useState, useMemo, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { CountryData } from '../services/worldbank';
import { technologyIndicators, formatPercent, formatNumber } from '../data/technologyIndicators';

// World map TopoJSON URL
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Country code mapping for World Bank data to ISO numeric codes
const COUNTRY_NAME_TO_ISO: { [key: string]: string } = {
  'USA': '840',
  'Canada': '124',
  'UK': '826',
  'France': '250',
  'Germany': '276',
  'Italy': '380',
  'Japan': '392',
  'Australia': '036',
  'Mexico': '484',
  'SouthKorea': '410',
  'Spain': '724',
  'Sweden': '752',
  'Switzerland': '756',
  'Turkey': '792',
  'Nigeria': '566',
  'China': '156',
  'Russia': '643',
  'Brazil': '076',
  'Chile': '152',
  'Argentina': '032',
  'India': '356',
  'Norway': '578',
  'Netherlands': '528',
  'Portugal': '620',
  'Belgium': '056',
  'Indonesia': '360',
  'SouthAfrica': '710',
  'Poland': '616',
  'SaudiArabia': '682',
  'Egypt': '818',
};

// Reverse mapping
const ISO_TO_COUNTRY_NAME: { [key: string]: string } = Object.fromEntries(
  Object.entries(COUNTRY_NAME_TO_ISO).map(([name, iso]) => [iso, name])
);

// Display names
const COUNTRY_DISPLAY_NAMES: { [key: string]: string } = {
  'USA': 'United States',
  'UK': 'United Kingdom',
  'SouthKorea': 'South Korea',
  'SouthAfrica': 'South Africa',
  'SaudiArabia': 'Saudi Arabia',
};

interface TechWorldMapProps {
  isDarkMode: boolean;
  data: CountryData[];
  metric: string;
  selectedYear: number;
}

// Color scale for the choropleth
const getColorScale = (value: number, metric: string, isDarkMode: boolean): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return isDarkMode ? '#374151' : '#E5E7EB'; // Gray for no data
  }

  // Define ranges based on metric
  let normalizedValue: number;
  
  if (metric === 'rdSpending') {
    // R&D spending: 0-5% of GDP
    normalizedValue = Math.min(value / 5, 1);
  } else if (metric === 'hightechExports') {
    // High-tech exports: 0-50%
    normalizedValue = Math.min(value / 50, 1);
  } else if (metric === 'patentApplicationsResident') {
    // Patents: 0-1.5M (log scale for better visualization)
    normalizedValue = Math.min(Math.log10(value + 1) / 6, 1);
  } else if (metric === 'researchersRD') {
    // Researchers: 0-8000 per million
    normalizedValue = Math.min(value / 8000, 1);
  } else {
    normalizedValue = 0.5;
  }

  // Color gradient from light to dark blue
  const colors = isDarkMode
    ? ['#1E3A5F', '#1E4D7B', '#2563EB', '#3B82F6', '#60A5FA']
    : ['#DBEAFE', '#93C5FD', '#3B82F6', '#2563EB', '#1D4ED8'];

  const index = Math.floor(normalizedValue * (colors.length - 1));
  return colors[Math.min(index, colors.length - 1)];
};

const TechWorldMap: React.FC<TechWorldMapProps> = ({
  isDarkMode,
  data,
  metric,
  selectedYear
}) => {
  const [tooltipContent, setTooltipContent] = useState<{
    country: string;
    value: number | null;
    x: number;
    y: number;
  } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);

  // Get value for a country
  const getCountryValue = (countryName: string): number | null => {
    // Try exact year first
    const yearData = data.find(d => d.year === selectedYear);
    if (yearData && yearData[countryName] !== undefined && yearData[countryName] !== null) {
      return yearData[countryName] as number;
    }
    // Try previous years
    for (let y = selectedYear - 1; y >= selectedYear - 3; y--) {
      const fallbackData = data.find(d => d.year === y);
      if (fallbackData && fallbackData[countryName] !== undefined && fallbackData[countryName] !== null) {
        return fallbackData[countryName] as number;
      }
    }
    return null;
  };

  // Build data map
  const countryDataMap = useMemo(() => {
    const map: { [isoCode: string]: number | null } = {};
    Object.entries(COUNTRY_NAME_TO_ISO).forEach(([name, iso]) => {
      map[iso] = getCountryValue(name);
    });
    return map;
  }, [data, selectedYear]);

  // Format value for display
  const formatValue = (value: number | null): string => {
    if (value === null) return 'No data';
    
    if (metric === 'rdSpending' || metric === 'hightechExports') {
      return formatPercent(value);
    }
    return formatNumber(value);
  };

  // Get metric label
  const getMetricLabel = (): string => {
    const indicator = technologyIndicators[metric];
    return indicator ? indicator.shortName : metric;
  };

  const themeColors = {
    background: isDarkMode ? '#111827' : '#F9FAFB',
    border: isDarkMode ? '#374151' : '#E5E7EB',
    text: isDarkMode ? '#F3F4F6' : '#111827',
    textSecondary: isDarkMode ? '#9CA3AF' : '#6B7280'
  };

  return (
    <div className="relative">
      {/* Map Container */}
      <div 
        className="w-full h-[450px] rounded-b-xl overflow-hidden"
        style={{ backgroundColor: themeColors.background }}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 130,
            center: [0, 30]
          }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            onMoveEnd={({ coordinates, zoom }) => {
              setCenter(coordinates);
              setZoom(zoom);
            }}
            minZoom={1}
            maxZoom={8}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isoCode = geo.id;
                  const countryName = ISO_TO_COUNTRY_NAME[isoCode];
                  const value = countryDataMap[isoCode];
                  const hasData = countryName !== undefined;
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={hasData 
                        ? getColorScale(value as number, metric, isDarkMode)
                        : (isDarkMode ? '#1F2937' : '#F3F4F6')
                      }
                      stroke={isDarkMode ? '#374151' : '#D1D5DB'}
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none' },
                        hover: { 
                          outline: 'none',
                          fill: hasData ? '#F59E0B' : (isDarkMode ? '#374151' : '#E5E7EB'),
                          cursor: hasData ? 'pointer' : 'default'
                        },
                        pressed: { outline: 'none' }
                      }}
                      onMouseEnter={(evt) => {
                        if (hasData) {
                          const { clientX, clientY } = evt;
                          setTooltipContent({
                            country: COUNTRY_DISPLAY_NAMES[countryName] || countryName,
                            value: value,
                            x: clientX,
                            y: clientY
                          });
                        }
                      }}
                      onMouseLeave={() => {
                        setTooltipContent(null);
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Tooltip */}
      {tooltipContent && (
        <div
          className={`fixed z-50 px-3 py-2 rounded-lg shadow-lg pointer-events-none ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}
          style={{
            left: tooltipContent.x + 10,
            top: tooltipContent.y - 40,
          }}
        >
          <div className="font-semibold">{tooltipContent.country}</div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {getMetricLabel()}: {formatValue(tooltipContent.value)}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className={`absolute bottom-4 left-4 p-3 rounded-lg ${
        isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
      } shadow-lg`}>
        <div className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {getMetricLabel()}
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Low</span>
          <div className="flex">
            {(isDarkMode
              ? ['#1E3A5F', '#1E4D7B', '#2563EB', '#3B82F6', '#60A5FA']
              : ['#DBEAFE', '#93C5FD', '#3B82F6', '#2563EB', '#1D4ED8']
            ).map((color, i) => (
              <div
                key={i}
                className="w-6 h-3"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>High</span>
        </div>
        <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Gray = No data
        </div>
      </div>

      {/* Zoom Controls */}
      <div className={`absolute bottom-4 right-4 flex flex-col gap-1 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        <button
          onClick={() => setZoom(Math.min(zoom * 1.5, 8))}
          className={`w-8 h-8 rounded flex items-center justify-center ${
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
          } shadow`}
        >
          +
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom / 1.5, 1))}
          className={`w-8 h-8 rounded flex items-center justify-center ${
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
          } shadow`}
        >
          -
        </button>
        <button
          onClick={() => { setZoom(1); setCenter([0, 20]); }}
          className={`w-8 h-8 rounded flex items-center justify-center text-xs ${
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
          } shadow`}
        >
          ⟲
        </button>
      </div>

      {/* Year indicator */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-lg ${
        isDarkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90 text-gray-900'
      } shadow`}>
        <span className="text-sm font-medium">{selectedYear}</span>
      </div>
    </div>
  );
};

export default memo(TechWorldMap);
