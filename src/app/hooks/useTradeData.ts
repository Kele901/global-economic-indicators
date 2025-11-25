// Custom hook for fetching and managing real trade data

import { useState, useEffect, useCallback } from 'react';
import { tradeDataService, apiCache, COUNTRY_MAPPINGS } from '../services/tradeData';

interface UseTradeDataOptions {
  countries: string[];
  enableRealData: boolean;
  refreshInterval?: number;
}

interface TradeDataState {
  data: any[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  isRealData: boolean;
}

export const useTradeData = ({ 
  countries, 
  enableRealData = false,
  refreshInterval = 3600000 // 1 hour default
}: UseTradeDataOptions) => {
  const [state, setState] = useState<TradeDataState>({
    data: [],
    loading: false,
    error: null,
    lastUpdated: null,
    isRealData: false
  });

  const fetchRealData = useCallback(async () => {
    if (!enableRealData) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check cache first
      const cacheKey = `trade-data-${countries.join('-')}`;
      const cachedData = apiCache.get(cacheKey);
      
      if (cachedData) {
        setState({
          data: cachedData.data,
          loading: false,
          error: null,
          lastUpdated: cachedData.lastUpdated,
          isRealData: true
        });
        return;
      }

      // Fetch comprehensive real data
      const [worldBankData, growthRates, complexityData] = await Promise.allSettled([
        tradeDataService.fetchWorldBankTradeData(
          countries.map(code => COUNTRY_MAPPINGS[code] || code)
        ),
        tradeDataService.fetchGrowthRates(
          countries.map(code => COUNTRY_MAPPINGS[code] || code)
        ),
        tradeDataService.fetchEconomicComplexity(
          countries.map(code => COUNTRY_MAPPINGS[code] || code)
        )
      ]);

      const worldBankResult = worldBankData.status === 'fulfilled' ? worldBankData.value : [];
      const growthResult = growthRates.status === 'fulfilled' ? growthRates.value : {};
      const complexityResult = complexityData.status === 'fulfilled' ? complexityData.value : {};

      // Fetch additional data for each country
      const enhancedData = await Promise.all(
        countries.map(async (countryCode) => {
          try {
            const [comtradeData, categoriesData, tariffData] = await Promise.allSettled([
              tradeDataService.fetchComtradePartnerData(COUNTRY_MAPPINGS[countryCode] || countryCode),
              tradeDataService.fetchTradeCategories(COUNTRY_MAPPINGS[countryCode] || countryCode),
              tradeDataService.fetchTariffData(countryCode)
            ]);

            const basicData = worldBankResult.find(item => 
              item.countryCode === (COUNTRY_MAPPINGS[countryCode] || countryCode)
            );

            const countryGrowth = growthResult[COUNTRY_MAPPINGS[countryCode] || countryCode] || { exportGrowth: 0, importGrowth: 0 };
            const countryComplexity = complexityResult[COUNTRY_MAPPINGS[countryCode] || countryCode] || 0.5;
            const categories = categoriesData.status === 'fulfilled' ? categoriesData.value : { exports: [], imports: [] };

            return {
              ...basicData,
              code: countryCode,
              // Real data from APIs
              exportGrowth: countryGrowth.exportGrowth,
              importGrowth: countryGrowth.importGrowth,
              diversificationIndex: countryComplexity,
              topExports: categories.exports.length > 0 ? categories.exports : null,
              topImports: categories.imports.length > 0 ? categories.imports : null,
              tradingPartners: comtradeData.status === 'fulfilled' ? comtradeData.value : [],
              tariffInfo: tariffData.status === 'fulfilled' ? tariffData.value : null,
              // Add flags for data source tracking
              hasRealCategories: categories.exports.length > 0 || categories.imports.length > 0,
              hasRealPartners: comtradeData.status === 'fulfilled' && comtradeData.value.length > 0,
              hasRealGrowth: countryGrowth.exportGrowth !== 0 || countryGrowth.importGrowth !== 0
            };
          } catch (error) {
            console.error(`Error fetching data for ${countryCode}:`, error);
            return null;
          }
        })
      );

      const validData = enhancedData.filter(Boolean);
      const lastUpdated = new Date().toISOString();

      // Cache the results
      apiCache.set(cacheKey, { data: validData, lastUpdated });

      setState({
        data: validData,
        loading: false,
        error: null,
        lastUpdated,
        isRealData: true
      });

    } catch (error) {
      console.error('Error in fetchRealData:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isRealData: false
      }));
    }
  }, [countries, enableRealData]);

  // Auto-refresh data
  useEffect(() => {
    if (!enableRealData) return;

    fetchRealData();

    const interval = setInterval(fetchRealData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchRealData, refreshInterval, enableRealData]);

  const refreshData = useCallback(() => {
    apiCache.clear();
    fetchRealData();
  }, [fetchRealData]);

  return {
    ...state,
    refreshData,
    toggleRealData: () => setState(prev => ({ 
      ...prev, 
      isRealData: !prev.isRealData 
    }))
  };
};

// Helper function to calculate diversification index
function calculateDiversificationIndex(partnerData: any[]): number {
  if (!partnerData.length) return 0;
  
  const totalTrade = partnerData.reduce((sum, partner) => sum + partner.tradeVolume, 0);
  const shares = partnerData.map(partner => partner.tradeVolume / totalTrade);
  
  // Calculate Herfindahl-Hirschman Index and convert to diversification
  const hhi = shares.reduce((sum, share) => sum + (share * share), 0);
  return Math.max(0, 1 - hhi); // Higher value = more diversified
}

// Rate limiting utility
export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number;

  constructor(maxRequests: number = 100, timeWindowMs: number = 3600000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getTimeUntilReset(): number {
    if (this.requests.length === 0) return 0;
    return this.timeWindow - (Date.now() - this.requests[0]);
  }
}

export const rateLimiter = new RateLimiter();

// Hook for fetching historical trade data
interface UseHistoricalTradeDataOptions {
  countries: string[];
  startYear?: number;
  endYear?: number;
  enableRealData: boolean;
}

interface HistoricalTradeDataState {
  yearlyData: { [year: number]: any[] };
  trends: { [countryCode: string]: any };
  globalTrends: any;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export const useHistoricalTradeData = ({ 
  countries, 
  startYear = 2015,
  endYear = 2023,
  enableRealData = false
}: UseHistoricalTradeDataOptions) => {
  const [state, setState] = useState<HistoricalTradeDataState>({
    yearlyData: {},
    trends: {},
    globalTrends: null,
    loading: false,
    error: null,
    lastUpdated: null
  });

  const fetchHistoricalData = useCallback(async () => {
    if (!enableRealData) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check cache first
      const cacheKey = `historical-trade-data-${countries.join('-')}-${startYear}-${endYear}`;
      const cachedData = apiCache.get(cacheKey);
      
      if (cachedData) {
        setState({
          ...cachedData,
          loading: false,
          error: null
        });
        return;
      }

      // Fetch comprehensive historical data
      const historicalData = await tradeDataService.fetchComprehensiveHistoricalData(
        countries.map(code => COUNTRY_MAPPINGS[code] || code),
        startYear,
        endYear
      );

      const lastUpdated = new Date().toISOString();

      // Cache the results
      apiCache.set(cacheKey, { 
        yearlyData: historicalData.yearlyData,
        trends: historicalData.trends,
        globalTrends: historicalData.globalTrends,
        lastUpdated 
      });

      setState({
        yearlyData: historicalData.yearlyData,
        trends: historicalData.trends,
        globalTrends: historicalData.globalTrends,
        loading: false,
        error: null,
        lastUpdated
      });

    } catch (error) {
      console.error('Error fetching historical trade data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch historical data'
      }));
    }
  }, [countries, startYear, endYear, enableRealData]);

  // Fetch data when enabled
  useEffect(() => {
    if (enableRealData) {
      fetchHistoricalData();
    }
  }, [fetchHistoricalData, enableRealData]);

  const refreshData = useCallback(() => {
    const cacheKey = `historical-trade-data-${countries.join('-')}-${startYear}-${endYear}`;
    apiCache.clear();
    fetchHistoricalData();
  }, [fetchHistoricalData, countries, startYear, endYear]);

  return {
    ...state,
    refreshData
  };
};
