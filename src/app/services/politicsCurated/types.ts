import type { CountryKey } from '../../utils/countryMappings';

// V-Dem "Regimes of the World" categories. Hybrid regimes in the EIU sense are
// captured separately in `indices.eiu.category`.
export type RegimeType =
  | 'liberal-democracy'
  | 'electoral-democracy'
  | 'electoral-autocracy'
  | 'closed-autocracy';

export type GovernmentForm =
  | 'presidential'
  | 'parliamentary'
  | 'semi-presidential'
  | 'constitutional-monarchy'
  | 'absolute-monarchy'
  | 'one-party-state'
  | 'theocratic-republic'
  | 'directorial';

export type StateStructure = 'federal' | 'unitary' | 'devolved-unitary';

export type PartyRole = 'governing' | 'coalition' | 'confidence' | 'opposition';

export type EiuCategory = 'Full democracy' | 'Flawed democracy' | 'Hybrid regime' | 'Authoritarian';
export type FreedomHouseStatus = 'Free' | 'Partly Free' | 'Not Free';

export type TraditionId =
  | 'westminster'
  | 'liberal-constitutionalism'
  | 'social-democracy'
  | 'christian-democracy'
  | 'civic-republicanism'
  | 'consociationalism'
  | 'confucian-statecraft'
  | 'developmental-state'
  | 'islamic-governance'
  | 'marxist-leninist'
  | 'latin-populism'
  | 'postcolonial-nationalism'
  | 'monarchical';

export type Gender = 'male' | 'female';

export type RouteToPower =
  | 'election'
  | 'parliamentary-vote'
  | 'succession'
  | 'appointment'
  | 'party-selection'
  | 'coup'
  | 'hereditary';

export interface Leader {
  name: string;
  title: string;
  party?: string;
  since: string; // ISO date
  // Filled from LEADER_BIOS in index.ts; absent only for collective offices.
  born?: number;
  gender?: Gender;
  route?: RouteToPower;
}

export interface LeaderTerm {
  name: string;
  party?: string;
  role: 'hog' | 'hos';
  start: string; // ISO date
  end: string | null;
  route: RouteToPower;
  note?: string;
}

export interface VoteShare {
  abbr: string;
  name: string;
  pct: number;
  color: string;
}

export interface VoteResult {
  year: number;
  type: string;
  turnoutPct?: number;
  // Official figures from elections that were not free or fair.
  contested?: boolean;
  results: VoteShare[];
}

export interface CountryHistory {
  leaders: LeaderTerm[];
  leadersNote?: string;
  votes: VoteResult[];
  votesNote?: string;
}

// 0 = no constraint on the executive, 4 = strong constraint.
export interface ChecksProfile {
  executiveVeto: number;
  removalDifficulty: number;
  judicialReview: number;
  centralBankIndependence: number;
  termLimitIntegrity: number;
  emergencyPowers: number;
  legislativeOversight: number;
  territorialDispersion: number;
  notes: string;
}

export type ChangeKind = 'new-leader' | 'election' | 'coalition' | 'constitution' | 'other';

export interface PoliticalChange {
  date: string;
  key: CountryKey;
  kind: ChangeKind;
  summary: string;
}

export interface Election {
  type: string;
  date: string; // ISO date; first of month when only the month is known
  approximate?: boolean;
  summary?: string;
}

export interface Party {
  name: string;
  abbr: string;
  ideology: string[];
  econ: number;   // -5 (state-led left) .. +5 (market right)
  social: number; // -5 (libertarian / progressive) .. +5 (authoritarian / traditionalist)
  seats: number;  // lower or sole chamber
  role: PartyRole;
  color: string;
}

export interface Era {
  start: number;
  end: number | null;
  title: string;
  summary: string;
}

export interface KeyEvent {
  year: number;
  event: string;
  significance: string;
}

export interface PoliticalProfile {
  key: CountryKey;
  iso3: string;
  officialName: string;
  capital: string;
  populationM: number;
  statehood: string;
  system: {
    regime: RegimeType;
    form: GovernmentForm;
    structure: StateStructure;
    constitutionYear: number;
    termLimits: string;
    electoralSystem: string;
    legislature: {
      name: string;
      lowerHouse: string;
      upperHouse?: string;
      seats: number;
      seatsAsOf: string;
    };
  };
  leadership: {
    headOfState: Leader;
    headOfGovernment?: Leader;
    rulingCoalition: string;
    mainOpposition: string;
    lastElection: Election;
    nextElection: Election;
    // Who holds real executive power when the form-based default is wrong.
    executive?: 'headOfState' | 'headOfGovernment';
    note?: string;
  };
  parties: Party[];
  history: {
    summary: string;
    eras: Era[];
    keyEvents: KeyEvent[];
  };
  culture: {
    summary: string;
    traits: string[];
    cleavages: string[];
    civilSociety: string;
    media: string;
  };
  philosophy: {
    summary: string;
    foundingIdeas: string[];
    thinkers: { name: string; idea: string }[];
    principles: string[];
    coreValues: string[];
    stateIdeology?: string;
  };
  foreignPolicy: {
    alignment: string;
    blocs: string[];
    doctrine: string;
  };
  indices: {
    eiu: { score: number; category: EiuCategory };
    freedomHouse: { score: number; status: FreedomHouseStatus };
    rsfRank: number;
    cpi: number;
    womenInParliamentPct: number;
    // V-Dem Liberal Democracy Index, every five years 1975..2025 (11 readings).
    vdemLibDem: number[];
  };
  traditions: TraditionId[];
  sources: string[];
  lastVerified: string;
  // Per-field verification; index.ts defaults missing fields to lastVerified.
  verified?: { leadership: string; seats: string; nextElection: string };
}

export interface PoliticalTradition {
  id: TraditionId;
  name: string;
  summary: string;
  origins: string;
  thinkers: string[];
  hallmarks: string[];
}
