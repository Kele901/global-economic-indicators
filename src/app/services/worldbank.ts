import axios from "axios";
import { clientCache, CacheKeys, CURRENT_CACHE_VERSION } from "./clientCache";
import { fetchUSADataFromFRED, clearFREDCache, type USADataPoint } from "./fred";

// Type definitions for economic data
export interface CountryData {
  year: number;
  [countryCode: string]: number | string;
}

// World Bank API configuration
const WORLD_BANK_BASE_URL = 'https://api.worldbank.org/v2/country';
const INDICATORS = {
  INTEREST_RATE: 'FR.INR.RINR', // Real interest rate
  EMPLOYMENT_RATE: 'SL.EMP.TOTL.SP.ZS', // Employment to population ratio
  UNEMPLOYMENT_RATE: 'SL.UEM.TOTL.ZS', // Unemployment rate
  GOVERNMENT_DEBT: 'GC.DOD.TOTL.GD.ZS', // Central government debt, total (% of GDP)
  INFLATION_RATE: 'FP.CPI.TOTL.ZG', // Inflation, consumer prices (annual %)
  GDP_GROWTH: 'NY.GDP.MKTP.KD.ZG', // GDP growth (annual %)
  CPI: 'FP.CPI.TOTL', // Consumer price index (2010 = 100)
  POPULATION_GROWTH: 'SP.POP.GROW', // Population growth (annual %)
  FDI: 'BX.KLT.DINV.WD.GD.ZS', // Foreign direct investment, net inflows (% of GDP)
  TRADE_BALANCE: 'NE.TRD.GNFS.ZS', // Trade (% of GDP)
  GOVERNMENT_SPENDING: 'NE.CON.GOVT.ZS', // General government final consumption expenditure (% of GDP)
  LABOR_PRODUCTIVITY: 'SL.GDP.PCAP.EM.KD', // GDP per person employed (constant 2017 PPP $)
  GINI_COEFFICIENT: 'SI.POV.GINI', // Gini index
  RD_SPENDING: 'GB.XPD.RSDV.GD.ZS', // Research and development expenditure (% of GDP)
  ENERGY_CONSUMPTION: 'EG.USE.PCAP.KG.OE', // Energy use (kg of oil equivalent per capita)
};

// Country codes for major economies
const COUNTRY_CODES = [
  'US', 'CA', 'GB', 'FR', 'DE', 'IT', 'JP', 'AU', 'MX', 'KR', 'ES', 'SE', 'CH', 'TR', 'NG', 'CN', 'RU', 'BR', 'CL', 'AR', 'IN', 'NO'
];

// Country name mapping
const COUNTRY_NAMES: { [key: string]: string } = {
  'US': 'USA',
  'CA': 'Canada',
  'GB': 'UK',
  'FR': 'France',
  'DE': 'Germany',
  'IT': 'Italy',
  'JP': 'Japan',
  'AU': 'Australia',
  'MX': 'Mexico',
  'KR': 'SouthKorea',
  'ES': 'Spain',
  'SE': 'Sweden',
  'CH': 'Switzerland',
  'TR': 'Turkey',
  'NG': 'Nigeria',
  'CN': 'China',
  'RU': 'Russia',
  'BR': 'Brazil',
  'CL': 'Chile',
  'AR': 'Argentina',
  'IN': 'India',
  'NO': 'Norway'
};

// Function to fetch data with retry logic and exponential backoff
async function fetchWithRetry(
  url: string, 
  retries: number = 3,
  delay: number = 1000
): Promise<any> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'GlobalEconomicIndicators/1.0'
        }
      });
      
      if (response.status === 200 && response.data) {
        return response.data;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error: any) {
      const isLastAttempt = attempt === retries - 1;
      
      // Don't retry on 404 or client errors
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      if (isLastAttempt) {
        throw error;
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt);
      console.warn(`Retry attempt ${attempt + 1}/${retries} after ${waitTime}ms for ${url}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error('Max retries exceeded');
}

// Function to fetch data for a specific indicator with caching
async function fetchIndicatorData(
  indicator: string, 
  countries: string[],
  useCache: boolean = true
): Promise<CountryData[]> {
  try {
    // Check cache version - invalidate if outdated
    const cachedVersion = clientCache.get<number>(CacheKeys.cacheVersion());
    if (cachedVersion !== CURRENT_CACHE_VERSION) {
      console.log(`🔄 Indicator cache version mismatch. Clearing...`);
      // Clear only this indicator's cache
      const cacheKey = CacheKeys.worldBankIndicator(indicator);
      clientCache.delete(cacheKey);
    }
    
    // Check cache first
    const cacheKey = CacheKeys.worldBankIndicator(indicator);
    if (useCache) {
      const cached = clientCache.get<CountryData[]>(cacheKey);
      if (cached) {
        console.log(`Using cached data for ${indicator}`);
        return cached;
      }
    }

    const countryString = countries.join(';');
    const url = `${WORLD_BANK_BASE_URL}/${countryString}/indicator/${indicator}?format=json&per_page=1000&date=1960:2024`;
    
    console.log(`Fetching fresh data for ${indicator}...`);
    const response = await fetchWithRetry(url);
    const data = response[1]; // World Bank returns data in second element
    
    if (!data || !Array.isArray(data)) {
      console.warn(`No data found for indicator ${indicator}`);
      return [];
    }

    // Group data by year
    const yearData: { [year: string]: CountryData } = {};
    const countriesFound = new Set<string>();
    
    data.forEach((item: any) => {
      if (item.value !== null && item.date && item.country?.id) {
        const year = parseInt(item.date);
        const countryCode = item.country.id;
        const countryName = COUNTRY_NAMES[countryCode];
        
        if (countryName) {
          countriesFound.add(countryName);
          if (!yearData[year]) {
            yearData[year] = { year };
          }
          yearData[year][countryName] = item.value;
        } else if (countryCode) {
          // Log unmapped country codes for debugging
          console.warn(`Unmapped country code: ${countryCode}`);
        }
      }
    });

    const result = Object.values(yearData).sort((a, b) => a.year - b.year);
    
    // Debug: Log which countries we found data for
    console.log(`Indicator ${indicator} - Found data for countries:`, Array.from(countriesFound).sort());
    
    // Cache the result for 24 hours
    clientCache.set(cacheKey, result, 1000 * 60 * 60 * 24);
    
    return result;
  } catch (error: any) {
    console.error(`Error fetching data for indicator ${indicator}:`, error.message || error);
    
    // Try to return cached data even if expired as fallback
    const cacheKey = CacheKeys.worldBankIndicator(indicator);
    const staleCache = clientCache.get<CountryData[]>(cacheKey);
    if (staleCache) {
      console.warn(`Using stale cache for ${indicator} due to API error`);
      return staleCache;
    }
    
    return [];
  }
}

// Helper function to merge FRED USA data into World Bank data
function mergeUSADataFromFRED(
  worldBankData: CountryData[],
  fredData: USADataPoint[]
): CountryData[] {
  if (fredData.length === 0) {
    console.warn('No FRED data to merge for USA');
    return worldBankData;
  }

  // Create a map of existing years
  const dataMap = new Map<number, CountryData>();
  worldBankData.forEach(item => {
    dataMap.set(item.year, { ...item });
  });

  // Add or update USA data from FRED
  let addedCount = 0;
  let updatedCount = 0;
  
  fredData.forEach(({ year, value }) => {
    if (dataMap.has(year)) {
      const existing = dataMap.get(year)!;
      // Only update if USA data doesn't exist or is null
      if (existing.USA === undefined || existing.USA === null) {
        existing.USA = value;
        updatedCount++;
      }
    } else {
      dataMap.set(year, { year, USA: value });
      addedCount++;
    }
  });

  console.log(`FRED merge: Added ${addedCount} new years, updated ${updatedCount} existing years for USA`);
  
  return Array.from(dataMap.values()).sort((a, b) => a.year - b.year);
}

// Main function to fetch all global economic data with improved error handling
export async function fetchGlobalData(forceRefresh: boolean = false): Promise<{
  interestRates: CountryData[];
  employmentRates: CountryData[];
  unemploymentRates: CountryData[];
  governmentDebt: CountryData[];
  inflationRates: CountryData[];
  gdpGrowth: CountryData[];
  cpiData: CountryData[];
  populationGrowth: CountryData[];
  fdi: CountryData[];
  tradeBalance: CountryData[];
  governmentSpending: CountryData[];
  laborProductivity: CountryData[];
  giniCoefficient: CountryData[];
  rdSpending: CountryData[];
  energyConsumption: CountryData[];
}> {
  try {
    // Check cache version - invalidate if outdated
    const cachedVersion = clientCache.get<number>(CacheKeys.cacheVersion());
    if (cachedVersion !== CURRENT_CACHE_VERSION) {
      console.log(`🔄 Cache version mismatch (${cachedVersion} !== ${CURRENT_CACHE_VERSION}). Clearing old cache...`);
      clientCache.clear();
      clearFREDCache();
      clientCache.set(CacheKeys.cacheVersion(), CURRENT_CACHE_VERSION);
    }
    
    // Check for cached complete dataset first
    const cacheKey = CacheKeys.worldBankAll();
    if (!forceRefresh) {
      const cached = clientCache.get<any>(cacheKey);
      if (cached) {
        console.log('Using cached complete dataset');
        return cached;
      }
    }

    console.log('Fetching global economic data from World Bank...');
    const startTime = Date.now();
    
    // Fetch all indicators using Promise.allSettled to handle partial failures
    const results = await Promise.allSettled([
      fetchIndicatorData(INDICATORS.INTEREST_RATE, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.EMPLOYMENT_RATE, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.UNEMPLOYMENT_RATE, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.GOVERNMENT_DEBT, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.INFLATION_RATE, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.GDP_GROWTH, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.CPI, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.POPULATION_GROWTH, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.FDI, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.TRADE_BALANCE, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.GOVERNMENT_SPENDING, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.LABOR_PRODUCTIVITY, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.GINI_COEFFICIENT, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.RD_SPENDING, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.ENERGY_CONSUMPTION, COUNTRY_CODES, !forceRefresh)
    ]);

    // Extract results and track failures
    const [
      interestRatesResult,
      employmentRatesResult,
      unemploymentRatesResult,
      governmentDebtResult,
      inflationRatesResult,
      gdpGrowthResult,
      cpiDataResult,
      populationGrowthResult,
      fdiResult,
      tradeBalanceResult,
      governmentSpendingResult,
      laborProductivityResult,
      giniCoefficientResult,
      rdSpendingResult,
      energyConsumptionResult
    ] = results;

    // Log any failures
    const indicatorNames = [
      'Interest Rates', 'Employment', 'Unemployment', 'Government Debt', 
      'Inflation', 'GDP Growth', 'CPI', 'Population Growth', 'FDI', 
      'Trade Balance', 'Government Spending', 'Labor Productivity', 
      'Gini Coefficient', 'R&D Spending', 'Energy Consumption'
    ];
    
    let failedCount = 0;
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to fetch ${indicatorNames[index]}:`, result.reason);
        failedCount++;
      }
    });

    if (failedCount > 0) {
      console.warn(`${failedCount} out of ${results.length} indicators failed to load`);
    }

    const elapsedTime = Date.now() - startTime;
    console.log(`Successfully fetched economic data in ${elapsedTime}ms (${failedCount} failures)`);
    
    // Fetch comprehensive USA data from FRED API
    console.log('📊 ========================================');
    console.log('📊 Fetching supplementary US data from FRED API...');
    console.log('📊 ========================================');
    const usaData = await fetchUSADataFromFRED();
    console.log('📊 FRED fetch complete. Processing USA data merge...');
    
// Merge FRED data with World Bank data for comprehensive USA coverage
console.log('📊 Starting data merge for USA...');
console.log('📊 FRED Interest Rates data points:', usaData.interestRates.length);
console.log('📊 World Bank Interest Rates data points:', interestRatesResult.status === 'fulfilled' ? interestRatesResult.value.length : 0);

const completeData = {
  interestRates: mergeUSADataFromFRED(
    interestRatesResult.status === 'fulfilled' ? interestRatesResult.value : [],
    usaData.interestRates
  ),
      employmentRates: mergeUSADataFromFRED(
        employmentRatesResult.status === 'fulfilled' ? employmentRatesResult.value : [],
        usaData.employmentRates
      ),
      unemploymentRates: mergeUSADataFromFRED(
        unemploymentRatesResult.status === 'fulfilled' ? unemploymentRatesResult.value : [],
        usaData.unemploymentRates
      ),
      governmentDebt: mergeUSADataFromFRED(
        governmentDebtResult.status === 'fulfilled' ? governmentDebtResult.value : [],
        usaData.governmentDebt
      ),
      inflationRates: mergeUSADataFromFRED(
        inflationRatesResult.status === 'fulfilled' ? inflationRatesResult.value : [],
        usaData.inflationRates
      ),
      gdpGrowth: mergeUSADataFromFRED(
        gdpGrowthResult.status === 'fulfilled' ? gdpGrowthResult.value : [],
        usaData.gdpGrowth
      ),
      cpiData: mergeUSADataFromFRED(
        cpiDataResult.status === 'fulfilled' ? cpiDataResult.value : [],
        usaData.cpiData
      ),
      populationGrowth: mergeUSADataFromFRED(
        populationGrowthResult.status === 'fulfilled' ? populationGrowthResult.value : [],
        usaData.populationGrowth
      ),
      fdi: mergeUSADataFromFRED(
        fdiResult.status === 'fulfilled' ? fdiResult.value : [],
        usaData.fdi
      ),
      tradeBalance: mergeUSADataFromFRED(
        tradeBalanceResult.status === 'fulfilled' ? tradeBalanceResult.value : [],
        usaData.tradeBalance
      ),
      governmentSpending: mergeUSADataFromFRED(
        governmentSpendingResult.status === 'fulfilled' ? governmentSpendingResult.value : [],
        usaData.governmentSpending
      ),
      laborProductivity: mergeUSADataFromFRED(
        laborProductivityResult.status === 'fulfilled' ? laborProductivityResult.value : [],
        usaData.laborProductivity
      ),
      giniCoefficient: giniCoefficientResult.status === 'fulfilled' ? giniCoefficientResult.value : [],
      rdSpending: mergeUSADataFromFRED(
        rdSpendingResult.status === 'fulfilled' ? rdSpendingResult.value : [],
        usaData.rdSpending
      ),
      energyConsumption: mergeUSADataFromFRED(
        energyConsumptionResult.status === 'fulfilled' ? energyConsumptionResult.value : [],
        usaData.energyConsumption
      )
    };

    // Debug: Check if USA data exists in merged data
    const sampleYear = completeData.interestRates.find(d => d.USA !== undefined);
    console.log('📊 Sample merged interest rate data with USA:', sampleYear);
    console.log('📊 Total interest rate data points after merge:', completeData.interestRates.length);
    
    // Cache the complete dataset for 24 hours
    clientCache.set(cacheKey, completeData, 1000 * 60 * 60 * 24);
    
    // Store cache version
    clientCache.set(CacheKeys.cacheVersion(), CURRENT_CACHE_VERSION);
    
    // Store last update timestamp
    clientCache.set(CacheKeys.lastUpdate(), new Date().toISOString(), 1000 * 60 * 60 * 24);

    return completeData;
  } catch (error) {
    console.error('Critical error fetching global data:', error);
    
    // Try to return cached data as last resort
    const cacheKey = CacheKeys.worldBankAll();
    const staleCache = clientCache.get<any>(cacheKey);
    if (staleCache) {
      console.warn('Returning stale cached data due to critical API error');
      return staleCache;
    }
    
    throw new Error('Failed to fetch economic data from World Bank API. Please try again later.');
  }
}

// Export function to clear cache (useful for testing or manual refresh)
export function clearDataCache(): void {
  clientCache.clear();
  clearFREDCache();
  // Reset cache version after clearing
  clientCache.set(CacheKeys.cacheVersion(), CURRENT_CACHE_VERSION);
  console.log('Cleared all cached economic data (World Bank + FRED)');
}

// Export function to get cache age
export function getCacheAge(): { age: number | null; formatted: string } {
  const lastUpdate = clientCache.get<string>(CacheKeys.lastUpdate());
  if (!lastUpdate) {
    return { age: null, formatted: 'No cached data' };
  }
  
  const age = Date.now() - new Date(lastUpdate).getTime();
  const hours = Math.floor(age / (1000 * 60 * 60));
  const minutes = Math.floor((age % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    age,
    formatted: hours > 0 ? `${hours}h ${minutes}m ago` : `${minutes}m ago`
  };
}
