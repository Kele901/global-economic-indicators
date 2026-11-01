'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import CountryFlag from './CountryFlag';
import {
  calculateInflation,
  euroAdoption,
  formatCurrency,
  getCountryDateRange,
  getCurrencyName,
  getCurrencySymbol,
  redenominationIn,
} from '../services/inflationCalculator';
import type { CountryData } from '../services/worldbank';
import { COUNTRY_KEYS, type CountryKey } from '../utils/countryMappings';
import {
  calcQuery,
  clampYears,
  compareCountries,
  DEFAULT_COMPARE,
  indexedSeries,
  MAX_COMPARE,
  parseCalcParams,
  reverseInflation,
  sharedRange,
  yearByYear,
  type CalcMode,
} from '../utils/inflation/calculator';
import { doublingYears } from '../utils/inflation/money';
import { Panel, Segmented, Stat, countryName, pct, theme } from './inflation/ui';
import { BanknotePanel, CompareResults, MilestonesPanel, ValueChart, YearTable, multipleLabel, shareLabel } from './inflation/CalculatorPanels';

interface InflationCalculatorProps {
  cpiData: CountryData[];
  isDarkMode: boolean;
}

const MODES: { id: CalcMode; label: string }[] = [
  { id: 'value', label: 'Value over time' },
  { id: 'compare', label: 'Compare countries' },
  { id: 'reverse', label: 'Reverse: what did it take?' },
];

// Stands in for "the latest year with data" until it is clamped to the range.
const LATEST = 9999;
const MAX_AMOUNT = 1e15;
const SHORTCUTS = [10, 25, 50];

const byName = (a: CountryKey, b: CountryKey) => countryName(a).localeCompare(countryName(b));

function initialState() {
  // Only rendered client-side once CPI data has loaded, so window is available.
  const p = typeof window === 'undefined' ? {} : parseCalcParams(new URLSearchParams(window.location.search));
  const list = p.countries ?? [];
  return {
    mode: p.mode ?? 'value',
    amount: String(p.amount ?? 100),
    from: p.from ?? 2000,
    to: p.to ?? LATEST,
    country: list[0] ?? ('USA' as CountryKey),
    compare: list.length > 1 ? list : [...new Set([...list, ...DEFAULT_COMPARE])].slice(0, MAX_COMPARE),
  };
}

function safely<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}

function Field({ label, hint, children, isDarkMode }: { label: string; hint?: ReactNode; children: ReactNode; isDarkMode: boolean }) {
  const t = theme(isDarkMode);
  return (
    <div className="min-w-0">
      <div className={`text-[11px] uppercase tracking-wider mb-1.5 ${t.textMuted}`}>{label}</div>
      {children}
      {hint && <div className={`text-[11px] mt-1 ${t.textMuted}`}>{hint}</div>}
    </div>
  );
}

function Notice({ isDarkMode, children }: { isDarkMode: boolean; children: ReactNode }) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${isDarkMode ? 'bg-blue-950/40 border-blue-800 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
      {children}
    </div>
  );
}

export default function InflationCalculator({ cpiData, isDarkMode }: InflationCalculatorProps) {
  const t = theme(isDarkMode);
  const [init] = useState(initialState);
  const [mode, setModeState] = useState<CalcMode>(init.mode);
  const [amountText, setAmountText] = useState(init.amount);
  const [fromRaw, setFrom] = useState(init.from);
  const [toRaw, setTo] = useState(init.to);
  const [country, setCountry] = useState<CountryKey>(init.country);
  const [compare, setCompare] = useState<CountryKey[]>(init.compare);

  const available = useMemo(() => COUNTRY_KEYS.filter((k) => getCountryDateRange(cpiData, k)).sort(byName), [cpiData]);
  const active = available.includes(country) || !available.length ? country : available[0];
  const compareKey = compare.filter((k) => available.includes(k)).join(',');
  const activeCompare = useMemo(() => (compareKey ? (compareKey.split(',') as CountryKey[]) : []), [compareKey]);

  const range = useMemo(
    () => (mode === 'compare' ? sharedRange(cpiData, activeCompare) : getCountryDateRange(cpiData, active)),
    [mode, cpiData, activeCompare, active],
  );
  const { from, to } = clampYears(fromRaw, toRaw, range);
  const amount = Number(amountText);
  const amountOk = amountText.trim() !== '' && Number.isFinite(amount) && amount > 0 && amount <= MAX_AMOUNT;

  useEffect(() => {
    if (!amountOk || !range) return;
    const q = calcQuery({ mode, amount, from, to, countries: mode === 'compare' ? activeCompare : [active] });
    window.history.replaceState(null, '', `${window.location.pathname}?${q}`);
  }, [mode, amount, amountOk, range, from, to, activeCompare, active]);

  const setMode = (m: CalcMode) => {
    if (m === 'compare' && !compare.includes(active)) setCompare([active, ...compare].slice(0, MAX_COMPARE));
    if (mode === 'compare' && m !== 'compare' && activeCompare.length) setCountry(activeCompare[0]);
    setModeState(m);
  };

  const ready = amountOk && !!range;
  const value = useMemo(
    () => (ready && mode === 'value' ? safely(() => calculateInflation(amount, from, to, active, cpiData)) : null),
    [ready, mode, amount, from, to, active, cpiData],
  );
  const reverse = useMemo(
    () => (ready && mode === 'reverse' ? safely(() => reverseInflation(amount, from, to, active, cpiData)) : null),
    [ready, mode, amount, from, to, active, cpiData],
  );
  // Downstream panels work in end-of-period currency (euros after adoption), start-year prices.
  const baseAmount = value ? (value.amountInEuros ?? value.originalAmount) : reverse ? reverse.pastAmount / (reverse.conversionRate ?? 1) : null;
  const rows = useMemo(
    () => (baseAmount != null ? yearByYear(baseAmount, from, to, active, cpiData) : []),
    [baseAmount, from, to, active, cpiData],
  );
  const compared = useMemo(
    () => (ready && mode === 'compare' ? compareCountries(amount, from, to, activeCompare, cpiData) : []),
    [ready, mode, amount, from, to, activeCompare, cpiData],
  );
  const indexed = useMemo(() => (ready && mode === 'compare' ? indexedSeries(cpiData, activeCompare, from, to) : []), [ready, mode, cpiData, activeCompare, from, to]);

  const fromOptions = range ? Array.from({ length: range.endYear - range.startYear }, (_, i) => range.startYear + i) : [];
  const toOptions = range ? Array.from({ length: range.endYear - from }, (_, i) => from + 1 + i) : [];
  const amountYear = mode === 'reverse' ? to : from;
  const symbol = mode === 'compare' ? null : getCurrencySymbol(active, amountYear);
  const redenom = mode === 'compare' ? null : redenominationIn(active, from, to);
  const adoption = mode === 'compare' ? null : euroAdoption(active);
  const crossesEuro = !!adoption && from < adoption.year && to >= adoption.year;

  const error = !amountOk
    ? `Enter an amount greater than zero${amount > MAX_AMOUNT ? ' and below one quadrillion' : ''}.`
    : !range
      ? mode === 'compare'
        ? activeCompare.length
          ? 'These countries\u2019 price data do not overlap. Remove one to continue.'
          : 'Add at least one country to compare.'
        : `No price data for ${countryName(active)}.`
      : (mode === 'value' && !value) || (mode === 'reverse' && !reverse)
        ? `Price data for ${countryName(active)} is missing in ${from} or ${to}. Try a different year.`
        : null;

  const select = `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${t.input}`;
  const chip = `px-2.5 py-1 text-xs rounded-md border transition-colors ${t.chip}`;
  const reverseRate = reverse ? (reverse.priceMultiple ** (1 / (to - from)) - 1) * 100 : 0;
  const averageRate = value?.averageInflation ?? reverseRate;
  const doubling = doublingYears(averageRate);
  const startLabel = formatCurrency(mode === 'reverse' && reverse ? reverse.pastAmount : amount, active, from);

  return (
    <div className="space-y-6">
      <Panel
        isDarkMode={isDarkMode}
        title="Calculator"
        subtitle="Results update as you type. The address bar keeps your inputs, so you can bookmark or share them."
        actions={<Segmented isDarkMode={isDarkMode} label="Calculator mode" options={MODES} value={mode} onChange={setMode} />}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mode === 'compare' ? (
            <div className="sm:col-span-2 lg:col-span-4">
              <Field isDarkMode={isDarkMode} label={`Countries (up to ${MAX_COMPARE})`} hint={range ? `Years limited to ${range.startYear}\u2013${range.endYear}, the span every selected country covers.` : undefined}>
                <div className="flex flex-wrap items-center gap-2">
                  {activeCompare.map((k) => (
                    <span key={k} className={`inline-flex items-center gap-1.5 rounded-full border pl-2 pr-1 py-1 text-xs ${t.chip}`}>
                      <CountryFlag countryKey={k} className="w-4 h-3 rounded-sm" />
                      {countryName(k)}
                      <button
                        type="button"
                        aria-label={`Remove ${countryName(k)}`}
                        disabled={activeCompare.length <= 1}
                        onClick={() => setCompare(activeCompare.filter((c) => c !== k))}
                        className="ml-0.5 rounded-full px-1.5 leading-none hover:text-rose-500 disabled:opacity-30"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  {activeCompare.length < MAX_COMPARE && (
                    <select
                      aria-label="Add a country"
                      value=""
                      onChange={(e) => e.target.value && setCompare([...activeCompare, e.target.value as CountryKey])}
                      className={`rounded-full border px-3 py-1 text-xs ${t.input}`}
                    >
                      <option value="">+ Add country</option>
                      {available
                        .filter((k) => !activeCompare.includes(k))
                        .map((k) => (
                          <option key={k} value={k}>
                            {countryName(k)}
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              </Field>
            </div>
          ) : (
            <Field isDarkMode={isDarkMode} label="Country" hint={range ? `Data ${range.startYear}\u2013${range.endYear}` : undefined}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <CountryFlag countryKey={active} className="w-5 h-3.5 rounded-sm" />
                </span>
                <select aria-label="Country" value={active} onChange={(e) => setCountry(e.target.value as CountryKey)} className={`${select} pl-10`}>
                  {available.map((k) => (
                    <option key={k} value={k}>
                      {countryName(k)}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
          )}

          <Field
            isDarkMode={isDarkMode}
            label={mode === 'reverse' ? `Amount in ${to}` : `Amount in ${from}`}
            hint={mode === 'compare' ? 'In each country\u2019s own currency' : getCurrencyName(active, amountYear)}
          >
            <div className="relative">
              {symbol && <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none ${t.textSec}`}>{symbol}</span>}
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={amountText}
                onChange={(e) => setAmountText(e.target.value)}
                aria-label="Amount"
                aria-invalid={!amountOk}
                className={`${select} tabular-nums`}
                style={symbol ? { paddingLeft: `${Math.max(symbol.length, 1) * 0.6 + 1.25}rem` } : undefined}
              />
            </div>
          </Field>

          <Field isDarkMode={isDarkMode} label={mode === 'reverse' ? 'Back in' : 'From'}>
            <select aria-label="From year" value={from} onChange={(e) => setFrom(Number(e.target.value))} className={select} disabled={!range}>
              {fromOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </Field>

          <Field isDarkMode={isDarkMode} label={mode === 'reverse' ? 'Compared with' : 'To'}>
            <select aria-label="To year" value={to} onChange={(e) => setTo(Number(e.target.value))} className={select} disabled={!range}>
              {toOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={`text-xs ${t.textMuted}`}>Shortcuts:</span>
          {range &&
            SHORTCUTS.filter((n) => range.endYear - n >= range.startYear).map((n) => (
              <button
                key={n}
                type="button"
                className={chip}
                onClick={() => {
                  setFrom(range.endYear - n);
                  setTo(LATEST);
                }}
              >
                {n} years ago
              </button>
            ))}
          {range && (
            <button
              type="button"
              className={chip}
              onClick={() => {
                setFrom(range.startYear);
                setTo(LATEST);
              }}
            >
              Earliest ({range.startYear})
            </button>
          )}
        </div>

        {error && (
          <p role="alert" className={`mt-4 rounded-lg border px-4 py-3 text-sm ${isDarkMode ? 'bg-rose-950/40 border-rose-800 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
            {error}
          </p>
        )}
      </Panel>

      {!error && mode !== 'compare' && (crossesEuro || redenom) && (
        <div className="space-y-2">
          {crossesEuro && adoption && (
            <Notice isDarkMode={isDarkMode}>
              {countryName(active)} switched from the {adoption.oldName} to the euro in {adoption.year}, at a fixed {adoption.euroConversionRate.toLocaleString('en-US', { maximumFractionDigits: 6 })}{' '}
              {adoption.oldCurrency} per euro.{' '}
              {mode === 'value'
                ? 'Your amount is converted at that rate, then adjusted for inflation; later values are in euros.'
                : `The ${from} amount is shown in ${adoption.oldName}s; the chart and table use euros throughout.`}
            </Notice>
          )}
          {redenom && (
            <Notice isDarkMode={isDarkMode}>
              {countryName(active)} removed zeros from its currency in {redenom.year} ({redenom.factor.toLocaleString('en-US')} {redenom.oldName} became 1 new unit). The
              price index runs straight through the change, so amounts from before {redenom.year} are in today&rsquo;s units: divide an old-note amount by{' '}
              {redenom.factor.toLocaleString('en-US')} before entering it.
            </Notice>
          )}
        </div>
      )}

      {!error && mode === 'value' && value && (
        <Panel isDarkMode={isDarkMode} title={`Your result: ${countryName(active)}, ${from}\u2013${to}`} subtitle={`Based on ${countryName(active)}\u2019s consumer price index.`}>
          <div className={`rounded-xl border p-5 mb-4 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-blue-950/40 border-gray-700' : 'bg-gradient-to-br from-blue-50 to-white border-blue-100'}`}>
            <p className={`text-sm ${t.textSec}`}>What cost</p>
            <p className={`text-3xl sm:text-4xl font-bold tabular-nums ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>{formatCurrency(value.originalAmount, active, from)}</p>
            <p className={`text-sm ${t.textSec}`}>in {from} would cost</p>
            <p className={`text-3xl sm:text-4xl font-bold tabular-nums ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>{formatCurrency(value.adjustedValue, active, to)}</p>
            <p className={`text-sm ${t.textSec}`}>in {to}.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat
              isDarkMode={isDarkMode}
              label={`Average annual ${value.isDeflation ? 'deflation' : 'inflation'}`}
              value={pct(Math.abs(value.averageInflation), 2)}
              tone={value.isDeflation ? 'text-emerald-500' : 'text-amber-500'}
            />
            <Stat isDarkMode={isDarkMode} label="Prices multiplied" value={multipleLabel(1 + value.purchasingPowerChange / 100)} sub={`cumulative ${value.purchasingPowerChange > 0 ? '+' : ''}${value.purchasingPowerChange.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`} tone="text-rose-500" />
            <Stat isDarkMode={isDarkMode} label="Cash keeps" value={shareLabel(100 / (100 + value.purchasingPowerChange))} sub={`of its ${from} buying power`} tone="text-blue-500" />
            <Stat
              isDarkMode={isDarkMode}
              label="Prices double every"
              value={doubling != null ? `${doubling.toFixed(1)} yrs` : '\u2014'}
              sub="at this average rate"
            />
          </div>
        </Panel>
      )}

      {!error && mode === 'reverse' && reverse && (
        <Panel isDarkMode={isDarkMode} title={`Reverse result: ${countryName(active)}, ${from}\u2013${to}`} subtitle={`Based on ${countryName(active)}\u2019s consumer price index.`}>
          <div className={`rounded-xl border p-5 mb-4 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-blue-950/40 border-gray-700' : 'bg-gradient-to-br from-blue-50 to-white border-blue-100'}`}>
            <p className={`text-sm ${t.textSec}`}>To buy what</p>
            <p className={`text-3xl sm:text-4xl font-bold tabular-nums ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>{formatCurrency(reverse.amountToday, active, to)}</p>
            <p className={`text-sm ${t.textSec}`}>buys in {to}, you would have needed</p>
            <p className={`text-3xl sm:text-4xl font-bold tabular-nums ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>{formatCurrency(reverse.pastAmount, active, from)}</p>
            <p className={`text-sm ${t.textSec}`}>in {from}.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Stat isDarkMode={isDarkMode} label="Prices multiplied" value={multipleLabel(reverse.priceMultiple)} tone="text-rose-500" />
            <Stat
              isDarkMode={isDarkMode}
              label="Average annual inflation"
              value={pct(reverseRate, 2)}
              tone="text-amber-500"
            />
            <Stat isDarkMode={isDarkMode} label={`${from} money in ${to}`} value={shareLabel(1 / reverse.priceMultiple)} sub="of its buying power remains" tone="text-blue-500" />
          </div>
        </Panel>
      )}

      {!error && mode !== 'compare' && rows.length > 1 && (
        <>
          <BanknotePanel isDarkMode={isDarkMode} rows={rows} country={active} amountLabel={startLabel} />
          <ValueChart
            isDarkMode={isDarkMode}
            rows={rows}
            country={active}
            currencyYear={to}
            note={crossesEuro ? 'All values in euros, converting earlier amounts at the fixed adoption rate.' : undefined}
          />
          <MilestonesPanel isDarkMode={isDarkMode} rows={rows} amountLabel={startLabel} averageInflation={averageRate} />
          <YearTable isDarkMode={isDarkMode} rows={rows} country={active} currencyYear={to} filename={`inflation-${active.toLowerCase()}-${from}-${to}`} />
        </>
      )}

      {!error && mode === 'compare' && <CompareResults isDarkMode={isDarkMode} rows={compared} indexed={indexed} amount={amount} from={from} to={to} />}
    </div>
  );
}
