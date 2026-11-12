'use client';

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  COMMODITIES,
  KIND_COLOR,
  LINK_KINDS,
  type CategoryId,
  type Commodity,
  type LinkKind,
  type NetworkDataset,
  type TechCompany,
  type TechLink,
} from '../../services/network/types';
import {
  CLUSTER_PREFIX,
  clusterKey,
  clusterLayout,
  formatUsdBn,
  lighten,
  matchesQuery,
  neighbours,
  nodeRadius,
  radialLayout,
  rankBy,
  secondDegree,
  shortName,
  type NodePosition,
} from '../../utils/aiNetwork/network';

const W = 1000;
const H = 660;
const HUB_R = 46;
const TWEEN_MS = 700;
const DEFAULT_RINGS = [0.6, 0.8, 1];
/** Above this many companies on screen, only the important ones get a permanent label. */
const LABEL_ALL_MAX = 70;
const TOP_LABELLED = 15;
const SECOND_EDGE_CAP = 80;
const MIN_VIEW_W = W / 4;
const ZOOM_STEP = 1.3;

interface Props {
  isDarkMode: boolean;
  dataset: NetworkDataset;
  hubId: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRecentre: (id: string) => void;
}

type Point = { x: number; y: number };
type View = { x: number; y: number; w: number };

const FULL_VIEW: View = { x: 0, y: 0, w: W };
const viewH = (v: View) => (v.w * H) / W;

function clampView(v: View): View {
  const w = Math.min(W, Math.max(MIN_VIEW_W, v.w));
  const h = (w * H) / W;
  return { w, x: Math.min(W - w, Math.max(0, v.x)), y: Math.min(H - h, Math.max(0, v.y)) };
}

/**
 * Tweens the graph whenever the target layout changes (re-hub, filter,
 * expand). React renders every element at its final position; this writes
 * intermediate `transform` and `d` attributes straight to the DOM, so a
 * 125-node frame costs no React render. Elements opt in with `data-pos`
 * (nodes) or `data-a`/`data-b`/`data-bend` (edges). New nodes start from
 * `seedOf(id)` when that was on screen, so a sector grows out of its bubble.
 */
function useDomTween(
  svgRef: React.RefObject<SVGSVGElement>,
  targets: Record<string, Point>,
  seedOf: (id: string) => string | undefined,
) {
  const shownRef = useRef<Record<string, Point>>(targets);
  const seedRef = useRef(seedOf);
  seedRef.current = seedOf;

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const from = shownRef.current;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!svg || reduce) {
      shownRef.current = targets;
      return undefined;
    }
    const start: Record<string, Point> = {};
    let moving = false;
    for (const [id, to] of Object.entries(targets)) {
      const seed = seedRef.current(id);
      const f = from[id] ?? (seed ? from[seed] : undefined) ?? { x: W / 2, y: H / 2 };
      start[id] = f;
      if (f.x !== to.x || f.y !== to.y) moving = true;
    }
    if (!moving) {
      shownRef.current = targets;
      return undefined;
    }

    const nodes = [...svg.querySelectorAll<SVGGElement>('[data-pos]')];
    const edges = [...svg.querySelectorAll<SVGPathElement>('path[data-a]')];
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const paint = (k: number) => {
      const cur: Record<string, Point> = {};
      for (const [id, to] of Object.entries(targets)) {
        const f = start[id];
        cur[id] = { x: f.x + (to.x - f.x) * k, y: f.y + (to.y - f.y) * k };
      }
      for (const el of nodes) {
        const p = cur[el.dataset.pos!];
        if (p) el.setAttribute('transform', `translate(${p.x},${p.y})`);
      }
      for (const el of edges) {
        const a = cur[el.dataset.a!];
        const b = cur[el.dataset.b!];
        if (a && b) el.setAttribute('d', edgePath(a, b, Number(el.dataset.bend)));
      }
      shownRef.current = cur;
    };
    paint(0);
    let raf = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      const t = Math.min(1, (now - t0) / TWEEN_MS);
      paint(ease(t));
      if (t < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [targets, svgRef]);
}

function viaLabel(ids: string[], byId: Record<string, TechCompany>): string {
  const names = ids.slice(0, 3).map((id) => (byId[id] ? shortName(byId[id]) : id));
  return ids.length > 3 ? `${names.join(', ')} +${ids.length - 3} more` : names.join(', ');
}

function edgePath(a: Point, b: Point, bend: number): string {
  if (bend === 0) return `M${a.x},${a.y}L${b.x},${b.y}`;
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const cx = mx + (W / 2 - mx) * bend;
  const cy = my + (H / 2 - my) * bend;
  return `M${a.x},${a.y}Q${cx},${cy} ${b.x},${b.y}`;
}

const clusterRadius = (valueUsdBn: number) => Math.min(30, 12 + 4 * Math.log10(1 + valueUsdBn));

// ── Memoised SVG pieces ──────────────────────────────────────────────

interface EdgeProps { a: string; b: string; bend: number; d: string; color: string; opacity: number; width: number; dashed: boolean }

const GraphEdge = React.memo(function GraphEdge({ a, b, bend, d, color, opacity, width, dashed }: EdgeProps) {
  return (
    <path
      data-a={a}
      data-b={b}
      data-bend={bend}
      d={d}
      stroke={color}
      strokeOpacity={opacity}
      strokeWidth={width}
      strokeDasharray={dashed ? '3 3' : undefined}
    />
  );
});

interface NodeProps {
  id: string;
  x: number;
  y: number;
  r: number;
  color: string;
  label: string | null;
  anchor: NodePosition['anchor'];
  opacity: number;
  selected: boolean;
  hovered: boolean;
  bold: boolean;
  ariaLabel: string;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onRecentre: (id: string) => void;
}

const GraphNode = React.memo(function GraphNode({
  id, x, y, r, color, label, anchor, opacity, selected, hovered, bold, ariaLabel, onHover, onSelect, onRecentre,
}: NodeProps) {
  const lx = anchor === 'start' ? r + 5 : anchor === 'end' ? -(r + 5) : 0;
  const ly = anchor === 'middle' ? (y < H / 2 ? -(r + 6) : r + 13) : 3.5;
  return (
    <g
      data-pos={id}
      transform={`translate(${x},${y})`}
      opacity={opacity}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className="cursor-pointer focus:outline-none"
      style={{ transition: 'opacity 200ms' }}
      onMouseEnter={() => onHover(id)}
      onFocus={() => onHover(id)}
      onBlur={() => onHover(null)}
      onClick={() => onSelect(id)}
      onDoubleClick={() => onRecentre(id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(id); } }}
    >
      <circle r={r + 10} fill="transparent" />
      {(selected || hovered) && <circle r={r + 4} fill={color} opacity={0.6} filter="url(#pn-node-glow)" />}
      <circle r={r} fill={color} stroke={selected ? '#ffffff' : '#0b1020'} strokeWidth={selected ? 2 : 1} />
      {label && (
        <text x={lx} y={ly} textAnchor={anchor} fontSize={11} fontWeight={bold ? 700 : 500} fill={selected || hovered ? '#ffffff' : '#d1d5db'}>
          {label}
        </text>
      )}
    </g>
  );
});

interface BubbleProps {
  sectorId: string;
  x: number;
  y: number;
  r: number;
  anchor: NodePosition['anchor'];
  color: string;
  label: string;
  count: number;
  linked: number;
  opacity: number;
  onExpand: (sectorId: string) => void;
  onHover: (id: string | null) => void;
}

const ClusterBubble = React.memo(function ClusterBubble({
  sectorId, x, y, r, anchor, color, label, count, linked, opacity, onExpand, onHover,
}: BubbleProps) {
  // Labels sit on the outer side so bubbles next to each other on the ring don't collide.
  const below = y >= H / 2;
  const tx = anchor === 'start' ? r + 8 : anchor === 'end' ? -(r + 8) : 0;
  const ty1 = anchor === 'middle' ? (below ? r + 15 : -(r + 18)) : -2;
  const ty2 = anchor === 'middle' ? (below ? r + 28 : -(r + 6)) : 11;
  return (
    <g
      data-pos={clusterKey(sectorId)}
      transform={`translate(${x},${y})`}
      opacity={opacity}
      role="button"
      tabIndex={0}
      aria-label={`${label}: ${count} companies, ${linked} linked to the hub. Expand`}
      className="cursor-pointer focus:outline-none"
      style={{ transition: 'opacity 200ms' }}
      onMouseEnter={() => onHover(null)}
      onClick={() => onExpand(sectorId)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onExpand(sectorId); } }}
    >
      <title>{`${label}: ${count} companies. Click to expand`}</title>
      <circle r={r + 8} fill={color} opacity={0.18} filter="url(#pn-node-glow)" />
      <circle r={r} fill={color} fillOpacity={0.28} stroke={color} strokeWidth={1.5} strokeDasharray="4 3" />
      <text textAnchor="middle" y={4} fontSize={12} fontWeight={800} fill="#ffffff">{count}</text>
      <text textAnchor={anchor} x={tx} y={ty1} fontSize={11} fontWeight={700} fill={lighten(color, 0.35)}>
        {label}
      </text>
      <text textAnchor={anchor} x={tx} y={ty2} fontSize={10} fill="#9ca3af">
        {linked > 0 ? `${linked} linked · expand` : 'expand'}
      </text>
    </g>
  );
});

// ── Graph ────────────────────────────────────────────────────────────

type Layer = 'hub' | 'second' | 'focus' | 'all' | 'commodity';
interface Edge { key: string; a: string; b: string; kind: LinkKind; bend: number; layer: Layer; linkIds: Set<string> }

export default function PowerNetworkGraph({
  isDarkMode, dataset, hubId, selectedId, onSelect, onRecentre,
}: Props) {
  const { companies, links, categories, sectors, categoryById: CATEGORY_BY_ID } = dataset;
  const clustered = !!sectors?.length;
  const categoryOrder = useMemo(() => categories.map((c) => c.id), [categories]);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [hiddenCats, setHiddenCats] = useState<Set<CategoryId>>(new Set());
  const [activeKinds, setActiveKinds] = useState<Set<LinkKind>>(new Set(LINK_KINDS.map((k) => k.id)));
  const [showAllLinks, setShowAllLinks] = useState(false);
  const [showSecond, setShowSecond] = useState(true);
  const [query, setQuery] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'graph'>('list');
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());
  const [commodity, setCommodity] = useState<Commodity | null>(null);
  const [view, setView] = useState<View>(FULL_VIEW);

  const kinds = useMemo(() => [...activeKinds], [activeKinds]);
  const byId = dataset.companyById;
  const hub = byId[hubId];

  const sectorOfCategory = useMemo(
    () => new Map((sectors ?? []).flatMap((s) => s.categoryIds.map((c) => [c, s.id] as const))),
    [sectors],
  );
  const sectorById = useMemo(() => new Map((sectors ?? []).map((s) => [s.id, s])), [sectors]);
  const hubSectorId = hub ? sectorOfCategory.get(hub.category) : undefined;

  const commodityOptions = useMemo(
    () => COMMODITIES.filter((c) => links.some((l) => l.commodity === c.id)),
    [links],
  );
  const commodityLinks = useMemo(
    () => (commodity ? links.filter((l) => l.commodity === commodity && activeKinds.has(l.kind)) : []),
    [links, commodity, activeKinds],
  );
  const commodityIds = useMemo(
    () => new Set(commodityLinks.flatMap((l) => [l.source, l.target])),
    [commodityLinks],
  );

  const visible = useMemo(
    () => companies.filter((c) => c.id === hubId || !hiddenCats.has(c.category)),
    [companies, hiddenCats, hubId],
  );
  const visibleIds = useMemo(() => new Set(visible.map((c) => c.id)), [visible]);

  // A commodity view opens every sector its flows touch.
  const effectiveExpanded = useMemo(() => {
    const s = new Set(expandedSectors);
    for (const id of commodityIds) {
      const sec = byId[id] && sectorOfCategory.get(byId[id].category);
      if (sec) s.add(sec);
    }
    return s;
  }, [expandedSectors, commodityIds, byId, sectorOfCategory]);

  const cluster = useMemo(
    () => (clustered ? clusterLayout(visible, sectors!, effectiveExpanded, hubId, W, H) : null),
    [clustered, visible, sectors, effectiveExpanded, hubId],
  );
  const layout = useMemo<Record<string, NodePosition>>(
    () => cluster?.nodes ?? radialLayout(visible, hubId, W, H, { spreadX: 0.74, spreadY: 0.8, categoryOrder }),
    [cluster, visible, hubId, categoryOrder],
  );
  const clusters = useMemo(() => cluster?.clusters ?? [], [cluster]);
  const rings = cluster?.rings ?? DEFAULT_RINGS;

  const targets = useMemo<Record<string, Point>>(
    () => ({ ...layout, ...Object.fromEntries(clusters.map((k) => [k.key, k])) }),
    [layout, clusters],
  );
  const seedOf = useCallback((id: string) => {
    if (id.startsWith(CLUSTER_PREFIX)) return clusters.find((k) => k.key === id)?.memberIds[0];
    const sec = byId[id] && sectorOfCategory.get(byId[id].category);
    return sec ? clusterKey(sec) : undefined;
  }, [clusters, byId, sectorOfCategory]);
  const svgRef = useRef<SVGSVGElement>(null);
  useDomTween(svgRef, targets, seedOf);
  const pos = targets;

  /** Where a company is drawn right now: itself, its sector bubble, or nowhere. */
  const anchorOf = useCallback(
    (id: string): string | undefined => (cluster ? cluster.anchorOf[id] : visibleIds.has(id) ? id : undefined),
    [cluster, visibleIds],
  );

  const hubRelations = useMemo(() => neighbours(links, hubId, kinds), [links, hubId, kinds]);
  const hubNeighbourIds = useMemo(() => new Set(hubRelations.map((r) => r.id)), [hubRelations]);
  const secondVia = useMemo(() => secondDegree(links, hubId, kinds), [links, hubId, kinds]);
  const secondCount = Object.keys(secondVia).length;

  const focusId = hoverId ?? (selectedId && selectedId !== hubId ? selectedId : null);
  const focusIds = useMemo(() => {
    if (!focusId) return null;
    return new Set([focusId, ...neighbours(links, focusId, kinds).map((r) => r.id)]);
  }, [focusId, links, kinds]);

  const matches = useMemo(
    () => (query.trim() ? companies.filter((c) => matchesQuery(c, query)) : []),
    [companies, query],
  );
  const matchIds = useMemo(() => new Set(matches.map((c) => c.id)), [matches]);

  const nodeOpacity = (id: string): number => {
    if (id === hubId) return 1;
    if (focusIds) return focusIds.has(id) ? 1 : 0.18;
    if (matchIds.size) return matchIds.has(id) ? 1 : 0.18;
    if (commodity) return commodityIds.has(id) ? 1 : 0.15;
    if (hubNeighbourIds.has(id)) return 1;
    if (!showSecond) return 0.42;
    return secondVia[id] ? 0.7 : 0.25;
  };

  // Each pair can carry several link kinds; bend the extra ones so they stay
  // visible. Links into a collapsed sector merge into one thicker line.
  const edges = useMemo(() => {
    const byKey = new Map<string, Edge>();
    const kindsPerPair = new Map<string, number>();
    const list: Edge[] = [];
    const push = (l: TechLink, layer: Layer) => {
      if (!activeKinds.has(l.kind)) return;
      const a = anchorOf(l.source);
      const b = anchorOf(l.target);
      if (!a || !b || a === b) return;
      const pair = [a, b].sort().join('|');
      const key = `${pair}|${l.kind}`;
      const linkId = `${l.source}|${l.target}|${l.kind}`;
      const existing = byKey.get(key);
      if (existing) {
        existing.linkIds.add(linkId);
        return;
      }
      const n = kindsPerPair.get(pair) ?? 0;
      kindsPerPair.set(pair, n + 1);
      const touchesHub = a === hubId || b === hubId;
      const edge: Edge = { key, a, b, kind: l.kind, bend: touchesHub ? n * 0.14 : 0.3 + n * 0.12, layer, linkIds: new Set([linkId]) };
      byKey.set(key, edge);
      list.push(edge);
    };

    if (commodity) {
      for (const l of commodityLinks) push(l, 'commodity');
    } else {
      for (const l of links) if (l.source === hubId || l.target === hubId) push(l, 'hub');
      if (showSecond) {
        let second = links.filter((l) =>
          (hubNeighbourIds.has(l.source) && secondVia[l.target]) || (hubNeighbourIds.has(l.target) && secondVia[l.source]));
        if (clustered) {
          const far = (l: TechLink) => byId[secondVia[l.target] ? l.target : l.source]?.valueUsdBn ?? 0;
          second = [...second].sort((x, y) => far(y) - far(x)).slice(0, SECOND_EDGE_CAP);
        }
        for (const l of second) push(l, 'second');
      }
    }
    if (focusId) for (const l of links) if (l.source === focusId || l.target === focusId) push(l, 'focus');
    if (showAllLinks && !commodity) for (const l of links) push(l, 'all');
    return list;
  }, [links, hubId, focusId, showAllLinks, showSecond, activeKinds, hubNeighbourIds, secondVia, anchorOf,
    commodity, commodityLinks, clustered, byId]);

  const onScreen = Object.keys(layout).length;
  const labelled = useMemo(() => {
    if (onScreen <= LABEL_ALL_MAX) return null;
    const s = new Set<string>([hubId, ...hubNeighbourIds, ...matchIds, ...commodityIds]);
    if (selectedId) s.add(selectedId);
    const shown = visible.filter((c) => layout[c.id]);
    for (const c of rankBy(shown, 'value').slice(0, TOP_LABELLED)) s.add(c.id);
    return s;
  }, [onScreen, hubId, hubNeighbourIds, matchIds, commodityIds, selectedId, visible, layout]);

  const toggleCat = (id: CategoryId) => setHiddenCats((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const toggleKind = (id: LinkKind) => setActiveKinds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) {
      if (next.size > 1) next.delete(id);
    } else next.add(id);
    return next;
  });
  const toggleSector = (id: string) => setExpandedSectors((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const expandSector = useCallback((id: string) => {
    setExpandedSectors((prev) => new Set(prev).add(id));
  }, []);

  // ── Zoom and pan (view box) ─────────────────────────────────────────
  const dragRef = useRef<{ px: number; py: number; view: View; moved: boolean } | null>(null);
  const pannedRef = useRef(false);
  const zoomed = view.w < W - 0.5;

  const zoomBy = (factor: number) => setView((v) => {
    const w = Math.min(W, Math.max(MIN_VIEW_W, v.w / factor));
    const cx = v.x + v.w / 2;
    const cy = v.y + viewH(v) / 2;
    return clampView({ w, x: cx - w / 2, y: cy - (w * H) / W / 2 });
  });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !clustered) return undefined;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const fx = (e.clientX - rect.left) / rect.width;
      const fy = (e.clientY - rect.top) / rect.height;
      const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      setView((v) => {
        const w = Math.min(W, Math.max(MIN_VIEW_W, v.w / factor));
        const px = v.x + fx * v.w;
        const py = v.y + fy * viewH(v);
        return clampView({ w, x: px - fx * w, y: py - fy * ((w * H) / W) });
      });
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [clustered]);

  // Keep the zoom level but bring the new hub back to the middle.
  useEffect(() => {
    setView((v) => (v.w >= W ? v : clampView({ w: v.w, x: (W - v.w) / 2, y: (H - viewH(v)) / 2 })));
  }, [hubId]);

  const endDrag = () => {
    dragRef.current = null;
    window.setTimeout(() => { pannedRef.current = false; }, 0);
  };

  // Stable handlers so memoised nodes only re-render when their own props change.
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onRecentreRef = useRef(onRecentre);
  onRecentreRef.current = onRecentre;
  const select = useCallback((id: string) => { if (!pannedRef.current) onSelectRef.current(id); }, []);
  const recentre = useCallback((id: string) => { if (!pannedRef.current) onRecentreRef.current(id); }, []);
  const expand = useCallback((id: string) => { if (!pannedRef.current) expandSector(id); }, [expandSector]);

  const hoverCompany = hoverId ? byId[hoverId] : null;
  const hoverPos = hoverId ? pos[hoverId] : null;
  const hoverHubNotes = hoverId && hoverId !== hubId
    ? links.filter((l) => (l.source === hoverId && l.target === hubId) || (l.target === hoverId && l.source === hubId))
    : [];
  const hoverVia = hoverId ? secondVia[hoverId] ?? [] : [];

  const chip = (on: boolean) => `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
    on
      ? isDarkMode ? 'bg-gray-700 border-gray-500 text-gray-100' : 'bg-gray-900 border-gray-900 text-white'
      : isDarkMode ? 'border-gray-700 text-gray-500 hover:text-gray-300' : 'border-gray-300 text-gray-400 hover:text-gray-600'
  }`;
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const zoomBtn = 'w-7 h-7 flex items-center justify-center rounded-md border border-gray-600 bg-gray-900/80 text-gray-200 text-sm font-semibold hover:bg-gray-800 disabled:opacity-40';

  const hubColor = hub ? CATEGORY_BY_ID[hub.category].color : '#22c55e';
  const vh = viewH(view);
  const focusAnchor = focusId ? anchorOf(focusId) ?? null : null;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && matches[0]) onSelect(matches[0].id);
              if (e.key === 'Escape') setQuery('');
            }}
            placeholder="Find a company or ticker"
            aria-label="Search companies"
            className={`w-56 px-3 py-1.5 rounded-md text-sm border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
              isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />
          {query.trim() && (
            <span className={`ml-2 text-xs ${muted}`}>
              {matches.length ? `${matches.length} match${matches.length > 1 ? 'es' : ''}, Enter to open` : 'No match'}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Link types">
          {LINK_KINDS.map((k) => (
            <button key={k.id} type="button" onClick={() => toggleKind(k.id)} aria-pressed={activeKinds.has(k.id)} className={chip(activeKinds.has(k.id))}>
              <span className="w-3 h-0.5 rounded" style={{ background: k.color }} />
              {k.label}
            </button>
          ))}
          <button type="button" onClick={() => setShowAllLinks((v) => !v)} aria-pressed={showAllLinks} className={chip(showAllLinks)}>
            All links
          </button>
          <button
            type="button"
            onClick={() => setShowSecond((v) => !v)}
            aria-pressed={showSecond}
            className={chip(showSecond)}
            title="Companies two steps from the hub, linked through one of its direct partners"
          >
            <span className="w-3 border-t border-dashed border-current opacity-70" />
            Second-hand links
          </button>
        </div>
      </div>

      {/* Sector clusters */}
      {clustered && (
        <div className="flex flex-wrap items-center gap-1.5 mb-2" role="group" aria-label="Expand or collapse sectors">
          <span className={`text-xs font-semibold mr-1 ${muted}`}>Sectors</span>
          {sectors!.map((s) => {
            const isHubSector = s.id === hubSectorId;
            const on = isHubSector || effectiveExpanded.has(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSector(s.id)}
                disabled={isHubSector}
                aria-pressed={on}
                title={isHubSector ? 'The hub’s own sector is always expanded' : on ? 'Collapse into one bubble' : 'Expand into companies'}
                className={`${chip(on)} disabled:cursor-default`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                {s.label}
              </button>
            );
          })}
          <button type="button" onClick={() => setExpandedSectors(new Set(sectors!.map((s) => s.id)))} className={`text-xs underline ml-1 ${muted}`}>
            Expand all
          </button>
          <button type="button" onClick={() => setExpandedSectors(new Set())} className={`text-xs underline ${muted}`}>
            Collapse all
          </button>
        </div>
      )}

      {/* Commodity flows */}
      {commodityOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3" role="group" aria-label="Show one commodity flow">
          <span className={`text-xs font-semibold mr-1 ${muted}`}>Physical flows</span>
          {commodityOptions.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCommodity((cur) => (cur === c.id ? null : c.id))}
              aria-pressed={commodity === c.id}
              className={chip(commodity === c.id)}
            >
              {c.label}
            </button>
          ))}
          {commodity && (
            <span className={`text-xs ${muted}`}>
              {commodityLinks.length} link{commodityLinks.length === 1 ? '' : 's'} across {commodityIds.size} companies
            </span>
          )}
        </div>
      )}

      {/* Mobile view switch */}
      <div className="sm:hidden flex gap-1 mb-3" role="tablist" aria-label="Network view">
        {(['list', 'graph'] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={mobileView === v}
            onClick={() => setMobileView(v)}
            className={chip(mobileView === v)}
          >
            {v === 'list' ? 'List' : 'Graph'}
          </button>
        ))}
      </div>

      {/* Graph */}
      <div
        className={`${mobileView === 'graph' ? 'block' : 'hidden sm:block'} relative rounded-xl overflow-hidden border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-800'
        }`}
        style={{ background: 'radial-gradient(ellipse at center, #111a33 0%, #070b18 60%, #03050c 100%)' }}
      >
        <svg
          ref={svgRef}
          viewBox={`${view.x} ${view.y} ${view.w} ${vh}`}
          className={`w-full h-auto block select-none ${zoomed ? 'cursor-grab active:cursor-grabbing' : ''}`}
          style={{ touchAction: zoomed ? 'none' : undefined }}
          role="img"
          aria-label={`Network of ${visible.length} companies centred on ${hub?.name ?? hubId}: ${hubNeighbourIds.size} direct and ${secondCount} second-hand connections`}
          onMouseLeave={() => setHoverId(null)}
          onPointerDown={(e) => {
            if (!zoomed) return;
            dragRef.current = { px: e.clientX, py: e.clientY, view, moved: false };
          }}
          onPointerMove={(e) => {
            const d = dragRef.current;
            if (!d) return;
            const dx = e.clientX - d.px;
            const dy = e.clientY - d.py;
            if (!d.moved && Math.hypot(dx, dy) < 4) return;
            d.moved = true;
            pannedRef.current = true;
            const rect = svgRef.current!.getBoundingClientRect();
            const k = d.view.w / rect.width;
            setView(clampView({ w: d.view.w, x: d.view.x - dx * k, y: d.view.y - dy * k }));
          }}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          <defs>
            <radialGradient id="pn-hub-fill" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor={lighten(hubColor, 0.35)} />
              <stop offset="100%" stopColor={hubColor} />
            </radialGradient>
            <filter id="pn-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
            <filter id="pn-node-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          {/* Faint ring guides */}
          {rings.map((r) => (
            <ellipse key={r} cx={W / 2} cy={H / 2} rx={(W / 2) * 0.74 * r} ry={(H / 2) * 0.8 * r} fill="none" stroke="#ffffff" strokeOpacity={0.04} />
          ))}

          {/* Edges */}
          <g fill="none">
            {edges.map((e) => {
              const a = pos[e.a];
              const b = pos[e.b];
              if (!a || !b) return null;
              const isFocus = focusAnchor != null && (e.a === focusAnchor || e.b === focusAnchor);
              const faint = e.layer === 'second' && !isFocus;
              const opacity = e.layer === 'all' && !isFocus
                ? 0.1
                : focusId
                  ? isFocus ? 0.9 : faint ? 0.04 : 0.08
                  : matchIds.size
                    ? matchIds.has(e.a) || matchIds.has(e.b) ? 0.7 : 0.1
                    : e.layer === 'commodity' ? 0.75 : faint ? 0.2 : 0.38;
              const count = e.linkIds.size;
              const base = isFocus ? 1.6 : faint ? 0.8 : e.layer === 'commodity' ? 1.4 : 1;
              return (
                <GraphEdge
                  key={`${e.key}|${e.layer}`}
                  a={e.a}
                  b={e.b}
                  bend={e.bend}
                  d={edgePath(a, b, e.bend)}
                  color={KIND_COLOR[e.kind]}
                  opacity={opacity}
                  width={count > 1 ? Math.min(base + (count - 1) * (faint ? 0.2 : 0.7), faint ? 2 : 6) : base}
                  dashed={faint}
                />
              );
            })}
          </g>

          {/* Collapsed sectors */}
          {clusters.map((k) => {
            const p = pos[k.key];
            const s = sectorById.get(k.sectorId);
            if (!p || !s) return null;
            const linked = k.memberIds.filter((id) => hubNeighbourIds.has(id)).length;
            const lit = focusIds
              ? k.memberIds.some((id) => focusIds.has(id))
              : matchIds.size
                ? k.memberIds.some((id) => matchIds.has(id))
                : linked > 0;
            return (
              <ClusterBubble
                key={k.key}
                sectorId={k.sectorId}
                x={p.x}
                y={p.y}
                r={clusterRadius(k.valueUsdBn)}
                anchor={k.anchor}
                color={s.color}
                label={s.label}
                count={k.memberIds.length}
                linked={linked}
                opacity={lit ? 1 : 0.55}
                onExpand={expand}
                onHover={setHoverId}
              />
            );
          })}

          {/* Hub */}
          {hub && pos[hub.id] && (
            <g
              data-pos={hub.id}
              transform={`translate(${pos[hub.id].x},${pos[hub.id].y})`}
              role="button"
              tabIndex={0}
              aria-label={`${hub.name}, current hub. Open profile`}
              className="cursor-pointer focus:outline-none"
              onClick={() => select(hub.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(hub.id); } }}
              onMouseEnter={() => setHoverId(null)}
            >
              <circle r={HUB_R + 14} fill={hubColor} opacity={0.45} filter="url(#pn-glow)" />
              <circle r={HUB_R} fill="url(#pn-hub-fill)" stroke={lighten(hubColor, 0.6)} strokeWidth={selectedId === hub.id ? 3 : 1.5} />
              <text textAnchor="middle" y={-6} fontSize={shortName(hub).length > 9 ? 13 : 16} fontWeight={800} fill="#05110a">
                {shortName(hub)}
              </text>
              <text textAnchor="middle" y={11} fontSize={10} fontWeight={600} fill="#05110a" opacity={0.8}>
                {hubNeighbourIds.size} direct
              </text>
              <text textAnchor="middle" y={23} fontSize={10} fontWeight={600} fill="#05110a" opacity={0.65}>
                {secondCount} indirect
              </text>
            </g>
          )}

          {/* Nodes */}
          {visible.map((c) => {
            if (c.id === hubId) return null;
            const p = pos[c.id];
            const lp = layout[c.id];
            if (!p || !lp) return null;
            const isSel = selectedId === c.id;
            const isHover = hoverId === c.id;
            const showLabel = !labelled || labelled.has(c.id) || isHover;
            return (
              <GraphNode
                key={c.id}
                id={c.id}
                x={p.x}
                y={p.y}
                r={nodeRadius(c.valueUsdBn)}
                color={CATEGORY_BY_ID[c.category].color}
                label={showLabel ? shortName(c) : null}
                anchor={lp.anchor}
                opacity={nodeOpacity(c.id)}
                selected={isSel}
                hovered={isHover}
                bold={isSel || isHover || matchIds.has(c.id)}
                ariaLabel={`${c.name}, ${CATEGORY_BY_ID[c.category].label}. Open profile`}
                onHover={setHoverId}
                onSelect={select}
                onRecentre={recentre}
              />
            );
          })}
        </svg>

        {/* Hover card */}
        {hoverCompany && hoverPos && layout[hoverCompany.id] && (
          <div
            className="pointer-events-none absolute z-10 w-64 rounded-lg border border-gray-600 bg-gray-900/95 p-3 text-xs text-gray-200 shadow-xl"
            style={{
              left: `${((hoverPos.x - view.x) / view.w) * 100}%`,
              top: `${((hoverPos.y - view.y) / vh) * 100}%`,
              transform: `translate(${hoverPos.x > view.x + view.w / 2 ? 'calc(-100% - 14px)' : '14px'}, ${
                hoverPos.y > view.y + vh / 2 ? 'calc(-100% - 8px)' : '8px'})`,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_BY_ID[hoverCompany.category].color }} />
              <span className="font-semibold text-sm text-white">{hoverCompany.name}</span>
            </div>
            <div className="text-gray-400 mb-1.5">
              {CATEGORY_BY_ID[hoverCompany.category].label} · {formatUsdBn(hoverCompany.valueUsdBn)} value
            </div>
            <p className="leading-snug">{hoverCompany.oneLiner}</p>
            {hoverHubNotes.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700 space-y-1">
                {hoverHubNotes.map((l) => (
                  <p key={`${l.source}-${l.target}-${l.kind}`} className="leading-snug">
                    <span className="font-semibold" style={{ color: KIND_COLOR[l.kind] }}>
                      {LINK_KINDS.find((k) => k.id === l.kind)?.label}:
                    </span>{' '}
                    {l.note}
                  </p>
                ))}
              </div>
            )}
            {hoverVia.length > 0 && hub && (
              <p className="mt-2 pt-2 border-t border-gray-700 leading-snug">
                <span className="text-gray-400">Linked to {shortName(hub)} via </span>
                <span className="font-semibold text-white">{viaLabel(hoverVia, byId)}</span>
              </p>
            )}
            <p className="mt-2 text-gray-500">Click for profile · double-click to centre</p>
          </div>
        )}

        <p className="hidden sm:block absolute top-2 left-3 text-[11px] text-gray-500">
          Dot size = market value (log scale) · hover to trace links
          {clustered && ' · click a sector bubble to expand · Ctrl/⌘ + scroll to zoom'}
        </p>

        {clustered && (
          <div className="absolute top-2 right-2 flex flex-col gap-1" role="group" aria-label="Zoom">
            <button type="button" className={zoomBtn} onClick={() => zoomBy(ZOOM_STEP)} disabled={view.w <= MIN_VIEW_W + 0.5} aria-label="Zoom in">+</button>
            <button type="button" className={zoomBtn} onClick={() => zoomBy(1 / ZOOM_STEP)} disabled={!zoomed} aria-label="Zoom out">−</button>
            <button type="button" className={`${zoomBtn} text-[10px]`} onClick={() => setView(FULL_VIEW)} disabled={!zoomed} aria-label="Reset zoom" title="Reset zoom">
              1:1
            </button>
          </div>
        )}
      </div>

      {/* Mobile list */}
      <div className={`${mobileView === 'list' ? 'sm:hidden' : 'hidden'} space-y-4`}>
        <p className={`text-sm ${muted}`}>
          Hub: <span className="font-semibold">{hub?.name}</span>, {hubNeighbourIds.size} direct and {secondCount} second-hand
          connections. Tap a company for its profile.
        </p>
        {categories.filter((cat) => !hiddenCats.has(cat.id)).map((cat) => {
          const members = companies.filter((c) => c.category === cat.id && (!query.trim() || matchIds.has(c.id)));
          if (!members.length) return null;
          return (
            <div key={cat.id}>
              <h4 className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: cat.color }}>{cat.label}</h4>
              <ul className={`rounded-lg border divide-y ${isDarkMode ? 'border-gray-700 divide-gray-700' : 'border-gray-200 divide-gray-200'}`}>
                {members.map((c) => {
                  const rel = hubRelations.filter((r) => r.id === c.id);
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(c.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm ${
                          selectedId === c.id ? (isDarkMode ? 'bg-gray-700' : 'bg-violet-50') : ''
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                        <span className="flex-1 min-w-0">
                          <span className="font-medium">{c.id === hubId ? `${c.name} (hub)` : c.name}</span>
                          {showSecond && secondVia[c.id] && (
                            <span className={`block text-[11px] truncate ${muted}`}>via {viaLabel(secondVia[c.id], byId)}</span>
                          )}
                        </span>
                        {rel.map((r) => (
                          <span key={r.kind + r.direction} className="w-2 h-2 rounded-full" style={{ background: KIND_COLOR[r.kind] }} title={r.kind} />
                        ))}
                        <span className={`text-xs tabular-nums ${muted}`}>{formatUsdBn(c.valueUsdBn)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Category legend */}
      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Show or hide categories">
        {categories.map((cat) => {
          const on = !hiddenCats.has(cat.id);
          const count = companies.filter((c) => c.category === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCat(cat.id)}
              aria-pressed={on}
              title={cat.description}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide border transition-opacity ${
                on ? '' : 'opacity-40'
              } ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              style={{ color: on ? cat.color : undefined }}
            >
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: cat.color }} />
              <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{cat.label}</span>
              <span className={muted}>{count}</span>
            </button>
          );
        })}
        {hiddenCats.size > 0 && (
          <button type="button" onClick={() => setHiddenCats(new Set())} className={`text-xs underline ${muted}`}>
            Show all
          </button>
        )}
      </div>
    </div>
  );
}
