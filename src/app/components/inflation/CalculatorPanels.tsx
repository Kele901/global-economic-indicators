'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CountryFlag from '../CountryFlag';
import { formatCurrency, formatCurrencyCompact, getCurrencySymbol } from '../../services/inflationCalculator';
import { evenlySpaced, priceMilestones, type CompareRow, type YearRow } from '../../utils/inflation/calculator';
import { doublingYears } from '../../utils/inflation/money';
import { ChapterMeta, EmptyNote, Panel, Segmented, countryName, pct, theme } from './ui';

export const COMPARE_COLORS = ['#2563eb', '#e11d48', '#059669', '#d97706'];

type Scale = 'auto' | 'linear' | 'log';
const SCALES: { id: Scale; label: string }[] = [
  { id: 'auto', label: 'Auto' },
  { id: 'linear', label: 'Linear' },
  { id: 'log', label: 'Log' },
];

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

/** What money still buys, as a share of what it bought at the start. */
export function shareLabel(s: number): string {
  if (s >= 0.01) return `${(s * 100).toFixed(s >= 0.1 ? 0 : 1)}%`;
  return `1/${compact.format(1 / s)}`;
}

export function multipleLabel(m: number): string {
  return m >= 100 ? `\u00d7${compact.format(m)}` : `\u00d7${m.toFixed(m >= 10 ? 1 : 2)}`;
}

// Milestones fall on round multiples (2, 4, 100...), so no decimals.
const roundMultiple = (m: number) => `\u00d7${compact.format(m)}`;

// Area tracks purchasing power, so each side scales with its square root.
const NOTE_W = 200;
const NOTE_H = 96;
const MIN_NOTE_W = 6;
const NOTE_GAP = 16;
const NOTE_LABEL_W = 64;

export function Banknote({
  symbol,
  label,
  scale,
  width = NOTE_W,
  tint = '#059669',
}: {
  symbol: string;
  label: string;
  scale: number;
  width?: number;
  tint?: string;
}) {
  const k = Math.min(Math.sqrt(Math.max(scale, 0)), 1.25);
  const w = Math.max(width * k, MIN_NOTE_W);
  const h = Math.max(width * (NOTE_H / NOTE_W) * k, MIN_NOTE_W / 2);
  return (
    <div
      role="img"
      aria-label={`${label} note at ${shareLabel(scale)} of its original purchasing power`}
      className="relative shrink-0 rounded-md border shadow-sm overflow-hidden transition-all duration-500"
      style={{ width: w, height: h, borderColor: tint, background: `linear-gradient(135deg, ${tint}40, ${tint}14 55%, ${tint}33)` }}
    >
      {w >= 40 && <div className="absolute inset-1 rounded border border-dashed" style={{ borderColor: `${tint}80` }} />}
      {w >= 90 && (
        <div
          className="absolute rounded-full border-2 flex items-center justify-center font-bold"
          style={{ width: h * 0.5, height: h * 0.5, right: w * 0.08, bottom: h * 0.14, borderColor: tint, color: tint, fontSize: Math.max(h * 0.2, 9) }}
        >
          {symbol}
        </div>
      )}
      {w >= 70 && (
        <div className="absolute left-2 top-1 font-bold tabular-nums truncate" style={{ maxWidth: w - 16, fontSize: Math.max(h * 0.15, 9), color: tint }}>
          {label}
        </div>
      )}
      {w >= 150 && (
        <div className="absolute left-2 bottom-1 uppercase tracking-widest opacity-70" style={{ fontSize: Math.max(h * 0.09, 7), color: tint }}>
          Purchasing power
        </div>
      )}
    </div>
  );
}

export function BanknotePanel({
  isDarkMode,
  rows,
  country,
  amountLabel,
}: {
  isDarkMode: boolean;
  rows: YearRow[];
  country: string;
  amountLabel: string;
}) {
  const t = theme(isDarkMode);
  const title = 'The shrinking banknote';
  const rowRef = useRef<HTMLDivElement>(null);
  const [rowWidth, setRowWidth] = useState(0);
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setRowWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  if (rows.length < 2) return null;
  const first = rows[0];
  const picks = evenlySpaced(rows, 6);
  const symbol = getCurrencySymbol(country, first.year);
  // Shrink the base note until the row fits; each column is at least as wide as its year label.
  const minColumn = NOTE_LABEL_W / NOTE_W;
  const weight = picks.reduce((sum, r) => sum + Math.max(Math.min(Math.sqrt(first.cpi / r.cpi), 1.25), minColumn), 0);
  const noteWidth = rowWidth ? Math.min(NOTE_W, (rowWidth - NOTE_GAP * (picks.length - 1)) / weight) : NOTE_W;
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle={`A ${amountLabel} note from ${first.year}, drawn so its area matches what it buys in each later year.`}
      note="Notes that keep less than about 0.1% of their value are drawn at a minimum size so they stay visible."
    >
      <div
        ref={rowRef}
        data-chart-container
        data-chart-title={`${title}: ${countryName(country)}`}
        className="flex items-end justify-between overflow-x-auto pb-2"
        style={{ gap: NOTE_GAP }}
      >
        {picks.map((r) => {
          const s = first.cpi / r.cpi;
          return (
            <div key={r.year} className="flex flex-col items-center gap-2">
              <Banknote symbol={symbol} label={amountLabel} scale={s} width={noteWidth} tint={s >= 1 ? '#059669' : s >= 0.5 ? '#0d9488' : s >= 0.1 ? '#d97706' : '#e11d48'} />
              <div className="text-center">
                <div className={`text-sm font-semibold tabular-nums ${t.text}`}>{r.year}</div>
                <div className={`text-[11px] ${t.textMuted}`}>buys {shareLabel(s)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export function ValueChart({
  isDarkMode,
  rows,
  country,
  currencyYear,
  note,
}: {
  isDarkMode: boolean;
  rows: YearRow[];
  country: string;
  currencyYear: number;
  note?: string;
}) {
  const t = theme(isDarkMode);
  const [scale, setScale] = useState<Scale>('auto');
  const title = 'Value over time';
  if (rows.length < 2) return null;
  const multiple = rows[rows.length - 1].cpi / rows[0].cpi;
  const log = scale === 'log' || (scale === 'auto' && (multiple > 20 || multiple < 0.05));
  const money = (v: number) => formatCurrency(v, country, currencyYear);
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle="The blue line is what the same goods cost each year. The red line is what the original amount buys if it sits in cash."
      actions={<Segmented isDarkMode={isDarkMode} label="Scale" options={SCALES} value={scale} onChange={setScale} />}
      note={note}
    >
      <div data-chart-container data-chart-title={`${title}: ${countryName(country)}`} style={{ height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: 8 }}>
            <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
            <XAxis dataKey="year" type="number" domain={['dataMin', 'dataMax']} stroke={t.axis} tick={{ fontSize: 11 }} />
            <YAxis
              scale={log ? 'log' : 'linear'}
              domain={log ? ['auto', 'auto'] : [0, 'auto']}
              allowDataOverflow={log}
              stroke={t.axis}
              tick={{ fontSize: 11 }}
              width={72}
              tickFormatter={(v: number) => formatCurrencyCompact(v, country, currencyYear)}
            />
            <Tooltip contentStyle={t.tooltip} labelFormatter={(y) => `${y}`} formatter={(v: number, name: string) => [money(v), name]} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={rows[0].equivalent} stroke={t.axis} strokeDasharray="4 4" />
            <Line type="monotone" dataKey="equivalent" name="Cost of the same goods" stroke="#2563eb" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="purchasingPower" name="What the cash buys" stroke="#e11d48" strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

export function MilestonesPanel({
  isDarkMode,
  rows,
  amountLabel,
  averageInflation,
}: {
  isDarkMode: boolean;
  rows: YearRow[];
  amountLabel: string;
  averageInflation: number;
}) {
  const t = theme(isDarkMode);
  const milestones = useMemo(() => priceMilestones(rows.map((r) => ({ year: r.year, value: r.cpi }))), [rows]);
  if (rows.length < 2) return null;
  const from = rows[0].year;
  const to = rows[rows.length - 1].year;
  const span = Math.max(to - from, 1);
  const doubling = doublingYears(averageInflation);
  return (
    <Panel
      isDarkMode={isDarkMode}
      title="Milestones"
      subtitle={`The years prices passed each doubling since ${from}, and what ${amountLabel} kept in cash could buy by then.`}
      note={
        doubling != null
          ? `At the average rate for this period (${pct(averageInflation)} a year), prices double roughly every ${doubling.toFixed(doubling < 10 ? 1 : 0)} years.`
          : 'Prices did not rise on average over this period, so they never double at this rate.'
      }
    >
      <div data-chart-container data-chart-title="Inflation milestones">
        <div className={`relative h-2 rounded-full mx-2 mb-6 mt-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          {milestones.map((m) => (
            <span
              key={`${m.year}-${m.priceMultiple}`}
              title={`${m.year}: prices ${roundMultiple(m.priceMultiple)}`}
              className={`absolute -top-1 h-4 w-4 -ml-2 rounded-full border-2 ${isDarkMode ? 'border-gray-800' : 'border-white'} ${m.priceMultiple >= 1 ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ left: `${((m.year - from) / span) * 100}%` }}
            />
          ))}
          <span className={`absolute -bottom-5 left-0 text-[10px] ${t.textMuted}`}>{from}</span>
          <span className={`absolute -bottom-5 right-0 text-[10px] ${t.textMuted}`}>{to}</span>
        </div>
        {milestones.length === 0 ? (
          <EmptyNote isDarkMode={isDarkMode}>
            Prices never doubled (or halved) between {from} and {to}.
          </EmptyNote>
        ) : (
          <ol className="grid gap-2 sm:grid-cols-2">
            {milestones.map((m) => (
              <li key={`${m.year}-${m.priceMultiple}`} className={`flex items-baseline gap-3 rounded-lg border px-3 py-2 ${t.inset}`}>
                <span className={`text-lg font-semibold tabular-nums ${t.text}`}>{m.year}</span>
                <span className={`text-sm ${t.textSec}`}>
                  {m.priceMultiple >= 1 ? (
                    <>
                      Prices <strong className="text-rose-500">{roundMultiple(m.priceMultiple)}</strong>: {amountLabel} buys {shareLabel(1 / m.priceMultiple)} as
                      much
                    </>
                  ) : (
                    <>
                      Prices fell to <strong className="text-emerald-500">{shareLabel(m.priceMultiple)}</strong>: {amountLabel} buys {roundMultiple(1 / m.priceMultiple)}{' '}
                      as much
                    </>
                  )}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Panel>
  );
}

export function YearTable({
  isDarkMode,
  rows,
  country,
  currencyYear,
  filename,
}: {
  isDarkMode: boolean;
  rows: YearRow[];
  country: string;
  currencyYear: number;
  filename: string;
}) {
  const t = theme(isDarkMode);
  const title = 'Year by year';
  if (!rows.length) return null;
  const base = rows[0].cpi;
  const money = (v: number) => formatCurrency(v, country, currencyYear);
  const csv = () =>
    rows.map((r) => ({
      year: r.year,
      country: countryName(country),
      price_index: +((r.cpi / base) * 100).toFixed(2),
      inflation_pct: r.inflation == null ? null : +r.inflation.toFixed(2),
      cost_of_same_goods: +r.equivalent.toFixed(2),
      cash_purchasing_power: +r.purchasingPower.toFixed(2),
      currency: getCurrencySymbol(country, currencyYear),
    }));
  return (
    <Panel isDarkMode={isDarkMode} title={title} subtitle={`Price index rebased to 100 in ${rows[0].year}, with the yearly change and both values from the chart.`}>
      <ChapterMeta isDarkMode={isDarkMode} sourceIds={['wb-cpi-index']} download={{ filename, title: `${title}: ${countryName(country)}`, getData: csv }} />
      <div className={`max-h-[420px] overflow-auto rounded-lg border ${t.border}`}>
        <table className="w-full text-sm tabular-nums">
          <thead className={`sticky top-0 text-[11px] uppercase tracking-wider ${isDarkMode ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
            <tr>
              <th className="px-3 py-2 text-left">Year</th>
              <th className="px-3 py-2 text-right">Price index</th>
              <th className="px-3 py-2 text-right">Inflation</th>
              <th className="px-3 py-2 text-right">Cost of the same goods</th>
              <th className="px-3 py-2 text-right">What the cash buys</th>
            </tr>
          </thead>
          <tbody className={t.text}>
            {rows.map((r) => (
              <tr key={r.year} className={`border-t ${t.border}`}>
                <td className="px-3 py-1.5 font-medium">{r.year}</td>
                <td className="px-3 py-1.5 text-right">{((r.cpi / base) * 100).toFixed(1)}</td>
                <td className={`px-3 py-1.5 text-right ${r.inflation == null ? t.textMuted : r.inflation < 0 ? 'text-emerald-500' : r.inflation > 10 ? 'text-rose-500' : ''}`}>
                  {r.inflation == null ? '\u2014' : pct(r.inflation)}
                </td>
                <td className="px-3 py-1.5 text-right">{money(r.equivalent)}</td>
                <td className="px-3 py-1.5 text-right">{money(r.purchasingPower)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function CompareResults({
  isDarkMode,
  rows,
  indexed,
  amount,
  from,
  to,
}: {
  isDarkMode: boolean;
  rows: CompareRow[];
  indexed: Array<{ year: number } & Record<string, number>>;
  amount: number;
  from: number;
  to: number;
}) {
  const t = theme(isDarkMode);
  const [scale, setScale] = useState<Scale>('auto');
  const ok = rows.filter((r) => r.result);
  const multiples = ok.map((r) => ({ country: r.country, m: 1 + r.result!.purchasingPowerChange / 100 }));
  const sorted = [...multiples].sort((a, b) => b.m - a.m);
  const maxIndex = Math.max(100, ...indexed.flatMap((r) => rows.map((c) => r[c.country] ?? 0)));
  const log = scale === 'log' || (scale === 'auto' && maxIndex > 2000);
  const chartTitle = 'Prices indexed to 100';

  return (
    <div className="space-y-6">
      <Panel
        isDarkMode={isDarkMode}
        title="Same amount, different countries"
        subtitle={`${amount.toLocaleString('en-US')} units of each local currency in ${from}, carried to ${to}. Each note is drawn at the size of what it still buys.`}
        note={
          sorted.length > 1
            ? `Prices rose most in ${countryName(sorted[0].country)} (${multipleLabel(sorted[0].m)}) and least in ${countryName(sorted[sorted.length - 1].country)} (${multipleLabel(sorted[sorted.length - 1].m)}).`
            : undefined
        }
      >
        <div data-chart-container data-chart-title="Inflation calculator comparison" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {rows.map(({ country, result }, i) => (
            <div key={country} className={`rounded-lg border p-4 flex flex-col gap-3 ${t.inset}`}>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: COMPARE_COLORS[i % COMPARE_COLORS.length] }} />
                <CountryFlag countryKey={country} className="w-5 h-3.5 rounded-sm" />
                <span className={`text-sm font-semibold ${t.text}`}>{countryName(country)}</span>
              </div>
              {result ? (
                <>
                  <div>
                    <div className={`text-xs ${t.textMuted}`}>
                      {formatCurrency(result.originalAmount, country, from)} in {from} is worth
                    </div>
                    <div className={`text-2xl font-bold tabular-nums ${t.text}`}>{formatCurrency(result.adjustedValue, country, to)}</div>
                    <div className={`text-xs ${t.textMuted}`}>in {to}</div>
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <div className={`text-xs space-y-0.5 ${t.textSec}`}>
                      <div>
                        {result.isDeflation ? 'Deflation' : 'Inflation'} <span className="font-semibold tabular-nums">{pct(Math.abs(result.averageInflation), 2)}</span> a year
                      </div>
                      <div>
                        Cash keeps <span className="font-semibold tabular-nums">{shareLabel(100 / (100 + result.purchasingPowerChange))}</span>
                      </div>
                    </div>
                    <Banknote
                      symbol={result.originalCurrency}
                      label={formatCurrency(result.originalAmount, country, from)}
                      scale={100 / (100 + result.purchasingPowerChange)}
                      width={96}
                      tint={COMPARE_COLORS[i % COMPARE_COLORS.length]}
                    />
                  </div>
                </>
              ) : (
                <p className={`text-sm ${t.textMuted}`}>
                  No CPI data for {from} or {to}.
                </p>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        isDarkMode={isDarkMode}
        title={chartTitle}
        subtitle={`Each country's price level with ${from} = 100. A line at 300 means prices tripled.`}
        actions={<Segmented isDarkMode={isDarkMode} label="Scale" options={SCALES} value={scale} onChange={setScale} />}
      >
        <ChapterMeta
          isDarkMode={isDarkMode}
          sourceIds={['wb-cpi-index']}
          download={{
            filename: `inflation-index-${from}-${to}`,
            title: chartTitle,
            getData: () =>
              indexed.map((r) => {
                const out: Record<string, unknown> = { year: r.year };
                for (const c of rows) out[countryName(c.country)] = r[c.country] == null ? null : +r[c.country].toFixed(2);
                return out;
              }),
          }}
        />
        {indexed.length < 2 ? (
          <EmptyNote isDarkMode={isDarkMode}>Not enough overlapping years to chart.</EmptyNote>
        ) : (
          <div data-chart-container data-chart-title={chartTitle} style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={indexed} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
                <XAxis dataKey="year" type="number" domain={['dataMin', 'dataMax']} stroke={t.axis} tick={{ fontSize: 11 }} />
                <YAxis
                  scale={log ? 'log' : 'linear'}
                  domain={log ? ['auto', 'auto'] : [0, 'auto']}
                  allowDataOverflow={log}
                  stroke={t.axis}
                  tick={{ fontSize: 11 }}
                  width={56}
                  tickFormatter={(v: number) => compact.format(v)}
                />
                <Tooltip contentStyle={t.tooltip} formatter={(v: number, name: string) => [v.toFixed(1), name]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine y={100} stroke={t.axis} strokeDasharray="4 4" />
                {rows.map((c, i) => (
                  <Line
                    key={c.country}
                    dataKey={c.country}
                    name={countryName(c.country)}
                    stroke={COMPARE_COLORS[i % COMPARE_COLORS.length]}
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>
    </div>
  );
}
