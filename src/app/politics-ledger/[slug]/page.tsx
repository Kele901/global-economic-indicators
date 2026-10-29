'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import ThemeToggle from '../../components/ThemeToggle';
import { fetchGlobalData } from '../../services/worldbank';
import {
  CURATED_LAST_UPDATED,
  GOVERNMENT_FORM_LABELS,
  INDEX_EDITIONS,
  POLITICS_BY_KEY,
  POLITICS_HISTORY_BY_KEY,
  POLITICS_PROFILES,
  RECENT_CHANGES,
  REGIME_COLORS,
  REGIME_LABELS,
  STRUCTURE_LABELS,
  getEffectiveLeader,
  governmentSeatShare,
  leaderAge,
  yearsInPower,
  type Election,
  type Leader,
  type RouteToPower,
} from '../../services/politicsCurated';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG, COUNTRY_SLUGS, getRegionFor } from '../../utils/countryMappings';
import { buildWgiSnapshot, compositeScore, formatMetric, metricScore, scoreColor, type IndexMetric } from '../../utils/politicsColors';
import StalenessBanner from '../../components/StalenessBanner';
import Breadcrumbs from '../../components/Breadcrumbs';
import ChartMeta from '../../components/ChartMeta';
import DataQualityBadge from '../../components/DataQualityBadge';
import LazyMount from '../../components/LazyMount';
import SocialShareMenu from '../../components/SocialShareMenu';
import { COUNTRY_FLAGS } from '../../components/CountryFlag';
import { slugify } from '../../lib/share';

const ParliamentHemicycle = dynamic(() => import('../../components/ParliamentHemicycle'), { ssr: false });
const GovernmentCompassChart = dynamic(() => import('../../components/GovernmentCompassChart'), { ssr: false });
const PoliticalHistoryTimeline = dynamic(() => import('../../components/PoliticalHistoryTimeline'), { ssr: false });
const PoliticalTraditionsGrid = dynamic(() => import('../../components/PoliticalTraditionsGrid'), { ssr: false });
const GovernanceRadar = dynamic(() => import('../../components/GovernanceRadar'), { ssr: false });
const DemocracyTrendChart = dynamic(() => import('../../components/DemocracyTrendChart'), { ssr: false });
const LeaderTimeline = dynamic(() => import('../../components/LeaderTimeline'), { ssr: false });
const VoteShareHistoryChart = dynamic(() => import('../../components/VoteShareHistoryChart'), { ssr: false });
const ChecksBalancesPanel = dynamic(() => import('../../components/ChecksBalancesPanel'), { ssr: false });
const WhatChangedLog = dynamic(() => import('../../components/WhatChangedLog'), { ssr: false });

const ROUTE_LABELS: Record<RouteToPower, string> = {
  election: 'won a popular election',
  'parliamentary-vote': 'elected by parliament',
  'party-selection': 'chosen by party',
  appointment: 'appointed',
  succession: 'constitutional succession',
  hereditary: 'hereditary',
  coup: 'coup or revolution',
};

type GlobalData = Awaited<ReturnType<typeof fetchGlobalData>>;

const INDEX_TILES: { id: IndexMetric; label: string; edition: string }[] = [
  { id: 'eiu', label: 'EIU Democracy Index', edition: INDEX_EDITIONS.eiu },
  { id: 'freedomHouse', label: 'Freedom House', edition: INDEX_EDITIONS.freedomHouse },
  { id: 'vdem', label: 'V-Dem Liberal Democracy', edition: INDEX_EDITIONS.vdem },
  { id: 'rsf', label: 'Press freedom rank', edition: INDEX_EDITIONS.rsf },
  { id: 'cpi', label: 'Corruption Perceptions', edition: INDEX_EDITIONS.cpi },
  { id: 'women', label: 'Women in parliament', edition: INDEX_EDITIONS.ipu },
];

function SectionHeader({ isDarkMode, eyebrow, title, subtitle }: { isDarkMode: boolean; eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-5" id={slugify(title)}>
      <div className={`text-[11px] uppercase tracking-[0.2em] mb-1.5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{eyebrow}</div>
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
        <SocialShareMenu title={title} isDarkMode={isDarkMode} />
      </div>
      {subtitle && <p className={`text-sm mt-1 max-w-3xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</p>}
    </div>
  );
}

function formatDate(iso: string, approximate?: boolean): string {
  if (!iso) return 'None scheduled';
  const d = new Date(iso);
  const s = d.toLocaleDateString('en-GB', approximate ? { month: 'long', year: 'numeric' } : { day: 'numeric', month: 'long', year: 'numeric' });
  return approximate ? `By ${s}` : s;
}

export default function PoliticalProfilePage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const params = useParams();
  const slug = (params?.slug as string) ?? '';
  const key = COUNTRY_SLUGS[slug.toLowerCase()];
  const profile = key ? POLITICS_BY_KEY[key] : undefined;

  const [data, setData] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    let cancelled = false;
    fetchGlobalData()
      .then((d) => { if (!cancelled) setData(d); })
      .catch((err) => console.warn('[politics-profile] fetchGlobalData failed', err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const wgi = useMemo(() => buildWgiSnapshot(data, POLITICS_PROFILES.map((p) => p.key)), [data]);

  const pageBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const heroBg = isDarkMode
    ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-indigo-900/30 border-gray-700'
    : 'bg-gradient-to-br from-indigo-50 via-white to-sky-50 border-indigo-100';
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = 'text-gray-500';
  const link = isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700';
  const chip = isDarkMode ? 'bg-gray-700/70 text-gray-200' : 'bg-gray-100 text-gray-700';

  if (!key || !profile) {
    return (
      <div className={`min-h-screen ${pageBg}`}>
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className={`text-2xl font-bold mb-3 ${textPrimary}`}>Political profile not found</h1>
          <p className={`mb-6 ${textSec}`}>We don&apos;t have a political profile for &ldquo;{slug}&rdquo;.</p>
          <Link href="/politics-ledger" className={`underline ${link}`}>Back to the Politics Ledger</Link>
        </div>
      </div>
    );
  }

  const name = COUNTRY_DISPLAY_NAMES[profile.key];
  const Flag = COUNTRY_FLAGS[profile.key];
  const leader = getEffectiveLeader(profile);
  const { headOfState, headOfGovernment } = profile.leadership;
  const share = governmentSeatShare(profile);
  const composite = compositeScore(profile);
  const region = getRegionFor(profile.key) ?? 'Other';
  const history = POLITICS_HISTORY_BY_KEY[profile.key];
  const hasChanges = RECENT_CHANGES.some((c) => c.key === profile.key);

  const ordered = [...POLITICS_PROFILES].sort((a, b) => COUNTRY_DISPLAY_NAMES[a.key].localeCompare(COUNTRY_DISPLAY_NAMES[b.key]));
  const idx = ordered.findIndex((p) => p.key === profile.key);
  const prev = ordered[(idx - 1 + ordered.length) % ordered.length];
  const next = ordered[(idx + 1) % ordered.length];

  const panel = `rounded-lg border p-4 sm:p-5 ${cardBg}`;

  const LeaderCard = ({ role, l, highlight }: { role: string; l: Leader; highlight: boolean }) => (
    <div className={`p-4 rounded-lg border ${cardBg} ${highlight ? (isDarkMode ? 'ring-1 ring-indigo-500/60' : 'ring-1 ring-indigo-300') : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>{role}</div>
        {highlight && <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-indigo-900/60 text-indigo-200' : 'bg-indigo-50 text-indigo-700'}`}>Holds executive power</span>}
      </div>
      <div className={`text-lg font-semibold mt-1 ${textPrimary}`}>{l.name}</div>
      <div className={`text-sm ${textSec}`}>{l.title}{l.party ? ` · ${l.party}` : ''}</div>
      <div className={`text-xs mt-1 ${textMuted}`}>
        Since {formatDate(l.since)} · {yearsInPower(l.since).toFixed(1)} years
      </div>
      {(l.born || l.route) && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {l.born && <span className={`text-[11px] px-1.5 py-0.5 rounded ${chip}`}>Age {leaderAge(l)} (born {l.born})</span>}
          {l.gender && <span className={`text-[11px] px-1.5 py-0.5 rounded ${chip}`}>{l.gender === 'female' ? 'Woman' : 'Man'}</span>}
          {l.route && <span className={`text-[11px] px-1.5 py-0.5 rounded ${chip}`}>Route to power: {ROUTE_LABELS[l.route]}</span>}
        </div>
      )}
    </div>
  );

  const ElectionCard = ({ label, e }: { label: string; e: Election }) => (
    <div className={`p-4 rounded-lg border ${cardBg}`}>
      <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>{label}</div>
      <div className={`text-base font-semibold mt-1 ${textPrimary}`}>{formatDate(e.date, e.approximate)}</div>
      <div className={`text-sm ${textSec}`}>{e.type}</div>
      {e.summary && <p className={`text-xs mt-2 ${textSec}`}>{e.summary}</p>}
    </div>
  );

  const facts: [string, string][] = [
    ['Official name', profile.officialName],
    ['Capital', profile.capital],
    ['Population', `${profile.populationM.toLocaleString(undefined, { maximumFractionDigits: 1 })} million`],
    ['Statehood', profile.statehood],
    ['System', GOVERNMENT_FORM_LABELS[profile.system.form]],
    ['Structure', STRUCTURE_LABELS[profile.system.structure]],
    ['Current constitution', String(profile.system.constitutionYear)],
    ['Legislature', profile.system.legislature.name],
    ['Lower / sole chamber', `${profile.system.legislature.lowerHouse} (${profile.system.legislature.seats.toLocaleString()} seats)`],
    ...(profile.system.legislature.upperHouse ? [['Upper chamber', profile.system.legislature.upperHouse] as [string, string]] : []),
    ['Electoral system', profile.system.electoralSystem],
    ['Term limits', profile.system.termLimits],
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${pageBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Breadcrumbs isDarkMode={isDarkMode} />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
              Politics Ledger · {region}
            </div>
            <h1 className={`flex items-center gap-3 text-3xl sm:text-4xl font-bold mb-2 ${textPrimary}`}>
              {Flag && <Flag className="w-10 h-7 rounded shadow-sm" />}
              {name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="px-2 py-0.5 rounded font-medium text-white" style={{ backgroundColor: REGIME_COLORS[profile.system.regime] }}>
                {REGIME_LABELS[profile.system.regime]}
              </span>
              <span className={`px-2 py-0.5 rounded ${chip}`}>{GOVERNMENT_FORM_LABELS[profile.system.form]}</span>
              <span className={`px-2 py-0.5 rounded ${chip}`}>{STRUCTURE_LABELS[profile.system.structure]}</span>
              {profile.philosophy.stateIdeology && <span className={`px-2 py-0.5 rounded ${chip}`}>State ideology: {profile.philosophy.stateIdeology}</span>}
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-2">
            <ThemeToggle isDarkMode={isDarkMode} className="self-end sm:self-auto" />
          </div>
        </div>

        <StalenessBanner lastUpdated={profile.verified?.leadership ?? profile.lastVerified} label={`${name} leadership`} isDarkMode={isDarkMode} thresholdMonths={6} />
        <StalenessBanner lastUpdated={profile.verified?.seats ?? profile.lastVerified} label={`${name} parliamentary seats`} isDarkMode={isDarkMode} />
        <StalenessBanner lastUpdated={profile.verified?.nextElection ?? profile.lastVerified} label={`${name} next election date`} isDarkMode={isDarkMode} thresholdMonths={6} />

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <ChartMeta sourceId="politics-profiles-curated" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="curated" isDarkMode={isDarkMode} />
          <span className={`text-[11px] ${textMuted}`}>|</span>
          <ChartMeta sourceId="politics-indices-curated" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="estimate" isDarkMode={isDarkMode} />
        </div>

        {/* At a glance */}
        <div className={`rounded-2xl border p-4 sm:p-6 mb-10 ${heroBg}`}>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: 'In charge', value: leader.name, sub: leader.title },
              { label: 'Time in power', value: `${yearsInPower(leader.since).toFixed(1)} yrs`, sub: `since ${leader.since.slice(0, 4)}` },
              { label: 'Government seats', value: `${(share * 100).toFixed(0)}%`, sub: share >= 0.5 ? 'majority' : 'minority' },
              { label: 'Next national vote', value: profile.leadership.nextElection.date ? profile.leadership.nextElection.date.slice(0, 7) : 'None', sub: profile.leadership.nextElection.type },
              { label: 'Governance score', value: `${composite.toFixed(0)}/100`, sub: 'composite of five indices' },
            ].map((k) => (
              <div key={k.label} className={`p-3 rounded-lg border ${cardBg}`}>
                <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>{k.label}</div>
                <div className={`text-lg font-semibold mt-0.5 truncate ${textPrimary}`} title={k.value}>{k.value}</div>
                <div className={`text-[11px] truncate ${textMuted}`} title={k.sub}>{k.sub}</div>
              </div>
            ))}
          </div>
          <p className={`text-sm mt-4 ${textSec}`}>{profile.history.summary}</p>
        </div>

        {/* Leadership */}
        <section className="mb-12">
          <SectionHeader isDarkMode={isDarkMode} eyebrow="Leadership" title={`Who Governs ${name}`} />
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <LeaderCard role="Head of state" l={headOfState} highlight={leader === headOfState} />
            {headOfGovernment && <LeaderCard role="Head of government" l={headOfGovernment} highlight={leader === headOfGovernment} />}
          </div>
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <div className={`p-4 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Ruling coalition</div>
              <div className={`text-sm mt-1 ${textPrimary}`}>{profile.leadership.rulingCoalition}</div>
            </div>
            <div className={`p-4 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Main opposition</div>
              <div className={`text-sm mt-1 ${textPrimary}`}>{profile.leadership.mainOpposition}</div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <ElectionCard label="Last national election" e={profile.leadership.lastElection} />
            <ElectionCard label="Next national election" e={profile.leadership.nextElection} />
          </div>
          {profile.leadership.note && <p className={`text-xs mt-3 ${textMuted}`}>{profile.leadership.note}</p>}
          {hasChanges && (
            <div className={`mt-4 ${panel}`}>
              <div className={`text-[11px] uppercase tracking-wider mb-3 ${textMuted}`}>Recent changes (last 12 months)</div>
              <WhatChangedLog isDarkMode={isDarkMode} countryKey={profile.key} />
            </div>
          )}
        </section>

        {/* Parliament */}
        <section className="mb-12">
          <SectionHeader
            isDarkMode={isDarkMode}
            eyebrow="Parliament"
            title={`${profile.system.legislature.lowerHouse}`}
            subtitle={`Seat distribution (${profile.system.legislature.seatsAsOf}), ordered from economic left to right.`}
          />
          <div className={panel}>
            <ParliamentHemicycle isDarkMode={isDarkMode} profile={profile} />
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className={`w-full text-sm rounded-lg border ${cardBg}`}>
              <thead>
                <tr className={`text-left text-[11px] uppercase tracking-wider ${textMuted}`}>
                  <th className="py-2 px-3">Party</th>
                  <th className="py-2 px-3">Ideology</th>
                  <th className="py-2 px-3 text-right">Seats</th>
                  <th className="py-2 px-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {[...profile.parties].sort((a, b) => b.seats - a.seats).map((pt) => (
                  <tr key={pt.name} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <td className={`py-2 px-3 ${textPrimary}`}>
                      <span className="inline-block w-2.5 h-2.5 rounded-sm mr-2 align-middle" style={{ backgroundColor: pt.color }} />
                      {pt.name} <span className={textMuted}>({pt.abbr})</span>
                    </td>
                    <td className={`py-2 px-3 text-xs ${textSec}`}>{pt.ideology.join(', ')}</td>
                    <td className={`py-2 px-3 text-right tabular-nums ${textPrimary}`}>{pt.seats}</td>
                    <td className={`py-2 px-3 text-xs capitalize ${textSec}`}>{pt.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Party compass + system facts */}
        <section className="mb-12 grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <SectionHeader isDarkMode={isDarkMode} eyebrow="Ideology" title="Party Landscape" subtitle="Each party placed on economic and social axes, sized by seats." />
            <div className={panel}>
              <GovernmentCompassChart isDarkMode={isDarkMode} profile={profile} height={400} />
            </div>
          </div>
          <div className="lg:col-span-2">
            <SectionHeader isDarkMode={isDarkMode} eyebrow="Institutions" title="The System" />
            <div className={panel}>
              <dl className="space-y-2.5">
                {facts.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-3 gap-2 text-sm">
                    <dt className={`text-xs uppercase tracking-wide pt-0.5 ${textMuted}`}>{k}</dt>
                    <dd className={`col-span-2 ${textPrimary}`}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <LazyMount isDarkMode={isDarkMode}>
          {/* History */}
          <section className="mb-12">
            <SectionHeader isDarkMode={isDarkMode} eyebrow="History" title="How It Got Here" subtitle="The political eras and turning points that produced today's institutions." />
            <div className={panel}>
              <PoliticalHistoryTimeline isDarkMode={isDarkMode} profile={profile} />
            </div>
          </section>

          {history && (
            <section className="mb-12">
              <SectionHeader
                isDarkMode={isDarkMode}
                eyebrow="Leaders"
                title="Leaders Since 1945"
                subtitle="Every holder of executive office since the Second World War (or independence), coloured by party, with how each came to power."
              />
              <div className={panel}>
                <LeaderTimeline isDarkMode={isDarkMode} profile={profile} history={history} />
              </div>
            </section>
          )}

          {history && (
            <section className="mb-12">
              <SectionHeader
                isDarkMode={isDarkMode}
                eyebrow="Elections"
                title="Votes Over Time"
                subtitle="Party vote shares across the last six national elections."
              />
              <div className={panel}>
                <VoteShareHistoryChart isDarkMode={isDarkMode} history={history} />
              </div>
            </section>
          )}

          {/* Culture */}
          <section className="mb-12">
            <SectionHeader isDarkMode={isDarkMode} eyebrow="Political culture" title="How Politics Feels" />
            <div className={panel}>
              <p className={`text-sm leading-relaxed mb-4 ${textSec}`}>{profile.culture.summary}</p>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <div className={`text-[11px] uppercase tracking-wider mb-2 ${textMuted}`}>Defining traits</div>
                  <ul className="space-y-1.5">
                    {profile.culture.traits.map((t) => (
                      <li key={t} className={`text-sm flex gap-2 ${textPrimary}`}><span className="text-indigo-500">•</span>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className={`text-[11px] uppercase tracking-wider mb-2 ${textMuted}`}>Fault lines</div>
                  <ul className="space-y-1.5">
                    {profile.culture.cleavages.map((t) => (
                      <li key={t} className={`text-sm flex gap-2 ${textPrimary}`}><span className="text-amber-500">{'\u25C6'}</span>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className={`text-[11px] uppercase tracking-wider mb-1 ${textMuted}`}>Civil society</div>
                  <p className={`text-sm ${textSec}`}>{profile.culture.civilSociety}</p>
                </div>
                <div>
                  <div className={`text-[11px] uppercase tracking-wider mb-1 ${textMuted}`}>Media</div>
                  <p className={`text-sm ${textSec}`}>{profile.culture.media}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Philosophy */}
          <section className="mb-12">
            <SectionHeader isDarkMode={isDarkMode} eyebrow="Philosophy" title="The Ideas Underneath" />
            <div className={`${panel} mb-4`}>
              <p className={`text-sm leading-relaxed mb-4 ${textSec}`}>{profile.philosophy.summary}</p>
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <div className={`text-[11px] uppercase tracking-wider mb-2 ${textMuted}`}>Founding ideas</div>
                  <ul className="space-y-1.5">
                    {profile.philosophy.foundingIdeas.map((t) => (
                      <li key={t} className={`text-sm ${textPrimary}`}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className={`text-[11px] uppercase tracking-wider mb-2 ${textMuted}`}>Constitutional principles</div>
                  <ul className="space-y-1.5">
                    {profile.philosophy.principles.map((t) => (
                      <li key={t} className={`text-sm ${textPrimary}`}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className={`text-[11px] uppercase tracking-wider mb-2 ${textMuted}`}>Core values</div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.philosophy.coreValues.map((t) => (
                      <span key={t} className={`text-xs px-2 py-0.5 rounded ${chip}`}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              {profile.philosophy.thinkers.length > 0 && (
                <div className="mt-5">
                  <div className={`text-[11px] uppercase tracking-wider mb-2 ${textMuted}`}>Thinkers and texts</div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {profile.philosophy.thinkers.map((t) => (
                      <div key={t.name} className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                        <div className={`text-sm font-medium ${textPrimary}`}>{t.name}</div>
                        <div className={`text-xs ${textSec}`}>{t.idea}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className={`text-[11px] uppercase tracking-wider mb-2 ${textMuted}`}>Traditions {name} draws on</div>
            <PoliticalTraditionsGrid isDarkMode={isDarkMode} only={profile.traditions} />
          </section>

          {/* Foreign policy */}
          <section className="mb-12">
            <SectionHeader isDarkMode={isDarkMode} eyebrow="Foreign policy" title="Place in the World" />
            <div className={panel}>
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <div className={`text-[11px] uppercase tracking-wider mb-1 ${textMuted}`}>Alignment</div>
                  <p className={`text-sm font-medium ${textPrimary}`}>{profile.foreignPolicy.alignment}</p>
                </div>
                <div className="md:col-span-2">
                  <div className={`text-[11px] uppercase tracking-wider mb-1 ${textMuted}`}>Doctrine</div>
                  <p className={`text-sm ${textSec}`}>{profile.foreignPolicy.doctrine}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {profile.foreignPolicy.blocs.map((b) => (
                  <span key={b} className={`text-xs px-2 py-0.5 rounded ${chip}`}>{b}</span>
                ))}
              </div>
            </div>
          </section>

          {/* Governance */}
          <section className="mb-12">
            <SectionHeader isDarkMode={isDarkMode} eyebrow="Governance" title="How Free, How Clean" subtitle={`${name} against the ${region} average and the 47-country average.`} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              {INDEX_TILES.map((t) => {
                const s = metricScore(profile, t.id);
                return (
                  <div key={t.id} className={`p-3 rounded-lg border ${cardBg}`} title={t.edition}>
                    <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>{t.label}</div>
                    <div className="text-lg font-semibold tabular-nums mt-0.5" style={{ color: scoreColor(s) }}>{formatMetric(profile, t.id)}</div>
                    <div className={`h-1.5 mt-1.5 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className="h-1.5 rounded" style={{ width: `${s * 100}%`, backgroundColor: scoreColor(s) }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <div className={panel}>
                <GovernanceRadar isDarkMode={isDarkMode} profile={profile} wgi={loading ? undefined : wgi} />
                {wgi[profile.key] && (
                  <div className="mt-2">
                    <ChartMeta sourceId="wb-wgi-suite" isDarkMode={isDarkMode} />
                  </div>
                )}
              </div>
              <div className={panel}>
                <DemocracyTrendChart isDarkMode={isDarkMode} focusKey={profile.key} />
              </div>
            </div>
            <div className={`mt-4 ${panel}`}>
              <div className={`text-sm font-semibold mb-3 ${textPrimary}`}>Checks and balances</div>
              <ChecksBalancesPanel isDarkMode={isDarkMode} profile={profile} />
            </div>
          </section>
        </LazyMount>

        {/* Sources */}
        <section className="mb-10">
          <h3 className={`text-sm font-semibold mb-2 ${textPrimary}`}>Sources</h3>
          <ul className={`text-xs space-y-1 list-disc pl-5 ${textSec}`}>
            {profile.sources.map((s) => <li key={s}>{s}</li>)}
            <li>{Object.values(INDEX_EDITIONS).join('; ')}</li>
          </ul>
          <p className={`text-xs mt-2 ${textMuted}`}>Last verified {profile.lastVerified}. Party placements are editorial estimates.</p>
        </section>

        <nav className={`flex flex-wrap items-center justify-between gap-3 pt-6 border-t text-sm ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <Link href={`/politics-ledger/${COUNTRY_KEY_TO_SLUG[prev.key]}`} className={link}>{'\u2190'} {COUNTRY_DISPLAY_NAMES[prev.key]}</Link>
          <div className="flex flex-wrap gap-4">
            <Link href="/politics-ledger" className={link}>All 47 countries</Link>
            <Link href={`/country/${COUNTRY_KEY_TO_SLUG[profile.key]}`} className={link}>{name} economy {'\u2192'}</Link>
          </div>
          <Link href={`/politics-ledger/${COUNTRY_KEY_TO_SLUG[next.key]}`} className={link}>{COUNTRY_DISPLAY_NAMES[next.key]} {'\u2192'}</Link>
        </nav>
        <p className={`text-[11px] mt-4 ${textMuted}`}>Data as of {CURATED_LAST_UPDATED}.</p>
      </div>
    </div>
  );
}
