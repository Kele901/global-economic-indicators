// Single source of truth for every dataset the site consumes. Powers the
// public /data-sources master page and gives every curated snapshot a
// machine-readable "last updated" stamp that the StalenessBanner component
// can use to warn users when a dataset has aged out of relevance.
//
// When adding a new dataset (WB indicator, FRED series, curated snapshot),
// register it here. The /data-sources page renders directly from this array,
// so anything not listed here is invisible to the transparency layer.

import { CURATED_LAST_UPDATED as DEFENSE_CURATED_LAST_UPDATED } from '../services/defenseCurated';
import { CURATED_LAST_UPDATED as CLIMATE_CURATED_LAST_UPDATED } from '../services/climateCurated';

export type DataCategory =
  | 'macro'
  | 'rates'
  | 'defense'
  | 'resources'
  | 'cultural'
  | 'climate'
  | 'fx'
  | 'housing'
  | 'governance'
  | 'trade';

export type DataProvider =
  | 'World Bank'
  | 'FRED'
  | 'BIS via FRED'
  | 'OECD'
  | 'EIA'
  | 'Frankfurter'
  | 'SIPRI'
  | 'FAS'
  | 'UCDP'
  | 'NATO'
  | 'UN'
  | 'QS'
  | 'Global Energy Monitor'
  | 'UNFCCC'
  | 'OECD DAC / GCF'
  | 'EM-DAT'
  | 'Curated';

export type RefreshCadence =
  | 'daily'
  | 'monthly'
  | 'quarterly'
  | 'annual'
  | 'irregular'
  | 'ad-hoc';

export interface DataSourceEntry {
  id: string;
  name: string;
  category: DataCategory;
  provider: DataProvider;
  seriesIds?: string[];
  refreshCadence: RefreshCadence;
  live: boolean;
  lastUpdated: string; // ISO date for curated, 'live' for live series
  notes?: string;
  sourceUrl?: string;
}

// Convenience string that reads as "live" instead of an ISO date.
const LIVE = 'live' as const;

// The registry, grouped logically by category. Order matters — the
// /data-sources page renders in this exact order.
export const DATA_SOURCES: DataSourceEntry[] = [
  // ── Interest rates & monetary policy ──────────────────────────────────
  {
    id: 'fred-policy-rates',
    name: 'Central bank policy rates',
    category: 'rates',
    provider: 'FRED',
    seriesIds: ['DFF', 'ECBDFR', 'IUDSOIA', 'IRSTCI01JPM156N', 'IUDSOIA'],
    refreshCadence: 'daily',
    live: true,
    lastUpdated: LIVE,
    notes: 'Overnight / policy rates for the major central banks, proxied through /api/fred.',
    sourceUrl: 'https://fred.stlouisfed.org',
  },
  {
    id: 'fred-long-term-rates',
    name: 'Long-term government bond yields',
    category: 'rates',
    provider: 'BIS via FRED',
    seriesIds: ['IRLTLT01*M156N', 'GS10'],
    refreshCadence: 'monthly',
    live: true,
    lastUpdated: LIVE,
    notes: 'BIS-compiled 10Y sovereign yields, republished on FRED.',
    sourceUrl: 'https://fred.stlouisfed.org/tags/series?t=irltlt01',
  },

  // ── Macro fundamentals (World Bank) ───────────────────────────────────
  {
    id: 'wb-gdp-growth',
    name: 'GDP growth (annual %)',
    category: 'macro',
    provider: 'World Bank',
    seriesIds: ['NY.GDP.MKTP.KD.ZG'],
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
    sourceUrl: 'https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG',
  },
  {
    id: 'wb-gdp-pcap-ppp',
    name: 'GDP per capita, PPP (current international $)',
    category: 'macro',
    provider: 'World Bank',
    seriesIds: ['NY.GDP.PCAP.PP.CD'],
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
  },
  {
    id: 'wb-inflation',
    name: 'Inflation, consumer prices (annual %)',
    category: 'macro',
    provider: 'World Bank',
    seriesIds: ['FP.CPI.TOTL.ZG'],
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
  },
  {
    id: 'wb-unemployment',
    name: 'Unemployment, total (% of labor force)',
    category: 'macro',
    provider: 'World Bank',
    seriesIds: ['SL.UEM.TOTL.ZS'],
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
  },
  {
    id: 'wb-government-debt',
    name: 'Central government debt, total (% of GDP)',
    category: 'macro',
    provider: 'World Bank',
    seriesIds: ['GC.DOD.TOTL.GD.ZS'],
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
  },
  {
    id: 'wb-trade-balance',
    name: 'Trade balance (% of GDP)',
    category: 'trade',
    provider: 'World Bank',
    seriesIds: ['NE.RSB.GNFS.ZS'],
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
  },

  // ── Governance (Worldwide Governance Indicators, WB source=3) ─────────
  {
    id: 'wb-wgi-suite',
    name: 'Worldwide Governance Indicators (6 indices)',
    category: 'governance',
    provider: 'World Bank',
    seriesIds: [
      'GOV_WGI_CC.EST', 'GOV_WGI_GE.EST', 'GOV_WGI_PV.EST',
      'GOV_WGI_RQ.EST', 'GOV_WGI_RL.EST', 'GOV_WGI_VA.EST',
    ],
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
    notes: 'Control of Corruption, Government Effectiveness, Political Stability, Regulatory Quality, Rule of Law, Voice & Accountability. Fetched via source=3 (dedicated WGI database).',
    sourceUrl: 'https://www.worldbank.org/en/publication/worldwide-governance-indicators',
  },

  // ── Housing (BIS via FRED) ────────────────────────────────────────────
  {
    id: 'bis-house-prices',
    name: 'BIS residential property prices (real & nominal)',
    category: 'housing',
    provider: 'BIS via FRED',
    seriesIds: ['Q*R628BIS', 'Q*N628BIS'],
    refreshCadence: 'quarterly',
    live: true,
    lastUpdated: LIVE,
    sourceUrl: 'https://www.bis.org/statistics/pp.htm',
  },

  // ── FX (Frankfurter primary, FRED secondary) ──────────────────────────
  {
    id: 'frankfurter-fx',
    name: 'ECB reference FX rates',
    category: 'fx',
    provider: 'Frankfurter',
    seriesIds: ['EUR/*', 'USD/*'],
    refreshCadence: 'daily',
    live: true,
    lastUpdated: LIVE,
    notes: '27 currency pairs (16 USD-quoted, 11 derived crosses) with 30-day sparklines. Proxied through /api/frankfurter.',
    sourceUrl: 'https://frankfurter.dev',
  },
  {
    id: 'fred-fx',
    name: 'Daily USD FX rates (FRED)',
    category: 'fx',
    provider: 'FRED',
    seriesIds: ['DEXUSEU', 'DEXJPUS', 'DEXUSUK', 'DEXCHUS', 'DEXCAUS', 'DEXUSAL', 'DEXBZUS', 'DEXINUS', 'DEXMXUS', 'DEXSFUS', 'DEXSIUS', 'DEXKOUS', 'DEXHKUS'],
    refreshCadence: 'daily',
    live: true,
    lastUpdated: LIVE,
  },

  // ── Commodities (Resources page) ──────────────────────────────────────
  {
    id: 'fred-commodities',
    name: 'Commodity spot prices',
    category: 'resources',
    provider: 'FRED',
    seriesIds: ['DCOILWTICO', 'DCOILBRENTEU', 'GOLDAMGBD228NLBM', 'PIORECRUSDM', 'PALUMUSDM', 'PCOPPUSDM', 'PWHEAMTUSDM'],
    refreshCadence: 'daily',
    live: true,
    lastUpdated: LIVE,
    notes: 'Oil (WTI, Brent), gold, iron ore, aluminium, copper, wheat. 30-day sparklines rendered client-side.',
  },
  {
    id: 'eia-oil-reserves',
    name: 'Crude oil reserves & production',
    category: 'resources',
    provider: 'EIA',
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
    notes: 'US Energy Information Administration international data via /api/eia. Falls back to a static snapshot when EIA is unavailable.',
    sourceUrl: 'https://www.eia.gov/international/data/world',
  },

  // ── Defense Ledger (live) ─────────────────────────────────────────────
  {
    id: 'wb-military-spend',
    name: 'Military expenditure (SIPRI via WB)',
    category: 'defense',
    provider: 'World Bank',
    seriesIds: ['MS.MIL.XPND.CD', 'MS.MIL.XPND.GD.ZS', 'MS.MIL.XPND.ZS', 'MS.MIL.TOTL.P1'],
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
    notes: 'SIPRI Military Expenditure Database published on the World Bank API. USA slot backfilled from FRED FDEFX (scaled to absolute US$).',
    sourceUrl: 'https://www.sipri.org/databases/milex',
  },
  {
    id: 'wb-arms-trade',
    name: 'Arms exports & imports (SIPRI TIV via WB)',
    category: 'defense',
    provider: 'World Bank',
    seriesIds: ['MS.MIL.XPRT.KD', 'MS.MIL.MPRT.KD'],
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
    notes: 'Trend indicator values in constant 1990 US$.',
  },

  // ── Defense Ledger (curated snapshots) ────────────────────────────────
  {
    id: 'sipri-top-25-arms',
    name: 'SIPRI Top 25 arms companies',
    category: 'defense',
    provider: 'SIPRI',
    refreshCadence: 'annual',
    live: false,
    lastUpdated: DEFENSE_CURATED_LAST_UPDATED,
    notes: 'Ranked by arms-related revenue in the most recent SIPRI Top 100 release.',
    sourceUrl: 'https://www.sipri.org/publications',
  },
  {
    id: 'sipri-military-spend-fallback',
    name: 'SIPRI military spending 2018-2024 (fallback)',
    category: 'defense',
    provider: 'SIPRI',
    refreshCadence: 'annual',
    live: false,
    lastUpdated: DEFENSE_CURATED_LAST_UPDATED,
    notes: 'Curated 2018-2024 spending for 15 major spenders. Used as a fallback layer when the live WB fetch is unavailable; live values always win where present.',
  },
  {
    id: 'nato-defense-expenditure',
    name: 'NATO defense expenditure (32 members)',
    category: 'defense',
    provider: 'NATO',
    refreshCadence: 'annual',
    live: false,
    lastUpdated: DEFENSE_CURATED_LAST_UPDATED,
    notes: 'Estimated 2025 defense spending as % of GDP, from NATO Public Diplomacy Division annual release.',
    sourceUrl: 'https://www.nato.int/cps/en/natohq/topics_49198.htm',
  },
  {
    id: 'fas-nuclear-notebook',
    name: 'Nuclear arsenals (FAS Nuclear Notebook)',
    category: 'defense',
    provider: 'FAS',
    refreshCadence: 'annual',
    live: false,
    lastUpdated: DEFENSE_CURATED_LAST_UPDATED,
    notes: 'Deployed / reserve / retired warhead counts for the nine nuclear-armed states, per the Federation of American Scientists.',
    sourceUrl: 'https://fas.org/initiative/status-world-nuclear-forces/',
  },
  {
    id: 'ucdp-battle-deaths',
    name: 'UCDP battle-related deaths 1989-2024',
    category: 'defense',
    provider: 'UCDP',
    refreshCadence: 'annual',
    live: false,
    lastUpdated: DEFENSE_CURATED_LAST_UPDATED,
    notes: 'Uppsala Conflict Data Program v25.1. Annual deaths grouped by region plus active state-based conflict counts.',
    sourceUrl: 'https://ucdp.uu.se/downloads/',
  },
  {
    id: 'un-peacekeeping-budget',
    name: 'UN peacekeeping budget',
    category: 'defense',
    provider: 'UN',
    refreshCadence: 'annual',
    live: false,
    lastUpdated: DEFENSE_CURATED_LAST_UPDATED,
    notes: 'UN Fifth Committee approved peacekeeping budget and active mission count.',
    sourceUrl: 'https://peacekeeping.un.org/en/how-we-are-funded',
  },

  // ── Cultural Capital ──────────────────────────────────────────────────
  {
    id: 'wb-education',
    name: 'Education indicators (WB)',
    category: 'cultural',
    provider: 'World Bank',
    seriesIds: ['SE.XPD.TOTL.GD.ZS', 'SE.TER.ENRR', 'SE.ADT.LITR.ZS'],
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
    notes: 'Public education spending, tertiary enrolment, adult literacy.',
  },
  {
    id: 'qs-world-university',
    name: 'QS World University Rankings 2026',
    category: 'cultural',
    provider: 'QS',
    refreshCadence: 'annual',
    live: false,
    lastUpdated: '2025-06-19',
    notes: 'Curated top-100 university list plus per-country top-university mapping.',
    sourceUrl: 'https://www.topuniversities.com/university-rankings/world-university-rankings',
  },
  {
    id: 'wb-ip-trade',
    name: 'IP receipts & payments (WB)',
    category: 'cultural',
    provider: 'World Bank',
    seriesIds: ['BX.GSR.ROYL.CD', 'BM.GSR.ROYL.CD'],
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
  },

  // ── Climate Ledger (live) ─────────────────────────────────────────────
  {
    id: 'wb-ghg',
    name: 'Greenhouse gas emissions (CO₂, CH₄, N₂O)',
    category: 'climate',
    provider: 'World Bank',
    seriesIds: ['EN.ATM.CO2E.KT', 'EN.ATM.CO2E.PC', 'EN.ATM.METH.KT.CE', 'EN.ATM.NOXE.KT.CE'],
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
    notes: 'Absolute CO₂ (kt), per-capita CO₂ (t), and methane / N₂O expressed as kt CO₂-equivalent.',
    sourceUrl: 'https://data.worldbank.org/topic/climate-change',
  },
  {
    id: 'wb-energy-mix',
    name: 'Electricity generation mix',
    category: 'climate',
    provider: 'World Bank',
    seriesIds: ['EG.ELC.COAL.ZS', 'EG.ELC.RNEW.ZS', 'EG.USE.COMM.FO.ZS', 'EG.FEC.RNEW.ZS'],
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
    notes: 'Coal share, renewables share, fossil-fuel share of total energy consumption.',
  },
  {
    id: 'wb-land-nature',
    name: 'Land use & protected areas',
    category: 'climate',
    provider: 'World Bank',
    seriesIds: ['AG.LND.FRST.ZS', 'ER.LND.PTLD.ZS'],
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
    notes: 'Forest area (% of land) and terrestrial protected areas (% of land).',
  },
  {
    id: 'wb-air-quality',
    name: 'PM2.5 air pollution exposure',
    category: 'climate',
    provider: 'World Bank',
    seriesIds: ['EN.ATM.PM25.MC.M3'],
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
    notes: 'Mean annual population-weighted exposure to PM2.5, benchmarked against the WHO 5 µg/m³ guideline.',
  },

  // ── Climate Ledger (curated snapshots) ────────────────────────────────
  {
    id: 'unfccc-ndc',
    name: 'NDC 2035 targets (top-20 emitters)',
    category: 'climate',
    provider: 'UNFCCC',
    refreshCadence: 'irregular',
    live: false,
    lastUpdated: CLIMATE_CURATED_LAST_UPDATED,
    notes: 'Nationally Determined Contributions submitted to the UNFCCC NDC Registry. Falls back to 2030 target where a 2035 pledge has not yet been submitted.',
    sourceUrl: 'https://unfccc.int/NDCREG',
  },
  {
    id: 'gem-coal-tracker',
    name: 'Global Coal Plant Tracker',
    category: 'climate',
    provider: 'Global Energy Monitor',
    refreshCadence: 'quarterly',
    live: false,
    lastUpdated: CLIMATE_CURATED_LAST_UPDATED,
    notes: 'Operating / under-construction / announced / retired GW of coal generation by country.',
    sourceUrl: 'https://globalenergymonitor.org/projects/global-coal-plant-tracker/',
  },
  {
    id: 'oecd-gcf-finance',
    name: 'Climate finance flows (OECD DAC + GCF)',
    category: 'climate',
    provider: 'OECD DAC / GCF',
    refreshCadence: 'annual',
    live: false,
    lastUpdated: CLIMATE_CURATED_LAST_UPDATED,
    notes: 'Cumulative pledged vs disbursed climate finance by donor, plus the annual $100Bn Copenhagen mobilisation series.',
    sourceUrl: 'https://www.oecd.org/climate-change/finance-usd-100-billion-goal/',
  },
  {
    id: 'emdat-disasters',
    name: 'EM-DAT climate-related disasters 1990-2024',
    category: 'climate',
    provider: 'EM-DAT',
    refreshCadence: 'annual',
    live: false,
    lastUpdated: CLIMATE_CURATED_LAST_UPDATED,
    notes: 'Annual counts of floods, storms, droughts, wildfires and extreme-temperature events grouped by continent.',
    sourceUrl: 'https://www.emdat.be/',
  },
  {
    id: 'nasa-gistemp',
    name: 'Global temperature anomaly (NASA GISTEMP v4)',
    category: 'climate',
    provider: 'Curated',
    refreshCadence: 'monthly',
    live: false,
    lastUpdated: CLIMATE_CURATED_LAST_UPDATED,
    notes: 'Land-ocean temperature anomaly vs 1951-1980 base period. Snapshot of the annual mean series.',
    sourceUrl: 'https://data.giss.nasa.gov/gistemp/',
  },
];

// Helpers for the /data-sources page.
export const CATEGORY_LABELS: Record<DataCategory, string> = {
  macro: 'Macro Fundamentals',
  rates: 'Interest Rates',
  defense: 'Defense',
  resources: 'Resources & Commodities',
  cultural: 'Cultural Capital',
  climate: 'Climate',
  fx: 'Foreign Exchange',
  housing: 'Housing',
  governance: 'Governance',
  trade: 'Trade',
};

// Returns true when a curated snapshot is older than `stalenessMonths`.
// Live series are never stale.
export function isStale(entry: DataSourceEntry, stalenessMonths: number = 12): boolean {
  if (entry.live) return false;
  const parsed = Date.parse(entry.lastUpdated);
  if (Number.isNaN(parsed)) return false;
  const ageMs = Date.now() - parsed;
  return ageMs > stalenessMonths * 30 * 24 * 60 * 60 * 1000;
}
