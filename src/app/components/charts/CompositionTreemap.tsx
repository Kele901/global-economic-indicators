'use client';

// Treemap for "what is this total made of" questions, where a bar chart of
// 40 countries buries the point that the top five are most of the total.
// Area is proportional to value, so the eye reads concentration directly.
//
// Recharts' Treemap needs a custom content renderer to get labels that
// degrade gracefully in small tiles, which is most of what this file is.

import { useMemo } from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { useChartTheme } from '../../utils/chartTheme';
import ChartCard from './ChartCard';
import ChartA11yCaption from '../ChartA11yCaption';

export interface TreemapDatum {
  name: string;
  value: number;
  color?: string;
}

interface Props {
  isDarkMode: boolean;
  title?: string;
  subtitle?: string;
  data: TreemapDatum[];
  // Formats values in the tooltip and tile labels.
  format?: (value: number) => string;
  footnote?: React.ReactNode;
  provenance?: React.ReactNode;
  actions?: React.ReactNode;
  height?: string | number;
  // Everything past this rank is folded into a single "Rest" tile so the
  // treemap does not degenerate into unreadable slivers.
  topN?: number;
  restLabel?: string;
}

const DEFAULT_COLORS = [
  '#2563eb', '#dc2626', '#f59e0b', '#059669', '#7c3aed', '#0891b2',
  '#be185d', '#65a30d', '#ea580c', '#4f46e5', '#0d9488', '#c026d3',
];

interface TileProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  name?: string;
  value?: number;
  color?: string;
  share?: number;
  isDarkMode?: boolean;
  format?: (value: number) => string;
}

function Tile({ x = 0, y = 0, width = 0, height = 0, index = 0, name, value, color, share, format }: TileProps) {
  const fill = color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]!;
  const showLabel = width > 54 && height > 26;
  const showValue = width > 78 && height > 44;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke="#ffffff"
        strokeOpacity={0.6}
        strokeWidth={1}
      />
      {showLabel && (
        <text x={x + 6} y={y + 16} fill="#ffffff" fontSize={11} fontWeight={600}>
          {name}
        </text>
      )}
      {showValue && (
        <text x={x + 6} y={y + 31} fill="#ffffff" fontSize={10} fillOpacity={0.85}>
          {format && value !== undefined ? format(value) : value}
          {share !== undefined ? ` · ${share.toFixed(1)}%` : ''}
        </text>
      )}
    </g>
  );
}

export default function CompositionTreemap({
  isDarkMode,
  title,
  subtitle,
  data,
  format,
  footnote,
  provenance,
  actions,
  height = 'h-[420px]',
  topN,
  restLabel = 'Everyone else',
}: Props) {
  const theme = useChartTheme(isDarkMode);

  const prepared = useMemo(() => {
    const clean = data
      .filter(d => Number.isFinite(d.value) && d.value > 0)
      .sort((a, b) => b.value - a.value);
    const total = clean.reduce((s, d) => s + d.value, 0);
    if (total === 0) return { tiles: [], total: 0 };

    let tiles = clean;
    if (topN && clean.length > topN) {
      const head = clean.slice(0, topN);
      const restValue = clean.slice(topN).reduce((s, d) => s + d.value, 0);
      tiles = restValue > 0
        ? [...head, { name: restLabel, value: restValue, color: isDarkMode ? '#475569' : '#94a3b8' }]
        : head;
    }

    return {
      tiles: tiles.map((d, i) => ({
        ...d,
        share: (d.value / total) * 100,
        color: d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      })),
      total,
    };
  }, [data, topN, restLabel, isDarkMode]);

  if (prepared.tiles.length === 0) {
    return (
      <ChartCard isDarkMode={isDarkMode} title={title} subtitle={subtitle} height="h-auto" provenance={provenance}>
        <p className={`text-sm ${theme.subtitleCls}`}>No composition data available yet.</p>
      </ChartCard>
    );
  }

  const top3Share = prepared.tiles.slice(0, 3).reduce((s, t) => s + t.share, 0);

  return (
    <ChartCard
      isDarkMode={isDarkMode}
      title={title}
      subtitle={subtitle}
      height={height}
      provenance={provenance}
      actions={actions}
      caption={
        <ChartA11yCaption
          title={title ?? 'Composition'}
          rows={prepared.tiles.map(t => ({ label: t.name, value: t.share }))}
          unit="%"
          extra={`The three largest shares account for ${top3Share.toFixed(0)}% of the total.`}
        />
      }
      footnote={footnote}
    >
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={prepared.tiles}
          dataKey="value"
          nameKey="name"
          isAnimationActive={false}
          content={<Tile isDarkMode={isDarkMode} format={format} />}
        >
          <Tooltip
            contentStyle={{
              backgroundColor: theme.tooltipBg,
              border: `1px solid ${theme.tooltipBorder}`,
              color: theme.tooltipText,
              fontSize: 12,
              borderRadius: 6,
            }}
            formatter={(value: unknown, _name: unknown, entry: { payload?: { name?: string; share?: number } }) => {
              const share = entry?.payload?.share;
              const formatted = format ? format(Number(value)) : String(value);
              return [share !== undefined ? `${formatted} · ${share.toFixed(1)}% of total` : formatted, entry?.payload?.name ?? ''];
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </ChartCard>
  );
}
