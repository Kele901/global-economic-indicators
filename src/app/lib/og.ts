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

export interface CardContent {
  title?: string;
  /** Headline figure, e.g. "Germany: 59% low-carbon electricity". */
  metric?: string;
  description?: string;
  /** Page or section name shown above the title. */
  section?: string;
  series?: readonly number[];
  subject?: CardSubject;
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

export function cardFromParams(get: (key: string) => string | null | undefined): Required<Omit<CardContent, 'series' | 'subject'>> & Pick<CardContent, 'series' | 'subject'> {
  return {
    title: cleanText(get(CARD_KEYS.title), OG_LIMITS.title),
    metric: cleanText(get(CARD_KEYS.metric), OG_LIMITS.metric),
    description: cleanText(get(CARD_KEYS.description), OG_LIMITS.description),
    section: cleanText(get(CARD_KEYS.section), OG_LIMITS.section),
    series: parseSeries(get(CARD_KEYS.series)),
    subject: parseSubject(get(CARD_KEYS.subject)),
  };
}

export function appendCardParams(params: URLSearchParams, card: CardContent, keys: readonly (keyof CardContent)[]): void {
  for (const key of keys) {
    if (key === 'series') {
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
  appendCardParams(params, card, ['title', 'metric', 'description', 'section', 'subject', 'series']);
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
