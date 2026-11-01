'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import ThemeToggle from '../components/ThemeToggle';
import { useEffect, useLayoutEffect, useState, useMemo, useCallback, useRef, type ReactNode } from 'react';
import { fetchGlobalData } from '../services/worldbank';
import { METRIC_CATEGORIES, getRelatedMetrics, getMetricByKey } from '../utils/metricCategories';
import { COUNTRY_ISO_NUMERIC, ISO_NUMERIC_TO_COUNTRY, COUNTRY_DISPLAY_NAMES, COUNTRY_ISO3, COUNTRY_KEYS, type CountryKey } from '../utils/countryMappings';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import SocialShareMenu from '../components/SocialShareMenu';
import { slugify } from '../lib/share';
import CountryDetailPanel, { type CountryDetailData } from '../components/heatmap/CountryDetailPanel';
import TimelinePlayer from '../components/heatmap/TimelinePlayer';
import RaceBars from '../components/heatmap/RaceBars';
import ValueModeControl from '../components/heatmap/ValueModeControl';
import InsightsStrip from '../components/heatmap/InsightsStrip';
import MetricExplainer from '../components/heatmap/MetricExplainer';
import StoryTours from '../components/heatmap/StoryTours';
import GroupLens, { GroupSelect } from '../components/heatmap/GroupLens';
import ScreenerPanel from '../components/heatmap/ScreenerPanel';
import ScatterView from '../components/heatmap/ScatterView';
import TileMapView from '../components/heatmap/TileMapView';
import QuizView from '../components/heatmap/QuizView';
import ExportMenu from '../components/heatmap/ExportMenu';
import { heatmapTheme } from '../components/heatmap/theme';
import {
  HEATMAP_STYLES, getHeatmapColor, getGradientCSS, DIVERGING_METRICS, CONTRAST_STYLE, COUNTRY_CENTROIDS,
  flagFor, isHeatmapStyle, type HeatmapStyleId,
} from '../utils/heatmap/palettes';
import { VIEW_MODE_CONFIG, MAP_VIEWS, isHeatmapView, type HeatmapView } from '../utils/heatmap/views';
import {
  valuesForYear, changeValues, extent, coverage, smartDefaultYear, yearsForMetric, rankHistory, formatValue,
  entries, readValue, type HeatmapData, type ValueMode, type CountryValues,
} from '../utils/heatmap/values';
import { generateInsights } from '../utils/heatmap/insights';
import { similarCountries } from '../utils/heatmap/similarity';
import { applyScreener, type ScreenerCondition } from '../utils/heatmap/screener';
import { getGroup } from '../utils/heatmap/groups';
import { terciles, bivariateClass, bivariateColor } from '../utils/heatmap/bivariate';
import { parseHeatmapState, serializeHeatmapState } from '../utils/heatmap/urlState';
import { getStory } from '../utils/heatmap/stories';
import type { QuizQuestion } from '../utils/heatmap/quiz';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const DEFAULT_POSITION: { coordinates: [number, number]; zoom: number } = { coordinates: [0, 20], zoom: 1 };
const VALUE_MODES: ValueMode[] = ['level', 'change', 'pctChange'];
const VIEW_KEYS: Record<string, HeatmapView> = Object.fromEntries(VIEW_MODE_CONFIG.map(v => [v.icon.toLowerCase(), v.id]));
const PALETTE_VIEWS = new Set<HeatmapView>(['choropleth', 'bubble', 'ranked', 'tiles', 'comparison']);
const KNOWN_COUNTRIES = new Set<string>(COUNTRY_KEYS);
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type Hover = { mapId: string; name: string; lines: string[]; x: number; y: number };

export default function GlobalHeatmapPage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('gdpGrowth');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [hovered, setHovered] = useState<Hover | null>(null);
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [detailCountry, setDetailCountry] = useState<CountryKey | null>(null);
  const [heatmapStyle, setHeatmapStyle] = useLocalStorage<HeatmapStyleId>('heatmapStyle', 'thermal');
  const [viewMode, setViewMode] = useLocalStorage<HeatmapView>('heatmapViewMode', 'choropleth');
  const [compareMetric, setCompareMetric] = useState('inflationRates');
  const [compareStyle, setCompareStyle] = useLocalStorage<HeatmapStyleId>('heatmapCompareStyle', 'ocean');
  const [compareLayout, setCompareLayout] = useState<'split' | 'bivariate'>('split');
  const [valueMode, setValueMode] = useState<ValueMode>('level');
  const [baseYear, setBaseYear] = useState<number | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [screener, setScreener] = useState<ScreenerCondition[]>([]);
  const [playing, setPlaying] = useState(false);
  const [tour, setTour] = useState<{ id: string; step: number } | null>(null);
  const [peersOn, setPeersOn] = useState(false);
  const viewRef = useRef<HTMLDivElement>(null);
  const urlReady = useRef(false);
  const tc = heatmapTheme(isDarkMode);

  useEffect(() => { fetchGlobalData().then(d => { setData(d as unknown as HeatmapData); setLoading(false); }).catch(() => setLoading(false)); }, []);

  // Restore a shared view from the query string once, before anything writes it back.
  // A layout effect, so it lands in the same pass as the useLocalStorage hydration
  // (declared above, so it runs first) and the URL wins over stored preferences.
  useIsomorphicLayoutEffect(() => {
    const s = parseHeatmapState(window.location.search);
    if (s.metric && getMetricByKey(s.metric)) setSelectedMetric(s.metric);
    if (s.year) setSelectedYear(s.year);
    if (isHeatmapView(s.view)) setViewMode(s.view);
    if (s.mode && (VALUE_MODES as string[]).includes(s.mode)) setValueMode(s.mode as ValueMode);
    if (s.base) setBaseYear(s.base);
    if (s.compare && getMetricByKey(s.compare)) setCompareMetric(s.compare);
    if (s.country && KNOWN_COUNTRIES.has(s.country)) setDetailCountry(s.country as CountryKey);
    if (getGroup(s.group)) setGroupId(s.group!);
    if (isHeatmapStyle(s.palette)) setHeatmapStyle(s.palette);
    if (getStory(s.story)) setTour({ id: s.story!, step: Math.max(0, s.step ?? 0) });
    urlReady.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-switch to diverging palette for negative-capable metrics
  useEffect(() => {
    if (DIVERGING_METRICS.has(selectedMetric) && heatmapStyle !== 'diverging') {
      setHeatmapStyle('diverging');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMetric]);

  // Auto-pick a contrasting compare palette when primary palette changes
  useEffect(() => {
    if (viewMode === 'comparison' && compareStyle === heatmapStyle) {
      setCompareStyle(CONTRAST_STYLE[heatmapStyle] || 'ocean');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heatmapStyle, viewMode]);

  useEffect(() => { setHovered(null); }, [viewMode]);
  useEffect(() => { setPeersOn(false); }, [detailCountry]);

  const metricDef = getMetricByKey(selectedMetric);
  const compareMetricDef = getMetricByKey(compareMetric);
  const metricLabel = metricDef?.label || selectedMetric;

  const availableYears = useMemo(() => (data ? yearsForMetric(data, selectedMetric) : []), [data, selectedMetric]);

  useEffect(() => {
    if (!data || availableYears.length === 0) return;
    if (selectedYear === null || !availableYears.includes(selectedYear)) {
      const y = smartDefaultYear(data, selectedMetric);
      if (y !== null) setSelectedYear(prev => (prev !== null && availableYears.includes(prev) ? prev : y));
    }
  }, [data, selectedMetric, selectedYear, availableYears]);

  const effectiveBase = useMemo(() => {
    const candidates = availableYears.filter(y => selectedYear === null || y < selectedYear);
    if (candidates.length === 0) return null;
    if (baseYear !== null && candidates.includes(baseYear)) return baseYear;
    const target = (selectedYear ?? candidates[candidates.length - 1]) - 10;
    return candidates.find(y => y >= target) ?? candidates[0];
  }, [availableYears, selectedYear, baseYear]);

  const levelValues = useMemo<CountryValues>(
    () => (data && selectedYear !== null ? valuesForYear(data, selectedMetric, selectedYear) : {}),
    [data, selectedMetric, selectedYear],
  );

  const displayValues = useMemo<CountryValues>(() => {
    if (valueMode === 'level') return levelValues;
    if (!data || selectedYear === null || effectiveBase === null) return {};
    return changeValues(data, selectedMetric, selectedYear, effectiveBase, valueMode);
  }, [valueMode, levelValues, data, selectedMetric, selectedYear, effectiveBase]);

  const { min, max } = useMemo(() => {
    const e = extent(displayValues);
    if (valueMode === 'level') return e;
    const m = Math.max(Math.abs(e.min), Math.abs(e.max)) || 1;
    return { min: -m, max: m };
  }, [displayValues, valueMode]);

  const activeStyle: HeatmapStyleId = valueMode === 'level' ? heatmapStyle : 'diverging';
  const fmt = useCallback((v: number) => formatValue(metricDef, v, valueMode), [metricDef, valueMode]);
  const legendLabel = valueMode === 'level'
    ? metricLabel
    : `${metricLabel}: ${valueMode === 'change' ? 'change' : '% change'} since ${effectiveBase}`;

  const isoValues = useMemo(
    () => Object.fromEntries(entries(displayValues).map(([ck, v]) => [COUNTRY_ISO_NUMERIC[ck], v])) as Record<string, number>,
    [displayValues],
  );

  const compareValues = useMemo(() => {
    if (!data || selectedYear === null || (viewMode !== 'comparison' && viewMode !== 'scatter')) {
      return { vals: {} as CountryValues, iso: {} as Record<string, number>, min: 0, max: 0 };
    }
    const vals = valuesForYear(data, compareMetric, selectedYear);
    const iso = Object.fromEntries(entries(vals).map(([ck, v]) => [COUNTRY_ISO_NUMERIC[ck], v])) as Record<string, number>;
    return { vals, iso, ...extent(vals) };
  }, [data, compareMetric, selectedYear, viewMode]);

  const bivariate = useMemo(() => {
    if (viewMode !== 'comparison' || compareLayout !== 'bivariate') return null;
    const both = entries(displayValues).filter(([ck]) => compareValues.vals[ck] !== undefined);
    if (both.length < 3) return null;
    const xCuts = terciles(both.map(([, v]) => v));
    const yCuts = terciles(both.map(([ck]) => compareValues.vals[ck]!));
    const cls = new Map(both.map(([ck, v]) => [ck, bivariateClass(v, compareValues.vals[ck]!, xCuts, yCuts)]));
    const iso = Object.fromEntries(both.map(([ck, v]) => [COUNTRY_ISO_NUMERIC[ck], v])) as Record<string, number>;
    return { cls, iso };
  }, [viewMode, compareLayout, displayValues, compareValues]);

  // Story tours
  const activeTour = useMemo(() => {
    const story = getStory(tour?.id);
    return story && tour ? { story, step: Math.min(tour.step, story.steps.length - 1) } : null;
  }, [tour]);
  const tourStep = activeTour?.story.steps[activeTour.step];

  useEffect(() => {
    if (!activeTour) return;
    const s = activeTour.story.steps[activeTour.step];
    setPlaying(false);
    setSelectedMetric(s.metric);
    setSelectedYear(s.year);
    setViewMode(s.view);
    setValueMode(s.mode ?? 'level');
    setBaseYear(s.baseYear ?? null);
    if (s.compare) setCompareMetric(s.compare);
    setPosition(s.center ? { coordinates: s.center, zoom: s.zoom ?? 1 } : DEFAULT_POSITION);
    setDetailCountry(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTour]);

  // Analysis: screener, group lens, similar countries and the combined highlight
  const activeConditions = useMemo(() => screener.filter(c => Number.isFinite(c.value)), [screener]);
  const screenerMatches = useMemo(
    () => (data && selectedYear !== null ? applyScreener(data, selectedYear, activeConditions) : []),
    [data, selectedYear, activeConditions],
  );

  const similar = useMemo(() => {
    if (!detailCountry || !data || selectedYear === null) return [];
    const metrics = [selectedMetric, ...getRelatedMetrics(selectedMetric).map(m => m.key)];
    return similarCountries(data, detailCountry, metrics, selectedYear);
  }, [detailCountry, data, selectedYear, selectedMetric]);

  const highlight = useMemo<Set<CountryKey> | null>(() => {
    if (peersOn && detailCountry && similar.length) return new Set([detailCountry, ...similar.map(s => s.country)]);
    if (tourStep?.highlight?.length) return new Set(tourStep.highlight);
    let set: Set<CountryKey> | null = null;
    const group = getGroup(groupId);
    if (group) set = new Set(group.members);
    if (activeConditions.length) {
      const matches = new Set(screenerMatches);
      set = set ? new Set(Array.from(set).filter(c => matches.has(c))) : matches;
    }
    return set;
  }, [peersOn, detailCountry, similar, tourStep, groupId, activeConditions, screenerMatches]);

  const insights = useMemo(
    () => (data && selectedYear !== null ? generateInsights({ data, metric: selectedMetric, year: selectedYear, def: metricDef }) : []),
    [data, selectedMetric, selectedYear, metricDef],
  );

  // Country detail (always in levels: it describes the country, not the change view)
  const countryDetail = useMemo<CountryDetailData | null>(() => {
    if (!detailCountry || !data || selectedYear === null || !metricDef) return null;
    const value = levelValues[detailCountry];
    if (value === undefined) return null;
    const history = (data[selectedMetric] ?? [])
      .map(row => ({ year: Number(row.year), value: readValue(row, detailCountry) }))
      .filter((d): d is { year: number; value: number } => d.value !== null)
      .sort((a, b) => a.year - b.year);
    const sorted = entries(levelValues).sort((a, b) => b[1] - a[1]);
    const rank = sorted.findIndex(([ck]) => ck === detailCountry) + 1;
    const total = sorted.length;
    const median = sorted[Math.floor(total / 2)][1];
    const percentile = total > 1 ? Math.round(((total - rank) / (total - 1)) * 100) : 100;
    const prev = valuesForYear(data, selectedMetric, selectedYear - 1)[detailCountry];
    const relatedMetrics = getRelatedMetrics(selectedMetric).map(rm => ({
      key: rm.key, label: rm.label, format: rm.format,
      value: valuesForYear(data, rm.key, selectedYear)[detailCountry] ?? null,
    }));
    return {
      countryKey: detailCountry, countryName: COUNTRY_DISPLAY_NAMES[detailCountry] || detailCountry, value, rank, total, median,
      percentile, history, relatedMetrics, yearOverYearChange: prev !== undefined ? value - prev : null,
    };
  }, [detailCountry, data, selectedMetric, selectedYear, metricDef, levelValues]);

  const rankHist = useMemo(
    () => (detailCountry && data ? rankHistory(data, selectedMetric, detailCountry) : []),
    [detailCountry, data, selectedMetric],
  );

  const handleMoveEnd = useCallback((pos: { coordinates: [number, number]; zoom: number }) => setPosition(pos), []);
  const toggleDetail = useCallback((ck: CountryKey) => setDetailCountry(prev => (prev === ck ? null : ck)), []);
  const selectCountry = useCallback((ck: CountryKey) => setDetailCountry(ck), []);

  const stepYear = useCallback((dir: 1 | -1) => {
    setSelectedYear(y => {
      const i = y === null ? -1 : availableYears.indexOf(y);
      return availableYears[Math.min(availableYears.length - 1, Math.max(0, i + dir))] ?? y;
    });
  }, [availableYears]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setDetailCountry(null); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName))) return;
      if (e.key === ' ') {
        if (t && /^(BUTTON|A)$/.test(t.tagName)) return;
        e.preventDefault();
        setPlaying(p => !p);
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        setPlaying(false);
        stepYear(e.key === 'ArrowRight' ? 1 : -1);
        return;
      }
      const view = VIEW_KEYS[e.key.toLowerCase()];
      if (view) setViewMode(view);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stepYear, setViewMode]);

  // Keep the URL in step so any view can be shared.
  useEffect(() => {
    if (!urlReady.current) return;
    const timer = window.setTimeout(() => {
      const qs = serializeHeatmapState({
        metric: selectedMetric,
        year: selectedYear ?? undefined,
        view: viewMode,
        mode: valueMode !== 'level' ? valueMode : undefined,
        base: valueMode !== 'level' ? effectiveBase ?? undefined : undefined,
        compare: viewMode === 'comparison' || viewMode === 'scatter' ? compareMetric : undefined,
        country: detailCountry ?? undefined,
        group: groupId ?? undefined,
        palette: heatmapStyle !== 'thermal' ? heatmapStyle : undefined,
        story: activeTour?.story.id,
        step: activeTour ? activeTour.step : undefined,
      });
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${qs}${window.location.hash}`);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [selectedMetric, selectedYear, viewMode, valueMode, effectiveBase, compareMetric, detailCountry, groupId, heatmapStyle, activeTour]);

  // Table view: sort state
  const [tableSortCol, setTableSortCol] = useState<string>('primary');
  const [tableSortDir, setTableSortDir] = useState<'asc' | 'desc'>('desc');

  const tableColumns = useMemo(() => {
    const related = getRelatedMetrics(selectedMetric);
    return [metricDef!, ...related].filter(Boolean);
  }, [selectedMetric, metricDef]);

  const tableData = useMemo(() => {
    if (!data || selectedYear === null) return [];
    const relatedMaps = tableColumns.slice(1).map(col => ({ key: col.key, values: valuesForYear(data, col.key, selectedYear) }));
    const prevLevels = valuesForYear(data, selectedMetric, selectedYear - 1);
    const rows = entries(displayValues).map(([ck, pv]) => {
      const vals: Record<string, number | null> = { primary: pv };
      for (const { key, values } of relatedMaps) vals[key] = values[ck] ?? null;
      const cur = levelValues[ck];
      const prev = prevLevels[ck];
      return {
        country: ck,
        name: COUNTRY_DISPLAY_NAMES[ck] || ck,
        flag: flagFor(ck),
        values: vals,
        yoy: cur !== undefined && prev !== undefined ? cur - prev : null,
      };
    });

    rows.sort((a, b) => {
      const av = tableSortCol === 'yoy' ? a.yoy : a.values[tableSortCol];
      const bv = tableSortCol === 'yoy' ? b.yoy : b.values[tableSortCol];
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      return tableSortDir === 'desc' ? bv - av : av - bv;
    });

    return rows;
  }, [data, selectedYear, selectedMetric, tableColumns, tableSortCol, tableSortDir, displayValues, levelValues]);

  const toggleSort = useCallback((col: string) => {
    setTableSortCol(prev => {
      if (prev === col) { setTableSortDir(d => d === 'desc' ? 'asc' : 'desc'); return col; }
      setTableSortDir('desc');
      return col;
    });
  }, []);

  const csvRows = useCallback(() => {
    if (!data || selectedYear === null) return [];
    const related = getRelatedMetrics(selectedMetric);
    const relatedMaps = related.map(r => valuesForYear(data, r.key, selectedYear));
    const sorted = entries(displayValues).sort((a, b) => b[1] - a[1]);
    return [
      ['Country', 'ISO3', `${legendLabel} (${selectedYear})`, 'Rank', ...related.map(r => `${r.label} (${selectedYear})`)],
      ...sorted.map(([ck, v], i) => [
        COUNTRY_DISPLAY_NAMES[ck], COUNTRY_ISO3[ck], Number(v.toFixed(4)), i + 1,
        ...relatedMaps.map(m => (m[ck] !== undefined ? Number(m[ck]!.toFixed(4)) : null)),
      ]),
    ];
  }, [data, selectedYear, selectedMetric, displayValues, legendLabel]);

  const switchMetric = useCallback((key: string) => { setSelectedMetric(key); setDetailCountry(null); }, []);

  const showQuizOnMap = useCallback((q: QuizQuestion) => {
    setTour(null);
    setValueMode('level');
    setGroupId(null);
    setScreener([]);
    setSelectedMetric(q.metric);
    setSelectedYear(q.year);
    setViewMode('choropleth');
    setPosition(DEFAULT_POSITION);
    setDetailCountry(q.answer);
    viewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [setViewMode]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${tc.bg}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className={tc.textSec}>Loading global data...</p>
        </div>
      </div>
    );
  }

  const choroplethTitle = `${legendLabel} — Choropleth Map (${selectedYear})`;
  const bubbleTitle = `${legendLabel} — Bubble Map (${selectedYear})`;
  const rankingsTitle = `${legendLabel} — Country Rankings (${selectedYear})`;
  const compareTitle = `${legendLabel} — Comparison Map (${selectedYear})`;
  const compareWithTitle = `${compareMetricDef?.label || compareMetric} — Comparison Map (${selectedYear})`;
  const bivariateTitle = `${legendLabel} vs ${compareMetricDef?.label || compareMetric} — Bivariate Map (${selectedYear})`;
  const scatterTitle = `${legendLabel} vs ${compareMetricDef?.label || compareMetric} (${selectedYear})`;
  const tilesTitle = `${legendLabel} — Tile Map (${selectedYear})`;
  const cov = coverage(displayValues);
  const isQuiz = viewMode === 'quiz';
  const comparing = viewMode === 'comparison' || viewMode === 'scatter';

  const describePrimary = (ck: CountryKey) => {
    const v = displayValues[ck];
    return v !== undefined ? [`${metricLabel}: ${fmt(v)}`] : null;
  };
  const describeCompare = (ck: CountryKey) => {
    const v = compareValues.vals[ck];
    return v !== undefined && compareMetricDef ? [`${compareMetricDef.label}: ${compareMetricDef.format(v)}`] : null;
  };
  const describeBoth = (ck: CountryKey) => {
    const a = describePrimary(ck);
    const b = describeCompare(ck);
    return a && b ? [...a, ...b] : null;
  };

  const tooltipFor = (mapId: string) => hovered && hovered.mapId === mapId && (
    <div className={`absolute z-10 px-3 py-2 rounded-lg border shadow-lg text-sm pointer-events-none ${tc.card}`} style={{ left: hovered.x + 10, top: hovered.y - 40 }}>
      <p className="font-semibold">{hovered.name}</p>
      {hovered.lines.map(l => <p key={l} className={tc.textSec}>{l}</p>)}
    </div>
  );

  // Shared map renderer used by choropleth, bubble, and comparison views
  const renderMap = (
    values: Record<string, number>,
    vMin: number,
    vMax: number,
    style: HeatmapStyleId,
    opts: {
      id: string;
      describe: (ck: CountryKey) => string[] | null;
      compact?: boolean;
      bubbles?: CountryValues;
      fillFor?: (ck: CountryKey) => string | null;
    },
  ) => (
    <ComposableMap projectionConfig={{ scale: opts.compact ? 120 : 147 }} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <pattern id={`nodata-${opts.id}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="4" height="4" fill={tc.land} />
          <line x1="0" y1="0" x2="0" y2="4" stroke={tc.border} strokeWidth="1.5" />
        </pattern>
      </defs>
      <ZoomableGroup center={position.coordinates} zoom={position.zoom} onMoveEnd={handleMoveEnd}>
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => {
              const isoCode = geo.id as string;
              const countryKey = ISO_NUMERIC_TO_COUNTRY[isoCode];
              const value = values[isoCode];
              const custom = countryKey && opts.fillFor ? opts.fillFor(countryKey) : null;
              const fill = custom
                ?? (value !== undefined ? getHeatmapColor(style, value, vMin, vMax, isDarkMode)
                  : countryKey ? `url(#nodata-${opts.id})` : tc.land);
              const isSelected = countryKey === detailCountry;
              const dim = !!countryKey && highlight !== null && !highlight.has(countryKey);
              return (
                <Geography
                  key={geo.rpiKey}
                  geography={geo}
                  fill={fill}
                  stroke={isSelected ? '#f59e0b' : tc.border}
                  strokeWidth={isSelected ? 2 : 0.5}
                  style={{
                    default: { outline: 'none', opacity: dim ? 0.25 : 1, transition: 'fill 800ms, opacity 300ms' },
                    hover: { fill: '#f59e0b', outline: 'none', cursor: 'pointer', opacity: 1 },
                    pressed: { outline: 'none' },
                  }}
                  onMouseEnter={(e) => {
                    const lines = countryKey ? opts.describe(countryKey) : null;
                    if (countryKey && lines) {
                      const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
                      setHovered({ mapId: opts.id, name: COUNTRY_DISPLAY_NAMES[countryKey] || isoCode, lines, x: e.clientX - (rect?.left || 0), y: e.clientY - (rect?.top || 0) });
                    }
                  }}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => { if (countryKey && value !== undefined) toggleDetail(countryKey); }}
                />
              );
            })
          }
        </Geographies>
        {opts.bubbles && entries(opts.bubbles).map(([ck, val]) => {
          const coords = COUNTRY_CENTROIDS[ck];
          if (!coords) return null;
          const maxR = opts.compact ? 12 : 20;
          const t = vMax === vMin ? 0.5 : (val - vMin) / (vMax - vMin);
          const r = Math.max(3, Math.sqrt(t) * maxR);
          const dim = highlight !== null && !highlight.has(ck);
          return (
            <Marker key={ck} coordinates={coords}>
              <circle
                r={r}
                fill={getHeatmapColor(style, val, vMin, vMax, isDarkMode)}
                fillOpacity={dim ? 0.15 : 0.75}
                stroke={ck === detailCountry ? '#f59e0b' : (isDarkMode ? '#e5e7eb' : '#1f2937')}
                strokeWidth={ck === detailCountry ? 2 : 0.5}
                style={{ cursor: 'pointer', transition: 'r 800ms, fill 800ms' }}
                onMouseEnter={(e) => {
                  const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
                  setHovered({ mapId: opts.id, name: COUNTRY_DISPLAY_NAMES[ck] || ck, lines: opts.describe(ck) ?? [], x: e.clientX - (rect?.left || 0), y: e.clientY - (rect?.top || 0) });
                }}
                onMouseLeave={() => setHovered(null)}
                onClick={() => toggleDetail(ck)}
              />
            </Marker>
          );
        })}
      </ZoomableGroup>
    </ComposableMap>
  );

  const detailPanel = countryDetail && metricDef && selectedYear !== null ? (
    <CountryDetailPanel
      detail={countryDetail} metricDef={metricDef} selectedMetric={selectedMetric} selectedYear={selectedYear} isDarkMode={isDarkMode}
      rankHistory={rankHist} similar={similar} peersHighlighted={peersOn}
      onClose={() => setDetailCountry(null)} onMetricSwitch={switchMetric} onSelectCountry={selectCountry} onTogglePeers={() => setPeersOn(p => !p)}
    />
  ) : null;

  const withSidePanel = (content: ReactNode) => (
    <>
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">{content}</div>
        {detailPanel && (
          <div className={`w-96 flex-shrink-0 rounded-xl border overflow-hidden ${tc.card} hidden lg:block`} style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            {detailPanel}
          </div>
        )}
      </div>
      {detailPanel && <div className={`mt-4 rounded-xl border overflow-hidden lg:hidden ${tc.card}`}>{detailPanel}</div>}
    </>
  );

  const yearStamp = (position: string, size = 'text-5xl sm:text-7xl') => playing ? (
    <div data-export-ignore aria-hidden className={`pointer-events-none absolute z-20 ${position} ${size} font-black tabular-nums leading-none opacity-20 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {selectedYear}
    </div>
  ) : null;

  const belowPanel = detailPanel && <div className={`mt-4 rounded-xl border overflow-hidden ${tc.card}`}>{detailPanel}</div>;

  const legend = (
    <div className={`rounded-xl border p-4 mt-4 ${tc.card}`}>
      <div className="flex items-center gap-4 flex-wrap">
        <span className={`text-sm ${tc.textSec}`}>{legendLabel}</span>
        <div className="flex-1 min-w-[120px] h-4 rounded-full overflow-hidden" style={{ background: getGradientCSS(activeStyle, isDarkMode) }} />
        <span className={`text-xs whitespace-nowrap ${tc.textSec}`}>{fmt(min)}</span>
        <span className={`text-xs whitespace-nowrap ${tc.textSec}`}>{fmt(max)}</span>
      </div>
      <div className={`flex items-center gap-4 flex-wrap mt-2 text-xs ${tc.textSec}`}>
        <span>Showing {cov.count} of {cov.total} countries</span>
        <span className="flex items-center gap-1.5">
          <svg width="16" height="10" aria-hidden>
            <defs>
              <pattern id="legend-nodata" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="4" height="4" fill={tc.land} />
                <line x1="0" y1="0" x2="0" y2="4" stroke={tc.border} strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="16" height="10" rx="2" fill="url(#legend-nodata)" />
          </svg>
          No data for {selectedYear}
        </span>
        {valueMode !== 'level' && <span>Change views use the diverging palette: red for falls, green for rises.</span>}
      </div>
    </div>
  );

  const shareButton = (title: string, subject?: 'dataset') => (
    <div className="absolute top-3 right-3 z-20" data-export-ignore>
      <SocialShareMenu title={title} subject={subject} isDarkMode={isDarkMode} />
    </div>
  );

  const palettePicker = (value: HeatmapStyleId, onChange: (id: HeatmapStyleId) => void, accent: 'blue' | 'emerald') => (
    <div className="flex flex-wrap gap-2">
      {HEATMAP_STYLES.map(style => {
        const isActive = value === style.id;
        const activeCls = accent === 'blue'
          ? tc.chipActive
          : (isDarkMode ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30' : 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30');
        return (
          <button key={style.id} onClick={() => onChange(style.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${isActive ? activeCls : tc.chip}`}>
            <div className="flex h-4 w-10 rounded overflow-hidden">
              {style.preview.map((color, i) => <div key={i} className="flex-1" style={{ backgroundColor: color }} />)}
            </div>
            {style.label}
          </button>
        );
      })}
    </div>
  );

  const showPalette = valueMode === 'level' && PALETTE_VIEWS.has(viewMode) && !(viewMode === 'comparison' && compareLayout === 'bivariate');

  return (
    <div className={`min-h-screen transition-colors duration-200 ${tc.bg} ${tc.text}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">Global Heatmap</h1>
            <p className={tc.textSec}>Visualize any economic metric across the world map</p>
          </div>
          <ThemeToggle isDarkMode={isDarkMode} />
        </div>

        {/* How-to box */}
        <div className={`rounded-xl border p-4 sm:p-6 mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
          <h2 className="text-lg sm:text-xl font-semibold mb-3">How to Read the Heatmap</h2>
          <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Choose a <strong>view mode</strong> to change how data is displayed: Choropleth colors countries, Bubble Map shows scaled circles, Ranked Bars gives a ranking that races through the years, Compare shows two metrics side by side or on one bivariate map, Scatter plots them against each other, and Tile Map gives every country equal space. Press <strong>play</strong> to animate the years, switch to <strong>Change</strong> to see what moved, or take a <strong>story tour</strong>. Click any country for a detailed breakdown.
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Keyboard: <kbd className="font-mono">M B R C T S H Q</kbd> switch views, <kbd className="font-mono">&larr; &rarr;</kbd> step through years, <kbd className="font-mono">Space</kbd> plays or pauses, <kbd className="font-mono">Esc</kbd> closes the country panel.
          </p>
        </div>

        {!isQuiz && <MetricExplainer metric={selectedMetric} label={metricLabel} isDarkMode={isDarkMode} />}

        <StoryTours
          active={activeTour}
          isDarkMode={isDarkMode}
          onStart={id => setTour({ id, step: 0 })}
          onStep={step => setTour(t => (t ? { ...t, step } : t))}
          onExit={() => setTour(null)}
        />

        {/* View Mode Selector */}
        <div className={`rounded-xl border p-4 mb-4 ${tc.card}`}>
          <label className={`block text-xs uppercase tracking-wider mb-2.5 ${tc.textSec}`}>View Mode</label>
          <div className="flex flex-wrap gap-2">
            {VIEW_MODE_CONFIG.map(vm => {
              const isActive = viewMode === vm.id;
              return (
                <button key={vm.id} onClick={() => setViewMode(vm.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-medium transition-all ${isActive ? tc.chipActive : tc.chip}`}
                  title={`${vm.description} (key ${vm.icon})`}
                >
                  <span className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${
                    isActive ? (isDarkMode ? 'bg-blue-500/30 text-blue-300' : 'bg-blue-100 text-blue-700') : (isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400')
                  }`}>{vm.icon}</span>
                  {vm.label}
                </button>
              );
            })}
          </div>
        </div>

        {!isQuiz && (
          <>
            {/* Controls */}
            <div className={`rounded-xl border p-4 mb-4 flex flex-wrap gap-4 items-end ${tc.card}`}>
              <div className="flex-1 min-w-[200px]">
                <label className={`block text-xs uppercase tracking-wider mb-1 ${tc.textSec}`}>Metric</label>
                <select value={selectedMetric}
                  onChange={e => { setSelectedMetric(e.target.value); setSelectedYear(null); setDetailCountry(null); }}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}>
                  {METRIC_CATEGORIES.map(cat => (
                    <optgroup key={cat.id} label={cat.label}>
                      {cat.metrics.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              {comparing && (
                <div className="flex-1 min-w-[200px]">
                  <label className={`block text-xs uppercase tracking-wider mb-1 ${tc.textSec}`}>{viewMode === 'scatter' ? 'Vertical axis' : 'Compare With'}</label>
                  <select value={compareMetric}
                    onChange={e => setCompareMetric(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}>
                    {METRIC_CATEGORIES.map(cat => (
                      <optgroup key={cat.id} label={cat.label}>
                        {cat.metrics.filter(m => m.key !== selectedMetric).map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
              )}
              <div className="min-w-[110px]">
                <label className={`block text-xs uppercase tracking-wider mb-1 ${tc.textSec}`}>Year</label>
                <select value={selectedYear ?? ''} onChange={e => { setPlaying(false); setSelectedYear(Number(e.target.value)); }}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}>
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <ValueModeControl
                mode={valueMode}
                baseYear={effectiveBase ?? availableYears[0] ?? 0}
                years={availableYears}
                selectedYear={selectedYear}
                isDarkMode={isDarkMode}
                onModeChange={setValueMode}
                onBaseYearChange={setBaseYear}
              />
              <GroupSelect groupId={groupId} isDarkMode={isDarkMode} onChange={setGroupId} />
              {MAP_VIEWS.has(viewMode) && (
                <div className="flex gap-2">
                  <button onClick={() => setPosition(p => ({ ...p, zoom: Math.min(p.zoom * 1.5, 6) }))} aria-label="Zoom in" className={`px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}>+</button>
                  <button onClick={() => setPosition(p => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }))} aria-label="Zoom out" className={`px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}>-</button>
                  <button onClick={() => setPosition(DEFAULT_POSITION)} className={`px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}>Reset</button>
                </div>
              )}
              <ExportMenu targetRef={viewRef} filename={slugify(`${metricLabel} ${viewMode} ${selectedYear ?? ''}`)} csv={csvRows} isDarkMode={isDarkMode} />
            </div>

            <TimelinePlayer
              years={availableYears}
              year={selectedYear}
              playing={playing}
              isDarkMode={isDarkMode}
              onYearChange={setSelectedYear}
              onPlayingChange={setPlaying}
            />

            {/* Color Palette Picker */}
            {showPalette && (
              <div className={`rounded-xl border p-4 mb-4 ${tc.card}`}>
                {viewMode === 'comparison' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs uppercase tracking-wider mb-2.5 ${tc.textSec}`}>Palette — {metricLabel}</label>
                      {palettePicker(heatmapStyle, setHeatmapStyle, 'blue')}
                    </div>
                    <div>
                      <label className={`block text-xs uppercase tracking-wider mb-2.5 ${tc.textSec}`}>Palette — {compareMetricDef?.label || 'Compare'}</label>
                      {palettePicker(compareStyle, setCompareStyle, 'emerald')}
                    </div>
                  </div>
                ) : (
                  <>
                    <label className={`block text-xs uppercase tracking-wider mb-2.5 ${tc.textSec}`}>Color Palette</label>
                    {palettePicker(heatmapStyle, setHeatmapStyle, 'blue')}
                  </>
                )}
              </div>
            )}

            {data && (
              <ScreenerPanel
                data={data}
                year={selectedYear}
                conditions={screener}
                matches={screenerMatches}
                isDarkMode={isDarkMode}
                onChange={setScreener}
                onSelectCountry={selectCountry}
              />
            )}

            <InsightsStrip insights={insights} year={selectedYear} isDarkMode={isDarkMode} onSelectCountry={selectCountry} />

            {groupId && (
              <GroupLens groupId={groupId} values={displayValues} format={fmt} isDarkMode={isDarkMode} onSelectCountry={selectCountry} onGroupChange={setGroupId} />
            )}
          </>
        )}

        <div ref={viewRef} className={`relative scroll-mt-4 ${tc.bg}`}>

          {/* CHOROPLETH VIEW */}
          {viewMode === 'choropleth' && (
            <>
              {withSidePanel(
                <div id={slugify(choroplethTitle)} className="relative">
                  {shareButton(choroplethTitle)}
                  <div className={`rounded-xl border overflow-hidden relative ${tc.card}`} style={{ backgroundColor: tc.ocean }}>
                    {tooltipFor('main')}
                    {yearStamp('bottom-4 left-5')}
                    {renderMap(isoValues, min, max, activeStyle, { id: 'main', describe: describePrimary })}
                  </div>
                </div>,
              )}
              {legend}
            </>
          )}

          {/* BUBBLE MAP VIEW */}
          {viewMode === 'bubble' && (
            <>
              {withSidePanel(
                <div id={slugify(bubbleTitle)} className="relative">
                  {shareButton(bubbleTitle)}
                  <div className={`rounded-xl border overflow-hidden relative ${tc.card}`} style={{ backgroundColor: tc.ocean }}>
                    {tooltipFor('bubble')}
                    {yearStamp('bottom-4 left-5')}
                    {renderMap(isoValues, min, max, activeStyle, { id: 'bubble', describe: describePrimary, bubbles: displayValues })}
                  </div>
                </div>,
              )}
              <div className={`rounded-xl border p-3 mt-4 ${tc.card}`}>
                <div className="flex items-center gap-4">
                  <span className={`text-xs ${tc.textSec}`}>Bubble size = magnitude</span>
                  <div className="flex items-center gap-3">
                    {[0.2, 0.5, 1].map(s => (
                      <div key={s} className="flex items-center gap-1">
                        <svg width={Math.max(8, s * 20)} height={Math.max(8, s * 20)}><circle cx={Math.max(4, s * 10)} cy={Math.max(4, s * 10)} r={Math.max(3, s * 9)} fill={isDarkMode ? '#60a5fa' : '#3b82f6'} opacity={0.6} /></svg>
                        <span className={`text-[10px] ${tc.textSec}`}>{s === 0.2 ? 'Low' : s === 0.5 ? 'Mid' : 'High'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {legend}
            </>
          )}

          {/* RANKED BAR RACE VIEW */}
          {viewMode === 'ranked' && withSidePanel(
            <div id={slugify(rankingsTitle)} className={`relative rounded-xl border overflow-hidden p-4 ${tc.card}`}>
              {yearStamp('bottom-4 right-24')}
              <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
                <h3 className="font-semibold">{legendLabel} — Country Rankings ({selectedYear})</h3>
                <div className="flex items-center gap-2 flex-wrap shrink-0" data-export-ignore>
                  <span className={`text-xs ${tc.textSec}`}>{cov.count} countries</span>
                  <SocialShareMenu title={rankingsTitle} isDarkMode={isDarkMode} />
                </div>
              </div>
              <RaceBars
                values={displayValues} min={min} max={max} style={activeStyle} isDarkMode={isDarkMode}
                selected={detailCountry} highlight={highlight} format={fmt} onSelect={toggleDetail}
              />
            </div>,
          )}

          {/* COMPARISON VIEW */}
          {viewMode === 'comparison' && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div className={`flex rounded-lg border overflow-hidden ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`} data-export-ignore>
                  {(['split', 'bivariate'] as const).map(l => (
                    <button key={l} onClick={() => setCompareLayout(l)}
                      className={`px-3 py-1.5 text-sm ${compareLayout === l ? 'bg-blue-600 text-white' : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700')}`}>
                      {l === 'split' ? 'Side by side' : 'Bivariate map'}
                    </button>
                  ))}
                </div>
                {compareLayout === 'bivariate' && <span className={`text-xs ${tc.textSec}`}>One map, two metrics: each country is coloured by which third it falls in for each.</span>}
              </div>

              {compareLayout === 'split' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div id={slugify(compareTitle)} className="relative min-w-0">
                    {shareButton(compareTitle)}
                    <div className={`rounded-xl border overflow-hidden relative ${tc.card}`} style={{ backgroundColor: tc.ocean }}>
                      <div className={`absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg text-xs font-semibold ${isDarkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90 text-gray-900'} shadow`}>
                        {legendLabel}
                      </div>
                      {tooltipFor('left')}
                      {yearStamp('bottom-12 left-4', 'text-4xl sm:text-5xl')}
                      {renderMap(isoValues, min, max, activeStyle, { id: 'left', describe: describePrimary, compact: true })}
                      <div className="px-3 pb-2">
                        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: getGradientCSS(activeStyle, isDarkMode) }} />
                        <div className="flex justify-between mt-1">
                          <span className={`text-[10px] ${tc.textSec}`}>{fmt(min)}</span>
                          <span className={`text-[10px] ${tc.textSec}`}>{fmt(max)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div id={slugify(compareWithTitle)} className="relative min-w-0">
                    {shareButton(compareWithTitle)}
                    <div className={`rounded-xl border overflow-hidden relative ${tc.card}`} style={{ backgroundColor: tc.ocean }}>
                      <div className={`absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg text-xs font-semibold ${isDarkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90 text-gray-900'} shadow`}>
                        {compareMetricDef?.label}
                      </div>
                      {tooltipFor('right')}
                      {yearStamp('bottom-12 left-4', 'text-4xl sm:text-5xl')}
                      {renderMap(compareValues.iso, compareValues.min, compareValues.max, compareStyle, { id: 'right', describe: describeCompare, compact: true })}
                      <div className="px-3 pb-2">
                        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: getGradientCSS(compareStyle, isDarkMode) }} />
                        <div className="flex justify-between mt-1">
                          <span className={`text-[10px] ${tc.textSec}`}>{compareMetricDef ? compareMetricDef.format(compareValues.min) : compareValues.min}</span>
                          <span className={`text-[10px] ${tc.textSec}`}>{compareMetricDef ? compareMetricDef.format(compareValues.max) : compareValues.max}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
                  <div id={slugify(bivariateTitle)} className="relative min-w-0">
                    {shareButton(bivariateTitle)}
                    <div className={`rounded-xl border overflow-hidden relative ${tc.card}`} style={{ backgroundColor: tc.ocean }}>
                      {tooltipFor('bivariate')}
                      {yearStamp('bottom-4 left-5')}
                      {bivariate
                        ? renderMap(bivariate.iso, 0, 1, activeStyle, {
                          id: 'bivariate',
                          describe: describeBoth,
                          fillFor: ck => { const c = bivariate.cls.get(ck); return c ? bivariateColor(c[0], c[1], isDarkMode) : null; },
                        })
                        : <p className={`py-24 text-center text-sm ${tc.textSec}`}>Not enough countries have data for both metrics in {selectedYear}.</p>}
                    </div>
                  </div>
                  <div className={`rounded-xl border p-4 self-start ${tc.card}`}>
                    <p className={`text-xs uppercase tracking-wider mb-3 ${tc.textSec}`}>How to read it</p>
                    <div className="flex items-end gap-2">
                      <span className={`text-[10px] [writing-mode:vertical-rl] rotate-180 ${tc.textSec}`}>{compareMetricDef?.label} &rarr;</span>
                      <div>
                        <div className="grid grid-cols-3 gap-0.5 w-28">
                          {[2, 1, 0].map(yi => [0, 1, 2].map(xi => (
                            <div key={`${xi}${yi}`} className="aspect-square" style={{ backgroundColor: bivariateColor(xi, yi, isDarkMode) }} />
                          )))}
                        </div>
                        <p className={`text-[10px] mt-1 ${tc.textSec}`}>{legendLabel} &rarr;</p>
                      </div>
                    </div>
                    <ul className={`mt-3 space-y-1 text-xs ${tc.textSec}`}>
                      <li><strong className={tc.text}>Dark corner:</strong> high on both</li>
                      <li><strong className={tc.text}>Red:</strong> high {metricLabel.toLowerCase()} only</li>
                      <li><strong className={tc.text}>Blue:</strong> high {compareMetricDef?.label.toLowerCase()} only</li>
                      <li><strong className={tc.text}>Pale:</strong> low on both</li>
                    </ul>
                  </div>
                </div>
              )}
              {belowPanel}
            </>
          )}

          {/* TABLE RANKING VIEW */}
          {viewMode === 'table' && (
            <>
              <div id={slugify(rankingsTitle)} className={`rounded-xl border overflow-hidden ${tc.card}`}>
                <div className={`px-5 py-4 border-b flex items-center justify-between gap-2 flex-wrap ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div>
                    <h3 className="font-semibold">{legendLabel} — Country Rankings ({selectedYear})</h3>
                    <p className={`text-xs mt-0.5 ${tc.textSec}`}>{tableData.length} countries &middot; Click headers to sort &middot; Click a row for details</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap shrink-0" data-export-ignore>
                    <div className={`text-xs px-2.5 py-1 rounded-full font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                      {tableColumns.length + 1} columns
                    </div>
                    <SocialShareMenu title={rankingsTitle} subject="dataset" isDarkMode={isDarkMode} />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={isDarkMode ? 'bg-gray-800/60' : 'bg-gray-50'}>
                        <th className={`text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider ${tc.textSec}`} style={{ width: 50 }}>#</th>
                        <th className={`text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider ${tc.textSec}`} style={{ minWidth: 160 }}>Country</th>
                        {[
                          { key: 'primary', label: valueMode === 'level' ? metricLabel : `${valueMode === 'change' ? 'Change' : '% change'} since ${effectiveBase}`, minWidth: 120 },
                          { key: 'yoy', label: 'YoY', minWidth: 90 },
                          ...tableColumns.slice(1).map(col => ({ key: col.key, label: col.label, minWidth: 110 })),
                        ].map(col => (
                          <th key={col.key}
                            className={`text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider cursor-pointer select-none transition-colors ${tableSortCol === col.key ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : tc.textSec}`}
                            onClick={() => toggleSort(col.key)}
                            style={{ minWidth: col.minWidth }}
                          >
                            <span className="flex items-center justify-end gap-1">
                              {col.label}
                              {tableSortCol === col.key && <span>{tableSortDir === 'desc' ? '\u25BC' : '\u25B2'}</span>}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, idx) => {
                        const isSelected = detailCountry === row.country;
                        const dim = highlight !== null && !highlight.has(row.country);
                        return (
                          <tr
                            key={row.country}
                            onClick={() => toggleDetail(row.country)}
                            className={`cursor-pointer transition-colors ${dim ? 'opacity-30' : ''} ${
                              isSelected
                                ? (isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50')
                                : (isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50')
                            } ${isDarkMode ? 'border-gray-700/50' : 'border-gray-100'} border-b`}
                          >
                            <td className={`px-4 py-3 font-mono text-xs ${tc.textSec}`}>{idx + 1}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <span className="text-base">{row.flag}</span>
                                <span className="font-medium">{row.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-semibold">{fmt(row.values.primary!)}</span>
                              <div className={`mt-1 h-1 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${max === min ? 50 : Math.max(2, ((row.values.primary! - min) / (max - min)) * 100)}%`,
                                    backgroundColor: getHeatmapColor(activeStyle, row.values.primary!, min, max, isDarkMode),
                                  }}
                                />
                              </div>
                            </td>
                            <td className={`px-4 py-3 text-right text-xs font-medium ${
                              row.yoy === null ? (isDarkMode ? 'text-gray-600' : 'text-gray-300')
                              : row.yoy > 0 ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')
                              : row.yoy < 0 ? (isDarkMode ? 'text-red-400' : 'text-red-600')
                              : tc.textSec
                            }`}>
                              {row.yoy !== null ? ((row.yoy > 0 ? '+' : '') + metricDef!.format(row.yoy)) : '\u2014'}
                            </td>
                            {tableColumns.slice(1).map(col => (
                              <td key={col.key} className={`px-4 py-3 text-right ${row.values[col.key] !== null ? '' : (isDarkMode ? 'text-gray-600' : 'text-gray-300')}`}>
                                {row.values[col.key] !== null ? col.format(row.values[col.key]!) : '\u2014'}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {tableData.length === 0 && (
                  <div className={`py-12 text-center ${tc.textSec}`}>No data available for this metric and year.</div>
                )}
              </div>
              {belowPanel}
            </>
          )}

          {/* SCATTER VIEW */}
          {viewMode === 'scatter' && withSidePanel(
            <div id={slugify(scatterTitle)} className={`relative rounded-xl border p-4 ${tc.card}`}>
              {yearStamp('top-20 right-8')}
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-semibold">{scatterTitle}</h3>
                <div data-export-ignore><SocialShareMenu title={scatterTitle} isDarkMode={isDarkMode} /></div>
              </div>
              <ScatterView
                xValues={displayValues}
                yValues={compareValues.vals}
                xLabel={legendLabel}
                yLabel={compareMetricDef?.label ?? compareMetric}
                xFormat={fmt}
                yFormat={v => (compareMetricDef ? compareMetricDef.format(v) : v.toFixed(1))}
                isDarkMode={isDarkMode}
                selected={detailCountry}
                highlight={highlight}
                onSelect={toggleDetail}
              />
            </div>,
          )}

          {/* TILE MAP VIEW */}
          {viewMode === 'tiles' && (
            <>
              {withSidePanel(
                <div id={slugify(tilesTitle)} className={`relative rounded-xl border p-4 ${tc.card}`}>
                  {yearStamp('top-14 right-6')}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{tilesTitle}</h3>
                    <div data-export-ignore><SocialShareMenu title={tilesTitle} isDarkMode={isDarkMode} /></div>
                  </div>
                  <TileMapView
                    values={displayValues} min={min} max={max} style={activeStyle} isDarkMode={isDarkMode}
                    selected={detailCountry} highlight={highlight} label={metricLabel} format={fmt} onSelect={toggleDetail}
                  />
                </div>,
              )}
              {legend}
            </>
          )}

          {/* QUIZ VIEW */}
          {isQuiz && data && (
            <div className={`rounded-xl border p-5 sm:p-8 ${tc.card}`}>
              <QuizView data={data} isDarkMode={isDarkMode} onShowOnMap={showQuizOnMap} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
