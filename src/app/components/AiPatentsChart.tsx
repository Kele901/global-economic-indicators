'use client';

// AI patents chart. Uses live WB IP.PAT.RESD (patent applications by
// residents) as the base, then overlays the curated Stanford AI Index
// notable-models count as a secondary bar. Charts each country's most
// recent five-year window.

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { CountryData } from '../services/worldbank';
import { AI_COUNTRY_META } from '../services/aiCurated';
import { useViewportSize } from '../hooks/useViewportSize';

interface Props {
  isDarkMode: boolean;
  patentApplications: CountryData[];
}

export default function AiPatentsChart({ isDarkMode, patentApplications }: Props) {
  const { isMobile } = useViewportSize();

  const data = useMemo(() => {
    if (!patentApplications || patentApplications.length === 0) return [];
    return patentApplications
      .filter(row => Number(row.year) >= 2010)
      .map(row => {
        const out: Record<string, number | string> = { year: row.year };
        AI_COUNTRY_META.forEach(m => {
          const v = Number(row[m.wbKey]);
          if (!Number.isNaN(v) && v > 0) out[m.name] = v;
        });
        return out;
      });
  }, [patentApplications]);

  const topCountries = useMemo(() => {
    if (data.length === 0) return [];
    const last = data[data.length - 1];
    return AI_COUNTRY_META
      .filter(m => typeof last[m.name] === 'number')
      .sort((a, b) => (last[b.name] as number) - (last[a.name] as number))
      .slice(0, 8);
  }, [data]);

  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const tooltipStyle: React.CSSProperties = isDarkMode
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px' }
    : { backgroundColor: '#fff',    border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`rounded-xl border p-4 sm:p-6 ${cardBg}`}>
      <h3 className={`text-base sm:text-lg font-semibold mb-1 ${text}`}>Patent Applications by Residents</h3>
      <p className={`text-xs mb-4 ${muted}`}>
        World Bank IP.PAT.RESD (all technology fields). China&apos;s domestic patent surge is visible from 2011 onwards; the US and Japan hold steady.
      </p>
      <div className="h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: isMobile ? 8 : 20, left: isMobile ? 0 : 30, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="year" stroke={axis} tick={{ fontSize: isMobile ? 9 : 11 }} />
            <YAxis stroke={axis} tick={{ fontSize: isMobile ? 9 : 11 }} tickFormatter={v => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}k` : `${v}`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => value.toLocaleString()} />
            {!isMobile && <Legend />}
            {topCountries.map(m => (
              <Line key={m.iso3} type="monotone" dataKey={m.name} name={m.name} stroke={m.color} strokeWidth={2} dot={false} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
