'use client';

// Small-multiples sparkline grid.
//
// The one chart type the site was missing that scales to the whole roster.
// Forty-five lines in one axis is spaghetti; forty-five tiny charts in a grid
// is scannable, because the reader compares shapes instead of untangling
// colours. Each tile shows one country's path, its latest value and its
// change over the window.
//
// Deliberately hand-rolled SVG rather than Recharts: mounting 45
// ResponsiveContainers costs far more than it buys for a 60px sparkline.

import { useMemo, useState } from 'react';
import { useChartTheme } from '../../utils/chartTheme';
import ChartCard from './ChartCard';
import ChartA11yCaption from '../ChartA11yCaption';

export interface SparklineSeries {
  key: string;
  label: string;
  points: { x: number; y: number }[];
}

type SortMode = 'latest' | 'change' | 'label';

interface Props {
  isDarkMode: boolean;
  items: SparklineSeries[];
  title?: string;
  subtitle?: string;
  provenance?: React.ReactNode;
  actions?: React.ReactNode;
  footnote?: React.ReactNode;
  valueFormat?: (value: number) => string;
  // A shared y-scale makes tiles comparable in level; a per-tile scale makes
  // each country's own shape legible. Level comparison is usually the point,
  // so shared is the default, but the reader can flip it.
  defaultSharedScale?: boolean;
  // Draws a dashed baseline at zero, for metrics that go negative.
  showZeroLine?: boolean;
  unit?: string;
  // Whether a rising line is a good thing. Defaults to 'neutral', which
  // colours every tile the same rather than implying a judgement the metric
  // does not support.
  directionTone?: 'risingGood' | 'risingBad' | 'neutral';
}

const TILE_W = 132;
const TILE_H = 42;

function buildPath(points: { x: number; y: number }[], yMin: number, yMax: number): string {
  if (points.length === 0) return '';
  const xMin = points[0]!.x;
  const xMax = points[points.length - 1]!.x;
  const xSpan = xMax - xMin || 1;
  const ySpan = yMax - yMin || 1;
  return points
    .map((p, i) => {
      const px = ((p.x - xMin) / xSpan) * TILE_W;
      const py = TILE_H - ((p.y - yMin) / ySpan) * TILE_H;
      return `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
    })
    .join(' ');
}

export default function SparklineGrid({
  isDarkMode,
  items,
  title,
  subtitle,
  provenance,
  actions,
  footnote,
  valueFormat,
  defaultSharedScale = true,
  showZeroLine = false,
  unit = '',
  directionTone = 'neutral',
}: Props) {
  const theme = useChartTheme(isDarkMode);
  const [sort, setSort] = useState<SortMode>('latest');
  const [shared, setShared] = useState(defaultSharedScale);
  const [query, setQuery] = useState('');

  const tiles = useMemo(() => {
    const rows = items
      .filter(item => item.points.length >= 2)
      .map(item => {
        const pts = [...item.points].sort((a, b) => a.x - b.x);
        const firstPt = pts[0]!;
        const lastPt = pts[pts.length - 1]!;
        const ys = pts.map(p => p.y);
        return {
          key: item.key,
          label: item.label,
          points: pts,
          latest: lastPt.y,
          latestX: lastPt.x,
          firstX: firstPt.x,
          change: lastPt.y - firstPt.y,
          min: Math.min(...ys),
          max: Math.max(...ys),
        };
      });

    const filtered = query.trim()
      ? rows.filter(r => r.label.toLowerCase().includes(query.trim().toLowerCase()))
      : rows;

    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'label') return a.label.localeCompare(b.label);
      if (sort === 'change') return b.change - a.change;
      return b.latest - a.latest;
    });

    // The shared scale is taken from the unfiltered set, so filtering the grid
    // does not silently rescale every tile.
    const globalMin = rows.length ? Math.min(...rows.map(r => r.min)) : 0;
    const globalMax = rows.length ? Math.max(...rows.map(r => r.max)) : 1;

    return { sorted, globalMin, globalMax, total: rows.length };
  }, [items, sort, query]);

  const fmt = (v: number) => (valueFormat ? valueFormat(v) : `${v.toFixed(1)}${unit}`);
  const tileBg = isDarkMode ? 'bg-gray-900/40 border-gray-700' : 'bg-gray-50 border-gray-200';

  const sortButton = (mode: SortMode, label: string) => (
    <button
      key={mode}
      onClick={() => setSort(mode)}
      aria-pressed={sort === mode}
      className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${
        sort === mode
          ? 'bg-blue-500/15 border-blue-500 text-blue-500'
          : isDarkMode
            ? 'border-gray-600 text-gray-400 hover:text-gray-200'
            : 'border-gray-300 text-gray-500 hover:text-gray-800'
      }`}
    >
      {label}
    </button>
  );

  return (
    <ChartCard
      isDarkMode={isDarkMode}
      title={title}
      subtitle={subtitle}
      provenance={provenance}
      height="h-auto"
      actions={
        <div className="flex flex-wrap items-center gap-1.5 justify-end">
          {actions}
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Filter countries"
            aria-label="Filter countries"
            className={`text-[11px] px-2 py-1 rounded-md border w-32 ${
              isDarkMode
                ? 'bg-gray-900 border-gray-600 text-gray-200 placeholder-gray-500'
                : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
            }`}
          />
          {sortButton('latest', 'Latest')}
          {sortButton('change', 'Change')}
          {sortButton('label', 'A-Z')}
          <button
            onClick={() => setShared(!shared)}
            aria-pressed={shared}
            className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${
              shared
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500'
                : isDarkMode
                  ? 'border-gray-600 text-gray-400 hover:text-gray-200'
                  : 'border-gray-300 text-gray-500 hover:text-gray-800'
            }`}
            title={shared
              ? 'All tiles share one vertical scale, so heights are comparable between countries'
              : 'Each tile is scaled to its own range, so shapes are legible but heights are not comparable'}
          >
            {shared ? 'Shared scale' : 'Per-tile scale'}
          </button>
        </div>
      }
      caption={
        <ChartA11yCaption
          title={title ?? 'Latest value by country'}
          rows={tiles.sorted.map(t => ({ label: t.label, value: t.latest }))}
        />
      }
      footnote={footnote}
    >
      {tiles.sorted.length === 0 ? (
        <p className={`text-sm ${theme.subtitleCls}`}>
          No country has two or more observations for this metric{query ? ' matching that filter' : ''}.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {tiles.sorted.map(t => {
            const yMin = shared ? tiles.globalMin : t.min;
            const yMax = shared ? tiles.globalMax : t.max;
            const stroke = directionTone === 'neutral' || t.change === 0
              ? theme.palette.info
              : theme.tone(t.change, directionTone === 'risingBad');
            const zeroY = yMax > 0 && yMin < 0
              ? TILE_H - ((0 - yMin) / (yMax - yMin || 1)) * TILE_H
              : null;

            return (
              <div key={t.key} className={`rounded-lg border p-2.5 ${tileBg}`}>
                <div className="flex items-baseline justify-between gap-1">
                  <span className={`text-[11px] font-medium truncate ${theme.titleCls}`} title={t.label}>
                    {t.label}
                  </span>
                  <span className={`text-[11px] tabular-nums font-semibold ${theme.titleCls}`}>
                    {fmt(t.latest)}
                  </span>
                </div>
                <svg
                  viewBox={`0 0 ${TILE_W} ${TILE_H}`}
                  className="w-full mt-1.5"
                  height={TILE_H}
                  preserveAspectRatio="none"
                  role="presentation"
                >
                  {showZeroLine && zeroY !== null && (
                    <line x1={0} x2={TILE_W} y1={zeroY} y2={zeroY} stroke={theme.grid} strokeDasharray="3 3" strokeWidth={1} />
                  )}
                  <path d={buildPath(t.points, yMin, yMax)} fill="none" stroke={stroke} strokeWidth={1.75} vectorEffect="non-scaling-stroke" />
                </svg>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-[10px] tabular-nums ${theme.captionCls}`}>
                    {t.firstX}–{t.latestX}
                  </span>
                  <span className="text-[10px] tabular-nums font-medium" style={{ color: stroke }}>
                    {t.change >= 0 ? '+' : ''}{fmt(t.change)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className={`text-xs mt-3 ${theme.captionCls}`}>
        Showing {tiles.sorted.length} of {tiles.total} economies with at least two observations.
        {directionTone === 'neutral'
          ? ' Tiles are drawn in one colour because a rising line is not automatically better on this metric.'
          : ' Green means the change over the window is the favourable direction for this metric, red the unfavourable one.'}
      </p>
    </ChartCard>
  );
}
