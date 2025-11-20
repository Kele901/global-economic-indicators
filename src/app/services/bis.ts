import axios from "axios";
import { clientCache } from "./clientCache";

// BIS API Configuration
const BIS_BASE_URL = 'https://stats.bis.org/api/v1';

// BIS Dataset for Central Bank Policy Rates
const BIS_DATASETS = {
  POLICY_RATES: 'WS_CBPOL_M', // Central Bank Policy Rates (Monthly)
  EXCHANGE_RATES: 'WS_EER', // Effective Exchange Rates
  CREDIT_TO_GDP: 'WS_LONG_CRE', // Credit to GDP gaps
};

// Map your country codes to BIS codes
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
  // Note: BIS has excellent coverage for major economies
};

export interface BISDataPoint {
  country: string;
  year: number;
  value: number;
}

/**
 * Fetch central bank policy rates from BIS
 * BIS has monthly data that we'll aggregate to annual
 */
export async function fetchBISPolicyRates(): Promise<{ [country: string]: BISDataPoint[] }> {
  try {
    const cacheKey = 'bis_policy_rates';
    const cached = clientCache.get<{ [country: string]: BISDataPoint[] }>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached BIS policy rates data');
      return cached;
    }

    console.log('🏦 ========================================');
    console.log('🏦 BIS: Fetching central bank policy rates...');
    console.log('🏦 ========================================');
    
    const results: { [country: string]: BISDataPoint[] } = {};
    const countries = Object.keys(COUNTRY_CODE_MAP);
    
    // Fetch data for each country via API route to avoid CORS
    for (const country of countries) {
      try {
        const bisCode = COUNTRY_CODE_MAP[country];
        
        // Use Next.js API route to avoid CORS issues
        const url = `/api/bis?dataset=${BIS_DATASETS.POLICY_RATES}&country=${bisCode}&startPeriod=1990`;
        
        console.log(`🏦 BIS: Fetching ${country} (${bisCode})...`);
        
        const response = await axios.get(url, {
          timeout: 15000
        });
        
        // Parse BIS SDMX-JSON format
        if (response.data?.data?.dataSets?.[0]?.series) {
          const series = response.data.data.dataSets[0].series;
          const structure = response.data.data.structure;
          
          // Get time dimension
          const timeDimension = structure.dimensions?.observation?.find((d: any) => 
            d.id === 'TIME_PERIOD' || d.id === 'time'
          );
          
          if (timeDimension?.values) {
            const yearlyData: { [year: number]: number[] } = {};
            
            // Iterate through series
            Object.values(series).forEach((seriesData: any) => {
              if (seriesData.observations) {
                Object.entries(seriesData.observations).forEach(([timeIndex, observation]: [string, any]) => {
                  const value = observation[0];
                  if (value !== null && !isNaN(value)) {
                    const timePeriod = timeDimension.values[parseInt(timeIndex)]?.id;
                    if (timePeriod) {
                      // Extract year from period (format: YYYY-MM or YYYY-Qn)
                      const year = parseInt(timePeriod.split('-')[0]);
                      if (!isNaN(year)) {
                        if (!yearlyData[year]) {
                          yearlyData[year] = [];
                        }
                        // Convert to number to prevent string concatenation in reduce
                        yearlyData[year].push(Number(value));
                      }
                    }
                  }
                });
              }
            });
            
            // Calculate annual averages
            const data: BISDataPoint[] = Object.entries(yearlyData).map(([year, values]) => ({
              country,
              year: parseInt(year),
              value: values.reduce((sum, val) => sum + val, 0) / values.length
            }));
            
            if (data.length > 0) {
              results[country] = data.sort((a, b) => a.year - b.year);
              console.log(`✅ BIS: ${country} policy rates - ${data.length} years (${data[0].year}-${data[data.length-1].year})`);
            }
          }
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.warn(`⚠️ BIS: Could not fetch ${country} policy rates -`, error.message);
        }
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    // Cache for 24 hours
    clientCache.set(cacheKey, results, 1000 * 60 * 60 * 24);
    
    const successCount = Object.keys(results).length;
    console.log('🏦 ========================================');
    console.log(`🏦 BIS: Successfully fetched policy rates for ${successCount}/${countries.length} countries`);
    console.log('🏦 ========================================');
    
    return results;
  } catch (error: any) {
    console.error('❌ BIS: Error fetching policy rates');
    console.error('   Error:', error.message);
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      console.log('ℹ️ CORS error detected - ensure BIS API route is working');
    }
    return {};
  }
}

/**
 * Fetch Japan policy rates specifically from BIS
 */
export async function fetchJapanPolicyRatesBIS(): Promise<BISDataPoint[]> {
  try {
    const cacheKey = 'bis_japan_policy_rates';
    const cached = clientCache.get<BISDataPoint[]>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached BIS Japan policy rates');
      return cached;
    }

    console.log('🇯🇵 Fetching Japan policy rates from BIS...');
    
    const url = `/api/bis?dataset=${BIS_DATASETS.POLICY_RATES}&country=JP&startPeriod=1990`;
    
    const response = await axios.get(url, {
      timeout: 15000
    });
    
    const data: BISDataPoint[] = [];
    
    // Parse response (similar logic as above)
    if (response.data?.data?.dataSets?.[0]?.series) {
      const series = response.data.data.dataSets[0].series;
      const structure = response.data.data.structure;
      
      const timeDimension = structure.dimensions?.observation?.find((d: any) => 
        d.id === 'TIME_PERIOD' || d.id === 'time'
      );
      
      if (timeDimension?.values) {
        const yearlyData: { [year: number]: number[] } = {};
        
        Object.values(series).forEach((seriesData: any) => {
          if (seriesData.observations) {
            Object.entries(seriesData.observations).forEach(([timeIndex, observation]: [string, any]) => {
              const value = observation[0];
              if (value !== null && !isNaN(value)) {
                const timePeriod = timeDimension.values[parseInt(timeIndex)]?.id;
                if (timePeriod) {
                  const year = parseInt(timePeriod.split('-')[0]);
                  if (!isNaN(year)) {
                    if (!yearlyData[year]) {
                      yearlyData[year] = [];
                    }
                    // Convert to number to prevent string concatenation in reduce
                    yearlyData[year].push(Number(value));
                  }
                }
              }
            });
          }
        });
        
        Object.entries(yearlyData).forEach(([year, values]) => {
          data.push({
            country: 'Japan',
            year: parseInt(year),
            value: values.reduce((sum, val) => sum + val, 0) / values.length
          });
        });
      }
    }
    
    const sortedData = data.sort((a, b) => a.year - b.year);
    
    if (sortedData.length > 0) {
      console.log(`✅ BIS: Japan policy rates - ${sortedData.length} years (${sortedData[0].year}-${sortedData[sortedData.length-1].year})`);
      clientCache.set(cacheKey, sortedData, 1000 * 60 * 60 * 24);
    } else {
      console.warn('⚠️ BIS: No Japan policy rate data found');
    }
    
    return sortedData;
  } catch (error: any) {
    console.error('❌ BIS: Error fetching Japan policy rates:', error.message);
    return [];
  }
}

// Clear BIS cache
export function clearBISCache(): void {
  clientCache.delete('bis_policy_rates');
  clientCache.delete('bis_japan_policy_rates');
  console.log('✅ Cleared BIS cached data');
}

