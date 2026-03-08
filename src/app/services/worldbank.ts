import axios from "axios";
import { clientCache, CacheKeys, CURRENT_CACHE_VERSION } from "./clientCache";
import { fetchUSADataFromFRED, fetchUSATechDataFromFRED, clearFREDCache, type USADataPoint, type USATechData } from "./fred";
import { fetchAllPolicyRates, clearPolicyRatesCache, type PolicyRateDataPoint } from "./policyRates";
import { fetchJapanGovernmentDebtOECD, fetchOECDPolicyRates, fetchJapanPolicyRatesOECD, fetchOECDTechnologyData, clearOECDCache, type OECDDataPoint, type OECDTechData } from "./oecd";
import { fetchJapanGovernmentDebtIMF, fetchIMFGovernmentDebt, fetchIMFInterestRates, clearIMFCache, type IMFDataPoint } from "./imf";
import { fetchBISPolicyRates, fetchJapanPolicyRatesBIS, clearBISCache, type BISDataPoint } from "./bis";
import { TECHNOLOGY_FALLBACK_DATA, type FallbackDataPoint } from "../data/technologyFallbackData";
import { 
  vcFundingData, 
  unicornData, 
  aiPatentData, 
  ecommerceAdoptionData, 
  digitalPaymentData,
  stemGraduatesData,
  techEmploymentData,
  startupDensityData,
  convertToCountryData
} from "../data/extendedTechData";
import { fetchWIPOPatentData, type WIPOTechData, type WIPODataPoint } from "./wipo";
import { fetchEurostatTechnologyData, type EurostatTechData, type EurostatDataPoint } from "./eurostat";
import { fetchITUTechnologyData, type ITUTechData, type ITUDataPoint } from "./itu";

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
  
  // Additional Economic Indicators
  GDP_PER_CAPITA_PPP: 'NY.GDP.PCAP.PP.CD', // GDP per capita, PPP (current international $)
  CURRENT_ACCOUNT: 'BN.CAB.XOKA.GD.ZS', // Current account balance (% of GDP)
  GROSS_CAPITAL_FORMATION: 'NE.GDI.TOTL.ZS', // Gross capital formation (% of GDP)
  RESERVES_MONTHS_IMPORTS: 'FI.RES.TOTL.MO', // Total reserves in months of imports
  EXCHANGE_RATE: 'PA.NUS.FCRF', // Official exchange rate (LCU per US$, period average)
  POVERTY_RATE: 'SI.POV.DDAY', // Poverty headcount ratio at $2.15 a day (2017 PPP) (% of population)
  TERTIARY_ENROLLMENT: 'SE.TER.ENRR', // School enrollment, tertiary (% gross)
  TAX_REVENUE: 'GC.TAX.TOTL.GD.ZS', // Tax revenue (% of GDP)
  DOMESTIC_CREDIT: 'FS.AST.PRVT.GD.ZS', // Domestic credit to private sector (% of GDP)
  EXPORTS: 'NE.EXP.GNFS.ZS', // Exports of goods and services (% of GDP)
  IMPORTS: 'NE.IMP.GNFS.ZS', // Imports of goods and services (% of GDP)
  LIFE_EXPECTANCY: 'SP.DYN.LE00.IN', // Life expectancy at birth, total (years)
  URBAN_POPULATION: 'SP.URB.TOTL.IN.ZS', // Urban population (% of total population)
  HIGHTECH_EXPORTS: 'TX.VAL.TECH.MF.ZS', // High-technology exports (% of manufactured exports)
  CO2_EMISSIONS: 'EN.ATM.CO2E.PC', // CO2 emissions (metric tons per capita)
  NET_MIGRATION: 'SM.POP.NETM', // Net migration
  
  // Top 10 High-Impact Additional Indicators
  LABOR_FORCE_PARTICIPATION: 'SL.TLF.CACT.ZS', // Labor force participation rate (% of total population ages 15+)
  BUDGET_BALANCE: 'GC.BAL.CASH.GD.ZS', // Cash surplus/deficit (% of GDP)
  HEALTHCARE_EXPENDITURE: 'SH.XPD.CHEX.GD.ZS', // Current health expenditure (% of GDP)
  EDUCATION_EXPENDITURE: 'SE.XPD.TOTL.GD.ZS', // Government expenditure on education, total (% of GDP)
  INTERNET_USERS: 'IT.NET.USER.ZS', // Individuals using the Internet (% of population)
  YOUTH_UNEMPLOYMENT: 'SL.UEM.1524.ZS', // Unemployment, youth total (% of total labor force ages 15-24)
  MANUFACTURING_VALUE_ADDED: 'NV.IND.MANF.ZS', // Manufacturing, value added (% of GDP)
  HOUSEHOLD_CONSUMPTION: 'NE.CON.PETC.ZS', // Household final consumption expenditure (% of GDP)
  RENEWABLE_ENERGY: 'EG.FEC.RNEW.ZS', // Renewable energy consumption (% of total final energy consumption)
  FEMALE_LABOR_FORCE: 'SL.TLF.CACT.FE.ZS', // Labor force participation rate, female (% of female population ages 15+)
  
  // Advanced Economic & Development Indicators
  MILITARY_EXPENDITURE: 'MS.MIL.XPND.GD.ZS', // Military expenditure (% of GDP)
  MARKET_CAPITALIZATION: 'CM.MKT.LCAP.GD.ZS', // Market capitalization of listed domestic companies (% of GDP)
  SCIENTIFIC_PUBLICATIONS: 'IP.JRN.ARTC.SC', // Scientific and technical journal articles
  ICT_EXPORTS: 'TX.VAL.ICTG.ZS.UN', // ICT goods exports (% of total goods exports)
  MOBILE_SUBSCRIPTIONS: 'IT.CEL.SETS.P2', // Mobile cellular subscriptions (per 100 people)
  PATENT_APPLICATIONS: 'IP.PAT.RESD', // Patent applications, residents
  SOCIAL_SPENDING: 'per_si_allsi.cov_pop_tot', // Social protection coverage (% of population)
  PUBLIC_DEBT_SERVICE: 'GC.XPN.INTP.RV.ZS', // Interest payments (% of revenue)
  SERVICES_VALUE_ADDED: 'NV.SRV.TOTL.ZS', // Services, value added (% of GDP)
  AGRICULTURAL_VALUE_ADDED: 'NV.AGR.TOTL.ZS', // Agriculture, forestry, and fishing, value added (% of GDP)
  TRADE_OPENNESS: 'NE.TRD.GNFS.ZS', // Trade (% of GDP) - sum of exports and imports
  TARIFF_RATE: 'TM.TAX.MRCH.SM.AR.ZS', // Tariff rate, applied, simple mean, all products (%)
  TOURISM_RECEIPTS: 'ST.INT.RCPT.XP.ZS', // International tourism, receipts (% of total exports)
  PRIVATE_INVESTMENT: 'NE.GDI.STKB.ZS', // Gross fixed capital formation, private sector (% of GDP)
  NEW_BUSINESS_DENSITY: 'IC.BUS.NDNS.ZS', // New businesses registered (number per 1,000 people ages 15-64)
  
  // Technology & Innovation Indicators
  PATENT_APPLICATIONS_NONRES: 'IP.PAT.NRES', // Patent applications, non-residents
  TRADEMARK_APPLICATIONS: 'IP.TMK.RESD', // Trademark applications, direct resident
  RESEARCHERS_RD: 'SP.POP.SCIE.RD.P6', // Researchers in R&D (per million people)
  TECHNICIANS_RD: 'SP.POP.TECH.RD.P6', // Technicians in R&D (per million people)
  IP_RECEIPTS: 'BX.GSR.ROYL.CD', // Charges for the use of intellectual property, receipts (BoP, current US$)
  IP_PAYMENTS: 'BM.GSR.ROYL.CD', // Charges for the use of intellectual property, payments (BoP, current US$)
  
  // Digital Infrastructure Indicators
  BROADBAND_SUBSCRIPTIONS: 'IT.NET.BBND.P2', // Fixed broadband subscriptions (per 100 people)
  SECURE_SERVERS: 'IT.NET.SECR.P6', // Secure Internet servers (per 1 million people)
  ICT_GOODS_IMPORTS: 'TM.VAL.ICTG.ZS.UN', // ICT goods imports (% of total goods imports)
  
  // Digital Economy Indicators
  ICT_SERVICE_EXPORTS: 'BX.GSR.CCIS.ZS', // ICT service exports (% of service exports)

  // Live replacements for formerly static-only datasets
  STEM_GRADUATES: 'SE.TER.GRAD.SC.ZS', // STEM graduates (% of total tertiary graduates)
};

// Country codes for major economies
const COUNTRY_CODES = [
  'US', 'CA', 'GB', 'FR', 'DE', 'IT', 'JP', 'AU', 'MX', 'KR', 'ES', 'SE', 'CH', 'TR', 'NG', 'CN', 'RU', 'BR', 'CL', 'AR', 'IN', 'NO',
  'NL', 'PT', 'BE', 'ID', 'ZA', 'PL', 'SA', 'EG', 'IL', 'SG'
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
  'NO': 'Norway',
  'NL': 'Netherlands',
  'PT': 'Portugal',
  'BE': 'Belgium',
  'ID': 'Indonesia',
  'ZA': 'SouthAfrica',
  'PL': 'Poland',
  'SA': 'SaudiArabia',
  'EG': 'Egypt',
  'IL': 'Israel',
  'SG': 'Singapore'
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
        // Removed User-Agent header - causes browser warnings and is not needed
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
        console.log(`✅ Using cached data for ${indicator}`);
        return cached;
      }
    }

    const countryString = countries.join(';');
    const url = `${WORLD_BANK_BASE_URL}/${countryString}/indicator/${indicator}?format=json&per_page=1000&date=1960:2024`;
    
    console.log(`🌐 Fetching fresh data for ${indicator}...`);
    console.log(`📍 API URL: ${url}`);
    const response = await fetchWithRetry(url);
    const data = response[1]; // World Bank returns data in second element
    
    if (!data || !Array.isArray(data)) {
      console.warn(`⚠️ No data found for indicator ${indicator}`);
      return [];
    }

    console.log(`📦 Received ${data.length} data points for ${indicator}`);

    // Group data by year
    const yearData: { [year: string]: CountryData } = {};
    const countriesFound = new Set<string>();
    const countryCodesFound = new Set<string>();
    
    data.forEach((item: any) => {
      if (item.value !== null && item.date && item.country?.id) {
        const year = parseInt(item.date);
        const countryCode = item.country.id;
        const countryName = COUNTRY_NAMES[countryCode];
        
        countryCodesFound.add(countryCode);
        
        if (countryName) {
          countriesFound.add(countryName);
          if (!yearData[year]) {
            yearData[year] = { year };
          }
          yearData[year][countryName] = item.value;
        } else if (countryCode) {
          // Log unmapped country codes for debugging
          console.warn(`⚠️ Unmapped country code: ${countryCode}`);
        }
      }
    });

    const result = Object.values(yearData).sort((a, b) => a.year - b.year);
    
    // Enhanced debug logging
    console.log(`✅ Indicator ${indicator}:`);
    console.log(`   - Country codes found: ${Array.from(countryCodesFound).sort().join(', ')}`);
    console.log(`   - Mapped countries: ${Array.from(countriesFound).sort().join(', ')}`);
    console.log(`   - Years with data: ${result.length}`);
    
    // Check if Japan has data
    if (countryCodesFound.has('JP')) {
      // Count how many years have Japan data
      const japanYears = result.filter(yearData => yearData.Japan !== undefined && yearData.Japan !== null);
      console.log(`   🇯🇵 Japan: ✅ HAS DATA (${japanYears.length} years)`);
      
      // Log sample Japan data point
      if (japanYears.length > 0) {
        const latestJapanData = japanYears[japanYears.length - 1];
        console.log(`   🇯🇵 Japan latest: ${latestJapanData.year} = ${latestJapanData.Japan}`);
      }
    } else {
      console.warn(`   🇯🇵 Japan: ❌ NO DATA - This indicator may not be available for Japan`);
    }
    
    // Check which of our new countries have data
    const newCountries = ['NL', 'PT', 'BE', 'ID', 'ZA', 'PL', 'SA', 'EG'];
    const newCountriesWithData = newCountries.filter(code => countryCodesFound.has(code));
    const newCountriesWithoutData = newCountries.filter(code => !countryCodesFound.has(code));
    
    if (newCountriesWithData.length > 0) {
      console.log(`   ✅ New countries with data: ${newCountriesWithData.join(', ')}`);
    }
    if (newCountriesWithoutData.length > 0) {
      console.log(`   ❌ New countries without data: ${newCountriesWithoutData.join(', ')}`);
    }
    
    // Cache the result for 24 hours
    clientCache.set(cacheKey, result, 1000 * 60 * 60 * 24);
    
    return result;
  } catch (error: any) {
    console.error(`❌ Error fetching data for indicator ${indicator}:`, error.message || error);
    
    // Try to return cached data even if expired as fallback
    const cacheKey = CacheKeys.worldBankIndicator(indicator);
    const staleCache = clientCache.get<CountryData[]>(cacheKey);
    if (staleCache) {
      console.warn(`⚠️ Using stale cache for ${indicator} due to API error`);
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

// Helper function to merge policy rates data into World Bank interest rates
function mergePolicyRates(
  worldBankData: CountryData[],
  policyRatesData: { [country: string]: PolicyRateDataPoint[] }
): CountryData[] {
  if (Object.keys(policyRatesData).length === 0) {
    console.warn('No policy rates data to merge');
    return worldBankData;
  }

  // Create a map of existing years
  const dataMap = new Map<number, CountryData>();
  worldBankData.forEach(item => {
    dataMap.set(item.year, { ...item });
  });

  let totalAdded = 0;
  let totalUpdated = 0;
  
  // Merge policy rates for each country
  Object.entries(policyRatesData).forEach(([country, data]) => {
    if (data.length === 0) return;
    
    let addedCount = 0;
    let updatedCount = 0;
    
    data.forEach(({ year, value }) => {
      if (dataMap.has(year)) {
        const existing = dataMap.get(year)!;
        // Prefer policy rates over World Bank data (more current)
        // Only skip if policy rate value already exists
        if (existing[country] === undefined || existing[country] === null || year >= 2020) {
          existing[country] = value;
          updatedCount++;
        }
      } else {
        const newEntry: CountryData = { year };
        newEntry[country] = value;
        dataMap.set(year, newEntry);
        addedCount++;
      }
    });
    
    if (addedCount > 0 || updatedCount > 0) {
      console.log(`🏦 Policy rates for ${country}: Added ${addedCount}, updated ${updatedCount} years`);
      totalAdded += addedCount;
      totalUpdated += updatedCount;
    }
  });

  console.log(`🏦 Total policy rates merge: Added ${totalAdded} new years, updated ${totalUpdated} existing years`);
  
  return Array.from(dataMap.values()).sort((a, b) => a.year - b.year);
}

// Helper function to merge OECD/IMF data into World Bank data
function mergeAlternativeSource(
  worldBankData: CountryData[],
  alternativeData: { [country: string]: (OECDDataPoint | IMFDataPoint)[] },
  sourceName: string
): CountryData[] {
  if (Object.keys(alternativeData).length === 0) {
    console.warn(`No ${sourceName} data to merge`);
    return worldBankData;
  }

  // Create a map of existing years
  const dataMap = new Map<number, CountryData>();
  worldBankData.forEach(item => {
    dataMap.set(item.year, { ...item });
  });

  let totalAdded = 0;
  let totalUpdated = 0;
  
  // Merge alternative source data for each country
  Object.entries(alternativeData).forEach(([country, data]) => {
    if (data.length === 0) return;
    
    let addedCount = 0;
    let updatedCount = 0;
    
    data.forEach(({ year, value }) => {
      if (dataMap.has(year)) {
        const existing = dataMap.get(year)!;
        // Fill gaps or update with more recent data
        if (existing[country] === undefined || existing[country] === null) {
          existing[country] = value;
          updatedCount++;
        }
      } else {
        const newEntry: CountryData = { year };
        newEntry[country] = value;
        dataMap.set(year, newEntry);
        addedCount++;
      }
    });
    
    if (addedCount > 0 || updatedCount > 0) {
      console.log(`${sourceName === 'OECD' ? '🏛️' : '🌍'} ${sourceName} for ${country}: Added ${addedCount}, updated ${updatedCount} years`);
      totalAdded += addedCount;
      totalUpdated += updatedCount;
    }
  });

  console.log(`${sourceName === 'OECD' ? '🏛️' : '🌍'} Total ${sourceName} merge: Added ${totalAdded} new years, updated ${totalUpdated} existing years`);
  
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
  gdpPerCapitaPPP: CountryData[];
  currentAccount: CountryData[];
  grossCapitalFormation: CountryData[];
  reservesMonthsImports: CountryData[];
  exchangeRate: CountryData[];
  povertyRate: CountryData[];
  tertiaryEnrollment: CountryData[];
  taxRevenue: CountryData[];
  domesticCredit: CountryData[];
  exports: CountryData[];
  imports: CountryData[];
  lifeExpectancy: CountryData[];
  urbanPopulation: CountryData[];
  hightechExports: CountryData[];
  co2Emissions: CountryData[];
  netMigration: CountryData[];
  laborForceParticipation: CountryData[];
  budgetBalance: CountryData[];
  healthcareExpenditure: CountryData[];
  educationExpenditure: CountryData[];
  internetUsers: CountryData[];
  youthUnemployment: CountryData[];
  manufacturingValueAdded: CountryData[];
  householdConsumption: CountryData[];
  renewableEnergy: CountryData[];
  femaleLaborForce: CountryData[];
  militaryExpenditure: CountryData[];
  marketCapitalization: CountryData[];
  scientificPublications: CountryData[];
  ictExports: CountryData[];
  mobileSubscriptions: CountryData[];
  patentApplications: CountryData[];
  socialSpending: CountryData[];
  publicDebtService: CountryData[];
  servicesValueAdded: CountryData[];
  agriculturalValueAdded: CountryData[];
  tradeOpenness: CountryData[];
  tariffRate: CountryData[];
  tourismReceipts: CountryData[];
  privateInvestment: CountryData[];
  newBusinessDensity: CountryData[];
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
      fetchIndicatorData(INDICATORS.ENERGY_CONSUMPTION, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.GDP_PER_CAPITA_PPP, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.CURRENT_ACCOUNT, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.GROSS_CAPITAL_FORMATION, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.RESERVES_MONTHS_IMPORTS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.EXCHANGE_RATE, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.POVERTY_RATE, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.TERTIARY_ENROLLMENT, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.TAX_REVENUE, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.DOMESTIC_CREDIT, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.EXPORTS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.IMPORTS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.LIFE_EXPECTANCY, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.URBAN_POPULATION, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.HIGHTECH_EXPORTS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.CO2_EMISSIONS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.NET_MIGRATION, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.LABOR_FORCE_PARTICIPATION, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.BUDGET_BALANCE, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.HEALTHCARE_EXPENDITURE, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.EDUCATION_EXPENDITURE, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.INTERNET_USERS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.YOUTH_UNEMPLOYMENT, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.MANUFACTURING_VALUE_ADDED, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.HOUSEHOLD_CONSUMPTION, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.RENEWABLE_ENERGY, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.FEMALE_LABOR_FORCE, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.MILITARY_EXPENDITURE, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.MARKET_CAPITALIZATION, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.SCIENTIFIC_PUBLICATIONS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.ICT_EXPORTS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.MOBILE_SUBSCRIPTIONS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.PATENT_APPLICATIONS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.SOCIAL_SPENDING, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.PUBLIC_DEBT_SERVICE, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.SERVICES_VALUE_ADDED, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.AGRICULTURAL_VALUE_ADDED, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.TRADE_OPENNESS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.TARIFF_RATE, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.TOURISM_RECEIPTS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.PRIVATE_INVESTMENT, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.NEW_BUSINESS_DENSITY, COUNTRY_CODES, !forceRefresh)
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
      energyConsumptionResult,
      gdpPerCapitaPPPResult,
      currentAccountResult,
      grossCapitalFormationResult,
      reservesMonthsImportsResult,
      exchangeRateResult,
      povertyRateResult,
      tertiaryEnrollmentResult,
      taxRevenueResult,
      domesticCreditResult,
      exportsResult,
      importsResult,
      lifeExpectancyResult,
      urbanPopulationResult,
      hightechExportsResult,
      co2EmissionsResult,
      netMigrationResult,
      laborForceParticipationResult,
      budgetBalanceResult,
      healthcareExpenditureResult,
      educationExpenditureResult,
      internetUsersResult,
      youthUnemploymentResult,
      manufacturingValueAddedResult,
      householdConsumptionResult,
      renewableEnergyResult,
      femaleLaborForceResult,
      militaryExpenditureResult,
      marketCapitalizationResult,
      scientificPublicationsResult,
      ictExportsResult,
      mobileSubscriptionsResult,
      patentApplicationsResult,
      socialSpendingResult,
      publicDebtServiceResult,
      servicesValueAddedResult,
      agriculturalValueAddedResult,
      tradeOpennessResult,
      tariffRateResult,
      tourismReceiptsResult,
      privateInvestmentResult,
      newBusinessDensityResult
    ] = results;

    // Log any failures
    const indicatorNames = [
      'Interest Rates', 'Employment', 'Unemployment', 'Government Debt', 
      'Inflation', 'GDP Growth', 'CPI', 'Population Growth', 'FDI', 
      'Trade Balance', 'Government Spending', 'Labor Productivity', 
      'Gini Coefficient', 'R&D Spending', 'Energy Consumption',
      'GDP per Capita (PPP)', 'Current Account', 'Gross Capital Formation',
      'Reserves (Months of Imports)', 'Exchange Rate', 'Poverty Rate',
      'Tertiary Enrollment', 'Tax Revenue', 'Domestic Credit',
      'Exports', 'Imports', 'Life Expectancy', 'Urban Population',
      'High-tech Exports', 'CO2 Emissions', 'Net Migration',
      'Labor Force Participation', 'Budget Balance', 'Healthcare Expenditure',
      'Education Expenditure', 'Internet Users', 'Youth Unemployment',
      'Manufacturing Value Added', 'Household Consumption', 'Renewable Energy',
      'Female Labor Force Participation', 'Military Expenditure', 'Market Capitalization',
      'Scientific Publications', 'ICT Exports', 'Mobile Subscriptions',
      'Patent Applications', 'Social Spending', 'Public Debt Service',
      'Services Value Added', 'Agricultural Value Added', 'Trade Openness',
      'Tariff Rate', 'Tourism Receipts', 'Private Investment', 'New Business Density'
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
    
    // Fetch policy rates from multiple sources for comprehensive coverage
    // Priority: BIS > OECD > FRED > IMF
    
    // 1. BIS - Bank for International Settlements (best coverage for policy rates)
    console.log('🏦 ========================================');
    console.log('🏦 BIS: Fetching Central Bank Policy Rates...');
    console.log('🏦 ========================================');
    let bisPolicyRates: { [country: string]: BISDataPoint[] } = {};
    try {
      bisPolicyRates = await fetchBISPolicyRates();
      console.log('🏦 BIS policy rates fetch complete.');
    } catch (error: any) {
      console.warn('⚠️ BIS fetch failed (non-critical):', error.message);
      console.log('ℹ️ Continuing without BIS data...');
    }
    
    // 2. OECD - Organisation for Economic Co-operation and Development
    console.log('🏛️ ========================================');
    console.log('🏛️ OECD: Fetching Policy Rates...');
    console.log('🏛️ ========================================');
    let oecdPolicyRates: { [country: string]: OECDDataPoint[] } = {};
    try {
      oecdPolicyRates = await fetchOECDPolicyRates();
      console.log('🏛️ OECD policy rates fetch complete.');
    } catch (error: any) {
      console.warn('⚠️ OECD policy rates fetch failed (non-critical):', error.message);
      console.log('ℹ️ Continuing without OECD policy rates...');
    }
    
    // 3. FRED - Federal Reserve Economic Data (international OECD data via FRED)
    console.log('🏦 ========================================');
    console.log('🏦 FRED: Fetching Central Bank Policy Rates...');
    console.log('🏦 ========================================');
    const policyRatesData = await fetchAllPolicyRates();
    console.log('🏦 FRED policy rates fetch complete. Processing merge...');
    
    // Fetch OECD government debt data for Japan and others
    console.log('🏛️ ========================================');
    console.log('🏛️ OECD: Fetching Government Debt...');
    console.log('🏛️ ========================================');
    let oecdJapanDebt: OECDDataPoint[] = [];
    try {
      oecdJapanDebt = await fetchJapanGovernmentDebtOECD();
      console.log('🏛️ OECD government debt fetch complete.');
    } catch (error: any) {
      console.warn('⚠️ OECD government debt fetch failed (non-critical):', error.message);
      console.log('ℹ️ Continuing without OECD government debt...');
    }
    
    // Fetch IMF data for broader coverage
    console.log('🌍 ========================================');
    console.log('🌍 Fetching IMF Data (Government Debt, Interest Rates)...');
    console.log('🌍 ========================================');
    let imfGovDebt: { [country: string]: IMFDataPoint[] } = {};
    let imfJapanDebt: IMFDataPoint[] = [];
    let imfInterestRates: { [country: string]: IMFDataPoint[] } = {};
    
    try {
      [imfGovDebt, imfJapanDebt, imfInterestRates] = await Promise.all([
        fetchIMFGovernmentDebt().catch(err => {
          console.warn('⚠️ IMF Government Debt failed:', err.message);
          return {};
        }),
        fetchJapanGovernmentDebtIMF().catch(err => {
          console.warn('⚠️ IMF Japan Debt failed:', err.message);
          return [];
        }),
        fetchIMFInterestRates().catch(err => {
          console.warn('⚠️ IMF Interest Rates failed:', err.message);
          return {};
        })
      ]);
      console.log('🌍 IMF fetch complete.');
    } catch (error: any) {
      console.warn('⚠️ IMF fetch failed (non-critical):', error.message);
      console.log('ℹ️ Continuing without IMF data...');
    }
    
// Merge FRED data with World Bank data for comprehensive USA coverage
console.log('📊 Starting data merge for USA...');
console.log('📊 FRED Interest Rates data points:', usaData.interestRates.length);
console.log('📊 World Bank Interest Rates data points:', interestRatesResult.status === 'fulfilled' ? interestRatesResult.value.length : 0);

// Multi-source fallback for interest rates with priority order:
// World Bank → FRED(USA) → BIS → OECD → FRED Policy Rates → IMF
console.log('🔄 Merging interest rates from multiple sources...');
let interestRatesWithFRED = mergeUSADataFromFRED(
  interestRatesResult.status === 'fulfilled' ? interestRatesResult.value : [],
  usaData.interestRates
);
console.log('✅ FRED USA data merged');

// Priority 1: BIS policy rates (most authoritative for central bank rates)
let interestRatesWithBIS = Object.keys(bisPolicyRates).length > 0
  ? mergeAlternativeSource(interestRatesWithFRED, bisPolicyRates, 'BIS')
  : interestRatesWithFRED;
console.log(`✅ BIS data merged (${Object.keys(bisPolicyRates).length} countries)`);

// Priority 2: OECD policy rates (high quality for developed economies)
let interestRatesWithOECD = Object.keys(oecdPolicyRates).length > 0
  ? mergeAlternativeSource(interestRatesWithBIS, oecdPolicyRates, 'OECD')
  : interestRatesWithBIS;
console.log(`✅ OECD data merged (${Object.keys(oecdPolicyRates).length} countries)`);

// Priority 3: FRED policy rates (OECD data via FRED)
let interestRatesWithPolicy = mergePolicyRates(interestRatesWithOECD, policyRatesData);
console.log('✅ FRED policy rates merged');

// Priority 4: IMF interest rates (fills remaining gaps)
const interestRatesComplete = Object.keys(imfInterestRates).length > 0
  ? mergeAlternativeSource(interestRatesWithPolicy, imfInterestRates, 'IMF')
  : interestRatesWithPolicy;
console.log('✅ IMF data merged');
console.log('🎉 Interest rates merging complete!');

const completeData = {
  interestRates: interestRatesComplete,
      employmentRates: mergeUSADataFromFRED(
        employmentRatesResult.status === 'fulfilled' ? employmentRatesResult.value : [],
        usaData.employmentRates
      ),
      unemploymentRates: mergeUSADataFromFRED(
        unemploymentRatesResult.status === 'fulfilled' ? unemploymentRatesResult.value : [],
        usaData.unemploymentRates
      ),
      governmentDebt: (() => {
        // Multi-source fallback for government debt: World Bank → USA(FRED) → OECD(Japan) → IMF(All)
        let govDebt = mergeUSADataFromFRED(
          governmentDebtResult.status === 'fulfilled' ? governmentDebtResult.value : [],
          usaData.governmentDebt
        );
        
        // Add Japan data from OECD if available
        if (oecdJapanDebt.length > 0) {
          govDebt = mergeAlternativeSource(govDebt, { Japan: oecdJapanDebt }, 'OECD');
        }
        
        // Fill remaining gaps with IMF data
        if (Object.keys(imfGovDebt).length > 0) {
          govDebt = mergeAlternativeSource(govDebt, imfGovDebt, 'IMF');
        }
        
        // Add IMF Japan data as additional fallback
        if (imfJapanDebt.length > 0 && oecdJapanDebt.length === 0) {
          govDebt = mergeAlternativeSource(govDebt, { Japan: imfJapanDebt }, 'IMF');
        }
        
        return govDebt;
      })(),
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
      ),
      gdpPerCapitaPPP: mergeUSADataFromFRED(
        gdpPerCapitaPPPResult.status === 'fulfilled' ? gdpPerCapitaPPPResult.value : [],
        usaData.gdpPerCapitaPPP
      ),
      currentAccount: mergeUSADataFromFRED(
        currentAccountResult.status === 'fulfilled' ? currentAccountResult.value : [],
        usaData.currentAccount
      ),
      grossCapitalFormation: mergeUSADataFromFRED(
        grossCapitalFormationResult.status === 'fulfilled' ? grossCapitalFormationResult.value : [],
        usaData.grossCapitalFormation
      ),
      reservesMonthsImports: mergeUSADataFromFRED(
        reservesMonthsImportsResult.status === 'fulfilled' ? reservesMonthsImportsResult.value : [],
        usaData.reservesMonthsImports
      ),
      exchangeRate: mergeUSADataFromFRED(
        exchangeRateResult.status === 'fulfilled' ? exchangeRateResult.value : [],
        usaData.exchangeRate
      ),
      povertyRate: povertyRateResult.status === 'fulfilled' ? povertyRateResult.value : [],
      tertiaryEnrollment: mergeUSADataFromFRED(
        tertiaryEnrollmentResult.status === 'fulfilled' ? tertiaryEnrollmentResult.value : [],
        usaData.tertiaryEnrollment
      ),
      taxRevenue: mergeUSADataFromFRED(
        taxRevenueResult.status === 'fulfilled' ? taxRevenueResult.value : [],
        usaData.taxRevenue
      ),
      domesticCredit: mergeUSADataFromFRED(
        domesticCreditResult.status === 'fulfilled' ? domesticCreditResult.value : [],
        usaData.domesticCredit
      ),
      exports: mergeUSADataFromFRED(
        exportsResult.status === 'fulfilled' ? exportsResult.value : [],
        usaData.exports
      ),
      imports: mergeUSADataFromFRED(
        importsResult.status === 'fulfilled' ? importsResult.value : [],
        usaData.imports
      ),
      lifeExpectancy: lifeExpectancyResult.status === 'fulfilled' ? lifeExpectancyResult.value : [],
      urbanPopulation: urbanPopulationResult.status === 'fulfilled' ? urbanPopulationResult.value : [],
      hightechExports: mergeUSADataFromFRED(
        hightechExportsResult.status === 'fulfilled' ? hightechExportsResult.value : [],
        usaData.hightechExports
      ),
      co2Emissions: mergeUSADataFromFRED(
        co2EmissionsResult.status === 'fulfilled' ? co2EmissionsResult.value : [],
        usaData.co2Emissions
      ),
      netMigration: netMigrationResult.status === 'fulfilled' ? netMigrationResult.value : [],
      laborForceParticipation: mergeUSADataFromFRED(
        laborForceParticipationResult.status === 'fulfilled' ? laborForceParticipationResult.value : [],
        usaData.laborForceParticipation
      ),
      budgetBalance: mergeUSADataFromFRED(
        budgetBalanceResult.status === 'fulfilled' ? budgetBalanceResult.value : [],
        usaData.budgetBalance
      ),
      healthcareExpenditure: mergeUSADataFromFRED(
        healthcareExpenditureResult.status === 'fulfilled' ? healthcareExpenditureResult.value : [],
        usaData.healthcareExpenditure
      ),
      educationExpenditure: mergeUSADataFromFRED(
        educationExpenditureResult.status === 'fulfilled' ? educationExpenditureResult.value : [],
        usaData.educationExpenditure
      ),
      internetUsers: internetUsersResult.status === 'fulfilled' ? internetUsersResult.value : [],
      youthUnemployment: mergeUSADataFromFRED(
        youthUnemploymentResult.status === 'fulfilled' ? youthUnemploymentResult.value : [],
        usaData.youthUnemployment
      ),
      manufacturingValueAdded: mergeUSADataFromFRED(
        manufacturingValueAddedResult.status === 'fulfilled' ? manufacturingValueAddedResult.value : [],
        usaData.manufacturingValueAdded
      ),
      householdConsumption: mergeUSADataFromFRED(
        householdConsumptionResult.status === 'fulfilled' ? householdConsumptionResult.value : [],
        usaData.householdConsumption
      ),
      renewableEnergy: renewableEnergyResult.status === 'fulfilled' ? renewableEnergyResult.value : [],
      femaleLaborForce: mergeUSADataFromFRED(
        femaleLaborForceResult.status === 'fulfilled' ? femaleLaborForceResult.value : [],
        usaData.femaleLaborForce
      ),
      militaryExpenditure: mergeUSADataFromFRED(
        militaryExpenditureResult.status === 'fulfilled' ? militaryExpenditureResult.value : [],
        usaData.militaryExpenditure
      ),
      marketCapitalization: mergeUSADataFromFRED(
        marketCapitalizationResult.status === 'fulfilled' ? marketCapitalizationResult.value : [],
        usaData.marketCapitalization
      ),
      scientificPublications: scientificPublicationsResult.status === 'fulfilled' ? scientificPublicationsResult.value : [],
      ictExports: ictExportsResult.status === 'fulfilled' ? ictExportsResult.value : [],
      mobileSubscriptions: mobileSubscriptionsResult.status === 'fulfilled' ? mobileSubscriptionsResult.value : [],
      patentApplications: patentApplicationsResult.status === 'fulfilled' ? patentApplicationsResult.value : [],
      socialSpending: socialSpendingResult.status === 'fulfilled' ? socialSpendingResult.value : [],
      publicDebtService: mergeUSADataFromFRED(
        publicDebtServiceResult.status === 'fulfilled' ? publicDebtServiceResult.value : [],
        usaData.publicDebtService
      ),
      servicesValueAdded: mergeUSADataFromFRED(
        servicesValueAddedResult.status === 'fulfilled' ? servicesValueAddedResult.value : [],
        usaData.servicesValueAdded
      ),
      agriculturalValueAdded: mergeUSADataFromFRED(
        agriculturalValueAddedResult.status === 'fulfilled' ? agriculturalValueAddedResult.value : [],
        usaData.agriculturalValueAdded
      ),
      tradeOpenness: tradeOpennessResult.status === 'fulfilled' ? tradeOpennessResult.value : [],
      tariffRate: tariffRateResult.status === 'fulfilled' ? tariffRateResult.value : [],
      tourismReceipts: tourismReceiptsResult.status === 'fulfilled' ? tourismReceiptsResult.value : [],
      privateInvestment: mergeUSADataFromFRED(
        privateInvestmentResult.status === 'fulfilled' ? privateInvestmentResult.value : [],
        usaData.privateInvestment
      ),
      newBusinessDensity: newBusinessDensityResult.status === 'fulfilled' ? newBusinessDensityResult.value : []
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
  clearBISCache();
  clearPolicyRatesCache();
  clearOECDCache();
  clearIMFCache();
  // Reset cache version after clearing
  clientCache.set(CacheKeys.cacheVersion(), CURRENT_CACHE_VERSION);
  console.log('Cleared all cached economic data (World Bank + FRED + BIS + OECD + Policy Rates + IMF)');
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

// Debug function to test API connectivity for specific countries
export async function testCountryDataAvailability(countryCodes: string[] = ['NL', 'PT', 'BE', 'ID', 'ZA', 'PL', 'SA', 'EG']): Promise<void> {
  console.log('🧪 ========================================');
  console.log('🧪 Testing data availability for new countries...');
  console.log('🧪 Testing countries:', countryCodes.join(', '));
  console.log('🧪 ========================================');
  
  const testIndicator = INDICATORS.GDP_GROWTH; // Use GDP growth as test indicator
  const countryString = countryCodes.join(';');
  const url = `${WORLD_BANK_BASE_URL}/${countryString}/indicator/${testIndicator}?format=json&per_page=100&date=2020:2024`;
  
  console.log('🧪 Test URL:', url);
  
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data[1];
    
    if (data && Array.isArray(data)) {
      console.log(`🧪 ✅ Received ${data.length} data points`);
      
      const foundCountries = new Set<string>();
      data.forEach((item: any) => {
        if (item.value !== null && item.country?.id) {
          foundCountries.add(item.country.id);
        }
      });
      
      console.log('🧪 ✅ Countries with data:', Array.from(foundCountries).sort().join(', '));
      
      const missingCountries = countryCodes.filter(code => !foundCountries.has(code));
      if (missingCountries.length > 0) {
        console.warn('🧪 ❌ Countries without data:', missingCountries.join(', '));
      }
      
      // Sample data for one country
      const sampleCountry = data.find((item: any) => countryCodes.includes(item.country?.id));
      if (sampleCountry) {
        console.log('🧪 Sample data point:', {
          country: sampleCountry.country.value,
          code: sampleCountry.country.id,
          year: sampleCountry.date,
          value: sampleCountry.value
        });
      }
      
      console.log('🧪 ========================================');
      console.log('🧪 Test Complete!');
      console.log('🧪 ========================================');
    } else {
      console.warn('🧪 ❌ No data returned from API');
    }
  } catch (error: any) {
    console.error('🧪 ❌ Test failed:', error.message);
    console.error('🧪 Full error:', error);
  }
}

// Diagnostic function to check data availability across all indicators
export async function checkDataAvailability(): Promise<void> {
  console.log('🔍 ========================================');
  console.log('🔍 DIAGNOSTIC: Checking Data Availability');
  console.log('🔍 ========================================');
  
  const indicatorsToCheck = [
    { name: 'Interest Rates', code: INDICATORS.INTEREST_RATE },
    { name: 'GDP Growth', code: INDICATORS.GDP_GROWTH },
    { name: 'Inflation', code: INDICATORS.INFLATION_RATE },
    { name: 'Unemployment', code: INDICATORS.UNEMPLOYMENT_RATE },
    { name: 'Government Debt', code: INDICATORS.GOVERNMENT_DEBT },
    { name: 'CPI', code: INDICATORS.CPI },
    { name: 'GDP per Capita (PPP)', code: INDICATORS.GDP_PER_CAPITA_PPP },
    { name: 'Life Expectancy', code: INDICATORS.LIFE_EXPECTANCY },
    { name: 'CO2 Emissions', code: INDICATORS.CO2_EMISSIONS },
    { name: 'Internet Users', code: INDICATORS.INTERNET_USERS }
  ];
  
  const sampleCountries = ['US', 'GB', 'CN', 'NL', 'EG']; // Sample of old and new countries
  
  for (const indicator of indicatorsToCheck) {
    try {
      const countryString = sampleCountries.join(';');
      const url = `${WORLD_BANK_BASE_URL}/${countryString}/indicator/${indicator.code}?format=json&per_page=500&date=2020:2024`;
      
      const response = await axios.get(url, { timeout: 10000 });
      const data = response.data[1];
      
      if (data && Array.isArray(data)) {
        // Find latest year with data
        const years = new Set<number>();
        const countriesWithData = new Set<string>();
        
        data.forEach((item: any) => {
          if (item.value !== null && item.date && item.country?.id) {
            years.add(parseInt(item.date));
            countriesWithData.add(item.country.id);
          }
        });
        
        const latestYear = Math.max(...Array.from(years));
        const has2024 = years.has(2024);
        const has2023 = years.has(2023);
        
        console.log(`📊 ${indicator.name}:`);
        console.log(`   Latest year: ${latestYear}`);
        console.log(`   Has 2024 data: ${has2024 ? '✅' : '❌'}`);
        console.log(`   Has 2023 data: ${has2023 ? '✅' : '❌'}`);
        console.log(`   Countries with data: ${Array.from(countriesWithData).join(', ')}`);
      } else {
        console.warn(`⚠️ ${indicator.name}: No data returned`);
      }
    } catch (error: any) {
      console.error(`❌ ${indicator.name}: Error -`, error.message);
    }
  }
  
  console.log('🔍 ========================================');
  console.log('🔍 Diagnostic Complete!');
  console.log('🔍 ========================================');
}

// Diagnostic function to test Japan data specifically
export async function testJapanData(): Promise<void> {
  console.log('🇯🇵 ========================================');
  console.log('🇯🇵 Testing Data Availability for Japan (JP)');
  console.log('🇯🇵 ========================================');
  
  const japanTests = [
    { name: 'GDP Growth', code: INDICATORS.GDP_GROWTH },
    { name: 'Interest Rates (World Bank)', code: INDICATORS.INTEREST_RATE },
    { name: 'Inflation', code: INDICATORS.INFLATION_RATE },
    { name: 'Unemployment', code: INDICATORS.UNEMPLOYMENT_RATE },
    { name: 'CPI', code: INDICATORS.CPI },
    { name: 'Government Debt', code: INDICATORS.GOVERNMENT_DEBT },
    { name: 'Population Growth', code: INDICATORS.POPULATION_GROWTH }
  ];
  
  for (const test of japanTests) {
    try {
      const url = `${WORLD_BANK_BASE_URL}/JP/indicator/${test.code}?format=json&per_page=500&date=1960:2024`;
      console.log(`\n📊 Testing: ${test.name}`);
      console.log(`   URL: ${url}`);
      
      const response = await axios.get(url, { timeout: 10000 });
      const data = response.data[1];
      
      if (data && Array.isArray(data)) {
        const validData = data.filter((item: any) => item.value !== null);
        const years = validData.map((item: any) => parseInt(item.date));
        const latestYear = Math.max(...years);
        const earliestYear = Math.min(...years);
        
        console.log(`   ✅ ${test.name}:`);
        console.log(`      - Total data points: ${validData.length}`);
        console.log(`      - Date range: ${earliestYear} - ${latestYear}`);
        console.log(`      - Latest value: ${validData[validData.length - 1]?.value}`);
        console.log(`      - Sample (2020): ${validData.find((d: any) => d.date === '2020')?.value || 'N/A'}`);
      } else {
        console.warn(`   ❌ ${test.name}: No data returned from World Bank API`);
      }
    } catch (error: any) {
      console.error(`   ❌ ${test.name}: Error -`, error.message);
    }
  }
  
  console.log('\n🇯🇵 ========================================');
  console.log('🇯🇵 Testing Policy Rates (FRED) for Japan...');
  console.log('🇯🇵 ========================================');
  
  // Test policy rates from FRED
  try {
    const policyRates = await fetchAllPolicyRates();
    if (policyRates.Japan && policyRates.Japan.length > 0) {
      const japanPolicyData = policyRates.Japan;
      const latestYear = japanPolicyData[japanPolicyData.length - 1];
      console.log(`\n✅ Japan Policy Rates (FRED):`);
      console.log(`   - Total data points: ${japanPolicyData.length}`);
      console.log(`   - Latest year: ${latestYear.year}`);
      console.log(`   - Latest value: ${latestYear.value}%`);
      console.log(`   - This should supplement World Bank data after 2017!`);
    } else {
      console.warn(`\n❌ No policy rate data found for Japan from FRED`);
    }
  } catch (error: any) {
    console.error(`\n❌ Error fetching policy rates:`, error.message);
  }
  
  console.log('\n🇯🇵 ========================================');
  console.log('🇯🇵 Japan Data Test Complete!');
  console.log('🇯🇵 ========================================');
}

// Make test functions available globally for easy debugging in console
if (typeof window !== 'undefined') {
  (window as any).testCountryData = testCountryDataAvailability;
  (window as any).checkDataAvailability = checkDataAvailability;
  (window as any).testJapanData = testJapanData;
  (window as any).clearAppCache = () => {
    clearDataCache();
    console.log('✅ Cache cleared! Reloading page...');
    window.location.reload();
  };
}

// Helper function to merge USA R&D spending data from FRED
// FRED R&D data is in billions of dollars, we need to convert to % of GDP
// US GDP is approximately $25-27 trillion, so we estimate the percentage
function mergeUSARDSpendingData(
  worldBankData: CountryData[],
  fredData: USADataPoint[]
): CountryData[] {
  if (fredData.length === 0) {
    return worldBankData;
  }

  // US GDP by year (approximate, in billions) for conversion
  const usGDPByYear: { [year: number]: number } = {
    2000: 10250, 2001: 10582, 2002: 10936, 2003: 11458, 2004: 12214,
    2005: 13037, 2006: 13815, 2007: 14452, 2008: 14713, 2009: 14449,
    2010: 14992, 2011: 15543, 2012: 16197, 2013: 16785, 2014: 17522,
    2015: 18219, 2016: 18707, 2017: 19485, 2018: 20494, 2019: 21381,
    2020: 20894, 2021: 22996, 2022: 25463, 2023: 27361, 2024: 28500
  };

  const dataMap = new Map<number, CountryData>();
  worldBankData.forEach(item => {
    dataMap.set(item.year, { ...item });
  });

  let addedCount = 0;
  let updatedCount = 0;

  fredData.forEach(({ year, value }) => {
    // Convert FRED R&D (in billions) to % of GDP
    const gdp = usGDPByYear[year];
    if (!gdp) return;
    
    // FRED R&D value is already in billions, calculate percentage
    const rdPercentGDP = (value / gdp) * 100;
    
    if (dataMap.has(year)) {
      const existing = dataMap.get(year)!;
      if (existing.USA === undefined || existing.USA === null) {
        existing.USA = rdPercentGDP;
        updatedCount++;
      }
    } else {
      dataMap.set(year, { year, USA: rdPercentGDP });
      addedCount++;
    }
  });

  if (addedCount > 0 || updatedCount > 0) {
    console.log(`🔬🇺🇸 Merged USA R&D spending: ${addedCount} new years, ${updatedCount} updated`);
  }

  return Array.from(dataMap.values()).sort((a, b) => a.year - b.year);
}

// Technology & Innovation Data Fetching
export interface TechnologyData {
  patentApplicationsResident: CountryData[];
  patentApplicationsNonResident: CountryData[];
  trademarkApplications: CountryData[];
  rdSpending: CountryData[];
  researchersRD: CountryData[];
  techniciansRD: CountryData[];
  hightechExports: CountryData[];
  ictExports: CountryData[];
  scientificPublications: CountryData[];
  ipReceipts: CountryData[];
  ipPayments: CountryData[];
  internetUsers: CountryData[];
  mobileSubscriptions: CountryData[];
  
  // Digital Infrastructure
  broadbandSubscriptions: CountryData[];
  secureServers: CountryData[];
  ictGoodsImports: CountryData[];
  
  // Startup & VC (from static data)
  vcFunding: CountryData[];
  unicornCount: CountryData[];
  startupDensity: CountryData[];
  
  // AI & Emerging Tech
  aiPatents: CountryData[];
  
  // Digital Economy
  ecommerceAdoption: CountryData[];
  digitalPayments: CountryData[];
  ictServiceExports: CountryData[];
  
  // Tech Workforce
  stemGraduates: CountryData[];
  techEmployment: CountryData[];
}

// Fetch technology and innovation data for the Technology page
export async function fetchTechnologyData(forceRefresh: boolean = false): Promise<TechnologyData> {
  try {
    const cacheKey = `technology_data_all_v${CURRENT_CACHE_VERSION}`;
    
    if (!forceRefresh) {
      const cached = clientCache.get<TechnologyData>(cacheKey);
      if (cached) {
        console.log('✅ Using cached technology data');
        return cached;
      }
    }

    console.log('🔬 ========================================');
    console.log('🔬 Fetching Technology & Innovation Data...');
    console.log('🔬 ========================================');
    const startTime = Date.now();

    const results = await Promise.allSettled([
      fetchIndicatorData(INDICATORS.PATENT_APPLICATIONS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.PATENT_APPLICATIONS_NONRES, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.TRADEMARK_APPLICATIONS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.RD_SPENDING, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.RESEARCHERS_RD, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.TECHNICIANS_RD, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.HIGHTECH_EXPORTS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.ICT_EXPORTS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.SCIENTIFIC_PUBLICATIONS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.IP_RECEIPTS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.IP_PAYMENTS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.INTERNET_USERS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.MOBILE_SUBSCRIPTIONS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.BROADBAND_SUBSCRIPTIONS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.SECURE_SERVERS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.ICT_GOODS_IMPORTS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.ICT_SERVICE_EXPORTS, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.NEW_BUSINESS_DENSITY, COUNTRY_CODES, !forceRefresh),
      fetchIndicatorData(INDICATORS.STEM_GRADUATES, COUNTRY_CODES, !forceRefresh),
    ]);

    const [
      patentResidentResult,
      patentNonResidentResult,
      trademarkResult,
      rdSpendingResult,
      researchersResult,
      techniciansResult,
      hightechExportsResult,
      ictExportsResult,
      scientificPubsResult,
      ipReceiptsResult,
      ipPaymentsResult,
      internetUsersResult,
      mobileSubsResult,
      broadbandResult,
      secureServersResult,
      ictImportsResult,
      ictServiceExportsResult,
      newBusinessDensityResult,
      stemGraduatesResult,
    ] = results;

    const indicatorNames = [
      'Patent Applications (Resident)', 'Patent Applications (Non-Resident)', 
      'Trademark Applications', 'R&D Spending', 'Researchers in R&D',
      'Technicians in R&D', 'High-tech Exports', 'ICT Exports',
      'Scientific Publications', 'IP Receipts', 'IP Payments',
      'Internet Users', 'Mobile Subscriptions',
      'Broadband Subscriptions', 'Secure Servers', 'ICT Goods Imports',
      'ICT Service Exports', 'New Business Density', 'STEM Graduates'
    ];

    let failedCount = 0;
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to fetch ${indicatorNames[index]}:`, result.reason);
        failedCount++;
      }
    });

    const elapsedTime = Date.now() - startTime;
    console.log(`🔬 Technology data fetched in ${elapsedTime}ms (${failedCount} failures)`);

    // Fetch US Technology data from FRED to supplement World Bank data
    console.log('🔬🇺🇸 ========================================');
    console.log('🔬🇺🇸 Fetching US Technology data from FRED...');
    console.log('🔬🇺🇸 ========================================');
    
    let usaTechData: USATechData = {
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
    
    try {
      usaTechData = await fetchUSATechDataFromFRED();
    } catch (error: any) {
      console.warn('⚠️ Failed to fetch US tech data from FRED:', error.message);
    }

    // Fetch OECD Technology data to supplement World Bank data
    console.log('🔬🏛️ ========================================');
    console.log('🔬🏛️ Fetching OECD Technology data...');
    console.log('🔬🏛️ ========================================');
    
    let oecdTechData: OECDTechData = {
      rdSpending: {},
      researchers: {},
      patents: {},
      hightechExports: {}
    };
    
    try {
      oecdTechData = await fetchOECDTechnologyData();
    } catch (error: any) {
      console.warn('⚠️ Failed to fetch OECD tech data:', error.message);
    }

    // Fetch WIPO Patent data
    console.log('🔬📜 ========================================');
    console.log('🔬📜 Fetching WIPO Patent data...');
    console.log('🔬📜 ========================================');
    
    let wipoTechData: WIPOTechData = {
      patentApplications: {},
      patentGrants: {},
      trademarkApplications: {}
    };
    
    try {
      wipoTechData = await fetchWIPOPatentData();
    } catch (error: any) {
      console.warn('⚠️ Failed to fetch WIPO patent data:', error.message);
    }

    // Fetch Eurostat Technology data (EU countries)
    console.log('🔬🇪🇺 ========================================');
    console.log('🔬🇪🇺 Fetching Eurostat Technology data...');
    console.log('🔬🇪🇺 ========================================');
    
    let eurostatTechData: EurostatTechData = {
      rdSpending: {},
      researchers: {},
      hightechExports: {},
      patents: {},
      internetUsers: {}
    };
    
    try {
      eurostatTechData = await fetchEurostatTechnologyData();
    } catch (error: any) {
      console.warn('⚠️ Failed to fetch Eurostat tech data:', error.message);
    }

    // Fetch ITU ICT data (internet users, mobile subscriptions)
    console.log('🔬📡 ========================================');
    console.log('🔬📡 Fetching ITU ICT data...');
    console.log('🔬📡 ========================================');
    
    let ituTechData: ITUTechData = {
      internetUsers: {},
      mobileSubscriptions: {},
      fixedBroadband: {},
      mobileBroadband: {}
    };
    
    try {
      ituTechData = await fetchITUTechnologyData();
    } catch (error: any) {
      console.warn('⚠️ Failed to fetch ITU ICT data:', error.message);
    }

    // Helper function to merge USA data into World Bank data
    const mergeUSATechData = (
      worldBankData: CountryData[],
      fredData: USADataPoint[]
    ): CountryData[] => {
      if (fredData.length === 0) {
        return worldBankData;
      }

      const dataMap = new Map<number, CountryData>();
      worldBankData.forEach(item => {
        dataMap.set(item.year, { ...item });
      });

      let addedCount = 0;
      let updatedCount = 0;

      fredData.forEach(({ year, value }) => {
        if (dataMap.has(year)) {
          const existing = dataMap.get(year)!;
          if (existing.USA === undefined || existing.USA === null) {
            existing.USA = value;
            updatedCount++;
          }
        } else {
          dataMap.set(year, { year, USA: value });
          addedCount++;
        }
      });

      if (addedCount > 0 || updatedCount > 0) {
        console.log(`🔬🇺🇸 Merged USA tech data: ${addedCount} new years, ${updatedCount} updated`);
      }

      return Array.from(dataMap.values()).sort((a, b) => a.year - b.year);
    };

    // Helper function to merge OECD data into existing data
    const mergeOECDTechData = (
      existingData: CountryData[],
      oecdData: { [country: string]: OECDDataPoint[] }
    ): CountryData[] => {
      if (Object.keys(oecdData).length === 0) {
        return existingData;
      }

      const dataMap = new Map<number, CountryData>();
      existingData.forEach(item => {
        dataMap.set(item.year, { ...item });
      });

      let totalAdded = 0;
      let totalUpdated = 0;

      Object.entries(oecdData).forEach(([country, dataPoints]) => {
        dataPoints.forEach(({ year, value }) => {
          if (dataMap.has(year)) {
            const existing = dataMap.get(year)!;
            if (existing[country] === undefined || existing[country] === null) {
              existing[country] = value;
              totalUpdated++;
            }
          } else {
            dataMap.set(year, { year, [country]: value });
            totalAdded++;
          }
        });
      });

      if (totalAdded > 0 || totalUpdated > 0) {
        const countries = Object.keys(oecdData).join(', ');
        console.log(`🔬🏛️ Merged OECD data for ${Object.keys(oecdData).length} countries: ${totalAdded} new, ${totalUpdated} updated`);
      }

      return Array.from(dataMap.values()).sort((a, b) => a.year - b.year);
    };

    // Helper function to merge WIPO data into existing data
    const mergeWIPOData = (
      existingData: CountryData[],
      wipoData: { [country: string]: WIPODataPoint[] }
    ): CountryData[] => {
      if (Object.keys(wipoData).length === 0) {
        return existingData;
      }

      const dataMap = new Map<number, CountryData>();
      existingData.forEach(item => {
        dataMap.set(item.year, { ...item });
      });

      let totalAdded = 0;
      let totalUpdated = 0;

      Object.entries(wipoData).forEach(([country, dataPoints]) => {
        dataPoints.forEach(({ year, value }) => {
          if (dataMap.has(year)) {
            const existing = dataMap.get(year)!;
            if (existing[country] === undefined || existing[country] === null) {
              existing[country] = value;
              totalUpdated++;
            }
          } else {
            dataMap.set(year, { year, [country]: value });
            totalAdded++;
          }
        });
      });

      if (totalAdded > 0 || totalUpdated > 0) {
        console.log(`🔬📜 Merged WIPO data for ${Object.keys(wipoData).length} countries: ${totalAdded} new, ${totalUpdated} updated`);
      }

      return Array.from(dataMap.values()).sort((a, b) => a.year - b.year);
    };

    // Helper function to merge Eurostat data into existing data
    const mergeEurostatData = (
      existingData: CountryData[],
      eurostatData: { [country: string]: EurostatDataPoint[] }
    ): CountryData[] => {
      if (Object.keys(eurostatData).length === 0) {
        return existingData;
      }

      const dataMap = new Map<number, CountryData>();
      existingData.forEach(item => {
        dataMap.set(item.year, { ...item });
      });

      let totalAdded = 0;
      let totalUpdated = 0;

      Object.entries(eurostatData).forEach(([country, dataPoints]) => {
        dataPoints.forEach(({ year, value }) => {
          if (dataMap.has(year)) {
            const existing = dataMap.get(year)!;
            if (existing[country] === undefined || existing[country] === null) {
              existing[country] = value;
              totalUpdated++;
            }
          } else {
            dataMap.set(year, { year, [country]: value });
            totalAdded++;
          }
        });
      });

      if (totalAdded > 0 || totalUpdated > 0) {
        console.log(`🔬🇪🇺 Merged Eurostat data for ${Object.keys(eurostatData).length} countries: ${totalAdded} new, ${totalUpdated} updated`);
      }

      return Array.from(dataMap.values()).sort((a, b) => a.year - b.year);
    };

    // Helper function to merge ITU data into existing data
    const mergeITUData = (
      existingData: CountryData[],
      ituData: { [country: string]: ITUDataPoint[] }
    ): CountryData[] => {
      if (Object.keys(ituData).length === 0) {
        return existingData;
      }

      const dataMap = new Map<number, CountryData>();
      existingData.forEach(item => {
        dataMap.set(item.year, { ...item });
      });

      let totalAdded = 0;
      let totalUpdated = 0;

      Object.entries(ituData).forEach(([country, dataPoints]) => {
        dataPoints.forEach(({ year, value }) => {
          if (dataMap.has(year)) {
            const existing = dataMap.get(year)!;
            if (existing[country] === undefined || existing[country] === null) {
              existing[country] = value;
              totalUpdated++;
            }
          } else {
            dataMap.set(year, { year, [country]: value });
            totalAdded++;
          }
        });
      });

      if (totalAdded > 0 || totalUpdated > 0) {
        console.log(`🔬📡 Merged ITU data for ${Object.keys(ituData).length} countries: ${totalAdded} new, ${totalUpdated} updated`);
      }

      return Array.from(dataMap.values()).sort((a, b) => a.year - b.year);
    };

    // Build technology data with data merged from all sources
    // Order: World Bank -> FRED (USA) -> OECD -> WIPO -> Eurostat -> ITU -> Fallback
    
    // Patent data: World Bank + FRED + OECD + WIPO
    let patentData = mergeUSATechData(
      patentResidentResult.status === 'fulfilled' ? patentResidentResult.value : [],
      usaTechData.patentsGranted
    );
    patentData = mergeOECDTechData(patentData, oecdTechData.patents);
    patentData = mergeWIPOData(patentData, wipoTechData.patentApplications);
    patentData = mergeEurostatData(patentData, eurostatTechData.patents);

    // R&D data: World Bank + FRED + OECD + Eurostat
    let rdData = mergeUSARDSpendingData(
      rdSpendingResult.status === 'fulfilled' ? rdSpendingResult.value : [],
      usaTechData.rdSpending
    );
    rdData = mergeOECDTechData(rdData, oecdTechData.rdSpending);
    rdData = mergeEurostatData(rdData, eurostatTechData.rdSpending);

    // Researchers data: World Bank + FRED + OECD
    let researchersData = mergeUSATechData(
      researchersResult.status === 'fulfilled' ? researchersResult.value : [],
      usaTechData.stemEmployment
    );
    researchersData = mergeOECDTechData(researchersData, oecdTechData.researchers);

    // Helper function to merge fallback data for countries with missing data
    const mergeFallbackData = (
      existingData: CountryData[],
      metric: 'rdSpending' | 'researchers' | 'patents' | 'internetUsers'
    ): CountryData[] => {
      const dataMap = new Map<number, CountryData>();
      existingData.forEach(item => {
        dataMap.set(item.year, { ...item });
      });

      let countriesFilled = 0;
      let dataPointsAdded = 0;

      // Check each country in fallback data
      Object.entries(TECHNOLOGY_FALLBACK_DATA).forEach(([country, fallbackData]) => {
        const metricData = fallbackData[metric];
        if (!metricData) return;

        let countryFilled = false;
        metricData.forEach(({ year, value }) => {
          if (dataMap.has(year)) {
            const existing = dataMap.get(year)!;
            // Only fill if country data is missing
            if (existing[country] === undefined || existing[country] === null) {
              existing[country] = value;
              dataPointsAdded++;
              countryFilled = true;
            }
          } else {
            dataMap.set(year, { year, [country]: value });
            dataPointsAdded++;
            countryFilled = true;
          }
        });
        
        if (countryFilled) countriesFilled++;
      });

      if (countriesFilled > 0) {
        console.log(`🔬📋 Merged fallback ${metric} data: ${countriesFilled} countries, ${dataPointsAdded} data points`);
      }

      return Array.from(dataMap.values()).sort((a, b) => a.year - b.year);
    };

    // Apply fallback data for countries with missing API data
    console.log('🔬📋 ========================================');
    console.log('🔬📋 Applying fallback data for missing countries...');
    console.log('🔬📋 ========================================');

    patentData = mergeFallbackData(patentData, 'patents');
    rdData = mergeFallbackData(rdData, 'rdSpending');
    researchersData = mergeFallbackData(researchersData, 'researchers');

    // Internet users: World Bank + FRED + ITU + Fallback
    let internetData = mergeUSATechData(
      internetUsersResult.status === 'fulfilled' ? internetUsersResult.value : [],
      usaTechData.internetUsers
    );
    internetData = mergeITUData(internetData, ituTechData.internetUsers);
    internetData = mergeFallbackData(internetData, 'internetUsers');

    // Mobile subscriptions: World Bank + ITU
    let mobileData = mobileSubsResult.status === 'fulfilled' ? mobileSubsResult.value : [];
    mobileData = mergeITUData(mobileData, ituTechData.mobileSubscriptions);

    // High-tech exports: World Bank + FRED + Eurostat
    let hightechData = mergeUSATechData(
      hightechExportsResult.status === 'fulfilled' ? hightechExportsResult.value : [],
      usaTechData.advancedTechExports
    );
    hightechData = mergeEurostatData(hightechData, eurostatTechData.hightechExports);

    // Broadband data: World Bank + ITU fixed broadband
    let broadbandData = broadbandResult.status === 'fulfilled' ? broadbandResult.value : [];
    broadbandData = mergeITUData(broadbandData, ituTechData.fixedBroadband);

    // Helper: merge static data into live data — live values take precedence, static fills gaps
    const mergeStaticIntoLive = (
      liveData: CountryData[],
      staticData: CountryData[]
    ): CountryData[] => {
      const dataMap = new Map<number, CountryData>();

      // Start with static data as base
      staticData.forEach(item => {
        dataMap.set(item.year, { ...item });
      });

      // Overlay live data — live values always win
      liveData.forEach(item => {
        const existing = dataMap.get(item.year) || { year: item.year };
        Object.entries(item).forEach(([key, value]) => {
          if (key !== 'year' && value !== undefined && value !== null) {
            existing[key] = value;
          }
        });
        dataMap.set(item.year, existing);
      });

      return Array.from(dataMap.values()).sort((a, b) => a.year - b.year);
    };

    // Helper: build tech employment data from researchers + technicians (per million) as proxy
    // Converts per-million-population to approximate % of workforce (dividing by ~5000 to normalize)
    const buildTechEmploymentData = (
      researchersData: CountryData[],
      techniciansData: CountryData[],
      staticFallback: CountryData[]
    ): CountryData[] => {
      const dataMap = new Map<number, CountryData>();

      // Start with static fallback
      staticFallback.forEach(item => {
        dataMap.set(item.year, { ...item });
      });

      // Merge researchers + technicians as proxy (per million -> approx % of workforce)
      const allYears = new Set<number>();
      researchersData.forEach(item => allYears.add(item.year));
      techniciansData.forEach(item => allYears.add(item.year));

      const researchersMap = new Map(researchersData.map(d => [d.year, d]));
      const techniciansMap = new Map(techniciansData.map(d => [d.year, d]));

      allYears.forEach(year => {
        const res = researchersMap.get(year);
        const tech = techniciansMap.get(year);
        const existing = dataMap.get(year) || { year };

        if (res || tech) {
          const countries = new Set<string>();
          if (res) Object.keys(res).filter(k => k !== 'year').forEach(c => countries.add(c));
          if (tech) Object.keys(tech).filter(k => k !== 'year').forEach(c => countries.add(c));

          countries.forEach(country => {
            const resVal = res ? Number(res[country]) || 0 : 0;
            const techVal = tech ? Number(tech[country]) || 0 : 0;
            const combined = resVal + techVal;
            if (combined > 0 && (existing[country] === undefined || existing[country] === null)) {
              existing[country] = parseFloat((combined / 5000 * 100).toFixed(1));
            }
          });
        }

        dataMap.set(year, existing);
      });

      return Array.from(dataMap.values()).sort((a, b) => a.year - b.year);
    };

    // Build live + static hybrid data for datasets that now have API sources
    console.log('🔬 Building hybrid live+static data...');

    // Startup Density: World Bank IC.BUS.NDNS.ZS with static fallback
    const liveStartupDensity = newBusinessDensityResult.status === 'fulfilled' ? newBusinessDensityResult.value : [];
    const staticStartupDensity = convertToCountryData(startupDensityData);
    const startupDensityCountryData = mergeStaticIntoLive(liveStartupDensity, staticStartupDensity);
    console.log('   - startupDensity: live=' + liveStartupDensity.length + ' years, merged=' + startupDensityCountryData.length + ' years');

    // STEM Graduates: World Bank SE.TER.GRAD.SC.ZS with static fallback
    const liveStemGraduates = stemGraduatesResult.status === 'fulfilled' ? stemGraduatesResult.value : [];
    const staticStemGraduates = convertToCountryData(stemGraduatesData);
    const stemGraduatesCountryData = mergeStaticIntoLive(liveStemGraduates, staticStemGraduates);
    console.log('   - stemGraduates: live=' + liveStemGraduates.length + ' years, merged=' + stemGraduatesCountryData.length + ' years');

    // Tech Employment: combine live researchers + technicians per million as proxy, with static fallback
    const liveResearchers = researchersResult.status === 'fulfilled' ? researchersResult.value : [];
    const liveTechnicians = techniciansResult.status === 'fulfilled' ? techniciansResult.value : [];
    const staticTechEmployment = convertToCountryData(techEmploymentData);
    const techEmploymentCountryData = buildTechEmploymentData(liveResearchers, liveTechnicians, staticTechEmployment);
    console.log('   - techEmployment: merged=' + techEmploymentCountryData.length + ' years');

    // Convert remaining static-only data to CountryData format
    console.log('🔬 Converting remaining static data to CountryData format...');
    const vcFundingCountryData = convertToCountryData(vcFundingData);
    console.log('   - vcFunding:', vcFundingCountryData.length, 'years');

    const aiPatentCountryData = convertToCountryData(aiPatentData);
    console.log('   - aiPatents:', aiPatentCountryData.length, 'years');

    const ecommerceCountryData = convertToCountryData(ecommerceAdoptionData);
    console.log('   - ecommerce:', ecommerceCountryData.length, 'years');

    const digitalPaymentCountryData = convertToCountryData(digitalPaymentData);
    console.log('   - digitalPayments:', digitalPaymentCountryData.length, 'years');

    // Convert unicorn data (single year snapshot) to CountryData format
    const unicornCountryData: CountryData[] = [{
      year: 2025,
      ...unicornData
    }];
    console.log('   - unicorns:', unicornCountryData.length, 'years');

    const technologyData: TechnologyData = {
      patentApplicationsResident: patentData,
      patentApplicationsNonResident: patentNonResidentResult.status === 'fulfilled' ? patentNonResidentResult.value : [],
      trademarkApplications: trademarkResult.status === 'fulfilled' ? trademarkResult.value : [],
      rdSpending: rdData,
      researchersRD: researchersData,
      techniciansRD: mergeUSATechData(
        techniciansResult.status === 'fulfilled' ? techniciansResult.value : [],
        usaTechData.computerEmployment // Use computer employment as proxy
      ),
      hightechExports: hightechData,
      ictExports: mergeUSATechData(
        ictExportsResult.status === 'fulfilled' ? ictExportsResult.value : [],
        usaTechData.ictServicesExports
      ),
      scientificPublications: scientificPubsResult.status === 'fulfilled' ? scientificPubsResult.value : [],
      ipReceipts: ipReceiptsResult.status === 'fulfilled' ? ipReceiptsResult.value : [],
      ipPayments: ipPaymentsResult.status === 'fulfilled' ? ipPaymentsResult.value : [],
      internetUsers: internetData,
      mobileSubscriptions: mobileData,
      
      // Digital Infrastructure
      broadbandSubscriptions: broadbandData,
      secureServers: secureServersResult.status === 'fulfilled' ? secureServersResult.value : [],
      ictGoodsImports: ictImportsResult.status === 'fulfilled' ? ictImportsResult.value : [],
      
      // Startup & VC (from static data)
      vcFunding: vcFundingCountryData,
      unicornCount: unicornCountryData,
      startupDensity: startupDensityCountryData,
      
      // AI & Emerging Tech
      aiPatents: aiPatentCountryData,
      
      // Digital Economy
      ecommerceAdoption: ecommerceCountryData,
      digitalPayments: digitalPaymentCountryData,
      ictServiceExports: ictServiceExportsResult.status === 'fulfilled' ? ictServiceExportsResult.value : [],
      
      // Tech Workforce
      stemGraduates: stemGraduatesCountryData,
      techEmployment: techEmploymentCountryData
    };

    // Cache for 24 hours
    clientCache.set(cacheKey, technologyData, 1000 * 60 * 60 * 24);
    
    console.log('🔬 ========================================');
    console.log('🔬 Technology Data Fetch Complete!');
    console.log('🔬 Data Sources Used:');
    console.log('   - World Bank API (primary: patents, R&D, trade, startup density, STEM grads)');
    console.log('   - FRED API (US-specific tech data)');
    console.log('   - WIPO (global patents up to 2023)');
    console.log('   - Eurostat (EU countries up to 2023)');
    console.log('   - ITU (internet/mobile up to 2024)');
    console.log('   - Live: IC.BUS.NDNS.ZS (startup density), SE.TER.GRAD.SC.ZS (STEM grads)');
    console.log('   - Live proxy: researchers + technicians -> tech employment');
    console.log('   - Static fallback (VC funding, unicorns, AI patents, e-commerce, digital payments)');
    console.log('🔬 ========================================');

    return technologyData;
  } catch (error) {
    console.error('Critical error fetching technology data:', error);
    
    // Try to return cached data as fallback
    const cached = clientCache.get<TechnologyData>(`technology_data_all_v${CURRENT_CACHE_VERSION}`);
    if (cached) {
      console.warn('Returning stale cached technology data due to API error');
      return cached;
    }
    
    // Return empty data structure
    return {
      patentApplicationsResident: [],
      patentApplicationsNonResident: [],
      trademarkApplications: [],
      rdSpending: [],
      researchersRD: [],
      techniciansRD: [],
      hightechExports: [],
      ictExports: [],
      scientificPublications: [],
      ipReceipts: [],
      ipPayments: [],
      internetUsers: [],
      mobileSubscriptions: [],
      broadbandSubscriptions: [],
      secureServers: [],
      ictGoodsImports: [],
      vcFunding: [],
      unicornCount: [],
      startupDensity: [],
      aiPatents: [],
      ecommerceAdoption: [],
      digitalPayments: [],
      ictServiceExports: [],
      stemGraduates: [],
      techEmployment: []
    };
  }
}

// Export country names for use in components
export { COUNTRY_NAMES };
