// Curated snapshots that ride alongside the live World Bank migration
// series (remittances received, migrant stock, refugees by origin) on
// the Migration Ledger. These datasets are not freely available via a
// stable API (UNHCR + UN DESA publish once a year in PDF/XLSX).
//
// Update CURATED_LAST_UPDATED whenever any of the tables here is
// refreshed — the StalenessBanner warns users when the curation ages
// past twelve months.

export const CURATED_LAST_UPDATED = '2025-09-15';

// Top-20 migrant destination + origin economies. `wbKey` matches
// worldbank.ts COUNTRY_NAMES so charts can join to live WB series.
export interface MigrationCountryMeta {
  iso3: string;
  wbKey: string;
  name: string;
  color: string;
}

export const MIGRATION_COUNTRY_META: MigrationCountryMeta[] = [
  { iso3: 'USA', wbKey: 'USA',         name: 'United States', color: '#2563eb' },
  { iso3: 'DEU', wbKey: 'Germany',     name: 'Germany',       color: '#facc15' },
  { iso3: 'SAU', wbKey: 'SaudiArabia', name: 'Saudi Arabia',  color: '#059669' },
  { iso3: 'GBR', wbKey: 'UK',          name: 'United Kingdom',color: '#1e40af' },
  { iso3: 'FRA', wbKey: 'France',      name: 'France',        color: '#6366f1' },
  { iso3: 'CAN', wbKey: 'Canada',      name: 'Canada',        color: '#ef4444' },
  { iso3: 'RUS', wbKey: 'Russia',      name: 'Russia',        color: '#7c2d12' },
  { iso3: 'ARE', wbKey: 'UAE',         name: 'UAE',           color: '#0ea5e9' },
  { iso3: 'AUS', wbKey: 'Australia',   name: 'Australia',     color: '#14b8a6' },
  { iso3: 'ITA', wbKey: 'Italy',       name: 'Italy',         color: '#f59e0b' },
  { iso3: 'ESP', wbKey: 'Spain',       name: 'Spain',         color: '#84cc16' },
  { iso3: 'IND', wbKey: 'India',       name: 'India',         color: '#f43f5e' },
  { iso3: 'MEX', wbKey: 'Mexico',      name: 'Mexico',        color: '#a855f7' },
  { iso3: 'PHL', wbKey: 'Philippines', name: 'Philippines',   color: '#22c55e' },
  { iso3: 'PAK', wbKey: 'Pakistan',    name: 'Pakistan',      color: '#0d9488' },
  { iso3: 'BGD', wbKey: 'Bangladesh',  name: 'Bangladesh',    color: '#dc2626' },
  { iso3: 'EGY', wbKey: 'Egypt',       name: 'Egypt',         color: '#c09000' },
  { iso3: 'CHN', wbKey: 'China',       name: 'China',         color: '#be185d' },
  { iso3: 'NGA', wbKey: 'Nigeria',     name: 'Nigeria',       color: '#00bfa0' },
  { iso3: 'UKR', wbKey: 'Ukraine',     name: 'Ukraine',       color: '#3b82f6' },
];

// ── UNHCR refugee stocks by origin (mid-2025) ───────────────────────────
// Source: UNHCR Refugee Data Finder, "Refugees + Others in need of
// international protection" by country of origin. Millions.
export interface RefugeeStockRow {
  origin: string;
  originLabel: string;
  refugeesMn: number;      // millions
  peakYear: number;        // year the crisis peaked
  primaryDestinations: string;
  note?: string;
}

export const REFUGEE_STOCKS_2025: RefugeeStockRow[] = [
  { origin: 'Syria',         originLabel: 'Syria',                refugeesMn: 6.2, peakYear: 2016, primaryDestinations: 'Türkiye, Lebanon, Germany, Jordan', note: 'Down from 6.7M peak as some return post-Assad.' },
  { origin: 'Ukraine',       originLabel: 'Ukraine',              refugeesMn: 6.0, peakYear: 2024, primaryDestinations: 'Germany, Poland, Czechia, US' },
  { origin: 'Afghanistan',   originLabel: 'Afghanistan',          refugeesMn: 5.9, peakYear: 2024, primaryDestinations: 'Pakistan, Iran, Germany, US' },
  { origin: 'Venezuela',     originLabel: 'Venezuela',            refugeesMn: 6.1, peakYear: 2024, primaryDestinations: 'Colombia, Peru, Brazil, US', note: 'Includes "others in need of protection" (regional).' },
  { origin: 'Sudan',         originLabel: 'Sudan',                refugeesMn: 2.5, peakYear: 2025, primaryDestinations: 'Chad, South Sudan, Egypt, Ethiopia', note: 'Civil war since April 2023.' },
  { origin: 'South Sudan',   originLabel: 'South Sudan',          refugeesMn: 2.2, peakYear: 2022, primaryDestinations: 'Uganda, Sudan, Ethiopia' },
  { origin: 'Myanmar',       originLabel: 'Myanmar',              refugeesMn: 1.4, peakYear: 2023, primaryDestinations: 'Bangladesh, Thailand, Malaysia', note: 'Rohingya crisis + post-2021 coup.' },
  { origin: 'Somalia',       originLabel: 'Somalia',              refugeesMn: 0.8, peakYear: 2013, primaryDestinations: 'Kenya, Ethiopia, Yemen' },
  { origin: 'DRC',           originLabel: 'DR Congo',             refugeesMn: 1.1, peakYear: 2024, primaryDestinations: 'Uganda, Rwanda, Burundi, Tanzania', note: 'M23 conflict eastern DRC.' },
  { origin: 'CAR',           originLabel: 'Central African Rep.', refugeesMn: 0.7, peakYear: 2020, primaryDestinations: 'Cameroon, DRC, Chad' },
  { origin: 'Eritrea',       originLabel: 'Eritrea',              refugeesMn: 0.6, peakYear: 2018, primaryDestinations: 'Ethiopia, Sudan, Germany' },
  { origin: 'Nicaragua',     originLabel: 'Nicaragua',            refugeesMn: 0.85,peakYear: 2024, primaryDestinations: 'Costa Rica, US' },
  { origin: 'Mali',          originLabel: 'Mali',                 refugeesMn: 0.25,peakYear: 2024, primaryDestinations: 'Mauritania, Niger, Burkina Faso' },
  { origin: 'Burkina Faso',  originLabel: 'Burkina Faso',         refugeesMn: 0.15,peakYear: 2024, primaryDestinations: 'Côte d\'Ivoire, Mali, Niger' },
];

// ── Top-25 remittance corridors (2024) ──────────────────────────────────
// Source: World Bank Bilateral Remittance Matrix + KNOMAD. USD billions.
export interface RemittanceCorridorRow {
  from: string;
  to: string;
  amountBn: number;   // billions USD (2024 est)
}

export const REMITTANCE_CORRIDORS_2024: RemittanceCorridorRow[] = [
  { from: 'United States', to: 'Mexico',        amountBn: 64.7 },
  { from: 'UAE',           to: 'India',         amountBn: 27.4 },
  { from: 'Saudi Arabia',  to: 'India',         amountBn: 15.9 },
  { from: 'United States', to: 'India',         amountBn: 23.4 },
  { from: 'United States', to: 'China',         amountBn: 17.6 },
  { from: 'Saudi Arabia',  to: 'Egypt',         amountBn: 10.4 },
  { from: 'United States', to: 'Philippines',   amountBn: 15.2 },
  { from: 'UAE',           to: 'Pakistan',      amountBn: 8.1  },
  { from: 'Saudi Arabia',  to: 'Bangladesh',    amountBn: 6.0  },
  { from: 'United States', to: 'Vietnam',       amountBn: 9.2  },
  { from: 'United States', to: 'Guatemala',     amountBn: 16.9 },
  { from: 'United States', to: 'El Salvador',   amountBn: 8.4  },
  { from: 'Spain',         to: 'Colombia',      amountBn: 4.9  },
  { from: 'Kuwait',        to: 'India',         amountBn: 5.6  },
  { from: 'Qatar',         to: 'India',         amountBn: 4.5  },
  { from: 'Oman',          to: 'India',         amountBn: 4.3  },
  { from: 'Malaysia',      to: 'Indonesia',     amountBn: 3.9  },
  { from: 'Hong Kong',     to: 'Philippines',   amountBn: 3.7  },
  { from: 'United States', to: 'Nigeria',       amountBn: 4.0  },
  { from: 'United Kingdom',to: 'Nigeria',       amountBn: 3.8  },
  { from: 'United States', to: 'Honduras',      amountBn: 9.8  },
  { from: 'United States', to: 'Dominican Rep.',amountBn: 10.6 },
  { from: 'Poland',        to: 'Ukraine',       amountBn: 5.2  },
  { from: 'Germany',       to: 'Türkiye',       amountBn: 3.4  },
  { from: 'Russia',        to: 'Uzbekistan',    amountBn: 6.9  },
];

// ── Migrant stock as % of population (UN DESA 2024) ─────────────────────
// Countries with highest foreign-born share.
export interface MigrantShareRow {
  country: string;
  countryLabel: string;
  migrantSharePct: number;
  foreignBornMn: number;
  category: 'gulf-labour' | 'oecd-immigration' | 'city-state' | 'oecd-emigration' | 'other';
}

export const MIGRANT_STOCK_SHARE_2024: MigrantShareRow[] = [
  { country: 'UAE',          countryLabel: 'UAE',            migrantSharePct: 88.1, foreignBornMn: 8.7,  category: 'gulf-labour' },
  { country: 'Qatar',        countryLabel: 'Qatar',          migrantSharePct: 77.3, foreignBornMn: 2.3,  category: 'gulf-labour' },
  { country: 'Kuwait',       countryLabel: 'Kuwait',         migrantSharePct: 72.8, foreignBornMn: 3.2,  category: 'gulf-labour' },
  { country: 'Singapore',    countryLabel: 'Singapore',      migrantSharePct: 43.1, foreignBornMn: 2.5,  category: 'city-state' },
  { country: 'SaudiArabia',  countryLabel: 'Saudi Arabia',   migrantSharePct: 38.6, foreignBornMn: 13.5, category: 'gulf-labour' },
  { country: 'Bahrain',      countryLabel: 'Bahrain',        migrantSharePct: 55.4, foreignBornMn: 0.9,  category: 'gulf-labour' },
  { country: 'Australia',    countryLabel: 'Australia',      migrantSharePct: 30.7, foreignBornMn: 8.0,  category: 'oecd-immigration' },
  { country: 'Switzerland',  countryLabel: 'Switzerland',    migrantSharePct: 30.1, foreignBornMn: 2.7,  category: 'oecd-immigration' },
  { country: 'Israel',       countryLabel: 'Israel',         migrantSharePct: 22.1, foreignBornMn: 2.0,  category: 'oecd-immigration' },
  { country: 'Canada',       countryLabel: 'Canada',         migrantSharePct: 21.3, foreignBornMn: 8.4,  category: 'oecd-immigration' },
  { country: 'Sweden',       countryLabel: 'Sweden',         migrantSharePct: 20.4, foreignBornMn: 2.2,  category: 'oecd-immigration' },
  { country: 'Germany',      countryLabel: 'Germany',        migrantSharePct: 18.8, foreignBornMn: 15.8, category: 'oecd-immigration' },
  { country: 'USA',          countryLabel: 'United States',  migrantSharePct: 15.3, foreignBornMn: 51.0, category: 'oecd-immigration' },
  { country: 'UK',           countryLabel: 'United Kingdom', migrantSharePct: 14.4, foreignBornMn: 9.9,  category: 'oecd-immigration' },
  { country: 'Spain',        countryLabel: 'Spain',          migrantSharePct: 14.1, foreignBornMn: 6.8,  category: 'oecd-immigration' },
  { country: 'France',       countryLabel: 'France',         migrantSharePct: 13.2, foreignBornMn: 8.6,  category: 'oecd-immigration' },
  { country: 'Netherlands',  countryLabel: 'Netherlands',    migrantSharePct: 14.1, foreignBornMn: 2.5,  category: 'oecd-immigration' },
  { country: 'Italy',        countryLabel: 'Italy',          migrantSharePct: 10.6, foreignBornMn: 6.3,  category: 'oecd-immigration' },
  { country: 'Portugal',     countryLabel: 'Portugal',       migrantSharePct: 10.2, foreignBornMn: 1.1,  category: 'oecd-immigration' },
  { country: 'Japan',        countryLabel: 'Japan',          migrantSharePct: 2.4,  foreignBornMn: 3.0,  category: 'other' },
  { country: 'SouthKorea',   countryLabel: 'South Korea',    migrantSharePct: 3.5,  foreignBornMn: 1.8,  category: 'other' },
  { country: 'India',        countryLabel: 'India',          migrantSharePct: 0.4,  foreignBornMn: 4.9,  category: 'oecd-emigration' },
  { country: 'China',        countryLabel: 'China',          migrantSharePct: 0.1,  foreignBornMn: 1.0,  category: 'oecd-emigration' },
  { country: 'Mexico',       countryLabel: 'Mexico',         migrantSharePct: 0.9,  foreignBornMn: 1.2,  category: 'oecd-emigration' },
];

// ── EU asylum applications 2015-2024 ─────────────────────────────────────
// First-time asylum applications lodged in EU-27, thousands.
// Source: Eurostat migr_asyappctza + EU Migration and Home Affairs.
export interface AsylumYearRow {
  year: number;
  applicationsThousand: number;
  topOrigin: string;
  topOriginShare: number;  // %
  note?: string;
}

export const EU_ASYLUM_APPLICATIONS: AsylumYearRow[] = [
  { year: 2015, applicationsThousand: 1256, topOrigin: 'Syria',        topOriginShare: 29, note: 'Refugee crisis peak.' },
  { year: 2016, applicationsThousand: 1206, topOrigin: 'Syria',        topOriginShare: 28 },
  { year: 2017, applicationsThousand:  654, topOrigin: 'Syria',        topOriginShare: 15 },
  { year: 2018, applicationsThousand:  581, topOrigin: 'Syria',        topOriginShare: 14 },
  { year: 2019, applicationsThousand:  632, topOrigin: 'Syria',        topOriginShare: 12 },
  { year: 2020, applicationsThousand:  417, topOrigin: 'Syria',        topOriginShare: 15, note: 'Covid border closures.' },
  { year: 2021, applicationsThousand:  537, topOrigin: 'Syria',        topOriginShare: 20 },
  { year: 2022, applicationsThousand:  881, topOrigin: 'Syria',        topOriginShare: 15, note: 'Excludes Ukraine (Temporary Protection).' },
  { year: 2023, applicationsThousand: 1129, topOrigin: 'Syria',        topOriginShare: 16 },
  { year: 2024, applicationsThousand:  912, topOrigin: 'Venezuela',    topOriginShare: 8,  note: 'Dropped for the first time since 2020.' },
];

// ── Brain drain / brain gain (OECD talent index proxy) ──────────────────
// Ratio of highly-educated emigrants relative to highly-educated
// population. Negative = brain gain, positive = brain drain.
export interface BrainMigrationRow {
  country: string;
  countryLabel: string;
  brainDrainScore: number;   // % of tertiary-educated adults living abroad
  netTalent: 'gain' | 'drain' | 'balanced';
}

export const BRAIN_MIGRATION_2024: BrainMigrationRow[] = [
  { country: 'Ireland',      countryLabel: 'Ireland',      brainDrainScore: 33.1, netTalent: 'drain' },
  { country: 'Portugal',     countryLabel: 'Portugal',     brainDrainScore: 20.4, netTalent: 'drain' },
  { country: 'Poland',       countryLabel: 'Poland',       brainDrainScore: 16.2, netTalent: 'drain' },
  { country: 'Nigeria',      countryLabel: 'Nigeria',      brainDrainScore: 15.5, netTalent: 'drain' },
  { country: 'Philippines',  countryLabel: 'Philippines',  brainDrainScore: 13.9, netTalent: 'drain' },
  { country: 'India',        countryLabel: 'India',        brainDrainScore: 3.5,  netTalent: 'drain' },
  { country: 'China',        countryLabel: 'China',        brainDrainScore: 3.3,  netTalent: 'drain' },
  { country: 'Mexico',       countryLabel: 'Mexico',       brainDrainScore: 7.8,  netTalent: 'drain' },
  { country: 'UK',           countryLabel: 'United Kingdom',brainDrainScore: 12.6,netTalent: 'balanced' },
  { country: 'Germany',      countryLabel: 'Germany',      brainDrainScore: 5.9,  netTalent: 'gain' },
  { country: 'France',       countryLabel: 'France',       brainDrainScore: 4.4,  netTalent: 'balanced' },
  { country: 'USA',          countryLabel: 'United States',brainDrainScore: 0.8,  netTalent: 'gain' },
  { country: 'Canada',       countryLabel: 'Canada',       brainDrainScore: 4.9,  netTalent: 'gain' },
  { country: 'Australia',    countryLabel: 'Australia',    brainDrainScore: 4.2,  netTalent: 'gain' },
  { country: 'Switzerland',  countryLabel: 'Switzerland',  brainDrainScore: 12.1, netTalent: 'gain' },
  { country: 'Japan',        countryLabel: 'Japan',        brainDrainScore: 0.6,  netTalent: 'balanced' },
  { country: 'SouthKorea',   countryLabel: 'South Korea',  brainDrainScore: 1.7,  netTalent: 'balanced' },
];

// ── Border safety events (Missing Migrants Project 2014-2024) ──────────
// Source: IOM Missing Migrants Project. Total recorded deaths and
// disappearances by route.
export interface MigrantSafetyRow {
  route: string;
  deathsRecorded: number;  // cumulative 2014-2024
  primaryOrigin: string;
  note?: string;
}

export const MIGRANT_SAFETY_ROUTES: MigrantSafetyRow[] = [
  { route: 'Mediterranean (central)',   deathsRecorded: 24800, primaryOrigin: 'Sub-Saharan Africa, Middle East', note: 'Libya-Italy corridor; deadliest sea route on earth.' },
  { route: 'Mediterranean (western)',    deathsRecorded: 5100,  primaryOrigin: 'North + Sub-Saharan Africa',      note: 'Morocco-Spain incl. Canary Islands.' },
  { route: 'US-Mexico border',           deathsRecorded: 7900,  primaryOrigin: 'Mexico, Central America, Venezuela' },
  { route: 'Sahara desert',              deathsRecorded: 6200,  primaryOrigin: 'Sub-Saharan Africa',              note: 'Under-reported; true figure likely 2-3× higher.' },
  { route: 'English Channel',            deathsRecorded: 350,   primaryOrigin: 'Iran, Afghanistan, Iraq, Syria' },
  { route: 'Mediterranean (eastern)',    deathsRecorded: 3600,  primaryOrigin: 'Syria, Afghanistan, Turkey' },
  { route: 'Darién Gap (Panama)',        deathsRecorded: 900,   primaryOrigin: 'Venezuela, Ecuador, Haiti' },
  { route: 'Andaman Sea',                deathsRecorded: 2200,  primaryOrigin: 'Rohingya (Myanmar)' },
];
