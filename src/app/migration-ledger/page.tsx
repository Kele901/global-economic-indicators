'use client';

// Migration Ledger — 8-chapter scrollytelling page mirroring the Climate,
// Defense and Trade Ledger structure. Pulls three new live WB indicators
// (remittances received, migrant stock, refugees by origin) and joins
// them with the curated UNHCR / KNOMAD / UN DESA / IOM snapshots in
// migrationCurated.ts.

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { fetchGlobalData } from '../services/worldbank';
import {
  CURATED_LAST_UPDATED,
  MIGRATION_COUNTRY_META,
  REFUGEE_STOCKS_2025,
  REMITTANCE_CORRIDORS_2024,
} from '../services/migrationCurated';
import { topNCountries, latestEntry, worldSum } from '../utils/countryData';
import StalenessBanner from '../components/StalenessBanner';
import DataDownloadButton from '../components/DataDownloadButton';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedPages from '../components/RelatedPages';
import ChartMeta from '../components/ChartMeta';
import DataQualityBadge from '../components/DataQualityBadge';
import LazyMount from '../components/LazyMount';

const MigrationTicker            = dynamic(() => import('../components/MigrationTicker'),            { ssr: false });
const RefugeeFlowsChart          = dynamic(() => import('../components/RefugeeFlowsChart'),          { ssr: false });
const RemittanceCorridorTable    = dynamic(() => import('../components/RemittanceCorridorTable'),    { ssr: false });
const MigrantStocksGrid          = dynamic(() => import('../components/MigrantStocksGrid'),          { ssr: false });
const AsylumFlowsChart           = dynamic(() => import('../components/AsylumFlowsChart'),           { ssr: false });
const BrainMigrationTable        = dynamic(() => import('../components/BrainMigrationTable'),        { ssr: false });
const DiasporaContributionsChart = dynamic(() => import('../components/DiasporaContributionsChart'), { ssr: false });
const MigrantSafetyTimeline      = dynamic(() => import('../components/MigrantSafetyTimeline'),      { ssr: false });

type GlobalData = Awaited<ReturnType<typeof fetchGlobalData>>;

function ChapterHeader({ isDarkMode, chapter, title, subtitle }: {
  isDarkMode: boolean; chapter: string; title: string; subtitle: string;
}) {
  return (
    <div className="mb-6">
      <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>
        {chapter}
      </div>
      <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      <p className={`text-sm sm:text-base max-w-3xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</p>
    </div>
  );
}

export default function MigrationLedgerPage() {
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
          console.warn('[migration-ledger] fetchGlobalData failed', err);
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
        console.warn('[migration-ledger] retry fetchGlobalData failed', err);
        return null;
      });
      setData(wb);
    } finally {
      setLoading(false);
    }
  };

  const remittances = data?.remittancesReceived ?? [];
  const migrantStock = data?.migrantStock ?? [];
  const refugeesByOrigin = data?.refugeesByOrigin ?? [];
  const netMigration = data?.netMigration ?? [];

  const topReceivers = useMemo(() => topNCountries(remittances, 3), [remittances]);
  const worldRemittances = useMemo(() => worldSum(remittances), [remittances]);
  const totalRefugeesMn = useMemo(() => REFUGEE_STOCKS_2025.reduce((s, r) => s + r.refugeesMn, 0), []);
  const totalCorridorsBn = useMemo(() => REMITTANCE_CORRIDORS_2024.reduce((s, r) => s + r.amountBn, 0), []);

  const pageBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const heroBg = isDarkMode
    ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-sky-900/30 border-gray-700'
    : 'bg-gradient-to-br from-sky-50 via-white to-blue-50 border-sky-100';
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
            <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>
              The Migration Ledger
            </div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 ${textPrimary}`}>
              The People Flows
            </h1>
            <p className={`text-base sm:text-lg max-w-3xl ${textSec}`}>
              Who moves, where to, and what they send home. Live World Bank
              remittances / migrant stock / refugees data joined with UNHCR
              refugee crises, KNOMAD corridors, EU asylum flows, brain-drain
              rankings, and the Missing Migrants Project.
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
          label="UNHCR mid-2025 refugee stocks, KNOMAD corridors, UN DESA migrant stock 2024, Eurostat EU asylum, OECD brain-migration, IOM Missing Migrants Project"
          isDarkMode={isDarkMode}
        />

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <ChartMeta sourceId="wb-remittances" isDarkMode={isDarkMode} />
          <ChartMeta sourceId="migration-ledger-curated" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="curated" isDarkMode={isDarkMode} />
        </div>

        {/* Hero: ticker + KPI cards */}
        <div className={`rounded-2xl border p-4 sm:p-6 mb-10 ${heroBg}`}>
          <MigrationTicker
            isDarkMode={isDarkMode}
            remittances={remittances}
            loading={loading && !data}
            onRetry={retry}
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Top receiver</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>
                {topReceivers[0]?.country ?? (loading ? '…' : '—')}
              </div>
              <div className={`text-[11px] ${textMuted}`}>
                {topReceivers[0] ? `$${(topReceivers[0].value / 1e9).toFixed(1)}B remittances (${topReceivers[0].year})` : 'WB BX.TRF.PWKR.CD.DT'}
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Global remittances</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>
                {worldRemittances.total > 0 ? `$${(worldRemittances.total / 1e9).toFixed(0)}B` : (loading ? '…' : '—')}
              </div>
              <div className={`text-[11px] ${textMuted}`}>tracked-world · {worldRemittances.year || 'annual'}</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Refugees (top-14 origins)</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>{totalRefugeesMn.toFixed(1)}M</div>
              <div className={`text-[11px] ${textMuted}`}>UNHCR · mid-2025</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Top-25 corridors</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>${totalCorridorsBn.toFixed(0)}B</div>
              <div className={`text-[11px] ${textMuted}`}>combined USD flow · 2024</div>
            </div>
          </div>

          <div className={`mt-4 flex items-center justify-between gap-3 flex-wrap text-xs ${textMuted}`}>
            <div className="flex-1 min-w-[240px]">
              Live: World Bank migration series (BX.TRF.PWKR.CD.DT remittances, SM.POP.TOTL migrant stock, SM.POP.REFG.OR refugees by origin, SM.POP.NETM net migration).
              Curated: UNHCR refugee stocks, KNOMAD remittance corridors, UN DESA migrant share, Eurostat EU asylum, OECD talent migration, IOM Missing Migrants.
            </div>
            <DataDownloadButton
              isDarkMode={isDarkMode}
              filename="migration-ledger-data"
              label="Data"
              getData={() => {
                const rows: Record<string, unknown>[] = [];
                remittances.forEach(row => rows.push({ series: 'Remittances received (USD)', ...row }));
                migrantStock.forEach(row => rows.push({ series: 'International migrant stock', ...row }));
                refugeesByOrigin.forEach(row => rows.push({ series: 'Refugees by origin', ...row }));
                netMigration.forEach(row => rows.push({ series: 'Net migration', ...row }));
                return rows;
              }}
            />
          </div>
        </div>

        {/* Chapter 1 — The People Flows */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 1"
            title="The People Flows"
            subtitle="Every year hundreds of millions of dollars flow home from workers overseas to their families. The ticker names the top receivers — India, Mexico, the Philippines dominate, but small island states depend on remittances for a quarter of GDP."
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {topReceivers.slice(0, 3).map((r, i) => {
              const meta = MIGRATION_COUNTRY_META.find(m => m.wbKey === r.country);
              return (
                <div key={r.country} className={`rounded-lg border p-5 ${cardBg}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`text-xs uppercase tracking-wider ${textMuted}`}>#{i + 1} receiver · {r.year}</div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: meta?.color ?? '#0ea5e9' }} />
                  </div>
                  <div className={`text-2xl font-bold ${textPrimary}`}>{meta?.name ?? r.country}</div>
                  <div className={`text-lg font-semibold tabular-nums mt-1 ${textSec}`}>${(r.value / 1e9).toFixed(1)}B</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Chapter 2 — Refugees & Displacement */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 2"
            title="Refugees &amp; Displacement"
            subtitle="Fourteen countries generate three-quarters of the world&apos;s refugees. Syria, Ukraine, Afghanistan, Venezuela — each 5-6M — then Sudan, DRC, Myanmar. Numbers as of UNHCR mid-2025."
          />
          <RefugeeFlowsChart isDarkMode={isDarkMode} />
        </section>

        {/* Chapter 3 — Remittance Corridors */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 3"
            title="Remittance Corridors"
            subtitle="The USA-Mexico corridor alone moves $65B a year — more than any bilateral trade flow outside oil. The Gulf-India axis dwarfs everything else combined."
          />
          <RemittanceCorridorTable isDarkMode={isDarkMode} />
        </section>

        {/* Chapter 4 — Migrant Stocks */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 4"
            title="Migrant Stocks"
            subtitle="Where the foreign-born actually live. UAE is 88% foreign-born; Japan is 2.4%. Filter by category to see the four archetypes: Gulf labour, OECD immigration, city-state, and OECD emigration."
          />
          <MigrantStocksGrid isDarkMode={isDarkMode} />
        </section>

        {/* Chapter 5 — Asylum Flows */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 5"
            title="Asylum Flows"
            subtitle="EU-27 first-time asylum applications. The 2015 refugee crisis (1.25M) has never quite returned to pre-2015 levels; 2023 nearly matched it, then 2024 dipped as arrivals slowed."
          />
          <AsylumFlowsChart isDarkMode={isDarkMode} />
        </section>

        {/* Chapter 6 — Brain Gain / Brain Drain */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 6"
            title="Brain Gain / Brain Drain"
            subtitle="One-third of tertiary-educated Irish adults live abroad — the highest of any OECD member. The US, Canada, Australia are net beneficiaries. India and China lose a small % of graduates but the absolute numbers dominate global tech."
          />
          <BrainMigrationTable isDarkMode={isDarkMode} />
        </section>

        <LazyMount isDarkMode={isDarkMode}>
          {/* Chapter 7 — Diaspora Contributions */}
          <section className="mb-14">
            <ChapterHeader
              isDarkMode={isDarkMode}
              chapter="Chapter 7"
              title="Diaspora Contributions"
              subtitle="Remittances scaled against GDP. Small figures for absolute-USD giants like India (2% of GDP), massive figures for Nepal, Tajikistan, El Salvador (&gt;20% of GDP)."
            />
            <DiasporaContributionsChart
              isDarkMode={isDarkMode}
              remittances={remittances}
            />
          </section>

          {/* Chapter 8 — Border & Policy */}
          <section className="mb-14">
            <ChapterHeader
              isDarkMode={isDarkMode}
              chapter="Chapter 8"
              title="Border &amp; Policy"
              subtitle="The Mediterranean central route has killed nearly 25,000 people since 2014 — the deadliest border in the world. IOM Missing Migrants Project cumulative counts."
            />
            <MigrantSafetyTimeline isDarkMode={isDarkMode} />
          </section>
        </LazyMount>

        <RelatedPages currentPath="/migration-ledger" isDarkMode={isDarkMode} />

        <footer className={`mt-16 pt-6 border-t text-xs ${textMuted} ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          Live World Bank migration data via API proxy. Curated snapshots refreshed {CURATED_LAST_UPDATED}.
          UNHCR Refugee Data Finder, KNOMAD remittance matrix, UN DESA International Migrant Stock, Eurostat asylum
          data, OECD talent migration, IOM Missing Migrants Project.
        </footer>
      </div>
    </div>
  );
}
