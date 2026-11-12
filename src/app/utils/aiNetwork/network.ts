// Pure graph and layout helpers for the power-network chapters. No React, so
// the layout can be unit-tested and reused by the list view and exports.

import type { CategoryId, Commodity, LinkKind, TechCompany, TechLink } from '../../services/network/types';

export interface NodePosition {
  x: number;
  y: number;
  /** Radians, 0 = 12 o'clock, increasing clockwise. */
  angle: number;
  ring: number;
  anchor: 'start' | 'end' | 'middle';
}

export interface LayoutOptions {
  /** Relative radii of the rings, outermost = 1. */
  rings?: number[];
  /** Fraction of the half-width/half-height used by the outer ring. */
  spreadX?: number;
  spreadY?: number;
  /** Angular gap between category sectors, in radians. */
  categoryGap?: number;
  /** Order categories are walked clockwise; defaults to first appearance in `companies`. */
  categoryOrder?: CategoryId[];
}

function orderOf(companies: TechCompany[], categoryOrder?: CategoryId[]): CategoryId[] {
  if (categoryOrder) return categoryOrder;
  return [...new Set(companies.map((c) => c.category))];
}

/**
 * Hub in the centre, every other company on concentric ellipses. Each
 * category owns a contiguous angular sector sized by its member count, and
 * members alternate between rings so neighbours on the same ring are spaced
 * out enough for their labels.
 */
export function radialLayout(
  companies: TechCompany[],
  hubId: string,
  width: number,
  height: number,
  { rings = [0.6, 0.8, 1], spreadX = 0.8, spreadY = 0.8, categoryGap = 0.07, categoryOrder }: LayoutOptions = {},
): Record<string, NodePosition> {
  const cx = width / 2;
  const cy = height / 2;
  const out: Record<string, NodePosition> = {};
  const order = orderOf(companies, categoryOrder);

  const hub = companies.find((c) => c.id === hubId);
  if (hub) out[hub.id] = { x: cx, y: cy, angle: 0, ring: -1, anchor: 'middle' };

  const others = companies
    .filter((c) => c.id !== hubId)
    .sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category) || byValueThenName(a, b));
  if (others.length === 0) return out;

  const groups = order
    .map((id) => others.filter((c) => c.category === id))
    .filter((g) => g.length > 0);
  const gapTotal = categoryGap * groups.length;
  const step = (Math.PI * 2 - gapTotal) / others.length;

  const rx = (width / 2) * spreadX;
  const ry = (height / 2) * spreadY;
  let angle = categoryGap / 2;
  let slot = 0;
  for (const group of groups) {
    for (const company of group) {
      const a = angle + step / 2;
      const ring = slot % rings.length;
      const r = rings[ring];
      const x = cx + Math.sin(a) * rx * r;
      const y = cy - Math.cos(a) * ry * r;
      const dx = x - cx;
      out[company.id] = {
        x,
        y,
        angle: a,
        ring,
        anchor: Math.abs(dx) < rx * 0.08 ? 'middle' : dx > 0 ? 'start' : 'end',
      };
      angle += step;
      slot += 1;
    }
    angle += categoryGap;
  }
  return out;
}

/** Ring radii for the number of companies on screen; more rings keep large networks spaced out. */
export function ringsFor(visibleCount: number): number[] {
  if (visibleCount <= 70) return [0.6, 0.8, 1];
  if (visibleCount <= 100) return [0.52, 0.68, 0.84, 1];
  return [0.44, 0.58, 0.72, 0.86, 1];
}

export const CLUSTER_PREFIX = 'sector:';
export const clusterKey = (sectorId: string) => `${CLUSTER_PREFIX}${sectorId}`;

export interface ClusterNode extends NodePosition {
  key: string;
  sectorId: string;
  memberIds: string[];
  valueUsdBn: number;
}

export interface ClusterLayout {
  /** Positions of the hub and of every company in an expanded sector. */
  nodes: Record<string, NodePosition>;
  /** One bubble per collapsed sector that has visible members. */
  clusters: ClusterNode[];
  /** Where each visible company is drawn: its own id, or its sector's cluster key. */
  anchorOf: Record<string, string>;
  /** Sectors actually expanded, always including the hub's. */
  expanded: Set<string>;
  rings: number[];
}

export interface ClusterLayoutOptions {
  spreadX?: number;
  spreadY?: number;
  categoryGap?: number;
  /** Angular width of a collapsed sector, in company slots. */
  clusterSlots?: number;
  /** Relative radius of the ring that cluster bubbles sit on. */
  clusterRing?: number;
}

/**
 * Like radialLayout, but companies in collapsed sectors are folded into one
 * bubble per sector. The hub's sector is always expanded. Sectors keep their
 * order around the ellipse, so expanding one only widens its own arc.
 */
export function clusterLayout(
  companies: TechCompany[],
  sectors: { id: string; categoryIds: CategoryId[] }[],
  expandedIds: Iterable<string>,
  hubId: string,
  width: number,
  height: number,
  { spreadX = 0.74, spreadY = 0.8, categoryGap = 0.06, clusterSlots = 2.5, clusterRing = 0.78 }: ClusterLayoutOptions = {},
): ClusterLayout {
  const cx = width / 2;
  const cy = height / 2;
  const rx = (width / 2) * spreadX;
  const ry = (height / 2) * spreadY;
  const sectorOf = new Map(sectors.flatMap((s) => s.categoryIds.map((c) => [c, s.id] as const)));
  const catOrder = sectors.flatMap((s) => s.categoryIds);

  const hub = companies.find((c) => c.id === hubId);
  const expanded = new Set(expandedIds);
  if (hub) expanded.add(sectorOf.get(hub.category) ?? hub.category);

  type Item = { kind: 'group'; members: TechCompany[] } | { kind: 'cluster'; sectorId: string; members: TechCompany[] };
  const items: Item[] = [];
  for (const s of sectors) {
    const members = stackOrder(companies.filter((c) => c.id !== hubId && sectorOf.get(c.category) === s.id), catOrder);
    if (!members.length) continue;
    if (expanded.has(s.id)) {
      for (const cat of s.categoryIds) {
        const group = members.filter((c) => c.category === cat);
        if (group.length) items.push({ kind: 'group', members: group });
      }
    } else {
      items.push({ kind: 'cluster', sectorId: s.id, members });
    }
  }

  const companyCount = items.reduce((n, it) => n + (it.kind === 'group' ? it.members.length : 0), 0);
  const rings = ringsFor(companyCount + (hub ? 1 : 0));
  const nodes: Record<string, NodePosition> = {};
  const clusters: ClusterNode[] = [];
  const anchorOf: Record<string, string> = {};
  if (hub) {
    nodes[hub.id] = { x: cx, y: cy, angle: 0, ring: -1, anchor: 'middle' };
    anchorOf[hub.id] = hub.id;
  }
  if (!items.length) return { nodes, clusters, anchorOf, expanded, rings };

  const units = items.reduce((n, it) => n + (it.kind === 'group' ? it.members.length : clusterSlots), 0);
  const step = (Math.PI * 2 - categoryGap * items.length) / units;
  const place = (a: number, r: number): NodePosition => {
    const x = cx + Math.sin(a) * rx * r;
    const y = cy - Math.cos(a) * ry * r;
    const dx = x - cx;
    return { x, y, angle: a, ring: 0, anchor: Math.abs(dx) < rx * 0.08 ? 'middle' : dx > 0 ? 'start' : 'end' };
  };

  let angle = categoryGap / 2;
  let slot = 0;
  for (const it of items) {
    if (it.kind === 'group') {
      for (const c of it.members) {
        const ring = slot % rings.length;
        nodes[c.id] = { ...place(angle + step / 2, rings[ring]), ring };
        anchorOf[c.id] = c.id;
        angle += step;
        slot += 1;
      }
    } else {
      const key = clusterKey(it.sectorId);
      clusters.push({
        ...place(angle + (step * clusterSlots) / 2, clusterRing),
        key,
        sectorId: it.sectorId,
        memberIds: it.members.map((c) => c.id),
        valueUsdBn: it.members.reduce((s, c) => s + (c.valueUsdBn ?? 0), 0),
      });
      for (const c of it.members) anchorOf[c.id] = key;
      angle += step * clusterSlots;
    }
    angle += categoryGap;
  }
  return { nodes, clusters, anchorOf, expanded, rings };
}

export function byValueThenName(a: TechCompany, b: TechCompany): number {
  return (b.valueUsdBn ?? 0) - (a.valueUsdBn ?? 0) || a.name.localeCompare(b.name);
}

/** Companies in stack order: by category order, then by value. */
export function stackOrder(companies: TechCompany[], categoryOrder: CategoryId[]): TechCompany[] {
  return [...companies].sort((a, b) =>
    categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category) || byValueThenName(a, b));
}

export interface Relation {
  id: string;
  kind: LinkKind;
  direction: 'out' | 'in';
  note: string;
  commodity?: Commodity;
}

export function neighbours(links: TechLink[], id: string, kinds?: LinkKind[]): Relation[] {
  const allowed = kinds ? new Set(kinds) : null;
  const rel: Relation[] = [];
  for (const l of links) {
    if (allowed && !allowed.has(l.kind)) continue;
    const other = l.source === id ? l.target : l.target === id ? l.source : null;
    if (other == null) continue;
    rel.push({
      id: other,
      kind: l.kind,
      direction: l.source === id ? 'out' : 'in',
      note: l.note,
      ...(l.commodity ? { commodity: l.commodity } : {}),
    });
  }
  return rel;
}

export function neighbourIds(links: TechLink[], id: string, kinds?: LinkKind[]): Set<string> {
  return new Set(neighbours(links, id, kinds).map((r) => r.id));
}

/**
 * Companies two steps from the hub, keyed by id, with the direct neighbours
 * they are reached through. Excludes the hub and its direct neighbours.
 */
export function secondDegree(links: TechLink[], hubId: string, kinds?: LinkKind[]): Record<string, string[]> {
  const allowed = kinds ? new Set(kinds) : null;
  const direct = neighbourIds(links, hubId, kinds);
  const via: Record<string, Set<string>> = {};
  for (const l of links) {
    if (allowed && !allowed.has(l.kind)) continue;
    for (const [near, far] of [[l.source, l.target], [l.target, l.source]]) {
      if (!direct.has(near) || far === hubId || direct.has(far)) continue;
      (via[far] ??= new Set()).add(near);
    }
  }
  return Object.fromEntries(Object.entries(via).map(([id, s]) => [id, [...s]]));
}

/** Reads `?hub=<id>` from a location search string; unknown ids are ignored. */
export function parseHubParam(search: string, validIds: Set<string>): string | null {
  const raw = new URLSearchParams(search).get('hub')?.trim().toLowerCase();
  return raw && validIds.has(raw) ? raw : null;
}

export type RelationGroup =
  | 'suppliesTo'
  | 'buysFrom'
  | 'computeFrom'
  | 'computeFor'
  | 'investedIn'
  | 'backedBy'
  | 'partners';

export const RELATION_GROUP_LABELS: Record<RelationGroup, string> = {
  suppliesTo: 'Supplies to',
  buysFrom: 'Buys from',
  computeFrom: 'Buys compute from',
  computeFor: 'Sells compute to',
  investedIn: 'Invested in',
  backedBy: 'Backed by',
  partners: 'Partners',
};

export function groupRelations(links: TechLink[], id: string): Record<RelationGroup, Relation[]> {
  const groups: Record<RelationGroup, Relation[]> = {
    suppliesTo: [], buysFrom: [], computeFrom: [], computeFor: [], investedIn: [], backedBy: [], partners: [],
  };
  for (const r of neighbours(links, id)) {
    if (r.kind === 'partnership') groups.partners.push(r);
    else if (r.kind === 'supplies') (r.direction === 'out' ? groups.suppliesTo : groups.buysFrom).push(r);
    else if (r.kind === 'customer') (r.direction === 'out' ? groups.computeFrom : groups.computeFor).push(r);
    else (r.direction === 'out' ? groups.investedIn : groups.backedBy).push(r);
  }
  return groups;
}

/** Dot radius from value on a log scale; companies with no value get the minimum. */
export function nodeRadius(valueUsdBn: number | null, min = 3.5, max = 12): number {
  if (valueUsdBn == null || valueUsdBn <= 0) return min;
  const r = min + 2.3 * Math.log10(Math.max(valueUsdBn, 1));
  return Math.max(min, Math.min(max, r));
}

export type RankMetric = 'value' | 'revenue';

export function metricOf(c: TechCompany, metric: RankMetric): number | null {
  return metric === 'value' ? c.valueUsdBn : c.revenueUsdBn;
}

export function rankBy(companies: TechCompany[], metric: RankMetric): TechCompany[] {
  return companies
    .filter((c) => metricOf(c, metric) != null)
    .sort((a, b) => (metricOf(b, metric) ?? 0) - (metricOf(a, metric) ?? 0));
}

export interface Total {
  key: string;
  total: number;
  count: number;
}

function totalsBy(companies: TechCompany[], keyOf: (c: TechCompany) => string, metric: RankMetric): Total[] {
  const acc = new Map<string, Total>();
  for (const c of companies) {
    const key = keyOf(c);
    const t = acc.get(key) ?? { key, total: 0, count: 0 };
    t.total += metricOf(c, metric) ?? 0;
    t.count += 1;
    acc.set(key, t);
  }
  return [...acc.values()].sort((a, b) => b.total - a.total || b.count - a.count);
}

export const categoryTotals = (companies: TechCompany[], metric: RankMetric = 'value') =>
  totalsBy(companies, (c) => c.category, metric);

/** Totals per sector, keyed by sector id; categories outside every sector fall under their own id. */
export function sectorTotals(
  companies: TechCompany[],
  sectors: { id: string; categoryIds: CategoryId[] }[],
  metric: RankMetric = 'value',
): Total[] {
  const sectorOf = new Map(sectors.flatMap((s) => s.categoryIds.map((c) => [c, s.id] as const)));
  return totalsBy(companies, (c) => sectorOf.get(c.category) ?? c.category, metric);
}

export const countryTotals = (companies: TechCompany[], metric: RankMetric = 'value') =>
  totalsBy(companies, (c) => c.hqCountry, metric);

const COUNTRY_LABELS: Record<string, string> = {
  USA: 'United States',
  UK: 'United Kingdom',
  SouthKorea: 'South Korea',
  UAE: 'UAE',
  SaudiArabia: 'Saudi Arabia',
};

export function countryLabel(key: string): string {
  return COUNTRY_LABELS[key] ?? key;
}

const SHORT_NAMES: Record<string, string> = {
  hpe: 'HPE',
  alphabet: 'Google',
  'zeiss-smt': 'Zeiss SMT',
  xai: 'xAI',
  amazon: 'Amazon',
  freeport: 'Freeport',
  constellation: 'Constellation',
  'lg-energy': 'LGES',
  'palo-alto': 'Palo Alto',
  westinghouse: 'Westinghouse',
  lynas: 'Lynas',
  gm: 'GM',
  mercedes: 'Mercedes',
  hyundai: 'Hyundai',
  geely: 'Geely',
  stellantis: 'Stellantis',
  mobileye: 'Mobileye',
  infineon: 'Infineon',
};

/** Compact label for the graph, e.g. "Micron Technology" -> "Micron". */
export function shortName(c: Pick<TechCompany, 'id' | 'name'>): string {
  if (SHORT_NAMES[c.id]) return SHORT_NAMES[c.id];
  return c.name
    .replace(/\s*\(.*\)\s*/g, '')
    .replace(/\s+(Technology|Technologies|Holdings|Group|Platforms|Networks|Computer|Electric|Chemical|Electronics)$/i, '')
    .trim();
}

export function formatUsdBn(v: number | null): string {
  if (v == null) return 'n/a';
  if (v >= 1000) return `$${parseFloat((v / 1000).toFixed(2))}tn`;
  if (v >= 100) return `$${Math.round(v)}bn`;
  if (v >= 10) return `$${v.toFixed(1).replace(/\.0$/, '')}bn`;
  if (v >= 1) return `$${v.toFixed(1)}bn`;
  return `$${Math.round(v * 1000)}m`;
}

/** Mix a hex colour towards white; amount 0..1. */
export function lighten(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function matchesQuery(c: TechCompany, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return false;
  return c.name.toLowerCase().includes(s)
    || shortName(c).toLowerCase().includes(s)
    || (c.ticker?.toLowerCase().includes(s) ?? false);
}
