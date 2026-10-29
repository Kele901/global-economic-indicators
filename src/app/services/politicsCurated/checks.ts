// Editorial scores of the constraints on each country's executive, informed by
// V-Dem constraint indicators, the Comparative Constitutions Project and the
// Garriga central-bank independence index. Every axis runs 0..4, where 4 means
// the executive is strongly constrained:
//   executiveVeto           other veto players (legislature, second chamber, coalition partners) can block it
//   removalDifficulty       how readily it can be removed (no-confidence, impeachment); 4 = removable
//   judicialReview          courts can and do strike down executive acts
//   centralBankIndependence monetary policy is insulated from the executive
//   termLimitIntegrity      term limits or regular turnover are respected
//   emergencyPowers         emergency powers are bounded and reviewable
//   legislativeOversight    inquiries, questions and budget control bite
//   territorialDispersion   federal or regional governments hold real power
import type { CountryKey } from '../../utils/countryMappings';
import type { ChecksProfile, PoliticalProfile } from './types';

export const CHECK_AXES = [
  'executiveVeto',
  'removalDifficulty',
  'judicialReview',
  'centralBankIndependence',
  'termLimitIntegrity',
  'emergencyPowers',
  'legislativeOversight',
  'territorialDispersion',
] as const satisfies readonly (keyof Omit<ChecksProfile, 'notes'>)[];

export type CheckAxis = (typeof CHECK_AXES)[number];

export const CHECK_LABELS: Record<CheckAxis, { label: string; hint: string }> = {
  executiveVeto: { label: 'Veto players', hint: 'Legislature, second chamber or coalition partners can block the executive' },
  removalDifficulty: { label: 'Removability', hint: 'The executive can be removed by no-confidence or impeachment' },
  judicialReview: { label: 'Judicial review', hint: 'Courts can and do strike down executive acts' },
  centralBankIndependence: { label: 'Central bank', hint: 'Monetary policy is insulated from the government' },
  termLimitIntegrity: { label: 'Term limits', hint: 'Term limits or regular turnover are respected' },
  emergencyPowers: { label: 'Emergency powers', hint: 'Emergency powers are bounded and reviewable' },
  legislativeOversight: { label: 'Oversight', hint: 'Inquiries, questions and budget control constrain ministers' },
  territorialDispersion: { label: 'Federalism', hint: 'Regional governments hold real power' },
};

type Row = [number, number, number, number, number, number, number, number, string];

const ROWS: Record<CountryKey, Row> = {
  USA: [3, 3, 3, 3, 4, 2, 2, 4, 'Strong federalism and courts, but sweeping executive orders, emergency declarations and pressure on the Fed test the limits.'],
  Canada: [2, 3, 3, 4, 3, 3, 2, 4, 'Westminster cabinets dominate parliament, but provinces are among the most powerful sub-national units anywhere.'],
  Mexico: [1, 2, 1, 3, 4, 2, 1, 3, 'Morena\'s supermajority and the 2024 judicial overhaul weakened checks; the single six-year term remains sacrosanct.'],
  Brazil: [3, 3, 4, 3, 4, 3, 3, 4, 'Fragmented Congress, an assertive Supreme Court and strong states make "coalition presidentialism" a negotiation.'],
  Chile: [3, 3, 3, 4, 4, 3, 3, 1, 'Non-consecutive presidential terms, an autonomous central bank and a unitary state.'],
  Argentina: [2, 3, 3, 1, 4, 2, 2, 3, 'Presidents govern heavily by emergency decree (DNU); the central bank has little independence.'],
  Colombia: [3, 3, 4, 4, 4, 3, 3, 2, 'A powerful Constitutional Court and a single-term presidency constrain the executive.'],
  UK: [1, 4, 2, 4, 3, 3, 2, 2, 'An "elective dictatorship" between elections, but party rebellions remove PMs readily; no codified constitution.'],
  France: [2, 2, 3, 4, 4, 2, 3, 1, 'Article 49.3 and Article 16 give the executive tools, while a hung Assembly now topples prime ministers.'],
  Germany: [4, 3, 4, 4, 3, 4, 3, 4, 'Constructive no-confidence, a powerful Constitutional Court, the Bundesrat and strong Länder.'],
  Italy: [3, 4, 3, 4, 3, 3, 3, 2, 'Bicameralism and shifting coalitions make governments short-lived; the president is an active arbiter.'],
  Spain: [3, 3, 3, 4, 3, 3, 3, 3, 'Minority governments depend on regional parties; autonomous communities hold substantial powers.'],
  Switzerland: [4, 1, 2, 4, 4, 4, 4, 4, 'The collegial Federal Council cannot be removed mid-term, but referendums, cantons and consensus bind it.'],
  Netherlands: [4, 4, 1, 4, 3, 4, 4, 1, 'Coalition governments face a strong parliament; courts may not review laws against the constitution.'],
  Belgium: [4, 4, 3, 4, 3, 4, 3, 4, 'Linguistic power-sharing, communities and regions make the federal executive one veto player among many.'],
  Sweden: [3, 4, 2, 4, 3, 4, 3, 2, 'Minority governments, negative parliamentarism and strong agencies; courts review laws only sparingly.'],
  Norway: [3, 3, 3, 4, 3, 4, 4, 2, 'A fixed-term Storting that cannot be dissolved and a strong parliamentary control committee.'],
  Portugal: [3, 4, 3, 4, 4, 3, 3, 1, 'A semi-presidential balance: the president can veto and dissolve parliament, and the Constitutional Court is active.'],
  Poland: [3, 3, 2, 3, 4, 3, 3, 1, 'Presidential vetoes block the government; disputes over the Constitutional Tribunal remain unresolved.'],
  Greece: [1, 3, 2, 4, 3, 3, 2, 1, 'Bonus-seat majorities give single-party cabinets wide latitude in a centralised state.'],
  Turkey: [1, 1, 1, 1, 1, 1, 1, 1, 'The 2017 executive presidency concentrated power; courts and the central bank are subordinate.'],
  SaudiArabia: [0, 0, 0, 2, 0, 0, 0, 0, 'Absolute monarchy: the king and crown prince face no institutional checks; SAMA has technocratic autonomy.'],
  Egypt: [0, 0, 1, 1, 1, 0, 0, 0, 'Military-backed presidency with a pliant parliament; 2019 amendments extended presidential terms.'],
  Israel: [2, 3, 3, 4, 3, 2, 3, 1, 'No written constitution; the Supreme Court is the main check, contested by the 2023 judicial overhaul.'],
  Iran: [1, 0, 0, 1, 0, 1, 1, 0, 'The Supreme Leader holds unlimited tenure and controls the Guardian Council, judiciary and armed forces.'],
  UAE: [0, 0, 0, 2, 0, 0, 0, 2, 'A federation of hereditary emirates; the rulers\' council has no popular check.'],
  Qatar: [0, 0, 0, 2, 0, 0, 0, 0, 'The emir rules by decree; the elected Shura was abolished in 2024.'],
  Morocco: [1, 1, 1, 3, 0, 1, 1, 1, 'Elected governments run daily policy, but the king controls security, religion and strategy.'],
  India: [2, 3, 3, 3, 3, 2, 2, 3, 'An activist Supreme Court and strong states, but large majorities and Article 356 strengthen the centre.'],
  Indonesia: [2, 2, 2, 3, 3, 2, 2, 2, 'Two-term presidential limit and decentralisation; a grand coalition leaves little opposition in parliament.'],
  Thailand: [2, 3, 2, 3, 3, 1, 2, 1, 'Courts and the military-aligned establishment regularly remove prime ministers and dissolve parties.'],
  Philippines: [2, 2, 2, 3, 4, 2, 2, 2, 'A single six-year presidential term; patronage weakens congressional oversight.'],
  Pakistan: [1, 2, 2, 2, 2, 1, 1, 2, 'The military establishment is the decisive veto player; the 2025 amendments curbed the Supreme Court.'],
  Bangladesh: [2, 2, 2, 2, 3, 2, 2, 0, 'The July Charter adds term limits and an upper house, but the state is highly centralised.'],
  Japan: [3, 4, 1, 3, 3, 4, 3, 2, 'LDP factions and the upper house check PMs, who change often; courts rarely strike down laws.'],
  SouthKorea: [3, 3, 4, 4, 4, 3, 3, 1, 'A single five-year term, an assertive Constitutional Court and two presidents removed by impeachment.'],
  China: [0, 0, 0, 1, 0, 0, 0, 1, 'Party leadership is supreme; term limits were removed in 2018 and the PBoC answers to the State Council.'],
  Vietnam: [1, 1, 0, 1, 2, 0, 1, 1, 'Collective Party leadership and age rules limit individuals, but nothing limits the Party.'],
  Australia: [3, 4, 3, 4, 3, 4, 3, 4, 'A powerful elected Senate, strong states and frequent leadership spills.'],
  Singapore: [1, 2, 1, 4, 2, 1, 1, 0, 'A dominant-party city-state with a technocratic MAS; an elected president holds reserve powers.'],
  Nigeria: [2, 2, 2, 2, 4, 2, 2, 3, 'Two-term limits have held since 1999; federalism gives governors real power.'],
  SouthAfrica: [3, 3, 4, 4, 4, 3, 3, 2, 'A strong Constitutional Court and Chapter 9 institutions; coalition politics since 2024.'],
  Kenya: [2, 2, 4, 3, 4, 3, 2, 3, 'The Supreme Court annulled a presidential election in 2017; counties hold devolved budgets.'],
  Ethiopia: [1, 1, 1, 1, 2, 0, 0, 2, 'Ethnic federalism exists on paper, but the ruling party dominates and states of emergency are frequent.'],
  Ghana: [2, 1, 2, 3, 4, 3, 2, 1, 'Regular alternation and respected two-term limits, but an all-powerful presidency in a unitary state.'],
  Russia: [0, 0, 0, 2, 0, 0, 0, 1, 'The 2020 amendments reset Putin\'s terms; parliament and courts are subordinate.'],
  Ukraine: [2, 2, 2, 3, 2, 1, 2, 1, 'Martial law has suspended elections and concentrated power, though parliament and anti-corruption bodies still push back.'],
};

export const CHECKS_BY_KEY: Record<CountryKey, ChecksProfile> = Object.fromEntries(
  (Object.entries(ROWS) as [CountryKey, Row][]).map(([key, r]) => [
    key,
    {
      executiveVeto: r[0],
      removalDifficulty: r[1],
      judicialReview: r[2],
      centralBankIndependence: r[3],
      termLimitIntegrity: r[4],
      emergencyPowers: r[5],
      legislativeOversight: r[6],
      territorialDispersion: r[7],
      notes: r[8],
    },
  ]),
) as Record<CountryKey, ChecksProfile>;

/** 0 = fully constrained executive, 100 = unconstrained. */
export function powerConcentration(p: Pick<PoliticalProfile, 'key'> | ChecksProfile): number {
  const c = 'key' in p ? CHECKS_BY_KEY[p.key] : p;
  if (!c) return NaN;
  const mean = CHECK_AXES.reduce((s, a) => s + c[a], 0) / CHECK_AXES.length;
  return Math.round(100 - mean * 25);
}
