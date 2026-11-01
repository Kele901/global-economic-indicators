'use client';

// Inflation & Cost of Living: eight chapters on consumer-price inflation across
// the 47-economy roster. The first load pulls fetchGlobalData only; chapters
// below the fold mount (and fetch their extra series) when scrolled into range.

import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { fetchGlobalData } from '../services/worldbank';
import { useLocalStorage } from '../hooks/useLocalStorage';
import PageTakeaways from '../components/PageTakeaways';
import ThemeToggle from '../components/ThemeToggle';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedPages from '../components/RelatedPages';
import BulkChartDownload from '../components/BulkChartDownload';
import SocialShareMenu from '../components/SocialShareMenu';
import DataDownloadButton from '../components/DataDownloadButton';
import ErrorMessage from '../components/ErrorMessage';
import SkeletonCard from '../components/SkeletonCard';
import ChapterNav from '../components/ChapterNav';
import ChapterSection from '../components/ChapterSection';
import { ChapterMeta, Stat, countryName, pct, type GlobalData, type InflationChapterProps } from '../components/inflation/ui';
import { slugify } from '../lib/share';
import { COUNTRY_KEYS, COUNTRY_KEY_TO_SLUG, COUNTRY_SLUGS, type CountryKey } from '../utils/countryMappings';
import { smartDefaultYear } from '../utils/heatmap/values';
import { countNearTarget, median, risingFalling, valueAt } from '../utils/inflation/stats';

const loading = () => <SkeletonCard height="h-[600px]" label="Loading chapter" />;
const chapter = (load: () => Promise<{ default: ComponentType<InflationChapterProps> }>) => dynamic(load, { ssr: false, loading });

const CHAPTERS: { label: string; title: string; Component: ComponentType<InflationChapterProps> }[] = [
  { label: 'Today', title: 'Inflation today', Component: chapter(() => import('../components/inflation/ChapterToday')) },
  { label: 'History', title: 'Sixty years of inflation', Component: chapter(() => import('../components/inflation/ChapterHistory')) },
  { label: 'Central banks', title: 'Central banks and real interest rates', Component: chapter(() => import('../components/inflation/ChapterCentralBanks')) },
  { label: 'Drivers', title: 'What drives inflation', Component: chapter(() => import('../components/inflation/ChapterDrivers')) },
  { label: 'Your money', title: 'Your money over time', Component: chapter(() => import('../components/inflation/ChapterMoney')) },
  { label: 'Cost of living', title: 'Cost of living', Component: chapter(() => import('../components/inflation/ChapterCostOfLiving')) },
  { label: 'World map', title: 'World map', Component: chapter(() => import('../components/inflation/ChapterMap')) },
  { label: 'Tools & quiz', title: 'Tools and quiz', Component: chapter(() => import('../components/inflation/ChapterTools')) },
];

const NAV = CHAPTERS.map((c, i) => ({ id: `chapter-${i + 1}`, label: c.label }));
const DEFAULT_SELECTED: CountryKey[] = ['USA', 'UK', 'Germany', 'Japan', 'Brazil', 'India'];
const EAGER_CHAPTERS = 2;

function parseSelected(param: string | null): CountryKey[] | null {
  if (!param) return null;
  const keys = param
    .split(',')
    .map((s) => COUNTRY_SLUGS[s.trim().toLowerCase()])
    .filter((k): k is CountryKey => !!k);
  return keys.length ? [...new Set(keys)].slice(0, 8) : null;
}

function headline(data: GlobalData | null) {
  const rows = data?.inflationRates;
  const year = rows?.length ? smartDefaultYear({ inflationRates: rows }, 'inflationRates') : null;
  if (!rows || year == null) return null;
  const vals = COUNTRY_KEYS.map((k) => ({ key: k, value: valueAt(rows, k, year) })).filter(
    (r): r is { key: CountryKey; value: number } => r.value != null,
  );
  const sorted = [...vals].sort((a, b) => b.value - a.value);
  const dir = risingFalling(rows, COUNTRY_KEYS, 0.1, year);
  return {
    year,
    count: vals.length,
    median: median(vals.map((v) => v.value)),
    nearTarget: countNearTarget(vals.map((v) => v.value), 2, 1),
    highest: sorted[0],
    lowest: sorted[sorted.length - 1],
    rising: dir.rising.length,
    falling: dir.falling.length,
    vals,
  };
}

export default function InflationPage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const [data, setData] = useState<GlobalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CountryKey[]>(DEFAULT_SELECTED);

  useEffect(() => {
    fetchGlobalData()
      .then(setData)
      .catch(() => setError('Failed to fetch economic data. Please try again later.'));
  }, []);

  useEffect(() => {
    const fromUrl = parseSelected(new URLSearchParams(window.location.search).get('c'));
    if (fromUrl) setSelected(fromUrl);
  }, []);

  const updateSelected = useCallback((keys: CountryKey[]) => {
    setSelected(keys);
    const url = new URL(window.location.href);
    if (keys.length) url.searchParams.set('c', keys.map((k) => COUNTRY_KEY_TO_SLUG[k]).join(','));
    else url.searchParams.delete('c');
    window.history.replaceState(null, '', url.toString());
  }, []);

  const hero = useMemo(() => headline(data), [data]);

  const t = {
    page: isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50',
    hero: isDarkMode
      ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-blue-900/30 border-gray-700'
      : 'bg-gradient-to-br from-blue-50 via-white to-amber-50 border-blue-100',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    sec: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    muted: 'text-gray-500',
    link: isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-700 hover:text-blue-800',
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${t.page}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Breadcrumbs isDarkMode={isDarkMode} />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Inflation & Cost of Living</div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 ${t.text}`}>What Prices Are Doing, and Why</h1>
            <p className={`text-base sm:text-lg max-w-3xl ${t.sec}`}>
              Inflation measures how fast prices rise and how quickly money loses its purchasing power. This page tracks consumer-price
              inflation across 47 economies from the World Bank, central-bank policy rates from FRED and IMF forecasts: where inflation
              stands today, sixty years of history, how central banks are responding, what drives it, what it does to your savings and
              wages, and what everyday items cost in four major cities. To work out what an amount of money is worth in another year, use
              the{' '}
              <Link href="/inflation-calculator" className={`underline underline-offset-2 ${t.link}`}>
                inflation calculator
              </Link>
              .
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <BulkChartDownload variant="primary" size="sm" />
            <SocialShareMenu title="Inflation & Cost of Living" isDarkMode={isDarkMode} />
            <ThemeToggle isDarkMode={isDarkMode} />
          </div>
        </div>

        <ChapterMeta
          isDarkMode={isDarkMode}
          sourceIds={['wb-inflation', 'fred-policy-rates', 'imf-weo-inflation', 'numbeo-city-prices']}
          flags={['curated']}
        />
        <PageTakeaways page="inflation" isDarkMode={isDarkMode} className="mt-4" />

        <div id={slugify('Inflation key figures')} className={`rounded-2xl border p-4 sm:p-6 mb-6 ${t.hero}`}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat
              isDarkMode={isDarkMode}
              label={`Median inflation${hero ? `, ${hero.year}` : ''}`}
              value={hero ? pct(hero.median) : '\u2026'}
              sub={hero ? `across ${hero.count} economies` : 'loading World Bank data'}
              tone="text-blue-500"
            />
            <Stat
              isDarkMode={isDarkMode}
              label="Within 1pp of 2%"
              value={hero ? `${hero.nearTarget} of ${hero.count}` : '\u2026'}
              sub="the usual central-bank target"
              tone="text-emerald-500"
            />
            <Stat
              isDarkMode={isDarkMode}
              label="Highest / lowest"
              value={hero?.highest ? pct(hero.highest.value) : '\u2026'}
              sub={hero?.highest && hero.lowest ? `${countryName(hero.highest.key)}; lowest ${countryName(hero.lowest.key)} ${pct(hero.lowest.value)}` : ''}
              tone="text-rose-500"
            />
            <Stat
              isDarkMode={isDarkMode}
              label="Rising vs falling"
              value={hero ? `${hero.rising} \u2191 / ${hero.falling} \u2193` : '\u2026'}
              sub="vs the previous year"
              tone="text-amber-500"
            />
          </div>
          <div className={`mt-4 flex items-center justify-between gap-3 flex-wrap text-xs ${t.muted}`}>
            <div className="flex-1 min-w-[240px]">
              Annual average consumer-price inflation (World Bank FP.CPI.TOTL.ZG). The latest year is the most recent one most countries
              have reported.
            </div>
            {hero && (
              <DataDownloadButton
                isDarkMode={isDarkMode}
                filename={`inflation-${hero.year}`}
                shareTitle="Inflation key figures"
                label="Data"
                getData={() => hero.vals.map((v) => ({ country: countryName(v.key), year: hero.year, inflation: v.value }))}
              />
            )}
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Chapter sections only exist once data arrives; remount so the nav observes them. */}
        <ChapterNav key={data ? 'ready' : 'loading'} isDarkMode={isDarkMode} chapters={NAV} accent="blue" />

        {!data && !error && <SkeletonCard height="h-[600px]" label="Loading inflation data" />}

        {data &&
          CHAPTERS.map(({ title, Component }, i) => (
            <ChapterSection key={title} id={`chapter-${i + 1}`} index={i + 1} title={title} isDarkMode={isDarkMode} accent="blue" lazy={i >= EAGER_CHAPTERS}>
              <Component isDarkMode={isDarkMode} data={data} selected={selected} onSelectedChange={updateSelected} />
            </ChapterSection>
          ))}

        <RelatedPages currentPath="/inflation" isDarkMode={isDarkMode} />

        <footer className={`mt-16 pt-6 border-t text-xs ${t.muted} ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          Inflation, CPI, unemployment, broad money, real interest and exchange-rate series fetched live from the World Bank API via our
          proxy. Policy rates, Brent crude and the IMF food price index from FRED; forecasts from the IMF World Economic Outlook. City prices
          are annual Numbeo snapshots for 2011-2024, used with credit. Central-bank targets, the episode timeline and hyperinflation case
          studies are curated. See all sources on the{' '}
          <Link href="/data-sources" className={`underline ${t.link}`}>
            data sources page
          </Link>
          .
        </footer>
      </div>
    </div>
  );
}
