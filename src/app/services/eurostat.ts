import axios from "axios";
import { clientCache } from "./clientCache";

/**
 * Eurostat Service
 * Provides EU technology and R&D statistics
 * Data source: https://ec.europa.eu/eurostat/
 * API docs: https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access
 */

// Country code mapping for Eurostat (uses ISO 2-letter codes)
// Only EU and associated countries
const EUROSTAT_COUNTRY_CODES: { [key: string]: string } = {
  // EU Member States
  France: 'FR',
  Germany: 'DE',
  Italy: 'IT',
  Spain: 'ES',
  Netherlands: 'NL',
  Belgium: 'BE',
  Portugal: 'PT',
  Poland: 'PL',
  Sweden: 'SE',
  // Non-EU but in Eurostat
  UK: 'UK', // Historical data before Brexit
  Norway: 'NO',
  Switzerland: 'CH',
  Turkey: 'TR',
};

// Eurostat dataset codes for technology indicators
const EUROSTAT_DATASETS = {
  // R&D expenditure as % of GDP
  RD_EXPENDITURE: 'rd_e_gerdtot',
  // R&D personnel
  RD_PERSONNEL: 'rd_p_persocc',
  // High-tech exports
  HIGHTECH_EXPORTS: 'htec_si_exp4',
  // Patent applications to EPO
  PATENTS_EPO: 'pat_ep_ntot',
  // Internet usage
  INTERNET_USE: 'isoc_ci_ifp_iu',
};

export interface EurostatDataPoint {
  country: string;
  year: number;
  value: number;
}

export interface EurostatTechData {
  rdSpending: { [country: string]: EurostatDataPoint[] };
  researchers: { [country: string]: EurostatDataPoint[] };
  hightechExports: { [country: string]: EurostatDataPoint[] };
  patents: { [country: string]: EurostatDataPoint[] };
  internetUsers: { [country: string]: EurostatDataPoint[] };
}

/**
 * Parse Eurostat JSON-stat response
 */
function parseEurostatResponse(data: any, countryMap: { [code: string]: string }): { [country: string]: EurostatDataPoint[] } {
  const results: { [country: string]: EurostatDataPoint[] } = {};
  
  try {
    if (!data || !data.value || !data.dimension) {
      return results;
    }
    
    const values = data.value;
    const dimensions = data.dimension;
    
    // Get dimension indices
    const geoIndex = data.id.indexOf('geo');
    const timeIndex = data.id.indexOf('time');
    
    if (geoIndex === -1 || timeIndex === -1) {
      return results;
    }
    
    const geoCategories = dimensions.geo?.category?.index || {};
    const timeCategories = dimensions.time?.category?.index || {};
    
    const geoLabels = dimensions.geo?.category?.label || {};
    const timeLabels = dimensions.time?.category?.label || {};
    
    // Calculate sizes for index calculation
    const sizes = data.size || [];
    
    // Iterate through values
    Object.entries(values).forEach(([index, value]) => {
      if (value === null || value === undefined) return;
      
      const idx = parseInt(index);
      
      // Calculate geo and time indices based on position
      let remaining = idx;
      const indices: number[] = [];
      
      for (let i = sizes.length - 1; i >= 0; i--) {
        indices.unshift(remaining % sizes[i]);
        remaining = Math.floor(remaining / sizes[i]);
      }
      
      const geoIdx = indices[geoIndex];
      const timeIdx = indices[timeIndex];
      
      // Find geo code from index
      const geoCode = Object.entries(geoCategories).find(([, v]) => v === geoIdx)?.[0];
      const timeCode = Object.entries(timeCategories).find(([, v]) => v === timeIdx)?.[0];
      
      if (!geoCode || !timeCode) return;
      
      // Map Eurostat country code to our country name
      const countryName = Object.entries(countryMap).find(([, code]) => code === geoCode)?.[0];
      
      if (!countryName) return;
      
      const year = parseInt(timeCode);
      if (isNaN(year)) return;
      
      if (!results[countryName]) {
        results[countryName] = [];
      }
      
      results[countryName].push({
        country: countryName,
        year,
        value: Number(value)
      });
    });
    
    // Sort by year
    Object.keys(results).forEach(country => {
      results[country].sort((a, b) => a.year - b.year);
    });
    
  } catch (error) {
    console.error('Error parsing Eurostat response:', error);
  }
  
  return results;
}

/**
 * Fetch R&D expenditure data from Eurostat
 */
export async function fetchEurostatRDSpending(): Promise<{ [country: string]: EurostatDataPoint[] }> {
  try {
    const cacheKey = 'eurostat_rd_spending';
    const cached = clientCache.get<{ [country: string]: EurostatDataPoint[] }>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached Eurostat R&D spending data');
      return cached;
    }

    console.log('🔬🇪🇺 Fetching Eurostat R&D expenditure...');
    
    const countries = Object.values(EUROSTAT_COUNTRY_CODES).join('+');
    const url = `/api/eurostat?dataset=${EUROSTAT_DATASETS.RD_EXPENDITURE}&geo=${countries}&sectperf=TOTAL&unit=PC_GDP`;
    
    const response = await axios.get(url, { timeout: 30000 });
    
    const results = parseEurostatResponse(response.data, EUROSTAT_COUNTRY_CODES);
    
    if (Object.keys(results).length > 0) {
      clientCache.set(cacheKey, results, 1000 * 60 * 60 * 24);
      console.log(`✅ Eurostat R&D: ${Object.keys(results).length} countries`);
    }
    
    return results;
  } catch (error: any) {
    console.error('❌ Eurostat R&D error:', error.message);
    return {};
  }
}

/**
 * Fetch patent data from Eurostat (EPO applications)
 */
export async function fetchEurostatPatents(): Promise<{ [country: string]: EurostatDataPoint[] }> {
  try {
    const cacheKey = 'eurostat_patents';
    const cached = clientCache.get<{ [country: string]: EurostatDataPoint[] }>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached Eurostat patent data');
      return cached;
    }

    console.log('🔬🇪🇺 Fetching Eurostat patent data...');
    
    const countries = Object.values(EUROSTAT_COUNTRY_CODES).join('+');
    const url = `/api/eurostat?dataset=${EUROSTAT_DATASETS.PATENTS_EPO}&geo=${countries}`;
    
    const response = await axios.get(url, { timeout: 30000 });
    
    const results = parseEurostatResponse(response.data, EUROSTAT_COUNTRY_CODES);
    
    if (Object.keys(results).length > 0) {
      clientCache.set(cacheKey, results, 1000 * 60 * 60 * 24);
      console.log(`✅ Eurostat Patents: ${Object.keys(results).length} countries`);
    }
    
    return results;
  } catch (error: any) {
    console.error('❌ Eurostat Patents error:', error.message);
    return {};
  }
}

/**
 * Fetch high-tech exports data from Eurostat
 */
export async function fetchEurostatHightechExports(): Promise<{ [country: string]: EurostatDataPoint[] }> {
  try {
    const cacheKey = 'eurostat_hightech_exports';
    const cached = clientCache.get<{ [country: string]: EurostatDataPoint[] }>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached Eurostat high-tech exports data');
      return cached;
    }

    console.log('🔬🇪🇺 Fetching Eurostat high-tech exports...');
    
    const countries = Object.values(EUROSTAT_COUNTRY_CODES).join('+');
    const url = `/api/eurostat?dataset=${EUROSTAT_DATASETS.HIGHTECH_EXPORTS}&geo=${countries}`;
    
    const response = await axios.get(url, { timeout: 30000 });
    
    const results = parseEurostatResponse(response.data, EUROSTAT_COUNTRY_CODES);
    
    if (Object.keys(results).length > 0) {
      clientCache.set(cacheKey, results, 1000 * 60 * 60 * 24);
      console.log(`✅ Eurostat High-tech Exports: ${Object.keys(results).length} countries`);
    }
    
    return results;
  } catch (error: any) {
    console.error('❌ Eurostat High-tech Exports error:', error.message);
    return {};
  }
}

/**
 * Fetch all Eurostat technology data
 */
export async function fetchEurostatTechnologyData(): Promise<EurostatTechData> {
  try {
    const cacheKey = 'eurostat_tech_data';
    const cached = clientCache.get<EurostatTechData>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached Eurostat technology data');
      return cached;
    }

    console.log('🔬🇪🇺 ========================================');
    console.log('🔬🇪🇺 Eurostat: Fetching technology data...');
    console.log('🔬🇪🇺 ========================================');

    const [rdSpending, patents, hightechExports] = await Promise.all([
      fetchEurostatRDSpending(),
      fetchEurostatPatents(),
      fetchEurostatHightechExports()
    ]);

    const results: EurostatTechData = {
      rdSpending,
      researchers: {}, // Can be added later
      hightechExports,
      patents,
      internetUsers: {} // Can be added later
    };

    clientCache.set(cacheKey, results, 1000 * 60 * 60 * 24);

    console.log('🔬🇪🇺 ========================================');
    console.log('🔬🇪🇺 Eurostat Technology Data Summary:');
    console.log(`   - R&D Spending: ${Object.keys(rdSpending).length} countries`);
    console.log(`   - Patents: ${Object.keys(patents).length} countries`);
    console.log(`   - High-tech Exports: ${Object.keys(hightechExports).length} countries`);
    console.log('🔬🇪🇺 ========================================');

    return results;
  } catch (error: any) {
    console.error('❌ Eurostat: Error fetching technology data:', error.message);
    return {
      rdSpending: {},
      researchers: {},
      hightechExports: {},
      patents: {},
      internetUsers: {}
    };
  }
}

// Clear Eurostat cache
export function clearEurostatCache(): void {
  clientCache.delete('eurostat_tech_data');
  clientCache.delete('eurostat_rd_spending');
  clientCache.delete('eurostat_patents');
  clientCache.delete('eurostat_hightech_exports');
  console.log('✅ Cleared Eurostat cached data');
}
