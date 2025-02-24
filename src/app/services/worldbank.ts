const WORLD_BANK_BASE_URL = 'https://api.worldbank.org/v2';

// Country codes mapping for consistent data
const COUNTRY_CODES = {
  USA: 'USA',
  Canada: 'CAN',
  France: 'FRA',
  Germany: 'DEU',
  Italy: 'ITA',
  Japan: 'JPN',
  UK: 'GBR',
  Australia: 'AUS',
  Mexico: 'MEX',
  SouthKorea: 'KOR',
  Spain: 'ESP',
  Sweden: 'SWE',
  Switzerland: 'CHE',
  Turkey: 'TUR',
  Nigeria: 'NGA',
  China: 'CHN',
  Russia: 'RUS',
  Brazil: 'BRA',
  Chile: 'CHL',
  Argentina: 'ARG',
  India: 'IND',
  Norway: 'NOR'
};

// Indicator codes for World Bank API
const INDICATORS = {
  INTEREST_RATE: 'FR.INR.RINR', // Real interest rate (%)
  EMPLOYMENT_RATE: 'SL.EMP.TOTL.SP.ZS', // Employment to population ratio (%)
  UNEMPLOYMENT_RATE: 'SL.UEM.TOTL.ZS', // Unemployment, total (% of total labor force)
  GOVT_DEBT: 'GC.DOD.TOTL.GD.ZS', // Central government debt, total (% of GDP)
  INFLATION_RATE: 'FP.CPI.TOTL.ZG', // Inflation, consumer prices (annual %)
  GDP_GROWTH: 'NY.GDP.MKTP.KD.ZG', // GDP growth (annual %)
  CPI: 'FP.CPI.TOTL', // Consumer Price Index (2010 = 100)
  // Alternative indicators for better historical coverage
  LENDING_RATE: 'FR.INR.LEND', // Lending interest rate (%)
  // Multiple employment indicators for better historical coverage
  EMPLOYMENT_INDICATORS: [
    'SL.EMP.TOTL.SP.ZS', // Employment to population ratio
    'SL.TLF.ACTI.ZS',    // Labor force participation rate
    'SL.TLF.CACT.ZS',    // Labor force participation rate (modeled ILO)
    'SL.EMP.WORK.ZS'     // Wage and salaried workers
  ],
  // Multiple unemployment indicators for better historical coverage
  UNEMPLOYMENT_INDICATORS: [
    'SL.UEM.TOTL.ZS',    // Unemployment, total (% of total labor force)
    'SL.UEM.TOTL.NE.ZS', // Unemployment, total (% of total labor force) (national estimate)
    'SL.UEM.TOTL.MA.ZS', // Unemployment, male (% of male labor force)
    'SL.UEM.TOTL.FE.ZS'  // Unemployment, female (% of female labor force)
  ],
  // Multiple inflation indicators for better historical coverage
  INFLATION_INDICATORS: [
    'FP.CPI.TOTL.ZG',    // Inflation, consumer prices (annual %)
    'NY.GDP.DEFL.KD.ZG', // GDP deflator (annual %)
    'FP.CPI.TOTL',       // Consumer price index
  ],
  // Multiple debt indicators for better historical coverage
  DEBT_INDICATORS: [
    'GC.DOD.TOTL.GD.ZS', // Central government debt, total (% of GDP)
    'GC.DOD.TOTL.CN',    // Central government debt, total (current LCU)
    'GC.DOD.TOTL.CD'     // Central government debt, total (current US$)
  ],
  // Multiple GDP growth indicators for better historical coverage
  GDP_GROWTH_INDICATORS: [
    'NY.GDP.MKTP.KD.ZG',    // GDP growth (annual %)
    'NY.GDP.PCAP.KD.ZG',    // GDP per capita growth (annual %)
    'NY.GDP.MKTP.CD'        // GDP (current US$)
  ],
  // Multiple CPI indicators for better historical coverage
  CPI_INDICATORS: [
    'FP.CPI.TOTL',    // Consumer Price Index (2010 = 100)
    'FP.CPI.TOTL.ZG', // Consumer price index (annual % change)
    'NV.IND.MANF.ZS'  // Manufacturing, value added (% of GDP)
  ],
};

export type CountryData = {
  year: number;
  [key: string]: number;
};

// Helper function to round numbers based on indicator type
const roundValue = (value: number, indicator: string): number => {
  if (indicator === INDICATORS.INTEREST_RATE || indicator === INDICATORS.LENDING_RATE) {
    return Math.round(value * 10) / 10; // Round to 1 decimal place for interest rates
  }
  return Math.round(value * 100) / 100; // Round employment/unemployment rates to 2 decimal places
};

const fetchWorldBankData = async (
  countryCode: string,
  indicator: string,
  startYear: number,
  endYear: number,
  retryWithAlternative: boolean = true
): Promise<{ year: number; value: number }[]> => {
  try {
    const response = await fetch(
      `${WORLD_BANK_BASE_URL}/country/${countryCode}/indicator/${indicator}?format=json&date=${startYear}:${endYear}&per_page=100`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const [metadata, data] = await response.json();

    if (!data || data.length === 0) {
      // If no data and we're looking for primary indicators, try alternative ones
      if (retryWithAlternative) {
        if (indicator === INDICATORS.INTEREST_RATE) {
          return fetchWorldBankData(countryCode, INDICATORS.LENDING_RATE, startYear, endYear, false);
        }
      }
      return [];
    }

    return data
      .map((item: any) => ({
        year: parseInt(item.date),
        value: item.value !== null ? roundValue(item.value, indicator) : null
      }))
      .filter((item: any) => item.value !== null);
  } catch (error) {
    console.error(`Error fetching data for ${countryCode}:`, error);
    return [];
  }
};

const fetchEmploymentData = async (
  countryCode: string,
  startYear: number,
  endYear: number
): Promise<{ year: number; value: number }[]> => {
  // Try each employment indicator in sequence until we get data
  for (const indicator of INDICATORS.EMPLOYMENT_INDICATORS) {
    const data = await fetchWorldBankData(countryCode, indicator, startYear, endYear, false);
    if (data.length > 0) {
      return data;
    }
  }
  return [];
};

const fetchUnemploymentData = async (
  countryCode: string,
  startYear: number,
  endYear: number
): Promise<{ year: number; value: number }[]> => {
  // Try each unemployment indicator in sequence until we get data
  for (const indicator of INDICATORS.UNEMPLOYMENT_INDICATORS) {
    const data = await fetchWorldBankData(countryCode, indicator, startYear, endYear, false);
    if (data.length > 0) {
      return data;
    }
  }
  return [];
};

const fetchDebtData = async (
  countryCode: string,
  startYear: number,
  endYear: number
): Promise<{ year: number; value: number }[]> => {
  // Try each debt indicator in sequence until we get data
  for (const indicator of INDICATORS.DEBT_INDICATORS) {
    const data = await fetchWorldBankData(countryCode, indicator, startYear, endYear, false);
    if (data.length > 0) {
      return data;
    }
  }
  return [];
};

const fetchInflationData = async (
  countryCode: string,
  startYear: number,
  endYear: number
): Promise<{ year: number; value: number }[]> => {
  // Try each inflation indicator in sequence until we get data
  for (const indicator of INDICATORS.INFLATION_INDICATORS) {
    const data = await fetchWorldBankData(countryCode, indicator, startYear, endYear, false);
    if (data.length > 0) {
      return data;
    }
  }
  return [];
};

const fetchGDPGrowthData = async (
  countryCode: string,
  startYear: number,
  endYear: number
): Promise<{ year: number; value: number }[]> => {
  // Try each GDP growth indicator in sequence until we get data
  for (const indicator of INDICATORS.GDP_GROWTH_INDICATORS) {
    const data = await fetchWorldBankData(countryCode, indicator, startYear, endYear, false);
    if (data.length > 0) {
      return data;
    }
  }
  return [];
};

const fetchCPIData = async (
  countryCode: string,
  startYear: number,
  endYear: number
): Promise<{ year: number; value: number }[]> => {
  // Try each CPI indicator in sequence until we get data
  for (const indicator of INDICATORS.CPI_INDICATORS) {
    const data = await fetchWorldBankData(countryCode, indicator, startYear, endYear, false);
    if (data.length > 0) {
      return data;
    }
  }
  return [];
};

export const fetchAllCountriesData = async (
  indicator: string,
  startYear: number = 1960,
  endYear: number = new Date().getFullYear()
): Promise<CountryData[]> => {
  try {
    // Fetch data for all countries in parallel
    const countriesData = await Promise.all(
      Object.entries(COUNTRY_CODES).map(async ([countryName, countryCode]) => {
        let data;
        if (indicator === INDICATORS.EMPLOYMENT_RATE) {
          data = await fetchEmploymentData(countryCode, startYear, endYear);
        } else if (indicator === INDICATORS.UNEMPLOYMENT_RATE) {
          data = await fetchUnemploymentData(countryCode, startYear, endYear);
        } else if (indicator === INDICATORS.GOVT_DEBT) {
          data = await fetchDebtData(countryCode, startYear, endYear);
        } else if (indicator === INDICATORS.INFLATION_RATE) {
          data = await fetchInflationData(countryCode, startYear, endYear);
        } else if (indicator === INDICATORS.GDP_GROWTH) {
          data = await fetchGDPGrowthData(countryCode, startYear, endYear);
        } else if (indicator === INDICATORS.CPI) {
          data = await fetchCPIData(countryCode, startYear, endYear);
        } else {
          data = await fetchWorldBankData(countryCode, indicator, startYear, endYear);
        }
        return { countryName, data };
      })
    );

    // Create a map of all years
    const yearMap: { [key: number]: CountryData } = {};
    
    // Initialize all years with null values
    for (let year = startYear; year <= endYear; year++) {
      yearMap[year] = { year };
      Object.keys(COUNTRY_CODES).forEach(country => {
        yearMap[year][country] = 0;
      });
    }
    
    // Process data for each country
    countriesData.forEach(({ countryName, data }) => {
      data.forEach(({ year, value }) => {
        if (yearMap[year]) {
          yearMap[year][countryName] = value;
        }
      });
    });

    // Convert the map to an array and sort by year
    const sortedData = Object.values(yearMap).sort((a, b) => a.year - b.year);

    // For employment and unemployment data, interpolate missing values
    if (indicator === INDICATORS.EMPLOYMENT_RATE || indicator === INDICATORS.UNEMPLOYMENT_RATE) {
      return interpolateMissingValues(sortedData);
    }

    return sortedData;
  } catch (error) {
    console.error('Error fetching all countries data:', error);
    return [];
  }
};

// Helper function to interpolate missing values
const interpolateMissingValues = (data: CountryData[]): CountryData[] => {
  const countries = Object.keys(COUNTRY_CODES);
  
  countries.forEach(country => {
    for (let i = 1; i < data.length - 1; i++) {
      // If current value is 0 (missing) and we have values before and after
      if (data[i][country] === 0 && data[i-1][country] !== 0 && data[i+1][country] !== 0) {
        // Linear interpolation
        data[i][country] = (data[i-1][country] + data[i+1][country]) / 2;
      }
    }
  });

  return data;
};

export const fetchGlobalData = async () => {
  try {
    const endYear = 2023; // Set fixed end year to 2023
    const [
      interestRates, 
      employmentRates, 
      unemploymentRates, 
      governmentDebt, 
      inflationRates, 
      gdpGrowth,
      cpiData
    ] = await Promise.all([
      fetchAllCountriesData(INDICATORS.INTEREST_RATE, 1960, endYear),
      fetchAllCountriesData(INDICATORS.EMPLOYMENT_RATE, 1990, endYear),
      fetchAllCountriesData(INDICATORS.UNEMPLOYMENT_RATE, 1990, endYear),
      fetchAllCountriesData(INDICATORS.GOVT_DEBT, 1989, endYear),
      fetchAllCountriesData(INDICATORS.INFLATION_RATE, 1960, endYear),
      fetchAllCountriesData(INDICATORS.GDP_GROWTH, 1960, endYear),
      fetchAllCountriesData(INDICATORS.CPI, 1960, endYear)
    ]);

    return {
      interestRates,
      employmentRates,
      unemploymentRates,
      governmentDebt,
      inflationRates,
      gdpGrowth,
      cpiData
    };
  } catch (error) {
    console.error('Error fetching global data:', error);
    return {
      interestRates: [],
      employmentRates: [],
      unemploymentRates: [],
      governmentDebt: [],
      inflationRates: [],
      gdpGrowth: [],
      cpiData: []
    };
  }
}; 