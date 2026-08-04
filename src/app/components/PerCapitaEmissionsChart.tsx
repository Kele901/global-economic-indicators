'use client';

// Multi-country line chart contrasting absolute CO2 (kt) with per-capita
// CO2 (tCO2/person) for the top emitters. Mirrors the SuperpowerComparison
// pattern: single toggle, coverage guard, connectNulls for uneven history.

import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { CountryData } from '../services/worldbank';
import { CLIMATE_COUNTRY_META } from '../services/climateCurated';
import { useViewportSize } from '../hooks/useViewportSize';

interface Props {
  isDarkMode: boolean;
  co2EmissionsKt: CountryData[];       // EN.ATM.CO2E.KT — absolute (kt)
  co2EmissionsPerCapita: CountryData[]; // EN.ATM.CO2E.PC — per capita
}

type Mode = 'absolute' | 'per_capita';

function shape(series: CountryData[], keys: string[], yearFrom = 1990) {
  return series
    .filter(row => Number(row.year) >= yearFrom)
    .map(row => {
      const out: Record<string, number | undefined> = { year: Number(row.year) };
      keys.forEach(k => {
        const v = Number(row[k]);
        out[k] = !Number.isNaN(v) && v > 0 ? v : undefined;
      });
      return out;
    });
}

function formatGt(kt: number): string {
  const gt = kt / 1_000_000;
  if (gt >= 1) return `${gt.toFixed(1)} Gt`;
  return `${(kt / 1000).toFixed(0)} Mt`;
}

export default function PerCapitaEmissionsChart({
  isDarkMode,
  co2EmissionsKt,
  co2EmissionsPerCapita,
}: Props) {
  const emitters = useMemo(() => CLIMATE_COUNTRY_META.slice(0, 10), []);
  const wbKeys = emitters.map(c => c.wbKey);

  const MIN_COVERAGE = 3;
  const absoluteCoverage = useMemo(() => {
    if (!co2EmissionsKt || co2EmissionsKt.length === 0) return 0;
    const covered = new Set<string>();
    for (const row of co2EmissionsKt) {
      for (const key of wbKeys) {
        const v = Number(row[key]);
        if (!Number.isNaN(v) && v > 0) covered.add(key);
      }
    }
    return covered.size;
  }, [co2EmissionsKt, wbKeys]);
  const absoluteHasData = absoluteCoverage >= MIN_COVERAGE;

  const [mode, setMode] = useState<Mode>(absoluteHasData ? 'absolute' : 'per_capita');
  const { isMobile } = useViewportSize();

  const data = useMemo(() => {
    const source = mode === 'absolute' ? co2EmissionsKt : co2EmissionsPerCapita;
    return shape(source, wbKeys, 1990);
  }, [mode, co2EmissionsKt, co2EmissionsPerCapita, wbKeys]);

  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const tooltipStyle: React.CSSProperties = isDarkMode
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: 8 }
    : { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: 8 };
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const yFormatter = mode === 'absolute' ? formatGt : (v: number) => `${v.toFixed(1)} t`;
  const tooltipFormatter = mode === 'absolute'
    ? (v: number) => formatGt(v)
    : (v: number) => `${v.toFixed(2)} tCO₂/person`;

  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className={`text-xs uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Top 10 emitters · absolute vs per-capita
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Absolute emissions show who is warming the planet. Per-capita show responsibility per citizen.
          </p>
        </div>
        <div
          role="group"
          aria-label="Display mode for CO2 emissions"
          className={`inline-flex rounded-md border text-xs overflow-hidden ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <button
            type="button"
            onClick={() => absoluteHasData && setMode('absolute')}
            disabled={!absoluteHasData}
            aria-pressed={mode === 'absolute'}
            aria-label={absoluteHasData ? 'Show absolute CO2 emissions in kilotonnes' : 'Absolute view unavailable — showing per-capita'}
            title={absoluteHasData
              ? undefined
              : `Absolute CO2 series unavailable — only ${absoluteCoverage}/${wbKeys.length} countries returned data`}
            className={`px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset ${!absoluteHasData
              ? (isDarkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed')
              : mode === 'absolute'
                ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700')
                : (isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50')}`}
          >
            Absolute
          </button>
          <button
            type="button"
            onClick={() => setMode('per_capita')}
            aria-pressed={mode === 'per_capita'}
            aria-label="Show per-capita CO2 emissions in tonnes per person"
            className={`px-3 py-1.5 border-l focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${
              mode === 'per_capita'
                ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700')
                : (isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50')
            }`}
          >
            Per capita
          </button>
        </div>
      </div>

      {!absoluteHasData && (
        <div className={`mb-3 text-xs rounded-md px-3 py-2 border ${
          isDarkMode
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          Showing per-capita view: World Bank returned absolute CO₂ data for only {absoluteCoverage} of {wbKeys.length} top emitters.
        </div>
      )}

      <div className={isMobile ? 'h-[320px]' : 'h-[420px]'}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={
              isMobile
                ? { top: 8, right: 8, bottom: 8, left: 0 }
                : { top: 10, right: 20, bottom: 20, left: 10 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="year" stroke={axis} tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis stroke={axis} tickFormatter={yFormatter} tick={{ fontSize: isMobile ? 10 : 12 }} width={isMobile ? 40 : 60} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: any, name: string) => {
                const meta = emitters.find(s => s.wbKey === name);
                return [tooltipFormatter(Number(v)), meta?.name ?? name];
              }}
            />
            {!isMobile && (
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value: string) => emitters.find(s => s.wbKey === value)?.name ?? value}
              />
            )}
            {emitters.map(meta => (
              <Line
                key={meta.iso3}
                type="monotone"
                dataKey={meta.wbKey}
                stroke={meta.color}
                strokeWidth={isMobile ? 1.5 : 2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
