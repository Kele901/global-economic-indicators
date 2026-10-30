import Link from 'next/link';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG, type CountryKey } from '../../utils/countryMappings';
import {
  POLITICS_BY_KEY,
  REGIME_LABELS,
  GOVERNMENT_FORM_LABELS,
  CURATED_LAST_UPDATED,
  getEffectiveLeader,
  governmentSeatShare,
  yearsInPower,
} from '../../services/politicsCurated';
import { HDR, HDR_DATA_YEAR, HCI_SNAPSHOT, getIncomeGroup } from '../../services/developmentCurated';

// Server-rendered from curated data so the profile has readable content in its
// first HTML; the live World Bank charts below it load in the browser.

const fmtDate = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

function article(word: string) {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function tenure(since: string): string {
  const y = yearsInPower(since);
  if (y < 1) return 'less than a year';
  const n = Math.floor(y);
  return `${n} year${n === 1 ? '' : 's'}`;
}

export default function CountryAtAGlance({ countryKey }: { countryKey: CountryKey }) {
  const name = COUNTRY_DISPLAY_NAMES[countryKey];
  const slug = COUNTRY_KEY_TO_SLUG[countryKey];
  const p = POLITICS_BY_KEY[countryKey];
  const r = HDR[countryKey];
  const group = getIncomeGroup(countryKey);
  const hci = HCI_SNAPSHOT[countryKey];

  const sentences: string[] = [];
  if (p) {
    const form = GOVERNMENT_FORM_LABELS[p.system.form].toLowerCase();
    const regime = REGIME_LABELS[p.system.regime].toLowerCase();
    const leader = getEffectiveLeader(p);
    sentences.push(
      `${name} is ${article(form)} ${form} that V-Dem classifies as ${article(regime)} ${regime}, with about ${p.populationM >= 10 ? Math.round(p.populationM) : p.populationM.toFixed(1)} million people and its capital in ${p.capital}.`,
    );
    sentences.push(
      `Executive power rests with ${leader.name} (${leader.title}${leader.party ? `, ${leader.party}` : ''}), in office for ${tenure(leader.since)}.`,
    );
    const share = governmentSeatShare(p);
    if (share > 0) {
      sentences.push(
        `The governing side holds ${Math.round(share * 100)}% of the ${p.system.legislature.seats} seats in the ${p.system.legislature.lowerHouse}${share < 0.5 ? ', short of a majority' : ''}.`,
      );
    }
  }
  if (r?.hdi != null) {
    const parts = [`On the UN Human Development Index ${name} scores ${r.hdi.toFixed(3)}${r.hdiRank ? `, ranked ${ordinal(r.hdiRank)} of 193 countries` : ''} (${HDR_DATA_YEAR} data)`];
    if (r.lifeExpectancy != null) parts.push(`life expectancy is ${r.lifeExpectancy.toFixed(1)} years`);
    if (r.gniPerCapita != null) parts.push(`income per person is about $${Math.round(r.gniPerCapita).toLocaleString('en-US')} (2021 PPP)`);
    sentences.push(`${parts.join('; ')}.`);
  }
  if (group) {
    sentences.push(`The World Bank classifies it as ${article(group)} ${group.toLowerCase()} economy.`);
  }

  const facts: { label: string; value: string }[] = [];
  if (p) {
    facts.push({ label: 'Head of state', value: `${p.leadership.headOfState.name}, ${p.leadership.headOfState.title}` });
    if (p.leadership.headOfGovernment) {
      facts.push({ label: 'Head of government', value: `${p.leadership.headOfGovernment.name}, ${p.leadership.headOfGovernment.title}` });
    }
    facts.push({ label: 'System', value: `${GOVERNMENT_FORM_LABELS[p.system.form]} \u00b7 ${REGIME_LABELS[p.system.regime]}` });
    const next = p.leadership.nextElection;
    facts.push({
      label: 'Next national vote',
      value: next.date ? `${next.type}, ${next.approximate ? 'by ' : ''}${fmtDate(next.date)}` : 'None scheduled',
    });
  }
  if (r?.hdi != null) facts.push({ label: `HDI (${HDR_DATA_YEAR})`, value: `${r.hdi.toFixed(3)}${r.hdiRank ? ` \u00b7 rank ${r.hdiRank}` : ''}` });
  if (group) facts.push({ label: 'Income group', value: group });
  if (hci) facts.push({ label: `Human Capital Index (${hci.year})`, value: hci.value.toFixed(2) });

  if (!sentences.length && !facts.length) return null;

  return (
    <section
      aria-labelledby="at-a-glance"
      className="rounded-xl border p-4 sm:p-6 mb-8 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="flex items-baseline justify-between gap-2 flex-wrap mb-3">
        <h2 id="at-a-glance" className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {name} at a glance
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">Curated data, checked {fmtDate(CURATED_LAST_UPDATED)}</span>
      </div>
      {sentences.length > 0 && (
        <p className="text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-4">{sentences.join(' ')}</p>
      )}
      {facts.length > 0 && (
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{f.label}</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {p && (
          <Link href={`/politics-ledger/${slug}`} className="text-blue-600 dark:text-blue-400 hover:underline">
            Full political profile &rarr;
          </Link>
        )}
        {r && (
          <Link href={`/development/${slug}`} className="text-blue-600 dark:text-blue-400 hover:underline">
            Full development profile &rarr;
          </Link>
        )}
        <Link href="/methodology" className="text-blue-600 dark:text-blue-400 hover:underline">
          How these figures are compiled
        </Link>
      </div>
    </section>
  );
}
