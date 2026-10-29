import type { CountryHistory, LeaderTerm, RouteToPower, VoteResult } from '../types';
import type { CountryKey } from '../../../utils/countryMappings';

const ROUTES = {
  e: 'election',
  p: 'parliamentary-vote',
  s: 'succession',
  a: 'appointment',
  ps: 'party-selection',
  c: 'coup',
  h: 'hereditary',
} as const satisfies Record<string, RouteToPower>;

export type R = keyof typeof ROUTES;

// [name, party ('' when none), start, end (null = incumbent), route, note?]
export type Row = [string, string, string, string | null, R, string?];

export function terms(role: LeaderTerm['role'], rows: Row[]): LeaderTerm[] {
  return rows.map(([name, party, start, end, route, note]) => ({
    name,
    ...(party ? { party } : {}),
    role,
    start,
    end,
    route: ROUTES[route],
    ...(note ? { note } : {}),
  }));
}

// [abbr, name, pct, colour]
export type Share = [string, string, number, string];

export function vote(
  year: number,
  type: string,
  shares: Share[],
  opts: { turnoutPct?: number; contested?: boolean } = {},
): VoteResult {
  return {
    year,
    type,
    ...opts,
    results: shares.map(([abbr, name, pct, color]) => ({ abbr, name, pct, color })),
  };
}

export type HistoryMap = Partial<Record<CountryKey, CountryHistory>>;
