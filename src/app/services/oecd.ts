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

/**
 * Fetch OECD policy rates (short-term interest rates)
 * Dataset: MEI_FIN - Main Economic Indicators Financial
 */
export async function fetchOECDPolicyRates(): Promise<{ [country: string]: OECDDataPoint[] }> {
  try {
    const cacheKey = 'oecd_policy_rates';
    const cached = clientCache.get<{ [country: string]: OECDDataPoint[] }>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached OECD policy rates');
      return cached;
    }

    console.log('🏛️ ========================================');
    console.log('🏛️ OECD: Fetching policy rates...');
    console.log('🏛️ ========================================');
    
    const results: { [country: string]: OECDDataPoint[] } = {};
    const countries = Object.keys(COUNTRY_CODE_MAP);
    
    for (const country of countries) {
      try {
        const oecdCode = COUNTRY_CODE_MAP[country];
        
        // Use Next.js API route to avoid CORS issues
        const url = `/api/oecd?dataset=OECD.SDD.STES,DSD_KEI@DF_KEI,1.0/${oecdCode}.M.IR.IRSTCI.ST.._Z&startPeriod=1990`;
        
        console.log(`🏛️ OECD: Fetching ${country} (${oecdCode})...`);
        
        const response = await axios.get(url, {
          timeout: 15000
        });
        
        if (response.data?.data?.dataSets?.[0]?.observations) {
          const observations = response.data.data.dataSets[0].observations;
          const structure = response.data.data.structure;
          
          const timeDimension = structure.dimensions?.observation?.find((d: any) => 
            d.id === 'TIME_PERIOD'
          );
          
          if (timeDimension?.values) {
            const yearlyData: { [year: number]: number[] } = {};
            
            Object.entries(observations).forEach(([key, observation]: [string, any]) => {
              const value = observation[0];
              if (value !== null && !isNaN(value)) {
                const timeIndex = parseInt(key.split(':').pop() || '0');
                const timePeriod = timeDimension.values[timeIndex]?.id;
                
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
            
            const data: OECDDataPoint[] = Object.entries(yearlyData).map(([year, values]) => ({
              country,
              year: parseInt(year),
              value: values.reduce((sum, val) => sum + val, 0) / values.length
            }));
            
            if (data.length > 0) {
              results[country] = data.sort((a, b) => a.year - b.year);
              console.log(`✅ OECD: ${country} policy rates - ${data.length} years (${data[0].year}-${data[data.length-1].year})`);
            }
          }
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.warn(`⚠️ OECD: Could not fetch ${country} policy rates -`, error.message);
        }
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    clientCache.set(cacheKey, results, 1000 * 60 * 60 * 24);
    
    const successCount = Object.keys(results).length;
    console.log('🏛️ ========================================');
    console.log(`🏛️ OECD: Successfully fetched policy rates for ${successCount}/${countries.length} countries`);
    console.log('🏛️ ========================================');
    
    return results;
  } catch (error: any) {
    console.error('❌ OECD: Error fetching policy rates:', error.message);
    return {};
  }
}

/**
 * Fetch OECD long-term interest rates (10Y government bond yields)
 * Dataset: DSD_KEI - same as policy rates, but uses key IRLT.LT.
 */
export async function fetchOECDLongTermRates(): Promise<{ [country: string]: OECDDataPoint[] }> {
  try {
    const cacheKey = 'oecd_long_term_rates';
    const cached = clientCache.get<{ [country: string]: OECDDataPoint[] }>(cacheKey);

    if (cached) {
      console.log('✅ Using cached OECD long-term rates');
      return cached;
    }

    console.log('🏛️ ========================================');
    console.log('🏛️ OECD: Fetching long-term interest rates (10Y)...');
    console.log('🏛️ ========================================');

    const results: { [country: string]: OECDDataPoint[] } = {};
    const countries = Object.keys(COUNTRY_CODE_MAP);

    for (const country of countries) {
      try {
        const oecdCode = COUNTRY_CODE_MAP[country];

        // SDMX key for long-term rates: {country}.M.IR.IRLT.LT.._Z
        const url = `/api/oecd?dataset=OECD.SDD.STES,DSD_KEI@DF_KEI,1.0/${oecdCode}.M.IR.IRLT.LT.._Z&startPeriod=1990`;

        console.log(`🏛️ OECD: Fetching ${country} long-term rates (${oecdCode})...`);

        const response = await axios.get(url, {
          timeout: 15000
        });

        if (response.data?.data?.dataSets?.[0]?.observations) {
          const observations = response.data.data.dataSets[0].observations;
          const structure = response.data.data.structure;

          const timeDimension = structure.dimensions?.observation?.find((d: any) =>
            d.id === 'TIME_PERIOD'
          );

          if (timeDimension?.values) {
            const yearlyData: { [year: number]: number[] } = {};

            Object.entries(observations).forEach(([key, observation]: [string, any]) => {
              const value = observation[0];
              if (value !== null && !isNaN(value)) {
                const timeIndex = parseInt(key.split(':').pop() || '0');
                const timePeriod = timeDimension.values[timeIndex]?.id;

                if (timePeriod) {
                  const year = parseInt(timePeriod.split('-')[0]);
                  if (!isNaN(year)) {
                    if (!yearlyData[year]) {
                      yearlyData[year] = [];
                    }
                    yearlyData[year].push(Number(value));
                  }
                }
              }
            });

            const data: OECDDataPoint[] = Object.entries(yearlyData).map(([year, values]) => ({
              country,
              year: parseInt(year),
              value: values.reduce((sum, val) => sum + val, 0) / values.length
            }));

            if (data.length > 0) {
              results[country] = data.sort((a, b) => a.year - b.year);
              console.log(`✅ OECD: ${country} long-term rates - ${data.length} years (${data[0].year}-${data[data.length-1].year})`);
            }
          }
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.warn(`⚠️ OECD: Could not fetch ${country} long-term rates -`, error.message);
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    clientCache.set(cacheKey, results, 1000 * 60 * 60 * 24);

    const successCount = Object.keys(results).length;
    console.log('🏛️ ========================================');
    console.log(`🏛️ OECD: Successfully fetched long-term rates for ${successCount}/${countries.length} countries`);
    console.log('🏛️ ========================================');

    return results;
  } catch (error: any) {
    console.error('❌ OECD: Error fetching long-term rates:', error.message);
    return {};
  }
}

/**
 * Fetch OECD Real House Price Index and Price-to-Income ratio
 * Dataset: OECD.SDD.NAD,DSD_HOUSE_PRICES@DF_HOUSE_PRICES
 * Returns two series per country: realPriceIndex (RPI) and priceToIncome (PI)
 */
export async function fetchOECDHousePrices(): Promise<{
  realPriceIndex: { [country: string]: OECDDataPoint[] };
  priceToIncome: { [country: string]: OECDDataPoint[] };
}> {
  try {
    const cacheKey = 'oecd_house_prices';
    const cached = clientCache.get<{
      realPriceIndex: { [country: string]: OECDDataPoint[] };
      priceToIncome: { [country: string]: OECDDataPoint[] };
    }>(cacheKey);

    if (cached) {
      console.log('✅ Using cached OECD house prices');
      return cached;
    }

    console.log('🏠 ========================================');
    console.log('🏠 OECD: Fetching house prices (real & price-to-income)...');
    console.log('🏠 ========================================');

    const realPriceIndex: { [country: string]: OECDDataPoint[] } = {};
    const priceToIncome: { [country: string]: OECDDataPoint[] } = {};
    const countries = Object.keys(COUNTRY_CODE_MAP);

    // Helper that runs the SDMX request for a given measure code (RPI / PI)
    const fetchMeasure = async (
      oecdCode: string,
      country: string,
      measure: 'RPI' | 'PI'
    ): Promise<OECDDataPoint[]> => {
      try {
        // SDMX key roughly: {country}.{measure}.{ref}.{unit}.{adj}
        // Use a wildcard-friendly query so any release on OECD answers.
        const url = `/api/oecd?dataset=OECD.SDD.NAD,DSD_HOUSE_PRICES@DF_HOUSE_PRICES,1.0/${oecdCode}.${measure}........&startPeriod=1990`;
        const response = await axios.get(url, { timeout: 15000 });

        if (!response.data?.data?.dataSets?.[0]?.observations) {
          return [];
        }

        const observations = response.data.data.dataSets[0].observations;
        const structure = response.data.data.structure;
        const timeDimension = structure.dimensions?.observation?.find((d: any) =>
          d.id === 'TIME_PERIOD'
        );

        if (!timeDimension?.values) return [];

        const yearlyData: { [year: number]: number[] } = {};

        Object.entries(observations).forEach(([key, observation]: [string, any]) => {
          const value = observation[0];
          if (value !== null && !isNaN(value)) {
            const timeIndex = parseInt(key.split(':').pop() || '0');
            const timePeriod = timeDimension.values[timeIndex]?.id;

            if (timePeriod) {
              const year = parseInt(timePeriod.split('-')[0]);
              if (!isNaN(year)) {
                if (!yearlyData[year]) yearlyData[year] = [];
                yearlyData[year].push(Number(value));
              }
            }
          }
        });

        return Object.entries(yearlyData)
          .map(([year, values]) => ({
            country,
            year: parseInt(year),
            value: values.reduce((sum, val) => sum + val, 0) / values.length
          }))
          .sort((a, b) => a.year - b.year);
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.warn(`⚠️ OECD: Could not fetch ${country} ${measure} -`, error.message);
        }
        return [];
      }
    };

    for (const country of countries) {
      const oecdCode = COUNTRY_CODE_MAP[country];

      const [rpi, pi] = await Promise.all([
        fetchMeasure(oecdCode, country, 'RPI'),
        fetchMeasure(oecdCode, country, 'PI')
      ]);

      if (rpi.length > 0) {
        realPriceIndex[country] = rpi;
        console.log(`✅ OECD: ${country} real house price index - ${rpi.length} years`);
      }
      if (pi.length > 0) {
        priceToIncome[country] = pi;
        console.log(`✅ OECD: ${country} price-to-income - ${pi.length} years`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const result = { realPriceIndex, priceToIncome };
    clientCache.set(cacheKey, result, 1000 * 60 * 60 * 24);

    console.log('🏠 ========================================');
    console.log(`🏠 OECD: House prices fetched (RPI: ${Object.keys(realPriceIndex).length}, PI: ${Object.keys(priceToIncome).length})`);
    console.log('🏠 ========================================');

    return result;
  } catch (error: any) {
    console.error('❌ OECD: Error fetching house prices:', error.message);
    return { realPriceIndex: {}, priceToIncome: {} };
  }
}

/**
 * Fetch Japan policy rates specifically from OECD
 */
export async function fetchJapanPolicyRatesOECD(): Promise<OECDDataPoint[]> {
  try {
    const cacheKey = 'oecd_japan_policy_rates';
    const cached = clientCache.get<OECDDataPoint[]>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached OECD Japan policy rates');
      return cached;
    }

    console.log('🇯🇵 Fetching Japan policy rates from OECD...');
    
    const url = `/api/oecd?dataset=OECD.SDD.STES,DSD_KEI@DF_KEI,1.0/JPN.M.IR.IRSTCI.ST.._Z&startPeriod=1990`;
    
    const response = await axios.get(url, {
      timeout: 15000
    });
    
    const data: OECDDataPoint[] = [];
    
    if (response.data?.data?.dataSets?.[0]?.observations) {
      const observations = response.data.data.dataSets[0].observations;
      const structure = response.data.data.structure;
      
      const timeDimension = structure.dimensions?.observation?.find((d: any) => 
        d.id === 'TIME_PERIOD'
      );
      
      if (timeDimension?.values) {
        const yearlyData: { [year: number]: number[] } = {};
        
        Object.entries(observations).forEach(([key, observation]: [string, any]) => {
          const value = observation[0];
          if (value !== null && !isNaN(value)) {
            const timeIndex = parseInt(key.split(':').pop() || '0');
            const timePeriod = timeDimension.values[timeIndex]?.id;
            
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
      console.log(`✅ OECD: Japan policy rates - ${sortedData.length} years (${sortedData[0].year}-${sortedData[sortedData.length-1].year})`);
      clientCache.set(cacheKey, sortedData, 1000 * 60 * 60 * 24);
    } else {
      console.warn('⚠️ OECD: No Japan policy rate data found');
    }
    
    return sortedData;
  } catch (error: any) {
    console.error('❌ OECD: Error fetching Japan policy rates:', error.message);
    return [];
  }
}

// Clear OECD cache
export function clearOECDCache(): void {
  clientCache.delete('oecd_government_debt');
  clientCache.delete('oecd_japan_gov_debt');
  clientCache.delete('oecd_policy_rates');
  clientCache.delete('oecd_japan_policy_rates');
  clientCache.delete('oecd_long_term_rates');
  clientCache.delete('oecd_house_prices');
  clientCache.delete('oecd_rd_spending');
  clientCache.delete('oecd_researchers');
  clientCache.delete('oecd_patents');
  clientCache.delete('oecd_hightech_exports');
  console.log('✅ Cleared OECD cached data');
}

// ============================================
// OECD Technology & Innovation Data
// ============================================

// Extended country mapping including non-OECD countries with partner data
const TECH_COUNTRY_CODE_MAP: { [key: string]: string } = {
  ...COUNTRY_CODE_MAP,
  // Additional countries that may have data in OECD datasets
  China: 'CHN',
  Russia: 'RUS',
  Brazil: 'BRA',
  India: 'IND',
  Indonesia: 'IDN',
  SouthAfrica: 'ZAF',
  Argentina: 'ARG',
  SaudiArabia: 'SAU',
  Nigeria: 'NGA',
  Egypt: 'EGY',
};

// Reverse mapping for OECD codes to our country names
const OECD_TO_COUNTRY_NAME: { [key: string]: string } = Object.fromEntries(
  Object.entries(TECH_COUNTRY_CODE_MAP).map(([name, code]) => [code, name])
);

export interface OECDTechData {
  rdSpending: { [country: string]: OECDDataPoint[] };
  researchers: { [country: string]: OECDDataPoint[] };
  patents: { [country: string]: OECDDataPoint[] };
  hightechExports: { [country: string]: OECDDataPoint[] };
}

/**
 * Fetch R&D Expenditure as % of GDP from OECD
 * Dataset: MSTI_PUB - Main Science and Technology Indicators
 */
export async function fetchOECDRDSpending(): Promise<{ [country: string]: OECDDataPoint[] }> {
  try {
    const cacheKey = 'oecd_rd_spending';
    const cached = clientCache.get<{ [country: string]: OECDDataPoint[] }>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached OECD R&D spending data');
      return cached;
    }

    console.log('🔬🏛️ ========================================');
    console.log('🔬🏛️ OECD: Fetching R&D Expenditure (% GDP)...');
    console.log('🔬🏛️ ========================================');
    
    const results: { [country: string]: OECDDataPoint[] } = {};
    const countries = Object.keys(TECH_COUNTRY_CODE_MAP);
    
    for (const country of countries) {
      try {
        const oecdCode = TECH_COUNTRY_CODE_MAP[country];
        
        // OECD MSTI dataset - GERD as % of GDP
        // Using the OECD API route
        const url = `/api/oecd?dataset=OECD.STI.STP,DSD_MSTI@DF_MSTI,1.0/${oecdCode}.A.GERD.GDP_PPP.._T._T._T&startPeriod=1990`;
        
        const response = await axios.get(url, { timeout: 15000 });
        
        if (response.data?.data?.dataSets?.[0]?.observations) {
          const observations = response.data.data.dataSets[0].observations;
          const structure = response.data.data.structure;
          
          const timeDimension = structure.dimensions?.observation?.find((d: any) => 
            d.id === 'TIME_PERIOD'
          );
          
          if (timeDimension?.values) {
            const data: OECDDataPoint[] = [];
            
            Object.entries(observations).forEach(([key, observation]: [string, any]) => {
              const value = observation[0];
              if (value !== null && !isNaN(value)) {
                const timeIndex = parseInt(key.split(':').pop() || '0');
                const timePeriod = timeDimension.values[timeIndex]?.id;
                
                if (timePeriod) {
                  const year = parseInt(timePeriod);
                  if (!isNaN(year)) {
                    data.push({ country, year, value: Number(value) });
                  }
                }
              }
            });
            
            if (data.length > 0) {
              results[country] = data.sort((a, b) => a.year - b.year);
              console.log(`✅ OECD R&D: ${country} - ${data.length} years`);
            }
          }
        }
      } catch (error: any) {
        if (error.response?.status !== 404 && error.response?.status !== 400) {
          console.warn(`⚠️ OECD R&D: Could not fetch ${country} -`, error.message);
        }
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    clientCache.set(cacheKey, results, 1000 * 60 * 60 * 24);
    
    console.log(`🔬🏛️ OECD: R&D data fetched for ${Object.keys(results).length} countries`);
    
    return results;
  } catch (error: any) {
    console.error('❌ OECD: Error fetching R&D spending:', error.message);
    return {};
  }
}

/**
 * Fetch Researchers per thousand employed from OECD
 */
export async function fetchOECDResearchers(): Promise<{ [country: string]: OECDDataPoint[] }> {
  try {
    const cacheKey = 'oecd_researchers';
    const cached = clientCache.get<{ [country: string]: OECDDataPoint[] }>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached OECD researchers data');
      return cached;
    }

    console.log('🔬🏛️ ========================================');
    console.log('🔬🏛️ OECD: Fetching Researchers data...');
    console.log('🔬🏛️ ========================================');
    
    const results: { [country: string]: OECDDataPoint[] } = {};
    const countries = Object.keys(TECH_COUNTRY_CODE_MAP);
    
    for (const country of countries) {
      try {
        const oecdCode = TECH_COUNTRY_CODE_MAP[country];
        
        // OECD MSTI dataset - Researchers FTE per thousand employment
        const url = `/api/oecd?dataset=OECD.STI.STP,DSD_MSTI@DF_MSTI,1.0/${oecdCode}.A.RESEARCHER.FTE_THSD_EMPL.._T._T._T&startPeriod=1990`;
        
        const response = await axios.get(url, { timeout: 15000 });
        
        if (response.data?.data?.dataSets?.[0]?.observations) {
          const observations = response.data.data.dataSets[0].observations;
          const structure = response.data.data.structure;
          
          const timeDimension = structure.dimensions?.observation?.find((d: any) => 
            d.id === 'TIME_PERIOD'
          );
          
          if (timeDimension?.values) {
            const data: OECDDataPoint[] = [];
            
            Object.entries(observations).forEach(([key, observation]: [string, any]) => {
              const value = observation[0];
              if (value !== null && !isNaN(value)) {
                const timeIndex = parseInt(key.split(':').pop() || '0');
                const timePeriod = timeDimension.values[timeIndex]?.id;
                
                if (timePeriod) {
                  const year = parseInt(timePeriod);
                  if (!isNaN(year)) {
                    // Convert per thousand employed to per million people (approximate)
                    // Assuming ~50% employment rate, multiply by ~500
                    data.push({ country, year, value: Number(value) * 500 });
                  }
                }
              }
            });
            
            if (data.length > 0) {
              results[country] = data.sort((a, b) => a.year - b.year);
              console.log(`✅ OECD Researchers: ${country} - ${data.length} years`);
            }
          }
        }
      } catch (error: any) {
        if (error.response?.status !== 404 && error.response?.status !== 400) {
          console.warn(`⚠️ OECD Researchers: Could not fetch ${country} -`, error.message);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    clientCache.set(cacheKey, results, 1000 * 60 * 60 * 24);
    
    console.log(`🔬🏛️ OECD: Researchers data fetched for ${Object.keys(results).length} countries`);
    
    return results;
  } catch (error: any) {
    console.error('❌ OECD: Error fetching researchers:', error.message);
    return {};
  }
}

/**
 * Fetch Patent applications from OECD
 */
export async function fetchOECDPatents(): Promise<{ [country: string]: OECDDataPoint[] }> {
  try {
    const cacheKey = 'oecd_patents';
    const cached = clientCache.get<{ [country: string]: OECDDataPoint[] }>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached OECD patents data');
      return cached;
    }

    console.log('🔬🏛️ ========================================');
    console.log('🔬🏛️ OECD: Fetching Patent applications...');
    console.log('🔬🏛️ ========================================');
    
    const results: { [country: string]: OECDDataPoint[] } = {};
    const countries = Object.keys(TECH_COUNTRY_CODE_MAP);
    
    for (const country of countries) {
      try {
        const oecdCode = TECH_COUNTRY_CODE_MAP[country];
        
        // OECD Patent statistics - Patent applications
        const url = `/api/oecd?dataset=OECD.STI.STP,DSD_MSTI@DF_MSTI,1.0/${oecdCode}.A.PATENT.TOTAL.._T._T._T&startPeriod=1990`;
        
        const response = await axios.get(url, { timeout: 15000 });
        
        if (response.data?.data?.dataSets?.[0]?.observations) {
          const observations = response.data.data.dataSets[0].observations;
          const structure = response.data.data.structure;
          
          const timeDimension = structure.dimensions?.observation?.find((d: any) => 
            d.id === 'TIME_PERIOD'
          );
          
          if (timeDimension?.values) {
            const data: OECDDataPoint[] = [];
            
            Object.entries(observations).forEach(([key, observation]: [string, any]) => {
              const value = observation[0];
              if (value !== null && !isNaN(value)) {
                const timeIndex = parseInt(key.split(':').pop() || '0');
                const timePeriod = timeDimension.values[timeIndex]?.id;
                
                if (timePeriod) {
                  const year = parseInt(timePeriod);
                  if (!isNaN(year)) {
                    data.push({ country, year, value: Number(value) });
                  }
                }
              }
            });
            
            if (data.length > 0) {
              results[country] = data.sort((a, b) => a.year - b.year);
              console.log(`✅ OECD Patents: ${country} - ${data.length} years`);
            }
          }
        }
      } catch (error: any) {
        if (error.response?.status !== 404 && error.response?.status !== 400) {
          console.warn(`⚠️ OECD Patents: Could not fetch ${country} -`, error.message);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    clientCache.set(cacheKey, results, 1000 * 60 * 60 * 24);
    
    console.log(`🔬🏛️ OECD: Patent data fetched for ${Object.keys(results).length} countries`);
    
    return results;
  } catch (error: any) {
    console.error('❌ OECD: Error fetching patents:', error.message);
    return {};
  }
}

/**
 * Fetch all OECD technology data at once
 * NOTE: OECD MSTI API has changed structure and is rate-limited.
 * We now rely primarily on fallback data for technology indicators.
 * This function returns empty data to avoid API errors.
 */
export async function fetchOECDTechnologyData(): Promise<OECDTechData> {
  console.log('🔬🏛️ ========================================');
  console.log('🔬🏛️ OECD: Technology data API currently unavailable');
  console.log('🔬🏛️ Using fallback data for technology indicators');
  console.log('🔬🏛️ ========================================');
  
  // Return empty data - fallback data will be used instead
  // The OECD MSTI API structure has changed and is heavily rate-limited
  return {
    rdSpending: {},
    researchers: {},
    patents: {},
    hightechExports: {}
  };
}

