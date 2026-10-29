/**
 * Cross-checks curated heads of state and government against Wikidata
 * (P35 head of state, P6 head of government) and flags stale `verified` dates.
 *
 *   npm run politics:verify            # writes reports/politics-verify.md
 *   npm run politics:verify -- --max-age=60
 *
 * Exits 1 when any leader disagrees with Wikidata or any verified date is too old,
 * so it can gate a scheduled job. Wikidata is community edited and can lag or lead
 * official changes; treat a mismatch as a prompt to check, not as proof of error.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { POLITICS_PROFILES } from '../src/app/services/politicsCurated';
import type { Leader, PoliticalProfile } from '../src/app/services/politicsCurated/types';
import { COUNTRY_DISPLAY_NAMES, type CountryKey } from '../src/app/utils/countryMappings';

const ENDPOINT = 'https://query.wikidata.org/sparql';
const USER_AGENT = 'GlobalEconomicIndicators-PoliticsVerify/1.0 (https://github.com/Kele901/global-economic-indicators)';
const REPORT_PATH = join(process.cwd(), 'reports', 'politics-verify.md');

const QIDS: Record<string, string> = {
  USA: 'Q30', Canada: 'Q16', Mexico: 'Q96',
  Brazil: 'Q155', Chile: 'Q298', Argentina: 'Q414', Colombia: 'Q739',
  UK: 'Q145', France: 'Q142', Germany: 'Q183', Italy: 'Q38', Spain: 'Q29',
  Switzerland: 'Q39', Netherlands: 'Q55', Belgium: 'Q31',
  Sweden: 'Q34', Norway: 'Q20', Portugal: 'Q45', Poland: 'Q36', Greece: 'Q41',
  Russia: 'Q159', Ukraine: 'Q212',
  Turkey: 'Q43', SaudiArabia: 'Q851', Egypt: 'Q79', Israel: 'Q801', Iran: 'Q794',
  UAE: 'Q878', Qatar: 'Q846', Morocco: 'Q1028',
  Nigeria: 'Q1033', SouthAfrica: 'Q258', Kenya: 'Q114', Ethiopia: 'Q115', Ghana: 'Q117',
  Japan: 'Q17', SouthKorea: 'Q884', China: 'Q148', Vietnam: 'Q881', Australia: 'Q408', Singapore: 'Q334',
  India: 'Q668', Indonesia: 'Q252', Thailand: 'Q869', Philippines: 'Q928', Pakistan: 'Q843', Bangladesh: 'Q902',
};

const TITLES = /\b(king|queen|emperor|emir|sheikh|sultan|crown prince|prince|president|prime minister|chancellor|general|dr|sir|his majesty|her majesty|bin|al)\b/g;

// Curated differences already checked by hand, where Wikidata's truthy value lags reality.
const ACCEPTED: Record<string, string> = {
  'SaudiArabia:hog': 'Mohammed bin Salman has been Prime Minister since September 2022; Wikidata P6 still lists King Salman.',
};

export function normaliseName(name: string): string[] {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+of\s+(the\s+)?[a-z ]+$/, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(TITLES, ' ')
    .replace(/\b(jr|sr)\b/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 || /^[ivx]$/.test(t));
}

/** A name plus any parenthetical alias, e.g. "Maha Vajiralongkorn (Rama X)". */
function variants(name: string): string[][] {
  const alias = name.match(/\((.*?)\)/)?.[1];
  return [name.replace(/\(.*?\)/g, ' '), ...(alias ? [alias] : [])].map(normaliseName).filter((t) => t.length);
}

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

const tokenEq = (x: string, y: string) => x === y || (Math.min(x.length, y.length) >= 5 && editDistance(x, y) <= 2);

/** Same person if every token of the shorter name appears in the longer, or the surnames agree (allowing transliteration slips). */
export function sameLeader(a: string, b: string): boolean {
  for (const ta of variants(a)) {
    for (const tb of variants(b)) {
      const [short, long] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
      if (short.every((t) => long.some((u) => tokenEq(t, u)))) return true;
      if (ta.length > 1 && tb.length > 1 && tokenEq(ta[ta.length - 1], tb[tb.length - 1])) return true;
    }
  }
  return false;
}

type Office = 'hos' | 'hog';
type WikidataLeaders = Record<string, Record<Office, string[]>>;

async function fetchWikidata(): Promise<WikidataLeaders> {
  const values = Object.values(QIDS).map((q) => `wd:${q}`).join(' ');
  const query = `
SELECT ?country ?office ?personLabel WHERE {
  VALUES ?country { ${values} }
  { ?country wdt:P35 ?person . BIND("hos" AS ?office) }
  UNION
  { ?country wdt:P6 ?person . BIND("hog" AS ?office) }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,mul,es,fr,pt,de". }
}`;
  const res = await fetch(`${ENDPOINT}?query=${encodeURIComponent(query)}`, {
    headers: { Accept: 'application/sparql-results+json', 'User-Agent': USER_AGENT },
  });
  if (!res.ok) throw new Error(`Wikidata query failed: HTTP ${res.status}`);
  const json = (await res.json()) as {
    results: { bindings: { country: { value: string }; office: { value: Office }; personLabel: { value: string } }[] };
  };
  const out: WikidataLeaders = {};
  for (const b of json.results.bindings) {
    const qid = b.country.value.split('/').pop()!;
    out[qid] ??= { hos: [], hog: [] };
    if (!out[qid][b.office.value].includes(b.personLabel.value)) out[qid][b.office.value].push(b.personLabel.value);
  }
  return out;
}

interface Row {
  key: CountryKey;
  office: Office;
  curated: string;
  wikidata: string[];
  status: 'match' | 'mismatch' | 'accepted' | 'skipped' | 'missing';
  note?: string;
}

const COLLECTIVE = /collective|federal council/i;

function compare(p: PoliticalProfile, wd: Record<Office, string[]> | undefined): Row[] {
  const { headOfState, headOfGovernment } = p.leadership;
  const rows: Row[] = [];
  // Presidential systems have no separate head of government in the curated data,
  // and Wikidata's P6 for them is often stale, so only P35 is checked there.
  const offices: [Office, Leader | undefined][] = [['hos', headOfState]];
  if (headOfGovernment) offices.push(['hog', headOfGovernment]);
  for (const [office, leader] of offices) {
    const wikidata = wd?.[office] ?? [];
    const accepted = ACCEPTED[`${p.key}:${office}`];
    if (!leader || COLLECTIVE.test(leader.name) || wikidata.some((w) => COLLECTIVE.test(w))) {
      rows.push({ key: p.key, office, curated: leader?.name ?? '-', wikidata, status: 'skipped' });
    } else if (!wikidata.length) {
      rows.push({ key: p.key, office, curated: leader.name, wikidata, status: 'missing' });
    } else if (wikidata.some((w) => sameLeader(leader.name, w))) {
      rows.push({ key: p.key, office, curated: leader.name, wikidata, status: 'match' });
    } else {
      rows.push({ key: p.key, office, curated: leader.name, wikidata, status: accepted ? 'accepted' : 'mismatch', note: accepted });
    }
  }
  return rows;
}

interface StaleRow {
  key: CountryKey;
  field: string;
  date: string;
  ageDays: number;
}

function staleDates(profiles: PoliticalProfile[], maxAgeDays: number, today: Date): StaleRow[] {
  const out: StaleRow[] = [];
  for (const p of profiles) {
    for (const [field, date] of Object.entries(p.verified ?? {})) {
      const ageDays = Math.floor((today.getTime() - new Date(`${date}T00:00:00Z`).getTime()) / 86_400_000);
      if (ageDays > maxAgeDays) out.push({ key: p.key, field, date, ageDays });
    }
  }
  return out;
}

function renderReport(rows: Row[], stale: StaleRow[], maxAgeDays: number, error?: string): string {
  const name = (k: CountryKey) => COUNTRY_DISPLAY_NAMES[k] ?? k;
  const label = (o: Office) => (o === 'hos' ? 'Head of state' : 'Head of government');
  const mismatches = rows.filter((r) => r.status === 'mismatch');
  const missing = rows.filter((r) => r.status === 'missing');
  const lines = [
    '# Politics Ledger verification report',
    '',
    `Generated ${new Date().toISOString()}. Compared against Wikidata P35 and P6; verified dates older than ${maxAgeDays} days are flagged.`,
    '',
    `- Leaders checked: ${rows.filter((r) => r.status !== 'skipped').length}`,
    `- Mismatches: ${mismatches.length}`,
    `- No Wikidata value: ${missing.length}`,
    `- Stale verified dates: ${stale.length}`,
    '',
  ];
  if (error) lines.push('## Wikidata error', '', error, '');
  if (mismatches.length) {
    lines.push('## Mismatches', '', '| Country | Office | Curated | Wikidata |', '| --- | --- | --- | --- |');
    for (const r of mismatches) lines.push(`| ${name(r.key)} | ${label(r.office)} | ${r.curated} | ${r.wikidata.join('; ')} |`);
    lines.push('');
  }
  const accepted = rows.filter((r) => r.status === 'accepted');
  if (accepted.length) {
    lines.push('## Accepted differences', '', '| Country | Office | Curated | Wikidata | Reason |', '| --- | --- | --- | --- | --- |');
    for (const r of accepted) lines.push(`| ${name(r.key)} | ${label(r.office)} | ${r.curated} | ${r.wikidata.join('; ')} | ${r.note} |`);
    lines.push('');
  }
  if (missing.length) {
    lines.push('## No Wikidata value', '', '| Country | Office | Curated |', '| --- | --- | --- |');
    for (const r of missing) lines.push(`| ${name(r.key)} | ${label(r.office)} | ${r.curated} |`);
    lines.push('');
  }
  if (stale.length) {
    lines.push('## Stale verified dates', '', '| Country | Field | Verified | Age (days) |', '| --- | --- | --- | --- |');
    for (const s of stale) lines.push(`| ${name(s.key)} | ${s.field} | ${s.date} | ${s.ageDays} |`);
    lines.push('');
  }
  if (!error && !mismatches.length && !stale.length) lines.push('All curated leaders agree with Wikidata and every verified date is current.', '');
  return lines.join('\n');
}

async function main() {
  const maxArg = process.argv.find((a) => a.startsWith('--max-age='));
  const maxAgeDays = maxArg ? Number(maxArg.split('=')[1]) : 45;
  const stale = staleDates(POLITICS_PROFILES, maxAgeDays, new Date());

  let rows: Row[] = [];
  let error: string | undefined;
  try {
    const wd = await fetchWikidata();
    rows = POLITICS_PROFILES.flatMap((p) => compare(p, wd[QIDS[p.key]]));
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const report = renderReport(rows, stale, maxAgeDays, error);
  mkdirSync(dirname(REPORT_PATH), { recursive: true });
  writeFileSync(REPORT_PATH, report, 'utf8');

  const mismatches = rows.filter((r) => r.status === 'mismatch').length;
  console.log(`Wrote ${REPORT_PATH}`);
  console.log(`Mismatches: ${mismatches}, stale dates: ${stale.length}${error ? `, Wikidata error: ${error}` : ''}`);
  if (error || mismatches || stale.length) process.exit(1);
}

if (process.argv[1] && /politics-verify/.test(process.argv[1])) {
  main();
}
