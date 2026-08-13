'use client';

// Trade Ledger — 8-chapter scrollytelling page mirroring the Climate /
// Defense Ledger structure. Pulls live WB trade indicators (exports,
// imports, current account, openness, tariff rate) and joins them with
// the curated tariff timeline, WTO tariff snapshot, shipping index,
// trade agreements matrix, and supply-chain concentration table in
// tradeCurated.ts.

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { fetchGlobalData } from '../services/worldbank';
import {
  CURATED_LAST_UPDATED,
  TRADE_COUNTRY_META,
  WTO_APPLIED_TARIFFS_2024,
} from '../services/tradeCurated';
import { topNCountries, latestEntry } from '../utils/countryData';
import StalenessBanner from '../components/StalenessBanner';
import DataDownloadButton from '../components/DataDownloadButton';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedPages from '../components/RelatedPages';
import ChartMeta from '../components/ChartMeta';
import DataQualityBadge from '../components/DataQualityBadge';

const ExportTicker                  = dynamic(() => import('../components/ExportTicker'),                  { ssr: false });
const TradeBalanceChart             = dynamic(() => import('../components/TradeBalanceChart'),             { ssr: false });
const OpennessTrendChart            = dynamic(() => import('../components/OpennessTrendChart'),            { ssr: false });
const TariffWallChart               = dynamic(() => import('../components/TariffWallChart'),               { ssr: false });
const ShippingIndexChart            = dynamic(() => import('../components/ShippingIndexChart'),            { ssr: false });
const TradeAgreementsTable          = dynamic(() => import('../components/TradeAgreementsTable'),          { ssr: false });
const SupplyChainConcentrationTable = dynamic(() => import('../components/SupplyChainConcentrationTable'), { ssr: false });
const TradeFrictionsTimeline        = dynamic(() => import('../components/TradeFrictionsTimeline'),        { ssr: false });

type GlobalData = Awaited<ReturnType<typeof fetchGlobalData>>;

function ChapterHeader({ isDarkMode, chapter, title, subtitle }: {
  isDarkMode: boolean; chapter: string; title: string; subtitle: string;
}) {
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

export default function TradeLedgerPage() {
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
          console.warn('[trade-ledger] fetchGlobalData failed', err);
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
        console.warn('[trade-ledger] retry fetchGlobalData failed', err);
        return null;
      });
      setData(wb);
    } finally {
      setLoading(false);
    }
  };

  const exports = data?.exports ?? [];
  const imports = data?.imports ?? [];
  const currentAccount = data?.currentAccount ?? [];
  const tradeOpenness = data?.tradeOpenness ?? [];
  const tariffRate = data?.tariffRate ?? [];

  const topExporters = useMemo(() => topNCountries(exports, 3), [exports]);
  const avgWtoTariff = useMemo(() =>
    WTO_APPLIED_TARIFFS_2024.reduce((s, r) => s + r.simpleMeanPct, 0) / WTO_APPLIED_TARIFFS_2024.length,
    []);
  const worldOpenness = useMemo(() => {
    // Simple median of top-15 tracked economies for latest year.
    const vals: number[] = [];
    TRADE_COUNTRY_META.slice(0, 15).forEach(m => {
      const e = latestEntry(tradeOpenness, m.wbKey);
      if (e) vals.push(e.value);
    });
    if (vals.length === 0) return 0;
    vals.sort((a, b) => a - b);
    return vals[Math.floor(vals.length / 2)];
  }, [tradeOpenness]);

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
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              The Trade Ledger
            </div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 ${textPrimary}`}>
              The Global Bazaar
            </h1>
            <p className={`text-base sm:text-lg max-w-3xl ${textSec}`}>
              Who sells to whom, at what price, through which chokepoint, and under what
              tariff. Live World Bank flows joined with WTO tariff walls, Baltic
              shipping indices, FTA membership, and the 2018-2025 trade-war timeline.
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
          label="WTO applied tariffs, US-China tariff timeline, BDI/WCI freight indices, RCEP/USMCA/CPTPP/EU/AfCFTA membership, supply-chain concentration (USGS + SEMI)"
          isDarkMode={isDarkMode}
        />

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <ChartMeta sourceId="trade-atlas" isDarkMode={isDarkMode} />
          <ChartMeta sourceId="trade-ledger-curated" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="curated" isDarkMode={isDarkMode} />
        </div>

        {/* Hero: ticker + KPI cards */}
        <div className={`rounded-2xl border p-4 sm:p-6 mb-10 ${heroBg}`}>
          <ExportTicker
            isDarkMode={isDarkMode}
            exports={exports}
            loading={loading && !data}
            onRetry={retry}
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Top exporter</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>
                {topExporters[0]?.country ?? (loading ? '…' : '—')}
              </div>
              <div className={`text-[11px] ${textMuted}`}>
                {topExporters[0] ? `${topExporters[0].value.toFixed(0)}% of GDP (${topExporters[0].year})` : 'World Bank NE.EXP.GNFS.ZS'}
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Median openness</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>
                {worldOpenness > 0 ? `${worldOpenness.toFixed(0)}%` : (loading ? '…' : '—')}
              </div>
              <div className={`text-[11px] ${textMuted}`}>trade / GDP among top-15</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Avg applied tariff</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>
                {avgWtoTariff.toFixed(1)}%
              </div>
              <div className={`text-[11px] ${textMuted}`}>WTO simple mean · 2024</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>US tariff on China</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 text-rose-500`}>
                51.1%
              </div>
              <div className={`text-[11px] ${textMuted}`}>post-Geneva deal (May 2025)</div>
            </div>
          </div>

          <div className={`mt-4 flex items-center justify-between gap-3 flex-wrap text-xs ${textMuted}`}>
            <div className="flex-1 min-w-[240px]">
              Live: World Bank trade series (NE.EXP.GNFS.ZS, NE.IMP.GNFS.ZS, NE.TRD.GNFS.ZS, BN.CAB.XOKA.GD.ZS, TM.TAX.MRCH.SM.AR.ZS).
              Curated: WTO Applied Tariffs 2024, PIIE US-China tariff timeline, Baltic + Drewry shipping indices, FTA membership matrix, USGS + SEMI supply-chain concentration.
            </div>
            <DataDownloadButton
              isDarkMode={isDarkMode}
              filename="trade-ledger-data"
              label="Data"
              getData={() => {
                const rows: Record<string, unknown>[] = [];
                exports.forEach(row => rows.push({ series: 'Exports (% GDP)', ...row }));
                imports.forEach(row => rows.push({ series: 'Imports (% GDP)', ...row }));
                currentAccount.forEach(row => rows.push({ series: 'Current account (% GDP)', ...row }));
                tradeOpenness.forEach(row => rows.push({ series: 'Trade openness (% GDP)', ...row }));
                tariffRate.forEach(row => rows.push({ series: 'Applied tariff (%)', ...row }));
                return rows;
              }}
            />
          </div>
        </div>

        {/* Chapter 1 — The Global Bazaar */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 1"
            title="The Global Bazaar"
            subtitle="The ticker names the ranks — who sells the most, relative to their own economy. Small trading hubs (Singapore, Netherlands, Vietnam) dominate the share leaderboard even though Chinese absolute flows dwarf everyone."
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {topExporters.slice(0, 3).map((e, i) => {
              const meta = TRADE_COUNTRY_META.find(m => m.wbKey === e.country);
              return (
                <div key={e.country} className={`rounded-lg border p-5 ${cardBg}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`text-xs uppercase tracking-wider ${textMuted}`}>#{i + 1} exporter · {e.year}</div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: meta?.color ?? '#f59e0b' }} />
                  </div>
                  <div className={`text-2xl font-bold ${textPrimary}`}>{meta?.name ?? e.country}</div>
                  <div className={`text-lg font-semibold tabular-nums mt-1 ${textSec}`}>{e.value.toFixed(1)}% of GDP</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Chapter 2 — The Balance */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 2"
            title="The Balance"
            subtitle="Current-account balance as % of GDP — who is a net creditor to the world, who is a net debtor. Persistent surpluses (Germany, China) and deficits (US, UK) reveal structural asymmetries in savings vs consumption."
          />
          <TradeBalanceChart isDarkMode={isDarkMode} currentAccount={currentAccount} />
        </section>

        {/* Chapter 3 — The Openness Race */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 3"
            title="The Openness Race"
            subtitle="Trade openness is the share of GDP moved across borders. Peaked globally in 2008; some countries have kept climbing (Vietnam, Mexico) while others have de-globalised (US, UK)."
          />
          <OpennessTrendChart isDarkMode={isDarkMode} tradeOpenness={tradeOpenness} />
        </section>

        {/* Chapter 4 — The Tariff Wall */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 4"
            title="The Tariff Wall"
            subtitle="How high the border walls really are, and who is raising them fastest. WTO applied rates for 15 economies at the top, US-China bilateral escalation 2018-2025 below."
          />
          <TariffWallChart isDarkMode={isDarkMode} />
        </section>

        {/* Chapter 5 — The Shipping Lanes */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 5"
            title="The Shipping Lanes"
            subtitle="Freight is the plumbing. Baltic Dry Index and Drewry WCI show how much it costs to move a bulk carrier or a 40-ft container. Covid, Ever Given, Red Sea — every shock leaves a spike."
          />
          <ShippingIndexChart isDarkMode={isDarkMode} />
        </section>

        {/* Chapter 6 — Trade Agreements */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 6"
            title="Trade Agreements"
            subtitle="Membership matrix for the five biggest FTAs. RCEP is Asia-Pacific + China; CPTPP is Asia-Pacific minus China + UK; USMCA is North America; the EU is the deepest bloc; AfCFTA is the newcomer."
          />
          <TradeAgreementsTable isDarkMode={isDarkMode} />
        </section>

        {/* Chapter 7 — Supply-Chain Concentration */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 7"
            title="Supply-Chain Concentration"
            subtitle="Where the world's critical inputs come from. Rare earths, lithium, cobalt, semiconductors, solar PV — any product where the top-3 producers combine for &gt;90% is a real single-point-of-failure risk."
          />
          <SupplyChainConcentrationTable isDarkMode={isDarkMode} />
        </section>

        {/* Chapter 8 — Trade Wars */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 8"
            title="Trade Wars"
            subtitle="Every major tariff, sanction, export-control and chokepoint event since 2018, colour-coded by severity. Filter to see only the systemic ones."
          />
          <TradeFrictionsTimeline isDarkMode={isDarkMode} />
        </section>

        <RelatedPages currentPath="/trade-ledger" isDarkMode={isDarkMode} />

        <footer className={`mt-16 pt-6 border-t text-xs ${textMuted} ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          Live trade data via World Bank API proxy. Curated snapshots refreshed {CURATED_LAST_UPDATED}.
          Historical bilateral flows and tariff timelines compiled from WTO World Tariff Profiles,
          PIIE US-China trade war chronology, USGS Minerals Yearbook, SEMI, UNCTAD Review of Maritime Transport.
        </footer>
      </div>
    </div>
  );
}
