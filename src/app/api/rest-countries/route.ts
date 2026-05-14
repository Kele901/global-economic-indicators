import { NextResponse } from 'next/server';

const REST_COUNTRIES_URL =
  'https://restcountries.com/v3.1/all?fields=cca2,cca3,name,flag,flags,region,subregion,capital,population';

export interface RestCountrySummary {
  iso2: string;
  iso3: string;
  commonName: string;
  officialName: string;
  flagEmoji: string;
  flagPng: string;
  region: string;
  subregion: string;
  capital: string;
  population: number;
  currencies: string[];
  languages: string[];
  unMember: boolean;
}

export interface RestCountriesResponse {
  countries: Record<string, RestCountrySummary>;
  updatedAt: string;
  sourceUrl: string;
  count: number;
}

export async function GET() {
  try {
    const response = await fetch(REST_COUNTRIES_URL, {
      next: { revalidate: 60 * 60 * 24 * 7 },
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`REST Countries HTTP ${response.status}`);
    }

    const raw = (await response.json()) as any[];
    const countries: Record<string, RestCountrySummary> = {};

    raw.forEach((c) => {
      const iso2 = (c?.cca2 || '').toUpperCase();
      if (!iso2) return;
      countries[iso2] = {
        iso2,
        iso3: (c?.cca3 || '').toUpperCase(),
        commonName: c?.name?.common || iso2,
        officialName: c?.name?.official || c?.name?.common || iso2,
        flagEmoji: c?.flag || '',
        flagPng: c?.flags?.png || c?.flags?.svg || '',
        region: c?.region || '',
        subregion: c?.subregion || '',
        capital: Array.isArray(c?.capital) ? c.capital[0] || '' : c?.capital || '',
        population: typeof c?.population === 'number' ? c.population : 0,
        currencies: c?.currencies ? Object.keys(c.currencies) : [],
        languages: c?.languages ? Object.values(c.languages).map((l: any) => String(l)) : [],
        unMember: Boolean(c?.unMember),
      };
    });

    const payload: RestCountriesResponse = {
      countries,
      updatedAt: new Date().toISOString(),
      sourceUrl: REST_COUNTRIES_URL,
      count: Object.keys(countries).length,
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('[REST Countries API] Failed:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch REST Countries data', details: error?.message || String(error) },
      { status: 502 }
    );
  }
}
