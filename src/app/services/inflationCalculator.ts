import { CountryData } from './worldbank';

export interface InflationCalculation {
  originalAmount: number;
  originalYear: number;
  targetYear: number;
  adjustedValue: number;
  averageInflation: number;
  purchasingPowerChange: number;
  isDeflation: boolean;
  yearlyValues: { year: number; value: number }[];
  originalCurrency: string;
  targetCurrency: string;
  currencyChanged: boolean;
  conversionRate?: number;
  convertedToEuros?: boolean;
  amountInEuros?: number;
}

export interface CountryDateRange {
  startYear: number;
  endYear: number;
  dataPoints: number;
}

/**
 * Calculate the adjusted value based on CPI between two years
 * Formula: Adjusted Value = Original Value × (CPI_end_year / CPI_start_year)
 */
export function calculateAdjustedValue(
  originalAmount: number,
  cpiStartYear: number,
  cpiEndYear: number
): number {
  if (cpiStartYear === 0 || cpiEndYear === 0) {
    throw new Error('Invalid CPI data: CPI values cannot be zero');
  }
  return originalAmount * (cpiEndYear / cpiStartYear);
}

/**
 * Calculate average annual inflation rate between two years
 * Formula: Average Inflation = (((CPI_end / CPI_start) ^ (1 / years)) - 1) × 100
 */
export function calculateAverageInflation(
  cpiStartYear: number,
  cpiEndYear: number,
  years: number
): number {
  if (years === 0) {
    return 0;
  }
  if (cpiStartYear === 0 || cpiEndYear === 0) {
    throw new Error('Invalid CPI data: CPI values cannot be zero');
  }
  return (Math.pow(cpiEndYear / cpiStartYear, 1 / years) - 1) * 100;
}

/**
 * Calculate purchasing power change as a percentage
 */
export function calculatePurchasingPowerChange(
  cpiStartYear: number,
  cpiEndYear: number
): number {
  if (cpiStartYear === 0) {
    throw new Error('Invalid CPI data: CPI values cannot be zero');
  }
  return ((cpiEndYear - cpiStartYear) / cpiStartYear) * 100;
}

/**
 * Get CPI value for a specific year and country from the data
 */
function getCPIValue(cpiData: CountryData[], country: string, year: number): number | null {
  const yearData = cpiData.find(d => d.year === year);
  if (!yearData || !yearData[country]) {
    return null;
  }
  const value = yearData[country];
  return typeof value === 'number' ? value : null;
}

/**
 * Get available date range for a country's CPI data
 */
export function getCountryDateRange(
  cpiData: CountryData[],
  country: string
): CountryDateRange | null {
  const availableYears = cpiData
    .filter(d => d[country] && typeof d[country] === 'number')
    .map(d => d.year as number)
    .sort((a, b) => a - b);

  if (availableYears.length === 0) {
    return null;
  }

  return {
    startYear: availableYears[0],
    endYear: availableYears[availableYears.length - 1],
    dataPoints: availableYears.length
  };
}

/**
 * Calculate year-by-year values between start and end year
 */
function calculateYearlyValues(
  originalAmount: number,
  cpiData: CountryData[],
  country: string,
  startYear: number,
  endYear: number
): { year: number; value: number }[] {
  const yearlyValues: { year: number; value: number }[] = [];
  const cpiStart = getCPIValue(cpiData, country, startYear);

  if (!cpiStart) {
    return [];
  }

  for (let year = startYear; year <= endYear; year++) {
    const cpiYear = getCPIValue(cpiData, country, year);
    if (cpiYear !== null) {
      const adjustedValue = calculateAdjustedValue(originalAmount, cpiStart, cpiYear);
      yearlyValues.push({ year, value: adjustedValue });
    }
  }

  return yearlyValues;
}

/**
 * Main function to calculate inflation adjustment and all related metrics
 */
export function calculateInflation(
  originalAmount: number,
  startYear: number,
  endYear: number,
  country: string,
  cpiData: CountryData[]
): InflationCalculation | null {
  // Validate inputs
  if (startYear >= endYear) {
    throw new Error('Start year must be before end year');
  }
  if (originalAmount <= 0) {
    throw new Error('Amount must be greater than zero');
  }

  // Convert historical currency to Euros if needed
  const conversion = convertToEuros(originalAmount, country, startYear);
  const amountInEuros = conversion.convertedAmount;

  // Get CPI values for both years
  const cpiStart = getCPIValue(cpiData, country, startYear);
  const cpiEnd = getCPIValue(cpiData, country, endYear);

  if (cpiStart === null || cpiEnd === null) {
    return null; // Data not available
  }

  // Calculate all metrics (using Euro amounts for proper CPI calculation)
  const adjustedValue = calculateAdjustedValue(amountInEuros, cpiStart, cpiEnd);
  const years = endYear - startYear;
  const averageInflation = calculateAverageInflation(cpiStart, cpiEnd, years);
  const purchasingPowerChange = calculatePurchasingPowerChange(cpiStart, cpiEnd);
  const isDeflation = averageInflation < 0;

  // Calculate yearly values for the chart (in Euros)
  const yearlyValues = calculateYearlyValues(
    amountInEuros,
    cpiData,
    country,
    startYear,
    endYear
  );

  // Determine currency symbols for both years
  const originalCurrency = getCurrencySymbol(country, startYear);
  const targetCurrency = getCurrencySymbol(country, endYear);
  const currencyChanged = originalCurrency !== targetCurrency;

  return {
    originalAmount, // Keep the original input amount
    originalYear: startYear,
    targetYear: endYear,
    adjustedValue,
    averageInflation,
    purchasingPowerChange,
    isDeflation,
    yearlyValues,
    originalCurrency,
    targetCurrency,
    currencyChanged,
    conversionRate: conversion.wasConverted ? conversion.rate : undefined,
    convertedToEuros: conversion.wasConverted,
    amountInEuros: conversion.wasConverted ? amountInEuros : undefined
  };
}

/**
 * Historical currency information for Euro adoption countries
 * Includes official fixed conversion rates from January 1, 1999
 */
const EURO_ADOPTION_COUNTRIES = {
  France: { 
    year: 2002, 
    oldCurrency: 'F', 
    oldName: 'French Franc',
    euroConversionRate: 6.55957 // 1 EUR = 6.55957 FRF
  },
  Germany: { 
    year: 2002, 
    oldCurrency: 'DM', 
    oldName: 'Deutsche Mark',
    euroConversionRate: 1.95583 // 1 EUR = 1.95583 DEM
  },
  Italy: { 
    year: 2002, 
    oldCurrency: '₤', 
    oldName: 'Italian Lira',
    euroConversionRate: 1936.27 // 1 EUR = 1936.27 ITL
  },
  Spain: { 
    year: 2002, 
    oldCurrency: '₧', 
    oldName: 'Spanish Peseta',
    euroConversionRate: 166.386 // 1 EUR = 166.386 ESP
  },
  Netherlands: {
    year: 2002,
    oldCurrency: 'ƒ',
    oldName: 'Dutch Guilder',
    euroConversionRate: 2.20371 // 1 EUR = 2.20371 NLG
  },
  Portugal: {
    year: 2002,
    oldCurrency: '$',
    oldName: 'Portuguese Escudo',
    euroConversionRate: 200.482 // 1 EUR = 200.482 PTE
  },
  Belgium: {
    year: 2002,
    oldCurrency: 'fr',
    oldName: 'Belgian Franc',
    euroConversionRate: 40.3399 // 1 EUR = 40.3399 BEF
  }
};

/**
 * Convert historical currency amount to Euros if needed
 * For Euro adoption countries before 2002, converts using official fixed rates
 */
export function convertToEuros(
  amount: number,
  country: string,
  year: number
): { convertedAmount: number; wasConverted: boolean; rate: number } {
  const adoption = EURO_ADOPTION_COUNTRIES[country as keyof typeof EURO_ADOPTION_COUNTRIES];
  
  if (adoption && year < adoption.year) {
    // Convert from old currency to Euros using official fixed rate
    const convertedAmount = amount / adoption.euroConversionRate;
    return {
      convertedAmount,
      wasConverted: true,
      rate: adoption.euroConversionRate
    };
  }
  
  // No conversion needed
  return {
    convertedAmount: amount,
    wasConverted: false,
    rate: 1
  };
}

/**
 * Get currency symbol for a country at a specific year
 */
export function getCurrencySymbol(country: string, year?: number): string {
  // Check if this is a Euro adoption country and year is before adoption
  if (year && EURO_ADOPTION_COUNTRIES[country as keyof typeof EURO_ADOPTION_COUNTRIES]) {
    const adoption = EURO_ADOPTION_COUNTRIES[country as keyof typeof EURO_ADOPTION_COUNTRIES];
    if (year < adoption.year) {
      return adoption.oldCurrency;
    }
  }

  // Default currency map (current currencies)
  const currencyMap: { [key: string]: string } = {
    USA: '$',
    UK: '£',
    Canada: 'C$',
    France: '€',
    Germany: '€',
    Italy: '€',
    Spain: '€',
    Japan: '¥',
    China: '¥',
    Australia: 'A$',
    Mexico: 'MX$',
    SouthKorea: '₩',
    Sweden: 'kr',
    Switzerland: 'CHF',
    Turkey: '₺',
    Nigeria: '₦',
    Russia: '₽',
    Brazil: 'R$',
    Chile: 'CLP$',
    Argentina: 'ARS$',
    India: '₹',
    Norway: 'kr',
    Netherlands: '€',
    Portugal: '€',
    Belgium: '€',
    Indonesia: 'Rp',
    SouthAfrica: 'R',
    Poland: 'zł',
    SaudiArabia: 'SR',
    Egypt: 'E£'
  };
  return currencyMap[country] || '$';
}

/**
 * Get full currency name for a country at a specific year
 */
export function getCurrencyName(country: string, year?: number): string {
  // Check if this is a Euro adoption country and year is before adoption
  if (year && EURO_ADOPTION_COUNTRIES[country as keyof typeof EURO_ADOPTION_COUNTRIES]) {
    const adoption = EURO_ADOPTION_COUNTRIES[country as keyof typeof EURO_ADOPTION_COUNTRIES];
    if (year < adoption.year) {
      return adoption.oldName;
    }
  }

  // Default currency names (current currencies)
  const currencyNames: { [key: string]: string } = {
    USA: 'US Dollar',
    UK: 'British Pound',
    Canada: 'Canadian Dollar',
    France: 'Euro',
    Germany: 'Euro',
    Italy: 'Euro',
    Spain: 'Euro',
    Japan: 'Japanese Yen',
    China: 'Chinese Yuan',
    Australia: 'Australian Dollar',
    Mexico: 'Mexican Peso',
    SouthKorea: 'South Korean Won',
    Sweden: 'Swedish Krona',
    Switzerland: 'Swiss Franc',
    Turkey: 'Turkish Lira',
    Nigeria: 'Nigerian Naira',
    Russia: 'Russian Ruble',
    Brazil: 'Brazilian Real',
    Chile: 'Chilean Peso',
    Argentina: 'Argentine Peso',
    India: 'Indian Rupee',
    Norway: 'Norwegian Krone',
    Netherlands: 'Euro',
    Portugal: 'Euro',
    Belgium: 'Euro',
    Indonesia: 'Indonesian Rupiah',
    SouthAfrica: 'South African Rand',
    Poland: 'Polish Złoty',
    SaudiArabia: 'Saudi Riyal',
    Egypt: 'Egyptian Pound'
  };
  return currencyNames[country] || 'Currency';
}

/**
 * Format currency value with appropriate symbol and decimals for a specific year
 */
export function formatCurrency(value: number, country: string, year?: number): string {
  const symbol = getCurrencySymbol(country, year);
  // Some currencies don't use decimal places in everyday use
  const decimals = ['SouthKorea', 'Japan', 'Indonesia'].includes(country) ? 0 : 2;
  
  return `${symbol}${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

/**
 * Validate year selection against available data
 */
export function validateYearSelection(
  startYear: number,
  endYear: number,
  dateRange: CountryDateRange | null
): { isValid: boolean; message?: string } {
  if (!dateRange) {
    return { isValid: false, message: 'No data available for this country' };
  }

  if (startYear < dateRange.startYear) {
    return {
      isValid: false,
      message: `Data for this country starts from ${dateRange.startYear}`
    };
  }

  if (endYear > dateRange.endYear) {
    return {
      isValid: false,
      message: `Data for this country ends at ${dateRange.endYear}`
    };
  }

  if (startYear >= endYear) {
    return {
      isValid: false,
      message: 'Start year must be before end year'
    };
  }

  return { isValid: true };
}

