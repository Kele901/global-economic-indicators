import axios from "axios";
import { clientCache } from "./clientCache";

// UNESCO Institute for Statistics API
// Documentation: http://data.uis.unesco.org/

// Country code mapping for UNESCO (uses ISO 3166-1 alpha-3)
const UNESCO_COUNTRY_CODES: { [key: string]: string } = {
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

// UNESCO indicator codes for Science & Technology
const UNESCO_INDICATORS = {
  // R&D Expenditure as % of GDP
  RD_GDP: 'GERD_GDP',
  // Researchers per million inhabitants
  RESEARCHERS_MILLION: 'RESEARCHER_FTE_MILLION',
  // Technicians per million inhabitants  
  TECHNICIANS_MILLION: 'TECHNICIAN_FTE_MILLION',
  // R&D personnel
  RD_PERSONNEL: 'RDPERSONNEL_FTE',
};

export interface UNESCODataPoint {
  country: string;
  year: number;
  value: number;
}

export interface UNESCOTechData {
  rdSpending: { [country: string]: UNESCODataPoint[] };
  researchers: { [country: string]: UNESCODataPoint[] };
  technicians: { [country: string]: UNESCODataPoint[] };
}

/**
 * Fetch UNESCO R&D and researcher data
 * UNESCO has good coverage for developing countries
 */
export async function fetchUNESCOTechnologyData(): Promise<UNESCOTechData> {
  try {
    const cacheKey = 'unesco_tech_data';
    const cached = clientCache.get<UNESCOTechData>(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached UNESCO technology data');
      return cached;
    }

    console.log('🔬📚 ========================================');
    console.log('🔬📚 UNESCO: Fetching technology data...');
    console.log('🔬📚 ========================================');

    const results: UNESCOTechData = {
      rdSpending: {},
      researchers: {},
      technicians: {}
    };

    // UNESCO UIS API endpoint
    // Using their SDMX REST API
    const baseUrl = '/api/unesco';
    
    const countries = Object.keys(UNESCO_COUNTRY_CODES);
    
    for (const country of countries) {
      try {
        const countryCode = UNESCO_COUNTRY_CODES[country];
        
        // Fetch R&D expenditure
        const rdUrl = `${baseUrl}?indicator=GERD_GDP&country=${countryCode}`;
        
        const rdResponse = await axios.get(rdUrl, { timeout: 15000 });
        
        if (rdResponse.data?.data) {
          const rdData: UNESCODataPoint[] = [];
          
          rdResponse.data.data.forEach((item: any) => {
            if (item.value !== null && !isNaN(item.value)) {
              rdData.push({
                country,
                year: parseInt(item.year),
                value: Number(item.value)
              });
            }
          });
          
          if (rdData.length > 0) {
            results.rdSpending[country] = rdData.sort((a, b) => a.year - b.year);
            console.log(`✅ UNESCO R&D: ${country} - ${rdData.length} years`);
          }
        }
        
        // Fetch researchers data
        const researchersUrl = `${baseUrl}?indicator=RESEARCHER_FTE_MILLION&country=${countryCode}`;
        
        const researchersResponse = await axios.get(researchersUrl, { timeout: 15000 });
        
        if (researchersResponse.data?.data) {
          const researchersData: UNESCODataPoint[] = [];
          
          researchersResponse.data.data.forEach((item: any) => {
            if (item.value !== null && !isNaN(item.value)) {
              researchersData.push({
                country,
                year: parseInt(item.year),
                value: Number(item.value)
              });
            }
          });
          
          if (researchersData.length > 0) {
            results.researchers[country] = researchersData.sort((a, b) => a.year - b.year);
            console.log(`✅ UNESCO Researchers: ${country} - ${researchersData.length} years`);
          }
        }
        
      } catch (error: any) {
        if (error.response?.status !== 404) {
          // Silently continue - UNESCO API may not have data for all countries
        }
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Cache for 24 hours
    clientCache.set(cacheKey, results, 1000 * 60 * 60 * 24);
    
    console.log('🔬📚 ========================================');
    console.log('🔬📚 UNESCO Technology Data Summary:');
    console.log(`   - R&D Spending: ${Object.keys(results.rdSpending).length} countries`);
    console.log(`   - Researchers: ${Object.keys(results.researchers).length} countries`);
    console.log('🔬📚 ========================================');
    
    return results;
  } catch (error: any) {
    console.error('❌ UNESCO: Error fetching technology data:', error.message);
    return {
      rdSpending: {},
      researchers: {},
      technicians: {}
    };
  }
}

// Clear UNESCO cache
export function clearUNESCOCache(): void {
  clientCache.delete('unesco_tech_data');
  console.log('✅ Cleared UNESCO cached data');
}
