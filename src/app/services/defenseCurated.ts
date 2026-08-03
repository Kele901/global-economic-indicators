// Curated static data for the Defense Ledger page.
//
// Everything in this file comes from annually-updated public reports that have
// no live API surface. Each block cites its source and the date it was pulled,
// so annual refreshes are a one-file edit.
//
// SOURCES
//   SIPRI Top 100 arms companies      — https://www.sipri.org/databases/armsindustry
//   NATO annual defense expenditure   — https://www.nato.int/cps/en/natohq/news_226465.htm
//   FAS Nuclear Notebook              — https://thebulletin.org/premium/nuclear-notebook/
//   UCDP battle-related deaths        — https://ucdp.uu.se/downloads/
//   UN peacekeeping approved budget   — https://peacekeeping.un.org/en/how-we-are-funded

export const CURATED_LAST_UPDATED = '2025-06-30';

// ─── SIPRI TOP 25 ARMS COMPANIES ────────────────────────────────────────────
// Source: SIPRI Top 100 arms-producing and military services companies, Dec 2024
// release, covering 2023 revenues. Revenue = arms-related revenue only.

export interface ArmsCompany {
  rank: number;
  name: string;
  countryIso3: string;
  country: string;
  armsRevenueUsdBn: number; // 2023 arms revenue, US$ billions
  armsShareOfTotal: number; // 2023 arms revenue as % of company's total revenue
}

export const SIPRI_TOP_25_ARMS_COMPANIES: ArmsCompany[] = [
  { rank: 1,  name: 'Lockheed Martin',       countryIso3: 'USA', country: 'United States',  armsRevenueUsdBn: 60.8, armsShareOfTotal: 91 },
  { rank: 2,  name: 'RTX (Raytheon)',        countryIso3: 'USA', country: 'United States',  armsRevenueUsdBn: 40.6, armsShareOfTotal: 59 },
  { rank: 3,  name: 'Northrop Grumman',      countryIso3: 'USA', country: 'United States',  armsRevenueUsdBn: 35.2, armsShareOfTotal: 89 },
  { rank: 4,  name: 'Boeing',                countryIso3: 'USA', country: 'United States',  armsRevenueUsdBn: 33.2, armsShareOfTotal: 41 },
  { rank: 5,  name: 'General Dynamics',      countryIso3: 'USA', country: 'United States',  armsRevenueUsdBn: 33.2, armsShareOfTotal: 78 },
  { rank: 6,  name: 'BAE Systems',           countryIso3: 'GBR', country: 'United Kingdom', armsRevenueUsdBn: 29.5, armsShareOfTotal: 96 },
  { rank: 7,  name: 'NORINCO',               countryIso3: 'CHN', country: 'China',          armsRevenueUsdBn: 22.1, armsShareOfTotal: 30 },
  { rank: 8,  name: 'AVIC',                  countryIso3: 'CHN', country: 'China',          armsRevenueUsdBn: 20.6, armsShareOfTotal: 24 },
  { rank: 9,  name: 'Leidos',                countryIso3: 'USA', country: 'United States',  armsRevenueUsdBn: 15.4, armsShareOfTotal: 100 },
  { rank: 10, name: 'Leonardo',              countryIso3: 'ITA', country: 'Italy',          armsRevenueUsdBn: 14.9, armsShareOfTotal: 84 },
  { rank: 11, name: 'CASC',                  countryIso3: 'CHN', country: 'China',          armsRevenueUsdBn: 14.5, armsShareOfTotal: 41 },
  { rank: 12, name: 'Airbus',                countryIso3: 'FRA', country: 'France',         armsRevenueUsdBn: 12.5, armsShareOfTotal: 17 },
  { rank: 13, name: 'L3Harris',              countryIso3: 'USA', country: 'United States',  armsRevenueUsdBn: 12.4, armsShareOfTotal: 60 },
  { rank: 14, name: 'CETC',                  countryIso3: 'CHN', country: 'China',          armsRevenueUsdBn: 12.1, armsShareOfTotal: 25 },
  { rank: 15, name: 'HII (Huntington Ingalls)', countryIso3: 'USA', country: 'United States', armsRevenueUsdBn: 11.5, armsShareOfTotal: 98 },
  { rank: 16, name: 'CSGC',                  countryIso3: 'CHN', country: 'China',          armsRevenueUsdBn: 11.2, armsShareOfTotal: 15 },
  { rank: 17, name: 'Thales',                countryIso3: 'FRA', country: 'France',         armsRevenueUsdBn: 10.7, armsShareOfTotal: 51 },
  { rank: 18, name: 'CSSC',                  countryIso3: 'CHN', country: 'China',          armsRevenueUsdBn: 10.4, armsShareOfTotal: 25 },
  { rank: 19, name: 'Rostec',                countryIso3: 'RUS', country: 'Russia',         armsRevenueUsdBn: 9.5,  armsShareOfTotal: 40 },
  { rank: 20, name: 'Honeywell',             countryIso3: 'USA', country: 'United States',  armsRevenueUsdBn: 5.5,  armsShareOfTotal: 15 },
  { rank: 21, name: 'Rolls-Royce',           countryIso3: 'GBR', country: 'United Kingdom', armsRevenueUsdBn: 5.4,  armsShareOfTotal: 30 },
  { rank: 22, name: 'Rheinmetall',           countryIso3: 'DEU', country: 'Germany',        armsRevenueUsdBn: 5.4,  armsShareOfTotal: 72 },
  { rank: 23, name: 'MBDA',                  countryIso3: 'FRA', country: 'France',         armsRevenueUsdBn: 5.1,  armsShareOfTotal: 100 },
  { rank: 24, name: 'Elbit Systems',         countryIso3: 'ISR', country: 'Israel',         armsRevenueUsdBn: 5.1,  armsShareOfTotal: 92 },
  { rank: 25, name: 'HAL (Hindustan Aeronautics)', countryIso3: 'IND', country: 'India',    armsRevenueUsdBn: 3.6,  armsShareOfTotal: 91 },
];

// Country-level colour palette used across the arms-industry table.
export const ARMS_COMPANY_COUNTRY_COLORS: Record<string, string> = {
  USA: '#3b82f6',
  GBR: '#1e40af',
  FRA: '#1d4ed8',
  DEU: '#facc15',
  ITA: '#059669',
  CHN: '#dc2626',
  RUS: '#7c2d12',
  ISR: '#0ea5e9',
  IND: '#f97316',
};

// ─── NATO 32-MEMBER 2% SCORECARD ────────────────────────────────────────────
// Source: NATO's "Defence Expenditure of NATO Countries (2014-2025)" press
// release, June 2025. Values are estimated 2025 defence spending as % of GDP.

export interface NatoMember {
  countryIso3: string;
  country: string;
  militaryPercentGdp2025: number;
  joined: number; // year of NATO accession
}

export const NATO_MEMBERS_2025: NatoMember[] = [
  { countryIso3: 'POL', country: 'Poland',         militaryPercentGdp2025: 4.12, joined: 1999 },
  { countryIso3: 'EST', country: 'Estonia',        militaryPercentGdp2025: 3.43, joined: 2004 },
  { countryIso3: 'USA', country: 'United States',  militaryPercentGdp2025: 3.38, joined: 1949 },
  { countryIso3: 'LVA', country: 'Latvia',         militaryPercentGdp2025: 3.15, joined: 2004 },
  { countryIso3: 'GRC', country: 'Greece',         militaryPercentGdp2025: 3.08, joined: 1952 },
  { countryIso3: 'LTU', country: 'Lithuania',      militaryPercentGdp2025: 3.03, joined: 2004 },
  { countryIso3: 'FIN', country: 'Finland',        militaryPercentGdp2025: 2.41, joined: 2023 },
  { countryIso3: 'DNK', country: 'Denmark',        militaryPercentGdp2025: 2.37, joined: 1949 },
  { countryIso3: 'GBR', country: 'United Kingdom', militaryPercentGdp2025: 2.33, joined: 1949 },
  { countryIso3: 'ROU', country: 'Romania',        militaryPercentGdp2025: 2.28, joined: 2004 },
  { countryIso3: 'FRA', country: 'France',         militaryPercentGdp2025: 2.06, joined: 1949 },
  { countryIso3: 'NOR', country: 'Norway',         militaryPercentGdp2025: 2.20, joined: 1949 },
  { countryIso3: 'HUN', country: 'Hungary',        militaryPercentGdp2025: 2.11, joined: 1999 },
  { countryIso3: 'SWE', country: 'Sweden',         militaryPercentGdp2025: 2.14, joined: 2024 },
  { countryIso3: 'DEU', country: 'Germany',        militaryPercentGdp2025: 2.12, joined: 1955 },
  { countryIso3: 'BGR', country: 'Bulgaria',       militaryPercentGdp2025: 2.05, joined: 2004 },
  { countryIso3: 'NLD', country: 'Netherlands',    militaryPercentGdp2025: 2.05, joined: 1949 },
  { countryIso3: 'SVK', country: 'Slovakia',       militaryPercentGdp2025: 2.00, joined: 2004 },
  { countryIso3: 'ALB', country: 'Albania',        militaryPercentGdp2025: 2.03, joined: 2009 },
  { countryIso3: 'MNE', country: 'Montenegro',     militaryPercentGdp2025: 2.02, joined: 2017 },
  { countryIso3: 'CZE', country: 'Czechia',        militaryPercentGdp2025: 2.10, joined: 1999 },
  { countryIso3: 'MKD', country: 'North Macedonia', militaryPercentGdp2025: 2.22, joined: 2020 },
  { countryIso3: 'TUR', country: 'Türkiye',        militaryPercentGdp2025: 2.09, joined: 1952 },
  { countryIso3: 'PRT', country: 'Portugal',       militaryPercentGdp2025: 2.00, joined: 1949 },
  { countryIso3: 'ITA', country: 'Italy',          militaryPercentGdp2025: 2.00, joined: 1949 },
  { countryIso3: 'ISL', country: 'Iceland',        militaryPercentGdp2025: 0.00, joined: 1949 }, // no standing military
  { countryIso3: 'LUX', country: 'Luxembourg',     militaryPercentGdp2025: 1.29, joined: 1949 },
  { countryIso3: 'BEL', country: 'Belgium',        militaryPercentGdp2025: 1.30, joined: 1949 },
  { countryIso3: 'ESP', country: 'Spain',          militaryPercentGdp2025: 1.28, joined: 1982 },
  { countryIso3: 'CAN', country: 'Canada',         militaryPercentGdp2025: 1.45, joined: 1949 },
  { countryIso3: 'SVN', country: 'Slovenia',       militaryPercentGdp2025: 1.35, joined: 2004 },
  { countryIso3: 'HRV', country: 'Croatia',        militaryPercentGdp2025: 1.81, joined: 2009 },
];

export const NATO_TARGET_PERCENT_GDP = 2.0;

// ─── FAS NUCLEAR NOTEBOOK — 2025 warhead counts ─────────────────────────────
// Source: Kristensen, Korda, Reynolds & Johns, "Status of World Nuclear
// Forces", Federation of American Scientists, Nuclear Notebook 2025 update.

export interface NuclearState {
  countryIso3: string;
  country: string;
  deployedStrategic: number; // warheads on active strategic launchers
  deployedNonStrategic: number; // tactical warheads deployed
  reserve: number; // reserve / non-deployed
  retired: number; // awaiting dismantlement
  total: number;
  firstTest: number; // year of first nuclear test
}

export const NUCLEAR_ARSENALS_2025: NuclearState[] = [
  { countryIso3: 'RUS', country: 'Russia',         deployedStrategic: 1710, deployedNonStrategic: 0,    reserve: 2670, retired: 1200, total: 5580, firstTest: 1949 },
  { countryIso3: 'USA', country: 'United States',  deployedStrategic: 1670, deployedNonStrategic: 100,  reserve: 1938, retired: 1336, total: 5044, firstTest: 1945 },
  { countryIso3: 'CHN', country: 'China',          deployedStrategic: 24,   deployedNonStrategic: 0,    reserve: 576,  retired: 0,    total: 600,  firstTest: 1964 },
  { countryIso3: 'FRA', country: 'France',         deployedStrategic: 280,  deployedNonStrategic: 0,    reserve: 10,   retired: 0,    total: 290,  firstTest: 1960 },
  { countryIso3: 'GBR', country: 'United Kingdom', deployedStrategic: 120,  deployedNonStrategic: 0,    reserve: 105,  retired: 0,    total: 225,  firstTest: 1952 },
  { countryIso3: 'PAK', country: 'Pakistan',       deployedStrategic: 0,    deployedNonStrategic: 0,    reserve: 170,  retired: 0,    total: 170,  firstTest: 1998 },
  { countryIso3: 'IND', country: 'India',          deployedStrategic: 0,    deployedNonStrategic: 0,    reserve: 172,  retired: 0,    total: 172,  firstTest: 1974 },
  { countryIso3: 'ISR', country: 'Israel',         deployedStrategic: 0,    deployedNonStrategic: 0,    reserve: 90,   retired: 0,    total: 90,   firstTest: 0 }, // undeclared
  { countryIso3: 'PRK', country: 'North Korea',    deployedStrategic: 0,    deployedNonStrategic: 0,    reserve: 50,   retired: 0,    total: 50,   firstTest: 2006 },
];

// ─── UCDP BATTLE-RELATED DEATHS 1989-2024 ───────────────────────────────────
// Source: UCDP Battle-Related Deaths Dataset v25.1 (June 2025 release).
// Aggregated globally with regional split (best-estimate values). Deaths are
// direct battle deaths in state-based armed conflicts.
//
// Regions follow UCDP's five-region taxonomy: Europe, Middle East, Asia,
// Africa, Americas.

export interface BattleDeathsRow {
  year: number;
  Europe: number;
  MiddleEast: number;
  Asia: number;
  Africa: number;
  Americas: number;
  total: number;
}

export const UCDP_BATTLE_DEATHS: BattleDeathsRow[] = [
  { year: 1989, Europe:   350, MiddleEast:  8000, Asia: 28000, Africa: 21000, Americas:  3000, total:  60350 },
  { year: 1990, Europe:   500, MiddleEast:  9000, Asia: 22000, Africa: 24000, Americas:  4000, total:  59500 },
  { year: 1991, Europe:  7000, MiddleEast: 22000, Asia: 20000, Africa: 33000, Americas:  3000, total:  85000 },
  { year: 1992, Europe: 25000, MiddleEast:  6000, Asia: 26000, Africa: 27000, Americas:  2500, total:  86500 },
  { year: 1993, Europe: 12000, MiddleEast:  5000, Asia: 22000, Africa: 42000, Americas:  2500, total:  83500 },
  { year: 1994, Europe:  5000, MiddleEast:  4000, Asia: 24000, Africa: 88000, Americas:  2000, total: 123000 },
  { year: 1995, Europe:  9000, MiddleEast:  4500, Asia: 25000, Africa: 30000, Americas:  1500, total:  70000 },
  { year: 1996, Europe:  8000, MiddleEast:  4000, Asia: 20000, Africa: 26000, Americas:  1500, total:  59500 },
  { year: 1997, Europe:   700, MiddleEast:  6000, Asia: 15000, Africa: 34000, Americas:  1500, total:  57200 },
  { year: 1998, Europe:  2500, MiddleEast:  6500, Asia: 22000, Africa: 44000, Americas:  1500, total:  76500 },
  { year: 1999, Europe:  6500, MiddleEast:  6000, Asia: 30000, Africa: 46000, Americas:  2000, total:  90500 },
  { year: 2000, Europe:   700, MiddleEast:  5000, Asia: 32000, Africa: 30000, Americas:  2000, total:  69700 },
  { year: 2001, Europe:   400, MiddleEast:  8000, Asia: 22000, Africa: 22000, Americas:  1500, total:  53900 },
  { year: 2002, Europe:   150, MiddleEast:  7000, Asia: 20000, Africa: 20000, Americas:  1500, total:  48650 },
  { year: 2003, Europe:   100, MiddleEast: 22000, Asia: 15000, Africa: 17000, Americas:  1500, total:  55600 },
  { year: 2004, Europe:   200, MiddleEast: 12000, Asia: 12000, Africa: 15000, Americas:  1200, total:  40400 },
  { year: 2005, Europe:   150, MiddleEast: 10000, Asia: 12000, Africa: 12000, Americas:  1000, total:  35150 },
  { year: 2006, Europe:   150, MiddleEast: 16000, Asia: 14000, Africa: 10000, Americas:   900, total:  41050 },
  { year: 2007, Europe:   100, MiddleEast: 24000, Asia: 12000, Africa:  8000, Americas:   700, total:  44800 },
  { year: 2008, Europe:   400, MiddleEast: 12000, Asia: 15000, Africa: 12000, Americas:   700, total:  40100 },
  { year: 2009, Europe:   150, MiddleEast:  8000, Asia: 20000, Africa: 10000, Americas:   600, total:  38750 },
  { year: 2010, Europe:   100, MiddleEast:  6500, Asia: 17000, Africa:  8000, Americas:   500, total:  32100 },
  { year: 2011, Europe:   100, MiddleEast: 15000, Asia: 12000, Africa:  7000, Americas:   400, total:  34500 },
  { year: 2012, Europe:   100, MiddleEast: 43000, Asia: 12000, Africa: 12000, Americas:   400, total:  67500 },
  { year: 2013, Europe:   100, MiddleEast: 65000, Asia: 15000, Africa: 15000, Americas:   400, total:  95500 },
  { year: 2014, Europe: 12000, MiddleEast:100000, Asia: 20000, Africa: 20000, Americas:   400, total: 152400 },
  { year: 2015, Europe:  5000, MiddleEast:100000, Asia: 22000, Africa: 22000, Americas:   400, total: 149400 },
  { year: 2016, Europe:  3000, MiddleEast: 90000, Asia: 24000, Africa: 18000, Americas:   400, total: 135400 },
  { year: 2017, Europe:  2000, MiddleEast: 60000, Asia: 26000, Africa: 15000, Americas:   400, total: 103400 },
  { year: 2018, Europe:  1500, MiddleEast: 35000, Asia: 32000, Africa: 15000, Americas:   400, total:  83900 },
  { year: 2019, Europe:   700, MiddleEast: 25000, Asia: 30000, Africa: 20000, Americas:   500, total:  76200 },
  { year: 2020, Europe:  5000, MiddleEast: 20000, Asia: 25000, Africa: 25000, Americas:   500, total:  75500 },
  { year: 2021, Europe:   400, MiddleEast: 15000, Asia: 15000, Africa: 30000, Americas:   500, total:  60900 },
  { year: 2022, Europe:100000, MiddleEast: 12000, Asia:  8000, Africa: 40000, Americas:   500, total: 160500 },
  { year: 2023, Europe: 90000, MiddleEast: 45000, Asia:  9000, Africa: 60000, Americas:   500, total: 204500 },
  { year: 2024, Europe: 65000, MiddleEast: 42000, Asia:  8000, Africa: 55000, Americas:   500, total: 170500 },
];

export const UCDP_REGION_COLORS: Record<'Europe' | 'MiddleEast' | 'Asia' | 'Africa' | 'Americas', string> = {
  Europe:     '#3b82f6',
  MiddleEast: '#ef4444',
  Asia:       '#f59e0b',
  Africa:     '#10b981',
  Americas:   '#8b5cf6',
};

// ─── ACTIVE STATE-BASED CONFLICTS (UCDP) ────────────────────────────────────
// Source: UCDP Armed Conflict Dataset v25.1 (June 2025). Count of active
// state-based armed conflicts per year.

export const ACTIVE_STATE_CONFLICTS: { year: number; count: number }[] = [
  { year: 1989, count: 38 }, { year: 1990, count: 41 }, { year: 1991, count: 45 },
  { year: 1992, count: 47 }, { year: 1993, count: 45 }, { year: 1994, count: 40 },
  { year: 1995, count: 34 }, { year: 1996, count: 32 }, { year: 1997, count: 31 },
  { year: 1998, count: 32 }, { year: 1999, count: 32 }, { year: 2000, count: 30 },
  { year: 2001, count: 32 }, { year: 2002, count: 29 }, { year: 2003, count: 27 },
  { year: 2004, count: 28 }, { year: 2005, count: 27 }, { year: 2006, count: 30 },
  { year: 2007, count: 32 }, { year: 2008, count: 34 }, { year: 2009, count: 35 },
  { year: 2010, count: 30 }, { year: 2011, count: 36 }, { year: 2012, count: 32 },
  { year: 2013, count: 33 }, { year: 2014, count: 40 }, { year: 2015, count: 50 },
  { year: 2016, count: 49 }, { year: 2017, count: 49 }, { year: 2018, count: 52 },
  { year: 2019, count: 54 }, { year: 2020, count: 56 }, { year: 2021, count: 54 },
  { year: 2022, count: 55 }, { year: 2023, count: 59 }, { year: 2024, count: 61 },
];

// ─── UN PEACEKEEPING APPROVED BUDGET ────────────────────────────────────────
// Source: UN Fifth Committee approved peacekeeping budgets, fiscal year
// (July-June). Values in US$ billions.

export interface PeacekeepingRow {
  fiscalYear: string; // "2024/25"
  budgetUsdBn: number;
  activeMissions: number;
}

export const UN_PEACEKEEPING_BUDGET: PeacekeepingRow[] = [
  { fiscalYear: '2000/01', budgetUsdBn: 2.6, activeMissions: 15 },
  { fiscalYear: '2001/02', budgetUsdBn: 2.7, activeMissions: 15 },
  { fiscalYear: '2002/03', budgetUsdBn: 2.6, activeMissions: 15 },
  { fiscalYear: '2003/04', budgetUsdBn: 2.8, activeMissions: 15 },
  { fiscalYear: '2004/05', budgetUsdBn: 4.5, activeMissions: 16 },
  { fiscalYear: '2005/06', budgetUsdBn: 5.0, activeMissions: 18 },
  { fiscalYear: '2006/07', budgetUsdBn: 5.3, activeMissions: 18 },
  { fiscalYear: '2007/08', budgetUsdBn: 6.8, activeMissions: 20 },
  { fiscalYear: '2008/09', budgetUsdBn: 7.1, activeMissions: 18 },
  { fiscalYear: '2009/10', budgetUsdBn: 7.8, activeMissions: 15 },
  { fiscalYear: '2010/11', budgetUsdBn: 7.1, activeMissions: 15 },
  { fiscalYear: '2011/12', budgetUsdBn: 7.1, activeMissions: 16 },
  { fiscalYear: '2012/13', budgetUsdBn: 7.3, activeMissions: 15 },
  { fiscalYear: '2013/14', budgetUsdBn: 7.5, activeMissions: 16 },
  { fiscalYear: '2014/15', budgetUsdBn: 8.5, activeMissions: 16 },
  { fiscalYear: '2015/16', budgetUsdBn: 8.3, activeMissions: 16 },
  { fiscalYear: '2016/17', budgetUsdBn: 7.9, activeMissions: 16 },
  { fiscalYear: '2017/18', budgetUsdBn: 6.8, activeMissions: 15 },
  { fiscalYear: '2018/19', budgetUsdBn: 6.7, activeMissions: 14 },
  { fiscalYear: '2019/20', budgetUsdBn: 6.5, activeMissions: 13 },
  { fiscalYear: '2020/21', budgetUsdBn: 6.6, activeMissions: 13 },
  { fiscalYear: '2021/22', budgetUsdBn: 6.4, activeMissions: 12 },
  { fiscalYear: '2022/23', budgetUsdBn: 6.5, activeMissions: 12 },
  { fiscalYear: '2023/24', budgetUsdBn: 6.1, activeMissions: 11 },
  { fiscalYear: '2024/25', budgetUsdBn: 5.6, activeMissions: 11 },
];

// ─── SUPERPOWER FOCUS LIST ──────────────────────────────────────────────────
// wbKey values match the display-name keys used inside CountryData rows
// returned by worldbank.ts (see COUNTRY_NAMES map there). iso3 stays for
// palette lookups and cross-referencing curated blocks above.

export interface CountryMeta {
  iso3: string;
  wbKey: string; // key used in worldbank.ts CountryData rows
  name: string;  // display label
  color: string;
}

// Ordered roughly by 2024 nominal military expenditure. Only countries that
// exist in worldbank.ts COUNTRY_CODES (and therefore have live WB data)
// belong here.
export const DEFENSE_COUNTRY_META: CountryMeta[] = [
  { iso3: 'USA', wbKey: 'USA',         name: 'United States',  color: '#3b82f6' },
  { iso3: 'CHN', wbKey: 'China',       name: 'China',          color: '#dc2626' },
  { iso3: 'RUS', wbKey: 'Russia',      name: 'Russia',         color: '#7c2d12' },
  { iso3: 'IND', wbKey: 'India',       name: 'India',          color: '#f97316' },
  { iso3: 'SAU', wbKey: 'SaudiArabia', name: 'Saudi Arabia',   color: '#059669' },
  { iso3: 'GBR', wbKey: 'UK',          name: 'United Kingdom', color: '#1e40af' },
  { iso3: 'DEU', wbKey: 'Germany',     name: 'Germany',        color: '#facc15' },
  { iso3: 'FRA', wbKey: 'France',      name: 'France',         color: '#6366f1' },
  { iso3: 'JPN', wbKey: 'Japan',       name: 'Japan',          color: '#be185d' },
  { iso3: 'KOR', wbKey: 'SouthKorea',  name: 'South Korea',    color: '#0ea5e9' },
  { iso3: 'AUS', wbKey: 'Australia',   name: 'Australia',      color: '#14b8a6' },
  { iso3: 'ITA', wbKey: 'Italy',       name: 'Italy',          color: '#84cc16' },
  { iso3: 'CAN', wbKey: 'Canada',      name: 'Canada',         color: '#ef4444' },
  { iso3: 'ISR', wbKey: 'Israel',      name: 'Israel',         color: '#0891b2' },
  { iso3: 'POL', wbKey: 'Poland',      name: 'Poland',         color: '#a855f7' },
  { iso3: 'BRA', wbKey: 'Brazil',      name: 'Brazil',         color: '#22c55e' },
  { iso3: 'TUR', wbKey: 'Turkey',      name: 'Türkiye',        color: '#e11d48' },
  { iso3: 'ESP', wbKey: 'Spain',       name: 'Spain',          color: '#f59e0b' },
  { iso3: 'NLD', wbKey: 'Netherlands', name: 'Netherlands',    color: '#ea580c' },
  { iso3: 'UKR', wbKey: 'Ukraine',     name: 'Ukraine',        color: '#eab308' },
];

// Top-10 defense spenders — the superpower comparison chart focus list.
export const SUPERPOWER_ISO3: string[] = [
  'USA', 'CHN', 'RUS', 'IND', 'SAU', 'GBR', 'DEU', 'FRA', 'JPN', 'KOR',
];

// Fast lookup helpers
export const DEFENSE_COUNTRY_LOOKUP: Record<string, CountryMeta> = DEFENSE_COUNTRY_META.reduce(
  (acc, m) => { acc[m.iso3] = m; return acc; },
  {} as Record<string, CountryMeta>,
);

export const DEFENSE_COUNTRY_BY_WBKEY: Record<string, CountryMeta> = DEFENSE_COUNTRY_META.reduce(
  (acc, m) => { acc[m.wbKey] = m; return acc; },
  {} as Record<string, CountryMeta>,
);

// -------------------------------------------------------------------------
// SIPRI Military Expenditure fallback (2018–2024) for the 15 largest spenders.
// Used to seed the page when the live World Bank endpoint (MS.MIL.XPND.CD /
// MS.MIL.XPND.GD.ZS) is WAF-blocked. Source: SIPRI Military Expenditure
// Database, 2025 release (published April 2025, covers up to 2024).
// Values are rounded to the nearest 0.1 $B / 0.1 % GDP.
// -------------------------------------------------------------------------
export interface SipriYearPoint {
  year: number;
  usdBillions: number; // absolute military spend in current US$ billions
  pctGdp: number;      // military spend as % of GDP
}

export interface SipriMilitarySpendRow {
  iso3: string;
  wbKey: string; // must match the display-name keys in worldbank.ts CountryData
  years: SipriYearPoint[];
}

export const SIPRI_MILITARY_SPEND: SipriMilitarySpendRow[] = [
  { iso3: 'USA', wbKey: 'USA', years: [
    { year: 2018, usdBillions: 649,  pctGdp: 3.2 },
    { year: 2019, usdBillions: 685,  pctGdp: 3.2 },
    { year: 2020, usdBillions: 767,  pctGdp: 3.5 },
    { year: 2021, usdBillions: 754,  pctGdp: 3.1 },
    { year: 2022, usdBillions: 823,  pctGdp: 3.2 },
    { year: 2023, usdBillions: 916,  pctGdp: 3.4 },
    { year: 2024, usdBillions: 997,  pctGdp: 3.4 },
  ]},
  { iso3: 'CHN', wbKey: 'China', years: [
    { year: 2018, usdBillions: 253,  pctGdp: 1.8 },
    { year: 2019, usdBillions: 261,  pctGdp: 1.7 },
    { year: 2020, usdBillions: 258,  pctGdp: 1.7 },
    { year: 2021, usdBillions: 285,  pctGdp: 1.7 },
    { year: 2022, usdBillions: 291,  pctGdp: 1.6 },
    { year: 2023, usdBillions: 296,  pctGdp: 1.7 },
    { year: 2024, usdBillions: 314,  pctGdp: 1.7 },
  ]},
  { iso3: 'RUS', wbKey: 'Russia', years: [
    { year: 2018, usdBillions: 61.4, pctGdp: 3.7 },
    { year: 2019, usdBillions: 65.1, pctGdp: 3.8 },
    { year: 2020, usdBillions: 61.7, pctGdp: 3.9 },
    { year: 2021, usdBillions: 65.9, pctGdp: 3.6 },
    { year: 2022, usdBillions: 86.4, pctGdp: 4.1 },
    { year: 2023, usdBillions: 109,  pctGdp: 5.9 },
    { year: 2024, usdBillions: 149,  pctGdp: 7.1 },
  ]},
  { iso3: 'IND', wbKey: 'India', years: [
    { year: 2018, usdBillions: 66.5, pctGdp: 2.4 },
    { year: 2019, usdBillions: 71.5, pctGdp: 2.5 },
    { year: 2020, usdBillions: 72.9, pctGdp: 2.9 },
    { year: 2021, usdBillions: 76.6, pctGdp: 2.5 },
    { year: 2022, usdBillions: 81.4, pctGdp: 2.4 },
    { year: 2023, usdBillions: 83.6, pctGdp: 2.4 },
    { year: 2024, usdBillions: 86.1, pctGdp: 2.3 },
  ]},
  { iso3: 'SAU', wbKey: 'SaudiArabia', years: [
    { year: 2018, usdBillions: 74.5, pctGdp: 9.2 },
    { year: 2019, usdBillions: 61.9, pctGdp: 7.7 },
    { year: 2020, usdBillions: 65.9, pctGdp: 8.7 },
    { year: 2021, usdBillions: 55.6, pctGdp: 6.6 },
    { year: 2022, usdBillions: 75.0, pctGdp: 7.4 },
    { year: 2023, usdBillions: 75.8, pctGdp: 7.1 },
    { year: 2024, usdBillions: 80.3, pctGdp: 7.3 },
  ]},
  { iso3: 'GBR', wbKey: 'UK', years: [
    { year: 2018, usdBillions: 49.5, pctGdp: 1.8 },
    { year: 2019, usdBillions: 48.7, pctGdp: 1.8 },
    { year: 2020, usdBillions: 59.2, pctGdp: 2.2 },
    { year: 2021, usdBillions: 68.4, pctGdp: 2.2 },
    { year: 2022, usdBillions: 68.5, pctGdp: 2.2 },
    { year: 2023, usdBillions: 74.9, pctGdp: 2.3 },
    { year: 2024, usdBillions: 81.8, pctGdp: 2.3 },
  ]},
  { iso3: 'DEU', wbKey: 'Germany', years: [
    { year: 2018, usdBillions: 49.5, pctGdp: 1.2 },
    { year: 2019, usdBillions: 49.3, pctGdp: 1.3 },
    { year: 2020, usdBillions: 52.8, pctGdp: 1.4 },
    { year: 2021, usdBillions: 56.0, pctGdp: 1.3 },
    { year: 2022, usdBillions: 55.8, pctGdp: 1.4 },
    { year: 2023, usdBillions: 66.8, pctGdp: 1.5 },
    { year: 2024, usdBillions: 88.5, pctGdp: 1.9 },
  ]},
  { iso3: 'FRA', wbKey: 'France', years: [
    { year: 2018, usdBillions: 63.8, pctGdp: 2.3 },
    { year: 2019, usdBillions: 50.1, pctGdp: 1.9 },
    { year: 2020, usdBillions: 52.7, pctGdp: 2.1 },
    { year: 2021, usdBillions: 56.6, pctGdp: 1.9 },
    { year: 2022, usdBillions: 53.6, pctGdp: 1.9 },
    { year: 2023, usdBillions: 61.3, pctGdp: 2.1 },
    { year: 2024, usdBillions: 64.7, pctGdp: 2.1 },
  ]},
  { iso3: 'JPN', wbKey: 'Japan', years: [
    { year: 2018, usdBillions: 46.6, pctGdp: 0.9 },
    { year: 2019, usdBillions: 47.6, pctGdp: 0.9 },
    { year: 2020, usdBillions: 49.1, pctGdp: 1.0 },
    { year: 2021, usdBillions: 54.1, pctGdp: 1.1 },
    { year: 2022, usdBillions: 46.0, pctGdp: 1.1 },
    { year: 2023, usdBillions: 50.2, pctGdp: 1.2 },
    { year: 2024, usdBillions: 55.3, pctGdp: 1.4 },
  ]},
  { iso3: 'KOR', wbKey: 'SouthKorea', years: [
    { year: 2018, usdBillions: 43.2, pctGdp: 2.5 },
    { year: 2019, usdBillions: 43.9, pctGdp: 2.6 },
    { year: 2020, usdBillions: 45.7, pctGdp: 2.7 },
    { year: 2021, usdBillions: 50.2, pctGdp: 2.6 },
    { year: 2022, usdBillions: 46.4, pctGdp: 2.6 },
    { year: 2023, usdBillions: 48.0, pctGdp: 2.7 },
    { year: 2024, usdBillions: 47.6, pctGdp: 2.6 },
  ]},
  { iso3: 'UKR', wbKey: 'Ukraine', years: [
    { year: 2018, usdBillions:  4.3, pctGdp: 3.2 },
    { year: 2019, usdBillions:  5.2, pctGdp: 3.4 },
    { year: 2020, usdBillions:  5.9, pctGdp: 4.1 },
    { year: 2021, usdBillions:  5.9, pctGdp: 3.2 },
    { year: 2022, usdBillions: 44.0, pctGdp: 22.0 },
    { year: 2023, usdBillions: 65.0, pctGdp: 37.0 },
    { year: 2024, usdBillions: 64.7, pctGdp: 34.5 },
  ]},
  { iso3: 'ISR', wbKey: 'Israel', years: [
    { year: 2018, usdBillions: 20.4, pctGdp: 5.4 },
    { year: 2019, usdBillions: 20.5, pctGdp: 5.2 },
    { year: 2020, usdBillions: 21.7, pctGdp: 5.6 },
    { year: 2021, usdBillions: 24.3, pctGdp: 5.2 },
    { year: 2022, usdBillions: 23.4, pctGdp: 4.5 },
    { year: 2023, usdBillions: 27.5, pctGdp: 5.3 },
    { year: 2024, usdBillions: 46.5, pctGdp: 8.8 },
  ]},
  { iso3: 'POL', wbKey: 'Poland', years: [
    { year: 2018, usdBillions: 11.9, pctGdp: 2.0 },
    { year: 2019, usdBillions: 11.9, pctGdp: 2.0 },
    { year: 2020, usdBillions: 13.4, pctGdp: 2.2 },
    { year: 2021, usdBillions: 13.4, pctGdp: 2.1 },
    { year: 2022, usdBillions: 16.6, pctGdp: 2.2 },
    { year: 2023, usdBillions: 31.7, pctGdp: 3.8 },
    { year: 2024, usdBillions: 38.0, pctGdp: 4.2 },
  ]},
  { iso3: 'ITA', wbKey: 'Italy', years: [
    { year: 2018, usdBillions: 26.9, pctGdp: 1.2 },
    { year: 2019, usdBillions: 26.8, pctGdp: 1.2 },
    { year: 2020, usdBillions: 28.9, pctGdp: 1.5 },
    { year: 2021, usdBillions: 32.0, pctGdp: 1.5 },
    { year: 2022, usdBillions: 33.5, pctGdp: 1.5 },
    { year: 2023, usdBillions: 35.5, pctGdp: 1.6 },
    { year: 2024, usdBillions: 38.0, pctGdp: 1.6 },
  ]},
  { iso3: 'AUS', wbKey: 'Australia', years: [
    { year: 2018, usdBillions: 26.7, pctGdp: 1.9 },
    { year: 2019, usdBillions: 26.7, pctGdp: 1.9 },
    { year: 2020, usdBillions: 28.0, pctGdp: 2.0 },
    { year: 2021, usdBillions: 31.8, pctGdp: 2.0 },
    { year: 2022, usdBillions: 32.3, pctGdp: 1.9 },
    { year: 2023, usdBillions: 32.3, pctGdp: 1.9 },
    { year: 2024, usdBillions: 33.8, pctGdp: 1.9 },
  ]},
];
