'use client';

import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ScatterPlot } from '../development/charts';
import { COUNTRY_KEYS, type CountryKey } from '../../utils/countryMappings';
import { fetchCommodityShocks, fetchInflationDrivers } from '../../services/inflationData';
import { correlationOf, depreciationRows, longRunAverages, passThroughPairs, phillipsPath } from '../../utils/inflation/drivers';
import { medianByYear, pctChanges } from '../../utils/inflation/stats';
import { ChapterMeta, ChartLoading, CountrySelect, EmptyNote, Lede, Panel, Segmented, compactPct, countryName, pct, theme, useLazyFetch, type InflationChapterProps } from './ui';

const DECADE_COLORS: Record<number, string> = {
  1990: '#a855f7',
  2000: '#3b82f6',
  2010: '#10b981',
  2020: '#f97316',
};
const decadeColor = (d: number) => DECADE_COLORS[d] ?? '#9ca3af';

type Window = '1990' | '2000' | '2010';
const WINDOWS: { id: Window; label: string }[] = [
  { id: '1990', label: 'Since 1990' },
  { id: '2000', label: 'Since 2000' },
  { id: '2010', label: 'Since 2010' },
];

const rLabel = (r: number | null) => (r == null ? 'not enough data' : `correlation r = ${r.toFixed(2)}`);

export default function ChapterDrivers({ isDarkMode, data, selected }: InflationChapterProps) {
  const drivers = useLazyFetch(true, fetchInflationDrivers);
  const shocks = useLazyFetch(true, fetchCommodityShocks);
  return (
    <div className="space-y-6">
      <Lede isDarkMode={isDarkMode}>
        Four forces explain most of the inflation on this page: how tight the labour market is, how fast the money supply grows, what the
        currency does, and the price of oil and food. Each panel tests one of them against the data.
      </Lede>
      <PhillipsPanel isDarkMode={isDarkMode} data={data} selected={selected} />
      <div className="grid gap-6 lg:grid-cols-2">
        <MoneyPanel isDarkMode={isDarkMode} data={data} selected={selected} drivers={drivers} />
        <PassThroughPanel isDarkMode={isDarkMode} data={data} selected={selected} />
      </div>
      <ShocksPanel isDarkMode={isDarkMode} data={data} shocks={shocks} />
    </div>
  );
}

function PhillipsPanel({ isDarkMode, data, selected }: Pick<InflationChapterProps, 'isDarkMode' | 'data' | 'selected'>) {
  const t = theme(isDarkMode);
  const [country, setCountry] = useState<CountryKey>(selected[0] ?? 'USA');
  const path = useMemo(() => phillipsPath(data.unemploymentRates, data.inflationRates, country, 1991), [data, country]);
  const r = correlationOf(path.map((p) => ({ x: p.unemployment, y: p.inflation })));
  const chart = path.map((p, i) => ({ ...p, label: i === 0 || i === path.length - 1 || p.year % 5 === 0 ? String(p.year) : '' }));
  const title = 'Phillips curve explorer';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle="Unemployment against inflation, one dot per year joined in order. A downward slope means a tight labour market pushes prices up."
      actions={<CountrySelect isDarkMode={isDarkMode} value={country} onChange={setCountry} />}
      note={`${countryName(country)}, ${path[0]?.year ?? ''}-${path[path.length - 1]?.year ?? ''}: ${rLabel(r)}. Unemployment is the ILO modelled estimate.`}
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['wb-unemployment', 'wb-inflation']}
        download={{ filename: `phillips-${country}`, title: `${title}: ${countryName(country)}`, getData: () => path.map((p) => ({ ...p })) }}
      />
      {path.length < 3 ? (
        <EmptyNote isDarkMode={isDarkMode}>Not enough overlapping years for {countryName(country)}.</EmptyNote>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 mb-1">
            {Object.entries(DECADE_COLORS).map(([d, c]) => (
              <span key={d} className={`inline-flex items-center gap-1 text-[11px] ${t.textSec}`}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                {d}s
              </span>
            ))}
          </div>
          <div data-chart-container data-chart-title={`${title}: ${countryName(country)}`} style={{ height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 16, right: 20, bottom: 30, left: 10 }}>
                <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="unemployment"
                  domain={['auto', 'auto']}
                  stroke={t.axis}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${v}%`}
                  label={{ value: 'Unemployment rate', position: 'insideBottom', offset: -18, fill: t.axis, fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="inflation"
                  domain={['auto', 'auto']}
                  stroke={t.axis}
                  tick={{ fontSize: 11 }}
                  tickFormatter={compactPct}
                  width={52}
                  label={{ value: 'Inflation', angle: -90, position: 'insideLeft', fill: t.axis, fontSize: 11 }}
                />
                <ReferenceLine y={2} stroke="#10b981" strokeDasharray="5 4" />
                <Tooltip
                  content={({ payload }) => {
                    const p = payload?.[0]?.payload as (typeof chart)[number] | undefined;
                    return p ? (
                      <div style={t.tooltip} className="px-2 py-1.5">
                        <div className="font-semibold">{p.year}</div>
                        <div>Unemployment {pct(p.unemployment)}</div>
                        <div>Inflation {pct(p.inflation)}</div>
                      </div>
                    ) : null;
                  }}
                />
                <Scatter data={chart} line={{ stroke: isDarkMode ? '#4b5563' : '#cbd5e1', strokeWidth: 1.5 }} isAnimationActive={false}>
                  {chart.map((p) => (
                    <Cell key={p.year} fill={decadeColor(p.decade)} />
                  ))}
                  <LabelList dataKey="label" position="top" style={{ fontSize: 10, fill: t.axis }} />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Panel>
  );
}

type Fetched<T> = { data: T | null; loading: boolean; failed: boolean };

function MoneyPanel({
  isDarkMode,
  data,
  selected,
  drivers,
}: Pick<InflationChapterProps, 'isDarkMode' | 'data' | 'selected'> & { drivers: Fetched<Awaited<ReturnType<typeof fetchInflationDrivers>>> }) {
  const t = theme(isDarkMode);
  const [win, setWin] = useState<Window>('2000');
  const [measure, setMeasure] = useState<'cpi' | 'deflator'>('cpi');
  const [hideExtreme, setHideExtreme] = useState(true);
  const yRows = measure === 'cpi' ? data.inflationRates : drivers.data?.gdpDeflator;
  const all = useMemo(
    () => longRunAverages(drivers.data?.broadMoney, yRows, COUNTRY_KEYS, Number(win), 2100, 8),
    [drivers.data, yRows, win],
  );
  const rows = hideExtreme ? all.filter((p) => p.x <= 60 && p.y <= 60) : all;
  const r = correlationOf(all);
  const title = 'Money growth vs inflation';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle="Average annual growth in broad money against average inflation, per country. Over long periods, faster money growth goes with faster inflation; the dashed line is one-for-one."
      actions={<Segmented isDarkMode={isDarkMode} value={win} onChange={setWin} options={WINDOWS} label="Period" />}
      note={`${all.length} countries with at least eight years of both series; ${rLabel(r)}. Money growth above inflation is normal: real growth also needs money.`}
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['wb-inflation-drivers', 'wb-inflation']}
        download={{ filename: `money-vs-inflation-${win}`, title, getData: () => all.map((p) => ({ country: countryName(p.key), moneyGrowth: p.x, inflation: p.y, years: p.years })) }}
      />
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <Segmented
          isDarkMode={isDarkMode}
          value={measure}
          onChange={setMeasure}
          label="Price measure"
          options={[
            { id: 'cpi', label: 'Consumer prices' },
            { id: 'deflator', label: 'GDP deflator' },
          ]}
        />
        <label className={`inline-flex items-center gap-2 text-xs ${t.textSec}`}>
          <input type="checkbox" checked={hideExtreme} onChange={(e) => setHideExtreme(e.target.checked)} />
          Hide averages above 60%
        </label>
      </div>
      {drivers.loading || (!drivers.data && !drivers.failed) ? (
        <ChartLoading isDarkMode={isDarkMode} height={340} />
      ) : rows.length < 3 ? (
        <EmptyNote isDarkMode={isDarkMode}>Broad money data is unavailable right now.</EmptyNote>
      ) : (
        <div data-chart-container data-chart-title={title}>
          <ScatterPlot
            isDarkMode={isDarkMode}
            rows={rows}
            xLabel="Broad money growth"
            yLabel={measure === 'cpi' ? 'CPI inflation' : 'GDP deflator'}
            xFormat={compactPct}
            yFormat={compactPct}
            highlight={selected}
            diagonal
            height={340}
          />
        </div>
      )}
    </Panel>
  );
}

function PassThroughPanel({ isDarkMode, data, selected }: Pick<InflationChapterProps, 'isDarkMode' | 'data' | 'selected'>) {
  const t = theme(isDarkMode);
  const keys = useMemo(() => COUNTRY_KEYS.filter((k) => k !== 'USA'), []);
  const dep = useMemo(() => depreciationRows(data.exchangeRate, keys), [data.exchangeRate, keys]);
  const [mode, setMode] = useState<'countries' | 'years'>('countries');
  const [country, setCountry] = useState<CountryKey>(selected.find((k) => k !== 'USA') ?? 'Turkey');
  const [hideExtreme, setHideExtreme] = useState(true);
  const averages = useMemo(() => longRunAverages(dep, data.inflationRates, keys, 2000, 2100, 8, 1), [dep, data.inflationRates, keys]);
  const avgRows = hideExtreme ? averages.filter((p) => p.x <= 40 && p.y <= 40) : averages;
  const pairs = useMemo(() => passThroughPairs(dep, data.inflationRates, country, 1995), [dep, data.inflationRates, country]);
  const r = mode === 'countries' ? correlationOf(averages) : correlationOf(pairs);
  const title = 'Exchange-rate pass-through';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle="When a currency falls, imports cost more. Depreciation against the dollar in one year against inflation the next."
      actions={
        <Segmented
          isDarkMode={isDarkMode}
          value={mode}
          onChange={setMode}
          options={[
            { id: 'countries', label: 'All countries' },
            { id: 'years', label: 'One country' },
          ]}
        />
      }
      note={`${mode === 'countries' ? 'Averages since 2000' : `${countryName(country)}, year by year since 1995`}: ${rLabel(r)}. The US is excluded: the dollar is the yardstick. Euro members share one exchange rate.`}
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['wb-real-interest', 'wb-inflation']}
        download={{
          filename: `fx-pass-through-${mode === 'countries' ? 'countries' : country}`,
          title,
          getData: () =>
            mode === 'countries'
              ? averages.map((p) => ({ country: countryName(p.key), depreciation: p.x, nextYearInflation: p.y, years: p.years }))
              : pairs.map((p) => ({ year: p.year, depreciation: p.x, nextYearInflation: p.y })),
        }}
      />
      <div className="flex flex-wrap items-center gap-3 mb-2">
        {mode === 'years' ? (
          <CountrySelect isDarkMode={isDarkMode} value={country} onChange={setCountry} options={keys} />
        ) : (
          <label className={`inline-flex items-center gap-2 text-xs ${t.textSec}`}>
            <input type="checkbox" checked={hideExtreme} onChange={(e) => setHideExtreme(e.target.checked)} />
            Hide averages above 40%
          </label>
        )}
      </div>
      <div data-chart-container data-chart-title={title}>
        {mode === 'countries' ? (
          avgRows.length < 3 ? (
            <EmptyNote isDarkMode={isDarkMode}>Exchange-rate data is unavailable.</EmptyNote>
          ) : (
            <ScatterPlot
              isDarkMode={isDarkMode}
              rows={avgRows}
              xLabel="Avg. depreciation vs USD"
              yLabel="Next-year inflation"
              xFormat={compactPct}
              yFormat={compactPct}
              highlight={selected}
              refX={0}
              height={340}
            />
          )
        ) : pairs.length < 3 ? (
          <EmptyNote isDarkMode={isDarkMode}>Not enough exchange-rate history for {countryName(country)}.</EmptyNote>
        ) : (
          <div style={{ height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 16, right: 20, bottom: 30, left: 10 }}>
                <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" domain={['auto', 'auto']} stroke={t.axis} tick={{ fontSize: 11 }} tickFormatter={compactPct} label={{ value: 'Depreciation vs USD', position: 'insideBottom', offset: -18, fill: t.axis, fontSize: 11 }} />
                <YAxis type="number" dataKey="y" domain={['auto', 'auto']} stroke={t.axis} tick={{ fontSize: 11 }} tickFormatter={compactPct} width={52} label={{ value: 'Inflation next year', angle: -90, position: 'insideLeft', fill: t.axis, fontSize: 11 }} />
                <ReferenceLine x={0} stroke={t.axis} />
                <Tooltip
                  content={({ payload }) => {
                    const p = payload?.[0]?.payload as (typeof pairs)[number] | undefined;
                    return p ? (
                      <div style={t.tooltip} className="px-2 py-1.5">
                        <div className="font-semibold">
                          {p.year} &rarr; {p.year + 1}
                        </div>
                        <div>Depreciation {pct(p.x)}</div>
                        <div>Inflation next year {pct(p.y)}</div>
                      </div>
                    ) : null;
                  }}
                />
                <Scatter data={pairs.map((p) => ({ ...p, label: String(p.year).slice(2) }))} fill="#3b82f6" isAnimationActive={false}>
                  <LabelList dataKey="label" position="top" style={{ fontSize: 9, fill: t.axis }} />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Panel>
  );
}

function ShocksPanel({
  isDarkMode,
  data,
  shocks,
}: Pick<InflationChapterProps, 'isDarkMode' | 'data'> & { shocks: Fetched<Awaited<ReturnType<typeof fetchCommodityShocks>>> }) {
  const t = theme(isDarkMode);
  const chart = useMemo(() => {
    const med = medianByYear(data.inflationRates, COUNTRY_KEYS, 25);
    const oil = new Map(pctChanges(shocks.data?.oil ?? []).map((o) => [o.year, o.value]));
    const food = new Map(pctChanges(shocks.data?.food ?? []).map((o) => [o.year, o.value]));
    return med
      .filter((o) => o.year >= 1991)
      .map((o) => ({ year: o.year, median: o.value, oil: oil.get(o.year) ?? null, food: food.get(o.year) ?? null }));
  }, [data.inflationRates, shocks.data]);
  const title = 'Oil and food shocks';
  const rOil = correlationOf(chart.filter((c) => c.oil != null).map((c) => ({ x: c.oil!, y: c.median })));
  const rFood = correlationOf(chart.filter((c) => c.food != null).map((c) => ({ x: c.food!, y: c.median })));
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle="Year-on-year change in Brent crude and the IMF global food price index (right axis) against median inflation across the 47 economies (left axis)."
      note={`Same-year correlation with median inflation: oil ${rOil?.toFixed(2) ?? '\u2014'}, food ${rFood?.toFixed(2) ?? '\u2014'}. Commodity swings are far larger than the inflation they cause, which is why the axes differ.`}
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['fred-oil-food', 'wb-inflation']}
        download={{ filename: 'oil-food-inflation', title, getData: () => chart }}
      />
      {shocks.loading || (!shocks.data && !shocks.failed) ? (
        <ChartLoading isDarkMode={isDarkMode} height={340} />
      ) : (
        <div data-chart-container data-chart-title={title} style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chart} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
              <XAxis dataKey="year" stroke={t.axis} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="l" stroke={t.axis} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} width={40} />
              <YAxis yAxisId="r" orientation="right" stroke={t.axis} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} width={44} />
              <Tooltip contentStyle={t.tooltip} formatter={(v: number, n: string) => [pct(v), n]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine yAxisId="r" y={0} stroke={t.axis} />
              <Line yAxisId="r" dataKey="oil" name="Brent crude, y/y" stroke={isDarkMode ? '#d1d5db' : '#374151'} strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
              <Line yAxisId="r" dataKey="food" name="Food prices, y/y" stroke="#84cc16" strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
              <Line yAxisId="l" dataKey="median" name="Median inflation" stroke="#ef4444" strokeWidth={3} dot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}
