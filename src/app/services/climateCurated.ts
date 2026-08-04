// Curated snapshots that ride alongside the live World Bank climate series
// on the Climate Ledger. These datasets are not freely available via a
// stable API (paywalls, restrictive licences, PDF-only releases), so they
// are baked into the bundle as static seeds. Update CURATED_LAST_UPDATED
// whenever any of the tables here is refreshed — the StalenessBanner uses
// that stamp to warn users when the curation ages past twelve months.

export const CURATED_LAST_UPDATED = '2025-08-01';

// Ranked emitters roster for the Climate Ledger. Ordered by 2023 CO2
// emissions (kt). Colour palette avoids collisions with the defense
// palette so the two pages don't look identical.
export interface ClimateCountryMeta {
  iso3: string;
  wbKey: string;   // matches worldbank.ts COUNTRY_NAMES
  name: string;
  color: string;
}

export const CLIMATE_COUNTRY_META: ClimateCountryMeta[] = [
  { iso3: 'CHN', wbKey: 'China',        name: 'China',          color: '#dc2626' },
  { iso3: 'USA', wbKey: 'USA',          name: 'United States',  color: '#2563eb' },
  { iso3: 'IND', wbKey: 'India',        name: 'India',          color: '#f97316' },
  { iso3: 'RUS', wbKey: 'Russia',       name: 'Russia',         color: '#7c2d12' },
  { iso3: 'JPN', wbKey: 'Japan',        name: 'Japan',          color: '#be185d' },
  { iso3: 'DEU', wbKey: 'Germany',      name: 'Germany',        color: '#facc15' },
  { iso3: 'IDN', wbKey: 'Indonesia',    name: 'Indonesia',      color: '#84cc16' },
  { iso3: 'SAU', wbKey: 'SaudiArabia',  name: 'Saudi Arabia',   color: '#059669' },
  { iso3: 'KOR', wbKey: 'SouthKorea',   name: 'South Korea',    color: '#0ea5e9' },
  { iso3: 'CAN', wbKey: 'Canada',       name: 'Canada',         color: '#ef4444' },
  { iso3: 'BRA', wbKey: 'Brazil',       name: 'Brazil',         color: '#16a34a' },
  { iso3: 'MEX', wbKey: 'Mexico',       name: 'Mexico',         color: '#a855f7' },
  { iso3: 'TUR', wbKey: 'Turkey',       name: 'Türkiye',        color: '#e11d48' },
  { iso3: 'AUS', wbKey: 'Australia',    name: 'Australia',      color: '#14b8a6' },
  { iso3: 'GBR', wbKey: 'UK',           name: 'United Kingdom', color: '#1e40af' },
  { iso3: 'FRA', wbKey: 'France',       name: 'France',         color: '#6366f1' },
  { iso3: 'ITA', wbKey: 'Italy',        name: 'Italy',          color: '#f59e0b' },
  { iso3: 'ZAF', wbKey: 'SouthAfrica',  name: 'South Africa',   color: '#22c55e' },
  { iso3: 'POL', wbKey: 'Poland',       name: 'Poland',         color: '#c026d3' },
  { iso3: 'ARG', wbKey: 'Argentina',    name: 'Argentina',      color: '#0891b2' },
];


// ── NDC 2035 targets ────────────────────────────────────────────────────
// Nationally Determined Contributions submitted or updated under the Paris
// Agreement, sourced from the UNFCCC NDC Registry. Where a country has not
// yet published a 2035 pledge, we fall back to the 2030 target and note it.
export interface NdcTargetRow {
  country: string;             // internal country key (matches worldbank.ts COUNTRY_NAMES)
  countryLabel: string;         // display name
  baselineYear: number;
  targetYear: number;
  reductionPct: number;         // headline % reduction vs baseline
  scope: 'economy-wide' | 'sectoral';
  gases: string;                // e.g. 'all GHG' or 'CO2 only'
  notes?: string;
}

export const NDC_2035_TARGETS: NdcTargetRow[] = [
  { country: 'USA', countryLabel: 'United States', baselineYear: 2005, targetYear: 2035, reductionPct: 61, scope: 'economy-wide', gases: 'all GHG', notes: 'Updated NDC submitted Dec 2024 (61-66% range).' },
  { country: 'China', countryLabel: 'China', baselineYear: 2005, targetYear: 2030, reductionPct: 65, scope: 'economy-wide', gases: 'CO2 intensity', notes: 'Intensity target — peak absolute emissions before 2030.' },
  { country: 'India', countryLabel: 'India', baselineYear: 2005, targetYear: 2030, reductionPct: 45, scope: 'economy-wide', gases: 'CO2 intensity', notes: 'Net-zero 2070.' },
  { country: 'Germany', countryLabel: 'Germany', baselineYear: 1990, targetYear: 2030, reductionPct: 65, scope: 'economy-wide', gases: 'all GHG', notes: 'EU-wide NDC applies; national target is more ambitious.' },
  { country: 'UK', countryLabel: 'United Kingdom', baselineYear: 1990, targetYear: 2035, reductionPct: 81, scope: 'economy-wide', gases: 'all GHG', notes: 'CBA-derived NDC submitted Feb 2025.' },
  { country: 'France', countryLabel: 'France', baselineYear: 1990, targetYear: 2030, reductionPct: 55, scope: 'economy-wide', gases: 'all GHG', notes: 'EU-wide NDC applies.' },
  { country: 'Italy', countryLabel: 'Italy', baselineYear: 1990, targetYear: 2030, reductionPct: 55, scope: 'economy-wide', gases: 'all GHG', notes: 'EU-wide NDC applies.' },
  { country: 'Japan', countryLabel: 'Japan', baselineYear: 2013, targetYear: 2035, reductionPct: 60, scope: 'economy-wide', gases: 'all GHG', notes: 'Updated Feb 2025 (60% vs 2013 = 55% vs 2005).' },
  { country: 'SouthKorea', countryLabel: 'South Korea', baselineYear: 2018, targetYear: 2030, reductionPct: 40, scope: 'economy-wide', gases: 'all GHG' },
  { country: 'Canada', countryLabel: 'Canada', baselineYear: 2005, targetYear: 2035, reductionPct: 50, scope: 'economy-wide', gases: 'all GHG', notes: 'Updated NDC — 45-50% by 2035 range.' },
  { country: 'Australia', countryLabel: 'Australia', baselineYear: 2005, targetYear: 2030, reductionPct: 43, scope: 'economy-wide', gases: 'all GHG' },
  { country: 'Russia', countryLabel: 'Russia', baselineYear: 1990, targetYear: 2030, reductionPct: 30, scope: 'economy-wide', gases: 'all GHG', notes: 'Includes very large forest sink assumption.' },
  { country: 'Brazil', countryLabel: 'Brazil', baselineYear: 2005, targetYear: 2035, reductionPct: 67, scope: 'economy-wide', gases: 'all GHG', notes: 'Updated Nov 2024, 59-67% range.' },
  { country: 'Indonesia', countryLabel: 'Indonesia', baselineYear: 2010, targetYear: 2030, reductionPct: 32, scope: 'economy-wide', gases: 'all GHG', notes: '43% conditional on international support.' },
  { country: 'Mexico', countryLabel: 'Mexico', baselineYear: 2013, targetYear: 2030, reductionPct: 35, scope: 'economy-wide', gases: 'all GHG' },
  { country: 'Turkey', countryLabel: 'Türkiye', baselineYear: 2012, targetYear: 2030, reductionPct: 41, scope: 'economy-wide', gases: 'all GHG', notes: 'Reduction vs business-as-usual, not vs baseline year emissions.' },
  { country: 'SaudiArabia', countryLabel: 'Saudi Arabia', baselineYear: 2019, targetYear: 2030, reductionPct: 20, scope: 'economy-wide', gases: 'CO2', notes: 'Absolute reduction of 278 Mt CO2e/yr by 2030.' },
  { country: 'Argentina', countryLabel: 'Argentina', baselineYear: 2007, targetYear: 2030, reductionPct: 19, scope: 'economy-wide', gases: 'all GHG' },
  { country: 'SouthAfrica', countryLabel: 'South Africa', baselineYear: 2010, targetYear: 2030, reductionPct: 40, scope: 'economy-wide', gases: 'all GHG', notes: 'Target range 350-420 Mt CO2e in 2030.' },
  { country: 'Nigeria', countryLabel: 'Nigeria', baselineYear: 2018, targetYear: 2030, reductionPct: 20, scope: 'economy-wide', gases: 'all GHG', notes: '47% conditional on international support.' },
];

// ── Coal-plant pipeline ─────────────────────────────────────────────────
// From the Global Energy Monitor Global Coal Plant Tracker latest release.
// Sums operating, under-construction and announced capacity by country.
export interface CoalPipelineRow {
  country: string;
  countryLabel: string;
  operatingGw: number;
  constructionGw: number;
  announcedGw: number;
  retiredGw: number;
  directionOfTravel: 'expanding' | 'stable' | 'declining';
}

export const COAL_PLANT_PIPELINE: CoalPipelineRow[] = [
  { country: 'China', countryLabel: 'China', operatingGw: 1170, constructionGw: 95, announcedGw: 105, retiredGw: 90, directionOfTravel: 'expanding' },
  { country: 'India', countryLabel: 'India', operatingGw: 235, constructionGw: 32, announcedGw: 40, retiredGw: 12, directionOfTravel: 'expanding' },
  { country: 'USA', countryLabel: 'United States', operatingGw: 195, constructionGw: 0, announcedGw: 0, retiredGw: 145, directionOfTravel: 'declining' },
  { country: 'Indonesia', countryLabel: 'Indonesia', operatingGw: 46, constructionGw: 6, announcedGw: 14, retiredGw: 2, directionOfTravel: 'expanding' },
  { country: 'Russia', countryLabel: 'Russia', operatingGw: 45, constructionGw: 1, announcedGw: 3, retiredGw: 10, directionOfTravel: 'stable' },
  { country: 'Japan', countryLabel: 'Japan', operatingGw: 51, constructionGw: 0, announcedGw: 0, retiredGw: 8, directionOfTravel: 'declining' },
  { country: 'Germany', countryLabel: 'Germany', operatingGw: 35, constructionGw: 0, announcedGw: 0, retiredGw: 28, directionOfTravel: 'declining' },
  { country: 'SouthAfrica', countryLabel: 'South Africa', operatingGw: 40, constructionGw: 0, announcedGw: 0, retiredGw: 5, directionOfTravel: 'declining' },
  { country: 'SouthKorea', countryLabel: 'South Korea', operatingGw: 37, constructionGw: 3, announcedGw: 0, retiredGw: 6, directionOfTravel: 'stable' },
  { country: 'Poland', countryLabel: 'Poland', operatingGw: 27, constructionGw: 1, announcedGw: 0, retiredGw: 6, directionOfTravel: 'declining' },
  { country: 'Turkey', countryLabel: 'Türkiye', operatingGw: 21, constructionGw: 0, announcedGw: 3, retiredGw: 1, directionOfTravel: 'stable' },
  { country: 'Australia', countryLabel: 'Australia', operatingGw: 23, constructionGw: 0, announcedGw: 0, retiredGw: 6, directionOfTravel: 'declining' },
  { country: 'Vietnam', countryLabel: 'Vietnam', operatingGw: 26, constructionGw: 5, announcedGw: 8, retiredGw: 0, directionOfTravel: 'expanding' },
  { country: 'UK', countryLabel: 'United Kingdom', operatingGw: 0, constructionGw: 0, announcedGw: 0, retiredGw: 15, directionOfTravel: 'declining' },
];

// ── Climate finance flows ───────────────────────────────────────────────
// Cumulative pledges vs disbursements, primarily OECD DAC bilateral flows
// and the Green Climate Fund. All figures in USD billions.
export interface ClimateFinanceRow {
  donor: string;
  donorLabel: string;
  pledgedBn: number;
  disbursedBn: number;
  disbursedPct: number;
  primaryVehicle: string;
}

export const CLIMATE_FINANCE_FLOWS: ClimateFinanceRow[] = [
  { donor: 'JPN', donorLabel: 'Japan', pledgedBn: 60.0, disbursedBn: 48.2, disbursedPct: 80, primaryVehicle: 'JICA / bilateral loans' },
  { donor: 'DEU', donorLabel: 'Germany', pledgedBn: 45.0, disbursedBn: 33.4, disbursedPct: 74, primaryVehicle: 'KfW / GIZ' },
  { donor: 'FRA', donorLabel: 'France', pledgedBn: 40.0, disbursedBn: 28.1, disbursedPct: 70, primaryVehicle: 'AFD / bilateral' },
  { donor: 'USA', donorLabel: 'United States', pledgedBn: 55.0, disbursedBn: 22.5, disbursedPct: 41, primaryVehicle: 'USAID / DFC / MDBs' },
  { donor: 'UK', donorLabel: 'United Kingdom', pledgedBn: 22.6, disbursedBn: 15.4, disbursedPct: 68, primaryVehicle: 'ICF' },
  { donor: 'CAN', donorLabel: 'Canada', pledgedBn: 8.4, disbursedBn: 5.9, disbursedPct: 70, primaryVehicle: 'FinDev Canada / GCF' },
  { donor: 'ITA', donorLabel: 'Italy', pledgedBn: 4.2, disbursedBn: 2.6, disbursedPct: 62, primaryVehicle: 'CDP / bilateral' },
  { donor: 'NOR', donorLabel: 'Norway', pledgedBn: 3.6, disbursedBn: 3.1, disbursedPct: 86, primaryVehicle: 'Norfund / NICFI' },
  { donor: 'SWE', donorLabel: 'Sweden', pledgedBn: 3.3, disbursedBn: 2.7, disbursedPct: 82, primaryVehicle: 'Sida' },
  { donor: 'NLD', donorLabel: 'Netherlands', pledgedBn: 3.0, disbursedBn: 2.2, disbursedPct: 73, primaryVehicle: 'FMO / bilateral' },
  { donor: 'AUS', donorLabel: 'Australia', pledgedBn: 2.0, disbursedBn: 1.4, disbursedPct: 70, primaryVehicle: 'DFAT bilateral' },
  { donor: 'ESP', donorLabel: 'Spain', pledgedBn: 1.8, disbursedBn: 1.0, disbursedPct: 56, primaryVehicle: 'AECID / GCF' },
  { donor: 'GCF', donorLabel: 'Green Climate Fund', pledgedBn: 20.3, disbursedBn: 5.5, disbursedPct: 27, primaryVehicle: 'Multilateral (GCF)' },
];

// The "$100Bn per year by 2020" commitment made at Copenhagen 2009. Actual
// mobilised total per OECD reporting, in USD billions.
export const CLIMATE_FINANCE_100BN: { year: number; mobilisedBn: number }[] = [
  { year: 2013, mobilisedBn: 52.4 },
  { year: 2014, mobilisedBn: 61.8 },
  { year: 2015, mobilisedBn: 44.6 },
  { year: 2016, mobilisedBn: 58.6 },
  { year: 2017, mobilisedBn: 71.2 },
  { year: 2018, mobilisedBn: 78.3 },
  { year: 2019, mobilisedBn: 80.4 },
  { year: 2020, mobilisedBn: 83.3 },
  { year: 2021, mobilisedBn: 89.6 },
  { year: 2022, mobilisedBn: 115.9 },
];

// ── EM-DAT climate-related disasters ────────────────────────────────────
// Annual counts of hydrological (flood), meteorological (storm),
// climatological (drought, extreme temp, wildfire) events grouped by
// continent. Source: EM-DAT (CRED / UCLouvain).
export interface EmdatYearRow {
  year: number;
  africa: number;
  americas: number;
  asia: number;
  europe: number;
  oceania: number;
  total: number;
}

export const EMDAT_DISASTERS_1990_2024: EmdatYearRow[] = [
  { year: 1990, africa: 25, americas: 76, asia: 89, europe: 24, oceania: 6, total: 220 },
  { year: 1992, africa: 34, americas: 78, asia: 92, europe: 30, oceania: 8, total: 242 },
  { year: 1994, africa: 33, americas: 84, asia: 102, europe: 30, oceania: 9, total: 258 },
  { year: 1996, africa: 40, americas: 86, asia: 110, europe: 32, oceania: 10, total: 278 },
  { year: 1998, africa: 46, americas: 100, asia: 128, europe: 38, oceania: 11, total: 323 },
  { year: 2000, africa: 63, americas: 116, asia: 173, europe: 55, oceania: 15, total: 422 },
  { year: 2002, africa: 65, americas: 128, asia: 190, europe: 60, oceania: 18, total: 461 },
  { year: 2004, africa: 60, americas: 130, asia: 195, europe: 55, oceania: 20, total: 460 },
  { year: 2006, africa: 68, americas: 132, asia: 197, europe: 62, oceania: 19, total: 478 },
  { year: 2008, africa: 76, americas: 145, asia: 220, europe: 66, oceania: 22, total: 529 },
  { year: 2010, africa: 90, americas: 155, asia: 232, europe: 78, oceania: 25, total: 580 },
  { year: 2012, africa: 78, americas: 148, asia: 210, europe: 72, oceania: 22, total: 530 },
  { year: 2014, africa: 82, americas: 152, asia: 215, europe: 68, oceania: 21, total: 538 },
  { year: 2016, africa: 88, americas: 158, asia: 228, europe: 82, oceania: 24, total: 580 },
  { year: 2018, africa: 94, americas: 162, asia: 246, europe: 88, oceania: 25, total: 615 },
  { year: 2020, africa: 108, americas: 176, asia: 262, europe: 90, oceania: 28, total: 664 },
  { year: 2021, africa: 105, americas: 170, asia: 258, europe: 92, oceania: 30, total: 655 },
  { year: 2022, africa: 112, americas: 184, asia: 270, europe: 96, oceania: 26, total: 688 },
  { year: 2023, africa: 118, americas: 190, asia: 274, europe: 108, oceania: 28, total: 718 },
  { year: 2024, africa: 122, americas: 195, asia: 280, europe: 116, oceania: 32, total: 745 },
];

// Global temperature anomaly (°C vs 1951-1980 base), NASA GISTEMP v4.
// Used in the hero KPI block on the Climate Ledger.
export interface TempAnomalyPoint { year: number; anomalyC: number }
export const GLOBAL_TEMP_ANOMALY: TempAnomalyPoint[] = [
  { year: 1990, anomalyC: 0.45 },
  { year: 1995, anomalyC: 0.45 },
  { year: 2000, anomalyC: 0.41 },
  { year: 2005, anomalyC: 0.68 },
  { year: 2010, anomalyC: 0.72 },
  { year: 2015, anomalyC: 0.90 },
  { year: 2016, anomalyC: 1.01 },
  { year: 2017, anomalyC: 0.92 },
  { year: 2018, anomalyC: 0.85 },
  { year: 2019, anomalyC: 0.98 },
  { year: 2020, anomalyC: 1.02 },
  { year: 2021, anomalyC: 0.85 },
  { year: 2022, anomalyC: 0.89 },
  { year: 2023, anomalyC: 1.17 },
  { year: 2024, anomalyC: 1.28 },
];
