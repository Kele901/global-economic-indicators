'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from 'recharts';
import {
  POLITICS_PROFILES,
  REGIME_COLORS,
  REGIME_LABELS,
  REGIME_ORDER,
  powerConcentration,
  type PoliticalProfile,
} from '../services/politicsCurated';
import type { CountryData } from '../services/worldbank';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG } from '../utils/countryMappings';
import { compositeScore, latestValue, linearFit, pearson, tenYearMean, type WgiByCountry } from '../utils/politicsColors';

type XMetric = 'composite' | 'eiu' | 'freedomHouse' | 'vdem' | 'ruleOfLaw' | 'concentration';
type YMetric = 'gdpPerCapitaPPP' | 'gdpGrowth' | 'inflationRates' | 'governmentDebt' | 'giniCoefficient' | 'lifeExpectancy';

const X_LABELS: Record<XMetric, string> = {
  composite: 'Governance composite (0-100)',
  eiu: 'EIU Democracy Index (0-10)',
  freedomHouse: 'Freedom House (0-100)',
  vdem: 'V-Dem Liberal Democracy (0-1)',
  ruleOfLaw: 'WGI rule of law (-2.5 to 2.5)',
  concentration: 'Power concentration (0-100)',
};

const Y_LABELS: Record<YMetric, { label: string; mean: boolean; log?: boolean; unit: string }> = {
  gdpPerCapitaPPP: { label: 'GDP per capita, PPP (latest)', mean: false, log: true, unit: '$' },
  gdpGrowth: { label: 'GDP growth, 10-year average', mean: true, unit: '%' },
  inflationRates: { label: 'Inflation, 10-year average', mean: true, unit: '%' },
  governmentDebt: { label: 'Government debt, % of GDP (latest)', mean: false, unit: '%' },
  giniCoefficient: { label: 'Gini inequality (latest)', mean: false, unit: '' },
  lifeExpectancy: { label: 'Life expectancy (latest)', mean: false, unit: ' yrs' },
};

export type ProsperityData = Partial<Record<YMetric, CountryData[]>>;

interface Props {
  isDarkMode: boolean;
  data: ProsperityData | null;
  wgi: WgiByCountry;
  loading?: boolean;
  height?: number;
}

interface Pt {
  key: string;
  label: string;
  x: number;
  y: number;
  plotY: number;
  color: string;
  regime: string;
  slug: string;
}

function xValue(p: PoliticalProfile, m: XMetric, wgi: WgiByCountry): number | undefined {
  switch (m) {
    case 'composite': return compositeScore(p);
    case 'eiu': return p.indices.eiu.score;
    case 'freedomHouse': return p.indices.freedomHouse.score;
    case 'vdem': return p.indices.vdemLibDem[p.indices.vdemLibDem.length - 1];
    case 'ruleOfLaw': return wgi[p.key]?.ruleOfLaw;
    case 'concentration': return powerConcentration(p);
  }
}

function fmtY(v: number, m: YMetric): string {
  const { unit } = Y_LABELS[m];
  if (m === 'gdpPerCapitaPPP') return `$${Math.round(v).toLocaleString()}`;
  return `${v.toFixed(1)}${unit}`;
}

export default function PoliticsProsperityChart({ isDarkMode, data, wgi, loading, height = 420 }: Props) {
  const router = useRouter();
  const [xm, setXm] = useState<XMetric>('composite');
  const [ym, setYm] = useState<YMetric>('gdpPerCapitaPPP');

  const { points, r, fit } = useMemo(() => {
    const meta = Y_LABELS[ym];
    const pts: Pt[] = [];
    for (const p of POLITICS_PROFILES) {
      const x = xValue(p, xm, wgi);
      const series = data?.[ym];
      const y = meta.mean ? tenYearMean(series, p.key) : latestValue(series, p.key);
      if (x == null || y == null || Number.isNaN(x) || Number.isNaN(y)) continue;
      if (meta.log && y <= 0) continue;
      pts.push({
        key: p.key,
        label: COUNTRY_DISPLAY_NAMES[p.key],
        x,
        y,
        plotY: meta.log ? Math.log10(y) : y,
        color: REGIME_COLORS[p.system.regime],
        regime: REGIME_LABELS[p.system.regime],
        slug: COUNTRY_KEY_TO_SLUG[p.key],
      });
    }
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.plotY);
    return { points: pts, r: pearson(xs, ys), fit: pts.length >= 3 ? linearFit(xs, ys) : null };
  }, [xm, ym, data, wgi]);

  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const select = `text-xs rounded-md border px-2 py-1 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-white border-gray-300 text-gray-700'}`;
  const log = !!Y_LABELS[ym].log;

  const xDomain = points.length ? [Math.min(...points.map((p) => p.x)), Math.max(...points.map((p) => p.x))] : [0, 1];
  const fitSegment = fit
    ? [
        { x: xDomain[0], y: fit.intercept + fit.slope * xDomain[0] },
        { x: xDomain[1], y: fit.intercept + fit.slope * xDomain[1] },
      ]
    : null;

  const strength = Number.isNaN(r) ? '' : Math.abs(r) >= 0.6 ? 'strong' : Math.abs(r) >= 0.3 ? 'moderate' : 'weak';

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <label className={`flex items-center gap-1.5 text-xs ${textSec}`}>
          Politics
          <select className={select} value={xm} onChange={(e) => setXm(e.target.value as XMetric)}>
            {(Object.keys(X_LABELS) as XMetric[]).map((k) => <option key={k} value={k}>{X_LABELS[k]}</option>)}
          </select>
        </label>
        <label className={`flex items-center gap-1.5 text-xs ${textSec}`}>
          Outcome
          <select className={select} value={ym} onChange={(e) => setYm(e.target.value as YMetric)}>
            {(Object.keys(Y_LABELS) as YMetric[]).map((k) => <option key={k} value={k}>{Y_LABELS[k].label}</option>)}
          </select>
        </label>
        {!Number.isNaN(r) && (
          <span className={`ml-auto text-sm tabular-nums ${textPrimary}`}>
            Pearson r = <span className="font-semibold">{r.toFixed(2)}</span>
            <span className={`ml-1 text-xs ${textSec}`}>({strength}, n = {points.length})</span>
          </span>
        )}
      </div>

      {loading && !data ? (
        <div className={`flex items-center justify-center text-sm ${textSec}`} style={{ height }}>Loading World Bank data...</div>
      ) : points.length < 3 ? (
        <div className={`flex items-center justify-center text-sm ${textSec}`} style={{ height }}>Not enough data for this combination.</div>
      ) : (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 16, bottom: 28, left: 8 }}>
              <CartesianGrid stroke={grid} strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                domain={['auto', 'auto']}
                stroke={axis}
                tick={{ fontSize: 11 }}
                label={{ value: X_LABELS[xm], position: 'insideBottom', offset: -16, fill: axis, fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey={log ? 'plotY' : 'y'}
                domain={['auto', 'auto']}
                stroke={axis}
                tick={{ fontSize: 11 }}
                width={56}
                tickFormatter={(v: number) => (log ? `$${Math.round(10 ** v / 1000)}k` : v.toFixed(0))}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const pt = payload[0].payload as Pt;
                  if (!pt.label) return null;
                  return (
                    <div className={`px-3 py-2 rounded-lg text-xs shadow-lg ${isDarkMode ? 'bg-gray-800 text-gray-100 border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}`}>
                      <div className="font-semibold text-sm">{pt.label}</div>
                      <div className="opacity-80">{pt.regime}</div>
                      <div className="mt-1 tabular-nums">{X_LABELS[xm]}: {pt.x.toFixed(xm === 'vdem' || xm === 'ruleOfLaw' ? 2 : 1)}</div>
                      <div className="tabular-nums">{Y_LABELS[ym].label}: {fmtY(pt.y, ym)}</div>
                    </div>
                  );
                }}
              />
              {fitSegment && (
                <ReferenceLine
                  segment={[{ x: fitSegment[0].x, y: fitSegment[0].y }, { x: fitSegment[1].x, y: fitSegment[1].y }]}
                  stroke={isDarkMode ? '#a5b4fc' : '#4f46e5'}
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                  ifOverflow="extendDomain"
                />
              )}
              <Scatter
                data={points}
                cursor="pointer"
                onClick={(d: unknown) => {
                  const slug = (d as { payload?: Pt })?.payload?.slug ?? (d as Pt)?.slug;
                  if (slug) router.push(`/politics-ledger/${slug}`);
                }}
              >
                {points.map((p) => <Cell key={p.key} fill={p.color} fillOpacity={0.8} stroke={isDarkMode ? '#111827' : '#fff'} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className={`flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1 text-xs ${textSec}`}>
        {REGIME_ORDER.map((rg) => (
          <span key={rg} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: REGIME_COLORS[rg] }} />
            {REGIME_LABELS[rg]}
          </span>
        ))}
      </div>
      <p className={`text-[11px] mt-2 ${textSec}`}>
        Correlation is not causation: rich countries can afford strong institutions, oil wealth can fund autocracy, and both politics and prosperity
        reflect history and geography. The dashed line is a least-squares fit{log ? ' on a log scale of income' : ''}. Click a dot for the country profile.
      </p>
    </div>
  );
}
