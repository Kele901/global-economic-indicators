'use client';

// Rank-over-time (bump) chart.
//
// A line chart of levels answers "how much"; a bump chart answers "who
// overtook whom", which is a different and often more memorable question.
// Callers hand over raw values per period and this component does the
// ranking, so the same component works for "highest is rank 1" metrics like
// GDP per capita and "lowest is rank 1" metrics like unemployment.
//
// Ranks are computed per period from whatever values are present, so a
// country missing a year drops out of that period's ranking rather than
// being forced to the bottom.

import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useChartTheme } from '../../utils/chartTheme';
import ChartCard from './ChartCard';
import ChartTooltip from './ChartTooltip';
import ChartA11yCaption from '../ChartA11yCaption';

export interface BumpSeries {
  key: string;
  label: string;
  color: string;
}

export interface BumpPeriod {
  x: string | number;
  // Raw metric values keyed by series key. Absent keys are unranked.
  values: Record<string, number>;
}

interface Props {
  isDarkMode: boolean;
  series: BumpSeries[];
  periods: BumpPeriod[];
  // Rank 1 goes to the highest value by default; set false for metrics where
  // low is good (unemployment, inflation, debt).
  higherIsFirst?: boolean;
  // Drop series that never reach this rank, so the chart stays legible when
  // the caller passes the whole roster.
  maxRank?: number;
  valueFormat?: (value: number) => string;
  title?: string;
  subtitle?: string;
  provenance?: React.ReactNode;
  actions?: React.ReactNode;
  footnote?: React.ReactNode;
  height?: string | number;
}

interface Row {
  x: string | number;
  // rank per series key, plus the raw values for the tooltip
  [key: string]: string | number | Record<string, number> | undefined;
  __raw?: Record<string, number>;
}

export default function BumpChart({
  isDarkMode,
  series,
  periods,
  higherIsFirst = true,
  maxRank,
  valueFormat,
  title,
  subtitle,
  provenance,
  actions,
  footnote,
  height = 'h-[460px]',
}: Props) {
  const theme = useChartTheme(isDarkMode);

  const { rows, shown, worstRank } = useMemo(() => {
    const bestRankByKey = new Map<string, number>();
    let deepest = 1;

    const built: Row[] = periods.map(period => {
      const ranked = Object.entries(period.values)
        .filter(([, v]) => Number.isFinite(v))
        .sort((a, b) => (higherIsFirst ? b[1] - a[1] : a[1] - b[1]));

      const row: Row = { x: period.x, __raw: {} };
      ranked.forEach(([key, value], i) => {
        const rank = i + 1;
        row[key] = rank;
        (row.__raw as Record<string, number>)[key] = value;
        const best = bestRankByKey.get(key);
        if (best === undefined || rank < best) bestRankByKey.set(key, rank);
        if (rank > deepest) deepest = rank;
      });
      return row;
    });

    const visible = series.filter(s => {
      const best = bestRankByKey.get(s.key);
      if (best === undefined) return false;
      return maxRank === undefined || best <= maxRank;
    });

    // With a maxRank filter the deepest drawn rank is bounded by the filter,
    // but a series can dip below it mid-period, so take the real maximum
    // across the series we actually draw.
    let drawnDeepest = 1;
    built.forEach(row => {
      visible.forEach(s => {
        const rank = row[s.key];
        if (typeof rank === 'number' && rank > drawnDeepest) drawnDeepest = rank;
      });
    });

    return { rows: built, shown: visible, worstRank: Math.max(drawnDeepest, 1) };
  }, [periods, series, higherIsFirst, maxRank]);

  const latest = rows[rows.length - 1];
  const first = rows[0];

  if (shown.length === 0 || rows.length === 0) {
    return (
      <ChartCard isDarkMode={isDarkMode} title={title} subtitle={subtitle} height="h-auto">
        <p className={`text-sm ${theme.subtitleCls}`}>
          Not enough of this series has returned to rank anything yet.
        </p>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      isDarkMode={isDarkMode}
      title={title}
      subtitle={subtitle}
      provenance={provenance}
      actions={actions}
      height={height}
      caption={
        <ChartA11yCaption
          title={`Ranking in ${String(latest?.x ?? '')}, ${higherIsFirst ? 'highest first' : 'lowest first'}`}
          precision={0}
          rows={shown
            .map(s => ({ label: s.label, value: Number(latest?.[s.key] ?? NaN) }))
            .filter(r => Number.isFinite(r.value))
            .sort((a, b) => a.value - b.value)}
        />
      }
      footnote={footnote}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 10, right: 110, left: 10, bottom: 10 }}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="x" stroke={theme.axis} tick={{ fontSize: 11 }} />
          <YAxis
            // Reversed so rank 1 sits at the top, which is the only
            // orientation anyone reads a league table in.
            reversed
            domain={[1, worstRank]}
            allowDecimals={false}
            stroke={theme.axis}
            tick={{ fontSize: 11 }}
            tickFormatter={v => `#${v}`}
            width={44}
          />
          <Tooltip
            content={
              <ChartTooltip
                theme={theme}
                sortByValue={false}
                format={(rank, name, payload) => {
                  const key = shown.find(s => s.label === name)?.key;
                  const raw = key ? (payload?.__raw as Record<string, number> | undefined)?.[key] : undefined;
                  const rankPart = `#${rank}`;
                  if (raw === undefined) return rankPart;
                  return `${rankPart} · ${valueFormat ? valueFormat(raw) : raw.toFixed(1)}`;
                }}
              />
            }
          />
          {shown.map(s => (
            <Line
              key={s.key}
              type="linear"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              connectNulls
              isAnimationActive={false}
              label={({ index, x, y }: { index?: number; x?: number; y?: number }) => {
                // Only the final point carries a label, so the chart reads as
                // a league table with names down the right-hand edge.
                if (index !== rows.length - 1 || x === undefined || y === undefined) {
                  return <g key={`${s.key}-${index}-blank`} />;
                }
                return (
                  <text
                    key={`${s.key}-label`}
                    x={x + 8}
                    y={y + 4}
                    fill={s.color}
                    fontSize={11}
                    fontWeight={600}
                  >
                    {s.label}
                  </text>
                );
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {first && latest && (
        <p className={`text-xs mt-3 ${theme.captionCls}`}>
          Ranked across {shown.length} economies, {String(first.x)} to {String(latest.x)}.
          A line going up means the country climbed the table, which can happen
          because it improved or because someone above it slipped.
        </p>
      )}
    </ChartCard>
  );
}
