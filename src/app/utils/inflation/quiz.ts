import type { CountryData } from '../../services/worldbank';
import { COUNTRY_KEYS, type CountryKey } from '../countryMappings';
import { seriesOf, type Obs } from './stats';

export interface LineQuestion {
  answer: CountryKey;
  options: CountryKey[];
  series: Obs[];
}

export function eligibleCountries(
  rows: CountryData[] | undefined,
  fromYear: number,
  minYears: number,
  keys: readonly CountryKey[] = COUNTRY_KEYS,
): CountryKey[] {
  return keys.filter((k) => seriesOf(rows, k).filter((o) => o.year >= fromYear).length >= minYears);
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// "Guess the country from its inflation line": one answer plus three
// distractors, all drawn from countries with enough history to plot.
export function lineQuestion(
  rows: CountryData[] | undefined,
  rng: () => number,
  fromYear = 1990,
  minYears = 20,
  optionCount = 4,
): LineQuestion | null {
  const pool = eligibleCountries(rows, fromYear, minYears);
  if (pool.length < optionCount) return null;
  const picked = shuffle(pool, rng).slice(0, optionCount);
  const answer = picked[0];
  return {
    answer,
    options: shuffle(picked, rng),
    series: seriesOf(rows, answer).filter((o) => o.year >= fromYear),
  };
}
