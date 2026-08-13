'use client';

// Trade demo: toggle 4 goods each for two toy countries. Live-computed
// list of "who exports what to whom". Illustrates comparative
// advantage in the simplest possible way.

import { useMemo, useState } from 'react';

interface Props { isDarkMode: boolean; }

interface Goods {
  chocolate: boolean;
  crisps:    boolean;
  cars:      boolean;
  coffee:    boolean;
}

const emptyGoods: Goods = { chocolate: false, crisps: false, cars: false, coffee: false };

const GOOD_LABELS: Record<keyof Goods, { label: string; emoji: string }> = {
  chocolate: { label: 'Chocolate', emoji: '🍫' },
  crisps:    { label: 'Crisps',    emoji: '🥔' },
  cars:      { label: 'Cars',      emoji: '🚗' },
  coffee:    { label: 'Coffee',    emoji: '☕' },
};

export default function TradeDemo({ isDarkMode }: Props) {
  const [a, setA] = useState<Goods>({ chocolate: true, crisps: false, cars: true, coffee: false });
  const [b, setB] = useState<Goods>({ chocolate: false, crisps: true, cars: false, coffee: true });

  const trades = useMemo(() => {
    const list: { from: string; to: string; good: string; emoji: string }[] = [];
    (Object.keys(GOOD_LABELS) as (keyof Goods)[]).forEach(k => {
      if (a[k] && !b[k]) list.push({ from: 'Country A', to: 'Country B', good: GOOD_LABELS[k].label, emoji: GOOD_LABELS[k].emoji });
      if (b[k] && !a[k]) list.push({ from: 'Country B', to: 'Country A', good: GOOD_LABELS[k].label, emoji: GOOD_LABELS[k].emoji });
    });
    return list;
  }, [a, b]);

  const bg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const btnCls = (on: boolean) =>
    `text-xs px-2 py-1 rounded border transition-colors ${
      on
        ? 'bg-blue-600 border-blue-500 text-white'
        : isDarkMode
          ? 'bg-gray-900 border-gray-700 text-gray-300 hover:text-white'
          : 'bg-white border-gray-200 text-gray-700 hover:text-gray-900'
    }`;

  const CountryBox = (props: { label: string; goods: Goods; onToggle: (k: keyof Goods) => void }) => (
    <div className={`rounded-md border p-3 ${cardBg}`}>
      <div className={`text-sm font-semibold mb-2 ${text}`}>{props.label}</div>
      <div className="flex flex-wrap gap-1">
        {(Object.keys(GOOD_LABELS) as (keyof Goods)[]).map(k => (
          <button
            key={k}
            type="button"
            onClick={() => props.onToggle(k)}
            aria-pressed={props.goods[k]}
            className={btnCls(props.goods[k])}
          >
            <span aria-hidden className="mr-1">{GOOD_LABELS[k].emoji}</span>{GOOD_LABELS[k].label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`rounded-md border p-4 ${bg} space-y-3`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CountryBox label="Country A" goods={a} onToggle={k => setA(s => ({ ...s, [k]: !s[k] }))} />
        <CountryBox label="Country B" goods={b} onToggle={k => setB(s => ({ ...s, [k]: !s[k] }))} />
      </div>

      <div className={`rounded-md border p-3 ${cardBg}`}>
        <div className={`text-[11px] uppercase tracking-wider font-semibold mb-2 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>
          Trades happening
        </div>
        {trades.length === 0 ? (
          <p className={`text-xs ${muted}`}>No trades yet — each country needs at least one good the other doesn&apos;t make. Toggle some goods above.</p>
        ) : (
          <ul className={`text-sm space-y-1 ${text}`}>
            {trades.map((t, i) => (
              <li key={i}>
                <span aria-hidden className="mr-1">{t.emoji}</span>
                <span className="font-semibold">{t.from}</span> exports {t.good} to <span className="font-semibold">{t.to}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className={`text-xs ${muted}`}>
        Notice that trade only happens where the two countries make different things. When each specialises in what it&apos;s best at, both end up with more variety.
      </p>
    </div>
  );
}
