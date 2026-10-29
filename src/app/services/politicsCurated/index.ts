// Curated political profiles for the 47 featured countries.
//
// Leadership, legislatures and election dates verified against official
// parliament / election-commission sites and wire reporting as of
// CURATED_LAST_UPDATED. Governance indices are approximate readings of the
// latest editions: EIU Democracy Index 2024, Freedom House Freedom in the
// World 2025, RSF World Press Freedom Index 2025, Transparency International
// CPI 2024, IPU Parline (women in parliament) and V-Dem v15 Liberal Democracy
// Index. Party compass placements are editorial estimates.

import type { CountryKey } from '../../utils/countryMappings';
import { getRegionFor } from '../../utils/countryMappings';
import type { PoliticalProfile, PoliticalTradition, RegimeType, TraditionId, Election, Leader, CountryHistory, LeaderTerm } from './types';
import { LEADER_BIOS } from './bios';
import { POLITICS_HISTORY } from './history';
import { NORTH_AMERICA_PROFILES } from './northAmerica';
import { LATIN_AMERICA_PROFILES } from './latinAmerica';
import { EUROPE_WEST_PROFILES } from './europeWest';
import { EUROPE_NORTH_SOUTH_PROFILES } from './europeNorthSouth';
import { EURASIA_PROFILES } from './eurasia';
import { MIDDLE_EAST_PROFILES } from './middleEast';
import { AFRICA_PROFILES } from './africa';
import { ASIA_EAST_PROFILES } from './asiaEast';
import { ASIA_SOUTH_PROFILES } from './asiaSouth';

export * from './types';
export { CHECKS_BY_KEY, CHECK_AXES, CHECK_LABELS, powerConcentration, type CheckAxis } from './checks';
export { RECENT_CHANGES } from './changes';
export { LEADER_BIOS } from './bios';
export * from './quiz';

export const CURATED_LAST_UPDATED = '2026-10-29';

export const INDEX_EDITIONS = {
  eiu: 'EIU Democracy Index 2024',
  freedomHouse: 'Freedom House, Freedom in the World 2025',
  rsf: 'RSF World Press Freedom Index 2025',
  cpi: 'Transparency International CPI 2024',
  ipu: 'IPU Parline, 2026',
  vdem: 'V-Dem v15 Liberal Democracy Index (approximate five-year readings)',
} as const;

export const VDEM_YEARS = [1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025] as const;

function withBio(l: Leader): Leader {
  const bio = LEADER_BIOS[l.name];
  return bio ? { ...bio, ...l } : l;
}

function enrich(p: PoliticalProfile): PoliticalProfile {
  const { headOfState, headOfGovernment } = p.leadership;
  return {
    ...p,
    leadership: {
      ...p.leadership,
      headOfState: withBio(headOfState),
      ...(headOfGovernment ? { headOfGovernment: withBio(headOfGovernment) } : {}),
    },
    verified: {
      leadership: p.verified?.leadership ?? p.lastVerified,
      seats: p.verified?.seats ?? p.system.legislature.seatsAsOf ?? p.lastVerified,
      nextElection: p.verified?.nextElection ?? p.lastVerified,
    },
  };
}

export const POLITICS_PROFILES: PoliticalProfile[] = [
  ...NORTH_AMERICA_PROFILES,
  ...LATIN_AMERICA_PROFILES,
  ...EUROPE_WEST_PROFILES,
  ...EUROPE_NORTH_SOUTH_PROFILES,
  ...EURASIA_PROFILES,
  ...MIDDLE_EAST_PROFILES,
  ...AFRICA_PROFILES,
  ...ASIA_EAST_PROFILES,
  ...ASIA_SOUTH_PROFILES,
].map(enrich);

export const POLITICS_HISTORY_BY_KEY: Partial<Record<CountryKey, CountryHistory>> = POLITICS_HISTORY;

export const POLITICS_BY_KEY: Partial<Record<CountryKey, PoliticalProfile>> = Object.fromEntries(
  POLITICS_PROFILES.map((p) => [p.key, p]),
);

export const REGIME_LABELS: Record<RegimeType, string> = {
  'liberal-democracy': 'Liberal democracy',
  'electoral-democracy': 'Electoral democracy',
  'electoral-autocracy': 'Electoral autocracy',
  'closed-autocracy': 'Closed autocracy',
};

export const REGIME_ORDER: RegimeType[] = ['liberal-democracy', 'electoral-democracy', 'electoral-autocracy', 'closed-autocracy'];

export const REGIME_COLORS: Record<RegimeType, string> = {
  'liberal-democracy': '#2563eb',
  'electoral-democracy': '#38bdf8',
  'electoral-autocracy': '#f59e0b',
  'closed-autocracy': '#dc2626',
};

export const GOVERNMENT_FORM_LABELS: Record<PoliticalProfile['system']['form'], string> = {
  presidential: 'Presidential republic',
  parliamentary: 'Parliamentary republic',
  'semi-presidential': 'Semi-presidential republic',
  'constitutional-monarchy': 'Constitutional monarchy',
  'absolute-monarchy': 'Absolute monarchy',
  'one-party-state': 'One-party state',
  'theocratic-republic': 'Theocratic republic',
  directorial: 'Directorial republic',
};

export const STRUCTURE_LABELS: Record<PoliticalProfile['system']['structure'], string> = {
  federal: 'Federal',
  unitary: 'Unitary',
  'devolved-unitary': 'Unitary with devolution',
};

export const POLITICAL_TRADITIONS: PoliticalTradition[] = [
  {
    id: 'westminster',
    name: 'Westminster parliamentarism',
    summary: 'Executive drawn from and accountable to an elected chamber, with a neutral head of state, cabinet government and an official opposition.',
    origins: 'England\'s 17th-century struggles between Crown and Parliament, exported across the British Empire.',
    thinkers: ['Walter Bagehot', 'A. V. Dicey', 'Edmund Burke'],
    hallmarks: ['Parliamentary sovereignty', 'Cabinet responsibility', 'Majoritarian elections', 'Conventions over codified rules'],
  },
  {
    id: 'liberal-constitutionalism',
    name: 'Liberal constitutionalism',
    summary: 'Government limited by a written constitution, separated powers, entrenched rights and independent courts.',
    origins: 'Enlightenment natural-rights thought and the American and French revolutions.',
    thinkers: ['John Locke', 'Montesquieu', 'James Madison', 'John Stuart Mill'],
    hallmarks: ['Bill of rights', 'Judicial review', 'Checks and balances', 'Rule of law'],
  },
  {
    id: 'social-democracy',
    name: 'Social democracy',
    summary: 'Democratic politics used to tame markets through universal welfare, labour rights and redistribution.',
    origins: 'European labour movements of the late 19th century; matured in postwar Scandinavia.',
    thinkers: ['Eduard Bernstein', 'Ernst Wigforss', 'Anthony Crosland'],
    hallmarks: ['Universal welfare state', 'Collective bargaining', 'Progressive taxation', 'Mixed economy'],
  },
  {
    id: 'christian-democracy',
    name: 'Christian democracy',
    summary: 'Centre-right politics rooted in Catholic and Protestant social teaching: family, subsidiarity and a social market economy.',
    origins: 'Catholic social encyclicals (Rerum Novarum, 1891) and the postwar rebuilding of Western Europe.',
    thinkers: ['Luigi Sturzo', 'Jacques Maritain', 'Konrad Adenauer'],
    hallmarks: ['Subsidiarity', 'Social market economy', 'Personalism', 'European integration'],
  },
  {
    id: 'civic-republicanism',
    name: 'Civic republicanism',
    summary: 'A republic of equal citizens bound by civic virtue and a shared public identity, often secular and centralised.',
    origins: 'Classical Rome, Renaissance Florence and the French Revolution.',
    thinkers: ['Niccolò Machiavelli', 'Jean-Jacques Rousseau', 'Philip Pettit'],
    hallmarks: ['Popular sovereignty', 'Civic virtue', 'Secular public sphere', 'Indivisible nation'],
  },
  {
    id: 'consociationalism',
    name: 'Consociational democracy',
    summary: 'Power-sharing among distinct linguistic, religious or ideological communities through grand coalitions, proportionality and vetoes.',
    origins: 'Swiss, Dutch and Belgian practices, theorised by Arend Lijphart in the 1960s.',
    thinkers: ['Arend Lijphart', 'Johannes Althusius'],
    hallmarks: ['Grand coalitions', 'Proportional representation', 'Mutual veto', 'Segmental autonomy'],
  },
  {
    id: 'confucian-statecraft',
    name: 'Confucian statecraft',
    summary: 'Hierarchical, paternal government by educated, virtuous officials; harmony and order prized over individual rights.',
    origins: 'Classical China (6th century BC), spread to Korea, Vietnam, Japan and Singapore.',
    thinkers: ['Confucius', 'Mencius', 'Zhu Xi'],
    hallmarks: ['Meritocratic bureaucracy', 'Filial loyalty', 'Moral leadership', 'Social harmony'],
  },
  {
    id: 'developmental-state',
    name: 'Developmental state',
    summary: 'A strong, technocratic state directing investment and industry to catch up economically, often limiting political pluralism.',
    origins: 'Meiji and postwar Japan, then South Korea, Taiwan, Singapore and China.',
    thinkers: ['Chalmers Johnson', 'Friedrich List', 'Alice Amsden'],
    hallmarks: ['Industrial policy', 'Elite bureaucracy', 'Export orientation', 'Performance legitimacy'],
  },
  {
    id: 'islamic-governance',
    name: 'Islamic governance',
    summary: 'Political authority grounded in Islamic law and identity, ranging from constitutional references to sharia to clerical rule.',
    origins: 'Early caliphates, Ottoman and Safavid states, and 20th-century Islamist and modernist movements.',
    thinkers: ['Al-Mawardi', 'Ibn Khaldun', 'Muhammad Abduh', 'Ruhollah Khomeini'],
    hallmarks: ['Sharia as a source of law', 'Shura (consultation)', 'Religious legitimacy', 'Ulama influence'],
  },
  {
    id: 'marxist-leninist',
    name: 'Marxist-Leninist party-state',
    summary: 'A vanguard communist party monopolises power through democratic centralism and controls the state, army and society.',
    origins: 'Lenin\'s Bolsheviks (1917), exported to China, Vietnam and beyond.',
    thinkers: ['Karl Marx', 'Vladimir Lenin', 'Mao Zedong', 'Ho Chi Minh'],
    hallmarks: ['Single-party rule', 'Democratic centralism', 'Party control of army', 'State ideology'],
  },
  {
    id: 'latin-populism',
    name: 'Latin American populism',
    summary: 'Charismatic leaders mobilise "the people" against elites through strong presidencies, nationalism and redistribution, on the left or right.',
    origins: 'Vargas in Brazil, Perón in Argentina and Cárdenas in Mexico in the 1930s-40s.',
    thinkers: ['Juan Perón', 'Ernesto Laclau', 'Getúlio Vargas'],
    hallmarks: ['Charismatic presidency', 'People versus elite', 'Economic nationalism', 'Mass mobilisation'],
  },
  {
    id: 'postcolonial-nationalism',
    name: 'Postcolonial nationalism',
    summary: 'State-building after empire, focused on sovereignty, national unity across diverse peoples and development.',
    origins: 'Mid-20th-century independence movements in Asia and Africa (Bandung, 1955).',
    thinkers: ['Mahatma Gandhi', 'Kwame Nkrumah', 'Sukarno', 'Frantz Fanon'],
    hallmarks: ['Sovereignty', 'Non-alignment', 'Nation-building', 'Anti-imperialism'],
  },
  {
    id: 'monarchical',
    name: 'Monarchical tradition',
    summary: 'A hereditary crown as the symbol (or substance) of the state, from ceremonial constitutional monarchies to ruling dynasties.',
    origins: 'Dynastic states of Europe, the Gulf, Morocco and East Asia.',
    thinkers: ['Jean Bodin', 'Walter Bagehot', 'Ibn Khaldun'],
    hallmarks: ['Hereditary succession', 'Continuity and national unity', 'Royal prerogative (varying)', 'Religious or historical legitimacy'],
  },
];

export const TRADITION_BY_ID: Record<TraditionId, PoliticalTradition> = Object.fromEntries(
  POLITICAL_TRADITIONS.map((t) => [t.id, t]),
) as Record<TraditionId, PoliticalTradition>;

export interface UpcomingElection extends Election {
  key: CountryKey;
  country: string;
}

/** Future elections sorted by date, measured against `asOf` (defaults to curation date). */
export function getUpcomingElections(asOf: string = CURATED_LAST_UPDATED): UpcomingElection[] {
  return POLITICS_PROFILES
    .filter((p) => p.leadership.nextElection.date && p.leadership.nextElection.date >= asOf)
    .map((p) => ({ ...p.leadership.nextElection, key: p.key, country: p.officialName }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export const UPCOMING_ELECTIONS = getUpcomingElections();

export function getRecentElections(asOf: string = CURATED_LAST_UPDATED, months = 12): UpcomingElection[] {
  const cutoff = new Date(asOf);
  cutoff.setMonth(cutoff.getMonth() - months);
  const cut = cutoff.toISOString().slice(0, 10);
  return POLITICS_PROFILES
    .filter((p) => p.leadership.lastElection.date >= cut && p.leadership.lastElection.date <= asOf)
    .map((p) => ({ ...p.leadership.lastElection, key: p.key, country: p.officialName }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function yearsInPower(since: string, asOf: string = CURATED_LAST_UPDATED): number {
  const ms = new Date(asOf).getTime() - new Date(since).getTime();
  return Math.max(0, ms / (365.25 * 24 * 3600 * 1000));
}

/** Head of government in parliamentary systems; head of state in presidential, semi-presidential, monarchical and party-state systems. */
export function getEffectiveLeader(p: PoliticalProfile): Leader {
  const { headOfState, headOfGovernment, executive } = p.leadership;
  if (!headOfGovernment) return headOfState;
  if (executive) return executive === 'headOfState' ? headOfState : headOfGovernment;
  const form = p.system.form;
  const stateLed = form === 'presidential' || form === 'semi-presidential' || form === 'absolute-monarchy' || form === 'one-party-state' || form === 'theocratic-republic';
  return stateLed ? headOfState : headOfGovernment;
}

export function totalSeats(p: PoliticalProfile): number {
  return p.parties.reduce((s, x) => s + x.seats, 0);
}

export function governmentSeatShare(p: PoliticalProfile): number {
  const total = p.system.legislature.seats;
  if (!total) return 0;
  const gov = p.parties.filter((x) => x.role === 'governing' || x.role === 'coalition').reduce((s, x) => s + x.seats, 0);
  return gov / total;
}

export interface RegimeShare {
  regime: RegimeType;
  countries: number;
  populationM: number;
  sharePct: number;
}

export function getRegimeShares(profiles: PoliticalProfile[] = POLITICS_PROFILES): RegimeShare[] {
  const totalPop = profiles.reduce((s, p) => s + p.populationM, 0);
  return REGIME_ORDER.map((regime) => {
    const subset = profiles.filter((p) => p.system.regime === regime);
    const populationM = subset.reduce((s, p) => s + p.populationM, 0);
    return { regime, countries: subset.length, populationM, sharePct: totalPop ? (populationM / totalPop) * 100 : 0 };
  });
}

export function getProfilesByRegion(): Record<string, PoliticalProfile[]> {
  const out: Record<string, PoliticalProfile[]> = {};
  for (const p of POLITICS_PROFILES) {
    const region = getRegionFor(p.key) ?? 'Other';
    (out[region] ??= []).push(p);
  }
  return out;
}

/** Ideological centre of gravity of a legislature, weighted by seats. */
export function seatWeightedCompass(p: PoliticalProfile): { econ: number; social: number } {
  const total = totalSeats(p);
  if (!total) return { econ: 0, social: 0 };
  return {
    econ: p.parties.reduce((s, x) => s + x.econ * x.seats, 0) / total,
    social: p.parties.reduce((s, x) => s + x.social * x.seats, 0) / total,
  };
}

export function leaderAge(l: Leader, asOf: string = CURATED_LAST_UPDATED): number | null {
  return l.born ? Number(asOf.slice(0, 4)) - l.born : null;
}

export interface CurrentLeaderRow {
  key: CountryKey;
  country: string;
  leader: Leader;
  age: number | null;
  regime: RegimeType;
}

export function currentLeaders(profiles: PoliticalProfile[] = POLITICS_PROFILES): CurrentLeaderRow[] {
  return profiles.map((p) => {
    const leader = getEffectiveLeader(p);
    return { key: p.key, country: p.officialName, leader, age: leaderAge(leader), regime: p.system.regime };
  });
}

/** Women among the effective leaders, and among all current heads of state or government. */
export function womenLeaders(profiles: PoliticalProfile[] = POLITICS_PROFILES): { effective: CurrentLeaderRow[]; anyOffice: { key: CountryKey; leader: Leader }[] } {
  const effective = currentLeaders(profiles).filter((r) => r.leader.gender === 'female');
  const anyOffice = profiles.flatMap((p) =>
    [p.leadership.headOfState, p.leadership.headOfGovernment]
      .filter((l): l is Leader => !!l && l.gender === 'female')
      .map((leader) => ({ key: p.key, leader })),
  );
  return { effective, anyOffice };
}

/** The history role whose open term belongs to the effective leader. */
export function effectiveRole(p: PoliticalProfile, h: CountryHistory | undefined = POLITICS_HISTORY_BY_KEY[p.key]): LeaderTerm['role'] | null {
  if (!h || h.leaders.length === 0) return null;
  const name = getEffectiveLeader(p).name;
  const open = h.leaders.find((t) => t.end === null && t.name === name);
  if (open) return open.role;
  const hog = h.leaders.filter((t) => t.role === 'hog').length;
  return hog >= h.leaders.length - hog ? 'hog' : 'hos';
}

export interface Turnover {
  terms: number;
  distinctLeaders: number;
  avgTenureYears: number;
  coups: number;
}

/**
 * Leader turnover in the effective office for terms running on or after 1945.
 * When that office is recent (e.g. Saudi Arabia's separate prime minister since
 * 2022) and covers under half the span of the other, the other office is used.
 */
export function turnoverSince1945(p: PoliticalProfile, asOf: string = CURATED_LAST_UPDATED): Turnover | null {
  const h = POLITICS_HISTORY_BY_KEY[p.key];
  const effective = effectiveRole(p, h);
  if (!h || !effective) return null;
  const since1945 = (role: LeaderTerm['role']) => h.leaders.filter((t) => t.role === role && (t.end === null || t.end >= '1945-01-01'));
  const span = (rows: LeaderTerm[]) => rows.reduce((s, t) => s + yearsInPower(t.start < '1945-01-01' ? '1945-01-01' : t.start, t.end ?? asOf), 0);
  const other = effective === 'hog' ? 'hos' : 'hog';
  let rows = since1945(effective);
  let years = span(rows);
  const alt = since1945(other);
  const altYears = span(alt);
  if (years < altYears / 2) {
    rows = alt;
    years = altYears;
  }
  if (!rows.length) return null;
  return {
    terms: rows.length,
    distinctLeaders: new Set(rows.map((t) => t.name)).size,
    avgTenureYears: years / rows.length,
    coups: rows.filter((t) => t.route === 'coup').length,
  };
}

/** Ideological position of the governing side, weighted by seats. */
export function governmentCompass(p: PoliticalProfile): { econ: number; social: number } {
  const gov = p.parties.filter((x) => x.role === 'governing' || x.role === 'coalition');
  const total = gov.reduce((s, x) => s + x.seats, 0);
  if (!total) return seatWeightedCompass(p);
  return {
    econ: gov.reduce((s, x) => s + x.econ * x.seats, 0) / total,
    social: gov.reduce((s, x) => s + x.social * x.seats, 0) / total,
  };
}
