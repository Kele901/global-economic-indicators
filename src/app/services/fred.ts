import axios from "axios";
import { clientCache, CacheKeys } from "./clientCache";

// FRED Series IDs for US Economic Indicators
const FRED_SERIES = {
  INTEREST_RATE: 'FEDFUNDS', // Federal Funds Effective Rate (most current, updated monthly)
  // Alternative: 'INTDSRUSM193N' - Interest Rates, Discount Rate for United States
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
  ENERGY_CONSUMPTION: 'TOTALENUSA', // Total Energy Consumption (Quadrillion BTU)
  
  // Additional Economic Indicators
  GDP_PER_CAPITA: 'A939RC0Q052SBEA', // Real gross domestic product per capita
  CURRENT_ACCOUNT: 'NETFI', // Net Capital Account, Flow (USD)
  GROSS_CAPITAL_FORMATION: 'GPDI', // Gross Private Domestic Investment
  RESERVES: 'TRESEGUSM052N', // Total Reserves excluding Gold for United States
  EXCHANGE_RATE_INDEX: 'DTWEXBGS', // Trade Weighted U.S. Dollar Index: Broad, Goods and Services
  TERTIARY_ENROLLMENT: 'BARTERICMP25UPZSUSA', // Population age 25+ with tertiary schooling (Barro-Lee)
  TAX_REVENUE: 'FGRECPT', // Federal Government Current Tax Receipts
  DOMESTIC_CREDIT: 'DPSACBW027SBOG', // Domestic Private Sector Credit
  EXPORTS: 'EXPGS', // Exports of Goods and Services
  IMPORTS: 'IMPGS', // Imports of Goods and Services
  HIGHTECH_EXPORTS: 'IQ', // High-tech Industry Production Index (proxy)
  CO2_EMISSIONS: 'EMISSCO2TOTVTTTOUSA', // Total CO2 Emissions From All Sectors, All Fuels (Million Metric Tons)
  
  // Top 10 High-Impact Additional Indicators
  LABOR_FORCE_PARTICIPATION: 'CIVPART', // Labor Force Participation Rate
  BUDGET_BALANCE: 'FYFSGDA188S', // Federal Surplus or Deficit as Percent of GDP
  HEALTHCARE_EXPENDITURE: 'DHLCRG3Q086SBEA', // Personal consumption expenditures: Health care (chain-type quantity index)
  EDUCATION_EXPENDITURE: 'G160191A027NBEA', // Government total expenditures: Education
  YOUTH_UNEMPLOYMENT: 'LNS14000012', // Unemployment Rate - 16-19 yrs.
  MANUFACTURING_VALUE_ADDED: 'VAPGDPMA', // Value Added by Private Industries: Manufacturing as a Percentage of GDP
  HOUSEHOLD_CONSUMPTION: 'DPCERG3A086NBEA', // Personal Consumption Expenditures
  FEMALE_LABOR_FORCE: 'LNS11300002', // Labor Force Participation Rate - Women
  
  // Advanced Economic & Development Indicators
  MILITARY_EXPENDITURE: 'FDEFX', // Federal Defense Consumption Expenditures
  MARKET_CAPITALIZATION: 'DDDM01USA156NWDB', // Market capitalization of listed domestic companies (% of GDP) for United States
  PUBLIC_DEBT_SERVICE: 'A091RC1Q027SBEA', // Federal government: Interest payments
  SERVICES_VALUE_ADDED: 'VAPGDPSPI', // Value Added by Private Services-Producing Industries as a Percentage of GDP
  AGRICULTURAL_VALUE_ADDED: 'VAPGDPAFH', // Value Added by Agriculture, Forestry, Fishing, and Hunting as a Percentage of GDP
  PRIVATE_INVESTMENT: 'GPDI', // Gross Private Domestic Investment
  
  // Technology & Innovation Indicators
  PATENTS_TOTAL: 'PATENTUSALLTOTAL', // Total Patents Originating in the United States
  PATENTS_ALL: 'PATENTALLALLTOTAL', // Total Patents Granted (All Origins)
  RD_REAL: 'Y694RX1Q020SBEA', // Real Gross Domestic Product: Research and Development
  RD_PRIVATE: 'Y006RC1Q027SBEA', // Private R&D Investment
  RD_GOVERNMENT: 'Y057RC1Q027SBEA', // Government R&D Investment
  ADVANCED_TECH_EXPORTS: 'EXP0007', // U.S. Exports of Advance Technology Products
  ICT_SERVICES_EXPORTS: 'ITXTCIM133S', // Telecommunications, Computer, and Information Services Exports
  STEM_EMPLOYMENT: 'CES6054000001', // Employment in Professional, Scientific, and Technical Services
  COMPUTER_EMPLOYMENT: 'CES5051200001', // Employment in Computer Systems Design and Related Services
  INTERNET_SUBSCRIPTIONS: 'ITNETUSERP2USA', // Internet Users (% of population)
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
  gdpPerCapitaPPP: USADataPoint[];
  currentAccount: USADataPoint[];
  grossCapitalFormation: USADataPoint[];
  reservesMonthsImports: USADataPoint[];
  exchangeRate: USADataPoint[];
  tertiaryEnrollment: USADataPoint[];
  taxRevenue: USADataPoint[];
  domesticCredit: USADataPoint[];
  exports: USADataPoint[];
  imports: USADataPoint[];
  hightechExports: USADataPoint[];
  co2Emissions: USADataPoint[];
  laborForceParticipation: USADataPoint[];
  budgetBalance: USADataPoint[];
  healthcareExpenditure: USADataPoint[];
  educationExpenditure: USADataPoint[];
  youthUnemployment: USADataPoint[];
  manufacturingValueAdded: USADataPoint[];
  householdConsumption: USADataPoint[];
  femaleLaborForce: USADataPoint[];
  militaryExpenditure: USADataPoint[];
  marketCapitalization: USADataPoint[];
  publicDebtService: USADataPoint[];
  servicesValueAdded: USADataPoint[];
  agriculturalValueAdded: USADataPoint[];
  privateInvestment: USADataPoint[];
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
      fetchFREDSeries(FRED_SERIES.ENERGY_CONSUMPTION),
      fetchFREDSeries(FRED_SERIES.GDP_PER_CAPITA),
      fetchFREDSeries(FRED_SERIES.CURRENT_ACCOUNT),
      fetchFREDSeries(FRED_SERIES.GROSS_CAPITAL_FORMATION),
      fetchFREDSeries(FRED_SERIES.RESERVES),
      fetchFREDSeries(FRED_SERIES.EXCHANGE_RATE_INDEX),
      fetchFREDSeries(FRED_SERIES.TERTIARY_ENROLLMENT),
      fetchFREDSeries(FRED_SERIES.TAX_REVENUE),
      fetchFREDSeries(FRED_SERIES.DOMESTIC_CREDIT),
      fetchFREDSeries(FRED_SERIES.EXPORTS),
      fetchFREDSeries(FRED_SERIES.IMPORTS),
      fetchFREDSeries(FRED_SERIES.HIGHTECH_EXPORTS),
      fetchFREDSeries(FRED_SERIES.CO2_EMISSIONS),
      fetchFREDSeries(FRED_SERIES.LABOR_FORCE_PARTICIPATION),
      fetchFREDSeries(FRED_SERIES.BUDGET_BALANCE),
      fetchFREDSeries(FRED_SERIES.HEALTHCARE_EXPENDITURE),
      fetchFREDSeries(FRED_SERIES.EDUCATION_EXPENDITURE),
      fetchFREDSeries(FRED_SERIES.YOUTH_UNEMPLOYMENT),
      fetchFREDSeries(FRED_SERIES.MANUFACTURING_VALUE_ADDED),
      fetchFREDSeries(FRED_SERIES.HOUSEHOLD_CONSUMPTION),
      fetchFREDSeries(FRED_SERIES.FEMALE_LABOR_FORCE),
      fetchFREDSeries(FRED_SERIES.MILITARY_EXPENDITURE),
      fetchFREDSeries(FRED_SERIES.MARKET_CAPITALIZATION),
      fetchFREDSeries(FRED_SERIES.PUBLIC_DEBT_SERVICE),
      fetchFREDSeries(FRED_SERIES.SERVICES_VALUE_ADDED),
      fetchFREDSeries(FRED_SERIES.AGRICULTURAL_VALUE_ADDED),
      fetchFREDSeries(FRED_SERIES.PRIVATE_INVESTMENT)
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
      energyConsumption,
      gdpPerCapitaPPP,
      currentAccount,
      grossCapitalFormation,
      reservesMonthsImports,
      exchangeRate,
      tertiaryEnrollment,
      taxRevenue,
      domesticCredit,
      exports,
      imports,
      hightechExports,
      co2Emissions,
      laborForceParticipation,
      budgetBalance,
      healthcareExpenditure,
      educationExpenditure,
      youthUnemployment,
      manufacturingValueAdded,
      householdConsumption,
      femaleLaborForce,
      militaryExpenditure,
      marketCapitalization,
      publicDebtService,
      servicesValueAdded,
      agriculturalValueAdded,
      privateInvestment
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
      energyConsumption,
      gdpPerCapitaPPP,
      currentAccount,
      grossCapitalFormation,
      reservesMonthsImports,
      exchangeRate,
      tertiaryEnrollment,
      taxRevenue,
      domesticCredit,
      exports,
      imports,
      hightechExports,
      co2Emissions,
      laborForceParticipation,
      budgetBalance,
      healthcareExpenditure,
      educationExpenditure,
      youthUnemployment,
      manufacturingValueAdded,
      householdConsumption,
      femaleLaborForce,
      militaryExpenditure,
      marketCapitalization,
      publicDebtService,
      servicesValueAdded,
      agriculturalValueAdded,
      privateInvestment
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
      energyConsumption: [],
      gdpPerCapitaPPP: [],
      currentAccount: [],
      grossCapitalFormation: [],
      reservesMonthsImports: [],
      exchangeRate: [],
      tertiaryEnrollment: [],
      taxRevenue: [],
      domesticCredit: [],
      exports: [],
      imports: [],
      hightechExports: [],
      co2Emissions: [],
      laborForceParticipation: [],
      budgetBalance: [],
      healthcareExpenditure: [],
      educationExpenditure: [],
      youthUnemployment: [],
      manufacturingValueAdded: [],
      householdConsumption: [],
      femaleLaborForce: [],
      militaryExpenditure: [],
      marketCapitalization: [],
      publicDebtService: [],
      servicesValueAdded: [],
      agriculturalValueAdded: [],
      privateInvestment: []
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

// US Technology Data from FRED
export interface USATechData {
  patentsGranted: USADataPoint[];
  patentsTotal: USADataPoint[];
  rdSpending: USADataPoint[];
  rdPrivate: USADataPoint[];
  rdGovernment: USADataPoint[];
  advancedTechExports: USADataPoint[];
  ictServicesExports: USADataPoint[];
  stemEmployment: USADataPoint[];
  computerEmployment: USADataPoint[];
  internetUsers: USADataPoint[];
}

// Fetch US Technology data from FRED
export async function fetchUSATechDataFromFRED(): Promise<USATechData> {
  try {
    console.log('🔬🇺🇸 ========================================');
    console.log('🔬🇺🇸 FRED API: Fetching US Technology Data');
    console.log('🔬🇺🇸 ========================================');
    const startTime = Date.now();
    
    const results = await Promise.allSettled([
      fetchFREDSeries(FRED_SERIES.PATENTS_TOTAL),
      fetchFREDSeries(FRED_SERIES.PATENTS_ALL),
      fetchFREDSeries(FRED_SERIES.RD_SPENDING),
      fetchFREDSeries(FRED_SERIES.RD_PRIVATE),
      fetchFREDSeries(FRED_SERIES.RD_GOVERNMENT),
      fetchFREDSeries(FRED_SERIES.ADVANCED_TECH_EXPORTS),
      fetchFREDSeries(FRED_SERIES.ICT_SERVICES_EXPORTS),
      fetchFREDSeries(FRED_SERIES.STEM_EMPLOYMENT),
      fetchFREDSeries(FRED_SERIES.COMPUTER_EMPLOYMENT),
      fetchFREDSeries(FRED_SERIES.INTERNET_SUBSCRIPTIONS)
    ]);

    const [
      patentsGranted,
      patentsTotal,
      rdSpending,
      rdPrivate,
      rdGovernment,
      advancedTechExports,
      ictServicesExports,
      stemEmployment,
      computerEmployment,
      internetUsers
    ] = results.map(result => result.status === 'fulfilled' ? result.value : []);

    const elapsedTime = Date.now() - startTime;
    const failedCount = results.filter(r => r.status === 'rejected').length;
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    
    console.log(`🔬🇺🇸 FRED Tech: Fetched in ${elapsedTime}ms (${successCount} success, ${failedCount} failures)`);
    
    // Log data availability
    console.log('🔬🇺🇸 Data availability:');
    console.log(`   - Patents (US): ${patentsGranted.length} years`);
    console.log(`   - Patents (All): ${patentsTotal.length} years`);
    console.log(`   - R&D Spending: ${rdSpending.length} years`);
    console.log(`   - R&D Private: ${rdPrivate.length} years`);
    console.log(`   - R&D Government: ${rdGovernment.length} years`);
    console.log(`   - Advanced Tech Exports: ${advancedTechExports.length} years`);
    console.log(`   - ICT Services Exports: ${ictServicesExports.length} years`);
    console.log(`   - STEM Employment: ${stemEmployment.length} years`);
    console.log(`   - Computer Employment: ${computerEmployment.length} years`);
    console.log(`   - Internet Users: ${internetUsers.length} years`);

    return {
      patentsGranted,
      patentsTotal,
      rdSpending,
      rdPrivate,
      rdGovernment,
      advancedTechExports,
      ictServicesExports,
      stemEmployment,
      computerEmployment,
      internetUsers
    };
  } catch (error) {
    console.error('Critical error fetching US tech data from FRED:', error);
    return {
      patentsGranted: [],
      patentsTotal: [],
      rdSpending: [],
      rdPrivate: [],
      rdGovernment: [],
      advancedTechExports: [],
      ictServicesExports: [],
      stemEmployment: [],
      computerEmployment: [],
      internetUsers: []
    };
  }
}

