'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect, useState, useMemo } from 'react';
import { fetchGlobalData, CountryData } from '../services/worldbank';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES, COUNTRY_COLORS, type CountryKey } from '../utils/countryMappings';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, ScatterChart, Scatter, Cell, ReferenceLine } from 'recharts';

function getLatest(series: CountryData[] | undefined, country: string): number | null {
  if (!series) return null;
  for (let i = series.length - 1; i >= 0; i--) {
    const v = Number(series[i][country]);
    if (!isNaN(v) && v !== 0) return v;
  }
  return null;
}

function computeScore(debt: number | null, debtService: number | null, budget: number | null, growth: number | null, interest: number | null): { score: number; label: string; color: string } {
  let score = 100;
  if (debt !== null) {
    if (debt > 120) score -= 30;
    else if (debt > 90) score -= 20;
    else if (debt > 60) score -= 10;
  }
  if (debtService !== null) {
    if (debtService > 20) score -= 25;
    else if (debtService > 10) score -= 15;
    else if (debtService > 5) score -= 5;
  }
  if (budget !== null) {
    if (budget < -6) score -= 20;
    else if (budget < -3) score -= 10;
    else if (budget > 0) score += 5;
  }
  if (growth !== null && interest !== null) {
    const igDiff = interest - growth;
    if (igDiff > 3) score -= 20;
    else if (igDiff > 0) score -= 10;
    else score += 5;
  }
  score = Math.max(0, Math.min(100, score));
  if (score >= 75) return { score, label: 'Low Risk', color: 'text-green-500' };
  if (score >= 50) return { score, label: 'Moderate', color: 'text-yellow-500' };
  if (score >= 25) return { score, label: 'Elevated', color: 'text-orange-500' };
  return { score, label: 'High Risk', color: 'text-red-500' };
}

export default function DebtDashboardPage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [data, setData] = useState<Record<string, CountryData[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['USA', 'Japan', 'UK', 'France', 'Germany', 'Brazil']);

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
    rowHover: 'hover:bg-gray-700/50', headerBg: 'bg-gray-700/50',
  } : {
    bg: 'bg-gray-50', card: 'bg-white border-gray-200', text: 'text-gray-900',
    textSec: 'text-gray-500', grid: '#e5e7eb', axis: '#6b7280',
    tooltip: { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } as React.CSSProperties,
    rowHover: 'hover:bg-gray-50', headerBg: 'bg-gray-50',
  };

  const scoreCards = useMemo(() => {
    if (!data) return [];
    return COUNTRY_KEYS.map(ck => {
      const debt = getLatest(data.governmentDebt, ck);
      const debtService = getLatest(data.publicDebtService, ck);
      const budget = getLatest(data.budgetBalance, ck);
      const growth = getLatest(data.gdpGrowth, ck);
      const interest = getLatest(data.interestRates, ck);
      const taxRev = getLatest(data.taxRevenue, ck);
      const { score, label, color } = computeScore(debt, debtService, budget, growth, interest);
      return { country: ck, debt, debtService, budget, growth, interest, taxRev, score, label, color };
    }).sort((a, b) => a.score - b.score);
  }, [data]);

  const debtTrajectoryData = useMemo(() => {
    if (!data) return [];
    return (data.governmentDebt || []).filter(r => Number(r.year) >= 2000).map(row => {
      const point: Record<string, number | string> = { year: row.year };
      for (const ck of selectedCountries) {
        const v = Number(row[ck]);
        if (!isNaN(v)) point[ck] = v;
      }
      return point;
    });
  }, [data, selectedCountries]);

  const igDiffData = useMemo(() => {
    if (!data) return [];
    return selectedCountries.map(ck => {
      const g = getLatest(data?.gdpGrowth, ck);
      const r = getLatest(data?.interestRates, ck);
      return {
        country: COUNTRY_DISPLAY_NAMES[ck as CountryKey] || ck,
        diff: (r !== null && g !== null) ? r - g : 0,
        fill: (r !== null && g !== null && r - g > 0) ? '#ef4444' : '#22c55e',
      };
    });
  }, [data, selectedCountries]);

  const fiscalSpaceData = useMemo(() => {
    return scoreCards
      .filter(sc => selectedCountries.includes(sc.country))
      .map(sc => {
        const debtGdp = sc.debt ?? 0;
        const primaryAdj = sc.budget ?? 0;
        const space = Math.max(0, 100 - debtGdp + primaryAdj * 2);
        return {
          country: COUNTRY_DISPLAY_NAMES[sc.country as CountryKey] || sc.country,
          space: parseFloat(space.toFixed(1)),
          fill: COUNTRY_COLORS[sc.country as CountryKey] || '#6b7280',
        };
      })
      .sort((a, b) => b.space - a.space);
  }, [scoreCards, selectedCountries]);

  const debtServiceRanking = useMemo(() => {
    return scoreCards
      .filter(sc => sc.debtService !== null)
      .map(sc => ({
        country: COUNTRY_DISPLAY_NAMES[sc.country as CountryKey] || sc.country,
        debtService: sc.debtService!,
        fill: sc.debtService! >= 15 ? '#ef4444' : sc.debtService! >= 5 ? '#eab308' : '#22c55e',
      }))
      .sort((a, b) => b.debtService - a.debtService);
  }, [scoreCards]);

  const budgetTrendData = useMemo(() => {
    if (!data?.budgetBalance) return [];
    return data.budgetBalance
      .filter(r => Number(r.year) >= 2000)
      .map(row => {
        const point: Record<string, number | string> = { year: row.year };
        for (const ck of selectedCountries) {
          const v = Number(row[ck]);
          if (!isNaN(v)) point[ck] = v;
        }
        return point;
      });
  }, [data, selectedCountries]);

  const debtVsGrowthData = useMemo(() => {
    return scoreCards
      .filter(sc => sc.debt !== null && sc.growth !== null)
      .map(sc => ({
        country: COUNTRY_DISPLAY_NAMES[sc.country as CountryKey] || sc.country,
        debt: sc.debt!,
        growth: sc.growth!,
        fill: COUNTRY_COLORS[sc.country as CountryKey] || '#6b7280',
      }));
  }, [scoreCards]);

  const riskCards = useMemo(() => {
    return scoreCards
      .filter(sc => selectedCountries.includes(sc.country))
      .map(sc => {
        const debtRisk = sc.debt === null ? 'gray' : sc.debt < 60 ? 'green' : sc.debt < 90 ? 'yellow' : 'red';
        const dsRisk = sc.debtService === null ? 'gray' : sc.debtService < 5 ? 'green' : sc.debtService < 15 ? 'yellow' : 'red';
        const budgetRisk = sc.budget === null ? 'gray' : sc.budget >= 0 ? 'green' : sc.budget >= -3 ? 'yellow' : 'red';
        const rgDiff = (sc.interest !== null && sc.growth !== null) ? sc.interest - sc.growth : null;
        const rgRisk = rgDiff === null ? 'gray' : rgDiff < 0 ? 'green' : rgDiff < 2 ? 'yellow' : 'red';
        return {
          country: sc.country,
          displayName: COUNTRY_DISPLAY_NAMES[sc.country as CountryKey] || sc.country,
          score: sc.score,
          label: sc.label,
          scoreColor: sc.color,
          risks: [
            { name: 'Debt Level', level: debtRisk, value: sc.debt !== null ? `${sc.debt.toFixed(0)}%` : 'N/A' },
            { name: 'Debt Service', level: dsRisk, value: sc.debtService !== null ? `${sc.debtService.toFixed(1)}%` : 'N/A' },
            { name: 'Budget', level: budgetRisk, value: sc.budget !== null ? `${sc.budget.toFixed(1)}%` : 'N/A' },
            { name: 'r − g', level: rgRisk, value: rgDiff !== null ? `${rgDiff.toFixed(1)}%` : 'N/A' },
          ],
        };
      });
  }, [scoreCards, selectedCountries]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${tc.bg}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className={tc.textSec}>Loading debt data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${tc.bg} ${tc.text}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">Debt Sustainability Dashboard</h1>
            <p className={`${tc.textSec}`}>Analyze government debt health and sustainability across countries</p>
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
          <h2 className="text-lg sm:text-xl font-semibold mb-3">Understanding Debt Sustainability</h2>
          <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Government debt sustainability measures whether a country can service its debt obligations without
            requiring extraordinary measures. The key metric is the <strong>debt-to-GDP ratio</strong>, which
            expresses total government debt as a percentage of annual economic output. A ratio above 60% is often
            flagged as elevated, while above 90-100% may signal fiscal stress, though context matters significantly.
          </p>
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3`}>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Interest-Growth Differential (r - g)</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>When interest rates on debt exceed GDP growth, debt grows faster than the economy -- a warning sign for sustainability.</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Budget Balance</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>A deficit (negative balance) means the government spends more than it collects, adding to debt. Surpluses reduce debt.</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Sustainability Score</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Our composite score (0-100) weighs debt level, debt service burden, budget balance, and the interest-growth differential.</p>
            </div>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Click any country in the scorecard to add it to the trajectory and differential charts below.
            <a href="/guides/debt-sustainability" className="text-blue-500 hover:underline ml-1">Learn more in our guide &rarr;</a>
          </p>
        </div>

        {/* Sustainability Scorecard */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-4">Sustainability Scorecard</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {scoreCards.map(sc => (
              <div
                key={sc.country}
                onClick={() => setSelectedCountries(prev =>
                  prev.includes(sc.country) ? prev.filter(c => c !== sc.country) :
                  prev.length < 8 ? [...prev, sc.country] : prev
                )}
                className={`rounded-lg border p-3 cursor-pointer transition-all ${tc.card} ${
                  selectedCountries.includes(sc.country) ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <p className="text-xs font-medium truncate">{COUNTRY_DISPLAY_NAMES[sc.country as CountryKey]}</p>
                <p className={`text-xl font-bold ${sc.color}`}>{sc.score}</p>
                <p className={`text-xs ${sc.color}`}>{sc.label}</p>
                <p className={`text-xs mt-1 ${tc.textSec}`}>Debt: {sc.debt !== null ? `${sc.debt.toFixed(0)}%` : 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Overview Table */}
        <div className={`rounded-xl border mb-8 overflow-x-auto ${tc.card}`}>
          <h2 className="text-xl font-semibold p-6 pb-4">Debt Overview</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className={tc.headerBg}>
                <th className="text-left px-4 py-2 font-medium">Country</th>
                <th className="text-right px-4 py-2 font-medium">Debt/GDP</th>
                <th className="text-right px-4 py-2 font-medium">Debt Service</th>
                <th className="text-right px-4 py-2 font-medium">Budget Bal.</th>
                <th className="text-right px-4 py-2 font-medium">Interest Rate</th>
                <th className="text-right px-4 py-2 font-medium">GDP Growth</th>
                <th className="text-right px-4 py-2 font-medium">r - g</th>
                <th className="text-right px-4 py-2 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {scoreCards.filter(sc => selectedCountries.includes(sc.country)).map(sc => {
                const igDiff = (sc.interest !== null && sc.growth !== null) ? sc.interest - sc.growth : null;
                return (
                  <tr key={sc.country} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} ${tc.rowHover}`}>
                    <td className="px-4 py-3 font-medium">{COUNTRY_DISPLAY_NAMES[sc.country as CountryKey]}</td>
                    <td className="text-right px-4 py-3">{sc.debt !== null ? `${sc.debt.toFixed(1)}%` : '—'}</td>
                    <td className="text-right px-4 py-3">{sc.debtService !== null ? `${sc.debtService.toFixed(1)}%` : '—'}</td>
                    <td className={`text-right px-4 py-3 ${sc.budget !== null && sc.budget < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {sc.budget !== null ? `${sc.budget.toFixed(1)}%` : '—'}
                    </td>
                    <td className="text-right px-4 py-3">{sc.interest !== null ? `${sc.interest.toFixed(1)}%` : '—'}</td>
                    <td className="text-right px-4 py-3">{sc.growth !== null ? `${sc.growth.toFixed(1)}%` : '—'}</td>
                    <td className={`text-right px-4 py-3 font-medium ${igDiff !== null && igDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {igDiff !== null ? `${igDiff.toFixed(1)}%` : '—'}
                    </td>
                    <td className={`text-right px-4 py-3 font-bold ${sc.color}`}>{sc.score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Debt Trajectory */}
          <div className={`rounded-xl border p-6 ${tc.card}`}>
            <h2 className="text-xl font-semibold mb-4">Debt-to-GDP Trajectory</h2>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={debtTrajectoryData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                  <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
                  <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={tc.tooltip} />
                  <Legend />
                  {selectedCountries.map(ck => (
                    <Line key={ck} type="monotone" dataKey={ck} name={COUNTRY_DISPLAY_NAMES[ck as CountryKey]}
                      stroke={COUNTRY_COLORS[ck as CountryKey]} dot={false} strokeWidth={2} connectNulls />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interest-Growth Differential */}
          <div className={`rounded-xl border p-6 ${tc.card}`}>
            <h2 className="text-xl font-semibold mb-2">Interest-Growth Differential (r − g)</h2>
            <p className={`text-xs mb-4 ${tc.textSec}`}>Positive values (red) mean debt grows faster than the economy</p>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={igDiffData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                  <XAxis dataKey="country" stroke={tc.axis} tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={tc.tooltip} />
                  <Bar dataKey="diff" name="r − g" radius={[4, 4, 0, 0]}>
                    {igDiffData.map((entry, i) => (
                      <rect key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Fiscal Space Indicator */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-2">Fiscal Space Indicator</h2>
          <p className={`text-xs mb-4 ${tc.textSec}`}>Estimated fiscal room (higher = more headroom) based on debt level and primary balance</p>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fiscalSpaceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="country" stroke={tc.axis} tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tc.tooltip} formatter={(value: number) => [`${value}`, 'Fiscal Space']} />
                <Bar dataKey="space" name="Fiscal Space" radius={[4, 4, 0, 0]}>
                  {fiscalSpaceData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Debt Service Burden Chart */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-2">Debt Service Burden</h2>
          <p className={`text-xs mb-4 ${tc.textSec}`}>Debt service as % of government revenue — sorted highest to lowest</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={debtServiceRanking} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis type="number" stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="country" stroke={tc.axis} tick={{ fontSize: 11 }} width={75} />
                <Tooltip contentStyle={tc.tooltip} formatter={(value: number) => [`${value.toFixed(1)}%`, 'Debt Service']} />
                <ReferenceLine x={15} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'High', fill: '#ef4444', fontSize: 10 }} />
                <ReferenceLine x={5} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'Moderate', fill: '#eab308', fontSize: 10 }} />
                <Bar dataKey="debtService" name="Debt Service %" radius={[0, 4, 4, 0]}>
                  {debtServiceRanking.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Budget Balance Trend */}
          <div className={`rounded-xl border p-6 ${tc.card}`}>
            <h2 className="text-xl font-semibold mb-2">Budget Balance Trend</h2>
            <p className={`text-xs mb-4 ${tc.textSec}`}>Budget balance (% of GDP) over time for selected countries</p>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={budgetTrendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                  <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
                  <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={tc.tooltip} />
                  <Legend />
                  <ReferenceLine y={0} stroke={tc.axis} strokeDasharray="3 3" />
                  {selectedCountries.map(ck => (
                    <Line key={ck} type="monotone" dataKey={ck} name={COUNTRY_DISPLAY_NAMES[ck as CountryKey]}
                      stroke={COUNTRY_COLORS[ck as CountryKey]} dot={false} strokeWidth={2} connectNulls />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Debt vs Growth Scatter */}
          <div className={`rounded-xl border p-6 ${tc.card}`}>
            <h2 className="text-xl font-semibold mb-2">Debt vs Growth Scatter</h2>
            <p className={`text-xs mb-4 ${tc.textSec}`}>Debt-to-GDP (x) vs GDP growth (y) — each dot is a country</p>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                  <XAxis type="number" dataKey="debt" name="Debt/GDP" stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <YAxis type="number" dataKey="growth" name="GDP Growth" stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={tc.tooltip} cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name === 'debt' ? 'Debt/GDP' : 'GDP Growth']}
                    labelFormatter={() => ''} />
                  <ReferenceLine x={60} stroke="#eab308" strokeDasharray="3 3" />
                  <ReferenceLine x={90} stroke="#ef4444" strokeDasharray="3 3" />
                  <Scatter name="Countries" data={debtVsGrowthData}>
                    {debtVsGrowthData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Risk Summary Cards */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-4">Risk Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskCards.map(rc => (
              <div key={rc.country} className={`rounded-lg border p-4 ${tc.card}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{rc.displayName}</h3>
                  <span className={`text-sm font-bold ${rc.scoreColor}`}>{rc.score} — {rc.label}</span>
                </div>
                <div className="space-y-2">
                  {rc.risks.map(risk => (
                    <div key={risk.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                          risk.level === 'green' ? 'bg-green-500' :
                          risk.level === 'yellow' ? 'bg-yellow-500' :
                          risk.level === 'red' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        <span className={tc.textSec}>{risk.name}</span>
                      </div>
                      <span className="font-medium">{risk.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
