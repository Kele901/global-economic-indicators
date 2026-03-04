'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { fetchGlobalData, CountryData } from '../../services/worldbank';
import { COUNTRY_SLUGS, COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG, COUNTRY_COLORS, COUNTRY_KEYS, COUNTRY_REGIONS, type CountryKey } from '../../utils/countryMappings';
import { METRIC_CATEGORIES, getMetricByKey, formatMetricValue } from '../../utils/metricCategories';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { US, GB, CA, FR, DE, IT, JP, AU, MX, KR, ES, SE, CH, TR, NG, CN, RU, BR, CL, AR, IN, NO, NL, PT, BE, ID, ZA, PL, SA, EG } from 'country-flag-icons/react/3x2';

const FLAG_MAP: Record<string, React.ComponentType<any>> = {
  USA: US, UK: GB, Canada: CA, France: FR, Germany: DE, Italy: IT, Japan: JP,
  Australia: AU, Mexico: MX, SouthKorea: KR, Spain: ES, Sweden: SE, Switzerland: CH,
  Turkey: TR, Nigeria: NG, China: CN, Russia: RU, Brazil: BR, Chile: CL,
  Argentina: AR, India: IN, Norway: NO, Netherlands: NL, Portugal: PT, Belgium: BE,
  Indonesia: ID, SouthAfrica: ZA, Poland: PL, SaudiArabia: SA, Egypt: EG,
};

const HEADLINE_METRICS = ['gdpGrowth', 'inflationRates', 'interestRates', 'unemploymentRates'];
const KEY_INDICATOR_METRICS = [
  'gdpPerCapitaPPP', 'governmentDebt', 'tradeBalance', 'fdi',
  'lifeExpectancy', 'populationGrowth', 'internetUsers', 'co2Emissions',
  'laborForceParticipation', 'giniCoefficient', 'rdSpending', 'healthcareExpenditure',
  'renewableEnergy', 'povertyRate', 'taxRevenue', 'grossCapitalFormation',
  'domesticCredit', 'educationExpenditure', 'budgetBalance', 'currentAccount',
];

export default function CountryProfilePage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const params = useParams();
  const slug = params?.slug as string;
  const countryKey = COUNTRY_SLUGS[slug?.toLowerCase() ?? ''];
  const displayName = countryKey ? COUNTRY_DISPLAY_NAMES[countryKey] : slug;
  const FlagComponent = countryKey ? FLAG_MAP[countryKey] : null;

  const [data, setData] = useState<Record<string, CountryData[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['gdpGrowth', 'inflationRates']);
  const [dualMetricLeft, setDualMetricLeft] = useState('gdpGrowth');
  const [dualMetricRight, setDualMetricRight] = useState('inflationRates');

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
    textSec: 'text-gray-400', textMuted: 'text-gray-500', accent: 'text-blue-400',
    grid: '#374151', axis: '#9ca3af',
    tooltip: { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px' } as React.CSSProperties,
  } : {
    bg: 'bg-gray-50', card: 'bg-white border-gray-200', text: 'text-gray-900',
    textSec: 'text-gray-500', textMuted: 'text-gray-400', accent: 'text-blue-600',
    grid: '#e5e7eb', axis: '#6b7280',
    tooltip: { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } as React.CSSProperties,
  };

  const getLatestValue = (metricKey: string): number | null => {
    if (!data || !countryKey) return null;
    const series = (data as any)[metricKey] as CountryData[] | undefined;
    if (!series) return null;
    for (let i = series.length - 1; i >= 0; i--) {
      const v = Number(series[i][countryKey]);
      if (!isNaN(v) && v !== 0) return v;
    }
    return null;
  };

  const getPreviousValue = (metricKey: string): number | null => {
    if (!data || !countryKey) return null;
    const series = (data as any)[metricKey] as CountryData[] | undefined;
    if (!series) return null;
    let found = false;
    for (let i = series.length - 1; i >= 0; i--) {
      const v = Number(series[i][countryKey]);
      if (!isNaN(v) && v !== 0) {
        if (found) return v;
        found = true;
      }
    }
    return null;
  };

  const radarData = useMemo(() => {
    if (!data || !countryKey) return [];
    const metrics = [
      { key: 'gdpGrowth', label: 'GDP Growth', max: 15 },
      { key: 'employmentRates', label: 'Employment', max: 80 },
      { key: 'lifeExpectancy', label: 'Life Exp.', max: 90 },
      { key: 'internetUsers', label: 'Internet', max: 100 },
      { key: 'rdSpending', label: 'R&D', max: 5 },
      { key: 'healthcareExpenditure', label: 'Healthcare', max: 20 },
    ];
    return metrics.map(m => {
      const v = getLatestValue(m.key);
      return { metric: m.label, value: v !== null ? Math.max(0, Math.min(100, (v / m.max) * 100)) : 0 };
    });
  }, [data, countryKey]);

  const relatedCountries = useMemo(() => {
    if (!countryKey) return [];
    const region = Object.entries(COUNTRY_REGIONS).find(([, countries]) => countries.includes(countryKey));
    if (!region) return COUNTRY_KEYS.filter(k => k !== countryKey).slice(0, 4);
    return region[1].filter(k => k !== countryKey).slice(0, 4);
  }, [countryKey]);

  const timelineData = useMemo(() => {
    if (!data || !countryKey || selectedMetrics.length === 0) return [];
    const yearMap: Record<number, Record<string, number>> = {};
    for (const mk of selectedMetrics) {
      const series = (data as any)[mk] as CountryData[] | undefined;
      if (!series) continue;
      for (const row of series) {
        const yr = Number(row.year);
        const v = Number(row[countryKey]);
        if (!isNaN(v) && yr) {
          if (!yearMap[yr]) yearMap[yr] = { year: yr };
          yearMap[yr][mk] = v;
        }
      }
    }
    return Object.values(yearMap).sort((a, b) => (a.year as number) - (b.year as number));
  }, [data, countryKey, selectedMetrics]);

  const economicSummary = useMemo(() => {
    if (!data || !countryKey) return null;
    const gdp = getLatestValue('gdpGrowth');
    const inflation = getLatestValue('inflationRates');
    const debt = getLatestValue('governmentDebt');
    const unemployment = getLatestValue('unemploymentRates');
    const interest = getLatestValue('interestRates');
    const trade = getLatestValue('tradeBalance');
    let strengthFactors = 0;
    if (gdp !== null && gdp > 3) strengthFactors++;
    if (unemployment !== null && unemployment < 5) strengthFactors++;
    if (inflation !== null && inflation >= 1 && inflation <= 3) strengthFactors++;
    if (debt !== null && debt < 60) strengthFactors++;
    const strength = strengthFactors >= 3 ? 'strong' : strengthFactors <= 1 ? 'weak' : 'moderate';
    return { gdp, inflation, debt, unemployment, interest, trade, strength };
  }, [data, countryKey]);

  const healthScore = useMemo(() => {
    if (!data || !countryKey) return null;
    const gdp = getLatestValue('gdpGrowth');
    const unemployment = getLatestValue('unemploymentRates');
    const inflation = getLatestValue('inflationRates');
    const debt = getLatestValue('governmentDebt');
    const trade = getLatestValue('tradeBalance');
    let score = 0;
    const breakdown: { label: string; points: number; max: number }[] = [];
    const gdpPts = gdp !== null ? Math.min(20, Math.max(0, (gdp / 8) * 20)) : 0;
    breakdown.push({ label: 'GDP Growth', points: Math.round(gdpPts), max: 20 });
    score += gdpPts;
    const unempPts = unemployment !== null ? Math.min(20, Math.max(0, (1 - unemployment / 20) * 20)) : 0;
    breakdown.push({ label: 'Unemployment', points: Math.round(unempPts), max: 20 });
    score += unempPts;
    const inflDist = inflation !== null ? Math.abs(inflation - 2) : 10;
    const inflPts = Math.min(20, Math.max(0, (1 - inflDist / 10) * 20));
    breakdown.push({ label: 'Inflation', points: Math.round(inflPts), max: 20 });
    score += inflPts;
    const debtPts = debt !== null ? Math.min(20, Math.max(0, (1 - debt / 200) * 20)) : 0;
    breakdown.push({ label: 'Debt-to-GDP', points: Math.round(debtPts), max: 20 });
    score += debtPts;
    const tradePts = trade !== null ? Math.min(20, Math.max(0, ((trade + 20) / 40) * 20)) : 10;
    breakdown.push({ label: 'Trade Balance', points: Math.round(tradePts), max: 20 });
    score += tradePts;
    return { score: Math.round(score), breakdown };
  }, [data, countryKey]);

  const peerComparisonData = useMemo(() => {
    if (!data || !countryKey) return [];
    const region = Object.entries(COUNTRY_REGIONS).find(([, countries]) => countries.includes(countryKey));
    if (!region) return [];
    const peers = region[1].filter(k => k !== countryKey);
    const comparisonMetrics = [
      'gdpGrowth', 'inflationRates', 'unemploymentRates', 'governmentDebt',
      'tradeBalance', 'gdpPerCapitaPPP', 'lifeExpectancy', 'internetUsers',
    ];
    const invertedMetrics = new Set(['inflationRates', 'unemploymentRates', 'governmentDebt']);
    return comparisonMetrics.map(mk => {
      const metric = getMetricByKey(mk);
      const countryVal = getLatestValue(mk);
      const peerValues: number[] = [];
      for (const peer of peers) {
        const series = (data as any)[mk] as CountryData[] | undefined;
        if (!series) continue;
        for (let i = series.length - 1; i >= 0; i--) {
          const v = Number(series[i][peer]);
          if (!isNaN(v) && v !== 0) { peerValues.push(v); break; }
        }
      }
      const avg = peerValues.length > 0 ? peerValues.reduce((a, b) => a + b, 0) / peerValues.length : null;
      const diff = countryVal !== null && avg !== null ? countryVal - avg : null;
      const isInverted = invertedMetrics.has(mk);
      const favorable = diff !== null ? (isInverted ? diff < 0 : diff > 0) : null;
      return { key: mk, label: metric?.label || mk, countryValue: countryVal, regionAvg: avg, diff, favorable };
    });
  }, [data, countryKey]);

  const dualAxisData = useMemo(() => {
    if (!data || !countryKey) return [];
    const yearMap: Record<number, Record<string, number>> = {};
    for (const mk of [dualMetricLeft, dualMetricRight]) {
      const series = (data as any)[mk] as CountryData[] | undefined;
      if (!series) continue;
      for (const row of series) {
        const yr = Number(row.year);
        const v = Number(row[countryKey]);
        if (!isNaN(v) && yr) {
          if (!yearMap[yr]) yearMap[yr] = { year: yr };
          yearMap[yr][mk] = v;
        }
      }
    }
    return Object.values(yearMap).sort((a, b) => (a.year as number) - (b.year as number));
  }, [data, countryKey, dualMetricLeft, dualMetricRight]);

  if (!countryKey) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${tc.bg} ${tc.text}`}>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Country Not Found</h1>
          <p className={tc.textSec}>The country &quot;{slug}&quot; was not recognized.</p>
          <a href="/" className="mt-4 inline-block text-blue-500 hover:underline">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${tc.bg}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className={tc.textSec}>Loading {displayName} data...</p>
        </div>
      </div>
    );
  }

  const metricColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#e60049', '#0bb4ff'];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${tc.bg} ${tc.text}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              {FlagComponent && <div className="w-16 h-11 rounded shadow overflow-hidden"><FlagComponent /></div>}
              <div>
                <h1 className="text-3xl font-bold">{displayName}</h1>
                <p className={tc.textSec}>Economic Profile & Indicators</p>
              </div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {HEADLINE_METRICS.map(mk => {
              const metric = getMetricByKey(mk);
              const val = getLatestValue(mk);
              const prev = getPreviousValue(mk);
              const trend = val !== null && prev !== null ? val - prev : null;
              return (
                <div key={mk} className={`p-4 rounded-lg border ${tc.card}`}>
                  <p className={`text-xs uppercase tracking-wider ${tc.textSec}`}>{metric?.label || mk}</p>
                  <p className="text-2xl font-bold mt-1">{val !== null ? formatMetricValue(mk, val) : 'N/A'}</p>
                  {trend !== null && (
                    <p className={`text-sm mt-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(2)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className={`rounded-xl border p-4 sm:p-6 mb-8 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
          <h2 className="text-lg sm:text-xl font-semibold mb-3">About Country Profiles</h2>
          <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            This page provides a comprehensive economic snapshot of {displayName}. The headline cards above show the
            most recent values for key indicators, with <strong>trend arrows</strong> (▲/▼) comparing the latest
            reading to the previous year. The radar chart visualizes how this country performs across multiple
            dimensions relative to the data range in our dataset, making it easy to spot strengths and weaknesses
            at a glance.
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Scroll down for detailed indicator cards, historical trend charts, and links to similar economies.
          </p>
        </div>

        {/* Economic Summary */}
        {economicSummary && (
          <div className={`rounded-xl border p-4 sm:p-6 mb-8 ${tc.card}`}>
            <h2 className="text-xl font-semibold mb-3">Economic Summary</h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {displayName} has{' '}
              {economicSummary.gdp !== null
                ? <>GDP growth of <strong>{economicSummary.gdp.toFixed(1)}%</strong></>
                : <>unavailable GDP data</>}
              {economicSummary.inflation !== null && (
                <>, {economicSummary.inflation < 3 ? 'moderate' : economicSummary.inflation < 6 ? 'elevated' : 'high'} inflation at <strong>{economicSummary.inflation.toFixed(1)}%</strong></>
              )}
              {economicSummary.debt !== null && (
                <>, a debt-to-GDP ratio of <strong>{economicSummary.debt.toFixed(0)}%</strong></>
              )}
              {economicSummary.unemployment !== null && (
                <>, and unemployment of <strong>{economicSummary.unemployment.toFixed(1)}%</strong></>
              )}
              . The economy shows <strong>{economicSummary.strength}</strong> growth relative to its peers.
            </p>
          </div>
        )}

        {/* Economic Health Score */}
        {healthScore && (
          <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
            <h2 className="text-xl font-semibold mb-4">Economic Health Score</h2>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative flex-shrink-0">
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: '180px',
                    height: '180px',
                    background: `conic-gradient(${
                      healthScore.score >= 70 ? '#22c55e' : healthScore.score >= 40 ? '#eab308' : '#ef4444'
                    } 0deg ${healthScore.score * 3.6}deg, ${isDarkMode ? '#374151' : '#e5e7eb'} ${healthScore.score * 3.6}deg 360deg)`,
                  }}
                >
                  <div
                    className={`rounded-full flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                    style={{ width: '140px', height: '140px' }}
                  >
                    <span className="text-4xl font-bold">{healthScore.score}</span>
                    <span className={`text-xs ${tc.textSec}`}>out of 100</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {healthScore.breakdown.map(b => {
                  const ratio = b.points / b.max;
                  return (
                    <div key={b.label} className={`flex items-center justify-between p-3 rounded-lg border ${tc.card}`}>
                      <span className={`text-sm ${tc.textSec}`}>{b.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${ratio * 100}%`,
                              backgroundColor: ratio >= 0.7 ? '#22c55e' : ratio >= 0.4 ? '#eab308' : '#ef4444',
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-10 text-right">{b.points}/{b.max}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Key Indicators */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Key Indicators</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {KEY_INDICATOR_METRICS.map(mk => {
              const metric = getMetricByKey(mk);
              const val = getLatestValue(mk);
              const prev = getPreviousValue(mk);
              const trend = val !== null && prev !== null ? val - prev : null;
              return (
                <div key={mk} className={`p-4 rounded-xl border ${tc.card}`}>
                  <p className={`text-xs uppercase tracking-wider mb-1 ${tc.textSec}`}>{metric?.label || mk}</p>
                  <p className="text-xl font-bold">{val !== null ? formatMetricValue(mk, val) : 'N/A'}</p>
                  {trend !== null && (
                    <span className={`text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(2)} vs prev
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Historical Trends */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-4">Historical Trends</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {METRIC_CATEGORIES.flatMap(c => c.metrics).slice(0, 20).map(m => (
              <button
                key={m.key}
                onClick={() => setSelectedMetrics(prev =>
                  prev.includes(m.key) ? prev.filter(k => k !== m.key) : prev.length < 5 ? [...prev, m.key] : prev
                )}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  selectedMetrics.includes(m.key)
                    ? 'bg-blue-500/20 border-blue-500 text-blue-500'
                    : isDarkMode ? 'border-gray-600 text-gray-400 hover:border-gray-500' : 'border-gray-300 text-gray-500 hover:border-gray-400'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tc.tooltip} />
                <Legend />
                {selectedMetrics.map((mk, i) => {
                  const metric = getMetricByKey(mk);
                  return (
                    <Line key={mk} type="monotone" dataKey={mk} name={metric?.label || mk}
                      stroke={metricColors[i % metricColors.length]} dot={false} strokeWidth={2} />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peer Comparison Table */}
        {peerComparisonData.length > 0 && (
          <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
            <h2 className="text-xl font-semibold mb-2">Peer Comparison</h2>
            <p className={`text-sm mb-4 ${tc.textSec}`}>
              {displayName} vs. regional average ({Object.entries(COUNTRY_REGIONS).find(([, c]) => c.includes(countryKey))?.[0] || 'Region'})
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left py-3 px-2 font-semibold">Metric</th>
                    <th className="text-right py-3 px-2 font-semibold">{displayName}</th>
                    <th className="text-right py-3 px-2 font-semibold">Regional Avg</th>
                    <th className="text-right py-3 px-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {peerComparisonData.map(row => (
                    <tr key={row.key} className={`border-b ${isDarkMode ? 'border-gray-700/50' : 'border-gray-100'}`}>
                      <td className="py-3 px-2 font-medium">{row.label}</td>
                      <td className="text-right py-3 px-2">
                        {row.countryValue !== null ? formatMetricValue(row.key, row.countryValue) : 'N/A'}
                      </td>
                      <td className={`text-right py-3 px-2 ${tc.textSec}`}>
                        {row.regionAvg !== null ? formatMetricValue(row.key, row.regionAvg) : 'N/A'}
                      </td>
                      <td className="text-right py-3 px-2">
                        {row.diff !== null && row.favorable !== null ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            row.favorable
                              ? (isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700')
                              : (isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700')
                          }`}>
                            {row.favorable ? '▲ Above' : '▼ Below'} avg
                          </span>
                        ) : (
                          <span className={tc.textMuted}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Multi-Metric Comparison (Dual Y-Axes) */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-4">Multi-Metric Comparison</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className={`text-sm font-medium ${tc.textSec}`}>Left Axis:</label>
              <select
                value={dualMetricLeft}
                onChange={e => setDualMetricLeft(e.target.value)}
                className={`px-3 py-1.5 rounded-lg border text-sm ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {METRIC_CATEGORIES.flatMap(c => c.metrics).map(m => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className={`text-sm font-medium ${tc.textSec}`}>Right Axis:</label>
              <select
                value={dualMetricRight}
                onChange={e => setDualMetricRight(e.target.value)}
                className={`px-3 py-1.5 rounded-lg border text-sm ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {METRIC_CATEGORIES.flatMap(c => c.metrics).map(m => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dualAxisData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke={metricColors[0]} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke={metricColors[1]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tc.tooltip} />
                <Legend />
                <Line
                  yAxisId="left" type="monotone" dataKey={dualMetricLeft}
                  name={getMetricByKey(dualMetricLeft)?.label || dualMetricLeft}
                  stroke={metricColors[0]} dot={false} strokeWidth={2}
                />
                <Line
                  yAxisId="right" type="monotone" dataKey={dualMetricRight}
                  name={getMetricByKey(dualMetricRight)?.label || dualMetricRight}
                  stroke={metricColors[1]} dot={false} strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Radar Chart */}
          <div className={`rounded-xl border p-6 ${tc.card}`}>
            <h2 className="text-xl font-semibold mb-4">Economic Radar</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke={tc.grid} />
                  <PolarAngleAxis dataKey="metric" stroke={tc.axis} tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} stroke={tc.grid} tick={{ fontSize: 9 }} />
                  <Radar name={displayName} dataKey="value" stroke={COUNTRY_COLORS[countryKey]} fill={COUNTRY_COLORS[countryKey]} fillOpacity={0.3} />
                  <Tooltip contentStyle={tc.tooltip} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Related Countries */}
          <div className={`rounded-xl border p-6 ${tc.card}`}>
            <h2 className="text-xl font-semibold mb-4">Related Countries</h2>
            <p className={`text-sm mb-4 ${tc.textSec}`}>Explore economies in the same region</p>
            <div className="grid grid-cols-2 gap-3">
              {relatedCountries.map(ck => {
                const FC = FLAG_MAP[ck];
                return (
                  <a key={ck} href={`/country/${COUNTRY_KEY_TO_SLUG[ck]}`}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors hover:border-blue-500 ${tc.card}`}>
                    {FC && <div className="w-8 h-5 rounded overflow-hidden shadow-sm"><FC /></div>}
                    <span className="text-sm font-medium">{COUNTRY_DISPLAY_NAMES[ck]}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
