'use client';

import { useEffect, useRef, useState } from 'react';
import { CITY_LABELS, CITY_ORDER, type CityId } from '../../data/cities';
import { CITY_PROFILES } from '../../data/costOfLiving';
import { CITY_COUNTRY, lcuPerUsd, toUsd } from '../../utils/inflation/cityUsd';
import CityCostPanel from './CityCostPanel';
import CostOfLivingOverview from './CostOfLivingOverview';
import { BASKET, FIRST_CITY_YEAR, LAST_CITY_YEAR, itemPrice, salary, type CityItem } from './cityItems';
import { ChapterMeta, Lede, Panel, Segmented, theme, type InflationChapterProps } from './ui';

const CITY_OPTIONS = CITY_ORDER.map((id) => ({ id, label: CITY_LABELS[id].name }));
const YEARS = Array.from({ length: LAST_CITY_YEAR - FIRST_CITY_YEAR + 1 }, (_, i) => FIRST_CITY_YEAR + i);

function money(city: CityId, v: number | null | undefined, usd = false) {
  if (v == null) return '\u2014';
  const p = CITY_PROFILES[city];
  const decimals = usd ? (v >= 100 ? 0 : 2) : v >= 1000 ? 0 : p.decimals;
  return `${usd ? '$' : p.currencySymbol}${v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

// Eases a displayed number toward its target so totals visibly count up or down.
function useTween(target: number, ms = 600): number {
  const [shown, setShown] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const origin = from.current;
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / ms);
      const v = origin + (target - origin) * (1 - (1 - k) ** 3);
      from.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return shown;
}

export default function ChapterCostOfLiving({ isDarkMode, data }: InflationChapterProps) {
  const t = theme(isDarkMode);
  const [tab, setTab] = useState<'overview' | CityId>('overview');
  const [currency, setCurrency] = useState<'local' | 'usd'>('local');
  return (
    <div className="space-y-6">
      <Lede isDarkMode={isDarkMode}>
        Inflation is an average; what people feel is the price of specific things. Fourteen years of crowd-sourced prices for London, Paris,
        Tokyo and New York, plus the Numbeo cost-of-living index for 37 cities (New York = 100).
      </Lede>
      <BasketTimeMachine isDarkMode={isDarkMode} />
      <CityVsCity isDarkMode={isDarkMode} data={data} />
      <Panel
        isDarkMode={isDarkMode}
        title="City price explorer"
        subtitle="The index table, or every price series for one city. Switch to US dollars to compare cities on the same scale."
        actions={
          tab !== 'overview' && (
            <Segmented
              isDarkMode={isDarkMode}
              value={currency}
              onChange={setCurrency}
              label="Currency"
              options={[
                { id: 'local', label: 'Local currency' },
                { id: 'usd', label: 'US dollars' },
              ]}
            />
          )
        }
      >
        <ChapterMeta isDarkMode={isDarkMode} sourceIds={['numbeo-city-prices', 'wb-real-interest']} flags={['curated']} />
        <div className={`flex flex-wrap gap-1.5 p-1 mb-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`} role="tablist">
          {[{ id: 'overview' as const, label: 'Index table', flag: '' }, ...CITY_ORDER.map((id) => ({ id, label: CITY_LABELS[id].name, flag: CITY_LABELS[id].flag }))].map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={tab === c.id}
              onClick={() => setTab(c.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                tab === c.id ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 shadow') : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {c.flag && <span aria-hidden>{c.flag}</span>}
              {c.label}
            </button>
          ))}
        </div>
        {tab === 'overview' ? (
          <CostOfLivingOverview isDarkMode={isDarkMode} />
        ) : (
          <CityCostPanel city={tab} isDarkMode={isDarkMode} currency={currency} fxRows={data.exchangeRate} />
        )}
      </Panel>
      <p className={`text-[11px] ${t.textMuted}`}>
        City prices &copy; Numbeo.com, used with credit. Numbeo figures are crowd-sourced and can move with the mix of submissions in a given
        year.
      </p>
    </div>
  );
}

function basketTotal(city: CityId, year: number, items: CityItem[]): number {
  return items.reduce((s, i) => s + (itemPrice(city, i, year) ?? 0), 0);
}

function BasketTimeMachine({ isDarkMode }: { isDarkMode: boolean }) {
  const t = theme(isDarkMode);
  const [city, setCity] = useState<CityId>('london');
  const [year, setYear] = useState(LAST_CITY_YEAR);
  const [playing, setPlaying] = useState(false);
  // Only items priced in both the base year and every year keep the total comparable.
  const items = BASKET.filter((i) => YEARS.every((y) => itemPrice(city, i, y) != null));
  const total = basketTotal(city, year, items);
  const base = basketTotal(city, FIRST_CITY_YEAR, items);
  const shown = useTween(total);
  const change = base ? (total / base - 1) * 100 : null;
  const pay = salary(city, year);
  const payBase = salary(city, FIRST_CITY_YEAR);
  const payChange = pay && payBase ? (pay / payBase - 1) * 100 : null;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => {
      if (year < LAST_CITY_YEAR) setYear(year + 1);
      else setPlaying(false);
    }, 900);
    return () => window.clearTimeout(id);
  }, [playing, year]);

  const maxChange = Math.max(
    10,
    ...items.map((i) => {
      const [a, b] = [itemPrice(city, i, FIRST_CITY_YEAR), itemPrice(city, i, year)];
      return a && b ? Math.abs((b / a - 1) * 100) : 0;
    }),
  );
  const title = 'Basket time machine';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle={`The same shopping basket, one of each item, priced year by year since ${FIRST_CITY_YEAR}. Drag the slider or press play.`}
      actions={<Segmented isDarkMode={isDarkMode} value={city} onChange={(c) => { setCity(c); setPlaying(false); }} options={CITY_OPTIONS} label="City" />}
      note={`Items missing in any year for this city are left out so every year prices the same basket (${items.length} of ${BASKET.length} items here).`}
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['numbeo-city-prices']}
        flags={['curated']}
        download={{
          filename: `basket-${city}`,
          title: `${title}: ${CITY_LABELS[city].name}`,
          getData: () => YEARS.map((y) => ({ year: y, total: basketTotal(city, y, items), ...Object.fromEntries(items.map((i) => [i.label, itemPrice(city, i, y)])) })),
        }}
      />
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => {
            if (!playing && year === LAST_CITY_YEAR) setYear(FIRST_CITY_YEAR);
            setPlaying(!playing);
          }}
          aria-label={playing ? 'Pause' : 'Play'}
          className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-white ${playing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-500'}`}
        >
          {playing ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 5v14l11-7z" />
            </svg>
          )}
        </button>
        <input
          type="range"
          min={FIRST_CITY_YEAR}
          max={LAST_CITY_YEAR}
          value={year}
          onChange={(e) => {
            setPlaying(false);
            setYear(Number(e.target.value));
          }}
          aria-label="Year"
          className="flex-1 min-w-[160px] accent-blue-600"
        />
        <span className={`text-2xl font-black tabular-nums ${t.text}`}>{year}</span>
      </div>
      <div className="grid gap-6 md:grid-cols-[15rem_1fr]">
        <div data-chart-container data-chart-title={`${title}: ${CITY_LABELS[city].name} ${year}`} className={`rounded-lg border p-4 ${t.inset}`}>
          <div className={`text-[11px] uppercase tracking-wider ${t.textMuted}`}>Basket total</div>
          <div className={`text-3xl font-bold tabular-nums ${t.text}`}>{money(city, shown)}</div>
          <div className={`text-sm font-medium tabular-nums ${change == null ? t.textMuted : change > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
            {change == null ? '' : `${change > 0 ? '+' : ''}${change.toFixed(1)}% since ${FIRST_CITY_YEAR}`}
          </div>
          <div className={`mt-4 text-[11px] uppercase tracking-wider ${t.textMuted}`}>Average net salary</div>
          <div className={`text-lg font-semibold tabular-nums ${t.text}`}>{money(city, pay)}</div>
          <div className={`text-xs tabular-nums ${t.textSec}`}>{payChange == null ? '' : `${payChange > 0 ? '+' : ''}${payChange.toFixed(1)}% since ${FIRST_CITY_YEAR}`}</div>
          {pay && <div className={`mt-2 text-xs ${t.textSec}`}>The basket is {((total / pay) * 100).toFixed(1)}% of a month&rsquo;s pay.</div>}
        </div>
        <ul className="space-y-1.5">
          {items.map((i) => {
            const [a, b] = [itemPrice(city, i, FIRST_CITY_YEAR), itemPrice(city, i, year)];
            const ch = a && b ? (b / a - 1) * 100 : null;
            const w = ch == null ? 0 : (Math.abs(ch) / maxChange) * 50;
            return (
              <li key={i.id} className="grid grid-cols-[8.5rem_1fr_4.5rem_3.5rem] items-center gap-2 text-xs">
                <span className={t.text}>{i.label}</span>
                <span className={`relative h-3 rounded ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                  <span className="absolute inset-y-0 left-1/2 w-px bg-gray-400/60" />
                  <span
                    className={`absolute inset-y-0 rounded transition-all duration-500 ${ch != null && ch < 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={ch != null && ch < 0 ? { right: '50%', width: `${w}%` } : { left: '50%', width: `${w}%` }}
                  />
                </span>
                <span className={`tabular-nums text-right ${t.textSec}`}>{money(city, b)}</span>
                <span className={`tabular-nums text-right font-medium ${ch == null ? t.textMuted : ch > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {ch == null ? '\u2014' : `${ch > 0 ? '+' : ''}${ch.toFixed(0)}%`}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Panel>
  );
}

const RENT: CityItem = { id: 'rent', section: 'rent', key: 'apt1city', label: 'Rent, 1-bed centre' };
const UTILITIES: CityItem = { id: 'utilities', section: 'utilities', key: 'basic', label: 'Utilities' };
const WEEKS_PER_MONTH = 4.33;

function CityVsCity({ isDarkMode, data }: Pick<InflationChapterProps, 'isDarkMode' | 'data'>) {
  const t = theme(isDarkMode);
  const [a, setA] = useState<CityId>('london');
  const [b, setB] = useState<CityId>('tokyo');
  const [year, setYear] = useState(LAST_CITY_YEAR);
  const fx = (c: CityId) => lcuPerUsd(data.exchangeRate, CITY_COUNTRY[c], year);
  const usd = (c: CityId, v: number | null) => toUsd(v, fx(c));
  const shared = BASKET.filter((i) => itemPrice(a, i, year) != null && itemPrice(b, i, year) != null);
  const items = [RENT, UTILITIES, ...shared];
  const monthly = (c: CityId) => {
    const r = itemPrice(c, RENT, year);
    const u = itemPrice(c, UTILITIES, year);
    if (r == null || u == null) return null;
    return r + u + WEEKS_PER_MONTH * shared.reduce((s, i) => s + (itemPrice(c, i, year) ?? 0), 0);
  };
  const [costA, costB] = [usd(a, monthly(a)), usd(b, monthly(b))];
  const payA = usd(a, salary(a, year));
  const needed = payA != null && costA && costB ? payA * (costB / costA) : null;
  const neededLocal = needed != null && fx(b) ? needed * fx(b)!.rate : null;
  const fxYears = [fx(a)?.year, fx(b)?.year].filter((y): y is number => y != null && y < year);
  const max = Math.max(1e-9, ...items.flatMap((i) => [usd(a, itemPrice(a, i, year)) ?? 0, usd(b, itemPrice(b, i, year)) ?? 0]));
  const title = 'City vs city';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle="Two cities side by side in US dollars, and the take-home pay you'd need in the second city to keep the first city's lifestyle."
      actions={
        <label className={`inline-flex items-center gap-2 text-xs ${t.textSec}`}>
          Year
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={`text-xs rounded-md border px-2 py-1 ${t.input}`}>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      }
      note={`Lifestyle cost = 1-bed city-centre rent + utilities + the basket bought weekly. Converted at World Bank annual average exchange rates${
        fxYears.length ? ` (latest published: ${Math.min(...fxYears)})` : ''
      }.`}
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['numbeo-city-prices', 'wb-real-interest']}
        flags={['curated']}
        download={{
          filename: `city-vs-city-${a}-${b}-${year}`,
          title,
          getData: () => items.map((i) => ({ item: i.label, [`${CITY_LABELS[a].name} USD`]: usd(a, itemPrice(a, i, year)), [`${CITY_LABELS[b].name} USD`]: usd(b, itemPrice(b, i, year)) })),
        }}
      />
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Segmented isDarkMode={isDarkMode} value={a} onChange={setA} options={CITY_OPTIONS} label="First city" />
        <span className={`text-xs ${t.textMuted}`}>vs</span>
        <Segmented isDarkMode={isDarkMode} value={b} onChange={setB} options={CITY_OPTIONS} label="Second city" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_17rem]">
        <ul data-chart-container data-chart-title={`${title}: ${CITY_LABELS[a].name} vs ${CITY_LABELS[b].name}`} className="space-y-2">
          {items.map((i) => {
            const [va, vb] = [usd(a, itemPrice(a, i, year)), usd(b, itemPrice(b, i, year))];
            return (
              <li key={i.id} className="grid grid-cols-[8rem_1fr] items-center gap-3 text-xs">
                <span className={t.text}>{i.label}</span>
                <span className="space-y-0.5">
                  {[
                    { c: a, v: va, color: '#2563eb' },
                    { c: b, v: vb, color: '#f97316' },
                  ].map((x, j) => (
                    <span key={j} className="flex items-center gap-2">
                      <span className={`flex-1 h-2.5 rounded ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                        <span className="block h-2.5 rounded transition-all duration-500" style={{ width: `${((x.v ?? 0) / max) * 100}%`, backgroundColor: x.color }} />
                      </span>
                      <span className={`w-16 tabular-nums text-right ${t.textSec}`}>{money(x.c, x.v, true)}</span>
                    </span>
                  ))}
                </span>
              </li>
            );
          })}
          <li className={`flex gap-4 text-[11px] pt-1 ${t.textSec}`}>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" /> {CITY_LABELS[a].name}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-500" /> {CITY_LABELS[b].name}
            </span>
          </li>
        </ul>
        <div className={`rounded-lg border p-4 space-y-3 ${t.inset}`}>
          <div>
            <div className={`text-[11px] uppercase tracking-wider ${t.textMuted}`}>Monthly lifestyle cost</div>
            <div className={`text-sm tabular-nums ${t.text}`}>
              {CITY_LABELS[a].name}: <span className="font-semibold">{money(a, costA, true)}</span>
            </div>
            <div className={`text-sm tabular-nums ${t.text}`}>
              {CITY_LABELS[b].name}: <span className="font-semibold">{money(b, costB, true)}</span>
            </div>
          </div>
          <div>
            <div className={`text-[11px] uppercase tracking-wider ${t.textMuted}`}>Salary needed in {CITY_LABELS[b].name}</div>
            <div className="text-2xl font-bold tabular-nums text-blue-500">{money(b, neededLocal)}</div>
            <div className={`text-xs ${t.textSec}`}>
              {needed != null && payA != null ? (
                <>
                  ({money(b, needed, true)} a month) to match {CITY_LABELS[a].name}&rsquo;s average take-home pay of {money(a, payA, true)}.{' '}
                  {CITY_LABELS[b].name}&rsquo;s actual average is {money(b, salary(b, year))}.
                </>
              ) : (
                'Not enough data for this pair and year.'
              )}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
