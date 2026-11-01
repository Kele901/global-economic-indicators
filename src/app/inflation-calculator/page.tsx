'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { fetchGlobalData } from '../services/worldbank';
import type { CountryData } from '../services/worldbank';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ThemeToggle from '../components/ThemeToggle';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedPages from '../components/RelatedPages';
import BulkChartDownload from '../components/BulkChartDownload';
import SocialShareMenu from '../components/SocialShareMenu';
import ErrorMessage from '../components/ErrorMessage';
import SkeletonCard from '../components/SkeletonCard';
import InflationCalculator from '../components/InflationCalculator';
import { ChapterMeta, theme } from '../components/inflation/ui';

function Explainer({ isDarkMode, title, children }: { isDarkMode: boolean; title: string; children: ReactNode }) {
  const t = theme(isDarkMode);
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl border overflow-hidden ${t.card}`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`w-full px-5 py-4 flex items-center justify-between gap-3 text-left transition-colors ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
      >
        <h3 className={`text-base sm:text-lg font-semibold ${t.text}`}>{title}</h3>
        <svg className={`w-5 h-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''} ${t.textSec}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className={`px-5 pb-5 pt-4 border-t text-sm space-y-4 ${t.border} ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{children}</div>}
    </div>
  );
}

export default function InflationCalculatorPage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const [cpiData, setCpiData] = useState<CountryData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGlobalData()
      .then((data) => setCpiData(data.cpiData))
      .catch(() => setError('Failed to load inflation data. Please try again later.'));
  }, []);

  const t = theme(isDarkMode);
  const link = isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-700 hover:text-blue-800';
  const inset = `rounded-lg border p-4 ${t.inset}`;
  const code = `mt-2 rounded-md px-3 py-2 font-mono text-xs sm:text-sm ${isDarkMode ? 'bg-gray-950 text-gray-200' : 'bg-white text-gray-800 border border-gray-200'}`;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Breadcrumbs isDarkMode={isDarkMode} />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <Link href="/inflation" className={`inline-block text-[11px] uppercase tracking-[0.2em] mb-2 ${link}`}>
              &larr; Inflation &amp; Cost of Living
            </Link>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 ${t.text}`}>Inflation Calculator</h1>
            <p className={`text-base sm:text-lg max-w-3xl ${t.textSec}`}>
              See what an amount of money from one year is worth in another for 47 economies, compare how far the same amount went in up
              to four countries, or work backwards from today. For the bigger picture on why prices move, see{' '}
              <Link href="/inflation" className={`underline underline-offset-2 ${link}`}>
                inflation around the world
              </Link>
              .
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <BulkChartDownload variant="primary" size="sm" />
            <SocialShareMenu title="Inflation Calculator" isDarkMode={isDarkMode} />
            <ThemeToggle isDarkMode={isDarkMode} />
          </div>
        </div>

        <ChapterMeta isDarkMode={isDarkMode} sourceIds={['wb-cpi-index']} />

        <div className={`rounded-xl border p-4 sm:p-5 mb-6 ${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-blue-900/30 border-gray-700' : 'bg-gradient-to-br from-blue-50 via-white to-amber-50 border-blue-100'}`}>
          <h2 className={`text-base sm:text-lg font-semibold mb-2 ${t.text}`}>How the inflation calculator works</h2>
          <p className={`text-sm ${t.textSec}`}>
            Enter an amount, a country and two years. The calculator scales the amount by the change in that country&rsquo;s consumer price
            index (CPI) between the years, using World Bank data (FRED for the United States). <strong>Value over time</strong> carries an
            amount forward, <strong>Compare countries</strong> carries the same amount through up to four economies side by side, and{' '}
            <strong>Reverse</strong> tells you what a past amount had to be to match a sum today. Every result comes with a shrinking-banknote
            picture, the years prices doubled and a year-by-year table you can download.
          </p>
        </div>

        {error && <ErrorMessage message={error} />}
        {!cpiData && !error && <SkeletonCard height="h-[520px]" label="Loading price data" />}
        {cpiData && <InflationCalculator cpiData={cpiData} isDarkMode={isDarkMode} />}

        <div className="mt-10 space-y-3">
          <Explainer isDarkMode={isDarkMode} title="How the Inflation Calculator Works">
            <p>The calculator works for amounts up to one quadrillion in any supported currency.</p>
            <p>For example, imagine you want to know what goods and services costing $23 in 1975 would have cost in 1985:</p>
            <div className={inset}>
              <ul className="space-y-1">
                <li>&bull; The price index for 1975 = 17.78</li>
                <li>&bull; The price index for 1985 = 44.6</li>
              </ul>
              <p className="mt-3">The calculator increases the 1975 cost by the change in prices between 1975 and 1985:</p>
              <div className={code}>
                Cost in 1985 = Cost in 1975 &times; (1985 CPI / 1975 CPI)
                <br />
                $57.68 = $23 &times; (44.6 / 17.78)
              </div>
            </div>
            <p>So the cost in 1985 of the same goods and services has risen to $57.68. Reverse mode runs the same formula the other way round.</p>
          </Explainer>

          <Explainer isDarkMode={isDarkMode} title="Understanding Your Results">
            <p>
              Prices for the things we buy tend to go up over time, which is called inflation. When prices go up, the same amount of money buys
              less: a fall in &lsquo;purchasing power&rsquo;. The shrinking banknote shows this directly, with each note&rsquo;s area matching what it
              still buys.
            </p>
            <div className={inset}>
              <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Average inflation rate</h4>
              <p>The calculator also shows the average yearly inflation rate between the two years:</p>
              <div className={code}>Average Inflation = (((CPI_end / CPI_start) ^ (1 / years)) - 1) &times; 100</div>
            </div>
            <div className={inset}>
              <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-rose-300' : 'text-rose-800'}`}>Deflation</h4>
              <p>
                If prices fell between the two years, average inflation is negative. This is called deflation: Japan saw it for long stretches
                after the late 1990s, and the cash line in the value chart rises instead of falling.
              </p>
            </div>
          </Explainer>

          <Explainer isDarkMode={isDarkMode} title="Data Accuracy and Sources">
            <p>
              The calculator is for illustration and general reference. Results are approximate and give a rough guide to the buying power of a
              currency for goods and services.
            </p>
            <div>
              <h4 className={`font-semibold mb-1 ${t.text}`}>Data sources</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>World Bank consumer price index (FP.CPI.TOTL, 2010 = 100) for 47 economies</li>
                <li>Federal Reserve Economic Data (FRED) for the United States</li>
                <li>Coverage from 1960 to the latest reported year; it varies by country</li>
              </ul>
            </div>
            <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-amber-950/30 border-amber-900 text-amber-100' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
              <h4 className="font-semibold mb-2">Important notes</h4>
              <ul className="space-y-2">
                <li>Over long periods, the goods and services in the price index have changed significantly.</li>
                <li>A family&apos;s consumption today is very different from that of a typical family decades ago.</li>
                <li>Changes in household spending reflect higher incomes and a wider range of available goods and services.</li>
                <li>Comparisons over longer periods and further back in time are generally less accurate than recent, shorter ones.</li>
                <li>
                  Euro countries are converted at the fixed adoption rates. Where a currency removed zeros (Türkiye in 2005, for example), the
                  index runs straight through, so older amounts should be entered in today&rsquo;s units.
                </li>
              </ul>
            </div>
          </Explainer>
        </div>

        <RelatedPages currentPath="/inflation-calculator" isDarkMode={isDarkMode} />

        <footer className={`mt-16 pt-6 border-t text-xs ${t.textMuted} ${t.border}`}>
          Consumer price indices fetched live from the World Bank API via our proxy, with FRED CPI for the United States. See all sources on
          the{' '}
          <Link href="/data-sources" className={`underline ${link}`}>
            data sources page
          </Link>
          .
        </footer>
      </div>
    </div>
  );
}
