import type { CountryData } from '../worldbank';
import { GLOBAL_INCOME_CDF } from './snapshotData';

export interface Obs {
  year: number;
  value: number;
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

// Missing World Bank observations are dropped at load time, so any stored
// number, including 0, is a real observation.
export function seriesFor(series: CountryData[] | undefined, key: string): Obs[] {
  if (!series?.length) return [];
  const out: Obs[] = [];
  for (const row of series) {
    const v = (row as Record<string, unknown>)[key];
    if (isNum(v)) out.push({ year: Number(row.year), value: v });
  }
  return out.sort((a, b) => a.year - b.year);
}

export function latestObs(series: CountryData[] | undefined, key: string, minYear = 0): Obs | null {
  const s = seriesFor(series, key);
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i].year >= minYear) return s[i];
  }
  return null;
}

export function latestValue(series: CountryData[] | undefined, key: string): number | null {
  return latestObs(series, key)?.value ?? null;
}

export function valueAt(series: CountryData[] | undefined, key: string, year: number): number | null {
  const hit = seriesFor(series, key).find((o) => o.year === year);
  return hit ? hit.value : null;
}

export function nearestObs(series: CountryData[] | undefined, key: string, year: number, maxGap = 3): Obs | null {
  let best: Obs | null = null;
  for (const o of seriesFor(series, key)) {
    const gap = Math.abs(o.year - year);
    if (gap <= maxGap && (!best || gap < Math.abs(best.year - year))) best = o;
  }
  return best;
}

// Compound annual growth between two observations, using the real span of years.
export function cagr(first: Obs | null, last: Obs | null): number | null {
  if (!first || !last) return null;
  const span = last.year - first.year;
  if (span <= 0 || first.value <= 0 || last.value <= 0) return null;
  return (Math.pow(last.value / first.value, 1 / span) - 1) * 100;
}

export function median(values: (number | null | undefined)[]): number | null {
  const v = values.filter(isNum).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

export interface YearsBehind {
  countryYear: number;
  countryValue: number;
  leaderYear: number;
  gap: number;
  // True when the leader was already past this level before its data starts,
  // so the true gap is at least `gap`.
  beforeData: boolean;
  ahead: boolean;
}

// How many years ago the leader reached the country's latest level.
export function yearsBehind(
  country: Obs[],
  leader: Obs[],
  higherIsBetter = true
): YearsBehind | null {
  if (!country.length || !leader.length) return null;
  const latest = country[country.length - 1];
  const better = (a: number, b: number) => (higherIsBetter ? a >= b : a <= b);
  const leaderLatest = leader[leader.length - 1];
  if (!better(leaderLatest.value, latest.value) || leaderLatest.value === latest.value) {
    return { countryYear: latest.year, countryValue: latest.value, leaderYear: latest.year, gap: 0, beforeData: false, ahead: true };
  }
  const hit = leader.find((o) => better(o.value, latest.value));
  if (!hit) return null;
  const beforeData = hit === leader[0];
  return {
    countryYear: latest.year,
    countryValue: latest.value,
    leaderYear: hit.year,
    gap: Math.max(0, latest.year - hit.year),
    beforeData,
    ahead: false,
  };
}

export interface Projection {
  value: number;
  slope: number;
  fromYear: number;
  toYear: number;
}

// Least-squares line through the last `window` years of observations.
export function linearProjection(points: Obs[], targetYear: number, window = 10): Projection | null {
  if (points.length < 2) return null;
  const lastYear = points[points.length - 1].year;
  const pts = points.filter((p) => p.year > lastYear - window);
  if (pts.length < 2) return null;
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p.year, 0) / n;
  const my = pts.reduce((s, p) => s + p.value, 0) / n;
  let num = 0;
  let den = 0;
  for (const p of pts) {
    num += (p.year - mx) * (p.value - my);
    den += (p.year - mx) ** 2;
  }
  if (den === 0) return null;
  const slope = num / den;
  return { value: my + slope * (targetYear - mx), slope, fromYear: pts[0].year, toYear: targetYear };
}

export type SdgStatus = 'achieved' | 'on-track' | 'off-track' | 'no-data';

export interface SdgTarget {
  id: string;
  goal: number;
  label: string;
  // Alias in the live development dataset.
  series: string;
  target: number;
  direction: 'below' | 'above';
  unit: string;
}

export const SDG_TARGETS: SdgTarget[] = [
  { id: '1.1', goal: 1, label: 'Extreme poverty below 3%', series: 'poverty300', target: 3, direction: 'below', unit: '%' },
  { id: '2.2', goal: 2, label: 'Child stunting below 5%', series: 'stunting', target: 5, direction: 'below', unit: '%' },
  { id: '3.1', goal: 3, label: 'Maternal deaths below 70 per 100k', series: 'maternalMortality', target: 70, direction: 'below', unit: '' },
  { id: '3.2', goal: 3, label: 'Under-5 deaths at or below 25 per 1k', series: 'under5Mortality', target: 25, direction: 'below', unit: '' },
  { id: '3.8', goal: 3, label: 'UHC service coverage at least 80', series: 'uhcCoverage', target: 80, direction: 'above', unit: '' },
  { id: '4.1', goal: 4, label: 'Primary completion at least 95%', series: 'primaryCompletion', target: 95, direction: 'above', unit: '%' },
  { id: '5.5', goal: 5, label: 'Women hold at least 40% of seats', series: 'womenParliament', target: 40, direction: 'above', unit: '%' },
  { id: '6.1', goal: 6, label: 'Basic drinking water at least 99%', series: 'basicWater', target: 99, direction: 'above', unit: '%' },
  { id: '6.2', goal: 6, label: 'Basic sanitation at least 99%', series: 'basicSanitation', target: 99, direction: 'above', unit: '%' },
  { id: '7.1', goal: 7, label: 'Electricity access at least 99%', series: 'electricityAccess', target: 99, direction: 'above', unit: '%' },
  { id: '8.10', goal: 8, label: 'Account ownership at least 90%', series: 'accountOwnership', target: 90, direction: 'above', unit: '%' },
  { id: '9.c', goal: 9, label: 'Internet use at least 90%', series: 'internetUsers', target: 90, direction: 'above', unit: '%' },
];

export function sdgStatus(points: Obs[], target: SdgTarget, year = 2030): { status: SdgStatus; latest: Obs | null; projected: number | null } {
  if (!points.length) return { status: 'no-data', latest: null, projected: null };
  const latest = points[points.length - 1];
  const meets = (v: number) => (target.direction === 'below' ? v <= target.target : v >= target.target);
  if (meets(latest.value)) return { status: 'achieved', latest, projected: latest.value };
  const proj = linearProjection(points, year);
  if (!proj) return { status: 'off-track', latest, projected: null };
  return { status: meets(proj.value) ? 'on-track' : 'off-track', latest, projected: proj.value };
}

export interface HdiComponents {
  lifeExpectancy: number;
  expectedSchooling: number;
  meanSchooling: number;
  gniPerCapita: number;
}

// UNDP HDI method: geometric mean of three dimension indices with fixed goalposts.
export function undpHdi(c: HdiComponents): { hdi: number; health: number; education: number; income: number } {
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const health = clamp((c.lifeExpectancy - 20) / (85 - 20));
  const education = clamp((Math.min(c.expectedSchooling, 18) / 18 + Math.min(c.meanSchooling, 15) / 15) / 2);
  const income = clamp(
    (Math.log(Math.min(Math.max(c.gniPerCapita, 100), 75000)) - Math.log(100)) / (Math.log(75000) - Math.log(100))
  );
  return { hdi: Math.cbrt(health * education * income), health, education, income };
}

// Weighted mean of 0-100 scores, renormalising weights over the dimensions
// that have data so a missing value doesn't count as zero.
export function indexScore(values: Record<string, number | null | undefined>, weights: Record<string, number>): number | null {
  let sum = 0;
  let wsum = 0;
  for (const [dim, w] of Object.entries(weights)) {
    const v = values[dim];
    if (!isNum(v) || w <= 0) continue;
    sum += v * w;
    wsum += w;
  }
  return wsum > 0 ? sum / wsum : null;
}

export function normalise(value: number | null | undefined, min: number, max: number, invert = false): number | null {
  if (!isNum(value) || max === min) return null;
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return (invert ? 1 - t : t) * 100;
}

// Share of the world population with a lower daily income, interpolated on a
// log-income scale between PIP poverty-line headcounts.
export function globalPercentile(dailyIncome: number): number {
  const cdf = GLOBAL_INCOME_CDF;
  if (!(dailyIncome > 0)) return 0;
  if (dailyIncome <= cdf[0].dailyIncome) return (cdf[0].shareBelow * dailyIncome) / cdf[0].dailyIncome;
  const last = cdf[cdf.length - 1];
  if (dailyIncome >= last.dailyIncome) {
    const extra = Math.log(dailyIncome / last.dailyIncome);
    return Math.min(99.99, last.shareBelow + (100 - last.shareBelow) * (1 - Math.exp(-extra)));
  }
  for (let i = 1; i < cdf.length; i++) {
    const a = cdf[i - 1];
    const b = cdf[i];
    if (dailyIncome <= b.dailyIncome) {
      const t = (Math.log(dailyIncome) - Math.log(a.dailyIncome)) / (Math.log(b.dailyIncome) - Math.log(a.dailyIncome));
      return a.shareBelow + t * (b.shareBelow - a.shareBelow);
    }
  }
  return last.shareBelow;
}
