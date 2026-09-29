'use client';

// The Inequality Ledger — 8 chapters on the distribution of income and
// wealth. Follows the same template as the Defense/Labor/Energy ledgers:
// breadcrumbs, staleness disclosure, provenance badges, a live hero, a
// guided tour, eight numbered chapters and a related-pages row.
//
// Chapter 1 is live World Bank SI.POV.GINI. Chapters 2-8 are the
// Piketty/WID historical reconstructions, each rendered as a single
// addressable view of components/InequalityCharts.

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { fetchGlobalData } from '../services/worldbank';
import { latestEntry } from '../utils/countryData';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES } from '../utils/countryMappings';
import {
  PIKETTY_R_VS_G,
  CAPITAL_INCOME_RATIO,
  TOP_INCOME_SHARES,
  TOP_WEALTH_SHARES,
  KUZNETS_SCATTER,
  ELEPHANT_CURVE,
  INHERITANCE_FLOWS,
  TAX_HISTORY,
  WEALTH_COMPOSITION,
  INEQUALITY_MILESTONES,
} from '../data/inequalityData';
import StalenessBanner from '../components/StalenessBanner';
import DataDownloadButton from '../components/DataDownloadButton';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedPages from '../components/RelatedPages';
import ChartMeta from '../components/ChartMeta';
import DataQualityBadge from '../components/DataQualityBadge';
import LazyMount from '../components/LazyMount';
import GuidedTour, { type TourStep } from '../components/GuidedTour';
import SkeletonCard from '../components/SkeletonCard';
import SocialShareMenu from '../components/SocialShareMenu';
import { slugify } from '../lib/share';

const GiniTicker = dynamic(() => import('../components/GiniTicker'), {
  ssr: false,
  loading: () => <SkeletonCard height="h-[64px]" label="Loading Gini ticker" />,
});
const GiniRankChart = dynamic(() => import('../components/GiniRankChart'), {
  ssr: false,
  loading: () => <SkeletonCard height="h-[400px] sm:h-[520px]" label="Loading Gini ranking" />,
});
const InequalityCharts = dynamic(() => import('../components/InequalityCharts'), {
  ssr: false,
  loading: () => <SkeletonCard height="h-[400px] sm:h-[520px]" label="Loading chapter" />,
});

type GlobalData = Awaited<ReturnType<typeof fetchGlobalData>>;

// Publication date of the curated Piketty/WID transcription. Kept in step
// with the inequality-curated entry in data/dataProvenance.ts.
const CURATED_LAST_UPDATED = '2025-09-01';

const TOUR_STEPS: TourStep[] = [
  { chapter: 'Chapter 1', title: 'Where inequality stands now', body: 'Live World Bank Gini for every country in the roster. One number per country, from its most recent household survey — which for some economies is nearly a decade old.' },
  { chapter: 'Chapter 2', title: 'r > g', body: 'Piketty\'s central claim: when the return on capital outruns economic growth, existing wealth compounds faster than wages and fortunes concentrate without anyone deciding they should.' },
  { chapter: 'Chapter 3', title: 'The Kuznets curve', body: 'The mid-century hope was that inequality rises then falls automatically as a country develops. The cross-section shows why that hope did not survive contact with the data.' },
  { chapter: 'Chapter 4', title: 'Income shares', body: 'Top 1%, top 10% and bottom 50% shares over a century. The U-shape for the US and UK is the single most cited fact in modern inequality research.' },
  { chapter: 'Chapter 5', title: 'Wealth shares', body: 'Wealth is far more concentrated than income everywhere, and it did not compress as much after the world wars as income did.' },
  { chapter: 'Chapter 6', title: 'Two centuries of dynamics', body: 'Capital/income ratios, inheritance flows and the policy milestones that compressed or widened the distribution.' },
  { chapter: 'Chapter 7', title: 'The world map', body: 'Live Gini on a choropleth, so you can see the regional clustering that country-by-country bars hide.' },
  { chapter: 'Chapter 8', title: 'Tax and policy', body: 'Top marginal rates from 1900 to today, and the policy levers that actually move the distribution.' },
];

function ChapterHeader({ isDarkMode, chapter, title, subtitle }: { isDarkMode: boolean; chapter: string; title: string; subtitle: string; }) {
  return (
    <div className="mb-6">
      <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>{chapter}</div>
      <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      <p className={`text-sm sm:text-base max-w-3xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</p>
    </div>
  );
}

export default function InequalityPage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
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
        const wb = await fetchGlobalData().catch(err => {
          console.warn('[inequality] fetchGlobalData failed', err);
          return null;
        });
        if (!cancelled) setData(wb);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const gini = data?.giniCoefficient;

  // Live KPIs. Everything derives from the same latest-survey-per-country
  // extraction the Chapter 1 chart uses, so the hero can never disagree
  // with the bars underneath it.
  const giniStats = useMemo(() => {
    const rows = COUNTRY_KEYS
      .map(key => {
        const entry = latestEntry(gini, key);
        return entry ? { name: COUNTRY_DISPLAY_NAMES[key] ?? key, gini: entry.value, year: entry.year } : null;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.gini - a.gini);
    if (rows.length === 0) return null;
    const values = rows.map(r => r.gini);
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return {
      count: rows.length,
      highest: rows[0]!,
      lowest: rows[rows.length - 1]!,
      median: sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!,
      oldestSurvey: rows.reduce((acc, r) => (r.year < acc.year ? r : acc), rows[0]!),
    };
  }, [gini]);

  // Piketty's headline comparison, pulled from the curated series rather
  // than hard-coded, so editing the data updates the hero.
  const rMinusG = useMemo(() => {
    const now = PIKETTY_R_VS_G.filter(p => p.year <= 2020).at(-1);
    return now ? { r: now.rateOfReturn, g: now.growthRate, gap: now.rateOfReturn - now.growthRate, year: now.year } : null;
  }, []);

  const usTop1 = useMemo(() => {
    const series = TOP_INCOME_SHARES.filter(p => p.country === 'USA');
    const latest = series.at(-1);
    const trough = series.reduce((acc, p) => (p.top1 < acc.top1 ? p : acc), series[0]!);
    return latest && trough ? { latest, trough } : null;
  }, []);

  const pageBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const heroBg = isDarkMode
    ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-rose-900/30 border-gray-700'
    : 'bg-gradient-to-br from-rose-50 via-white to-amber-50 border-rose-100';
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';

  return (
    <div className={`min-h-screen transition-colors duration-200 ${pageBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Breadcrumbs isDarkMode={isDarkMode} />

        <div className="flex items-start justify-between mb-6">
          <div>
            <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>The Inequality Ledger</div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 ${textPrimary}`}>Income, Wealth, Capital, Tax</h1>
            <p className={`text-base sm:text-lg max-w-3xl ${textSec}`}>
              How income and wealth are divided, why the division moves, and what
              actually changed it. Live World Bank Gini across the full country
              roster, joined with 250 years of Piketty and World Inequality Database
              reconstructions of capital, top shares, inheritance and tax.
            </p>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`hidden sm:flex items-center gap-2 text-xs px-3 py-2 rounded-md border transition-colors ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white' : 'bg-white border-gray-200 text-gray-700 hover:text-gray-900'
            }`}
          >{isDarkMode ? 'Light mode' : 'Dark mode'}</button>
        </div>

        <GuidedTour
          storageKey="tour-inequality"
          steps={TOUR_STEPS}
          isDarkMode={isDarkMode}
          ctaLabel="Take the 60-second tour of the 8 chapters"
        />

        <StalenessBanner
          lastUpdated={CURATED_LAST_UPDATED}
          label="Piketty (2014), Piketty & Saez (2003), World Inequality Database, Milanovic (2016), Saez & Zucman (2019)"
          isDarkMode={isDarkMode}
        />

        <div className="flex items-center gap-2 mb-4 mt-4 flex-wrap">
          <ChartMeta sourceId="wb-gini" isDarkMode={isDarkMode} />
          <ChartMeta sourceId="inequality-curated" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="estimate" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="curated" isDarkMode={isDarkMode} />
        </div>

        <div id={slugify('Inequality Ledger key figures')} className={`rounded-2xl border p-4 sm:p-6 mb-10 ${heroBg}`}>
          <GiniTicker isDarkMode={isDarkMode} gini={gini} />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Most unequal (live)</div>
              <div className="text-xl font-semibold tabular-nums mt-0.5 text-rose-500">
                {giniStats ? giniStats.highest.gini.toFixed(1) : '—'}
              </div>
              <div className={`text-[11px] ${textMuted}`}>
                {giniStats ? `${giniStats.highest.name} (${giniStats.highest.year} survey)` : 'awaiting World Bank'}
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Most equal (live)</div>
              <div className="text-xl font-semibold tabular-nums mt-0.5 text-emerald-500">
                {giniStats ? giniStats.lowest.gini.toFixed(1) : '—'}
              </div>
              <div className={`text-[11px] ${textMuted}`}>
                {giniStats ? `${giniStats.lowest.name} (${giniStats.lowest.year} survey)` : 'awaiting World Bank'}
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>r minus g today</div>
              <div className="text-xl font-semibold tabular-nums mt-0.5 text-amber-500">
                {rMinusG ? `+${rMinusG.gap.toFixed(1)}pp` : '—'}
              </div>
              <div className={`text-[11px] ${textMuted}`}>
                {rMinusG ? `r ${rMinusG.r.toFixed(1)}% vs g ${rMinusG.g.toFixed(1)}% (${rMinusG.year})` : ''}
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>US top 1% income share</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>
                {usTop1 ? `${usTop1.latest.top1}%` : '—'}
              </div>
              <div className={`text-[11px] ${textMuted}`}>
                {usTop1 ? `${usTop1.latest.year}, vs ${usTop1.trough.top1}% trough in ${usTop1.trough.year}` : ''}
              </div>
            </div>
          </div>

          <div className={`mt-4 flex items-center justify-between gap-3 flex-wrap text-xs ${textMuted}`}>
            <div className="flex-1 min-w-[240px]">
              Live: World Bank SI.POV.GINI, latest household survey per country
              {giniStats ? ` (${giniStats.count} of ${COUNTRY_KEYS.length} roster countries reporting; oldest survey ${giniStats.oldestSurvey.year}, ${giniStats.oldestSurvey.name})` : ''}.
              Curated: Piketty (2014) capital/income ratios and r-vs-g, Piketty &amp; Saez (2003) and WID
              top shares, Milanovic (2016) elephant curve, Saez &amp; Zucman (2019) wealth concentration.
            </div>
            <DataDownloadButton
              isDarkMode={isDarkMode}
              filename="inequality-ledger-data"
              shareTitle="Inequality Ledger key figures"
              label="Data"
              getData={() => {
                const rows: Record<string, unknown>[] = [];
                COUNTRY_KEYS.forEach(key => {
                  const entry = latestEntry(gini, key);
                  if (entry) {
                    rows.push({ series: 'Gini index (World Bank, live)', country: COUNTRY_DISPLAY_NAMES[key] ?? key, year: entry.year, value: entry.value });
                  }
                });
                PIKETTY_R_VS_G.forEach(r => rows.push({ series: 'r vs g', ...r }));
                CAPITAL_INCOME_RATIO.forEach(r => rows.push({ series: 'Capital/income ratio', ...r }));
                TOP_INCOME_SHARES.forEach(r => rows.push({ series: 'Top income shares', ...r }));
                TOP_WEALTH_SHARES.forEach(r => rows.push({ series: 'Top wealth shares', ...r }));
                KUZNETS_SCATTER.forEach(r => rows.push({ series: 'Kuznets cross-section', ...r }));
                ELEPHANT_CURVE.forEach(r => rows.push({ series: 'Elephant curve', ...r }));
                INHERITANCE_FLOWS.forEach(r => rows.push({ series: 'Inheritance flows', ...r }));
                TAX_HISTORY.forEach(r => rows.push({ series: 'Top marginal tax rates', ...r }));
                WEALTH_COMPOSITION.forEach(r => rows.push({ series: 'Wealth composition', ...r }));
                INEQUALITY_MILESTONES.forEach(r => rows.push({ series: 'Milestones', ...r }));
                return rows;
              }}
            />
          </div>
        </div>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 1"
            title="Where Inequality Stands Now"
            subtitle="Live World Bank Gini for every country in the roster, ranked. Survey years differ by country and faded bars flag the stale ones — a single &quot;latest Gini&quot; table is one of the easiest places to accidentally compare 2023 against 2011." />
          <GiniRankChart isDarkMode={isDarkMode} gini={gini} shareTitle="Where Inequality Stands Now" />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 2"
            title="r > g: The Central Contradiction"
            subtitle="Piketty's thesis in one chart: the return on capital has sat near 4-5% for two millennia while growth only briefly exceeded it during the 20th century. Whenever r runs above g, inherited wealth compounds faster than earned income." />
          <InequalityCharts isDarkMode={isDarkMode} view="rvsg" />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 3"
            title="The Kuznets Curve and Its Refutation"
            subtitle="Kuznets (1955) argued inequality rises then falls as economies industrialise. The cross-section of GDP per capita against Gini shows the inverted U is at best a weak tendency — rich countries span Gini 25 to 45." />
          <InequalityCharts isDarkMode={isDarkMode} view="kuznets" />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 4"
            title="Income Concentration"
            subtitle="Top 1%, top 10% and bottom 50% income shares from 1910 to today, plus Milanovic's elephant curve of who actually gained from globalisation. The US and UK trace a U; France, Japan and Sweden do not." />
          <InequalityCharts isDarkMode={isDarkMode} view="income" />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 5"
            title="Wealth Concentration"
            subtitle="Wealth is roughly twice as concentrated as income in every country measured, and its composition differs sharply — housing dominates European balance sheets while financial and business assets dominate American ones." />
          <InequalityCharts isDarkMode={isDarkMode} view="wealth" />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 6"
            title="Two Centuries of Dynamics"
            subtitle="Capital/income ratios from 1700, inheritance flows as a share of national income, and the milestones that compressed or widened the distribution. The egalitarian mid-20th century was produced by war, inflation and policy, not by markets." />
          <InequalityCharts isDarkMode={isDarkMode} view="historical" />
        </section>

        <LazyMount isDarkMode={isDarkMode}>
          <section className="mb-14">
            <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 7"
              title="The Global Map"
              subtitle="Live Gini on a world choropleth. The regional clustering is the point: Southern Africa and Latin America sit above 45, continental and Northern Europe below 33, with most of Asia in between." />
            <InequalityCharts isDarkMode={isDarkMode} view="global" />
          </section>

          <section className="mb-14">
            <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 8"
              title="Tax and Policy Levers"
              subtitle="Top marginal income and capital-gains rates from 1900. Anglo-American rates above 90% in the mid-century are the clearest single correlate of the income compression in Chapter 4 — and their reversal after 1980 of its undoing." />
            <InequalityCharts isDarkMode={isDarkMode} view="tax" showSources />
          </section>
        </LazyMount>

        <RelatedPages currentPath="/inequality" isDarkMode={isDarkMode} />

        <footer className={`mt-16 pt-6 border-t text-xs ${textMuted} ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          Gini index fetched live from the World Bank API (SI.POV.GINI) via our own proxy.
          Historical series transcribed from Thomas Piketty, <em>Capital in the Twenty-First Century</em> (2014),
          Piketty &amp; Saez (2003), the World Inequality Database, Branko Milanovic, <em>Global Inequality</em> (2016)
          and Saez &amp; Zucman (2019); curated snapshot refreshed {CURATED_LAST_UPDATED}. Pre-1950 figures are
          reconstructions from tax and estate records, not survey data, and should be read as
          orders of magnitude rather than precise values.
          {loading ? ' Loading…' : ''}
        </footer>
      </div>
    </div>
  );
}
