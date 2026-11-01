import type { CountryData } from '../../services/worldbank';
import type { CityId } from '../../data/cities';
import type { CountryKey } from '../countryMappings';
import type { PriceRow } from '../../data/costOfLiving';
import { seriesOf } from './stats';

// Country whose official exchange rate converts each city's prices.
export const CITY_COUNTRY: Record<CityId, CountryKey> = {
  london: 'UK',
  paris: 'France',
  tokyo: 'Japan',
  newYork: 'USA',
};

export interface FxQuote {
  rate: number;
  /** Year the rate comes from; earlier than requested when that year isn't published yet. */
  year: number;
}

// Local currency per US dollar for `year`, falling back to the latest earlier
// year. The USA row in the shared exchange-rate series is a trade-weighted
// dollar index, not a conversion rate, so dollars always convert at 1.
export function lcuPerUsd(fxRows: CountryData[] | undefined, key: CountryKey, year: number): FxQuote | null {
  if (key === 'USA') return { rate: 1, year };
  let best: FxQuote | null = null;
  for (const o of seriesOf(fxRows, key)) {
    if (o.year > year) break;
    if (o.value > 0) best = { rate: o.value, year: o.year };
  }
  return best;
}

export function toUsd(value: number | null | undefined, quote: FxQuote | null): number | null {
  if (value == null || !quote) return null;
  return value / quote.rate;
}

export function rowsToUsd(rows: PriceRow[], fxRows: CountryData[] | undefined, key: CountryKey): PriceRow[] {
  return rows.map((row) => {
    const q = lcuPerUsd(fxRows, key, row.year);
    const out: PriceRow = { year: row.year };
    for (const [k, v] of Object.entries(row)) {
      if (k === 'year') continue;
      out[k] = toUsd(v, q);
    }
    return out;
  });
}
