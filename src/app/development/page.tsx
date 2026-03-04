'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect, useState, useMemo } from 'react';
import { fetchGlobalData, CountryData } from '../services/worldbank';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES, COUNTRY_COLORS, COUNTRY_REGIONS, type CountryKey } from '../utils/countryMappings';
import { formatMetricValue } from '../utils/metricCategories';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ScatterChart, Scatter, Cell } from 'recharts';

function getLatest(series: CountryData[] | undefined, country: string): number | null {
  if (!series) return null;
  for (let i = series.length - 1; i >= 0; i--) {
    const v = Number(series[i][country]);
    if (!isNaN(v) && v !== 0) return v;
  }
  return null;
}

function computeHDI(lifeExp: number | null, education: number | null, gdpPc: number | null): number | null {
  if (lifeExp === null || education === null || gdpPc === null) return null;
  const lifeIndex = Math.max(0, Math.min(1, (lifeExp - 20) / (85 - 20)));
  const eduIndex = Math.max(0, Math.min(1, education / 100));
  const incomeIndex = Math.max(0, Math.min(1, (Math.log(gdpPc) - Math.log(100)) / (Math.log(75000) - Math.log(100))));
  return parseFloat(((lifeIndex + eduIndex + incomeIndex) / 3).toFixed(3));
}

export default function DevelopmentPage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [data, setData] = useState<Record<string, CountryData[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDevCountries, setSelectedDevCountries] = useState<string[]>(['USA', 'Japan', 'Brazil', 'India', 'Nigeria', 'China']);
  const [sortField, setSortField] = useState<string>('hdi');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

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
  } : {
    bg: 'bg-gray-50', card: 'bg-white border-gray-200', text: 'text-gray-900',
    textSec: 'text-gray-500', grid: '#e5e7eb', axis: '#6b7280',
    tooltip: { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } as React.CSSProperties,
  };

  const scoreCards = useMemo(() => {
    if (!data) return [];
    return COUNTRY_KEYS.map(ck => {
      const lifeExp = getLatest(data.lifeExpectancy, ck);
      const education = getLatest(data.tertiaryEnrollment, ck);
      const gdpPc = getLatest(data.gdpPerCapitaPPP, ck);
      const gini = getLatest(data.giniCoefficient, ck);
      const poverty = getLatest(data.povertyRate, ck);
      const internet = getLatest(data.internetUsers, ck);
      const healthcare = getLatest(data.healthcareExpenditure, ck);
      const hdi = computeHDI(lifeExp, education, gdpPc);
      return { country: ck, hdi, lifeExp, education, gdpPc, gini, poverty, internet, healthcare };
    }).filter(c => c.hdi !== null).sort((a, b) => (b.hdi ?? 0) - (a.hdi ?? 0));
  }, [data]);

  const socialMetrics = useMemo(() => {
    if (!data) return [];
    const metrics = ['healthcareExpenditure', 'educationExpenditure', 'internetUsers', 'femaleLaborForce'];
    const labels = ['Healthcare %GDP', 'Education %GDP', 'Internet %', 'Female Labor %'];
    return COUNTRY_KEYS.slice(0, 15).map(ck => {
      const point: Record<string, any> = { country: (COUNTRY_DISPLAY_NAMES[ck] || ck).slice(0, 10) };
      metrics.forEach((mk, i) => {
        point[labels[i]] = getLatest((data as any)[mk], ck) || 0;
      });
      return point;
    });
  }, [data]);

  const sustainData = useMemo(() => {
    if (!data) return [];
    return COUNTRY_KEYS.map(ck => ({
      name: (COUNTRY_DISPLAY_NAMES[ck] || ck).slice(0, 12),
      co2: getLatest(data.co2Emissions, ck) || 0,
      renewable: getLatest(data.renewableEnergy, ck) || 0,
      fill: COUNTRY_COLORS[ck],
    })).filter(d => d.co2 > 0);
  }, [data]);

  const genderData = useMemo(() => {
    if (!data) return [];
    return COUNTRY_KEYS.slice(0, 15).map(ck => ({
      country: (COUNTRY_DISPLAY_NAMES[ck] || ck).slice(0, 10),
      female: getLatest(data.femaleLaborForce, ck) || 0,
      youth: getLatest(data.youthUnemployment, ck) || 0,
    }));
  }, [data]);

  const hdiBreakdown = useMemo(() => {
    if (!data) return [];
    return COUNTRY_KEYS.slice(0, 15).map(ck => {
      const lifeExp = getLatest(data.lifeExpectancy, ck);
      const education = getLatest(data.tertiaryEnrollment, ck);
      const gdpPc = getLatest(data.gdpPerCapitaPPP, ck);
      const lifeScore = lifeExp !== null ? Math.max(0, Math.min(1, (lifeExp - 20) / (85 - 20))) * 100 : 0;
      const eduScore = education !== null ? Math.max(0, Math.min(1, education / 100)) * 100 : 0;
      const incScore = gdpPc !== null ? Math.max(0, Math.min(1, (Math.log(gdpPc) - Math.log(100)) / (Math.log(75000) - Math.log(100)))) * 100 : 0;
      return {
        country: (COUNTRY_DISPLAY_NAMES[ck as CountryKey] || ck).slice(0, 10),
        'Life Expectancy': parseFloat(lifeScore.toFixed(1)),
        'Education': parseFloat(eduScore.toFixed(1)),
        'Income': parseFloat(incScore.toFixed(1)),
      };
    });
  }, [data]);

  const devOverTimeData = useMemo(() => {
    if (!data?.lifeExpectancy) return [];
    return data.lifeExpectancy
      .filter((row: any) => {
        const yr = Number(row.date || row.year);
        return !isNaN(yr) && yr >= 2000;
      })
      .map((row: any) => {
        const point: Record<string, any> = { year: Number(row.date || row.year) };
        selectedDevCountries.forEach(ck => {
          const v = Number(row[ck]);
          if (!isNaN(v) && v > 0) point[ck] = v;
        });
        return point;
      })
      .sort((a: any, b: any) => a.year - b.year);
  }, [data, selectedDevCountries]);

  const regionalComparison = useMemo(() => {
    if (scoreCards.length === 0) return [];
    const regions = ['North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Middle East & Africa'];
    return regions.map(region => {
      const members = COUNTRY_REGIONS[region] || [];
      const cards = scoreCards.filter(sc => members.includes(sc.country as CountryKey));
      if (cards.length === 0) return { region, HDI: 0, Gini: 0, Healthcare: 0 };
      const avg = (arr: (number | null)[]): number => {
        const valid = arr.filter((v): v is number => v !== null);
        return valid.length > 0 ? parseFloat((valid.reduce((s, v) => s + v, 0) / valid.length).toFixed(1)) : 0;
      };
      return {
        region,
        HDI: parseFloat((avg(cards.map(c => c.hdi)) * 100).toFixed(1)),
        Gini: avg(cards.map(c => c.gini)),
        Healthcare: avg(cards.map(c => c.healthcare)),
      };
    });
  }, [scoreCards]);

  const povertyCards = useMemo(() => {
    return scoreCards
      .filter(sc => sc.gdpPc !== null)
      .sort((a, b) => (b.gdpPc ?? 0) - (a.gdpPc ?? 0));
  }, [scoreCards]);

  const rankingsData = useMemo(() => {
    const sorted = [...scoreCards];
    sorted.sort((a, b) => {
      const aVal = (a as any)[sortField] ?? -Infinity;
      const bVal = (b as any)[sortField] ?? -Infinity;
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [scoreCards, sortField, sortDir]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const devTimeColors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${tc.bg}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className={tc.textSec}>Loading development data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${tc.bg} ${tc.text}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">Inequality & Development Index</h1>
            <p className={`${tc.textSec}`}>Human development, inequality, and social progress indicators</p>
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
          <h2 className="text-lg sm:text-xl font-semibold mb-3">Measuring Development Beyond GDP</h2>
          <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            GDP alone does not capture the full picture of a nation&apos;s well-being. The <strong>Human Development
            Index (HDI)</strong>, introduced by the UN, combines three dimensions: a long and healthy life (life
            expectancy), knowledge (education enrollment), and a decent standard of living (income per capita).
            This page computes a simplified HDI-like score for each country and combines it with inequality
            and sustainability metrics for a richer picture.
          </p>
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3`}>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Gini Coefficient</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Measures income inequality on a 0-100 scale. 0 means perfect equality; higher values indicate greater inequality.</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Social Progress</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Healthcare and education spending as % of GDP show how much governments invest in their citizens&apos; well-being.</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Sustainability</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>The scatter plot shows CO2 emissions vs renewable energy. The ideal position is bottom-right: low emissions, high renewables.</p>
            </div>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Countries are ranked by their computed development score. Explore social, gender, and environmental indicators below.
            <a href="/guides/development-inequality" className="text-blue-500 hover:underline ml-1">Learn more in our guide &rarr;</a>
          </p>
        </div>

        {/* Development Scorecard */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-4">Development Scorecard (Simplified HDI)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {scoreCards.map((sc, rank) => {
              const hdiColor = (sc.hdi ?? 0) >= 0.8 ? 'text-green-500' : (sc.hdi ?? 0) >= 0.6 ? 'text-yellow-500' : 'text-red-500';
              return (
                <div key={sc.country} className={`rounded-lg border p-3 ${tc.card}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${tc.textSec}`}>#{rank + 1}</span>
                  </div>
                  <p className="text-xs font-medium mt-1 truncate">{COUNTRY_DISPLAY_NAMES[sc.country as CountryKey]}</p>
                  <p className={`text-xl font-bold ${hdiColor}`}>{sc.hdi?.toFixed(3)}</p>
                  <div className={`text-xs mt-1 ${tc.textSec}`}>
                    {sc.gini !== null && <span>Gini: {sc.gini.toFixed(1)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Social Progress Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className={`rounded-xl border p-6 ${tc.card}`}>
            <h2 className="text-xl font-semibold mb-4">Social Progress Comparison</h2>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={socialMetrics} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                  <XAxis dataKey="country" stroke={tc.axis} tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tc.tooltip} />
                  <Legend />
                  <Bar dataKey="Healthcare %GDP" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Education %GDP" fill="#22c55e" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Internet %" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`rounded-xl border p-6 ${tc.card}`}>
            <h2 className="text-xl font-semibold mb-4">Gender & Youth</h2>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genderData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                  <XAxis dataKey="country" stroke={tc.axis} tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={tc.tooltip} />
                  <Legend />
                  <Bar dataKey="female" name="Female Labor %" fill="#ec4899" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="youth" name="Youth Unemployment %" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sustainability: CO2 vs Renewable */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-2">Sustainability: CO2 Emissions vs Renewable Energy</h2>
          <p className={`text-xs mb-4 ${tc.textSec}`}>Ideal position is bottom-right (low CO2, high renewable energy)</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="renewable" name="Renewable Energy %" stroke={tc.axis} tick={{ fontSize: 11 }}
                  label={{ value: 'Renewable Energy (%)', position: 'bottom', offset: 0, fontSize: 11, fill: tc.axis }} />
                <YAxis dataKey="co2" name="CO2 per capita" stroke={tc.axis} tick={{ fontSize: 11 }}
                  label={{ value: 'CO2 (tonnes/cap)', angle: -90, position: 'insideLeft', fontSize: 11, fill: tc.axis }} />
                <Tooltip contentStyle={tc.tooltip} cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value: number, name: string) => [value.toFixed(1), name]} />
                <Scatter data={sustainData} name="Countries">
                  {sustainData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HDI Component Breakdown */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-2">HDI Component Breakdown</h2>
          <p className={`text-xs mb-4 ${tc.textSec}`}>Three dimensions of the Human Development Index scored 0-100 for top 15 countries</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hdiBreakdown} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="country" stroke={tc.axis} tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} domain={[0, 100]} tickFormatter={v => `${v}`} />
                <Tooltip contentStyle={tc.tooltip} />
                <Legend />
                <Bar dataKey="Life Expectancy" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Education" fill="#22c55e" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Income" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Development Over Time */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-2">Development Over Time</h2>
          <p className={`text-xs mb-3 ${tc.textSec}`}>Life expectancy trends since 2000 for selected countries</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {COUNTRY_KEYS.map(ck => {
              const active = selectedDevCountries.includes(ck);
              return (
                <button
                  key={ck}
                  onClick={() => setSelectedDevCountries(prev =>
                    prev.includes(ck) ? prev.filter(c => c !== ck) : [...prev, ck]
                  )}
                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                    active
                      ? 'bg-blue-500 text-white border-blue-500'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {(COUNTRY_DISPLAY_NAMES[ck] || ck).slice(0, 12)}
                </button>
              );
            })}
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={devOverTimeData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} domain={['auto', 'auto']}
                  label={{ value: 'Life Expectancy (yrs)', angle: -90, position: 'insideLeft', fontSize: 11, fill: tc.axis }} />
                <Tooltip contentStyle={tc.tooltip} />
                <Legend />
                {selectedDevCountries.map((ck, i) => (
                  <Line
                    key={ck}
                    type="monotone"
                    dataKey={ck}
                    name={COUNTRY_DISPLAY_NAMES[ck as CountryKey] || ck}
                    stroke={COUNTRY_COLORS[ck as CountryKey] || devTimeColors[i % devTimeColors.length]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Development Comparison */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-2">Regional Development Comparison</h2>
          <p className={`text-xs mb-4 ${tc.textSec}`}>Average HDI (x100), Gini coefficient, and healthcare spending by region</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalComparison} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="region" stroke={tc.axis} tick={{ fontSize: 10 }} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tc.tooltip} />
                <Legend />
                <Bar dataKey="HDI" name="HDI (x100)" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Gini" name="Gini Index" fill="#ef4444" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Healthcare" name="Healthcare %GDP" fill="#22c55e" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Poverty & Income Cards */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-2">Poverty & Income Overview</h2>
          <p className={`text-xs mb-4 ${tc.textSec}`}>Countries sorted by GDP per capita (PPP). Color indicators: Gini green &lt; 30, yellow &lt; 40, red &ge; 40</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {povertyCards.map(sc => {
              const giniColor = sc.gini === null ? 'text-gray-400' : sc.gini < 30 ? 'text-green-500' : sc.gini < 40 ? 'text-yellow-500' : 'text-red-500';
              return (
                <div key={sc.country} className={`rounded-lg border p-3 ${tc.card}`}>
                  <p className="text-xs font-semibold truncate">{COUNTRY_DISPLAY_NAMES[sc.country as CountryKey]}</p>
                  <p className="text-lg font-bold mt-1">
                    ${sc.gdpPc !== null ? sc.gdpPc.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}
                  </p>
                  <p className={`text-xs ${tc.textSec}`}>GDP/capita PPP</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div>
                      <span className={`text-xs font-medium ${giniColor}`}>
                        Gini: {sc.gini !== null ? sc.gini.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className={`text-xs ${tc.textSec}`}>
                        Poverty: {sc.poverty !== null ? `${sc.poverty.toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Development Rankings Table */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-2">Development Rankings</h2>
          <p className={`text-xs mb-4 ${tc.textSec}`}>Click column headers to sort. All countries ranked by key development indicators.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  {[
                    { key: 'rank', label: 'Rank' },
                    { key: 'country', label: 'Country' },
                    { key: 'hdi', label: 'HDI Score' },
                    { key: 'lifeExp', label: 'Life Exp.' },
                    { key: 'education', label: 'Education %' },
                    { key: 'gdpPc', label: 'GDP/Capita' },
                    { key: 'gini', label: 'Gini' },
                    { key: 'healthcare', label: 'Healthcare %' },
                    { key: 'internet', label: 'Internet %' },
                  ].map(col => (
                    <th
                      key={col.key}
                      className={`px-3 py-2 text-left font-medium cursor-pointer select-none hover:text-blue-500 transition-colors ${tc.textSec}`}
                      onClick={() => col.key !== 'rank' && col.key !== 'country' && toggleSort(col.key)}
                    >
                      {col.label}
                      {sortField === col.key && (
                        <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rankingsData.map((sc, idx) => (
                  <tr
                    key={sc.country}
                    className={`border-b transition-colors ${
                      isDarkMode
                        ? 'border-gray-700/50 hover:bg-gray-700/30'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-3 py-2 font-medium">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium">{COUNTRY_DISPLAY_NAMES[sc.country as CountryKey]}</td>
                    <td className="px-3 py-2">
                      <span className={
                        (sc.hdi ?? 0) >= 0.8 ? 'text-green-500 font-semibold' :
                        (sc.hdi ?? 0) >= 0.6 ? 'text-yellow-500 font-semibold' : 'text-red-500 font-semibold'
                      }>
                        {sc.hdi?.toFixed(3) ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2">{sc.lifeExp?.toFixed(1) ?? '—'}</td>
                    <td className="px-3 py-2">{sc.education !== null ? `${sc.education.toFixed(1)}%` : '—'}</td>
                    <td className="px-3 py-2">{sc.gdpPc !== null ? `$${sc.gdpPc.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'}</td>
                    <td className="px-3 py-2">
                      <span className={
                        sc.gini === null ? '' :
                        sc.gini < 30 ? 'text-green-500' : sc.gini < 40 ? 'text-yellow-500' : 'text-red-500'
                      }>
                        {sc.gini?.toFixed(1) ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2">{sc.healthcare !== null ? `${sc.healthcare.toFixed(1)}%` : '—'}</td>
                    <td className="px-3 py-2">{sc.internet !== null ? `${sc.internet.toFixed(1)}%` : '—'}</td>
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
