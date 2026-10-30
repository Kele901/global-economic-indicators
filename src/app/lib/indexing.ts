import type { Metadata } from 'next';

// Country slugs whose /country, /politics-ledger and /development profiles may be
// indexed. Profiles are templated across 47 countries, so each one stays out of
// search until it carries its own written commentary; add its slug here then.
export const INDEXED_COUNTRY_SLUGS: ReadonlySet<string> = new Set<string>([]);

export function isCountryIndexed(slug: string): boolean {
  return INDEXED_COUNTRY_SLUGS.has(slug);
}

export function countryProfileRobots(slug: string): Metadata['robots'] {
  return isCountryIndexed(slug) ? undefined : { index: false, follow: true };
}
