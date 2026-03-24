import axios from "axios";
import { clientCache } from "./clientCache";
import {
  heritageSitesByCountry,
  creativeCitiesByCountry,
  museumDensityByCountry,
  softPowerRankings,
  creativeGoodsExportsByCountry,
  creativeServicesExportsByCountry,
  culturalEmploymentByCountry,
  featureFilmsByCountry,
} from "../data/culturalMetrics";

export interface HeritageSite {
  name: string;
  description: string;
  category: string;
  country: string;
  isoCode: string;
  region: string;
  yearInscribed: number;
  danger: boolean;
  longitude: number;
  latitude: number;
  areaHectares: number;
  criteria: string;
  transboundary: boolean;
}

export interface HeritageCountryData {
  total: number;
  cultural: number;
  natural: number;
  mixed: number;
}

export interface CreativeCityData {
  total: number;
  fields: string[];
}

export interface SoftPowerData {
  rank: number;
  score: number;
}

export interface CulturalStaticData {
  heritageSites: { [country: string]: HeritageCountryData };
  creativeCities: { [country: string]: CreativeCityData };
  museumDensity: { [country: string]: number };
  softPowerRankings: { [country: string]: SoftPowerData };
  creativeGoodsExports: { [country: string]: number };
  creativeServicesExports: { [country: string]: number };
  culturalEmployment: { [country: string]: number };
  featureFilms: { [country: string]: number };
  heritageSitesList: HeritageSite[];
}

/**
 * Fetch UNESCO World Heritage Sites list from the API
 */
export async function fetchHeritageSitesList(): Promise<HeritageSite[]> {
  try {
    const cacheKey = 'unesco_heritage_sites_list';
    const cached = clientCache.get<HeritageSite[]>(cacheKey);
    if (cached) {
      console.log('Using cached heritage sites list');
      return cached;
    }

    const response = await axios.get('/api/unesco-heritage?limit=100', {
      timeout: 20000
    });

    const sites: HeritageSite[] = response.data?.sites || [];

    if (sites.length > 0) {
      clientCache.set(cacheKey, sites, 1000 * 60 * 60 * 24);
    }

    return sites;
  } catch (error: any) {
    console.warn('Failed to fetch heritage sites list:', error.message);
    return [];
  }
}

/**
 * Fetch all cultural static and semi-static data
 */
export async function fetchCulturalStaticData(): Promise<CulturalStaticData> {
  try {
    const cacheKey = 'cultural_static_data_v1';
    const cached = clientCache.get<CulturalStaticData>(cacheKey);
    if (cached) {
      console.log('Using cached cultural static data');
      return cached;
    }

    let heritageSitesList: HeritageSite[] = [];
    try {
      heritageSitesList = await fetchHeritageSitesList();
    } catch {
      console.warn('Heritage sites list unavailable, using static counts only');
    }

    const result: CulturalStaticData = {
      heritageSites: heritageSitesByCountry,
      creativeCities: creativeCitiesByCountry,
      museumDensity: museumDensityByCountry,
      softPowerRankings: softPowerRankings,
      creativeGoodsExports: creativeGoodsExportsByCountry,
      creativeServicesExports: creativeServicesExportsByCountry,
      culturalEmployment: culturalEmploymentByCountry,
      featureFilms: featureFilmsByCountry,
      heritageSitesList,
    };

    clientCache.set(cacheKey, result, 1000 * 60 * 60 * 24);
    return result;
  } catch (error: any) {
    console.error('Error fetching cultural static data:', error.message);
    return {
      heritageSites: heritageSitesByCountry,
      creativeCities: creativeCitiesByCountry,
      museumDensity: museumDensityByCountry,
      softPowerRankings: softPowerRankings,
      creativeGoodsExports: creativeGoodsExportsByCountry,
      creativeServicesExports: creativeServicesExportsByCountry,
      culturalEmployment: culturalEmploymentByCountry,
      featureFilms: featureFilmsByCountry,
      heritageSitesList: [],
    };
  }
}

export function clearCulturalCache(): void {
  clientCache.delete('cultural_static_data_v1');
  clientCache.delete('unesco_heritage_sites_list');
  console.log('Cleared cultural cached data');
}
