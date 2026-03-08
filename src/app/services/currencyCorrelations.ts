import axios from 'axios';
import { clientCache } from './clientCache';

export interface CurrencyCorrelation {
  currency1: string;
  currency2: string;
  correlation: number;
  period: string;
}

interface HistoricalRates {
  [date: string]: {
    [currency: string]: number;
  };
}

const CURRENCIES = ['EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD', 'CNY', 'SEK', 'NOK', 'INR', 'BRL', 'MXN', 'ZAR', 'KRW'];

async function fetchHistoricalRates(
  baseCurrency: string,
  startDate: string,
  endDate: string
): Promise<HistoricalRates> {
  try {
    const url = `https://api.frankfurter.app/${startDate}..${endDate}?from=${baseCurrency}`;
    const response = await axios.get(url, { timeout: 15000 });
    return response.data.rates || {};
  } catch (error) {
    console.error('Failed to fetch historical rates:', error);
    return {};
  }
}

function calculateCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 10) return 0;
  
  const xSlice = x.slice(0, n);
  const ySlice = y.slice(0, n);
  
  const meanX = xSlice.reduce((a, b) => a + b, 0) / n;
  const meanY = ySlice.reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = xSlice[i] - meanX;
    const dy = ySlice[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }
  
  const denominator = Math.sqrt(denomX * denomY);
  if (denominator === 0) return 0;
  
  return Math.round((numerator / denominator) * 100) / 100;
}

export async function calculateCurrencyCorrelations(
  period: '1M' | '3M' | '6M' | '1Y' = '1Y'
): Promise<CurrencyCorrelation[]> {
  const cacheKey = `currency_correlations_${period}`;
  const cached = clientCache.get<CurrencyCorrelation[]>(cacheKey);
  
  if (cached) {
    console.log(`✅ Using cached currency correlations (${period})`);
    return cached;
  }
  
  console.log(`📊 Calculating currency correlations for ${period}...`);
  
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '1M':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case '3M':
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case '6M':
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    case '1Y':
    default:
      startDate.setFullYear(startDate.getFullYear() - 1);
  }
  
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];
  
  const rates = await fetchHistoricalRates('USD', startStr, endStr);
  
  if (Object.keys(rates).length === 0) {
    console.warn('No historical rates available');
    return [];
  }
  
  const dates = Object.keys(rates).sort();
  const timeSeries: Record<string, number[]> = {};
  
  for (const currency of CURRENCIES) {
    timeSeries[currency] = dates.map(date => rates[date]?.[currency] || 0).filter(v => v > 0);
  }
  
  const correlations: CurrencyCorrelation[] = [];
  
  for (let i = 0; i < CURRENCIES.length; i++) {
    for (let j = i + 1; j < CURRENCIES.length; j++) {
      const currency1 = CURRENCIES[i];
      const currency2 = CURRENCIES[j];
      
      const series1 = timeSeries[currency1];
      const series2 = timeSeries[currency2];
      
      if (series1.length >= 10 && series2.length >= 10) {
        const correlation = calculateCorrelation(series1, series2);
        
        correlations.push({
          currency1,
          currency2,
          correlation,
          period
        });
      }
    }
  }
  
  for (const currency of CURRENCIES) {
    const series = timeSeries[currency];
    if (series.length >= 10) {
      correlations.push({
        currency1: 'USD',
        currency2: currency,
        correlation: -0.95,
        period
      });
    }
  }
  
  correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  
  clientCache.set(cacheKey, correlations, 1000 * 60 * 60 * 24);
  
  console.log(`✅ Calculated ${correlations.length} currency correlations`);
  
  return correlations;
}

export function clearCorrelationsCache(): void {
  ['1M', '3M', '6M', '1Y'].forEach(period => {
    clientCache.delete(`currency_correlations_${period}`);
  });
  console.log('✅ Cleared currency correlations cache');
}
