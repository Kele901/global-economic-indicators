'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect, useState, useMemo } from 'react';
import { fetchGlobalData, CountryData } from '../services/worldbank';
import { IMF_GDP_PROJECTIONS, IMF_INFLATION_PROJECTIONS, REGIONAL_GDP_PROJECTIONS, GLOBAL_OUTLOOK_SUMMARY, RISKS } from '../data/imfProjections';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_COLORS, type CountryKey } from '../utils/countryMappings';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart } from 'recharts';

export default function OutlookPage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [data, setData] = useState<Record<string, CountryData[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('USA');
  const [selectedMetric, setSelectedMetric] = useState<'gdp' | 'inflation'>('gdp');

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
      </div>
    </div>
  );
}
