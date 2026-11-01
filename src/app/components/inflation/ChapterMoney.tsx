'use client';

import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RankedBars } from '../development/charts';
import { COUNTRY_KEYS, type CountryKey } from '../../utils/countryMappings';
import { CITY_LABELS, CITY_ORDER, type CityId } from '../../data/cities';
import { CITY_PROFILES } from '../../data/costOfLiving';
import { CITY_COUNTRY } from '../../utils/inflation/cityUsd';
import { annualised, categoryChange, doublingYears, hoursOfWork, lifetimeErosion, personalInflation } from '../../utils/inflation/money';
import { mean, seriesOf, valueAt } from '../../utils/inflation/stats';
import { CATEGORIES, FIRST_CITY_YEAR, LAST_CITY_YEAR, WORK_ITEMS, hasItem, itemPrice, salary, type CityItem } from './cityItems';
import { ChapterMeta, CountrySelect, EmptyNote, Lede, Panel, Segmented, countryName, pct, theme, type InflationChapterProps } from './ui';

const CITY_OPTIONS = CITY_ORDER.map((id) => ({ id, label: CITY_LABELS[id].name }));

export default function ChapterMoney({ isDarkMode, data, selected }: InflationChapterProps) {
  return (
    <div className="space-y-6">
      <Lede isDarkMode={isDarkMode}>
        What inflation does to the money in your pocket: how long until prices double, how much they have risen in your lifetime, how many
        hours of work everyday things cost, and what your own inflation rate looks like if you don&rsquo;t spend like the average household.
      </Lede>
      <div className="grid gap-6 lg:grid-cols-2">
        <DoublingPanel isDarkMode={isDarkMode} data={data} selected={selected} />
        <LifetimePanel isDarkMode={isDarkMode} data={data} selected={selected} />
      </div>
      <HoursPanel isDarkMode={isDarkMode} />
      <PersonalInflationPanel isDarkMode={isDarkMode} data={data} />
    </div>
  );
}

function DoublingPanel({ isDarkMode, data, selected }: Pick<InflationChapterProps, 'isDarkMode' | 'data' | 'selected'>) {
  const lastYear = useMemo(() => Math.max(...(data.inflationRates ?? []).map((r) => Number(r.year))), [data.inflationRates]);
  const { rows, never } = useMemo(() => {
    const out: { key: CountryKey; value: number; display: string; avg: number }[] = [];
    const flat: CountryKey[] = [];
    for (const k of COUNTRY_KEYS) {
      const vals = seriesOf(data.inflationRates, k)
        .filter((o) => o.year > lastYear - 10)
        .map((o) => o.value);
      if (vals.length < 6) continue;
      const avg = mean(vals)!;
      const years = doublingYears(avg);
      if (years == null) flat.push(k);
      // Bars cap at 150 years so Japan-style near-zero inflation doesn't squash the rest; the label keeps the real figure.
      else out.push({ key: k, value: Math.min(years, 150), avg, display: years >= 10 ? `${years.toFixed(0)} yrs` : `${years.toFixed(1)} yrs` });
    }
    return { rows: out, never: flat };
  }, [data.inflationRates, lastYear]);
  const title = 'How long until prices double?';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle={`At each country's average inflation over the last ten years (${lastYear - 9}-${lastYear}), the years it takes for prices to double: ln 2 / ln(1 + rate).`}
      note={never.length ? `Prices fell on average in ${never.map(countryName).join(', ')}, so they never double at that rate.` : 'Rule of thumb: 70 divided by the inflation rate.'}
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['wb-inflation']}
        download={{ filename: 'price-doubling-time', title, getData: () => rows.map((r) => ({ country: countryName(r.key), avgInflation: r.avg, yearsToDouble: doublingYears(r.avg) })) }}
      />
      <div data-chart-container data-chart-title={title}>
        <RankedBars isDarkMode={isDarkMode} rows={rows} format={(v) => `${v.toFixed(0)} yrs`} highlight={selected} maxHeight={420} domainMax={150} />
      </div>
    </Panel>
  );
}

function LifetimePanel({ isDarkMode, data, selected }: Pick<InflationChapterProps, 'isDarkMode' | 'data' | 'selected'>) {
  const t = theme(isDarkMode);
  const [country, setCountry] = useState<CountryKey>(selected[0] ?? 'USA');
  const [birthYear, setBirthYear] = useState(1990);
  const erosion = useMemo(() => lifetimeErosion(data.cpiData, country, birthYear), [data.cpiData, country, birthYear]);
  const doublings = erosion ? Math.log2(erosion.multiple) : 0;
  const title = 'Prices since you were born';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle="Enter a birth year and a country to see how much consumer prices have risen over a lifetime."
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['wb-cpi-index']}
        download={erosion ? { filename: `lifetime-prices-${country}-${birthYear}`, title, getData: () => erosion.series.map((o) => ({ year: o.year, index: o.value })) } : undefined}
      />
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <label className={`inline-flex items-center gap-2 text-xs ${t.textSec}`}>
          Born in
          <input
            type="number"
            min={1940}
            max={new Date().getFullYear() - 1}
            value={birthYear}
            onChange={(e) => setBirthYear(Math.max(1940, Math.min(new Date().getFullYear() - 1, Number(e.target.value) || 1990)))}
            className={`w-20 text-xs rounded-md border px-2 py-1 tabular-nums ${t.input}`}
          />
        </label>
        <CountrySelect isDarkMode={isDarkMode} value={country} onChange={setCountry} label="in" />
      </div>
      {!erosion ? (
        <EmptyNote isDarkMode={isDarkMode}>No consumer price index for {countryName(country)} over that period.</EmptyNote>
      ) : (
        <>
          <p className={`text-sm mb-1 ${t.textSec}`}>
            {erosion.fromYear > birthYear && <>The CPI series starts in {erosion.fromYear}. </>}
            Prices in {countryName(country)} have risen{' '}
            <span className={`text-2xl font-bold tabular-nums ${t.text}`}>{erosion.multiple >= 100 ? erosion.multiple.toExponential(1) : erosion.multiple.toFixed(1)}&times;</span> since{' '}
            {erosion.fromYear}.
          </p>
          <p className={`text-sm mb-3 ${t.textSec}`}>
            Money from {erosion.fromYear} buys {(erosion.purchasingPower * 100).toFixed(erosion.purchasingPower < 0.01 ? 3 : 0)}% of what it did; prices have doubled{' '}
            {doublings.toFixed(1)} times, averaging {pct(annualised((erosion.multiple - 1) * 100, erosion.toYear - erosion.fromYear))} a year.
          </p>
          <div data-chart-container data-chart-title={`${title}: ${countryName(country)}`} style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={erosion.series} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
                <XAxis dataKey="year" stroke={t.axis} tick={{ fontSize: 11 }} />
                <YAxis stroke={t.axis} tick={{ fontSize: 11 }} width={52} scale={erosion.multiple > 50 ? 'log' : 'auto'} domain={['auto', 'auto']} />
                <Tooltip contentStyle={t.tooltip} formatter={(v: number) => [v.toFixed(0), `Prices (${erosion.fromYear} = 100)`]} />
                <Area dataKey="value" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Panel>
  );
}

function HoursPanel({ isDarkMode }: { isDarkMode: boolean }) {
  const t = theme(isDarkMode);
  const [city, setCity] = useState<CityId>('london');
  const profile = CITY_PROFILES[city];
  const items = WORK_ITEMS.filter((i) => hasItem(city, i));
  const rows = items.map((i) => {
    const [a, b] = [FIRST_CITY_YEAR, LAST_CITY_YEAR].map((y) => hoursOfWork(itemPrice(city, i, y), salary(city, y)));
    return { ...i, before: a, after: b };
  });
  const max = Math.max(1e-9, ...rows.flatMap((r) => [r.before ?? 0, r.after ?? 0]));
  const fmtH = (h: number | null) => (h == null ? '\u2014' : h >= 10 ? `${h.toFixed(0)} h` : h >= 1 ? `${h.toFixed(1)} h` : `${Math.round(h * 60)} min`);
  const title = 'Hours of work to buy it';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle={`What everyday things cost in time: price divided by the average net hourly wage (monthly take-home pay / 160 hours), ${FIRST_CITY_YEAR} against ${LAST_CITY_YEAR}.`}
      actions={<Segmented isDarkMode={isDarkMode} value={city} onChange={setCity} options={CITY_OPTIONS} label="City" />}
      note="Cappuccino prices are only available for Tokyo. Shorter bars mean the item became more affordable relative to pay."
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['numbeo-city-prices']}
        flags={['curated']}
        download={{ filename: `hours-of-work-${city}`, title: `${title}: ${profile.name}`, getData: () => rows.map((r) => ({ item: r.label, [`hours${FIRST_CITY_YEAR}`]: r.before, [`hours${LAST_CITY_YEAR}`]: r.after })) }}
      />
      <div data-chart-container data-chart-title={`${title}: ${profile.name}`} className="space-y-3">
        {rows.map((r) => {
          const change = r.before && r.after ? (r.after / r.before - 1) * 100 : null;
          return (
            <div key={r.id} className="grid grid-cols-[9rem_1fr_4.5rem] sm:grid-cols-[13rem_1fr_5rem] items-center gap-3 text-xs">
              <span className={t.text}>{r.label}</span>
              <span className="space-y-1">
                {[
                  { y: FIRST_CITY_YEAR, v: r.before, c: isDarkMode ? '#6b7280' : '#9ca3af' },
                  { y: LAST_CITY_YEAR, v: r.after, c: '#2563eb' },
                ].map((b) => (
                  <span key={b.y} className="flex items-center gap-2">
                    <span className={`w-8 tabular-nums ${t.textMuted}`}>{b.y}</span>
                    <span className={`flex-1 h-2.5 rounded ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                      <span className="block h-2.5 rounded transition-all duration-500" style={{ width: `${((b.v ?? 0) / max) * 100}%`, backgroundColor: b.c }} />
                    </span>
                    <span className={`w-14 tabular-nums text-right ${t.text}`}>{fmtH(b.v)}</span>
                  </span>
                ))}
              </span>
              <span className={`tabular-nums text-right font-medium ${change == null ? t.textMuted : change > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {change == null ? '\u2014' : `${change > 0 ? '+' : ''}${change.toFixed(0)}%`}
              </span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

const PERIODS = [
  { id: '2011', label: `${FIRST_CITY_YEAR}-${LAST_CITY_YEAR}` },
  { id: '2019', label: `2019-${LAST_CITY_YEAR}` },
  { id: '2021', label: `2021-${LAST_CITY_YEAR}` },
];

function categoryChangeFor(city: CityId, items: Pick<CityItem, 'section' | 'key'>[], from: number, to: number): number | null {
  const id = (i: Pick<CityItem, 'section' | 'key'>) => `${i.section}.${i.key}`;
  const row = (year: number) => ({ year, ...Object.fromEntries(items.map((i) => [id(i), itemPrice(city, i, year)])) });
  return categoryChange([row(from), row(to)], items.map(id), from, to);
}

function PersonalInflationPanel({ isDarkMode, data }: Pick<InflationChapterProps, 'isDarkMode' | 'data'>) {
  const t = theme(isDarkMode);
  const [city, setCity] = useState<CityId>('london');
  const [period, setPeriod] = useState('2019');
  const [weights, setWeights] = useState<Record<string, number>>(() => Object.fromEntries(CATEGORIES.map((c) => [c.id, c.defaultWeight])));
  const from = Number(period);
  const years = LAST_CITY_YEAR - from;
  const changes = useMemo(() => Object.fromEntries(CATEGORIES.map((c) => [c.id, categoryChangeFor(city, c.items, from, LAST_CITY_YEAR)])), [city, from]);
  const mine = personalInflation(weights, changes);
  const typical = personalInflation(Object.fromEntries(CATEGORIES.map((c) => [c.id, c.defaultWeight])), changes);
  const country = CITY_COUNTRY[city];
  const cpiFrom = valueAt(data.cpiData, country, from);
  const cpiTo = valueAt(data.cpiData, country, LAST_CITY_YEAR);
  const official = cpiFrom && cpiTo ? (cpiTo / cpiFrom - 1) * 100 : null;
  const total = Object.values(weights).reduce((s, w) => s + w, 0);
  const title = 'Your personal inflation rate';
  const results = [
    { label: 'Your basket', v: mine, tone: 'text-blue-500' },
    { label: 'Typical basket', v: typical, tone: t.text },
    { label: `Official CPI, ${countryName(country)}`, v: official, tone: t.textSec },
  ];
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle={`Set how you split your spending and see how much your own costs rose in ${CITY_LABELS[city].name}, using item prices for each category.`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Segmented isDarkMode={isDarkMode} value={city} onChange={setCity} options={CITY_OPTIONS} label="City" />
          <Segmented isDarkMode={isDarkMode} value={period} onChange={setPeriod} options={PERIODS} label="Period" />
        </div>
      }
      note="Category changes are geometric means of item price changes, as statistical offices compute elementary indices. Weights are normalised, so they don't need to add up to 100. Official CPI is the national index, not the city."
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['numbeo-city-prices', 'wb-cpi-index']}
        flags={['curated']}
        download={{
          filename: `personal-inflation-${city}-${from}`,
          title,
          getData: () => CATEGORIES.map((c) => ({ category: c.label, weight: weights[c.id], changePct: changes[c.id] })),
        }}
      />
      <div className="grid gap-6 md:grid-cols-[1fr_16rem]">
        <div className="space-y-3">
          {CATEGORIES.map((c) => (
            <div key={c.id} className="grid grid-cols-[8.5rem_1fr_3rem_4rem] items-center gap-2 text-xs">
              <label htmlFor={`w-${c.id}`} className={t.text}>
                {c.label}
              </label>
              <input
                id={`w-${c.id}`}
                type="range"
                min={0}
                max={60}
                value={weights[c.id]}
                onChange={(e) => setWeights((w) => ({ ...w, [c.id]: Number(e.target.value) }))}
                className="accent-blue-600"
              />
              <span className={`tabular-nums text-right ${t.textSec}`}>{total ? Math.round((weights[c.id] / total) * 100) : 0}%</span>
              <span className={`tabular-nums text-right font-medium ${changes[c.id] == null ? t.textMuted : (changes[c.id] ?? 0) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {changes[c.id] == null ? '\u2014' : `${changes[c.id]! > 0 ? '+' : ''}${changes[c.id]!.toFixed(0)}%`}
              </span>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setWeights(Object.fromEntries(CATEGORIES.map((c) => [c.id, c.defaultWeight])))}
            className={`text-xs underline ${t.accent}`}
          >
            Reset to typical weights
          </button>
        </div>
        <div data-chart-container data-chart-title={title} className={`rounded-lg border p-4 space-y-3 ${t.inset}`}>
          {results.map((r) => (
            <div key={r.label}>
              <div className={`text-[11px] uppercase tracking-wider ${t.textMuted}`}>{r.label}</div>
              <div className={`text-xl font-semibold tabular-nums ${r.tone}`}>{r.v == null ? '\u2014' : `${r.v > 0 ? '+' : ''}${r.v.toFixed(1)}%`}</div>
              <div className={`text-[11px] ${t.textMuted}`}>{r.v == null ? '' : `${pct(annualised(r.v, years))} a year over ${years} years`}</div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
