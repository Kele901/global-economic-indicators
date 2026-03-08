import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const IMF_DATAMAPPER_URL = 'https://www.imf.org/external/datamapper/api/v1';

const INDICATORS: Record<string, string> = {
  gdpGrowth: 'NGDP_RPCH',
  inflation: 'PCPIPCH',
  unemployment: 'LUR',
  currentAccount: 'BCA_NGDPD',
  govDebt: 'GGXWDG_NGDP',
  govBalance: 'GGXCNL_NGDP',
};

const COUNTRY_CODES: Record<string, string> = {
  'World': 'WORLD',
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
            if (yearNum >= 2020 && yearNum <= 2029 && typeof value === 'number') {
              values[yearNum] = Math.round(value * 100) / 100;
            }
          }
          
          if (Object.keys(values).length > 0) {
            results.push({
              country: countryName,
              countryCode,
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
            if (yearNum >= 2024 && yearNum <= 2029 && typeof value === 'number') {
              values[yearNum] = Math.round(value * 100) / 100;
            }
          }
          
          if (Object.keys(values).length > 0) {
            results.push({
              country: regionName,
              countryCode: regionCode,
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
    
    const weoInfo = {
      source: 'IMF World Economic Outlook',
      lastUpdate: 'October 2024',
      nextUpdate: 'April 2025',
    };
    
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
