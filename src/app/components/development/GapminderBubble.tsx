'use client';

import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Cell, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis, LabelList } from 'recharts';
import { COUNTRY_KEYS, REGION_ORDER, getRegionFor, type CountryKey } from '../../utils/countryMappings';
import { nearestObs, seriesFor } from '../../services/developmentCurated';
import type { DevData } from '../../development/useDevelopmentData';
import { countryName, fmt, theme } from './ui';

export const REGION_COLORS: Record<string, string> = {
  'North America': '#3b82f6',
  'Latin America': '#f59e0b',
  Europe: '#8b5cf6',
  Eurasia: '#ec4899',
  'Middle East & North Africa': '#14b8a6',
  'Sub-Saharan Africa': '#ef4444',
  'Asia-Pacific': '#22c55e',
};

const FIRST_YEAR = 1960;

export default function GapminderBubble({
  isDarkMode,
  data,
  highlight = [],
  initialYear,
  height = 460,
  compact = false,
}: {
  isDarkMode: boolean;
  data: DevData;
  highlight?: CountryKey[];
  initialYear?: number;
  height?: number;
  compact?: boolean;
}) {
  const t = theme(isDarkMode);
  const lastYear = useMemo(() => {
    const years = seriesFor(data.gdpPcConst, 'USA').map((o) => o.year);
    return years.length ? years[years.length - 1] : new Date().getFullYear() - 2;
  }, [data.gdpPcConst]);
  const [year, setYear] = useState<number>(initialYear ?? lastYear);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (initialYear == null) setYear(lastYear);
  }, [lastYear, initialYear]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setYear((y) => {
        if (y >= lastYear) {
          setPlaying(false);
          return y;
        }
        return y + 1;
      });
    }, 280);
    return () => clearInterval(id);
  }, [playing, lastYear]);

  const points = useMemo(
    () =>
      COUNTRY_KEYS.map((k) => {
        const x = nearestObs(data.gdpPcConst, k, year, 1);
        const y = nearestObs(data.lifeExpectancy, k, year, 1);
        const z = nearestObs(data.population, k, year, 2);
        if (!x || !y || x.value <= 0) return null;
        return {
          key: k,
          name: countryName(k),
          x: x.value,
          y: y.value,
          z: z ? z.value / 1e6 : 5,
          region: getRegionFor(k) ?? '',
          label: highlight.includes(k) || (z && z.value > 2e8) ? countryName(k) : '',
        };
      }).filter((p): p is NonNullable<typeof p> => p !== null),
    [data, year, highlight]
  );

  const play = () => {
    if (year >= lastYear) setYear(FIRST_YEAR);
    setPlaying((p) => !p);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <button
          type="button"
          onClick={play}
          className="px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-500"
          aria-label={playing ? 'Pause animation' : 'Play animation'}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <input
          type="range"
          min={FIRST_YEAR}
          max={lastYear}
          value={year}
          onChange={(e) => {
            setPlaying(false);
            setYear(Number(e.target.value));
          }}
          className="flex-1 min-w-[160px] accent-emerald-600"
          aria-label="Year"
        />
        <span className={`text-2xl font-bold tabular-nums w-16 text-right ${t.text}`}>{year}</span>
      </div>
      <div style={{ height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              scale="log"
              domain={[200, 120000]}
              allowDataOverflow
              ticks={[300, 1000, 3000, 10000, 30000, 100000]}
              tickFormatter={(v) => fmt.usdK(v)}
              stroke={t.axis}
              tick={{ fontSize: 11 }}
              label={{ value: 'GDP per person (constant 2015 US$, log scale)', position: 'insideBottom', offset: -18, fill: t.axis, fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[30, 90]}
              allowDataOverflow
              stroke={t.axis}
              tick={{ fontSize: 11 }}
              width={44}
              label={{ value: 'Life expectancy', angle: -90, position: 'insideLeft', fill: t.axis, fontSize: 11 }}
            />
            <ZAxis type="number" dataKey="z" range={[30, 2200]} domain={[0, 1450]} />
            <Tooltip
              content={({ payload }) => {
                const p = payload?.[0]?.payload as (typeof points)[number] | undefined;
                if (!p) return null;
                return (
                  <div style={t.tooltip} className="px-2 py-1.5">
                    <div className="font-semibold">
                      {p.name} ({year})
                    </div>
                    <div>GDP per person: {fmt.usd(p.x)}</div>
                    <div>Life expectancy: {p.y.toFixed(1)} yrs</div>
                    <div>Population: {p.z.toFixed(1)}m</div>
                  </div>
                );
              }}
            />
            <Scatter data={points} isAnimationActive={false}>
              {points.map((p) => (
                <Cell
                  key={p.key}
                  fill={REGION_COLORS[p.region] ?? '#9ca3af'}
                  fillOpacity={0.7}
                  stroke={highlight.includes(p.key) ? (isDarkMode ? '#fff' : '#111827') : REGION_COLORS[p.region]}
                  strokeWidth={highlight.includes(p.key) ? 2 : 1}
                />
              ))}
              <LabelList dataKey="label" position="top" style={{ fontSize: 10, fill: t.axis }} />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div
          className={`pointer-events-none absolute right-8 bottom-14 text-6xl sm:text-8xl font-black tabular-nums opacity-10 ${t.text}`}
          aria-hidden
        >
          {year}
        </div>
      </div>
      {!compact && (
        <div className="flex flex-wrap gap-3 mt-2">
          {REGION_ORDER.map((r) => (
            <span key={r} className={`inline-flex items-center gap-1.5 text-[11px] ${t.textSec}`}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: REGION_COLORS[r] }} />
              {r}
            </span>
          ))}
          <span className={`text-[11px] ${t.textMuted}`}>Bubble size: population</span>
        </div>
      )}
    </div>
  );
}
