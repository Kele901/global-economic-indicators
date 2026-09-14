'use client';

// League-table view for /compare. Picks a metric and a window, then draws
// how the ranking rearranged over that window. The "who overtook whom"
// question is the one a side-by-side bar chart cannot answer at all.

import { useMemo, useState } from 'react';
import type { CountryData } from '../services/worldbank';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES, COUNTRY_COLORS } from '../utils/countryMappings';
import { COMPARE_METRICS, formatCompareValue } from '../utils/compareMetrics';
import BumpChart, { type BumpSeries, type BumpPeriod } from './charts/BumpChart';
import ChartMeta from './ChartMeta';

interface Props {
  isDarkMode: boolean;
  data: Record<string, CountryData[]> | null;
}

const WINDOWS = [
  { id: '10', label: 'Last 10 years', years: 10 },
  { id: '20', label: 'Last 20 years', years: 20 },
  { id: '30', label: 'Last 30 years', years: 30 },
];

// Ranking every fifth year rather than every year: a bump chart with 30
// columns is unreadable, and the medium-term reshuffling is the story.
function pickPeriods(years: number[], span: number): number[] {
  if (years.length === 0) return [];
  const newest = Math.max(...years);
  const oldest = Math.max(Math.min(...years), newest - span);
  const step = span >= 25 ? 5 : span >= 15 ? 4 : 2;
  const picked: number[] = [];
  for (let y = oldest; y < newest; y += step) {
    if (years.includes(y)) picked.push(y);
  }
  if (!picked.includes(newest)) picked.push(newest);
  return picked;
}

export default function CountryRankBump({ isDarkMode, data }: Props) {
  const [metricId, setMetricId] = useState(COMPARE_METRICS[0]!.id);
  const [windowId, setWindowId] = useState('20');
  const [maxRank, setMaxRank] = useState(10);

  const metric = COMPARE_METRICS.find(m => m.id === metricId)!;
  const span = WINDOWS.find(w => w.id === windowId)!.years;

  const { periods, series, coverage } = useMemo(() => {
    const raw = data?.[metric.series];
    if (!Array.isArray(raw) || raw.length === 0) {
      return { periods: [] as BumpPeriod[], series: [] as BumpSeries[], coverage: 0 };
    }

    const byYear = new Map<number, CountryData>();
    raw.forEach(row => {
      const y = Number(row.year);
      if (Number.isFinite(y)) byYear.set(y, row);
    });

    const chosen = pickPeriods([...byYear.keys()], span);
    const seen = new Set<string>();

    const built: BumpPeriod[] = chosen.map(year => {
      const row = byYear.get(year)!;
      const values: Record<string, number> = {};
      COUNTRY_KEYS.forEach(key => {
        const v = Number(row[key]);
        // Zero is a real reading for some of these metrics but is
        // indistinguishable from "missing" in this shape, so it is excluded.
        if (Number.isFinite(v) && v !== 0) {
          values[key] = v;
          seen.add(key);
        }
      });
      return { x: year, values };
    });

    const built_series: BumpSeries[] = [...seen].map(key => ({
      key,
      label: COUNTRY_DISPLAY_NAMES[key as keyof typeof COUNTRY_DISPLAY_NAMES] ?? key,
      color: COUNTRY_COLORS[key as keyof typeof COUNTRY_COLORS] ?? '#94a3b8',
    }));

    return { periods: built, series: built_series, coverage: seen.size };
  }, [data, metric.series, span]);

  const pill = (active: boolean) =>
    `text-[11px] px-2 py-1 rounded-md border transition-colors ${
      active
        ? 'bg-blue-500/15 border-blue-500 text-blue-500'
        : isDarkMode
          ? 'border-gray-600 text-gray-400 hover:text-gray-200'
          : 'border-gray-300 text-gray-500 hover:text-gray-800'
    }`;

  return (
    <BumpChart
      isDarkMode={isDarkMode}
      series={series}
      periods={periods}
      higherIsFirst={metric.higherIsBetter}
      maxRank={maxRank}
      valueFormat={v => formatCompareValue(metric, v)}
      title={`Who Leads on ${metric.label}`}
      subtitle={`Rank among ${coverage} economies, ${metric.higherIsBetter ? 'highest' : 'lowest'} first. Only countries that reach the top ${maxRank} at some point are drawn.`}
      provenance={<ChartMeta sourceId={metric.sourceId} isDarkMode={isDarkMode} />}
      actions={
        <div className="flex flex-wrap gap-1.5 justify-end max-w-2xl">
          <select
            value={metricId}
            onChange={e => setMetricId(e.target.value)}
            aria-label="Metric"
            className={`text-[11px] px-2 py-1 rounded-md border ${
              isDarkMode ? 'bg-gray-900 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800'
            }`}
          >
            {COMPARE_METRICS.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          {WINDOWS.map(w => (
            <button key={w.id} onClick={() => setWindowId(w.id)} aria-pressed={windowId === w.id} className={pill(windowId === w.id)}>
              {w.label}
            </button>
          ))}
          {[5, 10, 15].map(n => (
            <button key={n} onClick={() => setMaxRank(n)} aria-pressed={maxRank === n} className={pill(maxRank === n)}>
              Top {n}
            </button>
          ))}
        </div>
      }
      footnote={
        <>
          {metric.note}
          {metric.twoSided && ' This metric is genuinely two-sided, so treat the ranking as a spectrum rather than a scoreboard.'}
          {' '}Ranks are computed only among countries reporting in that year, so a country appearing
          or disappearing mid-chart reflects survey coverage rather than a sudden collapse.
        </>
      }
    />
  );
}
