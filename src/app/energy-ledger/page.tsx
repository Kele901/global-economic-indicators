'use client';

// Energy Ledger — 8 chapters on the global energy system. Mirrors
// the AI/Trade/Migration/Debt/Climate/Defense/Health Ledger pattern.
// Live WB (EG.ELC.RNEW.ZS, EG.ELC.COAL.ZS) joined with curated IEA
// Electricity 2025, BNEF storage tracker, IGU LNG report, IAEA PRIS
// and EIA reserves snapshots.

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ThemeToggle from '../components/ThemeToggle';
import { fetchGlobalData } from '../services/worldbank';
import {
  CURATED_LAST_UPDATED,
  ELECTRICITY_MIX_2023,
  STORAGE_BUILDOUT_2015_2030,
  LNG_FLOWS_2023,
  NUCLEAR_STATUS_2025,
  RESERVES_2024,
  ENERGY_INTENSITY_2023,
  CAPACITY_FACTORS_2023,
} from '../services/energyCurated';
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

const skeleton = (label: string, height?: string) => {
  const Loading = () => <SkeletonCard height={height} label={label} />;
  return Loading;
};

const EnergyTicker            = dynamic(() => import('../components/EnergyTicker'),            { ssr: false, loading: skeleton('Loading energy ticker', 'h-[64px]') });
const EnergyDependenceChart   = dynamic(() => import('../components/EnergyDependenceChart'),   { ssr: false, loading: skeleton('Loading import dependence', 'h-[400px] sm:h-[520px]') });
const ElectricityMixChart     = dynamic(() => import('../components/ElectricityMixChart'),     { ssr: false, loading: skeleton('Loading electricity mix') });
const ElectricityMixTreemap   = dynamic(() => import('../components/ElectricityMixTreemap'),   { ssr: false, loading: skeleton('Loading generation composition', 'h-[380px]') });
const StorageBuildoutChart    = dynamic(() => import('../components/StorageBuildoutChart'),    { ssr: false, loading: skeleton('Loading storage build-out') });
const LngFlowsTable           = dynamic(() => import('../components/LngFlowsTable'),           { ssr: false, loading: skeleton('Loading LNG flows') });
const NuclearStatusTable      = dynamic(() => import('../components/NuclearStatusTable'),      { ssr: false, loading: skeleton('Loading nuclear status') });
const CapacityFactorGrid      = dynamic(() => import('../components/CapacityFactorGrid'),      { ssr: false, loading: skeleton('Loading capacity factors') });
const ReservesRankingChart    = dynamic(() => import('../components/ReservesRankingChart'),    { ssr: false, loading: skeleton('Loading reserves ranking') });
const EnergyIntensityQuadrant = dynamic(() => import('../components/EnergyIntensityQuadrant'), { ssr: false, loading: skeleton('Loading energy intensity') });

type GlobalData = Awaited<ReturnType<typeof fetchGlobalData>>;

const TOUR_STEPS: TourStep[] = [
  { chapter: 'Chapter 1', title: 'Who depends on whom', body: 'Live net energy imports for every country in the roster. Positive means it buys more energy than it produces; negative means it sells the surplus. Bar colour carries the renewable share.' },
  { chapter: 'Chapter 2', title: 'The generation mix', body: 'Where each economy\'s electricity actually comes from. Geology sets part of it (hydro in Norway, gas in Qatar) and policy sets the rest (nuclear in France, coal in India).' },
  { chapter: 'Chapter 3', title: 'Storage', body: 'Grid batteries went from novelty to infrastructure in about five years. This is the chart that decides how far renewables can go.' },
  { chapter: 'Chapter 4', title: 'LNG', body: 'The post-2022 redraw: US LNG displaced Qatar as the largest exporter and Europe displaced Asia as the premium buyer.' },
  { chapter: 'Chapter 5', title: 'Nuclear', body: 'Operable reactors, the build pipeline and each country\'s current policy stance. China dominates the queue.' },
  { chapter: 'Chapter 6', title: 'Capacity factors', body: 'What share of nameplate capacity each source actually delivers over a year, next to its lifecycle CO₂ intensity. This is why storage exists.' },
  { chapter: 'Chapter 7', title: 'Reserves', body: 'Oil, gas and coal on a common barrel-of-oil-equivalent basis — the flip side of Chapter 1\'s importers.' },
  { chapter: 'Chapter 8', title: 'Energy intensity', body: 'Primary energy per unit of GDP. Lower is more efficient, and the year-on-year change shows who is actually improving.' },
];

function ChapterHeader({ isDarkMode, chapter, title, subtitle, share = true }: { isDarkMode: boolean; chapter: string; title: string; subtitle: string; share?: boolean; }) {
  return (
    <div className="mb-6" id={share ? slugify(title) : undefined}>
      <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>{chapter}</div>
      <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
        <h2 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
        {share && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <SocialShareMenu title={title} isDarkMode={isDarkMode} />
          </div>
        )}
      </div>
      <p className={`text-sm sm:text-base max-w-3xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</p>
    </div>
  );
}

export default function EnergyLedgerPage() {
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
        const wb = await fetchGlobalData().catch(err => { console.warn('[energy-ledger] fetchGlobalData failed', err); return null; });
        if (!cancelled) setData(wb);
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const storage2030 = useMemo(() => STORAGE_BUILDOUT_2015_2030.find(p => p.year === 2030)?.world ?? 0, []);
  const storage2024 = useMemo(() => STORAGE_BUILDOUT_2015_2030.find(p => p.year === 2024)?.world ?? 0, []);
  const cnUnderConstruction = useMemo(() => NUCLEAR_STATUS_2025.find(r => r.code === 'CHN')?.underConstruction ?? 0, []);
  const topOilReserves = useMemo(() => RESERVES_2024[0]?.oilReservesBnBarrels ?? 0, []);
  const bestIntensity = useMemo(() => Math.min(...ENERGY_INTENSITY_2023.map(r => r.kgoePer1000UsdPpp)), []);

  const pageBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const heroBg = isDarkMode
    ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-amber-900/30 border-gray-700'
    : 'bg-gradient-to-br from-amber-50 via-white to-orange-50 border-amber-100';
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';

  return (
    <div className={`min-h-screen transition-colors duration-200 ${pageBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Breadcrumbs isDarkMode={isDarkMode} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>The Energy Ledger</div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 ${textPrimary}`}>Mix, Storage, Flows, Reserves</h1>
            <p className={`text-base sm:text-lg max-w-3xl ${textSec}`}>
              The physical energy system that powers everything on the site. Electricity
              generation mix, battery storage build-out, LNG flows, nuclear reactor status,
              capacity factors, hydrocarbon reserves and per-GDP energy intensity. Live
              World Bank energy indicators joined with curated IEA, BNEF, IGU, IAEA and
              EIA snapshots.
            </p>
          </div>
          <ThemeToggle isDarkMode={isDarkMode} className="self-end sm:self-auto" />
        </div>

        <GuidedTour
          storageKey="tour-energy-ledger"
          steps={TOUR_STEPS}
          isDarkMode={isDarkMode}
          ctaLabel="Take the 60-second tour of the 8 chapters"
        />

        <StalenessBanner
          lastUpdated={CURATED_LAST_UPDATED}
          label="IEA Electricity 2025, BNEF Global Storage Outlook 2024, IGU World LNG Report 2024, IAEA PRIS Sep-2025, EIA International Energy Statistics 2024"
          isDarkMode={isDarkMode}
        />

        <div className="flex items-center gap-2 mb-4 mt-4 flex-wrap">
          <ChartMeta sourceId="wb-energy-dependence" isDarkMode={isDarkMode} />
          <ChartMeta sourceId="energy-ledger-curated" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="curated" isDarkMode={isDarkMode} />
        </div>

        <div id={slugify('Energy Ledger key figures')} className={`rounded-2xl border p-4 sm:p-6 mb-10 ${heroBg}`}>
          <div className={`text-[11px] uppercase tracking-wider mb-3 ${textMuted}`}>Energy Ledger key figures</div>
          <EnergyTicker isDarkMode={isDarkMode} />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Battery storage 2024→30</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 text-emerald-500`}>{storage2024}→{storage2030} GWh</div>
              <div className={`text-[11px] ${textMuted}`}>BNEF Global Storage Outlook</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>China nuclear pipeline</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>{cnUnderConstruction}</div>
              <div className={`text-[11px] ${textMuted}`}>reactors under construction</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Top oil reserves</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 text-amber-500`}>{topOilReserves.toFixed(0)}Bbbl</div>
              <div className={`text-[11px] ${textMuted}`}>Venezuela (EIA/BP 2024)</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Best energy intensity</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 text-emerald-500`}>{bestIntensity} kgoe</div>
              <div className={`text-[11px] ${textMuted}`}>per $1,000 GDP-PPP (Switzerland)</div>
            </div>
          </div>

          <div className={`mt-4 flex items-center justify-between gap-3 flex-wrap text-xs ${textMuted}`}>
            <div className="flex-1 min-w-[240px]">
              Live: WB EG.ELC.RNEW.ZS (renewables share), EG.ELC.COAL.ZS (coal share), EG.USE.COMM.FO.ZS (fossil share).
              Curated: IEA Electricity 2025, BNEF Global Storage Outlook 2024, IGU World LNG Report 2024, IAEA PRIS Sep-2025, EIA International Energy Statistics 2024.
            </div>
            <DataDownloadButton
              isDarkMode={isDarkMode}
              filename="energy-ledger-data"
              label="Data"
              shareTitle="Energy Ledger key figures"
              getData={() => {
                const rows: Record<string, unknown>[] = [];
                ELECTRICITY_MIX_2023.forEach(r => rows.push({ series: 'Electricity mix 2023', ...r }));
                STORAGE_BUILDOUT_2015_2030.forEach(r => rows.push({ series: 'Storage build-out', ...r }));
                LNG_FLOWS_2023.forEach(r => rows.push({ series: 'LNG flows 2023', ...r }));
                NUCLEAR_STATUS_2025.forEach(r => rows.push({ series: 'Nuclear status 2025', ...r }));
                RESERVES_2024.forEach(r => rows.push({ series: 'Reserves 2024', ...r }));
                ENERGY_INTENSITY_2023.forEach(r => rows.push({ series: 'Energy intensity 2023', ...r }));
                CAPACITY_FACTORS_2023.forEach(r => rows.push({ series: 'Capacity factors 2023', ...r }));
                return rows;
              }}
            />
          </div>
        </div>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 1"
            title="Who Depends on Whom"
            share={false}
            subtitle="Live net energy imports as a share of energy use. Above zero the country is buying energy in; below zero it is selling a surplus. Bar colour carries the renewable share of final consumption, which is the only thing that structurally shrinks the exposure." />
          <EnergyDependenceChart
            isDarkMode={isDarkMode}
            shareTitle="Who Depends on Whom"
            netEnergyImports={data?.netEnergyImports}
            renewableEnergy={data?.renewableEnergy}
          />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 2"
            title="Electricity Generation Mix"
            subtitle="Stacked bars showing where each major economy's electricity actually comes from in 2023. The mix reflects both geology (hydro-rich Norway, gas-rich Qatar) and policy (nuclear-heavy France, coal-heavy India)." />
          <ElectricityMixChart isDarkMode={isDarkMode} />
          <div className="mt-6">
            <ElectricityMixTreemap isDarkMode={isDarkMode} />
          </div>
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 3"
            title="The Battery Storage Revolution"
            subtitle="BNEF Global Storage Outlook: cumulative operational GWh 2015-2030. Grid-scale batteries went from novelty to essential in five years." />
          <StorageBuildoutChart isDarkMode={isDarkMode} />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 4"
            title="LNG Flows Redrawn"
            subtitle="Post-Ukraine, US LNG dethroned Qatar as the world's biggest exporter; Europe replaced Asia as the biggest premium buyer. Filter by exporter to see specific flow patterns." />
          <LngFlowsTable isDarkMode={isDarkMode} />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 5"
            title="The Nuclear Restart"
            subtitle="IAEA PRIS September 2025: operable reactors + build pipeline + policy stance. China dominates the build queue; Germany's phase-out completed in 2023; Italy is putting new nuclear back on the ballot." />
          <NuclearStatusTable isDarkMode={isDarkMode} />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 6"
            title="Capacity Factors"
            subtitle="What share of nameplate capacity each source actually delivers over a year, alongside its lifecycle CO₂ intensity. Nuclear runs flat-out; solar sits idle overnight; storage exists to bridge the gap." />
          <CapacityFactorGrid isDarkMode={isDarkMode} />
        </section>

        <LazyMount isDarkMode={isDarkMode}>
          <section className="mb-14">
            <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 7"
              title="Reserves Reranked"
              subtitle="Oil + gas + coal converted to a common barrel-of-oil-equivalent basis. Russia and the US lead on combined reserves; Venezuela and Saudi Arabia lead on crude alone; China and Australia hold most of the coal." />
            <ReservesRankingChart isDarkMode={isDarkMode} />
          </section>

          <section className="mb-14">
            <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 8"
              title="Energy Intensity per GDP"
              subtitle="Primary energy per unit of GDP-PPP. Lower = more efficient. YoY change shows which economies are getting more efficient (bottom-left quadrant). Middle East petrostates sit in the top-right." />
            <EnergyIntensityQuadrant isDarkMode={isDarkMode} />
          </section>
        </LazyMount>

        <RelatedPages currentPath="/energy-ledger" isDarkMode={isDarkMode} />

        <footer className={`mt-16 pt-6 border-t text-xs ${textMuted} ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          Live energy data via World Bank API proxy. Curated snapshots refreshed {CURATED_LAST_UPDATED}.
          Electricity mix from IEA Electricity 2025, storage build-out from BNEF Global Storage Outlook 2024,
          LNG flows from IGU World LNG Report 2024, nuclear status from IAEA PRIS Sep-2025, reserves from
          EIA International Energy Statistics 2024 + BP Statistical Review, capacity factors from IEA WEO 2024,
          intensity from IEA Efficiency 2024.
          {loading ? ' Loading…' : ''}
        </footer>
      </div>
    </div>
  );
}
