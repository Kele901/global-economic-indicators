'use client';

// Development profile for one economy: UNDP HDI and its components, the
// country's trend against its income-group peers, poverty lines, gender,
// demographics, SDG progress, years behind the leader and projections.

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import ThemeToggle from '../../components/ThemeToggle';
import Breadcrumbs from '../../components/Breadcrumbs';
import StalenessBanner from '../../components/StalenessBanner';
import LazyMount from '../../components/LazyMount';
import SocialShareMenu from '../../components/SocialShareMenu';
import DataDownloadButton from '../../components/DataDownloadButton';
import { COUNTRY_FLAGS } from '../../components/CountryFlag';
import { ChapterMeta, Panel, Stat, countryName, fmt, theme } from '../../components/development/ui';
import { hdrDimensions, rowsToCsv } from '../../components/development/data';
import {
  COUNTRY_KEYS,
  COUNTRY_DISPLAY_NAMES,
  COUNTRY_KEY_TO_SLUG,
  COUNTRY_SLUGS,
  getRegionFor,
  type CountryKey,
} from '../../utils/countryMappings';
import {
  DEVELOPMENT_STORIES,
  DEV_CURATED_LAST_UPDATED,
  HCI_SNAPSHOT,
  HDR,
  HDR_DATA_YEAR,
  MPI,
  getIncomeGroup,
  getPeers,
  latestObs,
} from '../../services/developmentCurated';
import type { CountryData } from '../../services/worldbank';
import { useDevSeries, type DevAlias } from '../useDevelopmentData';

const TrendLines = dynamic(() => import('../../components/development/charts').then((m) => m.TrendLines), { ssr: false });
const PovertyLinesChart = dynamic(() => import('../../components/development/ChapterPoverty').then((m) => m.PovertyLinesChart), { ssr: false });
const DemographicTransition = dynamic(() => import('../../components/development/ChapterDemographics').then((m) => m.DemographicTransition), { ssr: false });
const AgeStructure = dynamic(() => import('../../components/development/ChapterDemographics').then((m) => m.AgeStructure), { ssr: false });
const SdgGrid = dynamic(() => import('../../components/development/ChapterSustainability').then((m) => m.SdgGrid), { ssr: false });
const StoryCard = dynamic(() => import('../../components/development/ChapterStories').then((m) => m.StoryCard), { ssr: false });
const PeersPanel = dynamic(() => import('../../components/development/tools').then((m) => m.PeersPanel), { ssr: false });
const YearsBehindTable = dynamic(() => import('../../components/development/tools').then((m) => m.YearsBehindTable), { ssr: false });
const ProjectionsTable = dynamic(() => import('../../components/development/tools').then((m) => m.ProjectionsTable), { ssr: false });

const PROFILE_ALIASES: DevAlias[] = [
  'lifeExpectancy', 'under5Mortality', 'maternalMortality', 'gdpPcConst', 'gdpPerCapitaPPP', 'population',
  'poverty300', 'poverty420', 'poverty830', 'povertyGap', 'gini',
  'primaryCompletion', 'internetUsers', 'uhcCoverage', 'stunting', 'womenParliament', 'basicWater', 'basicSanitation',
  'electricityAccess', 'accountOwnership', 'learningPoverty',
  'birthRate', 'deathRate', 'fertilityRate', 'popAge0_14', 'popAge15_64', 'popAge65Plus', 'dependencyRatio',
  'femaleLaborForce', 'maleLaborForce', 'lifeExpFemale', 'lifeExpMale', 'adolescentFertility',
];

function hdrSeries(keys: CountryKey[]): CountryData[] {
  const years = new Set<string>();
  keys.forEach((k) => Object.keys(HDR[k]?.trend ?? {}).forEach((y) => years.add(y)));
  return [...years]
    .sort()
    .map((y) => {
      const row: Record<string, number> = { year: Number(y) };
      keys.forEach((k) => {
        const v = HDR[k]?.trend[y];
        if (v != null) row[k] = v;
      });
      return row as unknown as CountryData;
    });
}

export default function DevelopmentProfilePage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const params = useParams();
  const slug = (params?.slug as string) ?? '';
  const key = COUNTRY_SLUGS[slug.toLowerCase()];
  const r = key ? HDR[key] : undefined;
  const t = theme(isDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const { data, loading } = useDevSeries(PROFILE_ALIASES);
  const peers = useMemo(() => (key ? getPeers(key, 4) : []), [key]);
  const trend = useMemo(() => (key ? hdrSeries([key, ...peers]) : []), [key, peers]);

  const pageBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';

  if (!key || !r) {
    return (
      <div className={`min-h-screen ${pageBg}`}>
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className={`text-2xl font-bold mb-3 ${t.text}`}>Development profile not found</h1>
          <p className={`mb-6 ${t.textSec}`}>We don&apos;t have a development profile for &ldquo;{slug}&rdquo;.</p>
          <Link href="/development" className={`underline ${t.accent}`}>Back to the Development Ledger</Link>
        </div>
      </div>
    );
  }

  const name = COUNTRY_DISPLAY_NAMES[key];
  const Flag = COUNTRY_FLAGS[key];
  const region = getRegionFor(key) ?? 'Other';
  const group = getIncomeGroup(key);
  const dims = hdrDimensions(key);
  const hci = HCI_SNAPSHOT[key];
  const mpi = MPI[key];
  const stories = DEVELOPMENT_STORIES.filter((s) => (s.countries as readonly string[]).includes(key));
  const hdi1990 = r.trend['1990'];
  const ordered = [...COUNTRY_KEYS].filter((k) => HDR[k]).sort((a, b) => COUNTRY_DISPLAY_NAMES[a].localeCompare(COUNTRY_DISPLAY_NAMES[b]));
  const idx = ordered.indexOf(key);
  const prev = ordered[(idx - 1 + ordered.length) % ordered.length]!;
  const next = ordered[(idx + 1) % ordered.length]!;
  const latest = (a: DevAlias) => latestObs(data[a], key);

  const genderRows: [string, string, string][] = [
    ['HDI', fmt.idx(r.hdiFemale), fmt.idx(r.hdiMale)],
    ['Life expectancy', fmt.n1(latest('lifeExpFemale')?.value), fmt.n1(latest('lifeExpMale')?.value)],
    ['Labour force participation (%)', fmt.n1(latest('femaleLaborForce')?.value ?? r.labourForceFemale), fmt.n1(latest('maleLaborForce')?.value ?? r.labourForceMale)],
    ['Some secondary education (%, 25+)', fmt.n1(r.secondaryEdFemale), fmt.n1(r.secondaryEdMale)],
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${pageBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Breadcrumbs isDarkMode={isDarkMode} />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${t.accent}`}>
              Development Ledger {'\u00b7'} {region}
            </div>
            <h1 className={`flex items-center gap-3 text-3xl sm:text-4xl font-bold mb-2 ${t.text}`}>
              {Flag && <Flag className="w-10 h-7 rounded shadow-sm" />}
              {name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {r.hdiRank != null && <span className={`px-2 py-0.5 rounded font-medium text-white bg-emerald-600`}>HDI rank {r.hdiRank} of 193</span>}
              {group && <span className={`px-2 py-0.5 rounded ${t.chip}`}>{group}</span>}
              {r.gdiGroup != null && <span className={`px-2 py-0.5 rounded ${t.chip}`}>GDI group {r.gdiGroup}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <SocialShareMenu title={`${name}: development profile`} isDarkMode={isDarkMode} />
            <ThemeToggle isDarkMode={isDarkMode} />
          </div>
        </div>

        <StalenessBanner lastUpdated={DEV_CURATED_LAST_UPDATED} label="UNDP Human Development Report snapshot" isDarkMode={isDarkMode} thresholdMonths={15} />

        <div className="mb-6">
          <ChapterMeta
            isDarkMode={isDarkMode}
            sourceIds={['undp-hdr', 'wb-development-suite', 'development-curated']}
            flags={['curated']}
            download={{
              filename: `development-${COUNTRY_KEY_TO_SLUG[key]}`,
              title: `${name} development data`,
              getData: () => rowsToCsv(Object.fromEntries(PROFILE_ALIASES.map((a) => [a, data[a]])), [key]),
            }}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <Stat isDarkMode={isDarkMode} label={`Human Development Index (${HDR_DATA_YEAR})`} value={fmt.idx(r.hdi)} sub={hdi1990 != null && r.hdi != null ? `${r.hdi >= hdi1990 ? '+' : ''}${(r.hdi - hdi1990).toFixed(3)} since 1990` : undefined} />
          <Stat isDarkMode={isDarkMode} label="Inequality-adjusted HDI" value={fmt.idx(r.ihdi)} sub={r.ihdiLoss != null ? `${r.ihdiLoss.toFixed(1)}% lost to inequality` : 'Not computed'} />
          <Stat isDarkMode={isDarkMode} label="Life expectancy" value={`${fmt.n1(r.lifeExpectancy)} yrs`} sub={`Expected schooling ${fmt.n1(r.expectedSchooling)} yrs`} />
          <Stat isDarkMode={isDarkMode} label="GNI per person (2021 PPP $)" value={fmt.usd(r.gniPerCapita)} sub={`Mean schooling ${fmt.n1(r.meanSchooling)} yrs`} />
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          <Panel isDarkMode={isDarkMode} title="HDI over Time" subtitle={`${name} against its closest income-group peers, 1990\u2013${HDR_DATA_YEAR}.`} className="lg:col-span-2">
            <TrendLines isDarkMode={isDarkMode} series={trend} keys={[key, ...peers]} fromYear={1990} format={(v) => v.toFixed(3)} height={300} />
          </Panel>
          <Panel isDarkMode={isDarkMode} title="The Three Dimensions" subtitle="Each scaled 0 to 1 against UNDP goalposts. The HDI is their geometric mean, so a weak dimension pulls it down more than an average would.">
            {dims ? (
              <div className="space-y-3">
                {([['Health', dims.health, 'bg-rose-500'], ['Education', dims.education, 'bg-sky-500'], ['Income', dims.income, 'bg-amber-500']] as const).map(([label, v, color]) => (
                  <div key={label}>
                    <div className={`flex justify-between text-xs mb-1 ${t.textSec}`}><span>{label}</span><span className={`font-mono ${t.text}`}>{v.toFixed(3)}</span></div>
                    <div className={`h-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className={`h-2 rounded ${color}`} style={{ width: `${Math.min(100, v * 100)}%` }} />
                    </div>
                  </div>
                ))}
                {hci && <p className={`text-xs pt-2 ${t.textMuted}`}>World Bank Human Capital Index ({hci.year}): <span className={`font-mono ${t.text}`}>{hci.value.toFixed(2)}</span>. A child born today will be {Math.round(hci.value * 100)}% as productive as with full health and education.</p>}
              </div>
            ) : (
              <p className={`text-sm ${t.textMuted}`}>Components not reported.</p>
            )}
          </Panel>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-8">
          <Panel isDarkMode={isDarkMode} title="Peers" subtitle={`${name} against economies in the same World Bank income group, same region first.`}>
            <PeersPanel isDarkMode={isDarkMode} data={data} country={key} />
          </Panel>
          <Panel isDarkMode={isDarkMode} title="Years Behind" subtitle="How many years ago the benchmark reached the level this country is at today.">
            <YearsBehindTable isDarkMode={isDarkMode} data={data} country={key} />
          </Panel>
        </div>

        <LazyMount minHeightClassName="min-h-[400px]" isDarkMode={isDarkMode}>
          <div className="grid lg:grid-cols-2 gap-4 mb-8">
            <Panel isDarkMode={isDarkMode} title="Poverty Lines" subtitle="Share of people living below the World Bank's $3.00, $4.20 and $8.30 a day lines (2021 PPP).">
              {loading ? <div className="h-[300px]" /> : <PovertyLinesChart isDarkMode={isDarkMode} data={data} country={key} />}
              {mpi && (
                <p className={`text-xs mt-3 ${t.textMuted}`}>
                  Multidimensional poverty (survey {mpi.surveyYear}): {mpi.headcount.toFixed(1)}% of people are deprived across health, education and living standards, with an average intensity of {mpi.intensity.toFixed(0)}%.
                </p>
              )}
            </Panel>
            <Panel isDarkMode={isDarkMode} title="Gender" subtitle={`Women against men. Gender Inequality Index ${fmt.idx(r.gii)}${r.giiRank != null ? ` (rank ${r.giiRank})` : ''}; women hold ${fmt.n1(latest('womenParliament')?.value ?? r.parliamentFemale)}% of parliamentary seats.`}>
              <table className={`w-full text-sm ${t.text}`}>
                <thead>
                  <tr className={`text-xs ${t.textMuted}`}>
                    <th className="text-left font-medium py-1">Indicator</th>
                    <th className="text-right font-medium py-1">Women</th>
                    <th className="text-right font-medium py-1">Men</th>
                  </tr>
                </thead>
                <tbody>
                  {genderRows.map(([label, f, m]) => (
                    <tr key={label} className={`border-t ${t.border}`}>
                      <td className="py-1.5">{label}</td>
                      <td className="py-1.5 text-right font-mono">{f}</td>
                      <td className="py-1.5 text-right font-mono">{m}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={`text-xs mt-3 ${t.textMuted}`}>
                Maternal mortality {fmt.n0(r.maternalMortality)} per 100,000 births; adolescent births {fmt.n1(r.adolescentBirths)} per 1,000 women aged 15{'\u2013'}19.
              </p>
            </Panel>
          </div>
        </LazyMount>

        <LazyMount minHeightClassName="min-h-[400px]" isDarkMode={isDarkMode}>
          <div className="grid lg:grid-cols-2 gap-4 mb-8">
            <Panel isDarkMode={isDarkMode} title="Demographic Transition" subtitle="Birth and death rates per 1,000 people. The gap between them is natural population growth.">
              {loading ? <div className="h-[300px]" /> : <DemographicTransition isDarkMode={isDarkMode} data={data} country={key} />}
            </Panel>
            <Panel isDarkMode={isDarkMode} title="Age Structure" subtitle="Population by broad age band, latest year.">
              <AgeStructure isDarkMode={isDarkMode} data={data} country={key} />
            </Panel>
          </div>
        </LazyMount>

        <LazyMount minHeightClassName="min-h-[400px]" isDarkMode={isDarkMode}>
          <div className="grid lg:grid-cols-2 gap-4 mb-8">
            <Panel isDarkMode={isDarkMode} title="SDG Progress" subtitle="Twelve 2030 targets, projected forward from the last ten years of data.">
              <SdgGrid isDarkMode={isDarkMode} data={data} keys={[key]} />
            </Panel>
            <Panel isDarkMode={isDarkMode} title="Projections" subtitle="Straight-line projection from the last ten years. A trend, not a forecast.">
              <ProjectionsTable isDarkMode={isDarkMode} data={data} country={key} />
            </Panel>
          </div>
        </LazyMount>

        {stories.length > 0 && (
          <LazyMount minHeightClassName="min-h-[400px]" isDarkMode={isDarkMode}>
            <div className="space-y-4 mb-8">
              {stories.map((s) => <StoryCard key={s.id} isDarkMode={isDarkMode} story={s} />)}
            </div>
          </LazyMount>
        )}

        <div className={`rounded-lg border p-4 mb-8 flex flex-wrap gap-x-6 gap-y-2 text-sm ${t.card}`}>
          <Link href={`/country/${COUNTRY_KEY_TO_SLUG[key]}`} className={`hover:underline ${t.accent}`}>{name} economy</Link>
          <Link href={`/politics-ledger/${COUNTRY_KEY_TO_SLUG[key]}`} className={`hover:underline ${t.accent}`}>{name} politics</Link>
          <Link href="/inequality" className={`hover:underline ${t.accent}`}>Inequality Ledger</Link>
          <Link href={`/development/where-do-you-stand?c=${COUNTRY_KEY_TO_SLUG[key]}`} className={`hover:underline ${t.accent}`}>Where does your income stand?</Link>
          <DataDownloadButton
            isDarkMode={isDarkMode}
            size="sm"
            label="HDI trend CSV"
            filename={`hdi-trend-${COUNTRY_KEY_TO_SLUG[key]}`}
            shareTitle={`${name} HDI trend`}
            getData={() => Object.entries(r.trend).map(([year, hdi]) => ({ country: name, year: Number(year), hdi }))}
          />
        </div>

        <nav className={`flex justify-between text-sm ${t.textSec}`} aria-label="Other profiles">
          <Link href={`/development/${COUNTRY_KEY_TO_SLUG[prev]}`} className="hover:underline">{'\u2190'} {countryName(prev)}</Link>
          <Link href="/development" className="hover:underline">All 47 economies</Link>
          <Link href={`/development/${COUNTRY_KEY_TO_SLUG[next]}`} className="hover:underline">{countryName(next)} {'\u2192'}</Link>
        </nav>
      </div>
    </div>
  );
}
