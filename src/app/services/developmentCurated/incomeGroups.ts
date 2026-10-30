import { COUNTRY_KEYS, getRegionFor, type CountryKey } from '../../utils/countryMappings';
import { INCOME_GROUP_SNAPSHOT } from './snapshotData';
import type { IncomeGroup } from './types';

export const INCOME_GROUP_ORDER: IncomeGroup[] = [
  'High income',
  'Upper-middle income',
  'Lower-middle income',
  'Low income',
];

export const INCOME_GROUPS = INCOME_GROUP_SNAPSHOT as Record<CountryKey, IncomeGroup>;

export function getIncomeGroup(key: CountryKey): IncomeGroup | undefined {
  return INCOME_GROUPS[key];
}

// Peers share the income group, with same-region peers listed first.
export function getPeers(key: CountryKey, limit = 8): CountryKey[] {
  const group = INCOME_GROUPS[key];
  if (!group) return [];
  const region = getRegionFor(key);
  const sameGroup = COUNTRY_KEYS.filter((k) => k !== key && INCOME_GROUPS[k] === group);
  const sameRegion = sameGroup.filter((k) => getRegionFor(k) === region);
  const rest = sameGroup.filter((k) => getRegionFor(k) !== region);
  return [...sameRegion, ...rest].slice(0, limit);
}
