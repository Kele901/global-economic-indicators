import { COUNTRY_KEYS, type CountryKey } from '../countryMappings';
import { valuesForYear, type HeatmapData } from './values';

export interface ScreenerCondition {
  metric: string;
  op: '>' | '<';
  value: number;
}

// Countries meeting every condition. A country without data for one of the
// metrics is excluded rather than given the benefit of the doubt.
export function applyScreener(data: HeatmapData, year: number, conditions: ScreenerCondition[]): CountryKey[] {
  const valid = conditions.filter(c => c.metric && Number.isFinite(c.value));
  if (valid.length === 0) return [];
  const maps = valid.map(c => ({ c, values: valuesForYear(data, c.metric, year) }));
  return COUNTRY_KEYS.filter(ck =>
    maps.every(({ c, values }) => {
      const v = values[ck];
      return v !== undefined && (c.op === '>' ? v > c.value : v < c.value);
    }),
  );
}
