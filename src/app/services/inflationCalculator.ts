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

  // Get CPI values for both years
  const cpiStart = getCPIValue(cpiData, country, startYear);
  const cpiEnd = getCPIValue(cpiData, country, endYear);

  if (cpiStart === null || cpiEnd === null) {
    return null; // Data not available
  }

  // Calculate all metrics
  const adjustedValue = calculateAdjustedValue(originalAmount, cpiStart, cpiEnd);
  const years = endYear - startYear;
  const averageInflation = calculateAverageInflation(cpiStart, cpiEnd, years);
  const purchasingPowerChange = calculatePurchasingPowerChange(cpiStart, cpiEnd);
  const isDeflation = averageInflation < 0;

  // Calculate yearly values for the chart
  const yearlyValues = calculateYearlyValues(
    originalAmount,
    cpiData,
    country,
    startYear,
    endYear
  );

  return {
    originalAmount,
    originalYear: startYear,
    targetYear: endYear,
    adjustedValue,
    averageInflation,
    purchasingPowerChange,
    isDeflation,
    yearlyValues
  };
}

/**
 * Get currency symbol for a country
 */
export function getCurrencySymbol(country: string): string {
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
    Norway: 'kr'
  };
  return currencyMap[country] || '$';
}

/**
 * Format currency value with appropriate symbol and decimals
 */
export function formatCurrency(value: number, country: string): string {
  const symbol = getCurrencySymbol(country);
  const decimals = country === 'SouthKorea' || country === 'Japan' ? 0 : 2;
  
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

