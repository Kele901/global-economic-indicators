'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { fetchGlobalData, CountryData } from '../services/worldbank';
import { METRIC_CATEGORIES, ALL_METRICS, formatMetricValue } from '../utils/metricCategories';
import { COUNTRY_ISO_NUMERIC, ISO_NUMERIC_TO_COUNTRY, COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG, type CountryKey } from '../utils/countryMappings';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

function colorScale(value: number, min: number, max: number, isDark: boolean): string {
  if (max === min) return isDark ? '#374151' : '#d1d5db';
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const r = Math.round(59 + t * (220 - 59));
  const g = Math.round(130 + t * (38 - 130));
  const b = Math.round(246 + t * (38 - 246));
  return `rgb(${r},${g},${b})`;
}

export default function GlobalHeatmapPage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [data, setData] = useState<Record<string, CountryData[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('gdpGrowth');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<{ name: string; value: number; x: number; y: number } | null>(null);
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({ coordinates: [0, 20], zoom: 1 });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetchGlobalData().then(d => { setData(d as any); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const metricDef = ALL_METRICS.find(m => m.key === selectedMetric);

  const availableYears = useMemo(() => {
    if (!data) return [];
    const series = (data as any)[selectedMetric] as CountryData[] | undefined;
    if (!series) return [];
    return series.map(r => Number(r.year)).filter(y => !isNaN(y)).sort((a, b) => a - b);
  }, [data, selectedMetric]);

  useEffect(() => {
    if (availableYears.length > 0 && selectedYear === null) {
      setSelectedYear(availableYears[availableYears.length - 1]);
    }
  }, [availableYears, selectedYear]);

  const { countryValues, min, max } = useMemo(() => {
    if (!data || !selectedYear) return { countryValues: {} as Record<string, number>, min: 0, max: 0 };
    const series = (data as any)[selectedMetric] as CountryData[] | undefined;
    if (!series) return { countryValues: {} as Record<string, number>, min: 0, max: 0 };
    const yearRow = series.find(r => Number(r.year) === selectedYear);
    if (!yearRow) return { countryValues: {} as Record<string, number>, min: 0, max: 0 };

    const vals: Record<string, number> = {};
    let mn = Infinity, mx = -Infinity;
    for (const [ck, iso] of Object.entries(COUNTRY_ISO_NUMERIC)) {
      const v = Number(yearRow[ck]);
      if (!isNaN(v) && v !== 0) {
        vals[iso] = v;
        mn = Math.min(mn, v);
        mx = Math.max(mx, v);
      }
    }
    return { countryValues: vals, min: mn === Infinity ? 0 : mn, max: mx === -Infinity ? 0 : mx };
  }, [data, selectedMetric, selectedYear]);

  const handleMoveEnd = useCallback((pos: { coordinates: [number, number]; zoom: number }) => setPosition(pos), []);

  const tc = isDarkMode ? {
    bg: 'bg-gray-900', card: 'bg-gray-800 border-gray-700', text: 'text-white',
    textSec: 'text-gray-400', ocean: '#0a1929', land: '#1e293b', border: '#374151',
    selectBg: 'bg-gray-700 text-white border-gray-600',
  } : {
    bg: 'bg-gray-50', card: 'bg-white border-gray-200', text: 'text-gray-900',
    textSec: 'text-gray-500', ocean: '#e3f2fd', land: '#e5e7eb', border: '#d1d5db',
    selectBg: 'bg-white text-gray-900 border-gray-300',
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${tc.bg}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className={tc.textSec}>Loading global data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${tc.bg} ${tc.text}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">Global Heatmap</h1>
            <p className={`${tc.textSec}`}>Visualize any economic metric across the world map</p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Light</span>
            <button
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 shadow-sm ${isDarkMode ? 'translate-x-6' : ''}`} />
            </button>
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Dark</span>
          </div>
        </div>

        <div className={`rounded-xl border p-4 sm:p-6 mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
          <h2 className="text-lg sm:text-xl font-semibold mb-3">How to Read the Heatmap</h2>
          <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            This choropleth map colors each country according to its value for the selected economic metric in a
            given year. <strong>Darker shades</strong> indicate higher values, while <strong>lighter shades</strong> indicate
            lower values. Countries without data appear in a neutral gray. Use the metric dropdown to switch between
            indicators like GDP growth, inflation, debt-to-GDP, and more. The year slider lets you track how values
            evolve over time.
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Hover over any country to see its exact value. Use the + / - buttons or scroll to zoom into specific regions.
          </p>
        </div>

        {/* Controls */}
        <div className={`rounded-xl border p-4 mb-6 flex flex-wrap gap-4 items-end ${tc.card}`}>
          <div className="flex-1 min-w-[200px]">
            <label className={`block text-xs uppercase tracking-wider mb-1 ${tc.textSec}`}>Metric</label>
            <select
              value={selectedMetric}
              onChange={e => { setSelectedMetric(e.target.value); setSelectedYear(null); }}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}
            >
              {METRIC_CATEGORIES.map(cat => (
                <optgroup key={cat.id} label={cat.label}>
                  {cat.metrics.map(m => (
                    <option key={m.key} value={m.key}>{m.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="min-w-[120px]">
            <label className={`block text-xs uppercase tracking-wider mb-1 ${tc.textSec}`}>Year</label>
            <select
              value={selectedYear ?? ''}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}
            >
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPosition(p => ({ ...p, zoom: Math.min(p.zoom * 1.5, 6) }))}
              className={`px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}>+</button>
            <button onClick={() => setPosition(p => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }))}
              className={`px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}>−</button>
            <button onClick={() => setPosition({ coordinates: [0, 20], zoom: 1 })}
              className={`px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}>Reset</button>
          </div>
        </div>

        {/* Map */}
        <div className={`rounded-xl border overflow-hidden relative ${tc.card}`} style={{ backgroundColor: tc.ocean }}>
          {hoveredCountry && (
            <div className={`absolute z-10 px-3 py-2 rounded-lg border shadow-lg text-sm pointer-events-none ${tc.card}`}
              style={{ left: hoveredCountry.x + 10, top: hoveredCountry.y - 40 }}>
              <p className="font-semibold">{hoveredCountry.name}</p>
              <p className={tc.textSec}>{metricDef?.label}: {formatMetricValue(selectedMetric, hoveredCountry.value)}</p>
            </div>
          )}
          <ComposableMap projectionConfig={{ scale: 147 }} style={{ width: '100%', height: 'auto' }}>
            <ZoomableGroup center={position.coordinates} zoom={position.zoom} onMoveEnd={handleMoveEnd}>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const isoCode = geo.id;
                    const value = countryValues[isoCode];
                    const countryKey = ISO_NUMERIC_TO_COUNTRY[isoCode];
                    return (
                      <Geography
                        key={geo.rpiKey}
                        geography={geo}
                        fill={value !== undefined ? colorScale(value, min, max, isDarkMode) : tc.land}
                        stroke={tc.border}
                        strokeWidth={0.5}
                        style={{
                          hover: { fill: '#f59e0b', outline: 'none' },
                          pressed: { outline: 'none' },
                          default: { outline: 'none' },
                        }}
                        onMouseEnter={(e) => {
                          if (value !== undefined && countryKey) {
                            setHoveredCountry({
                              name: COUNTRY_DISPLAY_NAMES[countryKey] || isoCode,
                              value,
                              x: e.clientX,
                              y: e.clientY,
                            });
                          }
                        }}
                        onMouseLeave={() => setHoveredCountry(null)}
                        onClick={() => {
                          if (countryKey) {
                            window.location.href = `/country/${COUNTRY_KEY_TO_SLUG[countryKey]}`;
                          }
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {/* Color Legend */}
        <div className={`rounded-xl border p-4 mt-4 ${tc.card}`}>
          <div className="flex items-center gap-4">
            <span className={`text-sm ${tc.textSec}`}>{metricDef?.label || selectedMetric}</span>
            <div className="flex-1 h-4 rounded-full overflow-hidden" style={{
              background: `linear-gradient(to right, ${colorScale(min, min, max, isDarkMode)}, ${colorScale((min + max) / 2, min, max, isDarkMode)}, ${colorScale(max, min, max, isDarkMode)})`
            }} />
            <span className={`text-xs ${tc.textSec}`}>{formatMetricValue(selectedMetric, min)}</span>
            <span className={`text-xs ${tc.textSec}`}>{formatMetricValue(selectedMetric, max)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
