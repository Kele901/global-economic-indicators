'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { fetchGlobalData, type CountryData } from '../services/worldbank';
import { ALL_METRICS, getMetricByKey } from '../utils/metricCategories';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES, type CountryKey } from '../utils/countryMappings';
import { pearsonCorrelation } from '../utils/correlationEngine';
import Breadcrumbs from '../components/Breadcrumbs';
import SocialShareMenu from '../components/SocialShareMenu';
import { slugify } from '../lib/share';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

type GlobalData = Awaited<ReturnType<typeof fetchGlobalData>>;

interface CountryPoint {
  country: string;
  displayName: string;
  x: number;
  y: number;
  correlation: number;
  n: number;
}

function alignedSeries(
  seriesA: CountryData[] | undefined,
  seriesB: CountryData[] | undefined,
  country: string,
  lag: number,
): { xs: number[]; ys: number[] } {
  if (!seriesA || !seriesB) return { xs: [], ys: [] };
  const mapB = new Map<number, number>();
  for (const row of seriesB) {
    const y = Number(row.year);
    const v = Number(row[country]);
    if (Number.isFinite(y) && Number.isFinite(v)) mapB.set(y, v);
  }
  const xs: number[] = [];
  const ys: number[] = [];
  for (const row of seriesA) {
    const y = Number(row.year);
    const v = Number(row[country]);
    if (!Number.isFinite(y) || !Number.isFinite(v)) continue;
    const yv = mapB.get(y + lag);
    if (yv === undefined) continue;
    xs.push(v);
    ys.push(yv);
  }
  return { xs, ys };
}

export default function CorrelationLabPage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const [data, setData] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [metricA, setMetricA] = useState('gdpGrowth');
  const [metricB, setMetricB] = useState('unemployment');
  const [lag, setLag] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchGlobalData()
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const seriesA = data ? (data as unknown as Record<string, CountryData[]>)[metricA] : undefined;
  const seriesB = data ? (data as unknown as Record<string, CountryData[]>)[metricB] : undefined;

  const perCountry: CountryPoint[] = useMemo(() => {
    if (!data || !seriesA || !seriesB) return [];
    const out: CountryPoint[] = [];
    for (const c of COUNTRY_KEYS) {
      const { xs, ys } = alignedSeries(seriesA, seriesB, c, lag);
      if (xs.length < 5) continue;
      const r = pearsonCorrelation(xs, ys);
      const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
      const meanY = ys.reduce((a, b) => a + b, 0) / ys.length;
      out.push({
        country: c,
        displayName: COUNTRY_DISPLAY_NAMES[c as CountryKey] ?? c,
        x: meanX,
        y: meanY,
        correlation: r,
        n: xs.length,
      });
    }
    return out;
  }, [data, seriesA, seriesB, lag]);

  const top10 = useMemo(() => (
    [...perCountry].sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)).slice(0, 10)
  ), [perCountry]);

  const overall = useMemo(() => {
    if (perCountry.length === 0) return { r: 0, n: 0 };
    const xs = perCountry.flatMap(p => [p.x]);
    const ys = perCountry.flatMap(p => [p.y]);
    return { r: pearsonCorrelation(xs, ys), n: perCountry.length };
  }, [perCountry]);

  const metricALabel = getMetricByKey(metricA)?.label ?? metricA;
  const metricBLabel = getMetricByKey(metricB)?.label ?? metricB;
  const scatterTitle = `Cross-country scatter: ${metricALabel} vs ${metricBLabel}`;
  const tableTitle = `Top-10 country correlations: ${metricALabel} vs ${metricBLabel}`;

  const bg = isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-900';
  const card = isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-white border-gray-200';
  const input = isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-300';

  return (
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs isDarkMode={isDarkMode} />
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Correlation lab</h1>
          <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Pick any two metrics, optionally lag one by N years, and see the Pearson correlation for every country in the dataset. Higher magnitude = stronger linear relationship. Positive = same direction, negative = opposite.
          </p>
        </header>

        <div className={`rounded-xl border p-4 sm:p-6 mb-6 ${card}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs mb-1">Metric A (leads)</label>
              <select value={metricA} onChange={e => setMetricA(e.target.value)}
                className={`w-full rounded-md px-2 py-1.5 text-sm border ${input}`}>
                {ALL_METRICS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Metric B (follows)</label>
              <select value={metricB} onChange={e => setMetricB(e.target.value)}
                className={`w-full rounded-md px-2 py-1.5 text-sm border ${input}`}>
                {ALL_METRICS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Lag (years, A → B)</label>
              <div className="flex items-center gap-2">
                <input type="range" min={-5} max={5} step={1} value={lag}
                  onChange={e => setLag(parseInt(e.target.value, 10))}
                  className="flex-1" />
                <span className="text-sm font-medium w-10 text-center tabular-nums">{lag >= 0 ? `+${lag}` : lag}</span>
              </div>
            </div>
            <div className="flex items-end">
              <div className={`text-xs w-full text-right ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {loading ? 'Loading data…' : `${perCountry.length} country pairs · overall r = ${overall.r.toFixed(2)}`}
              </div>
            </div>
          </div>
        </div>

        <div id={slugify(scatterTitle)} className={`rounded-xl border p-4 sm:p-6 mb-6 ${card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
            <h2 className="text-lg font-semibold">Cross-country scatter</h2>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <SocialShareMenu title={scatterTitle} isDarkMode={isDarkMode} />
            </div>
          </div>
          <p className={`text-xs mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            One point per country. X = mean of {metricALabel}, Y = mean of {metricBLabel}{lag ? ` (lagged ${lag > 0 ? `+${lag}` : lag} years)` : ''}.
          </p>
          <div className="h-[360px]">
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis type="number" dataKey="x" name={metricALabel} stroke={isDarkMode ? '#9ca3af' : '#6b7280'} tick={{ fontSize: 11 }} />
                <YAxis type="number" dataKey="y" name={metricBLabel} stroke={isDarkMode ? '#9ca3af' : '#6b7280'} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#111827' : '#fff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number | string) => (typeof v === 'number' ? v.toFixed(2) : v)}
                  labelFormatter={(_, payload) => payload && payload[0] ? (payload[0].payload as CountryPoint).displayName : ''} />
                <Scatter data={perCountry} fill={isDarkMode ? '#60a5fa' : '#2563eb'} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div id={slugify(tableTitle)} className={`rounded-xl border p-4 sm:p-6 mb-6 ${card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
            <h2 className="text-lg font-semibold">Top-10 country correlations (|r|)</h2>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <SocialShareMenu title={tableTitle} subject="dataset" isDarkMode={isDarkMode} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  <th className="text-left py-2 font-medium">Country</th>
                  <th className="text-right py-2 font-medium">Pearson r</th>
                  <th className="text-right py-2 font-medium">Sample</th>
                </tr>
              </thead>
              <tbody>
                {top10.map(row => (
                  <tr key={row.country} className={isDarkMode ? 'border-t border-gray-800' : 'border-t border-gray-100'}>
                    <td className="py-2">{row.displayName}</td>
                    <td className={`text-right tabular-nums py-2 font-semibold ${row.correlation >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {row.correlation >= 0 ? '+' : ''}{row.correlation.toFixed(2)}
                    </td>
                    <td className="text-right tabular-nums py-2">{row.n}</td>
                  </tr>
                ))}
                {top10.length === 0 && (
                  <tr><td colSpan={3} className={`py-4 text-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Not enough overlapping data for these metrics.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className={`text-[11px] mt-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Reminder: correlation ≠ causation. A high r just tells you two series moved together — not that one drove the other.
          </p>
        </div>
      </div>
    </div>
  );
}
