// Curated static data for the Labor Ledger. Powers /labor-ledger.
// Sources: ILOSTAT, OECD Employment Outlook 2024, OECD "Job Creation
// and Local Economic Development" 2024, UN DESA World Population
// Prospects 2024, OECD "Employment Implications of Generative AI" 2024.
//
// Rationale: ILO and OECD publish these on report cycles; live joins
// against WB SL.UEM.TOTL.ZS / SL.TLF.CACT.ZS are still used on the
// page for freshness where WB has coverage.

export const CURATED_LAST_UPDATED = '2025-09-30';

export interface LaborCountryMeta {
  code: string;
  name: string;
  region: 'North America' | 'Europe' | 'Asia' | 'Latin America' | 'Africa' | 'Oceania';
}

export const LABOR_COUNTRY_META: LaborCountryMeta[] = [
  { code: 'USA', name: 'United States',   region: 'North America' },
  { code: 'CAN', name: 'Canada',          region: 'North America' },
  { code: 'MEX', name: 'Mexico',          region: 'Latin America' },
  { code: 'GBR', name: 'United Kingdom',  region: 'Europe' },
  { code: 'DEU', name: 'Germany',         region: 'Europe' },
  { code: 'FRA', name: 'France',          region: 'Europe' },
  { code: 'ITA', name: 'Italy',           region: 'Europe' },
  { code: 'ESP', name: 'Spain',           region: 'Europe' },
  { code: 'NLD', name: 'Netherlands',     region: 'Europe' },
  { code: 'SWE', name: 'Sweden',          region: 'Europe' },
  { code: 'JPN', name: 'Japan',           region: 'Asia' },
  { code: 'KOR', name: 'South Korea',     region: 'Asia' },
  { code: 'CHN', name: 'China',           region: 'Asia' },
  { code: 'IND', name: 'India',           region: 'Asia' },
  { code: 'IDN', name: 'Indonesia',       region: 'Asia' },
  { code: 'BRA', name: 'Brazil',          region: 'Latin America' },
  { code: 'ZAF', name: 'South Africa',    region: 'Africa' },
  { code: 'NGA', name: 'Nigeria',         region: 'Africa' },
  { code: 'AUS', name: 'Australia',       region: 'Oceania' },
  { code: 'TUR', name: 'Turkey',          region: 'Europe' },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 2 — Wages: median hourly wage USD-PPP 2023 (ILO Wage Report).
// ─────────────────────────────────────────────────────────────────────
export interface WageRow {
  code: string;
  medianHourlyUsdPpp: number;
  realWageGrowth2019to2023Pct: number;
}

export const WAGES_2023: WageRow[] = [
  { code: 'CHE', medianHourlyUsdPpp: 32.5, realWageGrowth2019to2023Pct:  3.4 },
  { code: 'USA', medianHourlyUsdPpp: 24.8, realWageGrowth2019to2023Pct:  1.7 },
  { code: 'AUS', medianHourlyUsdPpp: 22.6, realWageGrowth2019to2023Pct: -0.3 },
  { code: 'DEU', medianHourlyUsdPpp: 21.4, realWageGrowth2019to2023Pct: -3.1 },
  { code: 'CAN', medianHourlyUsdPpp: 22.1, realWageGrowth2019to2023Pct:  0.8 },
  { code: 'NLD', medianHourlyUsdPpp: 22.3, realWageGrowth2019to2023Pct: -1.2 },
  { code: 'SWE', medianHourlyUsdPpp: 20.5, realWageGrowth2019to2023Pct: -2.6 },
  { code: 'GBR', medianHourlyUsdPpp: 19.6, realWageGrowth2019to2023Pct: -0.5 },
  { code: 'FRA', medianHourlyUsdPpp: 18.7, realWageGrowth2019to2023Pct: -0.9 },
  { code: 'JPN', medianHourlyUsdPpp: 17.9, realWageGrowth2019to2023Pct: -3.4 },
  { code: 'ITA', medianHourlyUsdPpp: 17.2, realWageGrowth2019to2023Pct: -1.5 },
  { code: 'ESP', medianHourlyUsdPpp: 15.4, realWageGrowth2019to2023Pct: -0.7 },
  { code: 'KOR', medianHourlyUsdPpp: 15.8, realWageGrowth2019to2023Pct:  1.9 },
  { code: 'TUR', medianHourlyUsdPpp:  6.5, realWageGrowth2019to2023Pct:-15.4 },
  { code: 'CHN', medianHourlyUsdPpp:  6.1, realWageGrowth2019to2023Pct:  8.6 },
  { code: 'MEX', medianHourlyUsdPpp:  5.9, realWageGrowth2019to2023Pct:  6.5 },
  { code: 'BRA', medianHourlyUsdPpp:  5.4, realWageGrowth2019to2023Pct:  3.2 },
  { code: 'ZAF', medianHourlyUsdPpp:  4.7, realWageGrowth2019to2023Pct: -1.0 },
  { code: 'IDN', medianHourlyUsdPpp:  3.4, realWageGrowth2019to2023Pct:  2.7 },
  { code: 'IND', medianHourlyUsdPpp:  1.9, realWageGrowth2019to2023Pct:  1.4 },
  { code: 'NGA', medianHourlyUsdPpp:  1.4, realWageGrowth2019to2023Pct: -7.8 },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 3 — Union density (OECD 2023). % of employees who are
// union members. Not all countries covered.
// ─────────────────────────────────────────────────────────────────────
export interface UnionRow {
  code: string;
  unionDensityPct: number;
  collectiveBargainingCoveragePct: number;
}

export const UNION_DENSITY_2023: UnionRow[] = [
  { code: 'SWE', unionDensityPct: 65.2, collectiveBargainingCoveragePct: 88 },
  { code: 'ITA', unionDensityPct: 32.5, collectiveBargainingCoveragePct: 100 },
  { code: 'CAN', unionDensityPct: 28.9, collectiveBargainingCoveragePct: 30 },
  { code: 'AUS', unionDensityPct: 12.5, collectiveBargainingCoveragePct: 61 },
  { code: 'GBR', unionDensityPct: 22.4, collectiveBargainingCoveragePct: 27 },
  { code: 'NLD', unionDensityPct: 15.4, collectiveBargainingCoveragePct: 76 },
  { code: 'DEU', unionDensityPct: 15.9, collectiveBargainingCoveragePct: 54 },
  { code: 'ESP', unionDensityPct: 12.7, collectiveBargainingCoveragePct: 80 },
  { code: 'FRA', unionDensityPct:  7.8, collectiveBargainingCoveragePct: 98 },
  { code: 'USA', unionDensityPct:  9.9, collectiveBargainingCoveragePct: 12 },
  { code: 'JPN', unionDensityPct: 16.5, collectiveBargainingCoveragePct: 17 },
  { code: 'KOR', unionDensityPct: 14.2, collectiveBargainingCoveragePct: 15 },
  { code: 'MEX', unionDensityPct: 12.3, collectiveBargainingCoveragePct: 10 },
  { code: 'TUR', unionDensityPct:  9.9, collectiveBargainingCoveragePct:  8 },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 4 — Informal employment as % of total employment (ILO 2023).
// ─────────────────────────────────────────────────────────────────────
export interface InformalRow {
  code: string;
  informalPct: number;
}

export const INFORMAL_EMPLOYMENT_2023: InformalRow[] = [
  { code: 'NGA', informalPct: 92.6 },
  { code: 'IND', informalPct: 89.7 },
  { code: 'ETH', informalPct: 88.5 },
  { code: 'IDN', informalPct: 78.4 },
  { code: 'ZAF', informalPct: 34.0 },
  { code: 'MEX', informalPct: 55.1 },
  { code: 'BRA', informalPct: 39.2 },
  { code: 'CHN', informalPct: 54.6 },
  { code: 'TUR', informalPct: 30.7 },
  { code: 'RUS', informalPct: 19.5 },
  { code: 'USA', informalPct: 18.6 },
  { code: 'KOR', informalPct: 24.7 },
  { code: 'GBR', informalPct: 12.7 },
  { code: 'DEU', informalPct: 10.4 },
  { code: 'FRA', informalPct:  9.8 },
  { code: 'ITA', informalPct: 15.6 },
  { code: 'ESP', informalPct: 13.9 },
  { code: 'JPN', informalPct: 11.1 },
  { code: 'AUS', informalPct: 11.4 },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 5 — Working-age population trajectory 2000-2050 (UN DESA WPP
// 2024). Millions of 15-64 year olds. The cliff is China/Japan/EU.
// ─────────────────────────────────────────────────────────────────────
export interface WorkingAgePoint {
  year: number;
  china: number;
  india: number;
  usa: number;
  eu27: number;
  japan: number;
  nigeria: number;
  brazil: number;
  indonesia: number;
}

export const WORKING_AGE_2000_2050: WorkingAgePoint[] = [
  { year: 2000, china: 862, india: 620, usa: 189, eu27: 305, japan: 86.5, nigeria:  62, brazil: 111, indonesia: 136 },
  { year: 2010, china: 998, india: 762, usa: 208, eu27: 314, japan: 81.5, nigeria:  82, brazil: 132, indonesia: 162 },
  { year: 2020, china:1002, india: 913, usa: 217, eu27: 305, japan: 74.2, nigeria: 113, brazil: 147, indonesia: 187 },
  { year: 2024, china: 987, india: 951, usa: 220, eu27: 297, japan: 71.9, nigeria: 128, brazil: 149, indonesia: 194 },
  { year: 2030, china: 943, india: 995, usa: 222, eu27: 283, japan: 68.5, nigeria: 155, brazil: 149, indonesia: 202 },
  { year: 2040, china: 830, india:1043, usa: 220, eu27: 262, japan: 62.9, nigeria: 218, brazil: 143, indonesia: 213 },
  { year: 2050, china: 727, india:1057, usa: 216, eu27: 243, japan: 55.7, nigeria: 292, brazil: 135, indonesia: 216 },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 6 — AI-displacement risk (OECD 2024). % of employment in
// occupations with "high automation exposure" (top-tercile AI OES score).
// ─────────────────────────────────────────────────────────────────────
export interface AiRiskRow {
  code: string;
  highExposurePct: number;
  complementarityScore: number;   // 0-1, higher = AI likely augments not replaces
}

export const AI_DISPLACEMENT_RISK_2024: AiRiskRow[] = [
  { code: 'LUX', highExposurePct: 39.1, complementarityScore: 0.72 },
  { code: 'DEU', highExposurePct: 34.2, complementarityScore: 0.61 },
  { code: 'GBR', highExposurePct: 34.8, complementarityScore: 0.63 },
  { code: 'NLD', highExposurePct: 34.1, complementarityScore: 0.65 },
  { code: 'CHE', highExposurePct: 33.5, complementarityScore: 0.68 },
  { code: 'SWE', highExposurePct: 33.4, complementarityScore: 0.62 },
  { code: 'USA', highExposurePct: 33.0, complementarityScore: 0.60 },
  { code: 'FRA', highExposurePct: 32.5, complementarityScore: 0.58 },
  { code: 'JPN', highExposurePct: 31.4, complementarityScore: 0.58 },
  { code: 'ITA', highExposurePct: 29.7, complementarityScore: 0.55 },
  { code: 'AUS', highExposurePct: 30.9, complementarityScore: 0.59 },
  { code: 'KOR', highExposurePct: 30.1, complementarityScore: 0.61 },
  { code: 'ESP', highExposurePct: 28.4, complementarityScore: 0.54 },
  { code: 'CAN', highExposurePct: 32.1, complementarityScore: 0.62 },
  { code: 'MEX', highExposurePct: 20.5, complementarityScore: 0.42 },
  { code: 'TUR', highExposurePct: 22.6, complementarityScore: 0.43 },
  { code: 'BRA', highExposurePct: 21.0, complementarityScore: 0.44 },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 7 — Gender gap in labour force participation (ILO 2023).
// M-F percentage-point gap.
// ─────────────────────────────────────────────────────────────────────
export interface GenderGapRow {
  code: string;
  maleLfp: number;
  femaleLfp: number;
}

export const GENDER_GAP_2023: GenderGapRow[] = [
  { code: 'NOR', maleLfp: 74.6, femaleLfp: 68.7 },
  { code: 'SWE', maleLfp: 75.9, femaleLfp: 71.0 },
  { code: 'CAN', maleLfp: 71.4, femaleLfp: 61.8 },
  { code: 'GBR', maleLfp: 68.6, femaleLfp: 59.2 },
  { code: 'DEU', maleLfp: 66.3, femaleLfp: 56.9 },
  { code: 'AUS', maleLfp: 71.7, femaleLfp: 63.1 },
  { code: 'FRA', maleLfp: 62.3, femaleLfp: 53.6 },
  { code: 'NLD', maleLfp: 71.9, femaleLfp: 63.5 },
  { code: 'USA', maleLfp: 68.2, femaleLfp: 57.4 },
  { code: 'JPN', maleLfp: 71.5, femaleLfp: 55.0 },
  { code: 'KOR', maleLfp: 73.4, femaleLfp: 55.1 },
  { code: 'ESP', maleLfp: 64.7, femaleLfp: 54.5 },
  { code: 'ITA', maleLfp: 58.5, femaleLfp: 42.8 },
  { code: 'BRA', maleLfp: 72.8, femaleLfp: 55.6 },
  { code: 'CHN', maleLfp: 75.8, femaleLfp: 60.5 },
  { code: 'TUR', maleLfp: 70.9, femaleLfp: 34.2 },
  { code: 'MEX', maleLfp: 76.2, femaleLfp: 48.6 },
  { code: 'IND', maleLfp: 76.6, femaleLfp: 27.6 },
  { code: 'NGA', maleLfp: 61.6, femaleLfp: 47.6 },
  { code: 'ZAF', maleLfp: 60.2, femaleLfp: 51.8 },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 8 — Youth unemployment 2010-2024 (ILO). % of 15-24 year olds.
// ─────────────────────────────────────────────────────────────────────
export interface YouthUnempPoint {
  year: number;
  world: number;
  advanced: number;
  emerging: number;
  developing: number;
}

export const YOUTH_UNEMPLOYMENT_2010_2024: YouthUnempPoint[] = [
  { year: 2010, world: 13.1, advanced: 18.4, emerging: 12.8, developing: 11.9 },
  { year: 2012, world: 13.0, advanced: 17.9, emerging: 12.6, developing: 11.8 },
  { year: 2014, world: 12.8, advanced: 16.1, emerging: 12.4, developing: 11.7 },
  { year: 2016, world: 12.9, advanced: 14.3, emerging: 12.9, developing: 11.5 },
  { year: 2018, world: 13.6, advanced: 11.2, emerging: 14.2, developing: 11.3 },
  { year: 2019, world: 13.6, advanced: 10.7, emerging: 14.4, developing: 11.2 },
  { year: 2020, world: 15.2, advanced: 14.5, emerging: 15.7, developing: 12.9 },
  { year: 2021, world: 15.6, advanced: 13.4, emerging: 16.2, developing: 12.9 },
  { year: 2022, world: 13.6, advanced: 10.6, emerging: 14.5, developing: 11.9 },
  { year: 2023, world: 13.2, advanced: 10.4, emerging: 14.1, developing: 11.6 },
  { year: 2024, world: 12.6, advanced: 10.5, emerging: 13.1, developing: 11.5 },
];
