'use client';

import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ScatterPlot, TrendLines } from '../development/charts';
import { COUNTRY_KEYS, type CountryKey } from '../../utils/countryMappings';
import { INFLATION_EPISODES, HYPERINFLATION_CASES, type HyperinflationCase } from '../../data/inflationEpisodes';
import { NO_DATA_COLOR, STRIPE_BINS, binFor, sortStripeRows, stripeRows, type StripeSort } from '../../utils/inflation/stripes';
import { decadeStats, kde, median, seriesOf } from '../../utils/inflation/stats';
import { ChapterMeta, EmptyNote, Lede, Panel, Segmented, compactPct, countryName, pct, theme, type InflationChapterProps } from './ui';

const FIRST_YEAR = 1960;
const DECADES = [1960, 1970, 1980, 1990, 2000, 2010, 2020] as const;

export default function ChapterHistory({ isDarkMode, data, selected }: InflationChapterProps) {
  const [episodeId, setEpisodeId] = useState(INFLATION_EPISODES[INFLATION_EPISODES.length - 2].id);
  const episode = INFLATION_EPISODES.find((e) => e.id === episodeId) ?? null;
  return (
    <div className="space-y-6">
      <Lede isDarkMode={isDarkMode}>
        Every country&rsquo;s inflation since 1960 as a strip of colour, the episodes that shaped it, how stable each decade was, and the
        handful of times prices ran completely out of control.
      </Lede>
      <StripesPanel isDarkMode={isDarkMode} data={data} highlight={episode?.countries ?? []} />
      <EpisodesPanel isDarkMode={isDarkMode} data={data} episodeId={episodeId} onEpisode={setEpisodeId} />
      <div className="grid gap-6 lg:grid-cols-2">
        <StabilityPanel isDarkMode={isDarkMode} data={data} selected={selected} />
        <DistributionsPanel isDarkMode={isDarkMode} data={data} />
      </div>
      <HyperinflationPanel isDarkMode={isDarkMode} data={data} />
    </div>
  );
}

function StripesPanel({ isDarkMode, data, highlight }: { isDarkMode: boolean; data: InflationChapterProps['data']; highlight: CountryKey[] }) {
  const t = theme(isDarkMode);
  const [sort, setSort] = useState<StripeSort>('region');
  const [hover, setHover] = useState<{ key: CountryKey; year: number; value: number | null } | null>(null);
  const lastYear = useMemo(() => Math.max(FIRST_YEAR, ...(data.inflationRates ?? []).map((r) => Number(r.year))), [data.inflationRates]);
  const rows = useMemo(
    () => sortStripeRows(stripeRows(data.inflationRates, COUNTRY_KEYS, FIRST_YEAR, lastYear), sort),
    [data.inflationRates, lastYear, sort],
  );
  const years = Array.from({ length: lastYear - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i);
  const empty = isDarkMode ? NO_DATA_COLOR.dark : NO_DATA_COLOR.light;
  const title = 'Inflation stripes';

  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle={`One row per country, one cell per year, ${FIRST_YEAR}-${lastYear}. Blue is deflation, pale is near typical targets, dark red is runaway inflation.`}
      actions={
        <Segmented
          isDarkMode={isDarkMode}
          value={sort}
          onChange={setSort}
          label="Sort rows"
          options={[
            { id: 'region', label: 'By region' },
            { id: 'average', label: 'Highest average' },
            { id: 'volatility', label: 'Most volatile' },
          ]}
        />
      }
      note="Grey cells are years with no World Bank observation. Countries in the selected episode below are outlined."
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['wb-inflation']}
        download={{
          filename: 'inflation-stripes',
          title,
          getData: () => rows.map((r) => ({ country: countryName(r.key), ...Object.fromEntries(years.map((y, i) => [y, r.cells[i]])) })),
        }}
      />
      <div className={`text-xs h-5 mb-1 tabular-nums ${t.textSec}`} aria-live="polite">
        {hover ? (
          <>
            <span className={`font-semibold ${t.text}`}>{countryName(hover.key)}</span> {hover.year}: {hover.value == null ? 'no data' : pct(hover.value)}
          </>
        ) : (
          'Hover a cell for the exact rate.'
        )}
      </div>
      <div data-chart-container data-chart-title={title} className="overflow-x-auto" onMouseLeave={() => setHover(null)}>
        <div className="min-w-[640px]">
          {rows.map((r) => {
            const hl = highlight.includes(r.key);
            return (
              <div key={r.key} className="flex items-center gap-2">
                <span className={`w-28 shrink-0 truncate text-[10px] leading-3 ${hl ? `font-semibold ${t.accent}` : t.textSec}`}>{countryName(r.key)}</span>
                <div className={`flex flex-1 h-3 ${hl ? 'outline outline-1 outline-blue-500 rounded-sm' : ''}`}>
                  {r.cells.map((v, i) => (
                    <span
                      key={years[i]}
                      className="flex-1"
                      style={{ backgroundColor: binFor(v)?.color ?? empty }}
                      onMouseEnter={() => setHover({ key: r.key, year: years[i], value: v })}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-2 mt-1">
            <span className="w-28 shrink-0" />
            <div className={`flex flex-1 text-[10px] ${t.textMuted}`}>
              {years.map((y) => (
                <span key={y} className="flex-1 overflow-visible whitespace-nowrap">
                  {y % 10 === 0 ? y : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
        {STRIPE_BINS.map((b) => (
          <span key={b.id} className={`inline-flex items-center gap-1 text-[11px] ${t.textSec}`}>
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: b.color }} />
            {b.label}
          </span>
        ))}
      </div>
    </Panel>
  );
}

function EpisodesPanel({
  isDarkMode,
  data,
  episodeId,
  onEpisode,
}: {
  isDarkMode: boolean;
  data: InflationChapterProps['data'];
  episodeId: string;
  onEpisode: (id: string) => void;
}) {
  const t = theme(isDarkMode);
  const episode = INFLATION_EPISODES.find((e) => e.id === episodeId)!;
  const peak = Math.max(
    0,
    ...episode.countries.flatMap((k) => seriesOf(data.inflationRates, k).filter((o) => o.year >= episode.from - 3 && o.year <= episode.to + 3).map((o) => o.value)),
  );
  const [scale, setScale] = useState<'auto' | 'linear' | 'log'>('auto');
  const log = scale === 'log' || (scale === 'auto' && peak > 100);
  const title = 'Inflation episodes';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle="Pick an episode to zoom the chart to it and outline the countries involved in the stripes above."
      actions={
        <Segmented
          isDarkMode={isDarkMode}
          value={scale}
          onChange={setScale}
          label="Scale"
          options={[
            { id: 'auto', label: 'Auto scale' },
            { id: 'linear', label: 'Linear' },
            { id: 'log', label: 'Log' },
          ]}
        />
      }
      note={log ? 'Log scale: years with zero or negative inflation are not plotted.' : undefined}
    >
      <ChapterMeta isDarkMode={isDarkMode} sourceIds={['wb-inflation', 'inflation-episodes-curated']} flags={['curated']} />
      <div className="relative mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Episodes">
          {INFLATION_EPISODES.map((e) => (
            <button
              key={e.id}
              type="button"
              role="tab"
              aria-selected={e.id === episodeId}
              onClick={() => onEpisode(e.id)}
              className={`shrink-0 text-left rounded-lg border px-3 py-2 transition-colors ${e.id === episodeId ? t.chipActive : t.chip}`}
            >
              <div className="text-[10px] tabular-nums opacity-80">
                {e.from}-{e.to}
              </div>
              <div className="text-xs font-medium whitespace-nowrap">{e.label}</div>
            </button>
          ))}
        </div>
      </div>
      <p className={`text-sm mb-3 ${t.textSec}`}>{episode.summary}</p>
      <div data-chart-container data-chart-title={`${title}: ${episode.label}`}>
        <TrendLines
          isDarkMode={isDarkMode}
          series={data.inflationRates}
          keys={episode.countries}
          fromYear={episode.from - 3}
          toYear={episode.to + 3}
          format={compactPct}
          logScale={log}
          refY={log ? undefined : 2}
          refLabel="2%"
          events={[
            { year: episode.from, label: 'start' },
            { year: episode.to, label: 'end' },
          ]}
          height={340}
          markers
        />
      </div>
    </Panel>
  );
}

function StabilityPanel({ isDarkMode, data, selected }: Pick<InflationChapterProps, 'isDarkMode' | 'data' | 'selected'>) {
  const [decadeId, setDecadeId] = useState('2010');
  const decade = Number(decadeId);
  const [hideExtreme, setHideExtreme] = useState(true);
  const t = theme(isDarkMode);
  const all = useMemo(
    () =>
      COUNTRY_KEYS.map((k) => {
        const s = decadeStats(data.inflationRates, k, decade);
        return s ? { key: k, x: s.mean, y: s.sd } : null;
      }).filter((r): r is { key: CountryKey; x: number; y: number } => r != null),
    [data.inflationRates, decade],
  );
  const rows = hideExtreme ? all.filter((r) => r.x <= 50) : all;
  const hidden = all.length - rows.length;
  const title = 'Stability map';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle="Average inflation in a decade against its volatility (standard deviation). Bottom-left is steady and low."
      actions={
        <Segmented
          isDarkMode={isDarkMode}
          value={decadeId}
          onChange={setDecadeId}
          label="Decade"
          options={DECADES.map((d) => ({ id: String(d), label: `${d}s` }))}
        />
      }
      note={hidden ? `${hidden} countr${hidden === 1 ? 'y' : 'ies'} averaging above 50% hidden to keep the rest readable.` : undefined}
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['wb-inflation']}
        download={{ filename: `inflation-stability-${decade}s`, title, getData: () => all.map((r) => ({ country: countryName(r.key), mean: r.x, sd: r.y })) }}
      />
      <label className={`inline-flex items-center gap-2 text-xs mb-2 ${t.textSec}`}>
        <input type="checkbox" checked={hideExtreme} onChange={(e) => setHideExtreme(e.target.checked)} />
        Hide averages above 50%
      </label>
      {rows.length < 3 ? (
        <EmptyNote isDarkMode={isDarkMode}>Too few countries have five or more years of data in the {decade}s.</EmptyNote>
      ) : (
        <div data-chart-container data-chart-title={`${title}, ${decade}s`}>
          <ScatterPlot
            isDarkMode={isDarkMode}
            rows={rows}
            xLabel="Average inflation"
            yLabel="Volatility (sd)"
            xFormat={compactPct}
            yFormat={(v) => `${v.toFixed(1)}pp`}
            highlight={selected}
            height={340}
            refX={2}
          />
        </div>
      )}
    </Panel>
  );
}

const GRID = Array.from({ length: 141 }, (_, i) => -5 + i * 0.25);

function DistributionsPanel({ isDarkMode, data }: Pick<InflationChapterProps, 'isDarkMode' | 'data'>) {
  const t = theme(isDarkMode);
  const ridges = useMemo(
    () =>
      DECADES.map((d) => {
        const vals = COUNTRY_KEYS.flatMap((k) => seriesOf(data.inflationRates, k).filter((o) => o.year >= d && o.year < d + 10).map((o) => o.value));
        const inRange = vals.filter((v) => v >= GRID[0] && v <= GRID[GRID.length - 1]);
        return {
          decade: d,
          n: vals.length,
          median: median(vals),
          above10: vals.length ? vals.filter((v) => v > 10).length / vals.length : 0,
          // Scale by the in-range share so tails cut off at 30% still count against the curve.
          density: kde(inRange, GRID, 1.2).map((y) => (y * inRange.length) / Math.max(1, vals.length)),
        };
      }).filter((r) => r.n >= 30),
    [data.inflationRates],
  );
  const W = 640;
  const ROW = 46;
  const H = ridges.length * ROW + 50;
  const maxD = Math.max(1e-9, ...ridges.flatMap((r) => r.density));
  const xPos = (v: number) => 90 + ((v - GRID[0]) / (GRID[GRID.length - 1] - GRID[0])) * (W - 110);
  const title = 'How inflation is distributed, by decade';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle="Density of every country-year reading in each decade, between -5% and 30%. The curves have narrowed and shifted toward 2%."
      note="Readings above 30% are outside the axis but still lower each curve; the right-hand figure is the share above 10%."
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['wb-inflation']}
        download={{ filename: 'inflation-by-decade', title, getData: () => ridges.map((r) => ({ decade: `${r.decade}s`, observations: r.n, median: r.median, shareAbove10: r.above10 })) }}
      />
      {!ridges.length ? (
        <EmptyNote isDarkMode={isDarkMode}>Not enough data.</EmptyNote>
      ) : (
        <div data-chart-container data-chart-title={title}>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={title}>
            {[0, 2, 5, 10, 20, 30].map((v) => (
              <g key={v}>
                <line x1={xPos(v)} x2={xPos(v)} y1={10} y2={H - 30} stroke={v === 2 ? '#10b981' : t.grid} strokeDasharray={v === 2 ? '5 4' : '3 3'} />
                <text x={xPos(v)} y={H - 14} textAnchor="middle" fontSize={11} fill={t.axis}>
                  {v}%
                </text>
              </g>
            ))}
            {ridges.map((r, i) => {
              const base = 20 + (i + 1) * ROW;
              const pts = GRID.map((g, j) => `${xPos(g).toFixed(1)},${(base - (r.density[j] / maxD) * ROW * 1.6).toFixed(1)}`);
              const hue = 210 - i * 28;
              return (
                <g key={r.decade}>
                  <path d={`M${xPos(GRID[0])},${base} L${pts.join(' L')} L${xPos(GRID[GRID.length - 1])},${base} Z`} fill={`hsla(${hue}, 75%, 55%, 0.55)`} stroke={`hsl(${hue}, 75%, 45%)`} strokeWidth={1.2} />
                  <text x={8} y={base - 4} fontSize={12} fontWeight={600} fill={isDarkMode ? '#fff' : '#111827'}>
                    {r.decade}s
                  </text>
                  <text x={8} y={base + 10} fontSize={10} fill={t.axis}>
                    median {r.median?.toFixed(1)}%
                  </text>
                  <text x={W - 4} y={base - 4} fontSize={10} textAnchor="end" fill={t.axis}>
                    {Math.round(r.above10 * 100)}% &gt;10%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </Panel>
  );
}

function mergedSeries(c: HyperinflationCase, data: InflationChapterProps['data']) {
  const byYear = new Map(c.series.map((o) => [o.year, o.value]));
  if (c.countryKey) for (const o of seriesOf(data.inflationRates, c.countryKey)) if (!byYear.has(o.year) && o.year >= c.series[0]?.year) byYear.set(o.year, o.value);
  return [...byYear.entries()].map(([year, value]) => ({ year, value })).filter((o) => o.value > 0).sort((a, b) => a.year - b.year);
}

function HyperinflationPanel({ isDarkMode, data }: Pick<InflationChapterProps, 'isDarkMode' | 'data'>) {
  const t = theme(isDarkMode);
  const title = 'When inflation runs away';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle="Hyperinflation case studies on a log scale, where each gridline is ten times the one below, with the moments that defined them."
      note="Curated annual averages from the IMF and national statistics; peaks are estimates. Argentina and Türkiye are topped up with live World Bank years."
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['inflation-episodes-curated', 'wb-inflation']}
        flags={['curated', 'estimate']}
        download={{
          filename: 'hyperinflation-cases',
          title,
          getData: () => HYPERINFLATION_CASES.flatMap((c) => mergedSeries(c, data).map((o) => ({ case: c.title, year: o.year, inflation: o.value }))),
        }}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {HYPERINFLATION_CASES.map((c) => {
          const s = mergedSeries(c, data);
          return (
            <article key={c.id} id={`case-${c.id}`} className={`rounded-lg border p-4 ${t.inset}`}>
              <h4 className={`font-semibold ${t.text}`}>{c.title}</h4>
              <div className="text-xs text-rose-500 font-medium mb-1">Peak: {c.peak}</div>
              <p className={`text-xs mb-3 ${t.textSec}`}>{c.summary}</p>
              {s.length > 1 && (
                <div data-chart-container data-chart-title={c.title} style={{ height: 150 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={s} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                      <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
                      <XAxis dataKey="year" stroke={t.axis} tick={{ fontSize: 10 }} />
                      <YAxis scale="log" domain={['auto', 'auto']} allowDataOverflow stroke={t.axis} tick={{ fontSize: 10 }} tickFormatter={compactPct} width={44} />
                      <Tooltip contentStyle={t.tooltip} formatter={(v: number) => [compactPct(v), 'Inflation']} />
                      <Line dataKey="value" stroke="#dc2626" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              {c.seriesNote && <p className={`text-[10px] mt-1 ${t.textMuted}`}>{c.seriesNote}</p>}
              <ol className={`mt-3 space-y-1 border-l pl-3 ${t.border}`}>
                {c.milestones.map((m) => (
                  <li key={m.date} className="text-xs">
                    <span className={`font-semibold tabular-nums ${t.accent}`}>{m.date}</span> <span className={t.textSec}>{m.text}</span>
                  </li>
                ))}
              </ol>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}
