'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { fetchGlobalData, CountryData } from '../services/worldbank';
import { METRIC_CATEGORIES, ALL_METRICS, formatMetricValue, getRelatedMetrics, getCategoryForMetric } from '../utils/metricCategories';
import { COUNTRY_ISO_NUMERIC, ISO_NUMERIC_TO_COUNTRY, COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG, COUNTRY_COLORS, type CountryKey } from '../utils/countryMappings';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ============================================================
// View Modes
// ============================================================

type ViewMode = 'choropleth' | 'bubble' | 'ranked' | 'comparison' | 'table';

const VIEW_MODE_CONFIG: { id: ViewMode; label: string; icon: string; description: string }[] = [
  { id: 'choropleth', label: 'Choropleth', icon: 'M', description: 'Countries colored by value' },
  { id: 'bubble', label: 'Bubble Map', icon: 'B', description: 'Scaled circles on each country' },
  { id: 'ranked', label: 'Ranked Bars', icon: 'R', description: 'Horizontal bar chart ranking' },
  { id: 'comparison', label: 'Compare', icon: 'C', description: 'Two metrics side by side' },
  { id: 'table', label: 'Table', icon: 'T', description: 'Sortable table with multiple metrics' },
];

// ============================================================
// Country Centroids (lon, lat) for bubble markers
// ============================================================

const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  USA: [-98.5, 39.8], Canada: [-106.3, 56.1], UK: [-3.4, 55.4], France: [2.2, 46.2],
  Germany: [10.4, 51.2], Italy: [12.6, 41.9], Japan: [138.3, 36.2], Australia: [133.8, -25.3],
  Mexico: [-102.5, 23.6], SouthKorea: [127.8, 35.9], Spain: [-3.7, 40.5], Sweden: [18.6, 60.1],
  Switzerland: [8.2, 46.8], Turkey: [35.2, 38.9], Nigeria: [8.7, 9.1], China: [104.2, 35.9],
  Russia: [105.3, 61.5], Brazil: [-51.9, -14.2], Chile: [-71.5, -35.7], Argentina: [-63.6, -38.4],
  India: [78.9, 20.6], Norway: [8.5, 60.5], Netherlands: [5.3, 52.1], Portugal: [-8.2, 39.4],
  Belgium: [4.5, 50.5], Indonesia: [113.9, -0.8], SouthAfrica: [22.9, -30.6], Poland: [19.1, 51.9],
  SaudiArabia: [45.1, 23.9], Egypt: [30.8, 26.8], Israel: [34.9, 31.0], Singapore: [103.8, 1.4],
};

// ============================================================
// Heatmap Color Palettes
// ============================================================

type HeatmapStyleId = 'thermal' | 'viridis' | 'magma' | 'ocean' | 'diverging' | 'monochrome' | 'sunset' | 'forest';

interface HeatmapStyle {
  id: HeatmapStyleId;
  label: string;
  preview: string[];
  interpolate: (t: number, isDark: boolean) => string;
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function lerpRGB(c1: [number, number, number], c2: [number, number, number], t: number): string {
  return `rgb(${Math.round(lerp(c1[0], c2[0], t))},${Math.round(lerp(c1[1], c2[1], t))},${Math.round(lerp(c1[2], c2[2], t))})`;
}

function multiStopRGB(stops: [number, number, number][], t: number): string {
  const n = stops.length - 1;
  const idx = Math.min(Math.floor(t * n), n - 1);
  const local = (t * n) - idx;
  return lerpRGB(stops[idx], stops[idx + 1], local);
}

const HEATMAP_STYLES: HeatmapStyle[] = [
  { id: 'thermal', label: 'Thermal', preview: ['#3b82f6', '#a855f7', '#dc2626'],
    interpolate: (t) => multiStopRGB([[59,130,246],[168,85,247],[220,38,38]], t) },
  { id: 'viridis', label: 'Viridis', preview: ['#440154', '#21918c', '#fde725'],
    interpolate: (t) => multiStopRGB([[68,1,84],[59,82,139],[33,145,140],[94,201,98],[253,231,37]], t) },
  { id: 'magma', label: 'Magma', preview: ['#000004', '#b73779', '#fcfdbf'],
    interpolate: (t) => multiStopRGB([[0,0,4],[81,18,124],[183,55,121],[252,135,97],[252,253,191]], t) },
  { id: 'ocean', label: 'Ocean', preview: ['#0c1445', '#0ea5e9', '#67e8f9'],
    interpolate: (t, isDark) => multiStopRGB(isDark ? [[12,20,69],[6,78,140],[14,165,233],[103,232,249]] : [[8,47,73],[14,116,178],[56,189,248],[186,230,253]], t) },
  { id: 'diverging', label: 'Diverging', preview: ['#ef4444', '#fafafa', '#22c55e'],
    interpolate: (t, isDark) => { const mid = isDark ? [55,65,81] : [250,250,250]; return multiStopRGB([[239,68,68],[251,146,60],mid as [number,number,number],[74,222,128],[34,197,94]], t); } },
  { id: 'monochrome', label: 'Mono', preview: ['#1e293b', '#64748b', '#f1f5f9'],
    interpolate: (t, isDark) => multiStopRGB(isDark ? [[30,41,59],[71,85,105],[148,163,184],[226,232,240]] : [[15,23,42],[51,65,85],[100,116,139],[241,245,249]], t) },
  { id: 'sunset', label: 'Sunset', preview: ['#1e1b4b', '#e11d48', '#fbbf24'],
    interpolate: (t) => multiStopRGB([[30,27,75],[109,40,217],[225,29,72],[249,115,22],[251,191,36]], t) },
  { id: 'forest', label: 'Forest', preview: ['#14532d', '#22c55e', '#fef08a'],
    interpolate: (t) => multiStopRGB([[20,83,45],[22,101,52],[34,197,94],[163,230,53],[254,240,138]], t) },
];

function getHeatmapColor(styleId: HeatmapStyleId, value: number, min: number, max: number, isDark: boolean): string {
  if (max === min) return isDark ? '#374151' : '#d1d5db';
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return HEATMAP_STYLES.find(s => s.id === styleId)!.interpolate(t, isDark);
}

function getGradientCSS(styleId: HeatmapStyleId, isDark: boolean): string {
  const style = HEATMAP_STYLES.find(s => s.id === styleId)!;
  const colors = Array.from({ length: 11 }, (_, i) => style.interpolate(i / 10, isDark));
  return `linear-gradient(to right, ${colors.join(', ')})`;
}

// Metrics that benefit from diverging palette (can be negative)
const DIVERGING_METRICS = new Set([
  'budgetBalance', 'currentAccount', 'populationGrowth', 'tradeBalance', 'fdi',
]);

// ============================================================
// Country Flags + Helpers
// ============================================================

const COUNTRY_FLAG_EMOJI: Record<string, string> = {
  USA: '\u{1F1FA}\u{1F1F8}', Canada: '\u{1F1E8}\u{1F1E6}', UK: '\u{1F1EC}\u{1F1E7}',
  France: '\u{1F1EB}\u{1F1F7}', Germany: '\u{1F1E9}\u{1F1EA}', Italy: '\u{1F1EE}\u{1F1F9}',
  Japan: '\u{1F1EF}\u{1F1F5}', Australia: '\u{1F1E6}\u{1F1FA}', Mexico: '\u{1F1F2}\u{1F1FD}',
  SouthKorea: '\u{1F1F0}\u{1F1F7}', Spain: '\u{1F1EA}\u{1F1F8}', Sweden: '\u{1F1F8}\u{1F1EA}',
  Switzerland: '\u{1F1E8}\u{1F1ED}', Turkey: '\u{1F1F9}\u{1F1F7}', Nigeria: '\u{1F1F3}\u{1F1EC}',
  China: '\u{1F1E8}\u{1F1F3}', Russia: '\u{1F1F7}\u{1F1FA}', Brazil: '\u{1F1E7}\u{1F1F7}',
  Chile: '\u{1F1E8}\u{1F1F1}', Argentina: '\u{1F1E6}\u{1F1F7}', India: '\u{1F1EE}\u{1F1F3}',
  Norway: '\u{1F1F3}\u{1F1F4}', Netherlands: '\u{1F1F3}\u{1F1F1}', Portugal: '\u{1F1F5}\u{1F1F9}',
  Belgium: '\u{1F1E7}\u{1F1EA}', Indonesia: '\u{1F1EE}\u{1F1E9}', SouthAfrica: '\u{1F1FF}\u{1F1E6}',
  Poland: '\u{1F1F5}\u{1F1F1}', SaudiArabia: '\u{1F1F8}\u{1F1E6}', Egypt: '\u{1F1EA}\u{1F1EC}',
  Israel: '\u{1F1EE}\u{1F1F1}', Singapore: '\u{1F1F8}\u{1F1EC}',
};

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

interface CountryDetailData {
  countryKey: CountryKey;
  countryName: string;
  value: number;
  rank: number;
  total: number;
  median: number;
  percentile: number;
  history: { year: number; value: number }[];
  relatedMetrics: { key: string; label: string; value: number | null; format: (v: number) => string }[];
  yearOverYearChange: number | null;
}

// ============================================================
// Helper: extract country key -> value map for a metric+year
// ============================================================
function getCountryKeyValues(data: Record<string, CountryData[]>, metricKey: string, year: number): Record<string, number> {
  const series = (data as any)[metricKey] as CountryData[] | undefined;
  if (!series) return {};
  const row = series.find(r => Number(r.year) === year);
  if (!row) return {};
  const vals: Record<string, number> = {};
  for (const ck of Object.keys(COUNTRY_ISO_NUMERIC)) {
    const v = Number(row[ck]);
    if (!isNaN(v) && v !== 0) vals[ck] = v;
  }
  return vals;
}

// ============================================================
// Main Page Component
// ============================================================

export default function GlobalHeatmapPage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [data, setData] = useState<Record<string, CountryData[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('gdpGrowth');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<{ name: string; value: number; x: number; y: number } | null>(null);
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({ coordinates: [0, 20], zoom: 1 });
  const [detailCountry, setDetailCountry] = useState<CountryKey | null>(null);
  const [heatmapStyle, setHeatmapStyle] = useLocalStorage<HeatmapStyleId>('heatmapStyle', 'thermal');
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('heatmapViewMode', 'choropleth');
  const [compareMetric, setCompareMetric] = useState('inflationRates');
  const [compareStyle, setCompareStyle] = useLocalStorage<HeatmapStyleId>('heatmapCompareStyle', 'ocean');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDarkMode) { document.documentElement.classList.add('dark'); document.documentElement.setAttribute('data-theme', 'dark'); document.body.classList.add('dark'); }
    else { document.documentElement.classList.remove('dark'); document.documentElement.setAttribute('data-theme', 'light'); document.body.classList.remove('dark'); }
  }, [isDarkMode]);

  useEffect(() => { fetchGlobalData().then(d => { setData(d as any); setLoading(false); }).catch(() => setLoading(false)); }, []);
  useEffect(() => { const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setDetailCountry(null); }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); }, []);

  // Auto-switch to diverging palette for negative-capable metrics
  useEffect(() => {
    if (DIVERGING_METRICS.has(selectedMetric) && heatmapStyle !== 'diverging') {
      setHeatmapStyle('diverging');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMetric]);

  // Auto-pick a contrasting compare palette when primary palette changes
  useEffect(() => {
    if (viewMode === 'comparison' && compareStyle === heatmapStyle) {
      const CONTRAST_MAP: Partial<Record<HeatmapStyleId, HeatmapStyleId>> = {
        thermal: 'ocean', ocean: 'thermal', viridis: 'magma', magma: 'viridis',
        diverging: 'sunset', sunset: 'diverging', monochrome: 'forest', forest: 'monochrome',
      };
      setCompareStyle(CONTRAST_MAP[heatmapStyle] || 'ocean');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heatmapStyle, viewMode]);

  const metricDef = ALL_METRICS.find(m => m.key === selectedMetric);
  const compareMetricDef = ALL_METRICS.find(m => m.key === compareMetric);

  const availableYears = useMemo(() => {
    if (!data) return [];
    const series = (data as any)[selectedMetric] as CountryData[] | undefined;
    if (!series) return [];
    return series.map(r => Number(r.year)).filter(y => !isNaN(y)).sort((a, b) => a - b);
  }, [data, selectedMetric]);

  useEffect(() => {
    if (availableYears.length > 0 && selectedYear === null) setSelectedYear(availableYears[availableYears.length - 1]);
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
      if (!isNaN(v) && v !== 0) { vals[iso] = v; mn = Math.min(mn, v); mx = Math.max(mx, v); }
    }
    return { countryValues: vals, min: mn === Infinity ? 0 : mn, max: mx === -Infinity ? 0 : mx };
  }, [data, selectedMetric, selectedYear]);

  // Country-key based values (for bubble + ranked views)
  const countryKeyValues = useMemo(() => {
    if (!data || !selectedYear) return {} as Record<string, number>;
    return getCountryKeyValues(data, selectedMetric, selectedYear);
  }, [data, selectedMetric, selectedYear]);

  // Comparison metric values
  const compareValues = useMemo(() => {
    if (!data || !selectedYear || viewMode !== 'comparison') return { vals: {} as Record<string, number>, min: 0, max: 0 };
    const series = (data as any)[compareMetric] as CountryData[] | undefined;
    if (!series) return { vals: {} as Record<string, number>, min: 0, max: 0 };
    const yearRow = series.find(r => Number(r.year) === selectedYear);
    if (!yearRow) return { vals: {} as Record<string, number>, min: 0, max: 0 };
    const vals: Record<string, number> = {};
    let mn = Infinity, mx = -Infinity;
    for (const [ck, iso] of Object.entries(COUNTRY_ISO_NUMERIC)) {
      const v = Number(yearRow[ck]);
      if (!isNaN(v) && v !== 0) { vals[iso] = v; mn = Math.min(mn, v); mx = Math.max(mx, v); }
    }
    return { vals, min: mn === Infinity ? 0 : mn, max: mx === -Infinity ? 0 : mx };
  }, [data, compareMetric, selectedYear, viewMode]);

  // Country detail
  const countryDetail: CountryDetailData | null = useMemo(() => {
    if (!detailCountry || !data || !selectedYear || !metricDef) return null;
    const series = (data as any)[selectedMetric] as CountryData[] | undefined;
    if (!series) return null;
    const yearRow = series.find(r => Number(r.year) === selectedYear);
    const value = yearRow ? Number(yearRow[detailCountry]) : NaN;
    if (isNaN(value) || value === 0) return null;
    const history = series.map(row => ({ year: Number(row.year), value: Number(row[detailCountry]) })).filter(d => !isNaN(d.value) && d.value !== 0).sort((a, b) => a.year - b.year);
    const allVals: { country: string; value: number }[] = [];
    for (const ck of Object.keys(COUNTRY_ISO_NUMERIC)) { const v = yearRow ? Number(yearRow[ck]) : NaN; if (!isNaN(v) && v !== 0) allVals.push({ country: ck, value: v }); }
    allVals.sort((a, b) => b.value - a.value);
    const rank = allVals.findIndex(d => d.country === detailCountry) + 1;
    const total = allVals.length;
    const sortedValues = allVals.map(d => d.value);
    const median = sortedValues.length > 0 ? sortedValues[Math.floor(sortedValues.length / 2)] : 0;
    const percentile = total > 0 ? Math.round(((total - rank) / (total - 1)) * 100) : 0;
    let yearOverYearChange: number | null = null;
    const prevYearRow = series.find(r => Number(r.year) === selectedYear - 1);
    if (prevYearRow) { const prevVal = Number(prevYearRow[detailCountry]); if (!isNaN(prevVal) && prevVal !== 0) yearOverYearChange = value - prevVal; }
    const related = getRelatedMetrics(selectedMetric);
    const relatedMetrics = related.map(rm => {
      const relSeries = (data as any)[rm.key] as CountryData[] | undefined;
      if (!relSeries) return { key: rm.key, label: rm.label, value: null, format: rm.format };
      const relRow = relSeries.find(r => Number(r.year) === selectedYear);
      const rv = relRow ? Number(relRow[detailCountry]) : NaN;
      return { key: rm.key, label: rm.label, value: (!isNaN(rv) && rv !== 0) ? rv : null, format: rm.format };
    });
    return { countryKey: detailCountry, countryName: COUNTRY_DISPLAY_NAMES[detailCountry] || detailCountry, value, rank, total, median, percentile, history, relatedMetrics, yearOverYearChange };
  }, [detailCountry, data, selectedMetric, selectedYear, metricDef]);

  const handleMoveEnd = useCallback((pos: { coordinates: [number, number]; zoom: number }) => setPosition(pos), []);

  // Ranked bar data (must be above early returns to satisfy React hook rules)
  const rankedData = useMemo(() => {
    return Object.entries(countryKeyValues)
      .map(([ck, v]) => ({ country: ck, name: (COUNTRY_DISPLAY_NAMES[ck as CountryKey] || ck), value: v, color: COUNTRY_COLORS[ck as CountryKey] || '#6b7280' }))
      .sort((a, b) => b.value - a.value);
  }, [countryKeyValues]);

  // Table view: sort state
  const [tableSortCol, setTableSortCol] = useState<string>('primary');
  const [tableSortDir, setTableSortDir] = useState<'asc' | 'desc'>('desc');

  // Table view: multi-metric data for every country
  const tableColumns = useMemo(() => {
    const related = getRelatedMetrics(selectedMetric);
    return [metricDef!, ...related].filter(Boolean);
  }, [selectedMetric, metricDef]);

  const tableData = useMemo(() => {
    if (!data || !selectedYear) return [];
    const rows: { country: string; name: string; flag: string; values: Record<string, number | null>; yoy: number | null }[] = [];
    const primarySeries = (data as any)[selectedMetric] as CountryData[] | undefined;
    if (!primarySeries) return [];
    const yearRow = primarySeries.find(r => Number(r.year) === selectedYear);
    const prevRow = primarySeries.find(r => Number(r.year) === selectedYear - 1);

    for (const ck of Object.keys(COUNTRY_ISO_NUMERIC)) {
      const pv = yearRow ? Number(yearRow[ck]) : NaN;
      if (isNaN(pv) || pv === 0) continue;
      const vals: Record<string, number | null> = { primary: pv };
      for (const col of tableColumns.slice(1)) {
        const s = (data as any)[col.key] as CountryData[] | undefined;
        const r = s?.find(r => Number(r.year) === selectedYear);
        const v = r ? Number(r[ck]) : NaN;
        vals[col.key] = (!isNaN(v) && v !== 0) ? v : null;
      }
      const prevVal = prevRow ? Number(prevRow[ck]) : NaN;
      rows.push({
        country: ck,
        name: COUNTRY_DISPLAY_NAMES[ck as CountryKey] || ck,
        flag: COUNTRY_FLAG_EMOJI[ck] || '',
        values: vals,
        yoy: (!isNaN(prevVal) && prevVal !== 0) ? pv - prevVal : null,
      });
    }

    rows.sort((a, b) => {
      const colKey = tableSortCol;
      const av = a.values[colKey] ?? (colKey === 'yoy' ? a.yoy : null);
      const bv = b.values[colKey] ?? (colKey === 'yoy' ? b.yoy : null);
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      return tableSortDir === 'desc' ? bv - av : av - bv;
    });

    return rows;
  }, [data, selectedYear, selectedMetric, tableColumns, tableSortCol, tableSortDir]);

  const toggleSort = useCallback((col: string) => {
    setTableSortCol(prev => {
      if (prev === col) { setTableSortDir(d => d === 'desc' ? 'asc' : 'desc'); return col; }
      setTableSortDir('desc');
      return col;
    });
  }, []);

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

  // Shared map renderer used by choropleth, bubble, and comparison views
  const renderMap = (
    values: Record<string, number>,
    vMin: number,
    vMax: number,
    style: HeatmapStyleId,
    opts?: { compact?: boolean; showBubbles?: boolean; bubbleKeyValues?: Record<string, number>; bubbleMin?: number; bubbleMax?: number }
  ) => (
    <ComposableMap projectionConfig={{ scale: opts?.compact ? 120 : 147 }} style={{ width: '100%', height: 'auto' }}>
      <ZoomableGroup center={position.coordinates} zoom={position.zoom} onMoveEnd={handleMoveEnd}>
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => {
              const isoCode = geo.id;
              const value = values[isoCode];
              const countryKey = ISO_NUMERIC_TO_COUNTRY[isoCode];
              const isSelected = countryKey === detailCountry;
              return (
                <Geography
                  key={geo.rpiKey}
                  geography={geo}
                  fill={value !== undefined ? getHeatmapColor(style, value, vMin, vMax, isDarkMode) : tc.land}
                  stroke={isSelected ? '#f59e0b' : tc.border}
                  strokeWidth={isSelected ? 2 : 0.5}
                  style={{ hover: { fill: '#f59e0b', outline: 'none', cursor: 'pointer' }, pressed: { outline: 'none' }, default: { outline: 'none' } }}
                  onMouseEnter={(e) => {
                    if (value !== undefined && countryKey) {
                      const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
                      setHoveredCountry({ name: COUNTRY_DISPLAY_NAMES[countryKey] || isoCode, value, x: e.clientX - (rect?.left || 0), y: e.clientY - (rect?.top || 0) });
                    }
                  }}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => { if (countryKey && value !== undefined) setDetailCountry(prev => prev === countryKey ? null : countryKey); }}
                />
              );
            })
          }
        </Geographies>
        {opts?.showBubbles && opts.bubbleKeyValues && (() => {
          const bkv = opts.bubbleKeyValues!;
          const bMin = opts.bubbleMin ?? 0;
          const bMax = opts.bubbleMax ?? 1;
          const maxR = opts.compact ? 12 : 20;
          return Object.entries(bkv).map(([ck, val]) => {
            const coords = COUNTRY_CENTROIDS[ck];
            if (!coords) return null;
            const t = bMax === bMin ? 0.5 : (val - bMin) / (bMax - bMin);
            const r = Math.max(3, Math.sqrt(t) * maxR);
            return (
              <Marker key={ck} coordinates={coords}>
                <circle
                  r={r}
                  fill={getHeatmapColor(style, val, bMin, bMax, isDarkMode)}
                  fillOpacity={0.75}
                  stroke={isDarkMode ? '#e5e7eb' : '#1f2937'}
                  strokeWidth={0.5}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
                    setHoveredCountry({ name: COUNTRY_DISPLAY_NAMES[ck as CountryKey] || ck, value: val, x: e.clientX - (rect?.left || 0), y: e.clientY - (rect?.top || 0) });
                  }}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => setDetailCountry(prev => prev === ck as CountryKey ? null : ck as CountryKey)}
                />
              </Marker>
            );
          });
        })()}
      </ZoomableGroup>
    </ComposableMap>
  );

  return (
    <div className={`min-h-screen transition-colors duration-200 ${tc.bg} ${tc.text}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">Global Heatmap</h1>
            <p className={tc.textSec}>Visualize any economic metric across the world map</p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Light</span>
            <button className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`} onClick={() => setIsDarkMode(!isDarkMode)}>
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 shadow-sm ${isDarkMode ? 'translate-x-6' : ''}`} />
            </button>
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Dark</span>
          </div>
        </div>

        {/* How-to box */}
        <div className={`rounded-xl border p-4 sm:p-6 mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
          <h2 className="text-lg sm:text-xl font-semibold mb-3">How to Read the Heatmap</h2>
          <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Choose a <strong>view mode</strong> to change how data is displayed: Choropleth colors countries, Bubble Map shows scaled circles, Ranked Bars gives a sortable ranking, and Compare shows two metrics side by side. Click any country for a detailed breakdown.
          </p>
        </div>

        {/* View Mode Selector */}
        <div className={`rounded-xl border p-4 mb-4 ${tc.card}`}>
          <label className={`block text-xs uppercase tracking-wider mb-2.5 ${tc.textSec}`}>View Mode</label>
          <div className="flex flex-wrap gap-2">
            {VIEW_MODE_CONFIG.map(vm => {
              const isActive = viewMode === vm.id;
              return (
                <button key={vm.id} onClick={() => setViewMode(vm.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                    isActive
                      ? (isDarkMode ? 'border-blue-500 bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30' : 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500/30')
                      : (isDarkMode ? 'border-gray-600 text-gray-400 hover:border-gray-500' : 'border-gray-200 text-gray-600 hover:border-gray-300')
                  }`}
                  title={vm.description}
                >
                  <span className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${
                    isActive ? (isDarkMode ? 'bg-blue-500/30 text-blue-300' : 'bg-blue-100 text-blue-700') : (isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400')
                  }`}>{vm.icon}</span>
                  {vm.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className={`rounded-xl border p-4 mb-4 flex flex-wrap gap-4 items-end ${tc.card}`}>
          <div className="flex-1 min-w-[200px]">
            <label className={`block text-xs uppercase tracking-wider mb-1 ${tc.textSec}`}>Metric</label>
            <select value={selectedMetric}
              onChange={e => { setSelectedMetric(e.target.value); setSelectedYear(null); setDetailCountry(null); }}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}>
              {METRIC_CATEGORIES.map(cat => (
                <optgroup key={cat.id} label={cat.label}>
                  {cat.metrics.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          {viewMode === 'comparison' && (
            <div className="flex-1 min-w-[200px]">
              <label className={`block text-xs uppercase tracking-wider mb-1 ${tc.textSec}`}>Compare With</label>
              <select value={compareMetric}
                onChange={e => setCompareMetric(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}>
                {METRIC_CATEGORIES.map(cat => (
                  <optgroup key={cat.id} label={cat.label}>
                    {cat.metrics.filter(m => m.key !== selectedMetric).map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
          )}
          <div className="min-w-[120px]">
            <label className={`block text-xs uppercase tracking-wider mb-1 ${tc.textSec}`}>Year</label>
            <select value={selectedYear ?? ''} onChange={e => setSelectedYear(Number(e.target.value))}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {viewMode !== 'ranked' && viewMode !== 'table' && (
            <div className="flex gap-2">
              <button onClick={() => setPosition(p => ({ ...p, zoom: Math.min(p.zoom * 1.5, 6) }))} className={`px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}>+</button>
              <button onClick={() => setPosition(p => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }))} className={`px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}>-</button>
              <button onClick={() => setPosition({ coordinates: [0, 20], zoom: 1 })} className={`px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}>Reset</button>
            </div>
          )}
        </div>

        {/* Color Palette Picker (hide for ranked view) */}
        {viewMode !== 'ranked' && viewMode !== 'table' && (
          <div className={`rounded-xl border p-4 mb-6 ${tc.card}`}>
            {viewMode === 'comparison' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Primary metric palette */}
                <div>
                  <label className={`block text-xs uppercase tracking-wider mb-2.5 ${tc.textSec}`}>
                    Palette — {metricDef?.label || 'Primary'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {HEATMAP_STYLES.map(style => {
                      const isActive = heatmapStyle === style.id;
                      return (
                        <button key={style.id} onClick={() => setHeatmapStyle(style.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                            isActive
                              ? (isDarkMode ? 'border-blue-500 bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30' : 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500/30')
                              : (isDarkMode ? 'border-gray-600 text-gray-400 hover:border-gray-500' : 'border-gray-200 text-gray-600 hover:border-gray-300')
                          }`}>
                          <div className="flex h-4 w-10 rounded overflow-hidden">
                            {style.preview.map((color, i) => <div key={i} className="flex-1" style={{ backgroundColor: color }} />)}
                          </div>
                          {style.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Compare metric palette */}
                <div>
                  <label className={`block text-xs uppercase tracking-wider mb-2.5 ${tc.textSec}`}>
                    Palette — {compareMetricDef?.label || 'Compare'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {HEATMAP_STYLES.map(style => {
                      const isActive = compareStyle === style.id;
                      return (
                        <button key={style.id} onClick={() => setCompareStyle(style.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                            isActive
                              ? (isDarkMode ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30' : 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30')
                              : (isDarkMode ? 'border-gray-600 text-gray-400 hover:border-gray-500' : 'border-gray-200 text-gray-600 hover:border-gray-300')
                          }`}>
                          <div className="flex h-4 w-10 rounded overflow-hidden">
                            {style.preview.map((color, i) => <div key={i} className="flex-1" style={{ backgroundColor: color }} />)}
                          </div>
                          {style.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <label className={`block text-xs uppercase tracking-wider mb-2.5 ${tc.textSec}`}>Color Palette</label>
                <div className="flex flex-wrap gap-2">
                  {HEATMAP_STYLES.map(style => {
                    const isActive = heatmapStyle === style.id;
                    return (
                      <button key={style.id} onClick={() => setHeatmapStyle(style.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                          isActive
                            ? (isDarkMode ? 'border-blue-500 bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30' : 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500/30')
                            : (isDarkMode ? 'border-gray-600 text-gray-400 hover:border-gray-500' : 'border-gray-200 text-gray-600 hover:border-gray-300')
                        }`}>
                        <div className="flex h-4 w-10 rounded overflow-hidden">
                          {style.preview.map((color, i) => <div key={i} className="flex-1" style={{ backgroundColor: color }} />)}
                        </div>
                        {style.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* CHOROPLETH VIEW */}
        {/* ============================================================ */}
        {viewMode === 'choropleth' && (
          <>
            <div className="flex gap-6">
              <div className={`rounded-xl border overflow-hidden relative flex-1 ${tc.card}`} style={{ backgroundColor: tc.ocean }}>
                {hoveredCountry && (
                  <div className={`absolute z-10 px-3 py-2 rounded-lg border shadow-lg text-sm pointer-events-none ${tc.card}`} style={{ left: hoveredCountry.x + 10, top: hoveredCountry.y - 40 }}>
                    <p className="font-semibold">{hoveredCountry.name}</p>
                    <p className={tc.textSec}>{metricDef?.label}: {formatMetricValue(selectedMetric, hoveredCountry.value)}</p>
                  </div>
                )}
                {renderMap(countryValues, min, max, heatmapStyle)}
              </div>
              {detailCountry && countryDetail && (
                <div ref={panelRef} className={`w-96 flex-shrink-0 rounded-xl border overflow-hidden ${tc.card} hidden lg:block`} style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                  <CountryDetailPanel detail={countryDetail} metricDef={metricDef!} selectedMetric={selectedMetric} selectedYear={selectedYear!} isDarkMode={isDarkMode} onClose={() => setDetailCountry(null)} onMetricSwitch={(key) => { setSelectedMetric(key); setSelectedYear(null); }} />
                </div>
              )}
            </div>
            {detailCountry && countryDetail && (
              <div className={`mt-4 rounded-xl border overflow-hidden lg:hidden ${tc.card}`}>
                <CountryDetailPanel detail={countryDetail} metricDef={metricDef!} selectedMetric={selectedMetric} selectedYear={selectedYear!} isDarkMode={isDarkMode} onClose={() => setDetailCountry(null)} onMetricSwitch={(key) => { setSelectedMetric(key); setSelectedYear(null); }} />
              </div>
            )}
          </>
        )}

        {/* ============================================================ */}
        {/* BUBBLE MAP VIEW */}
        {/* ============================================================ */}
        {viewMode === 'bubble' && (
          <>
            <div className="flex gap-6">
              <div className={`rounded-xl border overflow-hidden relative flex-1 ${tc.card}`} style={{ backgroundColor: tc.ocean }}>
                {hoveredCountry && (
                  <div className={`absolute z-10 px-3 py-2 rounded-lg border shadow-lg text-sm pointer-events-none ${tc.card}`} style={{ left: hoveredCountry.x + 10, top: hoveredCountry.y - 40 }}>
                    <p className="font-semibold">{hoveredCountry.name}</p>
                    <p className={tc.textSec}>{metricDef?.label}: {formatMetricValue(selectedMetric, hoveredCountry.value)}</p>
                  </div>
                )}
                {renderMap(countryValues, min, max, heatmapStyle, {
                  showBubbles: true,
                  bubbleKeyValues: countryKeyValues,
                  bubbleMin: min,
                  bubbleMax: max,
                })}
              </div>
              {detailCountry && countryDetail && (
                <div ref={panelRef} className={`w-96 flex-shrink-0 rounded-xl border overflow-hidden ${tc.card} hidden lg:block`} style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                  <CountryDetailPanel detail={countryDetail} metricDef={metricDef!} selectedMetric={selectedMetric} selectedYear={selectedYear!} isDarkMode={isDarkMode} onClose={() => setDetailCountry(null)} onMetricSwitch={(key) => { setSelectedMetric(key); setSelectedYear(null); }} />
                </div>
              )}
            </div>
            {detailCountry && countryDetail && (
              <div className={`mt-4 rounded-xl border overflow-hidden lg:hidden ${tc.card}`}>
                <CountryDetailPanel detail={countryDetail} metricDef={metricDef!} selectedMetric={selectedMetric} selectedYear={selectedYear!} isDarkMode={isDarkMode} onClose={() => setDetailCountry(null)} onMetricSwitch={(key) => { setSelectedMetric(key); setSelectedYear(null); }} />
              </div>
            )}
            {/* Bubble size legend */}
            <div className={`rounded-xl border p-3 mt-4 ${tc.card}`}>
              <div className="flex items-center gap-4">
                <span className={`text-xs ${tc.textSec}`}>Bubble size = magnitude</span>
                <div className="flex items-center gap-3">
                  {[0.2, 0.5, 1].map(s => (
                    <div key={s} className="flex items-center gap-1">
                      <svg width={Math.max(8, s * 20)} height={Math.max(8, s * 20)}><circle cx={Math.max(4, s * 10)} cy={Math.max(4, s * 10)} r={Math.max(3, s * 9)} fill={isDarkMode ? '#60a5fa' : '#3b82f6'} opacity={0.6} /></svg>
                      <span className={`text-[10px] ${tc.textSec}`}>{s === 0.2 ? 'Low' : s === 0.5 ? 'Mid' : 'High'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ============================================================ */}
        {/* RANKED BAR CHART VIEW */}
        {/* ============================================================ */}
        {viewMode === 'ranked' && (
          <div className="flex gap-6">
            <div className={`rounded-xl border overflow-hidden flex-1 p-4 ${tc.card}`}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{metricDef?.label} — Country Rankings ({selectedYear})</h3>
                <span className={`text-xs ${tc.textSec}`}>{rankedData.length} countries</span>
              </div>
              <div style={{ height: Math.max(400, rankedData.length * 32) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rankedData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <XAxis type="number" tick={{ fontSize: 11, fill: isDarkMode ? '#9ca3af' : '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: isDarkMode ? '#d1d5db' : '#374151' }} axisLine={false} tickLine={false} width={95} />
                    <Tooltip
                      contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, borderRadius: '8px', fontSize: '12px', color: isDarkMode ? '#fff' : '#111827' }}
                      formatter={(val: number) => [formatMetricValue(selectedMetric, val), metricDef?.label]}
                      cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} onClick={(entry: any) => { if (entry?.country) setDetailCountry(prev => prev === entry.country ? null : entry.country); }}>
                      {rankedData.map((entry, i) => (
                        <Cell key={i} fill={entry.country === detailCountry ? '#f59e0b' : getHeatmapColor(heatmapStyle, entry.value, min, max, isDarkMode)} cursor="pointer" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {detailCountry && countryDetail && (
              <div ref={panelRef} className={`w-96 flex-shrink-0 rounded-xl border overflow-hidden ${tc.card} hidden lg:block`} style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                <CountryDetailPanel detail={countryDetail} metricDef={metricDef!} selectedMetric={selectedMetric} selectedYear={selectedYear!} isDarkMode={isDarkMode} onClose={() => setDetailCountry(null)} onMetricSwitch={(key) => { setSelectedMetric(key); setSelectedYear(null); }} />
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* COMPARISON SPLIT VIEW */}
        {/* ============================================================ */}
        {viewMode === 'comparison' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left: primary metric */}
              <div className={`rounded-xl border overflow-hidden relative ${tc.card}`} style={{ backgroundColor: tc.ocean }}>
                <div className={`absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg text-xs font-semibold ${isDarkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90 text-gray-900'} shadow`}>
                  {metricDef?.label}
                </div>
                {hoveredCountry && (
                  <div className={`absolute z-10 px-3 py-2 rounded-lg border shadow-lg text-sm pointer-events-none ${tc.card}`} style={{ left: hoveredCountry.x + 10, top: hoveredCountry.y - 40 }}>
                    <p className="font-semibold">{hoveredCountry.name}</p>
                    <p className={tc.textSec}>{metricDef?.label}: {formatMetricValue(selectedMetric, hoveredCountry.value)}</p>
                  </div>
                )}
                {renderMap(countryValues, min, max, heatmapStyle, { compact: true })}
                <div className="px-3 pb-2">
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: getGradientCSS(heatmapStyle, isDarkMode) }} />
                  <div className="flex justify-between mt-1">
                    <span className={`text-[10px] ${tc.textSec}`}>{formatMetricValue(selectedMetric, min)}</span>
                    <span className={`text-[10px] ${tc.textSec}`}>{formatMetricValue(selectedMetric, max)}</span>
                  </div>
                </div>
              </div>
              {/* Right: comparison metric */}
              <div className={`rounded-xl border overflow-hidden relative ${tc.card}`} style={{ backgroundColor: tc.ocean }}>
                <div className={`absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg text-xs font-semibold ${isDarkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90 text-gray-900'} shadow`}>
                  {compareMetricDef?.label}
                </div>
                {renderMap(compareValues.vals, compareValues.min, compareValues.max, compareStyle, { compact: true })}
                <div className="px-3 pb-2">
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: getGradientCSS(compareStyle, isDarkMode) }} />
                  <div className="flex justify-between mt-1">
                    <span className={`text-[10px] ${tc.textSec}`}>{formatMetricValue(compareMetric, compareValues.min)}</span>
                    <span className={`text-[10px] ${tc.textSec}`}>{formatMetricValue(compareMetric, compareValues.max)}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Detail panel below for comparison */}
            {detailCountry && countryDetail && (
              <div className={`mt-4 rounded-xl border overflow-hidden ${tc.card}`}>
                <CountryDetailPanel detail={countryDetail} metricDef={metricDef!} selectedMetric={selectedMetric} selectedYear={selectedYear!} isDarkMode={isDarkMode} onClose={() => setDetailCountry(null)} onMetricSwitch={(key) => { setSelectedMetric(key); setSelectedYear(null); }} />
              </div>
            )}
          </>
        )}

        {/* ============================================================ */}
        {/* TABLE RANKING VIEW */}
        {/* ============================================================ */}
        {viewMode === 'table' && (
          <div className={`rounded-xl border overflow-hidden ${tc.card}`}>
            <div className={`px-5 py-4 border-b flex items-center justify-between ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <div>
                <h3 className="font-semibold">{metricDef?.label} — Country Rankings ({selectedYear})</h3>
                <p className={`text-xs mt-0.5 ${tc.textSec}`}>{tableData.length} countries &middot; Click headers to sort &middot; Click a row for details</p>
              </div>
              <div className={`text-xs px-2.5 py-1 rounded-full font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                {tableColumns.length + 1} columns
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={isDarkMode ? 'bg-gray-800/60' : 'bg-gray-50'}>
                    <th className={`text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider ${tc.textSec}`} style={{ width: 50 }}>#</th>
                    <th className={`text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider ${tc.textSec}`} style={{ minWidth: 160 }}>Country</th>
                    {/* Primary metric column */}
                    <th
                      className={`text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider cursor-pointer select-none transition-colors ${tableSortCol === 'primary' ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : tc.textSec}`}
                      onClick={() => toggleSort('primary')}
                      style={{ minWidth: 120 }}
                    >
                      <span className="flex items-center justify-end gap-1">
                        {metricDef?.label}
                        {tableSortCol === 'primary' && <span>{tableSortDir === 'desc' ? '\u25BC' : '\u25B2'}</span>}
                      </span>
                    </th>
                    {/* YoY change */}
                    <th
                      className={`text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider cursor-pointer select-none transition-colors ${tableSortCol === 'yoy' ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : tc.textSec}`}
                      onClick={() => toggleSort('yoy')}
                      style={{ minWidth: 90 }}
                    >
                      <span className="flex items-center justify-end gap-1">
                        YoY
                        {tableSortCol === 'yoy' && <span>{tableSortDir === 'desc' ? '\u25BC' : '\u25B2'}</span>}
                      </span>
                    </th>
                    {/* Related metric columns */}
                    {tableColumns.slice(1).map(col => (
                      <th
                        key={col.key}
                        className={`text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider cursor-pointer select-none transition-colors ${tableSortCol === col.key ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : tc.textSec}`}
                        onClick={() => toggleSort(col.key)}
                        style={{ minWidth: 110 }}
                      >
                        <span className="flex items-center justify-end gap-1">
                          {col.label}
                          {tableSortCol === col.key && <span>{tableSortDir === 'desc' ? '\u25BC' : '\u25B2'}</span>}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, idx) => {
                    const isSelected = detailCountry === row.country;
                    return (
                      <tr
                        key={row.country}
                        onClick={() => setDetailCountry(prev => prev === row.country as CountryKey ? null : row.country as CountryKey)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? (isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50')
                            : (isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50')
                        } ${isDarkMode ? 'border-gray-700/50' : 'border-gray-100'} border-b`}
                      >
                        <td className={`px-4 py-3 font-mono text-xs ${tc.textSec}`}>{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{row.flag}</span>
                            <div>
                              <span className="font-medium">{row.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold">{metricDef?.format(row.values.primary!)}</span>
                          {/* Inline mini bar */}
                          <div className={`mt-1 h-1 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${max === min ? 50 : Math.max(2, ((row.values.primary! - min) / (max - min)) * 100)}%`,
                                backgroundColor: getHeatmapColor(heatmapStyle, row.values.primary!, min, max, isDarkMode),
                              }}
                            />
                          </div>
                        </td>
                        <td className={`px-4 py-3 text-right text-xs font-medium ${
                          row.yoy === null ? (isDarkMode ? 'text-gray-600' : 'text-gray-300')
                          : row.yoy > 0 ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')
                          : row.yoy < 0 ? (isDarkMode ? 'text-red-400' : 'text-red-600')
                          : tc.textSec
                        }`}>
                          {row.yoy !== null ? ((row.yoy > 0 ? '+' : '') + metricDef!.format(row.yoy)) : '\u2014'}
                        </td>
                        {tableColumns.slice(1).map(col => (
                          <td key={col.key} className={`px-4 py-3 text-right ${row.values[col.key] !== null ? '' : (isDarkMode ? 'text-gray-600' : 'text-gray-300')}`}>
                            {row.values[col.key] !== null ? col.format(row.values[col.key]!) : '\u2014'}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {tableData.length === 0 && (
              <div className={`py-12 text-center ${tc.textSec}`}>No data available for this metric and year.</div>
            )}
          </div>
        )}

        {/* Detail panel for table view */}
        {viewMode === 'table' && detailCountry && countryDetail && (
          <div className={`mt-4 rounded-xl border overflow-hidden ${tc.card}`}>
            <CountryDetailPanel detail={countryDetail} metricDef={metricDef!} selectedMetric={selectedMetric} selectedYear={selectedYear!} isDarkMode={isDarkMode} onClose={() => setDetailCountry(null)} onMetricSwitch={(key) => { setSelectedMetric(key); setSelectedYear(null); }} />
          </div>
        )}

        {/* Color Legend (choropleth + bubble) */}
        {(viewMode === 'choropleth' || viewMode === 'bubble') && (
          <div className={`rounded-xl border p-4 mt-4 ${tc.card}`}>
            <div className="flex items-center gap-4">
              <span className={`text-sm whitespace-nowrap ${tc.textSec}`}>{metricDef?.label || selectedMetric}</span>
              <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: getGradientCSS(heatmapStyle, isDarkMode) }} />
              <span className={`text-xs whitespace-nowrap ${tc.textSec}`}>{formatMetricValue(selectedMetric, min)}</span>
              <span className={`text-xs whitespace-nowrap ${tc.textSec}`}>{formatMetricValue(selectedMetric, max)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Country Detail Panel Component
// ============================================================

interface CountryDetailPanelProps {
  detail: CountryDetailData;
  metricDef: { key: string; label: string; unit: string; format: (v: number) => string };
  selectedMetric: string;
  selectedYear: number;
  isDarkMode: boolean;
  onClose: () => void;
  onMetricSwitch: (key: string) => void;
}

function CountryDetailPanel({ detail, metricDef, selectedMetric, selectedYear, isDarkMode, onClose, onMetricSwitch }: CountryDetailPanelProps) {
  const flag = COUNTRY_FLAG_EMOJI[detail.countryKey] || '';
  const category = getCategoryForMetric(selectedMetric);
  const summary = useMemo(() => {
    const pos = detail.percentile >= 75 ? 'among the highest' : detail.percentile >= 50 ? 'above average' : detail.percentile >= 25 ? 'below average' : 'among the lowest';
    const vsMedian = detail.value > detail.median ? 'above' : detail.value < detail.median ? 'below' : 'at';
    return `${detail.countryName}\u2019s ${metricDef.label.toLowerCase()} of ${metricDef.format(detail.value)} ranks ${ordinal(detail.rank)} of ${detail.total} tracked economies \u2014 ${pos} and ${vsMedian} the group median of ${metricDef.format(detail.median)}.`;
  }, [detail, metricDef]);
  const yoyLabel = detail.yearOverYearChange !== null ? (detail.yearOverYearChange > 0 ? '+' : '') + metricDef.format(detail.yearOverYearChange) : null;
  const chartColor = isDarkMode ? '#60a5fa' : '#3b82f6';
  const gridColor = isDarkMode ? '#374151' : '#e5e7eb';

  return (
    <div className="flex flex-col">
      <div className={`flex items-center justify-between px-5 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{flag}</span>
          <div>
            <h3 className="font-bold text-lg leading-tight">{detail.countryName}</h3>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{category?.label}</span>
          </div>
        </div>
        <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-end justify-between mb-1">
          <div>
            <p className={`text-xs uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{metricDef.label}</p>
            <p className="text-3xl font-bold tracking-tight">{metricDef.format(detail.value)}</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              detail.percentile >= 66 ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700')
              : detail.percentile >= 33 ? (isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700')
              : (isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700')
            }`}>{ordinal(detail.rank)} of {detail.total}</div>
          </div>
        </div>
        {yoyLabel && (
          <p className={`text-sm ${detail.yearOverYearChange! > 0 ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>{yoyLabel} vs {selectedYear - 1}</p>
        )}
      </div>
      <div className={`mx-5 mb-4 p-3 rounded-lg text-sm leading-relaxed ${isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>{summary}</div>
      {detail.history.length > 2 && (
        <div className="px-5 mb-4">
          <p className={`text-xs uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Historical Trend ({detail.history[0].year}&ndash;{detail.history[detail.history.length - 1].year})</p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={detail.history} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs><linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartColor} stopOpacity={0.3} /><stop offset="95%" stopColor={chartColor} stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: isDarkMode ? '#9ca3af' : '#6b7280' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${gridColor}`, borderRadius: '8px', fontSize: '12px', color: isDarkMode ? '#fff' : '#111827' }} formatter={(val: number) => [metricDef.format(val), metricDef.label]} labelFormatter={(label) => `Year: ${label}`} />
                {selectedYear && <ReferenceLine x={selectedYear} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" />}
                <Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} fill="url(#sparkGradient)" dot={false} activeDot={{ r: 4, fill: chartColor }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div className="mx-5 mb-4 grid grid-cols-3 gap-2">
        {(['min', 'median', 'max'] as const).map((type) => {
          const val = type === 'min' ? (detail.history.length > 0 ? Math.min(...detail.history.map(h => h.value)) : detail.value)
            : type === 'max' ? (detail.history.length > 0 ? Math.max(...detail.history.map(h => h.value)) : detail.value)
            : detail.median;
          const label = type === 'min' ? 'Country Min' : type === 'max' ? 'Country Max' : 'Group Median';
          return (
            <div key={type} className={`text-center p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <p className={`text-[10px] uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
              <p className="text-sm font-semibold mt-0.5">{metricDef.format(val)}</p>
            </div>
          );
        })}
      </div>
      {detail.relatedMetrics.length > 0 && (
        <div className="px-5 mb-4">
          <p className={`text-xs uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Related Indicators ({selectedYear})</p>
          <div className="space-y-1.5">
            {detail.relatedMetrics.map(rm => (
              <button key={rm.key} onClick={() => onMetricSwitch(rm.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${isDarkMode ? 'hover:bg-gray-700 bg-gray-800' : 'hover:bg-gray-100 bg-gray-50'}`}>
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{rm.label}</span>
                <span className={`font-semibold ${rm.value !== null ? '' : (isDarkMode ? 'text-gray-600' : 'text-gray-300')}`}>{rm.value !== null ? rm.format(rm.value) : 'N/A'}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className={`px-5 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <a href={`/country/${COUNTRY_KEY_TO_SLUG[detail.countryKey]}`}
          className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
          View Full {detail.countryName} Profile
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </a>
      </div>
    </div>
  );
}
