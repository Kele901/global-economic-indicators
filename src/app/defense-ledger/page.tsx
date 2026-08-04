'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { fetchGlobalData, type CountryData } from '../services/worldbank';
import {
  ACTIVE_STATE_CONFLICTS,
  UN_PEACEKEEPING_BUDGET,
  DEFENSE_COUNTRY_BY_WBKEY,
  SIPRI_MILITARY_SPEND,
} from '../services/defenseCurated';
import { worldSum, topNCountries, topNShare, worldYoY } from '../utils/countryData';

const DefenseSpendingTicker    = dynamic(() => import('../components/DefenseSpendingTicker'),    { ssr: false });
const SuperpowerComparisonChart = dynamic(() => import('../components/SuperpowerComparisonChart'), { ssr: false });
const NatoTargetTable          = dynamic(() => import('../components/NatoTargetTable'),          { ssr: false });
const ArmsTradeFlows           = dynamic(() => import('../components/ArmsTradeFlows'),           { ssr: false });
const ArmsIndustryTable        = dynamic(() => import('../components/ArmsIndustryTable'),        { ssr: false });
const NuclearArsenalGrid       = dynamic(() => import('../components/NuclearArsenalGrid'),       { ssr: false });
const ConflictDeathsTimeline   = dynamic(() => import('../components/ConflictDeathsTimeline'),   { ssr: false });
const GunsVsButterQuadrant     = dynamic(() => import('../components/GunsVsButterQuadrant'),     { ssr: false });

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
      <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>
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

function formatUsdShort(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9)  return `$${(value / 1e9).toFixed(0)}B`;
  if (value >= 1e6)  return `$${(value / 1e6).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

// Seed the World Bank CountryData arrays with curated SIPRI data for any
// country that WB didn't return. World Bank intermittently WAF-blocks the
// entire MS.MIL.* family in-browser, and without a fallback the page renders
// completely empty charts. WB values always win when present — SIPRI only
// fills gaps.
function mergeSipriIntoSeries(
  wbSeries: CountryData[] | undefined,
  field: 'usdBillions' | 'pctGdp',
  multiplier: number,
): { merged: CountryData[]; sipriUsedFor: string[] } {
  const map = new Map<number, CountryData>();
  (wbSeries ?? []).forEach(row => map.set(Number(row.year), { ...row }));
  const sipriUsedFor: string[] = [];
  SIPRI_MILITARY_SPEND.forEach(row => {
    const wbHasCountry = (wbSeries ?? []).some(r => {
      const v = Number(r[row.wbKey]);
      return !isNaN(v) && v > 0;
    });
    if (wbHasCountry) return;
    sipriUsedFor.push(row.wbKey);
    row.years.forEach(y => {
      const existing = map.get(y.year) ?? { year: y.year };
      existing[row.wbKey] = y[field] * multiplier;
      map.set(y.year, existing);
    });
  });
  return {
    merged: Array.from(map.values()).sort((a, b) => Number(a.year) - Number(b.year)),
    sipriUsedFor,
  };
}

export default function DefenseLedgerPage() {
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
        const wb = await fetchGlobalData().catch(() => null);
        if (cancelled) return;
        setData(wb);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const retryDefense = async () => {
    setLoading(true);
    try {
      const wb = await fetchGlobalData(true).catch(() => null);
      setData(wb);
    } finally {
      setLoading(false);
    }
  };

  // ── KPIs derived from live WB data + SIPRI curated fallback ───────────────
  // Merge SIPRI 2018-2024 numbers into any country the World Bank didn't
  // return. WB always wins where it has data. This keeps the page useful
  // even when WB's WAF blocks the entire MS.MIL.* family.
  const spendUsd = useMemo(
    () => mergeSipriIntoSeries(data?.militaryExpenditureUsd, 'usdBillions', 1e9),
    [data],
  );
  const spendPct = useMemo(
    () => mergeSipriIntoSeries(data?.militaryExpenditure, 'pctGdp', 1),
    [data],
  );

  // Prefer the USD view — with SIPRI seeded it always has ≥15 countries.
  // Only degrade to % of GDP if the USD merge somehow returned nothing.
  const spendUnit = useMemo<'usd' | 'pct_gdp'>(() => {
    const hasAnyUsd = spendUsd.merged.some(row =>
      Object.keys(row).some(k => k !== 'year' && Number(row[k]) > 0),
    );
    return hasAnyUsd ? 'usd' : 'pct_gdp';
  }, [spendUsd]);
  const spendSeries = spendUnit === 'usd' ? spendUsd.merged : spendPct.merged;

  const sipriSeededCount =
    spendUnit === 'usd' ? spendUsd.sipriUsedFor.length : spendPct.sipriUsedFor.length;

  // Cap plausible % of GDP values at 30% — no country in modern history
  // has sustained military spending above ~15%. Anything higher signals a
  // upstream unit mismatch and should be dropped from the ranking.
  const maxPlausible = spendUnit === 'pct_gdp' ? 30 : Infinity;

  const worldSpend = useMemo(() => worldSum(spendSeries, { maxPlausible }), [spendSeries, maxPlausible]);
  const worldYoyPct = useMemo(() => worldYoY(spendSeries), [spendSeries]);
  const top5ConcPct = useMemo(() => topNShare(spendSeries, 5), [spendSeries]);
  const spenderTop5 = useMemo(() => topNCountries(spendSeries, 5, { maxPlausible }), [spendSeries, maxPlausible]);
  const latestConflicts = ACTIVE_STATE_CONFLICTS[ACTIVE_STATE_CONFLICTS.length - 1];
  const latestPeacekeeping = UN_PEACEKEEPING_BUDGET[UN_PEACEKEEPING_BUDGET.length - 1];

  const pageBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const heroBg = isDarkMode
    ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-rose-900/30 border-gray-700'
    : 'bg-gradient-to-br from-rose-50 via-white to-orange-50 border-rose-100';
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
            <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>
              The Defense Ledger
            </div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 ${textPrimary}`}>
              The Global Cost of War
            </h1>
            <p className={`text-base sm:text-lg max-w-3xl ${textSec}`}>
              A data-driven ledger of how the world spends on defense — the superpower balance, the alliances,
              the arms trade, the industry, the arsenals, the conflicts and the trade-offs against everything else.
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
          <DefenseSpendingTicker
            isDarkMode={isDarkMode}
            militaryExpenditureUsd={spendUsd.merged}
            militaryExpenditurePctGdp={spendPct.merged}
            loading={loading && !data}
            onRetry={retryDefense}
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>
                {spendUnit === 'usd' ? 'Tracked-world Spend' : 'Tracked-world Avg % GDP'}
              </div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>
                {worldSpend.total > 0
                  ? (spendUnit === 'usd'
                      ? formatUsdShort(worldSpend.total)
                      : `${(worldSpend.total / Math.max(worldSpend.count, 1)).toFixed(2)}%`)
                  : (loading ? '…' : '—')}
              </div>
              <div className={`text-[11px] ${textMuted}`}>
                {worldSpend.year ? `${worldSpend.year} · ${worldSpend.count} economies` : 'World Bank / SIPRI'}
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>YoY change</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${worldYoyPct != null && worldYoyPct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {worldYoyPct != null ? `${worldYoyPct >= 0 ? '+' : ''}${worldYoyPct.toFixed(1)}%` : '—'}
              </div>
              <div className={`text-[11px] ${textMuted}`}>vs prior year total</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>
                {spendUnit === 'usd' ? 'Top-5 share' : 'Highest % GDP'}
              </div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>
                {spendUnit === 'usd'
                  ? (top5ConcPct > 0 ? `${top5ConcPct.toFixed(0)}%` : (loading ? '…' : '—'))
                  : (spenderTop5[0]
                      ? `${spenderTop5[0].value.toFixed(2)}%`
                      : (loading ? '…' : '—'))}
              </div>
              <div className={`text-[11px] ${textMuted}`}>
                {spendUnit === 'usd'
                  ? 'concentration among top 5'
                  : (spenderTop5[0] ? DEFENSE_COUNTRY_BY_WBKEY[spenderTop5[0].country]?.name ?? spenderTop5[0].country : 'top-ranked country')}
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Active conflicts</div>
              <div className={`text-xl font-semibold tabular-nums mt-0.5 ${textPrimary}`}>{latestConflicts?.count ?? '—'}</div>
              <div className={`text-[11px] ${textMuted}`}>state-based · UCDP {latestConflicts?.year}</div>
            </div>
          </div>

          <div className={`mt-4 text-xs ${textMuted}`}>
            Live: World Bank (SIPRI-sourced MS.MIL.* series). Curated: SIPRI Top 100, NATO defense expenditure,
            FAS Nuclear Notebook, UCDP battle deaths, UN Fifth Committee.
          </div>
        </div>

        {/* Chapter 1 — The Global Bill */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 1"
            title="The Global Bill"
            subtitle="Spending on defense keeps climbing. Every dollar shows up somewhere — jobs, industry, weapons stockpiles — but the totals never quite stop growing."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className={`rounded-lg border p-5 ${cardBg}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-base font-semibold ${textPrimary}`}>
                  Top 5 {spendUnit === 'usd' ? 'Spenders' : 'by % of GDP'}
                </h4>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                  sipriSeededCount > 0
                    ? 'bg-amber-500/20 text-amber-600'
                    : 'bg-emerald-500/20 text-emerald-500'
                }`}
                title={sipriSeededCount > 0
                  ? `${sipriSeededCount} country slot(s) filled from curated SIPRI 2018-2024 data because World Bank did not respond`
                  : 'All values from live World Bank fetch'}>
                  {sipriSeededCount > 0 ? `WB + SIPRI (${sipriSeededCount})` : 'WB live'}
                </span>
              </div>
              {loading && !spenderTop5.length ? (
                <SkeletonCard isDarkMode={isDarkMode} className="h-48" />
              ) : spenderTop5.length === 0 ? (
                <div className={`text-sm py-4 ${textMuted}`}>
                  <p className="mb-3">Military-expenditure data is temporarily unavailable — the World Bank API is currently rejecting requests.</p>
                  <button
                    onClick={retryDefense}
                    className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-colors ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {spenderTop5.map((r, i) => {
                    const meta = DEFENSE_COUNTRY_BY_WBKEY[r.country];
                    return (
                      <li key={r.country} className="flex items-center justify-between">
                        <span className={`text-sm flex items-center gap-2 ${textPrimary}`}>
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta?.color ?? '#94a3b8' }} />
                          {i + 1}. {meta?.name ?? r.country}
                        </span>
                        <span className={`text-sm font-medium tabular-nums ${textSec}`}>
                          {spendUnit === 'usd' ? formatUsdShort(r.value) : `${r.value.toFixed(2)}%`}
                          {' '}<span className={`text-[11px] ${textMuted}`}>{r.year}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className={`rounded-lg border p-5 ${cardBg}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-base font-semibold ${textPrimary}`}>Active State-Based Conflicts</h4>
                <span className={`text-[10px] uppercase tracking-wider ${textMuted}`}>UCDP</span>
              </div>
              <div className="text-center py-4">
                <div className={`text-5xl font-bold tabular-nums ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>
                  {latestConflicts?.count ?? '—'}
                </div>
                <div className={`text-xs mt-1 ${textMuted}`}>as of {latestConflicts?.year}</div>
                <p className={`text-xs mt-3 ${textSec}`}>
                  The highest count since UCDP began tracking in 1946 — up from the 1990s peace-dividend lows.
                </p>
              </div>
            </div>

            <div className={`rounded-lg border p-5 ${cardBg}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-base font-semibold ${textPrimary}`}>UN Peacekeeping Budget</h4>
                <span className={`text-[10px] uppercase tracking-wider ${textMuted}`}>UN Fifth Committee</span>
              </div>
              <div className="text-center py-4">
                <div className={`text-5xl font-bold tabular-nums ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  ${latestPeacekeeping?.budgetUsdBn.toFixed(1)}B
                </div>
                <div className={`text-xs mt-1 ${textMuted}`}>FY {latestPeacekeeping?.fiscalYear} · {latestPeacekeeping?.activeMissions} active missions</div>
                <p className={`text-xs mt-3 ${textSec}`}>
                  About 0.2% of what the world spends on militaries. Peacekeeping stays flat as defense budgets swell.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Chapter 2 — The Superpowers */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 2"
            title="The Superpowers"
            subtitle="Six-plus decades of defense spending in one view. Ten countries account for over three-quarters of the global total — watch the US, China and Russia diverge from 1960 onwards, in dollars and in share of GDP."
          />
          {loading ? (
            <SkeletonCard isDarkMode={isDarkMode} className="h-[520px]" />
          ) : (
            <SuperpowerComparisonChart
              isDarkMode={isDarkMode}
              militaryExpenditureUsd={spendUsd.merged}
              militaryExpenditurePctGdp={spendPct.merged}
            />
          )}
        </section>

        {/* Chapter 3 — Alliances & Institutions */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 3"
            title="Alliances &amp; Institutions"
            subtitle="Every NATO member pledged 2% of GDP after the 2014 Wales summit. Estonia and Poland now spend triple that. Others still lag a decade later."
          />
          <NatoTargetTable isDarkMode={isDarkMode} />
        </section>

        {/* Chapter 4 — The Arms Trade */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 4"
            title="The Arms Trade"
            subtitle="Major conventional weapons flow from a handful of exporters to a much larger group of importers. Below is the ranking, and the flows behind it."
          />
          {loading ? (
            <SkeletonCard isDarkMode={isDarkMode} className="h-96" />
          ) : data ? (
            <ArmsTradeFlows
              isDarkMode={isDarkMode}
              armsExports={data.armsExports}
              armsImports={data.armsImports}
            />
          ) : null}
        </section>

        {/* Chapter 5 — The Arms Industry */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 5"
            title="The Arms Industry"
            subtitle="Twenty-five companies do most of the actual building. Lockheed Martin alone outspends the smallest ten of them combined."
          />
          <ArmsIndustryTable isDarkMode={isDarkMode} />
        </section>

        {/* Chapter 6 — The Nuclear Balance */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 6"
            title="The Nuclear Balance"
            subtitle="Nine states hold nuclear weapons. Russia and the United States between them still control roughly 90% of the global stockpile."
          />
          <NuclearArsenalGrid isDarkMode={isDarkMode} />
        </section>

        {/* Chapter 7 — The Human Cost */}
        <section className="mb-14">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 7"
            title="The Human Cost"
            subtitle="Battle deaths were sliding through the 2000s. Syria in the 2010s and Ukraine plus Gaza in the 2020s reversed the trend."
          />
          <ConflictDeathsTimeline isDarkMode={isDarkMode} />
        </section>

        {/* Chapter 8 — Guns vs Butter */}
        <section className="mb-6">
          <ChapterHeader
            isDarkMode={isDarkMode}
            chapter="Chapter 8"
            title="Guns vs Butter"
            subtitle="Every dollar a government spends on defense is a dollar it isn&apos;t spending on schools, hospitals, or transfers. Here&apos;s where each economy sits on that trade-off."
          />
          {loading ? (
            <SkeletonCard isDarkMode={isDarkMode} className="h-[520px]" />
          ) : data ? (
            <GunsVsButterQuadrant
              isDarkMode={isDarkMode}
              militaryExpenditurePctGdp={spendPct.merged}
              educationExpenditurePctGdp={data.educationExpenditure}
              gdpPerCapita={data.gdpPerCapitaPPP}
            />
          ) : null}

          <div className={`mt-4 text-sm ${textSec}`}>
            Want to see how these trade-offs interact with the rest of the fiscal picture?{' '}
            <a href="/global-heatmap" className={`underline underline-offset-2 ${isDarkMode ? 'text-rose-400 hover:text-rose-300' : 'text-rose-600 hover:text-rose-700'}`}>
              Explore the global heatmap →
            </a>
          </div>
        </section>

        <div className={`text-xs mt-8 pt-6 border-t space-y-2 ${isDarkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-500'}`}>
          <p>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Live series (World Bank / SIPRI via WB API):</span>{' '}
            MS.MIL.XPND.CD, MS.MIL.XPND.GD.ZS, MS.MIL.XPND.ZS, MS.MIL.XPRT.KD, MS.MIL.MPRT.KD, MS.MIL.TOTL.P1
            · SE.XPD.TOTL.GD.ZS · NY.GDP.PCAP.PP.CD.
            The USA slot on MS.MIL.XPND.CD is backfilled from FRED FDEFX when needed.
          </p>
          <p>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Fallback layer:</span>{' '}
            SIPRI Military Expenditure Database 2018-2024 (2025 release) is baked in as a curated seed
            for 15 major spenders (USA, China, Russia, India, Saudi Arabia, UK, Germany, France, Japan,
            South Korea, Ukraine, Israel, Poland, Italy, Australia). It only fills country slots that
            the live World Bank fetch didn&apos;t return — live values always win where present.
            {sipriSeededCount > 0 && (
              <>
                {' '}
                <span className={isDarkMode ? 'text-amber-400' : 'text-amber-600'}>
                  Currently active for {sipriSeededCount} country slot{sipriSeededCount === 1 ? '' : 's'}
                </span>{' '}
                because the World Bank API declined those requests this session.
              </>
            )}
          </p>
          <p>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Curated snapshots:</span>{' '}
            SIPRI Top 100 (Dec 2024 release), NATO annual defense expenditure (June 2025),
            FAS Nuclear Notebook 2025, UCDP v25.1, UN Fifth Committee.
          </p>
        </div>
      </div>
    </div>
  );
}
