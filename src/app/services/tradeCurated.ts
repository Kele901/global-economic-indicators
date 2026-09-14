// Curated snapshots that ride alongside the live World Bank trade series on
// the Trade Ledger. These datasets are not freely available via a stable
// API (paywalls, PDF-only releases, WTO's proprietary tariff DB), so they
// are baked into the bundle as static seeds. Update CURATED_LAST_UPDATED
// whenever any of the tables here is refreshed — the StalenessBanner uses
// that stamp to warn users when the curation ages past twelve months.

export const CURATED_LAST_UPDATED = '2025-09-15';

// Top-20 trading economies by 2024 goods+services exports (USD, current),
// ordered by rank. Colour palette avoids collisions with the defense /
// climate palettes so the Ledger pages don't look identical.
export interface TradeCountryMeta {
  iso3: string;
  wbKey: string;    // matches worldbank.ts COUNTRY_NAMES
  name: string;
  color: string;
}

export const TRADE_COUNTRY_META: TradeCountryMeta[] = [
  { iso3: 'CHN', wbKey: 'China',        name: 'China',          color: '#dc2626' },
  { iso3: 'USA', wbKey: 'USA',          name: 'United States',  color: '#2563eb' },
  { iso3: 'DEU', wbKey: 'Germany',      name: 'Germany',        color: '#facc15' },
  { iso3: 'NLD', wbKey: 'Netherlands',  name: 'Netherlands',    color: '#f97316' },
  { iso3: 'JPN', wbKey: 'Japan',        name: 'Japan',          color: '#be185d' },
  { iso3: 'KOR', wbKey: 'SouthKorea',   name: 'South Korea',    color: '#0ea5e9' },
  { iso3: 'FRA', wbKey: 'France',       name: 'France',         color: '#6366f1' },
  { iso3: 'ITA', wbKey: 'Italy',        name: 'Italy',          color: '#f59e0b' },
  { iso3: 'GBR', wbKey: 'UK',           name: 'United Kingdom', color: '#1e40af' },
  { iso3: 'MEX', wbKey: 'Mexico',       name: 'Mexico',         color: '#a855f7' },
  { iso3: 'CAN', wbKey: 'Canada',       name: 'Canada',         color: '#ef4444' },
  { iso3: 'BEL', wbKey: 'Belgium',      name: 'Belgium',        color: '#f7b801' },
  { iso3: 'SGP', wbKey: 'Singapore',    name: 'Singapore',      color: '#14b8a6' },
  { iso3: 'IND', wbKey: 'India',        name: 'India',          color: '#f43f5e' },
  { iso3: 'ESP', wbKey: 'Spain',        name: 'Spain',          color: '#84cc16' },
  { iso3: 'CHE', wbKey: 'Switzerland',  name: 'Switzerland',    color: '#7c3aed' },
  { iso3: 'VNM', wbKey: 'Vietnam',      name: 'Vietnam',        color: '#d97706' },
  { iso3: 'ARE', wbKey: 'UAE',          name: 'UAE',            color: '#059669' },
  { iso3: 'POL', wbKey: 'Poland',       name: 'Poland',         color: '#c026d3' },
  { iso3: 'BRA', wbKey: 'Brazil',       name: 'Brazil',         color: '#16a34a' },
];

// ── US-China tariff timeline ─────────────────────────────────────────────
// Key escalations from the 2018-2019 tariff war and 2024-2025 additions
// under the second Trump administration. Rates are weighted-average
// applied tariffs on bilateral trade, based on PIIE and USITC data.
export interface TariffEvent {
  date: string;    // YYYY-MM-DD
  actor: 'US' | 'China';
  target: 'China' | 'US';
  headline: string;
  usTariffOnChina: number; // % — running weighted average AFTER this event
  chinaTariffOnUs: number; // % — running weighted average AFTER this event
}

export const TARIFF_TIMELINE: TariffEvent[] = [
  { date: '2018-01-01', actor: 'US',    target: 'China', headline: 'Baseline — pre-trade war MFN rates',            usTariffOnChina: 3.1,  chinaTariffOnUs: 8.0 },
  { date: '2018-07-06', actor: 'US',    target: 'China', headline: '25% tariff on $34B of Chinese imports (List 1)', usTariffOnChina: 6.3,  chinaTariffOnUs: 12.5 },
  { date: '2018-08-23', actor: 'US',    target: 'China', headline: '25% tariff on additional $16B (List 2)',        usTariffOnChina: 8.4,  chinaTariffOnUs: 14.6 },
  { date: '2018-09-24', actor: 'US',    target: 'China', headline: '10% tariff on $200B (List 3)',                  usTariffOnChina: 12.0, chinaTariffOnUs: 18.3 },
  { date: '2019-05-10', actor: 'US',    target: 'China', headline: 'List 3 hiked to 25%',                            usTariffOnChina: 17.6, chinaTariffOnUs: 20.7 },
  { date: '2019-09-01', actor: 'US',    target: 'China', headline: '15% tariff on $112B (List 4A)',                 usTariffOnChina: 21.2, chinaTariffOnUs: 21.8 },
  { date: '2020-02-14', actor: 'US',    target: 'China', headline: 'Phase 1 deal — List 4A cut to 7.5%',            usTariffOnChina: 19.3, chinaTariffOnUs: 20.7 },
  { date: '2024-05-14', actor: 'US',    target: 'China', headline: 'Biden hikes EV tariff to 100%, semiconductor 50%', usTariffOnChina: 20.5, chinaTariffOnUs: 20.7 },
  { date: '2025-02-04', actor: 'US',    target: 'China', headline: '10% additional universal tariff on China',      usTariffOnChina: 30.5, chinaTariffOnUs: 23.7 },
  { date: '2025-03-04', actor: 'US',    target: 'China', headline: '10% → 20% additional universal',                usTariffOnChina: 40.5, chinaTariffOnUs: 30.7 },
  { date: '2025-04-09', actor: 'US',    target: 'China', headline: 'Reciprocal tariffs escalate to 125%',           usTariffOnChina: 145.0, chinaTariffOnUs: 125.0 },
  { date: '2025-05-12', actor: 'US',    target: 'China', headline: 'US-China Geneva deal — 90-day pause, rates cut', usTariffOnChina: 51.1, chinaTariffOnUs: 32.6 },
  { date: '2025-08-11', actor: 'US',    target: 'China', headline: 'Pause extended to Nov 10',                       usTariffOnChina: 51.1, chinaTariffOnUs: 32.6 },
];

// ── WTO applied simple-mean tariffs 2024 ────────────────────────────────
// Source: WTO World Tariff Profiles 2024. Simple average of applied MFN
// rates across all goods. This is the headline number — trade-weighted
// rates are usually lower.
export interface WtoTariffRow {
  country: string;      // internal country key
  countryLabel: string;
  simpleMeanPct: number;
  boundMeanPct: number | null;
  agriculturalPct: number;
  nonAgriculturalPct: number;
}

export const WTO_APPLIED_TARIFFS_2024: WtoTariffRow[] = [
  { country: 'USA',         countryLabel: 'United States',  simpleMeanPct: 3.4,  boundMeanPct: 3.4,  agriculturalPct: 5.3,  nonAgriculturalPct: 3.1 },
  { country: 'China',       countryLabel: 'China',          simpleMeanPct: 7.5,  boundMeanPct: 10.0, agriculturalPct: 13.9, nonAgriculturalPct: 6.5 },
  { country: 'Germany',     countryLabel: 'EU (all)',       simpleMeanPct: 5.1,  boundMeanPct: 5.1,  agriculturalPct: 11.5, nonAgriculturalPct: 4.1 },
  { country: 'Japan',       countryLabel: 'Japan',          simpleMeanPct: 3.7,  boundMeanPct: 4.4,  agriculturalPct: 15.4, nonAgriculturalPct: 2.0 },
  { country: 'UK',          countryLabel: 'United Kingdom', simpleMeanPct: 3.8,  boundMeanPct: 3.9,  agriculturalPct: 9.0,  nonAgriculturalPct: 3.0 },
  { country: 'SouthKorea',  countryLabel: 'South Korea',    simpleMeanPct: 13.6, boundMeanPct: 16.5, agriculturalPct: 56.9, nonAgriculturalPct: 6.6 },
  { country: 'India',       countryLabel: 'India',          simpleMeanPct: 17.0, boundMeanPct: 50.8, agriculturalPct: 39.6, nonAgriculturalPct: 13.5 },
  { country: 'Brazil',      countryLabel: 'Brazil',         simpleMeanPct: 13.4, boundMeanPct: 31.4, agriculturalPct: 10.1, nonAgriculturalPct: 13.9 },
  { country: 'Canada',      countryLabel: 'Canada',         simpleMeanPct: 3.9,  boundMeanPct: 6.4,  agriculturalPct: 15.3, nonAgriculturalPct: 2.1 },
  { country: 'Mexico',      countryLabel: 'Mexico',         simpleMeanPct: 6.9,  boundMeanPct: 36.2, agriculturalPct: 16.4, nonAgriculturalPct: 5.4 },
  { country: 'Australia',   countryLabel: 'Australia',      simpleMeanPct: 2.4,  boundMeanPct: 9.9,  agriculturalPct: 1.2,  nonAgriculturalPct: 2.6 },
  { country: 'Vietnam',     countryLabel: 'Vietnam',        simpleMeanPct: 9.4,  boundMeanPct: 11.7, agriculturalPct: 17.1, nonAgriculturalPct: 8.2 },
  { country: 'Thailand',    countryLabel: 'Thailand',       simpleMeanPct: 9.8,  boundMeanPct: 28.0, agriculturalPct: 27.0, nonAgriculturalPct: 7.1 },
  { country: 'Turkey',      countryLabel: 'Türkiye',        simpleMeanPct: 10.3, boundMeanPct: 28.6, agriculturalPct: 41.6, nonAgriculturalPct: 5.4 },
  { country: 'Argentina',   countryLabel: 'Argentina',      simpleMeanPct: 13.4, boundMeanPct: 31.8, agriculturalPct: 10.3, nonAgriculturalPct: 13.9 },
];

// ── Shipping / freight indices ──────────────────────────────────────────
// Baltic Dry Index and Drewry World Container Index — canonical proxies
// for dry-bulk and container-freight costs. Monthly snapshots (last day
// of month) from 2020 through mid-2025.
export interface ShippingSnapshot {
  date: string;   // YYYY-MM
  bdi: number;    // Baltic Dry Index
  wci: number;    // Drewry WCI, USD per 40ft container, world composite
}

export const SHIPPING_INDEX_MONTHLY: ShippingSnapshot[] = [
  { date: '2020-01', bdi: 487,  wci: 1443 },
  { date: '2020-06', bdi: 1799, wci: 1739 },
  { date: '2020-12', bdi: 1366, wci: 5410 },
  { date: '2021-06', bdi: 3383, wci: 8399 },
  { date: '2021-09', bdi: 5167, wci: 10377 },
  { date: '2021-12', bdi: 2217, wci: 9146 },
  { date: '2022-03', bdi: 2358, wci: 8798 },
  { date: '2022-06', bdi: 2214, wci: 7286 },
  { date: '2022-12', bdi: 1515, wci: 2115 },
  { date: '2023-06', bdi: 1104, wci: 1449 },
  { date: '2023-12', bdi: 2094, wci: 2670 },
  { date: '2024-01', bdi: 1518, wci: 3777 },
  { date: '2024-03', bdi: 2419, wci: 3223 },
  { date: '2024-07', bdi: 1743, wci: 5901 },
  { date: '2024-12', bdi: 985,  wci: 3905 },
  { date: '2025-03', bdi: 1602, wci: 2168 },
  { date: '2025-06', bdi: 1435, wci: 3527 },
];

// ── Regional trade agreements ───────────────────────────────────────────
// Membership matrix for the four biggest active FTAs. `member` = current
// signatory; `pending` = negotiating or awaiting ratification.
export interface TradeAgreementRow {
  country: string;
  countryLabel: string;
  rcep: 'member' | 'pending' | null;
  usmca: 'member' | 'pending' | null;
  cptpp: 'member' | 'pending' | null;
  eu: 'member' | 'pending' | null;
  afcfta: 'member' | 'pending' | null;
}

export const TRADE_AGREEMENTS: TradeAgreementRow[] = [
  { country: 'USA',        countryLabel: 'United States',  rcep: null,      usmca: 'member', cptpp: null,      eu: null,      afcfta: null },
  { country: 'China',      countryLabel: 'China',          rcep: 'member',  usmca: null,     cptpp: 'pending', eu: null,      afcfta: null },
  { country: 'Japan',      countryLabel: 'Japan',          rcep: 'member',  usmca: null,     cptpp: 'member',  eu: null,      afcfta: null },
  { country: 'SouthKorea', countryLabel: 'South Korea',    rcep: 'member',  usmca: null,     cptpp: 'pending', eu: null,      afcfta: null },
  { country: 'Australia',  countryLabel: 'Australia',      rcep: 'member',  usmca: null,     cptpp: 'member',  eu: null,      afcfta: null },
  { country: 'Vietnam',    countryLabel: 'Vietnam',        rcep: 'member',  usmca: null,     cptpp: 'member',  eu: null,      afcfta: null },
  { country: 'Thailand',   countryLabel: 'Thailand',       rcep: 'member',  usmca: null,     cptpp: 'pending', eu: null,      afcfta: null },
  { country: 'Indonesia',  countryLabel: 'Indonesia',      rcep: 'member',  usmca: null,     cptpp: 'pending', eu: null,      afcfta: null },
  { country: 'Singapore',  countryLabel: 'Singapore',      rcep: 'member',  usmca: null,     cptpp: 'member',  eu: null,      afcfta: null },
  { country: 'Canada',     countryLabel: 'Canada',         rcep: null,      usmca: 'member', cptpp: 'member',  eu: null,      afcfta: null },
  { country: 'Mexico',     countryLabel: 'Mexico',         rcep: null,      usmca: 'member', cptpp: 'member',  eu: null,      afcfta: null },
  { country: 'UK',         countryLabel: 'United Kingdom', rcep: null,      usmca: null,     cptpp: 'member',  eu: null,      afcfta: null },
  { country: 'Germany',    countryLabel: 'Germany',        rcep: null,      usmca: null,     cptpp: null,      eu: 'member',  afcfta: null },
  { country: 'France',     countryLabel: 'France',         rcep: null,      usmca: null,     cptpp: null,      eu: 'member',  afcfta: null },
  { country: 'Italy',      countryLabel: 'Italy',          rcep: null,      usmca: null,     cptpp: null,      eu: 'member',  afcfta: null },
  { country: 'Spain',      countryLabel: 'Spain',          rcep: null,      usmca: null,     cptpp: null,      eu: 'member',  afcfta: null },
  { country: 'Nigeria',    countryLabel: 'Nigeria',        rcep: null,      usmca: null,     cptpp: null,      eu: null,      afcfta: 'member' },
  { country: 'SouthAfrica',countryLabel: 'South Africa',   rcep: null,      usmca: null,     cptpp: null,      eu: null,      afcfta: 'member' },
  { country: 'Kenya',      countryLabel: 'Kenya',          rcep: null,      usmca: null,     cptpp: null,      eu: null,      afcfta: 'member' },
  { country: 'Egypt',      countryLabel: 'Egypt',          rcep: null,      usmca: null,     cptpp: null,      eu: null,      afcfta: 'member' },
];

// ── Supply-chain concentration ──────────────────────────────────────────
// Where the world's critical inputs come from. Top-3 producing countries
// and their combined share. USGS Minerals Yearbook, SEMI, IEA data.
export interface SupplyChainRow {
  product: string;
  category: 'critical mineral' | 'energy' | 'semiconductor' | 'pharma' | 'agri';
  top1Country: string;
  top1SharePct: number;
  top2Country: string;
  top2SharePct: number;
  top3Country: string;
  top3SharePct: number;
  note?: string;
}

export const SUPPLY_CHAIN_CONCENTRATION: SupplyChainRow[] = [
  { product: 'Rare earth elements (mine)',   category: 'critical mineral', top1Country: 'China',      top1SharePct: 69, top2Country: 'United States', top2SharePct: 12, top3Country: 'Myanmar',  top3SharePct: 11, note: 'USGS 2024' },
  { product: 'Rare earth elements (refined)',category: 'critical mineral', top1Country: 'China',      top1SharePct: 90, top2Country: 'Malaysia',      top2SharePct: 4,  top3Country: 'Estonia',  top3SharePct: 2 },
  { product: 'Lithium (mine)',               category: 'critical mineral', top1Country: 'Australia',  top1SharePct: 52, top2Country: 'Chile',         top2SharePct: 25, top3Country: 'China',    top3SharePct: 13 },
  { product: 'Lithium (refined)',            category: 'critical mineral', top1Country: 'China',      top1SharePct: 70, top2Country: 'Chile',         top2SharePct: 20, top3Country: 'Argentina',top3SharePct: 5 },
  { product: 'Cobalt (mine)',                category: 'critical mineral', top1Country: 'DR Congo',   top1SharePct: 74, top2Country: 'Indonesia',     top2SharePct: 6,  top3Country: 'Russia',   top3SharePct: 4 },
  { product: 'Cobalt (refined)',             category: 'critical mineral', top1Country: 'China',      top1SharePct: 74, top2Country: 'Finland',       top2SharePct: 7,  top3Country: 'Canada',   top3SharePct: 3 },
  { product: 'Nickel (mine)',                category: 'critical mineral', top1Country: 'Indonesia',  top1SharePct: 55, top2Country: 'Philippines',   top2SharePct: 10, top3Country: 'Russia',   top3SharePct: 6 },
  { product: 'Graphite (mine)',              category: 'critical mineral', top1Country: 'China',      top1SharePct: 79, top2Country: 'Madagascar',    top2SharePct: 8,  top3Country: 'Mozambique', top3SharePct: 6 },
  { product: 'Semiconductors (< 10nm)',      category: 'semiconductor',    top1Country: 'Taiwan',     top1SharePct: 92, top2Country: 'South Korea',   top2SharePct: 8,  top3Country: 'United States', top3SharePct: 0, note: 'TSMC + Samsung' },
  { product: 'Semiconductors (all nodes)',   category: 'semiconductor',    top1Country: 'Taiwan',     top1SharePct: 60, top2Country: 'South Korea',   top2SharePct: 17, top3Country: 'China',    top3SharePct: 8 },
  { product: 'Solar PV modules',             category: 'energy',           top1Country: 'China',      top1SharePct: 84, top2Country: 'Vietnam',       top2SharePct: 6,  top3Country: 'India',    top3SharePct: 3 },
  { product: 'Neon (semiconductor grade)',   category: 'semiconductor',    top1Country: 'Ukraine',    top1SharePct: 45, top2Country: 'China',         top2SharePct: 35, top3Country: 'Russia',   top3SharePct: 12 },
  { product: 'Active pharma ingredients',    category: 'pharma',           top1Country: 'China',      top1SharePct: 40, top2Country: 'India',         top2SharePct: 20, top3Country: 'European Union', top3SharePct: 25 },
  { product: 'Wheat exports',                category: 'agri',             top1Country: 'Russia',     top1SharePct: 24, top2Country: 'European Union',top2SharePct: 15, top3Country: 'Australia',top3SharePct: 12 },
  { product: 'Palm oil',                     category: 'agri',             top1Country: 'Indonesia',  top1SharePct: 58, top2Country: 'Malaysia',      top2SharePct: 24, top3Country: 'Thailand', top3SharePct: 4 },
];

// ── Maritime chokepoints ────────────────────────────────────────────────
// Daily throughput and % of seaborne trade for the four canonical
// chokepoints, based on UNCTAD Review of Maritime Transport 2024.
export interface ChokepointRow {
  name: string;
  dailyBarrelsMn: number;    // crude oil million barrels/day
  containerShareGlobalPct: number;
  seabornTradeSharePct: number;
  note?: string;
}

export const MARITIME_CHOKEPOINTS: ChokepointRow[] = [
  { name: 'Strait of Hormuz',    dailyBarrelsMn: 20.9, containerShareGlobalPct: 3,  seabornTradeSharePct: 25, note: '~20% of global oil consumption' },
  { name: 'Strait of Malacca',    dailyBarrelsMn: 16.5, containerShareGlobalPct: 25, seabornTradeSharePct: 30, note: 'Chief link between Indian and Pacific oceans' },
  { name: 'Suez Canal',           dailyBarrelsMn: 9.2,  containerShareGlobalPct: 12, seabornTradeSharePct: 12, note: 'Bab-el-Mandeb + Red Sea disruption 2024' },
  { name: 'Bab el-Mandeb',        dailyBarrelsMn: 8.8,  containerShareGlobalPct: 9,  seabornTradeSharePct: 10, note: 'Houthi attacks cut container transits 70% in 2024' },
  { name: 'Panama Canal',         dailyBarrelsMn: 1.9,  containerShareGlobalPct: 6,  seabornTradeSharePct: 5,  note: 'Drought cut daily transits to 24 in 2024' },
  { name: 'Turkish Straits',      dailyBarrelsMn: 2.4,  containerShareGlobalPct: 2,  seabornTradeSharePct: 4,  note: 'Bosphorus + Dardanelles' },
];

// ── Re-export hubs (entrepôt trade) ─────────────────────────────────────
// A large slice of world "exports" is goods passing through a hub, not goods
// made there. This is why bilateral balances are so easy to misread: a
// Chinese good landed in Rotterdam and trucked to Germany counts as a Dutch
// export to Germany. Figures are curated 2024 estimates from national
// statistics offices (CBS Netherlands, Enterprise Singapore, HK Census and
// Statistics Department, Dubai Customs, NBB Belgium) and UNCTAD; origin and
// destination splits are approximations from those offices' published
// breakdowns, so they are directionally right rather than exact.
export interface ReExportHubRow {
  hub: string;
  iso3: string;
  reExportsBnUsd: number;
  shareOfGoodsExportsPct: number;
  // Where the goods come from, and where they go on to. Shares of the hub's
  // re-export total, summing to roughly 100 each.
  origins: { region: string; sharePct: number }[];
  destinations: { region: string; sharePct: number }[];
  note: string;
}

export const RE_EXPORT_HUBS_2024: ReExportHubRow[] = [
  {
    hub: 'Hong Kong',
    iso3: 'HKG',
    reExportsBnUsd: 550,
    shareOfGoodsExportsPct: 99,
    origins: [
      { region: 'Mainland China', sharePct: 60 },
      { region: 'East Asia', sharePct: 22 },
      { region: 'Southeast Asia', sharePct: 10 },
      { region: 'Rest of world', sharePct: 8 },
    ],
    destinations: [
      { region: 'Mainland China', sharePct: 57 },
      { region: 'North America', sharePct: 12 },
      { region: 'Europe', sharePct: 11 },
      { region: 'Southeast Asia', sharePct: 12 },
      { region: 'Rest of world', sharePct: 8 },
    ],
    note: 'Almost nothing Hong Kong "exports" is made in Hong Kong. Most of it is mainland Chinese goods routed out, or foreign goods routed in.',
  },
  {
    hub: 'Netherlands',
    iso3: 'NLD',
    reExportsBnUsd: 320,
    shareOfGoodsExportsPct: 46,
    origins: [
      { region: 'Mainland China', sharePct: 24 },
      { region: 'East Asia', sharePct: 14 },
      { region: 'North America', sharePct: 18 },
      { region: 'Europe', sharePct: 26 },
      { region: 'Rest of world', sharePct: 18 },
    ],
    destinations: [
      { region: 'Europe', sharePct: 74 },
      { region: 'North America', sharePct: 8 },
      { region: 'Rest of world', sharePct: 18 },
    ],
    note: 'The "Rotterdam effect": roughly half of Dutch goods exports are imports that cleared customs in Rotterdam and left again, mostly into Germany.',
  },
  {
    hub: 'Singapore',
    iso3: 'SGP',
    reExportsBnUsd: 270,
    shareOfGoodsExportsPct: 47,
    origins: [
      { region: 'Mainland China', sharePct: 20 },
      { region: 'East Asia', sharePct: 24 },
      { region: 'Southeast Asia', sharePct: 22 },
      { region: 'North America', sharePct: 16 },
      { region: 'Rest of world', sharePct: 18 },
    ],
    destinations: [
      { region: 'Southeast Asia', sharePct: 38 },
      { region: 'Mainland China', sharePct: 16 },
      { region: 'East Asia', sharePct: 14 },
      { region: 'Europe', sharePct: 12 },
      { region: 'Rest of world', sharePct: 20 },
    ],
    note: 'Electronics and refined fuel dominate. Singapore is the clearing house for intra-ASEAN trade as well as a bridge into China.',
  },
  {
    hub: 'UAE',
    iso3: 'ARE',
    reExportsBnUsd: 175,
    shareOfGoodsExportsPct: 40,
    origins: [
      { region: 'Mainland China', sharePct: 30 },
      { region: 'South Asia', sharePct: 16 },
      { region: 'Europe', sharePct: 18 },
      { region: 'East Asia', sharePct: 14 },
      { region: 'Rest of world', sharePct: 22 },
    ],
    destinations: [
      { region: 'Middle East', sharePct: 34 },
      { region: 'Sub-Saharan Africa', sharePct: 20 },
      { region: 'South Asia', sharePct: 18 },
      { region: 'Rest of world', sharePct: 28 },
    ],
    note: 'Jebel Ali and the Dubai free zones supply the Gulf, East Africa and South Asia — and, since 2022, have become a significant conduit for goods flowing to Russia.',
  },
  {
    hub: 'Belgium',
    iso3: 'BEL',
    reExportsBnUsd: 105,
    shareOfGoodsExportsPct: 21,
    origins: [
      { region: 'Europe', sharePct: 34 },
      { region: 'Mainland China', sharePct: 16 },
      { region: 'North America', sharePct: 16 },
      { region: 'Rest of world', sharePct: 34 },
    ],
    destinations: [
      { region: 'Europe', sharePct: 78 },
      { region: 'Rest of world', sharePct: 22 },
    ],
    note: 'Antwerp plays the same role as Rotterdam for chemicals, pharmaceuticals and diamonds.',
  },
  {
    hub: 'Panama',
    iso3: 'PAN',
    reExportsBnUsd: 14,
    shareOfGoodsExportsPct: 82,
    origins: [
      { region: 'Mainland China', sharePct: 34 },
      { region: 'North America', sharePct: 26 },
      { region: 'East Asia', sharePct: 14 },
      { region: 'Rest of world', sharePct: 26 },
    ],
    destinations: [
      { region: 'Latin America', sharePct: 82 },
      { region: 'Rest of world', sharePct: 18 },
    ],
    note: 'The Colón Free Zone is small in dollar terms but supplies most of Central America and the northern Andes.',
  },
];

// ── Trade frictions timeline ────────────────────────────────────────────
// Major trade-war and sanctions events since 2018. Used for the epic
// timeline in Chapter 8.
export interface TradeFriction {
  date: string;      // YYYY-MM
  headline: string;
  actors: string;
  category: 'tariff' | 'sanction' | 'export control' | 'chokepoint' | 'wto';
  severity: 1 | 2 | 3 | 4 | 5;  // 5 = global systemic
}

export const TRADE_FRICTIONS_TIMELINE: TradeFriction[] = [
  { date: '2018-07', headline: 'US-China trade war begins (List 1 tariffs)',            actors: 'US, China',        category: 'tariff',         severity: 4 },
  { date: '2019-05', headline: 'US bans Huawei / Entity List',                          actors: 'US, China',        category: 'export control', severity: 4 },
  { date: '2020-01', headline: 'Phase 1 US-China deal signed',                          actors: 'US, China',        category: 'tariff',         severity: 3 },
  { date: '2020-04', headline: 'Covid supply-chain shock — freight rates 10×',          actors: 'Global',           category: 'chokepoint',     severity: 4 },
  { date: '2021-03', headline: 'Ever Given blocks Suez Canal for 6 days',               actors: 'Global',           category: 'chokepoint',     severity: 3 },
  { date: '2022-02', headline: 'Western sanctions on Russia — energy, financial',       actors: 'G7, EU, Russia',   category: 'sanction',       severity: 5 },
  { date: '2022-08', headline: 'US CHIPS Act export controls on advanced semiconductors',actors: 'US, China',       category: 'export control', severity: 5 },
  { date: '2023-08', headline: 'Panama Canal drought — daily transits halved',           actors: 'Global',           category: 'chokepoint',     severity: 3 },
  { date: '2023-11', headline: 'Houthi attacks disrupt Red Sea / Suez',                  actors: 'Global, Yemen',    category: 'chokepoint',     severity: 4 },
  { date: '2024-05', headline: 'Biden hikes EV / semi tariffs on China',                actors: 'US, China',        category: 'tariff',         severity: 3 },
  { date: '2024-10', headline: 'EU imposes provisional EV tariffs on China (up to 35%)',actors: 'EU, China',        category: 'tariff',         severity: 3 },
  { date: '2025-02', headline: 'Trump II — 10% universal China tariff',                 actors: 'US, China',        category: 'tariff',         severity: 4 },
  { date: '2025-04', headline: 'US reciprocal tariffs escalate to 145% on China',        actors: 'US, China',        category: 'tariff',         severity: 5 },
  { date: '2025-05', headline: 'Geneva de-escalation — 90-day pause',                    actors: 'US, China',        category: 'tariff',         severity: 3 },
];
