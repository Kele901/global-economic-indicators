import type { CountryData } from './worldbank';

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

  // Convert historical currency to Euros if the period spans adoption
  const conversion = convertToEuros(originalAmount, country, startYear, endYear);
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
  },
  Greece: {
    year: 2001,
    oldCurrency: 'Dr',
    oldName: 'Greek Drachma',
    euroConversionRate: 340.75 // 1 EUR = 340.75 GRD
  }
};

export type EuroAdoption = (typeof EURO_ADOPTION_COUNTRIES)[keyof typeof EURO_ADOPTION_COUNTRIES];

export function euroAdoption(country: string): EuroAdoption | null {
  return EURO_ADOPTION_COUNTRIES[country as keyof typeof EURO_ADOPTION_COUNTRIES] ?? null;
}

/**
 * Old-currency units per euro when the period from `fromYear` to `toYear` spans
 * the country's euro adoption, otherwise 1.
 */
export function euroConversionRate(country: string, fromYear: number, toYear: number): number {
  const adoption = euroAdoption(country);
  return adoption && fromYear < adoption.year && toYear >= adoption.year ? adoption.euroConversionRate : 1;
}

/**
 * Convert historical currency amount to Euros if needed
 * For Euro adoption countries before adoption, converts using official fixed rates.
 * When `toYear` is given and is also before adoption, no conversion happens: both
 * ends of the period are in the old currency.
 */
export function convertToEuros(
  amount: number,
  country: string,
  year: number,
  toYear?: number
): { convertedAmount: number; wasConverted: boolean; rate: number } {
  const adoption = euroAdoption(country);
  
  if (adoption && year < adoption.year && (toYear === undefined || toYear >= adoption.year)) {
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

  return CURRENCIES[country]?.symbol ?? '$';
}

/** Current currency of every roster country, keyed by wbKey. */
export const CURRENCIES: Record<string, { symbol: string; name: string; decimals?: number }> = {
  USA: { symbol: '$', name: 'US Dollar' },
  Canada: { symbol: 'C$', name: 'Canadian Dollar' },
  Mexico: { symbol: 'MX$', name: 'Mexican Peso' },
  Brazil: { symbol: 'R$', name: 'Brazilian Real' },
  Chile: { symbol: 'CLP$', name: 'Chilean Peso', decimals: 0 },
  Argentina: { symbol: 'ARS$', name: 'Argentine Peso' },
  Colombia: { symbol: 'COL$', name: 'Colombian Peso', decimals: 0 },
  UK: { symbol: '£', name: 'British Pound' },
  France: { symbol: '€', name: 'Euro' },
  Germany: { symbol: '€', name: 'Euro' },
  Italy: { symbol: '€', name: 'Euro' },
  Spain: { symbol: '€', name: 'Euro' },
  Sweden: { symbol: 'kr', name: 'Swedish Krona' },
  Switzerland: { symbol: 'CHF', name: 'Swiss Franc' },
  Norway: { symbol: 'kr', name: 'Norwegian Krone' },
  Netherlands: { symbol: '€', name: 'Euro' },
  Portugal: { symbol: '€', name: 'Euro' },
  Belgium: { symbol: '€', name: 'Euro' },
  Poland: { symbol: 'zł', name: 'Polish Złoty' },
  Greece: { symbol: '€', name: 'Euro' },
  Russia: { symbol: '₽', name: 'Russian Ruble' },
  Ukraine: { symbol: '₴', name: 'Ukrainian Hryvnia' },
  Turkey: { symbol: '₺', name: 'Turkish Lira' },
  SaudiArabia: { symbol: 'SR', name: 'Saudi Riyal' },
  Egypt: { symbol: 'E£', name: 'Egyptian Pound' },
  Israel: { symbol: '₪', name: 'Israeli New Shekel' },
  Iran: { symbol: 'IRR', name: 'Iranian Rial', decimals: 0 },
  UAE: { symbol: 'AED', name: 'UAE Dirham' },
  Qatar: { symbol: 'QAR', name: 'Qatari Riyal' },
  Morocco: { symbol: 'MAD', name: 'Moroccan Dirham' },
  Nigeria: { symbol: '₦', name: 'Nigerian Naira' },
  SouthAfrica: { symbol: 'R', name: 'South African Rand' },
  Kenya: { symbol: 'KSh', name: 'Kenyan Shilling' },
  Ethiopia: { symbol: 'Br', name: 'Ethiopian Birr' },
  Ghana: { symbol: 'GH₵', name: 'Ghanaian Cedi' },
  Japan: { symbol: '¥', name: 'Japanese Yen', decimals: 0 },
  Australia: { symbol: 'A$', name: 'Australian Dollar' },
  SouthKorea: { symbol: '₩', name: 'South Korean Won', decimals: 0 },
  China: { symbol: '¥', name: 'Chinese Yuan' },
  India: { symbol: '₹', name: 'Indian Rupee' },
  Indonesia: { symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0 },
  Singapore: { symbol: 'S$', name: 'Singapore Dollar' },
  Vietnam: { symbol: '₫', name: 'Vietnamese Dong', decimals: 0 },
  Thailand: { symbol: '฿', name: 'Thai Baht' },
  Philippines: { symbol: '₱', name: 'Philippine Peso' },
  Pakistan: { symbol: 'Rs', name: 'Pakistani Rupee' },
  Bangladesh: { symbol: '৳', name: 'Bangladeshi Taka' },
};

/**
 * Currencies that removed zeros. The CPI index runs straight through these, so
 * results are in today's units; an amount from before the change should be
 * entered in new units (divide old notes by `factor`).
 */
export const REDENOMINATIONS: Record<string, { year: number; factor: number; oldName: string }> = {
  Israel: { year: 1985, factor: 1_000, oldName: 'old shekels' },
  Argentina: { year: 1992, factor: 10_000, oldName: 'australes' },
  Mexico: { year: 1993, factor: 1_000, oldName: 'old pesos' },
  Brazil: { year: 1994, factor: 2_750, oldName: 'cruzeiros reais' },
  Poland: { year: 1995, factor: 10_000, oldName: 'old złoty' },
  Ukraine: { year: 1996, factor: 100_000, oldName: 'karbovanets' },
  Russia: { year: 1998, factor: 1_000, oldName: 'old rubles' },
  Turkey: { year: 2005, factor: 1_000_000, oldName: 'old lira' },
  Ghana: { year: 2007, factor: 10_000, oldName: 'old cedis' },
};

export function redenominationIn(country: string, fromYear: number, toYear: number) {
  const r = REDENOMINATIONS[country];
  return r && fromYear < r.year && toYear >= r.year ? r : null;
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

  return CURRENCIES[country]?.name ?? 'Currency';
}

// Alphabetic symbols ("CHF", "kr", "Rp") read better with a space before the number.
const withSymbol = (symbol: string, digits: string) => (/\p{L}$/u.test(symbol) ? `${symbol} ${digits}` : `${symbol}${digits}`);

/**
 * Format currency value with appropriate symbol and decimals for a specific year
 */
export function formatCurrency(value: number, country: string, year?: number): string {
  const symbol = getCurrencySymbol(country, year);
  // Some currencies don't use decimal places in everyday use; large sums drop cents too.
  const decimals = (CURRENCIES[country]?.decimals ?? 2) === 0 || Math.abs(value) >= 1e6 ? 0 : 2;
  const sign = value < 0 ? '-' : '';
  return sign + withSymbol(symbol, Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }));
}

/** Short form for chart axes: "$1.2k", "₺3.4m", "IRR 2.1bn". */
export function formatCurrencyCompact(value: number, country: string, year?: number): string {
  const symbol = getCurrencySymbol(country, year);
  const a = Math.abs(value);
  const scaled =
    a >= 1e12 ? `${(value / 1e12).toFixed(1)}tn`
    : a >= 1e9 ? `${(value / 1e9).toFixed(1)}bn`
    : a >= 1e6 ? `${(value / 1e6).toFixed(1)}m`
    : a >= 1e4 ? `${(value / 1e3).toFixed(0)}k`
    : a >= 1e3 ? `${(value / 1e3).toFixed(1)}k`
    : value.toFixed(a >= 10 || a === 0 ? 0 : a >= 1 ? 1 : 2);
  return withSymbol(symbol, scaled);
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

