'use client';

import { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell, LabelList, CartesianGrid } from 'recharts';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_ISO3, REGION_ORDER, getRegionFor, type CountryKey } from '../../utils/countryMappings';
import { pearsonCorrelation } from '../../utils/correlationEngine';
import { REGION_COLORS } from '../../utils/heatmap/palettes';
import { entries, type CountryValues } from '../../utils/heatmap/values';
import { heatmapTheme } from './theme';

interface Point { country: CountryKey; name: string; iso3: string; x: number; y: number }

interface Props {
  xValues: CountryValues;
  yValues: CountryValues;
  xLabel: string;
  yLabel: string;
  xFormat: (v: number) => string;
  yFormat: (v: number) => string;
  isDarkMode: boolean;
  selected: CountryKey | null;
  highlight: Set<CountryKey> | null;
  onSelect: (country: CountryKey) => void;
}

function describeR(r: number): string {
  const a = Math.abs(r);
  const strength = a >= 0.7 ? 'strong' : a >= 0.4 ? 'moderate' : a >= 0.2 ? 'weak' : 'little or no';
  if (strength === 'little or no') return 'little or no linear relationship';
  return `a ${strength} ${r > 0 ? 'positive' : 'negative'} relationship`;
}

export default function ScatterView({ xValues, yValues, xLabel, yLabel, xFormat, yFormat, isDarkMode, selected, highlight, onSelect }: Props) {
  const tc = heatmapTheme(isDarkMode);
  const points = useMemo<Point[]>(() =>
    entries(xValues)
      .filter(([ck]) => yValues[ck] !== undefined)
      .map(([ck, x]) => ({ country: ck, name: COUNTRY_DISPLAY_NAMES[ck], iso3: COUNTRY_ISO3[ck], x, y: yValues[ck]! })),
  [xValues, yValues]);

  const byRegion = useMemo(() => REGION_ORDER.map(region => ({
    region,
    color: REGION_COLORS[region] ?? '#6b7280',
    points: points.filter(p => getRegionFor(p.country) === region),
  })).filter(r => r.points.length), [points]);

  const fit = useMemo(() => {
    if (points.length < 3) return null;
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const mx = xs.reduce((s, v) => s + v, 0) / xs.length;
    const my = ys.reduce((s, v) => s + v, 0) / ys.length;
    const sxx = xs.reduce((s, v) => s + (v - mx) ** 2, 0);
    if (sxx === 0) return null;
    const slope = xs.reduce((s, v, i) => s + (v - mx) * (ys[i] - my), 0) / sxx;
    const intercept = my - slope * mx;
    const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
    return { r: pearsonCorrelation(xs, ys), segment: [{ x: x0, y: intercept + slope * x0 }, { x: x1, y: intercept + slope * x1 }] };
  }, [points]);

  const axisColor = isDarkMode ? '#9ca3af' : '#6b7280';

  if (points.length < 3) {
    return <p className={`py-12 text-center text-sm ${tc.textSec}`}>Not enough countries have data for both metrics in this year. Try another year or metric pair.</p>;
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
        <p className="text-sm">
          {fit && <><span className="font-semibold">r = {fit.r.toFixed(2)}</span><span className={tc.textSec}>: {describeR(fit.r)} across {points.length} countries.</span></>}
        </p>
        <p className={`text-xs ${tc.textSec}`}>Correlation is not causation: both may be driven by a third factor such as income.</p>
      </div>
      <div className="h-[460px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid stroke={isDarkMode ? '#374151' : '#e5e7eb'} strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" name={xLabel} tick={{ fontSize: 11, fill: axisColor }} tickFormatter={xFormat}
              label={{ value: xLabel, position: 'insideBottom', offset: -18, fill: axisColor, fontSize: 12 }} domain={['auto', 'auto']} />
            <YAxis type="number" dataKey="y" name={yLabel} tick={{ fontSize: 11, fill: axisColor }} tickFormatter={yFormat} width={70}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: axisColor, fontSize: 12, style: { textAnchor: 'middle' } }} domain={['auto', 'auto']} />
            <ZAxis range={[90, 90]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }}
              content={({ payload }) => {
                const p = payload?.[0]?.payload as Point | undefined;
                if (!p) return null;
                return (
                  <div className={`px-3 py-2 rounded-lg border shadow-lg text-xs ${tc.card}`}>
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className={tc.textSec}>{xLabel}: {xFormat(p.x)}</p>
                    <p className={tc.textSec}>{yLabel}: {yFormat(p.y)}</p>
                  </div>
                );
              }} />
            {fit && <ReferenceLine segment={fit.segment} stroke={isDarkMode ? '#f59e0b' : '#d97706'} strokeDasharray="6 4" strokeWidth={1.5} ifOverflow="extendDomain" />}
            {byRegion.map(({ region, color, points: pts }) => (
              <Scatter key={region} name={region} data={pts} fill={color} isAnimationActive animationDuration={500}
                onClick={(p: { payload?: Point } & Partial<Point>) => { const c = p.payload?.country ?? p.country; if (c) onSelect(c); }}
                cursor="pointer">
                {pts.map(p => (
                  <Cell key={p.country}
                    fillOpacity={highlight && !highlight.has(p.country) ? 0.15 : 0.85}
                    stroke={p.country === selected ? '#f59e0b' : 'none'} strokeWidth={p.country === selected ? 3 : 0} />
                ))}
                <LabelList dataKey="iso3" position="top" style={{ fontSize: 9, fill: axisColor }} />
              </Scatter>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center">
        {byRegion.map(({ region, color }) => (
          <span key={region} className={`flex items-center gap-1.5 text-xs ${tc.textSec}`}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />{region}
          </span>
        ))}
      </div>
    </div>
  );
}
