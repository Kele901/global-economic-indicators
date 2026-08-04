'use client';

// Trade openness = (exports + imports) / GDP. Uses NE.TRD.GNFS.ZS
// directly from the World Bank. Charts the top-10 trading economies
// so you can see who is de-globalising (US, UK dip after 2022) and
// who is opening (Vietnam, Mexico climb).

import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { CountryData } from '../services/worldbank';
import { TRADE_COUNTRY_META } from '../services/tradeCurated';
import { useViewportSize } from '../hooks/useViewportSize';

interface Props {
  isDarkMode: boolean;
  tradeOpenness: CountryData[];
}

function shape(series: CountryData[], keys: string[], yearFrom = 1990) {
  if (!series || series.length === 0) return [];
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

export default function OpennessTrendChart({ isDarkMode, tradeOpenness }: Props) {
  const focus = useMemo(() => TRADE_COUNTRY_META.slice(0, 10), []);
  const wbKeys = focus.map(c => c.wbKey);
  const { isMobile } = useViewportSize();

  const data = useMemo(() => shape(tradeOpenness, wbKeys, 1990), [tradeOpenness, wbKeys]);

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: 6,
    color: isDarkMode ? '#f3f4f6' : '#111827',
    fontSize: 12,
  };

  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
      <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>
        Trade openness (exports + imports as % of GDP)
      </div>
      <p className={`text-sm mb-4 ${textSec}`}>
        The higher the ratio, the more integrated with the world economy. Singapore, Netherlands, and Vietnam sit at the top; the US and Japan at the bottom of the top-10.
      </p>
      <div className={isMobile ? 'h-[320px]' : 'h-[420px]'}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={isMobile ? { top: 8, right: 8, bottom: 8, left: 0 } : { top: 10, right: 20, bottom: 20, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="year" stroke={axis} tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis stroke={axis} tickFormatter={v => `${v}%`} tick={{ fontSize: isMobile ? 10 : 12 }} width={isMobile ? 40 : 60} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toFixed(0)}%`} />
            {!isMobile && <Legend wrapperStyle={{ fontSize: 11 }} />}
            {focus.map(meta => (
              <Line
                key={meta.iso3}
                type="monotone"
                dataKey={meta.wbKey}
                name={meta.name}
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
