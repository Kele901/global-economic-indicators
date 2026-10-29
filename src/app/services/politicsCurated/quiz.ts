import type { CountryKey } from '../../utils/countryMappings';
import type { Party, PoliticalProfile } from './types';

// Agreement on a five-point scale, -2 (strongly disagree) .. +2 (strongly agree).
export type Answer = -2 | -1 | 0 | 1 | 2;

export interface QuizStatement {
  id: string;
  text: string;
  // Movement on each compass axis per point of agreement, -1..1. Positive econ
  // is towards the market; positive social is towards authority and tradition,
  // matching Party.econ and Party.social.
  econ: number;
  social: number;
}

export const QUIZ_STATEMENTS: QuizStatement[] = [
  { id: 'markets', text: 'Markets, not governments, should set most prices and wages.', econ: 1, social: 0 },
  { id: 'tax-rich', text: 'The rich should pay a much larger share of their income in tax.', econ: -1, social: 0 },
  { id: 'public-ownership', text: 'Key industries such as energy and railways should be publicly owned.', econ: -1, social: 0 },
  { id: 'regulation', text: 'Business regulation usually does more harm than good.', econ: 1, social: 0 },
  { id: 'welfare', text: 'A generous welfare state is worth the higher taxes it requires.', econ: -0.8, social: -0.2 },
  { id: 'free-trade', text: 'Free trade helps ordinary people more than tariffs that protect local jobs.', econ: 0.7, social: -0.3 },
  { id: 'strong-leader', text: 'A strong leader who gets things done matters more than checks on their power.', econ: 0, social: 1 },
  { id: 'tradition', text: 'Traditional family and religious values should guide the law.', econ: 0, social: 1 },
  { id: 'immigration', text: 'Immigration enriches the country\'s culture and economy.', econ: 0, social: -0.8 },
  { id: 'dissent', text: 'People should be free to criticise the government, even in a crisis.', econ: 0, social: -1 },
  { id: 'crime', text: 'Tougher sentences are the best way to reduce crime.', econ: 0.2, social: 0.8 },
  { id: 'marriage', text: 'Same-sex couples should have the same right to marry as anyone else.', econ: 0, social: -1 },
];

export const ANSWER_LABELS: { value: Answer; label: string }[] = [
  { value: -2, label: 'Strongly disagree' },
  { value: -1, label: 'Disagree' },
  { value: 0, label: 'Neutral' },
  { value: 1, label: 'Agree' },
  { value: 2, label: 'Strongly agree' },
];

export type Answers = (Answer | null)[];

export interface CompassPoint {
  econ: number;
  social: number;
}

/** Position on the -5..5 compass; skipped statements are left out of both axes. */
export function scoreAnswers(answers: Answers): CompassPoint {
  let econ = 0, econMax = 0, social = 0, socialMax = 0;
  QUIZ_STATEMENTS.forEach((q, i) => {
    const a = answers[i];
    if (a === null || a === undefined) return;
    econ += a * q.econ;
    social += a * q.social;
    econMax += 2 * Math.abs(q.econ);
    socialMax += 2 * Math.abs(q.social);
  });
  const round = (v: number) => Math.round(v * 100) / 100;
  return {
    econ: econMax ? round((econ / econMax) * 5) : 0,
    social: socialMax ? round((social / socialMax) * 5) : 0,
  };
}

export interface PartyMatch {
  key: CountryKey;
  party: Party;
  distance: number;
}

/** Nearest parties by Euclidean distance; ties break on country key, then abbreviation. */
export function nearestParties(
  point: CompassPoint,
  profiles: PoliticalProfile[],
  { limit = 10, governingOnly = false }: { limit?: number; governingOnly?: boolean } = {},
): PartyMatch[] {
  const out: PartyMatch[] = [];
  for (const p of profiles) {
    for (const party of p.parties) {
      if (party.seats <= 0) continue;
      if (governingOnly && party.role !== 'governing' && party.role !== 'coalition') continue;
      out.push({ key: p.key, party, distance: Math.hypot(party.econ - point.econ, party.social - point.social) });
    }
  }
  return out
    .sort((a, b) => a.distance - b.distance || a.key.localeCompare(b.key) || a.party.abbr.localeCompare(b.party.abbr))
    .slice(0, limit);
}

const CODES = 'abcde';

/** "a".."e" per answer, "x" when skipped. */
export function encodeAnswers(answers: Answers): string {
  return QUIZ_STATEMENTS.map((_, i) => {
    const a = answers[i];
    return a === null || a === undefined ? 'x' : CODES[a + 2];
  }).join('');
}

export function decodeAnswers(code: string | null | undefined): Answers | null {
  if (!code || code.length !== QUIZ_STATEMENTS.length || !/^[a-ex]+$/.test(code)) return null;
  return code.split('').map((c) => (c === 'x' ? null : ((CODES.indexOf(c) - 2) as Answer)));
}

export function emptyAnswers(): Answers {
  return QUIZ_STATEMENTS.map(() => null);
}

export function quadrantLabel(p: CompassPoint): string {
  const econ = Math.abs(p.econ) < 0.75 ? 'centrist' : p.econ < 0 ? 'left' : 'right';
  const social = Math.abs(p.social) < 0.75 ? 'moderate' : p.social < 0 ? 'liberal' : 'authoritarian';
  if (econ === 'centrist' && social === 'moderate') return 'Centrist';
  if (econ === 'centrist') return `Centrist, socially ${social}`;
  if (social === 'moderate') return `Economic ${econ}, socially moderate`;
  return `${social.charAt(0).toUpperCase()}${social.slice(1)} ${econ}`;
}
