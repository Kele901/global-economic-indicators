'use client';

// Debt Ledger — 8-chapter scrollytelling page mirroring the Climate /
// Defense / Trade Ledger structure. Pulls live WB debt / budget / growth
// / interest series and joins them with the curated IMF WEO
// projections, S&P/Moody's/Fitch ratings, sovereign CDS spreads,
// sovereign default history, central bank balance sheet snapshots, and
// BIS household debt in debtCurated.ts. The pre-existing debt
// sustainability scorecard is folded into Chapter 1 as a drill-down.

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ThemeToggle from '../components/ThemeToggle';
import { fetchGlobalData, CountryData } from '../services/worldbank';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES, COUNTRY_COLORS, type CountryKey } from '../utils/countryMappings';
import {
  CURATED_LAST_UPDATED,
  DEBT_COUNTRY_META,
  IMF_WEO_DEBT_PROJECTIONS,
  SOVEREIGN_RATINGS_2025,
  SOVEREIGN_CDS_SEP_2025,
  SOVEREIGN_DEFAULTS_2000_2024,
  HOUSEHOLD_DEBT_2024,
} from '../services/debtCurated';
import { latestEntry } from '../utils/countryData';
import StalenessBanner from '../components/StalenessBanner';
import DataDownloadButton from '../components/DataDownloadButton';
import MethodologyPopover from '../components/MethodologyPopover';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedPages from '../components/RelatedPages';
import ChartMeta from '../components/ChartMeta';
import DataQualityBadge from '../components/DataQualityBadge';
import LazyMount from '../components/LazyMount';
import SocialShareMenu from '../components/SocialShareMenu';
import { slugify } from '../lib/share';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

const DebtLoadTicker              = dynamic(() => import('../components/DebtLoadTicker'),              { ssr: false });
const DebtTrajectoryChart         = dynamic(() => import('../components/DebtTrajectoryChart'),         { ssr: false });
const DebtBuildupWaterfall        = dynamic(() => import('../components/DebtBuildupWaterfall'),        { ssr: false });
const PublicPrivateDebtChart      = dynamic(() => import('../components/PublicPrivateDebtChart'),      { ssr: false });
const DebtServicePeaksTable       = dynamic(() => import('../components/DebtServicePeaksTable'),       { ssr: false });
const RatingsAndCdsGrid           = dynamic(() => import('../components/RatingsAndCdsGrid'),           { ssr: false });
const SovereignDefaultsTimeline   = dynamic(() => import('../components/SovereignDefaultsTimeline'),   { ssr: false });
const CentralBankBalanceSheetChart= dynamic(() => import('../components/CentralBankBalanceSheetChart'),{ ssr: false });
const HouseholdDebtChart          = dynamic(() => import('../components/HouseholdDebtChart'),          { ssr: false });
const FiscalReckoningQuadrant     = dynamic(() => import('../components/FiscalReckoningQuadrant'),     { ssr: false });

type GlobalData = Awaited<ReturnType<typeof fetchGlobalData>>;

function ChapterHeader({ isDarkMode, chapter, title, subtitle }: {
  isDarkMode: boolean; chapter: string; title: string; subtitle: string;
}) {
  return (
    <div className="mb-6">
      <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>
        {chapter}
      </div>
      <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      <p className={`text-sm sm:text-base max-w-3xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</p>
    </div>
  );
}

// Preserve the pre-existing sustainability score computation so the
// scorecard chapter continues to work.
function getLatest(series: CountryData[] | undefined, country: string): number | null {
  if (!series) return null;
  for (let i = series.length - 1; i >= 0; i--) {
    const v = Number(series[i][country]);
    if (!isNaN(v) && v !== 0) return v;
  }
  return null;
}
function computeScore(debt: number | null, debtService: number | null, budget: number | null, growth: number | null, interest: number | null): { score: number; label: string; color: string } {
  let score = 100;
  if (debt !== null) {
    if (debt > 120) score -= 30; else if (debt > 90) score -= 20; else if (debt > 60) score -= 10;
  }
  if (debtService !== null) {
    if (debtService > 20) score -= 25; else if (debtService > 10) score -= 15; else if (debtService > 5) score -= 5;
  }
  if (budget !== null) {
    if (budget < -6) score -= 20; else if (budget < -3) score -= 10; else if (budget > 0) score += 5;
  }
  if (growth !== null && interest !== null) {
    const igDiff = interest - growth;
    if (igDiff > 3) score -= 20; else if (igDiff > 0) score -= 10; else score += 5;
  }
  score = Math.max(0, Math.min(100, score));
  if (score >= 75) return { score, label: 'Low Risk', color: 'text-green-500' };
  if (score >= 50) return { score, label: 'Moderate', color: 'text-yellow-500' };
  if (score >= 25) return { score, label: 'Elevated', color: 'text-orange-500' };
  return { score, label: 'High Risk', color: 'text-red-500' };
}

export default function DebtLedgerPage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const [data, setData] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['USA', 'Japan', 'UK', 'France', 'Germany', 'Brazil']);

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
          console.warn('[debt-ledger] fetchGlobalData failed', err);
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
        console.warn('[debt-ledger] retry fetchGlobalData failed', err);
        return null;
      });
      setData(wb);
    } finally {
      setLoading(false);
    }
  };

  const governmentDebt   = data?.governmentDebt   ?? [];
  const publicDebtService= data?.publicDebtService?? [];
  const budgetBalance    = data?.budgetBalance    ?? [];
  const gdpGrowth        = data?.gdpGrowth        ?? [];
  const interestRates    = data?.interestRates    ?? [];

  // Scorecard preserved from the previous drilldown page.
  const scoreCards = useMemo(() => {
    return COUNTRY_KEYS.map(ck => {
      const debt = getLatest(governmentDebt, ck);
      const debtService = getLatest(publicDebtService, ck);
      const budget = getLatest(budgetBalance, ck);
      const growth = getLatest(gdpGrowth, ck);
      const interest = getLatest(interestRates, ck);
      const { score, label, color } = computeScore(debt, debtService, budget, growth, interest);
      return { country: ck, debt, debtService, budget, growth, interest, score, label, color };
    }).sort((a, b) => a.score - b.score);
  }, [governmentDebt, publicDebtService, budgetBalance, gdpGrowth, interestRates]);

  // WEO projection chart data
  const weoData = useMemo(() => {
    const years = Array.from({ length: 11 }, (_, i) => 2019 + i);
    return years.map(year => {
      const row: Record<string, number | string> = { year };
      IMF_WEO_DEBT_PROJECTIONS.forEach(s => {
        const p = s.points.find(pt => pt.year === year);
        if (p) row[s.name] = p.value;
      });
      return row;
    });
  }, []);

  // KPI figures
  const topDebtor = useMemo(() => {
    const list = DEBT_COUNTRY_META
      .map(m => ({ name: m.name, v: latestEntry(governmentDebt, m.wbKey) }))
      .filter(r => r.v)
      .sort((a, b) => (b.v!.value - a.v!.value));
    return list[0];
  }, [governmentDebt]);
  const distressedCount = SOVEREIGN_CDS_SEP_2025.filter(c => c.spreadBps > 400).length;
  const defaultsPost2020 = SOVEREIGN_DEFAULTS_2000_2024.filter(d => d.year >= 2020).length;

  const pageBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const heroBg = isDarkMode
    ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-rose-900/30 border-gray-700'
    : 'bg-gradient-to-br from-rose-50 via-white to-orange-50 border-rose-100';
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const tooltipStyle: React.CSSProperties = isDarkMode
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px' }
    : { backgroundColor: '#fff',    border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${pageBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Breadcrumbs isDarkMode={isDarkMode} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>
              The Debt Ledger
            </div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 ${textPrimary}`}>
              The Age of Leverage
            </h1>
            <p className={`text-base sm:text-lg max-w-3xl ${textSec}`}>
              Sovereign balance sheets after fifteen years of QE, pandemic-era stimulus and
              rising rates. Live World Bank fiscal series joined with IMF WEO projections,
              rating-agency letter grades, CDS spreads, sovereign defaults 2000-2024, central
              bank balance sheets and BIS household debt.
            </p>
          </div>
          <ThemeToggle isDarkMode={isDarkMode} className="self-end sm:self-auto" />
        </div>

        <StalenessBanner
          lastUpdated={CURATED_LAST_UPDATED}
          label="IMF WEO Oct-2024 debt projections, S&P / Moody's / Fitch ratings mid-2025, 5Y CDS Sep-2025, sovereign default history 2000-2024, Fed / ECB / BOJ / PBOC balance sheets, BIS household debt 2024"
          isDarkMode={isDarkMode}
        />

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <ChartMeta sourceId="debt-ledger-curated" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="estimate" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="curated" isDarkMode={isDarkMode} />
        </div>

        <div id={slugify('Debt Ledger key figures')} className={`rounded-2xl border p-4 sm:p-6 mb-10 ${heroBg}`}>
          <DebtLoadTicker
            isDarkMode={isDarkMode}
            governmentDebt={governmentDebt}
            loading={loading && !data}
            onRetry={retry}
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Most indebted</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>
                {topDebtor?.name ?? (loading ? '…' : '—')}
              </div>
              <div className={`text-[11px] ${textMuted}`}>
                {topDebtor?.v ? `${topDebtor.v.value.toFixed(0)}% GDP (${topDebtor.v.year})` : 'World Bank GC.DOD.TOTL.GD.ZS'}
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Distressed sovereigns</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 text-rose-500`}>{distressedCount}</div>
              <div className={`text-[11px] ${textMuted}`}>with 5Y CDS &gt; 400bps</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Defaults since 2020</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>{defaultsPost2020}</div>
              <div className={`text-[11px] ${textMuted}`}>Sri Lanka, Ghana, Zambia, Russia…</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Fed balance sheet</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>$6.7T</div>
              <div className={`text-[11px] ${textMuted}`}>Jun-2025 · peak $8.9T (Q2-22)</div>
            </div>
          </div>

          <div className={`mt-4 flex items-center justify-between gap-3 flex-wrap text-xs ${textMuted}`}>
            <div className="flex-1 min-w-[240px]">
              Live: World Bank fiscal series (GC.DOD.TOTL.GD.ZS, DT.TDS.DECT.EX.ZS, GC.BAL.CASH.GD.ZS, NY.GDP.MKTP.KD.ZG, FR.INR.LEND).
              Curated: IMF WEO Oct-2024, S&amp;P/Moody&apos;s/Fitch, sovereign CDS Sep-2025, default database 2000-2024, CB balance sheets, BIS household debt.
            </div>
            <DataDownloadButton
              isDarkMode={isDarkMode}
              filename="debt-ledger-data"
              shareTitle="Debt Ledger key figures"
              label="Data"
              getData={() => {
                const rows: Record<string, unknown>[] = [];
                governmentDebt.forEach(row => rows.push({ series: 'Government debt (% GDP)', ...row }));
                publicDebtService.forEach(row => rows.push({ series: 'Debt service (% exports)', ...row }));
                budgetBalance.forEach(row => rows.push({ series: 'Budget balance (% GDP)', ...row }));
                gdpGrowth.forEach(row => rows.push({ series: 'GDP growth (%)', ...row }));
                interestRates.forEach(row => rows.push({ series: 'Lending rate (%)', ...row }));
                return rows;
              }}
            />
          </div>
        </div>

        {/* Chapter 1 — Global Debt Load */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 1"
            title="Global Debt Load"
            subtitle="Sustainability scorecard for the 33 tracked economies. Each card scores debt level, debt service, budget balance, and the interest-growth differential into a composite 0-100 grade. Click cards to add or remove countries from the chapters below."
          />

          <div id={slugify('Sustainability Scorecard')} className={`rounded-xl border p-4 sm:p-6 mb-4 ${cardBg}`}>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <h3 className={`text-base sm:text-lg font-semibold ${textPrimary}`}>Sustainability Scorecard</h3>
              <MethodologyPopover
                isDarkMode={isDarkMode}
                slug="debt-sustainability-score"
                title="Debt sustainability score"
                description="Composite 0-100 score. Starts at 100 and subtracts points for high debt levels, heavy debt service, deficits, and unfavourable interest-growth differentials."
                formula={`score = 100
  − (debt > 60 → −10, > 90 → −20, > 120 → −30)
  − (debtService > 5 → −5, > 10 → −15, > 20 → −25)
  − (deficit < −3 → −10, < −6 → −20; surplus → +5)
  − (r − g > 0 → −10, > 3 → −20; else +5)`}
                inputs={[
                  'Debt-to-GDP — WB GC.DOD.TOTL.GD.ZS',
                  'Debt service — WB DT.TDS.DECT.EX.ZS',
                  'Budget balance — WB GC.BAL.CASH.GD.ZS',
                  'Growth — WB NY.GDP.MKTP.KD.ZG',
                  'Interest — proxied by lending rate FR.INR.LEND',
                ]}
              />
              <div className="ml-auto flex items-center gap-2 flex-wrap shrink-0">
                <SocialShareMenu title="Sustainability Scorecard" isDarkMode={isDarkMode} subject="dataset" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {scoreCards.map(sc => (
                <button
                  key={sc.country}
                  type="button"
                  onClick={() => setSelectedCountries(prev =>
                    prev.includes(sc.country) ? prev.filter(c => c !== sc.country) :
                    prev.length < 8 ? [...prev, sc.country] : prev
                  )}
                  aria-pressed={selectedCountries.includes(sc.country)}
                  className={`text-left rounded-lg border p-3 transition-all ${cardBg} ${
                    selectedCountries.includes(sc.country) ? 'ring-2 ring-rose-500' : ''
                  }`}
                >
                  <p className={`text-xs font-medium truncate ${textPrimary}`}>{COUNTRY_DISPLAY_NAMES[sc.country as CountryKey] ?? sc.country}</p>
                  <p className={`text-xl font-bold ${sc.color}`}>{sc.score}</p>
                  <p className={`text-xs ${sc.color}`}>{sc.label}</p>
                  <p className={`text-xs mt-1 ${textMuted}`}>Debt: {sc.debt !== null ? `${sc.debt.toFixed(0)}%` : 'N/A'}</p>
                </button>
              ))}
            </div>
          </div>

          {/* IMF WEO projection line chart */}
          <div id={slugify('IMF WEO Debt Projections, 2019-2029')} className={`rounded-xl border p-4 sm:p-6 ${cardBg}`}>
            <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
              <h3 className={`text-base sm:text-lg font-semibold ${textPrimary}`}>IMF WEO Debt Projections, 2019-2029</h3>
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <SocialShareMenu title="IMF WEO Debt Projections, 2019-2029" isDarkMode={isDarkMode} />
              </div>
            </div>
            <p className={`text-xs mb-4 ${textMuted}`}>Where the biggest sovereigns are headed. Dashed line marks 2024 — everything after is projected.</p>
            <div className="h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weoData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                  <XAxis dataKey="year" stroke={axis} tick={{ fontSize: 11 }} />
                  <YAxis stroke={axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <ReferenceLine x={2024} stroke={axis} strokeDasharray="3 3" />
                  {IMF_WEO_DEBT_PROJECTIONS.slice(0, 8).map(s => {
                    const meta = DEBT_COUNTRY_META.find(m => m.iso3 === s.iso3);
                    return (
                      <Line key={s.iso3} type="monotone" dataKey={s.name} name={s.name} stroke={meta?.color ?? '#6b7280'} strokeWidth={2} dot={false} connectNulls />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6">
            <DebtTrajectoryChart isDarkMode={isDarkMode} governmentDebt={governmentDebt} />
          </div>
          <div className="mt-6">
            <DebtBuildupWaterfall isDarkMode={isDarkMode} governmentDebt={governmentDebt} />
          </div>
        </section>

        {/* Chapter 2 — Public vs Private */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 2"
            title="Public vs Private"
            subtitle="The headline number is the government debt line, but the real vulnerability is often on the household side. Switzerland, Australia and South Korea are leveraged private-sector economies with modest sovereign books."
          />
          <PublicPrivateDebtChart isDarkMode={isDarkMode} governmentDebt={governmentDebt} />
        </section>

        {/* Chapter 3 — Debt Service Peaks */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 3"
            title="Debt Service Peaks"
            subtitle="For emerging markets, the constraint isn't the debt stock — it's the coupon. Debt service as share of exports crosses 20% into distress territory. Live WB DT.TDS.DECT.EX.ZS."
          />
          <DebtServicePeaksTable isDarkMode={isDarkMode} publicDebtService={publicDebtService} />
        </section>

        {/* Chapter 4 — Rating & CDS */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 4"
            title="Rating & CDS"
            subtitle="What the market and the rating agencies think. Letter grades don't move often; CDS spreads move every day. When they diverge, the market is usually early."
          />
          <RatingsAndCdsGrid isDarkMode={isDarkMode} />
        </section>

        {/* Chapter 5 — Sovereign Defaults */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 5"
            title="Sovereign Defaults"
            subtitle="Every full or selective sovereign default since 2000 — Argentina's serial repeat performances, Greece's 2012 PSI, the Covid-era wave (Zambia 2020, Sri Lanka 2022, Ghana 2022), Russia's sanctions default."
          />
          <SovereignDefaultsTimeline isDarkMode={isDarkMode} />
        </section>

        {/* Chapter 6 — Central Bank Balance Sheets */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 6"
            title="Central Bank Balance Sheets"
            subtitle="The other side of sovereign debt is the central bank that bought it. Fed, ECB, BOJ, PBOC assets in USD trillions. The Bank of Japan owns roughly half of Japanese government bonds outstanding."
          />
          <CentralBankBalanceSheetChart isDarkMode={isDarkMode} />
        </section>

        <LazyMount isDarkMode={isDarkMode}>
          {/* Chapter 7 — Household Debt */}
          <section className="mb-14">
            <ChapterHeader
              isDarkMode={isDarkMode}
              chapter="Chapter 7"
              title="Household Debt"
              subtitle="The private side of the leverage story. BIS 2024 household debt in % of GDP. Spain deleveraged the most since 2010; South Korea and Australia levered up the fastest."
            />
            <HouseholdDebtChart isDarkMode={isDarkMode} />
          </section>

          {/* Chapter 8 — Fiscal Reckoning */}
          <section className="mb-14">
            <ChapterHeader
              isDarkMode={isDarkMode}
              chapter="Chapter 8"
              title="Fiscal Reckoning"
              subtitle="The equation that ends the story: when interest rates exceed growth (r > g), debt compounds. Countries in the top-right quadrant are structurally in a debt spiral. Japan sits stubbornly in the bottom-right."
            />
            <FiscalReckoningQuadrant
              isDarkMode={isDarkMode}
              governmentDebt={governmentDebt}
              gdpGrowth={gdpGrowth}
              interestRates={interestRates}
            />
          </section>
        </LazyMount>

        <RelatedPages currentPath="/debt" isDarkMode={isDarkMode} />

        <footer className={`mt-16 pt-6 border-t text-xs ${textMuted} ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          Live fiscal data via World Bank API proxy. Curated snapshots refreshed {CURATED_LAST_UPDATED}.
          Ratings from S&amp;P Global, Moody&apos;s Investors Service, and Fitch Ratings. CDS spreads compiled from Bloomberg, Refinitiv, and DBRS market prints.
          Household debt from Bank for International Settlements &ldquo;Total credit to households&rdquo;. Balance sheet snapshots from the Fed H.4.1, ECB WFS,
          BOJ, and PBOC balance sheet releases. Selected countries: {selectedCountries.length}.
          {' '}
          <span className="hidden">{HOUSEHOLD_DEBT_2024.length} household observations · {SOVEREIGN_DEFAULTS_2000_2024.length} default records.</span>
        </footer>
      </div>
    </div>
  );
}
