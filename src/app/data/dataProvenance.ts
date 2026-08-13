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
import { CURATED_LAST_UPDATED as TRADE_CURATED_LAST_UPDATED } from '../services/tradeCurated';
import { CURATED_LAST_UPDATED as MIGRATION_CURATED_LAST_UPDATED } from '../services/migrationCurated';
import { CURATED_LAST_UPDATED as DEBT_CURATED_LAST_UPDATED } from '../services/debtCurated';
import { CURATED_LAST_UPDATED as AI_CURATED_LAST_UPDATED } from '../services/aiCurated';
import { CURATED_LAST_UPDATED as HEALTH_CURATED_LAST_UPDATED } from '../services/healthCurated';
import { CURATED_LAST_UPDATED as ENERGY_CURATED_LAST_UPDATED } from '../services/energyCurated';
import { CURATED_LAST_UPDATED as LABOR_CURATED_LAST_UPDATED } from '../services/laborCurated';

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
  | 'trade'
  | 'mobility'
  | 'technology'
  | 'migration'
  | 'health'
  | 'energy'
  | 'labor';

export type DataProvider =
  | 'World Bank'
  | 'FRED'
  | 'BIS via FRED'
  | 'BIS'
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
  | 'Curated'
  | 'IMF'
  | 'ITU'
  | 'WIPO'
  | 'Eurostat'
  | 'UNESCO'
  | 'UNCTAD'
  | 'UNWTO'
  | 'Harvard Atlas'
  | 'WHO'
  | 'IHME'
  | 'JHU'
  | 'BNEF'
  | 'IGU'
  | 'IAEA'
  | 'ILO';

export type RefreshCadence =
  | 'daily'
  | 'monthly'
  | 'quarterly'
  | 'annual'
  | 'irregular'
  | 'ad-hoc';

export type QualityFlag = 'estimate' | 'curated' | 'frozen' | 'revised';

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
  qualityFlags?: QualityFlag[];
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
    qualityFlags: ['estimate'],
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
    qualityFlags: ['frozen', 'curated'],
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

  // ── Passport & mobility ───────────────────────────────────────────────
  {
    id: 'passport-index',
    name: 'Passport visa-free access',
    category: 'mobility',
    provider: 'Curated',
    refreshCadence: 'quarterly',
    live: false,
    lastUpdated: '2025-07-01',
    notes: 'Curated visa policy matrix (visa-free / visa-on-arrival / eTA / visa-required) for major passports, plus mobility & advisory scoring. Powers the /cultural-capital passport tab.',
    sourceUrl: 'https://www.henleyglobal.com/passport-index',
  },

  // ── Trade (Harvard Atlas + IMF DOTS) ──────────────────────────────────
  {
    id: 'trade-atlas',
    name: 'Bilateral trade flows (Harvard Atlas + IMF DOTS)',
    category: 'trade',
    provider: 'Harvard Atlas',
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
    notes: 'Harvard Growth Lab Atlas of Economic Complexity for product-level exports and IMF Direction of Trade Statistics for bilateral flows. Powers /trade-network.',
    sourceUrl: 'https://atlas.cid.harvard.edu/',
  },
  {
    id: 'trade-ledger-curated',
    name: 'Trade Ledger curated snapshots',
    category: 'trade',
    provider: 'Curated',
    refreshCadence: 'quarterly',
    live: false,
    lastUpdated: TRADE_CURATED_LAST_UPDATED,
    notes: 'WTO Applied Tariffs 2024, PIIE US-China tariff timeline 2018-2025, Baltic Dry + Drewry World Container Index snapshots, RCEP/USMCA/CPTPP/EU/AfCFTA membership matrix, USGS + SEMI supply-chain concentration, UNCTAD maritime chokepoints. Powers /trade-ledger.',
    sourceUrl: 'https://www.wto.org/english/res_e/publications_e/wtp2024_e.htm',
  },

  // ── Migration Ledger ──────────────────────────────────────────────────
  {
    id: 'wb-remittances',
    name: 'Remittances received (World Bank)',
    category: 'migration',
    provider: 'World Bank',
    seriesIds: ['BX.TRF.PWKR.CD.DT'],
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
    notes: 'Personal remittances received (current US$). WB series updated annually; some low-income coverage is sparse.',
    sourceUrl: 'https://data.worldbank.org/indicator/BX.TRF.PWKR.CD.DT',
  },
  {
    id: 'wb-migrant-stock',
    name: 'International migrant stock (World Bank)',
    category: 'migration',
    provider: 'World Bank',
    seriesIds: ['SM.POP.TOTL'],
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
    notes: 'Foreign-born population totals, updated via UN DESA into the WB indicator. Powers the Migration Ledger.',
    sourceUrl: 'https://data.worldbank.org/indicator/SM.POP.TOTL',
  },
  {
    id: 'wb-refugees-origin',
    name: 'Refugees by country of origin (World Bank)',
    category: 'migration',
    provider: 'World Bank',
    seriesIds: ['SM.POP.REFG.OR'],
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
    notes: 'UNHCR data surfaced via the World Bank indicator API. Complemented by the curated UNHCR mid-2025 stock snapshot.',
    sourceUrl: 'https://data.worldbank.org/indicator/SM.POP.REFG.OR',
  },
  {
    id: 'migration-ledger-curated',
    name: 'Migration Ledger curated snapshots',
    category: 'migration',
    provider: 'Curated',
    refreshCadence: 'quarterly',
    live: false,
    lastUpdated: MIGRATION_CURATED_LAST_UPDATED,
    notes: 'UNHCR mid-2025 refugee stocks by origin, KNOMAD top-25 remittance corridors, UN DESA International Migrant Stock 2024, Eurostat EU asylum applications 2015-2024, OECD talent migration (brain drain/gain), IOM Missing Migrants Project deaths by route 2014-2024. Powers /migration-ledger.',
    sourceUrl: 'https://www.unhcr.org/refugee-statistics/',
  },

  // ── Debt Ledger ───────────────────────────────────────────────────────
  {
    id: 'debt-ledger-curated',
    name: 'Debt Ledger curated snapshots',
    category: 'macro',
    provider: 'Curated',
    refreshCadence: 'quarterly',
    live: false,
    lastUpdated: DEBT_CURATED_LAST_UPDATED,
    notes: 'IMF WEO Oct-2024 general-government debt projections 2019-2029, S&P/Moody\u2019s/Fitch sovereign ratings mid-2025, 5Y sovereign CDS Sep-2025, sovereign default database 2000-2024 (Bank of Canada / Reinhart-Rogoff), Fed/ECB/BOJ/PBOC quarter-end balance sheet snapshots 2007-2025, BIS household debt 2024. Powers /debt.',
    sourceUrl: 'https://www.imf.org/en/Publications/WEO/weo-database/2024/October',
    qualityFlags: ['estimate', 'curated'],
  },

  // ── Health Ledger (curated snapshots) ────────────────────────────────
  {
    id: 'health-ledger-curated',
    name: 'Health Ledger curated snapshots',
    category: 'health',
    provider: 'Curated',
    refreshCadence: 'annual',
    live: false,
    lastUpdated: HEALTH_CURATED_LAST_UPDATED,
    notes: 'WHO Global Health Expenditure Database 2023 spend-outcome pairs, IHME Global Burden of Disease 2023 DALY series, Johns Hopkins Global Health Security Index 2021 + WHO JEE core capacity, Pharma Intelligence top-15 R&D 2024, WHO Mental Health Atlas 2020 prevalence + treatment gap, dual-burden obesity/undernutrition (WHO NCD Atlas 2022). Powers /health-ledger.',
    sourceUrl: 'https://www.who.int/data/gho',
  },

  // ── Energy Ledger (curated snapshots) ────────────────────────────────
  {
    id: 'energy-ledger-curated',
    name: 'Energy Ledger curated snapshots',
    category: 'energy',
    provider: 'Curated',
    refreshCadence: 'annual',
    live: false,
    lastUpdated: ENERGY_CURATED_LAST_UPDATED,
    notes: 'IEA Electricity 2025 generation mix, BNEF Global Storage Outlook 2024 battery build-out 2015-2030, IGU World LNG Report 2024 top flows, IAEA PRIS Sep-2025 reactor status + policy stance, EIA International Energy Statistics 2024 + BP Statistical Review proven reserves, IEA WEO 2024 capacity factors, IEA Efficiency 2024 intensity. Powers /energy-ledger.',
    sourceUrl: 'https://www.iea.org/reports/electricity-2025',
  },

  // ── Labor Ledger (curated snapshots) ─────────────────────────────────
  {
    id: 'labor-ledger-curated',
    name: 'Labor Ledger curated snapshots',
    category: 'labor',
    provider: 'Curated',
    refreshCadence: 'annual',
    live: false,
    lastUpdated: LABOR_CURATED_LAST_UPDATED,
    notes: 'ILO Global Wage Report 2024 median PPP hourly wages + real growth, OECD/ICTWSS union density 2023, ILO informal employment 2023, UN DESA World Population Prospects 2024 working-age 2000-2050, OECD Employment Outlook 2024 AI exposure + complementarity, ILO gender-LFP 2023, ILO youth-unemployment 2024. Powers /labor-ledger.',
    sourceUrl: 'https://ilostat.ilo.org/',
  },

  // ── AI/Technology Ledger ─────────────────────────────────────────────
  {
    id: 'ai-ledger-curated',
    name: 'AI Ledger curated snapshots',
    category: 'technology',
    provider: 'Curated',
    refreshCadence: 'quarterly',
    live: false,
    lastUpdated: AI_CURATED_LAST_UPDATED,
    notes: 'Stanford AI Index 2024/25 notable-model counts, Epoch AI frontier model release registry 2018-2025, SEMI + TrendForce foundry capacity Q2-2025, Stanford AI Index + CB Insights AI private-market investment 2018-2024, IEA Electricity 2025 data-centre energy projections, MacroPolo Global AI Talent Tracker, 2023-2025 AI regulation timeline (EU AI Act, US EOs, GAISI, PRC generative-AI rules). Powers /ai-ledger.',
    sourceUrl: 'https://hai.stanford.edu/ai-index',
  },

  // ── FX correlations ───────────────────────────────────────────────────
  {
    id: 'currency-correlations',
    name: 'Currency correlation matrix',
    category: 'fx',
    provider: 'Curated',
    refreshCadence: 'daily',
    live: true,
    lastUpdated: LIVE,
    notes: 'Rolling 90-day return-correlation matrix computed client-side from FRED + Frankfurter daily rates.',
  },

  // ── Cultural: UNESCO / UNCTAD / UNWTO ─────────────────────────────────
  {
    id: 'unesco-heritage',
    name: 'UNESCO World Heritage Sites',
    category: 'cultural',
    provider: 'UNESCO',
    refreshCadence: 'annual',
    live: false,
    lastUpdated: '2025-07-30',
    notes: 'Cultural / natural / mixed heritage sites by country, plus UNESCO Creative Cities and creative-goods trade metrics.',
    sourceUrl: 'https://whc.unesco.org/en/list',
  },
  {
    id: 'unctad-creative-goods',
    name: 'UNCTAD creative goods trade',
    category: 'cultural',
    provider: 'UNCTAD',
    refreshCadence: 'annual',
    live: false,
    lastUpdated: '2025-07-30',
    notes: 'Creative-industries exports as a share of goods trade, from UNCTAD Creative Economy Outlook.',
    sourceUrl: 'https://unctad.org/topic/trade-analysis/creative-economy-programme',
  },
  {
    id: 'unwto-tourism',
    name: 'UNWTO international tourist arrivals',
    category: 'cultural',
    provider: 'UNWTO',
    refreshCadence: 'annual',
    live: false,
    lastUpdated: '2025-07-30',
    notes: 'International tourism receipts and arrivals, from UN Tourism Barometer.',
    sourceUrl: 'https://www.unwto.org/tourism-statistics',
  },

  // ── ITU (digital access) ──────────────────────────────────────────────
  {
    id: 'itu-digital-access',
    name: 'Internet users & mobile subscriptions',
    category: 'technology',
    provider: 'ITU',
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
    notes: 'Individuals using the internet (% of population) and mobile-cellular subscriptions per 100 inhabitants, from the ITU DataHub.',
    sourceUrl: 'https://datahub.itu.int/',
  },

  // ── WIPO (patents & innovation) ───────────────────────────────────────
  {
    id: 'wipo-patents',
    name: 'Patent filings (WIPO)',
    category: 'technology',
    provider: 'WIPO',
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
    notes: 'Resident and non-resident patent applications by country, from WIPO IP Statistics.',
    sourceUrl: 'https://www.wipo.int/ipstats/en/',
  },

  // ── Eurostat (EU tech and R&D) ────────────────────────────────────────
  {
    id: 'eurostat-tech',
    name: 'R&D spending, patents & high-tech exports (EU)',
    category: 'technology',
    provider: 'Eurostat',
    refreshCadence: 'annual',
    live: true,
    lastUpdated: LIVE,
    notes: 'EU-27 R&D expenditure, EPO patent applications, and high-tech exports as share of total. Fetched from the Eurostat SDMX endpoint.',
    sourceUrl: 'https://ec.europa.eu/eurostat/data/database',
  },

  // ── IMF direct (fallback for policy rates and debt) ───────────────────
  {
    id: 'imf-direct',
    name: 'IMF SDMX (interest rates & government debt)',
    category: 'macro',
    provider: 'IMF',
    seriesIds: ['IFS/*/PMP_IX', 'IFS/*/GGXWDG_GDP'],
    refreshCadence: 'quarterly',
    live: true,
    lastUpdated: LIVE,
    notes: 'IMF International Financial Statistics as a secondary source for policy rates and general-government gross debt, used when FRED / OECD coverage is thin.',
    sourceUrl: 'https://data.imf.org/',
  },

  // ── BIS direct (policy rates fallback) ────────────────────────────────
  {
    id: 'bis-direct',
    name: 'BIS SDMX (policy rates, REER)',
    category: 'rates',
    provider: 'BIS',
    refreshCadence: 'monthly',
    live: true,
    lastUpdated: LIVE,
    notes: 'Direct BIS SDMX feed for central-bank policy rates and real effective exchange rates, used as a fallback layer alongside FRED and OECD.',
    sourceUrl: 'https://stats.bis.org/',
  },

  // ── OECD PISA (education) ─────────────────────────────────────────────
  {
    id: 'oecd-pisa',
    name: 'OECD PISA 2022 assessment',
    category: 'cultural',
    provider: 'OECD',
    refreshCadence: 'irregular',
    live: false,
    lastUpdated: '2023-12-05',
    notes: 'PISA is a triennial 15-year-old assessment. The 2022 wave is the current release; the next wave is expected end of 2026. Reading / math / science mean scores by country.',
    sourceUrl: 'https://www.oecd.org/pisa/',
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
  mobility: 'Mobility & Passport',
  technology: 'Technology & Innovation',
  migration: 'Migration',
  health: 'Health',
  energy: 'Energy',
  labor: 'Labor',
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
