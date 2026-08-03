'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { fetchGlobalData, type CountryData } from '../services/worldbank';
import { fetchAllCommodityPrices, clearCommodityCache, type CommodityHistory } from '../services/commodities';
import { fetchOilReserves, fetchOilProduction, type ReservesSnapshot, type ProductionSnapshot } from '../services/eia';

const CommodityTicker = dynamic(() => import('../components/CommodityTicker'), { ssr: false });
const ResourceDependenceQuadrant = dynamic(() => import('../components/ResourceDependenceQuadrant'), { ssr: false });
const CommoditySupercycleTimeline = dynamic(() => import('../components/CommoditySupercycleTimeline'), { ssr: false });
const ReservesClockGauge = dynamic(() => import('../components/ReservesClockGauge'), { ssr: false });
const PetrostateVulnerabilityTable = dynamic(() => import('../components/PetrostateVulnerabilityTable'), { ssr: false });

type GlobalData = Awaited<ReturnType<typeof fetchGlobalData>>;

interface ChapterHeaderProps {
  isDarkMode: boolean;
  chapter: string;
  title: string;
  subtitle: string;
}

function ChapterHeader({ isDarkMode, chapter, title, subtitle }: ChapterHeaderProps) {
  return (
    <div className="mb-6">
      <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
        {chapter}
      </div>
      <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      <p className={`text-sm sm:text-base max-w-3xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</p>
    </div>
  );
}

function SkeletonCard({ isDarkMode, className = 'h-64' }: { isDarkMode: boolean; className?: string }) {
  return (
    <div className={`${className} rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
  );
}

// Find the most recent non-null, non-zero value for a country.
function latest(series: CountryData[] | undefined, country: string): number | null {
  if (!series) return null;
  for (let i = series.length - 1; i >= 0; i--) {
    const v = Number(series[i][country]);
    if (!isNaN(v) && v !== 0) return v;
  }
  return null;
}

// Rank countries by latest value in a series, returning the top N with country + value.
function topCountries(series: CountryData[] | undefined, n: number): { country: string; value: number }[] {
  if (!series || series.length === 0) return [];
  const countries = new Set<string>();
  series.forEach(row => Object.keys(row).forEach(k => k !== 'year' && countries.add(k)));
  const values: { country: string; value: number }[] = [];
  countries.forEach(c => {
    const v = latest(series, c);
    if (v != null) values.push({ country: c, value: v });
  });
  return values.sort((a, b) => b.value - a.value).slice(0, n);
}

export default function ResourcesPage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
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
          fetchGlobalData().catch(() => null),
          fetchAllCommodityPrices().catch(() => ({} as { [id: string]: CommodityHistory })),
          fetchOilReserves().catch(() => null),
          fetchOilProduction().catch(() => null),
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

  const topOilRentsCountries = useMemo(() => topCountries(data?.oilRents, 5), [data]);
  const topReserves = useMemo(() => reserves?.data?.slice(0, 5) ?? [], [reserves]);
  const topProducers = useMemo(() => production?.data?.slice(0, 5) ?? [], [production]);

  const kpi = useMemo(() => {
    const wtiLatest = commodities['wti']?.latest;
    const brentLatest = commodities['brent']?.latest;
    const gasLatest = commodities['henryHub']?.latest;
    const goldLatest = commodities['gold']?.latest;
    return { wtiLatest, brentLatest, gasLatest, goldLatest };
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
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
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

        {/* Hero: ticker + KPI cards */}
        <div className={`rounded-2xl border p-4 sm:p-6 mb-10 ${heroBg}`}>
          <CommodityTicker
            isDarkMode={isDarkMode}
            commodities={commodities}
            loading={commoditiesLoading}
            onRetry={retryCommodities}
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {[
              { label: 'WTI Crude', obs: kpi.wtiLatest, unit: '$/bbl' },
              { label: 'Brent Crude', obs: kpi.brentLatest, unit: '$/bbl' },
              { label: 'Natural Gas', obs: kpi.gasLatest, unit: '$/MMBtu' },
              { label: 'Gold', obs: kpi.goldLatest, unit: '$/oz' },
            ].map(k => (
              <div key={k.label} className={`p-3 rounded-lg border ${cardBg}`}>
                <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>{k.label}</div>
                <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>
                  {k.obs
                    ? `$${k.obs.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                    : commoditiesLoading ? '…' : '—'}
                </div>
                <div className={`text-[11px] ${textMuted}`}>
                  {k.obs ? `${k.obs.date} · ${k.unit}` : k.unit}
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-4 text-xs ${textMuted}`}>
            Prices: FRED (EIA, IMF, LBMA). Reserves &amp; production: {reserves?.source === 'EIA' ? 'EIA International Energy Statistics' : 'BP/EIA seed data'}. 
            Country data: World Bank.
          </div>
        </div>

        {/* Chapter 1 — Who Has What? */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 1"
            title="Who Has What?"
            subtitle="Proven reserves and production concentrate in a handful of countries — often the same ones. Together they set global supply."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className={`rounded-lg border p-5 ${cardBg}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-base font-semibold ${textPrimary}`}>Top Oil Reserves</h4>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                  reserves?.source === 'EIA' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-600'
                }`}>
                  {reserves?.source === 'EIA' ? 'EIA live' : 'Seed 2024'}
                </span>
              </div>
              {loading && !topReserves.length ? (
                <SkeletonCard isDarkMode={isDarkMode} className="h-48" />
              ) : (
                <ul className="space-y-2">
                  {topReserves.map((r, i) => (
                    <li key={r.country} className="flex items-center justify-between">
                      <span className={`text-sm ${textPrimary}`}>{i + 1}. {r.country}</span>
                      <span className={`text-sm font-medium tabular-nums ${textSec}`}>
                        {r.value.toLocaleString()} <span className={`text-[11px] ${textMuted}`}>bn bbl</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={`rounded-lg border p-5 ${cardBg}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-base font-semibold ${textPrimary}`}>Top Oil Producers</h4>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                  production?.source === 'EIA' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-600'
                }`}>
                  {production?.source === 'EIA' ? 'EIA live' : 'Seed 2024'}
                </span>
              </div>
              {loading && !topProducers.length ? (
                <SkeletonCard isDarkMode={isDarkMode} className="h-48" />
              ) : (
                <ul className="space-y-2">
                  {topProducers.map((r, i) => (
                    <li key={r.country} className="flex items-center justify-between">
                      <span className={`text-sm ${textPrimary}`}>{i + 1}. {r.country}</span>
                      <span className={`text-sm font-medium tabular-nums ${textSec}`}>
                        {r.value.toLocaleString()} <span className={`text-[11px] ${textMuted}`}>kb/d</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={`rounded-lg border p-5 ${cardBg}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-base font-semibold ${textPrimary}`}>Most Oil-Rent Dependent</h4>
                <span className={`text-[10px] uppercase tracking-wider ${textMuted}`}>World Bank</span>
              </div>
              {loading ? (
                <SkeletonCard isDarkMode={isDarkMode} className="h-48" />
              ) : topOilRentsCountries.length === 0 ? (
                <div className={`text-sm ${textMuted}`}>No data available.</div>
              ) : (
                <ul className="space-y-2">
                  {topOilRentsCountries.map((r, i) => (
                    <li key={r.country} className="flex items-center justify-between">
                      <span className={`text-sm ${textPrimary}`}>{i + 1}. {r.country}</span>
                      <span className={`text-sm font-medium tabular-nums ${textSec}`}>
                        {r.value.toFixed(1)}<span className={`text-[11px] ${textMuted}`}>% of GDP</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
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
            <SkeletonCard isDarkMode={isDarkMode} className="h-[520px]" />
          ) : data ? (
            <ResourceDependenceQuadrant
              isDarkMode={isDarkMode}
              totalResourceRents={data.totalResourceRents}
              gdpGrowth={data.gdpGrowth}
              gdpPerCapita={data.gdpPerCapitaPPP}
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
            <SkeletonCard isDarkMode={isDarkMode} className="h-[400px]" />
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
            subtitle="Reserves ÷ production = years of supply at today's extraction rate. Not a doomsday countdown — proven reserves grow as prices rise — but a snapshot of geological pressure."
          />
          <ReservesClockGauge isDarkMode={isDarkMode} />
        </section>

        {/* Chapter 5 — Petrostate Vulnerability */}
        <section className="mb-6">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 5"
            title="Curse or Blessing?"
            subtitle="A composite vulnerability score for every tracked economy — the higher, the more exposed to commodity swings. Sort by any column."
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

        <div className={`text-xs text-center mt-16 pb-6 ${textMuted}`}>
          Data sources: FRED (via EIA, IMF, LBMA); World Bank; EIA International Energy Statistics (falls back to
          BP/EIA seed data if no API key is configured).
        </div>
      </div>
    </div>
  );
}
