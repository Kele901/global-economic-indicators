import axios from "axios";
import { clientCache } from "./clientCache";

// FRED-hosted BIS Residential Property Price series.
// Pattern: Q{ISO2}R628BIS = Real (CPI-deflated), Q{ISO2}N628BIS = Nominal.
// All series are quarterly, Index 2010 = 100, Not Seasonally Adjusted.
// Source: https://fred.stlouisfed.org/release?rid=336 (BIS Selected Property Prices).
const REAL_HOUSE_PRICE_SERIES: { [country: string]: string } = {
  USA: 'QUSR628BIS',
  Canada: 'QCAR628BIS',
  UK: 'QGBR628BIS',
  France: 'QFRR628BIS',
  Germany: 'QDER628BIS',
  Italy: 'QITR628BIS',
  Japan: 'QJPR628BIS',
  Australia: 'QAUR628BIS',
  Mexico: 'QMXR628BIS',
  SouthKorea: 'QKRR628BIS',
  Spain: 'QESR628BIS',
  Sweden: 'QSER628BIS',
  Switzerland: 'QCHR628BIS',
  Turkey: 'QTRR628BIS',
  China: 'QCNR628BIS',
  Brazil: 'QBRR628BIS',
  Chile: 'QCLR628BIS',
  India: 'QINR628BIS',
  Norway: 'QNOR628BIS',
  Netherlands: 'QNLR628BIS',
  Portugal: 'QPTR628BIS',
  Belgium: 'QBER628BIS',
  Indonesia: 'QIDR628BIS',
  SouthAfrica: 'QZAR628BIS',
  Poland: 'QPLR628BIS',
  Israel: 'QILR628BIS',
  Singapore: 'QSGR628BIS',
};

const NOMINAL_HOUSE_PRICE_SERIES: { [country: string]: string } = {
  USA: 'QUSN628BIS',
  Canada: 'QCAN628BIS',
  UK: 'QGBN628BIS',
  France: 'QFRN628BIS',
  Germany: 'QDEN628BIS',
  Italy: 'QITN628BIS',
  Japan: 'QJPN628BIS',
  Australia: 'QAUN628BIS',
  Mexico: 'QMXN628BIS',
  SouthKorea: 'QKRN628BIS',
  Spain: 'QESN628BIS',
  Sweden: 'QSEN628BIS',
  Switzerland: 'QCHN628BIS',
  Turkey: 'QTRN628BIS',
  China: 'QCNN628BIS',
  Brazil: 'QBRN628BIS',
  Chile: 'QCLN628BIS',
  India: 'QINN628BIS',
  Norway: 'QNON628BIS',
  Netherlands: 'QNLN628BIS',
  Portugal: 'QPTN628BIS',
  Belgium: 'QBEN628BIS',
  Indonesia: 'QIDN628BIS',
  SouthAfrica: 'QZAN628BIS',
  Poland: 'QPLN628BIS',
  Israel: 'QILN628BIS',
  Singapore: 'QSGN628BIS',
};

export interface HousePricePoint {
  year: number;
  value: number;
}

// Fetch a single FRED series and aggregate quarterly observations to annual averages.
async function fetchSeries(
  country: string,
  seriesId: string,
  cachePrefix: string,
  startDate: string = '1970-01-01',
  endDate: string = '2026-12-31'
): Promise<HousePricePoint[]> {
  try {
    const cacheKey = `${cachePrefix}_${country}`;
    const cached = clientCache.get<HousePricePoint[]>(cacheKey);
    if (cached) {
      console.log(`✅ Using cached ${cachePrefix} for ${country}`);
      return cached;
    }

    const url = `/api/fred?series_id=${seriesId}&observation_start=${startDate}&observation_end=${endDate}`;
    console.log(`🏠 Fetching ${cachePrefix} for ${country} (${seriesId})...`);

    const response = await axios.get(url, { timeout: 10000 });

    if (!response.data?.observations) {
      console.warn(`⚠️ No ${cachePrefix} data found for ${country}`);
      return [];
    }

    const yearlyData: { [year: number]: number[] } = {};
    response.data.observations.forEach((obs: any) => {
      const value = parseFloat(obs.value);
      if (!isNaN(value) && obs.value !== '.') {
        const year = parseInt(obs.date.split('-')[0]);
        if (!yearlyData[year]) yearlyData[year] = [];
        yearlyData[year].push(value);
      }
    });

    const result: HousePricePoint[] = Object.entries(yearlyData)
      .map(([year, values]) => ({
        year: parseInt(year),
        value: values.reduce((sum, v) => sum + v, 0) / values.length
      }))
      .sort((a, b) => a.year - b.year);

    clientCache.set(cacheKey, result, 1000 * 60 * 60 * 24);
    console.log(`✅ ${cachePrefix} for ${country}: ${result.length} years (latest: ${result[result.length - 1]?.year})`);
    return result;
  } catch (error: any) {
    if (error.response?.status !== 404) {
      console.error(`❌ Error fetching ${cachePrefix} for ${country}:`, error.message);
    }
    return [];
  }
}

// Fetch real and nominal residential property price indices for all supported countries.
export async function fetchHousePrices(): Promise<{
  real: { [country: string]: HousePricePoint[] };
  nominal: { [country: string]: HousePricePoint[] };
}> {
  console.log('🏠 ========================================');
  console.log('🏠 Fetching House Prices (FRED-hosted BIS)...');
  console.log('🏠 ========================================');

  const realPromises = Object.entries(REAL_HOUSE_PRICE_SERIES).map(async ([country, seriesId]) => ({
    country,
    data: await fetchSeries(country, seriesId, 'house_real')
  }));
  const nominalPromises = Object.entries(NOMINAL_HOUSE_PRICE_SERIES).map(async ([country, seriesId]) => ({
    country,
    data: await fetchSeries(country, seriesId, 'house_nominal')
  }));

  const [realResults, nominalResults] = await Promise.all([
    Promise.allSettled(realPromises),
    Promise.allSettled(nominalPromises),
  ]);

  const real: { [country: string]: HousePricePoint[] } = {};
  const nominal: { [country: string]: HousePricePoint[] } = {};

  realResults.forEach(r => {
    if (r.status === 'fulfilled' && r.value.data.length > 0) {
      real[r.value.country] = r.value.data;
    }
  });
  nominalResults.forEach(r => {
    if (r.status === 'fulfilled' && r.value.data.length > 0) {
      nominal[r.value.country] = r.value.data;
    }
  });

  console.log(`🏠 House prices fetched: real=${Object.keys(real).length} countries, nominal=${Object.keys(nominal).length} countries`);
  return { real, nominal };
}

export function clearHousePricesCache(): void {
  Object.keys(REAL_HOUSE_PRICE_SERIES).forEach(c => clientCache.delete(`house_real_${c}`));
  Object.keys(NOMINAL_HOUSE_PRICE_SERIES).forEach(c => clientCache.delete(`house_nominal_${c}`));
  console.log('✅ Cleared house prices cached data');
}
