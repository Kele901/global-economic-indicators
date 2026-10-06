'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ThemeToggle from '../components/ThemeToggle';
import { fetchGlobalData } from '../services/worldbank';
import { fetchAllCommodityPrices, clearCommodityCache, RESOURCES_CURATED_LAST_UPDATED, type CommodityHistory } from '../services/commodities';
import StalenessBanner from '../components/StalenessBanner';
import DataDownloadButton from '../components/DataDownloadButton';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedPages from '../components/RelatedPages';
import SocialShareMenu from '../components/SocialShareMenu';
import { slugify } from '../lib/share';
import { fetchOilReserves, fetchOilProduction, type ReservesSnapshot, type ProductionSnapshot } from '../services/eia';

const CommodityTicker = dynamic(() => import('../components/CommodityTicker'), { ssr: false });
const ResourceHoldersPanel = dynamic(() => import('../components/ResourceHoldersPanel'), { ssr: false });
const ResourceDependenceQuadrant = dynamic(() => import('../components/ResourceDependenceQuadrant'), { ssr: false });
const CommoditySupercycleTimeline = dynamic(() => import('../components/CommoditySupercycleTimeline'), { ssr: false });
const ReservesClockGauge = dynamic(() => import('../components/ReservesClockGauge'), { ssr: false });
const PetrostateVulnerabilityTable = dynamic(() => import('../components/PetrostateVulnerabilityTable'), { ssr: false });
const OilReserveGrowthChart = dynamic(() => import('../components/ResourceAtlasExtras').then(m => m.OilReserveGrowthChart), { ssr: false });
const CriticalMineralsPanel = dynamic(() => import('../components/ResourceAtlasExtras').then(m => m.CriticalMineralsPanel), { ssr: false });
const FiscalBreakevenPanel = dynamic(() => import('../components/ResourceAtlasExtras').then(m => m.FiscalBreakevenPanel), { ssr: false });
const SovereignWealthPanel = dynamic(() => import('../components/ResourceAtlasExtras').then(m => m.SovereignWealthPanel), { ssr: false });

type GlobalData = Awaited<ReturnType<typeof fetchGlobalData>>;

const KPI_TITLE = 'Resource Atlas key commodity prices';

interface ChapterHeaderProps {
  isDarkMode: boolean;
  chapter: string;
  title: string;
  subtitle: string;
  share?: boolean;
  shareSubject?: 'chart' | 'dataset';
}

function ChapterHeader({ isDarkMode, chapter, title, subtitle, share = true, shareSubject = 'chart' }: ChapterHeaderProps) {
  return (
    <div id={share ? slugify(title) : undefined} className="mb-6">
      <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
        <div>
          <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
            {chapter}
          </div>
          <h2 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
        </div>
        {share && (
          <SocialShareMenu title={title} subject={shareSubject} isDarkMode={isDarkMode} className="shrink-0" />
        )}
      </div>
      <p className={`text-sm sm:text-base max-w-3xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</p>
    </div>
  );
}

function SkeletonCard({ isDarkMode, className = 'h-64' }: { isDarkMode: boolean; className?: string }) {
  return (
    <div className={`${className} rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
  );
}

function kpiChange(latest?: { value: number } | null, prior?: { value: number } | null): number | null {
  if (!latest || !prior || prior.value === 0) return null;
  return ((latest.value - prior.value) / prior.value) * 100;
}

export default function ResourcesPage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const [data, setData] = useState<GlobalData | null>(null);
  const [commodities, setCommodities] = useState<{ [id: string]: CommodityHistory }>({});
  const [reserves, setReserves] = useState<ReservesSnapshot | null>(null);
  const [production, setProduction] = useState<ProductionSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [commoditiesLoading, setCommoditiesLoading] = useState(true);

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
        const [wb, cm, res, prod] = await Promise.all([
          fetchGlobalData().catch(err => {
            console.warn('[resources] fetchGlobalData failed', err);
            return null;
          }),
          fetchAllCommodityPrices().catch(err => {
            console.warn('[resources] fetchAllCommodityPrices failed', err);
            return {} as { [id: string]: CommodityHistory };
          }),
          fetchOilReserves().catch(err => {
            console.warn('[resources] fetchOilReserves failed', err);
            return null;
          }),
          fetchOilProduction().catch(err => {
            console.warn('[resources] fetchOilProduction failed', err);
            return null;
          }),
        ]);
        if (cancelled) return;
        setData(wb);
        setCommodities(cm);
        setReserves(res);
        setProduction(prod);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setCommoditiesLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Re-fetch commodity data on demand (e.g. after a transient FRED / Akamai
  // block clears). Clears the in-memory cache so we don't just return empty.
  const retryCommodities = async () => {
    setCommoditiesLoading(true);
    clearCommodityCache();
    try {
      const cm = await fetchAllCommodityPrices().catch(() => ({} as { [id: string]: CommodityHistory }));
      setCommodities(cm);
    } finally {
      setCommoditiesLoading(false);
    }
  };

  const kpi = useMemo(() => {
    const tile = (id: string, label: string, unit: string) => {
      const h = commodities[id];
      return {
        label,
        unit,
        obs: h?.latest,
        change: kpiChange(h?.latest, h?.latestPrior),
        ytd: kpiChange(h?.latest, h?.ytdStart),
      };
    };
    return [
      tile('wti', 'WTI Crude', '$/bbl'),
      tile('brent', 'Brent Crude', '$/bbl'),
      tile('henryHub', 'Natural Gas', '$/MMBtu'),
      tile('copper', 'Copper', '$/t'),
    ];
  }, [commodities]);

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
        {/* Header */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              The Resource Atlas
            </div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 ${textPrimary}`}>
              Oil, Metals &amp; the Physical Economy
            </h1>
            <p className={`text-base sm:text-lg max-w-3xl ${textSec}`}>
              A data-driven tour of the raw materials that move markets. Live commodity prices, proven reserves,
              resource-rent dependence and the boom-and-bust cycles that reshape petrostates.
            </p>
          </div>
          <ThemeToggle isDarkMode={isDarkMode} className="self-end sm:self-auto" />
        </div>

        <StalenessBanner
          lastUpdated={RESOURCES_CURATED_LAST_UPDATED}
          label="Commodity super-cycle era annotations & petrostate curation"
          isDarkMode={isDarkMode}
        />

        <div className="mb-6 flex justify-end">
          <DataDownloadButton
            isDarkMode={isDarkMode}
            filename="resource-atlas-data"
            label="Data"
            getData={() => {
              const rows: Record<string, unknown>[] = [];
              Object.values(commodities).forEach(h => {
                (h.annual ?? []).forEach(p => {
                  rows.push({
                    commodity: h.meta.label,
                    id: h.meta.id,
                    unit: h.meta.unit,
                    year: p.year,
                    value: p.value,
                    frequency: 'annual',
                  });
                });
                (h.sparkline ?? []).forEach(o => {
                  rows.push({
                    commodity: h.meta.label,
                    id: h.meta.id,
                    unit: h.meta.unit,
                    date: o.date,
                    value: o.value,
                    frequency: 'daily (sparkline)',
                  });
                });
              });
              return rows;
            }}
          />
        </div>

        {/* Hero: ticker + KPI cards */}
        <div className={`rounded-2xl border p-4 sm:p-6 mb-10 ${heroBg}`}>
          <CommodityTicker
            isDarkMode={isDarkMode}
            commodities={commodities}
            loading={commoditiesLoading}
            onRetry={retryCommodities}
          />

          <div id={slugify(KPI_TITLE)} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {kpi.map(k => (
              <div key={k.label} className={`p-3 rounded-lg border ${cardBg}`}>
                <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>{k.label}</div>
                <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>
                  {k.obs
                    ? `$${k.obs.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                    : commoditiesLoading ? '…' : '—'}
                </div>
                <div className={`flex items-center justify-between gap-2 text-[11px] mt-0.5`}>
                  <span className={textMuted}>{k.obs ? `${k.obs.date} · ${k.unit}` : k.unit}</span>
                  {k.change != null && (
                    <span className={`tabular-nums font-medium ${k.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {k.change >= 0 ? '▲' : '▼'} {Math.abs(k.change).toFixed(1)}%
                      {k.ytd != null && (
                        <span className={`ml-1 font-normal ${textMuted}`}>YTD {k.ytd >= 0 ? '+' : ''}{k.ytd.toFixed(0)}%</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-start justify-between gap-2 flex-wrap">
            <div className={`text-xs ${textMuted}`}>
              Prices: FRED (EIA, IMF, LBMA). Reserves &amp; production: {reserves?.source === 'EIA' ? 'EIA International Energy Statistics' : 'BP/EIA seed data'}. 
              Country data: World Bank.
            </div>
            <SocialShareMenu title={KPI_TITLE} isDarkMode={isDarkMode} className="shrink-0" />
          </div>
        </div>

        {/* Chapter 1 — Who Has What? */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 1"
            title="Who Has What?"
            subtitle="Reserves, output and rent dependence concentrate in a handful of countries — often not the same ones. The US pumps the most oil while holding little of it; Venezuela sits on a century of supply it barely produces."
            share={false}
          />
          <ResourceHoldersPanel
            isDarkMode={isDarkMode}
            loading={loading}
            reserves={reserves}
            production={production}
            totalResourceRents={data?.totalResourceRents}
            oilRents={data?.oilRents}
            naturalGasRents={data?.naturalGasRents}
            coalRents={data?.coalRents}
            mineralRents={data?.mineralRents}
            forestRents={data?.forestRents}
          />
        </section>

        {/* Chapter 2 — Dependence Quadrant */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 2"
            title="The Dependence Quadrant"
            subtitle="Every economy sits somewhere on the resource-rents / growth plane. Four archetypes emerge — from diversified rich to caught in the resource curse."
          />
          {loading ? (
            <SkeletonCard isDarkMode={isDarkMode} className="h-[400px] sm:h-[520px]" />
          ) : data ? (
            <ResourceDependenceQuadrant
              isDarkMode={isDarkMode}
              totalResourceRents={data.totalResourceRents}
              gdpGrowth={data.gdpGrowth}
              gdpPerCapita={data.gdpPerCapitaPPP}
              oilRents={data.oilRents}
              naturalGasRents={data.naturalGasRents}
              coalRents={data.coalRents}
              mineralRents={data.mineralRents}
              forestRents={data.forestRents}
            />
          ) : null}
        </section>

        {/* Chapter 3 — Boom & Bust */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 3"
            title="Boom &amp; Bust"
            subtitle="Fifty years of oil prices, broken into the shocks that made and unmade petrostates. Click any era to see who won and who lost."
          />
          {commoditiesLoading ? (
            <SkeletonCard isDarkMode={isDarkMode} className="h-[300px] sm:h-[400px]" />
          ) : (
            <CommoditySupercycleTimeline
              isDarkMode={isDarkMode}
              wti={commodities['wti']}
              brent={commodities['brent']}
            />
          )}
        </section>

        {/* Chapter 4 — Reserves Clock */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 4"
            title="The Reserves Clock"
            subtitle="Reserves ÷ production = years of supply at today's extraction rate. Not a doomsday countdown: booked oil reserves doubled even as we extracted a trillion barrels. Transition metals, though, are more concentrated than OPEC oil."
            share={false}
          />
          <ReservesClockGauge isDarkMode={isDarkMode} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <OilReserveGrowthChart isDarkMode={isDarkMode} />
            <CriticalMineralsPanel isDarkMode={isDarkMode} />
          </div>
        </section>

        {/* Chapter 5 — Petrostate Vulnerability */}
        <section className="mb-6">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 5"
            title="Curse or Blessing?"
            subtitle="A composite vulnerability score for every tracked economy — the higher, the more exposed to commodity swings. Beside the ranking: the oil price each Gulf budget needs, and who actually saved the windfall."
            shareSubject="dataset"
          />
          {loading ? (
            <SkeletonCard isDarkMode={isDarkMode} className="h-96" />
          ) : data ? (
            <PetrostateVulnerabilityTable
              isDarkMode={isDarkMode}
              totalResourceRents={data.totalResourceRents}
              oilRents={data.oilRents}
              fossilFuelExports={data.fossilFuelExports}
              manufacturingValueAdded={data.manufacturingValueAdded}
              gdpGrowth={data.gdpGrowth}
            />
          ) : null}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <FiscalBreakevenPanel isDarkMode={isDarkMode} brentPrice={commodities['brent']?.latest?.value} />
            <SovereignWealthPanel isDarkMode={isDarkMode} />
          </div>

          <div className={`mt-4 text-sm ${textSec}`}>
            Want to explore this further?{' '}
            <a href="/development" className={`underline underline-offset-2 ${isDarkMode ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'}`}>
              Resource Curse chart on the Development Index
            </a>
            {' '}·{' '}
            <a href="/global-heatmap" className={`underline underline-offset-2 ${isDarkMode ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'}`}>
              Map any indicator globally
            </a>
          </div>
        </section>

        <RelatedPages currentPath="/resources" isDarkMode={isDarkMode} />

        <div className={`text-xs text-center mt-16 pb-6 ${textMuted}`}>
          Data sources: FRED (via EIA, IMF, LBMA); World Bank; EIA International Energy Statistics (falls back to
          BP/EIA seed data if no API key is configured).
        </div>
      </div>
    </div>
  );
}
