import axios from "axios";

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

// Function to fetch data for a specific indicator
async function fetchIndicatorData(indicator: string, countries: string[]): Promise<CountryData[]> {
  try {
    const countryString = countries.join(';');
    const url = `${WORLD_BANK_BASE_URL}/${countryString}/indicator/${indicator}?format=json&per_page=1000&date=1960:2024`;
    
    const response = await axios.get(url);
    const data = response.data[1]; // World Bank returns data in second element
    
    if (!data || !Array.isArray(data)) {
      console.warn(`No data found for indicator ${indicator}`);
      return [];
    }

    // Group data by year
    const yearData: { [year: string]: CountryData } = {};
    
    data.forEach((item: any) => {
      if (item.value !== null && item.date && item.country?.id) {
        const year = parseInt(item.date);
        const countryCode = item.country.id;
        const countryName = COUNTRY_NAMES[countryCode];
        
        if (countryName) {
          if (!yearData[year]) {
            yearData[year] = { year };
          }
          yearData[year][countryName] = item.value;
        }
      }
    });

    return Object.values(yearData).sort((a, b) => a.year - b.year);
  } catch (error) {
    console.error(`Error fetching data for indicator ${indicator}:`, error);
    return [];
  }
}

// Main function to fetch all global economic data
export async function fetchGlobalData(): Promise<{
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
    console.log('Fetching global economic data from World Bank...');
    
    // Fetch all indicators in parallel
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
      giniCoefficient,
      rdSpending,
      energyConsumption
    ] = await Promise.all([
      fetchIndicatorData(INDICATORS.INTEREST_RATE, COUNTRY_CODES),
      fetchIndicatorData(INDICATORS.EMPLOYMENT_RATE, COUNTRY_CODES),
      fetchIndicatorData(INDICATORS.UNEMPLOYMENT_RATE, COUNTRY_CODES),
      fetchIndicatorData(INDICATORS.GOVERNMENT_DEBT, COUNTRY_CODES),
      fetchIndicatorData(INDICATORS.INFLATION_RATE, COUNTRY_CODES),
      fetchIndicatorData(INDICATORS.GDP_GROWTH, COUNTRY_CODES),
      fetchIndicatorData(INDICATORS.CPI, COUNTRY_CODES),
      fetchIndicatorData(INDICATORS.POPULATION_GROWTH, COUNTRY_CODES),
      fetchIndicatorData(INDICATORS.FDI, COUNTRY_CODES),
      fetchIndicatorData(INDICATORS.TRADE_BALANCE, COUNTRY_CODES),
      fetchIndicatorData(INDICATORS.GOVERNMENT_SPENDING, COUNTRY_CODES),
      fetchIndicatorData(INDICATORS.LABOR_PRODUCTIVITY, COUNTRY_CODES),
      fetchIndicatorData(INDICATORS.GINI_COEFFICIENT, COUNTRY_CODES),
      fetchIndicatorData(INDICATORS.RD_SPENDING, COUNTRY_CODES),
      fetchIndicatorData(INDICATORS.ENERGY_CONSUMPTION, COUNTRY_CODES)
    ]);

    console.log('Successfully fetched all economic data');
    
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
      giniCoefficient,
      rdSpending,
      energyConsumption
    };
  } catch (error) {
    console.error('Error fetching global data:', error);
    throw new Error('Failed to fetch economic data from World Bank API');
  }
}
