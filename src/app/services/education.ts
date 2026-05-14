// Education data service for the cultural-capital "Education" tab.
//
// Joins live World Bank indicators (via fetchExtraIndicators), the curated
// OECD PISA 2022 snapshot, and the curated QS World University Rankings 2026
// snapshot into a per-country EducationProfile. The PISA wave is published
// every 3 years and QS is published annually under restrictive licences, so
// both are treated as point-in-time snapshots with their own freshness dates
// while every World Bank indicator is fetched live and cached.

import { fetchExtraIndicators, CountryData, COUNTRY_NAMES } from "./worldbank";
import { clientCache } from "./clientCache";
import {
  universityRankingsByCountry,
  qs2026Top100,
  QS_SNAPSHOT_DATE,
  QS_SOURCE_URL,
  pisaScoresByCountry,
  PISA_WAVE,
  PISA_SOURCE_URL,
  PISA_OECD_AVG,
  RankedUniversity,
  GlobalRankedUniversity,
  CountryRankingSnapshot,
  PisaScore,
} from "../data/universityRankings";

export interface EducationProfile {
  country: string;            // internal key (e.g. 'USA')
  tertiaryEnroll: number | null;       // % gross, SE.TER.ENRR
  secondaryEnroll: number | null;      // % gross, SE.SEC.ENRR
  primaryEnroll: number | null;        // % gross, SE.PRM.ENRR
  primaryCompletion: number | null;    // %, SE.PRM.CMPT.ZS
  adultLiteracy: number | null;        // % 15+, SE.ADT.LITR.ZS
  youthLiteracy: number | null;        // % 15-24, SE.ADT.1524.LT.ZS
  educationSpendGDP: number | null;    // % GDP, SE.XPD.TOTL.GD.ZS
  spendPerTertiary: number | null;     // % GDP per capita, SE.XPD.TERT.PC.ZS
  stemGraduates: number | null;        // % of all grads, SE.TER.GRAD.SC.ZS
  bachelorAttain: number | null;       // % age 25+, SE.TER.CUAT.BA.ZS
  masterAttain: number | null;         // % age 25+, SE.TER.CUAT.MS.ZS
  trainedTeachers: number | null;      // % primary, SE.PRM.TCAQ.ZS
  pupilTeacherPrimary: number | null;  // ratio, SE.PRM.ENRL.TC.ZS
  laborForceAdvanced: number | null;   // % LF advanced edu, SL.TLF.ADVN.ZS
  unemploymentAdvanced: number | null; // % advanced edu, SL.UEM.ADVN.ZS
  scientificArticles: number | null;   // absolute count, IP.JRN.ARTC.SC
  researchersPerMillion: number | null; // per million, SP.POP.SCIE.RD.P6
  pisa: PisaScore | null;
  rankings: CountryRankingSnapshot | null;
  dataYears: {
    tertiaryEnroll: number | null;
    adultLiteracy: number | null;
    educationSpendGDP: number | null;
    pisa: string | null;
    rankings: string | null;
  };
}

export interface EducationLiveData {
  countries: Record<string, EducationProfile>;
  globalTop100: GlobalRankedUniversity[];
  updatedAt: string;
  rankingsAsOf: string;
  pisaAsOf: string;
  sources: {
    worldBank: boolean;
    oecdPisa: boolean;
    qsRankings: boolean;
  };
  meta: {
    pisaOecdAvg: PisaScore;
    pisaSourceUrl: string;
    qsSourceUrl: string;
  };
}

const CACHE_KEY = "education_live_v2";
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24h

/**
 * Walk a World Bank series backwards (latest first) and return the most
 * recent non-null, non-zero value for the requested country plus the year.
 * Education indicators (especially literacy) are reported infrequently for
 * emerging economies, so falling back through the whole time series is
 * critical for coverage.
 */
function getLatestWithYear(
  series: CountryData[] | undefined,
  country: string
): { value: number; year: number } | null {
  if (!series || series.length === 0) return null;
  for (let i = series.length - 1; i >= 0; i--) {
    const row = series[i] as any;
    const raw = row[country];
    if (raw === null || raw === undefined) continue;
    const v = Number(raw);
    if (Number.isNaN(v) || v === 0) continue;
    const year = Number(row.year ?? row.date);
    return { value: v, year: Number.isFinite(year) ? year : 0 };
  }
  return null;
}

function valueOnly(
  series: CountryData[] | undefined,
  country: string
): number | null {
  const hit = getLatestWithYear(series, country);
  return hit ? hit.value : null;
}

const COUNTRY_KEYS: string[] = Object.values(COUNTRY_NAMES);

const INDICATOR_CODES = {
  tertiaryEnroll: "SE.TER.ENRR",
  secondaryEnroll: "SE.SEC.ENRR",
  primaryEnroll: "SE.PRM.ENRR",
  primaryCompletion: "SE.PRM.CMPT.ZS",
  adultLiteracy: "SE.ADT.LITR.ZS",
  youthLiteracy: "SE.ADT.1524.LT.ZS",
  educationSpendGDP: "SE.XPD.TOTL.GD.ZS",
  spendPerTertiary: "SE.XPD.TERT.PC.ZS",
  stemGraduates: "SE.TER.GRAD.SC.ZS",
  bachelorAttain: "SE.TER.CUAT.BA.ZS",
  masterAttain: "SE.TER.CUAT.MS.ZS",
  trainedTeachers: "SE.PRM.TCAQ.ZS",
  pupilTeacherPrimary: "SE.PRM.ENRL.TC.ZS",
  laborForceAdvanced: "SL.TLF.ADVN.ZS",
  unemploymentAdvanced: "SL.UEM.ADVN.ZS",
  scientificArticles: "IP.JRN.ARTC.SC",
  researchersPerMillion: "SP.POP.SCIE.RD.P6",
} as const;

type IndicatorAlias = keyof typeof INDICATOR_CODES;

/**
 * Fetch and assemble the live Education dataset.
 *
 * - World Bank: live via fetchExtraIndicators (Promise.allSettled internally,
 *   so a single indicator failing returns an empty array and downstream
 *   profile fields will be null without blocking the rest).
 * - OECD PISA: curated 2022 wave snapshot (PISA is published every 3 years).
 * - QS Rankings: curated 2026 snapshot (QS data is not freely API-accessible).
 *
 * Cached via clientCache under key `education_live_v1` for 24h.
 */
export async function fetchEducationData(
  forceRefresh: boolean = false
): Promise<EducationLiveData> {
  if (!forceRefresh) {
    const cached = clientCache.get<EducationLiveData>(CACHE_KEY);
    if (cached && cached.countries && Object.keys(cached.countries).length > 0) {
      return cached;
    }
  }

  console.log("[education] fetching live indicators…");

  let wbResults: Record<string, CountryData[]> = {};
  let worldBankOk = false;
  try {
    wbResults = await fetchExtraIndicators(INDICATOR_CODES);
    worldBankOk = Object.values(wbResults).some(arr => Array.isArray(arr) && arr.length > 0);
  } catch (err) {
    console.error("[education] World Bank fetch failed:", err);
  }

  const countries: Record<string, EducationProfile> = {};

  for (const country of COUNTRY_KEYS) {
    const indicatorValues: Record<IndicatorAlias, number | null> = {} as any;
    (Object.keys(INDICATOR_CODES) as IndicatorAlias[]).forEach(alias => {
      indicatorValues[alias] = valueOnly(wbResults[alias], country);
    });

    const tertiaryHit = getLatestWithYear(wbResults.tertiaryEnroll, country);
    const literacyHit = getLatestWithYear(wbResults.adultLiteracy, country);
    const spendHit = getLatestWithYear(wbResults.educationSpendGDP, country);

    const pisa = pisaScoresByCountry[country] ?? null;
    const rankings = universityRankingsByCountry[country] ?? null;

    countries[country] = {
      country,
      tertiaryEnroll: indicatorValues.tertiaryEnroll,
      secondaryEnroll: indicatorValues.secondaryEnroll,
      primaryEnroll: indicatorValues.primaryEnroll,
      primaryCompletion: indicatorValues.primaryCompletion,
      adultLiteracy: indicatorValues.adultLiteracy,
      youthLiteracy: indicatorValues.youthLiteracy,
      educationSpendGDP: indicatorValues.educationSpendGDP,
      spendPerTertiary: indicatorValues.spendPerTertiary,
      stemGraduates: indicatorValues.stemGraduates,
      bachelorAttain: indicatorValues.bachelorAttain,
      masterAttain: indicatorValues.masterAttain,
      trainedTeachers: indicatorValues.trainedTeachers,
      pupilTeacherPrimary: indicatorValues.pupilTeacherPrimary,
      laborForceAdvanced: indicatorValues.laborForceAdvanced,
      unemploymentAdvanced: indicatorValues.unemploymentAdvanced,
      scientificArticles: indicatorValues.scientificArticles,
      researchersPerMillion: indicatorValues.researchersPerMillion,
      pisa,
      rankings,
      dataYears: {
        tertiaryEnroll: tertiaryHit?.year ?? null,
        adultLiteracy: literacyHit?.year ?? null,
        educationSpendGDP: spendHit?.year ?? null,
        pisa: pisa ? PISA_WAVE : null,
        rankings: rankings ? QS_SNAPSHOT_DATE : null,
      },
    };
  }

  const data: EducationLiveData = {
    countries,
    globalTop100: qs2026Top100,
    updatedAt: new Date().toISOString(),
    rankingsAsOf: QS_SNAPSHOT_DATE,
    pisaAsOf: PISA_WAVE,
    sources: {
      worldBank: worldBankOk,
      oecdPisa: Object.keys(pisaScoresByCountry).length > 0,
      qsRankings: Object.keys(universityRankingsByCountry).length > 0,
    },
    meta: {
      pisaOecdAvg: PISA_OECD_AVG,
      pisaSourceUrl: PISA_SOURCE_URL,
      qsSourceUrl: QS_SOURCE_URL,
    },
  };

  if (worldBankOk) {
    clientCache.set(CACHE_KEY, data, CACHE_TTL);
  } else {
    console.warn("[education] skipping cache write — World Bank returned no data");
  }

  return data;
}

export function clearEducationCache(): void {
  clientCache.delete(CACHE_KEY);
}

// Re-export display helpers for convenience in the dashboard component.
export {
  QS_SNAPSHOT_DATE,
  QS_SOURCE_URL,
  PISA_WAVE,
  PISA_SOURCE_URL,
  PISA_OECD_AVG,
};
export type { PisaScore, RankedUniversity, GlobalRankedUniversity, CountryRankingSnapshot };
