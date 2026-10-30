'use client';

// Global income calculator: converts a household income in local currency to
// per-person dollars a day at purchasing power parity and places it on the
// World Bank PIP global distribution.

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import ThemeToggle from '../../components/ThemeToggle';
import Breadcrumbs from '../../components/Breadcrumbs';
import SocialShareMenu from '../../components/SocialShareMenu';
import { ChapterMeta, CountrySelect, Segmented, Stat, countryName, theme } from '../../components/development/ui';
import { COUNTRY_KEY_TO_SLUG, COUNTRY_SLUGS, type CountryKey } from '../../utils/countryMappings';
import { GLOBAL_INCOME_CDF, GLOBAL_INCOME_MEAN, GLOBAL_INCOME_YEAR, globalPercentile, latestObs } from '../../services/developmentCurated';
import { useDevSeries } from '../useDevelopmentData';

const CURRENCY: Record<CountryKey, string> = {
  USA: 'USD', Canada: 'CAD', Mexico: 'MXN', Brazil: 'BRL', Chile: 'CLP', Argentina: 'ARS', Colombia: 'COP',
  UK: 'GBP', France: 'EUR', Germany: 'EUR', Italy: 'EUR', Spain: 'EUR', Sweden: 'SEK', Switzerland: 'CHF',
  Norway: 'NOK', Netherlands: 'EUR', Portugal: 'EUR', Belgium: 'EUR', Poland: 'PLN', Greece: 'EUR',
  Russia: 'RUB', Ukraine: 'UAH', Turkey: 'TRY', SaudiArabia: 'SAR', Egypt: 'EGP', Israel: 'ILS', Iran: 'IRR',
  UAE: 'AED', Qatar: 'QAR', Morocco: 'MAD', Nigeria: 'NGN', SouthAfrica: 'ZAR', Kenya: 'KES', Ethiopia: 'ETB',
  Ghana: 'GHS', Japan: 'JPY', Australia: 'AUD', SouthKorea: 'KRW', China: 'CNY', India: 'INR', Indonesia: 'IDR',
  Singapore: 'SGD', Vietnam: 'VND', Thailand: 'THB', Philippines: 'PHP', Pakistan: 'PKR', Bangladesh: 'BDT',
};

const LINES = [
  { value: 3, label: '$3.00 extreme poverty line' },
  { value: 4.2, label: '$4.20 lower-middle-income line' },
  { value: 8.3, label: '$8.30 upper-middle-income line' },
  { value: 28, label: '$28 high-income poverty line' },
];

type Period = 'year' | 'month';

function Calculator() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const t = theme(isDarkMode);
  const params = useSearchParams();

  const [country, setCountry] = useState<CountryKey>(() => COUNTRY_SLUGS[params.get('c') ?? ''] ?? 'USA');
  const [income, setIncome] = useState<string>(() => params.get('i') ?? '60000');
  const [size, setSize] = useState<number>(() => Math.min(12, Math.max(1, Number(params.get('n')) || 3)));
  const [period, setPeriod] = useState<Period>(() => (params.get('p') === 'month' ? 'month' : 'year'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const q = new URLSearchParams({ c: COUNTRY_KEY_TO_SLUG[country], i: income, n: String(size), p: period });
    window.history.replaceState(null, '', `${window.location.pathname}?${q.toString()}`);
  }, [country, income, size, period]);

  const { data, loading } = useDevSeries(['pppPrivate']);
  const ppp = country === 'USA' ? { year: GLOBAL_INCOME_YEAR, value: 1 } : latestObs(data.pppPrivate, country);
  const amount = Number(income.replace(/[,\s]/g, ''));
  const annual = period === 'month' ? amount * 12 : amount;
  const daily = ppp && annual > 0 ? annual / 365 / size / ppp.value : null;
  const pct = daily != null ? globalPercentile(daily) : null;

  const peopleBelow = pct != null ? Math.round((pct / 100) * 8) : null;
  const markers = useMemo(() => GLOBAL_INCOME_CDF.filter((p) => p.dailyIncome >= 1 && p.dailyIncome <= 200), []);
  const position = (v: number) => {
    const lo = Math.log(1);
    const hi = Math.log(200);
    return Math.min(100, Math.max(0, ((Math.log(Math.max(1, v)) - lo) / (hi - lo)) * 100));
  };

  const pageBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const input = `w-full rounded-md border px-3 py-2 text-sm ${t.input}`;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${pageBg}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Breadcrumbs isDarkMode={isDarkMode} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${t.accent}`}>Development Ledger {'\u00b7'} Calculator</div>
            <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${t.text}`}>Where Does Your Income Stand?</h1>
            <p className={`text-sm max-w-2xl ${t.textSec}`}>
              Enter your household&apos;s income after tax. We divide it by the number of people it supports, convert it to dollars a day at purchasing power parity, and place it on the World Bank&apos;s distribution of income across 8 billion people.
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <SocialShareMenu title="Where does your income stand in the world?" isDarkMode={isDarkMode} />
            <ThemeToggle isDarkMode={isDarkMode} />
          </div>
        </div>

        <div className="mb-6">
          <ChapterMeta isDarkMode={isDarkMode} sourceIds={['wid-pip-global-income', 'wb-development-suite']} flags={['curated']} />
        </div>

        <div className={`rounded-lg border p-4 sm:p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 ${t.card}`}>
          <div>
            <span className={`block text-xs mb-1 ${t.textMuted}`}>Country</span>
            <CountrySelect isDarkMode={isDarkMode} value={country} onChange={setCountry} />
          </div>
          <label className="block">
            <span className={`block text-xs mb-1 ${t.textMuted}`}>Household income after tax ({CURRENCY[country]})</span>
            <input className={input} inputMode="decimal" value={income} onChange={(e) => setIncome(e.target.value)} aria-label="Household income" />
          </label>
          <label className="block">
            <span className={`block text-xs mb-1 ${t.textMuted}`}>People in household</span>
            <input className={input} type="number" min={1} max={12} value={size} onChange={(e) => setSize(Math.min(12, Math.max(1, Number(e.target.value) || 1)))} aria-label="People in household" />
          </label>
          <div>
            <span className={`block text-xs mb-1 ${t.textMuted}`}>Income per</span>
            <Segmented isDarkMode={isDarkMode} value={period} onChange={setPeriod} options={[{ id: 'year', label: 'Year' }, { id: 'month', label: 'Month' }]} />
          </div>
        </div>

        {loading && !ppp ? (
          <div className={`h-40 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
        ) : !ppp ? (
          <p className={`text-sm ${t.textMuted}`}>No purchasing power parity factor is published for {countryName(country)}.</p>
        ) : daily == null || pct == null ? (
          <p className={`text-sm ${t.textMuted}`}>Enter an income above zero.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <Stat isDarkMode={isDarkMode} label="Per person, per day" value={`$${daily < 10 ? daily.toFixed(2) : Math.round(daily).toLocaleString()}`} sub="International dollars at PPP" />
              <Stat isDarkMode={isDarkMode} label="Richer than" value={`${pct.toFixed(1)}%`} sub={`of the world's people (${GLOBAL_INCOME_YEAR})`} />
              <Stat isDarkMode={isDarkMode} label="Against the world average" value={`${(daily / GLOBAL_INCOME_MEAN).toFixed(1)}\u00d7`} sub={`Global mean $${GLOBAL_INCOME_MEAN.toFixed(2)} a day`} />
            </div>

            <div className={`rounded-lg border p-4 sm:p-5 mb-6 ${t.card}`}>
              <h2 className={`text-base font-semibold mb-1 ${t.text}`}>Your place in the global distribution</h2>
              <p className={`text-xs mb-4 ${t.textMuted}`}>Log scale from $1 to $200 a day. Ticks show the share of the world living below each income.</p>
              <div className="relative h-14">
                <div className="absolute inset-x-0 top-6 h-2 rounded bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500" />
                {markers.map((m) => (
                  <div key={m.dailyIncome} className="absolute top-5 h-4 w-px bg-gray-400/70" style={{ left: `${position(m.dailyIncome)}%` }} />
                ))}
                <div className="absolute top-0 -translate-x-1/2 flex flex-col items-center" style={{ left: `${position(daily)}%` }}>
                  <span className={`text-[11px] font-semibold whitespace-nowrap ${t.text}`}>You</span>
                  <span className={`w-3 h-3 mt-2.5 rounded-full border-2 ${isDarkMode ? 'border-gray-900 bg-white' : 'border-white bg-gray-900'}`} />
                </div>
              </div>
              <div className={`flex justify-between text-[10px] ${t.textMuted}`}>
                <span>$1</span><span>$10</span><span>$100</span><span>$200</span>
              </div>
              <p className={`text-sm mt-4 ${t.textSec}`}>
                If the world were 8 people, about {peopleBelow} would have less than you.
              </p>
            </div>

            <div className={`rounded-lg border p-4 sm:p-5 mb-6 ${t.card}`}>
              <h2 className={`text-base font-semibold mb-3 ${t.text}`}>Against the World Bank poverty lines</h2>
              <ul className="space-y-2">
                {LINES.map((l) => {
                  const above = daily >= l.value;
                  return (
                    <li key={l.value} className="flex items-center justify-between gap-3 text-sm">
                      <span className={t.textSec}>{l.label}</span>
                      <span className={`font-mono text-xs px-2 py-0.5 rounded ${above ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'}`}>
                        {above ? `${(daily / l.value).toFixed(1)}\u00d7 above` : `${(l.value / daily).toFixed(1)}\u00d7 below`}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className={`text-xs mt-3 ${t.textMuted}`}>
                {globalPercentile(3).toFixed(1)}% of the world lived below $3.00 a day in {GLOBAL_INCOME_YEAR}, and {globalPercentile(8.3).toFixed(1)}% below $8.30.
              </p>
            </div>
          </>
        )}

        <div className={`text-xs space-y-2 ${t.textMuted}`}>
          <p>
            <strong>How this works.</strong> Per person, per day = household income {'\u00f7'} 365 {'\u00f7'} household size {'\u00f7'} the World Bank private-consumption PPP factor for {countryName(country)}
            {ppp ? ` (${ppp.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${CURRENCY[country]} per international dollar, ${ppp.year})` : ''}. The global distribution is the World Bank Poverty and Inequality Platform estimate for {GLOBAL_INCOME_YEAR} in 2021 PPP dollars.
          </p>
          <p>
            Household surveys measure consumption in most poorer countries and income in richer ones, divide by household size without adjusting for children or shared costs, and miss the very top. Treat the result as a rough placement, not a precise rank. Nothing you enter leaves your browser.
          </p>
          <p>
            <Link href="/development#chapter-4" className={`underline ${t.accent}`}>Poverty chapter</Link>
            {' \u00b7 '}
            <Link href={`/development/${COUNTRY_KEY_TO_SLUG[country]}`} className={`underline ${t.accent}`}>{countryName(country)} development profile</Link>
            {' \u00b7 '}
            <Link href="/inequality" className={`underline ${t.accent}`}>Inequality Ledger</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WhereDoYouStandPage() {
  return (
    <Suspense fallback={null}>
      <Calculator />
    </Suspense>
  );
}
