'use client';

import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, PieChart, Pie, ScatterChart, Scatter,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  PassportStrengthEntry,
  getPassportTier,
  culturalChartColors,
  softPowerRankings,
  passportHistoricalScores,
  gdpPerCapitaByCountry,
} from '../data/culturalMetrics';

interface PassportStrengthChartProps {
  isDarkMode: boolean;
  passportData: Record<string, PassportStrengthEntry>;
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

type SortField = 'rank' | 'visaFree' | 'change' | 'country';
type ViewId = 'table' | 'bar' | 'movers' | 'histogram' | 'scatter' | 'softpower' | 'radar' | 'trends' | 'regions' | 'tiers' | 'insights';

const DISPLAY_NAMES: Record<string, string> = {
  USA: 'United States', UK: 'United Kingdom', SouthKorea: 'South Korea',
  SouthAfrica: 'South Africa', SaudiArabia: 'Saudi Arabia', UAE: 'United Arab Emirates',
  NewZealand: 'New Zealand', CzechRepublic: 'Czech Republic', CostaRica: 'Costa Rica',
};

const REGIONS: { label: string; color: string; colorDark: string; chartColor: string; countries: string[] }[] = [
  { label: 'Europe', color: 'text-blue-600', colorDark: 'text-blue-400', chartColor: '#3B82F6', countries: ['France', 'Germany', 'Italy', 'Spain', 'UK', 'Sweden', 'Norway', 'Netherlands', 'Switzerland', 'Belgium', 'Poland', 'Portugal', 'Denmark', 'Finland', 'Ireland', 'Austria', 'Greece', 'Malta', 'Hungary', 'CzechRepublic', 'Croatia', 'Estonia', 'Latvia', 'Lithuania', 'Iceland', 'Romania', 'Bulgaria', 'Cyprus', 'Slovakia', 'Slovenia', 'Luxembourg', 'Serbia', 'Albania', 'Ukraine'] },
  { label: 'Asia-Pacific', color: 'text-amber-600', colorDark: 'text-amber-400', chartColor: '#F59E0B', countries: ['Singapore', 'Japan', 'SouthKorea', 'China', 'India', 'Indonesia', 'Australia', 'NewZealand', 'Malaysia', 'Thailand', 'Philippines', 'Vietnam', 'Cambodia', 'Kazakhstan', 'Bangladesh', 'Nepal', 'Pakistan', 'Afghanistan'] },
  { label: 'Americas', color: 'text-emerald-600', colorDark: 'text-emerald-400', chartColor: '#10B981', countries: ['USA', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Uruguay', 'CostaRica', 'Paraguay', 'Peru', 'Colombia', 'Ecuador', 'Venezuela'] },
  { label: 'MENA & Africa', color: 'text-purple-600', colorDark: 'text-purple-400', chartColor: '#8B5CF6', countries: ['Turkey', 'SaudiArabia', 'Egypt', 'Israel', 'Nigeria', 'SouthAfrica', 'Russia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Morocco', 'Kenya', 'Ghana', 'Tunisia', 'Ethiopia', 'Iran', 'Iraq'] },
];

const TREND_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1'];

const PassportStrengthChart: React.FC<PassportStrengthChartProps> = ({
  isDarkMode, passportData, selectedCountries, onCountryChange,
}) => {
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortAsc, setSortAsc] = useState(true);
  const [activeView, setActiveView] = useState<ViewId>('table');

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    textTertiary: isDarkMode ? 'text-gray-500' : 'text-gray-400',
    gridColor: isDarkMode ? '#374151' : '#E5E7EB',
    tickColor: isDarkMode ? '#9CA3AF' : '#6B7280',
    rowHover: isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50',
    headerBg: isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50',
    tooltipBg: isDarkMode ? '#1F2937' : '#FFFFFF',
    tooltipBorder: isDarkMode ? '#374151' : '#E5E7EB',
    tooltipText: isDarkMode ? '#F3F4F6' : '#111827',
  };

  const displayName = (country: string) => DISPLAY_NAMES[country] || country;

  const tooltipStyle = {
    backgroundColor: themeColors.tooltipBg,
    border: `1px solid ${themeColors.tooltipBorder}`,
    borderRadius: '8px',
    color: themeColors.tooltipText,
  };

  // --- DATA COMPUTATIONS ---

  const tableData = useMemo(() => {
    const data = Object.keys(passportData).map(country => {
      const d = passportData[country];
      return {
        country,
        rank: d.rank,
        visaFree: d.visaFreeDestinations,
        change: d.visaFreeDestinations - d.previousScore,
        tier: getPassportTier(d.visaFreeDestinations),
      };
    });
    data.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'rank': cmp = a.rank - b.rank; break;
        case 'visaFree': cmp = b.visaFree - a.visaFree; break;
        case 'change': cmp = b.change - a.change; break;
        case 'country': cmp = displayName(a.country).localeCompare(displayName(b.country)); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return data;
  }, [passportData, sortField, sortAsc]);

  const [barMode, setBarMode] = useState<'all' | 'selected' | 'byRegion' | 'delta'>('all');

  const barDataAll = useMemo(() => {
    return Object.entries(passportData)
      .map(([country, d]) => {
        const tier = getPassportTier(d.visaFreeDestinations);
        const region = REGIONS.find(r => r.countries.includes(country));
        return {
          country: displayName(country),
          key: country,
          visaFree: d.visaFreeDestinations,
          previous: d.previousScore,
          change: d.visaFreeDestinations - d.previousScore,
          tierColor: isDarkMode ? tier.colorDark : tier.color,
          regionColor: region?.chartColor || '#8B5CF6',
          region: region?.label || 'Other',
        };
      })
      .sort((a, b) => b.visaFree - a.visaFree);
  }, [passportData, isDarkMode]);

  const barDataSelected = useMemo(() => {
    return barDataAll.filter(d => selectedCountries.includes(d.key));
  }, [barDataAll, selectedCountries]);

  const barDataByRegion = useMemo(() => {
    return REGIONS.map(region => {
      const tracked = region.countries.filter(c => passportData[c]);
      const avg = tracked.length > 0
        ? Math.round(tracked.reduce((s, c) => s + passportData[c].visaFreeDestinations, 0) / tracked.length)
        : 0;
      const max = tracked.length > 0
        ? Math.max(...tracked.map(c => passportData[c].visaFreeDestinations))
        : 0;
      const min = tracked.length > 0
        ? Math.min(...tracked.map(c => passportData[c].visaFreeDestinations))
        : 0;
      return { region: region.label, avg, max, min, color: region.chartColor, count: tracked.length };
    });
  }, [passportData]);

  const barDataDelta = useMemo(() => {
    return [...barDataAll].sort((a, b) => b.change - a.change);
  }, [barDataAll]);

  const tierDistribution = useMemo(() => {
    const tiers: Record<string, { count: number; color: string }> = {
      'Excellent': { count: 0, color: '#059669' },
      'Very Strong': { count: 0, color: '#10B981' },
      'Strong': { count: 0, color: '#0891B2' },
      'Moderate': { count: 0, color: '#D97706' },
      'Weak': { count: 0, color: '#EA580C' },
      'Very Weak': { count: 0, color: '#DC2626' },
    };
    Object.values(passportData).forEach(d => {
      const t = getPassportTier(d.visaFreeDestinations);
      tiers[t.label].count++;
    });
    return Object.entries(tiers)
      .filter(([, v]) => v.count > 0)
      .map(([label, v]) => ({ name: label, value: v.count, fill: v.color }));
  }, [passportData]);

  const regionStats = useMemo(() => {
    return REGIONS.map(region => {
      const tracked = region.countries.filter(c => passportData[c]);
      const scores = tracked.map(c => passportData[c].visaFreeDestinations);
      const avg = tracked.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / tracked.length) : 0;
      const best = tracked.length > 0
        ? tracked.reduce((b, c) => passportData[c].visaFreeDestinations > passportData[b].visaFreeDestinations ? c : b, tracked[0])
        : null;
      const worst = tracked.length > 0
        ? tracked.reduce((w, c) => passportData[c].visaFreeDestinations < passportData[w].visaFreeDestinations ? c : w, tracked[0])
        : null;
      const stdDev = tracked.length > 1
        ? Math.round(Math.sqrt(scores.reduce((s, v) => s + (v - avg) ** 2, 0) / scores.length))
        : 0;
      const avgChange = tracked.length > 0
        ? Math.round(tracked.reduce((s, c) => s + (passportData[c].visaFreeDestinations - passportData[c].previousScore), 0) / tracked.length * 10) / 10
        : 0;
      return { ...region, avg, best, worst, tracked: tracked.length, stdDev, avgChange, maxScore: Math.max(...scores, 0), minScore: Math.min(...scores, 0) };
    });
  }, [passportData]);

  // Biggest movers
  const moversData = useMemo(() => {
    const all = Object.entries(passportData).map(([country, d]) => ({
      country,
      change: d.visaFreeDestinations - d.previousScore,
      score: d.visaFreeDestinations,
    }));
    const gainers = [...all].sort((a, b) => b.change - a.change).slice(0, 10);
    const losers = [...all].sort((a, b) => a.change - b.change).slice(0, 10);
    return { gainers, losers };
  }, [passportData]);

  // Histogram data (10-destination buckets)
  const histogramData = useMemo(() => {
    const buckets: { range: string; count: number; min: number }[] = [];
    for (let i = 20; i <= 190; i += 10) {
      buckets.push({ range: `${i}-${i + 9}`, count: 0, min: i });
    }
    Object.values(passportData).forEach(d => {
      const idx = Math.min(Math.floor((d.visaFreeDestinations - 20) / 10), buckets.length - 1);
      if (idx >= 0) buckets[idx].count++;
    });
    return buckets;
  }, [passportData]);

  // Mobility gap stats
  const mobilityGap = useMemo(() => {
    const scores = Object.values(passportData).map(d => d.visaFreeDestinations);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    const median = [...scores].sort((a, b) => a - b)[Math.floor(scores.length / 2)];
    return { max, min, gap: max - min, avg, median, total: scores.length };
  }, [passportData]);

  // GDP scatter data
  const scatterData = useMemo(() => {
    return Object.entries(passportData)
      .filter(([c]) => gdpPerCapitaByCountry[c])
      .map(([country, d]) => {
        const region = REGIONS.find(r => r.countries.includes(country));
        return {
          country: displayName(country),
          key: country,
          gdp: Math.round(gdpPerCapitaByCountry[country] / 1000),
          visaFree: d.visaFreeDestinations,
          fill: region?.chartColor || '#8B5CF6',
          region: region?.label || 'Other',
        };
      });
  }, [passportData]);

  // Soft power cross-reference
  const softPowerData = useMemo(() => {
    return Object.entries(passportData)
      .filter(([c]) => softPowerRankings[c])
      .map(([country, d]) => ({
        country: displayName(country),
        key: country,
        passportRank: d.rank,
        softPowerRank: softPowerRankings[country].rank,
        softPowerScore: softPowerRankings[country].score,
        visaFree: d.visaFreeDestinations,
        gap: Math.abs(d.rank - softPowerRankings[country].rank),
      }))
      .sort((a, b) => b.gap - a.gap);
  }, [passportData]);

  // Radar data for regions
  const radarData = useMemo(() => {
    const metrics = ['Avg Score', 'Best Passport', 'Consistency', 'YoY Change', 'Coverage'];
    const maxAvg = Math.max(...regionStats.map(r => r.avg));
    const maxMax = Math.max(...regionStats.map(r => r.maxScore));
    const maxTracked = Math.max(...regionStats.map(r => r.tracked));

    return metrics.map(metric => {
      const entry: Record<string, string | number> = { metric };
      regionStats.forEach(r => {
        let val = 0;
        switch (metric) {
          case 'Avg Score': val = (r.avg / maxAvg) * 100; break;
          case 'Best Passport': val = (r.maxScore / maxMax) * 100; break;
          case 'Consistency': val = r.stdDev > 0 ? Math.max(0, 100 - r.stdDev) : 100; break;
          case 'YoY Change': val = 50 + r.avgChange * 5; break;
          case 'Coverage': val = (r.tracked / maxTracked) * 100; break;
        }
        entry[r.label] = Math.round(Math.max(0, Math.min(100, val)));
      });
      return entry;
    });
  }, [regionStats]);

  // Trend line data
  const trendData = useMemo(() => {
    const countries = selectedCountries.filter(c =>
      passportHistoricalScores.some(row => row[c] !== undefined)
    );
    return passportHistoricalScores.map(row => {
      const entry: Record<string, number | string> = { year: row.year };
      countries.forEach(c => {
        if (row[c] !== undefined) entry[c] = row[c];
      });
      return entry;
    });
  }, [selectedCountries]);

  const trendCountries = useMemo(() => {
    return selectedCountries.filter(c =>
      passportHistoricalScores.some(row => row[c] !== undefined)
    );
  }, [selectedCountries]);

  // --- HANDLERS ---

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(field === 'rank' || field === 'country'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 text-xs opacity-50">
      {sortField === field ? (sortAsc ? '▲' : '▼') : '⇅'}
    </span>
  );

  const TABS: { id: ViewId; label: string }[] = [
    { id: 'table', label: 'Ranking' },
    { id: 'bar', label: 'Bar Chart' },
    { id: 'movers', label: 'Movers' },
    { id: 'histogram', label: 'Distribution' },
    { id: 'scatter', label: 'GDP Link' },
    { id: 'softpower', label: 'Soft Power' },
    { id: 'radar', label: 'Radar' },
    { id: 'trends', label: 'Trends' },
    { id: 'regions', label: 'Regions' },
    { id: 'tiers', label: 'Tiers' },
    { id: 'insights', label: 'Insights' },
  ];

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
        {/* Header + tabs */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold">Passport Strength Analysis</h2>
              <p className={`text-sm ${themeColors.textSecondary}`}>
                Henley Passport Index 2026 &mdash; visa-free access to 227 destinations
              </p>
            </div>
          </div>
          <div className={`flex flex-wrap gap-1 p-1 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeView === tab.id
                    ? isDarkMode ? 'bg-purple-600 text-white' : 'bg-white text-gray-900 shadow'
                    : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== RANKING TABLE ===== */}
        {activeView === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={themeColors.headerBg}>
                  {([
                    { field: 'rank' as SortField, label: 'Rank' },
                    { field: 'country' as SortField, label: 'Country' },
                    { field: 'visaFree' as SortField, label: 'Visa-Free Destinations' },
                    { field: 'change' as SortField, label: 'Change (vs 2024)' },
                  ]).map(col => (
                    <th key={col.field} onClick={() => handleSort(col.field)}
                      className={`px-4 py-3 text-left font-semibold cursor-pointer select-none ${col.field === 'rank' ? 'w-16' : ''}`}>
                      {col.label}<SortIcon field={col.field} />
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left font-semibold">Tier</th>
                  <th className="px-4 py-3 text-left font-semibold w-48">Strength</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => {
                  const barWidth = Math.min((row.visaFree / 195) * 100, 100);
                  return (
                    <tr key={row.country} className={`border-t ${themeColors.border} ${themeColors.rowHover} transition-colors`}>
                      <td className="px-4 py-3 font-bold text-lg" style={{ color: isDarkMode ? row.tier.colorDark : row.tier.color }}>#{row.rank}</td>
                      <td className="px-4 py-3 font-medium">{displayName(row.country)}</td>
                      <td className="px-4 py-3 font-bold">{row.visaFree}</td>
                      <td className="px-4 py-3">
                        <span className={row.change > 0 ? (isDarkMode ? 'text-green-400' : 'text-green-600') : row.change < 0 ? (isDarkMode ? 'text-red-400' : 'text-red-600') : themeColors.textSecondary}>
                          {row.change > 0 ? `+${row.change}` : row.change === 0 ? '0' : row.change}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: (isDarkMode ? row.tier.colorDark : row.tier.color) + '20', color: isDarkMode ? row.tier.colorDark : row.tier.color }}>
                          {row.tier.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`h-2.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${barWidth}%`, backgroundColor: isDarkMode ? row.tier.colorDark : row.tier.color }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== BAR CHART ===== */}
        {activeView === 'bar' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {([
                { id: 'all' as const, label: `All Countries (${barDataAll.length})` },
                { id: 'selected' as const, label: `Selected (${barDataSelected.length})` },
                { id: 'byRegion' as const, label: 'By Region' },
                { id: 'delta' as const, label: 'Score Change' },
              ]).map(opt => (
                <button key={opt.id} onClick={() => setBarMode(opt.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    barMode === opt.id
                      ? isDarkMode ? 'bg-purple-600 border-purple-500 text-white' : 'bg-purple-100 border-purple-300 text-purple-800'
                      : isDarkMode ? 'border-gray-600 text-gray-400 hover:border-gray-500' : 'border-gray-300 text-gray-500 hover:border-gray-400'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* All countries - full ranking */}
            {barMode === 'all' && (
              <div className="w-full" style={{ height: `${Math.max(500, barDataAll.length * 26)}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barDataAll} layout="vertical" margin={{ top: 5, right: 30, left: 110, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                    <XAxis type="number" domain={[0, 200]} tick={{ fill: themeColors.tickColor, fontSize: 11 }} />
                    <YAxis dataKey="country" type="category" tick={{ fill: themeColors.tickColor, fontSize: 10 }} width={105} interval={0} />
                    <Tooltip contentStyle={tooltipStyle}
                      formatter={(value: number, name: string) => [value, name === 'visaFree' ? '2026 Score' : '2024 Score']} />
                    <Legend formatter={(v: string) => v === 'visaFree' ? '2026 Score' : '2024 Score'} />
                    <Bar dataKey="previous" fill={isDarkMode ? '#4B5563' : '#D1D5DB'} radius={[0, 3, 3, 0]} barSize={12} name="previous" />
                    <Bar dataKey="visaFree" radius={[0, 3, 3, 0]} barSize={12} name="visaFree">
                      {barDataAll.map((entry) => (<Cell key={entry.key} fill={entry.tierColor} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Selected countries comparison */}
            {barMode === 'selected' && (
              barDataSelected.length === 0 ? (
                <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <p className={themeColors.textSecondary}>No selected countries have passport data. Use the Country Comparison tab to select countries.</p>
                </div>
              ) : (
                <div className="w-full" style={{ height: `${Math.max(300, barDataSelected.length * 40)}px` }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barDataSelected} layout="vertical" margin={{ top: 5, right: 30, left: 110, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                      <XAxis type="number" domain={[0, 200]} tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                      <YAxis dataKey="country" type="category" tick={{ fill: themeColors.tickColor, fontSize: 11 }} width={105} interval={0} />
                      <Tooltip contentStyle={tooltipStyle}
                        formatter={(value: number, name: string) => [value, name === 'visaFree' ? '2026 Score' : '2024 Score']} />
                      <Legend formatter={(v: string) => v === 'visaFree' ? '2026 Score' : '2024 Score'} />
                      <Bar dataKey="previous" fill={isDarkMode ? '#4B5563' : '#D1D5DB'} radius={[0, 4, 4, 0]} barSize={16} name="previous" />
                      <Bar dataKey="visaFree" radius={[0, 4, 4, 0]} barSize={16} name="visaFree">
                        {barDataSelected.map((entry) => (<Cell key={entry.key} fill={culturalChartColors[entry.key] || entry.tierColor} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )
            )}

            {/* Regional averages */}
            {barMode === 'byRegion' && (
              <div className="space-y-4">
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barDataByRegion} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                      <XAxis dataKey="region" tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                      <YAxis domain={[0, 200]} tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                      <Tooltip contentStyle={tooltipStyle}
                        formatter={(value: number, name: string) => {
                          const labels: Record<string, string> = { avg: 'Average', max: 'Strongest', min: 'Weakest' };
                          return [value, labels[name] || name];
                        }} />
                      <Legend formatter={(v: string) => {
                        const labels: Record<string, string> = { avg: 'Average', max: 'Strongest', min: 'Weakest' };
                        return labels[v] || v;
                      }} />
                      <Bar dataKey="max" fill={isDarkMode ? '#34D399' : '#059669'} radius={[4, 4, 0, 0]} barSize={20} name="max" />
                      <Bar dataKey="avg" radius={[4, 4, 0, 0]} barSize={20} name="avg">
                        {barDataByRegion.map((entry) => (<Cell key={entry.region} fill={entry.color} />))}
                      </Bar>
                      <Bar dataKey="min" fill={isDarkMode ? '#F87171' : '#DC2626'} radius={[4, 4, 0, 0]} barSize={20} name="min" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {barDataByRegion.map(r => (
                    <div key={r.region} className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                      <div className="font-semibold text-sm" style={{ color: r.color }}>{r.region}</div>
                      <div className={`text-xs mt-1 ${themeColors.textSecondary}`}>
                        {r.count} countries &middot; Avg <span className="font-bold">{r.avg}</span>
                      </div>
                      <div className={`text-xs ${themeColors.textTertiary}`}>
                        Range: {r.min} &ndash; {r.max}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Score change (delta) */}
            {barMode === 'delta' && (
              <div className="w-full" style={{ height: `${Math.max(500, barDataDelta.length * 26)}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barDataDelta} layout="vertical" margin={{ top: 5, right: 30, left: 110, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                    <XAxis type="number" tick={{ fill: themeColors.tickColor, fontSize: 11 }}
                      domain={['dataMin - 2', 'dataMax + 2']} />
                    <YAxis dataKey="country" type="category" tick={{ fill: themeColors.tickColor, fontSize: 10 }} width={105} interval={0} />
                    <Tooltip contentStyle={tooltipStyle}
                      formatter={(value: number) => [`${value > 0 ? '+' : ''}${value}`, '2024 → 2026 Change']} />
                    <Bar dataKey="change" radius={[0, 4, 4, 0]} barSize={12}>
                      {barDataDelta.map((entry) => (
                        <Cell key={entry.key} fill={entry.change > 0 ? (isDarkMode ? '#34D399' : '#059669') : entry.change < 0 ? (isDarkMode ? '#F87171' : '#DC2626') : (isDarkMode ? '#6B7280' : '#9CA3AF')} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ===== BIGGEST MOVERS ===== */}
        {activeView === 'movers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className={`font-semibold text-lg mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                Biggest Gainers (2024 &rarr; 2026)
              </h3>
              <div className="space-y-3">
                {moversData.gainers.map((m, i) => {
                  const tier = getPassportTier(m.score);
                  return (
                    <div key={m.country} className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                      <span className={`text-xl font-bold w-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                          <span className="font-medium">{displayName(m.country)}</span>
                          <span className="text-sm font-medium" style={{ color: isDarkMode ? tier.colorDark : tier.color }}>{m.score}</span>
                        </div>
                      </div>
                      <span className={`font-bold text-lg ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        +{m.change}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className={`font-semibold text-lg mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                Biggest Decliners (2024 &rarr; 2026)
              </h3>
              <div className="space-y-3">
                {moversData.losers.map((m, i) => {
                  const tier = getPassportTier(m.score);
                  return (
                    <div key={m.country} className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                      <span className={`text-xl font-bold w-8 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                          <span className="font-medium">{displayName(m.country)}</span>
                          <span className="text-sm font-medium" style={{ color: isDarkMode ? tier.colorDark : tier.color }}>{m.score}</span>
                        </div>
                      </div>
                      <span className={`font-bold text-lg ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                        {m.change}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== DISTRIBUTION / HISTOGRAM ===== */}
        {activeView === 'histogram' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { label: 'Strongest', value: mobilityGap.max.toString(), sub: 'destinations', accent: isDarkMode ? 'text-green-400' : 'text-green-600' },
                { label: 'Weakest', value: mobilityGap.min.toString(), sub: 'destinations', accent: isDarkMode ? 'text-red-400' : 'text-red-600' },
                { label: 'Mobility Gap', value: mobilityGap.gap.toString(), sub: 'destinations', accent: isDarkMode ? 'text-amber-400' : 'text-amber-600' },
                { label: 'Average', value: mobilityGap.avg.toString(), sub: 'destinations', accent: isDarkMode ? 'text-blue-400' : 'text-blue-600' },
                { label: 'Median', value: mobilityGap.median.toString(), sub: 'destinations', accent: isDarkMode ? 'text-cyan-400' : 'text-cyan-600' },
                { label: 'Countries', value: mobilityGap.total.toString(), sub: 'tracked', accent: isDarkMode ? 'text-purple-400' : 'text-purple-600' },
              ].map(stat => (
                <div key={stat.label} className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <div className={`text-2xl font-bold ${stat.accent}`}>{stat.value}</div>
                  <div className={`text-xs ${themeColors.textSecondary}`}>{stat.label}</div>
                  <div className={`text-[10px] ${themeColors.textTertiary}`}>{stat.sub}</div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-semibold mb-3">Score Distribution (10-destination buckets)</h3>
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={histogramData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                    <XAxis dataKey="range" tick={{ fill: themeColors.tickColor, fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} countries`, 'Count']} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {histogramData.map((entry) => {
                        const tier = getPassportTier(entry.min + 5);
                        return <Cell key={entry.range} fill={isDarkMode ? tier.colorDark : tier.color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ===== GDP SCATTER PLOT ===== */}
        {activeView === 'scatter' && (
          <div className="space-y-4">
            <p className={`text-sm ${themeColors.textSecondary}`}>
              Each dot represents a country. X-axis: GDP per capita (PPP, thousands $). Y-axis: visa-free destinations.
            </p>
            <div className="w-full h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                  <XAxis dataKey="gdp" type="number" name="GDP/capita (k$)" unit="k"
                    tick={{ fill: themeColors.tickColor, fontSize: 11 }} label={{ value: 'GDP per Capita (PPP, thousands $)', position: 'insideBottom', offset: -5, fill: themeColors.tickColor, fontSize: 11 }} />
                  <YAxis dataKey="visaFree" type="number" name="Visa-Free" domain={[0, 200]}
                    tick={{ fill: themeColors.tickColor, fontSize: 11 }} label={{ value: 'Visa-Free Destinations', angle: -90, position: 'insideLeft', fill: themeColors.tickColor, fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'GDP/capita (k$)') return [`$${value}k`, 'GDP per Capita'];
                      return [value, 'Visa-Free'];
                    }}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.country || ''} />
                  {REGIONS.map(region => (
                    <Scatter key={region.label} name={region.label}
                      data={scatterData.filter(d => d.region === region.label)}
                      fill={region.chartColor}>
                      {scatterData.filter(d => d.region === region.label).map((entry) => (
                        <Cell key={entry.key} fill={region.chartColor} />
                      ))}
                    </Scatter>
                  ))}
                  <Legend />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className={`p-3 rounded-lg text-xs ${isDarkMode ? 'bg-gray-900/50 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
              Notable outliers: UAE and Qatar (very high GDP, moderate passport); China (large economy, restricted passport);
              Singapore (top passport and top GDP); India and Nigeria (large economies, weak passports).
            </div>
          </div>
        )}

        {/* ===== SOFT POWER CROSS-REFERENCE ===== */}
        {activeView === 'softpower' && (
          <div className="space-y-4">
            <p className={`text-sm ${themeColors.textSecondary}`}>
              Comparing passport rank vs Brand Finance Global Soft Power Index rank. Large gaps reveal where global influence diverges from travel freedom.
            </p>
            <div className="w-full h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                  <XAxis dataKey="softPowerRank" type="number" name="Soft Power Rank" reversed
                    tick={{ fill: themeColors.tickColor, fontSize: 11 }}
                    label={{ value: 'Soft Power Rank (lower = stronger)', position: 'insideBottom', offset: -5, fill: themeColors.tickColor, fontSize: 11 }} />
                  <YAxis dataKey="passportRank" type="number" name="Passport Rank" reversed
                    tick={{ fill: themeColors.tickColor, fontSize: 11 }}
                    label={{ value: 'Passport Rank (lower = stronger)', angle: -90, position: 'insideLeft', fill: themeColors.tickColor, fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle}
                    formatter={(value: number, name: string) => [
                      `#${value}`,
                      name === 'Soft Power Rank' ? 'Soft Power Rank' : 'Passport Rank'
                    ]}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.country || ''} />
                  <Scatter data={softPowerData} fill="#8B5CF6">
                    {softPowerData.map((entry) => {
                      const region = REGIONS.find(r => r.countries.includes(entry.key));
                      return <Cell key={entry.key} fill={region?.chartColor || '#8B5CF6'} />;
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Biggest Rank Disconnects</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {softPowerData.slice(0, 6).map(d => (
                  <div key={d.key} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                    <div className="font-medium mb-1">{d.country}</div>
                    <div className="flex justify-between text-sm">
                      <span className={themeColors.textSecondary}>Passport: <span className="font-bold">#{d.passportRank}</span></span>
                      <span className={themeColors.textSecondary}>Soft Power: <span className="font-bold">#{d.softPowerRank}</span></span>
                    </div>
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                      Gap: {d.gap} rank positions
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== REGIONAL RADAR ===== */}
        {activeView === 'radar' && (
          <div className="space-y-4">
            <p className={`text-sm ${themeColors.textSecondary}`}>
              Multi-dimensional comparison: average passport score, best passport, internal consistency (low spread), year-over-year trajectory, and country coverage per region.
            </p>
            <div className="w-full h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke={themeColors.gridColor} />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: themeColors.tickColor, fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: themeColors.tickColor, fontSize: 10 }} />
                  {REGIONS.map((region) => (
                    <Radar key={region.label} name={region.label} dataKey={region.label}
                      stroke={region.chartColor} fill={region.chartColor} fillOpacity={0.15} strokeWidth={2} />
                  ))}
                  <Legend />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {regionStats.map(r => (
                <div key={r.label} className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <div className={`font-semibold text-sm ${isDarkMode ? r.colorDark : r.color}`}>{r.label}</div>
                  <div className="text-xs mt-1">
                    <span className={themeColors.textSecondary}>Avg: </span><span className="font-bold">{r.avg}</span>
                    <span className={themeColors.textSecondary}> | Spread: </span><span className="font-bold">&plusmn;{r.stdDev}</span>
                  </div>
                  <div className={`text-xs ${themeColors.textTertiary}`}>
                    YoY: <span className={r.avgChange >= 0 ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}>
                      {r.avgChange >= 0 ? '+' : ''}{r.avgChange}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== HISTORICAL TRENDS ===== */}
        {activeView === 'trends' && (
          <div className="space-y-4">
            <p className={`text-sm ${themeColors.textSecondary}`}>
              Historical passport scores for selected countries (2015&ndash;2026). Use the Country Comparison tab to change which countries appear.
            </p>
            {trendCountries.length === 0 ? (
              <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                <p className={themeColors.textSecondary}>No historical data available for the currently selected countries. Try selecting countries like USA, Japan, Germany, China, or Brazil.</p>
              </div>
            ) : (
              <div className="w-full h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                    <XAxis dataKey="year" tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                    <YAxis domain={[0, 200]} tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    {trendCountries.map((country, i) => (
                      <Line key={country} type="monotone" dataKey={country}
                        name={displayName(country)}
                        stroke={culturalChartColors[country] || TREND_COLORS[i % TREND_COLORS.length]}
                        strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ===== REGIONAL SUMMARY ===== */}
        {activeView === 'regions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {regionStats.map(region => (
              <div key={region.label} className={`p-5 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                <h3 className={`font-semibold text-lg mb-1 ${isDarkMode ? region.colorDark : region.color}`}>{region.label}</h3>
                <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>
                  {region.tracked} countries &middot; Avg: <span className="font-bold">{region.avg}</span> &middot; Spread: &plusmn;{region.stdDev}
                </p>
                <div className="space-y-2">
                  {region.countries.filter(c => passportData[c]).map(country => {
                    const d = passportData[country];
                    const tier = getPassportTier(d.visaFreeDestinations);
                    const width = Math.min((d.visaFreeDestinations / 195) * 100, 100);
                    return (
                      <div key={country}>
                        <div className="flex justify-between text-sm mb-0.5">
                          <span>{displayName(country)}</span>
                          <span className="font-medium">{d.visaFreeDestinations} <span className={themeColors.textTertiary}>({tier.label})</span></span>
                        </div>
                        <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${width}%`, backgroundColor: isDarkMode ? tier.colorDark : tier.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {region.best && (
                  <p className={`text-xs mt-3 ${themeColors.textTertiary}`}>
                    Best: {displayName(region.best)} (#{passportData[region.best].rank})
                    {region.worst && <> &middot; Worst: {displayName(region.worst)} (#{passportData[region.worst].rank})</>}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== TIER DISTRIBUTION ===== */}
        {activeView === 'tiers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tierDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    innerRadius={60} outerRadius={110} paddingAngle={3}
                    label={({ name, value }) => `${name} (${value})`}>
                    {tierDistribution.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [`${value} countries`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg mb-2">Tier Breakdown</h3>
              {[
                { label: 'Excellent', range: '180+ destinations', color: '#059669', colorDark: '#34D399' },
                { label: 'Very Strong', range: '160-179 destinations', color: '#10B981', colorDark: '#6EE7B7' },
                { label: 'Strong', range: '130-159 destinations', color: '#0891B2', colorDark: '#22D3EE' },
                { label: 'Moderate', range: '80-129 destinations', color: '#D97706', colorDark: '#FBBF24' },
                { label: 'Weak', range: '50-79 destinations', color: '#EA580C', colorDark: '#FB923C' },
                { label: 'Very Weak', range: 'Under 50 destinations', color: '#DC2626', colorDark: '#F87171' },
              ].map(tier => {
                const count = tierDistribution.find(t => t.name === tier.label)?.value || 0;
                return (
                  <div key={tier.label} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: isDarkMode ? tier.colorDark : tier.color }} />
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline">
                        <span className="font-medium text-sm" style={{ color: isDarkMode ? tier.colorDark : tier.color }}>{tier.label}</span>
                        <span className={`text-xs ${themeColors.textSecondary}`}>{tier.range}</span>
                      </div>
                    </div>
                    <span className="font-bold text-sm w-8 text-right">{count}</span>
                  </div>
                );
              })}
              <div className={`mt-4 pt-3 border-t ${themeColors.border}`}>
                <p className={`text-xs ${themeColors.textTertiary}`}>
                  Distribution of {Object.keys(passportData).length} tracked countries. Global average: ~107 destinations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== KEY INSIGHTS ===== */}
        {activeView === 'insights' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-emerald-900/20' : 'bg-emerald-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                Gulf States&apos; Visa Diplomacy
              </h4>
              <p className={`text-sm ${themeColors.textSecondary}`}>
                The UAE leapt from rank ~60 in 2015 to rank 3 in 2026 (+64 destinations in a decade),
                the most dramatic passport ascent in history. Saudi Arabia (+19 since 2015) and Qatar (+8 since 2024)
                are investing heavily in bilateral visa agreements as part of economic diversification strategies.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                The ETIAS Effect
              </h4>
              <p className={`text-sm ${themeColors.textSecondary}`}>
                European passports lost 5-8 destinations between 2024-2026, largely due to reciprocal travel
                requirement changes and the EU&apos;s ETIAS implementation. France, Germany, Spain, and Italy
                each dropped from 193 to 185 visa-free destinations, their steepest decline in two decades.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                The Widening Mobility Gap
              </h4>
              <p className={`text-sm ${themeColors.textSecondary}`}>
                The gap between the strongest (Singapore, 192) and weakest (Afghanistan, 24) passport is now
                168 destinations &mdash; up from 118 in 2006. This 42% increase in two decades reflects deepening
                global inequality in freedom of movement, with conflict-affected nations falling further behind.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                Africa&apos;s Quiet Rise
              </h4>
              <p className={`text-sm ${themeColors.textSecondary}`}>
                South Africa gained +4 destinations (back in the top 50 after a decade), while Kenya (+4) and
                Rwanda continue climbing through the African Union&apos;s visa liberalization push. The AfCFTA
                free trade area is driving intra-continental mobility improvements.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                Passport vs Soft Power Disconnect
              </h4>
              <p className={`text-sm ${themeColors.textSecondary}`}>
                China ranks 5th in global soft power but 56th in passport strength &mdash; the largest gap of any major
                power. Conversely, Singapore (passport #1, soft power #18) punches far above its diplomatic weight
                in travel freedom. Economic might doesn&apos;t automatically translate to mobility.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-cyan-900/20' : 'bg-cyan-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
                GDP &amp; Passport Correlation
              </h4>
              <p className={`text-sm ${themeColors.textSecondary}`}>
                There is a strong positive correlation between GDP per capita and passport strength, but it&apos;s
                far from deterministic. Oil-rich Gulf states, small island nations with CBI programs, and
                post-conflict zones all break the pattern &mdash; proving that passport power is shaped by
                diplomacy as much as economics.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassportStrengthChart;
