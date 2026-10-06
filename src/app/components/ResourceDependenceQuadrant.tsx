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
  AreaChart,
  Area,
} from 'recharts';
import type { CountryData } from '../services/worldbank';
import { getDisplayName } from '../utils/countryMappings';

interface Props {
  isDarkMode: boolean;
  totalResourceRents: CountryData[];
  gdpGrowth: CountryData[];
  gdpPerCapita: CountryData[];
  oilRents?: CountryData[];
  naturalGasRents?: CountryData[];
  coalRents?: CountryData[];
  mineralRents?: CountryData[];
  forestRents?: CountryData[];
}

type Quadrant = 'diversified-rich' | 'resource-curse' | 'efficient-extractor' | 'resource-poor';

interface QuadrantPoint {
  country: string;
  x: number; // resource rents % GDP
  y: number; // 10-year avg GDP growth
  z: number; // GDP per capita (bubble size)
  hasGdpPc: boolean;
  quadrant: Quadrant;
}

const QUADRANT_ORDER: Quadrant[] = ['efficient-extractor', 'resource-curse', 'diversified-rich', 'resource-poor'];

const QUADRANT_COLORS: Record<Quadrant, string> = {
  'diversified-rich': '#10b981',
  'resource-curse': '#ef4444',
  'efficient-extractor': '#3b82f6',
  'resource-poor': '#94a3b8',
};

const QUADRANT_LABELS: Record<Quadrant, string> = {
  'diversified-rich': 'Diversified Growers',
  'resource-curse': 'Resource Curse',
  'efficient-extractor': 'Efficient Extractors',
  'resource-poor': 'Low Rents, Low Growth',
};

const QUADRANT_POSITION: Record<Quadrant, string> = {
  'efficient-extractor': 'High rents · high growth',
  'resource-curse': 'High rents · low growth',
  'diversified-rich': 'Low rents · high growth',
  'resource-poor': 'Low rents · low growth',
};

const QUADRANT_BLURB: Record<Quadrant, string> = {
  'efficient-extractor':
    'Turning resource income into growth. Usually backed by fiscal rules, a sovereign wealth fund or a fast-growing non-resource sector that absorbs the windfall.',
  'resource-curse':
    'Large rents, weak growth. Typical symptoms: currency over-valuation crowding out other exports (Dutch disease), volatile budgets that follow the oil price, and rent-seeking politics.',
  'diversified-rich':
    'Growth driven by manufacturing, services or technology rather than extraction. Resource prices barely register in the national accounts.',
  'resource-poor':
    'Neither resource windfalls nor fast growth — mostly mature, ageing economies where trend growth has slowed, plus a few hit by recent shocks.',
};

const RENT_TYPES = [
  { key: 'oil', label: 'Oil', color: '#0f172a' },
  { key: 'gas', label: 'Gas', color: '#0891b2' },
  { key: 'coal', label: 'Coal', color: '#57534e' },
  { key: 'minerals', label: 'Minerals', color: '#b45309' },
  { key: 'forest', label: 'Forest', color: '#16a34a' },
] as const;

type RentKey = (typeof RENT_TYPES)[number]['key'];

function label(country: string): string {
  return country === 'UAE' || country === 'USA' || country === 'UK' ? country : getDisplayName(country);
}

// Most recent value for a country, ignoring missing/zero years.
function latestValue(series: CountryData[] | undefined, country: string): number | null {
  if (!series) return null;
  for (let i = series.length - 1; i >= 0; i--) {
    const v = Number(series[i][country]);
    if (!isNaN(v) && v !== 0) return v;
  }
  return null;
}

// Value for a country in a given year (null if missing).
function valueAt(series: CountryData[] | undefined, country: string, year: number): number | null {
  const row = series?.find(r => Number(r.year) === year);
  if (!row) return null;
  const v = Number(row[country]);
  return isNaN(v) ? null : v;
}

// Year of the most recent non-zero value.
function latestYear(series: CountryData[], country: string): number | null {
  for (let i = series.length - 1; i >= 0; i--) {
    const v = Number(series[i][country]);
    if (!isNaN(v) && v !== 0) return Number(series[i].year);
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

function fmtUsd(v: number): string {
  return `$${Math.round(v).toLocaleString()}`;
}

export default function ResourceDependenceQuadrant({
  isDarkMode,
  totalResourceRents,
  gdpGrowth,
  gdpPerCapita,
  oilRents,
  naturalGasRents,
  coalRents,
  mineralRents,
  forestRents,
}: Props) {
  const [hoverCountry, setHoverCountry] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [scale, setScale] = useState<'linear' | 'log'>('linear');

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
      if (rents == null || rents <= 0 || growth == null) return;
      raw.push({
        country,
        x: rents,
        y: growth,
        z: gdpPc ?? 10000,
        hasGdpPc: gdpPc != null,
        quadrant: 'resource-poor',
      });
    });

    if (raw.length === 0) return { points: raw, medianRents: 5, medianGrowth: 2 };

    // Median-based split so quadrants stay roughly balanced regardless of scale.
    const sortedRents = raw.map(p => p.x).sort((a, b) => a - b);
    const sortedGrowth = raw.map(p => p.y).sort((a, b) => a - b);
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

  const defaultCountry = useMemo(() => {
    if (points.some(p => p.country === 'SaudiArabia')) return 'SaudiArabia';
    return [...points].sort((a, b) => b.x - a.x)[0]?.country ?? null;
  }, [points]);
  const activeCountry = selected && points.some(p => p.country === selected) ? selected : defaultCountry;
  const active = points.find(p => p.country === activeCountry) ?? null;

  const rentSeries: Record<RentKey, CountryData[] | undefined> = {
    oil: oilRents,
    gas: naturalGasRents,
    coal: coalRents,
    minerals: mineralRents,
    forest: forestRents,
  };

  const detail = useMemo(() => {
    if (!active) return null;
    const year = latestYear(totalResourceRents, active.country);
    const mix = RENT_TYPES.map(t => ({
      ...t,
      value: year != null ? Math.max(0, valueAt(rentSeries[t.key], active.country, year) ?? 0) : 0,
    }));
    const mixTotal = mix.reduce((s, m) => s + m.value, 0);
    const history = totalResourceRents
      .map(r => ({ year: Number(r.year), value: Number(r[active.country]) }))
      .filter(r => r.year >= 1990 && !isNaN(r.value) && r.value > 0);
    const peak = history.reduce<{ year: number; value: number } | null>(
      (best, r) => (!best || r.value > best.value ? r : best),
      null,
    );
    const rank = [...points].sort((a, b) => b.x - a.x).findIndex(p => p.country === active.country) + 1;
    return { year, mix, mixTotal, history, peak, rank };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, totalResourceRents, oilRents, naturalGasRents, coalRents, mineralRents, forestRents, points]);

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
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const insetBg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';

  const grouped: Record<Quadrant, QuadrantPoint[]> = {
    'diversified-rich': [],
    'resource-curse': [],
    'efficient-extractor': [],
    'resource-poor': [],
  };
  points.forEach(p => grouped[p.quadrant].push(p));

  const maxRents = Math.max(...points.map(p => p.x), 20);
  const minRents = Math.min(...points.map(p => p.x));
  const minGrowth = Math.min(...points.map(p => p.y), -2);
  const maxGrowth = Math.max(...points.map(p => p.y), 8);

  const logLo = Math.pow(10, Math.floor(Math.log10(Math.max(minRents, 0.001))));
  const logHi = Math.pow(10, Math.ceil(Math.log10(maxRents)));
  const logTicks: number[] = [];
  for (let t = logLo; t <= logHi * 1.0001; t *= 10) logTicks.push(Number(t.toPrecision(1)));

  const examples = (q: Quadrant) => {
    const list = [...grouped[q]];
    if (q === 'efficient-extractor' || q === 'resource-curse') list.sort((a, b) => b.x - a.x);
    else list.sort((a, b) => b.y - a.y);
    return list.slice(0, 4);
  };

  const renderTooltip = ({ active: on, payload }: { active?: boolean; payload?: any[] }) => {
    if (!on || !payload?.length) return null;
    // Scatter + ZAxis emits one payload row per axis (x, y, z). Deduplicate
    // so the panel shows a country once instead of three identical lines.
    const p: QuadrantPoint | undefined = payload.find(item => item?.payload?.country)?.payload;
    if (!p) return null;
    return (
      <div className={`rounded-lg border px-3 py-2 text-xs shadow-lg ${
        isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: QUADRANT_COLORS[p.quadrant] }} />
          <span className="font-semibold text-sm">{label(p.country)}</span>
        </div>
        <div className={`mb-1.5 ${textMuted}`}>{QUADRANT_LABELS[p.quadrant]}</div>
        <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5 tabular-nums">
          <span className={textSec}>Resource rents</span><span className="text-right font-medium">{p.x.toFixed(1)}% of GDP</span>
          <span className={textSec}>10-yr avg growth</span><span className="text-right font-medium">{p.y.toFixed(1)}%</span>
          <span className={textSec}>GDP per capita (PPP)</span>
          <span className="text-right font-medium">{p.hasGdpPc ? fmtUsd(p.z) : '—'}</span>
        </div>
        <div className={`mt-1.5 text-[10px] ${textMuted}`}>Click to see the rent mix</div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`lg:col-span-2 rounded-lg border p-4 sm:p-6 ${cardBg}`}>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              {QUADRANT_ORDER.map(k => (
                <div key={k} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: QUADRANT_COLORS[k] }} />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {QUADRANT_LABELS[k]} <span className={textMuted}>({grouped[k].length})</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-1" role="group" aria-label="Horizontal axis scale">
              {(['linear', 'log'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScale(s)}
                  aria-pressed={scale === s}
                  className={`text-xs px-3 py-1.5 rounded-md capitalize transition-colors ${
                    scale === s
                      ? 'bg-amber-500 text-white'
                      : isDarkMode ? 'bg-gray-900 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {s === 'log' ? 'Log scale' : 'Linear'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[320px] sm:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 24, bottom: 40, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                {scale === 'log' ? (
                  <XAxis
                    key="log"
                    dataKey="x"
                    type="number"
                    scale="log"
                    stroke={axis}
                    domain={[logLo, logHi]}
                    ticks={logTicks}
                    tickFormatter={(v: number) => `${v}%`}
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Total Resource Rents (% of GDP, log scale)', position: 'insideBottom', offset: -20, fill: axis, fontSize: 12 }}
                  />
                ) : (
                  <XAxis
                    key="linear"
                    dataKey="x"
                    type="number"
                    stroke={axis}
                    domain={[0, Math.ceil(maxRents / 5) * 5]}
                    tickFormatter={(v: number) => `${v}%`}
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Total Resource Rents (% of GDP)', position: 'insideBottom', offset: -20, fill: axis, fontSize: 12 }}
                  />
                )}
                <YAxis
                  dataKey="y"
                  type="number"
                  stroke={axis}
                  domain={[Math.floor(minGrowth), Math.ceil(maxGrowth)]}
                  tickFormatter={(v: number) => `${v}%`}
                  tick={{ fontSize: 11 }}
                  label={{ value: '10-Year Avg GDP Growth', angle: -90, position: 'insideLeft', offset: 10, fill: axis, fontSize: 12 }}
                />
                <ZAxis dataKey="z" range={[60, 500]} />
                <ReferenceLine
                  x={medianRents}
                  stroke={axis}
                  strokeDasharray="4 4"
                  label={{ value: `median ${medianRents.toFixed(1)}%`, position: 'top', fill: axis, fontSize: 10 }}
                />
                <ReferenceLine
                  y={medianGrowth}
                  stroke={axis}
                  strokeDasharray="4 4"
                  label={{ value: `median ${medianGrowth.toFixed(1)}%`, position: 'insideTopRight', fill: axis, fontSize: 10 }}
                />
                <Tooltip
                  content={renderTooltip}
                  cursor={{ strokeDasharray: '3 3' }}
                  shared={false}
                  isAnimationActive={false}
                />
                {QUADRANT_ORDER.map(k => (
                  <Scatter key={k} data={grouped[k]} fill={QUADRANT_COLORS[k]} isAnimationActive={false}>
                    {grouped[k].map(p => {
                      const isActive = p.country === activeCountry;
                      return (
                        <Cell
                          key={p.country}
                          fill={QUADRANT_COLORS[k]}
                          fillOpacity={hoverCountry && hoverCountry !== p.country ? 0.25 : isActive ? 0.95 : 0.7}
                          stroke={isActive ? (isDarkMode ? '#fff' : '#111827') : QUADRANT_COLORS[k]}
                          strokeWidth={isActive ? 2 : 1}
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoverCountry(p.country)}
                          onMouseLeave={() => setHoverCountry(null)}
                          onClick={() => setSelected(p.country)}
                        />
                      );
                    })}
                  </Scatter>
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <p className={`text-xs mt-3 ${textMuted}`}>
            Each bubble is one country. X = latest total natural-resource rents (World Bank: the value of extracted oil, gas,
            coal, minerals and timber minus extraction costs) as a share of GDP. Y = 10-year average real GDP growth. Bubble
            size = GDP per capita (PPP). Dashed lines split the {points.length} tracked economies at the median, so each
            quadrant is relative to this sample rather than an absolute threshold. Use the log scale to separate the cluster
            of low-rent economies near zero.
          </p>
        </div>

        {active && detail && (
          <div className={`rounded-lg border p-5 flex flex-col ${cardBg}`}>
            <div className={`text-[11px] uppercase tracking-wider mb-1 ${textMuted}`}>Selected economy</div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className={`text-lg font-semibold ${textPrimary}`}>{label(active.country)}</h4>
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded"
                style={{ backgroundColor: `${QUADRANT_COLORS[active.quadrant]}22`, color: QUADRANT_COLORS[active.quadrant] }}
              >
                {QUADRANT_LABELS[active.quadrant]}
              </span>
            </div>
            <p className={`text-xs mb-4 ${textMuted}`}>
              #{detail.rank} of {points.length} by rent dependence{detail.year ? ` · rents data ${detail.year}` : ''}
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { k: 'Rents', v: `${active.x.toFixed(1)}%`, s: 'of GDP' },
                { k: 'Growth', v: `${active.y.toFixed(1)}%`, s: '10-yr avg' },
                { k: 'GDP/cap', v: active.hasGdpPc ? `$${(active.z / 1000).toFixed(0)}k` : '—', s: 'PPP' },
              ].map(t => (
                <div key={t.k} className={`rounded-md border px-2 py-2 ${insetBg}`}>
                  <div className={`text-[10px] uppercase tracking-wider ${textMuted}`}>{t.k}</div>
                  <div className={`text-base font-semibold tabular-nums ${textPrimary}`}>{t.v}</div>
                  <div className={`text-[10px] ${textMuted}`}>{t.s}</div>
                </div>
              ))}
            </div>

            <div className={`text-xs font-medium mb-1.5 ${textSec}`}>Where the rents come from</div>
            {detail.mixTotal > 0 ? (
              <>
                <div className="flex h-3 rounded-full overflow-hidden mb-2" role="img"
                  aria-label={detail.mix.filter(m => m.value > 0).map(m => `${m.label} ${((m.value / detail.mixTotal) * 100).toFixed(0)}%`).join(', ')}>
                  {detail.mix.filter(m => m.value > 0).map(m => (
                    <div key={m.key} style={{ width: `${(m.value / detail.mixTotal) * 100}%`, backgroundColor: m.color }} />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] mb-4">
                  {detail.mix.filter(m => m.value > 0).sort((a, b) => b.value - a.value).map(m => (
                    <div key={m.key} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: m.color }} />
                        <span className={textSec}>{m.label}</span>
                      </span>
                      <span className={`tabular-nums ${textPrimary}`}>{m.value.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className={`text-xs mb-4 ${textMuted}`}>No breakdown by resource type available.</p>
            )}

            <div className={`text-xs font-medium mb-1 ${textSec}`}>Total rents since 1990 (% of GDP)</div>
            <div className="h-24 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={detail.history} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                  <XAxis dataKey="year" hide />
                  <YAxis hide domain={[0, 'dataMax']} />
                  <Tooltip
                    contentStyle={isDarkMode
                      ? { backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 11 }
                      : { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 11 }}
                    formatter={(v: number) => [`${v.toFixed(1)}%`, 'Rents']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={QUADRANT_COLORS[active.quadrant]}
                    fill={QUADRANT_COLORS[active.quadrant]}
                    fillOpacity={0.15}
                    strokeWidth={1.5}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {detail.peak && detail.history.length > 1 && (
              <p className={`text-[11px] mt-1 ${textMuted}`}>
                Peak {detail.peak.value.toFixed(1)}% in {detail.peak.year} · {detail.history[0].year}: {detail.history[0].value.toFixed(1)}%
              </p>
            )}

            <p className={`text-xs leading-relaxed mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} ${textSec}`}>
              {QUADRANT_BLURB[active.quadrant]}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {QUADRANT_ORDER.map(q => (
          <div key={q} className={`rounded-lg border p-4 ${cardBg}`} style={{ borderTopColor: QUADRANT_COLORS[q], borderTopWidth: 3 }}>
            <div className="flex items-baseline justify-between gap-2">
              <h5 className={`text-sm font-semibold ${textPrimary}`}>{QUADRANT_LABELS[q]}</h5>
              <span className={`text-xs tabular-nums ${textMuted}`}>{grouped[q].length}</span>
            </div>
            <div className={`text-[11px] mb-2 ${textMuted}`}>{QUADRANT_POSITION[q]}</div>
            <p className={`text-xs leading-relaxed mb-3 ${textSec}`}>{QUADRANT_BLURB[q]}</p>
            <div className="flex flex-wrap gap-1">
              {examples(q).map(p => (
                <button
                  key={p.country}
                  type="button"
                  onClick={() => setSelected(p.country)}
                  className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                    p.country === activeCountry
                      ? 'border-transparent text-white'
                      : isDarkMode ? 'border-gray-700 text-gray-300 hover:border-gray-500' : 'border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                  style={p.country === activeCountry ? { backgroundColor: QUADRANT_COLORS[q] } : undefined}
                >
                  {label(p.country)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
