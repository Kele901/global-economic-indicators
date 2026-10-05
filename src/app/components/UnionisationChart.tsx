'use client';

// Chapter 3 for /labor-ledger. OECD/AIAS ICTWSS union density and collective
// bargaining coverage (latest year plus every reported year since 2000), with
// live World Bank Gini for the inequality view.
//
// Laid out as a tabbed explorer rather than a ranking: four views share one
// selected country, whose "out of 100 workers" grid stays pinned beside them.

import { useMemo, useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import type { CountryData } from '../services/worldbank';
import { UNION_DENSITY_LATEST, UNION_HISTORY, laborCountryName } from '../services/laborCurated';
import { ISO3_TO_COUNTRY, type CountryKey } from '../utils/countryMappings';
import { useChartTheme } from '../utils/chartTheme';
import { medianOf } from '../lib/gini';
import ChartCard from './charts/ChartCard';
import ChartA11yCaption from './ChartA11yCaption';
import CountryFlag from './CountryFlag';

interface Props {
  isDarkMode: boolean;
  shareTitle?: string;
  giniCoefficient?: CountryData[];
}

const CARD_TITLE = 'Union Membership vs Bargaining Coverage';
const DEFAULT_CODE = 'FRA';
const GINI_FROM = 2012;

const MEMBER_COVERED = '#6d28d9';
const COVERED_ONLY = '#c4b5fd';
const MEMBER_ONLY = '#3b82f6';
const DENSITY_LINE = '#3b82f6';
const COVERAGE_LINE = '#8b5cf6';

type ViewId = 'gap' | 'models' | 'trend' | 'inequality';
const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'gap', label: 'Membership vs coverage' },
  { id: 'models', label: 'Bargaining models' },
  { id: 'trend', label: 'Since 2000' },
  { id: 'inequality', label: 'Coverage & inequality' },
];

type ModelId = 'sector' | 'mixed' | 'firm';
const MODELS: { id: ModelId; label: string; range: string; color: string; blurb: string }[] = [
  {
    id: 'sector',
    label: 'Sector-wide',
    range: 'Coverage 70% or more',
    color: '#6d28d9',
    blurb: 'Industry or national agreements set pay for most employees, members or not, often extended by law to whole sectors.',
  },
  {
    id: 'mixed',
    label: 'Mixed',
    range: 'Coverage 35–70%',
    color: '#a78bfa',
    blurb: 'Sector agreements reach parts of the economy, typically the public sector and manufacturing; the rest bargains firm by firm or not at all.',
  },
  {
    id: 'firm',
    label: 'Firm-level',
    range: 'Coverage under 35%',
    color: '#3b82f6',
    blurb: 'Pay is bargained company by company, so an agreement rarely reaches beyond the workplaces where a union is recognised.',
  },
];
const modelOf = (coverage: number): ModelId => (coverage >= 70 ? 'sector' : coverage >= 35 ? 'mixed' : 'firm');

interface Row {
  code: string;
  key: CountryKey | undefined;
  name: string;
  short: string;
  density: number;
  densityYear: number;
  coverage: number;
  coverageYear: number;
  ratio: number;
  model: ModelId;
  densityHistory: [number, number][];
  coverageHistory: [number, number][];
  densityStart: [number, number] | null;
  densityChange: number | null;
  coverageStart: [number, number] | null;
  coverageChange: number | null;
  gini: number | null;
  giniYear: number | null;
}

const signed = (v: number, digits = 1) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(digits)}`;
const pct = (v: number) => `${v >= 99.95 ? '100' : v.toFixed(1)}%`;

// Earliest point no later than 2005, so every "since 2000" change spans roughly two decades.
const startOf = (pts: [number, number][]) => (pts[0] && pts[0][0] <= 2005 ? pts[0] : null);

function Flag({ row, className }: { row: Row; className: string }) {
  return row.key
    ? <CountryFlag countryKey={row.key} className={className} title={row.name} />
    : <span className={`${className} bg-gray-300`} aria-hidden="true" />;
}

function Sparkline({ series, lo, hi, height = 40 }: {
  series: { points: [number, number][]; color: string; width?: number }[];
  lo: number;
  hi: number;
  height?: number;
}) {
  const x0 = 2000;
  const x1 = 2024;
  const x = (yr: number) => ((yr - x0) / (x1 - x0)) * 100;
  const y = (v: number) => height - ((v - lo) / Math.max(1e-6, hi - lo)) * height;
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full overflow-visible" style={{ height }} aria-hidden="true">
      {series.map(s => (
        s.points.length > 1 && (
          <polyline
            key={s.color}
            points={s.points.map(([yr, v]) => `${x(yr)},${y(v)}`).join(' ')}
            fill="none"
            stroke={s.color}
            strokeWidth={s.width ?? 2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )
      ))}
    </svg>
  );
}

// Greedy label thinning in data units: a point is labelled unless an already
// labelled point sits within the box a label would occupy.
function pickLabels(rows: Row[], x: (r: Row) => number, y: (r: Row) => number, dx: number, dy: number, keep: string) {
  const out = new Set<string>([keep]);
  const placed: Row[] = rows.filter(r => r.code === keep);
  for (const r of [...rows].sort((a, b) => y(b) - y(a))) {
    if (out.has(r.code)) continue;
    if (placed.some(p => Math.abs(x(p) - x(r)) < dx && Math.abs(y(p) - y(r)) < dy)) continue;
    out.add(r.code);
    placed.push(r);
  }
  return out;
}

function pearson(xs: number[], ys: number[]) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i]! - mx) * (ys[i]! - my);
    sxx += (xs[i]! - mx) ** 2;
    syy += (ys[i]! - my) ** 2;
  }
  const slope = sxy / sxx;
  return { r: sxy / Math.sqrt(sxx * syy), slope, intercept: my - slope * mx };
}

export default function UnionisationChart({ isDarkMode, shareTitle, giniCoefficient }: Props) {
  const theme = useChartTheme(isDarkMode);
  const [view, setView] = useState<ViewId>('gap');
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string>(DEFAULT_CODE);

  const rows = useMemo<Row[]>(() => {
    const keys = UNION_DENSITY_LATEST.map(r => ISO3_TO_COUNTRY[r.code]).filter((k): k is CountryKey => !!k);
    const gini = new Map<CountryKey, { value: number; year: number }>();
    for (const row of giniCoefficient ?? []) {
      const year = Number(row.year);
      if (!(year >= GINI_FROM)) continue;
      for (const k of keys) {
        const v = Number(row[k]);
        if (!Number.isFinite(v) || v <= 0) continue;
        const prev = gini.get(k);
        if (!prev || year > prev.year) gini.set(k, { value: v, year });
      }
    }
    return UNION_DENSITY_LATEST.map(r => {
      const key = ISO3_TO_COUNTRY[r.code];
      const hist = UNION_HISTORY[r.code] ?? { density: [], coverage: [] };
      const densityStart = startOf(hist.density);
      const coverageStart = startOf(hist.coverage);
      const g = key ? gini.get(key) : undefined;
      return {
        code: r.code,
        key,
        name: laborCountryName(r.code),
        short: laborCountryName(r.code, { short: true }),
        density: r.unionDensityPct,
        densityYear: r.densityYear,
        coverage: r.collectiveBargainingCoveragePct,
        coverageYear: r.coverageYear,
        ratio: r.collectiveBargainingCoveragePct / r.unionDensityPct,
        model: modelOf(r.collectiveBargainingCoveragePct),
        densityHistory: hist.density,
        coverageHistory: hist.coverage,
        densityStart,
        densityChange: densityStart ? r.unionDensityPct - densityStart[1] : null,
        coverageStart,
        coverageChange: coverageStart ? r.collectiveBargainingCoveragePct - coverageStart[1] : null,
        gini: g?.value ?? null,
        giniYear: g?.year ?? null,
      };
    });
  }, [giniCoefficient]);

  const stats = useMemo(() => {
    const changes = rows.filter(r => r.densityChange != null);
    const byRatio = [...rows].sort((a, b) => b.ratio - a.ratio);
    const byChange = [...changes].sort((a, b) => a.densityChange! - b.densityChange!);
    return {
      medianDensity: medianOf(rows.map(r => r.density))!,
      medianCoverage: medianOf(rows.map(r => r.coverage))!,
      doubled: rows.filter(r => r.ratio >= 2).length,
      underCovered: rows.filter(r => r.coverage < r.density),
      byRatio,
      byChange,
      fell: changes.filter(r => r.densityChange! < 0).length,
      changeCount: changes.length,
      medianChange: medianOf(changes.map(r => r.densityChange!)) ?? 0,
      medianCoverageChange: medianOf(rows.filter(r => r.coverageChange != null).map(r => r.coverageChange!)) ?? 0,
    };
  }, [rows]);

  const selected = rows.find(r => r.code === (hovered ?? pinned)) ?? rows[0]!;
  const select = (code: string) => setPinned(code);

  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const strong = isDarkMode ? 'text-white' : 'text-gray-900';
  const body = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const border = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const panel = isDarkMode ? 'bg-gray-900/40 border-gray-700' : 'bg-slate-50 border-slate-200';
  const chip = isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-500' : 'bg-white border-gray-200 hover:border-gray-400';
  const track = isDarkMode ? 'bg-gray-700/60' : 'bg-gray-200';
  const empty = isDarkMode ? 'bg-gray-700' : 'bg-gray-200';
  const tooltipCls = `rounded-lg border px-3 py-2 text-xs shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-800'}`;
  const selectCls = `text-xs rounded border px-2 py-1 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'}`;
  const labelFill = isDarkMode ? '#e5e7eb' : '#374151';

  const headline = [
    { value: pct(stats.medianDensity), label: 'median union membership', note: `of employees, across ${rows.length} OECD economies`, color: DENSITY_LINE },
    { value: pct(stats.medianCoverage), label: 'median bargaining coverage', note: 'employees whose pay is set by a collective agreement', color: COVERAGE_LINE },
    { value: `${stats.doubled} of ${rows.length}`, label: 'cover twice their membership', note: `up to ${stats.byRatio[0]!.ratio.toFixed(1)}× in ${stats.byRatio[0]!.name}`, color: MEMBER_COVERED },
    { value: `${signed(stats.medianChange)} pp`, label: 'median membership change', note: `since 2000; fell in ${stats.fell} of ${stats.changeCount}`, color: '#ef4444' },
  ];

  // ── "Out of 100 workers" grid ─────────────────────────────────────────
  const both = Math.round(Math.min(selected.density, selected.coverage));
  const reach = Math.round(Math.max(selected.density, selected.coverage));
  const coveredOnly = selected.coverage >= selected.density ? reach - both : 0;
  const memberOnly = selected.density > selected.coverage ? reach - both : 0;
  const neither = 100 - reach;
  const cells = [
    ...Array(both).fill(MEMBER_COVERED),
    ...Array(memberOnly).fill(MEMBER_ONLY),
    ...Array(coveredOnly).fill(COVERED_ONLY),
    ...Array(neither).fill(null),
  ] as (string | null)[];
  const selectedModel = MODELS.find(m => m.id === selected.model)!;
  const story =
    selected.ratio >= 2
      ? `Agreements negotiated by unions set pay for ${pct(selected.coverage)} of employees although only ${pct(selected.density)} are members: ${selected.ratio.toFixed(1)}× the membership.`
      : selected.coverage < selected.density
        ? `Fewer employees are covered than are members: some members work where no collective agreement applies, so membership overstates bargaining reach.`
        : `Coverage tracks membership: agreements mostly apply only in workplaces where a union bargains, reaching ${selected.ratio.toFixed(1)}× the membership.`;

  // ── Membership vs coverage scatter ────────────────────────────────────
  const gapLabels = pickLabels(rows, r => r.density, r => r.coverage, 8, 4.5, selected.code);
  const xMaxGap = Math.max(70, Math.ceil((Math.max(...rows.map(r => r.density)) + 5) / 10) * 10);

  // ── Inequality scatter ────────────────────────────────────────────────
  const withGini = rows.filter(r => r.gini != null);
  const fit = withGini.length >= 6 ? pearson(withGini.map(r => r.coverage), withGini.map(r => r.gini!)) : null;
  const giniLo = withGini.length ? Math.floor((Math.min(...withGini.map(r => r.gini!)) - 1) / 5) * 5 : 20;
  const giniHi = withGini.length ? Math.ceil((Math.max(...withGini.map(r => r.gini!)) + 1) / 5) * 5 : 50;
  const giniTicks = Array.from({ length: (giniHi - giniLo) / 5 + 1 }, (_, i) => giniLo + i * 5);
  const giniLabels = pickLabels(withGini, r => r.coverage, r => r.gini!, 11, 1.4, selected.code);
  const avgGini = (model: ModelId) => {
    const vals = withGini.filter(r => r.model === model).map(r => r.gini!);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };

  const scatterShape = (labels: Set<string>, colorFor: (r: Row) => string) => (props: unknown) => {
    const { cx, cy, payload } = props as { cx?: number; cy?: number; payload?: Row };
    if (cx == null || cy == null || !payload) return <g />;
    const isSel = payload.code === selected.code;
    const r = isSel ? 7 : 5;
    return (
      <g style={{ cursor: 'pointer' }}>
        <circle cx={cx} cy={cy} r={r} fill={colorFor(payload)} fillOpacity={isSel ? 1 : 0.8} stroke={isSel ? (isDarkMode ? '#fff' : '#111827') : isDarkMode ? '#1f2937' : '#fff'} strokeWidth={1.5} />
        {labels.has(payload.code) && (
          <text x={cx + r + 3} y={cy + 3.5} fontSize={10} fontWeight={isSel ? 700 : 500} fill={labelFill}>{payload.short}</text>
        )}
      </g>
    );
  };
  const modelColor = (r: Row) => MODELS.find(m => m.id === r.model)!.color;
  const scatterHandlers = {
    onMouseEnter: (p: { payload?: Row }) => p.payload && setHovered(p.payload.code),
    onMouseLeave: () => setHovered(null),
    onClick: (p: { payload?: Row }) => p.payload && select(p.payload.code),
  };
  const rowTooltip = ({ active, payload }: { active?: boolean; payload?: { payload?: Row }[] }) => {
    const r = active ? payload?.[0]?.payload : undefined;
    if (!r) return null;
    return (
      <div className={tooltipCls}>
        <div className="font-semibold mb-0.5">{r.name}</div>
        <div style={{ color: DENSITY_LINE }}>Membership {pct(r.density)} ({r.densityYear})</div>
        <div style={{ color: COVERAGE_LINE }}>Coverage {pct(r.coverage)} ({r.coverageYear})</div>
        {r.gini != null && <div className={muted}>Gini {r.gini.toFixed(1)} ({r.giniYear})</div>}
      </div>
    );
  };

  const legendDot = (color: string | null, label: string, count: number) => (
    <li key={label} className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color ? '' : empty}`} style={color ? { backgroundColor: color } : undefined} />
      <span className={`flex-1 ${body}`}>{label}</span>
      <span className={`tabular-nums font-semibold ${strong}`}>{count}</span>
    </li>
  );

  return (
    <ChartCard
      isDarkMode={isDarkMode}
      title={CARD_TITLE}
      subtitle="How many employees belong to a union, and how many have their pay set by a collective agreement anyway. The gap between the two is what sector-wide bargaining buys."
      shareTitle={shareTitle}
      height="h-auto"
      caption={
        <ChartA11yCaption
          title="Collective bargaining coverage, latest year"
          unit="%"
          precision={1}
          rows={rows.map(r => ({ label: `${r.name} (union membership ${pct(r.density)})`, value: r.coverage }))}
          extra={`Median membership ${pct(stats.medianDensity)}, median coverage ${pct(stats.medianCoverage)}. Membership fell in ${stats.fell} of ${stats.changeCount} economies since 2000.`}
        />
      }
      footnote={
        <>
          OECD/AIAS ICTWSS database via the OECD Data Explorer: trade union density (members as a share of employees)
          and adjusted collective bargaining coverage (employees covered by an agreement as a share of employees with the
          right to bargain). Latest reported year per country, most 2023–24; France’s membership figure is from 2019 and
          Portugal’s from 2020. Spain’s coverage series restarts in 2021, so it has no change since 2000. Gini is the live
          World Bank SI.POV.GINI series, latest year since {GINI_FROM}; survey years and income concepts differ between countries.
        </>
      }
    >
      <div className={`grid grid-cols-2 lg:grid-cols-4 mb-5 border-y ${border} divide-x ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
        {headline.map((h, i) => (
          <div key={h.label} className={`py-3 ${i % 2 === 0 ? 'pr-3' : 'pl-3'} lg:px-4 ${i === 0 ? 'lg:pl-0' : ''} ${i >= 2 ? `border-t lg:border-t-0 ${border}` : ''}`}>
            <div className="text-2xl font-bold tabular-nums leading-none" style={{ color: h.color }}>{h.value}</div>
            <div className={`text-xs font-medium mt-1.5 ${strong}`}>{h.label}</div>
            <div className={`text-[11px] ${muted}`}>{h.note}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_17rem] gap-5">
        <div className="min-w-0">
          <div role="tablist" aria-label="Union views" className={`inline-flex flex-wrap gap-1 p-1 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-900/60' : 'bg-gray-100'}`}>
            {VIEWS.map(v => (
              <button
                key={v.id}
                role="tab"
                aria-selected={view === v.id}
                onClick={() => setView(v.id)}
                className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                  view === v.id
                    ? isDarkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'
                    : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {view === 'gap' && (
            <div role="tabpanel">
              <p className={`text-xs mb-2 max-w-2xl ${body}`}>
                Each dot is an economy. On the diagonal, agreements reach exactly the union members; the higher a dot sits
                above it, the further agreements extend to non-members. Click a dot to follow it across the views.
              </p>
              <div className="h-[340px] flex flex-col">
                <span className={`text-[10px] ${muted}`}>↑ Bargaining coverage</span>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 40, bottom: 26, left: 0 }}>
                      <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" />
                      <XAxis type="number" dataKey="density" domain={[0, xMaxGap]} ticks={Array.from({ length: xMaxGap / 10 + 1 }, (_, i) => i * 10)}
                        tick={{ fontSize: 11, fill: theme.axis }} stroke={theme.axis} tickFormatter={v => `${v}%`}
                        label={{ value: 'Union membership (density)', position: 'bottom', offset: 8, fill: theme.axis, fontSize: 11 }} />
                      <YAxis type="number" dataKey="coverage" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]}
                        tick={{ fontSize: 11, fill: theme.axis }} stroke={theme.axis} width={40} tickFormatter={v => `${v}%`} />
                      <ReferenceLine segment={[{ x: 0, y: 0 }, { x: xMaxGap, y: xMaxGap }]} stroke={theme.axis} strokeDasharray="5 4"
                        label={{ value: 'coverage = membership', position: 'insideTopRight', fill: theme.axis, fontSize: 10 }} />
                      <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 50, y: 100 }]} stroke={theme.axis} strokeOpacity={0.35} strokeDasharray="2 4"
                        label={{ value: '2×', position: 'insideTopLeft', fill: theme.axis, fontSize: 10 }} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} content={rowTooltip} />
                      <Scatter data={rows} isAnimationActive={false} {...scatterHandlers} shape={scatterShape(gapLabels, modelColor)} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                {[
                  {
                    title: 'Widest reach',
                    text: stats.byRatio.slice(0, 3).map(r => `${r.short} ${r.ratio.toFixed(1)}×`).join(' · '),
                    color: MEMBER_COVERED,
                  },
                  {
                    title: 'Coverage below membership',
                    text: stats.underCovered.length
                      ? stats.underCovered.map(r => `${r.short} (${pct(r.coverage)} vs ${pct(r.density)})`).join(' · ')
                      : 'None: every economy covers at least its members.',
                    color: MEMBER_ONLY,
                  },
                  {
                    title: 'Highest membership',
                    text: [...rows].sort((a, b) => b.density - a.density).slice(0, 3).map(r => `${r.short} ${pct(r.density)}`).join(' · '),
                    color: DENSITY_LINE,
                  },
                ].map(c => (
                  <div key={c.title} className="border-l-2 pl-3" style={{ borderLeftColor: c.color }}>
                    <div className={`text-[11px] uppercase tracking-wide ${muted}`}>{c.title}</div>
                    <div className={`text-xs mt-0.5 ${body}`}>{c.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'models' && (
            <div role="tabpanel" className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {MODELS.map(m => {
                const members = rows.filter(r => r.model === m.id).sort((a, b) => b.coverage - a.coverage);
                const g = avgGini(m.id);
                return (
                  <div key={m.id} className={`rounded-lg border p-3 flex flex-col ${panel}`}>
                    <div className="h-1 rounded-full mb-2.5" style={{ backgroundColor: m.color }} />
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`text-sm font-semibold ${strong}`}>{m.label}</span>
                      <span className={`text-[11px] ${muted}`}>{members.length} economies</span>
                    </div>
                    <div className={`text-[11px] ${muted}`}>{m.range}</div>
                    <p className={`text-[11px] leading-relaxed mt-1.5 ${body}`}>{m.blurb}</p>
                    <div className={`grid grid-cols-3 gap-1 my-2.5 py-2 border-y text-center ${border}`}>
                      <div>
                        <div className={`text-sm font-bold tabular-nums ${strong}`}>{pct(medianOf(members.map(r => r.density)) ?? 0)}</div>
                        <div className={`text-[10px] ${muted}`}>members</div>
                      </div>
                      <div>
                        <div className={`text-sm font-bold tabular-nums ${strong}`}>{pct(medianOf(members.map(r => r.coverage)) ?? 0)}</div>
                        <div className={`text-[10px] ${muted}`}>covered</div>
                      </div>
                      <div>
                        <div className={`text-sm font-bold tabular-nums ${strong}`}>{g != null ? g.toFixed(1) : '–'}</div>
                        <div className={`text-[10px] ${muted}`}>avg Gini</div>
                      </div>
                    </div>
                    <ul className="space-y-1.5">
                      {members.map(r => (
                        <li key={r.code}>
                          <button
                            type="button"
                            onClick={() => select(r.code)}
                            onMouseEnter={() => setHovered(r.code)}
                            onMouseLeave={() => setHovered(null)}
                            className={`w-full text-left rounded-md border px-2 py-1.5 transition-colors ${chip} ${selected.code === r.code ? 'ring-1 ring-violet-500/60' : ''}`}
                          >
                            <div className="flex items-center gap-1.5 text-xs">
                              <Flag row={r} className="w-4 h-3 rounded-[2px] shrink-0" />
                              <span className={`truncate ${strong}`}>{r.name}</span>
                              <span className={`ml-auto tabular-nums text-[11px] ${muted}`}>{r.density.toFixed(0)} / {r.coverage.toFixed(0)}</span>
                            </div>
                            <div className={`relative h-1.5 rounded-full mt-1 ${track}`}>
                              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${r.coverage}%`, backgroundColor: COVERED_ONLY }} />
                              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(r.density, r.coverage)}%`, backgroundColor: MEMBER_COVERED }} />
                              {r.density > r.coverage && (
                                <div className="absolute inset-y-0 rounded-full" style={{ left: `${r.coverage}%`, width: `${r.density - r.coverage}%`, backgroundColor: MEMBER_ONLY }} />
                              )}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              <p className={`md:col-span-3 text-[11px] ${muted}`}>
                Numbers on each chip are membership / coverage, in %. Bands are grouped by coverage alone; they describe
                how far agreements reach, not the legal mechanism behind it.
              </p>
            </div>
          )}

          {view === 'trend' && (
            <div role="tabpanel">
              <p className={`text-xs mb-3 max-w-2xl ${body}`}>
                Union membership from 2000 to the latest year, sorted by the steepest fall, with the change in bargaining
                coverage underneath. Membership fell in {stats.fell} of {stats.changeCount} economies (median{' '}
                {signed(stats.medianChange)} pp), while coverage moved a median {signed(stats.medianCoverageChange)} pp: where agreements are
                sector-wide, they have held up even as members left.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {[...stats.byChange, ...rows.filter(r => r.densityChange == null)].map(r => {
                  const values = r.densityHistory.map(p => p[1]);
                  const lo = Math.max(0, Math.floor((Math.min(...values) - 2) / 5) * 5);
                  const hi = Math.min(100, Math.ceil((Math.max(...values) + 2) / 5) * 5);
                  const change = r.densityChange;
                  return (
                    <button
                      key={r.code}
                      type="button"
                      onClick={() => select(r.code)}
                      onMouseEnter={() => setHovered(r.code)}
                      onMouseLeave={() => setHovered(null)}
                      className={`text-left rounded-lg border p-2.5 transition-colors ${chip} ${selected.code === r.code ? 'ring-1 ring-violet-500/60' : ''}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Flag row={r} className="w-4 h-3 rounded-[2px] shrink-0" />
                        <span className={`text-xs font-medium truncate ${strong}`}>{r.short}</span>
                        {change != null && (
                          <span className={`ml-auto text-[11px] font-semibold tabular-nums ${change < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {signed(change)} pp
                          </span>
                        )}
                      </div>
                      <Sparkline lo={lo} hi={hi} series={[{ points: r.densityHistory, color: DENSITY_LINE }]} />
                      <div className={`flex justify-between text-[10px] tabular-nums mt-1 ${muted}`}>
                        <span>{r.densityStart ? `${r.densityStart[1].toFixed(0)}% (${r.densityStart[0]})` : '–'}</span>
                        <span>{lo}–{hi}%</span>
                        <span>{r.density.toFixed(0)}% ({r.densityYear})</span>
                      </div>
                      <div className={`text-[10px] tabular-nums mt-1 pt-1 border-t ${border}`}>
                        <span style={{ color: COVERAGE_LINE }}>Coverage {pct(r.coverage)}</span>
                        <span className={muted}>
                          {r.coverageChange != null ? ` · ${signed(r.coverageChange)} pp since ${r.coverageStart![0]}` : ' · no comparable 2000s figure'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className={`text-[11px] mt-2 ${muted}`}>Each panel has its own vertical range (shown in the middle) so small changes stay visible; compare levels in the other views. The panel beside this grid plots both series on a common 0–100% scale.</p>
            </div>
          )}

          {view === 'inequality' && (
            <div role="tabpanel">
              {withGini.length < 6 ? (
                <div className={`h-[340px] flex items-center justify-center text-xs rounded-lg border ${panel} ${muted}`}>
                  Loading live World Bank Gini data…
                </div>
              ) : (
                <>
                  <p className={`text-xs mb-2 max-w-2xl ${body}`}>
                    Bargaining coverage against income inequality (Gini, 0 = everyone has the same income). Across these{' '}
                    {withGini.length} economies, wider coverage goes with {fit!.r < 0 ? 'lower' : 'higher'} inequality
                    (correlation {fit!.r.toFixed(2)}). That is a pattern, not proof: tax systems and welfare states differ too.
                  </p>
                  <div className="h-[340px] flex flex-col">
                    <span className={`text-[10px] ${muted}`}>↑ Gini index (higher = more unequal)</span>
                    <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 64, bottom: 26, left: 0 }}>
                          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" />
                          <XAxis type="number" dataKey="coverage" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]}
                            tick={{ fontSize: 11, fill: theme.axis }} stroke={theme.axis} tickFormatter={v => `${v}%`}
                            label={{ value: 'Collective bargaining coverage', position: 'bottom', offset: 8, fill: theme.axis, fontSize: 11 }} />
                          <YAxis type="number" dataKey="gini" domain={[giniLo, giniHi]} ticks={giniTicks}
                            tick={{ fontSize: 11, fill: theme.axis }} stroke={theme.axis} width={40} />
                          <ReferenceLine
                            segment={[{ x: 0, y: fit!.intercept }, { x: 100, y: fit!.intercept + fit!.slope * 100 }]}
                            stroke={theme.axis}
                            strokeDasharray="5 4"
                            ifOverflow="hidden"
                          />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={rowTooltip} />
                          <Scatter data={withGini} isAnimationActive={false} {...scatterHandlers} shape={scatterShape(giniLabels, modelColor)} />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-xs">
                    {MODELS.map(m => {
                      const g = avgGini(m.id);
                      return (
                        <span key={m.id} className={`inline-flex items-center gap-1.5 ${body}`}>
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                          {m.label}: average Gini <span className={`font-semibold tabular-nums ${strong}`}>{g != null ? g.toFixed(1) : '–'}</span>
                        </span>
                      );
                    })}
                    <span className={muted}>Dashed line: least-squares fit.</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <aside className={`rounded-xl border p-4 self-start ${panel}`}>
          <div className="flex items-center gap-2">
            <Flag row={selected} className="w-5 h-3.5 rounded-[2px] shrink-0" />
            <span className={`text-sm font-semibold truncate ${strong}`}>{selected.name}</span>
            <select
              value={pinned}
              onChange={e => select(e.target.value)}
              className={`ml-auto ${selectCls}`}
              aria-label="Choose a country"
              data-share-exclude
            >
              {[...rows].sort((a, b) => a.name.localeCompare(b.name)).map(r => <option key={r.code} value={r.code}>{r.short}</option>)}
            </select>
          </div>
          <span className="inline-block text-[10px] font-medium uppercase tracking-wide rounded px-1.5 py-0.5 mt-1.5 text-white" style={{ backgroundColor: selectedModel.color }}>
            {selectedModel.label} bargaining
          </span>

          <div className={`text-[11px] uppercase tracking-wide mt-3 mb-1.5 ${muted}`}>Out of every 100 employees</div>
          <div className="grid grid-cols-10 gap-[3px]" role="img" aria-label={`${both + memberOnly} union members and ${both + coveredOnly} covered by an agreement, out of 100 employees`}>
            {cells.map((c, i) => (
              <span key={i} className={`aspect-square rounded-full ${c ? '' : empty}`} style={c ? { backgroundColor: c } : undefined} />
            ))}
          </div>
          <ul className="text-[11px] space-y-1 mt-2.5">
            {legendDot(MEMBER_COVERED, 'Members, covered', both)}
            {memberOnly > 0 && legendDot(MEMBER_ONLY, 'Members, no agreement', memberOnly)}
            {legendDot(COVERED_ONLY, 'Covered, not members', coveredOnly)}
            {legendDot(null, 'Neither', neither)}
          </ul>
          <p className={`text-[11px] leading-relaxed mt-2.5 ${body}`}>{story}</p>

          <div className={`grid grid-cols-2 gap-2 mt-3 pt-3 border-t ${border}`}>
            <div>
              <div className={`text-[10px] uppercase tracking-wide ${muted}`}>Membership</div>
              <div className="text-lg font-bold tabular-nums" style={{ color: DENSITY_LINE }}>{pct(selected.density)}</div>
              <div className={`text-[10px] ${muted}`}>
                {selected.densityYear}{selected.densityChange != null ? ` · ${signed(selected.densityChange)} pp since ${selected.densityStart![0]}` : ''}
              </div>
            </div>
            <div>
              <div className={`text-[10px] uppercase tracking-wide ${muted}`}>Coverage</div>
              <div className="text-lg font-bold tabular-nums" style={{ color: COVERAGE_LINE }}>{pct(selected.coverage)}</div>
              <div className={`text-[10px] ${muted}`}>
                {selected.coverageYear}{selected.coverageChange != null ? ` · ${signed(selected.coverageChange)} pp since ${selected.coverageStart![0]}` : ''}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <Sparkline
              lo={0}
              hi={100}
              height={56}
              series={[
                { points: selected.coverageHistory, color: COVERAGE_LINE },
                { points: selected.densityHistory, color: DENSITY_LINE },
              ]}
            />
            <div className={`flex justify-between text-[10px] mt-1 ${muted}`}>
              <span>2000</span>
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1"><span className="w-2.5 h-0.5 rounded" style={{ backgroundColor: DENSITY_LINE }} />Members</span>
                <span className="inline-flex items-center gap-1"><span className="w-2.5 h-0.5 rounded" style={{ backgroundColor: COVERAGE_LINE }} />Covered</span>
                <span>0–100%</span>
              </span>
              <span>2024</span>
            </div>
          </div>

          <div className={`grid grid-cols-2 gap-2 mt-3 pt-3 border-t text-[11px] ${border}`}>
            <div>
              <div className={muted}>Reach</div>
              <div className={`font-semibold tabular-nums ${strong}`}>{selected.ratio.toFixed(1)}× membership</div>
            </div>
            <div>
              <div className={muted}>Income Gini</div>
              <div className={`font-semibold tabular-nums ${strong}`}>
                {selected.gini != null ? `${selected.gini.toFixed(1)} (${selected.giniYear})` : '–'}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <dl className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 mt-6 pt-4 border-t text-xs ${border}`}>
        {[
          { term: 'Union density', def: 'Members as a share of all employees. Retired and unemployed members are excluded where countries report them.' },
          { term: 'Bargaining coverage', def: 'Employees whose pay and conditions are set by a collective agreement, whether or not they belong to a union.' },
          { term: 'Extension', def: 'Governments in France, Belgium, Spain, Portugal and the Netherlands routinely extend sector agreements to every firm in the sector, which is how coverage outruns membership.' },
          { term: 'Why it matters', def: 'Coverage, not membership, decides whose wages are bargained. Falling membership only weakens pay-setting where agreements depend on it.' },
        ].map(d => (
          <div key={d.term}>
            <dt className={`font-semibold ${strong}`}>{d.term}</dt>
            <dd className={`mt-0.5 leading-relaxed ${body}`}>{d.def}</dd>
          </div>
        ))}
      </dl>
    </ChartCard>
  );
}
