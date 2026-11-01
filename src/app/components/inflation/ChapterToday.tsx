'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Brush, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import InsightsStrip from '../heatmap/InsightsStrip';
import { generateInsights } from '../../utils/heatmap/insights';
import { smartDefaultYear } from '../../utils/heatmap/values';
import { COUNTRY_COLORS, COUNTRY_KEYS, type CountryKey } from '../../utils/countryMappings';
import { INFLATION_TARGETS } from '../../data/inflationTargets';
import { disinflationProgress, latestOf, peakSince, seriesOf, valueAt } from '../../utils/inflation/stats';
import { fetchImfInflationForecast } from '../../services/inflationData';
import {
  ChapterMeta,
  ChartLoading,
  CountryPicker,
  EmptyNote,
  INFLATION_DEF,
  Lede,
  Panel,
  Segmented,
  Stat,
  countryName,
  pct,
  pp,
  theme,
  useLazyFetch,
  type InflationChapterProps,
} from './ui';

type Period = '5y' | '10y' | '30y' | 'all';
const PERIODS: { id: Period; label: string }[] = [
  { id: '5y', label: '5 years' },
  { id: '10y', label: '10 years' },
  { id: '30y', label: '30 years' },
  { id: 'all', label: 'Since 1960' },
];
const PEAK_FROM = 2021;

export default function ChapterToday({ isDarkMode, data, selected, onSelectedChange }: InflationChapterProps) {
  const t = theme(isDarkMode);
  const rows = data.inflationRates;
  const year = useMemo(() => smartDefaultYear({ inflationRates: rows }, 'inflationRates'), [rows]);

  return (
    <div className="space-y-6">
      <Lede isDarkMode={isDarkMode}>
        Where inflation stands in {year ?? 'the latest year'}, how far each country has come back from its post-pandemic peak, and what
        the IMF expects next. Pick countries once and every chart on the page follows.
      </Lede>
      <CountryPicker isDarkMode={isDarkMode} selected={selected} onChange={onSelectedChange} />
      <SelectedStats isDarkMode={isDarkMode} data={data} selected={selected} />
      {year != null && (
        <InsightsStrip
          insights={generateInsights({ data: { inflationRates: rows }, metric: 'inflationRates', year, def: INFLATION_DEF })}
          year={year}
          isDarkMode={isDarkMode}
          onSelectCountry={(k) => !selected.includes(k) && onSelectedChange([...selected.slice(-7), k])}
        />
      )}
      <DisinflationRace isDarkMode={isDarkMode} data={data} selected={selected} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ForecastPanel isDarkMode={isDarkMode} data={data} selected={selected} />
        <CalculatorTeaser isDarkMode={isDarkMode} data={data} selected={selected} />
      </div>
      <HistoryLine isDarkMode={isDarkMode} data={data} selected={selected} onSelectedChange={onSelectedChange} />
      <p className={`text-[11px] ${t.textMuted}`}>Click a country name in the insights to add it to your selection.</p>
    </div>
  );
}

function SelectedStats({ isDarkMode, data, selected }: Pick<InflationChapterProps, 'isDarkMode' | 'data' | 'selected'>) {
  const rows = data.inflationRates;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {selected.map((k) => {
        const last = latestOf(rows, k);
        const prev = last ? valueAt(rows, k, last.year - 1) : null;
        const change = last && prev != null ? last.value - prev : null;
        const target = INFLATION_TARGETS[k].target;
        return (
          <Stat
            key={k}
            isDarkMode={isDarkMode}
            label={countryName(k)}
            value={pct(last?.value)}
            sub={
              <>
                {last ? `${last.year}, ${pp(change)} y/y` : 'no data'}
                {target != null && <> &middot; target {target}%</>}
              </>
            }
            tone={last && target != null && Math.abs(last.value - target) <= 1 ? 'text-emerald-500' : undefined}
          />
        );
      })}
    </div>
  );
}

function DisinflationRace({ isDarkMode, data, selected }: Pick<InflationChapterProps, 'isDarkMode' | 'data' | 'selected'>) {
  const t = theme(isDarkMode);
  const [scope, setScope] = useState<'all' | 'selected'>('all');
  const rows = useMemo(() => {
    const out: { key: CountryKey; peak: number; peakYear: number; latest: number; latestYear: number; target: number; progress: number }[] = [];
    for (const k of scope === 'all' ? COUNTRY_KEYS : selected) {
      const peak = peakSince(data.inflationRates, k, PEAK_FROM);
      const last = latestOf(data.inflationRates, k, PEAK_FROM + 1);
      const target = INFLATION_TARGETS[k].target ?? 2;
      if (!peak || !last) continue;
      const progress = disinflationProgress(peak.value, last.value, target);
      if (progress == null) continue;
      out.push({ key: k, peak: peak.value, peakYear: peak.year, latest: last.value, latestYear: last.year, target, progress });
    }
    return out.sort((a, b) => b.progress - a.progress);
  }, [data.inflationRates, scope, selected]);

  // Square-root scale so Türkiye's and Argentina's peaks don't flatten everyone else.
  const max = Math.max(10, ...rows.map((r) => r.peak));
  const x = (v: number) => `${(Math.sqrt(Math.max(0, v)) / Math.sqrt(max)) * 100}%`;
  const title = 'The disinflation race';

  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle={`Peak inflation since ${PEAK_FROM} (red), latest reading (blue) and the central bank target (tick). Sorted by how much of the gap back to target has closed.`}
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
      note="Countries without a numeric target are measured against 2%. Above 100% means inflation has fallen below target. Square-root scale."
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['wb-inflation', 'inflation-targets-curated']}
        download={{
          filename: 'disinflation-race',
          title,
          getData: () =>
            rows.map((r) => ({ country: countryName(r.key), peak: r.peak, peakYear: r.peakYear, latest: r.latest, latestYear: r.latestYear, target: r.target, progressPct: +(r.progress * 100).toFixed(1) })),
        }}
      />
      {!rows.length ? (
        <EmptyNote isDarkMode={isDarkMode}>No country in this selection had inflation above target after {PEAK_FROM}.</EmptyNote>
      ) : (
        <div data-chart-container data-chart-title={title} className="overflow-y-auto pr-1" style={{ maxHeight: 560 }}>
          <ol className="space-y-1.5">
            {rows.map((r, i) => {
              const done = Math.min(1, Math.max(0, r.progress));
              return (
                <li key={r.key} className="grid grid-cols-[1.5rem_7.5rem_1fr_4.5rem] items-center gap-2 text-xs">
                  <span className={`tabular-nums text-right ${t.textMuted}`}>{i + 1}</span>
                  <span className={`truncate ${selected.includes(r.key) ? `font-semibold ${t.accent}` : t.text}`}>{countryName(r.key)}</span>
                  <span
                    className={`relative h-4 rounded ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}
                    title={`${countryName(r.key)}: peak ${pct(r.peak)} (${r.peakYear}), latest ${pct(r.latest)} (${r.latestYear}), target ${r.target}%`}
                  >
                    <span className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-gray-400/60" style={{ left: x(Math.min(r.latest, r.peak)), right: `calc(100% - ${x(r.peak)})` }} />
                    <span className="absolute top-0 bottom-0 w-0.5 bg-emerald-500" style={{ left: x(r.target) }} />
                    <span className="absolute top-1/2 w-2.5 h-2.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-rose-500" style={{ left: x(r.peak) }} />
                    <span className="absolute top-1/2 w-2.5 h-2.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-blue-500 ring-2 ring-white/60" style={{ left: x(r.latest) }} />
                  </span>
                  <span className={`tabular-nums text-right font-medium ${done >= 1 ? 'text-emerald-500' : t.text}`}>{Math.round(r.progress * 100)}%</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </Panel>
  );
}

function ForecastPanel({ isDarkMode, data, selected }: Pick<InflationChapterProps, 'isDarkMode' | 'data' | 'selected'>) {
  const t = theme(isDarkMode);
  const { data: weo, loading, failed } = useLazyFetch(true, fetchImfInflationForecast);
  const covered = useMemo(() => selected.filter((k) => weo?.byCountry[k]), [weo, selected]);
  const thisYear = new Date().getFullYear();

  const chart = useMemo(() => {
    if (!weo) return [];
    const byYear = new Map<number, Record<string, number>>();
    const put = (year: number, k: string, v: number) => {
      const row = byYear.get(year) ?? { year };
      row[k] = v;
      byYear.set(year, row);
    };
    for (const k of covered) {
      const actual = seriesOf(data.inflationRates, k).filter((o) => o.year >= 2015);
      for (const o of actual) put(o.year, k, o.value);
      const lastActual = actual[actual.length - 1]?.year ?? 0;
      const f = weo.byCountry[k];
      for (const [y, v] of Object.entries(f)) {
        const yr = Number(y);
        if (yr > lastActual) put(yr, `${k}__f`, v);
        if (yr === lastActual) put(yr, `${k}__f`, valueAt(data.inflationRates, k, yr) ?? v);
      }
      if (lastActual && !f[lastActual]) {
        const v = valueAt(data.inflationRates, k, lastActual);
        if (v != null) put(lastActual, `${k}__f`, v);
      }
    }
    const world = weo.byCountry.World;
    if (world) for (const [y, v] of Object.entries(world)) put(Number(y), 'World', v);
    return [...byYear.values()].sort((a, b) => a.year - b.year);
  }, [weo, covered, data.inflationRates]);

  const title = 'IMF inflation outlook';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle={`World Bank actuals (solid) and IMF World Economic Outlook projections (dashed)${weo?.edition ? `, ${weo.edition} edition` : ''}.`}
      note={
        selected.length > covered.length && weo
          ? `The IMF series here covers 30 large economies; not shown: ${selected.filter((k) => !covered.includes(k)).map(countryName).join(', ')}.`
          : 'The grey line is the IMF world aggregate.'
      }
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['imf-weo-inflation', 'wb-inflation']}
        download={{ filename: 'imf-inflation-outlook', title, getData: () => chart }}
      />
      {loading || (!weo && !failed) ? (
        <ChartLoading isDarkMode={isDarkMode} height={300} />
      ) : failed || !chart.length ? (
        <EmptyNote isDarkMode={isDarkMode}>IMF projections are unavailable right now.</EmptyNote>
      ) : (
        <div data-chart-container data-chart-title={title} style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
              <XAxis dataKey="year" type="number" domain={['dataMin', 'dataMax']} allowDecimals={false} stroke={t.axis} tick={{ fontSize: 11 }} />
              <YAxis stroke={t.axis} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} width={44} />
              <Tooltip
                contentStyle={t.tooltip}
                formatter={(v: number, name: string) => [pct(v), name.endsWith('__f') ? `${countryName(name.slice(0, -3))} (IMF)` : countryName(name)]}
              />
              <ReferenceLine x={thisYear} stroke={t.axis} strokeDasharray="2 4" label={{ value: 'now', fill: t.axis, fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceLine y={2} stroke="#10b981" strokeDasharray="5 4" />
              <Line dataKey="World" stroke="#9ca3af" strokeWidth={1.5} dot={false} isAnimationActive={false} connectNulls />
              {covered.map((k) => (
                <Line key={k} dataKey={k} stroke={COUNTRY_COLORS[k]} strokeWidth={2} dot={false} isAnimationActive={false} connectNulls />
              ))}
              {covered.map((k) => (
                <Line key={`${k}-f`} dataKey={`${k}__f`} stroke={COUNTRY_COLORS[k]} strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} connectNulls legendType="none" />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}

function CalculatorTeaser({ isDarkMode, data, selected }: Pick<InflationChapterProps, 'isDarkMode' | 'data' | 'selected'>) {
  const t = theme(isDarkMode);
  const country = selected.find((k) => seriesOf(data.cpiData, k).some((o) => o.year === 2000)) ?? 'USA';
  const base = valueAt(data.cpiData, country, 2000);
  const last = latestOf(data.cpiData, country);
  const worth = base && last ? (100 * last.value) / base : null;
  const href = `/inflation-calculator?amount=100&from=2000${last ? `&to=${last.year}` : ''}&c=${country}`;
  return (
    <div
      className={`rounded-xl border p-5 flex flex-col justify-between gap-4 ${
        isDarkMode ? 'bg-gradient-to-br from-gray-800 to-blue-900/40 border-gray-700' : 'bg-gradient-to-br from-blue-50 to-white border-blue-100'
      }`}
    >
      <div>
        <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${t.accent}`}>Inflation calculator</div>
        <h3 className={`text-xl font-semibold mb-2 ${t.text}`}>What&rsquo;s your money worth?</h3>
        <p className={`text-sm ${t.textSec}`}>
          {worth && last ? (
            <>
              In {countryName(country)}, 100 units of local currency in 2000 buys what{' '}
              <span className={`font-semibold tabular-nums ${t.text}`}>{worth.toFixed(0)}</span> buys in {last.year}. Prices have multiplied{' '}
              {(worth / 100).toFixed(2)}&times;.
            </>
          ) : (
            'Convert any amount between years for 47 countries, compare countries side by side, or work backwards from today.'
          )}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={href} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Open the calculator <span aria-hidden>&rarr;</span>
        </Link>
        <Link
          href="/inflation-calculator?mode=compare"
          className={`inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium ${isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          Compare countries
        </Link>
      </div>
    </div>
  );
}

function HistoryLine({ isDarkMode, data, selected, onSelectedChange }: InflationChapterProps) {
  const t = theme(isDarkMode);
  const [period, setPeriod] = useState<Period>('30y');
  const endYear = new Date().getFullYear();
  const startYear = period === '5y' ? endYear - 5 : period === '10y' ? endYear - 10 : period === '30y' ? endYear - 30 : 1960;
  const chart = useMemo(
    () =>
      (data.inflationRates ?? [])
        .filter((r) => Number(r.year) >= startYear)
        .map((r) => {
          const row: Record<string, number> = { year: Number(r.year) };
          for (const k of selected) if (typeof r[k] === 'number') row[k] = r[k] as number;
          return row;
        }),
    [data.inflationRates, selected, startYear],
  );
  const title = 'Inflation rate over time';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle="Annual consumer-price inflation. Drag the handles under the chart to zoom into a period."
      actions={<Segmented isDarkMode={isDarkMode} value={period} onChange={setPeriod} options={PERIODS} label="Period" />}
    >
      <ChapterMeta isDarkMode={isDarkMode} sourceIds={['wb-inflation']} download={{ filename: 'inflation-rate-over-time', title, getData: () => chart }} />
      <div className="mb-3">
        <CountryPicker isDarkMode={isDarkMode} selected={selected} onChange={onSelectedChange} />
      </div>
      {!selected.length ? (
        <EmptyNote isDarkMode={isDarkMode}>Pick at least one country.</EmptyNote>
      ) : (
        <div data-chart-container data-chart-title={title} className="h-[320px] sm:h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
              <XAxis dataKey="year" stroke={t.axis} tick={{ fontSize: 11 }} />
              <YAxis stroke={t.axis} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} width={48} />
              <Tooltip contentStyle={t.tooltip} formatter={(v: number, n: string) => [pct(v, 2), countryName(n)]} />
              <Legend formatter={(v: string) => countryName(v)} wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={2} stroke="#10b981" strokeDasharray="5 4" />
              {selected.map((k) => (
                <Line key={k} type="monotone" dataKey={k} stroke={COUNTRY_COLORS[k]} strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} connectNulls />
              ))}
              {chart.length > 15 && <Brush dataKey="year" height={24} travellerWidth={10} stroke={isDarkMode ? '#60a5fa' : '#2563eb'} fill={isDarkMode ? '#1f2937' : '#f9fafb'} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}
