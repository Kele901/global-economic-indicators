'use client';

// Climate Ledger — 8-chapter scrollytelling page mirroring the Defense
// Ledger structure. Pulls live WB indicators (10 climate series added in
// v25) and joins them with the curated NDC / coal-pipeline / climate
// finance / EM-DAT snapshots in climateCurated.ts.

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { fetchGlobalData } from '../services/worldbank';
import {
  CURATED_LAST_UPDATED,
  CLIMATE_COUNTRY_META,
  GLOBAL_TEMP_ANOMALY,
} from '../services/climateCurated';
import { worldSum, topNCountries, topNShare, worldYoY, latestEntry } from '../utils/countryData';
import StalenessBanner from '../components/StalenessBanner';
import DataDownloadButton from '../components/DataDownloadButton';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedPages from '../components/RelatedPages';
import ChartMeta from '../components/ChartMeta';
import DataQualityBadge from '../components/DataQualityBadge';
import LazyMount from '../components/LazyMount';

const EmissionsTicker           = dynamic(() => import('../components/EmissionsTicker'),           { ssr: false });
const PerCapitaEmissionsChart   = dynamic(() => import('../components/PerCapitaEmissionsChart'),   { ssr: false });
const EmissionsTreemap          = dynamic(() => import('../components/EmissionsTreemap'),          { ssr: false });
const EnergyMixChart            = dynamic(() => import('../components/EnergyMixChart'),            { ssr: false });
const RenewablesTransitionChart = dynamic(() => import('../components/RenewablesTransitionChart'), { ssr: false });
const CoalPipelineTable         = dynamic(() => import('../components/CoalPipelineTable'),         { ssr: false });
const ClimateFinanceFlows       = dynamic(() => import('../components/ClimateFinanceFlows'),       { ssr: false });
const AirPollutionGrid          = dynamic(() => import('../components/AirPollutionGrid'),          { ssr: false });
const DisasterTimelineChart     = dynamic(() => import('../components/DisasterTimelineChart'),     { ssr: false });
const NdcTargetTable            = dynamic(() => import('../components/NdcTargetTable'),            { ssr: false });

type GlobalData = Awaited<ReturnType<typeof fetchGlobalData>>;

function ChapterHeader({ isDarkMode, chapter, title, subtitle }: {
  isDarkMode: boolean; chapter: string; title: string; subtitle: string;
}) {
  return (
    <div className="mb-6">
      <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
        {chapter}
      </div>
      <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      <p className={`text-sm sm:text-base max-w-3xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</p>
    </div>
  );
}

function formatKt(kt: number): string {
  const gt = kt / 1_000_000;
  if (gt >= 1) return `${gt.toFixed(2)} GtCO₂`;
  const mt = kt / 1_000;
  return `${mt.toFixed(0)} MtCO₂`;
}

export default function ClimateLedgerPage() {
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
          console.warn('[climate-ledger] fetchGlobalData failed', err);
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

  const retry = async () => {
    setLoading(true);
    try {
      const wb = await fetchGlobalData(true).catch(err => {
        console.warn('[climate-ledger] retry fetchGlobalData failed', err);
        return null;
      });
      setData(wb);
    } finally {
      setLoading(false);
    }
  };

  const co2Kt = data?.co2EmissionsKt ?? [];
  const co2Pc = data?.co2Emissions ?? [];

  const worldCo2 = useMemo(() => worldSum(co2Kt), [co2Kt]);
  const worldCo2YoY = useMemo(() => worldYoY(co2Kt), [co2Kt]);
  const top5EmitterShare = useMemo(() => topNShare(co2Kt, 5), [co2Kt]);
  const top5Emitters = useMemo(() => topNCountries(co2Kt, 5), [co2Kt]);

  const latestTemp = GLOBAL_TEMP_ANOMALY[GLOBAL_TEMP_ANOMALY.length - 1];

  // Coverage sanity check — how many of our tracked countries returned data.
  const co2Coverage = useMemo(() => {
    const covered = new Set<string>();
    CLIMATE_COUNTRY_META.forEach(m => {
      if (latestEntry(co2Kt, m.wbKey)) covered.add(m.wbKey);
    });
    return covered.size;
  }, [co2Kt]);

  const pageBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const heroBg = isDarkMode
    ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-emerald-900/30 border-gray-700'
    : 'bg-gradient-to-br from-emerald-50 via-white to-sky-50 border-emerald-100';
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
              The Climate Ledger
            </div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 ${textPrimary}`}>
              The Global Carbon Bill
            </h1>
            <p className={`text-base sm:text-lg max-w-3xl ${textSec}`}>
              A ledger of who emits, who transitions, who pays and who suffers. Emissions, energy mix, pledges,
              finance flows and physical risk — the same country roster, seen across eight chapters.
            </p>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`hidden sm:flex items-center gap-2 text-xs px-3 py-2 rounded-md border transition-colors ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white'
                : 'bg-white border-gray-200 text-gray-700 hover:text-gray-900'
            }`}
          >
            {isDarkMode ? 'Light mode' : 'Dark mode'}
          </button>
        </div>

        <StalenessBanner
          lastUpdated={CURATED_LAST_UPDATED}
          label="NDC targets, coal pipeline (GEM), climate finance (OECD DAC / GCF), EM-DAT disasters"
          isDarkMode={isDarkMode}
        />

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <ChartMeta sourceId="wb-ghg" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="revised" isDarkMode={isDarkMode} />
          <span className={`text-[11px] ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>|</span>
          <ChartMeta sourceId="unfccc-ndc" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="curated" isDarkMode={isDarkMode} />
        </div>

        {/* Hero: ticker + KPI cards */}
        <div className={`rounded-2xl border p-4 sm:p-6 mb-10 ${heroBg}`}>
          <EmissionsTicker
            isDarkMode={isDarkMode}
            co2EmissionsKt={co2Kt}
            loading={loading && !data}
            onRetry={retry}
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Tracked-world CO₂</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>
                {worldCo2.total > 0 ? formatKt(worldCo2.total) : (loading ? '…' : '—')}
              </div>
              <div className={`text-[11px] ${textMuted}`}>
                {worldCo2.year ? `${worldCo2.year} · ${worldCo2.count} economies` : 'World Bank EN.ATM.CO2E.KT'}
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>YoY change</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${
                worldCo2YoY != null && worldCo2YoY <= 0 ? 'text-emerald-500' : 'text-rose-500'
              }`}>
                {worldCo2YoY != null ? `${worldCo2YoY >= 0 ? '+' : ''}${worldCo2YoY.toFixed(1)}%` : '—'}
              </div>
              <div className={`text-[11px] ${textMuted}`}>vs prior year total</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Top-5 share</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>
                {top5EmitterShare > 0 ? `${top5EmitterShare.toFixed(0)}%` : (loading ? '…' : '—')}
              </div>
              <div className={`text-[11px] ${textMuted}`}>
                {top5Emitters[0] ? `led by ${top5Emitters[0].country}` : 'concentration among top 5'}
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Global temp anomaly</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${
                latestTemp.anomalyC >= 1.5 ? 'text-rose-500' : 'text-amber-500'
              }`}>
                +{latestTemp.anomalyC.toFixed(2)}°C
              </div>
              <div className={`text-[11px] ${textMuted}`}>NASA GISTEMP · {latestTemp.year}</div>
            </div>
          </div>

          <div className={`mt-4 flex items-center justify-between gap-3 flex-wrap text-xs ${textMuted}`}>
            <div className="flex-1 min-w-[240px]">
              Live: World Bank climate series (EN.ATM.*, EG.ELC.*, EG.USE.*, AG.LND.*, ER.LND.*, SP.URB.*).
              Curated: UNFCCC NDC Registry, Global Energy Monitor coal tracker, OECD DAC + GCF finance, EM-DAT, NASA GISTEMP.
            </div>
            <DataDownloadButton
              isDarkMode={isDarkMode}
              filename="climate-ledger-data"
              label="Data"
              getData={() => {
                const rows: Record<string, unknown>[] = [];
                (co2Kt ?? []).forEach(row => rows.push({ series: 'CO2 kt', ...row }));
                (co2Pc ?? []).forEach(row => rows.push({ series: 'CO2 per capita', ...row }));
                (data?.elecFromCoal ?? []).forEach(row => rows.push({ series: 'Electricity from coal (%)', ...row }));
                (data?.elecFromRenewables ?? []).forEach(row => rows.push({ series: 'Electricity from renewables (%)', ...row }));
                return rows;
              }}
            />
          </div>
        </div>

        {/* Chapter 1 — The Global Bill */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 1"
            title="The Global Bill"
            subtitle="Every year the world burns a little more carbon than the last. The scoreboard: absolute tonnes, the year-over-year direction, and how concentrated the emissions are among a handful of countries."
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {top5Emitters.slice(0, 3).map((e, i) => {
              const meta = CLIMATE_COUNTRY_META.find(m => m.wbKey === e.country);
              return (
                <div key={e.country} className={`rounded-lg border p-5 ${cardBg}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`text-xs uppercase tracking-wider ${textMuted}`}>#{i + 1} emitter · {e.year}</div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: meta?.color ?? '#10b981' }} />
                  </div>
                  <div className={`text-2xl font-bold ${textPrimary}`}>{meta?.name ?? e.country}</div>
                  <div className={`text-lg font-semibold tabular-nums mt-1 ${textSec}`}>{formatKt(e.value)}</div>
                  <div className={`text-[11px] mt-2 ${textMuted}`}>
                    {worldCo2.total > 0 ? `${((e.value / worldCo2.total) * 100).toFixed(1)}% of tracked-world total` : ''}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6">
            <EmissionsTreemap isDarkMode={isDarkMode} co2EmissionsKt={co2Kt} />
          </div>
        </section>

        {/* Chapter 2 — The Divergence */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 2"
            title="The Divergence"
            subtitle="Absolute emissions tell you who to blame today; per-capita tell you the harder question of what a citizen consumes. Toggle the two views to see how the ranking rearranges."
          />
          <PerCapitaEmissionsChart
            isDarkMode={isDarkMode}
            co2EmissionsKt={co2Kt}
            co2EmissionsPerCapita={co2Pc}
          />
        </section>

        {/* Chapter 3 — The Energy Mix */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 3"
            title="The Energy Mix"
            subtitle="Electricity is the fastest-decarbonising sector — but only for some. The stacked bars show where each economy still leans on coal and where renewables have taken over."
          />
          <EnergyMixChart
            isDarkMode={isDarkMode}
            elecFromCoal={data?.elecFromCoal ?? []}
            elecFromRenewables={data?.elecFromRenewables ?? []}
          />
        </section>

        {/* Chapter 4 — The Renewables Race */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 4"
            title="The Renewables Race"
            subtitle="Twenty-five years of transition, in ten lines. Reference line marks the 50% renewable-electricity threshold — the moment a grid stops being fossil-first."
          />
          <RenewablesTransitionChart
            isDarkMode={isDarkMode}
            elecFromRenewables={data?.elecFromRenewables ?? []}
          />
        </section>

        {/* Chapter 5 — The Coal Pipeline */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 5"
            title="The Coal Pipeline"
            subtitle="Operating capacity is a legacy story. What&rsquo;s under construction and announced is the future — and it&rsquo;s still overwhelmingly concentrated in a handful of Asian economies."
          />
          <CoalPipelineTable isDarkMode={isDarkMode} />
        </section>

        {/* Chapter 6 — Climate Finance */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 6"
            title="Climate Finance"
            subtitle="The Paris Agreement promised $100 billion a year from rich countries to poor. Here&rsquo;s what was pledged, what has actually landed and the ratio between them."
          />
          <ClimateFinanceFlows isDarkMode={isDarkMode} />
        </section>

        <LazyMount isDarkMode={isDarkMode}>
          {/* Chapter 7 — Physical Risk */}
          <section className="mb-14">
            <ChapterHeader
              isDarkMode={isDarkMode}
              chapter="Chapter 7"
              title="Physical Risk"
              subtitle="The other side of the ledger: what a warmer planet does to the people on it. Air quality now, disasters over the last three decades."
            />
            <div className="grid grid-cols-1 gap-4">
              <AirPollutionGrid
                isDarkMode={isDarkMode}
                pm25={data?.pm25 ?? []}
              />
              <DisasterTimelineChart isDarkMode={isDarkMode} />
            </div>
          </section>

          {/* Chapter 8 — The Pledges */}
          <section className="mb-14">
            <ChapterHeader
              isDarkMode={isDarkMode}
              chapter="Chapter 8"
              title="The Pledges"
              subtitle="Every top-20 emitter has a Paris pledge. The actual-vs-target column shows how many are on track — and how many are trending in the wrong direction."
            />
            <NdcTargetTable
              isDarkMode={isDarkMode}
              co2EmissionsKt={co2Kt}
            />
          </section>
        </LazyMount>

        <RelatedPages currentPath="/climate-ledger" isDarkMode={isDarkMode} />

        {/* Footer */}
        <div className={`text-xs mt-8 pt-6 border-t space-y-2 ${isDarkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-500'}`}>
          <p>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Live World Bank series:</span>{' '}
            EN.ATM.CO2E.KT · EN.ATM.CO2E.PC · EN.ATM.METH.KT.CE · EN.ATM.NOXE.KT.CE · EN.ATM.PM25.MC.M3 ·
            EG.ELC.COAL.ZS · EG.ELC.RNEW.ZS · EG.USE.COMM.FO.ZS · EG.IMP.CONS.ZS ·
            AG.LND.FRST.ZS · ER.LND.PTLD.ZS · SP.URB.TOTL.IN.ZS.
            Coverage this session: {co2Coverage}/{CLIMATE_COUNTRY_META.length} tracked emitters returned CO₂ data.
          </p>
          <p>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Curated snapshots:</span>{' '}
            UNFCCC NDC Registry (2035 targets, {CURATED_LAST_UPDATED}), Global Energy Monitor Global Coal Plant Tracker,
            OECD DAC + Green Climate Fund flows, EM-DAT climate-disaster counts 1990-2024, NASA GISTEMP v4 temperature anomaly.
          </p>
          <p>
            All World Bank fetches route through the <code className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>/api/worldbank</code> server-side proxy
            (IPv4-first DNS, browser-style UA, retry with exponential backoff). See{' '}
            <a href="/data-sources" className={isDarkMode ? 'text-emerald-400 underline' : 'text-emerald-700 underline'}>Data Sources</a> for the full registry.
          </p>
        </div>
      </div>
    </div>
  );
}
