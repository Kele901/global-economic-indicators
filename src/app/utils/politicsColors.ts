import type { GovernmentForm, PoliticalProfile } from '../services/politicsCurated';
import type { CountryKey } from './countryMappings';
import type { CountryData } from '../services/worldbank';

export interface WgiSnapshot {
  voice?: number;
  stability?: number;
  effectiveness?: number;
  regulation?: number;
  ruleOfLaw?: number;
  corruption?: number;
  year?: number;
}

export type WgiByCountry = Partial<Record<CountryKey, WgiSnapshot>>;

export interface WgiSeries {
  governanceVoice?: CountryData[];
  governanceStability?: CountryData[];
  governanceEffectiveness?: CountryData[];
  governanceRegulation?: CountryData[];
  governanceRuleOfLaw?: CountryData[];
  governanceCorruption?: CountryData[];
}

function latest(series: CountryData[] | undefined, key: string): { v?: number; year?: number } {
  if (!series?.length) return {};
  const rows = [...series].sort((a, b) => Number(b.year) - Number(a.year));
  for (const r of rows) {
    const v = Number(r[key]);
    if (r[key] != null && !Number.isNaN(v)) return { v, year: Number(r.year) };
  }
  return {};
}

/** Latest WGI estimate per country from the World Bank series returned by fetchGlobalData. */
export function buildWgiSnapshot(data: WgiSeries | null | undefined, keys: CountryKey[]): WgiByCountry {
  if (!data) return {};
  const out: WgiByCountry = {};
  for (const k of keys) {
    const voice = latest(data.governanceVoice, k);
    const stability = latest(data.governanceStability, k);
    const effectiveness = latest(data.governanceEffectiveness, k);
    const regulation = latest(data.governanceRegulation, k);
    const ruleOfLaw = latest(data.governanceRuleOfLaw, k);
    const corruption = latest(data.governanceCorruption, k);
    const any = [voice, stability, effectiveness, regulation, ruleOfLaw, corruption].find((x) => x.v != null);
    if (!any) continue;
    out[k] = {
      voice: voice.v,
      stability: stability.v,
      effectiveness: effectiveness.v,
      regulation: regulation.v,
      ruleOfLaw: ruleOfLaw.v,
      corruption: corruption.v,
      year: Math.max(...[voice, stability, effectiveness, ruleOfLaw, corruption].map((x) => x.year ?? 0)),
    };
  }
  return out;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`;
}

function srgbToLinear(c: number): number {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

export function hexToLab(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
  const X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const Y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (t * 24389) / 27 / 116 + 16 / 116);
  const fx = f(X), fy = f(Y), fz = f(Z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** CIE76 colour difference; under about 10 adjacent swatches read as the same colour. */
export function deltaE76(a: string, b: string): number {
  const [l1, a1, b1] = hexToLab(a);
  const [l2, a2, b2] = hexToLab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

/** Lightens or darkens each colour that is too close to its left neighbour. */
export function contrastSafeColors(colors: string[], minDelta = 12): string[] {
  const out: string[] = [];
  colors.forEach((c, i) => {
    if (i === 0 || !/^#[0-9a-f]{6}$/i.test(c)) {
      out.push(c);
      return;
    }
    const prev = out[i - 1];
    if (!/^#[0-9a-f]{6}$/i.test(prev) || deltaE76(prev, c) >= minDelta) {
      out.push(c);
      return;
    }
    const lighten = hexToLab(c)[0] < 55;
    let next = c;
    for (let t = 0.15; t <= 0.75 && deltaE76(prev, next) < minDelta; t += 0.15) {
      next = mix(c, lighten ? '#ffffff' : '#000000', t);
    }
    out.push(next);
  });
  return out;
}

export function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return NaN;
  const mx = xs.slice(0, n).reduce((s, v) => s + v, 0) / n;
  const my = ys.slice(0, n).reduce((s, v) => s + v, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : NaN;
}

/** Least-squares line y = slope * x + intercept. */
export function linearFit(xs: number[], ys: number[]): { slope: number; intercept: number } {
  const n = Math.min(xs.length, ys.length);
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
  }
  const slope = sxx ? sxy / sxx : 0;
  return { slope, intercept: my - slope * mx };
}

/** Mean of a country's last `years` non-null observations in a World Bank series. */
export function tenYearMean(series: CountryData[] | undefined, key: string, years = 10): number | undefined {
  if (!series?.length) return undefined;
  const vals = [...series]
    .sort((a, b) => Number(b.year) - Number(a.year))
    .map((r) => (r[key] == null ? NaN : Number(r[key])))
    .filter((v) => !Number.isNaN(v))
    .slice(0, years);
  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : undefined;
}

/** Latest non-null observation in a World Bank series. */
export function latestValue(series: CountryData[] | undefined, key: string): number | undefined {
  return latest(series, key).v;
}

/** Diverging red → amber → green scale; `t` is 0 (worst) .. 1 (best). */
export function scoreColor(t: number): string {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? mix('#dc2626', '#f59e0b', x / 0.5) : mix('#f59e0b', '#16a34a', (x - 0.5) / 0.5);
}

export const FORM_COLORS: Record<GovernmentForm, string> = {
  presidential: '#2563eb',
  parliamentary: '#16a34a',
  'semi-presidential': '#8b5cf6',
  'constitutional-monarchy': '#0ea5e9',
  'absolute-monarchy': '#b45309',
  'one-party-state': '#dc2626',
  'theocratic-republic': '#065f46',
  directorial: '#db2777',
};

export type IndexMetric = 'eiu' | 'freedomHouse' | 'rsf' | 'cpi' | 'women' | 'vdem';

export const INDEX_METRIC_LABELS: Record<IndexMetric, string> = {
  eiu: 'EIU Democracy Index (0-10)',
  freedomHouse: 'Freedom House (0-100)',
  rsf: 'RSF press freedom rank (1-180)',
  cpi: 'Corruption Perceptions (0-100)',
  women: 'Women in parliament (%)',
  vdem: 'V-Dem Liberal Democracy (0-1)',
};

export function metricValue(p: PoliticalProfile, m: IndexMetric): number {
  switch (m) {
    case 'eiu': return p.indices.eiu.score;
    case 'freedomHouse': return p.indices.freedomHouse.score;
    case 'rsf': return p.indices.rsfRank;
    case 'cpi': return p.indices.cpi;
    case 'women': return p.indices.womenInParliamentPct;
    case 'vdem': return p.indices.vdemLibDem[p.indices.vdemLibDem.length - 1] ?? 0;
  }
}

/** Normalises a metric to 0 (worst) .. 1 (best). */
export function metricScore(p: PoliticalProfile, m: IndexMetric): number {
  const v = metricValue(p, m);
  switch (m) {
    case 'eiu': return v / 10;
    case 'freedomHouse': return v / 100;
    case 'rsf': return 1 - (v - 1) / 179;
    case 'cpi': return v / 100;
    case 'women': return Math.min(1, v / 50);
    case 'vdem': return v;
  }
}

/** Equal-weighted 0-100 composite of the five curated freedom and integrity indices. */
export function compositeScore(p: PoliticalProfile): number {
  const parts: IndexMetric[] = ['eiu', 'freedomHouse', 'vdem', 'rsf', 'cpi'];
  return (parts.reduce((s, m) => s + metricScore(p, m), 0) / parts.length) * 100;
}

export function formatMetric(p: PoliticalProfile, m: IndexMetric): string {
  const v = metricValue(p, m);
  switch (m) {
    case 'eiu': return v.toFixed(2);
    case 'rsf': return `#${v}`;
    case 'women': return `${v.toFixed(0)}%`;
    case 'vdem': return v.toFixed(2);
    default: return v.toFixed(0);
  }
}
