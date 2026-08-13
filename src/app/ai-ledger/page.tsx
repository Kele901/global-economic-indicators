'use client';

// AI/Technology Ledger — 8-chapter scrollytelling page mirroring the
// Trade / Migration / Debt / Climate / Defense Ledger structure. Pulls
// live WB technology-adjacent indicators (patent applications, R&D
// share, tertiary researchers) and joins them with the curated
// Stanford AI Index / Epoch / SEMI / IEA / policy-tracker snapshots
// in aiCurated.ts.

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { fetchGlobalData } from '../services/worldbank';
import {
  CURATED_LAST_UPDATED,
  MODEL_RELEASES_2018_2025,
  AI_INVESTMENT_2018_2024,
  FAB_CAPACITY_2025Q2,
  DATA_CENTRE_ENERGY_2015_2030,
  AI_REGULATION_TIMELINE,
} from '../services/aiCurated';
import StalenessBanner from '../components/StalenessBanner';
import DataDownloadButton from '../components/DataDownloadButton';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedPages from '../components/RelatedPages';
import ChartMeta from '../components/ChartMeta';
import DataQualityBadge from '../components/DataQualityBadge';
import LazyMount from '../components/LazyMount';

const ComputeTicker            = dynamic(() => import('../components/ComputeTicker'),            { ssr: false });
const ModelReleasesTimeline    = dynamic(() => import('../components/ModelReleasesTimeline'),    { ssr: false });
const AiPatentsChart           = dynamic(() => import('../components/AiPatentsChart'),           { ssr: false });
const FabCapacityTable         = dynamic(() => import('../components/FabCapacityTable'),         { ssr: false });
const AiInvestmentChart        = dynamic(() => import('../components/AiInvestmentChart'),        { ssr: false });
const DataCenterEnergyChart    = dynamic(() => import('../components/DataCenterEnergyChart'),    { ssr: false });
const AiTalentGrid             = dynamic(() => import('../components/AiTalentGrid'),             { ssr: false });
const AiRegulationTimeline     = dynamic(() => import('../components/AiRegulationTimeline'),     { ssr: false });

type GlobalData = Awaited<ReturnType<typeof fetchGlobalData>>;

function ChapterHeader({ isDarkMode, chapter, title, subtitle }: {
  isDarkMode: boolean; chapter: string; title: string; subtitle: string;
}) {
  return (
    <div className="mb-6">
      <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>
        {chapter}
      </div>
      <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      <p className={`text-sm sm:text-base max-w-3xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</p>
    </div>
  );
}

export default function AiLedgerPage() {
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
          console.warn('[ai-ledger] fetchGlobalData failed', err);
          return null;
        });
        if (cancelled) return;
        setData(wb);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const patentApplications = data?.patentApplications ?? [];

  // KPI figures
  const usaInvestment2024 = useMemo(() => AI_INVESTMENT_2018_2024[AI_INVESTMENT_2018_2024.length - 1]?.usa ?? 0, []);
  const tsmcShare = useMemo(() => FAB_CAPACITY_2025Q2.find(f => f.manufacturer === 'TSMC')?.leadingEdgePct ?? 0, []);
  const modelsIn2025 = useMemo(() => MODEL_RELEASES_2018_2025.filter(m => m.date >= '2025-01-01').length, []);
  const energyGrowth = useMemo(() => {
    const start = DATA_CENTRE_ENERGY_2015_2030.find(p => p.year === 2024)?.world ?? 0;
    const end = DATA_CENTRE_ENERGY_2015_2030.find(p => p.year === 2030)?.world ?? 0;
    return start > 0 ? Math.round(((end / start) - 1) * 100) : 0;
  }, []);

  const pageBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const heroBg = isDarkMode
    ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-violet-900/30 border-gray-700'
    : 'bg-gradient-to-br from-violet-50 via-white to-blue-50 border-violet-100';
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
            <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>
              The AI Ledger
            </div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 ${textPrimary}`}>
              Compute, Capital, Chips, Code
            </h1>
            <p className={`text-base sm:text-lg max-w-3xl ${textSec}`}>
              Where AI is made, funded, powered, staffed and governed. Live World Bank
              research indicators joined with Stanford AI Index model counts, Epoch AI
              release history, SEMI foundry capacity, IEA data-centre energy, MacroPolo
              talent flows and the 2023-2025 global policy timeline.
            </p>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`hidden sm:flex items-center gap-2 text-xs px-3 py-2 rounded-md border transition-colors ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white' : 'bg-white border-gray-200 text-gray-700 hover:text-gray-900'
            }`}
          >
            {isDarkMode ? 'Light mode' : 'Dark mode'}
          </button>
        </div>

        <StalenessBanner
          lastUpdated={CURATED_LAST_UPDATED}
          label="Stanford AI Index 2024/25 notable models, Epoch AI release history 2018-2025, SEMI + TrendForce fab capacity Q2-2025, IEA Electricity 2025 data-centre projections, MacroPolo talent flows, 2023-2025 AI policy timeline"
          isDarkMode={isDarkMode}
        />

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <ChartMeta sourceId="ai-ledger-curated" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="curated" isDarkMode={isDarkMode} />
        </div>

        <div className={`rounded-2xl border p-4 sm:p-6 mb-10 ${heroBg}`}>
          <ComputeTicker isDarkMode={isDarkMode} />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>US AI investment</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>${usaInvestment2024.toFixed(1)}B</div>
              <div className={`text-[11px] ${textMuted}`}>2024 private-market (Stanford AI Index)</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>TSMC leading-edge share</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 text-rose-500`}>{tsmcShare}%</div>
              <div className={`text-[11px] ${textMuted}`}>of global sub-7nm wafer capacity</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Frontier releases YTD 2025</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>{modelsIn2025}</div>
              <div className={`text-[11px] ${textMuted}`}>tracked in Epoch registry</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Data-centre energy 2024→30</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 text-rose-500`}>+{energyGrowth}%</div>
              <div className={`text-[11px] ${textMuted}`}>IEA Electricity 2025 base case</div>
            </div>
          </div>

          <div className={`mt-4 flex items-center justify-between gap-3 flex-wrap text-xs ${textMuted}`}>
            <div className="flex-1 min-w-[240px]">
              Live: World Bank IP.PAT.RESD (patent applications), IP.JRN.ARTC.SC (scientific articles), SP.POP.SCIE.RD.P6 (researchers per million), GB.XPD.RSDV.GD.ZS (R&amp;D as % GDP).
              Curated: Stanford AI Index 2024/25, Epoch AI model registry, SEMI + TrendForce, IEA Electricity 2025, MacroPolo Global AI Talent Tracker, {AI_REGULATION_TIMELINE.length}-item AI policy timeline.
            </div>
            <DataDownloadButton
              isDarkMode={isDarkMode}
              filename="ai-ledger-data"
              label="Data"
              getData={() => {
                const rows: Record<string, unknown>[] = [];
                patentApplications.forEach(row => rows.push({ series: 'Patent applications (residents)', ...row }));
                AI_INVESTMENT_2018_2024.forEach(row => rows.push({ series: 'AI investment (USD bn)', ...row }));
                FAB_CAPACITY_2025Q2.forEach(row => rows.push({ series: 'Leading-edge fab capacity', ...row }));
                DATA_CENTRE_ENERGY_2015_2030.forEach(row => rows.push({ series: 'Data-centre energy (TWh)', ...row }));
                return rows;
              }}
            />
          </div>
        </div>

        {/* Chapter 1 — The Compute Race */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 1"
            title="The Compute Race"
            subtitle="Stanford AI Index counts &quot;notable&quot; ML models — those with ≥100M parameters or comparable compute. The US leads on absolute count; China leads on year-over-year growth. Everyone else is a smaller order of magnitude."
          />
          <div className={`rounded-xl border p-4 sm:p-6 ${cardBg}`}>
            <div className={`text-sm ${textSec}`}>
              Scroll horizontally through the ticker above to see notable-model counts by country of origin. Below,
              the frontier chart in Chapter 2 anchors every release by date and training compute — the two
              chapters read as one continuous view of the compute race.
            </div>
          </div>
        </section>

        {/* Chapter 2 — Model Releases */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 2"
            title="Model Releases"
            subtitle="Every notable frontier LLM 2018-2025, plotted by release date and training compute. The step-function from GPT-3 (2020) to GPT-4 (2023) captures the scaling-hypothesis era. DeepSeek-R1 (Jan 2025) proved the open-weight Chinese labs could keep up."
          />
          <ModelReleasesTimeline isDarkMode={isDarkMode} />
        </section>

        {/* Chapter 3 — AI Patents */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 3"
            title="Patents Frontier"
            subtitle="World Bank IP.PAT.RESD tracks resident patent applications. China's domestic patent surge post-2011 is one of the largest quantitative shifts in the entire economic-indicator library — even if quality-adjusted counts are less lopsided."
          />
          <AiPatentsChart isDarkMode={isDarkMode} patentApplications={patentApplications} />
        </section>

        {/* Chapter 4 — Chip Manufacturing */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 4"
            title="Chip Manufacturing"
            subtitle="The AI compute stack runs on a physical bottleneck. TSMC alone runs 68% of global leading-edge wafer capacity. Everything on this page — model training, inference, agent workloads — flows through a handful of fabs in Taiwan, South Korea and the US."
          />
          <FabCapacityTable isDarkMode={isDarkMode} />
        </section>

        {/* Chapter 5 — AI Investment */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 5"
            title="AI Investment"
            subtitle="Stanford AI Index private-market investment. The US pulled away from everyone else after ChatGPT: $109B in 2024 vs China's $9.3B and the EU's $8.9B combined."
          />
          <AiInvestmentChart isDarkMode={isDarkMode} />
        </section>

        {/* Chapter 6 — Energy & Water */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 6"
            title="Energy Footprint"
            subtitle="IEA projects data-centre electricity to more than double 2024→2030 — from ~550 TWh to ~1,450 TWh. Google, Meta, Amazon and Microsoft have collectively signed for &gt;20 GW of nuclear capacity to keep up."
          />
          <DataCenterEnergyChart isDarkMode={isDarkMode} />
        </section>

        <LazyMount isDarkMode={isDarkMode}>
          {/* Chapter 7 — Talent & Research */}
          <section className="mb-14">
            <ChapterHeader
              isDarkMode={isDarkMode}
              chapter="Chapter 7"
              title="Talent & Research"
              subtitle="MacroPolo tracks the world's top-tier AI researchers by undergraduate origin and current host country. The gap reveals brain-drain direction: China produces 47% of the world's top-tier undergraduates but hosts only 12% at PhD level."
            />
            <AiTalentGrid isDarkMode={isDarkMode} />
          </section>

          {/* Chapter 8 — AI Regulation */}
          <section className="mb-14">
            <ChapterHeader
              isDarkMode={isDarkMode}
              chapter="Chapter 8"
              title="AI Regulation"
              subtitle="Landmark AI laws, executive orders and safety institutes 2023-2025. The EU AI Act is the world's first horizontal AI regulation; the US pivoted from Biden's risk EO to Trump's AI-leadership mandate in January 2025."
            />
            <AiRegulationTimeline isDarkMode={isDarkMode} />
          </section>
        </LazyMount>

        <RelatedPages currentPath="/ai-ledger" isDarkMode={isDarkMode} />

        <footer className={`mt-16 pt-6 border-t text-xs ${textMuted} ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          Live research data via World Bank API proxy. Curated snapshots refreshed {CURATED_LAST_UPDATED}.
          Historical model releases from Epoch AI + lab announcements. Fab capacity from SEMI + TrendForce Q2-2025.
          Data-centre energy projections from IEA Electricity 2025. Talent flows from MacroPolo Global AI Talent Tracker.
          Regulation timeline compiled from Stanford HAI AI Index Chapter 7, OECD.AI, and the EU AI Act official journal.
          {loading ? ' Loading…' : ''}
        </footer>
      </div>
    </div>
  );
}
