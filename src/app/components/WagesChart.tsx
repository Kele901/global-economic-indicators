'use client';

// Chapter 2 for /labor-ledger. Curated ILO median hourly wages (USD PPP, 2023)
// and real wage growth 2019-2023, joined with live World Bank CPI inflation so
// each country's real change can be split into what prices did and what cash
// pay must have done to get there.
//
// Rendered as an HTML ranking so every row carries a flag, full name, wage and
// growth figure; Recharts only draws the inflation-vs-real-growth scatter.

import { useMemo, useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import type { CountryData } from '../services/worldbank';
import { WAGES_2023, LABOR_COUNTRY_META } from '../services/laborCurated';
import { COUNTRY_DISPLAY_NAMES, ISO3_TO_COUNTRY, type CountryKey } from '../utils/countryMappings';
import { useChartTheme } from '../utils/chartTheme';
import { medianOf } from '../lib/gini';
import ChartCard from './charts/ChartCard';
import ChartA11yCaption from './ChartA11yCaption';
import CountryFlag from './CountryFlag';

interface Props {
  isDarkMode: boolean;
  shareTitle?: string;
  inflationRates?: CountryData[];
}

const CARD_TITLE = 'Median Hourly Wage, 2023';
const INFLATION_YEARS = [2020, 2021, 2022, 2023];
const GROW = '#10b981';
const SHRINK = '#ef4444';

type SortId = 'wage' | 'growth' | 'inflation' | 'name';
const SORTS: { id: SortId; label: string }[] = [
  { id: 'wage', label: 'Highest wage' },
  { id: 'growth', label: 'Real growth' },
  { id: 'inflation', label: 'Inflation 2020–23' },
  { id: 'name', label: 'A–Z' },
];

interface Row {
  code: string;
  key: CountryKey | undefined;
  name: string;
  wage: number;
  growth: number;
  inflation: number | null;
  cash: number | null;
}

const signed = (v: number, digits = 1) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(digits)}`;
const growthColor = (g: number) => (g >= 0 ? GROW : SHRINK);

function Flag({ row, className }: { row: Row; className: string }) {
  return row.key
    ? <CountryFlag countryKey={row.key} className={className} title={row.name} />
    : <span className={`${className} bg-gray-300`} aria-hidden="true" />;
}

export default function WagesChart({ isDarkMode, inflationRates, shareTitle }: Props) {
  const theme = useChartTheme(isDarkMode);
  const [sort, setSort] = useState<SortId>('wage');
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);

  const rows = useMemo<Row[]>(() => {
    const byYear = new Map((inflationRates ?? []).map(r => [Number(r.year), r]));
    return WAGES_2023.map(r => {
      const key = ISO3_TO_COUNTRY[r.code];
      let inflation: number | null = null;
      if (key) {
        const rates = INFLATION_YEARS.map(y => Number(byYear.get(y)?.[key]));
        if (rates.every(v => Number.isFinite(v))) {
          inflation = (rates.reduce((acc, v) => acc * (1 + v / 100), 1) - 1) * 100;
        }
      }
      const growth = r.realWageGrowth2019to2023Pct;
      return {
        code: r.code,
        key,
        name: (key && COUNTRY_DISPLAY_NAMES[key]) ?? LABOR_COUNTRY_META.find(m => m.code === r.code)?.name ?? r.code,
        wage: r.medianHourlyUsdPpp,
        growth,
        inflation,
        cash: inflation != null ? ((1 + growth / 100) * (1 + inflation / 100) - 1) * 100 : null,
      };
    });
  }, [inflationRates]);

  const stats = useMemo(() => {
    const byWage = [...rows].sort((a, b) => b.wage - a.wage);
    const byGrowth = [...rows].sort((a, b) => b.growth - a.growth);
    const top = byWage[0]!;
    const bottom = byWage[byWage.length - 1]!;
    const us = rows.find(r => r.code === 'USA');
    const withInflation = rows.filter(r => r.inflation != null);
    return {
      top,
      bottom,
      us,
      median: medianOf(rows.map(r => r.wage))!,
      medianGrowth: medianOf(rows.map(r => r.growth))!,
      cuts: rows.filter(r => r.growth < 0).length,
      bestGrowth: byGrowth[0]!,
      worstGrowth: byGrowth[byGrowth.length - 1]!,
      byGrowth,
      withInflation,
      maxAbsGrowth: Math.max(...rows.map(r => Math.abs(r.growth))),
      scaleMax: Math.ceil(top.wage / 5) * 5,
    };
  }, [rows]);

  const visible = useMemo(() => {
    const by: Record<SortId, (a: Row, b: Row) => number> = {
      wage: (a, b) => b.wage - a.wage,
      growth: (a, b) => b.growth - a.growth,
      inflation: (a, b) => (b.inflation ?? -Infinity) - (a.inflation ?? -Infinity),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return [...rows].sort(by[sort]);
  }, [rows, sort]);

  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const strong = isDarkMode ? 'text-white' : 'text-gray-900';
  const body = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const subtle = isDarkMode ? 'bg-gray-700/40 border-gray-700' : 'bg-gray-50 border-gray-200';
  const border = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const track = isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100';
  const selectCls = `text-xs rounded border px-2 py-1 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'}`;
  const tooltipCls = `rounded-lg border px-3 py-2 text-xs shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-800'}`;

  const selected = rows.find(r => r.code === (hovered ?? pinned)) ?? visible[0]!;
  const pctOf = (v: number) => `${(v / stats.scaleMax) * 100}%`;
  const step = stats.scaleMax > 20 ? 5 : 2;
  const ticks = Array.from({ length: stats.scaleMax / step + 1 }, (_, i) => i * step);
  const gridCols = 'grid-cols-[1.5rem_minmax(6.5rem,9.5rem)_1fr_4rem_4rem]';
  const hasInflation = stats.withInflation.length > 0;

  const tiles = [
    { label: 'Highest median wage', value: `$${stats.top.wage.toFixed(1)}`, detail: `${stats.top.name} · per hour, PPP`, color: GROW },
    { label: 'Lowest', value: `$${stats.bottom.wage.toFixed(1)}`, detail: `${stats.bottom.name} · ${Math.round(stats.top.wage / stats.bottom.wage)}× gap to the top`, color: SHRINK },
    { label: 'Roster median', value: `$${stats.median.toFixed(1)}`, detail: `Median real growth ${signed(stats.medianGrowth)}% since 2019`, color: theme.axis },
    { label: 'Real pay cuts', value: `${stats.cuts} of ${rows.length}`, detail: `Worst ${stats.worstGrowth.name} ${signed(stats.worstGrowth.growth)}% · best ${stats.bestGrowth.name} ${signed(stats.bestGrowth.growth)}%`, color: '#f59e0b' },
  ];

  const usRatio = stats.us && selected.code !== 'USA' ? selected.wage / stats.us.wage : null;

  const inflationTicks = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
  const inflations = stats.withInflation.map(r => Math.max(1, r.inflation!));
  const xMin = [...inflationTicks].reverse().find(t => t <= Math.min(...inflations, 10)) ?? 1;
  const xMax = inflationTicks.find(t => t >= Math.max(...inflations, 10)) ?? 1000;
  const xTicks = inflationTicks.filter(t => t >= xMin && t <= xMax);
  const yLo = Math.min(-5, Math.floor((stats.worstGrowth.growth - 1) / 5) * 5);
  const yHi = Math.max(5, Math.ceil((stats.bestGrowth.growth + 1) / 5) * 5);
  const yTicks = Array.from({ length: (yHi - yLo) / 5 + 1 }, (_, i) => yLo + i * 5);
  const byInflation = [...stats.withInflation].sort((a, b) => b.inflation! - a.inflation!);
  const labelled = new Set([
    ...stats.byGrowth.slice(0, 3).map(r => r.code),
    ...stats.byGrowth.slice(-3).map(r => r.code),
    ...byInflation.slice(0, 2).map(r => r.code),
    ...byInflation.slice(-1).map(r => r.code),
    selected.code,
  ]);

  return (
    <ChartCard
      isDarkMode={isDarkMode}
      title={CARD_TITLE}
      subtitle={`Typical (median) pay per hour for ${rows.length} economies in purchasing-power dollars, coloured by whether it bought more or less in 2023 than in 2019.`}
      shareTitle={shareTitle}
      height="h-auto"
      actions={
        <label className={`inline-flex items-center gap-1.5 text-xs ${muted}`} data-share-exclude>
          Sort
          <select value={sort} onChange={e => setSort(e.target.value as SortId)} className={selectCls} aria-label="Sort order">
            {SORTS.filter(s => s.id !== 'inflation' || hasInflation).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      }
      caption={
        <ChartA11yCaption
          title="Median hourly wage 2023, USD PPP"
          unit=" USD"
          precision={1}
          rows={rows.map(r => ({ label: `${r.name} (real growth 2019–2023 ${signed(r.growth)}%)`, value: r.wage }))}
          extra={`Roster median $${stats.median.toFixed(1)} an hour; real wages fell in ${stats.cuts} of ${rows.length} economies.`}
        />
      }
      footnote={
        <>
          Curated ILO Global Wage Report 2024: median hourly earnings of employees in 2023, converted at purchasing-power
          parity, and cumulative real wage growth 2019–2023.
          {hasInflation && (
            <> Inflation is live World Bank FP.CPI.TOTL.ZG, compounded over 2020–2023; implied cash growth combines it
            with the ILO real figure and is an estimate, since the ILO deflates with national CPIs that can differ from the
            World Bank series.</>
          )}
          {' '}Medians describe employees only, so self-employed and informal workers — the majority in India and
          Nigeria — are not reflected.
        </>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {tiles.map(t => (
          <div key={t.label} className={`rounded-lg border border-t-2 p-3 ${subtle}`} style={{ borderTopColor: t.color }}>
            <div className={`text-[11px] uppercase tracking-wide ${muted}`}>{t.label}</div>
            <div className={`text-2xl font-bold tabular-nums mt-0.5 ${strong}`}>{t.value}</div>
            <div className={`text-xs ${muted}`}>{t.detail}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 min-w-0">
          <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] mb-2 ${muted}`}>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2.5 rounded-sm" style={{ backgroundColor: GROW }} />Real wages grew 2019–23</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2.5 rounded-sm" style={{ backgroundColor: SHRINK }} />Real wages fell</span>
            <span className="inline-flex items-center gap-1.5"><span className={`w-px h-3 border-l-2 border-dashed ${isDarkMode ? 'border-gray-400' : 'border-gray-500'}`} />Median ${stats.median.toFixed(1)}</span>
            <span className="ml-auto hidden sm:inline">Click a row to pin it</span>
          </div>

          <div className={`grid ${gridCols} gap-x-2 items-end mb-1`}>
            <span />
            <span className={`text-[10px] uppercase tracking-wide ${muted}`}>Country</span>
            <div className="relative h-4">
              {ticks.map(v => (
                <span key={v} className={`absolute text-[10px] tabular-nums -translate-x-1/2 ${muted}`} style={{ left: pctOf(v) }}>${v}</span>
              ))}
            </div>
            <span className={`text-[10px] uppercase tracking-wide text-right ${muted}`}>Per hour</span>
            <span className={`text-[10px] uppercase tracking-wide text-right ${muted}`}>Real Δ</span>
          </div>

          <div className="relative">
            <div className={`absolute inset-y-0 grid ${gridCols} gap-x-2 w-full pointer-events-none`} aria-hidden="true">
              <span /><span />
              <div className="relative">
                {ticks.map(v => (
                  <span key={v} className={`absolute inset-y-0 border-l border-dashed ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} style={{ left: pctOf(v) }} />
                ))}
                <span className={`absolute inset-y-0 border-l-2 border-dashed ${isDarkMode ? 'border-gray-400' : 'border-gray-500'}`} style={{ left: pctOf(stats.median) }} />
              </div>
              <span /><span />
            </div>

            <ol className="relative">
              {visible.map((r, i) => {
                const active = selected.code === r.code && (hovered === r.code || pinned === r.code);
                return (
                  <li
                    key={r.code}
                    onMouseEnter={() => setHovered(r.code)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setPinned(pinned === r.code ? null : r.code)}
                    title={`${r.name}: $${r.wage.toFixed(2)} an hour (PPP, 2023); real wages ${signed(r.growth)}% since 2019${r.inflation != null ? `, prices ${signed(r.inflation, 0)}%` : ''}.`}
                    className={`grid ${gridCols} gap-x-2 items-center h-[26px] rounded cursor-pointer transition-colors ${
                      active ? (isDarkMode ? 'bg-gray-700/60' : 'bg-gray-100') : isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'
                    } ${pinned === r.code ? 'ring-1 ring-blue-500/40' : ''}`}
                  >
                    <span className={`text-[10px] tabular-nums text-right ${muted}`}>{i + 1}</span>
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Flag row={r} className="w-4 h-3 shrink-0 rounded-[2px]" />
                      <span className={`text-xs truncate ${active ? `font-semibold ${strong}` : isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{r.name}</span>
                    </span>
                    <div className={`relative h-4 rounded-sm ${track}`}>
                      <div className="absolute inset-y-0 left-0 rounded-sm" style={{ width: pctOf(r.wage), backgroundColor: growthColor(r.growth), opacity: active ? 1 : 0.85 }} />
                    </div>
                    <span className={`text-xs tabular-nums text-right font-semibold ${strong}`}>
                      ${r.wage.toFixed(1)}
                    </span>
                    <span className="text-[11px] tabular-nums text-right font-medium" style={{ color: growthColor(r.growth) }}>
                      {r.growth >= 0 ? '▲' : '▼'} {Math.abs(r.growth).toFixed(1)}%
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className={`grid ${gridCols} gap-x-2 mt-1`}>
            <span /><span />
            <span className={`text-[10px] text-center ${muted}`}>Median hourly wage, USD at purchasing-power parity (2023)</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`rounded-lg border p-3 ${subtle}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <Flag row={selected} className="w-5 h-3.5 rounded-[2px] shrink-0" />
              <span className={`text-sm font-semibold ${strong}`}>{selected.name}</span>
              <span className={`ml-auto text-[11px] ${muted}`}>{pinned === selected.code ? 'pinned' : 'hover or click a row'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 my-2">
              <div>
                <div className={`text-[10px] uppercase tracking-wide ${muted}`}>Per hour</div>
                <div className={`text-lg font-bold tabular-nums ${strong}`}>${selected.wage.toFixed(1)}</div>
              </div>
              <div>
                <div className={`text-[10px] uppercase tracking-wide ${muted}`}>Full-time year</div>
                <div className={`text-lg font-bold tabular-nums ${strong}`}>${Math.round((selected.wage * 2000) / 1000)}k</div>
              </div>
              <div>
                <div className={`text-[10px] uppercase tracking-wide ${muted}`}>To earn $100</div>
                <div className={`text-lg font-bold tabular-nums ${strong}`}>{(100 / selected.wage).toFixed(1)}h</div>
              </div>
            </div>
            <div className={`text-[11px] mb-3 ${muted}`}>
              {usRatio != null
                ? `${Math.round(usRatio * 100)}% of the US median ($${stats.us!.wage.toFixed(1)}) · `
                : ''}
              {signed((selected.wage / stats.median - 1) * 100, 0)}% vs roster median
              {' '}· full-time year assumes 2,000 hours
            </div>

            <div className={`text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${muted}`}>2019 → 2023</div>
            {selected.inflation != null && selected.cash != null ? (
              <div className="space-y-1.5">
                {[
                  { label: 'Prices', value: selected.inflation, color: '#f59e0b' },
                  { label: 'Cash pay (implied)', value: selected.cash, color: theme.palette.info },
                  { label: 'Real pay', value: selected.growth, color: growthColor(selected.growth) },
                ].map(b => {
                  const max = Math.max(Math.abs(selected.inflation!), Math.abs(selected.cash!), Math.abs(selected.growth), 1);
                  return (
                    <div key={b.label} className="grid grid-cols-[6.5rem_1fr_3.5rem] items-center gap-2 text-[11px]">
                      <span className={body}>{b.label}</span>
                      <div className={`relative h-2 rounded-full ${track}`}>
                        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(Math.abs(b.value) / max) * 100}%`, backgroundColor: b.color }} />
                      </div>
                      <span className="tabular-nums text-right font-semibold" style={{ color: b.color }}>{signed(b.value, Math.abs(b.value) >= 100 ? 0 : 1)}%</span>
                    </div>
                  );
                })}
                <p className={`text-[11px] leading-relaxed pt-1 ${body}`}>
                  {selected.growth >= 0
                    ? `Cash pay rose roughly ${selected.cash.toFixed(0)}%, outpacing prices, so a typical hour of work bought ${selected.growth.toFixed(1)}% more in 2023.`
                    : `Cash pay rose roughly ${Math.max(0, selected.cash).toFixed(0)}% but prices rose ${selected.inflation.toFixed(0)}%, so a typical hour of work bought ${Math.abs(selected.growth).toFixed(1)}% less in 2023.`}
                </p>
              </div>
            ) : (
              <p className={`text-[11px] ${body}`}>
                Real wages {selected.growth >= 0 ? 'rose' : 'fell'} {Math.abs(selected.growth).toFixed(1)}%.
                Live inflation data is not available to split this into prices and cash pay.
              </p>
            )}
          </div>

          <div className={`rounded-lg border p-3 ${subtle}`}>
            <div className={`text-sm font-semibold ${strong}`}>Real wage growth, 2019–2023</div>
            <p className={`text-[11px] mb-2 ${muted}`}>What a typical hour of pay buys, compared with 2019.</p>
            <ul className="space-y-0.5">
              {stats.byGrowth.map(r => {
                const w = (Math.abs(r.growth) / stats.maxAbsGrowth) * 50;
                return (
                  <li
                    key={r.code}
                    onMouseEnter={() => setHovered(r.code)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setPinned(pinned === r.code ? null : r.code)}
                    className={`grid grid-cols-[5.5rem_1fr_2.75rem] items-center gap-2 text-[11px] h-[17px] rounded cursor-pointer ${selected.code === r.code ? (isDarkMode ? 'bg-gray-700/60' : 'bg-white') : ''}`}
                  >
                    <span className={`truncate ${selected.code === r.code ? `font-semibold ${strong}` : body}`}>{r.name}</span>
                    <div className="relative h-2.5">
                      <span className={`absolute inset-y-0 left-1/2 border-l ${isDarkMode ? 'border-gray-500' : 'border-gray-300'}`} />
                      <span
                        className="absolute inset-y-0 rounded-sm"
                        style={{
                          left: r.growth >= 0 ? '50%' : `${50 - w}%`,
                          width: `${w}%`,
                          backgroundColor: growthColor(r.growth),
                        }}
                      />
                    </div>
                    <span className="tabular-nums text-right font-medium" style={{ color: growthColor(r.growth) }}>{signed(r.growth)}%</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {hasInflation && (
        <div className={`mt-6 pt-5 border-t ${border}`}>
          <div className={`text-sm font-semibold ${strong}`}>Did inflation eat the raise?</div>
          <p className={`text-xs mt-0.5 mb-3 max-w-3xl ${body}`}>
            Cumulative price rises over 2020–2023 against real wage growth. Points below the zero line are economies where
            pay failed to keep up with prices. The price axis is logarithmic so the highest-inflation economies do not
            squash the rest; hover a bubble for any country not labelled.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 h-[360px] flex flex-col">
              <span className={`text-[10px] ${muted}`}>↑ Real wage growth 2019–2023</span>
              <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 12, right: 24, bottom: 28, left: 0 }}>
                  <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="inflation"
                    scale="log"
                    domain={[xMin, xMax]}
                    ticks={xTicks}
                    allowDataOverflow
                    tick={{ fontSize: 11, fill: theme.axis }}
                    stroke={theme.axis}
                    tickFormatter={v => `${v}%`}
                    label={{ value: 'Cumulative inflation 2020–2023 (log scale)', position: 'bottom', offset: 10, fill: theme.axis, fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="growth"
                    domain={[yLo, yHi]}
                    ticks={yTicks}
                    tick={{ fontSize: 11, fill: theme.axis }}
                    stroke={theme.axis}
                    width={44}
                    tickFormatter={v => `${v > 0 ? '+' : ''}${v}%`}
                  />
                  <ReferenceLine y={0} stroke={theme.axis} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const r = payload[0]!.payload as Row;
                      return (
                        <div className={tooltipCls}>
                          <div className="font-semibold mb-0.5">{r.name}</div>
                          <div>Prices {signed(r.inflation!, 0)}%</div>
                          {r.cash != null && <div>Cash pay ≈ {signed(r.cash, 0)}%</div>}
                          <div style={{ color: growthColor(r.growth) }}>Real pay {signed(r.growth)}%</div>
                          <div className={muted}>${r.wage.toFixed(1)} an hour</div>
                        </div>
                      );
                    }}
                  />
                  <Scatter
                    data={stats.withInflation}
                    isAnimationActive={false}
                    onMouseEnter={(p: { payload?: Row }) => p.payload && setHovered(p.payload.code)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={(p: { payload?: Row }) => p.payload && setPinned(pinned === p.payload.code ? null : p.payload.code)}
                    shape={(props: unknown) => {
                      const { cx, cy, payload } = props as { cx?: number; cy?: number; payload?: Row };
                      if (cx == null || cy == null || !payload) return <g />;
                      const isSel = payload.code === selected.code;
                      const radius = 4 + Math.sqrt(payload.wage) * 0.9;
                      return (
                        <g style={{ cursor: 'pointer' }}>
                          <circle cx={cx} cy={cy} r={isSel ? radius + 2 : radius} fill={growthColor(payload.growth)} fillOpacity={isSel ? 0.95 : 0.7} stroke={isSel ? (isDarkMode ? '#fff' : '#111827') : isDarkMode ? '#1f2937' : '#fff'} strokeWidth={1.5} />
                          {labelled.has(payload.code) && (
                            <text x={cx + radius + 3} y={cy + 3.5} fontSize={10} fontWeight={isSel ? 700 : 500} fill={isDarkMode ? '#e5e7eb' : '#374151'}>
                              {payload.name}
                            </text>
                          )}
                        </g>
                      );
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-2 content-start">
              {(() => {
                const sorted = [...stats.withInflation].sort((a, b) => b.inflation! - a.inflation!);
                const hottest = sorted[0]!;
                const coolest = sorted[sorted.length - 1]!;
                const beatHigh = stats.withInflation.filter(r => r.inflation! >= 20 && r.growth >= 0);
                const insights = [
                  { title: 'Hottest prices', body: `${hottest.name}: prices ${signed(hottest.inflation!, 0)}% in four years; real pay ${signed(hottest.growth)}%.`, color: '#f59e0b' },
                  { title: 'Calmest prices', body: `${coolest.name}: prices ${signed(coolest.inflation!, 0)}%; real pay ${signed(coolest.growth)}%.`, color: theme.palette.info },
                  {
                    title: 'Kept ahead despite 20%+ inflation',
                    body: beatHigh.length ? beatHigh.map(r => `${r.name} (${signed(r.growth)}%)`).join(', ') : 'None — every economy with 20%+ inflation saw real pay fall.',
                    color: GROW,
                  },
                  { title: 'Bubble size', body: 'Larger bubbles are higher hourly wages, so the cluster of rich economies with modest real cuts is easy to spot.', color: theme.axis },
                ];
                return insights.map(c => (
                  <div key={c.title} className={`rounded-lg border border-l-4 p-2.5 ${subtle}`} style={{ borderLeftColor: c.color }}>
                    <div className={`text-xs font-semibold ${strong}`}>{c.title}</div>
                    <div className={`text-[11px] mt-0.5 ${body}`}>{c.body}</div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      <div className={`mt-6 pt-5 border-t ${border} grid grid-cols-1 md:grid-cols-3 gap-4`}>
        {[
          {
            title: 'Why purchasing-power dollars',
            points: [
              'PPP converts each currency at what it actually buys locally, not at the market exchange rate.',
              `At market rates the gap between ${stats.top.name} and ${stats.bottom.name} would be far wider; PPP shows the difference in living standards an hour of work supports.`,
            ],
          },
          {
            title: 'Why the median',
            points: [
              'The median is the wage of the worker in the middle, so a few very high earners cannot pull it up the way they pull up the average.',
              'Where pay is very unequal, the average can sit well above what a typical employee takes home.',
            ],
          },
          {
            title: 'Caveats',
            points: [
              'Coverage is employees only; self-employed and informal workers are excluded.',
              'Hourly figures depend on reported hours, and part-time shares differ widely between countries.',
              'A real cut can partly reflect composition: if low-paid jobs return after a downturn, the median can fall even when no one’s pay is cut.',
            ],
          },
        ].map(panel => (
          <div key={panel.title} className={`rounded-lg border p-3 ${subtle}`}>
            <div className={`text-sm font-semibold mb-1.5 ${strong}`}>{panel.title}</div>
            <ul className={`text-xs space-y-1.5 leading-relaxed list-disc pl-4 ${body}`}>
              {panel.points.map(p => <li key={p}>{p}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
