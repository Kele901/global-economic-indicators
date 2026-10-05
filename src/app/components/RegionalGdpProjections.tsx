'use client';

import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';
import { CURRENT_YEAR, PREV_YEAR, mean, pct, pp, outlookTheme, type OutlookSeries } from '../lib/outlook';

const TITLE = 'Regional GDP Projections';

// The IMF's two headline blocs, then its five regional groupings of emerging and developing economies.
const REGIONS = [
  { code: 'ADVEC', short: 'Advanced economies', label: 'Advanced economies', members: 'US, euro area, Japan, UK, Canada and other high-income economies', bloc: true },
  { code: 'OEMDC', short: 'Emerging markets', label: 'Emerging market & developing economies', members: 'Everyone else, led by China, India, Brazil and Russia', bloc: true },
  { code: 'DA', short: 'Emerging Asia', label: 'Emerging & developing Asia', members: 'China, India, Indonesia, the ASEAN economies and the Pacific islands' },
  { code: 'SSA', short: 'Sub-Saharan Africa', label: 'Sub-Saharan Africa', members: 'Nigeria, South Africa, Ethiopia, Kenya and the rest of the region' },
  { code: 'MECA', short: 'Middle East & C. Asia', label: 'Middle East & Central Asia', members: 'Gulf states, Iran, Egypt, Pakistan and Central Asia' },
  { code: 'WE', short: 'Latin America', label: 'Latin America & the Caribbean', members: 'Brazil, Mexico, Argentina, Colombia, Chile and the Caribbean' },
  { code: 'EDE', short: 'Emerging Europe', label: 'Emerging & developing Europe', members: 'Türkiye, Poland, Russia, Hungary, Romania and neighbours' },
];

const YEAR_COLORS = ['#94a3b8', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];
const MEDIUM_TERM_FROM = CURRENT_YEAR + 1;
const MEDIUM_TERM_TO = CURRENT_YEAR + 5;

interface Props {
  isDarkMode: boolean;
  series: OutlookSeries;
}

export default function RegionalGdpProjections({ isDarkMode, series }: Props) {
  const [metric, setMetric] = useState<'gdp' | 'inflation'>('gdp');
  const t = outlookTheme(isDarkMode);
  const activeMetric = metric === 'inflation' && !series.hasGroupInflation ? 'gdp' : metric;
  const source = activeMetric === 'gdp' ? series.gdp : series.inflation;
  const metricLabel = activeMetric === 'gdp' ? 'real GDP growth' : 'inflation';

  const view = useMemo(() => {
    const available = REGIONS.filter(r => source.has(r.code));
    const years = [PREV_YEAR, CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2].filter(y =>
      available.some(r => typeof source.get(r.code)?.[y] === 'number')
    );
    const rows = available
      .map(r => {
        const values = source.get(r.code)!;
        const prev = values[PREV_YEAR] ?? null;
        const cur = values[CURRENT_YEAR] ?? null;
        return {
          ...r,
          values,
          prev,
          cur,
          change: prev != null && cur != null ? cur - prev : null,
          mediumTerm: mean(values, MEDIUM_TERM_FROM, MEDIUM_TERM_TO),
        };
      })
      .sort((a, b) => (a.bloc === b.bloc ? (b.cur ?? -Infinity) - (a.cur ?? -Infinity) : a.bloc ? -1 : 1));
    const chartData = rows.map(r => {
      const point: Record<string, string | number> = { region: r.short };
      years.forEach(y => { if (typeof r.values[y] === 'number') point[`y${y}`] = r.values[y]; });
      return point;
    });
    const regional = rows.filter(r => !r.bloc && r.cur != null);
    const byCur = [...regional].sort((a, b) => b.cur! - a.cur!);
    const byChange = regional.filter(r => r.change != null).sort((a, b) => Math.abs(b.change!) - Math.abs(a.change!));
    const world = source.get('WEOWORLD')?.[CURRENT_YEAR] ?? null;
    const plotted = rows.flatMap(r => years.map(y => r.values[y]).filter((v): v is number => typeof v === 'number'));
    const yMax = Math.ceil(Math.max(world ?? 0, ...plotted) + 0.6);
    const yMin = Math.min(0, Math.floor(Math.min(...plotted)));
    const step = yMax - yMin > 10 ? 2 : 1;
    const yTicks: number[] = [];
    for (let v = yMin; v <= yMax; v += step) yTicks.push(v);
    return { rows, years, chartData, yDomain: [yMin, yTicks[yTicks.length - 1]] as [number, number], yTicks, highest: byCur[0], lowest: byCur[byCur.length - 1], mover: byChange[0], world };
  }, [source]);

  const mediumTermAvailable = view.rows.some(r => r.mediumTerm != null);
  const toggleClass = (active: boolean) => `px-3 py-1 ${active ? 'bg-blue-500/20 text-blue-500' : t.textSec}`;

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
              title={series.hasGroupInflation ? undefined : 'Regional inflation needs the live IMF feed'}
              className={`${toggleClass(activeMetric === 'inflation')} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Inflation
            </button>
          </div>
          <SocialShareMenu title={TITLE} isDarkMode={isDarkMode} />
        </div>
      </div>
      <p className={`text-sm mb-5 ${t.textSec}`}>
        IMF {metricLabel} by region, % per year. {PREV_YEAR} is an IMF estimate; later years are forecasts.
        Regional figures weight each economy by its size at purchasing-power parity.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          view.highest && {
            label: activeMetric === 'gdp' ? `Fastest-growing region, ${CURRENT_YEAR}` : `Highest inflation, ${CURRENT_YEAR}`,
            value: pct(view.highest.cur),
            detail: view.highest.label,
          },
          view.lowest && {
            label: activeMetric === 'gdp' ? `Slowest-growing region, ${CURRENT_YEAR}` : `Lowest inflation, ${CURRENT_YEAR}`,
            value: pct(view.lowest.cur),
            detail: view.lowest.label,
          },
          view.mover && {
            label: `Biggest shift since ${PREV_YEAR}`,
            value: pp(view.mover.change),
            detail: `${view.mover.label}: ${pct(view.mover.prev)} → ${pct(view.mover.cur)}`,
          },
        ].filter(Boolean).map(card => {
          const c = card as { label: string; value: string; detail: string };
          return (
            <div key={c.label} className={`rounded-lg border p-3 ${t.subtle}`}>
              <p className={`text-[11px] uppercase tracking-wide ${t.textSec}`}>{c.label}</p>
              <p className="text-2xl font-bold tabular-nums mt-0.5">{c.value}</p>
              <p className={`text-xs ${t.textSec}`}>{c.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="h-[380px] sm:h-[420px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={view.chartData} margin={{ top: 22, right: 62, left: -6, bottom: 0 }} barCategoryGap="16%" barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
            <XAxis dataKey="region" stroke={t.axis} tick={{ fontSize: 11 }} interval={0} tickLine={false} />
            <YAxis stroke={t.axis} tick={{ fontSize: 11 }} domain={view.yDomain} ticks={view.yTicks} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip
              contentStyle={t.tooltip}
              cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
              formatter={(value: any, name: any) => [pct(Number(value)), name]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {view.world != null && (
              <ReferenceLine
                y={view.world}
                stroke={t.axis}
                strokeDasharray="4 4"
                label={{ value: `World ${pct(view.world)}`, position: 'right', fill: t.axis, fontSize: 10 }}
              />
            )}
            {view.years.map((y, i) => (
              <Bar
                key={y}
                dataKey={`y${y}`}
                name={y === PREV_YEAR ? `${y} (est.)` : String(y)}
                fill={YEAR_COLORS[i % YEAR_COLORS.length]}
                radius={[3, 3, 0, 0]}
                maxBarSize={30}
              >
                <LabelList
                  dataKey={`y${y}`}
                  position="top"
                  fontSize={9}
                  fill={t.axis}
                  formatter={(v: any) => (typeof v === 'number' ? v.toFixed(1) : '')}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className={`border-b text-xs ${t.border} ${t.textSec}`}>
              <th className="py-2 pr-3 text-left font-medium">Region</th>
              {view.years.map(y => (
                <th key={y} className={`py-2 px-2 text-right font-medium whitespace-nowrap ${y === CURRENT_YEAR ? t.textStrong : ''}`}>
                  {y}{y === PREV_YEAR ? ' (est.)' : ''}
                </th>
              ))}
              <th className="py-2 px-2 text-right font-medium whitespace-nowrap" title={`Change from ${PREV_YEAR} to ${CURRENT_YEAR}`}>
                Δ {PREV_YEAR}→{String(CURRENT_YEAR).slice(2)}
              </th>
              {view.world != null && (
                <th className="py-2 px-2 text-right font-medium whitespace-nowrap" title={`Gap to the world figure for ${CURRENT_YEAR}`}>
                  vs world
                </th>
              )}
              {mediumTermAvailable && (
                <th className="py-2 pl-2 text-right font-medium whitespace-nowrap" title={`Average of ${MEDIUM_TERM_FROM}–${MEDIUM_TERM_TO}`}>
                  {MEDIUM_TERM_FROM}–{String(MEDIUM_TERM_TO).slice(2)} avg
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {view.rows.map((r, i) => {
              const rising = r.change != null && r.change > 0.05;
              const falling = r.change != null && r.change < -0.05;
              // For inflation, a fall is the good news.
              const good = activeMetric === 'gdp' ? rising : falling;
              const bad = activeMetric === 'gdp' ? falling : rising;
              const vsWorld = view.world != null && r.cur != null ? r.cur - view.world : null;
              return (
                <tr key={r.code} className={`border-b ${t.border} ${r.bloc && !view.rows[i + 1]?.bloc ? 'border-b-2' : ''}`}>
                  <td className="py-2 pr-3">
                    <p className="font-medium">{r.label}</p>
                    <p className={`text-[11px] leading-snug ${t.textSec}`}>{r.members}</p>
                  </td>
                  {view.years.map(y => (
                    <td
                      key={y}
                      className={`py-2 px-2 text-right tabular-nums ${y === CURRENT_YEAR ? 'font-semibold' : t.textSec}`}
                    >
                      {pct(r.values[y])}
                    </td>
                  ))}
                  <td className={`py-2 px-2 text-right tabular-nums text-xs ${good ? 'text-green-500' : bad ? 'text-red-500' : t.textSec}`}>
                    {pp(r.change)}
                  </td>
                  {view.world != null && (
                    <td className={`py-2 px-2 text-right tabular-nums text-xs ${t.textSec}`}>{pp(vsWorld)}</td>
                  )}
                  {mediumTermAvailable && (
                    <td className={`py-2 pl-2 text-right tabular-nums ${t.textSec}`}>{pct(r.mediumTerm)}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className={`text-[11px] mt-3 ${t.textSec}`}>
        &ldquo;Δ&rdquo; is the change in percentage points (pp) from {PREV_YEAR} to {CURRENT_YEAR}
        {view.world != null && `; "vs world" is each region's ${CURRENT_YEAR} figure minus the world's ${pct(view.world)}`}.
        {mediumTermAvailable && ` The last column averages the IMF's ${MEDIUM_TERM_FROM}–${MEDIUM_TERM_TO} projections, a guide to each region's medium-term trend.`}
      </p>
    </div>
  );
}
