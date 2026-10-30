'use client';

import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import type { CountryData } from '../../services/worldbank';
import { COUNTRY_COLORS, type CountryKey } from '../../utils/countryMappings';
import { seriesFor } from '../../services/developmentCurated';
import type { StoryEvent } from '../../services/developmentCurated';
import { countryName, Segmented, theme } from './ui';

export interface RankRow {
  key: CountryKey;
  value: number;
  year?: number;
  // Shown instead of format(value) when the ranking value isn't the headline number.
  display?: string;
}

// HTML ranking (all countries, no truncation) inside a scroll container.
export function RankedBars({
  isDarkMode,
  rows,
  format,
  higherIsBetter = true,
  highlight = [],
  domainMax,
  maxHeight = 520,
  color,
}: {
  isDarkMode: boolean;
  rows: RankRow[];
  format: (v: number) => string;
  higherIsBetter?: boolean;
  highlight?: CountryKey[];
  domainMax?: number;
  maxHeight?: number;
  color?: (row: RankRow) => string;
}) {
  const t = theme(isDarkMode);
  const [order, setOrder] = useState<'best' | 'worst'>('best');
  const sorted = useMemo(() => {
    const s = [...rows].sort((a, b) => (higherIsBetter ? b.value - a.value : a.value - b.value));
    return order === 'best' ? s : s.reverse();
  }, [rows, higherIsBetter, order]);
  const max = domainMax ?? Math.max(1e-9, ...rows.map((r) => Math.abs(r.value)));
  if (!rows.length) return <p className={`text-sm py-6 text-center ${t.textMuted}`}>No data reported.</p>;
  return (
    <div>
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <span className={`text-[11px] ${t.textMuted}`}>{rows.length} countries reporting</span>
        <Segmented
          isDarkMode={isDarkMode}
          value={order}
          onChange={setOrder}
          options={[
            { id: 'best', label: 'Best first' },
            { id: 'worst', label: 'Worst first' },
          ]}
        />
      </div>
      <div className="overflow-y-auto pr-1" style={{ maxHeight }}>
        <ol className="space-y-1">
          {sorted.map((r, i) => {
            const hl = highlight.includes(r.key);
            const width = `${Math.max(1, (Math.abs(r.value) / max) * 100)}%`;
            return (
              <li key={r.key} className="grid grid-cols-[1.75rem_8.5rem_1fr_5.5rem] items-center gap-2 text-xs">
                <span className={`tabular-nums text-right ${t.textMuted}`}>{i + 1}</span>
                <span className={`truncate ${hl ? 'font-semibold ' + t.accent : t.text}`}>{countryName(r.key)}</span>
                <span className={`h-3 rounded ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                  <span
                    className="block h-3 rounded"
                    style={{ width, backgroundColor: color ? color(r) : hl ? '#10b981' : isDarkMode ? '#60a5fa' : '#3b82f6' }}
                  />
                </span>
                <span className={`tabular-nums text-right ${t.text}`}>
                  {r.display ?? format(r.value)}
                  {r.year ? <span className={`ml-1 text-[10px] ${t.textMuted}`}>{`'${String(r.year).slice(2)}`}</span> : null}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export interface ScatterRow {
  key: CountryKey;
  x: number;
  y: number;
  z?: number;
}

// 1-2-5 ticks per decade, padded to the decade steps either side of the data.
function logScaleTicks(min: number, max: number): number[] | undefined {
  if (!(min > 0) || !(max > 0)) return undefined;
  const steps: number[] = [];
  for (let e = Math.floor(Math.log10(min)) - 1; e <= Math.ceil(Math.log10(max)); e++) {
    for (const m of [1, 2, 5]) steps.push(m * 10 ** e);
  }
  const startIdx = Math.max(0, steps.findIndex((s) => s > min) - 1);
  const endIdx = steps.findIndex((s) => s >= max);
  return steps.slice(startIdx, (endIdx === -1 ? steps.length - 1 : endIdx) + 1);
}

export function ScatterPlot({
  isDarkMode,
  rows,
  xLabel,
  yLabel,
  xFormat = (v) => String(v),
  yFormat = (v) => String(v),
  xLog = false,
  highlight = [],
  height = 380,
  refX,
  refY,
  labelAll = false,
  diagonal = false,
}: {
  isDarkMode: boolean;
  rows: ScatterRow[];
  xLabel: string;
  yLabel: string;
  xFormat?: (v: number) => string;
  yFormat?: (v: number) => string;
  xLog?: boolean;
  highlight?: CountryKey[];
  height?: number;
  refX?: number;
  refY?: number;
  labelAll?: boolean;
  diagonal?: boolean;
}) {
  const t = theme(isDarkMode);
  const data = rows.map((r) => ({
    ...r,
    name: countryName(r.key),
    label: labelAll || highlight.includes(r.key) ? countryName(r.key) : '',
  }));
  const xs = rows.map((r) => r.x);
  const ys = rows.map((r) => r.y);
  const lo = Math.min(...xs, ...ys);
  const hi = Math.max(...xs, ...ys);
  const logTicks = xLog && xs.length ? logScaleTicks(Math.min(...xs), Math.max(...xs)) : undefined;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
          <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name={xLabel}
            scale={xLog ? 'log' : 'auto'}
            domain={logTicks ? [logTicks[0], logTicks[logTicks.length - 1]] : ['auto', 'auto']}
            ticks={logTicks}
            allowDataOverflow={false}
            tickFormatter={xFormat}
            stroke={t.axis}
            tick={{ fontSize: 11 }}
            label={{ value: xLabel, position: 'insideBottom', offset: -18, fill: t.axis, fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yLabel}
            domain={['auto', 'auto']}
            tickFormatter={yFormat}
            stroke={t.axis}
            tick={{ fontSize: 11 }}
            width={56}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: t.axis, fontSize: 11 }}
          />
          <ZAxis type="number" dataKey="z" range={[40, 40]} />
          <Tooltip
            contentStyle={t.tooltip}
            cursor={{ strokeDasharray: '3 3' }}
            content={({ payload }) => {
              const p = payload?.[0]?.payload as (ScatterRow & { name: string }) | undefined;
              if (!p) return null;
              return (
                <div style={t.tooltip} className="px-2 py-1.5">
                  <div className="font-semibold">{p.name}</div>
                  <div>
                    {xLabel}: {xFormat(p.x)}
                  </div>
                  <div>
                    {yLabel}: {yFormat(p.y)}
                  </div>
                </div>
              );
            }}
          />
          {refX != null && <ReferenceLine x={refX} stroke={t.axis} strokeDasharray="4 4" />}
          {refY != null && <ReferenceLine y={refY} stroke={t.axis} strokeDasharray="4 4" />}
          {diagonal && rows.length > 0 && (
            <ReferenceLine
              segment={[
                { x: lo, y: lo },
                { x: hi, y: hi },
              ]}
              stroke={t.axis}
              strokeDasharray="4 4"
            />
          )}
          <Scatter data={data}>
            {data.map((d) => (
              <Cell
                key={d.key}
                fill={COUNTRY_COLORS[d.key]}
                stroke={highlight.includes(d.key) ? (isDarkMode ? '#fff' : '#111827') : 'none'}
                strokeWidth={highlight.includes(d.key) ? 2 : 0}
              />
            ))}
            <LabelList dataKey="label" position="top" stroke="none" style={{ fontSize: 10, fill: t.axis, stroke: 'none' }} />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

// Multi-country time series. With `markers`, each real observation gets a dot,
// so sparse survey-based series show where the data actually is.
export function TrendLines({
  isDarkMode,
  series,
  keys,
  fromYear = 1990,
  toYear,
  format = (v) => v.toFixed(1),
  yLabel,
  markers = false,
  events = [],
  height = 340,
  refY,
  refLabel,
  logScale = false,
  transform,
}: {
  isDarkMode: boolean;
  series: CountryData[] | undefined;
  keys: CountryKey[];
  fromYear?: number;
  toYear?: number;
  format?: (v: number) => string;
  yLabel?: string;
  markers?: boolean;
  events?: StoryEvent[];
  height?: number;
  refY?: number;
  refLabel?: string;
  logScale?: boolean;
  transform?: (key: CountryKey, year: number, value: number) => number | null;
}) {
  const t = theme(isDarkMode);
  const data = useMemo(() => {
    const byYear = new Map<number, Record<string, number>>();
    for (const k of keys) {
      for (const o of seriesFor(series, k)) {
        if (o.year < fromYear || (toYear && o.year > toYear)) continue;
        const v = transform ? transform(k, o.year, o.value) : o.value;
        if (v == null || (logScale && v <= 0)) continue;
        const row = byYear.get(o.year) ?? { year: o.year };
        row[k] = v;
        byYear.set(o.year, row);
      }
    }
    return [...byYear.values()].sort((a, b) => a.year - b.year);
  }, [series, keys, fromYear, toYear, transform, logScale]);

  if (!data.length) return <p className={`text-sm py-8 text-center ${t.textMuted}`}>No observations for this selection.</p>;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 4, left: 4 }}>
          <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
          <XAxis dataKey="year" type="number" domain={['dataMin', 'dataMax']} stroke={t.axis} tick={{ fontSize: 11 }} allowDecimals={false} />
          <YAxis
            stroke={t.axis}
            tick={{ fontSize: 11 }}
            tickFormatter={format}
            width={56}
            scale={logScale ? 'log' : 'auto'}
            domain={logScale ? ['auto', 'auto'] : ['auto', 'auto']}
            label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: t.axis, fontSize: 11 } : undefined}
          />
          <Tooltip
            contentStyle={t.tooltip}
            formatter={(v: number, name: string) => [format(v), countryName(name)]}
            labelFormatter={(l) => String(l)}
          />
          <Legend formatter={(v: string) => countryName(v)} wrapperStyle={{ fontSize: 11 }} />
          {refY != null && (
            <ReferenceLine
              y={refY}
              stroke="#f59e0b"
              strokeDasharray="5 4"
              label={refLabel ? { value: refLabel, fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' } : undefined}
            />
          )}
          {events.map((e) => (
            <ReferenceLine
              key={`${e.year}-${e.label}`}
              x={e.year}
              stroke={t.axis}
              strokeDasharray="2 4"
              label={{ value: e.label, angle: -90, position: 'insideTopLeft', fill: t.axis, fontSize: 9 }}
            />
          ))}
          {keys.map((k) => (
            <Line
              key={k}
              type="monotone"
              dataKey={k}
              stroke={COUNTRY_COLORS[k]}
              strokeWidth={2}
              dot={markers ? { r: 2.5 } : false}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface StackKey {
  key: string;
  label: string;
  color: string;
}

export function StackedBars({
  isDarkMode,
  rows,
  stacks,
  format = (v) => v.toFixed(1),
  stacked = true,
  height,
  domainMax,
}: {
  isDarkMode: boolean;
  rows: (Record<string, number | string> & { key: CountryKey })[];
  stacks: StackKey[];
  format?: (v: number) => string;
  stacked?: boolean;
  height?: number;
  domainMax?: number;
}) {
  const t = theme(isDarkMode);
  const data = rows.map((r) => ({ ...r, name: countryName(r.key) }));
  const h = height ?? Math.max(240, data.length * (stacked ? 20 : 28) + 60);
  return (
    <div style={{ height: h }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
          <CartesianGrid stroke={t.grid} strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" stroke={t.axis} tick={{ fontSize: 11 }} tickFormatter={format} domain={domainMax ? [0, domainMax] : [0, 'auto']} />
          <YAxis type="category" dataKey="name" stroke={t.axis} tick={{ fontSize: 10 }} width={110} interval={0} />
          <Tooltip contentStyle={t.tooltip} formatter={(v: number, n: string) => [format(v), n]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {stacks.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} stackId={stacked ? 'a' : undefined} isAnimationActive={false} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
