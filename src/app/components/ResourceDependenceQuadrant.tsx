'use client';

import { useMemo, useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { CountryData } from '../services/worldbank';

interface Props {
  isDarkMode: boolean;
  totalResourceRents: CountryData[];
  gdpGrowth: CountryData[];
  gdpPerCapita: CountryData[];
}

interface QuadrantPoint {
  country: string;
  x: number; // resource rents % GDP
  y: number; // 10-year avg GDP growth
  z: number; // GDP per capita (bubble size)
  quadrant: 'diversified-rich' | 'resource-curse' | 'efficient-extractor' | 'resource-poor';
}

const QUADRANT_COLORS: Record<QuadrantPoint['quadrant'], string> = {
  'diversified-rich': '#10b981',
  'resource-curse': '#ef4444',
  'efficient-extractor': '#3b82f6',
  'resource-poor': '#94a3b8',
};

const QUADRANT_LABELS: Record<QuadrantPoint['quadrant'], string> = {
  'diversified-rich': 'Diversified & Rich',
  'resource-curse': 'Resource Curse',
  'efficient-extractor': 'Efficient Extractors',
  'resource-poor': 'Resource-Poor',
};

// Find the most recent value for a country, ignoring missing/zero years.
function latestValue(series: CountryData[], country: string): number | null {
  for (let i = series.length - 1; i >= 0; i--) {
    const v = Number(series[i][country]);
    if (!isNaN(v) && v !== 0) return v;
  }
  return null;
}

// Rolling average of the last N valid (non-null, non-zero) values for a country.
function trailingAverage(series: CountryData[], country: string, n: number): number | null {
  const values: number[] = [];
  for (let i = series.length - 1; i >= 0 && values.length < n; i--) {
    const v = Number(series[i][country]);
    if (!isNaN(v) && v !== 0) values.push(v);
  }
  if (values.length === 0) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export default function ResourceDependenceQuadrant({
  isDarkMode,
  totalResourceRents,
  gdpGrowth,
  gdpPerCapita,
}: Props) {
  const [hoverCountry, setHoverCountry] = useState<string | null>(null);

  const { points, medianRents, medianGrowth } = useMemo(() => {
    if (!totalResourceRents.length) return { points: [] as QuadrantPoint[], medianRents: 5, medianGrowth: 2 };

    const countries = new Set<string>();
    totalResourceRents.forEach(row => {
      Object.keys(row).forEach(k => {
        if (k !== 'year') countries.add(k);
      });
    });

    const raw: QuadrantPoint[] = [];
    countries.forEach(country => {
      const rents = latestValue(totalResourceRents, country);
      const growth = trailingAverage(gdpGrowth, country, 10);
      const gdpPc = latestValue(gdpPerCapita, country);
      if (rents == null || growth == null) return;
      raw.push({
        country,
        x: rents,
        y: growth,
        z: gdpPc ?? 10000,
        quadrant: 'resource-poor', // placeholder, set below
      });
    });

    if (raw.length === 0) return { points: raw, medianRents: 5, medianGrowth: 2 };

    // Median-based split so quadrants stay roughly balanced regardless of scale.
    const sortedRents = [...raw].map(p => p.x).sort((a, b) => a - b);
    const sortedGrowth = [...raw].map(p => p.y).sort((a, b) => a - b);
    const medianRents = sortedRents[Math.floor(sortedRents.length / 2)];
    const medianGrowth = sortedGrowth[Math.floor(sortedGrowth.length / 2)];

    raw.forEach(p => {
      const highRents = p.x >= medianRents;
      const highGrowth = p.y >= medianGrowth;
      if (highRents && highGrowth) p.quadrant = 'efficient-extractor';
      else if (highRents && !highGrowth) p.quadrant = 'resource-curse';
      else if (!highRents && highGrowth) p.quadrant = 'diversified-rich';
      else p.quadrant = 'resource-poor';
    });

    return { points: raw, medianRents, medianGrowth };
  }, [totalResourceRents, gdpGrowth, gdpPerCapita]);

  if (points.length === 0) {
    return (
      <div className={`h-96 rounded-lg border flex items-center justify-center ${
        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
      }`}>
        Insufficient resource-rent data available.
      </div>
    );
  }

  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const tooltipStyle: React.CSSProperties = isDarkMode
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: 8 }
    : { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: 8 };

  const grouped: Record<QuadrantPoint['quadrant'], QuadrantPoint[]> = {
    'diversified-rich': [],
    'resource-curse': [],
    'efficient-extractor': [],
    'resource-poor': [],
  };
  points.forEach(p => grouped[p.quadrant].push(p));

  const maxRents = Math.max(...points.map(p => p.x), 20);
  const minGrowth = Math.min(...points.map(p => p.y), -2);
  const maxGrowth = Math.max(...points.map(p => p.y), 8);

  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        {(Object.keys(QUADRANT_LABELS) as QuadrantPoint['quadrant'][]).map(k => (
          <div key={k} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: QUADRANT_COLORS[k] }} />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              {QUADRANT_LABELS[k]} <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>({grouped[k].length})</span>
            </span>
          </div>
        ))}
      </div>

      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis
              dataKey="x"
              type="number"
              stroke={axis}
              domain={[0, Math.ceil(maxRents / 5) * 5]}
              label={{
                value: 'Total Resource Rents (% of GDP)',
                position: 'insideBottom',
                offset: -20,
                fill: axis,
                fontSize: 12,
              }}
            />
            <YAxis
              dataKey="y"
              type="number"
              stroke={axis}
              domain={[Math.floor(minGrowth), Math.ceil(maxGrowth)]}
              label={{
                value: '10-Year Avg GDP Growth (%)',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                fill: axis,
                fontSize: 12,
              }}
            />
            <ZAxis dataKey="z" range={[60, 500]} />
            <ReferenceLine x={medianRents} stroke={axis} strokeDasharray="4 4" />
            <ReferenceLine y={medianGrowth} stroke={axis} strokeDasharray="4 4" />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(_v: any, _n: any, entry: any) => {
                const p: QuadrantPoint = entry.payload;
                return [
                  `${p.x.toFixed(1)}% rents · ${p.y.toFixed(1)}% growth · $${Math.round(p.z).toLocaleString()} GDP/cap`,
                  p.country,
                ];
              }}
              labelFormatter={() => ''}
            />
            {(Object.keys(grouped) as QuadrantPoint['quadrant'][]).map(k => (
              <Scatter key={k} data={grouped[k]} fill={QUADRANT_COLORS[k]}>
                {grouped[k].map((p, i) => (
                  <Cell
                    key={i}
                    fill={QUADRANT_COLORS[k]}
                    fillOpacity={hoverCountry && hoverCountry !== p.country ? 0.25 : 0.75}
                    stroke={QUADRANT_COLORS[k]}
                    onMouseEnter={() => setHoverCountry(p.country)}
                    onMouseLeave={() => setHoverCountry(null)}
                  />
                ))}
              </Scatter>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
        Each bubble is one country. X = latest total resource rents share of GDP. Y = 10-year average GDP growth.
        Bubble size = GDP per capita (PPP). Reference lines split the sample at the median so quadrants stay
        roughly balanced across the {points.length} tracked economies.
      </p>
    </div>
  );
}
