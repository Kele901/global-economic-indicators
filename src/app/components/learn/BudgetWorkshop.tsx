'use client';

// Workshop: balance the budget.
//
// A stylised medium-sized advanced economy. The reader moves spending and
// tax levers and watches the deficit, the debt path and a crude political
// cost respond. Two things it is built to teach:
//
//   1. The arithmetic is brutal. Everything politically easy to cut is
//      small, and everything large is politically impossible.
//   2. Austerity partly pays for itself in reverse — cutting spending
//      shrinks GDP, which pushes the debt *ratio* back up, so a 10%
//      cut never delivers 10% of improvement.
//
// Figures are illustrative percentages of GDP, in the right ballpark for
// a country like the UK or France, not any specific country.

import { useMemo, useState } from 'react';

interface Props { isDarkMode: boolean; }

interface Lever {
  id: string;
  label: string;
  // Baseline size as % of GDP.
  base: number;
  kind: 'spend' | 'tax';
  // How unpopular a 10% move is, 1 (easy) to 5 (career-ending).
  pain: number;
  note: string;
  // Multiplier on GDP for each point of GDP cut or raised. Spending cuts
  // to investment hurt output more than cuts to transfers.
  multiplier: number;
}

const LEVERS: Lever[] = [
  { id: 'pensions', label: 'Pensions & old-age benefits', base: 11.0, kind: 'spend', pain: 5, multiplier: 0.6, note: 'The largest single line, and the one with the most reliable voters attached.' },
  { id: 'health',   label: 'Health',                      base:  8.0, kind: 'spend', pain: 5, multiplier: 0.7, note: 'Grows faster than GDP almost everywhere as populations age.' },
  { id: 'education',label: 'Education',                   base:  5.0, kind: 'spend', pain: 4, multiplier: 0.9, note: 'Cheap to cut today, expensive in twenty years.' },
  { id: 'defense',  label: 'Defense',                      base:  2.2, kind: 'spend', pain: 3, multiplier: 0.5, note: 'Small relative to the deficit, however loudly it is argued about.' },
  { id: 'invest',   label: 'Infrastructure investment',    base:  3.0, kind: 'spend', pain: 2, multiplier: 1.2, note: 'The easiest thing to delay and the most damaging to delay.' },
  { id: 'admin',    label: 'Everything else (admin, aid)', base:  4.8, kind: 'spend', pain: 2, multiplier: 0.6, note: 'Where "efficiency savings" are always promised and rarely found.' },
  { id: 'income',   label: 'Income tax',                   base: 15.0, kind: 'tax',   pain: 4, multiplier: 0.7, note: 'Broad and progressive; raising it is visible in every payslip.' },
  { id: 'vat',      label: 'Sales tax / VAT',              base:  9.0, kind: 'tax',   pain: 3, multiplier: 0.8, note: 'Easy to collect, but falls hardest on low incomes.' },
  { id: 'corp',     label: 'Corporate tax',                base:  3.5, kind: 'tax',   pain: 2, multiplier: 0.4, note: 'Popular to raise, but the base moves between countries.' },
  { id: 'other',    label: 'Other taxes (fuel, property)', base:  5.5, kind: 'tax',   pain: 3, multiplier: 0.5, note: 'Includes the levies people notice most per unit raised.' },
];

const DEBT_START = 95;      // % of GDP
const INTEREST_RATE = 3.5;  // average rate paid on the stock, %
const TREND_GROWTH = 1.6;   // real growth before any policy effect, %

// Baseline arithmetic, computed rather than quoted so the intro line can
// never drift away from the levers above it.
const BASE_SPEND = LEVERS.filter(l => l.kind === 'spend').reduce((s, l) => s + l.base, 0);
const BASE_TAX = LEVERS.filter(l => l.kind === 'tax').reduce((s, l) => s + l.base, 0);
const BASE_INTEREST = DEBT_START * (INTEREST_RATE / 100);
const BASE_BALANCE = BASE_TAX - BASE_SPEND - BASE_INTEREST;

export default function BudgetWorkshop({ isDarkMode }: Props) {
  // Percentage change applied to each lever, -30 to +30.
  const [moves, setMoves] = useState<Record<string, number>>({});

  const bg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const panel = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';

  const result = useMemo(() => {
    let spend = 0;
    let tax = 0;
    let gdpDrag = 0;
    let pain = 0;

    LEVERS.forEach(l => {
      const pct = moves[l.id] ?? 0;
      const delta = l.base * (pct / 100);
      if (l.kind === 'spend') {
        spend += l.base + delta;
        // Cutting spending (negative delta) subtracts demand.
        gdpDrag += delta * l.multiplier;
      } else {
        tax += l.base + delta;
        // Raising tax (positive delta) subtracts demand.
        gdpDrag -= delta * l.multiplier;
      }
      pain += (Math.abs(pct) / 10) * l.pain * (l.kind === 'spend' ? (pct < 0 ? 1 : 0.3) : (pct > 0 ? 1 : 0.3));
    });

    const interestBill = DEBT_START * (INTEREST_RATE / 100);
    const primaryBalance = tax - spend;
    const overallBalance = primaryBalance - interestBill;

    // Policy pushes growth around; the drag is expressed directly in
    // percentage points of GDP growth for the first year.
    const growth = TREND_GROWTH + gdpDrag;

    // Standard debt-dynamics identity: the ratio falls when nominal growth
    // exceeds the effective interest rate, and when the primary balance is
    // in surplus. Inflation is held at 2% throughout.
    const nominalGrowth = growth + 2.0;
    const snowball = DEBT_START * ((INTEREST_RATE - nominalGrowth) / 100);
    const debtChange = snowball - primaryBalance;

    // Five-year path, holding the policy setting constant.
    const path: number[] = [DEBT_START];
    let debt = DEBT_START;
    for (let y = 1; y <= 5; y++) {
      const yearSnowball = debt * ((INTEREST_RATE - nominalGrowth) / 100);
      debt = debt + yearSnowball - primaryBalance;
      path.push(debt);
    }

    return {
      spend, tax, primaryBalance, overallBalance, interestBill,
      growth, debtChange, path, pain,
    };
  }, [moves]);

  const setMove = (id: string, value: number) => setMoves(prev => ({ ...prev, [id]: value }));
  const reset = () => setMoves({});

  const balanced = Math.abs(result.overallBalance) < 0.5;
  const painLabel = result.pain < 2 ? 'Barely noticed'
    : result.pain < 5 ? 'Manageable row'
    : result.pain < 9 ? 'Serious backlash'
    : result.pain < 14 ? 'Street protests'
    : 'Government falls';

  const maxDebt = Math.max(...result.path, DEBT_START);
  const minDebt = Math.min(...result.path, DEBT_START);

  return (
    <div className={`rounded-md border p-4 ${bg}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <p className={`text-xs max-w-md ${muted}`}>
          You inherit a deficit of {Math.abs(BASE_BALANCE).toFixed(1)}% of GDP and debt at {DEBT_START}% of GDP.
          Move the levers by a percentage of each line. Watch the deficit, the five-year debt path and
          how much political capital you just spent.
        </p>
        <button
          onClick={reset}
          className={`text-[11px] px-2.5 py-1 rounded-md border ${
            isDarkMode ? 'border-gray-600 text-gray-300 hover:text-white' : 'border-gray-300 text-gray-600 hover:text-gray-900'
          }`}
        >
          Reset to baseline
        </button>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className={`rounded-md border p-2.5 ${panel}`}>
          <div className={`text-[10px] uppercase tracking-wider ${muted}`}>Overall balance</div>
          <div className={`text-lg font-bold tabular-nums ${result.overallBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {result.overallBalance >= 0 ? '+' : ''}{result.overallBalance.toFixed(1)}%
          </div>
          <div className={`text-[10px] ${muted}`}>of GDP {balanced ? '· balanced' : ''}</div>
        </div>
        <div className={`rounded-md border p-2.5 ${panel}`}>
          <div className={`text-[10px] uppercase tracking-wider ${muted}`}>Growth</div>
          <div className={`text-lg font-bold tabular-nums ${result.growth >= 1 ? 'text-emerald-500' : result.growth >= 0 ? 'text-amber-500' : 'text-red-500'}`}>
            {result.growth >= 0 ? '+' : ''}{result.growth.toFixed(1)}%
          </div>
          <div className={`text-[10px] ${muted}`}>real, first year</div>
        </div>
        <div className={`rounded-md border p-2.5 ${panel}`}>
          <div className={`text-[10px] uppercase tracking-wider ${muted}`}>Debt in 5 years</div>
          <div className={`text-lg font-bold tabular-nums ${result.path[5]! <= DEBT_START ? 'text-emerald-500' : 'text-red-500'}`}>
            {result.path[5]!.toFixed(0)}%
          </div>
          <div className={`text-[10px] ${muted}`}>from {DEBT_START}%</div>
        </div>
        <div className={`rounded-md border p-2.5 ${panel}`}>
          <div className={`text-[10px] uppercase tracking-wider ${muted}`}>Political cost</div>
          <div className={`text-lg font-bold ${result.pain < 5 ? 'text-emerald-500' : result.pain < 9 ? 'text-amber-500' : 'text-red-500'}`}>
            {painLabel}
          </div>
          <div className={`text-[10px] ${muted}`}>rough, and rough is the point</div>
        </div>
      </div>

      {/* Debt path */}
      <div className={`rounded-md border p-3 mb-4 ${panel}`}>
        <div className={`text-[10px] uppercase tracking-wider mb-2 ${muted}`}>Debt path, % of GDP</div>
        <div className="flex items-end gap-1.5 h-24">
          {result.path.map((d, i) => {
            const span = Math.max(maxDebt - minDebt, 10);
            const h = 18 + ((d - minDebt) / span) * 80;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                <span className={`text-[9px] tabular-nums ${muted}`}>{d.toFixed(0)}</span>
                <div
                  className={`w-full rounded-t ${d <= DEBT_START ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ height: `${h}%` }}
                />
                <span className={`text-[9px] ${muted}`}>{i === 0 ? 'now' : `+${i}y`}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Levers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-5 gap-y-3">
        {(['spend', 'tax'] as const).map(kind => (
          <div key={kind} className="space-y-3">
            <div className={`text-[11px] uppercase tracking-wider font-semibold ${muted}`}>
              {kind === 'spend' ? `Spending · ${result.spend.toFixed(1)}% of GDP` : `Taxes · ${result.tax.toFixed(1)}% of GDP`}
            </div>
            {LEVERS.filter(l => l.kind === kind).map(l => {
              const pct = moves[l.id] ?? 0;
              const newLevel = l.base * (1 + pct / 100);
              return (
                <label key={l.id} className="block">
                  <div className="flex justify-between items-baseline text-xs gap-2">
                    <span className={`truncate ${text}`}>{l.label}</span>
                    <span className={`tabular-nums shrink-0 ${pct === 0 ? muted : pct > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {pct > 0 ? '+' : ''}{pct}% → {newLevel.toFixed(1)}% of GDP
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-30}
                    max={30}
                    step={5}
                    value={pct}
                    onChange={e => setMove(l.id, Number(e.target.value))}
                    aria-label={`${l.label}, percentage change`}
                    className="w-full"
                  />
                  <span className={`text-[10px] ${muted}`}>{l.note}</span>
                </label>
              );
            })}
          </div>
        ))}
      </div>

      <div className={`mt-4 rounded-md border p-3 text-xs ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-amber-50 border-amber-100 text-gray-700'}`}>
        <div>
          Interest on existing debt costs {result.interestBill.toFixed(1)}% of GDP before you spend a
          penny on anything. Your primary balance — the bit you actually control — is{' '}
          <span className="font-semibold">{result.primaryBalance >= 0 ? '+' : ''}{result.primaryBalance.toFixed(1)}%</span>.
        </div>
        {result.growth < 0.5 && (
          <div className="mt-1.5">
            Notice what just happened: you cut enough to improve the deficit, but growth fell, and a
            smaller economy means the debt <em>ratio</em> improves less than the cash saving suggests.
            This is the trap austerity programmes keep walking into.
          </div>
        )}
      </div>

      <p className={`text-xs mt-3 ${muted}`}>
        Illustrative figures for a mid-sized advanced economy, not a forecast for any real country.
        The multipliers, the political-cost scores and the 3.5% interest rate are simplifications;
        the arithmetic of a deficit, an interest bill and a debt ratio is not.
      </p>
    </div>
  );
}
