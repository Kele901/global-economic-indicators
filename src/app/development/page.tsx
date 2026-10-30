'use client';

// The Development Ledger: thirteen chapters on human development across the
// 47-economy roster. Official UNDP HDR indices (generated snapshot) joined with
// live World Bank series. Each chapter fetches only its own series when it
// scrolls into view; distribution charts (Gini, quintile shares) live on
// /inequality.

import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ThemeToggle from '../components/ThemeToggle';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedPages from '../components/RelatedPages';
import StalenessBanner from '../components/StalenessBanner';
import GuidedTour, { type TourStep } from '../components/GuidedTour';
import LazyMount from '../components/LazyMount';
import SkeletonCard from '../components/SkeletonCard';
import DataDownloadButton from '../components/DataDownloadButton';
import SocialShareMenu from '../components/SocialShareMenu';
import ChapterNav from '../components/development/ChapterNav';
import { ChapterMeta, Stat, countryName } from '../components/development/ui';
import type { ChapterProps } from '../components/development/data';
import { slugify } from '../lib/share';
import { COUNTRY_KEYS, COUNTRY_SLUGS, COUNTRY_KEY_TO_SLUG, type CountryKey } from '../utils/countryMappings';
import { DEV_CURATED_LAST_UPDATED, HDR, HDR_DATA_YEAR, latestObs, median } from '../services/developmentCurated';
import { useDevSeries } from './useDevelopmentData';

const loading = () => <SkeletonCard height="h-[600px]" label="Loading chapter" />;
const CHAPTERS: { id: string; label: string; title: string; body: string; Component: ComponentType<ChapterProps> }[] = [
  {
    id: 'chapter-1', label: 'Where it stands', title: 'Where development stands',
    body: 'The official UNDP Human Development Index for all 47 economies, its three dimensions, and a world map you can switch between HDI, inequality-adjusted HDI, income, life expectancy and poverty.',
    Component: dynamic(() => import('../components/development/ChapterStands'), { ssr: false, loading }),
  },
  {
    id: 'chapter-2', label: 'In motion', title: 'Development in motion',
    body: 'An animated Gapminder chart from 1960, the biggest HDI risers and fallers, and whether poorer countries are catching up.',
    Component: dynamic(() => import('../components/development/ChapterMotion'), { ssr: false, loading }),
  },
  {
    id: 'chapter-3', label: 'Stories', title: 'Development stories',
    body: 'Korea and Ghana, Bangladesh and Pakistan, Poland and Ukraine: eight paired histories with the turning points marked.',
    Component: dynamic(() => import('../components/development/ChapterStories'), { ssr: false, loading }),
  },
  {
    id: 'chapter-4', label: 'Poverty', title: 'Poverty',
    body: 'The new $3.00, $4.20 and $8.30 lines, the depth of poverty, the prosperity gap, whether the poorest 40% are keeping up, and multidimensional poverty.',
    Component: dynamic(() => import('../components/development/ChapterPoverty'), { ssr: false, loading }),
  },
  {
    id: 'chapter-5', label: 'Inequality-adjusted', title: 'Inequality-adjusted development',
    body: 'How much human development each country loses to inequality, where that inequality sits, and the gaps between cities and the countryside and between regions.',
    Component: dynamic(() => import('../components/development/ChapterInequalityAdjusted'), { ssr: false, loading }),
  },
  {
    id: 'chapter-6', label: 'Human capital', title: 'Human capital',
    body: 'Schooling versus learning, learning poverty, the Human Capital Index and child stunting.',
    Component: dynamic(() => import('../components/development/ChapterHumanCapital'), { ssr: false, loading }),
  },
  {
    id: 'chapter-7', label: 'Health', title: 'Health and basic services',
    body: 'Child and maternal survival, health coverage and its cost to families, and access to electricity, water and sanitation.',
    Component: dynamic(() => import('../components/development/ChapterHealth'), { ssr: false, loading }),
  },
  {
    id: 'chapter-8', label: 'Gender', title: 'Gender',
    body: "UNDP's gender development and gender inequality indices, plus labour force, parliament, adolescent births and life expectancy gaps.",
    Component: dynamic(() => import('../components/development/ChapterGender'), { ssr: false, loading }),
  },
  {
    id: 'chapter-9', label: 'Structure & flows', title: 'Structural change and money flows',
    body: 'Farms to factories to services, urbanisation, the middle-income trap, and the remittances, aid and investment that flow in.',
    Component: dynamic(() => import('../components/development/ChapterStructure'), { ssr: false, loading }),
  },
  {
    id: 'chapter-10', label: 'Demographics', title: 'Demographics',
    body: 'The demographic transition, age structure, the dividend window and population to 2050.',
    Component: dynamic(() => import('../components/development/ChapterDemographics'), { ssr: false, loading }),
  },
  {
    id: 'chapter-11', label: 'Sustainability & SDGs', title: 'Sustainability and the SDGs',
    body: 'Carbon versus clean energy, the planetary-pressures-adjusted HDI, and a country-by-country grid of 12 SDG targets.',
    Component: dynamic(() => import('../components/development/ChapterSustainability'), { ssr: false, loading }),
  },
  {
    id: 'chapter-12', label: 'Beyond GDP', title: 'Beyond GDP',
    body: 'Social progress and happiness against income, and a build-your-own development index you can share.',
    Component: dynamic(() => import('../components/development/ChapterBeyondGdp'), { ssr: false, loading }),
  },
  {
    id: 'chapter-13', label: 'Compare & tools', title: 'Compare and tools',
    body: 'Peers, years behind the leader, 2030 projections, a radar comparison and full rankings.',
    Component: dynamic(() => import('../components/development/ChapterTools'), { ssr: false, loading }),
  },
];

const TOUR_STEPS: TourStep[] = CHAPTERS.map((c, i) => ({ chapter: `Chapter ${i + 1}`, title: c.title, body: c.body }));
const NAV = CHAPTERS.map((c) => ({ id: c.id, label: c.label }));
const DEFAULT_SELECTED: CountryKey[] = ['USA', 'Japan', 'Brazil', 'India', 'Nigeria', 'China'];

function parseSelected(param: string | null): CountryKey[] | null {
  if (!param) return null;
  const keys = param
    .split(',')
    .map((s) => COUNTRY_SLUGS[s.trim().toLowerCase()])
    .filter((k): k is CountryKey => !!k);
  return keys.length ? [...new Set(keys)].slice(0, 8) : null;
}

const HDR_ROWS = COUNTRY_KEYS.filter((k) => HDR[k]?.hdi != null).map((k) => ({ key: k, ...HDR[k]! }));
const HDR_SORTED = [...HDR_ROWS].sort((a, b) => b.hdi! - a.hdi!);
const BIGGEST_RISER = HDR_ROWS.map((r) => ({ key: r.key, delta: r.trend['2023'] != null && r.trend['1990'] != null ? r.trend['2023'] - r.trend['1990'] : null }))
  .filter((r): r is { key: CountryKey; delta: number } => r.delta != null)
  .sort((a, b) => b.delta - a.delta)[0];
const MEDIAN_LOSS = median(HDR_ROWS.map((r) => r.ihdiLoss));

export default function DevelopmentPage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const [selected, setSelected] = useState<CountryKey[]>(DEFAULT_SELECTED);
  const { data: hero } = useDevSeries(['poverty300', 'population']);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDarkMode);
    root.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

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

  const extremePoor = useMemo(() => {
    let poor = 0;
    let pop = 0;
    for (const k of COUNTRY_KEYS) {
      const r = latestObs(hero.poverty300, k, 2010);
      const p = latestObs(hero.population, k);
      if (r && p) {
        poor += (r.value / 100) * p.value;
        pop += p.value;
      }
    }
    return pop ? { share: (poor / pop) * 100, people: poor } : null;
  }, [hero]);

  const t = {
    page: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    hero: isDarkMode
      ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-emerald-900/30 border-gray-700'
      : 'bg-gradient-to-br from-emerald-50 via-white to-sky-50 border-emerald-100',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    sec: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    muted: 'text-gray-500',
    link: isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-800',
  };
  const top = HDR_SORTED[0];
  const bottom = HDR_SORTED[HDR_SORTED.length - 1];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${t.page}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Breadcrumbs isDarkMode={isDarkMode} />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>The Development Ledger</div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 ${t.text}`}>How Far, How Fast, and for Whom</h1>
            <p className={`text-base sm:text-lg max-w-3xl ${t.sec}`}>
              Human development across 47 economies: the official UNDP Human Development Index and its inequality, gender and
              planetary adjustments, World Bank poverty at the new 2021-price lines, human capital, health, demographics and SDG
              progress, with a profile for every country. For how income itself is divided, see the{' '}
              <Link href="/inequality" className={`underline underline-offset-2 ${t.link}`}>
                Inequality Ledger
              </Link>
              .
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <SocialShareMenu title="The Development Ledger" isDarkMode={isDarkMode} />
            <ThemeToggle isDarkMode={isDarkMode} />
          </div>
        </div>

        <GuidedTour storageKey="development-tour" steps={TOUR_STEPS} isDarkMode={isDarkMode} ctaLabel="Take the tour of the 13 chapters" />

        <StalenessBanner
          lastUpdated={DEV_CURATED_LAST_UPDATED}
          label={`UNDP Human Development Report 2025 (data year ${HDR_DATA_YEAR}), PIP global distribution, UN WPP projections, SPI, WHR and MPI snapshots`}
          isDarkMode={isDarkMode}
          thresholdMonths={15}
        />

        <div className="mt-4">
          <ChapterMeta isDarkMode={isDarkMode} sourceIds={['undp-hdr', 'wb-development-suite', 'wb-poverty', 'development-curated']} flags={['curated', 'estimate']} />
        </div>

        <div id={slugify('Development Ledger key figures')} className={`rounded-2xl border p-4 sm:p-6 mb-6 ${t.hero}`}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat isDarkMode={isDarkMode} label="Highest HDI" value={top?.hdi?.toFixed(3) ?? '\u2014'} sub={top ? `${countryName(top.key)}, rank ${top.hdiRank} of 193` : ''} tone="text-emerald-500" />
            <Stat isDarkMode={isDarkMode} label="Lowest HDI" value={bottom?.hdi?.toFixed(3) ?? '\u2014'} sub={bottom ? `${countryName(bottom.key)}, rank ${bottom.hdiRank} of 193` : ''} tone="text-rose-500" />
            <Stat
              isDarkMode={isDarkMode}
              label="Below $3.00 a day"
              value={extremePoor ? `${extremePoor.share.toFixed(1)}%` : '\u2026'}
              sub={extremePoor ? `${(extremePoor.people / 1e6).toFixed(0)}m people, population-weighted` : 'awaiting World Bank'}
              tone="text-amber-500"
            />
            <Stat
              isDarkMode={isDarkMode}
              label="Biggest riser since 1990"
              value={BIGGEST_RISER ? `+${BIGGEST_RISER.delta.toFixed(3)}` : '\u2014'}
              sub={BIGGEST_RISER ? `${countryName(BIGGEST_RISER.key)} HDI; median inequality loss ${MEDIAN_LOSS?.toFixed(1)}%` : ''}
            />
          </div>
          <div className={`mt-4 flex items-center justify-between gap-3 flex-wrap text-xs ${t.muted}`}>
            <div className="flex-1 min-w-[240px]">
              Curated: UNDP HDR 2025 statistical annex (generated from the published CSV). Live: World Bank WDI and Poverty and
              Inequality Platform. Try the{' '}
              <Link href="/development/where-do-you-stand" className={`underline ${t.link}`}>
                global income calculator
              </Link>{' '}
              or open a{' '}
              <Link href="/development/india" className={`underline ${t.link}`}>
                country profile
              </Link>
              .
            </div>
            <DataDownloadButton
              isDarkMode={isDarkMode}
              filename="development-ledger-hdr"
              shareTitle="Development Ledger key figures"
              label="Data"
              getData={() =>
                HDR_ROWS.map(({ trend, ...r }) => ({
                  country: countryName(r.key),
                  ...r,
                  hdi1990: trend['1990'],
                  hdi2000: trend['2000'],
                  hdi2010: trend['2010'],
                }))
              }
            />
          </div>
        </div>

        <ChapterNav isDarkMode={isDarkMode} chapters={NAV} />

        {CHAPTERS.map(({ id, Component }, i) => (
          <div key={id} id={id} className="scroll-mt-16">
            {i < 2 ? (
              <Component isDarkMode={isDarkMode} selected={selected} onSelectedChange={updateSelected} />
            ) : (
              <LazyMount isDarkMode={isDarkMode} minHeightClassName="min-h-[700px] mb-14">
                <Component isDarkMode={isDarkMode} selected={selected} onSelectedChange={updateSelected} />
              </LazyMount>
            )}
          </div>
        ))}

        <RelatedPages currentPath="/development" isDarkMode={isDarkMode} />

        <footer className={`mt-16 pt-6 border-t text-xs ${t.muted} ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          HDI, IHDI, GDI, GII and PHDI from the UNDP Human Development Report 2025 (data year {HDR_DATA_YEAR}), generated by
          scripts/build-hdr.ts. Poverty, human capital, health, gender, demographic and structural series fetched live from the World
          Bank API via our proxy. Social Progress Index, World Happiness Report, Global MPI, intergenerational mobility and subnational HDI
          values are rounded estimates. Learn the basics in the{' '}
          <Link href="/learn#lesson-development" className={`underline ${t.link}`}>
            development lesson
          </Link>{' '}
          and the{' '}
          <Link href="/guides/development-inequality" className={`underline ${t.link}`}>
            guide to development and inequality
          </Link>
          , or{' '}
          <Link href="/embed-gallery" className={`underline ${t.link}`}>
            embed these charts
          </Link>
          .
        </footer>
      </div>
    </div>
  );
}
