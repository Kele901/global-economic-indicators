import axios from "axios";
import { clientCache } from "./clientCache";

/**
 * ITU (International Telecommunication Union) Service
 * Provides global ICT statistics including internet users and mobile subscriptions
 * Data source: https://datahub.itu.int/
 */

// Country code mapping for ITU (uses ISO 3-letter codes)
const ITU_COUNTRY_CODES: { [key: string]: string } = {
  USA: 'USA',
  Canada: 'CAN',
  UK: 'GBR',
  France: 'FRA',
  Germany: 'DEU',
  Italy: 'ITA',
  Japan: 'JPN',
  Australia: 'AUS',
  Mexico: 'MEX',
  SouthKorea: 'KOR',
  Spain: 'ESP',
  Sweden: 'SWE',
  Switzerland: 'CHE',
  Turkey: 'TUR',
  Chile: 'CHL',
  Norway: 'NOR',
  Netherlands: 'NLD',
  Portugal: 'PRT',
  Belgium: 'BEL',
  Poland: 'POL',
  China: 'CHN',
  Russia: 'RUS',
  Brazil: 'BRA',
  India: 'IND',
  Indonesia: 'IDN',
  SouthAfrica: 'ZAF',
  Argentina: 'ARG',
  SaudiArabia: 'SAU',
  Nigeria: 'NGA',
  Egypt: 'EGY',
};

// ITU indicator codes
const ITU_INDICATORS = {
  // Individuals using the Internet (% of population)
  INTERNET_USERS: 'ITU_I',
  // Mobile-cellular subscriptions per 100 inhabitants
  MOBILE_SUBSCRIPTIONS: 'ITU_M',
  // Fixed-broadband subscriptions per 100 inhabitants
  FIXED_BROADBAND: 'ITU_FB',
  // Active mobile-broadband subscriptions per 100 inhabitants
  MOBILE_BROADBAND: 'ITU_MB',
};

export interface ITUDataPoint {
  country: string;
  year: number;
  value: number;
}

export interface ITUTechData {
  internetUsers: { [country: string]: ITUDataPoint[] };
  mobileSubscriptions: { [country: string]: ITUDataPoint[] };
  fixedBroadband: { [country: string]: ITUDataPoint[] };
  mobileBroadband: { [country: string]: ITUDataPoint[] };
}

/**
 * Fetch internet users data from ITU
 */
export async function fetchITUInternetUsers(): Promise<{ [country: string]: ITUDataPoint[] }> {
  try {
    const cacheKey = 'itu_internet_users';
    const cached = clientCache.get<{ [country: string]: ITUDataPoint[] }>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached ITU internet users data');
      return cached;
    }

    console.log('🔬📡 Fetching ITU internet users data...');
    
    const results: { [country: string]: ITUDataPoint[] } = {};
    const countries = Object.keys(ITU_COUNTRY_CODES);
    
    for (const country of countries) {
      try {
        const countryCode = ITU_COUNTRY_CODES[country];
        const url = `/api/itu?indicator=internet_users&country=${countryCode}`;
        
        const response = await axios.get(url, { timeout: 15000 });
        
        if (response.data?.data && response.data.data.length > 0) {
          results[country] = response.data.data.map((item: any) => ({
            country,
            year: item.year,
            value: item.value
          }));
          console.log(`✅ ITU Internet: ${country} - ${response.data.data.length} years`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error: any) {
        // Silently continue
      }
    }
    
    if (Object.keys(results).length > 0) {
      clientCache.set(cacheKey, results, 1000 * 60 * 60 * 24);
    }
    
    return results;
  } catch (error: any) {
    console.error('❌ ITU Internet Users error:', error.message);
    return {};
  }
}

/**
 * Fetch mobile subscriptions data from ITU
 */
export async function fetchITUMobileSubscriptions(): Promise<{ [country: string]: ITUDataPoint[] }> {
  try {
    const cacheKey = 'itu_mobile_subscriptions';
    const cached = clientCache.get<{ [country: string]: ITUDataPoint[] }>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached ITU mobile subscriptions data');
      return cached;
    }

    console.log('🔬📡 Fetching ITU mobile subscriptions data...');
    
    const results: { [country: string]: ITUDataPoint[] } = {};
    const countries = Object.keys(ITU_COUNTRY_CODES);
    
    for (const country of countries) {
      try {
        const countryCode = ITU_COUNTRY_CODES[country];
        const url = `/api/itu?indicator=mobile_subscriptions&country=${countryCode}`;
        
        const response = await axios.get(url, { timeout: 15000 });
        
        if (response.data?.data && response.data.data.length > 0) {
          results[country] = response.data.data.map((item: any) => ({
            country,
            year: item.year,
            value: item.value
          }));
          console.log(`✅ ITU Mobile: ${country} - ${response.data.data.length} years`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error: any) {
        // Silently continue
      }
    }
    
    if (Object.keys(results).length > 0) {
      clientCache.set(cacheKey, results, 1000 * 60 * 60 * 24);
    }
    
    return results;
  } catch (error: any) {
    console.error('❌ ITU Mobile Subscriptions error:', error.message);
    return {};
  }
}

/**
 * Fetch all ITU technology data
 */
export async function fetchITUTechnologyData(): Promise<ITUTechData> {
  try {
    const cacheKey = 'itu_tech_data';
    const cached = clientCache.get<ITUTechData>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached ITU technology data');
      return cached;
    }

    console.log('🔬📡 ========================================');
    console.log('🔬📡 ITU: Fetching ICT statistics...');
    console.log('🔬📡 ========================================');

    const [internetUsers, mobileSubscriptions] = await Promise.all([
      fetchITUInternetUsers(),
      fetchITUMobileSubscriptions()
    ]);

    const results: ITUTechData = {
      internetUsers,
      mobileSubscriptions,
      fixedBroadband: {},
      mobileBroadband: {}
    };

    clientCache.set(cacheKey, results, 1000 * 60 * 60 * 24);

    console.log('🔬📡 ========================================');
    console.log('🔬📡 ITU Technology Data Summary:');
    console.log(`   - Internet Users: ${Object.keys(internetUsers).length} countries`);
    console.log(`   - Mobile Subscriptions: ${Object.keys(mobileSubscriptions).length} countries`);
    console.log('🔬📡 ========================================');

    return results;
  } catch (error: any) {
    console.error('❌ ITU: Error fetching technology data:', error.message);
    return {
      internetUsers: {},
      mobileSubscriptions: {},
      fixedBroadband: {},
      mobileBroadband: {}
    };
  }
}

// Clear ITU cache
export function clearITUCache(): void {
  clientCache.delete('itu_tech_data');
  clientCache.delete('itu_internet_users');
  clientCache.delete('itu_mobile_subscriptions');
  console.log('✅ Cleared ITU cached data');
}
