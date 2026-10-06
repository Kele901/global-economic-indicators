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
import { SUPERCYCLE_ERAS, HISTORIC_OIL_PRICES, type SupercycleEra } from '../data/resourceStaticData';

interface Props {
  isDarkMode: boolean;
  wti?: CommodityHistory;
  brent?: CommodityHistory;
}

interface ChartRow {
  year: number;
  wti: number | null;
  brent: number | null;
  historic: number | null;
}

const SERIES_LABEL: Record<string, string> = {
  wti: 'WTI',
  brent: 'Brent',
  historic: 'BP benchmark',
};

export default function CommoditySupercycleTimeline({ isDarkMode, wti, brent }: Props) {
  const [activeEraId, setActiveEraId] = useState<string>(SUPERCYCLE_ERAS[SUPERCYCLE_ERAS.length - 1].id);

  const chartData: ChartRow[] = useMemo(() => {
    const wtiMap = new Map<number, number>();
    const brentMap = new Map<number, number>();
    wti?.annual.forEach(p => wtiMap.set(p.year, p.value));
    brent?.annual.forEach(p => brentMap.set(p.year, p.value));
    if (wtiMap.size === 0 && brentMap.size === 0) return [];

    const firstLive = Math.min(...Array.from(wtiMap.keys()), ...Array.from(brentMap.keys()));
    const historicMap = new Map<number, number>();
    HISTORIC_OIL_PRICES.forEach(p => {
      if (p.year < firstLive) historicMap.set(p.year, p.value);
    });
    // Join the historic line to the first live year so the chart has no gap.
    const joinValue = wtiMap.get(firstLive) ?? brentMap.get(firstLive);
    if (historicMap.size && joinValue != null) historicMap.set(firstLive, joinValue);

    const years = new Set<number>([...wtiMap.keys(), ...brentMap.keys(), ...historicMap.keys()]);
    return Array.from(years)
      .sort((a, b) => a - b)
      .map(year => ({
        year,
        wti: wtiMap.get(year) ?? null,
        brent: brentMap.get(year) ?? null,
        historic: historicMap.get(year) ?? null,
      }));
  }, [wti, brent]);

  const activeEra: SupercycleEra = useMemo(
    () => SUPERCYCLE_ERAS.find(e => e.id === activeEraId) ?? SUPERCYCLE_ERAS[0],
    [activeEraId],
  );

  const priceAt = (row: ChartRow | undefined) => (row ? row.wti ?? row.brent ?? row.historic : null);

  const eraStats = useMemo(() => {
    const byYear = new Map(chartData.map(r => [r.year, r]));
    const inEra = chartData.filter(r => r.year >= activeEra.yearStart && r.year <= activeEra.yearEnd && priceAt(r) != null);
    if (inEra.length === 0) return null;
    const before = priceAt(byYear.get(activeEra.yearStart - 1));
    let high = inEra[0], low = inEra[0];
    inEra.forEach(r => {
      if ((priceAt(r) ?? 0) > (priceAt(high) ?? 0)) high = r;
      if ((priceAt(r) ?? Infinity) < (priceAt(low) ?? Infinity)) low = r;
    });
    const end = priceAt(inEra[inEra.length - 1]);
    return {
      before,
      high: { year: high.year, value: priceAt(high)! },
      low: { year: low.year, value: priceAt(low)! },
      change: before && end ? ((end - before) / before) * 100 : null,
      endYear: inEra[inEra.length - 1].year,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData, activeEra]);

  const longRun = useMemo(() => {
    const valid = chartData.filter(r => priceAt(r) != null);
    if (valid.length < 2) return null;
    let peak = valid[0], trough = valid[0];
    valid.forEach(r => {
      if (priceAt(r)! > priceAt(peak)!) peak = r;
      if (priceAt(r)! < priceAt(trough)!) trough = r;
    });
    return { first: valid[0], last: valid[valid.length - 1], peak, trough };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData]);

  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const wtiColor = isDarkMode ? '#e2e8f0' : '#0f172a';
  const brentColor = isDarkMode ? '#94a3b8' : '#475569';
  const historicColor = '#d97706';
  const tooltipStyle: React.CSSProperties = isDarkMode
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: 8 }
    : { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: 8 };
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = 'text-gray-500';
  const insetBg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200';

  if (chartData.length === 0) {
    return (
      <div className={`h-96 rounded-lg border flex items-center justify-center ${
        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
      }`}>
        Oil price history unavailable.
      </div>
    );
  }

  const dataYears = new Set(chartData.map(d => d.year));
  const peakYear = dataYears.has(activeEra.peakYear) ? activeEra.peakYear : null;
  const peakPoint = peakYear ? chartData.find(d => d.year === peakYear) : null;
  const fmt = (v: number) => `$${v < 10 ? v.toFixed(2) : v.toFixed(0)}`;

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
                  <stop offset="5%" stopColor={wtiColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={wtiColor} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="brentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={brentColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={brentColor} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="historicGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={historicColor} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={historicColor} stopOpacity={0.02} />
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
                label={{ value: 'USD / barrel (annual avg)', angle: -90, position: 'insideLeft', offset: 10, fill: axis, fontSize: 12 }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: any, k: any) => [v == null ? '—' : `$${Number(v).toFixed(2)}`, SERIES_LABEL[String(k)] ?? String(k)]}
              />
              <ReferenceArea
                x1={Math.max(activeEra.yearStart, chartData[0].year)}
                x2={Math.min(activeEra.yearEnd, chartData[chartData.length - 1].year)}
                fill="#fbbf24"
                fillOpacity={0.15}
                stroke={isDarkMode ? '#f59e0b' : '#d97706'}
                strokeOpacity={0.4}
                strokeDasharray="4 4"
              />
              {peakPoint && (
                <ReferenceDot
                  x={peakPoint.year}
                  y={peakPoint.wti ?? peakPoint.brent ?? peakPoint.historic ?? 0}
                  r={6}
                  fill="#d97706"
                  stroke={isDarkMode ? '#111827' : '#fff'}
                  strokeWidth={2}
                />
              )}
              <Area type="monotone" dataKey="historic" stroke={historicColor} strokeDasharray="5 3" fill="url(#historicGrad)" strokeWidth={2} name="historic" connectNulls={false} isAnimationActive={false} />
              <Area type="monotone" dataKey="wti" stroke={wtiColor} fill="url(#wtiGrad)" strokeWidth={2} name="wti" isAnimationActive={false} />
              <Area type="monotone" dataKey="brent" stroke={brentColor} fill="url(#brentGrad)" strokeWidth={2} name="brent" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={`flex flex-wrap gap-4 text-[11px] mt-1 ${textMuted}`}>
          <span className="flex items-center gap-1.5"><span className="w-4 h-0.5" style={{ backgroundColor: wtiColor }} />WTI (FRED, from 1986)</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-0.5" style={{ backgroundColor: brentColor }} />Brent (FRED, from 1987)</span>
          <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed" style={{ borderColor: historicColor }} />BP benchmark 1970–85</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SUPERCYCLE_ERAS.map(era => {
            const active = era.id === activeEraId;
            return (
              <button
                key={era.id}
                onClick={() => setActiveEraId(era.id)}
                aria-pressed={active}
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

        {longRun && (
          <p className={`text-xs mt-4 leading-relaxed ${textMuted}`}>
            From {fmt(priceAt(longRun.first)!)} in {longRun.first.year} to {fmt(priceAt(longRun.last)!)} in {longRun.last.year} (nominal
            annual averages). The record annual average was {fmt(priceAt(longRun.peak)!)} in {longRun.peak.year}; the July 2008 daily
            spike to $147 and the April 2020 negative print are smoothed away at this resolution. In today&apos;s dollars the 1980
            peak would be roughly $140 — comparable to 2008.
          </p>
        )}
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
        <h4 className={`text-lg font-semibold mb-1 ${textPrimary}`}>{activeEra.label}</h4>
        <p className={`text-sm italic mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{activeEra.headline}</p>

        {eraStats && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { k: 'Year before', v: eraStats.before != null ? fmt(eraStats.before) : '—', s: String(activeEra.yearStart - 1) },
              { k: 'Era high', v: fmt(eraStats.high.value), s: String(eraStats.high.year) },
              { k: 'Era low', v: fmt(eraStats.low.value), s: String(eraStats.low.year) },
              {
                k: 'Net change',
                v: eraStats.change != null ? `${eraStats.change >= 0 ? '+' : ''}${eraStats.change.toFixed(0)}%` : '—',
                s: `${activeEra.yearStart - 1}→${eraStats.endYear}`,
                tone: eraStats.change == null ? '' : eraStats.change >= 0 ? 'text-emerald-500' : 'text-rose-500',
              },
            ].map(t => (
              <div key={t.k} className={`rounded-md border px-3 py-2 ${insetBg}`}>
                <div className={`text-[10px] uppercase tracking-wider ${textMuted}`}>{t.k}</div>
                <div className={`text-base font-semibold tabular-nums ${t.tone || textPrimary}`}>{t.v}</div>
                <div className={`text-[10px] ${textMuted}`}>{t.s} · annual avg</div>
              </div>
            ))}
          </div>
        )}

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
