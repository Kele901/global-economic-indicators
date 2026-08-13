'use client';

// Currency demo: toy FX converter with 4 hardcoded reference rates
// and a "what if the pound halves" toggle to illustrate how a weaker
// currency changes what things cost.

import { useMemo, useState } from 'react';

interface Props { isDarkMode: boolean; }

// Illustrative rates only (not live). Base = 1 GBP.
const BASE_RATES: Record<string, { name: string; flag: string; rate: number }> = {
  USD: { name: 'US dollar',    flag: '🇺🇸', rate: 1.28 },
  EUR: { name: 'Euro',         flag: '🇪🇺', rate: 1.17 },
  JPY: { name: 'Japanese yen', flag: '🇯🇵', rate: 195 },
  NGN: { name: 'Nigerian naira', flag: '🇳🇬', rate: 2050 },
};

export default function CurrencyDemo({ isDarkMode }: Props) {
  const [pounds, setPounds] = useState(100);
  const [weakPound, setWeakPound] = useState(false);
  const factor = weakPound ? 0.5 : 1;

  const rows = useMemo(() => (
    Object.entries(BASE_RATES).map(([code, meta]) => ({
      code,
      name: meta.name,
      flag: meta.flag,
      amount: pounds * meta.rate * factor,
    }))
  ), [pounds, factor]);

  const bg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`rounded-md border p-4 ${bg} space-y-3`}>
      <label className="block">
        <div className={`flex justify-between text-xs mb-1 ${muted}`}>
          <span>You&apos;re starting with</span>
          <span className={`font-semibold ${text}`}>£{pounds}</span>
        </div>
        <input
          type="range" min={10} max={500} step={10} value={pounds}
          onChange={e => setPounds(Number(e.target.value))}
          aria-label="Amount in pounds"
          className="w-full"
        />
      </label>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setWeakPound(v => !v)}
          aria-pressed={weakPound}
          className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
            weakPound
              ? 'bg-rose-600 border-rose-500 text-white'
              : isDarkMode
                ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white'
                : 'bg-white border-gray-200 text-gray-700 hover:text-gray-900'
          }`}
        >
          {weakPound ? 'Pound is HALF as strong' : 'What if the pound halves?'}
        </button>
        <span className={`text-[11px] ${muted}`}>{weakPound ? 'Every conversion buys half as much abroad.' : 'Toggle to weaken the pound.'}</span>
      </div>

      <div className={`rounded-md border p-3 ${cardBg}`}>
        <div className={`text-[11px] uppercase tracking-wider font-semibold mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>You could exchange for</div>
        <ul className={`text-sm space-y-1 ${text}`}>
          {rows.map(r => (
            <li key={r.code} className="flex justify-between">
              <span><span aria-hidden className="mr-1">{r.flag}</span>{r.name} ({r.code})</span>
              <span className="tabular-nums">{formatMoney(r.amount, r.code)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function formatMoney(v: number, code: string): string {
  if (code === 'JPY' || code === 'NGN') return `${code === 'JPY' ? '¥' : '₦'}${Math.round(v).toLocaleString()}`;
  if (code === 'EUR') return `€${v.toFixed(2)}`;
  return `$${v.toFixed(2)}`;
}
