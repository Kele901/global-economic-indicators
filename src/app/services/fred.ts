import axios from "axios";
import { clientCache, CacheKeys } from "./clientCache";

// FRED Series IDs for US Economic Indicators
const FRED_SERIES = {
  INTEREST_RATE: 'INTDSRUSM193N', // Interest Rates, Discount Rate for United States
  // Alternative: 'FEDFUNDS' - Federal Funds Rate
  // Alternative: 'DGS10' - 10-Year Treasury Rate
  UNEMPLOYMENT_RATE: 'UNRATE', // Unemployment Rate
  EMPLOYMENT_RATE: 'EMRATIO', // Employment-Population Ratio
  INFLATION_RATE: 'FPCPITOTLZGUSA', // Inflation, consumer prices for the United States
  GDP_GROWTH: 'A191RL1Q225SBEA', // Real GDP Growth Rate
  CPI: 'CPIAUCSL', // Consumer Price Index for All Urban Consumers
  GOVERNMENT_DEBT: 'GFDEGDQ188S', // Federal Debt: Total Public Debt as Percent of GDP
  POPULATION_GROWTH: 'SPPOPGROWUSA', // Population growth rate
  FDI: 'ROWFDIQ027S', // Foreign Direct Investment in US
  TRADE_BALANCE: 'BOPGSTB', // Trade Balance: Goods and Services, Balance of Payments Basis
  LABOR_PRODUCTIVITY: 'OPHNFB', // Nonfarm Business Sector: Real Output Per Hour
  GOVERNMENT_SPENDING: 'GCEC1', // Government Consumption Expenditures
  RD_SPENDING: 'Y694RC1Q027SBEA', // Research and Development Expenditures
  ENERGY_CONSUMPTION: 'ENEUC', // Energy Consumption
};

interface FREDObservation {
  date: string;
  value: string;
}

interface FREDResponse {
  observations: FREDObservation[];
}

export interface USADataPoint {
  year: number;
  value: number;
}

// Fetch data from FRED API with retry logic (via Next.js API route to avoid CORS)
async function fetchFREDSeries(
  seriesId: string,
  startDate: string = '1960-01-01',
  endDate: string = '2024-12-31',
  retries: number = 3
): Promise<USADataPoint[]> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const cacheKey = `fred_${seriesId}`;
      const cached = clientCache.get<USADataPoint[]>(cacheKey);
      
      if (cached) {
        console.log(`Using cached FRED data for ${seriesId}`);
        return cached;
      }

      // Use Next.js API route to avoid CORS issues
      const url = `/api/fred?series_id=${seriesId}&observation_start=${startDate}&observation_end=${endDate}`;
      
      console.log(`🔍 FRED: Fetching ${seriesId} via API route...`);
      
      const response = await axios.get<FREDResponse>(url, { 
        timeout: 10000
      });
      
      console.log(`✅ FRED: Received response for ${seriesId}, status: ${response.status}`);
      
      if (!response.data || !response.data.observations) {
        console.warn(`No FRED data found for series ${seriesId}`);
        return [];
      }

      // Group by year and calculate annual average
      const yearlyData: { [year: number]: number[] } = {};
      
      response.data.observations.forEach((obs) => {
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
      const result: USADataPoint[] = Object.entries(yearlyData)
        .map(([year, values]) => ({
          year: parseInt(year),
          value: values.reduce((sum, val) => sum + val, 0) / values.length
        }))
        .sort((a, b) => a.year - b.year);

      // Cache for 24 hours
      clientCache.set(cacheKey, result, 1000 * 60 * 60 * 24);
      
      console.log(`FRED: Found ${result.length} years of data for ${seriesId}`);
      return result;
      
    } catch (error: any) {
      const isLastAttempt = attempt === retries - 1;
      
      console.error(`❌ FRED Error for ${seriesId} (attempt ${attempt + 1}/${retries}):`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (isLastAttempt) {
        console.error(`💥 FRED FAILED for ${seriesId} after ${retries} attempts`);
        return [];
      }
      
      // Wait before retry with exponential backoff
      const waitTime = 1000 * Math.pow(2, attempt);
      console.warn(`Retry attempt ${attempt + 1}/${retries} for ${seriesId} after ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  return [];
}

// Fetch all US economic data from FRED
export async function fetchUSADataFromFRED(): Promise<{
  interestRates: USADataPoint[];
  employmentRates: USADataPoint[];
  unemploymentRates: USADataPoint[];
  governmentDebt: USADataPoint[];
  inflationRates: USADataPoint[];
  gdpGrowth: USADataPoint[];
  cpiData: USADataPoint[];
  populationGrowth: USADataPoint[];
  fdi: USADataPoint[];
  tradeBalance: USADataPoint[];
  governmentSpending: USADataPoint[];
  laborProductivity: USADataPoint[];
  rdSpending: USADataPoint[];
  energyConsumption: USADataPoint[];
}> {
  try {
    console.log('🇺🇸 ========================================');
    console.log('🇺🇸 FRED API: Fetching comprehensive US data via API route');
    console.log('🇺🇸 ========================================');
    const startTime = Date.now();
    
    const results = await Promise.allSettled([
      fetchFREDSeries(FRED_SERIES.INTEREST_RATE),
      fetchFREDSeries(FRED_SERIES.EMPLOYMENT_RATE),
      fetchFREDSeries(FRED_SERIES.UNEMPLOYMENT_RATE),
      fetchFREDSeries(FRED_SERIES.GOVERNMENT_DEBT),
      fetchFREDSeries(FRED_SERIES.INFLATION_RATE),
      fetchFREDSeries(FRED_SERIES.GDP_GROWTH),
      fetchFREDSeries(FRED_SERIES.CPI),
      fetchFREDSeries(FRED_SERIES.POPULATION_GROWTH),
      fetchFREDSeries(FRED_SERIES.FDI),
      fetchFREDSeries(FRED_SERIES.TRADE_BALANCE),
      fetchFREDSeries(FRED_SERIES.GOVERNMENT_SPENDING),
      fetchFREDSeries(FRED_SERIES.LABOR_PRODUCTIVITY),
      fetchFREDSeries(FRED_SERIES.RD_SPENDING),
      fetchFREDSeries(FRED_SERIES.ENERGY_CONSUMPTION)
    ]);

    const [
      interestRates,
      employmentRates,
      unemploymentRates,
      governmentDebt,
      inflationRates,
      gdpGrowth,
      cpiData,
      populationGrowth,
      fdi,
      tradeBalance,
      governmentSpending,
      laborProductivity,
      rdSpending,
      energyConsumption
    ] = results.map(result => result.status === 'fulfilled' ? result.value : []);

    const elapsedTime = Date.now() - startTime;
    const failedCount = results.filter(r => r.status === 'rejected').length;
    
    console.log(`FRED: Fetched US data in ${elapsedTime}ms (${failedCount} failures)`);

    return {
      interestRates,
      employmentRates,
      unemploymentRates,
      governmentDebt,
      inflationRates,
      gdpGrowth,
      cpiData,
      populationGrowth,
      fdi,
      tradeBalance,
      governmentSpending,
      laborProductivity,
      rdSpending,
      energyConsumption
    };
  } catch (error) {
    console.error('Critical error fetching US data from FRED:', error);
    return {
      interestRates: [],
      employmentRates: [],
      unemploymentRates: [],
      governmentDebt: [],
      inflationRates: [],
      gdpGrowth: [],
      cpiData: [],
      populationGrowth: [],
      fdi: [],
      tradeBalance: [],
      governmentSpending: [],
      laborProductivity: [],
      rdSpending: [],
      energyConsumption: []
    };
  }
}

// Export function to clear FRED cache
export function clearFREDCache(): void {
  Object.values(FRED_SERIES).forEach(seriesId => {
    clientCache.delete(`fred_${seriesId}`);
  });
  console.log('Cleared all FRED cached data');
}

