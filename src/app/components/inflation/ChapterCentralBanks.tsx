'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import TimelinePlayer from '../heatmap/TimelinePlayer';
import { RankedBars } from '../development/charts';
import { COUNTRY_KEYS, type CountryKey } from '../../utils/countryMappings';
import { INFLATION_TARGETS } from '../../data/inflationTargets';
import { fetchPolicyRateRows } from '../../services/inflationData';
import { STANCE_META, realRateSeries, stancePoints, stanceYears, type Stance } from '../../utils/inflation/realRates';
import { latestOf, seriesOf } from '../../utils/inflation/stats';
import type { CountryData } from '../../services/worldbank';
import {
  ChapterMeta,
  ChartLoading,
  CountrySelect,
  EmptyNote,
  Lede,
  Panel,
  Segmented,
  countryName,
  pct,
  pp,
  theme,
  useLazyFetch,
  type InflationChapterProps,
} from './ui';

export default function ChapterCentralBanks({ isDarkMode, data, selected }: InflationChapterProps) {
  const { data: policy, loading, failed } = useLazyFetch(true, fetchPolicyRateRows);
  const waiting = loading || (!policy && !failed);
  return (
    <div className="space-y-6">
      <Lede isDarkMode={isDarkMode}>
        Central banks raise interest rates to cool inflation. What matters is the real rate: the policy rate minus inflation. A negative
        real rate is still stimulating the economy even when the headline rate looks high.
      </Lede>
      <RealRatePanel isDarkMode={isDarkMode} data={data} selected={selected} policy={policy} waiting={waiting} />
      <TargetGauges isDarkMode={isDarkMode} data={data} selected={selected} />
      <StanceQuadrant isDarkMode={isDarkMode} data={data} selected={selected} policy={policy} waiting={waiting} />
      <WbRealRates isDarkMode={isDarkMode} data={data} selected={selected} />
    </div>
  );
}

type WithPolicy = Pick<InflationChapterProps, 'isDarkMode' | 'data' | 'selected'> & { policy: CountryData[] | null; waiting: boolean };

function RealRatePanel({ isDarkMode, data, selected, policy, waiting }: WithPolicy) {
  const t = theme(isDarkMode);
  const available = useMemo(() => COUNTRY_KEYS.filter((k) => seriesOf(policy ?? [], k).length > 3), [policy]);
  const [country, setCountry] = useState<CountryKey>('USA');
  useEffect(() => {
    if (available.length && !available.includes(country)) setCountry(selected.find((k) => available.includes(k)) ?? available[0]);
  }, [available, country, selected]);
  const series = useMemo(() => realRateSeries(policy ?? [], data.inflationRates, country, 1990), [policy, data.inflationRates, country]);
  const last = series[series.length - 1];
  const title = 'Policy rate vs inflation';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle="Annual average policy (or overnight interbank) rate against CPI inflation. The shaded area is the real rate: blue when positive, red when negative."
      actions={available.length > 0 && <CountrySelect isDarkMode={isDarkMode} value={country} onChange={setCountry} options={available} />}
      note="Euro-area members share the ECB deposit rate. Some countries use the call-money rate as the closest monthly proxy."
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['fred-policy-rates', 'wb-inflation']}
        download={{ filename: `real-policy-rate-${country}`, title: `${title}: ${countryName(country)}`, getData: () => series.map(({ positive, negative, ...r }) => r) }}
      />
      {waiting ? (
        <ChartLoading isDarkMode={isDarkMode} height={320} />
      ) : !series.length ? (
        <EmptyNote isDarkMode={isDarkMode}>Policy-rate data is unavailable right now.</EmptyNote>
      ) : (
        <>
          {last && (
            <p className={`text-sm mb-2 ${t.textSec}`}>
              In {last.year}, {countryName(country)}&rsquo;s policy rate averaged {pct(last.policy, 2)} against inflation of {pct(last.inflation)}: a real rate of{' '}
              <span className={`font-semibold ${last.real >= 0 ? 'text-blue-500' : 'text-rose-500'}`}>{pp(last.real)}</span>.
            </p>
          )}
          <div data-chart-container data-chart-title={`${title}: ${countryName(country)}`} style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={series} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
                <XAxis dataKey="year" stroke={t.axis} tick={{ fontSize: 11 }} />
                <YAxis stroke={t.axis} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} width={44} />
                <Tooltip contentStyle={t.tooltip} formatter={(v: number, n: string) => [pct(v, 2), n]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={0} stroke={t.axis} />
                <Area dataKey="positive" name="Real rate (positive)" fill="#3b82f6" fillOpacity={0.25} stroke="none" isAnimationActive={false} />
                <Area dataKey="negative" name="Real rate (negative)" fill="#ef4444" fillOpacity={0.25} stroke="none" isAnimationActive={false} />
                <Line dataKey="policy" name="Policy rate" stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line dataKey="inflation" name="Inflation" stroke="#f97316" strokeWidth={2} dot={false} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Panel>
  );
}

const GAUGE_MIN = -2;
const GAUGE_MAX = 14;

function TargetGauges({ isDarkMode, data, selected }: Pick<InflationChapterProps, 'isDarkMode' | 'data' | 'selected'>) {
  const t = theme(isDarkMode);
  const [scope, setScope] = useState<'all' | 'selected'>('all');
  const rows = useMemo(
    () =>
      (scope === 'all' ? COUNTRY_KEYS : selected)
        .map((k) => {
          const tg = INFLATION_TARGETS[k];
          const last = latestOf(data.inflationRates, k);
          if (tg.target == null || !last) return null;
          return { key: k, ...tg, target: tg.target, latest: last.value, year: last.year, gap: last.value - tg.target };
        })
        .filter((r): r is NonNullable<typeof r> => r != null)
        .sort((a, b) => Math.abs(a.gap) - Math.abs(b.gap)),
    [data.inflationRates, scope, selected],
  );
  const noTarget = COUNTRY_KEYS.filter((k) => INFLATION_TARGETS[k].target == null);
  const x = (v: number) => `${((Math.min(GAUGE_MAX, Math.max(GAUGE_MIN, v)) - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100}%`;
  const title = 'Distance from target';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle="Latest inflation (dot) against each central bank's target (line) and tolerance band (green). Closest to target first."
      actions={
        <Segmented
          isDarkMode={isDarkMode}
          value={scope}
          onChange={setScope}
          options={[
            { id: 'all', label: 'All countries' },
            { id: 'selected', label: 'My selection' },
          ]}
        />
      }
      note={`Scale runs from ${GAUGE_MIN}% to ${GAUGE_MAX}%; readings beyond it are pinned to the edge. No numeric target: ${noTarget.map(countryName).join(', ')}.`}
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['inflation-targets-curated', 'wb-inflation']}
        flags={['curated']}
        download={{
          filename: 'inflation-vs-target',
          title,
          getData: () => rows.map((r) => ({ country: countryName(r.key), bank: r.bank, target: r.target, band: r.band, latest: r.latest, year: r.year, gap: r.gap })),
        }}
      />
      <div data-chart-container data-chart-title={title} className="grid gap-x-6 gap-y-1.5 md:grid-cols-2 overflow-y-auto pr-1" style={{ maxHeight: 560 }}>
        {rows.map((r) => {
          const tol = Math.max(r.band, 1);
          const within = Math.abs(r.gap) <= tol;
          return (
            <div key={r.key} className="grid grid-cols-[7rem_1fr_3.5rem] items-center gap-2 text-xs" title={`${r.bank}: target ${r.target}%${r.band ? ` \u00b1 ${r.band}` : ''}${r.note ? `. ${r.note}` : ''}`}>
              <span className={`truncate ${selected.includes(r.key) ? `font-semibold ${t.accent}` : t.text}`}>{countryName(r.key)}</span>
              <span className={`relative h-4 rounded ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <span className="absolute inset-y-0 bg-emerald-500/25" style={{ left: x(r.target - tol), right: `calc(100% - ${x(r.target + tol)})` }} />
                <span className="absolute inset-y-0 w-0.5 bg-emerald-600" style={{ left: x(r.target) }} />
                <span className="absolute inset-y-0 w-px bg-gray-400/50" style={{ left: x(0) }} />
                <span
                  className={`absolute top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/70 ${within ? 'bg-emerald-500' : r.gap > 0 ? 'bg-rose-500' : 'bg-blue-500'}`}
                  style={{ left: x(r.latest) }}
                />
              </span>
              <span className={`tabular-nums text-right ${within ? 'text-emerald-500' : r.gap > 0 ? 'text-rose-500' : 'text-blue-500'}`}>{pp(r.gap)}</span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

const X_DOMAIN: [number, number] = [-6, 24];
const Y_DOMAIN: [number, number] = [-20, 12];
const clamp = (v: number, [lo, hi]: [number, number]) => Math.min(hi, Math.max(lo, v));

function StanceQuadrant({ isDarkMode, data, selected, policy, waiting }: WithPolicy) {
  const t = theme(isDarkMode);
  const years = useMemo(() => stanceYears(policy ?? [], data.inflationRates, INFLATION_TARGETS), [policy, data.inflationRates]);
  const [year, setYear] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (years.length && (year == null || !years.includes(year))) setYear(years[years.length - 1]);
  }, [years, year]);
  const points = useMemo(
    () =>
      year == null
        ? []
        : stancePoints(year, policy ?? [], data.inflationRates, INFLATION_TARGETS).map((p) => ({
            ...p,
            x: clamp(p.gap, X_DOMAIN),
            y: clamp(p.real, Y_DOMAIN),
            clipped: p.gap !== clamp(p.gap, X_DOMAIN) || p.real !== clamp(p.real, Y_DOMAIN),
            label: selected.includes(p.key) ? countryName(p.key) : '',
          })),
    [year, policy, data.inflationRates, selected],
  );
  const counts = points.reduce<Record<Stance, number>>((acc, p) => ({ ...acc, [p.stance]: acc[p.stance] + 1 }), { behind: 0, tight: 0, loose: 0, 'on-track': 0 });
  const title = 'Policy stance quadrant';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle="Inflation gap to target (right = too hot) against the real policy rate (up = restrictive). Press play to watch central banks fall behind in 2021-22 and catch up after."
      note="Only countries with both a numeric target and a policy-rate series. Points beyond the axes are pinned to the edge (hollow)."
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['fred-policy-rates', 'wb-inflation', 'inflation-targets-curated']}
        download={{
          filename: `policy-stance-${year ?? ''}`,
          title,
          getData: () => points.map((p) => ({ country: countryName(p.key), year, inflation: p.inflation, policyRate: p.policy, gap: p.gap, realRate: p.real, stance: STANCE_META[p.stance].label })),
        }}
      />
      {waiting ? (
        <ChartLoading isDarkMode={isDarkMode} height={380} />
      ) : !years.length ? (
        <EmptyNote isDarkMode={isDarkMode}>Policy-rate data is unavailable right now.</EmptyNote>
      ) : (
        <>
          <TimelinePlayer years={years} year={year} playing={playing} isDarkMode={isDarkMode} onYearChange={setYear} onPlayingChange={setPlaying} />
          <div className="flex flex-wrap gap-2 mb-2">
            {(Object.keys(STANCE_META) as Stance[]).map((s) => (
              <span key={s} title={STANCE_META[s].blurb} className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${t.border} ${t.textSec}`}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STANCE_META[s].color }} />
                {STANCE_META[s].label}: <span className={`font-semibold tabular-nums ${t.text}`}>{counts[s]}</span>
              </span>
            ))}
          </div>
          <div data-chart-container data-chart-title={`${title}, ${year}`} className="relative" style={{ height: 400 }}>
            <div aria-hidden className={`pointer-events-none absolute right-6 top-2 z-10 text-5xl font-black tabular-nums opacity-15 ${t.text}`}>
              {year}
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
                <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
                <ReferenceArea x1={X_DOMAIN[0]} x2={0} y1={0} y2={Y_DOMAIN[1]} fill="#2563eb" fillOpacity={0.04} />
                <ReferenceArea x1={0} x2={X_DOMAIN[1]} y1={Y_DOMAIN[0]} y2={0} fill="#dc2626" fillOpacity={0.05} />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={X_DOMAIN}
                  allowDataOverflow
                  stroke={t.axis}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}`}
                  label={{ value: 'Inflation minus target (pp)', position: 'insideBottom', offset: -18, fill: t.axis, fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={Y_DOMAIN}
                  allowDataOverflow
                  stroke={t.axis}
                  tick={{ fontSize: 11 }}
                  width={48}
                  label={{ value: 'Real policy rate (%)', angle: -90, position: 'insideLeft', fill: t.axis, fontSize: 11 }}
                />
                <ReferenceLine x={0} stroke={t.axis} />
                <ReferenceLine y={0} stroke={t.axis} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    const p = payload?.[0]?.payload as (typeof points)[number] | undefined;
                    if (!p) return null;
                    return (
                      <div style={t.tooltip} className="px-2 py-1.5">
                        <div className="font-semibold">{countryName(p.key)}</div>
                        <div>Inflation {pct(p.inflation)} (gap {pp(p.gap)})</div>
                        <div>Policy rate {pct(p.policy, 2)}, real {pp(p.real)}</div>
                        <div style={{ color: STANCE_META[p.stance].color }}>{STANCE_META[p.stance].label}</div>
                      </div>
                    );
                  }}
                />
                <Scatter data={points} isAnimationActive animationDuration={700}>
                  {points.map((p) => (
                    <Cell key={p.key} fill={p.clipped ? 'transparent' : STANCE_META[p.stance].color} stroke={STANCE_META[p.stance].color} strokeWidth={p.clipped || selected.includes(p.key) ? 2 : 0} />
                  ))}
                  <LabelList dataKey="label" position="top" style={{ fontSize: 10, fill: t.axis }} />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Panel>
  );
}

function WbRealRates({ isDarkMode, data, selected }: Pick<InflationChapterProps, 'isDarkMode' | 'data' | 'selected'>) {
  const rows = useMemo(
    () =>
      COUNTRY_KEYS.map((k) => {
        const o = latestOf(data.interestRates, k, new Date().getFullYear() - 5);
        return o ? { key: k, value: o.value, year: o.year } : null;
      }).filter((r): r is NonNullable<typeof r> => r != null),
    [data.interestRates],
  );
  const title = 'Real lending rates';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle="The World Bank real interest rate: banks' lending rate adjusted by the GDP deflator. A wider measure than the policy rate, with broader coverage."
      note="Latest observation in the past five years; the small year label shows when it was recorded."
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['wb-real-interest']}
        download={{ filename: 'real-interest-rates', title, getData: () => rows.map((r) => ({ country: countryName(r.key), year: r.year, realRate: r.value })) }}
      />
      <div data-chart-container data-chart-title={title}>
        <RankedBars
          isDarkMode={isDarkMode}
          rows={rows}
          format={(v) => pct(v)}
          highlight={selected}
          maxHeight={420}
          color={(r) => (r.value >= 0 ? (isDarkMode ? '#60a5fa' : '#3b82f6') : '#ef4444')}
        />
      </div>
    </Panel>
  );
}
