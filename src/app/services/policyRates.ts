import axios from "axios";
import { clientCache } from "./clientCache";

// FRED Series IDs for Central Bank Policy Rates (More Current Data)
// These are typically updated monthly and have more recent data than World Bank
// Using IRSTCI01 (Call Money/Interbank Rate) series which are more widely available
const POLICY_RATE_SERIES: { [country: string]: string } = {
  USA: 'FEDFUNDS', // Federal Funds Effective Rate
  Canada: 'IRSTCI01CAM156N', // Immediate Rates: Call Money/Interbank Rate for Canada
  UK: 'IRSTCI01GBM156N', // Immediate Rates: Call Money/Interbank Rate for United Kingdom
  Japan: 'IRSTCI01JPM156N', // Immediate Rates: Call Money/Interbank Rate for Japan
  Australia: 'IRSTCI01AUM156N', // Immediate Rates: Call Money/Interbank Rate for Australia
  SouthKorea: 'IRSTCI01KRM156N', // Immediate Rates: Call Money/Interbank Rate for South Korea
  Switzerland: 'IRSTCI01CHM156N', // Immediate Rates: Call Money/Interbank Rate for Switzerland
  Sweden: 'IRSTCI01SEM156N', // Immediate Rates: Call Money/Interbank Rate for Sweden
  Norway: 'IRSTCI01NOM156N', // Immediate Rates: Call Money/Interbank Rate for Norway
  Mexico: 'IRSTCI01MXM156N', // Immediate Rates: Call Money/Interbank Rate for Mexico
  Brazil: 'IRSTCI01BRM156N', // Immediate Rates: Call Money/Interbank Rate for Brazil
  China: 'IRSTCI01CNM156N', // Immediate Rates: Call Money/Interbank Rate for China
  India: 'IRSTCI01INM156N', // Immediate Rates: Call Money/Interbank Rate for India
  Russia: 'IRSTCI01RUM156N', // Immediate Rates: Call Money/Interbank Rate for Russia
  Turkey: 'IRSTCI01TRM156N', // Immediate Rates: Call Money/Interbank Rate for Turkey
  SouthAfrica: 'IRSTCI01ZAM156N', // Immediate Rates: Call Money/Interbank Rate for South Africa
  Indonesia: 'IRSTCI01IDM156N', // Immediate Rates: Call Money/Interbank Rate for Indonesia
  Poland: 'IRSTCI01PLM156N', // Immediate Rates: Call Money/Interbank Rate for Poland
  // Note: Some countries may not have FRED series available
  // Eurozone countries (France, Germany, Italy, Spain, Netherlands, Portugal, Belgium) use ECB rate
  France: 'ECBDFR', // ECB Deposit Facility Rate (applies to all Eurozone)
  Germany: 'ECBDFR',
  Italy: 'ECBDFR',
  Spain: 'ECBDFR',
  Netherlands: 'ECBDFR',
  Portugal: 'ECBDFR',
  Belgium: 'ECBDFR',
};

export interface PolicyRateDataPoint {
  year: number;
  value: number;
}

// Fetch policy rate data from FRED API
async function fetchPolicyRate(
  country: string,
  seriesId: string,
  startDate: string = '1960-01-01',
  endDate: string = '2024-12-31'
): Promise<PolicyRateDataPoint[]> {
  try {
    const cacheKey = `policy_rate_${country}`;
    const cached = clientCache.get<PolicyRateDataPoint[]>(cacheKey);
    
    if (cached) {
      console.log(`✅ Using cached policy rate data for ${country}`);
      return cached;
    }

    // Use Next.js API route to avoid CORS issues
    const url = `/api/fred?series_id=${seriesId}&observation_start=${startDate}&observation_end=${endDate}`;
    
    console.log(`🏦 Fetching policy rate for ${country} (${seriesId})...`);
    
    const response = await axios.get(url, { timeout: 10000 });
    
    if (!response.data || !response.data.observations) {
      console.warn(`⚠️ No policy rate data found for ${country}`);
      return [];
    }

    // Group by year and calculate annual average
    const yearlyData: { [year: number]: number[] } = {};
    
    response.data.observations.forEach((obs: any) => {
      const value = parseFloat(obs.value);
      if (!isNaN(value) && obs.value !== '.') {
        const year = parseInt(obs.date.split('-')[0]);
        if (!yearlyData[year]) {
          yearlyData[year] = [];
        }
        yearlyData[year].push(value);
      }
    });

    // Calculate annual averages
    const result: PolicyRateDataPoint[] = Object.entries(yearlyData)
      .map(([year, values]) => ({
        year: parseInt(year),
        value: values.reduce((sum, val) => sum + val, 0) / values.length
      }))
      .sort((a, b) => a.year - b.year);

    // Cache for 24 hours
    clientCache.set(cacheKey, result, 1000 * 60 * 60 * 24);
    
    console.log(`✅ Policy rate for ${country}: ${result.length} years (latest: ${result[result.length - 1]?.year})`);
    return result;
    
  } catch (error: any) {
    console.error(`❌ Error fetching policy rate for ${country}:`, error.message);
    return [];
  }
}

// Fetch policy rates for all countries
export async function fetchAllPolicyRates(): Promise<{ [country: string]: PolicyRateDataPoint[] }> {
  console.log('🏦 ========================================');
  console.log('🏦 Fetching Central Bank Policy Rates...');
  console.log('🏦 ========================================');
  
  const results: { [country: string]: PolicyRateDataPoint[] } = {};
  
  // Fetch all in parallel
  const promises = Object.entries(POLICY_RATE_SERIES).map(async ([country, seriesId]) => {
    const data = await fetchPolicyRate(country, seriesId);
    return { country, data };
  });
  
  const allResults = await Promise.allSettled(promises);
  
  allResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      results[result.value.country] = result.value.data;
    }
  });
  
  const successCount = Object.values(results).filter(data => data.length > 0).length;
  console.log(`🏦 Successfully fetched policy rates for ${successCount}/${Object.keys(POLICY_RATE_SERIES).length} countries`);
  console.log('🏦 ========================================');
  
  return results;
}

// Clear policy rates cache
export function clearPolicyRatesCache(): void {
  Object.keys(POLICY_RATE_SERIES).forEach(country => {
    clientCache.delete(`policy_rate_${country}`);
  });
  console.log('✅ Cleared all policy rates cached data');
}

