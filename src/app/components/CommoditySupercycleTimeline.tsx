'use client';

import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceDot,
} from 'recharts';
import type { CommodityHistory } from '../services/commodities';
import { SUPERCYCLE_ERAS, type SupercycleEra } from '../data/resourceStaticData';

interface Props {
  isDarkMode: boolean;
  wti?: CommodityHistory;
  brent?: CommodityHistory;
}

export default function CommoditySupercycleTimeline({ isDarkMode, wti, brent }: Props) {
  const [activeEraId, setActiveEraId] = useState<string>(SUPERCYCLE_ERAS[SUPERCYCLE_ERAS.length - 1].id);

  const chartData = useMemo(() => {
    const wtiMap = new Map<number, number>();
    const brentMap = new Map<number, number>();
    wti?.annual.forEach(p => wtiMap.set(p.year, p.value));
    brent?.annual.forEach(p => brentMap.set(p.year, p.value));

    const years = new Set<number>();
    wtiMap.forEach((_, y) => years.add(y));
    brentMap.forEach((_, y) => years.add(y));

    return Array.from(years)
      .sort((a, b) => a - b)
      .map(year => ({
        year,
        wti: wtiMap.get(year) ?? null,
        brent: brentMap.get(year) ?? null,
      }));
  }, [wti, brent]);

  const activeEra: SupercycleEra = useMemo(
    () => SUPERCYCLE_ERAS.find(e => e.id === activeEraId) ?? SUPERCYCLE_ERAS[0],
    [activeEraId],
  );

  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const tooltipStyle: React.CSSProperties = isDarkMode
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: 8 }
    : { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: 8 };

  if (chartData.length === 0) {
    return (
      <div className={`h-96 rounded-lg border flex items-center justify-center ${
        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
      }`}>
        Oil price history unavailable.
      </div>
    );
  }

  // Only draw a peak-year marker if the timeline actually covers that year.
  const dataYears = new Set(chartData.map(d => d.year));
  const peakYear = dataYears.has(activeEra.peakYear) ? activeEra.peakYear : null;
  const peakPoint = peakYear ? chartData.find(d => d.year === peakYear) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className={`lg:col-span-2 rounded-lg border p-4 sm:p-6 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 30, left: 0 }}>
              <defs>
                <linearGradient id="wtiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="brentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#334155" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#334155" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} />
              <XAxis
                dataKey="year"
                stroke={axis}
                tick={{ fontSize: 11 }}
                label={{ value: 'Year', position: 'insideBottom', offset: -15, fill: axis, fontSize: 12 }}
              />
              <YAxis
                stroke={axis}
                tick={{ fontSize: 11 }}
                label={{ value: 'USD / barrel', angle: -90, position: 'insideLeft', offset: 10, fill: axis, fontSize: 12 }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: any, k: string) => [v == null ? '—' : `$${Number(v).toFixed(2)}`, k.toUpperCase()]}
              />
              <ReferenceArea
                x1={Math.max(activeEra.yearStart, chartData[0].year)}
                x2={Math.min(activeEra.yearEnd, chartData[chartData.length - 1].year)}
                fill={isDarkMode ? '#fbbf24' : '#fbbf24'}
                fillOpacity={0.15}
                stroke={isDarkMode ? '#f59e0b' : '#d97706'}
                strokeOpacity={0.4}
                strokeDasharray="4 4"
              />
              {peakPoint && (
                <ReferenceDot
                  x={peakPoint.year}
                  y={peakPoint.wti ?? peakPoint.brent ?? 0}
                  r={6}
                  fill="#d97706"
                  stroke={isDarkMode ? '#111827' : '#fff'}
                  strokeWidth={2}
                />
              )}
              <Area type="monotone" dataKey="wti" stroke="#0f172a" fill="url(#wtiGrad)" strokeWidth={2} name="WTI" />
              <Area type="monotone" dataKey="brent" stroke="#334155" fill="url(#brentGrad)" strokeWidth={2} name="Brent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SUPERCYCLE_ERAS.map(era => {
            const active = era.id === activeEraId;
            return (
              <button
                key={era.id}
                onClick={() => setActiveEraId(era.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? 'bg-amber-500 text-white border-amber-500'
                    : isDarkMode
                      ? 'bg-gray-900 text-gray-300 border-gray-700 hover:border-amber-500'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-amber-500'
                }`}
              >
                {era.yearStart}{era.yearEnd !== era.yearStart ? `–${era.yearEnd}` : ''} · {era.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`rounded-lg border p-5 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-baseline justify-between mb-2">
          <span className={`text-xs uppercase tracking-wider ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
            {activeEra.yearStart}{activeEra.yearEnd !== activeEra.yearStart ? `–${activeEra.yearEnd}` : ''}
          </span>
          <span className={`text-[11px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Peak: {activeEra.peakYear}
          </span>
        </div>
        <h4 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activeEra.label}</h4>
        <p className={`text-sm italic mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{activeEra.headline}</p>
        <p className={`text-sm leading-relaxed mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{activeEra.description}</p>

        {activeEra.winners.length > 0 && (
          <div className="mb-3">
            <div className={`text-[11px] uppercase tracking-wider mb-1 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Winners</div>
            <div className="flex flex-wrap gap-1">
              {activeEra.winners.map(w => (
                <span key={w} className={`text-xs px-2 py-0.5 rounded ${
                  isDarkMode ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                }`}>{w}</span>
              ))}
            </div>
          </div>
        )}

        {activeEra.losers.length > 0 && (
          <div>
            <div className={`text-[11px] uppercase tracking-wider mb-1 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>Losers</div>
            <div className="flex flex-wrap gap-1">
              {activeEra.losers.map(l => (
                <span key={l} className={`text-xs px-2 py-0.5 rounded ${
                  isDarkMode ? 'bg-rose-900/40 text-rose-300' : 'bg-rose-50 text-rose-700'
                }`}>{l}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
