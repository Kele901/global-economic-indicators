// Static seed data for the Resource Atlas.
// Sources (as of end-of-2024, rounded):
//   - Oil reserves & production: EIA International Energy Statistics + OPEC ASB 2024
//   - Natural gas reserves: BP Statistical Review of World Energy 2024
//   - Coal reserves: BP Statistical Review of World Energy 2024
//   - Global aggregates used for the Reserves Clock: BP + IEA World Energy Outlook 2024
//   - Supercycle eras: consensus historical narrative (IMF, IEA, EIA retrospectives)

export interface CountryResourceValue {
  country: string;
  iso: string;
  value: number;
}

// Crude oil proven reserves, billion barrels (end-of-2024 estimates).
export const STATIC_OIL_RESERVES_2024: CountryResourceValue[] = [
  { country: 'Venezuela',    iso: 'VE', value: 303.2 },
  { country: 'Saudi Arabia', iso: 'SA', value: 267.2 },
  { country: 'Iran',         iso: 'IR', value: 208.6 },
  { country: 'Canada',       iso: 'CA', value: 168.1 },
  { country: 'Iraq',         iso: 'IQ', value: 145.0 },
  { country: 'Kuwait',       iso: 'KW', value: 101.5 },
  { country: 'UAE',          iso: 'AE', value:  97.8 },
  { country: 'Russia',       iso: 'RU', value:  80.0 },
  { country: 'Libya',        iso: 'LY', value:  48.4 },
  { country: 'USA',          iso: 'US', value:  47.1 },
  { country: 'Nigeria',      iso: 'NG', value:  36.9 },
  { country: 'Kazakhstan',   iso: 'KZ', value:  30.0 },
  { country: 'China',        iso: 'CN', value:  26.0 },
  { country: 'Qatar',        iso: 'QA', value:  25.2 },
  { country: 'Brazil',       iso: 'BR', value:  12.7 },
  { country: 'Algeria',      iso: 'DZ', value:  12.2 },
  { country: 'Angola',       iso: 'AO', value:   8.2 },
  { country: 'Ecuador',      iso: 'EC', value:   8.3 },
  { country: 'Mexico',       iso: 'MX', value:   6.1 },
  { country: 'Norway',       iso: 'NO', value:   7.9 },
  { country: 'Oman',         iso: 'OM', value:   5.4 },
  { country: 'India',        iso: 'IN', value:   4.5 },
  { country: 'UK',           iso: 'GB', value:   2.5 },
  { country: 'Indonesia',    iso: 'ID', value:   2.4 },
  { country: 'Argentina',    iso: 'AR', value:   2.5 },
];

// Crude oil production, thousand barrels per day (2024 estimates).
export const STATIC_OIL_PRODUCTION_2024: CountryResourceValue[] = [
  { country: 'USA',          iso: 'US', value: 13300 },
  { country: 'Saudi Arabia', iso: 'SA', value:  9800 },
  { country: 'Russia',       iso: 'RU', value:  9400 },
  { country: 'Canada',       iso: 'CA', value:  5000 },
  { country: 'China',        iso: 'CN', value:  4200 },
  { country: 'Iraq',         iso: 'IQ', value:  4300 },
  { country: 'Iran',         iso: 'IR', value:  3700 },
  { country: 'UAE',          iso: 'AE', value:  3200 },
  { country: 'Brazil',       iso: 'BR', value:  3500 },
  { country: 'Kuwait',       iso: 'KW', value:  2500 },
  { country: 'Norway',       iso: 'NO', value:  1900 },
  { country: 'Mexico',       iso: 'MX', value:  1700 },
  { country: 'Kazakhstan',   iso: 'KZ', value:  1800 },
  { country: 'Nigeria',      iso: 'NG', value:  1400 },
  { country: 'Qatar',        iso: 'QA', value:  1300 },
  { country: 'Algeria',      iso: 'DZ', value:  1000 },
  { country: 'Angola',       iso: 'AO', value:  1100 },
  { country: 'Libya',        iso: 'LY', value:  1200 },
  { country: 'Venezuela',    iso: 'VE', value:   800 },
  { country: 'Oman',         iso: 'OM', value:  1000 },
  { country: 'Colombia',     iso: 'CO', value:   770 },
  { country: 'UK',           iso: 'GB', value:   660 },
  { country: 'Indonesia',    iso: 'ID', value:   630 },
  { country: 'Argentina',    iso: 'AR', value:   730 },
  { country: 'Egypt',        iso: 'EG', value:   560 },
];

// Natural gas proven reserves, trillion cubic feet (Tcf) (end-of-2024 estimates).
export const STATIC_NATURAL_GAS_RESERVES_2024: CountryResourceValue[] = [
  { country: 'Russia',       iso: 'RU', value: 1320 },
  { country: 'Iran',         iso: 'IR', value: 1200 },
  { country: 'Qatar',        iso: 'QA', value:  871 },
  { country: 'USA',          iso: 'US', value:  691 },
  { country: 'Turkmenistan', iso: 'TM', value:  480 },
  { country: 'Saudi Arabia', iso: 'SA', value:  333 },
  { country: 'UAE',          iso: 'AE', value:  290 },
  { country: 'Venezuela',    iso: 'VE', value:  221 },
  { country: 'Nigeria',      iso: 'NG', value:  208 },
  { country: 'China',        iso: 'CN', value:  297 },
  { country: 'Algeria',      iso: 'DZ', value:  159 },
  { country: 'Australia',    iso: 'AU', value:  135 },
  { country: 'Iraq',         iso: 'IQ', value:  126 },
  { country: 'Indonesia',    iso: 'ID', value:  106 },
  { country: 'Canada',       iso: 'CA', value:   88 },
  { country: 'Egypt',        iso: 'EG', value:   77 },
  { country: 'Norway',       iso: 'NO', value:   58 },
  { country: 'Kazakhstan',   iso: 'KZ', value:   85 },
  { country: 'Malaysia',     iso: 'MY', value:   32 },
  { country: 'India',        iso: 'IN', value:   47 },
];

// Coal proven reserves, million short tons (end-of-2024).
export const STATIC_COAL_RESERVES_2024: CountryResourceValue[] = [
  { country: 'USA',          iso: 'US', value: 249540 },
  { country: 'Russia',       iso: 'RU', value: 176770 },
  { country: 'Australia',    iso: 'AU', value: 161770 },
  { country: 'China',        iso: 'CN', value: 155600 },
  { country: 'India',        iso: 'IN', value: 111050 },
  { country: 'Indonesia',    iso: 'ID', value:  38700 },
  { country: 'Germany',      iso: 'DE', value:  38230 },
  { country: 'Ukraine',      iso: 'UA', value:  37940 },
  { country: 'Poland',       iso: 'PL', value:  28210 },
  { country: 'Kazakhstan',   iso: 'KZ', value:  28220 },
  { country: 'South Africa', iso: 'ZA', value:   9890 },
  { country: 'Canada',       iso: 'CA', value:   6580 },
  { country: 'Colombia',     iso: 'CO', value:   4880 },
  { country: 'Turkey',       iso: 'TR', value:  12410 },
  { country: 'Brazil',       iso: 'BR', value:   7280 },
];

// Global aggregates used to compute years-to-depletion for the Reserves Clock.
// Reserves ÷ annual production.
export interface GlobalReservesAggregate {
  id: string;
  label: string;
  unit: string;
  reserves: number;
  annualProduction: number;
  productionUnit: string;
  category: 'energy' | 'metals';
  notes?: string;
}

export const GLOBAL_RESERVES_AGGREGATES: GlobalReservesAggregate[] = [
  {
    id: 'oil',
    label: 'Crude Oil',
    unit: 'billion barrels',
    reserves: 1650,
    annualProduction: 30.7, // ~84 mb/d × 365 / 1000
    productionUnit: 'billion barrels / year',
    category: 'energy',
    notes: 'Proven reserves ~1.65 trillion barrels; global output ~84 mb/d.',
  },
  {
    id: 'gas',
    label: 'Natural Gas',
    unit: 'trillion cubic feet',
    reserves: 7200,
    annualProduction: 145,
    productionUnit: 'Tcf / year',
    category: 'energy',
    notes: 'BP SROWE 2024 proven reserves; IEA production 4,100 bcm/yr ≈ 145 Tcf.',
  },
  {
    id: 'coal',
    label: 'Coal',
    unit: 'billion short tons',
    reserves: 1075,
    annualProduction: 9.0,
    productionUnit: 'billion short tons / year',
    category: 'energy',
    notes: 'Reserves 1.07 trillion short tons; production ~8.7 Gt/yr.',
  },
  {
    id: 'copper',
    label: 'Copper',
    unit: 'million tonnes (reserves)',
    reserves: 980,
    annualProduction: 23.0,
    productionUnit: 'Mt / year',
    category: 'metals',
    notes: 'USGS MCS 2025: reserves ~980 Mt, mine output ~23 Mt in 2024. Chile holds ~19% of reserves.',
  },
  {
    id: 'lithium',
    label: 'Lithium',
    unit: 'million tonnes (reserves)',
    reserves: 30,
    annualProduction: 0.24,
    productionUnit: 'Mt / year',
    category: 'metals',
    notes: 'USGS MCS 2025: output ~240 kt in 2024, up ~18% in a year as EV demand pulls new brine and hard-rock supply.',
  },
  {
    id: 'nickel',
    label: 'Nickel',
    unit: 'million tonnes (reserves)',
    reserves: 130,
    annualProduction: 3.7,
    productionUnit: 'Mt / year',
    category: 'metals',
    notes: 'USGS MCS 2025; Indonesia mines ~60% of the world total and holds ~42% of reserves.',
  },
  {
    id: 'cobalt',
    label: 'Cobalt',
    unit: 'million tonnes (reserves)',
    reserves: 11,
    annualProduction: 0.29,
    productionUnit: 'Mt / year',
    category: 'metals',
    notes: 'USGS MCS 2025; DR Congo mines roughly three-quarters of world supply, mostly as a copper by-product.',
  },
  {
    id: 'rareEarths',
    label: 'Rare Earths',
    unit: 'million tonnes REO (reserves)',
    reserves: 90,
    annualProduction: 0.39,
    productionUnit: 'Mt REO / year',
    category: 'metals',
    notes: 'USGS MCS 2025. Geologically plentiful; the bottleneck is separation and refining, ~90% of which is in China.',
  },
];

// OPEC members (2024 onwards; Angola left in January 2024) and the non-OPEC
// partners in the OPEC+ Declaration of Cooperation.
export const OPEC_MEMBERS = new Set([
  'Algeria', 'Congo', 'Equatorial Guinea', 'Gabon', 'Iran', 'Iraq', 'Kuwait',
  'Libya', 'Nigeria', 'Saudi Arabia', 'UAE', 'Venezuela',
]);
export const OPEC_PLUS_PARTNERS = new Set([
  'Russia', 'Kazakhstan', 'Mexico', 'Oman', 'Azerbaijan', 'Bahrain', 'Brunei',
  'Malaysia', 'Sudan', 'South Sudan',
]);

// World totals used as the denominator for "share of world" bars.
export const WORLD_RESOURCE_TOTALS = {
  oilReserves: 1650,        // billion barrels
  oilProduction: 84100,     // thousand barrels / day
  gasReserves: 7200,        // trillion cubic feet
  coalReserves: 1075000,    // million short tons
};

// Proven oil reserves vs. cumulative extraction. BP Statistical Review of
// World Energy 2021, the last edition to publish global reserves (later
// editions by the Energy Institute dropped the series). Production includes
// NGLs; R/P is reserves ÷ that year's output.
export interface OilReservesHistoryPoint {
  year: number;
  reserves: number;   // billion barrels
  production: number; // million barrels / day
}

export const OIL_RESERVES_HISTORY: OilReservesHistoryPoint[] = [
  { year: 1980, reserves: 683,  production: 62.9 },
  { year: 1985, reserves: 770,  production: 57.5 },
  { year: 1990, reserves: 1028, production: 65.5 },
  { year: 1995, reserves: 1127, production: 68.1 },
  { year: 2000, reserves: 1301, production: 74.9 },
  { year: 2005, reserves: 1374, production: 81.3 },
  { year: 2010, reserves: 1637, production: 83.1 },
  { year: 2015, reserves: 1692, production: 91.7 },
  { year: 2020, reserves: 1732, production: 88.4 },
];

// Supply concentration for transition-critical minerals.
// Mine output: USGS Mineral Commodity Summaries 2025 (2024 estimates).
// Refining: IEA Global Critical Minerals Outlook 2024 (2023 shares). Rounded.
export interface CriticalMineralConcentration {
  mineral: string;
  topProducer: string;
  topProducerShare: number;   // % of world mine output
  top3Share: number;          // % of world mine output
  chinaRefiningShare: number; // % of world refined output
  use: string;
}

export const CRITICAL_MINERALS: CriticalMineralConcentration[] = [
  { mineral: 'Graphite',    topProducer: 'China',       topProducerShare: 79, top3Share: 90, chinaRefiningShare: 95, use: 'Battery anodes' },
  { mineral: 'Cobalt',      topProducer: 'DR Congo',    topProducerShare: 76, top3Share: 89, chinaRefiningShare: 76, use: 'Battery cathodes, superalloys' },
  { mineral: 'Rare earths', topProducer: 'China',       topProducerShare: 69, top3Share: 89, chinaRefiningShare: 90, use: 'Magnets for EV motors & wind turbines' },
  { mineral: 'Nickel',      topProducer: 'Indonesia',   topProducerShare: 59, top3Share: 74, chinaRefiningShare: 35, use: 'Battery cathodes, stainless steel' },
  { mineral: 'Lithium',     topProducer: 'Australia',   topProducerShare: 37, top3Share: 74, chinaRefiningShare: 65, use: 'Battery cathodes & electrolyte' },
  { mineral: 'Copper',      topProducer: 'Chile',       topProducerShare: 23, top3Share: 48, chinaRefiningShare: 44, use: 'Grids, motors, wiring' },
];

// Fiscal break-even oil prices: the Brent price at which each government's
// budget balances. IMF Regional Economic Outlook (Middle East & Central Asia),
// 2025 estimates, rounded to the nearest dollar.
export interface FiscalBreakeven {
  country: string;
  breakeven: number; // $/bbl
}

export const FISCAL_BREAKEVEN_2025: FiscalBreakeven[] = [
  { country: 'Bahrain',      breakeven: 125 },
  { country: 'Saudi Arabia', breakeven: 91 },
  { country: 'Kuwait',       breakeven: 82 },
  { country: 'Oman',         breakeven: 54 },
  { country: 'UAE',          breakeven: 50 },
  { country: 'Qatar',        breakeven: 44 },
];

// Commodity-funded sovereign wealth funds. Assets under management are
// rounded 2025 estimates (Global SWF / fund annual reports); per-head uses
// UN WPP 2024 population.
export interface SovereignWealthFund {
  country: string;
  fund: string;
  assetsBn: number;     // USD billion
  populationM: number;  // million people
  source: string;       // commodity that funds it
}

export const SOVEREIGN_WEALTH_FUNDS: SovereignWealthFund[] = [
  { country: 'Norway',       fund: 'Government Pension Fund Global', assetsBn: 1800, populationM: 5.6,  source: 'Oil & gas' },
  { country: 'UAE',          fund: 'ADIA + Mubadala',                 assetsBn: 1430, populationM: 10.9, source: 'Oil' },
  { country: 'Kuwait',       fund: 'Kuwait Investment Authority',     assetsBn: 1000, populationM: 4.9,  source: 'Oil' },
  { country: 'Saudi Arabia', fund: 'Public Investment Fund',          assetsBn: 930,  populationM: 33.9, source: 'Oil' },
  { country: 'Qatar',        fund: 'Qatar Investment Authority',      assetsBn: 530,  populationM: 2.7,  source: 'Gas' },
  { country: 'Libya',        fund: 'Libyan Investment Authority',     assetsBn: 70,   populationM: 7.4,  source: 'Oil' },
  { country: 'Kazakhstan',   fund: 'National Fund',                   assetsBn: 60,   populationM: 20.6, source: 'Oil' },
  { country: 'Chile',        fund: 'ESSF + Pension Reserve Fund',     assetsBn: 13,   populationM: 19.7, source: 'Copper' },
];

// Annual crude benchmark before the FRED daily series begin (WTI 1986, Brent
// 1987). BP Statistical Review: Arabian Light posted at Ras Tanura to 1983,
// Brent dated from 1984. US$ per barrel, money of the day.
export const HISTORIC_OIL_PRICES: { year: number; value: number }[] = [
  { year: 1970, value: 1.80 },
  { year: 1971, value: 2.24 },
  { year: 1972, value: 2.48 },
  { year: 1973, value: 3.29 },
  { year: 1974, value: 11.58 },
  { year: 1975, value: 11.53 },
  { year: 1976, value: 12.80 },
  { year: 1977, value: 13.92 },
  { year: 1978, value: 14.02 },
  { year: 1979, value: 31.61 },
  { year: 1980, value: 36.83 },
  { year: 1981, value: 35.93 },
  { year: 1982, value: 32.97 },
  { year: 1983, value: 29.55 },
  { year: 1984, value: 28.78 },
  { year: 1985, value: 27.56 },
];

// Commodity supercycle era annotations for the scrubbable timeline.
export interface SupercycleEra {
  id: string;
  label: string;
  yearStart: number;
  yearEnd: number;
  peakYear: number;
  headline: string;
  description: string;
  winners: string[];
  losers: string[];
}

export const SUPERCYCLE_ERAS: SupercycleEra[] = [
  {
    id: 'first-shock',
    label: '1973 Oil Shock',
    yearStart: 1973,
    yearEnd: 1978,
    peakYear: 1974,
    headline: 'OPEC embargo quadruples oil prices in months',
    description:
      'The Yom Kippur War triggered an Arab oil embargo against nations supporting Israel. WTI jumped from ~$3 to ~$12/bbl. Petrostates ran huge surpluses and recycled dollars into Western banks; industrial economies faced stagflation.',
    winners: ['Saudi Arabia', 'Iran', 'Venezuela', 'Kuwait', 'UAE'],
    losers: ['USA', 'Japan', 'Germany', 'UK', 'France'],
  },
  {
    id: 'second-shock',
    label: '1979 Iranian Revolution',
    yearStart: 1979,
    yearEnd: 1985,
    peakYear: 1980,
    headline: 'Revolution and Iran-Iraq war double prices again',
    description:
      'The fall of the Shah and the ensuing Iran-Iraq war removed millions of barrels from world markets. Prices peaked near $40/bbl (over $140 in 2024 dollars). Volcker responded with 20% US rates, breaking global inflation and setting up the 1980s crash.',
    winners: ['Iran', 'Iraq', 'Norway', 'Mexico', 'Saudi Arabia'],
    losers: ['USA', 'Brazil', 'Argentina', 'Turkey', 'Poland'],
  },
  {
    id: '1986-crash',
    label: '1986 Price Collapse',
    yearStart: 1986,
    yearEnd: 1998,
    peakYear: 1986,
    headline: 'Saudi Arabia opens the taps: prices fall two-thirds',
    description:
      'After years of quota-cutting to defend prices, Saudi Arabia flooded the market to reclaim share. WTI collapsed from $27 to under $10 by 1986. The USSR lost hard-currency income (a contributor to its 1991 dissolution) and Latin American petrostates entered the "lost decade".',
    winners: ['USA', 'Japan', 'Germany', 'South Korea'],
    losers: ['Soviet Union', 'Venezuela', 'Nigeria', 'Mexico', 'Algeria'],
  },
  {
    id: 'asia-crisis',
    label: '1998 Asian Crisis Low',
    yearStart: 1998,
    yearEnd: 2000,
    peakYear: 1998,
    headline: 'Demand shock from Asian financial crisis',
    description:
      'Asian FX crisis crushed regional demand. Brent traded below $10/bbl briefly. Set the low base from which the 2000s China-driven supercycle exploded.',
    winners: [],
    losers: ['Russia', 'Venezuela', 'Nigeria'],
  },
  {
    id: 'china-boom',
    label: '2000s China Supercycle',
    yearStart: 2000,
    yearEnd: 2008,
    peakYear: 2008,
    headline: 'China\'s WTO entry drives every commodity to record highs',
    description:
      'China\'s industrialisation absorbed unprecedented volumes of oil, copper, iron ore and coal. Oil peaked at $147/bbl in July 2008 before the Global Financial Crisis wiped out demand. Iron ore, copper and coal all set multi-decade highs.',
    winners: ['Russia', 'Saudi Arabia', 'Brazil', 'Australia', 'Canada', 'Norway', 'Chile'],
    losers: ['USA', 'Japan', 'Germany', 'South Korea', 'India'],
  },
  {
    id: 'shale-crash',
    label: '2014-16 Shale-Driven Crash',
    yearStart: 2014,
    yearEnd: 2016,
    peakYear: 2016,
    headline: 'US shale + Saudi price war crushes oil',
    description:
      'US tight-oil production nearly doubled between 2010 and 2014. Saudi Arabia refused to cut quotas, aiming to shut in high-cost US barrels. Brent fell from $115 to $27/bbl. Russia, Venezuela and Nigeria entered fiscal crises; Venezuelan output collapsed.',
    winners: ['USA (net importer)', 'Japan', 'India', 'China'],
    losers: ['Russia', 'Venezuela', 'Nigeria', 'Saudi Arabia', 'Angola'],
  },
  {
    id: 'covid',
    label: '2020 Covid Demand Shock',
    yearStart: 2020,
    yearEnd: 2020,
    peakYear: 2020,
    headline: 'WTI trades negative for the first time in history',
    description:
      'Global lockdowns wiped out ~30% of oil demand overnight. WTI May 2020 futures settled at −$37/bbl on 20 April 2020 as buyers ran out of storage. OPEC+ cut 9.7 mb/d to stabilise the market.',
    winners: [],
    losers: ['Every producer'],
  },
  {
    id: 'ukraine',
    label: '2022 Ukraine Invasion',
    yearStart: 2021,
    yearEnd: 2023,
    peakYear: 2022,
    headline: 'Russian invasion reshapes global energy flows',
    description:
      'Brent touched $128/bbl. European gas prices hit €300/MWh (ten times normal). Europe replaced Russian pipeline gas with US and Qatari LNG. Russia rerouted crude to India and China at deep discounts.',
    winners: ['USA (LNG)', 'Qatar', 'Norway', 'Saudi Arabia', 'UAE'],
    losers: ['Germany', 'Italy', 'UK', 'Japan', 'Sri Lanka', 'Egypt'],
  },
];
