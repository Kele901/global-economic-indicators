import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import worldCountries from 'world-countries';
import { COUNTRY_DISPLAY_NAMES, type CountryKey } from '../../utils/countryMappings';

const IMF_DATAMAPPER_URL = 'https://www.imf.org/external/datamapper/api/v1';

// IMF DataMapper labels for its regional and analytical aggregates.
const IMF_GROUP_NAMES: Record<string, string> = {
  WEOWORLD: 'World',
  ADVEC: 'Advanced economies',
  MAE: 'Major advanced economies (G7)',
  OAE: 'Other advanced economies',
  OEMDC: 'Emerging market and developing economies',
  EURO: 'Euro area',
  EU: 'European Union',
  DA: 'Emerging and developing Asia',
  AS5: 'ASEAN-5',
  EDE: 'Emerging and developing Europe',
  WE: 'Latin America and the Caribbean',
  MECA: 'Middle East and Central Asia',
  SSA: 'Sub-Saharan Africa',
  AFQ: 'Africa (region)',
  NAQ: 'North Africa',
  SSQ: 'Sub-Saharan Africa (region)',
  APQ: 'Asia and Pacific',
  AZQ: 'Australia and New Zealand',
  EAQ: 'East Asia',
  SAQ: 'South Asia',
  SEQ: 'Southeast Asia',
  PIQ: 'Pacific Islands',
  CAQ: 'Central Asia and the Caucasus',
  EUQ: 'Europe',
  EEQ: 'Eastern Europe',
  WEQ: 'Western Europe',
  MEQ: 'Middle East (region)',
  WHQ: 'Western Hemisphere (region)',
  NMQ: 'North America',
  CMQ: 'Central America',
  CBQ: 'Caribbean',
  SMQ: 'South America',
};

// IMF codes that differ from ISO 3166-1.
const IMF_NON_ISO: Record<string, { name: string; iso2: string }> = {
  UVK: { name: 'Kosovo', iso2: 'XK' },
  WBG: { name: 'West Bank and Gaza', iso2: 'PS' },
};

const COUNTRIES_BY_ISO3 = new Map(
  worldCountries.map(c => [c.cca3.toUpperCase(), { name: c.name.common, iso2: c.cca2.toUpperCase() }])
);

function describeCode(code: string, key: string): { name: string; iso2: string | null; isGroup: boolean } {
  const group = IMF_GROUP_NAMES[code];
  if (group) return { name: group, iso2: null, isGroup: true };
  const country = IMF_NON_ISO[code] ?? COUNTRIES_BY_ISO3.get(code);
  const name = COUNTRY_DISPLAY_NAMES[key as CountryKey] ?? country?.name ?? code;
  return { name, iso2: country?.iso2 ?? null, isGroup: !country };
}

const FIRST_YEAR = 2020;
const lastYear = () => new Date().getFullYear() + 5;

// The WEO is published in mid-April and mid-October.
function weoEditions(now: Date): { lastUpdate: string; nextUpdate: string } {
  const y = now.getUTCFullYear();
  const md = (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
  if (md >= 1015) return { lastUpdate: `October ${y}`, nextUpdate: `April ${y + 1}` };
  if (md >= 415) return { lastUpdate: `April ${y}`, nextUpdate: `October ${y}` };
  return { lastUpdate: `October ${y - 1}`, nextUpdate: `April ${y}` };
}

const INDICATORS: Record<string, string> = {
  gdpGrowth: 'NGDP_RPCH',
  inflation: 'PCPIPCH',
  unemployment: 'LUR',
  currentAccount: 'BCA_NGDPD',
  govDebt: 'GGXWDG_NGDP',
  govBalance: 'GGXCNL_NGDP',
};

const COUNTRY_CODES: Record<string, string> = {
  'World': 'WEOWORLD',
  'USA': 'USA',
  'China': 'CHN',
  'Japan': 'JPN',
  'Germany': 'DEU',
  'UK': 'GBR',
  'France': 'FRA',
  'India': 'IND',
  'Italy': 'ITA',
  'Brazil': 'BRA',
  'Canada': 'CAN',
  'Russia': 'RUS',
  'SouthKorea': 'KOR',
  'Australia': 'AUS',
  'Spain': 'ESP',
  'Mexico': 'MEX',
  'Indonesia': 'IDN',
  'Netherlands': 'NLD',
  'SaudiArabia': 'SAU',
  'Turkey': 'TUR',
  'Switzerland': 'CHE',
  'Poland': 'POL',
  'Sweden': 'SWE',
  'Belgium': 'BEL',
  'Argentina': 'ARG',
  'Norway': 'NOR',
  'SouthAfrica': 'ZAF',
  'Nigeria': 'NGA',
  'Egypt': 'EGY',
  'Chile': 'CHL',
};

const REGIONS: Record<string, string> = {
  'Advanced Economies': 'AE',
  'Emerging Markets': 'EME',
  'Euro Area': 'EURO',
  'ASEAN-5': 'ASEAN5',
  'Latin America': 'LAC',
  'Middle East': 'MENA',
  'Sub-Saharan Africa': 'SSA',
};

interface ProjectionData {
  country: string;
  countryCode: string;
  name: string;
  iso2: string | null;
  isGroup: boolean;
  metric: string;
  values: Record<number, number>;
}

async function fetchIMFIndicator(
  indicator: string,
  countries: string[]
): Promise<ProjectionData[]> {
  try {
    const countryParam = countries.join(',');
    const url = `${IMF_DATAMAPPER_URL}/${indicator}/${countryParam}`;
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    const results: ProjectionData[] = [];
    
    if (response.data?.values?.[indicator]) {
      const indicatorData = response.data.values[indicator];
      
      for (const [countryCode, yearData] of Object.entries(indicatorData)) {
        if (typeof yearData === 'object' && yearData !== null) {
          const countryName = Object.entries(COUNTRY_CODES).find(
            ([, code]) => code === countryCode
          )?.[0] || countryCode;
          
          const values: Record<number, number> = {};
          
          for (const [year, value] of Object.entries(yearData as Record<string, number>)) {
            const yearNum = parseInt(year);
            if (yearNum >= FIRST_YEAR && yearNum <= lastYear() && typeof value === 'number') {
              values[yearNum] = Math.round(value * 100) / 100;
            }
          }
          
          if (Object.keys(values).length > 0) {
            results.push({
              country: countryName,
              countryCode,
              ...describeCode(countryCode, countryName),
              metric: indicator,
              values
            });
          }
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error(`IMF fetch error for ${indicator}:`, error);
    return [];
  }
}

async function fetchRegionalData(indicator: string): Promise<ProjectionData[]> {
  try {
    const regionCodes = Object.values(REGIONS).join(',');
    const url = `${IMF_DATAMAPPER_URL}/${indicator}/${regionCodes}`;
    
    const response = await axios.get(url, { timeout: 15000 });
    const results: ProjectionData[] = [];
    
    if (response.data?.values?.[indicator]) {
      const indicatorData = response.data.values[indicator];
      
      for (const [regionCode, yearData] of Object.entries(indicatorData)) {
        if (typeof yearData === 'object' && yearData !== null) {
          const regionName = Object.entries(REGIONS).find(
            ([, code]) => code === regionCode
          )?.[0] || regionCode;
          
          const values: Record<number, number> = {};
          
          for (const [year, value] of Object.entries(yearData as Record<string, number>)) {
            const yearNum = parseInt(year);
            if (yearNum >= 2024 && yearNum <= lastYear() && typeof value === 'number') {
              values[yearNum] = Math.round(value * 100) / 100;
            }
          }
          
          if (Object.keys(values).length > 0) {
            results.push({
              country: regionName,
              countryCode: regionCode,
              ...describeCode(regionCode, regionName),
              metric: indicator,
              values
            });
          }
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error(`IMF regional fetch error for ${indicator}:`, error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const metric = searchParams.get('metric') || 'gdpGrowth';
    const type = searchParams.get('type') || 'countries';
    
    const indicatorCode = INDICATORS[metric];
    
    if (!indicatorCode) {
      return NextResponse.json(
        { error: `Unknown metric: ${metric}. Valid options: ${Object.keys(INDICATORS).join(', ')}` },
        { status: 400 }
      );
    }
    
    let data: ProjectionData[];
    
    if (type === 'regions') {
      data = await fetchRegionalData(indicatorCode);
    } else {
      const countryCodes = Object.values(COUNTRY_CODES);
      data = await fetchIMFIndicator(indicatorCode, countryCodes);
    }
    
    const weoInfo = { source: 'IMF World Economic Outlook', ...weoEditions(new Date()) };
    
    return NextResponse.json({
      metric,
      indicatorCode,
      type,
      data,
      weoInfo,
      fetchedAt: new Date().toISOString(),
      count: data.length
    });
    
  } catch (error: any) {
    console.error('IMF WEO API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch IMF projections', details: error.message },
      { status: 500 }
    );
  }
}
