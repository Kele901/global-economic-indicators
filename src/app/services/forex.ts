interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyPair {
  from: string;
  to: string;
  rate: number;
  change24h: number;
  lastUpdated: string;
}

// Cache exchange rates for 5 minutes to avoid excessive API calls
let ratesCache: { timestamp: number; data: ExchangeRates; base: string } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Primary API - Exchange Rate API (free tier, 1000 requests/month)
const fetchFromExchangeRateAPI = async (base: string): Promise<ExchangeRates> => {
  const response = await fetch(
    `https://api.exchangerate-api.com/v4/latest/${base}`
  );

  if (!response.ok) {
    throw new Error(`Exchange Rate API failed: ${response.status}`);
  }

  const data = await response.json();
  return data.rates;
};

// Fallback API - Fixer.io (free tier, 100 requests/month)
const fetchFromFixerAPI = async (base: string): Promise<ExchangeRates> => {
  // Note: Fixer.io free tier only supports EUR as base currency
  // So we'll fetch EUR rates and convert to the desired base
  const apiKey = process.env.NEXT_PUBLIC_FIXER_API_KEY;
  
  if (!apiKey) {
    throw new Error('Fixer API key not configured');
  }
  
  const response = await fetch(
    `http://data.fixer.io/api/latest?access_key=${apiKey}&base=EUR&symbols=${base},USD,GBP,JPY,CHF,CAD,AUD,CNY,SEK,NOK,NZD,HKD,SGD,MXN,BRL,INR,ZAR,RUB,TRY`
  );

  if (!response.ok) {
    throw new Error(`Fixer API failed: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Fixer API error: ${data.error?.info || 'Unknown error'}`);
  }

  // Convert from EUR base to desired base
  const eurRates = data.rates;
  const baseRate = eurRates[base];
  const convertedRates: ExchangeRates = {};
  
  Object.entries(eurRates).forEach(([currency, rate]) => {
    if (currency !== base) {
      convertedRates[currency] = (rate as number) / baseRate;
    }
  });
  
  return convertedRates;
};

// Fallback API - Currency Layer (free tier, 100 requests/month)
const fetchFromCurrencyLayer = async (base: string): Promise<ExchangeRates> => {
  const apiKey = process.env.NEXT_PUBLIC_CURRENCY_LAYER_API_KEY;
  
  if (!apiKey) {
    throw new Error('Currency Layer API key not configured');
  }
  
  const response = await fetch(
    `http://api.currencylayer.com/live?access_key=${apiKey}&currencies=${base},USD,GBP,JPY,CHF,CAD,AUD,CNY,SEK,NOK,NZD,HKD,SGD,MXN,BRL,INR,ZAR,RUB,TRY&source=${base}&format=1`
  );

  if (!response.ok) {
    throw new Error(`Currency Layer API failed: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Currency Layer API error: ${data.error?.info || 'Unknown error'}`);
  }

  return data.quotes;
};

export const fetchExchangeRates = async (base: string = 'USD'): Promise<ExchangeRates> => {
  try {
    // Check cache first
    if (ratesCache && 
        Date.now() - ratesCache.timestamp < CACHE_DURATION && 
        ratesCache.base === base) {
      return ratesCache.data;
    }

    let rates: ExchangeRates;
    
    try {
      // Try primary API first
      rates = await fetchFromExchangeRateAPI(base);
    } catch (error) {
      console.warn('Primary API failed, trying fallback:', error);
      
      try {
        // Try first fallback
        rates = await fetchFromFixerAPI(base);
      } catch (fallbackError) {
        console.warn('First fallback failed, trying second fallback:', fallbackError);
        
        try {
          // Try second fallback
          rates = await fetchFromCurrencyLayer(base);
        } catch (finalError) {
          console.error('All APIs failed:', finalError);
          throw new Error('Unable to fetch exchange rates from any available source');
        }
      }
    }
    
    // Update cache
    ratesCache = {
      timestamp: Date.now(),
      data: rates,
      base: base
    };

    return rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
};

export const calculateCurrencyPairs = async (baseCurrency: string, targetCurrencies: string[]): Promise<CurrencyPair[]> => {
  try {
    const rates = await fetchExchangeRates(baseCurrency);
    const now = new Date().toISOString();
    
    return targetCurrencies.map(currency => ({
      from: baseCurrency,
      to: currency,
      rate: rates[currency] || 0,
      change24h: 0, // We'll implement 24h change in a future update
      lastUpdated: now
    }));
  } catch (error) {
    console.error('Error calculating currency pairs:', error);
    return [];
  }
};

// Get all available currencies for a given base
export const getAllCurrencyRates = async (base: string = 'USD'): Promise<ExchangeRates> => {
  return await fetchExchangeRates(base);
};

// Convert amount between currencies
export const convertCurrency = async (
  amount: number, 
  from: string, 
  to: string
): Promise<number> => {
  if (from === to) return amount;
  
  try {
    const rates = await fetchExchangeRates(from);
    const rate = rates[to];
    
    if (!rate) {
      throw new Error(`Exchange rate not available for ${from} to ${to}`);
    }
    
    return amount * rate;
  } catch (error) {
    console.error('Error converting currency:', error);
    throw error;
  }
}; 