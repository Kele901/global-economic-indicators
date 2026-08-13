// Curated static data for the Energy Ledger. Powers /energy-ledger.
// Sources: IEA Electricity 2025, IEA World Energy Outlook 2024, BNEF
// storage tracker, IGU LNG report, IAEA PRIS, EIA International Energy
// Statistics. Rationale: these datasets are either report-based
// (IEA/BNEF/IGU) or annual snapshots (IAEA/EIA); joining them into a
// scrollytelling ledger benefits from a single frozen snapshot rather
// than N flaky live fetches.

export const CURATED_LAST_UPDATED = '2025-10-01';

export interface EnergyCountryMeta {
  code: string;
  name: string;
  bloc: 'US-led' | 'EU' | 'China' | 'India' | 'Middle East' | 'Other';
}

export const ENERGY_COUNTRY_META: EnergyCountryMeta[] = [
  { code: 'USA', name: 'United States', bloc: 'US-led'      },
  { code: 'CAN', name: 'Canada',        bloc: 'US-led'      },
  { code: 'GBR', name: 'United Kingdom',bloc: 'EU'          },
  { code: 'DEU', name: 'Germany',       bloc: 'EU'          },
  { code: 'FRA', name: 'France',        bloc: 'EU'          },
  { code: 'ESP', name: 'Spain',         bloc: 'EU'          },
  { code: 'ITA', name: 'Italy',         bloc: 'EU'          },
  { code: 'NOR', name: 'Norway',        bloc: 'EU'          },
  { code: 'CHN', name: 'China',         bloc: 'China'       },
  { code: 'JPN', name: 'Japan',         bloc: 'US-led'      },
  { code: 'KOR', name: 'South Korea',   bloc: 'US-led'      },
  { code: 'IND', name: 'India',         bloc: 'India'       },
  { code: 'IDN', name: 'Indonesia',     bloc: 'Other'       },
  { code: 'AUS', name: 'Australia',     bloc: 'US-led'      },
  { code: 'RUS', name: 'Russia',        bloc: 'Other'       },
  { code: 'SAU', name: 'Saudi Arabia',  bloc: 'Middle East' },
  { code: 'ARE', name: 'UAE',           bloc: 'Middle East' },
  { code: 'QAT', name: 'Qatar',         bloc: 'Middle East' },
  { code: 'BRA', name: 'Brazil',        bloc: 'Other'       },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 2 — Electricity generation mix (IEA 2023). % of total gen.
// ─────────────────────────────────────────────────────────────────────
export interface ElectricityMix {
  code: string;
  coal: number;
  gas: number;
  oil: number;
  nuclear: number;
  hydro: number;
  windSolar: number;
  otherRenew: number;
}

export const ELECTRICITY_MIX_2023: ElectricityMix[] = [
  { code: 'USA', coal: 16.2, gas: 43.1, oil: 0.5, nuclear: 18.6, hydro:  5.8, windSolar: 14.1, otherRenew: 1.7 },
  { code: 'CHN', coal: 60.5, gas:  3.2, oil: 0.1, nuclear:  4.6, hydro: 12.9, windSolar: 15.6, otherRenew: 3.1 },
  { code: 'IND', coal: 74.0, gas:  2.8, oil: 0.2, nuclear:  2.6, hydro:  8.3, windSolar: 11.1, otherRenew: 1.0 },
  { code: 'JPN', coal: 30.8, gas: 33.2, oil: 6.1, nuclear:  6.1, hydro:  7.6, windSolar: 12.6, otherRenew: 3.6 },
  { code: 'KOR', coal: 32.5, gas: 26.8, oil: 0.6, nuclear: 30.4, hydro:  0.9, windSolar:  6.8, otherRenew: 2.0 },
  { code: 'DEU', coal: 26.8, gas: 12.8, oil: 0.9, nuclear:  1.5, hydro:  3.4, windSolar: 47.3, otherRenew: 7.3 },
  { code: 'GBR', coal:  1.2, gas: 33.6, oil: 0.6, nuclear: 13.9, hydro:  1.8, windSolar: 40.1, otherRenew: 8.8 },
  { code: 'FRA', coal:  0.8, gas:  8.1, oil: 0.6, nuclear: 65.0, hydro: 10.8, windSolar: 13.3, otherRenew: 1.4 },
  { code: 'ESP', coal:  2.4, gas: 22.3, oil: 2.5, nuclear: 20.1, hydro:  5.6, windSolar: 40.6, otherRenew: 6.5 },
  { code: 'ITA', coal:  4.1, gas: 45.0, oil: 3.4, nuclear:  0.0, hydro: 12.8, windSolar: 26.5, otherRenew: 8.2 },
  { code: 'AUS', coal: 45.9, gas: 17.5, oil: 1.9, nuclear:  0.0, hydro:  5.2, windSolar: 27.5, otherRenew: 2.0 },
  { code: 'RUS', coal: 15.5, gas: 46.3, oil: 1.0, nuclear: 19.4, hydro: 17.0, windSolar:  0.6, otherRenew: 0.2 },
  { code: 'BRA', coal:  2.9, gas:  6.0, oil: 3.4, nuclear:  2.2, hydro: 61.8, windSolar: 19.7, otherRenew: 4.0 },
  { code: 'CAN', coal:  3.0, gas: 10.4, oil: 0.9, nuclear: 14.9, hydro: 61.5, windSolar:  7.8, otherRenew: 1.5 },
  { code: 'IDN', coal: 61.8, gas: 17.3, oil: 4.2, nuclear:  0.0, hydro:  7.2, windSolar:  0.4, otherRenew: 9.1 },
  { code: 'NOR', coal:  0.0, gas:  1.7, oil: 0.0, nuclear:  0.0, hydro: 88.2, windSolar:  9.4, otherRenew: 0.7 },
  { code: 'SAU', coal:  0.0, gas: 61.3, oil: 38.4, nuclear: 0.0, hydro:  0.0, windSolar:  0.3, otherRenew: 0.0 },
  { code: 'ARE', coal:  0.0, gas: 74.5, oil:  3.4, nuclear:19.3, hydro:  0.0, windSolar:  2.8, otherRenew: 0.0 },
  { code: 'QAT', coal:  0.0, gas: 99.6, oil:  0.4, nuclear: 0.0, hydro:  0.0, windSolar:  0.0, otherRenew: 0.0 },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 3 — Battery storage build-out (BNEF Global Storage Outlook).
// Cumulative operational GWh.
// ─────────────────────────────────────────────────────────────────────
export interface StoragePoint {
  year: number;
  world: number;
  china: number;
  usa: number;
  europe: number;
  restOfWorld: number;
}

export const STORAGE_BUILDOUT_2015_2030: StoragePoint[] = [
  { year: 2015, world:    1, china:   0, usa:   0, europe:   0, restOfWorld: 1 },
  { year: 2018, world:    9, china:   1, usa:   4, europe:   2, restOfWorld: 2 },
  { year: 2020, world:   17, china:   3, usa:   8, europe:   4, restOfWorld: 2 },
  { year: 2022, world:   45, china:  12, usa:  20, europe:   9, restOfWorld: 4 },
  { year: 2023, world:  115, china:  50, usa:  40, europe:  17, restOfWorld: 8 },
  { year: 2024, world:  220, china: 105, usa:  70, europe:  30, restOfWorld: 15 },
  { year: 2025, world:  360, china: 175, usa: 105, europe:  50, restOfWorld: 30 },
  { year: 2030, world: 1550, china: 700, usa: 400, europe: 250, restOfWorld: 200 },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 4 — LNG flows (IGU World LNG Report 2024). Mtpa in 2023.
// ─────────────────────────────────────────────────────────────────────
export interface LngFlowRow {
  exporter: string;
  importer: string;
  mtpa: number;
}

export const LNG_FLOWS_2023: LngFlowRow[] = [
  { exporter: 'USA', importer: 'EU',    mtpa: 55 },
  { exporter: 'USA', importer: 'CHN',   mtpa:  5 },
  { exporter: 'USA', importer: 'KOR',   mtpa: 10 },
  { exporter: 'USA', importer: 'JPN',   mtpa: 10 },
  { exporter: 'QAT', importer: 'EU',    mtpa: 18 },
  { exporter: 'QAT', importer: 'CHN',   mtpa: 22 },
  { exporter: 'QAT', importer: 'JPN',   mtpa:  7 },
  { exporter: 'QAT', importer: 'KOR',   mtpa: 12 },
  { exporter: 'QAT', importer: 'IND',   mtpa: 12 },
  { exporter: 'AUS', importer: 'CHN',   mtpa: 25 },
  { exporter: 'AUS', importer: 'JPN',   mtpa: 27 },
  { exporter: 'AUS', importer: 'KOR',   mtpa:  8 },
  { exporter: 'AUS', importer: 'TWN',   mtpa:  6 },
  { exporter: 'RUS', importer: 'EU',    mtpa: 15 },
  { exporter: 'RUS', importer: 'CHN',   mtpa:  9 },
  { exporter: 'RUS', importer: 'JPN',   mtpa:  5 },
  { exporter: 'MYS', importer: 'JPN',   mtpa:  8 },
  { exporter: 'MYS', importer: 'CHN',   mtpa:  5 },
  { exporter: 'NGA', importer: 'EU',    mtpa: 10 },
  { exporter: 'DZA', importer: 'EU',    mtpa: 11 },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 5 — Nuclear reactor status (IAEA PRIS Sep 2025).
// ─────────────────────────────────────────────────────────────────────
export interface NuclearStatusRow {
  code: string;
  operable: number;
  underConstruction: number;
  planned: number;
  policy: 'expanding' | 'restarting' | 'stable' | 'phasing-out';
}

export const NUCLEAR_STATUS_2025: NuclearStatusRow[] = [
  { code: 'USA', operable: 94, underConstruction:  1, planned:  3, policy: 'restarting' },
  { code: 'FRA', operable: 56, underConstruction:  1, planned:  6, policy: 'expanding'  },
  { code: 'CHN', operable: 56, underConstruction: 30, planned: 40, policy: 'expanding'  },
  { code: 'JPN', operable: 33, underConstruction:  2, planned:  1, policy: 'restarting' },
  { code: 'RUS', operable: 36, underConstruction:  4, planned: 10, policy: 'expanding'  },
  { code: 'KOR', operable: 26, underConstruction:  2, planned:  3, policy: 'expanding'  },
  { code: 'IND', operable: 22, underConstruction:  8, planned: 10, policy: 'expanding'  },
  { code: 'CAN', operable: 19, underConstruction:  0, planned:  4, policy: 'restarting' },
  { code: 'UKR', operable: 15, underConstruction:  2, planned:  4, policy: 'expanding'  },
  { code: 'GBR', operable:  9, underConstruction:  2, planned:  6, policy: 'expanding'  },
  { code: 'ESP', operable:  7, underConstruction:  0, planned:  0, policy: 'phasing-out' },
  { code: 'DEU', operable:  0, underConstruction:  0, planned:  0, policy: 'phasing-out' },
  { code: 'ARE', operable:  4, underConstruction:  0, planned:  4, policy: 'expanding'  },
  { code: 'BRA', operable:  2, underConstruction:  1, planned:  0, policy: 'stable'     },
  { code: 'ITA', operable:  0, underConstruction:  0, planned:  0, policy: 'restarting' },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 6 — Capacity factors by source (IEA 2023). % annual output
// vs nameplate capacity. Nuclear ~90%, gas mid, solar low, wind variable.
// ─────────────────────────────────────────────────────────────────────
export interface CapacityFactorRow {
  source: string;
  capacityFactor: number;
  co2gCO2eqKwh: number;
}

export const CAPACITY_FACTORS_2023: CapacityFactorRow[] = [
  { source: 'Nuclear',        capacityFactor: 89, co2gCO2eqKwh:  12 },
  { source: 'Geothermal',     capacityFactor: 74, co2gCO2eqKwh:  38 },
  { source: 'Coal',           capacityFactor: 60, co2gCO2eqKwh: 820 },
  { source: 'Combined-cycle gas', capacityFactor: 58, co2gCO2eqKwh: 490 },
  { source: 'Biomass',        capacityFactor: 55, co2gCO2eqKwh: 230 },
  { source: 'Hydro',          capacityFactor: 41, co2gCO2eqKwh:  24 },
  { source: 'Onshore wind',   capacityFactor: 36, co2gCO2eqKwh:  11 },
  { source: 'Offshore wind',  capacityFactor: 44, co2gCO2eqKwh:  12 },
  { source: 'Utility solar',  capacityFactor: 24, co2gCO2eqKwh:  45 },
  { source: 'Rooftop solar',  capacityFactor: 15, co2gCO2eqKwh:  41 },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 7 — Proven crude oil reserves + gas reserves (EIA + BP
// Statistical Review 2024 fallback). Billions of barrels of oil-eq.
// ─────────────────────────────────────────────────────────────────────
export interface ReservesRow {
  code: string;
  oilReservesBnBarrels: number;
  gasReservesTcf: number;
  coalReservesBnTonnes: number;
}

export const RESERVES_2024: ReservesRow[] = [
  { code: 'VEN', oilReservesBnBarrels: 303,  gasReservesTcf: 197,  coalReservesBnTonnes:  0.5 },
  { code: 'SAU', oilReservesBnBarrels: 267,  gasReservesTcf: 336,  coalReservesBnTonnes:  0   },
  { code: 'IRN', oilReservesBnBarrels: 209,  gasReservesTcf:1201,  coalReservesBnTonnes:  1.2 },
  { code: 'CAN', oilReservesBnBarrels: 170,  gasReservesTcf:  71,  coalReservesBnTonnes:  6.6 },
  { code: 'IRQ', oilReservesBnBarrels: 145,  gasReservesTcf: 132,  coalReservesBnTonnes:  0   },
  { code: 'RUS', oilReservesBnBarrels: 108,  gasReservesTcf:1688,  coalReservesBnTonnes:157.0 },
  { code: 'ARE', oilReservesBnBarrels:  98,  gasReservesTcf: 215,  coalReservesBnTonnes:  0   },
  { code: 'USA', oilReservesBnBarrels:  47,  gasReservesTcf: 691,  coalReservesBnTonnes:249.5 },
  { code: 'LBY', oilReservesBnBarrels:  48,  gasReservesTcf:  53,  coalReservesBnTonnes:  0   },
  { code: 'NGA', oilReservesBnBarrels:  37,  gasReservesTcf: 202,  coalReservesBnTonnes:  0.2 },
  { code: 'BRA', oilReservesBnBarrels:  13,  gasReservesTcf:  15,  coalReservesBnTonnes:  6.6 },
  { code: 'CHN', oilReservesBnBarrels:  26,  gasReservesTcf: 297,  coalReservesBnTonnes:143.2 },
  { code: 'QAT', oilReservesBnBarrels:  25,  gasReservesTcf: 843,  coalReservesBnTonnes:  0   },
  { code: 'AUS', oilReservesBnBarrels:   4,  gasReservesTcf: 122,  coalReservesBnTonnes:150.2 },
  { code: 'IND', oilReservesBnBarrels:   4,  gasReservesTcf:  47,  coalReservesBnTonnes:111.1 },
];

// ─────────────────────────────────────────────────────────────────────
// Chapter 8 — Energy intensity: primary energy per unit of GDP (IEA).
// Lower = more efficient. kgOE per $1000 GDP-PPP.
// ─────────────────────────────────────────────────────────────────────
export interface EnergyIntensityRow {
  code: string;
  kgoePer1000UsdPpp: number;
  yoyChangePct: number;
}

export const ENERGY_INTENSITY_2023: EnergyIntensityRow[] = [
  { code: 'CHE', kgoePer1000UsdPpp:  60, yoyChangePct: -2.1 },
  { code: 'GBR', kgoePer1000UsdPpp:  68, yoyChangePct: -3.0 },
  { code: 'IRL', kgoePer1000UsdPpp:  60, yoyChangePct: -1.4 },
  { code: 'DNK', kgoePer1000UsdPpp:  70, yoyChangePct: -2.9 },
  { code: 'DEU', kgoePer1000UsdPpp:  85, yoyChangePct: -4.2 },
  { code: 'ITA', kgoePer1000UsdPpp:  76, yoyChangePct: -2.1 },
  { code: 'ESP', kgoePer1000UsdPpp:  80, yoyChangePct: -3.5 },
  { code: 'FRA', kgoePer1000UsdPpp:  92, yoyChangePct: -1.8 },
  { code: 'JPN', kgoePer1000UsdPpp:  87, yoyChangePct: -1.5 },
  { code: 'USA', kgoePer1000UsdPpp: 110, yoyChangePct: -1.2 },
  { code: 'KOR', kgoePer1000UsdPpp: 140, yoyChangePct: -0.9 },
  { code: 'CHN', kgoePer1000UsdPpp: 155, yoyChangePct: -2.4 },
  { code: 'IND', kgoePer1000UsdPpp: 118, yoyChangePct: -1.6 },
  { code: 'CAN', kgoePer1000UsdPpp: 175, yoyChangePct: -1.1 },
  { code: 'AUS', kgoePer1000UsdPpp: 108, yoyChangePct: -1.4 },
  { code: 'SAU', kgoePer1000UsdPpp: 225, yoyChangePct:  0.4 },
  { code: 'RUS', kgoePer1000UsdPpp: 190, yoyChangePct: -0.6 },
  { code: 'BRA', kgoePer1000UsdPpp:  92, yoyChangePct: -0.8 },
  { code: 'ARE', kgoePer1000UsdPpp: 160, yoyChangePct: -1.2 },
  { code: 'ZAF', kgoePer1000UsdPpp: 185, yoyChangePct: -1.3 },
];
