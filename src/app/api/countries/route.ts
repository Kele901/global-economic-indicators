import { NextResponse } from 'next/server';
import worldCountries from 'world-countries';

// Country names and regions for the passport views, bundled from the open
// mledoze/countries dataset that REST Countries was built on. REST Countries
// retired its keyless v3.1 API, and this data only changes with the package.

const SOURCE_URL = 'https://github.com/mledoze/countries';

export const dynamic = 'force-static';

export interface CountrySummary {
  iso2: string;
  iso3: string;
  commonName: string;
  flagEmoji: string;
  region: string;
  subregion: string;
  capital: string;
}

export interface CountriesResponse {
  countries: Record<string, CountrySummary>;
  sourceUrl: string;
  count: number;
}

export function GET() {
  const countries: Record<string, CountrySummary> = {};
  for (const c of worldCountries) {
    const iso2 = c.cca2.toUpperCase();
    countries[iso2] = {
      iso2,
      iso3: c.cca3.toUpperCase(),
      commonName: c.name.common,
      flagEmoji: c.flag,
      region: c.region,
      subregion: c.subregion,
      capital: c.capital[0] ?? '',
    };
  }

  const payload: CountriesResponse = { countries, sourceUrl: SOURCE_URL, count: Object.keys(countries).length };
  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400' },
  });
}
