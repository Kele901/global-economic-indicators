import axios from 'axios';
import { clientCache } from './clientCache';

export type VisaType =
  | 'visa-free'
  | 'visa-on-arrival'
  | 'e-visa'
  | 'eta'
  | 'visa-required'
  | 'no-admission';

export interface DestinationRule {
  iso2: string;
  iso3: string;
  name: string;
  flag: string;
  region: string;
  subregion: string;
  visaType: VisaType;
  lengthOfStayDays: number | null;
  advisoryScore: number | null;
  advisoryMessage: string | null;
  advisorySource: string | null;
}

export interface PassportStayBuckets {
  bucket0to29: number;
  bucket30to89: number;
  bucket90to179: number;
  bucket180Plus: number;
  unlimited: number;
}

export interface PassportTotals {
  visaFree: number;
  visaOnArrival: number;
  eVisa: number;
  eta: number;
  visaRequired: number;
  noAdmission: number;
  mobility: number;
}

export interface PassportProfile {
  iso2: string;
  iso3: string;
  name: string;
  flag: string;
  region: string;
  subregion: string;
  capital: string;
  totals: PassportTotals;
  stay: { avgDays: number; medianDays: number; maxDays: number } & PassportStayBuckets;
  rank: number;
  avgAdvisory: number | null;
  destinations: DestinationRule[];
}

export interface PassportLiveData {
  passports: Record<string, PassportProfile>;
  updatedAt: string;
  sources: {
    passportIndex: { ok: boolean; sourceUrl?: string; updatedAt?: string };
    countries: { ok: boolean; sourceUrl?: string };
    travelAdvisory: { ok: boolean; sourceUrl?: string; updatedAt?: string };
  };
}

const CACHE_KEY = 'passport_live_v4';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

interface PassportIndexRaw {
  passports: Record<string, Record<string, { type: VisaType | 'same-country'; days: number | null }>>;
  updatedAt: string;
  sourceUrl: string;
  passportCount: number;
  destinationCount: number;
}

interface CountriesRaw {
  countries: Record<string, {
    iso2: string;
    iso3: string;
    commonName: string;
    flagEmoji: string;
    region: string;
    subregion: string;
    capital: string;
  }>;
  sourceUrl: string;
}

interface TravelAdvisoryRaw {
  advisories: Record<string, {
    iso2: string;
    score: number;
    message: string;
    sourceUrl: string;
    updated: string;
  }>;
  updatedAt: string;
  sourceUrl: string;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function safeIso2(code: string | undefined | null): string {
  return (code || '').trim().toUpperCase();
}

async function tryFetch<T>(url: string, label: string): Promise<T | null> {
  try {
    const response = await axios.get<T>(url, { timeout: 30000 });
    return response.data;
  } catch (error: any) {
    console.warn(`[passport service] ${label} failed:`, error?.message || error);
    return null;
  }
}

export async function fetchPassportData(forceRefresh = false): Promise<PassportLiveData> {
  if (!forceRefresh) {
    const cached = clientCache.get<PassportLiveData>(CACHE_KEY);
    if (cached && cached.passports && Object.keys(cached.passports).length > 0) {
      return cached;
    }
    if (cached) {
      clientCache.delete(CACHE_KEY);
    }
  }

  const [pi, rc, ta] = await Promise.all([
    tryFetch<PassportIndexRaw>('/api/passport-index', 'Passport Index'),
    tryFetch<CountriesRaw>('/api/countries', 'Country reference data'),
    tryFetch<TravelAdvisoryRaw>('/api/travel-advisory', 'Travel Advisory'),
  ]);

  if (!pi || !pi.passports || Object.keys(pi.passports).length === 0) {
    const fallback: PassportLiveData = {
      passports: {},
      updatedAt: new Date().toISOString(),
      sources: {
        passportIndex: { ok: false },
        countries: { ok: Boolean(rc), sourceUrl: rc?.sourceUrl },
        travelAdvisory: { ok: Boolean(ta), sourceUrl: ta?.sourceUrl, updatedAt: ta?.updatedAt },
      },
    };
    return fallback;
  }

  const countries = rc?.countries || {};
  const advisories = ta?.advisories || {};

  const passports: Record<string, PassportProfile> = {};
  const passportIsoList = Object.keys(pi.passports);

  for (const passportIso of passportIsoList) {
    const iso2 = safeIso2(passportIso);
    if (!iso2) continue;

    const cells = pi.passports[passportIso];
    const countryInfo = countries[iso2];

    const destinations: DestinationRule[] = [];
    const totals: PassportTotals = {
      visaFree: 0,
      visaOnArrival: 0,
      eVisa: 0,
      eta: 0,
      visaRequired: 0,
      noAdmission: 0,
      mobility: 0,
    };
    const stayDaysList: number[] = [];
    const advisoryList: number[] = [];
    const buckets: PassportStayBuckets = {
      bucket0to29: 0,
      bucket30to89: 0,
      bucket90to179: 0,
      bucket180Plus: 0,
      unlimited: 0,
    };

    Object.entries(cells).forEach(([destIso, cell]) => {
      if (cell.type === 'same-country') return;
      const destIso2 = safeIso2(destIso);
      const destInfo = countries[destIso2];
      const advisory = advisories[destIso2];

      const visaType = cell.type as VisaType;
      const lengthOfStay = cell.days != null && cell.days > 0 ? cell.days : null;

      const rule: DestinationRule = {
        iso2: destIso2,
        iso3: destInfo?.iso3 || '',
        name: destInfo?.commonName || destIso2,
        flag: destInfo?.flagEmoji || '',
        region: destInfo?.region || '',
        subregion: destInfo?.subregion || '',
        visaType,
        lengthOfStayDays: lengthOfStay,
        advisoryScore: advisory ? advisory.score : null,
        advisoryMessage: advisory ? advisory.message : null,
        advisorySource: advisory ? advisory.sourceUrl : null,
      };
      destinations.push(rule);

      switch (visaType) {
        case 'visa-free':
          totals.visaFree += 1;
          totals.mobility += 1;
          break;
        case 'visa-on-arrival':
          totals.visaOnArrival += 1;
          totals.mobility += 1;
          break;
        case 'e-visa':
          totals.eVisa += 1;
          break;
        case 'eta':
          totals.eta += 1;
          totals.mobility += 1;
          break;
        case 'visa-required':
          totals.visaRequired += 1;
          break;
        case 'no-admission':
          totals.noAdmission += 1;
          break;
      }

      if (visaType === 'visa-free' || visaType === 'visa-on-arrival' || visaType === 'eta') {
        if (lengthOfStay === null) {
          buckets.unlimited += 1;
        } else {
          stayDaysList.push(lengthOfStay);
          if (lengthOfStay < 30) buckets.bucket0to29 += 1;
          else if (lengthOfStay < 90) buckets.bucket30to89 += 1;
          else if (lengthOfStay < 180) buckets.bucket90to179 += 1;
          else buckets.bucket180Plus += 1;
        }
      }

      if (advisory && (visaType === 'visa-free' || visaType === 'visa-on-arrival' || visaType === 'eta' || visaType === 'e-visa')) {
        advisoryList.push(advisory.score);
      }
    });

    const avgDays = stayDaysList.length
      ? Math.round(stayDaysList.reduce((a, b) => a + b, 0) / stayDaysList.length)
      : 0;
    const medDays = stayDaysList.length ? Math.round(median(stayDaysList)) : 0;
    const maxDays = stayDaysList.length ? Math.max(...stayDaysList) : 0;
    const avgAdvisory = advisoryList.length
      ? Math.round((advisoryList.reduce((a, b) => a + b, 0) / advisoryList.length) * 10) / 10
      : null;

    passports[iso2] = {
      iso2,
      iso3: countryInfo?.iso3 || '',
      name: countryInfo?.commonName || iso2,
      flag: countryInfo?.flagEmoji || '',
      region: countryInfo?.region || '',
      subregion: countryInfo?.subregion || '',
      capital: countryInfo?.capital || '',
      totals,
      stay: {
        avgDays,
        medianDays: medDays,
        maxDays,
        ...buckets,
      },
      rank: 0,
      avgAdvisory,
      destinations,
    };
  }

  const sorted = Object.values(passports).sort((a, b) => b.totals.mobility - a.totals.mobility);
  let currentRank = 0;
  let lastMobility = -1;
  let processed = 0;
  sorted.forEach((p) => {
    processed += 1;
    if (p.totals.mobility !== lastMobility) {
      currentRank = processed;
      lastMobility = p.totals.mobility;
    }
    passports[p.iso2].rank = currentRank;
  });

  const result: PassportLiveData = {
    passports,
    updatedAt: new Date().toISOString(),
    sources: {
      passportIndex: { ok: true, sourceUrl: pi.sourceUrl, updatedAt: pi.updatedAt },
      countries: { ok: Boolean(rc), sourceUrl: rc?.sourceUrl },
      travelAdvisory: { ok: Boolean(ta), sourceUrl: ta?.sourceUrl, updatedAt: ta?.updatedAt },
    },
  };

  clientCache.set(CACHE_KEY, result, CACHE_TTL_MS);
  return result;
}

export function clearPassportCache(): void {
  clientCache.delete(CACHE_KEY);
}

export const VISA_TYPE_LABELS: Record<VisaType, string> = {
  'visa-free': 'Visa-Free',
  'visa-on-arrival': 'Visa on Arrival',
  'e-visa': 'eVisa',
  eta: 'ETA',
  'visa-required': 'Visa Required',
  'no-admission': 'No Admission',
};

export const VISA_TYPE_COLORS: Record<VisaType, { light: string; dark: string }> = {
  'visa-free':       { light: '#059669', dark: '#34D399' },
  'visa-on-arrival': { light: '#0891B2', dark: '#22D3EE' },
  eta:               { light: '#7C3AED', dark: '#A78BFA' },
  'e-visa':          { light: '#D97706', dark: '#FBBF24' },
  'visa-required':   { light: '#DC2626', dark: '#F87171' },
  'no-admission':    { light: '#525252', dark: '#A3A3A3' },
};

/** Scores follow the Government of Canada levels: 0 normal precautions … 3 avoid all travel. */
export const ADVISORY_MAX_SCORE = 3;

export function getAdvisoryTier(score: number | null): { label: string; color: string; colorDark: string } {
  if (score === null || score === undefined) return { label: 'No Data', color: '#9CA3AF', colorDark: '#6B7280' };
  if (score < 0.5) return { label: 'Low Risk', color: '#059669', colorDark: '#34D399' };
  if (score < 1.5) return { label: 'Caution', color: '#D97706', colorDark: '#FBBF24' };
  if (score < 2.5) return { label: 'High Risk', color: '#EA580C', colorDark: '#FB923C' };
  return { label: 'Avoid Travel', color: '#DC2626', colorDark: '#F87171' };
}

export function getMobilityTier(score: number): { label: string; color: string; colorDark: string } {
  if (score >= 165) return { label: 'Excellent', color: '#059669', colorDark: '#34D399' };
  if (score >= 145) return { label: 'Very Strong', color: '#10B981', colorDark: '#6EE7B7' };
  if (score >= 115) return { label: 'Strong', color: '#0891B2', colorDark: '#22D3EE' };
  if (score >= 75)  return { label: 'Moderate', color: '#D97706', colorDark: '#FBBF24' };
  if (score >= 45)  return { label: 'Weak', color: '#EA580C', colorDark: '#FB923C' };
  return { label: 'Very Weak', color: '#DC2626', colorDark: '#F87171' };
}
