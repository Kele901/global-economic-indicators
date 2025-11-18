import axios from "axios";
import { clientCache } from "./clientCache";

// OECD API configuration
const OECD_BASE_URL = 'https://stats.oecd.org/restsdmx/sdmx.ashx/GetData';

// OECD Dataset IDs for various economic indicators
export const OECD_DATASETS = {
  GOVERNMENT_DEBT: 'GOV_DEBT', // General government debt
  INTEREST_RATES: 'MEI_FIN', // Main Economic Indicators - Financial
  GDP: 'QNA', // Quarterly National Accounts
  UNEMPLOYMENT: 'MIG_NUP_RATES_GENDER', // Unemployment rates
  INFLATION: 'MEI_PRICES', // Consumer Price Indices
};

// Map our country codes to OECD codes (mostly the same, but let's be explicit)
const COUNTRY_CODE_MAP: { [key: string]: string } = {
  USA: 'USA',
  Canada: 'CAN',
  UK: 'GBR',
  France: 'FRA',
  Germany: 'DEU',
  Italy: 'ITA',
  Japan: 'JPN',
  Australia: 'AUS',
  Mexico: 'MEX',
  SouthKorea: 'KOR',
  Spain: 'ESP',
  Sweden: 'SWE',
  Switzerland: 'CHE',
  Turkey: 'TUR',
  Chile: 'CHL',
  Norway: 'NOR',
  Netherlands: 'NLD',
  Portugal: 'PRT',
  Belgium: 'BEL',
  Poland: 'POL',
  // OECD doesn't have all countries
  // Missing: Nigeria, China, Russia, Brazil, Argentina, India, Indonesia, South Africa, Saudi Arabia, Egypt
};

export interface OECDDataPoint {
  country: string;
  year: number;
  value: number;
}

/**
 * Fetch government debt data from OECD
 * OECD has excellent government debt data, especially for Japan
 */
export async function fetchOECDGovernmentDebt(): Promise<{ [country: string]: OECDDataPoint[] }> {
  try {
    const cacheKey = 'oecd_government_debt';
    const cached = clientCache.get<{ [country: string]: OECDDataPoint[] }>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached OECD government debt data');
      return cached;
    }

    console.log('🏛️ Fetching government debt from OECD...');
    
    const results: { [country: string]: OECDDataPoint[] } = {};
    
    // Fetch data for each OECD country
    const countries = Object.keys(COUNTRY_CODE_MAP);
    
    for (const country of countries) {
      try {
        const oecdCode = COUNTRY_CODE_MAP[country];
        
        // OECD SDMX API endpoint for general government debt
        // Using a simpler JSON API approach
        const url = `https://sdmx.oecd.org/public/rest/data/OECD.SDD.NAD,DSD_NAMAIN10@DF_TABLE7A,1.0/${oecdCode}.S13.B9.N.._Z.S.V.?startPeriod=1990&dimensionAtObservation=AllDimensions`;
        
        const response = await axios.get(url, { 
          timeout: 15000,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        // Parse OECD SDMX JSON format
        if (response.data && response.data.data && response.data.data.dataSets) {
          const dataSet = response.data.data.dataSets[0];
          if (dataSet && dataSet.observations) {
            const observations = dataSet.observations;
            const data: OECDDataPoint[] = [];
            
            Object.keys(observations).forEach(key => {
              const value = observations[key][0];
              if (value !== null) {
                // Extract year from the structure - this varies by OECD dataset
                const parts = key.split(':');
                const timeIndex = parts[parts.length - 1];
                const structure = response.data.data.structure;
                
                if (structure && structure.dimensions && structure.dimensions.observation) {
                  const timeDimension = structure.dimensions.observation.find((d: any) => d.id === 'TIME_PERIOD');
                  if (timeDimension && timeDimension.values[timeIndex]) {
                    const year = parseInt(timeDimension.values[timeIndex].id);
                    data.push({ country, year, value });
                  }
                }
              }
            });
            
            if (data.length > 0) {
              results[country] = data.sort((a, b) => a.year - b.year);
              console.log(`✅ OECD: ${country} government debt - ${data.length} years`);
            }
          }
        }
      } catch (error: any) {
        // Continue with other countries if one fails
        console.warn(`⚠️ OECD: Could not fetch ${country} government debt -`, error.message);
      }
    }
    
    // Cache for 24 hours
    clientCache.set(cacheKey, results, 1000 * 60 * 60 * 24);
    
    const successCount = Object.keys(results).length;
    console.log(`🏛️ OECD: Fetched government debt for ${successCount} countries`);
    
    return results;
  } catch (error: any) {
    console.error('❌ OECD: Error fetching government debt:', error.message);
    return {};
  }
}

/**
 * Simpler approach: Use OECD's JSON API for specific indicators
 * This is a fallback function for key indicators
 */
export async function fetchOECDIndicator(
  indicator: string,
  countries: string[] = Object.keys(COUNTRY_CODE_MAP)
): Promise<{ [country: string]: OECDDataPoint[] }> {
  try {
    const cacheKey = `oecd_${indicator}`;
    const cached = clientCache.get<{ [country: string]: OECDDataPoint[] }>(cacheKey);
    
    if (cached) {
      console.log(`✅ Using cached OECD ${indicator} data`);
      return cached;
    }

    console.log(`🏛️ Fetching ${indicator} from OECD...`);
    
    const results: { [country: string]: OECDDataPoint[] } = {};
    
    // For now, return empty - will implement specific indicators as needed
    console.log(`⚠️ OECD: ${indicator} fetching not yet implemented`);
    
    return results;
  } catch (error: any) {
    console.error(`❌ OECD: Error fetching ${indicator}:`, error.message);
    return {};
  }
}

/**
 * Fetch Japan's government debt specifically (simplified approach)
 * Using OECD's more accessible API endpoint
 */
export async function fetchJapanGovernmentDebtOECD(): Promise<OECDDataPoint[]> {
  try {
    const cacheKey = 'oecd_japan_gov_debt';
    const cached = clientCache.get<OECDDataPoint[]>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached OECD Japan government debt');
      return cached;
    }

    console.log('🇯🇵 Fetching Japan government debt from OECD...');
    
    // Use OECD.Stat API with JSON format - General government debt as % of GDP
    const url = 'https://stats.oecd.org/SDMX-JSON/data/GOV_DEBT/JPN.GGFL.PC_GDP/all?startTime=1990';
    
    console.log('🔗 OECD URL:', url);
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data: OECDDataPoint[] = [];
    
    // Parse OECD.Stat JSON format
    if (response.data && response.data.dataSets && response.data.dataSets[0]) {
      const dataSet = response.data.dataSets[0];
      const structure = response.data.structure;
      
      if (dataSet.observations && structure && structure.dimensions && structure.dimensions.observation) {
        const timeDimension = structure.dimensions.observation.find((d: any) => d.id === 'TIME_PERIOD');
        
        if (timeDimension && timeDimension.values) {
          Object.keys(dataSet.observations).forEach(key => {
            const value = dataSet.observations[key][0];
            if (value !== null) {
              const timeIndex = parseInt(key.split(':').pop() || '0');
              const yearStr = timeDimension.values[timeIndex]?.id || timeDimension.values[timeIndex]?.name;
              
              if (yearStr) {
                const year = parseInt(yearStr);
                if (!isNaN(year) && !isNaN(value)) {
                  data.push({
                    country: 'Japan',
                    year,
                    value
                  });
                }
              }
            }
          });
        }
      }
    }
    
    const sortedData = data.sort((a, b) => a.year - b.year);
    
    if (sortedData.length > 0) {
      console.log(`✅ OECD: Japan government debt - ${sortedData.length} years (${sortedData[0].year}-${sortedData[sortedData.length-1].year})`);
      clientCache.set(cacheKey, sortedData, 1000 * 60 * 60 * 24);
    } else {
      console.warn('⚠️ OECD: No Japan government debt data found');
    }
    
    return sortedData;
  } catch (error: any) {
    console.error('❌ OECD: Error fetching Japan government debt');
    console.error('   Error type:', error.name);
    console.error('   Error message:', error.message);
    if (error.response) {
      console.error('   HTTP Status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    console.log('ℹ️ OECD APIs may have CORS restrictions or require special access');
    return [];
  }
}

// Clear OECD cache
export function clearOECDCache(): void {
  clientCache.delete('oecd_government_debt');
  clientCache.delete('oecd_japan_gov_debt');
  console.log('✅ Cleared OECD cached data');
}

