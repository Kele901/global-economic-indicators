'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect, useState, useMemo } from 'react';
import { fetchGlobalData, CountryData } from '../services/worldbank';
import { IMF_GDP_PROJECTIONS, IMF_INFLATION_PROJECTIONS, REGIONAL_GDP_PROJECTIONS, GLOBAL_OUTLOOK_SUMMARY, RISKS } from '../data/imfProjections';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_COLORS, type CountryKey } from '../utils/countryMappings';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, ScatterChart, Scatter, Cell, ZAxis, ReferenceLine, LabelList } from 'recharts';

export default function OutlookPage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [data, setData] = useState<Record<string, CountryData[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('USA');
  const [selectedMetric, setSelectedMetric] = useState<'gdp' | 'inflation'>('gdp');
  const [compCountries, setCompCountries] = useState(['USA', 'China', 'India', 'Japan', 'Brazil', 'UK']);
  const [sortConfig, setSortConfig] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'country', dir: 'asc' });

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

  const tc = isDarkMode ? {
    bg: 'bg-gray-900', card: 'bg-gray-800 border-gray-700', text: 'text-white',
    textSec: 'text-gray-400', grid: '#374151', axis: '#9ca3af',
    tooltip: { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px' } as React.CSSProperties,
    selectBg: 'bg-gray-700 text-white border-gray-600',
  } : {
    bg: 'bg-gray-50', card: 'bg-white border-gray-200', text: 'text-gray-900',
    textSec: 'text-gray-500', grid: '#e5e7eb', axis: '#6b7280',
    tooltip: { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } as React.CSSProperties,
    selectBg: 'bg-white text-gray-900 border-gray-300',
  };

  const forecastChartData = useMemo(() => {
    if (!data) return [];
    const projections = selectedMetric === 'gdp' ? IMF_GDP_PROJECTIONS : IMF_INFLATION_PROJECTIONS;
    const projection = projections.find(p => p.country === selectedCountry);
    const metricKey = selectedMetric === 'gdp' ? 'gdpGrowth' : 'inflationRates';
    const series = (data as any)[metricKey] as CountryData[] | undefined;

    const points: { year: number; actual?: number; forecast?: number }[] = [];

    if (series) {
      for (const row of series) {
        const yr = Number(row.year);
        const v = Number(row[selectedCountry]);
        if (yr >= 2015 && !isNaN(v)) {
          points.push({ year: yr, actual: v });
        }
      }
    }

    if (projection) {
      for (const [yr, val] of Object.entries(projection.values)) {
        const existing = points.find(p => p.year === Number(yr));
        if (existing) {
          existing.forecast = val;
        } else {
          points.push({ year: Number(yr), forecast: val });
        }
      }
    }

    return points.sort((a, b) => a.year - b.year);
  }, [data, selectedCountry, selectedMetric]);

  const availableCountries = useMemo(() => {
    const projections = selectedMetric === 'gdp' ? IMF_GDP_PROJECTIONS : IMF_INFLATION_PROJECTIONS;
    return projections.map(p => p.country);
  }, [selectedMetric]);

  const allProjectionCountries = IMF_GDP_PROJECTIONS.filter(p => p.country !== 'World').map(p => p.country);

  const multiCountryChartData = useMemo(() => {
    const years = [2024, 2025, 2026, 2027, 2028, 2029];
    return years.map(year => {
      const point: Record<string, number> = { year };
      compCountries.forEach(c => {
        const proj = IMF_GDP_PROJECTIONS.find(p => p.country === c);
        if (proj?.values[year] !== undefined) {
          point[c] = proj.values[year];
        }
      });
      return point;
    });
  }, [compCountries]);

  const GDP_THRESHOLD = 2.5;
  const INF_THRESHOLD = 3.0;

  const getQuadrantColor = (gdp: number, inflation: number) => {
    if (gdp < GDP_THRESHOLD && inflation >= INF_THRESHOLD) return '#ef4444';
    if (gdp >= GDP_THRESHOLD && inflation >= INF_THRESHOLD) return '#f59e0b';
    if (gdp < GDP_THRESHOLD && inflation < INF_THRESHOLD) return '#6b7280';
    return '#22c55e';
  };

  const scatterData = useMemo(() => {
    return IMF_GDP_PROJECTIONS
      .filter(p => p.country !== 'World')
      .map(gdpProj => {
        const infProj = IMF_INFLATION_PROJECTIONS.find(ip => ip.country === gdpProj.country);
        if (!infProj) return null;
        return {
          country: gdpProj.country,
          label: COUNTRY_DISPLAY_NAMES[gdpProj.country as CountryKey] || gdpProj.country,
          gdp: gdpProj.values[2025] ?? 0,
          inflation: infProj.values[2025] ?? 0,
        };
      })
      .filter(Boolean) as { country: string; label: string; gdp: number; inflation: number }[];
  }, []);

  const revisionData = useMemo(() => {
    return IMF_GDP_PROJECTIONS
      .filter(p => p.country !== 'World')
      .map(p => ({
        country: p.country,
        displayName: COUNTRY_DISPLAY_NAMES[p.country as CountryKey] || p.country,
        revision: +(p.values[2025] - p.values[2024]).toFixed(2),
      }));
  }, []);

  const advancedVsEmergingData = useMemo(() => {
    const advanced = ['USA', 'UK', 'Japan', 'Germany', 'France', 'Canada', 'Australia', 'SouthKorea'];
    const emerging = ['China', 'India', 'Brazil', 'Mexico', 'Indonesia', 'Russia', 'Turkey'];
    const years = [2024, 2025, 2026];
    return years.map(year => {
      const advValues = advanced
        .map(c => IMF_GDP_PROJECTIONS.find(p => p.country === c)?.values[year])
        .filter((v): v is number => v !== undefined);
      const emValues = emerging
        .map(c => IMF_GDP_PROJECTIONS.find(p => p.country === c)?.values[year])
        .filter((v): v is number => v !== undefined);
      return {
        year: String(year),
        Advanced: +(advValues.reduce((s, v) => s + v, 0) / advValues.length).toFixed(2),
        Emerging: +(emValues.reduce((s, v) => s + v, 0) / emValues.length).toFixed(2),
      };
    });
  }, []);

  const summaryTableData = useMemo(() => {
    return IMF_GDP_PROJECTIONS
      .filter(p => p.country !== 'World')
      .map(gdpProj => {
        const infProj = IMF_INFLATION_PROJECTIONS.find(ip => ip.country === gdpProj.country);
        return {
          country: gdpProj.country,
          displayName: COUNTRY_DISPLAY_NAMES[gdpProj.country as CountryKey] || gdpProj.country,
          gdp2024: gdpProj.values[2024],
          gdp2025: gdpProj.values[2025],
          gdp2026: gdpProj.values[2026],
          inf2024: infProj?.values[2024] ?? null,
          inf2025: infProj?.values[2025] ?? null,
        };
      });
  }, []);

  const sortedTableData = useMemo(() => {
    const sorted = [...summaryTableData];
    sorted.sort((a, b) => {
      const aVal = (a as any)[sortConfig.key];
      const bVal = (b as any)[sortConfig.key];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'string') return sortConfig.dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortConfig.dir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [summaryTableData, sortConfig]);

  const toggleSort = (key: string) => {
    setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${tc.bg}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className={tc.textSec}>Loading outlook data...</p>
        </div>
      </div>
    );
  }

  const { worldGDP, globalInflation, tradeGrowth, oilPrice } = GLOBAL_OUTLOOK_SUMMARY;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${tc.bg} ${tc.text}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">Economic Forecasts & Outlook</h1>
            <p className={`${tc.textSec}`}>IMF World Economic Outlook projections alongside historical data</p>
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

        <div className={`rounded-xl border p-4 sm:p-6 mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
          <h2 className="text-lg sm:text-xl font-semibold mb-3">Reading Economic Forecasts</h2>
          <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            The IMF publishes its <strong>World Economic Outlook (WEO)</strong> twice a year, projecting GDP growth,
            inflation, and other indicators for nearly every country. These projections are produced by combining
            econometric models with expert judgment and country-level consultations. The solid line on our charts
            represents actual historical data, while the dashed line shows IMF forecast values.
          </p>
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3`}>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Historical vs Forecast</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Solid lines are actual recorded data. Dashed lines are projections that carry uncertainty and may be revised.</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Regional Projections</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>The bar chart groups countries by region, showing how growth prospects differ between advanced and emerging economies.</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Risks & Uncertainties</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Forecasts face both upside and downside risks. Trade tensions, policy shifts, or technology gains can push outcomes either way.</p>
            </div>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Use the country and metric selectors to compare historical performance against IMF projections.
            <a href="/guides/economic-forecasting" className="text-blue-500 hover:underline ml-1">Learn more in our guide &rarr;</a>
          </p>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'World GDP Growth', ...worldGDP },
            { label: 'Global Inflation', ...globalInflation },
            { label: 'Trade Volume Growth', ...tradeGrowth },
            { label: 'Oil Price', ...oilPrice },
          ].map(card => (
            <div key={card.label} className={`rounded-xl border p-4 ${tc.card}`}>
              <p className={`text-xs uppercase tracking-wider ${tc.textSec}`}>{card.label}</p>
              <p className="text-2xl font-bold mt-1">{card.value}{card.unit === '%' ? '%' : ` ${card.unit}`}</p>
              <p className={`text-sm mt-1 ${card.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {card.change >= 0 ? '▲' : '▼'} {Math.abs(card.change)} vs prev forecast
              </p>
            </div>
          ))}
        </div>

        {/* Country Forecast Chart */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <h2 className="text-xl font-semibold">Country Forecasts</h2>
            <div className="flex gap-2 ml-auto">
              <button onClick={() => setSelectedMetric('gdp')}
                className={`px-3 py-1 rounded text-xs border ${selectedMetric === 'gdp' ? 'bg-blue-500/20 border-blue-500 text-blue-500' : isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                GDP Growth
              </button>
              <button onClick={() => setSelectedMetric('inflation')}
                className={`px-3 py-1 rounded text-xs border ${selectedMetric === 'inflation' ? 'bg-blue-500/20 border-blue-500 text-blue-500' : isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                Inflation
              </button>
              <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}
                className={`px-3 py-1 rounded border text-xs ${tc.selectBg}`}>
                {availableCountries.map(c => (
                  <option key={c} value={c}>{COUNTRY_DISPLAY_NAMES[c as CountryKey] || c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={tc.tooltip} />
                <Legend />
                <Line type="monotone" dataKey="actual" name="Historical" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="forecast" name="IMF Forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="8 4" dot={{ r: 3 }} connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Regional Comparison */}
          <div className={`rounded-xl border p-6 ${tc.card}`}>
            <h2 className="text-xl font-semibold mb-4">Regional GDP Projections</h2>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REGIONAL_GDP_PROJECTIONS} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                  <XAxis dataKey="region" stroke={tc.axis} tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={tc.tooltip} />
                  <Legend />
                  <Bar dataKey="y2024" name="2024" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="y2025" name="2025" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="y2026" name="2026" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risks & Uncertainties */}
          <div className={`rounded-xl border p-6 ${tc.card}`}>
            <h2 className="text-xl font-semibold mb-4">Risks & Uncertainties</h2>
            <div className="space-y-3">
              {RISKS.map((risk, i) => (
                <div key={i} className={`rounded-lg border p-3 ${
                  risk.type === 'downside'
                    ? (isDarkMode ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200')
                    : (isDarkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200')
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      risk.type === 'downside' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                    }`}>{risk.type}</span>
                    <span className="font-medium text-sm">{risk.title}</span>
                  </div>
                  <p className={`text-sm ${tc.textSec}`}>{risk.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Multi-Country Projection Comparison */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-4">Multi-Country Projection Comparison</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {allProjectionCountries.map(c => (
              <button
                key={c}
                onClick={() => setCompCountries(prev =>
                  prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
                )}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  compCountries.includes(c)
                    ? 'border-blue-500 bg-blue-500/20 text-blue-500'
                    : isDarkMode ? 'border-gray-600 text-gray-400 hover:border-gray-500' : 'border-gray-300 text-gray-500 hover:border-gray-400'
                }`}
              >
                {COUNTRY_DISPLAY_NAMES[c as CountryKey] || c}
              </button>
            ))}
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={multiCountryChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip contentStyle={tc.tooltip} />
                <Legend />
                {compCountries.map(c => (
                  <Line
                    key={c}
                    type="monotone"
                    dataKey={c}
                    name={COUNTRY_DISPLAY_NAMES[c as CountryKey] || c}
                    stroke={COUNTRY_COLORS[c as CountryKey] || '#888'}
                    strokeDasharray="5 3"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth vs Inflation Scatter */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-4">Growth vs Inflation (2025 Projections)</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis
                  type="number"
                  dataKey="gdp"
                  name="GDP Growth"
                  stroke={tc.axis}
                  tick={{ fontSize: 11 }}
                  label={{ value: 'GDP Growth 2025 (%)', position: 'insideBottom', offset: -15, style: { fill: tc.axis, fontSize: 12 } }}
                />
                <YAxis
                  type="number"
                  dataKey="inflation"
                  name="Inflation"
                  stroke={tc.axis}
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Inflation 2025 (%)', angle: -90, position: 'insideLeft', offset: 10, style: { fill: tc.axis, fontSize: 12 } }}
                />
                <ZAxis range={[100, 100]} />
                <Tooltip contentStyle={tc.tooltip} formatter={(value: any) => `${value}%`} />
                <ReferenceLine x={GDP_THRESHOLD} stroke={isDarkMode ? '#4b5563' : '#d1d5db'} strokeDasharray="3 3" />
                <ReferenceLine y={INF_THRESHOLD} stroke={isDarkMode ? '#4b5563' : '#d1d5db'} strokeDasharray="3 3" />
                <Scatter data={scatterData}>
                  {scatterData.map((entry, idx) => (
                    <Cell key={idx} fill={getQuadrantColor(entry.gdp, entry.inflation)} />
                  ))}
                  <LabelList dataKey="label" position="top" style={{ fontSize: 10, fill: isDarkMode ? '#d1d5db' : '#374151' }} />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            {[
              { label: 'Goldilocks', desc: 'High growth, low inflation', color: '#22c55e' },
              { label: 'Overheating', desc: 'High growth, high inflation', color: '#f59e0b' },
              { label: 'Stagflation Risk', desc: 'Low growth, high inflation', color: '#ef4444' },
              { label: 'Stagnation', desc: 'Low growth, low inflation', color: '#6b7280' },
            ].map(q => (
              <div key={q.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: q.color }} />
                <div>
                  <p className="text-xs font-medium">{q.label}</p>
                  <p className={`text-[10px] ${tc.textSec}`}>{q.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forecast Revision Indicators */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-2">Forecast Revision Indicators</h2>
          <p className={`text-sm mb-4 ${tc.textSec}`}>Projected GDP growth change from 2024 to 2025</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {revisionData.map(r => (
              <div
                key={r.country}
                className={`rounded-lg border p-3 text-center ${
                  r.revision >= 0
                    ? (isDarkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200')
                    : (isDarkMode ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200')
                }`}
              >
                <p className={`text-xs font-medium ${tc.textSec}`}>{r.displayName}</p>
                <p className={`text-xl font-bold mt-1 ${r.revision >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {r.revision >= 0 ? '▲' : '▼'} {Math.abs(r.revision)}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced vs Emerging Split */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-4">Advanced vs Emerging Economies</h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={advancedVsEmergingData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip contentStyle={tc.tooltip} />
                <Legend />
                <Bar dataKey="Advanced" name="Advanced Economies" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Emerging" name="Emerging Markets" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Outlook Summary Table */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-4">Global Outlook Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  {[
                    { key: 'displayName', label: 'Country' },
                    { key: 'gdp2024', label: '2024 GDP (%)' },
                    { key: 'gdp2025', label: '2025 GDP (%)' },
                    { key: 'gdp2026', label: '2026 GDP (%)' },
                    { key: 'inf2024', label: '2024 Inflation (%)' },
                    { key: 'inf2025', label: '2025 Inflation (%)' },
                  ].map(col => (
                    <th
                      key={col.key}
                      className={`px-3 py-2 text-left cursor-pointer select-none hover:text-blue-500 transition-colors ${tc.textSec}`}
                      onClick={() => toggleSort(col.key)}
                    >
                      {col.label}
                      {sortConfig.key === col.key && (
                        <span className="ml-1">{sortConfig.dir === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedTableData.map(row => (
                  <tr
                    key={row.country}
                    className={`border-b transition-colors ${
                      isDarkMode ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-3 py-2 font-medium">{row.displayName}</td>
                    <td className="px-3 py-2">{row.gdp2024}</td>
                    <td className="px-3 py-2">{row.gdp2025}</td>
                    <td className="px-3 py-2">{row.gdp2026}</td>
                    <td className="px-3 py-2">{row.inf2024 !== null ? row.inf2024 : '—'}</td>
                    <td className="px-3 py-2">{row.inf2025 !== null ? row.inf2025 : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
