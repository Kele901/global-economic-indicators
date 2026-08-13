'use client';

// Labor Ledger — 8 chapters on the global labour market. Mirrors
// the AI/Trade/Migration/Debt/Climate/Defense/Health/Energy Ledger
// pattern. Live WB (SL.UEM.TOTL.ZS, SL.TLF.CACT.ZS, SL.UEM.1524.ZS)
// joined with curated ILO wages, OECD union density, ILO informal,
// UN DESA WPP, OECD AI-exposure and ILO youth-unemployment snapshots.

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { fetchGlobalData } from '../services/worldbank';
import {
  CURATED_LAST_UPDATED,
  WAGES_2023,
  UNION_DENSITY_2023,
  INFORMAL_EMPLOYMENT_2023,
  WORKING_AGE_2000_2050,
  AI_DISPLACEMENT_RISK_2024,
  GENDER_GAP_2023,
  YOUTH_UNEMPLOYMENT_2010_2024,
} from '../services/laborCurated';
import StalenessBanner from '../components/StalenessBanner';
import DataDownloadButton from '../components/DataDownloadButton';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedPages from '../components/RelatedPages';
import ChartMeta from '../components/ChartMeta';
import DataQualityBadge from '../components/DataQualityBadge';

const WageTicker                = dynamic(() => import('../components/WageTicker'),                { ssr: false });
const WagesChart                = dynamic(() => import('../components/WagesChart'),                { ssr: false });
const UnionisationChart         = dynamic(() => import('../components/UnionisationChart'),         { ssr: false });
const InformalEmploymentGrid    = dynamic(() => import('../components/InformalEmploymentGrid'),    { ssr: false });
const WorkingAgeTrajectoryChart = dynamic(() => import('../components/WorkingAgeTrajectoryChart'), { ssr: false });
const AiDisplacementRiskTable   = dynamic(() => import('../components/AiDisplacementRiskTable'),   { ssr: false });
const GenderGapChart            = dynamic(() => import('../components/GenderGapChart'),            { ssr: false });
const YouthUnemploymentTimeline = dynamic(() => import('../components/YouthUnemploymentTimeline'), { ssr: false });

type GlobalData = Awaited<ReturnType<typeof fetchGlobalData>>;

function ChapterHeader({ isDarkMode, chapter, title, subtitle }: { isDarkMode: boolean; chapter: string; title: string; subtitle: string; }) {
  return (
    <div className="mb-6">
      <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{chapter}</div>
      <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      <p className={`text-sm sm:text-base max-w-3xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</p>
    </div>
  );
}

export default function LaborLedgerPage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [_data, setData] = useState<GlobalData | null>(null);
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
  const worstInformal = useMemo(() => [...INFORMAL_EMPLOYMENT_2023].sort((a, b) => b.informalPct - a.informalPct)[0], []);
  const chinaCliff = useMemo(() => {
    const start = WORKING_AGE_2000_2050.find(p => p.year === 2020)?.china ?? 0;
    const end   = WORKING_AGE_2000_2050.find(p => p.year === 2050)?.china ?? 0;
    return { start, end, drop: start - end };
  }, []);
  const worstYouth2024 = useMemo(() => YOUTH_UNEMPLOYMENT_2010_2024[YOUTH_UNEMPLOYMENT_2010_2024.length - 1]?.world ?? 0, []);

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
        <div className="flex items-start justify-between mb-6">
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
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`hidden sm:flex items-center gap-2 text-xs px-3 py-2 rounded-md border transition-colors ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white' : 'bg-white border-gray-200 text-gray-700 hover:text-gray-900'
            }`}
          >{isDarkMode ? 'Light mode' : 'Dark mode'}</button>
        </div>

        <StalenessBanner
          lastUpdated={CURATED_LAST_UPDATED}
          label="ILO Wage Report 2024, OECD/ICTWSS union density 2023, ILO informal employment 2023, UN DESA WPP 2024, OECD AI exposure 2024, ILO youth unemployment 2024"
          isDarkMode={isDarkMode}
        />

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <ChartMeta sourceId="labor-ledger-curated" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="curated" isDarkMode={isDarkMode} />
        </div>

        <div className={`rounded-2xl border p-4 sm:p-6 mb-10 ${heroBg}`}>
          <WageTicker isDarkMode={isDarkMode} />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Top median wage</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 text-emerald-500`}>${topWage.medianHourlyUsdPpp.toFixed(1)}/hr</div>
              <div className={`text-[11px] ${textMuted}`}>{topWage.code} (ILO PPP)</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Worst informality</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 text-rose-500`}>{worstInformal.informalPct.toFixed(1)}%</div>
              <div className={`text-[11px] ${textMuted}`}>{worstInformal.code} (ILO 2023)</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>China demographic cliff</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 text-rose-500`}>-{chinaCliff.drop}M</div>
              <div className={`text-[11px] ${textMuted}`}>working-age 2020→2050</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Global youth unemployment</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>{worstYouth2024.toFixed(1)}%</div>
              <div className={`text-[11px] ${textMuted}`}>ILO 2024 (15-24)</div>
            </div>
          </div>

          <div className={`mt-4 flex items-center justify-between gap-3 flex-wrap text-xs ${textMuted}`}>
            <div className="flex-1 min-w-[240px]">
              Live: WB SL.UEM.TOTL.ZS (unemployment), SL.TLF.CACT.ZS (labour force participation), SL.UEM.1524.ZS (youth unemployment).
              Curated: ILO Wage Report 2024, OECD/ICTWSS union density 2023, ILO informal 2023, UN DESA WPP 2024, OECD AI 2024, ILO youth 2024.
            </div>
            <DataDownloadButton
              isDarkMode={isDarkMode}
              filename="labor-ledger-data"
              label="Data"
              getData={() => {
                const rows: Record<string, unknown>[] = [];
                WAGES_2023.forEach(r => rows.push({ series: 'Wages 2023', ...r }));
                UNION_DENSITY_2023.forEach(r => rows.push({ series: 'Union density 2023', ...r }));
                INFORMAL_EMPLOYMENT_2023.forEach(r => rows.push({ series: 'Informal employment 2023', ...r }));
                WORKING_AGE_2000_2050.forEach(r => rows.push({ series: 'Working-age 2000-2050', ...r }));
                AI_DISPLACEMENT_RISK_2024.forEach(r => rows.push({ series: 'AI displacement risk 2024', ...r }));
                GENDER_GAP_2023.forEach(r => rows.push({ series: 'Gender gap 2023', ...r }));
                YOUTH_UNEMPLOYMENT_2010_2024.forEach(r => rows.push({ series: 'Youth unemployment 2010-2024', ...r }));
                return rows;
              }}
            />
          </div>
        </div>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 1"
            title="What People Earn"
            subtitle="Ticker of top median hourly wages (USD-PPP). Wage gaps between rich and emerging economies are 5-10x even after adjusting for purchasing-power differences." />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 2"
            title="Wages 2023"
            subtitle="Median hourly wage in USD-PPP terms. Bar colour marks whether real wages grew (green) or shrank (red) between 2019-2023. High inflation between 2021-2023 wiped out cash growth across most of Europe." />
          <WagesChart isDarkMode={isDarkMode} />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 3"
            title="Unions & Collective Bargaining"
            subtitle="Density = share of workers who are union members. Coverage = share of workers whose pay is set by collective agreement. In France the two diverge wildly because sectoral agreements extend to non-members." />
          <UnionisationChart isDarkMode={isDarkMode} />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 4"
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
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 6"
            title="AI Displacement Risk"
            subtitle="OECD 2024 employment shares in occupations with high generative-AI exposure. High-exposure ≠ certain displacement — the complementarity column shows how likely AI is to augment rather than replace those workers." />
          <AiDisplacementRiskTable isDarkMode={isDarkMode} />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 7"
            title="The Gender Gap"
            subtitle="Male vs female labour-force participation. Nordic countries lead on parity; India, Mexico and Turkey have gaps of 30-50pp. Closing the gender gap is one of the largest untapped growth signals in labour economics." />
          <GenderGapChart isDarkMode={isDarkMode} />
        </section>

        <section className="mb-14">
          <ChapterHeader isDarkMode={isDarkMode} chapter="Chapter 8"
            title="Youth Unemployment 2010-2024"
            subtitle="ILO estimates by development band. COVID spike in 2020-21 was the sharpest short-term shock in the modern era. Emerging-market youth consistently run 3-4pp above the developing-country average." />
          <YouthUnemploymentTimeline isDarkMode={isDarkMode} />
        </section>

        <RelatedPages currentPath="/labor-ledger" isDarkMode={isDarkMode} />

        <footer className={`mt-16 pt-6 border-t text-xs ${textMuted} ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          Live labour data via World Bank API proxy. Curated snapshots refreshed {CURATED_LAST_UPDATED}.
          Wages from ILO Global Wage Report 2024, union density from OECD/ICTWSS 2023,
          informal employment from ILO 2023, working-age population from UN DESA WPP 2024,
          AI-exposure scores from OECD Employment Outlook 2024, gender-gap LFP from ILO 2023,
          youth unemployment from ILO 2024.
          {loading ? ' Loading…' : ''}
        </footer>
      </div>
    </div>
  );
}
