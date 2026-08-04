'use client';

// Line chart tracking % of electricity from renewables (EG.ELC.RNEW.ZS)
// over 2000-latest for a curated country roster. Same shape/coverage
// pattern as PerCapitaEmissionsChart.

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import type { CountryData } from '../services/worldbank';
import { CLIMATE_COUNTRY_META } from '../services/climateCurated';
import { useViewportSize } from '../hooks/useViewportSize';

interface Props {
  isDarkMode: boolean;
  elecFromRenewables: CountryData[];
}

// Focus on the transition frontrunners + laggards so the story is legible.
const TRANSITION_KEYS = ['Germany', 'UK', 'France', 'USA', 'China', 'India', 'Brazil', 'Australia', 'Japan', 'Poland'];

function shape(series: CountryData[], keys: string[], yearFrom = 2000) {
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

export default function RenewablesTransitionChart({ isDarkMode, elecFromRenewables }: Props) {
  const roster = useMemo(
    () => TRANSITION_KEYS
      .map(k => CLIMATE_COUNTRY_META.find(m => m.wbKey === k))
      .filter((m): m is (typeof CLIMATE_COUNTRY_META)[number] => Boolean(m)),
    [],
  );

  const data = useMemo(() => shape(elecFromRenewables, roster.map(r => r.wbKey), 2000), [elecFromRenewables, roster]);
  const { isMobile } = useViewportSize();

  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const tooltipStyle: React.CSSProperties = isDarkMode
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: 8 }
    : { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: 8 };
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  const hasData = data.some(row => roster.some(r => (row[r.wbKey] ?? 0) > 0));

  if (!hasData) {
    return (
      <div className={`rounded-lg border p-6 text-sm ${cardBg} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Renewable electricity share is temporarily unavailable — World Bank did not return data for the tracked countries.
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
      <div className="mb-4">
        <div className={`text-xs uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Renewable electricity share, 2000 → latest
        </div>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          The transition frontrunners (Germany, UK) vs the still-fossil economies (US, China, India, Poland). Reference line at 50% share.
        </p>
      </div>
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
            <YAxis
              stroke={axis}
              tickFormatter={v => `${v}%`}
              domain={[0, 100]}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 36 : 60}
            />
            <ReferenceLine y={50} stroke={isDarkMode ? '#f59e0b' : '#d97706'} strokeDasharray="4 4" />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: any, name: string) => {
                const meta = roster.find(s => s.wbKey === name);
                return [`${Number(v).toFixed(1)}%`, meta?.name ?? name];
              }}
            />
            {!isMobile && (
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value: string) => roster.find(s => s.wbKey === value)?.name ?? value}
              />
            )}
            {roster.map(meta => (
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
