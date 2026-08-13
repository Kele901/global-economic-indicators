// Curated static data for the Health Ledger. Powers /health-ledger.
// Sources: WHO Global Health Expenditure Database, IHME Global Burden of
// Disease, Johns Hopkins JEE, Pharma Intelligence R&D concentration,
// WHO NCD Atlas, WHO Mental Health Atlas.
//
// Reasoning for keeping this curated rather than fully live:
// - WHO GHED is only released annually and the API is CORS-locked.
// - GBD is a massive dataset behind IHME's authenticated portal.
// - JEE, Pharma R&D and Mental Health Atlas are all report-based.
// The World Bank surfaces some overlapping series (SH.XPD.CHEX.GD.ZS,
// SH.DYN.MORT, SP.DYN.LE00.IN) which the ledger uses for live joins.

export const CURATED_LAST_UPDATED = '2025-09-15';

export interface HealthCountryMeta {
  code: string;
  name: string;
  region: 'North America' | 'Europe' | 'Asia' | 'Latin America' | 'Africa' | 'Oceania';
  income: 'HIC' | 'UMIC' | 'LMIC' | 'LIC';
}

export const HEALTH_COUNTRY_META: HealthCountryMeta[] = [
  { code: 'USA', name: 'United States',   region: 'North America', income: 'HIC' },
  { code: 'CAN', name: 'Canada',          region: 'North America', income: 'HIC' },
  { code: 'GBR', name: 'United Kingdom',  region: 'Europe',        income: 'HIC' },
  { code: 'DEU', name: 'Germany',         region: 'Europe',        income: 'HIC' },
  { code: 'FRA', name: 'France',          region: 'Europe',        income: 'HIC' },
  { code: 'ITA', name: 'Italy',           region: 'Europe',        income: 'HIC' },
  { code: 'ESP', name: 'Spain',           region: 'Europe',        income: 'HIC' },
  { code: 'NLD', name: 'Netherlands',     region: 'Europe',        income: 'HIC' },
  { code: 'SWE', name: 'Sweden',          region: 'Europe',        income: 'HIC' },
  { code: 'NOR', name: 'Norway',          region: 'Europe',        income: 'HIC' },
  { code: 'CHE', name: 'Switzerland',     region: 'Europe',        income: 'HIC' },
  { code: 'JPN', name: 'Japan',           region: 'Asia',          income: 'HIC' },
  { code: 'KOR', name: 'South Korea',     region: 'Asia',          income: 'HIC' },
  { code: 'CHN', name: 'China',           region: 'Asia',          income: 'UMIC' },
  { code: 'IND', name: 'India',           region: 'Asia',          income: 'LMIC' },
  { code: 'IDN', name: 'Indonesia',       region: 'Asia',          income: 'LMIC' },
  { code: 'BRA', name: 'Brazil',          region: 'Latin America', income: 'UMIC' },
  { code: 'MEX', name: 'Mexico',          region: 'Latin America', income: 'UMIC' },
  { code: 'RUS', name: 'Russia',          region: 'Europe',        income: 'UMIC' },
  { code: 'ZAF', name: 'South Africa',    region: 'Africa',        income: 'UMIC' },
  { code: 'NGA', name: 'Nigeria',         region: 'Africa',        income: 'LMIC' },
  { code: 'EGY', name: 'Egypt',           region: 'Africa',        income: 'LMIC' },
  { code: 'ETH', name: 'Ethiopia',        region: 'Africa',        income: 'LIC' },
  { code: 'AUS', name: 'Australia',       region: 'Oceania',       income: 'HIC' },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 2 — Spending vs outcomes
// Health spending %GDP + life expectancy pairs. WHO GHED 2023 + WB
// SP.DYN.LE00.IN 2023. The famous US outlier ($4.5T spend, ~78 yr life
// expectancy) reads loudest on this scatter.
// ─────────────────────────────────────────────────────────────────────
export interface SpendOutcomeRow {
  code: string;
  healthSpendPctGdp: number;
  healthSpendPerCapUsd: number;
  lifeExpectancy: number;
}

export const SPEND_OUTCOME_2023: SpendOutcomeRow[] = [
  { code: 'USA', healthSpendPctGdp: 17.4, healthSpendPerCapUsd: 12555, lifeExpectancy: 77.5 },
  { code: 'CHE', healthSpendPctGdp: 11.8, healthSpendPerCapUsd: 10365, lifeExpectancy: 83.9 },
  { code: 'DEU', healthSpendPctGdp: 12.6, healthSpendPerCapUsd:  7383, lifeExpectancy: 81.3 },
  { code: 'FRA', healthSpendPctGdp: 12.1, healthSpendPerCapUsd:  6631, lifeExpectancy: 82.5 },
  { code: 'GBR', healthSpendPctGdp: 11.3, healthSpendPerCapUsd:  5493, lifeExpectancy: 81.0 },
  { code: 'CAN', healthSpendPctGdp: 12.2, healthSpendPerCapUsd:  6319, lifeExpectancy: 82.0 },
  { code: 'JPN', healthSpendPctGdp: 11.5, healthSpendPerCapUsd:  4700, lifeExpectancy: 84.5 },
  { code: 'KOR', healthSpendPctGdp:  9.7, healthSpendPerCapUsd:  4570, lifeExpectancy: 83.4 },
  { code: 'ITA', healthSpendPctGdp:  9.4, healthSpendPerCapUsd:  4291, lifeExpectancy: 83.3 },
  { code: 'ESP', healthSpendPctGdp:  9.7, healthSpendPerCapUsd:  4300, lifeExpectancy: 83.2 },
  { code: 'NLD', healthSpendPctGdp: 11.2, healthSpendPerCapUsd:  6900, lifeExpectancy: 81.7 },
  { code: 'SWE', healthSpendPctGdp: 11.4, healthSpendPerCapUsd:  7050, lifeExpectancy: 82.9 },
  { code: 'NOR', healthSpendPctGdp: 10.9, healthSpendPerCapUsd:  9500, lifeExpectancy: 83.1 },
  { code: 'AUS', healthSpendPctGdp: 10.7, healthSpendPerCapUsd:  6360, lifeExpectancy: 83.2 },
  { code: 'CHN', healthSpendPctGdp:  5.4, healthSpendPerCapUsd:   720, lifeExpectancy: 78.6 },
  { code: 'RUS', healthSpendPctGdp:  7.4, healthSpendPerCapUsd:   970, lifeExpectancy: 72.8 },
  { code: 'BRA', healthSpendPctGdp:  9.9, healthSpendPerCapUsd:   890, lifeExpectancy: 76.0 },
  { code: 'MEX', healthSpendPctGdp:  6.2, healthSpendPerCapUsd:   675, lifeExpectancy: 75.2 },
  { code: 'IND', healthSpendPctGdp:  3.3, healthSpendPerCapUsd:    85, lifeExpectancy: 70.2 },
  { code: 'IDN', healthSpendPctGdp:  3.4, healthSpendPerCapUsd:   170, lifeExpectancy: 71.9 },
  { code: 'ZAF', healthSpendPctGdp:  8.5, healthSpendPerCapUsd:   580, lifeExpectancy: 65.4 },
  { code: 'NGA', healthSpendPctGdp:  3.4, healthSpendPerCapUsd:    85, lifeExpectancy: 53.6 },
  { code: 'EGY', healthSpendPctGdp:  4.4, healthSpendPerCapUsd:   170, lifeExpectancy: 70.2 },
  { code: 'ETH', healthSpendPctGdp:  3.6, healthSpendPerCapUsd:    30, lifeExpectancy: 65.6 },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 3 — Life-expectancy divergence 1990 → 2023
// WHO SP.DYN.LE00.IN. HIC average pulled ahead of LIC by ~15 years and
// widened again after COVID.
// ─────────────────────────────────────────────────────────────────────
export interface LifeExpectancyPoint {
  year: number;
  hicAvg: number;
  umicAvg: number;
  lmicAvg: number;
  licAvg: number;
}

export const LIFE_EXPECTANCY_1990_2023: LifeExpectancyPoint[] = [
  { year: 1990, hicAvg: 74.9, umicAvg: 68.9, lmicAvg: 60.6, licAvg: 50.9 },
  { year: 1995, hicAvg: 76.1, umicAvg: 69.9, lmicAvg: 62.4, licAvg: 51.9 },
  { year: 2000, hicAvg: 77.3, umicAvg: 71.2, lmicAvg: 64.4, licAvg: 53.8 },
  { year: 2005, hicAvg: 78.6, umicAvg: 72.5, lmicAvg: 66.2, licAvg: 57.6 },
  { year: 2010, hicAvg: 79.7, umicAvg: 73.5, lmicAvg: 67.8, licAvg: 60.5 },
  { year: 2015, hicAvg: 80.6, umicAvg: 74.7, lmicAvg: 69.2, licAvg: 62.8 },
  { year: 2019, hicAvg: 81.3, umicAvg: 75.6, lmicAvg: 70.5, licAvg: 64.4 },
  { year: 2020, hicAvg: 80.5, umicAvg: 74.9, lmicAvg: 70.3, licAvg: 64.3 },
  { year: 2021, hicAvg: 80.0, umicAvg: 73.9, lmicAvg: 69.6, licAvg: 63.7 },
  { year: 2022, hicAvg: 80.8, umicAvg: 74.6, lmicAvg: 70.5, licAvg: 64.5 },
  { year: 2023, hicAvg: 81.1, umicAvg: 75.2, lmicAvg: 71.0, licAvg: 64.9 },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 4 — Pandemic preparedness (Johns Hopkins Global Health
// Security Index 2021 + WHO JEE combined). Higher = more prepared.
// ─────────────────────────────────────────────────────────────────────
export interface PandemicReadinessRow {
  code: string;
  ghsIndex: number;      // 0-100
  jeeCoreCapacity: number; // 0-100
}

export const PANDEMIC_READINESS_2024: PandemicReadinessRow[] = [
  { code: 'USA', ghsIndex: 75.9, jeeCoreCapacity: 78 },
  { code: 'AUS', ghsIndex: 71.1, jeeCoreCapacity: 79 },
  { code: 'GBR', ghsIndex: 67.2, jeeCoreCapacity: 78 },
  { code: 'CAN', ghsIndex: 69.8, jeeCoreCapacity: 80 },
  { code: 'FRA', ghsIndex: 61.9, jeeCoreCapacity: 75 },
  { code: 'DEU', ghsIndex: 65.5, jeeCoreCapacity: 76 },
  { code: 'KOR', ghsIndex: 65.4, jeeCoreCapacity: 82 },
  { code: 'JPN', ghsIndex: 60.5, jeeCoreCapacity: 74 },
  { code: 'CHN', ghsIndex: 47.5, jeeCoreCapacity: 68 },
  { code: 'IND', ghsIndex: 42.8, jeeCoreCapacity: 55 },
  { code: 'BRA', ghsIndex: 51.2, jeeCoreCapacity: 62 },
  { code: 'RUS', ghsIndex: 49.1, jeeCoreCapacity: 60 },
  { code: 'ZAF', ghsIndex: 50.2, jeeCoreCapacity: 58 },
  { code: 'NGA', ghsIndex: 37.8, jeeCoreCapacity: 40 },
  { code: 'IDN', ghsIndex: 50.4, jeeCoreCapacity: 55 },
  { code: 'MEX', ghsIndex: 57.0, jeeCoreCapacity: 65 },
  { code: 'EGY', ghsIndex: 39.9, jeeCoreCapacity: 48 },
  { code: 'ETH', ghsIndex: 39.7, jeeCoreCapacity: 42 },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 5 — Pharma R&D concentration. Top 20 companies do 60%+ of
// global pharma R&D spend. Pharma Intelligence / Statista 2024.
// ─────────────────────────────────────────────────────────────────────
export interface PharmaFirm {
  rank: number;
  firm: string;
  country: string;
  rdBillionsUsd: number;
  rdPctOfRevenue: number;
}

export const PHARMA_TOP_15_RD_2024: PharmaFirm[] = [
  { rank:  1, firm: 'Roche',                  country: 'CHE', rdBillionsUsd: 15.6, rdPctOfRevenue: 22.9 },
  { rank:  2, firm: 'Merck & Co (MSD)',       country: 'USA', rdBillionsUsd: 15.4, rdPctOfRevenue: 25.2 },
  { rank:  3, firm: 'AstraZeneca',            country: 'GBR', rdBillionsUsd: 13.6, rdPctOfRevenue: 28.6 },
  { rank:  4, firm: 'Johnson & Johnson',      country: 'USA', rdBillionsUsd: 15.1, rdPctOfRevenue: 17.4 },
  { rank:  5, firm: 'Pfizer',                 country: 'USA', rdBillionsUsd: 10.8, rdPctOfRevenue: 18.4 },
  { rank:  6, firm: 'Novartis',               country: 'CHE', rdBillionsUsd:  9.9, rdPctOfRevenue: 21.6 },
  { rank:  7, firm: 'Eli Lilly',              country: 'USA', rdBillionsUsd:  9.3, rdPctOfRevenue: 22.6 },
  { rank:  8, firm: 'AbbVie',                 country: 'USA', rdBillionsUsd:  7.7, rdPctOfRevenue: 14.0 },
  { rank:  9, firm: 'GSK',                    country: 'GBR', rdBillionsUsd:  7.6, rdPctOfRevenue: 20.1 },
  { rank: 10, firm: 'Sanofi',                 country: 'FRA', rdBillionsUsd:  7.5, rdPctOfRevenue: 15.7 },
  { rank: 11, firm: 'Bristol Myers Squibb',   country: 'USA', rdBillionsUsd:  9.5, rdPctOfRevenue: 20.6 },
  { rank: 12, firm: 'Novo Nordisk',           country: 'DNK', rdBillionsUsd:  5.8, rdPctOfRevenue: 13.5 },
  { rank: 13, firm: 'Boehringer Ingelheim',   country: 'DEU', rdBillionsUsd:  6.7, rdPctOfRevenue: 21.6 },
  { rank: 14, firm: 'Takeda',                 country: 'JPN', rdBillionsUsd:  4.9, rdPctOfRevenue: 16.4 },
  { rank: 15, firm: 'Bayer',                  country: 'DEU', rdBillionsUsd:  6.2, rdPctOfRevenue: 12.6 },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 6 — Dual burden of obesity and undernutrition. WHO 2022 data.
// ─────────────────────────────────────────────────────────────────────
export interface DualBurdenRow {
  code: string;
  obesityPctAdults: number;
  undernourishedPctPop: number;
}

export const DUAL_BURDEN_2022: DualBurdenRow[] = [
  { code: 'USA', obesityPctAdults: 42.7, undernourishedPctPop: 2.5 },
  { code: 'MEX', obesityPctAdults: 36.1, undernourishedPctPop: 6.1 },
  { code: 'GBR', obesityPctAdults: 27.8, undernourishedPctPop: 2.5 },
  { code: 'DEU', obesityPctAdults: 22.3, undernourishedPctPop: 2.5 },
  { code: 'FRA', obesityPctAdults: 21.6, undernourishedPctPop: 2.5 },
  { code: 'ESP', obesityPctAdults: 23.8, undernourishedPctPop: 2.5 },
  { code: 'ITA', obesityPctAdults: 19.9, undernourishedPctPop: 2.5 },
  { code: 'JPN', obesityPctAdults:  4.5, undernourishedPctPop: 2.5 },
  { code: 'KOR', obesityPctAdults:  6.8, undernourishedPctPop: 2.5 },
  { code: 'CHN', obesityPctAdults:  6.6, undernourishedPctPop: 2.5 },
  { code: 'IND', obesityPctAdults:  3.9, undernourishedPctPop: 13.7 },
  { code: 'IDN', obesityPctAdults:  6.9, undernourishedPctPop:  5.9 },
  { code: 'BRA', obesityPctAdults: 22.1, undernourishedPctPop:  4.7 },
  { code: 'ZAF', obesityPctAdults: 28.3, undernourishedPctPop:  8.5 },
  { code: 'NGA', obesityPctAdults:  8.9, undernourishedPctPop: 15.9 },
  { code: 'EGY', obesityPctAdults: 32.0, undernourishedPctPop:  7.4 },
  { code: 'ETH', obesityPctAdults:  4.5, undernourishedPctPop: 22.0 },
  { code: 'RUS', obesityPctAdults: 23.1, undernourishedPctPop:  2.5 },
  { code: 'AUS', obesityPctAdults: 32.0, undernourishedPctPop:  2.5 },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 7 — Mental health treatment gap. WHO Mental Health Atlas 2020.
// % of adults with a diagnosable disorder receiving any treatment.
// ─────────────────────────────────────────────────────────────────────
export interface MentalHealthRow {
  code: string;
  prevalencePct: number;
  treatmentGapPct: number;  // % NOT receiving treatment
  psychiatristsPer100k: number;
}

export const MENTAL_HEALTH_2020: MentalHealthRow[] = [
  { code: 'USA', prevalencePct: 21.0, treatmentGapPct: 43.8, psychiatristsPer100k: 10.5 },
  { code: 'CAN', prevalencePct: 17.4, treatmentGapPct: 50.4, psychiatristsPer100k: 12.6 },
  { code: 'GBR', prevalencePct: 17.0, treatmentGapPct: 65.2, psychiatristsPer100k:  9.1 },
  { code: 'DEU', prevalencePct: 20.8, treatmentGapPct: 46.9, psychiatristsPer100k: 13.2 },
  { code: 'FRA', prevalencePct: 18.5, treatmentGapPct: 54.4, psychiatristsPer100k: 22.9 },
  { code: 'ITA', prevalencePct: 15.5, treatmentGapPct: 66.7, psychiatristsPer100k:  9.9 },
  { code: 'ESP', prevalencePct: 15.6, treatmentGapPct: 63.1, psychiatristsPer100k:  9.7 },
  { code: 'NLD', prevalencePct: 20.7, treatmentGapPct: 41.4, psychiatristsPer100k: 24.2 },
  { code: 'AUS', prevalencePct: 21.4, treatmentGapPct: 60.8, psychiatristsPer100k: 11.5 },
  { code: 'JPN', prevalencePct: 11.4, treatmentGapPct: 78.9, psychiatristsPer100k: 11.9 },
  { code: 'KOR', prevalencePct: 12.7, treatmentGapPct: 88.1, psychiatristsPer100k:  5.5 },
  { code: 'CHN', prevalencePct: 16.6, treatmentGapPct: 91.9, psychiatristsPer100k:  2.2 },
  { code: 'IND', prevalencePct: 13.7, treatmentGapPct: 92.0, psychiatristsPer100k:  0.75 },
  { code: 'BRA', prevalencePct: 18.4, treatmentGapPct: 76.5, psychiatristsPer100k:  3.4 },
  { code: 'ZAF', prevalencePct: 20.5, treatmentGapPct: 92.1, psychiatristsPer100k:  1.5 },
  { code: 'NGA', prevalencePct: 12.5, treatmentGapPct: 93.8, psychiatristsPer100k:  0.15 },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 8 — Disease burden shift 1990 → 2023 (IHME GBD). Global
// DALYs by broad cause category. Communicable and maternal down;
// NCDs and injuries up.
// ─────────────────────────────────────────────────────────────────────
export interface BurdenPoint {
  year: number;
  cardiovascular: number;   // DALY rate per 100k
  cancer: number;
  respiratory: number;
  mental: number;
  communicable: number;     // infectious + maternal + neonatal + nutritional
  injuries: number;
}

export const DISEASE_BURDEN_1990_2023: BurdenPoint[] = [
  { year: 1990, cardiovascular: 5100, cancer: 2400, respiratory: 1900, mental: 1800, communicable: 15300, injuries: 3100 },
  { year: 2000, cardiovascular: 5000, cancer: 2500, respiratory: 1800, mental: 1900, communicable: 12500, injuries: 2900 },
  { year: 2010, cardiovascular: 4800, cancer: 2600, respiratory: 1800, mental: 2000, communicable:  9100, injuries: 2600 },
  { year: 2019, cardiovascular: 4500, cancer: 2700, respiratory: 1750, mental: 2100, communicable:  6900, injuries: 2400 },
  { year: 2020, cardiovascular: 4700, cancer: 2650, respiratory: 1900, mental: 2200, communicable:  8500, injuries: 2350 },
  { year: 2021, cardiovascular: 4800, cancer: 2650, respiratory: 2050, mental: 2300, communicable:  9200, injuries: 2350 },
  { year: 2022, cardiovascular: 4600, cancer: 2680, respiratory: 1800, mental: 2250, communicable:  7500, injuries: 2350 },
  { year: 2023, cardiovascular: 4500, cancer: 2700, respiratory: 1750, mental: 2200, communicable:  7100, injuries: 2350 },
];
