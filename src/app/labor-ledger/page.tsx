'use client';

// Labor Ledger — 8 chapters on the global labour market. Mirrors
// the AI/Trade/Migration/Debt/Climate/Defense/Health/Energy Ledger
// pattern. Live WB (SL.UEM.TOTL.ZS, SL.TLF.CACT.ZS, SL.UEM.1524.ZS)
// joined with curated ILO wages, OECD/ICTWSS union density, ILOSTAT
// informal employment and LFP, UN DESA WPP, OECD AI-exposure and ILO
// modelled youth-unemployment snapshots.

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ThemeToggle from '../components/ThemeToggle';
import { fetchGlobalData } from '../services/worldbank';
import {
  CURATED_LAST_UPDATED,
  WAGES_2023,
  UNION_DENSITY_LATEST,
  INFORMAL_EMPLOYMENT_LATEST,
  WORKING_AGE_2000_2050,
  AI_DISPLACEMENT_RISK_2024,
  GENDER_GAP_2025,
  YOUTH_UNEMPLOYMENT_2010_2025,
  laborCountryName,
} from '../services/laborCurated';
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

const WageTicker                = dynamic(() => import('../components/WageTicker'),                { ssr: false, loading: skeleton('Loading wage ticker', 'h-[64px]') });
const LaborSlackChart           = dynamic(() => import('../components/LaborSlackChart'),           { ssr: false, loading: skeleton('Loading labour market slack', 'h-[440px] sm:h-[560px]') });
const WagesChart                = dynamic(() => import('../components/WagesChart'),                { ssr: false, loading: skeleton('Loading wages chart', 'h-[440px] sm:h-[560px]') });
const UnionisationChart         = dynamic(() => import('../components/UnionisationChart'),         { ssr: false, loading: skeleton('Loading unionisation chart', 'h-[560px] sm:h-[640px]') });
const InformalEmploymentGrid    = dynamic(() => import('../components/InformalEmploymentGrid'),    { ssr: false, loading: skeleton('Loading informal employment') });
const WorkingAgeTrajectoryChart = dynamic(() => import('../components/WorkingAgeTrajectoryChart'), { ssr: false, loading: skeleton('Loading working-age trajectory') });
const AiDisplacementRiskTable   = dynamic(() => import('../components/AiDisplacementRiskTable'),   { ssr: false, loading: skeleton('Loading AI displacement risk') });
const GenderGapChart            = dynamic(() => import('../components/GenderGapChart'),            { ssr: false, loading: skeleton('Loading gender gap chart') });
const YouthUnemploymentTimeline = dynamic(() => import('../components/YouthUnemploymentTimeline'), { ssr: false, loading: skeleton('Loading youth unemployment timeline') });

type GlobalData = Awaited<ReturnType<typeof fetchGlobalData>>;

const TOUR_STEPS: TourStep[] = [
  { chapter: 'Chapter 1', title: 'Who is out of work', body: 'Live overall and youth unemployment side by side for the whole roster, sorted by the youth multiple. The gap between the two bars is what a headline unemployment rate hides.' },
  { chapter: 'Chapter 2', title: 'What people earn', body: 'Median hourly wages in PPP dollars, coloured by whether real wages actually grew between 2019 and 2023. For most of Europe they did not.' },
  { chapter: 'Chapter 3', title: 'Unions', body: 'Membership density against bargaining coverage. In France the two diverge wildly because sectoral agreements extend to non-members.' },
  { chapter: 'Chapter 4', title: 'Informality', body: 'No contract, no social insurance, often no minimum wage. Any wage comparison that ignores this overstates reality across most of South Asia and Sub-Saharan Africa.' },
  { chapter: 'Chapter 5', title: 'The demographic cliff', body: 'Working-age population to 2050. China peaked in 2015; Nigeria overtakes both the US and the EU by mid-century.' },
  { chapter: 'Chapter 6', title: 'AI exposure', body: 'Employment shares in occupations with high generative-AI exposure — and the complementarity column that says whether AI augments or replaces them.' },
  { chapter: 'Chapter 7', title: 'The gender gap', body: 'Male against female participation in 2025. Sweden and Norway are near parity; India, Turkey and Mexico run gaps of 30-45 percentage points.' },
  { chapter: 'Chapter 8', title: 'Youth unemployment over time', body: 'The same story as Chapter 1 on a time axis, by income group through 2025. The 2020-21 COVID spike was the sharpest short-term shock on record.' },
];

function ChapterHeader({ isDarkMode, chapter, title, subtitle, share = true, shareSubject = 'chart' }: { isDarkMode: boolean; chapter: string; title: string; subtitle: string; share?: boolean; shareSubject?: 'chart' | 'dataset'; }) {
  return (
    <div id={share ? slugify(title) : undefined} className="mb-6">
      <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{chapter}</div>
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

export default function LaborLedgerPage() {
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
        const wb = await fetchGlobalData().catch(err => { console.warn('[labor-ledger] fetchGlobalData failed', err); return null; });
        if (!cancelled) setData(wb);
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const topWage = useMemo(() => [...WAGES_2023].sort((a, b) => b.medianHourlyUsdPpp - a.medianHourlyUsdPpp)[0], []);
  const worstInformal = useMemo(() => [...INFORMAL_EMPLOYMENT_LATEST].sort((a, b) => b.informalPct - a.informalPct)[0], []);
  const chinaCliff = useMemo(() => {
    const start = WORKING_AGE_2000_2050.find(p => p.year === 2020)?.china ?? 0;
    const end   = WORKING_AGE_2000_2050.find(p => p.year === 2050)?.china ?? 0;
    return { start, end, drop: start - end };
  }, []);
  const latestYouth = useMemo(() => YOUTH_UNEMPLOYMENT_2010_2025[YOUTH_UNEMPLOYMENT_2010_2025.length - 1], []);

  const pageBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const heroBg = isDarkMode
    ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-purple-900/30 border-gray-700'
    : 'bg-gradient-to-br from-purple-50 via-white to-blue-50 border-purple-100';
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
            <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>The Labor Ledger</div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 ${textPrimary}`}>Wages, Unions, Demographics, AI</h1>
            <p className={`text-base sm:text-lg max-w-3xl ${textSec}`}>
              What people earn, how they organise, whether they even count as
              "employed", the demographic cliff coming for aging societies, and
              whether AI is coming for their jobs. Live World Bank labour indicators
              joined with curated ILO wages, OECD union density, UN DESA WPP and
              OECD AI-exposure snapshots.
            </p>
          </div>
          <ThemeToggle isDarkMode={isDarkMode} className="self-end sm:self-auto" />
        </div>

        <GuidedTour
          storageKey="tour-labor-ledger"
          steps={TOUR_STEPS}
          isDarkMode={isDarkMode}
          ctaLabel="Take the 60-second tour of the 8 chapters"
        />

        <StalenessBanner
          lastUpdated={CURATED_LAST_UPDATED}
          label="ILO Global Wage Report 2024-25, OECD/ICTWSS union density 2024, ILOSTAT informal employment 2025, UN DESA WPP 2024, OECD AI exposure 2024, ILO modelled LFP and youth unemployment 2025"
          isDarkMode={isDarkMode}
        />

        <div className="flex items-center gap-2 mb-4 mt-4 flex-wrap">
          <ChartMeta sourceId="wb-labor-market" isDarkMode={isDarkMode} />
          <ChartMeta sourceId="labor-ledger-curated" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="estimate" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="curated" isDarkMode={isDarkMode} />
        </div>

        <div id={slugify('Labor Ledger key figures')} className={`rounded-2xl border p-4 sm:p-6 mb-10 ${heroBg}`}>
          <WageTicker isDarkMode={isDarkMode} />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Top median wage</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 text-emerald-500`}>${topWage.medianHourlyUsdPpp.toFixed(1)}/hr</div>
              <div className={`text-[11px] ${textMuted}`}>{laborCountryName(topWage.code)} (ILO PPP 2023)</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Worst informality</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 text-rose-500`}>{worstInformal.informalPct.toFixed(1)}%</div>
              <div className={`text-[11px] ${textMuted}`}>{laborCountryName(worstInformal.code)} (ILOSTAT {worstInformal.year})</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>China demographic cliff</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 text-rose-500`}>-{chinaCliff.drop}M</div>
              <div className={`text-[11px] ${textMuted}`}>working-age 2020→2050</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Global youth unemployment</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>{(latestYouth?.world ?? 0).toFixed(1)}%</div>
              <div className={`text-[11px] ${textMuted}`}>ILO modelled {latestYouth?.year} (15-24)</div>
            </div>
          </div>

          <div className={`mt-4 flex items-center justify-between gap-3 flex-wrap text-xs ${textMuted}`}>
            <div className="flex-1 min-w-[240px]">
              Live: WB SL.UEM.TOTL.ZS (unemployment), SL.TLF.CACT.ZS (labour force participation), SL.UEM.1524.ZS (youth unemployment).
              Curated: ILO Global Wage Report 2024-25, OECD/ICTWSS union density 2024, ILOSTAT informal 2025, UN DESA WPP 2024, OECD AI 2024, ILO modelled LFP and youth 2025.
            </div>
            <DataDownloadButton
              isDarkMode={isDarkMode}
              filename="labor-ledger-data"
              shareTitle="Labor Ledger key figures"
              label="Data"
              getData={() => {
                const rows: Record<string, unknown>[] = [];
                WAGES_2023.forEach(r => rows.push({ series: 'Wages 2023', ...r }));
                UNION_DENSITY_LATEST.forEach(r => rows.push({ series: 'Union density (latest)', ...r }));
                INFORMAL_EMPLOYMENT_LATEST.forEach(r => rows.push({ series: 'Informal employment (latest)', ...r }));
                WORKING_AGE_2000_2050.forEach(r => rows.push({ series: 'Working-age 2000-2050', ...r }));
                AI_DISPLACEMENT_RISK_2024.forEach(r => rows.push({ series: 'AI displacement risk 2024', ...r }));
                GENDER_GAP_2025.forEach(r => rows.push({ series: 'Gender gap 2025', ...r }));
                YOUTH_UNEMPLOYMENT_2010_2025.forEach(r => rows.push({ series: 'Youth unemployment 2010-2025', ...r }));
                return rows;
              }}
            />
          </div>
        </div>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 1" share={false}
            title="Who Is Out of Work"
            subtitle="Live overall and youth unemployment for every country in the roster, sorted by the youth multiple. A high multiple on top of a low headline rate is the signature of a two-tier labour market, not a weak economy." />
          <LaborSlackChart
            isDarkMode={isDarkMode}
            shareTitle="Who Is Out of Work"
            unemploymentRates={data?.unemploymentRates}
            youthUnemployment={data?.youthUnemployment}
          />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 2" share={false}
            title="Wages 2023"
            subtitle="Median hourly wage in USD-PPP terms. Bar colour marks whether real wages grew (green) or shrank (red) between 2019-2023. High inflation between 2021-2023 wiped out cash growth across most of Europe." />
          <WagesChart isDarkMode={isDarkMode} shareTitle="Wages 2023" inflationRates={data?.inflationRates} />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 3" share={false}
            title="Unions & Collective Bargaining"
            subtitle="Density = share of workers who are union members. Coverage = share of workers whose pay is set by collective agreement. Latest OECD/ICTWSS figures, mostly 2023-24. In France and Spain the two diverge wildly because sectoral agreements extend to non-members." />
          <UnionisationChart isDarkMode={isDarkMode} shareTitle="Unions & Collective Bargaining" giniCoefficient={data?.giniCoefficient} />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 4" shareSubject="dataset"
            title="Informal Employment"
            subtitle="No contract, no social insurance, often no minimum wage. Dominant in Sub-Saharan Africa and South Asia. Any wage or productivity comparison that ignores it will overstate reality by a huge margin." />
          <InformalEmploymentGrid isDarkMode={isDarkMode} />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 5"
            title="The Demographic Cliff"
            subtitle="UN DESA WPP 2024 working-age population 2000-2050. China peaked in 2015 and is set to lose 260M workers by 2050. Nigeria overtakes both the US and EU by mid-century." />
          <WorkingAgeTrajectoryChart isDarkMode={isDarkMode} />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 6" shareSubject="dataset"
            title="AI Displacement Risk"
            subtitle="OECD 2024 employment shares in occupations with high generative-AI exposure. High-exposure ≠ certain displacement — the complementarity column shows how likely AI is to augment rather than replace those workers." />
          <AiDisplacementRiskTable isDarkMode={isDarkMode} />
        </section>

        <LazyMount isDarkMode={isDarkMode}>
          <section className="mb-14">
            <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 7"
              title="The Gender Gap"
              subtitle="Male vs female labour-force participation, ILO modelled estimates for 2025. Sweden and Norway lead on parity; India, Turkey and Mexico have gaps of 30-45pp. Closing the gender gap is one of the largest untapped growth signals in labour economics." />
            <GenderGapChart isDarkMode={isDarkMode} />
          </section>

          <section className="mb-14">
            <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 8"
              title="Youth Unemployment 2010-2025"
              subtitle="ILO modelled estimates by World Bank income group. The 2020-21 COVID spike was the sharpest short-term shock in the modern era. Middle-income countries now carry the highest youth rates, about 4pp above low-income countries." />
            <YouthUnemploymentTimeline isDarkMode={isDarkMode} />
          </section>
        </LazyMount>

        <RelatedPages currentPath="/labor-ledger" isDarkMode={isDarkMode} />

        <footer className={`mt-16 pt-6 border-t text-xs ${textMuted} ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          Live labour data via World Bank API proxy. Curated snapshots refreshed {CURATED_LAST_UPDATED}.
          Wages from ILO Global Wage Report 2024-25, union density and bargaining coverage from OECD/ICTWSS (latest year, mostly 2023-24),
          informal employment from ILOSTAT SDG 8.3.1 (latest survey year), working-age population from UN DESA WPP 2024,
          AI-exposure scores from OECD Employment Outlook 2024, gender-gap LFP from ILO modelled estimates 2025,
          youth unemployment from ILO modelled estimates via World Bank WDI (2010-2025).
          {loading ? ' Loading…' : ''}
        </footer>
      </div>
    </div>
  );
}
