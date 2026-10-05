'use client';

// Live Chapter 1 for /labor-ledger. Overall unemployment (SL.UEM.TOTL.ZS)
// against youth unemployment (SL.UEM.1524.ZS) for the whole roster. Each row
// is a dumbbell from the all-ages rate to the youth rate, so the gap the
// headline hides is the visible length of the bar. A quadrant chart then
// separates two-tier labour markets (low headline, high youth multiple) from
// economies that are simply weak, and every country carries its change since
// the pre-pandemic 2019 baseline.
//
// Rendered as an HTML ranking rather than a Recharts bar chart so a single
// outlier (South Africa's youth rate) cannot flatten every other row and each
// row can carry a flag, both rates and the multiple without label clipping.

import { useMemo, useState } from 'react';
import {
  ScatterChart, Scatter, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts';
import type { CountryData } from '../services/worldbank';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES, type CountryKey } from '../utils/countryMappings';
import { useChartTheme } from '../utils/chartTheme';
import { REGIONS, REGION_OF, type RegionId } from '../lib/regions';
import { medianOf } from '../lib/gini';
import ChartCard from './charts/ChartCard';
import ChartA11yCaption from './ChartA11yCaption';
import CountryFlag from './CountryFlag';

interface Props {
  isDarkMode: boolean;
  shareTitle?: string;
  unemploymentRates: CountryData[] | undefined;
  youthUnemployment: CountryData[] | undefined;
}

const CARD_TITLE = 'Youth vs Overall Unemployment';
const BASELINE_YEAR = 2019;
const HISTORY_FROM = 2000;
const HIGH_YOUTH_RATE = 20;

type SortId = 'multiple' | 'youth' | 'total' | 'gap' | 'change' | 'name';
const SORTS: { id: SortId; label: string }[] = [
  { id: 'multiple', label: 'Youth multiple' },
  { id: 'youth', label: 'Youth rate' },
  { id: 'total', label: 'All-ages rate' },
  { id: 'gap', label: 'Gap (points)' },
  { id: 'change', label: `Youth change since ${BASELINE_YEAR}` },
  { id: 'name', label: 'A–Z' },
];

const QUADRANTS = {
  twoTier: { label: 'Two-tier', note: 'Low headline rate, but young people are shut out of it', color: '#f97316' },
  youthHeavy: { label: 'Youth-heavy slack', note: 'High headline rate and an outsized youth gap on top', color: '#ef4444' },
  broad: { label: 'Broad slack', note: 'High headline rate shared fairly evenly across ages', color: '#6366f1' },
  tight: { label: 'Tight and even', note: 'Low headline rate and a modest youth gap', color: '#10b981' },
} as const;
type QuadrantId = keyof typeof QUADRANTS;
const QUADRANT_ORDER: QuadrantId[] = ['twoTier', 'youthHeavy', 'tight', 'broad'];

const multipleTone = (m: number) => (m >= 4 ? '#ef4444' : m >= 3 ? '#f97316' : m >= 2 ? '#f59e0b' : '#10b981');

interface Point { year: number; total: number | null; youth: number | null }

interface Row {
  key: CountryKey;
  name: string;
  region: RegionId;
  year: number;
  total: number;
  youth: number;
  gap: number;
  multiple: number;
  youthBase: number | null;
  totalBase: number | null;
  history: Point[];
}

const signed = (v: number, digits = 1) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(digits)}`;

export default function LaborSlackChart({ isDarkMode, unemploymentRates, youthUnemployment, shareTitle }: Props) {
  const theme = useChartTheme(isDarkMode);
  const YOUTH = theme.palette.warning;
  const TOTAL = theme.palette.info;
  const [sort, setSort] = useState<SortId>('multiple');
  const [region, setRegion] = useState<RegionId | 'all'>('all');
  const [hovered, setHovered] = useState<CountryKey | null>(null);
  const [pinned, setPinned] = useState<CountryKey | null>(null);

  const rows = useMemo<Row[]>(() => {
    const index = (s: CountryData[] | undefined) => new Map((s ?? []).map(r => [Number(r.year), r]));
    const totals = index(unemploymentRates);
    const youths = index(youthUnemployment);
    const years = Array.from(new Set([...totals.keys(), ...youths.keys()]))
      .filter(y => y >= HISTORY_FROM)
      .sort((a, b) => a - b);
    const pos = (v: unknown) => {
      const n = Number(v);
      return n > 0 ? n : null;
    };
    return COUNTRY_KEYS
      .map(key => {
        const history = years
          .map(year => ({ year, total: pos(totals.get(year)?.[key]), youth: pos(youths.get(year)?.[key]) }))
          .filter(p => p.total != null || p.youth != null);
        const latest = [...history].reverse().find(p => p.total != null && p.youth != null);
        if (!latest) return null;
        const base = history.find(p => p.year === BASELINE_YEAR);
        const total = latest.total!;
        const youth = latest.youth!;
        return {
          key,
          name: COUNTRY_DISPLAY_NAMES[key] ?? key,
          region: REGION_OF[key],
          year: latest.year,
          total,
          youth,
          gap: youth - total,
          multiple: youth / total,
          youthBase: base?.youth ?? null,
          totalBase: base?.total ?? null,
          history,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
  }, [unemploymentRates, youthUnemployment]);

  const stats = useMemo(() => {
    if (!rows.length) return null;
    const medTotal = medianOf(rows.map(r => r.total))!;
    const medYouth = medianOf(rows.map(r => r.youth))!;
    const medMultiple = medianOf(rows.map(r => r.multiple))!;
    const quadrant = Object.fromEntries(rows.map(r => [
      r.key,
      r.multiple >= medMultiple ? (r.total < medTotal ? 'twoTier' : 'youthHeavy') : (r.total < medTotal ? 'tight' : 'broad'),
    ])) as Record<CountryKey, QuadrantId>;
    const maxBy = (f: (r: Row) => number) => rows.reduce((a, b) => (f(b) > f(a) ? b : a));
    const minBy = (f: (r: Row) => number) => rows.reduce((a, b) => (f(b) < f(a) ? b : a));
    const regions = REGIONS.map(reg => {
      const members = rows.filter(r => r.region === reg.id);
      if (!members.length) return null;
      const avgYouth = members.reduce((s, m) => s + m.youth, 0) / members.length;
      const avgTotal = members.reduce((s, m) => s + m.total, 0) / members.length;
      return { id: reg.id, label: reg.label, count: members.length, avgYouth, avgTotal, multiple: avgYouth / avgTotal };
    }).filter((r): r is NonNullable<typeof r> => r !== null).sort((a, b) => b.avgYouth - a.avgYouth);
    const withBase = rows.filter(r => r.youthBase != null).map(r => ({ ...r, change: r.youth - r.youthBase! }));
    const quadrants = QUADRANT_ORDER.map(id => {
      const members = rows.filter(r => quadrant[r.key] === id).sort((a, b) => b.multiple - a.multiple);
      return { id, ...QUADRANTS[id], count: members.length, examples: members.slice(0, 3).map(m => m.name) };
    });
    return {
      medTotal,
      medYouth,
      medMultiple,
      quadrant,
      topYouth: maxBy(r => r.youth),
      topMultiple: maxBy(r => r.multiple),
      lowYouth: minBy(r => r.youth),
      topTotal: maxBy(r => r.total),
      highYouthCount: rows.filter(r => r.youth >= HIGH_YOUTH_RATE).length,
      regions,
      baseCount: withBase.length,
      worse: withBase.filter(r => r.change > 0.5).length,
      better: withBase.filter(r => r.change < -0.5).length,
      biggestRise: withBase.length ? withBase.reduce((a, b) => (b.change > a.change ? b : a)) : null,
      biggestFall: withBase.length ? withBase.reduce((a, b) => (b.change < a.change ? b : a)) : null,
      quadrants,
      scaleMax: Math.max(30, Math.ceil(maxBy(r => r.youth).youth / 10) * 10),
    };
  }, [rows]);

  const visible = useMemo(() => {
    const list = region === 'all' ? [...rows] : rows.filter(r => r.region === region);
    const change = (r: Row) => (r.youthBase != null ? r.youth - r.youthBase : -Infinity);
    const by: Record<SortId, (a: Row, b: Row) => number> = {
      multiple: (a, b) => b.multiple - a.multiple,
      youth: (a, b) => b.youth - a.youth,
      total: (a, b) => b.total - a.total,
      gap: (a, b) => b.gap - a.gap,
      change: (a, b) => change(b) - change(a),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return list.sort(by[sort]);
  }, [rows, region, sort]);

  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const strong = isDarkMode ? 'text-white' : 'text-gray-900';
  const body = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const subtle = isDarkMode ? 'bg-gray-700/40 border-gray-700' : 'bg-gray-50 border-gray-200';
  const border = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const track = isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100';

  if (!rows.length || !stats) {
    return (
      <ChartCard isDarkMode={isDarkMode} title={CARD_TITLE} shareTitle={shareTitle} height="h-auto">
        <p className={`text-sm ${theme.subtitleCls}`}>
          Live World Bank unemployment data has not arrived yet. The curated chapters below are
          unaffected.
        </p>
      </ChartCard>
    );
  }

  const selected = rows.find(r => r.key === (hovered ?? pinned)) ?? visible[0] ?? rows[0]!;
  const selectedQuadrant = QUADRANTS[stats.quadrant[selected.key]];
  const pctOf = (v: number) => `${(Math.min(v, stats.scaleMax) / stats.scaleMax) * 100}%`;
  const ticks = Array.from({ length: stats.scaleMax / 10 + 1 }, (_, i) => i * 10);
  const missing = COUNTRY_KEYS.length - rows.length;
  const years = rows.map(r => r.year);
  const oldestYear = Math.min(...years);
  const newestYear = Math.max(...years);
  const regionLabel = (id: RegionId) => REGIONS.find(r => r.id === id)!.label;
  const gridCols = 'grid-cols-[1.5rem_minmax(6.5rem,9.5rem)_1fr_5.75rem_2.75rem]';

  const tiles = [
    { label: 'Highest youth rate', value: `${stats.topYouth.youth.toFixed(1)}%`, detail: `${stats.topYouth.name} · all ages ${stats.topYouth.total.toFixed(1)}%`, color: YOUTH },
    { label: 'Widest youth multiple', value: `${stats.topMultiple.multiple.toFixed(1)}×`, detail: `${stats.topMultiple.name} · ${stats.topMultiple.youth.toFixed(1)}% vs ${stats.topMultiple.total.toFixed(1)}%`, color: multipleTone(stats.topMultiple.multiple) },
    { label: 'Roster median', value: `${stats.medYouth.toFixed(1)}% / ${stats.medTotal.toFixed(1)}%`, detail: `Youth / all ages · ${stats.medMultiple.toFixed(1)}× multiple`, color: TOTAL },
    { label: `Youth rate ${HIGH_YOUTH_RATE}%+`, value: String(stats.highYouthCount), detail: `of ${rows.length} economies · at least 1 in 5 young jobseekers out of work`, color: '#ef4444' },
  ];

  const labelled = new Set<CountryKey>([
    ...[...rows].sort((a, b) => b.multiple - a.multiple).slice(0, 3).map(r => r.key),
    ...[...rows].sort((a, b) => b.total - a.total).slice(0, 3).map(r => r.key),
    selected.key,
  ]);
  const xStep = stats.topTotal.total > 20 ? 5 : 2;
  const xMax = Math.ceil(stats.topTotal.total / xStep) * xStep;
  const xTicks = Array.from({ length: xMax / xStep + 1 }, (_, i) => i * xStep);
  const yMax = Math.ceil(stats.topMultiple.multiple + 0.3);
  const yTicks = Array.from({ length: yMax + 1 }, (_, i) => i);

  const selectCls = `text-xs rounded border px-2 py-1 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'}`;
  const tooltipCls = `rounded-lg border px-3 py-2 text-xs shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-800'}`;

  const changeChip = (now: number, base: number | null) => {
    if (base == null) return <span className={muted}>no {BASELINE_YEAR} reading</span>;
    const d = now - base;
    const tone = Math.abs(d) < 0.5 ? muted : d > 0 ? 'text-rose-500' : 'text-emerald-500';
    return (
      <span className="tabular-nums">
        <span className={muted}>{base.toFixed(1)}% → </span>
        <span className={strong}>{now.toFixed(1)}%</span>
        <span className={`ml-1.5 font-medium ${tone}`}>{d > 0 ? '▲' : d < 0 ? '▼' : '■'} {Math.abs(d).toFixed(1)} pts</span>
      </span>
    );
  };

  return (
    <ChartCard
      isDarkMode={isDarkMode}
      title={CARD_TITLE}
      subtitle={`Latest World Bank rates for ${rows.length} economies. Each row runs from the all-ages rate to the youth (15–24) rate; the length between them is what the headline figure hides.`}
      shareTitle={shareTitle}
      height="h-auto"
      actions={
        <label className={`inline-flex items-center gap-1.5 text-xs ${muted}`} data-share-exclude>
          Sort
          <select value={sort} onChange={e => setSort(e.target.value as SortId)} className={selectCls} aria-label="Sort order">
            {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      }
      caption={
        <ChartA11yCaption
          title="Youth unemployment as a multiple of overall unemployment, latest year"
          unit="x"
          precision={2}
          rows={rows.map(r => ({ label: `${r.name} (youth ${r.youth.toFixed(1)}%, all ages ${r.total.toFixed(1)}%)`, value: r.multiple }))}
          extra={`Median youth multiple across the roster is ${stats.medMultiple.toFixed(1)}x.`}
        />
      }
      footnote={
        <>
          Live World Bank SL.UEM.TOTL.ZS (all ages 15+) and SL.UEM.1524.ZS (ages 15–24), both ILO modelled
          estimates, latest year where both are published ({oldestYear === newestYear ? newestYear : `${oldestYear}–${newestYear}`};
          {' '}{rows.length} of {COUNTRY_KEYS.length} roster countries{missing > 0 ? `, ${missing} without both series` : ''}).
          Quadrants split at the roster medians ({stats.medTotal.toFixed(1)}% all-ages rate, {stats.medMultiple.toFixed(1)}× multiple),
          so they describe position relative to this roster, not an absolute threshold. Changes compare with {BASELINE_YEAR},
          the last pre-pandemic year. Youth rates are a share of young people <em>in the labour force</em>, not of all young
          people, and across much of the world they only describe the formal sector — read them alongside Chapter 4&apos;s
          informality figures.
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

      <div className="flex flex-wrap gap-1.5 mb-4" data-share-exclude>
        {[{ id: 'all' as const, label: `All (${rows.length})` }, ...REGIONS.map(r => ({ id: r.id, label: `${r.label} (${rows.filter(x => x.region === r.id).length})` }))].map(r => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRegion(r.id)}
            className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
              region === r.id
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-500 font-medium'
                : `${border} ${muted} ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 min-w-0">
          <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] mb-2 ${muted}`}>
            <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TOTAL }} />All ages 15+</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: YOUTH }} />Ages 15–24</span>
            <span className="inline-flex items-center gap-1.5"><span className={`w-5 h-1 rounded-full ${isDarkMode ? 'bg-gray-500' : 'bg-gray-300'}`} />Youth gap</span>
            <span className="inline-flex items-center gap-1.5"><span className={`w-px h-3 border-l-2 border-dashed ${isDarkMode ? 'border-gray-400' : 'border-gray-500'}`} />Median youth rate {stats.medYouth.toFixed(1)}%</span>
            <span className="ml-auto hidden sm:inline">Click a row to pin it</span>
          </div>

          <div className={`grid ${gridCols} gap-x-2 items-end mb-1`}>
            <span />
            <span className={`text-[10px] uppercase tracking-wide ${muted}`}>Country</span>
            <div className="relative h-4">
              {ticks.map(v => (
                <span key={v} className={`absolute text-[10px] tabular-nums -translate-x-1/2 ${muted}`} style={{ left: pctOf(v) }}>{v}%</span>
              ))}
            </div>
            <span className={`text-[10px] uppercase tracking-wide text-right ${muted}`}>Youth / all</span>
            <span className={`text-[10px] uppercase tracking-wide text-right ${muted}`}>×</span>
          </div>

          <div className="relative">
            <div className={`absolute inset-y-0 grid ${gridCols} gap-x-2 w-full pointer-events-none`} aria-hidden="true">
              <span /><span />
              <div className="relative">
                {ticks.map(v => (
                  <span key={v} className={`absolute inset-y-0 border-l border-dashed ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} style={{ left: pctOf(v) }} />
                ))}
                <span className={`absolute inset-y-0 border-l-2 border-dashed ${isDarkMode ? 'border-gray-500' : 'border-gray-400'}`} style={{ left: pctOf(stats.medYouth) }} />
              </div>
            </div>

            <ol className="relative">
              {visible.map((r, i) => {
                const active = selected.key === r.key && (hovered === r.key || pinned === r.key);
                const tone = multipleTone(r.multiple);
                return (
                  <li
                    key={r.key}
                    onMouseEnter={() => setHovered(r.key)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setPinned(pinned === r.key ? null : r.key)}
                    title={`${r.name} (${r.year}): youth ${r.youth.toFixed(1)}%, all ages ${r.total.toFixed(1)}%, ${r.multiple.toFixed(1)}× multiple, ${r.gap.toFixed(1)}-point gap. ${QUADRANTS[stats.quadrant[r.key]].label}. ${regionLabel(r.region)}.`}
                    className={`grid ${gridCols} gap-x-2 items-center h-[24px] rounded cursor-pointer transition-colors ${
                      active ? (isDarkMode ? 'bg-gray-700/60' : 'bg-gray-100') : isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'
                    } ${pinned === r.key ? 'ring-1 ring-blue-500/40' : ''}`}
                  >
                    <span className={`text-[10px] tabular-nums text-right ${muted}`}>{i + 1}</span>
                    <span className="flex items-center gap-1.5 min-w-0">
                      <CountryFlag countryKey={r.key} className="w-4 h-3 shrink-0 rounded-[2px]" title={r.name} />
                      <span className={`text-xs truncate ${active ? `font-semibold ${strong}` : isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{r.name}</span>
                    </span>
                    <div className="relative h-3.5">
                      <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-px ${track}`} />
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-1 rounded-full ${isDarkMode ? 'bg-gray-500' : 'bg-gray-300'}`}
                        style={{ left: pctOf(Math.min(r.total, r.youth)), width: `calc(${pctOf(Math.max(r.total, r.youth))} - ${pctOf(Math.min(r.total, r.youth))})` }}
                      />
                      <span
                        className={`absolute top-1/2 w-2.5 h-2.5 -mt-[5px] -ml-[5px] rounded-full ring-2 ${isDarkMode ? 'ring-gray-800' : 'ring-white'}`}
                        style={{ left: pctOf(r.total), backgroundColor: TOTAL }}
                      />
                      <span
                        className={`absolute top-1/2 w-3 h-3 -mt-[6px] -ml-[6px] rounded-full ring-2 ${isDarkMode ? 'ring-gray-800' : 'ring-white'}`}
                        style={{ left: pctOf(r.youth), backgroundColor: YOUTH }}
                      />
                    </div>
                    <span className="flex items-baseline justify-end gap-1 text-xs tabular-nums whitespace-nowrap">
                      <span className="font-semibold" style={{ color: YOUTH }}>{r.youth.toFixed(1)}</span>
                      <span className={`text-[10px] ${muted}`}>/</span>
                      <span className="text-[11px]" style={{ color: TOTAL }}>{r.total.toFixed(1)}</span>
                    </span>
                    <span
                      className="justify-self-end text-[10px] font-semibold tabular-nums rounded px-1 py-px"
                      style={{ color: tone, backgroundColor: `${tone}1f` }}
                    >
                      {r.multiple.toFixed(1)}×
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className={`grid ${gridCols} gap-x-2 mt-1`}>
            <span /><span />
            <span className={`text-[10px] text-center ${muted}`}>Unemployment rate, % of the relevant labour force</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`rounded-lg border p-3 ${subtle}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <CountryFlag countryKey={selected.key} className="w-5 h-3.5 rounded-[2px] shrink-0" title={selected.name} />
              <span className={`text-sm font-semibold ${strong}`}>{selected.name}</span>
              <span className={`ml-auto text-[11px] ${muted}`}>{selected.year}</span>
            </div>
            <div className={`text-[11px] mb-2 ${muted}`}>
              {regionLabel(selected.region)}{pinned === selected.key ? ' · pinned' : hovered ? '' : ' · hover or click a row'}
            </div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label: 'Youth', value: `${selected.youth.toFixed(1)}%`, color: YOUTH },
                { label: 'All ages', value: `${selected.total.toFixed(1)}%`, color: TOTAL },
                { label: 'Gap', value: `${selected.gap.toFixed(1)}`, color: undefined },
                { label: 'Multiple', value: `${selected.multiple.toFixed(1)}×`, color: multipleTone(selected.multiple) },
              ].map(s => (
                <div key={s.label}>
                  <div className={`text-[10px] uppercase tracking-wide ${muted}`}>{s.label}</div>
                  <div className={`text-sm font-bold tabular-nums ${s.color ? '' : strong}`} style={s.color ? { color: s.color } : undefined}>{s.value}</div>
                </div>
              ))}
            </div>
            <div className="space-y-1 text-[11px] mb-2">
              <div className="flex justify-between gap-2"><span className={muted}>Youth since {BASELINE_YEAR}</span>{changeChip(selected.youth, selected.youthBase)}</div>
              <div className="flex justify-between gap-2"><span className={muted}>All ages since {BASELINE_YEAR}</span>{changeChip(selected.total, selected.totalBase)}</div>
            </div>
            <div className="h-28 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selected.history} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" type="number" domain={['dataMin', 'dataMax']} tick={{ fontSize: 9, fill: theme.axis }} stroke={theme.axis} tickCount={4} allowDecimals={false} />
                  <YAxis tick={{ fontSize: 9, fill: theme.axis }} stroke={theme.axis} width={32} tickCount={4} allowDecimals={false} interval={0} tickFormatter={v => `${v}%`} />
                  <ReferenceLine x={2020} stroke={theme.axis} strokeDasharray="2 3" label={{ value: 'COVID', position: 'insideTopRight', fontSize: 9, fill: theme.axis }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0]!.payload as Point;
                      return (
                        <div className={tooltipCls}>
                          <div className="font-semibold mb-0.5">{label}</div>
                          {p.youth != null && <div style={{ color: YOUTH }}>Youth {p.youth.toFixed(1)}%</div>}
                          {p.total != null && <div style={{ color: TOTAL }}>All ages {p.total.toFixed(1)}%</div>}
                        </div>
                      );
                    }}
                  />
                  <Line type="monotone" dataKey="youth" stroke={YOUTH} strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
                  <Line type="monotone" dataKey="total" stroke={TOTAL} strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-start gap-2 text-[11px]">
              <span className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: selectedQuadrant.color }} />
              <span className={body}>
                <span className="font-semibold" style={{ color: selectedQuadrant.color }}>{selectedQuadrant.label}.</span> {selectedQuadrant.note}.
              </span>
            </div>
          </div>

          <div className={`rounded-lg border p-3 ${subtle}`}>
            <div className={`text-sm font-semibold ${strong}`}>Average by region</div>
            <p className={`text-[11px] mb-2 ${muted}`}>Simple averages of roster countries. Click to filter the ranking.</p>
            <ul className="space-y-2">
              {stats.regions.map(reg => (
                <li key={reg.id}>
                  <button
                    type="button"
                    onClick={() => setRegion(region === reg.id ? 'all' : reg.id)}
                    className={`w-full text-left rounded px-1.5 py-1 -mx-1.5 transition-colors ${region === reg.id ? 'bg-blue-500/10' : isDarkMode ? 'hover:bg-gray-700/60' : 'hover:bg-white'}`}
                  >
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className={`font-medium ${strong}`}>{reg.label}</span>
                      <span className="tabular-nums">
                        <span className="font-semibold" style={{ color: YOUTH }}>{reg.avgYouth.toFixed(1)}</span>
                        <span className={muted}> / </span>
                        <span style={{ color: TOTAL }}>{reg.avgTotal.toFixed(1)}</span>
                        <span className="ml-1.5 font-semibold" style={{ color: multipleTone(reg.multiple) }}>{reg.multiple.toFixed(1)}×</span>
                      </span>
                    </div>
                    <div className={`relative h-2 rounded-full mt-1 ${track}`}>
                      <div
                        className={`absolute inset-y-0 rounded-full ${isDarkMode ? 'bg-gray-500' : 'bg-gray-300'}`}
                        style={{ left: pctOf(Math.min(reg.avgTotal, reg.avgYouth)), width: `calc(${pctOf(Math.max(reg.avgTotal, reg.avgYouth))} - ${pctOf(Math.min(reg.avgTotal, reg.avgYouth))})` }}
                      />
                      <span className="absolute top-0 w-2 h-2 -ml-1 rounded-full" style={{ left: pctOf(reg.avgTotal), backgroundColor: TOTAL }} />
                      <span className="absolute top-0 w-2 h-2 -ml-1 rounded-full" style={{ left: pctOf(reg.avgYouth), backgroundColor: YOUTH }} />
                    </div>
                    <div className={`text-[10px] mt-0.5 ${muted}`}>{reg.count} {reg.count === 1 ? 'country' : 'countries'}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {stats.baseCount > 0 && (
            <div className={`rounded-lg border p-3 ${subtle}`}>
              <div className={`text-sm font-semibold mb-1.5 ${strong}`}>Since {BASELINE_YEAR}</div>
              <div className="flex h-2.5 rounded-full overflow-hidden mb-1.5">
                <div className="bg-emerald-500" style={{ width: `${(stats.better / stats.baseCount) * 100}%` }} />
                <div className={isDarkMode ? 'bg-gray-500' : 'bg-gray-300'} style={{ width: `${((stats.baseCount - stats.better - stats.worse) / stats.baseCount) * 100}%` }} />
                <div className="bg-rose-500" style={{ width: `${(stats.worse / stats.baseCount) * 100}%` }} />
              </div>
              <div className="flex justify-between text-[11px] tabular-nums mb-2">
                <span className="text-emerald-500 font-medium">{stats.better} lower youth rate</span>
                <span className="text-rose-500 font-medium">{stats.worse} higher</span>
              </div>
              <ul className={`text-xs space-y-1 ${body}`}>
                {stats.biggestFall && stats.biggestFall.change < 0 && (
                  <li>
                    Biggest improvement: <span className={`font-medium ${strong}`}>{stats.biggestFall.name}</span>,{' '}
                    <span className="text-emerald-500 tabular-nums">{signed(stats.biggestFall.change)} pts</span> to {stats.biggestFall.youth.toFixed(1)}%.
                  </li>
                )}
                {stats.biggestRise && stats.biggestRise.change > 0 && (
                  <li>
                    Biggest deterioration: <span className={`font-medium ${strong}`}>{stats.biggestRise.name}</span>,{' '}
                    <span className="text-rose-500 tabular-nums">{signed(stats.biggestRise.change)} pts</span> to {stats.biggestRise.youth.toFixed(1)}%.
                  </li>
                )}
              </ul>
              <p className={`text-[10px] mt-1.5 ${muted}`}>Change in the youth rate; changes under half a point count as flat.</p>
            </div>
          )}
        </div>
      </div>

      <div className={`mt-6 pt-5 border-t ${border}`}>
        <div className={`text-sm font-semibold ${strong}`}>Weak economy, or two-tier labour market?</div>
        <p className={`text-xs mt-0.5 mb-3 max-w-3xl ${body}`}>
          Plotting the headline rate against the youth multiple separates the two stories. Dashed lines mark the roster
          medians. Top-left are economies where jobs exist but young people struggle to get in; top-right are economies
          where everyone struggles and the young struggle most.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 relative h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 16, right: 24, bottom: 28, left: 0 }}>
                <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="total"
                  domain={[0, xMax]}
                  ticks={xTicks}
                  tick={{ fontSize: 11, fill: theme.axis }}
                  stroke={theme.axis}
                  tickFormatter={v => `${v}%`}
                  label={{ value: 'All-ages unemployment rate', position: 'bottom', offset: 10, fill: theme.axis, fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="multiple"
                  domain={[0, yMax]}
                  ticks={yTicks}
                  tick={{ fontSize: 11, fill: theme.axis }}
                  stroke={theme.axis}
                  width={44}
                  tickFormatter={v => `${v}×`}
                  label={{ value: 'Youth multiple', angle: -90, position: 'insideLeft', offset: 12, fill: theme.axis, fontSize: 11 }}
                />
                <ReferenceLine x={stats.medTotal} stroke={theme.axis} strokeDasharray="4 4" />
                <ReferenceLine y={stats.medMultiple} stroke={theme.axis} strokeDasharray="4 4" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const r = payload[0]!.payload as Row;
                    const q = QUADRANTS[stats.quadrant[r.key]];
                    return (
                      <div className={tooltipCls}>
                        <div className="font-semibold mb-0.5">{r.name} <span className={muted}>({r.year})</span></div>
                        <div style={{ color: YOUTH }}>Youth {r.youth.toFixed(1)}%</div>
                        <div style={{ color: TOTAL }}>All ages {r.total.toFixed(1)}%</div>
                        <div>Multiple {r.multiple.toFixed(1)}×</div>
                        <div className="mt-0.5 font-medium" style={{ color: q.color }}>{q.label}</div>
                      </div>
                    );
                  }}
                />
                <Scatter
                  data={rows}
                  isAnimationActive={false}
                  onMouseEnter={(p: { payload?: Row }) => p.payload && setHovered(p.payload.key)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={(p: { payload?: Row }) => p.payload && setPinned(pinned === p.payload.key ? null : p.payload.key)}
                  shape={(props: unknown) => {
                    const { cx, cy, payload } = props as { cx?: number; cy?: number; payload?: Row };
                    if (cx == null || cy == null || !payload) return <g />;
                    const color = QUADRANTS[stats.quadrant[payload.key]].color;
                    const isSel = payload.key === selected.key;
                    return (
                      <g style={{ cursor: 'pointer' }}>
                        <circle cx={cx} cy={cy} r={isSel ? 7 : 5} fill={color} fillOpacity={isSel ? 1 : 0.8} stroke={isDarkMode ? '#1f2937' : '#fff'} strokeWidth={1.5} />
                        {labelled.has(payload.key) && (
                          <text x={cx + 8} y={cy + 3.5} fontSize={10} fontWeight={isSel ? 700 : 500} fill={isDarkMode ? '#e5e7eb' : '#374151'}>
                            {payload.name}
                          </text>
                        )}
                      </g>
                    );
                  }}
                >
                  {rows.map(r => <Cell key={r.key} fill={QUADRANTS[stats.quadrant[r.key]].color} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <span className="absolute top-5 left-14 text-[10px] font-semibold uppercase tracking-wide pointer-events-none" style={{ color: QUADRANTS.twoTier.color }}>↖ Two-tier</span>
            <span className="absolute top-5 right-8 text-[10px] font-semibold uppercase tracking-wide pointer-events-none" style={{ color: QUADRANTS.youthHeavy.color }}>Youth-heavy slack ↗</span>
            <span className="absolute bottom-[68px] left-14 text-[10px] font-semibold uppercase tracking-wide pointer-events-none" style={{ color: QUADRANTS.tight.color }}>↙ Tight and even</span>
            <span className="absolute bottom-[68px] right-8 text-[10px] font-semibold uppercase tracking-wide pointer-events-none" style={{ color: QUADRANTS.broad.color }}>Broad slack ↘</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 content-start">
            {stats.quadrants.map(q => (
              <div key={q.id} className={`rounded-lg border border-l-4 p-2.5 ${subtle}`} style={{ borderLeftColor: q.color }}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold" style={{ color: q.color }}>{q.label}</span>
                  <span className={`text-xs tabular-nums font-semibold ${strong}`}>{q.count}</span>
                </div>
                <div className={`text-[11px] ${body}`}>{q.note}.</div>
                {q.examples.length > 0 && (
                  <div className={`text-[10px] mt-0.5 ${muted}`}>e.g. {q.examples.join(', ')}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`mt-6 pt-5 border-t ${border} grid grid-cols-1 md:grid-cols-3 gap-4`}>
        {[
          {
            title: 'What the youth rate measures',
            points: [
              'The share of 15–24 year-olds who are looking for work and cannot find it, out of those in the labour force.',
              'Students who are not looking for work are excluded, so where most young people study, a small labour force can push the rate up.',
              `A ${HIGH_YOUTH_RATE}% youth rate therefore does not mean one in five young people are jobless; the NEET rate (not in employment, education or training) is the broader measure.`,
            ],
          },
          {
            title: 'Why youth rates run higher',
            points: [
              `Young people move between jobs more often and are often last in, first out, so a ${stats.medMultiple.toFixed(1)}× multiple is normal.`,
              'Strict protection for permanent contracts can create insiders and outsiders, a pattern long associated with Southern Europe.',
              'Weak school-to-work links (few apprenticeships, mismatched degrees) lengthen the search for a first job.',
            ],
          },
          {
            title: 'Caveats',
            points: [
              'Both series are ILO modelled estimates, which can differ from national survey figures.',
              'Where informal work dominates, few can afford to stay unemployed, so low rates can mask underemployment.',
              `Latest years run from ${oldestYear} to ${newestYear}; treat small differences between neighbours as ties.`,
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
