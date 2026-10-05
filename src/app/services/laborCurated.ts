// Curated static data for the Labor Ledger. Powers /labor-ledger.
// Sources: ILO Global Wage Report 2024-25, OECD/AIAS ICTWSS (OECD
// Data Explorer DF_TUD / DF_CBC), ILOSTAT SDG 8.3.1 informal
// employment, ILOSTAT modelled estimates (labour force participation,
// youth unemployment), UN DESA World Population Prospects 2024, OECD
// "Employment Implications of Generative AI" 2024.
//
// Rationale: ILO and OECD publish these on report cycles; live joins
// against WB SL.UEM.TOTL.ZS / SL.TLF.CACT.ZS are still used on the
// page for freshness where WB has coverage. Rows carry their own
// observation year where countries report on different cycles.

export const CURATED_LAST_UPDATED = '2026-10-05';

export interface LaborCountryMeta {
  code: string;
  name: string;
  short?: string;
  region: 'North America' | 'Europe' | 'Asia' | 'Latin America' | 'Africa' | 'Oceania' | 'Middle East';
}

export const LABOR_COUNTRY_META: LaborCountryMeta[] = [
  { code: 'USA', name: 'United States',   short: 'US',        region: 'North America' },
  { code: 'CAN', name: 'Canada',                              region: 'North America' },
  { code: 'MEX', name: 'Mexico',                              region: 'Latin America' },
  { code: 'GBR', name: 'United Kingdom',  short: 'UK',        region: 'Europe' },
  { code: 'DEU', name: 'Germany',                             region: 'Europe' },
  { code: 'FRA', name: 'France',                              region: 'Europe' },
  { code: 'ITA', name: 'Italy',                               region: 'Europe' },
  { code: 'ESP', name: 'Spain',                               region: 'Europe' },
  { code: 'NLD', name: 'Netherlands',                         region: 'Europe' },
  { code: 'BEL', name: 'Belgium',                             region: 'Europe' },
  { code: 'PRT', name: 'Portugal',                            region: 'Europe' },
  { code: 'POL', name: 'Poland',                              region: 'Europe' },
  { code: 'SWE', name: 'Sweden',                              region: 'Europe' },
  { code: 'NOR', name: 'Norway',                              region: 'Europe' },
  { code: 'CHE', name: 'Switzerland',                         region: 'Europe' },
  { code: 'RUS', name: 'Russia',                              region: 'Europe' },
  { code: 'TUR', name: 'Turkey',                              region: 'Europe' },
  { code: 'ISR', name: 'Israel',                              region: 'Middle East' },
  { code: 'JPN', name: 'Japan',                               region: 'Asia' },
  { code: 'KOR', name: 'South Korea',     short: 'Korea',     region: 'Asia' },
  { code: 'CHN', name: 'China',                               region: 'Asia' },
  { code: 'IND', name: 'India',                               region: 'Asia' },
  { code: 'IDN', name: 'Indonesia',                           region: 'Asia' },
  { code: 'BRA', name: 'Brazil',                              region: 'Latin America' },
  { code: 'ZAF', name: 'South Africa',    short: 'S. Africa', region: 'Africa' },
  { code: 'NGA', name: 'Nigeria',                             region: 'Africa' },
  { code: 'ETH', name: 'Ethiopia',                            region: 'Africa' },
  { code: 'AUS', name: 'Australia',                           region: 'Oceania' },
];

export function laborCountryName(code: string, { short = false } = {}): string {
  const meta = LABOR_COUNTRY_META.find(m => m.code === code);
  if (!meta) return code;
  return short ? meta.short ?? meta.name : meta.name;
}

// ─────────────────────────────────────────────────────────────────────
// Chapter 2 — Wages: median hourly wage USD-PPP 2023 (ILO Global Wage
// Report 2024-25, still the latest edition).
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
// Chapter 3 — Union density and collective-bargaining coverage, OECD/AIAS
// ICTWSS via OECD Data Explorer (DF_TUD, DF_CBC). Latest year per
// country; most are 2023-24.
// ─────────────────────────────────────────────────────────────────────
export interface UnionRow {
  code: string;
  unionDensityPct: number;
  densityYear: number;
  collectiveBargainingCoveragePct: number;
  coverageYear: number;
}

export const UNION_DENSITY_LATEST: UnionRow[] = [
  { code: 'SWE', unionDensityPct: 65.9, densityYear: 2024, collectiveBargainingCoveragePct:  88.0, coverageYear: 2024 },
  { code: 'NOR', unionDensityPct: 52.1, densityYear: 2024, collectiveBargainingCoveragePct:  72.0, coverageYear: 2022 },
  { code: 'BEL', unionDensityPct: 47.5, densityYear: 2023, collectiveBargainingCoveragePct: 100.0, coverageYear: 2024 },
  { code: 'ITA', unionDensityPct: 30.2, densityYear: 2024, collectiveBargainingCoveragePct: 100.0, coverageYear: 2024 },
  { code: 'CAN', unionDensityPct: 28.3, densityYear: 2024, collectiveBargainingCoveragePct:  30.2, coverageYear: 2024 },
  { code: 'ISR', unionDensityPct: 27.2, densityYear: 2023, collectiveBargainingCoveragePct:  45.8, coverageYear: 2023 },
  { code: 'GBR', unionDensityPct: 22.0, densityYear: 2024, collectiveBargainingCoveragePct:  40.2, coverageYear: 2024 },
  { code: 'JPN', unionDensityPct: 16.2, densityYear: 2024, collectiveBargainingCoveragePct:  15.2, coverageYear: 2023 },
  { code: 'DEU', unionDensityPct: 14.1, densityYear: 2024, collectiveBargainingCoveragePct:  49.0, coverageYear: 2024 },
  { code: 'PRT', unionDensityPct: 13.9, densityYear: 2020, collectiveBargainingCoveragePct:  83.3, coverageYear: 2023 },
  { code: 'NLD', unionDensityPct: 13.8, densityYear: 2023, collectiveBargainingCoveragePct:  72.1, coverageYear: 2024 },
  { code: 'MEX', unionDensityPct: 12.8, densityYear: 2024, collectiveBargainingCoveragePct:   8.2, coverageYear: 2024 },
  { code: 'CHE', unionDensityPct: 12.7, densityYear: 2023, collectiveBargainingCoveragePct:  51.5, coverageYear: 2021 },
  { code: 'KOR', unionDensityPct: 12.5, densityYear: 2023, collectiveBargainingCoveragePct:  16.3, coverageYear: 2023 },
  { code: 'ESP', unionDensityPct: 12.5, densityYear: 2023, collectiveBargainingCoveragePct:  92.1, coverageYear: 2024 },
  { code: 'AUS', unionDensityPct: 12.2, densityYear: 2024, collectiveBargainingCoveragePct:  59.7, coverageYear: 2023 },
  { code: 'TUR', unionDensityPct: 10.9, densityYear: 2024, collectiveBargainingCoveragePct:  12.7, coverageYear: 2024 },
  { code: 'FRA', unionDensityPct: 10.1, densityYear: 2019, collectiveBargainingCoveragePct:  98.0, coverageYear: 2024 },
  { code: 'USA', unionDensityPct:  9.9, densityYear: 2024, collectiveBargainingCoveragePct:  11.1, coverageYear: 2024 },
  { code: 'POL', unionDensityPct:  9.4, densityYear: 2022, collectiveBargainingCoveragePct:  11.6, coverageYear: 2023 },
];

// Same sources, every reported year since 2000 as [year, %]. Gaps are years
// a country did not report. Spain's coverage series restarts in 2021 after a
// methodology break, so it has no comparable earlier points.
export interface UnionHistory {
  density: [number, number][];
  coverage: [number, number][];
}

export const UNION_HISTORY: Record<string, UnionHistory> = {
  AUS: {
    density: [[2000,24.7],[2001,24.5],[2002,23.1],[2003,23],[2004,22.7],[2005,22.4],[2006,20.3],[2007,18.9],[2008,18.9],[2009,19.7],[2010,18.3],[2011,18.4],[2012,18.2],[2013,17],[2014,15.2],[2016,14.7],[2018,13.8],[2020,13.5],[2022,11.7],[2024,12.2]],
    coverage: [[2000,60],[2002,62.2],[2004,64.4],[2006,63.3],[2008,59.3],[2010,61.1],[2012,60],[2014,62],[2016,61.3],[2018,61.2],[2021,60.6],[2023,59.7]],
  },
  BEL: {
    density: [[2000,56.6],[2001,56.3],[2002,55.3],[2003,54.1],[2004,54.1],[2005,53.7],[2006,54.5],[2007,54.9],[2008,54.9],[2009,54.8],[2010,54.5],[2011,55.5],[2012,55.4],[2013,54.5],[2014,54.4],[2015,53.2],[2016,52.5],[2017,51.9],[2018,51.8],[2019,51.1],[2020,52.6],[2021,50.6],[2022,49.4],[2023,47.5]],
    coverage: [[2000,100],[2003,100],[2006,100],[2009,100],[2012,100],[2015,100],[2018,100],[2021,100],[2024,100]],
  },
  CAN: {
    density: [[2000,30.1],[2001,30.2],[2002,30.1],[2003,30.1],[2004,29.8],[2005,29.8],[2006,29.2],[2007,29.1],[2008,28.8],[2009,29.4],[2010,29.3],[2011,28.8],[2012,28.9],[2013,28.8],[2014,28.1],[2015,28.2],[2016,28],[2017,28],[2018,27.6],[2019,27.8],[2020,29.1],[2021,28.9],[2022,28.2],[2023,28.4],[2024,28.3]],
    coverage: [[2000,32.3],[2001,32.3],[2002,32.2],[2003,32.2],[2004,31.7],[2005,32],[2006,31.6],[2007,31.3],[2008,31],[2009,31.5],[2010,31.4],[2011,30.8],[2012,30.9],[2013,30.9],[2014,30.2],[2015,30.4],[2016,30],[2017,30],[2018,29.6],[2019,29.8],[2020,31],[2021,30.7],[2022,30.4],[2023,30.5],[2024,30.2]],
  },
  CHE: {
    density: [[2000,20.7],[2001,20.2],[2002,20.3],[2003,20.4],[2004,19.9],[2005,19.8],[2006,19.3],[2007,18.9],[2008,17.9],[2009,17.7],[2010,17.6],[2011,17],[2012,16.5],[2013,16.6],[2014,16.1],[2015,15.7],[2016,15.3],[2017,14.9],[2018,14.4],[2019,14.1],[2020,13.9],[2021,13.5],[2022,13.2],[2023,12.7]],
    coverage: [[2001,40.9],[2003,47.3],[2005,45.9],[2007,46.2],[2009,46.2],[2012,50],[2014,49.6],[2016,50.4],[2018,50],[2021,51.5]],
  },
  DEU: {
    density: [[2000,22],[2001,21.4],[2002,21.1],[2003,20.7],[2004,19.8],[2005,19.6],[2006,19.1],[2007,18.4],[2008,17.8],[2009,17.6],[2010,17.3],[2011,17],[2012,16.8],[2013,16.6],[2014,16.4],[2015,16.2],[2016,15.9],[2017,15.6],[2018,15.4],[2019,15.1],[2020,15.1],[2021,14.8],[2022,14.4],[2023,14.3],[2024,14.1]],
    coverage: [[2000,67.8],[2001,68.8],[2002,67.8],[2003,67.6],[2004,65.8],[2005,64.9],[2006,63.3],[2007,61.7],[2008,61.3],[2009,61.7],[2010,59.8],[2011,58.9],[2012,58.3],[2013,57.6],[2014,57.8],[2015,56.8],[2016,56],[2017,55],[2018,54],[2019,52],[2020,51],[2021,52],[2022,51],[2023,49],[2024,49]],
  },
  ESP: {
    density: [[2000,14.8],[2001,14.7],[2002,14.7],[2003,14.6],[2004,14.6],[2005,14.6],[2006,14.6],[2007,15.4],[2008,16],[2009,16.9],[2010,16.7],[2011,16.7],[2012,16.7],[2013,16.1],[2014,15.1],[2015,13.7],[2016,13.2],[2017,12.7],[2018,12.6],[2019,12.4],[2020,13.4],[2021,13.1],[2022,12.8],[2023,12.5]],
    coverage: [[2021,91.2],[2022,91.5],[2023,91.8],[2024,92.1]],
  },
  FRA: {
    density: [[2000,10.8],[2001,10.8],[2002,10.8],[2003,10.8],[2004,10.5],[2005,10.5],[2008,10.7],[2010,10.8],[2013,11],[2016,10.8],[2019,10.1]],
    coverage: [[2004,97.7],[2009,98],[2012,98],[2015,98],[2018,98],[2021,98],[2024,98]],
  },
  GBR: {
    density: [[2000,29.8],[2001,29.3],[2002,28.8],[2003,29.3],[2004,28.8],[2005,28.6],[2006,28.3],[2007,28],[2008,27.5],[2009,27.4],[2010,26.6],[2011,26],[2012,26.1],[2013,25.6],[2014,25],[2015,24.7],[2016,23.5],[2017,23.3],[2018,23.4],[2019,23.6],[2020,23.9],[2021,23.2],[2022,22.3],[2023,22.4],[2024,22]],
    coverage: [[2000,36.4],[2001,35.5],[2002,35.2],[2003,35.5],[2004,34.8],[2005,50.1],[2006,50.6],[2007,49.6],[2008,49.5],[2009,49.2],[2010,47.8],[2011,47],[2012,45.1],[2013,44.6],[2014,42.9],[2015,41.6],[2016,41.7],[2017,39.6],[2018,39.2],[2019,39.2],[2020,38.9],[2021,40.9],[2022,39.5],[2023,39.2],[2024,40.2]],
  },
  ISR: {
    density: [[2000,47.2],[2006,37.1],[2007,30.3],[2012,24.8],[2016,27.1],[2022,30.8],[2023,27.2]],
    coverage: [[2000,64.2],[2006,55],[2012,39.7],[2022,46.5],[2023,45.8]],
  },
  ITA: {
    density: [[2000,32.3],[2001,31.9],[2002,31.3],[2003,31.2],[2004,31.6],[2005,31.5],[2006,31.3],[2007,31.5],[2008,31.7],[2009,32.5],[2010,33],[2011,33],[2012,33.3],[2013,33.6],[2014,33.5],[2015,32.5],[2016,31.8],[2017,31.4],[2018,30.8],[2019,30.6],[2020,31.2],[2021,30.6],[2022,30.1],[2023,30],[2024,30.2]],
    coverage: [[2000,100],[2003,100],[2006,100],[2009,100],[2012,100],[2015,100],[2018,100],[2021,100],[2024,100]],
  },
  JPN: {
    density: [[2000,21.5],[2001,20.9],[2002,20.3],[2003,19.7],[2004,19.3],[2005,18.8],[2006,18.3],[2007,18.2],[2008,18.1],[2009,18.4],[2010,18.3],[2011,18.1],[2012,17.9],[2013,17.7],[2014,17.5],[2015,17.5],[2016,17.3],[2017,17.1],[2018,16.9],[2019,16.7],[2020,16.8],[2021,16.8],[2022,16.5],[2023,16.4],[2024,16.2]],
    coverage: [[2000,18.7],[2001,18.1],[2002,17.6],[2003,17.1],[2004,16.8],[2005,16.4],[2006,16],[2007,16],[2008,16],[2009,16.3],[2010,16.4],[2011,16.2],[2012,16.2],[2013,16],[2014,15.9],[2015,15.9],[2016,15.7],[2017,15.7],[2018,15.5],[2019,15.4],[2020,15.5],[2021,15.5],[2022,15.4],[2023,15.2]],
  },
  KOR: {
    density: [[2000,11.4],[2001,11.5],[2002,10.8],[2003,10.7],[2004,10.3],[2005,9.9],[2006,10],[2007,10.5],[2008,10.2],[2009,9.9],[2010,9.6],[2011,9.8],[2012,9.9],[2013,10.1],[2014,10.1],[2015,10],[2016,10],[2017,10.5],[2018,11.6],[2019,12.4],[2020,13.8],[2021,14.1],[2022,12.7],[2023,12.5]],
    coverage: [[2000,15],[2001,15],[2002,13.9],[2003,13.7],[2004,13.2],[2005,12.8],[2006,12.9],[2007,13.5],[2008,13.1],[2009,12.7],[2010,12.2],[2011,12.6],[2012,12.8],[2013,12.8],[2014,12.9],[2015,12.7],[2016,12.8],[2017,13.3],[2018,14.8],[2019,15.6],[2020,17.7],[2021,17.8],[2022,16.4],[2023,16.3]],
  },
  MEX: {
    density: [[2000,15.9],[2002,15.5],[2004,16.5],[2005,16.9],[2006,16.3],[2007,16.7],[2008,15.6],[2009,15.3],[2010,14.5],[2011,14.7],[2012,14],[2013,13.8],[2014,13.6],[2015,13.1],[2016,12.7],[2017,12.5],[2018,12],[2019,12.4],[2020,12.4],[2021,13.1],[2022,12.7],[2023,12.7],[2024,12.8]],
    coverage: [[2000,12.6],[2001,12],[2002,11.8],[2003,11.7],[2004,11.8],[2005,11.1],[2006,10.2],[2007,10.8],[2008,10.4],[2009,9.4],[2010,10.5],[2011,10],[2012,11.3],[2013,10.2],[2014,10.1],[2015,10],[2016,10.1],[2017,10.2],[2018,10.1],[2019,10.5],[2020,8.2],[2021,9],[2022,6.9],[2023,7.9],[2024,8.2]],
  },
  NLD: {
    density: [[2000,22.3],[2001,21.6],[2002,21.4],[2003,21.1],[2004,21.3],[2005,21.1],[2006,20.4],[2007,19.2],[2008,19.1],[2009,19.1],[2010,18.5],[2011,18.3],[2012,18],[2013,17.4],[2014,17.2],[2015,16.8],[2016,16.4],[2017,15.8],[2019,14.4],[2021,15.5],[2023,13.8]],
    coverage: [[2000,82],[2001,86],[2002,93.2],[2003,80.8],[2004,86.1],[2005,87.3],[2006,66.9],[2007,78.5],[2008,77.9],[2009,82.5],[2010,86.2],[2011,82.4],[2012,81.2],[2013,81.8],[2014,81.5],[2015,75.2],[2016,74.9],[2017,72.6],[2018,71.8],[2019,70.7],[2020,72.6],[2021,70.5],[2022,70.9],[2023,73.1],[2024,72.1]],
  },
  NOR: {
    density: [[2000,52.4],[2001,51.7],[2002,52],[2003,51.5],[2004,51.3],[2005,51],[2006,51.1],[2007,50],[2008,49.9],[2009,50.2],[2010,50.5],[2011,49.8],[2012,50.1],[2013,49.9],[2014,50.2],[2015,49.9],[2016,50],[2017,50],[2018,49.7],[2019,50.2],[2020,51.1],[2021,50.1],[2022,49.9],[2023,50.5],[2024,52.1]],
    coverage: [[2004,74],[2005,73],[2008,74],[2012,71],[2013,73],[2014,72],[2016,70],[2017,69],[2019,71],[2021,72],[2022,72]],
  },
  POL: {
    density: [[2000,23.5],[2001,22.3],[2002,22.6],[2003,23.7],[2004,23.8],[2005,24.8],[2006,18.7],[2007,17.6],[2008,16.6],[2009,16.3],[2010,17.4],[2011,17.3],[2012,16.6],[2014,11.9],[2016,14.1],[2017,13.4],[2018,10.8],[2022,9.4]],
    coverage: [[2000,25],[2007,18.9],[2008,17.6],[2010,17.5],[2011,17],[2012,16.7],[2015,14.7],[2019,12.4],[2020,12.5],[2021,12.1],[2022,11.7],[2023,11.6]],
  },
  PRT: {
    density: [[2002,18.6],[2003,19.2],[2004,19.6],[2006,19.5],[2008,19.2],[2009,20.4],[2010,18.2],[2011,18.6],[2015,15.4],[2016,14.6],[2020,13.9]],
    coverage: [[2000,96.8],[2002,95.1],[2003,94.8],[2004,92.9],[2005,91],[2006,89.8],[2007,90.3],[2008,90.5],[2009,90.5],[2010,92],[2011,91.4],[2012,89.7],[2013,89.1],[2014,88.9],[2015,88.5],[2016,87.5],[2017,86.5],[2018,86.2],[2019,85.1],[2020,84.2],[2021,84],[2022,83.3],[2023,83.3]],
  },
  SWE: {
    density: [[2000,79],[2001,77.5],[2002,77.4],[2003,77.5],[2004,76.4],[2005,75.9],[2006,74.5],[2007,71.1],[2008,68.6],[2009,68.7],[2010,68.5],[2011,67.8],[2012,67.8],[2013,68.1],[2014,67.6],[2015,67.4],[2016,67.1],[2017,66.5],[2018,65.9],[2019,65.6],[2020,67],[2021,67],[2022,65.5],[2023,65.2],[2024,65.9]],
    coverage: [[2000,87.7],[2005,89.4],[2006,88.7],[2007,87.5],[2008,88.9],[2009,89.6],[2010,88.7],[2011,88.3],[2012,88.8],[2013,88.4],[2014,88.6],[2015,88.7],[2016,88.6],[2017,87.7],[2018,88],[2019,88.7],[2020,89],[2021,87],[2022,87.5],[2023,87.9],[2024,88]],
  },
  TUR: {
    density: [[2000,13.1],[2001,13.1],[2002,12.5],[2003,11.8],[2004,11.4],[2005,10.8],[2006,9.9],[2007,8.8],[2008,7.7],[2009,7.7],[2010,7.7],[2011,7.5],[2012,6.6],[2013,6.3],[2014,6.9],[2015,8],[2016,8.2],[2017,8.6],[2018,9.2],[2019,9.9],[2020,10.4],[2021,10.5],[2022,10.5],[2023,10.7],[2024,10.9]],
    coverage: [[2000,12.6],[2001,12.7],[2002,12],[2003,11.3],[2004,10.9],[2005,10.2],[2006,9.3],[2007,8.1],[2008,7.1],[2009,7.2],[2010,7.1],[2011,6.8],[2012,6.1],[2013,9.1],[2014,9.2],[2015,9.7],[2016,10.2],[2017,11.7],[2018,9.5],[2019,12.2],[2020,11.8],[2021,13.9],[2022,11.9],[2023,15],[2024,12.7]],
  },
  USA: {
    density: [[2000,13.4],[2001,13.3],[2002,13.3],[2003,12.9],[2004,12.5],[2005,12.5],[2006,12],[2007,12.1],[2008,12.4],[2009,12.3],[2010,11.9],[2011,11.8],[2012,11.3],[2013,11.3],[2014,11.1],[2015,11.1],[2016,10.7],[2017,10.7],[2018,10.5],[2019,10.3],[2020,10.8],[2021,10.3],[2022,10.1],[2023,10],[2024,9.9]],
    coverage: [[2000,14.9],[2001,14.7],[2002,14.5],[2003,14.3],[2004,13.8],[2005,13.7],[2006,13.1],[2007,13.3],[2008,13.7],[2009,13.6],[2010,13.1],[2011,13],[2012,12.5],[2013,12.4],[2014,12.3],[2015,12.3],[2016,12],[2017,11.9],[2018,11.7],[2019,11.6],[2020,12.1],[2021,11.6],[2022,11.3],[2023,11.2],[2024,11.1]],
  },
};

// ─────────────────────────────────────────────────────────────────────
// Chapter 4 — Informal employment as % of total employment, ILOSTAT
// SDG 8.3.1 (SDG_0831_SEX_ECO_RT_A, both sexes, all sectors). Latest
// survey year per country. The US, Japan, Australia and China have no
// harmonised estimate in the series, so they are left out rather than
// mixed in from older, non-comparable methodologies.
// ─────────────────────────────────────────────────────────────────────
export interface InformalRow {
  code: string;
  informalPct: number;
  year: number;
}

export const INFORMAL_EMPLOYMENT_LATEST: InformalRow[] = [
  { code: 'NGA', informalPct: 93.1, year: 2024 },
  { code: 'IND', informalPct: 87.2, year: 2025 },
  { code: 'IDN', informalPct: 80.9, year: 2023 },
  { code: 'ETH', informalPct: 77.7, year: 2021 },
  { code: 'MEX', informalPct: 56.9, year: 2025 },
  { code: 'ZAF', informalPct: 42.3, year: 2025 },
  { code: 'BRA', informalPct: 35.6, year: 2025 },
  { code: 'KOR', informalPct: 29.1, year: 2019 },
  { code: 'TUR', informalPct: 26.6, year: 2025 },
  { code: 'GBR', informalPct: 19.8, year: 2018 },
  { code: 'RUS', informalPct: 19.2, year: 2025 },
  { code: 'ITA', informalPct:  8.4, year: 2025 },
  { code: 'NLD', informalPct:  5.1, year: 2025 },
  { code: 'DEU', informalPct:  3.9, year: 2022 },
  { code: 'ESP', informalPct:  3.8, year: 2025 },
  { code: 'FRA', informalPct:  3.4, year: 2025 },
  { code: 'SWE', informalPct:  3.2, year: 2025 },
  { code: 'NOR', informalPct:  3.2, year: 2025 },
  { code: 'CHE', informalPct:  1.1, year: 2024 },
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
// Chapter 7 — Labour force participation by sex, ages 15+, 2025 (ILOSTAT
// modelled estimates, EAP_2WAP_SEX_AGE_RT_A).
// ─────────────────────────────────────────────────────────────────────
export interface GenderGapRow {
  code: string;
  maleLfp: number;
  femaleLfp: number;
}

export const GENDER_GAP_2025: GenderGapRow[] = [
  { code: 'NOR', maleLfp: 69.1, femaleLfp: 62.1 },
  { code: 'SWE', maleLfp: 67.6, femaleLfp: 61.5 },
  { code: 'CHE', maleLfp: 71.4, femaleLfp: 62.2 },
  { code: 'CAN', maleLfp: 68.9, femaleLfp: 60.2 },
  { code: 'GBR', maleLfp: 65.6, femaleLfp: 57.3 },
  { code: 'DEU', maleLfp: 66.1, femaleLfp: 55.3 },
  { code: 'AUS', maleLfp: 70.7, femaleLfp: 62.5 },
  { code: 'FRA', maleLfp: 59.6, femaleLfp: 51.5 },
  { code: 'NLD', maleLfp: 71.9, femaleLfp: 62.7 },
  { code: 'USA', maleLfp: 67.1, femaleLfp: 56.3 },
  { code: 'JPN', maleLfp: 71.5, femaleLfp: 55.9 },
  { code: 'KOR', maleLfp: 72.0, femaleLfp: 56.8 },
  { code: 'ESP', maleLfp: 62.2, femaleLfp: 52.8 },
  { code: 'ITA', maleLfp: 58.3, femaleLfp: 40.8 },
  { code: 'RUS', maleLfp: 69.0, femaleLfp: 54.5 },
  { code: 'BRA', maleLfp: 73.4, femaleLfp: 53.4 },
  { code: 'CHN', maleLfp: 69.9, femaleLfp: 59.1 },
  { code: 'IDN', maleLfp: 82.3, femaleLfp: 53.7 },
  { code: 'TUR', maleLfp: 71.9, femaleLfp: 37.1 },
  { code: 'MEX', maleLfp: 77.1, femaleLfp: 47.5 },
  { code: 'IND', maleLfp: 77.6, femaleLfp: 32.4 },
  { code: 'NGA', maleLfp: 84.3, femaleLfp: 80.7 },
  { code: 'ETH', maleLfp: 78.6, femaleLfp: 58.5 },
  { code: 'ZAF', maleLfp: 61.7, femaleLfp: 49.9 },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 8 — Youth unemployment 2010-2025, % of the 15-24 labour force.
// ILO modelled estimates as published in World Bank WDI
// (SL.UEM.1524.ZS, July 2026 vintage), by World Bank income group.
// ─────────────────────────────────────────────────────────────────────
export interface YouthUnempPoint {
  year: number;
  world: number;
  highIncome: number;
  middleIncome: number;
  lowIncome: number;
}

export const YOUTH_UNEMPLOYMENT_2010_2025: YouthUnempPoint[] = [
  { year: 2010, world: 15.2, highIncome: 18.3, middleIncome: 15.3, lowIncome:  9.7 },
  { year: 2011, world: 15.3, highIncome: 17.9, middleIncome: 15.4, lowIncome: 10.2 },
  { year: 2012, world: 15.7, highIncome: 18.2, middleIncome: 15.8, lowIncome: 10.6 },
  { year: 2013, world: 15.7, highIncome: 18.2, middleIncome: 15.9, lowIncome: 10.3 },
  { year: 2014, world: 15.6, highIncome: 17.1, middleIncome: 16.0, lowIncome: 10.1 },
  { year: 2015, world: 16.0, highIncome: 16.2, middleIncome: 16.6, lowIncome: 10.6 },
  { year: 2016, world: 16.0, highIncome: 15.1, middleIncome: 16.9, lowIncome: 10.7 },
  { year: 2017, world: 16.1, highIncome: 14.1, middleIncome: 17.1, lowIncome: 10.9 },
  { year: 2018, world: 15.9, highIncome: 13.2, middleIncome: 17.1, lowIncome: 10.7 },
  { year: 2019, world: 15.3, highIncome: 12.5, middleIncome: 16.4, lowIncome: 10.6 },
  { year: 2020, world: 17.1, highIncome: 16.1, middleIncome: 18.0, lowIncome: 11.9 },
  { year: 2021, world: 15.7, highIncome: 13.7, middleIncome: 16.6, lowIncome: 11.6 },
  { year: 2022, world: 14.1, highIncome: 11.8, middleIncome: 15.1, lowIncome: 10.6 },
  { year: 2023, world: 13.4, highIncome: 11.3, middleIncome: 14.2, lowIncome: 10.4 },
  { year: 2024, world: 13.3, highIncome: 11.5, middleIncome: 14.1, lowIncome: 10.2 },
  { year: 2025, world: 13.4, highIncome: 11.5, middleIncome: 14.2, lowIncome: 10.1 },
];
