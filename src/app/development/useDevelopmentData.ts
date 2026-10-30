'use client';

import { useEffect, useState } from 'react';
import { fetchExtraIndicators, type CountryData, type ExtraIndicatorSpec } from '../services/worldbank';

// Every live World Bank series the Development Ledger reads, keyed by alias.
export const DEV_SERIES = {
  // Core
  lifeExpectancy: 'SP.DYN.LE00.IN',
  gdpPerCapitaPPP: 'NY.GDP.PCAP.PP.CD',
  gdpPcPppConst: 'NY.GDP.PCAP.PP.KD',
  gdpPcConst: 'NY.GDP.PCAP.KD',
  population: 'SP.POP.TOTL',
  internetUsers: 'IT.NET.USER.ZS',
  broadband: 'IT.NET.BBND.P2',
  mobileSubs: 'IT.CEL.SETS.P2',
  // Poverty and distribution
  poverty300: 'SI.POV.DDAY',
  poverty420: 'SI.POV.LMIC',
  poverty830: 'SI.POV.UMIC',
  povertyGap: 'SI.POV.GAPS',
  prosperityGap: 'SI.SPR.PGAP',
  bottom40Growth: 'SI.SPR.PC40.ZG',
  meanGrowth: 'SI.SPR.PCAP.ZG',
  gini: 'SI.POV.GINI',
  incomeShareLow10: 'SI.DST.FRST.10',
  incomeShareLow20: 'SI.DST.FRST.20',
  incomeShareSecond20: 'SI.DST.02ND.20',
  incomeShareThird20: 'SI.DST.03RD.20',
  incomeShareFourth20: 'SI.DST.04TH.20',
  incomeShareHigh20: 'SI.DST.05TH.20',
  incomeShareTop10: 'SI.DST.10TH.10',
  pppPrivate: 'PA.NUS.PRVT.PP',
  // Human capital
  primaryCompletion: 'SE.PRM.CMPT.ZS',
  secondaryEnrollment: 'SE.SEC.ENRR',
  tertiaryEnrollment: 'SE.TER.ENRR',
  learningPoverty: 'SE.LPV.PRIM',
  hci: { code: 'HD.HCI.OVRL', source: 63 },
  lays: { code: 'HD.HCI.LAYS', source: 63 },
  expectedYearsSchool: { code: 'HD.HCI.EYRS', source: 63 },
  stunting: 'SH.STA.STNT.ZS',
  educationExpenditure: 'SE.XPD.TOTL.GD.ZS',
  schoolGenderParity: 'SE.ENR.PRSC.FM.ZS',
  // Health and services
  under5Mortality: 'SH.DYN.MORT',
  maternalMortality: 'SH.STA.MMRT',
  physiciansPer1000: 'SH.MED.PHYS.ZS',
  hospitalBeds: 'SH.MED.BEDS.ZS',
  immunizationDPT: 'SH.IMM.IDPT',
  immunizationMeasles: 'SH.IMM.MEAS',
  healthExpenditure: 'SH.XPD.CHEX.GD.ZS',
  uhcCoverage: 'SH.UHC.SRVS.CV.XD',
  outOfPocket: 'SH.XPD.OOPC.CH.ZS',
  electricityAccess: 'EG.ELC.ACCS.ZS',
  electricityUrban: 'EG.ELC.ACCS.UR.ZS',
  electricityRural: 'EG.ELC.ACCS.RU.ZS',
  basicWater: 'SH.H2O.BASW.ZS',
  waterUrban: 'SH.H2O.BASW.UR.ZS',
  waterRural: 'SH.H2O.BASW.RU.ZS',
  basicSanitation: 'SH.STA.BASS.ZS',
  // Gender
  lifeExpMale: 'SP.DYN.LE00.MA.IN',
  lifeExpFemale: 'SP.DYN.LE00.FE.IN',
  femaleLaborForce: 'SL.TLF.CACT.FE.ZS',
  maleLaborForce: 'SL.TLF.CACT.MA.ZS',
  adolescentFertility: 'SP.ADO.TFRT',
  womenParliament: 'SG.GEN.PARL.ZS',
  youthUnemployment: 'SL.UEM.1524.ZS',
  // Structure and flows
  employmentAgriculture: 'SL.AGR.EMPL.ZS',
  employmentIndustry: 'SL.IND.EMPL.ZS',
  employmentServices: 'SL.SRV.EMPL.ZS',
  urbanPopulation: 'SP.URB.TOTL.IN.ZS',
  remittances: 'BX.TRF.PWKR.DT.GD.ZS',
  oda: 'DT.ODA.ODAT.GN.ZS',
  fdi: 'BX.KLT.DINV.WD.GD.ZS',
  accountOwnership: 'FX.OWN.TOTL.ZS',
  resourceRents: 'NY.GDP.TOTL.RT.ZS',
  // Demographics
  birthRate: 'SP.DYN.CBRT.IN',
  deathRate: 'SP.DYN.CDRT.IN',
  fertilityRate: 'SP.DYN.TFRT.IN',
  popAge0_14: 'SP.POP.0014.TO.ZS',
  popAge15_64: 'SP.POP.1564.TO.ZS',
  popAge65Plus: 'SP.POP.65UP.TO.ZS',
  dependencyRatio: 'SP.POP.DPND',
  // Environment
  co2PerCapita: 'EN.GHG.CO2.PC.CE.AR5',
  renewableEnergy: 'EG.FEC.RNEW.ZS',
} satisfies Record<string, ExtraIndicatorSpec>;

export type DevAlias = keyof typeof DEV_SERIES;
export type DevData = Partial<Record<DevAlias, CountryData[]>>;

// One request per series per session, shared by every chapter, profile and embed.
const cache = new Map<DevAlias, Promise<CountryData[]>>();

export function loadDevSeries(aliases: readonly DevAlias[]): Promise<DevData> {
  const missing = aliases.filter((a) => !cache.has(a));
  if (missing.length) {
    const spec = Object.fromEntries(missing.map((a) => [a, DEV_SERIES[a]])) as Record<string, ExtraIndicatorSpec>;
    const batch = fetchExtraIndicators(spec).catch(() => ({}) as Record<string, CountryData[]>);
    for (const a of missing) cache.set(a, batch.then((r) => r[a] ?? []));
  }
  return Promise.all(aliases.map((a) => cache.get(a)!)).then((values) =>
    Object.fromEntries(aliases.map((a, i) => [a, values[i]])) as DevData
  );
}

export function useDevSeries(aliases: readonly DevAlias[]): { data: DevData; loading: boolean } {
  const key = aliases.join('|');
  const [state, setState] = useState<{ key: string; data: DevData; loading: boolean }>({ key, data: {}, loading: true });

  useEffect(() => {
    let alive = true;
    loadDevSeries(key.split('|') as DevAlias[]).then((data) => {
      if (alive) setState({ key, data, loading: false });
    });
    return () => {
      alive = false;
    };
  }, [key]);

  return state.key === key ? { data: state.data, loading: state.loading } : { data: {}, loading: true };
}
