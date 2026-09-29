import type { Metadata } from 'next';
import { SITE_NAME } from './site';

// Social preview cards. Everything here is edge-safe because /og imports it.
//
// Crawlers only read og:image from the URL they are given, so every card is a
// GET to /og with the text in the query string. /og lives outside /api/
// because robots.txt disallows /api/ and X and LinkedIn honour robots.txt
// when fetching preview images.

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_IMAGE_PATH = '/og';

export const OG_LIMITS = {
  title: 110,
  metric: 80,
  description: 180,
  section: 48,
  series: 40,
} as const;

export type CardSubject = 'chart' | 'dataset' | 'page';

/** l = line, a = area, b = grouped bar, B = stacked bar, h = one horizontal bar row. */
export type PlotKind = 'l' | 'a' | 'b' | 'B' | 'h';

export interface PlotSeries {
  kind: PlotKind;
  /**
   * Plot-space values from 0 (bottom or left edge) to PLOT_SCALE (top or right).
   * Bars are signed distances from `CardPlot.baseline`. null marks a gap.
   */
  points: (number | null)[];
  /** Six hex digits, no '#'. */
  color?: string;
  label?: string;
  /** Pre-formatted latest value, e.g. "4.25%". */
  value?: string;
}

/** A chart as drawn on the page, reduced to shapes small enough for a URL. */
export interface CardPlot {
  series: PlotSeries[];
  baseline?: number;
  /** First and last x-axis labels. */
  x?: [string, string];
  /** Bottom and top y-axis labels. */
  y?: [string, string];
}

export const PLOT_SCALE = 999;

export const PLOT_LIMITS = {
  series: 8,
  rows: 8,
  points: 80,
  label: 28,
  value: 12,
  axis: 16,
} as const;

export interface CardContent {
  title?: string;
  /** Headline figure, e.g. "Germany: 59% low-carbon electricity". */
  metric?: string;
  description?: string;
  /** Page or section name shown above the title. */
  section?: string;
  series?: readonly number[];
  subject?: CardSubject;
  plot?: CardPlot;
}

// C0/C1 controls plus zero-width and bidi-override characters, which could
// otherwise be used to disguise text on a card served from this domain.
const UNSAFE_CHARS = /[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u2069\ufeff]/g;

export function cleanText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  const text = value.replace(UNSAFE_CHARS, ' ').replace(/\s+/g, ' ').trim();
  const chars = Array.from(text);
  if (chars.length <= max) return text;
  const cut = chars.slice(0, max - 1).join('');
  const space = cut.lastIndexOf(' ');
  const head = space > cut.length * 0.7 ? cut.slice(0, space) : cut;
  return `${head.replace(/[\s,;:\u2014\u2013-]+$/, '')}\u2026`;
}

export function stripSiteName(title: string): string {
  return title.replace(/\s*[|\u2014\u2013-]\s*Global Economic Indicators(\s+Dashboard)?\s*$/i, '').trim();
}

const NUMBER = /^-?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

export function parseSeries(value: unknown): number[] | undefined {
  if (typeof value !== 'string' || value.length > 20 * OG_LIMITS.series) return undefined;
  const parts = value.split(',').slice(0, OG_LIMITS.series);
  const nums: number[] = [];
  for (const part of parts) {
    const p = part.trim();
    if (!NUMBER.test(p)) return undefined;
    const n = Number(p);
    if (!Number.isFinite(n)) return undefined;
    nums.push(n);
  }
  return nums.length >= 2 ? nums : undefined;
}

/** Evenly downsamples to the point cap and rounds to 4 significant figures. */
export function encodeSeries(series: readonly number[]): string {
  const finite = series.filter(v => Number.isFinite(v));
  if (finite.length < 2) return '';
  const max = OG_LIMITS.series;
  const picked = finite.length <= max
    ? finite
    : Array.from({ length: max }, (_, i) => finite[Math.round((i * (finite.length - 1)) / (max - 1))]);
  return picked.map(v => String(Number(v.toPrecision(4)))).join(',');
}

export function parseSubject(value: unknown): CardSubject | undefined {
  return value === 'chart' || value === 'dataset' || value === 'page' ? value : undefined;
}

const WORD_OVERRIDES: Record<string, string> = {
  ai: 'AI',
  gdp: 'GDP',
  imf: 'IMF',
  oecd: 'OECD',
  bis: 'BIS',
  fx: 'FX',
};

/** "/energy-ledger/whatever" -> "Energy Ledger"; "/" -> "Dashboard". */
export function sectionLabel(path: string): string {
  const first = path.split(/[?#]/)[0].split('/').filter(Boolean)[0];
  if (!first) return 'Dashboard';
  return first
    .split('-')
    .filter(Boolean)
    .map(w => WORD_OVERRIDES[w.toLowerCase()] ?? w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Query keys shared by /og and /share. */
export const CARD_KEYS = {
  title: 't',
  metric: 'm',
  description: 'd',
  section: 'k',
  series: 's',
  subject: 'y',
} as const;

// Kept clear of CARD_KEYS and the /share route's own keys (c, q), since all
// three sets travel in the same query string.
const PLOT_KEYS = {
  points: 'p',
  kinds: 'g',
  colors: 'h',
  labels: 'n',
  values: 'w',
  baseline: 'z',
  x: 'x',
  y: 'v',
} as const;

const HEX = /^[0-9a-f]{6}$/i;
const PLOT_VALUE = /^-?\d{1,3}$/;
const PLOT_KIND = /^[labBh]+$/;
const LIST_SEP = '|';

function clampPlot(v: number, min = -PLOT_SCALE): number {
  return Math.max(min, Math.min(PLOT_SCALE, Math.round(v)));
}

function textList(values: readonly (string | undefined)[], max: number): string {
  const cleaned = values.map(v => cleanText((v ?? '').split(LIST_SEP).join(' '), max));
  return cleaned.some(Boolean) ? cleaned.join(LIST_SEP) : '';
}

function parseTextList(value: string | null | undefined, count: number, max: number): (string | undefined)[] {
  if (typeof value !== 'string' || value.length > count * (max + 1) * 4) return [];
  return value.split(LIST_SEP).slice(0, count).map(v => cleanText(v, max) || undefined);
}

function parsePair(value: string | null | undefined): [string, string] | undefined {
  const [a = '', b = ''] = parseTextList(value, 2, PLOT_LIMITS.axis).map(v => v ?? '');
  return a || b ? [a, b] : undefined;
}

export function encodePlot(params: URLSearchParams, plot: CardPlot): void {
  const rows = plot.series.length > 0 && plot.series.every(s => s.kind === 'h');
  const series = plot.series
    .filter(s => (rows ? s.kind === 'h' : s.kind !== 'h') && s.points.some(v => v !== null && Number.isFinite(v)))
    .slice(0, rows ? PLOT_LIMITS.rows : PLOT_LIMITS.series);
  if (!series.length) return;

  params.set(
    PLOT_KEYS.points,
    series
      .map(s => s.points.slice(0, PLOT_LIMITS.points).map(v => (v === null || !Number.isFinite(v) ? '' : String(clampPlot(v)))).join('.'))
      .join('_'),
  );
  params.set(PLOT_KEYS.kinds, series.map(s => s.kind).join(''));
  const colors = series.map(s => (s.color && HEX.test(s.color) ? s.color.toLowerCase() : ''));
  if (colors.some(Boolean)) params.set(PLOT_KEYS.colors, colors.join('.'));
  const labels = textList(series.map(s => s.label), PLOT_LIMITS.label);
  if (labels) params.set(PLOT_KEYS.labels, labels);
  const values = textList(series.map(s => s.value), PLOT_LIMITS.value);
  if (values) params.set(PLOT_KEYS.values, values);
  if (plot.baseline !== undefined && Number.isFinite(plot.baseline)) {
    params.set(PLOT_KEYS.baseline, String(clampPlot(plot.baseline, 0)));
  }
  const x = plot.x ? textList(plot.x, PLOT_LIMITS.axis) : '';
  if (x) params.set(PLOT_KEYS.x, x);
  const y = plot.y ? textList(plot.y, PLOT_LIMITS.axis) : '';
  if (y) params.set(PLOT_KEYS.y, y);
}

export function parsePlot(get: (key: string) => string | null | undefined): CardPlot | undefined {
  const raw = get(PLOT_KEYS.points);
  const kinds = get(PLOT_KEYS.kinds) ?? '';
  const maxSeries = Math.max(PLOT_LIMITS.series, PLOT_LIMITS.rows);
  if (typeof raw !== 'string' || raw.length > maxSeries * PLOT_LIMITS.points * 5) return undefined;
  if (!PLOT_KIND.test(kinds)) return undefined;

  const parts = raw.split('_');
  if (parts.length !== kinds.length || parts.length > maxSeries) return undefined;
  const rows = kinds.split('').every(k => k === 'h');
  if (!rows && (kinds.includes('h') || parts.length > PLOT_LIMITS.series)) return undefined;

  const colors = (get(PLOT_KEYS.colors) ?? '').split('.');
  const labels = parseTextList(get(PLOT_KEYS.labels), parts.length, PLOT_LIMITS.label);
  const values = parseTextList(get(PLOT_KEYS.values), parts.length, PLOT_LIMITS.value);

  const series: PlotSeries[] = [];
  for (let i = 0; i < parts.length; i++) {
    const tokens = parts[i].split('.');
    if (tokens.length > PLOT_LIMITS.points) return undefined;
    const points: (number | null)[] = [];
    for (const t of tokens) {
      if (t === '') points.push(null);
      else if (PLOT_VALUE.test(t)) points.push(clampPlot(Number(t)));
      else return undefined;
    }
    const color = colors[i];
    series.push({
      kind: kinds[i] as PlotKind,
      points,
      color: color && HEX.test(color) ? color.toLowerCase() : undefined,
      label: labels[i],
      value: values[i],
    });
  }
  const minPoints = rows ? 1 : 2;
  if (!series.some(s => s.points.filter(v => v !== null).length >= minPoints)) return undefined;

  const z = get(PLOT_KEYS.baseline);
  return {
    series,
    baseline: z && /^\d{1,3}$/.test(z) ? clampPlot(Number(z), 0) : undefined,
    x: parsePair(get(PLOT_KEYS.x)),
    y: parsePair(get(PLOT_KEYS.y)),
  };
}

export function cardFromParams(
  get: (key: string) => string | null | undefined,
): Required<Omit<CardContent, 'series' | 'subject' | 'plot'>> & Pick<CardContent, 'series' | 'subject' | 'plot'> {
  return {
    title: cleanText(get(CARD_KEYS.title), OG_LIMITS.title),
    metric: cleanText(get(CARD_KEYS.metric), OG_LIMITS.metric),
    description: cleanText(get(CARD_KEYS.description), OG_LIMITS.description),
    section: cleanText(get(CARD_KEYS.section), OG_LIMITS.section),
    series: parseSeries(get(CARD_KEYS.series)),
    subject: parseSubject(get(CARD_KEYS.subject)),
    plot: parsePlot(get),
  };
}

export function appendCardParams(params: URLSearchParams, card: CardContent, keys: readonly (keyof CardContent)[]): void {
  for (const key of keys) {
    if (key === 'plot') {
      if (card.plot) encodePlot(params, card.plot);
    } else if (key === 'series') {
      const s = card.series ? encodeSeries(card.series) : '';
      if (s) params.set(CARD_KEYS.series, s);
    } else if (key === 'subject') {
      if (card.subject) params.set(CARD_KEYS.subject, card.subject);
    } else {
      const v = cleanText(card[key], OG_LIMITS[key]);
      if (v) params.set(CARD_KEYS[key], v);
    }
  }
}

/** Site-relative image URL; metadataBase makes it absolute in the tags. */
export function ogImagePath(card: CardContent): string {
  const params = new URLSearchParams();
  appendCardParams(params, card, ['title', 'metric', 'description', 'section', 'subject', 'series', 'plot']);
  const qs = params.toString();
  return qs ? `${OG_IMAGE_PATH}?${qs}` : OG_IMAGE_PATH;
}

type Titleish = Metadata['title'] | NonNullable<Metadata['openGraph']>['title'];

function plainTitle(value: Titleish): string | undefined {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    if ('absolute' in value && value.absolute) return value.absolute;
    if ('default' in value && value.default) return value.default;
  }
  return undefined;
}

/**
 * Gives a route layout its own preview card. Keeps whatever openGraph and
 * twitter fields the layout already sets and fills in url, siteName, the
 * large-image twitter card and a /og image built from the page title.
 */
export function withOgImage(path: string, metadata: Metadata, card: CardContent = {}): Metadata {
  const og = metadata.openGraph ?? {};
  const tw = metadata.twitter ?? {};
  const socialTitle = plainTitle(og.title) ?? plainTitle(tw.title) ?? stripSiteName(plainTitle(metadata.title) ?? SITE_NAME);
  const socialDescription = og.description ?? tw.description ?? metadata.description ?? undefined;
  const image = {
    url: ogImagePath({
      title: stripSiteName(card.title ?? socialTitle),
      description: card.description ?? socialDescription,
      section: card.section ?? sectionLabel(path),
      metric: card.metric,
      series: card.series,
      subject: card.subject ?? 'page',
    }),
    ...OG_SIZE,
    alt: socialTitle,
  };

  return {
    ...metadata,
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      url: path,
      ...og,
      title: socialTitle,
      description: socialDescription,
      images: [image],
    } as Metadata['openGraph'],
    twitter: {
      ...tw,
      card: 'summary_large_image',
      title: socialTitle,
      description: socialDescription,
      images: [image.url],
    } as Metadata['twitter'],
  };
}
