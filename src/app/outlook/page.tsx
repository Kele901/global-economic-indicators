'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { fetchGlobalData, CountryData } from '../services/worldbank';
import { IMF_GDP_PROJECTIONS, IMF_INFLATION_PROJECTIONS, GLOBAL_OUTLOOK_SUMMARY } from '../data/imfProjections';
import { CURRENT_YEAR, PREV_YEAR, NEXT_YEAR, pct, buildOutlookSeries, type Economy } from '../lib/outlook';
import RegionalGdpProjections from '../components/RegionalGdpProjections';
import AdvancedVsEmerging from '../components/AdvancedVsEmerging';
import OutlookRisks from '../components/OutlookRisks';
import { COUNTRY_KEYS, COUNTRY_ISO2, getDisplayName, type CountryKey } from '../utils/countryMappings';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, Cell, ZAxis, ReferenceLine, LabelList } from 'recharts';
import { useIMFProjections } from '../hooks/useIMFProjections';
import dynamic from 'next/dynamic';
import SocialShareMenu from '../components/SocialShareMenu';
import { slugify } from '../lib/share';

const IsoFlag = dynamic(() => import('../components/IsoFlag'), {
  ssr: false,
  loading: () => <span className="inline-block w-5 h-3.5 rounded-sm bg-gray-200 dark:bg-gray-700" aria-hidden="true" />,
});

const LINE_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1'];
const MAX_COMPARED = LINE_COLORS.length;
const MAJOR_ECONOMIES = new Set<string>(COUNTRY_KEYS);
// Largest economies first: they claim scatter labels before anyone else.
const LABEL_PRIORITY = [
  'USA', 'China', 'Germany', 'Japan', 'India', 'UK', 'France', 'Italy', 'Canada', 'Brazil',
  'Russia', 'SouthKorea', 'Australia', 'Spain', 'Mexico', 'Indonesia', 'Turkey', 'SaudiArabia',
  'Argentina', 'SouthAfrica',
];

type Quadrant = 'Goldilocks' | 'Overheating' | 'Stagflation Risk' | 'Stagnation';

const GDP_THRESHOLD = 2.5;
const INF_THRESHOLD = 3.0;

const QUADRANTS: { label: Quadrant; desc: string; color: string }[] = [
  { label: 'Goldilocks', desc: `Growth ≥ ${GDP_THRESHOLD}%, inflation < ${INF_THRESHOLD}%`, color: '#22c55e' },
  { label: 'Overheating', desc: `Growth ≥ ${GDP_THRESHOLD}%, inflation ≥ ${INF_THRESHOLD}%`, color: '#f59e0b' },
  { label: 'Stagflation Risk', desc: `Growth < ${GDP_THRESHOLD}%, inflation ≥ ${INF_THRESHOLD}%`, color: '#ef4444' },
  { label: 'Stagnation', desc: `Growth < ${GDP_THRESHOLD}%, inflation < ${INF_THRESHOLD}%`, color: '#6b7280' },
];

function quadrantOf(gdp: number, inflation: number): Quadrant {
  if (gdp >= GDP_THRESHOLD) return inflation >= INF_THRESHOLD ? 'Overheating' : 'Goldilocks';
  return inflation >= INF_THRESHOLD ? 'Stagflation Risk' : 'Stagnation';
}

interface ScatterPoint extends Economy {
  gdp: number;
  inflation: number;
  quadrant: Quadrant;
  fill: string;
  label?: string;
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

/**
 * Keys of the dots whose name label fits above them without covering another
 * label or dot at the chart's current pixel size. Major economies are tried
 * first and may sit over neighbouring dots, then the dots furthest from the
 * crowd, so dense clusters stay legible and every dot still names itself in
 * the tooltip.
 */
function placeScatterLabels(
  points: ScatterPoint[],
  xDomain: [number, number],
  yDomain: [number, number],
  width: number,
  height: number,
): Set<string> {
  if (width <= 0 || height <= 0 || points.length === 0) return new Set();
  const px = (p: ScatterPoint) => [
    ((p.gdp - xDomain[0]) / (xDomain[1] - xDomain[0] || 1)) * width,
    (1 - (p.inflation - yDomain[0]) / (yDomain[1] - yDomain[0] || 1)) * height,
  ];
  const centres = points.map(px);
  const medX = quantile(centres.map(c => c[0]).sort((a, b) => a - b), 0.5);
  const medY = quantile(centres.map(c => c[1]).sort((a, b) => a - b), 0.5);
  const rank = (key: string) => {
    const i = LABEL_PRIORITY.indexOf(key);
    return i >= 0 ? 2e6 - i * 1e3 : MAJOR_ECONOMIES.has(key) ? 1e6 : 0;
  };
  const order = points
    .map((p, i) => ({ p, i, score: rank(p.key) + Math.hypot(centres[i][0] - medX, centres[i][1] - medY) }))
    .sort((a, b) => b.score - a.score);

  const placed: { l: number; r: number; t: number; b: number }[] = [];
  const keys = new Set<string>();
  for (const { p, i } of order) {
    const [cx, cy] = centres[i];
    const w = p.name.length * 5.6 + 6;
    const box = { l: cx - w / 2, r: cx + w / 2, t: cy - 22, b: cy - 6 };
    if (box.l < 0 || box.r > width || box.t < 0) continue;
    if (placed.some(o => box.l < o.r && box.r > o.l && box.t < o.b && box.b > o.t)) continue;
    const coversDot = !MAJOR_ECONOMIES.has(p.key)
      && centres.some(([x, y], j) => j !== i && x > box.l - 3 && x < box.r + 3 && y > box.t - 3 && y < box.b + 3);
    if (coversDot) continue;
    placed.push(box);
    keys.add(p.key);
  }
  return keys;
}

function niceTicks([lo, hi]: [number, number], target = 6): number[] {
  const raw = (hi - lo) / target || 1;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw) ?? 10 * mag;
  const ticks: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) ticks.push(Math.round(v * 100) / 100);
  return ticks;
}

// Illustrative forecast-error magnitudes used to draw the uncertainty band
// around IMF point projections. The IMF does not publish an interval with the
// WEO country tables, so these come from the published accuracy literature:
// one-year-ahead WEO growth forecasts have a root-mean-square error of roughly
// one percentage point, rising with the horizon and roughly half again as wide
// for inflation (Timmermann, "An Evaluation of the World Economic Outlook
// Forecasts", IMF Staff Papers 2007; IMF WEO forecast-accuracy reviews).
// The band is a plausibility range, not a probability statement.
const FORECAST_ERROR: Record<'gdp' | 'inflation', { base: number; perYear: number; cap: number }> = {
  gdp:       { base: 1.0, perYear: 0.45, cap: 3.0 },
  inflation: { base: 1.3, perYear: 0.60, cap: 4.0 },
};

export default function OutlookPage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [data, setData] = useState<Record<string, CountryData[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('USA');
  const [selectedMetric, setSelectedMetric] = useState<'gdp' | 'inflation'>('gdp');
  const [compCountries, setCompCountries] = useState(['USA', 'China', 'India', 'Japan', 'Brazil', 'UK']);
  const [compSearch, setCompSearch] = useState('');
  const [scatterZoomed, setScatterZoomed] = useState(true);
  const [scatterSize, setScatterSize] = useState({ width: 0, height: 0 });
  const [changeScope, setChangeScope] = useState<'countries' | 'groups'>('countries');
  const [changeSort, setChangeSort] = useState<'rise' | 'fall' | 'name'>('rise');
  const [changeSearch, setChangeSearch] = useState('');
  const [changeShowAll, setChangeShowAll] = useState(false);
  const [tableScope, setTableScope] = useState<'countries' | 'groups'>('countries');
  const [tableSearch, setTableSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'name', dir: 'asc' });

  const { 
    gdpProjections: liveGdpProjections, 
    inflationProjections: liveInflationProjections, 
    loading: projectionsLoading, 
    isLive: projectionsIsLive,
    weoInfo,
    refetch: refetchProjections 
  } = useIMFProjections();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetchGlobalData().then(d => { setData(d as any); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const gdpProjectionsData = useMemo(() => {
    if (liveGdpProjections.length > 0) {
      return liveGdpProjections;
    }
    return IMF_GDP_PROJECTIONS;
  }, [liveGdpProjections]);

  const inflationProjectionsData = useMemo(() => {
    if (liveInflationProjections.length > 0) {
      return liveInflationProjections;
    }
    return IMF_INFLATION_PROJECTIONS;
  }, [liveInflationProjections]);

  const tc = isDarkMode ? {
    bg: 'bg-gray-900', card: 'bg-gray-800 border-gray-700', text: 'text-white',
    textSec: 'text-gray-400', grid: '#374151', axis: '#9ca3af',
    tooltip: { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px' } as React.CSSProperties,
    selectBg: 'bg-gray-700 text-white border-gray-600',
  } : {
    bg: 'bg-gray-50', card: 'bg-white border-gray-200', text: 'text-gray-900',
    textSec: 'text-gray-500', grid: '#e5e7eb', axis: '#6b7280',
    tooltip: { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } as React.CSSProperties,
    selectBg: 'bg-white text-gray-900 border-gray-300',
  };

  const forecastChartData = useMemo(() => {
    if (!data) return [];
    const projections = selectedMetric === 'gdp' ? gdpProjectionsData : inflationProjectionsData;
    const projection = projections.find(p => p.country === selectedCountry);
    const metricKey = selectedMetric === 'gdp' ? 'gdpGrowth' : 'inflationRates';
    const series = (data as any)[metricKey] as CountryData[] | undefined;

    const points: {
      year: number;
      actual?: number;
      forecast?: number;
      band?: [number, number];
      spread?: number;
    }[] = [];

    if (series) {
      for (const row of series) {
        const yr = Number(row.year);
        const v = Number(row[selectedCountry]);
        if (yr >= 2015 && !isNaN(v)) {
          points.push({ year: yr, actual: v });
        }
      }
    }

    if (projection) {
      for (const [yr, val] of Object.entries(projection.values)) {
        const existing = points.find(p => p.year === Number(yr));
        if (existing) {
          existing.forecast = val;
        } else {
          points.push({ year: Number(yr), forecast: val });
        }
      }
    }

    points.sort((a, b) => a.year - b.year);

    // The IMF publishes point forecasts without an interval, so drawing the
    // dashed line alone implies precision the forecast does not have. The band
    // below is an *illustrative* range sized from the published accuracy
    // record of WEO projections, not an IMF-published confidence interval.
    // See FORECAST_ERROR for the magnitudes and their source.
    const errorProfile = FORECAST_ERROR[selectedMetric];
    const firstForecastYear = points.find(p => p.forecast !== undefined)?.year;
    if (firstForecastYear !== undefined) {
      for (const point of points) {
        if (point.forecast === undefined) continue;
        const horizon = point.year - firstForecastYear;
        const spread = Math.min(
          errorProfile.base + errorProfile.perYear * horizon,
          errorProfile.cap,
        );
        point.band = [point.forecast - spread, point.forecast + spread];
        point.spread = spread;
      }
    }

    return points;
  }, [data, selectedCountry, selectedMetric, gdpProjectionsData, inflationProjectionsData]);

  // Live IMF rows carry their own name, flag code and group flag; the bundled
  // fallback uses the site's country keys, so those resolve through countryMappings.
  const economies = useMemo(() => {
    const map = new Map<string, Economy>();
    for (const p of [...gdpProjectionsData, ...inflationProjectionsData]) {
      if (map.has(p.country)) continue;
      const isWorld = p.country === 'World';
      map.set(p.country, {
        key: p.country,
        name: p.name ?? (isWorld ? 'World' : getDisplayName(p.country)),
        iso2: p.iso2 !== undefined ? p.iso2 : COUNTRY_ISO2[p.country as CountryKey] ?? null,
        isGroup: p.isGroup ?? isWorld,
      });
    }
    return map;
  }, [gdpProjectionsData, inflationProjectionsData]);

  const economy = useCallback(
    (key: string): Economy =>
      economies.get(key) ?? { key, name: getDisplayName(key), iso2: COUNTRY_ISO2[key as CountryKey] ?? null, isGroup: false },
    [economies]
  );

  const outlookSeries = useMemo(
    () => buildOutlookSeries(gdpProjectionsData, inflationProjectionsData),
    [gdpProjectionsData, inflationProjectionsData]
  );

  const byName = (a: Economy, b: Economy) => a.name.localeCompare(b.name);

  const availableCountries = useMemo(() => {
    const projections = selectedMetric === 'gdp' ? gdpProjectionsData : inflationProjectionsData;
    const list = projections.map(p => economies.get(p.country)).filter((e): e is Economy => Boolean(e));
    return {
      countries: list.filter(e => !e.isGroup).sort(byName),
      groups: list.filter(e => e.isGroup).sort(byName),
    };
  }, [selectedMetric, gdpProjectionsData, inflationProjectionsData, economies]);

  const compOptions = useMemo(() => {
    const q = compSearch.trim().toLowerCase();
    const list = gdpProjectionsData
      .map(p => economies.get(p.country))
      .filter((e): e is Economy => Boolean(e) && !compCountries.includes(e!.key))
      .filter(e => !q || e.name.toLowerCase().includes(q) || e.key.toLowerCase().includes(q))
      .sort(byName);
    return { countries: list.filter(e => !e.isGroup), groups: list.filter(e => e.isGroup) };
  }, [gdpProjectionsData, economies, compCountries, compSearch]);

  const compColor = (key: string) => LINE_COLORS[Math.max(0, compCountries.indexOf(key)) % LINE_COLORS.length];

  const toggleCompared = (key: string) =>
    setCompCountries(prev =>
      prev.includes(key) ? prev.filter(x => x !== key) : prev.length >= MAX_COMPARED ? prev : [...prev, key]
    );

  const multiCountryChartData = useMemo(() => {
    const years = Array.from(
      new Set(gdpProjectionsData.flatMap(p => Object.keys(p.values).map(Number)))
    ).filter(y => y >= PREV_YEAR).sort((a, b) => a - b);
    return years.map(year => {
      const point: Record<string, number> = { year };
      compCountries.forEach(c => {
        const proj = gdpProjectionsData.find(p => p.country === c);
        if (proj?.values[year] !== undefined) {
          point[c] = proj.values[year];
        }
      });
      return point;
    });
  }, [compCountries, gdpProjectionsData]);

  const scatterAll = useMemo(() => {
    const inflationByKey = new Map(inflationProjectionsData.map(p => [p.country, p.values[CURRENT_YEAR]]));
    const points: ScatterPoint[] = [];
    for (const p of gdpProjectionsData) {
      const e = economies.get(p.country);
      const gdp = p.values[CURRENT_YEAR];
      const inflation = inflationByKey.get(p.country);
      if (!e || e.isGroup || typeof gdp !== 'number' || typeof inflation !== 'number') continue;
      const quadrant = quadrantOf(gdp, inflation);
      points.push({ ...e, gdp, inflation, quadrant, fill: QUADRANTS.find(q => q.label === quadrant)!.color });
    }
    return points;
  }, [gdpProjectionsData, inflationProjectionsData, economies]);

  // Hyperinflation and post-war rebounds stretch the axes so far that most
  // countries collapse into one blob; the zoomed view frames the middle of the
  // distribution plus every G20 economy, and lists the rest underneath.
  const scatterView = useMemo(() => {
    const xs = scatterAll.map(p => p.gdp).sort((a, b) => a - b);
    const ys = scatterAll.map(p => p.inflation).sort((a, b) => a - b);
    const majors = scatterAll.filter(p => LABEL_PRIORITY.includes(p.key));
    const nice = (lo: number, hi: number, step: number): [number, number] => [
      Math.floor(lo / step) * step,
      Math.ceil(hi / step) * step,
    ];
    const xLo = Math.min(quantile(xs, 0.02), 0, ...majors.map(p => p.gdp));
    const xHi = Math.max(quantile(xs, 0.98), ...majors.map(p => p.gdp));
    const yLo = Math.min(quantile(ys, 0.02), 0, ...majors.map(p => p.inflation));
    const yHi = Math.max(quantile(ys, 0.97), INF_THRESHOLD, ...majors.map(p => p.inflation));
    const xDomain = scatterZoomed
      ? nice(xLo - 1, xHi + 1, 2)
      : nice(xs[0] ?? 0, xs[xs.length - 1] ?? 1, 5);
    const yDomain = scatterZoomed
      ? nice(yLo - 1, yHi + (yHi - yLo) * 0.08, 5)
      : nice(Math.min(ys[0] ?? 0, 0), (ys[ys.length - 1] ?? 1) * 1.05, 10);
    const inView = (p: ScatterPoint) =>
      p.gdp >= xDomain[0] && p.gdp <= xDomain[1] && p.inflation >= yDomain[0] && p.inflation <= yDomain[1];
    const visible = scatterAll.filter(inView);
    const hidden = scatterAll.filter(p => !inView(p)).sort((a, b) => b.inflation - a.inflation);
    const plotWidth = scatterSize.width - 80;
    const plotHeight = scatterSize.height - 70;
    const labelled = placeScatterLabels(visible, xDomain, yDomain, plotWidth, plotHeight);
    return {
      xDomain,
      yDomain,
      xTicks: niceTicks(xDomain),
      yTicks: niceTicks(yDomain),
      hidden,
      // Non-breaking spaces stop Recharts wrapping multi-word names onto a second line.
      points: visible.map(p => ({ ...p, label: labelled.has(p.key) ? p.name.replace(/ /g, '\u00a0') : undefined })),
    };
  }, [scatterAll, scatterZoomed, scatterSize]);

  const quadrantCounts = useMemo(() => {
    const counts: Record<Quadrant, number> = { Goldilocks: 0, Overheating: 0, 'Stagflation Risk': 0, Stagnation: 0 };
    scatterAll.forEach(p => { counts[p.quadrant] += 1; });
    return counts;
  }, [scatterAll]);

  const growthChange = useMemo(() => {
    const rows = gdpProjectionsData
      .map(p => {
        const e = economies.get(p.country);
        const prev = p.values[PREV_YEAR];
        const cur = p.values[CURRENT_YEAR];
        if (!e || typeof prev !== 'number' || typeof cur !== 'number') return null;
        return { ...e, prev, cur, change: Math.round((cur - prev) * 10) / 10 };
      })
      .filter((r): r is Economy & { prev: number; cur: number; change: number } => r !== null);
    const scoped = rows.filter(r => (changeScope === 'groups') === r.isGroup);
    const q = changeSearch.trim().toLowerCase();
    const filtered = scoped
      .filter(r => !q || r.name.toLowerCase().includes(q))
      .sort((a, b) =>
        changeSort === 'name' ? a.name.localeCompare(b.name)
          : changeSort === 'rise' ? b.change - a.change
          : a.change - b.change
      );
    return {
      rows: filtered,
      total: scoped.length,
      faster: scoped.filter(r => r.change > 0).length,
      slower: scoped.filter(r => r.change < 0).length,
    };
  }, [gdpProjectionsData, economies, changeScope, changeSort, changeSearch]);

  const CHANGE_PREVIEW = 20;
  const visibleChanges = changeShowAll || changeSearch ? growthChange.rows : growthChange.rows.slice(0, CHANGE_PREVIEW);

  const summaryTableData = useMemo(() => {
    const inflationByKey = new Map(inflationProjectionsData.map(p => [p.country, p.values]));
    return gdpProjectionsData
      .map(gdpProj => {
        const e = economies.get(gdpProj.country);
        if (!e) return null;
        const inf = inflationByKey.get(gdpProj.country);
        return {
          ...e,
          gdpPrev: gdpProj.values[PREV_YEAR] ?? null,
          gdpCur: gdpProj.values[CURRENT_YEAR] ?? null,
          gdpNext: gdpProj.values[NEXT_YEAR] ?? null,
          infPrev: inf?.[PREV_YEAR] ?? null,
          infCur: inf?.[CURRENT_YEAR] ?? null,
          infNext: inf?.[NEXT_YEAR] ?? null,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
  }, [gdpProjectionsData, inflationProjectionsData, economies]);

  const tableCounts = useMemo(() => ({
    countries: summaryTableData.filter(r => !r.isGroup).length,
    groups: summaryTableData.filter(r => r.isGroup).length,
  }), [summaryTableData]);

  const sortedTableData = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    const sorted = summaryTableData
      .filter(r => (tableScope === 'groups') === r.isGroup)
      .filter(r => !q || r.name.toLowerCase().includes(q));
    sorted.sort((a, b) => {
      const aVal = (a as any)[sortConfig.key];
      const bVal = (b as any)[sortConfig.key];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'string') return sortConfig.dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortConfig.dir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [summaryTableData, sortConfig, tableScope, tableSearch]);

  const toggleSort = (key: string) => {
    setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const { worldGDP, globalInflation, tradeGrowth, oilPrice } = GLOBAL_OUTLOOK_SUMMARY;
  const forecastShareTitle = `Country Forecasts: ${economy(selectedCountry).name} ${selectedMetric === 'gdp' ? 'GDP Growth' : 'Inflation'}`;
  const scatterTitle = `Growth vs Inflation (${CURRENT_YEAR} Projections)`;
  const changeTitle = `Projected Growth Change, ${PREV_YEAR} → ${CURRENT_YEAR}`;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${tc.bg} ${tc.text}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Economic Forecasts & Outlook</h1>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${projectionsIsLive ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className={`text-xs ${tc.textSec}`}>{projectionsIsLive ? 'Live' : 'Cached'}</span>
              </div>
              <button
                onClick={refetchProjections}
                disabled={projectionsLoading}
                className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} disabled:opacity-50`}
              >
                {projectionsLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            <p className={`${tc.textSec}`}>
              IMF World Economic Outlook projections alongside historical data
              {weoInfo && <span className="ml-2 text-xs">({weoInfo.lastUpdate})</span>}
            </p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Light</span>
            <button
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 shadow-sm ${isDarkMode ? 'translate-x-6' : ''}`} />
            </button>
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Dark</span>
          </div>
        </div>

        <div className={`rounded-xl border p-4 sm:p-6 mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
          <h2 className="text-lg sm:text-xl font-semibold mb-3">Reading Economic Forecasts</h2>
          <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            The IMF publishes its <strong>World Economic Outlook (WEO)</strong> twice a year, projecting GDP growth,
            inflation, and other indicators for nearly every country. These projections are produced by combining
            econometric models with expert judgment and country-level consultations. The solid line on our charts
            represents actual historical data, while the dashed line shows IMF forecast values.
          </p>
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3`}>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Historical vs Forecast</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Solid lines are actual recorded data. Dashed lines are projections that carry uncertainty and may be revised.</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Regional Projections</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>The bar chart groups countries by region, showing how growth prospects differ between advanced and emerging economies.</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Risks & Uncertainties</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Forecasts face both upside and downside risks. Trade tensions, policy shifts, or technology gains can push outcomes either way.</p>
            </div>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Use the country and metric selectors to compare historical performance against IMF projections.
            <a href="/guides/economic-forecasting" className="text-blue-500 hover:underline ml-1">Learn more in our guide &rarr;</a>
          </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className={tc.textSec}>Loading outlook data...</p>
          </div>
        )}

        {!loading && (
        <>
        {/* Global Summary Cards */}
        <div id={slugify('Global outlook key figures')} className="mb-8">
        <div className="flex justify-end mb-2">
          <SocialShareMenu title="Global outlook key figures" isDarkMode={isDarkMode} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'World GDP Growth', ...worldGDP },
            { label: 'Global Inflation', ...globalInflation },
            { label: 'Trade Volume Growth', ...tradeGrowth },
            { label: 'Oil Price', ...oilPrice },
          ].map(card => (
            <div key={card.label} className={`rounded-xl border p-4 ${tc.card}`}>
              <p className={`text-xs uppercase tracking-wider ${tc.textSec}`}>{card.label}</p>
              <p className="text-2xl font-bold mt-1">{card.value}{card.unit === '%' ? '%' : ` ${card.unit}`}</p>
              <p className={`text-sm mt-1 ${card.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {card.change >= 0 ? '▲' : '▼'} {Math.abs(card.change)} vs prev forecast
              </p>
            </div>
          ))}
        </div>
        </div>

        {/* Country Forecast Chart */}
        <div id={slugify(forecastShareTitle)} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <h2 className="text-xl font-semibold">Country Forecasts</h2>
            <div className="flex flex-wrap items-center gap-2 ml-auto">
              <button onClick={() => setSelectedMetric('gdp')}
                className={`px-3 py-1 rounded text-xs border ${selectedMetric === 'gdp' ? 'bg-blue-500/20 border-blue-500 text-blue-500' : isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                GDP Growth
              </button>
              <button onClick={() => setSelectedMetric('inflation')}
                className={`px-3 py-1 rounded text-xs border ${selectedMetric === 'inflation' ? 'bg-blue-500/20 border-blue-500 text-blue-500' : isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                Inflation
              </button>
              <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}
                className={`px-3 py-1 rounded border text-xs ${tc.selectBg}`}>
                <optgroup label="Countries">
                  {availableCountries.countries.map(e => (
                    <option key={e.key} value={e.key}>{e.name}</option>
                  ))}
                </optgroup>
                {availableCountries.groups.length > 0 && (
                  <optgroup label="Regions & groups">
                    {availableCountries.groups.map(e => (
                      <option key={e.key} value={e.key}>{e.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
              <SocialShareMenu title={forecastShareTitle} isDarkMode={isDarkMode} />
            </div>
          </div>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip
                  contentStyle={tc.tooltip}
                  formatter={(value: any, name: any) => {
                    if (name === 'Uncertainty range' && Array.isArray(value)) {
                      return [`${Number(value[0]).toFixed(1)}% to ${Number(value[1]).toFixed(1)}%`, name];
                    }
                    return [`${Number(value).toFixed(1)}%`, name];
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="band"
                  name="Uncertainty range"
                  stroke="none"
                  fill="#f59e0b"
                  fillOpacity={0.16}
                  connectNulls
                  isAnimationActive={false}
                  legendType="plainline"
                />
                <Line type="monotone" dataKey="actual" name="Historical" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="forecast" name="IMF Forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="8 4" dot={{ r: 3 }} connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className={`text-xs mt-3 leading-relaxed ${tc.textSec}`}>
            The shaded band is an illustrative uncertainty range, not an IMF-published interval:
            the WEO country tables give point forecasts only. It widens with the horizon using the
            published accuracy record of WEO projections — roughly ±1 percentage point one year out
            for growth, wider for inflation and wider again further out. Read it as &ldquo;forecasts
            this far ahead have historically missed by about this much&rdquo;, not as a probability.
          </p>
        </div>

        <RegionalGdpProjections isDarkMode={isDarkMode} series={outlookSeries} />

        <OutlookRisks isDarkMode={isDarkMode} series={outlookSeries} />

        {/* Multi-Country Projection Comparison */}
        <div id={slugify('Multi-Country Projection Comparison')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
            <h2 className="text-xl font-semibold">Multi-Country Projection Comparison</h2>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <SocialShareMenu title="Multi-Country Projection Comparison" isDarkMode={isDarkMode} />
            </div>
          </div>
          <p className={`text-sm mb-4 ${tc.textSec}`}>
            IMF real GDP growth projections, % per year. {PREV_YEAR} is an IMF estimate; later years are forecasts.
            Compare up to {MAX_COMPARED} countries or regions.
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {compCountries.map(key => {
              const e = economy(key);
              const color = compColor(key);
              return (
                <span key={key}
                  className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full text-xs font-medium border"
                  style={{ borderColor: color, backgroundColor: `${color}1a` }}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  {e.iso2 && <IsoFlag iso2={e.iso2} title={e.name} className="w-4 h-3" />}
                  {e.name}
                  <button
                    type="button"
                    onClick={() => toggleCompared(key)}
                    aria-label={`Remove ${e.name}`}
                    className={`ml-0.5 w-4 h-4 inline-flex items-center justify-center rounded-full ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
            {compCountries.length > 0 ? (
              <button type="button" onClick={() => setCompCountries([])} className={`text-xs underline ${tc.textSec}`}>
                Clear all
              </button>
            ) : (
              <span className={`text-xs ${tc.textSec}`}>Pick countries below to draw their projections.</span>
            )}
          </div>

          <div className={`rounded-lg border mb-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} data-share-exclude>
            <div className={`p-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <input
                type="search"
                value={compSearch}
                onChange={e => setCompSearch(e.target.value)}
                placeholder="Search countries and regions to add…"
                aria-label="Search countries and regions to add"
                className={`w-full px-3 py-1.5 rounded border text-sm ${tc.selectBg}`}
              />
            </div>
            <div className="max-h-48 overflow-y-auto p-2 space-y-3">
              {([['Countries', compOptions.countries], ['Regions & groups', compOptions.groups]] as const).map(([heading, list]) =>
                list.length === 0 ? null : (
                  <div key={heading}>
                    <p className={`text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${tc.textSec}`}>{heading}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {list.map(e => (
                        <button
                          key={e.key}
                          type="button"
                          onClick={() => toggleCompared(e.key)}
                          disabled={compCountries.length >= MAX_COMPARED}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                            isDarkMode ? 'border-gray-600 text-gray-300 hover:border-blue-400' : 'border-gray-300 text-gray-600 hover:border-blue-400'
                          }`}
                        >
                          {e.iso2 && <IsoFlag iso2={e.iso2} title={e.name} className="w-4 h-3" />}
                          {e.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
              {compOptions.countries.length === 0 && compOptions.groups.length === 0 && (
                <p className={`text-xs ${tc.textSec}`}>No matches for &ldquo;{compSearch}&rdquo;.</p>
              )}
            </div>
          </div>

          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={multiCountryChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip
                  contentStyle={tc.tooltip}
                  formatter={(value: any, name: any) => [pct(Number(value)), name]}
                  itemSorter={(item: any) => -Number(item.value)}
                />
                <Legend />
                <ReferenceLine x={CURRENT_YEAR} stroke={tc.axis} strokeDasharray="2 4"
                  label={{ value: 'This year', position: 'insideTopRight', fill: tc.axis, fontSize: 10 }} />
                {compCountries.map(c => (
                  <Line
                    key={c}
                    type="monotone"
                    dataKey={c}
                    name={economy(c).name}
                    stroke={compColor(c)}
                    strokeDasharray="5 3"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth vs Inflation Scatter */}
        <div id={slugify(scatterTitle)} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
            <h2 className="text-xl font-semibold">{scatterTitle}</h2>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                type="button"
                data-share-exclude
                onClick={() => setScatterZoomed(z => !z)}
                className={`px-3 py-1 rounded text-xs border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:border-gray-500' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}
              >
                {scatterZoomed ? 'Show all countries' : 'Zoom to typical range'}
              </button>
              <SocialShareMenu title={scatterTitle} isDarkMode={isDarkMode} />
            </div>
          </div>
          <p className={`text-sm mb-4 ${tc.textSec}`}>
            Each dot is one of {scatterAll.length} countries, placed by its IMF-projected real GDP growth and consumer-price
            inflation for {CURRENT_YEAR}. Hover or tap a dot to see the country; the dashed lines mark {GDP_THRESHOLD}% growth
            and {INF_THRESHOLD}% inflation.
          </p>
          <div className="h-[340px] sm:h-[440px]">
            <ResponsiveContainer width="100%" height="100%" onResize={(width, height) => setScatterSize({ width, height })}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis
                  type="number"
                  dataKey="gdp"
                  name="GDP growth"
                  domain={scatterView.xDomain}
                  ticks={scatterView.xTicks}
                  allowDataOverflow
                  stroke={tc.axis}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => `${v}%`}
                  label={{ value: `Real GDP growth ${CURRENT_YEAR}`, position: 'insideBottom', offset: -15, style: { fill: tc.axis, fontSize: 12 } }}
                />
                <YAxis
                  type="number"
                  dataKey="inflation"
                  name="Inflation"
                  domain={scatterView.yDomain}
                  ticks={scatterView.yTicks}
                  allowDataOverflow
                  stroke={tc.axis}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => `${v}%`}
                  label={{ value: `Inflation ${CURRENT_YEAR}`, angle: -90, position: 'insideLeft', offset: 0, style: { fill: tc.axis, fontSize: 12, textAnchor: 'middle' } }}
                />
                <ZAxis range={[50, 50]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    const p = active ? (payload?.[0]?.payload as ScatterPoint | undefined) : undefined;
                    if (!p) return null;
                    return (
                      <div className="rounded-lg border px-3 py-2 shadow-lg text-xs" style={tc.tooltip}>
                        <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                          {p.iso2 && <IsoFlag iso2={p.iso2} title={p.name} className="w-5 h-3.5" />}
                          {p.name}
                        </div>
                        <div className="flex items-center gap-1.5 mb-1.5" style={{ color: p.fill }}>
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
                          {p.quadrant}
                        </div>
                        <div className="flex justify-between gap-4"><span className={tc.textSec}>GDP growth</span><span className="font-medium tabular-nums">{pct(p.gdp)}</span></div>
                        <div className="flex justify-between gap-4"><span className={tc.textSec}>Inflation</span><span className="font-medium tabular-nums">{pct(p.inflation)}</span></div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine x={GDP_THRESHOLD} stroke={isDarkMode ? '#4b5563' : '#d1d5db'} strokeDasharray="3 3" />
                <ReferenceLine y={INF_THRESHOLD} stroke={isDarkMode ? '#4b5563' : '#d1d5db'} strokeDasharray="3 3" />
                <Scatter data={scatterView.points} isAnimationActive={false}>
                  {scatterView.points.map(entry => (
                    <Cell key={entry.key} fill={entry.fill} fillOpacity={0.85} />
                  ))}
                  <LabelList dataKey="label" position="top" offset={6} style={{ fontSize: 10, fill: isDarkMode ? '#d1d5db' : '#374151' }} />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          {scatterView.hidden.length > 0 && (
            <div className={`mt-3 text-xs ${tc.textSec}`}>
              <span className="font-medium">Outside this view ({scatterView.hidden.length}):</span>{' '}
              {scatterView.hidden.map((p, i) => (
                <span key={p.key} className="inline-flex items-center gap-1 mr-2">
                  {p.iso2 && <IsoFlag iso2={p.iso2} title={p.name} className="w-4 h-3" />}
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>{p.name}</span>
                  <span className="tabular-nums">({pct(p.gdp)} growth, {pct(p.inflation)} inflation){i < scatterView.hidden.length - 1 ? ',' : ''}</span>
                </span>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            {QUADRANTS.map(q => (
              <div key={q.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: q.color }} />
                <div>
                  <p className="text-xs font-medium">{q.label} <span className={`font-normal ${tc.textSec}`}>· {quadrantCounts[q.label]} countries</span></p>
                  <p className={`text-[10px] ${tc.textSec}`}>{q.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projected growth change between last year and this year */}
        <div id={slugify(changeTitle)} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
            <h2 className="text-xl font-semibold">{changeTitle}</h2>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <SocialShareMenu title={changeTitle} isDarkMode={isDarkMode} />
            </div>
          </div>
          <p className={`text-sm mb-1 ${tc.textSec}`}>
            How much faster or slower each economy is projected to grow in {CURRENT_YEAR} than in {PREV_YEAR}, in percentage
            points (pp) of real GDP growth.
          </p>
          <p className={`text-xs mb-4 ${tc.textSec}`}>
            Both years come from the same IMF forecast, so this shows momentum, not a revision between forecast editions.
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-3" data-share-exclude>
            <div className={`inline-flex rounded border overflow-hidden text-xs ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
              {(['countries', 'groups'] as const).map(scope => (
                <button key={scope} type="button" onClick={() => { setChangeScope(scope); setChangeShowAll(false); }}
                  className={`px-3 py-1 ${changeScope === scope ? 'bg-blue-500/20 text-blue-500' : tc.textSec}`}>
                  {scope === 'countries' ? 'Countries' : 'Regions & groups'}
                </button>
              ))}
            </div>
            <select value={changeSort} onChange={e => setChangeSort(e.target.value as typeof changeSort)}
              aria-label="Sort order" className={`px-2 py-1 rounded border text-xs ${tc.selectBg}`}>
              <option value="rise">Biggest acceleration first</option>
              <option value="fall">Biggest slowdown first</option>
              <option value="name">A–Z</option>
            </select>
            <input type="search" value={changeSearch} onChange={e => setChangeSearch(e.target.value)}
              placeholder="Search…" aria-label="Search economies"
              className={`px-3 py-1 rounded border text-xs w-40 ${tc.selectBg}`} />
          </div>
          <p className={`text-xs mb-3 ${tc.textSec}`}>
            <span className="text-green-500 font-medium">{growthChange.faster} accelerating</span>
            {' · '}
            <span className="text-red-500 font-medium">{growthChange.slower} slowing</span>
            {' · '}
            {growthChange.total - growthChange.faster - growthChange.slower} unchanged, of {growthChange.total}{' '}
            {changeScope === 'countries' ? 'countries' : 'regions and groups'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {visibleChanges.map(r => {
              const tone = r.change > 0 ? 'up' : r.change < 0 ? 'down' : 'flat';
              return (
                <div
                  key={r.key}
                  className={`rounded-lg border p-3 ${
                    tone === 'up' ? (isDarkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200')
                      : tone === 'down' ? (isDarkMode ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200')
                      : (isDarkMode ? 'bg-gray-700/40 border-gray-600' : 'bg-gray-50 border-gray-200')
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {r.iso2 && <IsoFlag iso2={r.iso2} title={r.name} className="w-5 h-3.5 shrink-0" />}
                    <p className={`text-xs font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`} title={r.name}>{r.name}</p>
                  </div>
                  <p className={`text-xl font-bold mt-1 tabular-nums ${tone === 'up' ? 'text-green-500' : tone === 'down' ? 'text-red-500' : tc.textSec}`}>
                    {tone === 'up' ? '▲ ' : tone === 'down' ? '▼ ' : ''}{Math.abs(r.change).toFixed(1)} pp
                  </p>
                  <p className={`text-[11px] tabular-nums ${tc.textSec}`}>
                    {pct(r.prev)} → {pct(r.cur)}
                  </p>
                </div>
              );
            })}
          </div>
          {growthChange.rows.length === 0 && (
            <p className={`text-sm ${tc.textSec}`}>No matches for &ldquo;{changeSearch}&rdquo;.</p>
          )}
          {!changeSearch && growthChange.rows.length > CHANGE_PREVIEW && (
            <div className="mt-4 text-center" data-share-exclude>
              <button type="button" onClick={() => setChangeShowAll(s => !s)}
                className={`px-4 py-1.5 rounded text-xs border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:border-gray-500' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
                {changeShowAll ? `Show top ${CHANGE_PREVIEW} only` : `Show all ${growthChange.rows.length}`}
              </button>
            </div>
          )}
        </div>

        <AdvancedVsEmerging isDarkMode={isDarkMode} series={outlookSeries} economy={economy} />

        {/* Global Outlook Summary Table */}
        <div id={slugify('Global Outlook Summary')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
            <h2 className="text-xl font-semibold">Global Outlook Summary</h2>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <SocialShareMenu title="Global Outlook Summary" subject="dataset" isDarkMode={isDarkMode} />
            </div>
          </div>
          <p className={`text-sm mb-4 ${tc.textSec}`}>
            IMF real GDP growth and consumer-price inflation, % per year. {PREV_YEAR} figures are IMF estimates;{' '}
            {CURRENT_YEAR} and {NEXT_YEAR} are projections. Click a column heading to sort.
          </p>
          <div className="flex flex-wrap items-center gap-2 mb-3" data-share-exclude>
            <div className={`inline-flex rounded border overflow-hidden text-xs ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
              {(['countries', 'groups'] as const).map(scope => (
                <button key={scope} type="button" onClick={() => setTableScope(scope)}
                  className={`px-3 py-1 ${tableScope === scope ? 'bg-blue-500/20 text-blue-500' : tc.textSec}`}>
                  {scope === 'countries' ? `Countries (${tableCounts.countries})` : `Regions & groups (${tableCounts.groups})`}
                </button>
              ))}
            </div>
            <input type="search" value={tableSearch} onChange={e => setTableSearch(e.target.value)}
              placeholder="Search…" aria-label="Search the summary table"
              className={`px-3 py-1 rounded border text-xs w-40 ${tc.selectBg}`} />
          </div>
          <div className={`overflow-auto max-h-[640px] rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <table className="w-full text-sm">
              <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <tr className={`text-[11px] uppercase tracking-wide ${tc.textSec}`}>
                  <th className="px-3 pt-2" />
                  <th colSpan={3} className={`px-3 pt-2 text-center font-semibold border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>Real GDP growth</th>
                  <th colSpan={3} className={`px-3 pt-2 text-center font-semibold border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>Inflation</th>
                </tr>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  {[
                    { key: 'name', label: tableScope === 'countries' ? 'Country' : 'Region or group', align: 'text-left' },
                    { key: 'gdpPrev', label: String(PREV_YEAR), align: 'text-right' },
                    { key: 'gdpCur', label: String(CURRENT_YEAR), align: 'text-right' },
                    { key: 'gdpNext', label: String(NEXT_YEAR), align: 'text-right' },
                    { key: 'infPrev', label: String(PREV_YEAR), align: 'text-right' },
                    { key: 'infCur', label: String(CURRENT_YEAR), align: 'text-right' },
                    { key: 'infNext', label: String(NEXT_YEAR), align: 'text-right' },
                  ].map(col => (
                    <th
                      key={col.key}
                      className={`px-3 py-2 ${col.align} cursor-pointer select-none whitespace-nowrap hover:text-blue-500 transition-colors ${tc.textSec}`}
                      onClick={() => toggleSort(col.key)}
                      aria-sort={sortConfig.key === col.key ? (sortConfig.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                    >
                      {col.label}
                      {sortConfig.key === col.key && (
                        <span className="ml-1">{sortConfig.dir === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedTableData.map(row => {
                  const growthClass = (v: number | null) => (v != null && v < 0 ? 'text-red-500' : '');
                  const inflationClass = (v: number | null) =>
                    v == null ? '' : v >= 10 ? 'text-red-500' : v < 0 ? 'text-blue-500' : '';
                  return (
                    <tr
                      key={row.key}
                      className={`border-b transition-colors ${
                        isDarkMode ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-3 py-2 font-medium">
                        <span className="inline-flex items-center gap-2">
                          {row.iso2 && <IsoFlag iso2={row.iso2} title={row.name} className="w-5 h-3.5 shrink-0" />}
                          {row.name}
                        </span>
                      </td>
                      {[row.gdpPrev, row.gdpCur, row.gdpNext].map((v, i) => (
                        <td key={`g${i}`} className={`px-3 py-2 text-right tabular-nums ${growthClass(v)}`}>{pct(v)}</td>
                      ))}
                      {[row.infPrev, row.infCur, row.infNext].map((v, i) => (
                        <td key={`i${i}`} className={`px-3 py-2 text-right tabular-nums ${inflationClass(v)}`}>{pct(v)}</td>
                      ))}
                    </tr>
                  );
                })}
                {sortedTableData.length === 0 && (
                  <tr><td colSpan={7} className={`px-3 py-6 text-center ${tc.textSec}`}>No matches for &ldquo;{tableSearch}&rdquo;.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className={`text-[11px] mt-2 ${tc.textSec}`}>
            <span className="text-red-500">Red</span>: contraction or inflation of 10% or more.{' '}
            <span className="text-blue-500">Blue</span>: falling prices.
          </p>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
