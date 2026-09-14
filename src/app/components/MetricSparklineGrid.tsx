'use client';

// Whole-roster scan for /compare: one metric, every country, one tile each.
// This is the view that answers "is what I'm seeing in these four countries
// happening everywhere", which the four-country comparison above it cannot.

import { useMemo, useState } from 'react';
import type { CountryData } from '../services/worldbank';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES } from '../utils/countryMappings';
import { COMPARE_METRICS, formatCompareValue } from '../utils/compareMetrics';
import SparklineGrid, { type SparklineSeries } from './charts/SparklineGrid';
import ChartMeta from './ChartMeta';

interface Props {
  isDarkMode: boolean;
  data: Record<string, CountryData[]> | null;
}

const SINCE_OPTIONS = [1990, 2000, 2010];

export default function MetricSparklineGrid({ isDarkMode, data }: Props) {
  const [metricId, setMetricId] = useState('inflationRates');
  const [since, setSince] = useState(2000);

  const metric = COMPARE_METRICS.find(m => m.id === metricId) ?? COMPARE_METRICS[0]!;

  const items = useMemo<SparklineSeries[]>(() => {
    const raw = data?.[metric.series];
    if (!Array.isArray(raw)) return [];

    const rows = raw
      .filter(r => Number(r.year) >= since)
      .sort((a, b) => Number(a.year) - Number(b.year));

    return COUNTRY_KEYS
      .map(key => {
        const points = rows
          .map(row => ({ x: Number(row.year), y: Number(row[key]) }))
          .filter(p => Number.isFinite(p.y) && p.y !== 0);
        return {
          key,
          label: COUNTRY_DISPLAY_NAMES[key as keyof typeof COUNTRY_DISPLAY_NAMES] ?? key,
          points,
        };
      })
      .filter(item => item.points.length >= 2);
  }, [data, metric.series, since]);

  return (
    <SparklineGrid
      isDarkMode={isDarkMode}
      items={items}
      title={`${metric.label} Across Every Tracked Economy`}
      subtitle={`One tile per country since ${since}. Sort by latest level, by change over the window, or alphabetically.`}
      provenance={<ChartMeta sourceId={metric.sourceId} isDarkMode={isDarkMode} />}
      valueFormat={v => formatCompareValue(metric, v)}
      showZeroLine
      directionTone={metric.twoSided ? 'neutral' : metric.higherIsBetter ? 'risingGood' : 'risingBad'}
      actions={
        <>
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
          <select
            value={since}
            onChange={e => setSince(Number(e.target.value))}
            aria-label="Start year"
            className={`text-[11px] px-2 py-1 rounded-md border ${
              isDarkMode ? 'bg-gray-900 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800'
            }`}
          >
            {SINCE_OPTIONS.map(y => (
              <option key={y} value={y}>Since {y}</option>
            ))}
          </select>
        </>
      }
      footnote={
        <>
          {metric.note} Tiles share one vertical scale by default so levels are comparable across
          countries; switch to per-tile scaling when a few extreme countries flatten everyone else.
          A country is omitted when it has fewer than two readings in the window.
        </>
      }
    />
  );
}
