'use client';

import React, { useState, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { COUNTRY_KEYS, COUNTRY_ISO_NUMERIC, COUNTRY_DISPLAY_NAMES, type CountryKey } from '../utils/countryMappings';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export interface CountryScore {
  country: CountryKey;
  hdi: number | null;
  gini: number | null;
  gdpPc: number | null;
  lifeExp: number | null;
}

interface DevelopmentWorldMapProps {
  isDarkMode: boolean;
  scoreCards: CountryScore[];
  metric?: 'hdi' | 'gini' | 'gdpPc' | 'lifeExp';
  onMetricChange?: (metric: 'hdi' | 'gini' | 'gdpPc' | 'lifeExp') => void;
}

const metricLabels: Record<string, { label: string; unit: string; range: [number, number]; colorLow: string; colorHigh: string; invert: boolean }> = {
  hdi: { label: 'HDI Score', unit: '', range: [0.4, 0.95], colorLow: '#fee2e2', colorHigh: '#15803d', invert: false },
  gini: { label: 'Gini Index', unit: '', range: [25, 55], colorLow: '#15803d', colorHigh: '#991b1b', invert: true },
  gdpPc: { label: 'GDP per capita (PPP)', unit: '$', range: [1000, 80000], colorLow: '#fef3c7', colorHigh: '#1e40af', invert: false },
  lifeExp: { label: 'Life Expectancy', unit: ' yrs', range: [55, 85], colorLow: '#fee2e2', colorHigh: '#15803d', invert: false },
};

const DevelopmentWorldMap: React.FC<DevelopmentWorldMapProps> = ({
  isDarkMode,
  scoreCards,
  metric = 'hdi',
  onMetricChange,
}) => {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const countryScoreMap = useMemo(() => {
    const m = new Map<string, CountryScore>();
    scoreCards.forEach(sc => {
      const iso = COUNTRY_ISO_NUMERIC[sc.country];
      if (iso) m.set(iso, sc);
    });
    return m;
  }, [scoreCards]);

  const config = metricLabels[metric];

  const colorScale = useMemo(() => {
    return scaleLinear<string>()
      .domain(config.range)
      .range([config.colorLow, config.colorHigh])
      .clamp(true);
  }, [config]);

  const getCountryColor = (isoNum: string): string => {
    const score = countryScoreMap.get(isoNum);
    if (!score) return isDarkMode ? '#374151' : '#e5e7eb';
    const value = score[metric];
    if (value === null || value === undefined) return isDarkMode ? '#374151' : '#e5e7eb';
    return colorScale(value);
  };

  const formatValue = (value: number | null): string => {
    if (value === null) return 'N/A';
    if (metric === 'hdi') return value.toFixed(3);
    if (metric === 'gdpPc') return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    if (metric === 'lifeExp') return `${value.toFixed(1)} yrs`;
    return value.toFixed(1);
  };

  return (
    <div id={slugify('Global Development Map')} className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
      <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Global Development Map
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {config.label} across tracked countries
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {onMetricChange && (
              <div className={`flex flex-wrap gap-1 p-1 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                {(['hdi', 'gini', 'gdpPc', 'lifeExp'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => onMetricChange(m)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      metric === m
                        ? isDarkMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 shadow'
                        : isDarkMode
                          ? 'text-gray-400 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {metricLabels[m].label}
                  </button>
                ))}
              </div>
            )}
            <SocialShareMenu title="Global Development Map" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
        </div>
      </div>

      <div className="relative">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 130 }}
          style={{ width: '100%', height: 'auto', backgroundColor: isDarkMode ? '#111827' : '#f9fafb' }}
        >
          <ZoomableGroup center={[10, 25]} zoom={1}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo: any) => {
                  const isoNum = String(geo.id).padStart(3, '0');
                  const score = countryScoreMap.get(isoNum);
                  const fill = getCountryColor(isoNum);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke={isDarkMode ? '#1f2937' : '#d1d5db'}
                      strokeWidth={0.3}
                      onMouseEnter={(e) => {
                        if (score) {
                          setTooltip({
                            text: `${COUNTRY_DISPLAY_NAMES[score.country]}: ${formatValue(score[metric])}`,
                            x: e.clientX,
                            y: e.clientY,
                          });
                        }
                      }}
                      onMouseMove={(e) => {
                        if (score) {
                          setTooltip({
                            text: `${COUNTRY_DISPLAY_NAMES[score.country]}: ${formatValue(score[metric])}`,
                            x: e.clientX,
                            y: e.clientY,
                          });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        default: { outline: 'none', cursor: score ? 'pointer' : 'default' },
                        hover: { outline: 'none', fill: score ? (isDarkMode ? '#60a5fa' : '#3b82f6') : fill },
                        pressed: { outline: 'none' },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {tooltip && (
          <div
            className={`fixed z-50 px-3 py-1.5 text-xs font-medium rounded-lg pointer-events-none shadow-lg ${
              isDarkMode ? 'bg-gray-900 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'
            }`}
            style={{ left: tooltip.x + 12, top: tooltip.y - 12 }}
          >
            {tooltip.text}
          </div>
        )}
      </div>

      <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {formatValue(config.range[config.invert ? 1 : 0])}
          </span>
          <div
            className="flex-1 h-3 rounded"
            style={{
              background: `linear-gradient(to right, ${config.colorLow}, ${config.colorHigh})`,
            }}
          />
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {formatValue(config.range[config.invert ? 0 : 1])}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className={`w-3 h-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            No data / not tracked
          </span>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentWorldMap;
