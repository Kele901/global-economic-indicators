'use client';

// Connected scatter: two variables plotted against each other with the
// observations joined in time order, so the path through the plane is the
// chart rather than the cloud of points.
//
// This is the right idiom whenever the relationship between two series is
// supposed to be stable and the interesting finding is that it moves — the
// Phillips curve being the textbook case. A normal scatter of the same data
// hides the chronology, which is precisely the thing under dispute.

import { useMemo } from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { useChartTheme } from '../../utils/chartTheme';
import { useIsMobile } from '../../hooks/useViewportSize';
import ChartCard from './ChartCard';
import ChartA11yCaption from '../ChartA11yCaption';

export interface ScatterPathPoint {
  // Time label, used for ordering and for the point annotations.
  t: number;
  x: number;
  y: number;
}

export interface ScatterPath {
  key: string;
  label: string;
  color: string;
  points: ScatterPathPoint[];
}

interface Props {
  isDarkMode: boolean;
  paths: ScatterPath[];
  xLabel: string;
  yLabel: string;
  title?: string;
  subtitle?: string;
  provenance?: React.ReactNode;
  actions?: React.ReactNode;
  footnote?: React.ReactNode;
  height?: string | number;
  xFormat?: (v: number) => string;
  yFormat?: (v: number) => string;
  // Annotate every nth point with its time label, plus always the endpoints.
  labelEvery?: number;
  xReference?: number;
  yReference?: number;
}

interface DotProps {
  cx?: number;
  cy?: number;
  index?: number;
  payload?: ScatterPathPoint;
}

export default function ConnectedScatter({
  isDarkMode,
  paths,
  xLabel,
  yLabel,
  title,
  subtitle,
  provenance,
  actions,
  footnote,
  height = 'h-[400px] sm:h-[480px]',
  xFormat,
  yFormat,
  labelEvery = 5,
  xReference,
  yReference,
}: Props) {
  const theme = useChartTheme(isDarkMode);
  const isMobile = useIsMobile();

  const ordered = useMemo(
    () => paths
      .map(p => ({ ...p, points: [...p.points].sort((a, b) => a.t - b.t) }))
      .filter(p => p.points.length >= 2),
    [paths],
  );

  const fmtX = (v: number) => (xFormat ? xFormat(v) : v.toFixed(1));
  const fmtY = (v: number) => (yFormat ? yFormat(v) : v.toFixed(1));

  if (ordered.length === 0) {
    return (
      <ChartCard isDarkMode={isDarkMode} title={title} subtitle={subtitle} height="h-auto">
        <p className={`text-sm ${theme.subtitleCls}`}>
          Neither series has enough overlapping observations to trace a path yet.
        </p>
      </ChartCard>
    );
  }

  // One dot renderer per path so the closure can own that path's colour and
  // decide which points earn a year label.
  const makeDot = (path: (typeof ordered)[number]) => {
    const lastIndex = path.points.length - 1;
    const Dot = ({ cx, cy, index, payload }: DotProps) => {
      if (cx === undefined || cy === undefined || payload === undefined) return <g />;
      const isEnd = index === 0 || index === lastIndex;
      const labelled = isEnd || (index !== undefined && index % labelEvery === 0);
      return (
        <g key={`${path.key}-${payload.t}`}>
          <circle
            cx={cx}
            cy={cy}
            r={isEnd ? 5 : 3}
            fill={isEnd ? path.color : theme.tooltipBg}
            stroke={path.color}
            strokeWidth={isEnd ? 1 : 1.5}
          />
          {labelled && (
            <text
              x={cx + 7}
              y={cy - 5}
              fontSize={isEnd ? 11 : 9.5}
              fontWeight={isEnd ? 600 : 400}
              fill={isEnd ? path.color : theme.axis}
            >
              {payload.t}
            </text>
          )}
        </g>
      );
    };
    return Dot;
  };

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
          title={`${yLabel} against ${xLabel}, traced in time order`}
          rows={ordered.flatMap(p => {
            const firstPt = p.points[0]!;
            const lastPt = p.points[p.points.length - 1]!;
            return [
              { label: `${p.label} ${firstPt.t}: ${xLabel} ${fmtX(firstPt.x)}, ${yLabel}`, value: firstPt.y },
              { label: `${p.label} ${lastPt.t}: ${xLabel} ${fmtX(lastPt.x)}, ${yLabel}`, value: lastPt.y },
            ];
          })}
        />
      }
      footnote={footnote}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart margin={isMobile ? { top: 12, right: 12, left: 4, bottom: 32 } : { top: 16, right: 30, left: 16, bottom: 32 }}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            stroke={theme.axis}
            tick={{ fontSize: 11 }}
            tickFormatter={fmtX}
            domain={['dataMin', 'dataMax']}
            label={{ value: xLabel, position: 'bottom', offset: 12, fill: theme.axis, fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            stroke={theme.axis}
            tick={{ fontSize: 11 }}
            tickFormatter={fmtY}
            width={isMobile ? 48 : 60}
            domain={['auto', 'auto']}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: theme.axis, fontSize: 11 }}
          />
          <ZAxis range={[40, 40]} />
          {xReference !== undefined && <ReferenceLine x={xReference} stroke={theme.axis} strokeDasharray="4 4" />}
          {yReference !== undefined && <ReferenceLine y={yReference} stroke={theme.axis} strokeDasharray="4 4" />}
          <Tooltip
            contentStyle={{
              backgroundColor: theme.tooltipBg,
              border: `1px solid ${theme.tooltipBorder}`,
              color: theme.tooltipText,
              fontSize: 12,
              borderRadius: 6,
            }}
            formatter={(value: unknown, name: unknown) => [
              name === 'y' ? fmtY(Number(value)) : fmtX(Number(value)),
              name === 'y' ? yLabel : xLabel,
            ]}
            labelFormatter={() => ''}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} verticalAlign="top" />
          {ordered.map(path => (
            <Line
              key={path.key}
              data={path.points}
              dataKey="y"
              name={path.label}
              type="linear"
              stroke={path.color}
              strokeWidth={1.75}
              isAnimationActive={false}
              dot={makeDot(path)}
              activeDot={{ r: 6 }}
              legendType="line"
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
