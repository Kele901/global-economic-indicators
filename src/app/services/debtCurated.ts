// Curated snapshots that ride alongside the live World Bank / FRED debt
// series on the Debt Ledger. IMF WEO projections, sovereign ratings,
// sovereign CDS spreads, sovereign default history, central bank balance
// sheet peaks, and household debt are not freely available via stable
// live APIs (paywalls, PDF-only releases, rating-agency licences), so
// they are baked into the bundle as static seeds. Update
// CURATED_LAST_UPDATED whenever any of the tables here is refreshed —
// the StalenessBanner uses that stamp to warn users when the curation
// ages past twelve months.

export const CURATED_LAST_UPDATED = '2025-10-01';

// Roster of debt-relevant economies (G7 + BRICS + fragile / distressed
// sovereigns + zero-tolerance debt hawks). Colour palette avoids
// collisions with the trade / climate / defense palettes so the Ledger
// pages don't look identical.
export interface DebtCountryMeta {
  iso3: string;
  wbKey: string;   // matches worldbank.ts COUNTRY_NAMES
  name: string;
  color: string;
}

export const DEBT_COUNTRY_META: DebtCountryMeta[] = [
  { iso3: 'JPN', wbKey: 'Japan',        name: 'Japan',          color: '#dc2626' },
  { iso3: 'USA', wbKey: 'USA',          name: 'United States',  color: '#2563eb' },
  { iso3: 'ITA', wbKey: 'Italy',        name: 'Italy',          color: '#f59e0b' },
  { iso3: 'FRA', wbKey: 'France',       name: 'France',         color: '#6366f1' },
  { iso3: 'GBR', wbKey: 'UK',           name: 'United Kingdom', color: '#1e40af' },
  { iso3: 'DEU', wbKey: 'Germany',      name: 'Germany',        color: '#facc15' },
  { iso3: 'ESP', wbKey: 'Spain',        name: 'Spain',          color: '#84cc16' },
  { iso3: 'CAN', wbKey: 'Canada',       name: 'Canada',         color: '#ef4444' },
  { iso3: 'CHN', wbKey: 'China',        name: 'China',          color: '#b91c1c' },
  { iso3: 'IND', wbKey: 'India',        name: 'India',          color: '#f43f5e' },
  { iso3: 'BRA', wbKey: 'Brazil',       name: 'Brazil',         color: '#16a34a' },
  { iso3: 'RUS', wbKey: 'Russia',       name: 'Russia',         color: '#7c3aed' },
  { iso3: 'MEX', wbKey: 'Mexico',       name: 'Mexico',         color: '#a855f7' },
  { iso3: 'ARG', wbKey: 'Argentina',    name: 'Argentina',      color: '#06b6d4' },
  { iso3: 'TUR', wbKey: 'Turkey',       name: 'Turkey',         color: '#f97316' },
  { iso3: 'ZAF', wbKey: 'SouthAfrica',  name: 'South Africa',   color: '#059669' },
  { iso3: 'NGA', wbKey: 'Nigeria',      name: 'Nigeria',        color: '#0ea5e9' },
  { iso3: 'AUS', wbKey: 'Australia',    name: 'Australia',      color: '#e11d48' },
  { iso3: 'KOR', wbKey: 'SouthKorea',   name: 'South Korea',    color: '#8b5cf6' },
  { iso3: 'GRC', wbKey: 'Greece',       name: 'Greece',         color: '#0891b2' },
];

// ────────────────────────────────────────────────────────────────────────
// IMF WEO Oct 2024 general-government gross debt projections (% of GDP).
// Source: IMF World Economic Outlook Database, October 2024. Values are
// as-projected — historical years match WEO's own reported figures which
// occasionally diverge from World Bank series (different vintages).
// ────────────────────────────────────────────────────────────────────────
export interface DebtProjectionPoint {
  year: number;
  value: number;
}
export interface DebtProjectionSeries {
  iso3: string;
  name: string;
  points: DebtProjectionPoint[];   // 2019-2029
}

export const IMF_WEO_DEBT_PROJECTIONS: DebtProjectionSeries[] = [
  {
    iso3: 'JPN', name: 'Japan', points: [
      { year: 2019, value: 236 }, { year: 2020, value: 258 }, { year: 2021, value: 253 },
      { year: 2022, value: 248 }, { year: 2023, value: 244 }, { year: 2024, value: 251 },
      { year: 2025, value: 249 }, { year: 2026, value: 249 }, { year: 2027, value: 249 },
      { year: 2028, value: 249 }, { year: 2029, value: 249 },
    ],
  },
  {
    iso3: 'USA', name: 'United States', points: [
      { year: 2019, value: 108 }, { year: 2020, value: 132 }, { year: 2021, value: 126 },
      { year: 2022, value: 121 }, { year: 2023, value: 123 }, { year: 2024, value: 121 },
      { year: 2025, value: 125 }, { year: 2026, value: 128 }, { year: 2027, value: 131 },
      { year: 2028, value: 133 }, { year: 2029, value: 134 },
    ],
  },
  {
    iso3: 'ITA', name: 'Italy', points: [
      { year: 2019, value: 134 }, { year: 2020, value: 155 }, { year: 2021, value: 147 },
      { year: 2022, value: 141 }, { year: 2023, value: 137 }, { year: 2024, value: 138 },
      { year: 2025, value: 139 }, { year: 2026, value: 141 }, { year: 2027, value: 143 },
      { year: 2028, value: 144 }, { year: 2029, value: 144 },
    ],
  },
  {
    iso3: 'FRA', name: 'France', points: [
      { year: 2019, value: 98  }, { year: 2020, value: 115 }, { year: 2021, value: 113 },
      { year: 2022, value: 111 }, { year: 2023, value: 110 }, { year: 2024, value: 112 },
      { year: 2025, value: 115 }, { year: 2026, value: 117 }, { year: 2027, value: 119 },
      { year: 2028, value: 122 }, { year: 2029, value: 124 },
    ],
  },
  {
    iso3: 'GBR', name: 'United Kingdom', points: [
      { year: 2019, value: 85  }, { year: 2020, value: 106 }, { year: 2021, value: 105 },
      { year: 2022, value: 100 }, { year: 2023, value: 100 }, { year: 2024, value: 102 },
      { year: 2025, value: 104 }, { year: 2026, value: 106 }, { year: 2027, value: 108 },
      { year: 2028, value: 110 }, { year: 2029, value: 111 },
    ],
  },
  {
    iso3: 'DEU', name: 'Germany', points: [
      { year: 2019, value: 59  }, { year: 2020, value: 68  }, { year: 2021, value: 68  },
      { year: 2022, value: 66  }, { year: 2023, value: 63  }, { year: 2024, value: 63  },
      { year: 2025, value: 63  }, { year: 2026, value: 62  }, { year: 2027, value: 61  },
      { year: 2028, value: 61  }, { year: 2029, value: 60  },
    ],
  },
  {
    iso3: 'ESP', name: 'Spain', points: [
      { year: 2019, value: 98  }, { year: 2020, value: 120 }, { year: 2021, value: 116 },
      { year: 2022, value: 112 }, { year: 2023, value: 106 }, { year: 2024, value: 104 },
      { year: 2025, value: 103 }, { year: 2026, value: 103 }, { year: 2027, value: 102 },
      { year: 2028, value: 102 }, { year: 2029, value: 101 },
    ],
  },
  {
    iso3: 'CHN', name: 'China', points: [
      { year: 2019, value: 57  }, { year: 2020, value: 70  }, { year: 2021, value: 72  },
      { year: 2022, value: 77  }, { year: 2023, value: 84  }, { year: 2024, value: 90  },
      { year: 2025, value: 96  }, { year: 2026, value: 102 }, { year: 2027, value: 107 },
      { year: 2028, value: 112 }, { year: 2029, value: 117 },
    ],
  },
  {
    iso3: 'IND', name: 'India', points: [
      { year: 2019, value: 75  }, { year: 2020, value: 89  }, { year: 2021, value: 84  },
      { year: 2022, value: 81  }, { year: 2023, value: 82  }, { year: 2024, value: 83  },
      { year: 2025, value: 82  }, { year: 2026, value: 82  }, { year: 2027, value: 82  },
      { year: 2028, value: 81  }, { year: 2029, value: 81  },
    ],
  },
  {
    iso3: 'BRA', name: 'Brazil', points: [
      { year: 2019, value: 88  }, { year: 2020, value: 99  }, { year: 2021, value: 90  },
      { year: 2022, value: 85  }, { year: 2023, value: 85  }, { year: 2024, value: 88  },
      { year: 2025, value: 91  }, { year: 2026, value: 94  }, { year: 2027, value: 97  },
      { year: 2028, value: 99  }, { year: 2029, value: 101 },
    ],
  },
  {
    iso3: 'ARG', name: 'Argentina', points: [
      { year: 2019, value: 90  }, { year: 2020, value: 103 }, { year: 2021, value: 81  },
      { year: 2022, value: 85  }, { year: 2023, value: 155 }, { year: 2024, value: 91  },
      { year: 2025, value: 66  }, { year: 2026, value: 61  }, { year: 2027, value: 58  },
      { year: 2028, value: 56  }, { year: 2029, value: 54  },
    ],
  },
  {
    iso3: 'GRC', name: 'Greece', points: [
      { year: 2019, value: 180 }, { year: 2020, value: 207 }, { year: 2021, value: 197 },
      { year: 2022, value: 172 }, { year: 2023, value: 161 }, { year: 2024, value: 154 },
      { year: 2025, value: 148 }, { year: 2026, value: 142 }, { year: 2027, value: 137 },
      { year: 2028, value: 132 }, { year: 2029, value: 128 },
    ],
  },
];

// ────────────────────────────────────────────────────────────────────────
// S&P / Moody's / Fitch long-term foreign-currency sovereign ratings
// (as of mid-2025). Nation-agnostic mapping to a 0-100 "grade" for
// visual ranking. Where the three agencies diverge we show all three
// and let the reader compare.
// ────────────────────────────────────────────────────────────────────────
export interface SovereignRating {
  iso3: string;
  name: string;
  sp: string;       // S&P
  moodys: string;   // Moody's
  fitch: string;    // Fitch
  outlookSp: 'positive' | 'stable' | 'negative' | 'developing';
  score: number;    // 100 = AAA, ~30 = C, based on midpoint of the three
}

export const SOVEREIGN_RATINGS_2025: SovereignRating[] = [
  { iso3: 'DEU', name: 'Germany',        sp: 'AAA',  moodys: 'Aaa',  fitch: 'AAA',  outlookSp: 'stable',    score: 100 },
  { iso3: 'AUS', name: 'Australia',      sp: 'AAA',  moodys: 'Aaa',  fitch: 'AAA',  outlookSp: 'stable',    score: 100 },
  { iso3: 'NLD', name: 'Netherlands',    sp: 'AAA',  moodys: 'Aaa',  fitch: 'AAA',  outlookSp: 'stable',    score: 100 },
  { iso3: 'CHE', name: 'Switzerland',    sp: 'AAA',  moodys: 'Aaa',  fitch: 'AAA',  outlookSp: 'stable',    score: 100 },
  { iso3: 'CAN', name: 'Canada',         sp: 'AAA',  moodys: 'Aaa',  fitch: 'AA+',  outlookSp: 'stable',    score: 97  },
  { iso3: 'USA', name: 'United States',  sp: 'AA+',  moodys: 'Aaa',  fitch: 'AA+',  outlookSp: 'stable',    score: 92  },
  { iso3: 'KOR', name: 'South Korea',    sp: 'AA',   moodys: 'Aa2',  fitch: 'AA-',  outlookSp: 'stable',    score: 88  },
  { iso3: 'GBR', name: 'United Kingdom', sp: 'AA',   moodys: 'Aa3',  fitch: 'AA-',  outlookSp: 'stable',    score: 85  },
  { iso3: 'FRA', name: 'France',         sp: 'AA-',  moodys: 'Aa3',  fitch: 'AA-',  outlookSp: 'negative',  score: 82  },
  { iso3: 'JPN', name: 'Japan',          sp: 'A+',   moodys: 'A1',   fitch: 'A',    outlookSp: 'stable',    score: 76  },
  { iso3: 'CHN', name: 'China',          sp: 'A+',   moodys: 'A1',   fitch: 'A',    outlookSp: 'negative',  score: 74  },
  { iso3: 'ESP', name: 'Spain',          sp: 'A',    moodys: 'Baa1', fitch: 'A-',   outlookSp: 'positive',  score: 70  },
  { iso3: 'ITA', name: 'Italy',          sp: 'BBB',  moodys: 'Baa3', fitch: 'BBB',  outlookSp: 'stable',    score: 55  },
  { iso3: 'MEX', name: 'Mexico',         sp: 'BBB',  moodys: 'Baa2', fitch: 'BBB-', outlookSp: 'stable',    score: 55  },
  { iso3: 'IND', name: 'India',          sp: 'BBB-', moodys: 'Baa3', fitch: 'BBB-', outlookSp: 'positive',  score: 50  },
  { iso3: 'GRC', name: 'Greece',         sp: 'BBB',  moodys: 'Baa3', fitch: 'BBB',  outlookSp: 'stable',    score: 55  },
  { iso3: 'BRA', name: 'Brazil',         sp: 'BB',   moodys: 'Ba1',  fitch: 'BB',   outlookSp: 'stable',    score: 40  },
  { iso3: 'ZAF', name: 'South Africa',   sp: 'BB-',  moodys: 'Ba2',  fitch: 'BB-',  outlookSp: 'stable',    score: 36  },
  { iso3: 'TUR', name: 'Turkey',         sp: 'BB-',  moodys: 'B1',   fitch: 'BB-',  outlookSp: 'stable',    score: 33  },
  { iso3: 'NGA', name: 'Nigeria',        sp: 'B-',   moodys: 'Caa1', fitch: 'B-',   outlookSp: 'stable',    score: 22  },
  { iso3: 'ARG', name: 'Argentina',      sp: 'CCC',  moodys: 'Ca',   fitch: 'CCC',  outlookSp: 'developing',score: 12  },
  { iso3: 'RUS', name: 'Russia',         sp: 'SD',   moodys: 'WR',   fitch: 'WD',   outlookSp: 'negative',  score: 5   },
];

// Sovereign 5-year CDS spreads (bps) as of Sep-2025 close. Source:
// aggregation of Bloomberg, Refinitiv, DBRS market prints. Lower
// spread = market perceives lower default risk. Above ~500 bps is
// generally considered distress.
export interface SovereignCds {
  iso3: string;
  name: string;
  spreadBps: number;
  changeYtdBps: number;
}

export const SOVEREIGN_CDS_SEP_2025: SovereignCds[] = [
  { iso3: 'DEU', name: 'Germany',        spreadBps: 12,   changeYtdBps: -4  },
  { iso3: 'USA', name: 'United States',  spreadBps: 42,   changeYtdBps: +8  },
  { iso3: 'GBR', name: 'United Kingdom', spreadBps: 28,   changeYtdBps: -3  },
  { iso3: 'FRA', name: 'France',         spreadBps: 45,   changeYtdBps: +18 },
  { iso3: 'JPN', name: 'Japan',          spreadBps: 26,   changeYtdBps: +6  },
  { iso3: 'ITA', name: 'Italy',          spreadBps: 78,   changeYtdBps: -22 },
  { iso3: 'ESP', name: 'Spain',          spreadBps: 55,   changeYtdBps: -8  },
  { iso3: 'CHN', name: 'China',          spreadBps: 68,   changeYtdBps: +12 },
  { iso3: 'IND', name: 'India',          spreadBps: 95,   changeYtdBps: -5  },
  { iso3: 'BRA', name: 'Brazil',         spreadBps: 168,  changeYtdBps: +25 },
  { iso3: 'MEX', name: 'Mexico',         spreadBps: 145,  changeYtdBps: +12 },
  { iso3: 'ZAF', name: 'South Africa',   spreadBps: 218,  changeYtdBps: -12 },
  { iso3: 'TUR', name: 'Turkey',         spreadBps: 295,  changeYtdBps: -85 },
  { iso3: 'GRC', name: 'Greece',         spreadBps: 92,   changeYtdBps: -12 },
  { iso3: 'ARG', name: 'Argentina',      spreadBps: 985,  changeYtdBps: -420 },
  { iso3: 'NGA', name: 'Nigeria',        spreadBps: 545,  changeYtdBps: -180 },
  { iso3: 'RUS', name: 'Russia',         spreadBps: 0,    changeYtdBps: 0    }, // CDS market closed post-sanctions
];

// ────────────────────────────────────────────────────────────────────────
// Sovereign default / restructuring events since 2000. Sourced from
// Bank of Canada Sovereign Default Database + Reinhart-Rogoff timeline.
// ────────────────────────────────────────────────────────────────────────
export interface SovereignDefault {
  year: number;
  country: string;
  iso3: string;
  amountUsdBn: number | null;   // face value of restructured debt (approx)
  type: 'external' | 'domestic' | 'both';
  notes: string;
}

export const SOVEREIGN_DEFAULTS_2000_2024: SovereignDefault[] = [
  { year: 2001, country: 'Argentina',   iso3: 'ARG', amountUsdBn: 82,   type: 'external', notes: 'Largest sovereign default in history at the time' },
  { year: 2003, country: 'Uruguay',     iso3: 'URY', amountUsdBn: 5.4,  type: 'external', notes: 'Extension exchange after Argentine contagion' },
  { year: 2005, country: 'Dominican Rep', iso3: 'DOM', amountUsdBn: 1.1, type: 'external', notes: 'Reprofiling under IMF programme' },
  { year: 2008, country: 'Ecuador',     iso3: 'ECU', amountUsdBn: 3.2,  type: 'external', notes: 'Government declared debt "illegitimate"' },
  { year: 2010, country: 'Jamaica',     iso3: 'JAM', amountUsdBn: 7.9,  type: 'domestic', notes: 'JDX domestic debt exchange' },
  { year: 2012, country: 'Greece',      iso3: 'GRC', amountUsdBn: 261,  type: 'both',     notes: 'Largest restructuring in history — PSI cut 53.5% NPV' },
  { year: 2013, country: 'Cyprus',      iso3: 'CYP', amountUsdBn: 1.0,  type: 'external', notes: 'Selective default flagged by S&P' },
  { year: 2014, country: 'Argentina',   iso3: 'ARG', amountUsdBn: 29,   type: 'external', notes: 'Holdout dispute triggered technical default' },
  { year: 2015, country: 'Ukraine',     iso3: 'UKR', amountUsdBn: 18,   type: 'external', notes: 'Post-Crimea distress exchange' },
  { year: 2016, country: 'Mozambique',  iso3: 'MOZ', amountUsdBn: 0.7,  type: 'external', notes: 'Undisclosed "tuna bond" scandal' },
  { year: 2017, country: 'Venezuela',   iso3: 'VEN', amountUsdBn: 60,   type: 'external', notes: 'Multi-year default; sanctions complications' },
  { year: 2020, country: 'Argentina',   iso3: 'ARG', amountUsdBn: 65,   type: 'external', notes: 'Ninth sovereign default' },
  { year: 2020, country: 'Ecuador',     iso3: 'ECU', amountUsdBn: 17.4, type: 'external', notes: 'Covid-era restructuring' },
  { year: 2020, country: 'Lebanon',     iso3: 'LBN', amountUsdBn: 31,   type: 'external', notes: 'First-ever Eurobond default' },
  { year: 2020, country: 'Suriname',    iso3: 'SUR', amountUsdBn: 0.7,  type: 'external', notes: 'Extended default; restructured 2023' },
  { year: 2020, country: 'Zambia',      iso3: 'ZMB', amountUsdBn: 3.0,  type: 'external', notes: 'First African Eurobond default of pandemic era' },
  { year: 2022, country: 'Sri Lanka',   iso3: 'LKA', amountUsdBn: 51,   type: 'external', notes: 'Twin crisis; IMF programme in 2023' },
  { year: 2022, country: 'Belarus',     iso3: 'BLR', amountUsdBn: 3.0,  type: 'external', notes: 'Sanctions-related payment blockage' },
  { year: 2022, country: 'Ghana',       iso3: 'GHA', amountUsdBn: 30,   type: 'both',     notes: 'Domestic + external restructuring' },
  { year: 2022, country: 'Russia',      iso3: 'RUS', amountUsdBn: 40,   type: 'external', notes: 'Sanctions-driven; markets froze' },
  { year: 2024, country: 'Ethiopia',    iso3: 'ETH', amountUsdBn: 1.0,  type: 'external', notes: 'Common Framework restructuring' },
];

// ────────────────────────────────────────────────────────────────────────
// Central bank balance sheet snapshots (USD trillions). We don't try to
// serve the full daily curve here — the shape is well-known and the
// story is the peaks. Points are quarter-end unless noted.
// ────────────────────────────────────────────────────────────────────────
export interface CbBalanceSheetPoint {
  date: string;      // YYYY-MM-DD
  fedUsdTn: number | null;
  ecbUsdTn: number | null;
  bojUsdTn: number | null;
  pbocUsdTn: number | null;
}

export const CB_BALANCE_SHEETS_2007_2025: CbBalanceSheetPoint[] = [
  { date: '2007-12-31', fedUsdTn: 0.90,  ecbUsdTn: 2.10,  bojUsdTn: 0.95,  pbocUsdTn: 2.30 },
  { date: '2008-12-31', fedUsdTn: 2.24,  ecbUsdTn: 2.90,  bojUsdTn: 1.20,  pbocUsdTn: 3.10 },
  { date: '2010-12-31', fedUsdTn: 2.42,  ecbUsdTn: 2.70,  bojUsdTn: 1.36,  pbocUsdTn: 4.20 },
  { date: '2012-12-31', fedUsdTn: 2.92,  ecbUsdTn: 4.00,  bojUsdTn: 1.85,  pbocUsdTn: 4.80 },
  { date: '2014-12-31', fedUsdTn: 4.50,  ecbUsdTn: 2.20,  bojUsdTn: 2.72,  pbocUsdTn: 5.20 },
  { date: '2016-12-31', fedUsdTn: 4.45,  ecbUsdTn: 3.66,  bojUsdTn: 4.42,  pbocUsdTn: 5.10 },
  { date: '2018-12-31', fedUsdTn: 4.07,  ecbUsdTn: 5.28,  bojUsdTn: 5.09,  pbocUsdTn: 5.30 },
  { date: '2019-12-31', fedUsdTn: 4.17,  ecbUsdTn: 5.24,  bojUsdTn: 5.31,  pbocUsdTn: 5.20 },
  { date: '2020-12-31', fedUsdTn: 7.36,  ecbUsdTn: 8.55,  bojUsdTn: 6.77,  pbocUsdTn: 5.85 },
  { date: '2021-12-31', fedUsdTn: 8.76,  ecbUsdTn: 9.70,  bojUsdTn: 6.32,  pbocUsdTn: 6.14 },
  { date: '2022-06-30', fedUsdTn: 8.89,  ecbUsdTn: 9.60,  bojUsdTn: 5.55,  pbocUsdTn: 6.20 },
  { date: '2022-12-31', fedUsdTn: 8.55,  ecbUsdTn: 8.20,  bojUsdTn: 5.06,  pbocUsdTn: 6.10 },
  { date: '2023-12-31', fedUsdTn: 7.72,  ecbUsdTn: 7.02,  bojUsdTn: 5.20,  pbocUsdTn: 6.20 },
  { date: '2024-12-31', fedUsdTn: 6.85,  ecbUsdTn: 6.55,  bojUsdTn: 5.05,  pbocUsdTn: 6.30 },
  { date: '2025-06-30', fedUsdTn: 6.65,  ecbUsdTn: 6.42,  bojUsdTn: 5.02,  pbocUsdTn: 6.55 },
];

// ────────────────────────────────────────────────────────────────────────
// Household debt as % of GDP, latest year available. BIS "Total credit
// to households and NPISHs" Q4-2024 (except China: PBOC/CEIC estimate).
// ────────────────────────────────────────────────────────────────────────
export interface HouseholdDebtPoint {
  iso3: string;
  name: string;
  pctGdp: number;
  changeVs2010: number;   // percentage points
}

export const HOUSEHOLD_DEBT_2024: HouseholdDebtPoint[] = [
  { iso3: 'CHE', name: 'Switzerland',    pctGdp: 128, changeVs2010: +11 },
  { iso3: 'AUS', name: 'Australia',      pctGdp: 111, changeVs2010: +14 },
  { iso3: 'KOR', name: 'South Korea',    pctGdp: 100, changeVs2010: +25 },
  { iso3: 'CAN', name: 'Canada',         pctGdp: 101, changeVs2010: +9  },
  { iso3: 'NLD', name: 'Netherlands',    pctGdp: 91,  changeVs2010: -21 },
  { iso3: 'NOR', name: 'Norway',         pctGdp: 87,  changeVs2010: +5  },
  { iso3: 'GBR', name: 'United Kingdom', pctGdp: 78,  changeVs2010: -17 },
  { iso3: 'USA', name: 'United States',  pctGdp: 72,  changeVs2010: -20 },
  { iso3: 'JPN', name: 'Japan',          pctGdp: 66,  changeVs2010: +5  },
  { iso3: 'FRA', name: 'France',         pctGdp: 65,  changeVs2010: +8  },
  { iso3: 'DEU', name: 'Germany',        pctGdp: 53,  changeVs2010: -6  },
  { iso3: 'CHN', name: 'China',          pctGdp: 63,  changeVs2010: +35 },
  { iso3: 'ESP', name: 'Spain',          pctGdp: 46,  changeVs2010: -37 },
  { iso3: 'BRA', name: 'Brazil',         pctGdp: 33,  changeVs2010: +12 },
  { iso3: 'ITA', name: 'Italy',          pctGdp: 40,  changeVs2010: -3  },
  { iso3: 'IND', name: 'India',          pctGdp: 40,  changeVs2010: +17 },
  { iso3: 'MEX', name: 'Mexico',         pctGdp: 17,  changeVs2010: +3  },
  { iso3: 'ARG', name: 'Argentina',      pctGdp: 5,   changeVs2010: -2  },
];
