interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyPair {
  from: string;
  to: string;
  rate: number;
  change24h: number;
}

// Cache exchange rates for 5 minutes to avoid excessive API calls
let ratesCache: { timestamp: number; data: ExchangeRates } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const fetchExchangeRates = async (base: string = 'USD'): Promise<ExchangeRates> => {
  try {
    // Check cache first
    if (ratesCache && Date.now() - ratesCache.timestamp < CACHE_DURATION) {
      return ratesCache.data;
    }

    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${base}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    
    // Update cache
    ratesCache = {
      timestamp: Date.now(),
      data: data.rates
    };

    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
};

export const calculateCurrencyPairs = async (baseCurrency: string, targetCurrencies: string[]): Promise<CurrencyPair[]> => {
  try {
    const rates = await fetchExchangeRates(baseCurrency);
    
    return targetCurrencies.map(currency => ({
      from: baseCurrency,
      to: currency,
      rate: rates[currency],
      change24h: 0 // We'll implement 24h change in a future update
    }));
  } catch (error) {
    console.error('Error calculating currency pairs:', error);
    return [];
  }
}; 