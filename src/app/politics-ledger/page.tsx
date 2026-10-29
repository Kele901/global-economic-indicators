'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ThemeToggle from '../components/ThemeToggle';
import { fetchGlobalData } from '../services/worldbank';
import {
  CHECKS_BY_KEY,
  CHECK_AXES,
  CURATED_LAST_UPDATED,
  INDEX_EDITIONS,
  POLITICS_PROFILES,
  REGIME_COLORS,
  REGIME_LABELS,
  getEffectiveLeader,
  leaderAge,
  powerConcentration,
  turnoverSince1945,
  getRecentElections,
  getRegimeShares,
  getUpcomingElections,
  governmentSeatShare,
  yearsInPower,
} from '../services/politicsCurated';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG } from '../utils/countryMappings';
import { buildWgiSnapshot, compositeScore } from '../utils/politicsColors';
import StalenessBanner from '../components/StalenessBanner';
import DataDownloadButton from '../components/DataDownloadButton';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedPages from '../components/RelatedPages';
import ChartMeta from '../components/ChartMeta';
import DataQualityBadge from '../components/DataQualityBadge';
import LazyMount from '../components/LazyMount';
import GuidedTour, { type TourStep } from '../components/GuidedTour';
import SocialShareMenu from '../components/SocialShareMenu';
import { COUNTRY_FLAGS } from '../components/CountryFlag';
import { slugify } from '../lib/share';

const POLITICS_TOUR_STEPS: TourStep[] = [
  { chapter: 'Chapter 1', title: 'The world\'s regimes', body: 'Map every country by regime type, system of government or any governance index. Click a country for its full profile.' },
  { chapter: 'Chapter 2', title: 'Who rules', body: 'Every head of state and government, their party, how long they have held power and how secure their majority is.' },
  { chapter: 'Chapter 3', title: 'How they govern', body: 'Presidential, parliamentary, monarchical or party-state; federal or unitary; how votes become seats.' },
  { chapter: 'Chapter 4', title: 'The ideological map', body: 'Where each government sits on economic and social axes, weighted by the seats of its parties.' },
  { chapter: 'Chapter 5', title: 'Election calendar', body: 'Every scheduled national vote, and the results of the last 18 months.' },
  { chapter: 'Chapter 6', title: 'Governance scorecard', body: 'EIU, Freedom House, V-Dem, RSF and CPI side by side, plus live World Bank governance indicators.' },
  { chapter: 'Chapter 7', title: 'Politics and prosperity', body: 'Do freer, cleaner or more constrained governments deliver richer, healthier, more equal societies? Plot any governance measure against live World Bank outcomes.' },
  { chapter: 'Chapter 8', title: 'Who leads', body: 'The age, gender, route to power and time in office of the 47 people who hold executive power.' },
  { chapter: 'Chapter 9', title: 'Checks and balances', body: 'Eight constraints on executive power, from courts and central banks to term limits and federalism, rolled into a power-concentration score.' },
  { chapter: 'Chapter 10', title: 'Democracy\'s long arc', body: 'Fifty years of V-Dem liberal-democracy readings: the third wave, and the recent backsliding.' },
  { chapter: 'Chapter 11', title: 'Ideas that shape states', body: 'Thirteen political traditions, from Westminster to Confucian statecraft, and the countries they shaped.' },
  { chapter: 'Chapter 12', title: 'Compare', body: 'Put up to four political systems side by side.' },
];

const RegimeWorldMap = dynamic(() => import('../components/RegimeWorldMap'), { ssr: false });
const LeadershipTable = dynamic(() => import('../components/LeadershipTable'), { ssr: false });
const GovernmentSystemsGrid = dynamic(() => import('../components/GovernmentSystemsGrid'), { ssr: false });
const GovernmentCompassChart = dynamic(() => import('../components/GovernmentCompassChart'), { ssr: false });
const ElectionCalendar = dynamic(() => import('../components/ElectionCalendar'), { ssr: false });
const GovernanceScorecard = dynamic(() => import('../components/GovernanceScorecard'), { ssr: false });
const DemocracyTrendChart = dynamic(() => import('../components/DemocracyTrendChart'), { ssr: false });
const PoliticalTraditionsGrid = dynamic(() => import('../components/PoliticalTraditionsGrid'), { ssr: false });
const PoliticalCompare = dynamic(() => import('../components/PoliticalCompare'), { ssr: false });
const WhatChangedLog = dynamic(() => import('../components/WhatChangedLog'), { ssr: false });
const PoliticsProsperityChart = dynamic(() => import('../components/PoliticsProsperityChart'), { ssr: false });
const LeaderDemographics = dynamic(() => import('../components/LeaderDemographics'), { ssr: false });
const ChecksBalancesPanel = dynamic(() => import('../components/ChecksBalancesPanel'), { ssr: false });

type GlobalData = Awaited<ReturnType<typeof fetchGlobalData>>;

interface ChapterHeaderProps {
  isDarkMode: boolean;
  chapter: string;
  title: string;
  subtitle: string;
}

function ChapterHeader({ isDarkMode, chapter, title, subtitle }: ChapterHeaderProps) {
  return (
    <div className="mb-6" id={slugify(title)}>
      <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{chapter}</div>
      <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
        <h2 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <SocialShareMenu title={title} isDarkMode={isDarkMode} />
        </div>
      </div>
      <p className={`text-sm sm:text-base max-w-3xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</p>
    </div>
  );
}

export default function PoliticsLedgerPage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
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
    (async () => {
      try {
        const wb = await fetchGlobalData().catch((err) => {
          console.warn('[politics-ledger] fetchGlobalData failed', err);
          return null;
        });
        if (!cancelled) setData(wb);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const wgi = useMemo(() => buildWgiSnapshot(data, POLITICS_PROFILES.map((p) => p.key)), [data]);

  const stats = useMemo(() => {
    const shares = getRegimeShares();
    const democPop = shares.filter((s) => s.regime === 'liberal-democracy' || s.regime === 'electoral-democracy').reduce((s, x) => s + x.sharePct, 0);
    const leaders = POLITICS_PROFILES.map((p) => ({ p, l: getEffectiveLeader(p) }));
    const longest = leaders.reduce((a, b) => (yearsInPower(b.l.since) > yearsInPower(a.l.since) ? b : a));
    const yearAgo = new Date(CURATED_LAST_UPDATED);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    const newLeaders = leaders.filter((x) => new Date(x.l.since) >= yearAgo).length;
    const nextYear = new Date(CURATED_LAST_UPDATED);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const upcoming12 = getUpcomingElections().filter((e) => new Date(e.date) <= nextYear);
    const minority = POLITICS_PROFILES.filter((p) => p.system.regime !== 'closed-autocracy' && governmentSeatShare(p) < 0.5).length;
    const avgComposite = POLITICS_PROFILES.reduce((s, p) => s + compositeScore(p), 0) / POLITICS_PROFILES.length;
    return { shares, democPop, longest, newLeaders, upcoming12, minority, avgComposite, recent: getRecentElections(CURATED_LAST_UPDATED, 12) };
  }, []);

  const pageBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const heroBg = isDarkMode
    ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-indigo-900/30 border-gray-700'
    : 'bg-gradient-to-br from-indigo-50 via-white to-sky-50 border-indigo-100';
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = 'text-gray-500';
  const link = isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700';

  const kpis = [
    { label: 'Living in democracies', value: `${stats.democPop.toFixed(0)}%`, sub: 'of the 47 countries\' population (V-Dem regime types)' },
    { label: 'New leaders', value: String(stats.newLeaders), sub: 'took power in the last 12 months' },
    { label: 'Elections ahead', value: String(stats.upcoming12.length), sub: 'national votes in the next 12 months' },
    { label: 'Minority governments', value: String(stats.minority), sub: 'governing without a lower-house majority' },
    {
      label: 'Longest in power',
      value: `${yearsInPower(stats.longest.l.since).toFixed(0)} yrs`,
      sub: `${stats.longest.l.name} (${COUNTRY_DISPLAY_NAMES[stats.longest.p.key]})`,
    },
    { label: 'Average governance score', value: `${stats.avgComposite.toFixed(0)}/100`, sub: 'composite of EIU, FH, V-Dem, RSF, CPI' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${pageBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Breadcrumbs isDarkMode={isDarkMode} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>The Politics Ledger</div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 ${textPrimary}`}>Who Governs the World</h1>
            <p className={`text-base sm:text-lg max-w-3xl ${textSec}`}>
              The leaders, parties and parliaments of 47 nations, how their systems work, how free they are, how they got here,
              and the political cultures and philosophies that hold them together.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-2">
            <ThemeToggle isDarkMode={isDarkMode} className="self-end sm:self-auto" />
            <GuidedTour storageKey="politics-ledger-tour-seen" steps={POLITICS_TOUR_STEPS} isDarkMode={isDarkMode} />
          </div>
        </div>

        <StalenessBanner
          lastUpdated={CURATED_LAST_UPDATED}
          label="leaders, parliaments and election dates; EIU, Freedom House, V-Dem, RSF and CPI index readings"
          isDarkMode={isDarkMode}
        />

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <ChartMeta sourceId="politics-profiles-curated" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="curated" isDarkMode={isDarkMode} />
          <span className={`text-[11px] ${textMuted}`}>|</span>
          <ChartMeta sourceId="politics-indices-curated" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="estimate" isDarkMode={isDarkMode} />
          <span className={`text-[11px] ${textMuted}`}>|</span>
          <ChartMeta sourceId="wb-wgi-suite" isDarkMode={isDarkMode} />
        </div>

        <div className="mb-6 flex justify-end">
          <DataDownloadButton
            isDarkMode={isDarkMode}
            filename="politics-ledger-data"
            label="Data"
            getData={() =>
              POLITICS_PROFILES.map((p) => {
                const lead = getEffectiveLeader(p);
                const turnover = turnoverSince1945(p);
                const checks = CHECKS_BY_KEY[p.key];
                return {
                country: COUNTRY_DISPLAY_NAMES[p.key],
                iso3: p.iso3,
                regime: REGIME_LABELS[p.system.regime],
                form: p.system.form,
                structure: p.system.structure,
                constitutionYear: p.system.constitutionYear,
                headOfState: p.leadership.headOfState.name,
                headOfGovernment: p.leadership.headOfGovernment?.name ?? '',
                effectiveLeader: getEffectiveLeader(p).name,
                leaderSince: getEffectiveLeader(p).since,
                rulingCoalition: p.leadership.rulingCoalition,
                governmentSeatSharePct: Math.round(governmentSeatShare(p) * 1000) / 10,
                lastElection: p.leadership.lastElection.date,
                nextElection: p.leadership.nextElection.date,
                eiu: p.indices.eiu.score,
                freedomHouse: p.indices.freedomHouse.score,
                vdemLibDem2025: p.indices.vdemLibDem[p.indices.vdemLibDem.length - 1],
                rsfRank: p.indices.rsfRank,
                cpi: p.indices.cpi,
                womenInParliamentPct: p.indices.womenInParliamentPct,
                wgiVoice: wgi[p.key]?.voice ?? '',
                wgiRuleOfLaw: wgi[p.key]?.ruleOfLaw ?? '',
                leaderBorn: lead.born ?? '',
                leaderAge: leaderAge(lead) ?? '',
                leaderGender: lead.gender ?? '',
                leaderRouteToPower: lead.route ?? '',
                leaderTermsSince1945: turnover?.terms ?? '',
                leaderAvgTenureYears: turnover ? Math.round(turnover.avgTenureYears * 10) / 10 : '',
                leaderCoupsSince1945: turnover?.coups ?? '',
                powerConcentration: powerConcentration(p),
                ...Object.fromEntries(CHECK_AXES.map((a) => [`checks_${a}`, checks?.[a] ?? ''])),
                lastVerified: p.lastVerified,
                };
              })
            }
          />
        </div>

        <div id={slugify('Politics Ledger key figures')} className={`rounded-2xl border p-4 sm:p-6 mb-10 ${heroBg}`}>
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
            <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Politics Ledger key figures</div>
            <SocialShareMenu title="Politics Ledger key figures" isDarkMode={isDarkMode} />
          </div>

          <div className="mb-4">
            <div className="flex h-6 w-full rounded-md overflow-hidden" aria-label="Population by regime type">
              {stats.shares.map((s) => (
                <div
                  key={s.regime}
                  className="h-full flex items-center justify-center text-[10px] text-white font-medium"
                  style={{ width: `${s.sharePct}%`, backgroundColor: REGIME_COLORS[s.regime] }}
                  title={`${REGIME_LABELS[s.regime]}: ${s.countries} countries, ${s.populationM.toFixed(0)}m people`}
                >
                  {s.sharePct >= 8 ? `${s.sharePct.toFixed(0)}%` : ''}
                </div>
              ))}
            </div>
            <div className={`flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[11px] ${textSec}`}>
              {stats.shares.map((s) => (
                <span key={s.regime} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: REGIME_COLORS[s.regime] }} />
                  {REGIME_LABELS[s.regime]}: {s.countries} countries · {(s.populationM / 1000).toFixed(2)}bn people
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {kpis.map((k) => (
              <div key={k.label} className={`p-3 rounded-lg border ${cardBg}`}>
                <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>{k.label}</div>
                <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>{k.value}</div>
                <div className={`text-[11px] ${textMuted}`}>{k.sub}</div>
              </div>
            ))}
          </div>

          {stats.recent.length > 0 && (
            <div className="mt-4">
              <div className={`text-[11px] uppercase tracking-wider mb-2 ${textMuted}`}>Latest results</div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {stats.recent.slice(0, 8).map((e) => {
                  const Flag = COUNTRY_FLAGS[e.key];
                  return (
                    <Link
                      key={`${e.key}-${e.date}`}
                      href={`/politics-ledger/${COUNTRY_KEY_TO_SLUG[e.key]}`}
                      className={`shrink-0 w-64 p-3 rounded-lg border text-xs ${cardBg} hover:shadow-sm`}
                    >
                      <div className={`flex items-center gap-2 font-medium text-sm ${textPrimary}`}>
                        {Flag && <Flag className="w-5 h-3.5 rounded-sm" />}
                        {COUNTRY_DISPLAY_NAMES[e.key]}
                        <span className={`ml-auto text-[11px] font-normal ${textMuted}`}>{e.date.slice(0, 7)}</span>
                      </div>
                      <div className={`mt-1 line-clamp-3 ${textSec}`}>{e.summary}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-12">
          <div id={slugify('What changed')} className={`lg:col-span-2 rounded-lg border p-4 sm:p-5 ${cardBg}`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className={`text-base font-semibold ${textPrimary}`}>What changed in the last 12 months</h2>
              <span className={`text-[11px] ${textMuted}`}>to {CURATED_LAST_UPDATED}</span>
            </div>
            <WhatChangedLog isDarkMode={isDarkMode} />
          </div>
          <Link
            href="/politics-ledger/match"
            className={`rounded-lg border p-5 flex flex-col justify-between hover:shadow-md transition-shadow ${
              isDarkMode ? 'bg-gradient-to-br from-indigo-900/40 to-gray-800 border-indigo-800' : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-200'
            }`}
          >
            <div>
              <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Quiz</div>
              <h2 className={`text-xl font-bold mb-2 ${textPrimary}`}>Find your political match</h2>
              <p className={`text-sm ${textSec}`}>
                Answer twelve statements on the economy and society, see where you land on the ideological map, and find the parties and governments
                across 47 countries closest to your views.
              </p>
            </div>
            <span className={`mt-4 text-sm font-medium ${link}`}>Take the 2-minute quiz {'\u2192'}</span>
          </Link>
        </div>

        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 1"
            title="The World's Regimes"
            subtitle="Democracy, electoral authoritarianism and closed autocracy, mapped. Switch layers to see systems of government or any of six governance indices; click any country to open its political profile."
          />
          <div className={`rounded-lg border p-4 ${cardBg}`}>
            <RegimeWorldMap isDarkMode={isDarkMode} />
          </div>
        </section>

        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 2"
            title="Who Rules"
            subtitle="The people who hold executive power, the parties behind them and how firmly they hold parliament. Sort by tenure to find the longest-serving rulers, or by seat share to find the most fragile governments."
          />
          <div className={`rounded-lg border p-4 ${cardBg}`}>
            <LeadershipTable isDarkMode={isDarkMode} />
          </div>
        </section>

        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 3"
            title="How They Govern"
            subtitle="Constitutional design shapes everything from coalition-building to how quickly a leader can be removed. Group the 47 countries by system of government, territorial structure, electoral rules or constitutional age."
          />
          <GovernmentSystemsGrid isDarkMode={isDarkMode} />
        </section>

        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 4"
            title="The Ideological Map"
            subtitle="Each dot is a government, placed by the seat-weighted economic and social positions of its governing parties. Switch to the whole legislature to see where each parliament's centre of gravity lies."
          />
          <div className={`rounded-lg border p-4 ${cardBg}`}>
            <GovernmentCompassChart isDarkMode={isDarkMode} />
          </div>
        </section>

        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 5"
            title="Election Calendar"
            subtitle="Every scheduled national vote across the 47 countries, and what happened in the last 18 months. Approximate dates mark the latest date allowed by law where no date has been set."
          />
          <ElectionCalendar isDarkMode={isDarkMode} />
        </section>

        <LazyMount isDarkMode={isDarkMode}>
          <section className="mb-14">
            <ChapterHeader
              isDarkMode={isDarkMode}
              chapter="Chapter 6"
              title="Governance Scorecard"
              subtitle="Five independent assessments of democracy, freedom, press freedom and corruption, alongside live World Bank governance indicators. Where they agree, the picture is clear; where they diverge, the methodology matters."
            />
            <div className={`rounded-lg border p-4 ${cardBg}`}>
              <GovernanceScorecard isDarkMode={isDarkMode} wgi={wgi} wgiLoading={loading} />
            </div>
          </section>

          <section className="mb-14">
            <ChapterHeader
              isDarkMode={isDarkMode}
              chapter="Chapter 7"
              title="Politics and Prosperity"
              subtitle="Do freer, cleaner or more constrained governments preside over richer, healthier and more equal societies? Pick a governance measure and a live World Bank outcome to test the relationship across all 47 countries."
            />
            <div className={`rounded-lg border p-4 ${cardBg}`}>
              <PoliticsProsperityChart isDarkMode={isDarkMode} data={data} wgi={wgi} loading={loading} />
              <div className="mt-2">
                <ChartMeta sourceId="wb-wgi-suite" isDarkMode={isDarkMode} />
              </div>
            </div>
          </section>

          <section className="mb-14">
            <ChapterHeader
              isDarkMode={isDarkMode}
              chapter="Chapter 8"
              title="Who Leads"
              subtitle="The 47 people who hold executive power: how old they are, how many are women, how they got the job and how long they have kept it."
            />
            <LeaderDemographics isDarkMode={isDarkMode} />
          </section>

          <section className="mb-14">
            <ChapterHeader
              isDarkMode={isDarkMode}
              chapter="Chapter 9"
              title="Checks and Balances"
              subtitle="Elections choose leaders; institutions limit them. Eight constraints, from veto players and courts to central banks, term limits and federalism, combine into a single power-concentration score."
            />
            <div className={`rounded-lg border p-4 ${cardBg}`}>
              <ChecksBalancesPanel isDarkMode={isDarkMode} />
            </div>
          </section>

          <section className="mb-14">
            <ChapterHeader
              isDarkMode={isDarkMode}
              chapter="Chapter 10"
              title="Democracy's Long Arc"
              subtitle="Half a century of the V-Dem Liberal Democracy Index: the third wave of democratisation from the mid-1970s, the post-Cold War peak, and the backsliding of the last fifteen years."
            />
            <div className={`rounded-lg border p-4 ${cardBg}`}>
              <DemocracyTrendChart isDarkMode={isDarkMode} />
            </div>
          </section>

          <section className="mb-14">
            <ChapterHeader
              isDarkMode={isDarkMode}
              chapter="Chapter 11"
              title="Ideas That Shape States"
              subtitle="Behind every constitution sits a philosophy. These thirteen traditions, from Westminster parliamentarism to Confucian statecraft and Islamic governance, explain why similar institutions behave so differently."
            />
            <PoliticalTraditionsGrid isDarkMode={isDarkMode} />
          </section>

          <section className="mb-6">
            <ChapterHeader
              isDarkMode={isDarkMode}
              chapter="Chapter 12"
              title="Compare Political Systems"
              subtitle="Put up to four countries side by side: institutions, leaders, parliamentary arithmetic, governance scores, traditions and values."
            />
            <div className={`rounded-lg border p-4 ${cardBg}`}>
              <PoliticalCompare isDarkMode={isDarkMode} />
            </div>
          </section>
        </LazyMount>

        <section className="mt-10">
          <h3 className={`text-lg font-semibold mb-3 ${textPrimary}`}>Country political profiles</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {[...POLITICS_PROFILES]
              .sort((a, b) => COUNTRY_DISPLAY_NAMES[a.key].localeCompare(COUNTRY_DISPLAY_NAMES[b.key]))
              .map((p) => {
                const Flag = COUNTRY_FLAGS[p.key];
                return (
                  <Link key={p.key} href={`/politics-ledger/${COUNTRY_KEY_TO_SLUG[p.key]}`} className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm hover:shadow-sm ${cardBg} ${textPrimary}`}>
                    {Flag && <Flag className="w-5 h-3.5 rounded-sm" />}
                    <span className="truncate">{COUNTRY_DISPLAY_NAMES[p.key]}</span>
                    <span className="ml-auto w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: REGIME_COLORS[p.system.regime] }} />
                  </Link>
                );
              })}
          </div>
        </section>

        <RelatedPages currentPath="/politics-ledger" isDarkMode={isDarkMode} />

        <div className={`text-xs mt-8 pt-6 border-t space-y-2 ${isDarkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-500'}`}>
          <p>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Leadership and parliaments:</span>{' '}
            verified against national parliaments, election commissions and wire reporting as of {CURATED_LAST_UPDATED}. Seat counts are for the lower or sole chamber; some are approximate where defections and vacancies change totals between elections.
          </p>
          <p>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Indices (approximate):</span>{' '}
            {Object.values(INDEX_EDITIONS).join(' · ')}. Regime types follow V-Dem&apos;s Regimes of the World classification. Party placements on the ideological map are editorial estimates.
          </p>
          <p>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Live series (World Bank WGI):</span>{' '}
            GOV_WGI_VA.EST, GOV_WGI_PV.EST, GOV_WGI_GE.EST, GOV_WGI_RQ.EST, GOV_WGI_RL.EST, GOV_WGI_CC.EST.{' '}
            <Link href="/data-sources" className={`underline underline-offset-2 ${link}`}>All data sources →</Link>
          </p>
          <p>
            History, culture and philosophy summaries aim to be neutral and descriptive; contested claims are attributed. Suggestions and corrections are welcome.
          </p>
          <p>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Learn the basics:</span>{' '}
            <Link href="/learn#lesson-political-systems" className={`underline underline-offset-2 ${link}`}>Presidential vs parliamentary systems</Link>
            {' \u00b7 '}
            <Link href="/learn#lesson-measuring-democracy" className={`underline underline-offset-2 ${link}`}>How democracy is measured</Link>
            {' \u00b7 '}
            <Link href="/embed-gallery" className={`underline underline-offset-2 ${link}`}>Embed these charts</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
