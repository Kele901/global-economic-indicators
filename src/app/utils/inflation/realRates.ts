import type { CountryData } from '../../services/worldbank';
import { COUNTRY_KEYS, type CountryKey } from '../countryMappings';
import type { InflationTarget } from '../../data/inflationTargets';
import { seriesOf, valueAt } from './stats';

// fetchAllPolicyRates returns { USA: [{year, value}], ... }; pivot it into the
// CountryData row shape every chart on the site already understands.
export function policyRatesToRows(byCountry: Record<string, { year: number; value: number }[]>): CountryData[] {
  const byYear = new Map<number, CountryData>();
  for (const [key, points] of Object.entries(byCountry)) {
    for (const p of points) {
      if (!Number.isFinite(p.value)) continue;
      const row = byYear.get(p.year) ?? { year: p.year };
      row[key] = p.value;
      byYear.set(p.year, row);
    }
  }
  return [...byYear.values()].sort((a, b) => a.year - b.year);
}

export const realRate = (nominal: number, inflation: number) => nominal - inflation;

export interface RealRatePoint {
  year: number;
  policy: number;
  inflation: number;
  real: number;
  /** Split for an area chart that shades positive and negative real rates separately. */
  positive: number | null;
  negative: number | null;
}

export function realRateSeries(
  policyRows: CountryData[] | undefined,
  inflationRows: CountryData[] | undefined,
  key: string,
  fromYear = 0,
): RealRatePoint[] {
  const out: RealRatePoint[] = [];
  for (const p of seriesOf(policyRows, key)) {
    if (p.year < fromYear) continue;
    const inf = valueAt(inflationRows, key, p.year);
    if (inf == null) continue;
    const real = realRate(p.value, inf);
    out.push({
      year: p.year,
      policy: p.value,
      inflation: inf,
      real,
      positive: real >= 0 ? real : null,
      negative: real < 0 ? real : null,
    });
  }
  return out;
}

export type Stance = 'behind' | 'tight' | 'loose' | 'on-track';

export const STANCE_META: Record<Stance, { label: string; color: string; blurb: string }> = {
  behind: { label: 'Behind the curve', color: '#dc2626', blurb: 'Inflation above target and real policy rate at or below zero.' },
  tight: { label: 'Tight', color: '#2563eb', blurb: 'Real policy rate positive while inflation is off target.' },
  loose: { label: 'Loose', color: '#f59e0b', blurb: 'Inflation below target with a zero or negative real rate.' },
  'on-track': { label: 'On track', color: '#10b981', blurb: 'Inflation within the tolerance band around target.' },
};

// Tolerance is the bank's own band, but never narrower than 1pp so a pure
// point target doesn't flag every 0.2pp miss.
export function classifyStance(inflation: number, real: number, target: number, band = 0): Stance {
  const tol = Math.max(band, 1);
  const gap = inflation - target;
  if (Math.abs(gap) <= tol) return 'on-track';
  if (real > 0) return 'tight';
  return gap > 0 ? 'behind' : 'loose';
}

export interface StancePoint {
  key: CountryKey;
  gap: number;
  real: number;
  inflation: number;
  policy: number;
  stance: Stance;
}

export function stancePoints(
  year: number,
  policyRows: CountryData[] | undefined,
  inflationRows: CountryData[] | undefined,
  targets: Partial<Record<CountryKey, InflationTarget>>,
  keys: readonly CountryKey[] = COUNTRY_KEYS,
): StancePoint[] {
  const out: StancePoint[] = [];
  for (const key of keys) {
    const t = targets[key];
    if (!t || t.target == null) continue;
    const policy = valueAt(policyRows, key, year);
    const inflation = valueAt(inflationRows, key, year);
    if (policy == null || inflation == null) continue;
    const real = realRate(policy, inflation);
    out.push({ key, gap: inflation - t.target, real, inflation, policy, stance: classifyStance(inflation, real, t.target, t.band) });
  }
  return out;
}

// Years where at least `min` countries have both series, for the stance player.
export function stanceYears(
  policyRows: CountryData[] | undefined,
  inflationRows: CountryData[] | undefined,
  targets: Partial<Record<CountryKey, InflationTarget>>,
  min = 5,
): number[] {
  const years = new Set((policyRows ?? []).map((r) => Number(r.year)));
  return [...years]
    .filter((y) => stancePoints(y, policyRows, inflationRows, targets).length >= min)
    .sort((a, b) => a - b);
}
