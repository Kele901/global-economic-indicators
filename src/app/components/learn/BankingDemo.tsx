'use client';

// Banking demo: money multiplier. A £100 deposit is lent out minus the
// reserve, the loan gets re-deposited, and the cycle repeats. Shows
// the first few rounds as bars plus the theoretical total (1/r).
// Deliberately not compound interest — InterestDemo already covers it.

import { useMemo, useState } from 'react';

interface Props { isDarkMode: boolean; }

export default function BankingDemo({ isDarkMode }: Props) {
  const [reserve, setReserve] = useState(10);

  const rounds = useMemo(() => {
    const keep = reserve / 100;
    const out: { round: number; deposit: number; held: number; lent: number }[] = [];
    let deposit = 100;
    for (let r = 1; r <= 6; r++) {
      const held = deposit * keep;
      const lent = deposit - held;
      out.push({ round: r, deposit, held, lent });
      deposit = lent;
    }
    return out;
  }, [reserve]);

  const theoreticalTotal = 100 / (reserve / 100);
  const shownTotal = rounds.reduce((sum, r) => sum + r.deposit, 0);

  const bg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const barBg = isDarkMode ? '#1f2937' : '#eef2ff';

  return (
    <div className={`rounded-md border p-4 ${bg}`}>
      <label className="block">
        <div className={`flex justify-between text-xs mb-1 ${muted}`}>
          <span>Reserve ratio (share the bank must keep)</span>
          <span className={`font-semibold ${text}`}>{reserve}%</span>
        </div>
        <input
          type="range"
          min={2}
          max={50}
          step={1}
          value={reserve}
          onChange={e => setReserve(Number(e.target.value))}
          aria-label="Reserve ratio percent"
          className="w-full"
        />
      </label>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className={`rounded-md p-3 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
          <div className={`text-[11px] uppercase tracking-wider ${muted}`}>You deposit</div>
          <div className={`text-xl font-bold tabular-nums ${text}`}>£100</div>
        </div>
        <div className={`rounded-md p-3 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className={`text-[11px] uppercase tracking-wider ${muted}`}>Deposits created in total</div>
          <div className="text-xl font-bold tabular-nums text-emerald-500">£{theoreticalTotal.toFixed(0)}</div>
        </div>
      </div>

      <div className="mt-4 space-y-1" aria-label="Money multiplier rounds">
        {rounds.map(r => {
          const pct = Math.max(4, (r.deposit / 100) * 100);
          return (
            <div key={r.round} className="flex items-center gap-2">
              <span className={`text-[10px] w-14 tabular-nums ${muted}`}>Round {r.round}</span>
              <div className="flex-1 h-3 rounded-full overflow-hidden flex" style={{ backgroundColor: barBg }}>
                <div className="h-full flex" style={{ width: `${pct}%` }}>
                  <div className="h-full bg-amber-500" style={{ width: `${reserve}%` }} />
                  <div className="h-full bg-emerald-500" style={{ width: `${100 - reserve}%` }} />
                </div>
              </div>
              <span className={`text-[10px] w-16 text-right tabular-nums ${text}`}>£{r.deposit.toFixed(0)}</span>
            </div>
          );
        })}
      </div>

      <div className={`mt-3 flex flex-wrap gap-3 text-[11px] ${muted}`}>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-500" aria-hidden />
          Kept as reserve
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500" aria-hidden />
          Lent out, becomes the next deposit
        </span>
      </div>

      <p className={`text-xs mt-3 ${muted}`}>
        The first six rounds alone create £{shownTotal.toFixed(0)} of deposits from your single £100. Keep going and the total settles at{' '}
        <span className={`font-semibold ${text}`}>£{theoreticalTotal.toFixed(0)}</span> — that is the{' '}
        <span className={`font-semibold ${text}`}>money multiplier</span>. A higher reserve ratio makes banks lend less, so less money ripples through the system.
      </p>
    </div>
  );
}
