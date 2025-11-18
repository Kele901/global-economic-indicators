import axios from "axios";
import { clientCache } from "./clientCache";

// IMF API configuration
const IMF_BASE_URL = 'http://dataservices.imf.org/REST/SDMX_JSON.svc';

// IMF Database IDs
export const IMF_DATABASES = {
  IFS: 'IFS', // International Financial Statistics
  WEO: 'WEO', // World Economic Outlook
  BOP: 'BOP', // Balance of Payments
  GFS: 'GFS', // Government Finance Statistics
};

// Map our country codes to IMF codes (ISO 2-letter codes)
const COUNTRY_CODE_MAP: { [key: string]: string } = {
  USA: 'US',
  Canada: 'CA',
  UK: 'GB',
  France: 'FR',
  Germany: 'DE',
  Italy: 'IT',
  Japan: 'JP',
  Australia: 'AU',
  Mexico: 'MX',
  SouthKorea: 'KR',
  Spain: 'ES',
  Sweden: 'SE',
  Switzerland: 'CH',
  Turkey: 'TR',
  Nigeria: 'NG',
  China: 'CN',
  Russia: 'RU',
  Brazil: 'BR',
  Chile: 'CL',
  Argentina: 'AR',
  India: 'IN',
  Norway: 'NO',
  Netherlands: 'NL',
  Portugal: 'PT',
  Belgium: 'BE',
  Indonesia: 'ID',
  SouthAfrica: 'ZA',
  Poland: 'PL',
  SaudiArabia: 'SA',
  Egypt: 'EG'
};

export interface IMFDataPoint {
  country: string;
  year: number;
  value: number;
}

/**
 * Fetch government debt from IMF Government Finance Statistics
 * IMF indicator: GGXWDG_NGDP (General government gross debt as % of GDP)
 */
export async function fetchIMFGovernmentDebt(): Promise<{ [country: string]: IMFDataPoint[] }> {
  try {
    const cacheKey = 'imf_government_debt';
    const cached = clientCache.get<{ [country: string]: IMFDataPoint[] }>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached IMF government debt data');
      return cached;
    }

    console.log('🌍 Fetching government debt from IMF...');
    
    const results: { [country: string]: IMFDataPoint[] } = {};
    
    // Fetch data for all countries
    const countries = Object.keys(COUNTRY_CODE_MAP);
    
    // IMF API endpoint for government debt
    // Using CompactData format for easier parsing
    for (const country of countries) {
      try {
        const imfCode = COUNTRY_CODE_MAP[country];
        
        // GFS database, indicator GGXWDG_NGDP (Gross debt as % of GDP)
        const url = `${IMF_BASE_URL}/CompactData/GFS/A.${imfCode}.GGXWDG_NGDP`;
        
        const response = await axios.get(url, {
          timeout: 15000,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        // Parse IMF CompactData JSON format
        if (response.data && response.data.CompactData && response.data.CompactData.DataSet) {
          const dataSet = response.data.CompactData.DataSet;
          const series = dataSet.Series;
          
          if (series && series.Obs) {
            const observations = Array.isArray(series.Obs) ? series.Obs : [series.Obs];
            const data: IMFDataPoint[] = [];
            
            observations.forEach((obs: any) => {
              if (obs['@TIME_PERIOD'] && obs['@OBS_VALUE']) {
                const year = parseInt(obs['@TIME_PERIOD']);
                const value = parseFloat(obs['@OBS_VALUE']);
                
                if (!isNaN(year) && !isNaN(value)) {
                  data.push({ country, year, value });
                }
              }
            });
            
            if (data.length > 0) {
              results[country] = data.sort((a, b) => a.year - b.year);
              console.log(`✅ IMF: ${country} government debt - ${data.length} years`);
            }
          }
        }
      } catch (error: any) {
        // Continue with other countries if one fails
        if (error.response?.status !== 404) {
          console.warn(`⚠️ IMF: Could not fetch ${country} government debt -`, error.message);
        }
      }
    }
    
    // Cache for 24 hours
    clientCache.set(cacheKey, results, 1000 * 60 * 60 * 24);
    
    const successCount = Object.keys(results).length;
    console.log(`🌍 IMF: Fetched government debt for ${successCount} countries`);
    
    return results;
  } catch (error: any) {
    console.error('❌ IMF: Error fetching government debt');
    console.error('   Error type:', error.name);
    console.error('   Error message:', error.message);
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      console.log('ℹ️ CORS error detected - IMF API may not allow browser requests');
      console.log('ℹ️ Consider using a backend proxy for IMF data');
    }
    return {};
  }
}

/**
 * Fetch Japan's government debt specifically from IMF
 */
export async function fetchJapanGovernmentDebtIMF(): Promise<IMFDataPoint[]> {
  try {
    const cacheKey = 'imf_japan_gov_debt';
    const cached = clientCache.get<IMFDataPoint[]>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached IMF Japan government debt');
      return cached;
    }

    console.log('🇯🇵 Fetching Japan government debt from IMF...');
    
    // IMF GFS API for Japan's gross debt
    const url = `${IMF_BASE_URL}/CompactData/GFS/A.JP.GGXWDG_NGDP`;
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data: IMFDataPoint[] = [];
    
    // Parse IMF CompactData JSON format
    if (response.data && response.data.CompactData && response.data.CompactData.DataSet) {
      const dataSet = response.data.CompactData.DataSet;
      const series = dataSet.Series;
      
      if (series && series.Obs) {
        const observations = Array.isArray(series.Obs) ? series.Obs : [series.Obs];
        
        observations.forEach((obs: any) => {
          if (obs['@TIME_PERIOD'] && obs['@OBS_VALUE']) {
            const year = parseInt(obs['@TIME_PERIOD']);
            const value = parseFloat(obs['@OBS_VALUE']);
            
            if (!isNaN(year) && !isNaN(value)) {
              data.push({
                country: 'Japan',
                year,
                value
              });
            }
          }
        });
      }
    }
    
    const sortedData = data.sort((a, b) => a.year - b.year);
    
    if (sortedData.length > 0) {
      console.log(`✅ IMF: Japan government debt - ${sortedData.length} years (${sortedData[0].year}-${sortedData[sortedData.length-1].year})`);
      clientCache.set(cacheKey, sortedData, 1000 * 60 * 60 * 24);
    } else {
      console.warn('⚠️ IMF: No Japan government debt data found');
    }
    
    return sortedData;
  } catch (error: any) {
    console.error('❌ IMF: Error fetching Japan government debt');
    console.error('   Error type:', error.name);
    console.error('   Error message:', error.message);
    if (error.response) {
      console.error('   HTTP Status:', error.response.status);
      console.error('   Response data:', JSON.stringify(error.response.data).substring(0, 200));
    }
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    console.log('ℹ️ IMF APIs may have CORS restrictions or data format changes');
    return [];
  }
}

/**
 * Fetch IMF interest rates data
 */
export async function fetchIMFInterestRates(): Promise<{ [country: string]: IMFDataPoint[] }> {
  try {
    const cacheKey = 'imf_interest_rates';
    const cached = clientCache.get<{ [country: string]: IMFDataPoint[] }>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached IMF interest rates data');
      return cached;
    }

    console.log('🌍 Fetching interest rates from IMF...');
    
    const results: { [country: string]: IMFDataPoint[] } = {};
    const countries = Object.keys(COUNTRY_CODE_MAP);
    
    // IMF IFS database - Central Bank Policy Rate (FPOLM_PA)
    for (const country of countries) {
      try {
        const imfCode = COUNTRY_CODE_MAP[country];
        const url = `${IMF_BASE_URL}/CompactData/IFS/M.${imfCode}.FPOLM_PA`;
        
        const response = await axios.get(url, {
          timeout: 15000,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.data && response.data.CompactData && response.data.CompactData.DataSet) {
          const dataSet = response.data.CompactData.DataSet;
          const series = dataSet.Series;
          
          if (series && series.Obs) {
            const observations = Array.isArray(series.Obs) ? series.Obs : [series.Obs];
            const yearlyData: { [year: number]: number[] } = {};
            
            observations.forEach((obs: any) => {
              if (obs['@TIME_PERIOD'] && obs['@OBS_VALUE']) {
                const timePeriod = obs['@TIME_PERIOD'];
                const year = parseInt(timePeriod.split('-')[0]);
                const value = parseFloat(obs['@OBS_VALUE']);
                
                if (!isNaN(year) && !isNaN(value)) {
                  if (!yearlyData[year]) {
                    yearlyData[year] = [];
                  }
                  yearlyData[year].push(value);
                }
              }
            });
            
            // Calculate annual averages
            const data: IMFDataPoint[] = Object.entries(yearlyData).map(([year, values]) => ({
              country,
              year: parseInt(year),
              value: values.reduce((sum, val) => sum + val, 0) / values.length
            }));
            
            if (data.length > 0) {
              results[country] = data.sort((a, b) => a.year - b.year);
              console.log(`✅ IMF: ${country} interest rates - ${data.length} years`);
            }
          }
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.warn(`⚠️ IMF: Could not fetch ${country} interest rates -`, error.message);
        }
      }
    }
    
    clientCache.set(cacheKey, results, 1000 * 60 * 60 * 24);
    
    const successCount = Object.keys(results).length;
    console.log(`🌍 IMF: Fetched interest rates for ${successCount} countries`);
    
    return results;
  } catch (error: any) {
    console.error('❌ IMF: Error fetching interest rates');
    console.error('   Error type:', error.name);
    console.error('   Error message:', error.message);
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      console.log('ℹ️ CORS error detected - IMF API may not allow browser requests');
      console.log('ℹ️ App will continue with World Bank + FRED + Policy Rates data');
    }
    return {};
  }
}

// Clear IMF cache
export function clearIMFCache(): void {
  clientCache.delete('imf_government_debt');
  clientCache.delete('imf_japan_gov_debt');
  clientCache.delete('imf_interest_rates');
  console.log('✅ Cleared IMF cached data');
}

