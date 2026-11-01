import type { CountryKey } from '../utils/countryMappings';

// Curated central-bank inflation objectives, as published by each bank.
// `target` is the point target or the midpoint of a target range; `band` is the
// half-width of the tolerance band or range around it (0 for a pure point
// target). Countries without a numeric objective (dollar pegs, monetary
// aggregate regimes) carry `target: null` so charts can say so rather than
// invent one.

export type TargetRegime = 'inflation-targeting' | 'price-stability' | 'informal' | 'none';

export interface InflationTarget {
  bank: string;
  target: number | null;
  band: number;
  regime: TargetRegime;
  /** Year the current numeric objective (or the targeting regime) began. */
  since: number | null;
  note?: string;
}

const ECB: InflationTarget = {
  bank: 'European Central Bank',
  target: 2,
  band: 0,
  regime: 'inflation-targeting',
  since: 1999,
  note: 'Symmetric 2% medium-term target since the 2021 strategy review; "below but close to 2%" before that.',
};

export const INFLATION_TARGETS: Record<CountryKey, InflationTarget> = {
  USA: { bank: 'Federal Reserve', target: 2, band: 0, regime: 'inflation-targeting', since: 2012, note: '2% on the PCE price index; formally announced January 2012.' },
  Canada: { bank: 'Bank of Canada', target: 2, band: 1, regime: 'inflation-targeting', since: 1991, note: 'Midpoint of a 1-3% control range.' },
  Mexico: { bank: 'Banco de México', target: 3, band: 1, regime: 'inflation-targeting', since: 2003 },
  Brazil: { bank: 'Banco Central do Brasil', target: 3, band: 1.5, regime: 'inflation-targeting', since: 1999, note: 'Continuous 3% target from 2025; earlier calendar-year targets were higher.' },
  Chile: { bank: 'Banco Central de Chile', target: 3, band: 1, regime: 'inflation-targeting', since: 1999 },
  Argentina: { bank: 'Banco Central de la República Argentina', target: null, band: 0, regime: 'none', since: null, note: 'Inflation targeting was abandoned in 2018; policy now runs through monetary aggregates and the exchange rate.' },
  Colombia: { bank: 'Banco de la República', target: 3, band: 1, regime: 'inflation-targeting', since: 1999 },
  UK: { bank: 'Bank of England', target: 2, band: 0, regime: 'inflation-targeting', since: 2003, note: '2% CPI since 2003 (RPIX target before); a letter is required if CPI misses by more than 1pp.' },
  France: ECB,
  Germany: ECB,
  Italy: ECB,
  Spain: ECB,
  Netherlands: ECB,
  Portugal: ECB,
  Belgium: ECB,
  Greece: ECB,
  Sweden: { bank: 'Sveriges Riksbank', target: 2, band: 0, regime: 'inflation-targeting', since: 1993, note: 'Measured on CPIF since 2017.' },
  Switzerland: { bank: 'Swiss National Bank', target: 1, band: 1, regime: 'price-stability', since: 2000, note: 'Price stability defined as CPI inflation between 0% and 2%.' },
  Norway: { bank: 'Norges Bank', target: 2, band: 0, regime: 'inflation-targeting', since: 2001, note: 'Lowered from 2.5% to 2% in 2018.' },
  Poland: { bank: 'Narodowy Bank Polski', target: 2.5, band: 1, regime: 'inflation-targeting', since: 2004 },
  Russia: { bank: 'Bank of Russia', target: 4, band: 0, regime: 'inflation-targeting', since: 2015 },
  Ukraine: { bank: 'National Bank of Ukraine', target: 5, band: 1, regime: 'inflation-targeting', since: 2017 },
  Turkey: { bank: 'Central Bank of the Republic of Türkiye', target: 5, band: 2, regime: 'inflation-targeting', since: 2006, note: 'Official medium-term target; actual inflation has been far above it since 2018.' },
  SaudiArabia: { bank: 'Saudi Central Bank', target: null, band: 0, regime: 'none', since: null, note: 'Riyal pegged to the US dollar; no inflation target.' },
  Egypt: { bank: 'Central Bank of Egypt', target: 7, band: 2, regime: 'inflation-targeting', since: 2017, note: 'Glide path toward 7% ± 2pp by late 2026 and 5% ± 2pp by 2028.' },
  Israel: { bank: 'Bank of Israel', target: 2, band: 1, regime: 'inflation-targeting', since: 2003, note: '1-3% target range.' },
  Iran: { bank: 'Central Bank of Iran', target: null, band: 0, regime: 'none', since: null, note: 'No published numeric target.' },
  UAE: { bank: 'Central Bank of the UAE', target: null, band: 0, regime: 'none', since: null, note: 'Dirham pegged to the US dollar.' },
  Qatar: { bank: 'Qatar Central Bank', target: null, band: 0, regime: 'none', since: null, note: 'Riyal pegged to the US dollar.' },
  Morocco: { bank: 'Bank Al-Maghrib', target: 2, band: 0, regime: 'informal', since: null, note: 'Price-stability mandate with an implicit 2% anchor; transition to formal targeting under way.' },
  Nigeria: { bank: 'Central Bank of Nigeria', target: 7.5, band: 1.5, regime: 'informal', since: null, note: 'Long-standing 6-9% objective; formal inflation targeting announced in 2025.' },
  SouthAfrica: { bank: 'South African Reserve Bank', target: 3, band: 1, regime: 'inflation-targeting', since: 2000, note: '3% point target from late 2025, replacing the 3-6% range in place since 2000.' },
  Kenya: { bank: 'Central Bank of Kenya', target: 5, band: 2.5, regime: 'inflation-targeting', since: 2011 },
  Ethiopia: { bank: 'National Bank of Ethiopia', target: null, band: 0, regime: 'none', since: null, note: 'Aims for single-digit inflation; no numeric target.' },
  Ghana: { bank: 'Bank of Ghana', target: 8, band: 2, regime: 'inflation-targeting', since: 2007 },
  Japan: { bank: 'Bank of Japan', target: 2, band: 0, regime: 'inflation-targeting', since: 2013 },
  Australia: { bank: 'Reserve Bank of Australia', target: 2.5, band: 0.5, regime: 'inflation-targeting', since: 1993, note: '2-3% target range; the RBA aims for the midpoint.' },
  SouthKorea: { bank: 'Bank of Korea', target: 2, band: 0, regime: 'inflation-targeting', since: 1998, note: 'Point target of 2% since 2016.' },
  China: { bank: "People's Bank of China", target: 2, band: 0, regime: 'informal', since: null, note: 'Annual government CPI goal, cut from "around 3%" to "around 2%" in 2025.' },
  India: { bank: 'Reserve Bank of India', target: 4, band: 2, regime: 'inflation-targeting', since: 2016 },
  Indonesia: { bank: 'Bank Indonesia', target: 2.5, band: 1, regime: 'inflation-targeting', since: 2005 },
  Singapore: { bank: 'Monetary Authority of Singapore', target: 2, band: 0, regime: 'informal', since: null, note: 'Exchange-rate-centred policy; MAS regards core inflation just under 2% as consistent with price stability.' },
  Vietnam: { bank: 'State Bank of Vietnam', target: 4.5, band: 0, regime: 'informal', since: null, note: 'Annual National Assembly ceiling of about 4.5%.' },
  Thailand: { bank: 'Bank of Thailand', target: 2, band: 1, regime: 'inflation-targeting', since: 2000, note: '1-3% target range.' },
  Philippines: { bank: 'Bangko Sentral ng Pilipinas', target: 3, band: 1, regime: 'inflation-targeting', since: 2002 },
  Pakistan: { bank: 'State Bank of Pakistan', target: 6, band: 1, regime: 'informal', since: null, note: '5-7% medium-term objective.' },
  Bangladesh: { bank: 'Bangladesh Bank', target: null, band: 0, regime: 'none', since: null, note: 'Annual inflation ceilings in the monetary policy statement; no standing target.' },
};

export function targetFor(country: CountryKey): InflationTarget {
  return INFLATION_TARGETS[country];
}
