'use client';

// Waterfall chart for decompositions: a starting level, a run of signed
// contributions, and the level they add up to.
//
// Recharts has no waterfall, so each column is drawn as a ranged bar: the
// dataKey resolves to a [from, to] pair rather than a single number. That is
// the one approach that survives values crossing zero — the more common
// invisible-plinth trick breaks there, because Recharts splits a stack with
// mixed signs into separate positive and negative stacks.
//
// Steps marked as totals span from zero to their level, which is what makes
// the opening and closing columns read as levels rather than changes.

import { useMemo } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useChartTheme, truncateLabel } from '../../utils/chartTheme';
import { useIsMobile } from '../../hooks/useViewportSize';
import ChartCard from './ChartCard';
import ChartA11yCaption from '../ChartA11yCaption';

export interface WaterfallStep {
  label: string;
  // For 'delta' steps this is the signed contribution; for 'total' steps it
  // is the absolute level.
  value: number;
  kind?: 'delta' | 'total';
  // Optional per-step note surfaced in the tooltip.
  note?: string;
}

interface Props {
  isDarkMode: boolean;
  steps: WaterfallStep[];
  title?: string;
  subtitle?: string;
  provenance?: React.ReactNode;
  actions?: React.ReactNode;
  footnote?: React.ReactNode;
  height?: string | number;
  valueFormat?: (value: number) => string;
  yLabel?: string;
  // Set false for metrics where an increase is the bad outcome (debt).
  risingIsGood?: boolean;
}

interface Row {
  label: string;
  // [from, to] in data units. Recharts draws the bar between the two.
  range: [number, number];
  // Signed magnitude for the label and tooltip.
  signed: number;
  kind: 'delta' | 'total';
  note?: string;
  running: number;
}

export default function WaterfallChart({
  isDarkMode,
  steps,
  title,
  subtitle,
  provenance,
  actions,
  footnote,
  height = 'h-[300px] sm:h-[420px]',
  valueFormat,
  yLabel,
  risingIsGood = true,
}: Props) {
  const theme = useChartTheme(isDarkMode);
  const isMobile = useIsMobile();

  const rows = useMemo<Row[]>(() => {
    let running = 0;
    return steps.map(step => {
      const kind = step.kind ?? 'delta';
      if (kind === 'total') {
        running = step.value;
        return {
          label: step.label,
          range: [0, step.value] as [number, number],
          signed: step.value,
          kind,
          note: step.note,
          running,
        };
      }
      const start = running;
      running = start + step.value;
      return {
        label: step.label,
        range: [start, running] as [number, number],
        signed: step.value,
        kind,
        note: step.note,
        running,
      };
    });
  }, [steps]);

  const fmt = (v: number) => (valueFormat ? valueFormat(v) : v.toFixed(1));

  const colorFor = (row: Row) =>
    row.kind === 'total'
      ? theme.palette.info
      : theme.tone(row.signed, !risingIsGood);

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
          title={title ?? 'Waterfall decomposition'}
          rows={rows.map(r => ({
            label: r.kind === 'total' ? `${r.label} (level)` : `${r.label} (change, running total ${fmt(r.running)})`,
            value: r.signed,
          }))}
        />
      }
      footnote={footnote}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          margin={isMobile ? { top: 16, right: 8, left: 0, bottom: 40 } : { top: 20, right: 20, left: 10, bottom: 60 }}
        >
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            stroke={theme.axis}
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={isMobile ? 56 : 70}
            interval={0}
            tickFormatter={isMobile ? (v: unknown) => truncateLabel(v, 12) : undefined}
          />
          <YAxis
            stroke={theme.axis}
            width={isMobile ? 44 : 60}
            tick={{ fontSize: 11 }}
            tickFormatter={v => fmt(Number(v))}
            label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: theme.axis, fontSize: 11 } : undefined}
          />
          <ReferenceLine y={0} stroke={theme.axis} />
          <Tooltip
            cursor={{ fill: theme.cursor }}
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;
              const row = payload[0]?.payload as Row | undefined;
              if (!row) return null;
              return (
                <div
                  className="rounded-md border px-3 py-2 shadow-lg text-xs"
                  style={{ backgroundColor: theme.tooltipBg, borderColor: theme.tooltipBorder, color: theme.tooltipText }}
                >
                  <div className="font-semibold mb-1">{row.label}</div>
                  <div className="tabular-nums">
                    {row.kind === 'total'
                      ? fmt(row.signed)
                      : `${row.signed >= 0 ? '+' : ''}${fmt(row.signed)} → ${fmt(row.running)}`}
                  </div>
                  {row.note && <div className="mt-1 opacity-75">{row.note}</div>}
                </div>
              );
            }}
          />
          <Bar dataKey="range" isAnimationActive={false} maxBarSize={56}>
            {rows.map((row, i) => (
              <Cell key={`${row.label}-${i}`} fill={colorFor(row)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
