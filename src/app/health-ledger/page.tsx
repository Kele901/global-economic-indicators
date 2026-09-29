'use client';

// Health Ledger — 8 chapters on global health. Mirrors the AI /
// Trade / Migration / Debt / Climate / Defense Ledger pattern.
// Live WB indicators (SH.XPD.CHEX.GD.ZS, SP.DYN.LE00.IN,
// SH.DYN.MORT) joined with curated WHO GHED, GBD, JHU GHS Index,
// Pharma R&D and WHO Mental Health Atlas snapshots.

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { fetchGlobalData } from '../services/worldbank';
import {
  CURATED_LAST_UPDATED,
  SPEND_OUTCOME_2023,
  PHARMA_TOP_15_RD_2024,
  MENTAL_HEALTH_2020,
  DISEASE_BURDEN_1990_2023,
} from '../services/healthCurated';
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

const HealthSpendTicker         = dynamic(() => import('../components/HealthSpendTicker'),         { ssr: false, loading: skeleton('Loading health spend ticker', 'h-[64px]') });
const HealthCommitmentChart     = dynamic(() => import('../components/HealthCommitmentChart'),     { ssr: false, loading: skeleton('Loading health commitment chart', 'h-[440px] sm:h-[560px]') });
const SpendVsOutcomeChart       = dynamic(() => import('../components/SpendVsOutcomeChart'),       { ssr: false, loading: skeleton('Loading spend vs outcome') });
const LifeExpectancyDivergenceChart = dynamic(() => import('../components/LifeExpectancyDivergenceChart'), { ssr: false, loading: skeleton('Loading life-expectancy divergence') });
const PandemicReadinessGrid     = dynamic(() => import('../components/PandemicReadinessGrid'),     { ssr: false, loading: skeleton('Loading pandemic readiness') });
const PharmaConcentrationTable  = dynamic(() => import('../components/PharmaConcentrationTable'),  { ssr: false, loading: skeleton('Loading pharma concentration') });
const DualBurdenChart           = dynamic(() => import('../components/DualBurdenChart'),           { ssr: false, loading: skeleton('Loading dual burden') });
const MentalHealthGapTable      = dynamic(() => import('../components/MentalHealthGapTable'),      { ssr: false, loading: skeleton('Loading mental-health gap') });
const DiseaseBurdenTimeline     = dynamic(() => import('../components/DiseaseBurdenTimeline'),     { ssr: false, loading: skeleton('Loading disease burden timeline') });

type GlobalData = Awaited<ReturnType<typeof fetchGlobalData>>;

const TOUR_STEPS: TourStep[] = [
  { chapter: 'Chapter 1', title: 'What each country commits', body: 'Live health spending as a share of GDP for the whole roster, with life expectancy overlaid. The two lines pointedly do not track each other.' },
  { chapter: 'Chapter 2', title: 'Spending against outcomes', body: 'The same question in per-capita dollars. Most countries sit on a curve of diminishing returns; the US pays far more and lives shorter.' },
  { chapter: 'Chapter 3', title: 'Divergence', body: 'Life expectancy by World Bank income group since 1990. Convergence stalled after 2015 and reversed during COVID.' },
  { chapter: 'Chapter 4', title: 'Preparedness', body: 'Johns Hopkins GHS Index and WHO JEE capacity scores — and why the highest-ranked countries still failed in 2020.' },
  { chapter: 'Chapter 5', title: 'The pharma industry', body: 'Who actually funds drug discovery: the top 15 firms by R&D spend, concentrated in the US, Europe and Japan.' },
  { chapter: 'Chapter 6', title: 'The double burden', body: 'Obesity and undernutrition rising in the same populations at the same time.' },
  { chapter: 'Chapter 7', title: 'The mental-health gap', body: 'The share of people with a diagnosable disorder who get no treatment — roughly half in the OECD, over 90% in low-income countries.' },
  { chapter: 'Chapter 8', title: 'The burden shift', body: 'Communicable-disease DALYs collapsed since 1990 while non-communicable disease held steady. That shift is what health systems now have to be built for.' },
];

function ChapterHeader({ isDarkMode, chapter, title, subtitle, share = true, shareSubject = 'chart' }: { isDarkMode: boolean; chapter: string; title: string; subtitle: string; share?: boolean; shareSubject?: 'chart' | 'dataset'; }) {
  return (
    <div id={share ? slugify(title) : undefined} className="mb-6">
      <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{chapter}</div>
      <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
        <h2 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
        {share && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <SocialShareMenu title={title} isDarkMode={isDarkMode} subject={shareSubject} />
          </div>
        )}
      </div>
      <p className={`text-sm sm:text-base max-w-3xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</p>
    </div>
  );
}

export default function HealthLedgerPage() {
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
        const wb = await fetchGlobalData().catch(err => { console.warn('[health-ledger] fetchGlobalData failed', err); return null; });
        if (!cancelled) setData(wb);
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const usSpendPerCap = useMemo(() => SPEND_OUTCOME_2023.find(r => r.code === 'USA')?.healthSpendPerCapUsd ?? 0, []);
  const oecdMedianSpend = useMemo(() => {
    const hics = SPEND_OUTCOME_2023.filter(r => ['DEU','FRA','GBR','JPN','KOR','ITA','ESP','NLD','SWE','NOR','CHE','AUS','CAN'].includes(r.code));
    const sorted = hics.map(h => h.healthSpendPerCapUsd).sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }, []);
  const pharmaTop15Total = useMemo(() => PHARMA_TOP_15_RD_2024.reduce((s, f) => s + f.rdBillionsUsd, 0), []);
  const worstMhGap = useMemo(() => {
    const worst = [...MENTAL_HEALTH_2020].sort((a, b) => b.treatmentGapPct - a.treatmentGapPct)[0];
    return worst;
  }, []);

  const pageBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const heroBg = isDarkMode
    ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-emerald-900/30 border-gray-700'
    : 'bg-gradient-to-br from-emerald-50 via-white to-blue-50 border-emerald-100';
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
            <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              The Health Ledger
            </div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 ${textPrimary}`}>
              Spending, Outcomes, Resilience
            </h1>
            <p className={`text-base sm:text-lg max-w-3xl ${textSec}`}>
              How much the world spends on health, what it gets in return, and where the
              gaps still are. World Bank health-expenditure and life-expectancy series
              joined with WHO GHED, IHME Global Burden of Disease, Johns Hopkins GHS,
              Pharma Intelligence R&amp;D and WHO Mental Health Atlas snapshots.
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
          storageKey="tour-health-ledger"
          steps={TOUR_STEPS}
          isDarkMode={isDarkMode}
          ctaLabel="Take the 60-second tour of the 8 chapters"
        />

        <StalenessBanner
          lastUpdated={CURATED_LAST_UPDATED}
          label="WHO GHED 2023, IHME GBD 2023, JHU GHS Index 2021 + JEE, Pharma Intelligence R&D 2024, WHO Mental Health Atlas 2020, IEA and UN DESA 2024 snapshots"
          isDarkMode={isDarkMode}
        />

        <div className="flex items-center gap-2 mb-4 mt-4 flex-wrap">
          <ChartMeta sourceId="wb-health-spend" isDarkMode={isDarkMode} />
          <ChartMeta sourceId="health-ledger-curated" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="curated" isDarkMode={isDarkMode} />
        </div>

        <div id={slugify('Health Ledger key figures')} className={`rounded-2xl border p-4 sm:p-6 mb-10 ${heroBg}`}>
          <HealthSpendTicker isDarkMode={isDarkMode} />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>US health spend / cap</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 text-rose-500`}>${usSpendPerCap.toLocaleString()}</div>
              <div className={`text-[11px] ${textMuted}`}>vs OECD median ${oecdMedianSpend.toLocaleString()}</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Top-15 pharma R&amp;D 2024</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>${pharmaTop15Total.toFixed(0)}B</div>
              <div className={`text-[11px] ${textMuted}`}>~60% of global pharma R&amp;D</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Worst mental-health gap</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 text-rose-500`}>{worstMhGap.treatmentGapPct.toFixed(1)}%</div>
              <div className={`text-[11px] ${textMuted}`}>{worstMhGap.code} untreated (WHO)</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Communicable-disease DALYs</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 text-emerald-500`}>-{Math.round(100 - (DISEASE_BURDEN_1990_2023[DISEASE_BURDEN_1990_2023.length-1].communicable / DISEASE_BURDEN_1990_2023[0].communicable) * 100)}%</div>
              <div className={`text-[11px] ${textMuted}`}>1990 → 2023</div>
            </div>
          </div>

          <div className={`mt-4 flex items-center justify-between gap-3 flex-wrap text-xs ${textMuted}`}>
            <div className="flex-1 min-w-[240px]">
              Live: WB SH.XPD.CHEX.GD.ZS (health spend %GDP), SP.DYN.LE00.IN (life expectancy), SH.DYN.MORT (mortality).
              Curated: WHO GHED, IHME GBD 2023, JHU GHS Index 2021, Pharma Intelligence 2024, WHO Mental Health Atlas 2020.
            </div>
            <DataDownloadButton
              isDarkMode={isDarkMode}
              filename="health-ledger-data"
              shareTitle="Health Ledger key figures"
              label="Data"
              getData={() => {
                const rows: Record<string, unknown>[] = [];
                SPEND_OUTCOME_2023.forEach(r => rows.push({ series: 'Spend vs outcome 2023', ...r }));
                PHARMA_TOP_15_RD_2024.forEach(r => rows.push({ series: 'Pharma R&D top 15 2024', ...r }));
                MENTAL_HEALTH_2020.forEach(r => rows.push({ series: 'Mental health 2020', ...r }));
                DISEASE_BURDEN_1990_2023.forEach(r => rows.push({ series: 'Disease burden 1990-2023', ...r }));
                return rows;
              }}
            />
          </div>
        </div>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 1" share={false}
            title="What Each Country Commits"
            subtitle="Live health expenditure as a share of GDP across the full roster, with life expectancy overlaid on the right axis. The bars are sorted by spending and the line refuses to follow them — the first and most important fact about health systems is that money alone does not buy years." />
          <HealthCommitmentChart
            isDarkMode={isDarkMode}
            shareTitle="What Each Country Commits"
            healthcareExpenditure={data?.healthcareExpenditure}
            lifeExpectancy={data?.lifeExpectancy}
          />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 2"
            title="Spending vs Outcomes"
            subtitle="Health spending per capita on the x-axis, life expectancy on the y-axis. Most countries cluster along a curve of diminishing returns; the US is the outlier that pays much more and lives shorter." />
          <SpendVsOutcomeChart isDarkMode={isDarkMode} />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 3"
            title="Life-Expectancy Divergence"
            subtitle="1990-2023 average life expectancy by World Bank income group. Convergence stalled after 2015 and briefly reversed during COVID. The HIC-LIC gap is still ~16 years." />
          <LifeExpectancyDivergenceChart isDarkMode={isDarkMode} />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 4" shareSubject="dataset"
            title="Pandemic Preparedness"
            subtitle="Johns Hopkins Global Health Security Index + WHO JEE core-capacity scores. Even the highest-ranked countries fell short during COVID; the ranking system itself is being re-evaluated." />
          <PandemicReadinessGrid isDarkMode={isDarkMode} />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 5" shareSubject="dataset"
            title="The Pharma Industry"
            subtitle="Top-15 pharmaceutical firms by 2024 R&D spend. Concentrated in the US (7), Europe (7) and Japan (1). Chinese firms are growing fast but not yet in the top-15 by absolute R&D." />
          <PharmaConcentrationTable isDarkMode={isDarkMode} />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 6"
            title="Obesity vs Undernutrition"
            subtitle="The 'double burden' paradox: countries battling obesity and undernutrition simultaneously. Ultra-processed cheap calories meet inadequate micronutrient intake in the same population." />
          <DualBurdenChart isDarkMode={isDarkMode} />
        </section>

        <LazyMount isDarkMode={isDarkMode}>
          <section className="mb-14">
            <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 7" shareSubject="dataset"
              title="The Mental-Health Gap"
              subtitle="What share of people with a diagnosable mental disorder receive no treatment? Roughly half in the OECD, 90%+ in low-income countries. Psychiatrist density is the strongest system-level predictor." />
            <MentalHealthGapTable isDarkMode={isDarkMode} />
          </section>

          <section className="mb-14">
            <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 8"
              title="Disease Burden Shift 1990-2023"
              subtitle="Global DALY rates by broad cause. Communicable-disease burden collapsed; NCDs and mental health held steady. COVID temporarily reversed some of the progress in 2020-21." />
            <DiseaseBurdenTimeline isDarkMode={isDarkMode} />
          </section>
        </LazyMount>

        <RelatedPages currentPath="/health-ledger" isDarkMode={isDarkMode} />

        <footer className={`mt-16 pt-6 border-t text-xs ${textMuted} ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          Live health data via World Bank API proxy. Curated snapshots refreshed {CURATED_LAST_UPDATED}.
          Spend-outcome pairs from WHO GHED 2023, life-expectancy series from World Bank SP.DYN.LE00.IN,
          disease-burden shift from IHME Global Burden of Disease 2023, pandemic-preparedness from Johns
          Hopkins GHS Index 2021 + WHO JEE, pharma R&amp;D from Pharma Intelligence 2024, mental-health from
          WHO Mental Health Atlas 2020.
          {loading ? ' Loading…' : ''}
        </footer>
      </div>
    </div>
  );
}
