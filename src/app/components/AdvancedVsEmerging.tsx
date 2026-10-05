'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';
import {
  CURRENT_YEAR, PREV_YEAR, doublingYears, lastYearOf, mean, pct, pp, outlookTheme,
  type Economy, type OutlookSeries,
} from '../lib/outlook';

const IsoFlag = dynamic(() => import('./IsoFlag'), {
  ssr: false,
  loading: () => <span className="inline-block w-5 h-3.5 rounded-sm bg-gray-200 dark:bg-gray-700" aria-hidden="true" />,
});

const TITLE = 'Advanced vs Emerging Economies';
const FIRST_YEAR = 2020;
const COLORS = { advanced: '#3b82f6', emerging: '#f59e0b', world: '#9ca3af', gap: '#a78bfa' };

const BELLWETHERS = {
  advanced: ['USA', 'EURO', 'Japan', 'UK', 'Canada', 'SouthKorea', 'Australia'],
  emerging: ['China', 'India', 'Brazil', 'Russia', 'Mexico', 'Indonesia', 'Turkey', 'SaudiArabia'],
};

const SUB_BLOCS = {
  advanced: [['MAE', 'G7'], ['EURO', 'Euro area'], ['OAE', 'Other advanced']],
  emerging: [['DA', 'Emerging Asia'], ['WE', 'Latin America'], ['SSA', 'Sub-Saharan Africa']],
} as const;

interface Props {
  isDarkMode: boolean;
  series: OutlookSeries;
  economy: (key: string) => Economy;
}

export default function AdvancedVsEmerging({ isDarkMode, series, economy }: Props) {
  const [metric, setMetric] = useState<'gdp' | 'inflation'>('gdp');
  const t = outlookTheme(isDarkMode);
  const activeMetric = metric === 'inflation' && !series.hasGroupInflation ? 'gdp' : metric;

  const { growth, inflation } = useMemo(() => ({
    growth: { advanced: series.gdp.get('ADVEC'), emerging: series.gdp.get('OEMDC'), world: series.gdp.get('WEOWORLD') },
    inflation: { advanced: series.inflation.get('ADVEC'), emerging: series.inflation.get('OEMDC'), world: series.inflation.get('WEOWORLD') },
  }), [series]);

  const lastYear = lastYearOf(growth.advanced) ?? CURRENT_YEAR + 3;

  const chartData = useMemo(() => {
    const src = activeMetric === 'gdp' ? growth : inflation;
    const rows: { year: number; advanced?: number; emerging?: number; world?: number; gap?: number }[] = [];
    for (let year = FIRST_YEAR; year <= lastYear; year++) {
      const a = src.advanced?.[year];
      const e = src.emerging?.[year];
      if (a === undefined && e === undefined) continue;
      rows.push({
        year,
        advanced: a,
        emerging: e,
        world: src.world?.[year],
        gap: a !== undefined && e !== undefined ? Math.round((e - a) * 10) / 10 : undefined,
      });
    }
    return rows;
  }, [growth, inflation, activeMetric, lastYear]);

  const yTicks = useMemo(() => {
    const values = chartData.flatMap(r => [r.advanced, r.emerging, r.world, r.gap]).filter((v): v is number => typeof v === 'number');
    if (!values.length) return undefined;
    const lo = Math.min(0, ...values);
    const hi = Math.max(...values);
    const step = hi - lo > 16 ? 4 : 2;
    const ticks: number[] = [];
    for (let v = Math.floor(lo / step) * step; v < hi + step; v += step) ticks.push(v);
    return ticks;
  }, [chartData]);

  const facts = useMemo(() => {
    const ae = growth.advanced;
    const em = growth.emerging;
    if (!ae || !em) return null;
    const at = (v: Record<number, number> | undefined, y: number) => (v && typeof v[y] === 'number' ? v[y] : null);
    const gapAt = (y: number) => {
      const a = at(ae, y), e = at(em, y);
      return a != null && e != null ? e - a : null;
    };
    const historical = Object.keys(ae).map(Number).filter(y => y >= FIRST_YEAR && y < CURRENT_YEAR && at(em, y) != null);
    const mtAe = mean(ae, CURRENT_YEAR + 1, lastYear);
    const mtEm = mean(em, CURRENT_YEAR + 1, lastYear);

    const infAe = inflation.advanced;
    const infEm = inflation.emerging;
    const peakOf = (v: Record<number, number> | undefined) => {
      if (!v) return null;
      const past = Object.entries(v).map(([y, val]) => [Number(y), val] as const).filter(([y]) => y >= FIRST_YEAR && y < CURRENT_YEAR);
      return past.length ? past.reduce((best, cur) => (cur[1] > best[1] ? cur : best)) : null;
    };

    return {
      aeNow: at(ae, CURRENT_YEAR),
      aePrev: at(ae, PREV_YEAR),
      emNow: at(em, CURRENT_YEAR),
      emPrev: at(em, PREV_YEAR),
      worldNow: at(growth.world, CURRENT_YEAR),
      gapNow: gapAt(CURRENT_YEAR),
      gapPrev: gapAt(PREV_YEAR),
      gapLast: gapAt(lastYear),
      mtAe,
      mtEm,
      historicalYears: historical.length,
      emAheadYears: historical.filter(y => at(em, y)! > at(ae, y)!).length,
      infAeNow: at(infAe, CURRENT_YEAR),
      infEmNow: at(infEm, CURRENT_YEAR),
      infAeLast: at(infAe, lastYear),
      infEmLast: at(infEm, lastYear),
      infAePeak: peakOf(infAe),
      infEmPeak: peakOf(infEm),
    };
  }, [growth, inflation, lastYear]);

  const bellwethers = useMemo(() => {
    const build = (keys: string[]) =>
      keys
        .map(key => {
          const g = series.gdp.get(key)?.[CURRENT_YEAR];
          if (typeof g !== 'number') return null;
          const e = economy(key);
          return {
            key,
            name: key === 'EURO' ? 'Euro area' : e.name,
            iso2: key === 'EURO' ? 'EU' : e.iso2,
            growth: g,
            inflation: series.inflation.get(key)?.[CURRENT_YEAR] ?? null,
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .sort((a, b) => b.growth - a.growth);
    const advanced = build(BELLWETHERS.advanced);
    const emerging = build(BELLWETHERS.emerging);
    const scale = Math.max(1, ...[...advanced, ...emerging].map(r => Math.abs(r.growth)));
    return { advanced, emerging, scale };
  }, [series, economy]);

  if (!facts) return null;

  const trend = (now: number | null, before: number | null) => {
    if (now == null || before == null) return null;
    const d = now - before;
    return Math.abs(d) < 0.05 ? 'steady' : d > 0 ? 'widening' : 'narrowing';
  };
  const gapTrend = trend(facts.gapNow, facts.gapPrev);
  const toggleClass = (active: boolean) => `px-3 py-1 ${active ? 'bg-blue-500/20 text-blue-500' : t.textSec}`;

  const tiles = [
    {
      label: `Advanced economies, ${CURRENT_YEAR}`,
      value: pct(facts.aeNow),
      detail: `${pp(facts.aeNow != null && facts.aePrev != null ? facts.aeNow - facts.aePrev : null)} vs ${PREV_YEAR}`,
      color: COLORS.advanced,
    },
    {
      label: `Emerging & developing, ${CURRENT_YEAR}`,
      value: pct(facts.emNow),
      detail: `${pp(facts.emNow != null && facts.emPrev != null ? facts.emNow - facts.emPrev : null)} vs ${PREV_YEAR}`,
      color: COLORS.emerging,
    },
    {
      label: 'Growth gap',
      value: facts.gapNow != null ? `${facts.gapNow.toFixed(1)} pp` : '—',
      detail: facts.gapPrev != null ? `${facts.gapPrev.toFixed(1)} pp in ${PREV_YEAR}${gapTrend ? ` · ${gapTrend}` : ''}` : 'Emerging minus advanced',
      color: COLORS.gap,
    },
    facts.infEmNow != null && facts.infAeNow != null
      ? {
          label: `Inflation, ${CURRENT_YEAR}`,
          value: `${facts.infEmNow.toFixed(1)}% vs ${facts.infAeNow.toFixed(1)}%`,
          detail: 'Emerging vs advanced',
          color: '#ef4444',
        }
      : {
          label: `World growth, ${CURRENT_YEAR}`,
          value: pct(facts.worldNow),
          detail: 'IMF world aggregate',
          color: COLORS.world,
        },
  ];

  const takeaways: string[] = [];
  if (facts.gapNow != null && facts.emNow != null && facts.aeNow != null) {
    let s = `Emerging and developing economies are projected to grow ${facts.gapNow.toFixed(1)} percentage points faster than advanced economies in ${CURRENT_YEAR} (${pct(facts.emNow)} against ${pct(facts.aeNow)}).`;
    if (facts.gapPrev != null && gapTrend) {
      s += ` That is ${gapTrend === 'steady' ? 'unchanged from' : gapTrend === 'widening' ? 'up from' : 'down from'} ${facts.gapPrev.toFixed(1)} pp in ${PREV_YEAR}.`;
    }
    const laterTrend = trend(facts.gapLast, facts.gapNow);
    if (facts.gapLast != null && laterTrend && lastYear > CURRENT_YEAR) {
      s += ` The IMF sees the gap ${laterTrend === 'steady' ? `holding near ${facts.gapLast.toFixed(1)} pp through` : `${laterTrend} to ${facts.gapLast.toFixed(1)} pp by`} ${lastYear}.`;
    }
    takeaways.push(s);
  }
  if (facts.mtAe != null && facts.mtEm != null && facts.mtAe > 0 && facts.mtEm > 0) {
    takeaways.push(
      `At their average projected pace for ${CURRENT_YEAR + 1}–${lastYear} (${pct(facts.mtEm)} and ${pct(facts.mtAe)} a year), emerging economies would double their output in about ${Math.round(doublingYears(facts.mtEm))} years; advanced economies would take about ${Math.round(doublingYears(facts.mtAe))}.`
    );
  }
  if (facts.historicalYears >= 3) {
    takeaways.push(
      `Emerging economies grew faster than advanced ones (or shrank less, as in ${FIRST_YEAR}) in ${facts.emAheadYears} of the ${facts.historicalYears} years from ${FIRST_YEAR} to ${PREV_YEAR}.`
    );
  }
  if (facts.infAePeak && facts.infEmPeak && facts.infAeNow != null && facts.infEmNow != null) {
    takeaways.push(
      `Inflation peaked at ${pct(facts.infEmPeak[1])} in emerging economies (${facts.infEmPeak[0]}) and ${pct(facts.infAePeak[1])} in advanced economies (${facts.infAePeak[0]}). The IMF projects ${pct(facts.infEmNow)} and ${pct(facts.infAeNow)} for ${CURRENT_YEAR}${
        facts.infEmLast != null && facts.infAeLast != null ? `, easing to ${pct(facts.infEmLast)} and ${pct(facts.infAeLast)} by ${lastYear}` : ''
      }.`
    );
  }

  const renderBellwethers = (side: 'advanced' | 'emerging') => {
    const rows = bellwethers[side];
    const color = COLORS[side];
    const blocs = SUB_BLOCS[side]
      .map(([code, label]) => [label, series.gdp.get(code)?.[CURRENT_YEAR]] as const)
      .filter(([, v]) => typeof v === 'number');
    return (
      <div className={`rounded-lg border p-4 ${t.subtle}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-sm font-semibold">{side === 'advanced' ? 'Advanced economies' : 'Emerging & developing economies'}</h3>
        </div>
        {blocs.length > 0 && (
          <p className={`text-[11px] mb-3 ${t.textSec}`}>
            {blocs.map(([label, v]) => `${label} ${pct(v as number)}`).join(' · ')}
          </p>
        )}
        <div className="space-y-2">
          {rows.map(r => (
            <div key={r.key} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 min-w-0">
                {r.iso2 && <IsoFlag iso2={r.iso2} title={r.name} className="w-5 h-3.5 shrink-0" />}
                <span className="truncate" title={r.name}>{r.name}</span>
              </span>
              <span className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${(Math.abs(r.growth) / bellwethers.scale) * 100}%`, backgroundColor: r.growth < 0 ? '#ef4444' : color }}
                />
              </span>
              <span className="tabular-nums text-right whitespace-nowrap">
                <span className="font-semibold">{pct(r.growth)}</span>
                {r.inflation != null && (
                  <span
                    className={`ml-1.5 ${r.inflation >= 10 ? 'text-red-500 font-medium' : r.inflation >= 5 ? 'text-amber-500' : t.textSec}`}
                    title={r.inflation >= 5 ? 'Inflation well above typical 2–3% central-bank targets' : undefined}
                  >
                    · {pct(r.inflation)} infl.
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div id={slugify(TITLE)} className={`rounded-xl border p-6 mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
        <h2 className="text-xl font-semibold">{TITLE}</h2>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className={`inline-flex rounded border overflow-hidden text-xs ${t.toggleBorder}`} data-share-exclude>
            <button type="button" onClick={() => setMetric('gdp')} className={toggleClass(activeMetric === 'gdp')}>GDP growth</button>
            <button
              type="button"
              onClick={() => setMetric('inflation')}
              disabled={!series.hasGroupInflation}
              title={series.hasGroupInflation ? undefined : 'Bloc inflation needs the live IMF feed'}
              className={`${toggleClass(activeMetric === 'inflation')} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Inflation
            </button>
          </div>
          <SocialShareMenu title={TITLE} isDarkMode={isDarkMode} />
        </div>
      </div>
      <p className={`text-sm mb-5 ${t.textSec}`}>
        The IMF splits the world into about 40 advanced economies and around 155 emerging market and developing
        economies. Bloc figures weight each economy by its size at purchasing-power parity.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {tiles.map(tile => (
          <div key={tile.label} className={`rounded-lg border p-3 ${t.subtle}`} style={{ borderTopColor: tile.color, borderTopWidth: 3 }}>
            <p className={`text-[11px] uppercase tracking-wide ${t.textSec}`}>{tile.label}</p>
            <p className="text-2xl font-bold tabular-nums mt-0.5">{tile.value}</p>
            <p className={`text-xs ${t.textSec}`}>{tile.detail}</p>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-semibold mb-2">
        {activeMetric === 'gdp' ? 'Real GDP growth' : 'Inflation'}, {FIRST_YEAR}–{lastYear}
      </h3>
      <div className="h-[340px] sm:h-[380px] mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
            <XAxis dataKey="year" stroke={t.axis} tick={{ fontSize: 11 }} />
            <YAxis
              stroke={t.axis}
              tick={{ fontSize: 11 }}
              ticks={yTicks}
              domain={yTicks ? [yTicks[0], yTicks[yTicks.length - 1]] : undefined}
              tickFormatter={(v: number) => `${v}%`}
            />
            <ReferenceArea
              x1={CURRENT_YEAR}
              x2={lastYear}
              fill={isDarkMode ? '#ffffff' : '#000000'}
              fillOpacity={0.04}
              label={{ value: 'IMF projections', position: 'insideTop', fill: t.axis, fontSize: 10 }}
            />
            <Tooltip
              contentStyle={t.tooltip}
              formatter={(value: any, name: any) => [name.startsWith('Gap') ? pp(Number(value)) : pct(Number(value)), name]}
              labelFormatter={(y: any) => (Number(y) >= CURRENT_YEAR ? `${y} (projection)` : Number(y) === PREV_YEAR ? `${y} (estimate)` : String(y))}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="gap" name="Gap: emerging minus advanced (pp)" fill={COLORS.gap} fillOpacity={0.35} barSize={14} />
            <Line type="monotone" dataKey="advanced" name="Advanced economies" stroke={COLORS.advanced} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
            <Line type="monotone" dataKey="emerging" name="Emerging & developing" stroke={COLORS.emerging} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
            <Line type="monotone" dataKey="world" name="World" stroke={COLORS.world} strokeWidth={1.5} strokeDasharray="5 4" dot={false} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-[11px] mb-6 ${t.textSec}`}>
        Shaded years are IMF projections; {PREV_YEAR} is an estimate. Purple bars show how far emerging economies are ahead (above zero) or behind.
      </p>

      <h3 className="text-sm font-semibold mb-1">Bellwether economies, {CURRENT_YEAR}</h3>
      <p className={`text-xs mb-3 ${t.textSec}`}>Projected real GDP growth, with inflation alongside (amber at 5% or more, red at 10% or more). The line under each heading shows the main sub-groups.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {renderBellwethers('advanced')}
        {renderBellwethers('emerging')}
      </div>

      {takeaways.length > 0 && (
        <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
          <h3 className="text-sm font-semibold mb-2">Key takeaways</h3>
          <ul className={`list-disc pl-5 space-y-1.5 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {takeaways.map(s => <li key={s}>{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
