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
  LabelList,
} from 'recharts';
import type { CountryData } from '../services/worldbank';

interface Props {
  isDarkMode: boolean;
  militaryExpenditurePctGdp: CountryData[]; // MS.MIL.XPND.GD.ZS
  educationExpenditurePctGdp: CountryData[]; // SE.XPD.TOTL.GD.ZS
  gdpPerCapita: CountryData[]; // NY.GDP.PCAP.PP.CD
}

type Quadrant = 'guns-heavy' | 'balanced' | 'butter-heavy' | 'low-both';

interface Point {
  country: string;
  x: number; // military % GDP
  y: number; // education % GDP
  z: number; // GDP per capita
  quadrant: Quadrant;
}

const QUAD_COLORS: Record<Quadrant, string> = {
  'guns-heavy':   '#ef4444',
  'balanced':     '#3b82f6',
  'butter-heavy': '#10b981',
  'low-both':     '#94a3b8',
};

const QUAD_LABELS: Record<Quadrant, string> = {
  'guns-heavy':   'Guns-heavy',
  'balanced':     'Balanced spenders',
  'butter-heavy': 'Butter-heavy',
  'low-both':     'Low on both',
};

function latestValue(series: CountryData[], country: string): number | null {
  for (let i = series.length - 1; i >= 0; i--) {
    const v = Number(series[i][country]);
    if (!isNaN(v) && v > 0) return v;
  }
  return null;
}

// Countries whose labels we always show — the outliers the chart is meant to surface.
const HIGHLIGHT_COUNTRIES = new Set([
  'USA', 'China', 'Russia', 'India', 'SaudiArabia', 'UK', 'France', 'Germany',
  'Israel', 'SouthKorea', 'Japan', 'Ukraine', 'Turkey', 'Poland',
]);

const DISPLAY_LABEL: Record<string, string> = {
  USA: 'USA',
  UK: 'UK',
  SaudiArabia: 'Saudi Arabia',
  SouthKorea: 'S. Korea',
  SouthAfrica: 'S. Africa',
};

export default function GunsVsButterQuadrant({
  isDarkMode,
  militaryExpenditurePctGdp,
  educationExpenditurePctGdp,
  gdpPerCapita,
}: Props) {
  const [hoverCountry, setHoverCountry] = useState<string | null>(null);

  const { points, medianMil, medianEdu } = useMemo(() => {
    if (!militaryExpenditurePctGdp.length || !educationExpenditurePctGdp.length) {
      return { points: [] as Point[], medianMil: 2, medianEdu: 4 };
    }

    const countries = new Set<string>();
    militaryExpenditurePctGdp.forEach(row => Object.keys(row).forEach(k => { if (k !== 'year') countries.add(k); }));

    const raw: Point[] = [];
    countries.forEach(country => {
      const mil = latestValue(militaryExpenditurePctGdp, country);
      const edu = latestValue(educationExpenditurePctGdp, country);
      const gdpPc = latestValue(gdpPerCapita, country);
      if (mil == null || edu == null) return;
      raw.push({
        country,
        x: mil,
        y: edu,
        z: gdpPc ?? 10000,
        quadrant: 'low-both',
      });
    });

    if (raw.length === 0) return { points: raw, medianMil: 2, medianEdu: 4 };

    const sortedMil = [...raw].map(p => p.x).sort((a, b) => a - b);
    const sortedEdu = [...raw].map(p => p.y).sort((a, b) => a - b);
    const medianMil = sortedMil[Math.floor(sortedMil.length / 2)];
    const medianEdu = sortedEdu[Math.floor(sortedEdu.length / 2)];

    raw.forEach(p => {
      const highMil = p.x >= medianMil;
      const highEdu = p.y >= medianEdu;
      if (highMil && highEdu) p.quadrant = 'balanced';
      else if (highMil && !highEdu) p.quadrant = 'guns-heavy';
      else if (!highMil && highEdu) p.quadrant = 'butter-heavy';
      else p.quadrant = 'low-both';
    });

    return { points: raw, medianMil, medianEdu };
  }, [militaryExpenditurePctGdp, educationExpenditurePctGdp, gdpPerCapita]);

  if (points.length === 0) {
    return (
      <div className={`h-96 rounded-lg border flex items-center justify-center ${
        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
      }`}>
        Insufficient military-vs-education spending data.
      </div>
    );
  }

  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const tooltipStyle: React.CSSProperties = isDarkMode
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: 8 }
    : { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: 8 };

  const grouped: Record<Quadrant, Point[]> = {
    'guns-heavy': [],
    'balanced': [],
    'butter-heavy': [],
    'low-both': [],
  };
  points.forEach(p => grouped[p.quadrant].push(p));

  const maxMil = Math.max(...points.map(p => p.x), 6);
  const maxEdu = Math.max(...points.map(p => p.y), 8);

  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="mb-4">
        <div className={`text-xs uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Guns vs Butter
        </div>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Every tracked economy plotted by military spending (X) and public education spending (Y), both as share of GDP.
          Bubble size = GDP per capita (PPP). Reference lines cut the sample at the median of each axis.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs">
        {(Object.keys(QUAD_LABELS) as Quadrant[]).map(k => (
          <div key={k} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: QUAD_COLORS[k] }} />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              {QUAD_LABELS[k]} <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>({grouped[k].length})</span>
            </span>
          </div>
        ))}
      </div>

      <div className="h-[440px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis
              dataKey="x"
              type="number"
              stroke={axis}
              domain={[0, Math.ceil(maxMil)]}
              label={{
                value: 'Military expenditure (% of GDP)',
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
              domain={[0, Math.ceil(maxEdu)]}
              label={{
                value: 'Education expenditure (% of GDP)',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                fill: axis,
                fontSize: 12,
              }}
            />
            <ZAxis dataKey="z" range={[60, 500]} />
            <ReferenceLine x={medianMil} stroke={axis} strokeDasharray="4 4" />
            <ReferenceLine y={medianEdu} stroke={axis} strokeDasharray="4 4" />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(_v: any, _n: any, entry: any) => {
                const p: Point = entry.payload;
                return [
                  `${p.x.toFixed(2)}% mil · ${p.y.toFixed(2)}% edu · $${Math.round(p.z).toLocaleString()} GDP/cap`,
                  DISPLAY_LABEL[p.country] ?? p.country,
                ];
              }}
              labelFormatter={() => ''}
            />
            {(Object.keys(grouped) as Quadrant[]).map(k => (
              <Scatter key={k} data={grouped[k]} fill={QUAD_COLORS[k]}>
                {grouped[k].map((p, i) => (
                  <Cell
                    key={i}
                    fill={QUAD_COLORS[k]}
                    fillOpacity={hoverCountry && hoverCountry !== p.country ? 0.22 : 0.75}
                    stroke={QUAD_COLORS[k]}
                    onMouseEnter={() => setHoverCountry(p.country)}
                    onMouseLeave={() => setHoverCountry(null)}
                  />
                ))}
                <LabelList
                  dataKey="country"
                  position="right"
                  content={({ x, y, value }: any) => {
                    if (typeof value !== 'string') return null;
                    if (!HIGHLIGHT_COUNTRIES.has(value)) return null;
                    return (
                      <text
                        x={x + 8}
                        y={y + 3}
                        fontSize={10}
                        fill={axis}
                      >
                        {DISPLAY_LABEL[value] ?? value}
                      </text>
                    );
                  }}
                />
              </Scatter>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
        Guns-heavy = above median on military, below median on education. Butter-heavy = the reverse.
        Balanced = above median on both. {points.length} tracked economies. Sources: World Bank MS.MIL.XPND.GD.ZS,
        SE.XPD.TOTL.GD.ZS, NY.GDP.PCAP.PP.CD.
      </p>
    </div>
  );
}
