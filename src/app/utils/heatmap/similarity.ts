import { COUNTRY_KEYS, type CountryKey } from '../countryMappings';
import { valuesForYear, type CountryValues, type HeatmapData } from './values';

export interface SimilarCountry {
  country: CountryKey;
  distance: number;
  // Metrics on which the two countries sit within half a standard deviation.
  closeOn: string[];
}

function zScores(values: CountryValues): Partial<Record<CountryKey, number>> {
  const vs = Object.values(values) as number[];
  if (vs.length < 3) return {};
  const mean = vs.reduce((s, v) => s + v, 0) / vs.length;
  const sd = Math.sqrt(vs.reduce((s, v) => s + (v - mean) ** 2, 0) / vs.length);
  if (sd === 0) return {};
  const out: Partial<Record<CountryKey, number>> = {};
  for (const [ck, v] of Object.entries(values) as [CountryKey, number][]) out[ck] = (v - mean) / sd;
  return out;
}

export function similarCountries(
  data: HeatmapData,
  country: CountryKey,
  metrics: string[],
  year: number,
  n = 4,
): SimilarCountry[] {
  const z = metrics.map(m => ({ metric: m, scores: zScores(valuesForYear(data, m, year)) }));
  const usable = z.filter(({ scores }) => scores[country] !== undefined);
  if (usable.length === 0) return [];
  const minShared = Math.min(2, usable.length);

  const out: SimilarCountry[] = [];
  for (const other of COUNTRY_KEYS) {
    if (other === country) continue;
    let sum = 0;
    let shared = 0;
    const closeOn: string[] = [];
    for (const { metric, scores } of usable) {
      const o = scores[other];
      if (o === undefined) continue;
      const d = scores[country]! - o;
      sum += d * d;
      shared++;
      if (Math.abs(d) < 0.5) closeOn.push(metric);
    }
    if (shared < minShared) continue;
    out.push({ country: other, distance: Math.sqrt(sum / shared), closeOn });
  }
  return out.sort((a, b) => a.distance - b.distance).slice(0, n);
}
