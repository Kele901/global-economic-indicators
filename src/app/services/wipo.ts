import axios from "axios";
import { clientCache } from "./clientCache";

/**
 * WIPO (World Intellectual Property Organization) Service
 * Provides global patent and trademark statistics
 * Data source: https://www.wipo.int/ipstats/
 */

// Country code mapping for WIPO (uses ISO 2-letter codes)
const WIPO_COUNTRY_CODES: { [key: string]: string } = {
  USA: 'US',
  Canada: 'CA',
  UK: 'GB',
  France: 'FR',
  Germany: 'DE',
  Italy: 'IT',
  Japan: 'JP',
  Australia: 'AU',
  Mexico: 'MX',
  SouthKorea: 'KR',
  Spain: 'ES',
  Sweden: 'SE',
  Switzerland: 'CH',
  Turkey: 'TR',
  Chile: 'CL',
  Norway: 'NO',
  Netherlands: 'NL',
  Portugal: 'PT',
  Belgium: 'BE',
  Poland: 'PL',
  China: 'CN',
  Russia: 'RU',
  Brazil: 'BR',
  India: 'IN',
  Indonesia: 'ID',
  SouthAfrica: 'ZA',
  Argentina: 'AR',
  SaudiArabia: 'SA',
  Nigeria: 'NG',
  Egypt: 'EG',
};

export interface WIPODataPoint {
  country: string;
  year: number;
  value: number;
}

export interface WIPOTechData {
  patentApplications: { [country: string]: WIPODataPoint[] };
  patentGrants: { [country: string]: WIPODataPoint[] };
  trademarkApplications: { [country: string]: WIPODataPoint[] };
}

/**
 * Fetch patent statistics from WIPO
 * WIPO provides comprehensive global patent data
 */
export async function fetchWIPOPatentData(): Promise<WIPOTechData> {
  try {
    const cacheKey = 'wipo_patent_data';
    const cached = clientCache.get<WIPOTechData>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached WIPO patent data');
      return cached;
    }

    console.log('🔬📜 ========================================');
    console.log('🔬📜 WIPO: Fetching patent statistics...');
    console.log('🔬📜 ========================================');

    const results: WIPOTechData = {
      patentApplications: {},
      patentGrants: {},
      trademarkApplications: {}
    };

    // Fetch data via our API route
    const countries = Object.keys(WIPO_COUNTRY_CODES);
    
    for (const country of countries) {
      try {
        const countryCode = WIPO_COUNTRY_CODES[country];
        
        // Fetch patent applications
        const patentUrl = `/api/wipo?indicator=patent_applications&country=${countryCode}`;
        
        const patentResponse = await axios.get(patentUrl, { timeout: 15000 });
        
        if (patentResponse.data?.data && patentResponse.data.data.length > 0) {
          results.patentApplications[country] = patentResponse.data.data.map((item: any) => ({
            country,
            year: item.year,
            value: item.value
          }));
          console.log(`✅ WIPO Patents: ${country} - ${patentResponse.data.data.length} years`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error: any) {
        if (error.response?.status !== 404) {
          // Silently continue - WIPO may not have data for all countries
        }
      }
    }
    
    // Cache for 24 hours
    clientCache.set(cacheKey, results, 1000 * 60 * 60 * 24);
    
    console.log('🔬📜 ========================================');
    console.log('🔬📜 WIPO Patent Data Summary:');
    console.log(`   - Patent Applications: ${Object.keys(results.patentApplications).length} countries`);
    console.log(`   - Patent Grants: ${Object.keys(results.patentGrants).length} countries`);
    console.log('🔬📜 ========================================');
    
    return results;
  } catch (error: any) {
    console.error('❌ WIPO: Error fetching patent data:', error.message);
    return {
      patentApplications: {},
      patentGrants: {},
      trademarkApplications: {}
    };
  }
}

// Clear WIPO cache
export function clearWIPOCache(): void {
  clientCache.delete('wipo_patent_data');
  console.log('✅ Cleared WIPO cached data');
}
