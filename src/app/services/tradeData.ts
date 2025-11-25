// Trade Data Service - Real World APIs Integration

interface TradeMetrics {
  country: string;
  countryCode: string;
  year: number;
  exports: number;
  imports: number;
  tradeBalance: number;
  gdp: number;
  population: number;
  tradeIntensity: number;
}

interface WorldBankResponse {
  [key: string]: {
    country: { id: string; value: string };
    countryiso3code: string;
    date: string;
    decimal: number;
    indicator: { id: string; value: string };
    obs_status: string;
    unit: string;
    value: number | null;
  }[];
}

interface ComtradeResponse {
  data: {
    typeCode: string;
    freqCode: string;
    refPeriodId: number;
    refArea: string;
    refAreaDesc: string;
    flowCode: string;
    flowDesc: string;
    partnerCode: string;
    partnerDesc: string;
    cmdCode: string;
    cmdDesc: string;
    primaryValue: number;
  }[];
}

class TradeDataService {
  private readonly WORLD_BANK_BASE = 'https://api.worldbank.org/v2';
  private readonly COMTRADE_BASE = 'https://comtradeapi.un.org/data/v1/get';
  private readonly OECD_BASE = 'https://stats.oecd.org/SDMX-JSON/data';

  /**
   * Fetch historical trade data across multiple years from World Bank
   */
  async fetchHistoricalTradeData(countryCodes: string[], startYear: number = 2015, endYear: number = 2023): Promise<{ [year: number]: TradeMetrics[] }> {
    try {
      const cacheKey = `historical-trade-${countryCodes.join('-')}-${startYear}-${endYear}`;
      const cached = apiCache.get(cacheKey);
      if (cached) return cached;

      const indicators = {
        exports: 'NE.EXP.GNFS.CD',
        imports: 'NE.IMP.GNFS.CD',
        gdp: 'NY.GDP.MKTP.CD',
        population: 'SP.POP.TOTL'
      };

      const countryString = countryCodes.join(';');
      
      const fetchWithRetry = async (url: string, retries = 3): Promise<any> => {
        for (let i = 0; i < retries; i++) {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
          } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      };

      const requests = Object.entries(indicators).map(async ([key, indicator]) => {
        try {
          const data = await fetchWithRetry(
            `${this.WORLD_BANK_BASE}/country/${countryString}/indicator/${indicator}?format=json&date=${startYear}:${endYear}&per_page=2000`
          );
          return { [key]: data[1] || [] };
        } catch (error) {
          console.warn(`Failed to fetch ${key} data:`, error);
          return { [key]: [] };
        }
      });

      const responses = await Promise.all(requests);
      const combinedData = responses.reduce((acc, curr) => ({ ...acc, ...curr }), {});

      // Process data keeping all years
      const historicalData = this.processWorldBankHistoricalData(combinedData as WorldBankResponse);
      
      apiCache.set(cacheKey, historicalData);
      console.log('Fetched historical trade data:', Object.keys(historicalData).length, 'years');
      
      return historicalData;
    } catch (error) {
      console.error('Error fetching historical trade data:', error);
      return {};
    }
  }

  /**
   * Fetch comprehensive trade data from World Bank (most recent year)
   */
  async fetchWorldBankTradeData(countryCodes: string[], startYear: number = 2020): Promise<TradeMetrics[]> {
    try {
      const indicators = {
        exports: 'NE.EXP.GNFS.CD', // Exports of goods and services (current US$)
        imports: 'NE.IMP.GNFS.CD', // Imports of goods and services (current US$)
        gdp: 'NY.GDP.MKTP.CD',     // GDP (current US$)
        population: 'SP.POP.TOTL'   // Population, total
      };

      const countryString = countryCodes.join(';');
      
      // Add retry logic and better error handling
      const fetchWithRetry = async (url: string, retries = 3): Promise<any> => {
        for (let i = 0; i < retries; i++) {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
          } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
          }
        }
      };

      const requests = Object.entries(indicators).map(async ([key, indicator]) => {
        try {
          const data = await fetchWithRetry(
            `${this.WORLD_BANK_BASE}/country/${countryString}/indicator/${indicator}?format=json&date=${startYear}:2023&per_page=1000`
          );
          return { [key]: data[1] || [] };
        } catch (error) {
          console.warn(`Failed to fetch ${key} data:`, error);
          return { [key]: [] };
        }
      });

      const responses = await Promise.all(requests);
      const combinedData = responses.reduce((acc, curr) => ({ ...acc, ...curr }), {});

      return this.processWorldBankData(combinedData as WorldBankResponse);
    } catch (error) {
      console.error('Error fetching World Bank data:', error);
      throw new Error('Failed to fetch trade data from World Bank');
    }
  }

  /**
   * Fetch real export/import categories from UN Comtrade
   */
  async fetchTradeCategories(countryCode: string, year: number = 2022): Promise<{ exports: string[], imports: string[] }> {
    try {
      const cacheKey = `categories-${countryCode}-${year}`;
      const cached = apiCache.get(cacheKey);
      if (cached) return cached;

      // Fetch top export and import categories using HS codes
      // Try different years if current year fails
      const yearsToTry = [year, year - 1, year - 2];
      let exportData = null;
      let importData = null;

      for (const tryYear of yearsToTry) {
        try {
          const [exportResponse, importResponse] = await Promise.all([
            fetch(`${this.COMTRADE_BASE}/C/A/${tryYear}?reporterCode=${countryCode}&partnerCode=0&cmdCode=AG2&flowCode=X&format=json&maxRecords=8`, {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'TradingPlacesApp/1.0'
              }
            }),
            fetch(`${this.COMTRADE_BASE}/C/A/${tryYear}?reporterCode=${countryCode}&partnerCode=0&cmdCode=AG2&flowCode=M&format=json&maxRecords=8`, {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'TradingPlacesApp/1.0'
              }
            })
          ]);

          if (exportResponse.ok && importResponse.ok) {
            exportData = await exportResponse.json();
            importData = await importResponse.json();
            break; // Success, exit loop
          } else if (exportResponse.status === 429 || importResponse.status === 429) {
            console.warn('UN Comtrade rate limit reached, using fallback data');
            break; // Rate limited, stop trying
          }
        } catch (error) {
          console.warn(`Failed to fetch categories for ${tryYear}:`, error);
          continue; // Try next year
        }
      }

      // Process the fetched data
      const result = {
        exports: exportData?.data?.slice(0, 5).map((item: any) => item.cmdDesc || 'Unknown') || [],
        imports: importData?.data?.slice(0, 5).map((item: any) => item.cmdDesc || 'Unknown') || []
      };

      apiCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching trade categories:', error);
      return { exports: [], imports: [] };
    }
  }

  /**
   * Calculate real growth rates from historical World Bank data
   */
  async fetchGrowthRates(countryCodes: string[]): Promise<{ [key: string]: { exportGrowth: number, importGrowth: number } }> {
    try {
      const cacheKey = `growth-rates-${countryCodes.join('-')}`;
      const cached = apiCache.get(cacheKey);
      if (cached) return cached;

      const countryString = countryCodes.join(';');
      const currentYear = new Date().getFullYear() - 1; // Most recent complete year
      const previousYear = currentYear - 1;

      const [currentData, previousData] = await Promise.all([
        fetch(`${this.WORLD_BANK_BASE}/country/${countryString}/indicator/NE.EXP.GNFS.CD;NE.IMP.GNFS.CD?format=json&date=${currentYear}&per_page=1000`),
        fetch(`${this.WORLD_BANK_BASE}/country/${countryString}/indicator/NE.EXP.GNFS.CD;NE.IMP.GNFS.CD?format=json&date=${previousYear}&per_page=1000`)
      ]);

      const [current, previous] = await Promise.all([
        currentData.json(),
        previousData.json()
      ]);

      const result = this.calculateGrowthRates(current[1] || [], previous[1] || []);
      apiCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching growth rates:', error);
      return {};
    }
  }

  /**
   * Fetch Economic Complexity Index (real diversification data)
   */
  async fetchEconomicComplexity(countryCodes: string[]): Promise<{ [key: string]: number }> {
    try {
      const cacheKey = `complexity-${countryCodes.join('-')}`;
      const cached = apiCache.get(cacheKey);
      if (cached) return cached;

      // Harvard's Atlas of Economic Complexity API (if available)
      // For now, calculate from trade partner diversity
      const result: { [key: string]: number } = {};
      
      for (const countryCode of countryCodes) {
        try {
          const partnerData = await this.fetchComtradePartnerData(countryCode);
          result[countryCode] = this.calculateDiversificationFromPartners(partnerData);
        } catch (error) {
          result[countryCode] = 0.5; // Default value
        }
      }

      apiCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching economic complexity:', error);
      return {};
    }
  }

  /**
   * Fetch historical trade partner data from UN Comtrade for multiple years
   */
  async fetchHistoricalComtradeData(countryCode: string, startYear: number = 2015, endYear: number = 2022): Promise<{ [year: number]: any[] }> {
    try {
      const cacheKey = `comtrade-historical-${countryCode}-${startYear}-${endYear}`;
      const cached = apiCache.get(cacheKey);
      if (cached) return cached;

      const historicalData: { [year: number]: any[] } = {};
      const yearsToFetch = [];
      
      // Generate array of years to fetch
      for (let year = endYear; year >= startYear && yearsToFetch.length < 5; year--) {
        yearsToFetch.push(year);
      }

      // Fetch data for each year (with rate limiting consideration)
      for (const year of yearsToFetch) {
        try {
          const response = await fetch(
            `${this.COMTRADE_BASE}/C/A/${year}?reporterCode=${countryCode}&partnerCode=all&cmdCode=TOTAL&flowCode=X,M&format=json&maxRecords=20`,
            {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'TradingPlacesApp/1.0'
              }
            }
          );
          
          if (!response.ok) {
            if (response.status === 429) {
              console.warn('Comtrade rate limit reached, stopping historical fetch');
              break;
            }
            continue;
          }

          const data: ComtradeResponse = await response.json();
          historicalData[year] = this.processComtradeData(data);
          
          // Rate limiting: wait 1 second between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.warn(`Failed to fetch Comtrade data for ${year}:`, error);
        }
      }

      apiCache.set(cacheKey, historicalData);
      return historicalData;
    } catch (error) {
      console.error('Error fetching historical Comtrade data:', error);
      return {};
    }
  }

  /**
   * Fetch detailed trade partner data from UN Comtrade
   */
  async fetchComtradePartnerData(countryCode: string, year: number = 2022): Promise<any[]> {
    try {
      // UN Comtrade has rate limits, so we need to be careful
      const cacheKey = `comtrade-${countryCode}-${year}`;
      const cached = apiCache.get(cacheKey);
      if (cached) return cached;

      // Try current year first, then fallback to previous years
      const yearsToTry = [year, year - 1, year - 2];
      
      for (const tryYear of yearsToTry) {
        try {
          const response = await fetch(
            `${this.COMTRADE_BASE}/C/A/${tryYear}?reporterCode=${countryCode}&partnerCode=all&cmdCode=TOTAL&flowCode=X,M&format=json&maxRecords=20`,
            {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'TradingPlacesApp/1.0'
              }
            }
          );
          
          if (!response.ok) {
            if (response.status === 429) {
              console.warn('Comtrade rate limit reached, using cache or fallback');
              break;
            }
            continue; // Try next year
          }

          const data: ComtradeResponse = await response.json();
          const processedData = this.processComtradeData(data);
          
          // Cache successful results
          apiCache.set(cacheKey, processedData);
          return processedData;
        } catch (error) {
          console.warn(`Failed to fetch Comtrade data for ${tryYear}:`, error);
          continue;
        }
      }
      
      // Return empty array if all attempts fail
      return [];
    } catch (error) {
      console.error('Error fetching Comtrade data:', error);
      return []; // Return empty array instead of throwing
    }
  }

  /**
   * Fetch OECD trade indicators
   */
  async fetchOECDTradeIndicators(countryCodes: string[]): Promise<any> {
    try {
      const countryString = countryCodes.join('+');
      const response = await fetch(
        `${this.OECD_BASE}/MEI_TRADE/${countryString}.all?format=json&startTime=2020&endTime=2023`
      );
      
      if (!response.ok) {
        throw new Error(`OECD API error: ${response.status}`);
      }

      const data = await response.json();
      return this.processOECDData(data);
    } catch (error) {
      console.error('Error fetching OECD data:', error);
      return null; // OECD data is supplementary
    }
  }

  /**
   * Get real tariff data from WTO/Trading Economics
   */
  async fetchTariffData(countryCode: string): Promise<any> {
    try {
      // Note: This would require a Trading Economics API key
      // const response = await fetch(
      //   `https://api.tradingeconomics.com/tariff/country/${countryCode}?c=YOUR_API_KEY`
      // );
      
      // For now, return enhanced mock data based on real patterns
      return this.getRealTariffPatterns(countryCode);
    } catch (error) {
      console.error('Error fetching tariff data:', error);
      return this.getRealTariffPatterns(countryCode);
    }
  }

  /**
   * Process World Bank historical data keeping all years
   */
  private processWorldBankHistoricalData(data: WorldBankResponse): { [year: number]: TradeMetrics[] } {
    const yearData: { [year: number]: { [countryCode: string]: Partial<TradeMetrics> } } = {};

    // Process each indicator
    Object.entries(data).forEach(([indicator, values]) => {
      values.forEach(item => {
        if (!item.value) return;

        const countryCode = item.countryiso3code;
        const year = parseInt(item.date);
        
        if (!yearData[year]) {
          yearData[year] = {};
        }
        
        if (!yearData[year][countryCode]) {
          yearData[year][countryCode] = {
            country: item.country.value,
            countryCode: item.countryiso3code,
            year: year
          };
        }

        switch (indicator) {
          case 'exports':
            yearData[year][countryCode].exports = item.value / 1e9;
            break;
          case 'imports':
            yearData[year][countryCode].imports = item.value / 1e9;
            break;
          case 'gdp':
            yearData[year][countryCode].gdp = item.value / 1e12;
            break;
          case 'population':
            yearData[year][countryCode].population = item.value / 1e6;
            break;
        }
      });
    });

    // Convert to final format with calculated metrics
    const result: { [year: number]: TradeMetrics[] } = {};
    
    Object.entries(yearData).forEach(([year, countries]) => {
      result[parseInt(year)] = Object.values(countries)
        .filter(country => country.exports && country.imports && country.gdp)
        .map(country => ({
          ...country,
          tradeBalance: (country.exports! - country.imports!),
          tradeIntensity: ((country.exports! + country.imports!) / country.gdp!) * 100
        } as TradeMetrics));
    });

    return result;
  }

  /**
   * Process World Bank data into our format
   * Groups by country and uses the most recent year's data
   */
  private processWorldBankData(data: WorldBankResponse): TradeMetrics[] {
    // First, group all data by country and year
    const countryYearData: { [key: string]: { [year: number]: Partial<TradeMetrics> } } = {};

    // Process each indicator
    Object.entries(data).forEach(([indicator, values]) => {
      values.forEach(item => {
        if (!item.value) return;

        const countryCode = item.countryiso3code;
        const year = parseInt(item.date);
        
        if (!countryYearData[countryCode]) {
          countryYearData[countryCode] = {};
        }
        
        if (!countryYearData[countryCode][year]) {
          countryYearData[countryCode][year] = {
            country: item.country.value,
            countryCode: item.countryiso3code,
            year: year
          };
        }

        switch (indicator) {
          case 'exports':
            countryYearData[countryCode][year].exports = item.value / 1e9; // Convert to billions
            break;
          case 'imports':
            countryYearData[countryCode][year].imports = item.value / 1e9;
            break;
          case 'gdp':
            countryYearData[countryCode][year].gdp = item.value / 1e12; // Convert to trillions
            break;
          case 'population':
            countryYearData[countryCode][year].population = item.value / 1e6; // Convert to millions
            break;
        }
      });
    });

    // For each country, get the most recent year with complete data
    const countries: TradeMetrics[] = [];
    
    Object.entries(countryYearData).forEach(([countryCode, yearData]) => {
      // Sort years in descending order (most recent first)
      const years = Object.keys(yearData).map(Number).sort((a, b) => b - a);
      
      // Find the most recent year with complete data (exports, imports, and GDP)
      for (const year of years) {
        const data = yearData[year];
        if (data.exports && data.imports && data.gdp) {
          countries.push({
            ...data,
            tradeBalance: (data.exports - data.imports),
            tradeIntensity: ((data.exports + data.imports) / data.gdp) * 100
          } as TradeMetrics);
          break; // Use the first (most recent) complete data
        }
      }
    });

    console.log('Processed World Bank data:', countries.map(c => ({
      country: c.country,
      countryCode: c.countryCode,
      year: c.year,
      exports: c.exports,
      imports: c.imports,
      gdp: c.gdp
    })));

    return countries;
  }

  /**
   * Process UN Comtrade data for trading partners
   */
  private processComtradeData(data: ComtradeResponse): any[] {
    if (!data.data || data.data.length === 0) return [];

    // Group by partner and sum exports + imports
    const partnerMap = new Map<string, { exports: number; imports: number }>();
    
    data.data
      .filter(item => item.partnerDesc !== 'World' && item.partnerDesc !== 'Areas, nes')
      .forEach(item => {
        const partner = item.partnerDesc;
        const value = item.primaryValue || 0;
        
        if (!partnerMap.has(partner)) {
          partnerMap.set(partner, { exports: 0, imports: 0 });
        }
        
        const current = partnerMap.get(partner)!;
        if (item.flowDesc === 'Export') {
          current.exports += value;
        } else if (item.flowDesc === 'Import') {
          current.imports += value;
        }
      });

    // Calculate total trade and shares
    const totalTrade = Array.from(partnerMap.values())
      .reduce((sum, partner) => sum + partner.exports + partner.imports, 0);

    return Array.from(partnerMap.entries())
      .map(([country, trade]) => ({
        country,
        tradeVolume: (trade.exports + trade.imports) / 1e9, // Convert to billions
        balance: (trade.exports - trade.imports) / 1e9,
        share: totalTrade > 0 ? ((trade.exports + trade.imports) / totalTrade) * 100 : 0
      }))
      .sort((a, b) => b.tradeVolume - a.tradeVolume)
      .slice(0, 10); // Top 10 partners
  }

  /**
   * Process OECD data for advanced indicators
   */
  private processOECDData(data: any): any {
    // OECD data processing would go here
    // This is complex due to OECD's SDMX format
    return data;
  }

  /**
   * Enhanced tariff data based on real patterns
   */
  private getRealTariffPatterns(countryCode: string): any {
    const realTariffData: { [key: string]: any } = {
      US: {
        averageMFN: 3.4, // Most Favored Nation rate
        averageApplied: 2.0,
        sectorTariffs: [
          { sector: "Agricultural products", mfn: 5.2, applied: 5.2 },
          { sector: "Non-agricultural products", mfn: 3.2, applied: 1.8 },
          { sector: "Textiles and clothing", mfn: 11.4, applied: 11.4 },
          { sector: "Steel", mfn: 0.0, applied: 25.0 }, // Trade war tariff
          { sector: "Aluminum", mfn: 0.0, applied: 10.0 }
        ]
      },
      CN: {
        averageMFN: 7.4,
        averageApplied: 7.4,
        sectorTariffs: [
          { sector: "Agricultural products", mfn: 15.6, applied: 15.6 },
          { sector: "Non-agricultural products", mfn: 6.8, applied: 6.8 },
          { sector: "Textiles and clothing", mfn: 16.2, applied: 16.2 },
          { sector: "US Soybeans", mfn: 3.0, applied: 25.0 }, // Retaliatory tariff
          { sector: "US Automobiles", mfn: 25.0, applied: 40.0 }
        ]
      },
      // Add more countries as needed
    };

    return realTariffData[countryCode] || { averageMFN: 0, averageApplied: 0, sectorTariffs: [] };
  }

  /**
   * Calculate growth rates from historical data
   */
  private calculateGrowthRates(currentData: any[], previousData: any[]): { [key: string]: { exportGrowth: number, importGrowth: number } } {
    const result: { [key: string]: { exportGrowth: number, importGrowth: number } } = {};

    currentData.forEach(currentItem => {
      const countryCode = currentItem.countryiso3code;
      if (!result[countryCode]) {
        result[countryCode] = { exportGrowth: 0, importGrowth: 0 };
      }

      const previousItem = previousData.find(item => 
        item.countryiso3code === countryCode && 
        item.indicator.id === currentItem.indicator.id
      );

      if (previousItem && previousItem.value && currentItem.value) {
        const growth = ((currentItem.value - previousItem.value) / previousItem.value) * 100;
        
        if (currentItem.indicator.id === 'NE.EXP.GNFS.CD') {
          result[countryCode].exportGrowth = growth;
        } else if (currentItem.indicator.id === 'NE.IMP.GNFS.CD') {
          result[countryCode].importGrowth = growth;
        }
      }
    });

    return result;
  }

  /**
   * Calculate diversification index from trading partners
   */
  private calculateDiversificationFromPartners(partnerData: any[]): number {
    if (!partnerData.length) return 0.5;
    
    const totalTrade = partnerData.reduce((sum, partner) => sum + partner.tradeVolume, 0);
    if (totalTrade === 0) return 0.5;
    
    const shares = partnerData.map(partner => partner.tradeVolume / totalTrade);
    
    // Calculate Herfindahl-Hirschman Index
    const hhi = shares.reduce((sum, share) => sum + (share * share), 0);
    
    // Convert to diversification index (higher = more diversified)
    return Math.max(0, Math.min(1, 1 - hhi));
  }

  /**
   * Fetch comprehensive data for a country with enhanced real data
   */
  async fetchCountryTradeProfile(countryCode: string): Promise<any> {
    try {
      const [worldBankData, comtradeData, categoriesData, tariffData] = await Promise.allSettled([
        this.fetchWorldBankTradeData([countryCode]),
        this.fetchComtradePartnerData(countryCode),
        this.fetchTradeCategories(countryCode),
        this.fetchTariffData(countryCode)
      ]);

      return {
        basicMetrics: worldBankData.status === 'fulfilled' ? worldBankData.value[0] : null,
        tradingPartners: comtradeData.status === 'fulfilled' ? comtradeData.value : [],
        tradeCategories: categoriesData.status === 'fulfilled' ? categoriesData.value : { exports: [], imports: [] },
        tariffInfo: tariffData.status === 'fulfilled' ? tariffData.value : null,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching country trade profile:', error);
      throw error;
    }
  }

  /**
   * Get real-time trade war updates (would require news/trading APIs)
   */
  async fetchTradeWarUpdates(): Promise<any[]> {
    try {
      // This would integrate with news APIs or specialized trade APIs
      // For example: Trading Economics, Reuters, or Bloomberg APIs
      
      return [
        {
          title: "US-China Trade Relations Update",
          date: new Date().toISOString(),
          impact: "Medium",
          description: "Latest developments in bilateral trade discussions",
          source: "Trading Economics"
        }
      ];
    } catch (error) {
      console.error('Error fetching trade war updates:', error);
      return [];
    }
  }

  /**
   * Fetch comprehensive historical trade data from multiple sources
   * Combines World Bank, UN Comtrade for a complete picture
   */
  async fetchComprehensiveHistoricalData(
    countryCodes: string[], 
    startYear: number = 2015, 
    endYear: number = 2023
  ): Promise<{
    yearlyData: { [year: number]: TradeMetrics[] };
    trends: { [countryCode: string]: any };
    globalTrends: any;
  }> {
    try {
      console.log(`Fetching comprehensive historical data for ${countryCodes.length} countries from ${startYear} to ${endYear}`);
      
      // Fetch World Bank historical data (primary source)
      const worldBankHistorical = await this.fetchHistoricalTradeData(countryCodes, startYear, endYear);
      
      // Calculate trends for each country
      const trends: { [countryCode: string]: any } = {};
      
      countryCodes.forEach(code => {
        const mappedCode = COUNTRY_MAPPINGS[code] || code;
        const countryYearlyData: any[] = [];
        
        // Collect data for this country across all years
        Object.entries(worldBankHistorical).forEach(([year, countries]) => {
          const countryData = countries.find(c => c.countryCode === mappedCode);
          if (countryData) {
            countryYearlyData.push({
              year: parseInt(year),
              exports: countryData.exports,
              imports: countryData.imports,
              tradeBalance: countryData.tradeBalance,
              gdp: countryData.gdp,
              tradeIntensity: countryData.tradeIntensity
            });
          }
        });
        
        // Sort by year
        countryYearlyData.sort((a, b) => a.year - b.year);
        
        // Calculate trend statistics
        if (countryYearlyData.length > 1) {
          const firstYear = countryYearlyData[0];
          const lastYear = countryYearlyData[countryYearlyData.length - 1];
          
          trends[code] = {
            data: countryYearlyData,
            exportGrowthTotal: firstYear.exports > 0 
              ? ((lastYear.exports - firstYear.exports) / firstYear.exports) * 100 
              : 0,
            importGrowthTotal: firstYear.imports > 0 
              ? ((lastYear.imports - firstYear.imports) / firstYear.imports) * 100 
              : 0,
            averageExports: countryYearlyData.reduce((sum, d) => sum + d.exports, 0) / countryYearlyData.length,
            averageImports: countryYearlyData.reduce((sum, d) => sum + d.imports, 0) / countryYearlyData.length,
            yearsWithData: countryYearlyData.length
          };
        }
      });
      
      // Calculate global trends
      const globalTrends = {
        totalYears: Object.keys(worldBankHistorical).length,
        yearRange: { start: startYear, end: endYear },
        totalWorldTradeByYear: {} as { [year: number]: number },
        topExportersByYear: {} as { [year: number]: string[] }
      };
      
      Object.entries(worldBankHistorical).forEach(([year, countries]) => {
        const totalTrade = countries.reduce((sum, c) => sum + c.exports + c.imports, 0);
        globalTrends.totalWorldTradeByYear[parseInt(year)] = totalTrade;
        
        const topExporters = countries
          .sort((a, b) => b.exports - a.exports)
          .slice(0, 5)
          .map(c => c.country);
        globalTrends.topExportersByYear[parseInt(year)] = topExporters;
      });
      
      console.log('Historical data fetched successfully:', {
        years: Object.keys(worldBankHistorical).length,
        countries: countryCodes.length,
        trendsCalculated: Object.keys(trends).length
      });
      
      return {
        yearlyData: worldBankHistorical,
        trends,
        globalTrends
      };
    } catch (error) {
      console.error('Error fetching comprehensive historical data:', error);
      return {
        yearlyData: {},
        trends: {},
        globalTrends: { totalYears: 0, yearRange: { start: startYear, end: endYear }, totalWorldTradeByYear: {}, topExportersByYear: {} }
      };
    }
  }
}

export const tradeDataService = new TradeDataService();

// Country code mappings for different APIs
export const COUNTRY_MAPPINGS = {
  // ISO 3166-1 alpha-2 to alpha-3 mappings
  US: 'USA',
  CN: 'CHN', 
  DE: 'DEU',
  JP: 'JPN',
  GB: 'GBR',
  IN: 'IND',
  BR: 'BRA',
  KR: 'KOR',
  CA: 'CAN',
  AU: 'AUS',
  MX: 'MEX',
  RU: 'RUS',
  SA: 'SAU'
};

// API rate limiting and caching utilities
export class APICache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new APICache();
