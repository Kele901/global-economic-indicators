import { PLOT_LIMITS, PLOT_SCALE, type CardPlot, type PlotSeries } from './og';

// Reads a rendered Recharts chart back out of the DOM so share cards can draw
// the chart the person is actually looking at (their countries, their period).
// Browser-only. Every step is best-effort: anything unrecognised yields
// undefined and the card falls back to its text-only layout.

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

type Point = [number, number];

export interface SnapshotHints {
  /** Formatted latest value keyed by series name as shown in the legend. */
  latest?: Record<string, string>;
  /** First and last x values from the underlying data. */
  range?: [string, string];
}

const MIN_SURFACE_AREA = 4000;
const MAX_ANCESTORS = 6;

function largestSurface(root: Element): SVGSVGElement | null {
  let best: SVGSVGElement | null = null;
  let bestArea = 0;
  root.querySelectorAll<SVGSVGElement>('svg.recharts-surface').forEach(svg => {
    // Legend icons are recharts-surface SVGs too.
    if (svg.closest('.recharts-legend-wrapper')) return;
    const r = svg.getBoundingClientRect();
    const area = r.width * r.height;
    if (area > bestArea) {
      best = svg;
      bestArea = area;
    }
  });
  return bestArea >= MIN_SURFACE_AREA ? best : null;
}

const SHARE_TRIGGER = 'button[aria-haspopup="menu"][aria-label^="Share this"]';

/**
 * The chart a share control belongs to: its anchor target, else the nearest
 * enclosing chart. The search stops at the first ancestor holding another
 * share control, since any chart beyond that point belongs to someone else.
 */
export function findChartSurface(from: Element | null, anchorId?: string): SVGSVGElement | null {
  const anchored = anchorId ? document.getElementById(anchorId) : null;
  if (anchored && anchored.querySelectorAll(SHARE_TRIGGER).length <= 1) {
    const found = largestSurface(anchored);
    if (found) return found;
  }
  const own = from?.querySelector(SHARE_TRIGGER) ?? null;
  let el = from?.parentElement ?? null;
  for (let depth = 0; el && depth < MAX_ANCESTORS; depth++, el = el.parentElement) {
    if (el === document.body || el.tagName === 'MAIN') break;
    if (Array.from(el.querySelectorAll(SHARE_TRIGGER)).some(b => b !== own)) break;
    const found = largestSurface(el);
    if (found) return found;
  }
  return null;
}

// Recharts keeps the chart's data on the chart component's props. Reading it
// through React's fiber gives exact values and category names; it is an
// internal detail, so every use falls back to what the DOM shows.

type Row = Record<string, unknown>;

interface ChartItem {
  kind: 'Bar' | 'Line' | 'Area';
  dataKey: string;
  name: string;
}

interface AxisModel {
  dataKey?: string;
  type?: string;
  tickFormatter?: (value: unknown, index: number) => unknown;
}

interface ChartModel {
  data: Row[];
  items: ChartItem[];
  xAxis?: AxisModel;
  yAxis?: AxisModel;
}

type ElementLike = { type?: { displayName?: string; name?: string }; props?: Record<string, unknown> };

function flattenChildren(children: unknown, out: ElementLike[] = []): ElementLike[] {
  if (Array.isArray(children)) children.forEach(c => flattenChildren(c, out));
  else if (children && typeof children === 'object' && 'props' in children) {
    const el = children as ElementLike;
    const name = el.type?.displayName ?? el.type?.name;
    if (name && ['Bar', 'Line', 'Area', 'XAxis', 'YAxis'].includes(name)) out.push(el);
    else if (el.props?.children) flattenChildren(el.props.children, out);
  }
  return out;
}

function chartModel(svg: SVGSVGElement): ChartModel | undefined {
  const wrapper = svg.closest('.recharts-wrapper');
  if (!wrapper) return undefined;
  const key = Object.keys(wrapper).find(k => k.startsWith('__reactFiber$'));
  let fiber = key ? (wrapper as unknown as Record<string, { return?: unknown; memoizedProps?: Record<string, unknown> }>)[key] : undefined;
  for (let depth = 0; fiber && depth < 12; depth++) {
    const props = fiber.memoizedProps;
    if (props && Array.isArray(props.data) && props.children) {
      const els = flattenChildren(props.children);
      const axis = (name: string): AxisModel | undefined => {
        const p = els.find(e => (e.type?.displayName ?? e.type?.name) === name)?.props;
        return p
          ? {
              dataKey: typeof p.dataKey === 'string' ? p.dataKey : undefined,
              type: typeof p.type === 'string' ? p.type : undefined,
              tickFormatter: typeof p.tickFormatter === 'function' ? (p.tickFormatter as AxisModel['tickFormatter']) : undefined,
            }
          : undefined;
      };
      const items = els.flatMap(e => {
        const kind = (e.type?.displayName ?? e.type?.name) as ChartItem['kind'];
        const p = e.props ?? {};
        if (!['Bar', 'Line', 'Area'].includes(kind) || typeof p.dataKey !== 'string' || p.hide) return [];
        return [{ kind, dataKey: p.dataKey, name: typeof p.name === 'string' ? p.name : p.dataKey }];
      });
      return { data: props.data as Row[], items, xAxis: axis('XAxis'), yAxis: axis('YAxis') };
    }
    fiber = fiber.return as typeof fiber;
  }
  return undefined;
}

function axisText(axis: AxisModel | undefined, value: unknown, index: number): string {
  if (value === null || value === undefined) return '';
  if (axis?.tickFormatter) {
    try {
      const out = axis.tickFormatter(value, index);
      if (typeof out === 'string' || typeof out === 'number') return String(out);
    } catch {
      // Formatters written for tick indices or other shapes; use the raw value.
    }
  }
  return String(value);
}

interface Affixes {
  prefix?: string;
  suffix?: string;
  /** Axis marks positive values with "+". */
  signed?: boolean;
}

/** Prefix and unit suffix shared by every tick on the value axis, e.g. "$" or "%". */
function tickAffixes(svg: SVGSVGElement, axis: 'x' | 'y'): Affixes {
  const texts = ticks(svg, axis).map(t => t.text.replace(/^[+\-\u2212]/, ''));
  if (!texts.length) return {};
  const common = (pick: (t: string) => string) => {
    const first = pick(texts[0]);
    return texts.every(t => pick(t) === first) ? first : '';
  };
  const prefix = common(t => t.match(/^[^\d.]*/)?.[0] ?? '').trim();
  const suffix = common(t => t.match(/[^\d.]*$/)?.[0] ?? '').trim();
  return {
    prefix,
    // Scale letters mean the ticks are abbreviated; values are formatted compactly instead.
    suffix: /^[kKmMbBtT]$/.test(suffix) ? '' : suffix,
    signed: ticks(svg, axis).some(t => t.text.startsWith('+')),
  };
}

function toHex(color: string | null | undefined): string | undefined {
  const m = color?.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+%?))?\s*\)/);
  if (!m) return undefined;
  if (m[4] !== undefined && parseFloat(m[4]) === 0) return undefined;
  return [m[1], m[2], m[3]].map(n => Math.min(255, Number(n)).toString(16).padStart(2, '0')).join('');
}

function paint(el: Element, prop: 'stroke' | 'fill'): string | undefined {
  return toHex(getComputedStyle(el)[prop]);
}

function num(el: Element, attr: string): number {
  return parseFloat(el.getAttribute(attr) ?? '');
}

function plotBox(svg: SVGSVGElement): Box | null {
  const clip = svg.querySelector('defs clipPath rect');
  if (clip) {
    const box = { x: num(clip, 'x'), y: num(clip, 'y'), width: num(clip, 'width'), height: num(clip, 'height') };
    if (Object.values(box).every(Number.isFinite) && box.width > 0 && box.height > 0) return box;
  }
  const width = num(svg, 'width');
  const height = num(svg, 'height');
  return width > 0 && height > 0 ? { x: 0, y: 0, width, height } : null;
}

/** Endpoints of each path segment; null marks the start of a new subpath (a gap). */
function pathPoints(d: string): (Point | null)[] {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) ?? [];
  const out: (Point | null)[] = [];
  let i = 0;
  let cmd = '';
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  const isCmd = (t: string | undefined) => t !== undefined && /^[a-zA-Z]$/.test(t);
  const next = () => Number(tokens[i++]);
  const skip = (n: number) => { i += n; };

  while (i < tokens.length) {
    if (isCmd(tokens[i])) cmd = tokens[i++];
    const rel = cmd !== cmd.toUpperCase();
    const upper = cmd.toUpperCase();
    if (upper === 'Z') {
      cx = sx;
      cy = sy;
      if (!isCmd(tokens[i])) i++;
      continue;
    }
    let x = cx;
    let y = cy;
    switch (upper) {
      case 'M':
      case 'L':
      case 'T':
        x = next(); y = next();
        break;
      case 'H':
        x = next();
        break;
      case 'V':
        y = next();
        break;
      case 'C':
        skip(4); x = next(); y = next();
        break;
      case 'S':
      case 'Q':
        skip(2); x = next(); y = next();
        break;
      case 'A':
        skip(5); x = next(); y = next();
        break;
      default:
        return out;
    }
    if (rel) {
      if (upper !== 'V') x += cx;
      if (upper !== 'H') y += cy;
    }
    if (!Number.isFinite(x) || !Number.isFinite(y)) return out;
    if (upper === 'M') {
      if (out.length) out.push(null);
      sx = x;
      sy = y;
      cmd = rel ? 'l' : 'L';
    }
    cx = x;
    cy = y;
    out.push([x, y]);
  }
  return out;
}

function segments(points: (Point | null)[]): Point[][] {
  const segs: Point[][] = [];
  let cur: Point[] = [];
  for (const p of points) {
    if (p) cur.push(p);
    else if (cur.length) {
      segs.push(cur);
      cur = [];
    }
  }
  if (cur.length) segs.push(cur);
  return segs;
}

function normY(y: number, box: Box): number {
  return Math.round(Math.max(0, Math.min(1, (box.y + box.height - y) / box.height)) * PLOT_SCALE);
}

/**
 * Samples every line on one shared x grid so series stay aligned on the card.
 * With `n` equal to the densest series' point count on an evenly spaced axis,
 * grid columns land exactly on data points and nothing is smoothed away.
 */
function resample(segs: Point[][], x0: number, x1: number, n: number, box: Box): (number | null)[] {
  const step = (x1 - x0) / (n - 1);
  const out: (number | null)[] = [];
  for (let k = 0; k < n; k++) {
    const x = x0 + k * step;
    let y: number | null = null;
    for (const seg of segs) {
      const first = seg[0][0];
      const last = seg[seg.length - 1][0];
      if (x < first - step / 2 || x > last + step / 2) continue;
      if (x <= first) { y = seg[0][1]; break; }
      if (x >= last) { y = seg[seg.length - 1][1]; break; }
      for (let j = 0; j < seg.length - 1; j++) {
        const [ax, ay] = seg[j];
        const [bx, by] = seg[j + 1];
        if (x >= ax && x <= bx) {
          y = bx === ax ? ay : ay + ((x - ax) / (bx - ax)) * (by - ay);
          break;
        }
      }
      if (y !== null) break;
    }
    out.push(y === null ? null : normY(y, box));
  }
  return out;
}

function pickEvenly<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items;
  return Array.from({ length: max }, (_, i) => items[Math.round((i * (items.length - 1)) / (max - 1))]);
}

function mode(values: number[]): number {
  const counts = new Map<number, number>();
  let best = values[0];
  let bestCount = 0;
  for (const v of values) {
    const key = Math.round(v);
    const c = (counts.get(key) ?? 0) + 1;
    counts.set(key, c);
    if (c > bestCount) {
      best = key;
      bestCount = c;
    }
  }
  return best;
}

interface Rect extends Box {
  color?: string;
}

function commonColor(rects: Rect[]): string | undefined {
  const counts = new Map<string, number>();
  for (const r of rects) if (r.color) counts.set(r.color, (counts.get(r.color) ?? 0) + 1);
  let best: string | undefined;
  let bestCount = 0;
  counts.forEach((c, color) => {
    if (c > bestCount) {
      best = color;
      bestCount = c;
    }
  });
  return best;
}

function barRects(group: Element): Rect[] {
  const rects: Rect[] = [];
  group.querySelectorAll<SVGGraphicsElement>('.recharts-bar-rectangle .recharts-rectangle, .recharts-bar-rectangle rect').forEach(el => {
    let box: Box = { x: num(el, 'x'), y: num(el, 'y'), width: num(el, 'width'), height: num(el, 'height') };
    if (!Object.values(box).every(Number.isFinite)) {
      try {
        const b = el.getBBox();
        box = { x: b.x, y: b.y, width: b.width, height: b.height };
      } catch {
        return;
      }
    }
    // Recharts encodes negative bars as negative heights/widths.
    if (box.height < 0) box = { ...box, y: box.y + box.height, height: -box.height };
    if (box.width < 0) box = { ...box, x: box.x + box.width, width: -box.width };
    rects.push({ ...box, color: paint(el, 'fill') });
  });
  return rects;
}

interface LegendEntry {
  label: string;
  color?: string;
}

function legendEntries(svg: SVGSVGElement): LegendEntry[] {
  const wrapper = svg.closest('.recharts-wrapper') ?? svg.parentElement;
  if (!wrapper) return [];
  return Array.from(wrapper.querySelectorAll('.recharts-legend-item')).flatMap(item => {
    const label = item.querySelector('.recharts-legend-item-text')?.textContent?.trim() ?? item.textContent?.trim() ?? '';
    if (!label) return [];
    const icon = item.querySelector('svg path, svg line, svg rect');
    const color = icon ? paint(icon, 'fill') ?? paint(icon, 'stroke') : undefined;
    return [{ label, color }];
  });
}

interface Tick {
  text: string;
  x: number;
  y: number;
}

function ticks(svg: SVGSVGElement, axis: 'x' | 'y'): Tick[] {
  const group = svg.querySelector(`.recharts-${axis}Axis`);
  if (!group) return [];
  return Array.from(group.querySelectorAll('.recharts-cartesian-axis-tick-value')).flatMap(t => {
    const text = t.textContent?.trim() ?? '';
    const x = num(t, 'x');
    const y = num(t, 'y');
    return text && Number.isFinite(x) && Number.isFinite(y) ? [{ text, x, y }] : [];
  });
}

/** Bottom and top y labels, only when those ticks sit on the plot edges. */
function yRange(svg: SVGSVGElement, box: Box): [string, string] | undefined {
  const ys = ticks(svg, 'y').sort((a, b) => b.y - a.y);
  if (ys.length < 2) return undefined;
  const bottom = ys[0];
  const top = ys[ys.length - 1];
  const tol = box.height * 0.04;
  const onEdges = Math.abs(bottom.y - (box.y + box.height)) <= tol && Math.abs(top.y - box.y) <= tol;
  return onEdges ? [bottom.text, top.text] : undefined;
}

function xRange(svg: SVGSVGElement, hints: SnapshotHints): [string, string] | undefined {
  if (hints.range) return hints.range;
  const xs = ticks(svg, 'x').sort((a, b) => a.x - b.x);
  if (xs.length < 2) return undefined;
  const first = xs[0].text;
  const last = xs[xs.length - 1].text;
  // Year and date axes read well as a range; category axes (country names) do not.
  return /\d/.test(first) && /\d/.test(last) ? [first, last] : undefined;
}

function horizontalRows(svg: SVGSVGElement, rects: Rect[], box: Box, model: ChartModel | undefined): CardPlot | undefined {
  const base = mode(rects.flatMap(r => [r.x, r.x + r.width]));
  const categories = ticks(svg, 'y');
  const rows = [...rects].sort((a, b) => a.y - b.y).slice(0, PLOT_LIMITS.rows);
  const toPlot = (x: number) => ((x - box.x) / box.width) * PLOT_SCALE;
  const catKey = model?.yAxis?.dataKey;
  const bar = model?.items.find(i => i.kind === 'Bar');
  const affix = tickAffixes(svg, 'x');
  const band = model?.data.length ? box.height / model.data.length : 0;

  const series: PlotSeries[] = rows.map(r => {
    const far = Math.abs(r.x - base) > Math.abs(r.x + r.width - base) ? r.x : r.x + r.width;
    const centre = r.y + r.height / 2;
    let label: string | undefined;
    let value: string | undefined;
    if (model && band > 0) {
      const index = Math.max(0, Math.min(model.data.length - 1, Math.floor((centre - box.y) / band)));
      const row = model.data[index];
      if (catKey) {
        const raw = row[catKey];
        const shown = axisText(model.yAxis, raw, index);
        // Tick formatters often clip long names to fit the axis; the card has room for the full one.
        const clipped = typeof raw === 'string' && shown && raw !== shown && raw.startsWith(shown.replace(/[.\u2026]+$/, ''));
        label = (clipped ? raw : shown) || undefined;
      }
      const v = bar ? row[bar.dataKey] : undefined;
      if (typeof v === 'number' && Number.isFinite(v)) value = formatValue(v, affix);
    }
    if (!label) {
      const tick = categories.reduce<Tick | undefined>(
        (best, t) => (!best || Math.abs(t.y - centre) < Math.abs(best.y - centre) ? t : best),
        undefined,
      );
      label = tick && Math.abs(tick.y - centre) <= Math.max(r.height, 12) ? tick.text : undefined;
    }
    return { kind: 'h', points: [Math.round(toPlot(far) - toPlot(base))], color: r.color, label, value };
  });
  return series.length ? { series, baseline: Math.round(toPlot(base)) } : undefined;
}

function modelHints(svg: SVGSVGElement, model: ChartModel | undefined): SnapshotHints {
  if (!model?.data.length) return {};
  const xKey = model.xAxis?.dataKey;
  const first = xKey ? axisText(model.xAxis, model.data[0][xKey], 0) : '';
  const last = xKey ? axisText(model.xAxis, model.data[model.data.length - 1][xKey], model.data.length - 1) : '';
  // "Latest" only means something along a time axis, not across categories.
  if (!/\d/.test(first) || !/\d/.test(last)) return {};

  const affix = tickAffixes(svg, 'y');
  const latest: Record<string, string> = {};
  for (const item of model.items) {
    for (let i = model.data.length - 1; i >= 0; i--) {
      const v = model.data[i][item.dataKey];
      if (typeof v === 'number' && Number.isFinite(v)) {
        latest[item.name] = formatValue(v, affix);
        break;
      }
    }
  }
  return { latest, range: [first, last] };
}

function isHorizontal(rects: Rect[]): boolean {
  if (rects.length < 2) return false;
  const heights = new Set(rects.map(r => Math.round(r.height)));
  const widths = new Set(rects.map(r => Math.round(r.width)));
  return heights.size === 1 && widths.size > 1;
}

export function snapshotChart(svg: SVGSVGElement | null, explicit: SnapshotHints = {}): CardPlot | undefined {
  if (!svg) return undefined;
  const box = plotBox(svg);
  if (!box) return undefined;
  const inBrush = (el: Element) => !!el.closest('.recharts-brush');
  let model: ChartModel | undefined;
  try {
    model = chartModel(svg);
  } catch {
    model = undefined;
  }

  const barGroups = Array.from(svg.querySelectorAll('.recharts-bar')).filter(g => !inBrush(g));
  const barSets = barGroups.map(barRects).filter(r => r.length > 0);

  const allRects = barSets.flat();
  if (barSets.length && isHorizontal(allRects)) return horizontalRows(svg, barSets[0], box, model);

  const derived = modelHints(svg, model);
  const hints: SnapshotHints = {
    latest: { ...derived.latest, ...explicit.latest },
    range: explicit.range ?? derived.range,
  };

  const drafts: (Omit<PlotSeries, 'points'> & { segs?: Point[][]; points?: (number | null)[] })[] = [];
  let baseline: number | undefined;

  if (barSets.length) {
    const baseY = mode(allRects.flatMap(r => [r.y, r.y + r.height]));
    baseline = normY(baseY, box);
    const stacked =
      barSets.length > 1 && Math.abs(barSets[0][0].x - barSets[1][0].x) < 1 && Math.abs(barSets[0][0].width - barSets[1][0].width) < 1;
    for (const rects of barSets) {
      const ordered = pickEvenly([...rects].sort((a, b) => a.x - b.x), PLOT_LIMITS.points);
      const points = ordered.map(r => {
        const far = Math.abs(r.y - baseY) > Math.abs(r.y + r.height - baseY) ? r.y : r.y + r.height;
        return normY(far, box) - (baseline as number);
      });
      drafts.push({ kind: stacked ? 'B' : 'b', points, color: commonColor(rects) });
    }
  }

  const curves: [Element, 'l' | 'a'][] = [
    ...Array.from(svg.querySelectorAll('.recharts-area-curve')).map(el => [el, 'a'] as [Element, 'a']),
    ...Array.from(svg.querySelectorAll('.recharts-line-curve')).map(el => [el, 'l'] as [Element, 'l']),
  ];
  for (const [el, kind] of curves) {
    if (inBrush(el)) continue;
    const segs = segments(pathPoints(el.getAttribute('d') ?? ''));
    if (!segs.some(s => s.length >= 2)) continue;
    const areaFill = kind === 'a' ? el.closest('.recharts-area')?.querySelector('.recharts-area-area') : null;
    const color = paint(el, 'stroke') ?? (areaFill ? paint(areaFill, 'fill') : undefined);
    drafts.push({ kind, segs, color });
  }

  const lineSegs = drafts.flatMap(d => d.segs ?? []);
  if (lineSegs.length) {
    const xs = lineSegs.flat().map(p => p[0]);
    const x0 = Math.min(...xs);
    const x1 = Math.max(...xs);
    if (x1 - x0 < 1) return undefined;
    const densest = Math.max(...drafts.map(d => (d.segs ?? []).reduce((sum, s) => sum + s.length, 0)));
    const n = Math.max(2, Math.min(PLOT_LIMITS.points, densest));
    for (const d of drafts) if (d.segs) d.points = resample(d.segs, x0, x1, n, box);
  }

  const legend = legendEntries(svg);
  const series: PlotSeries[] = drafts
    .filter((d): d is typeof d & { points: (number | null)[] } => !!d.points && d.points.some(v => v !== null))
    .map((d, i, all) => {
      const entry = legend.find(e => e.color && e.color === d.color) ?? (legend.length === all.length ? legend[i] : undefined);
      const label = entry?.label;
      return {
        kind: d.kind,
        points: d.points,
        color: d.color,
        label,
        value: label ? hints.latest?.[label] : undefined,
      };
    })
    .slice(0, PLOT_LIMITS.series);

  // A lone series without a legend still gets its latest figure on the card.
  const only = model?.items.length === 1 ? model.items[0] : undefined;
  if (series.length === 1 && !series[0].label && only && hints.latest?.[only.name]) {
    series[0] = { ...series[0], label: 'Latest', value: hints.latest[only.name] };
  }

  if (!series.length) return undefined;
  return { series, baseline, x: xRange(svg, hints), y: yRange(svg, box) };
}

function formatValue(v: number, { prefix = '', suffix = '', signed = false }: Affixes): string {
  const abs = Math.abs(v);
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  const body =
    abs >= 10000
      ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(abs)
      : abs.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const sign = v < 0 ? '-' : signed && v > 0 ? '+' : '';
  return `${sign}${prefix}${body}${suffix}`;
}

/** Latest value per series and the x range from a chart's raw rows. */
export function hintsFromRows(rows: readonly Record<string, unknown>[] | undefined, keys: readonly string[] | undefined, title: string): SnapshotHints {
  if (!rows?.length) return {};
  const unit = { suffix: /%/.test(title) ? '%' : '' };
  const xKey = ['year', 'date', 'period', 'month'].find(k => rows.some(r => r[k] !== undefined && r[k] !== null));
  const names = keys?.length
    ? keys
    : Object.keys(rows[rows.length - 1]).filter(k => k !== xKey && typeof rows[rows.length - 1][k] === 'number');

  const latest: Record<string, string> = {};
  for (const name of names) {
    for (let i = rows.length - 1; i >= 0; i--) {
      const v = rows[i][name];
      if (typeof v === 'number' && Number.isFinite(v)) {
        latest[name] = formatValue(v, unit);
        break;
      }
    }
  }
  const first = xKey ? rows[0][xKey] : undefined;
  const last = xKey ? rows[rows.length - 1][xKey] : undefined;
  const range: [string, string] | undefined =
    first !== undefined && last !== undefined && first !== null && last !== null ? [String(first), String(last)] : undefined;
  return { latest, range };
}
