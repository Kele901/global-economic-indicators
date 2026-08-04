'use client';

// Where the world's critical inputs come from. Shows top-3 producer
// countries and their combined share for 15 strategic categories
// (rare earths, lithium, cobalt, semiconductors, solar PV, etc.).
// The bar shows the combined top-3 concentration — anything above
// ~75% signals a real single-point-of-failure risk.

import { useMemo, useState } from 'react';
import { SUPPLY_CHAIN_CONCENTRATION, MARITIME_CHOKEPOINTS } from '../services/tradeCurated';

interface Props {
  isDarkMode: boolean;
}

type Category = 'all' | 'critical mineral' | 'energy' | 'semiconductor' | 'pharma' | 'agri';

const CATEGORY_LABELS: Record<Category, string> = {
  all:                 'All categories',
  'critical mineral':  'Critical minerals',
  energy:              'Energy',
  semiconductor:       'Semiconductors',
  pharma:              'Pharma',
  agri:                'Agriculture',
};

export default function SupplyChainConcentrationTable({ isDarkMode }: Props) {
  const [cat, setCat] = useState<Category>('all');

  const rows = useMemo(() => {
    const filtered = cat === 'all' ? SUPPLY_CHAIN_CONCENTRATION : SUPPLY_CHAIN_CONCENTRATION.filter(r => r.category === cat);
    return filtered
      .map(r => ({ ...r, combined: r.top1SharePct + r.top2SharePct + r.top3SharePct }))
      .sort((a, b) => b.combined - a.combined);
  }, [cat]);

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';
  const rowHover = isDarkMode ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50';
  const headerText = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`rounded-lg border ${cardBg}`}>
      <div className="p-4 sm:p-6 border-b border-inherit">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>Supply-chain concentration</div>
            <p className={`text-sm ${textSec}`}>Top-3 producer countries for 15 strategic inputs. Bars &gt;90% flag single-point-of-failure risk.</p>
          </div>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by category">
            {(Object.keys(CATEGORY_LABELS) as Category[]).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                aria-pressed={cat === c}
                className={`text-[11px] px-2 py-1 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  cat === c
                    ? (isDarkMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-blue-600 border-blue-600 text-white')
                    : (isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')
                }`}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <th className={`text-left px-4 sm:px-6 py-2 text-[11px] uppercase tracking-wider font-medium ${headerText}`}>Product</th>
              <th className={`text-left px-3 py-2 text-[11px] uppercase tracking-wider font-medium ${headerText}`}>#1</th>
              <th className={`text-left px-3 py-2 text-[11px] uppercase tracking-wider font-medium ${headerText}`}>#2</th>
              <th className={`text-left px-3 py-2 text-[11px] uppercase tracking-wider font-medium ${headerText}`}>#3</th>
              <th className={`text-right px-4 py-2 text-[11px] uppercase tracking-wider font-medium ${headerText}`}>Combined %</th>
              <th className={`px-4 py-2 min-w-[180px] text-[11px] uppercase tracking-wider font-medium ${headerText}`}>Concentration</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const barColor = r.combined >= 90 ? 'bg-rose-500' : r.combined >= 75 ? 'bg-amber-500' : 'bg-emerald-500';
              return (
                <tr key={r.product} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${rowHover}`}>
                  <td className={`px-4 sm:px-6 py-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} title={r.note}>{r.product}</td>
                  <td className={`px-3 py-2 ${textSec}`}>{r.top1Country} <span className={textMuted}>({r.top1SharePct}%)</span></td>
                  <td className={`px-3 py-2 ${textSec}`}>{r.top2Country} <span className={textMuted}>({r.top2SharePct}%)</span></td>
                  <td className={`px-3 py-2 ${textSec}`}>{r.top3Country} <span className={textMuted}>({r.top3SharePct}%)</span></td>
                  <td className={`px-4 py-2 text-right tabular-nums font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{r.combined}%</td>
                  <td className="px-4 py-2">
                    <div className={`relative h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(r.combined, 100)}%` }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={`p-4 sm:p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`text-xs uppercase tracking-wider mb-2 ${textMuted}`}>Maritime chokepoints</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MARITIME_CHOKEPOINTS.map(cp => (
            <div key={cp.name} className={`rounded border p-3 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cp.name}</div>
              <div className={`text-xs mt-1 ${textSec}`}>
                {cp.dailyBarrelsMn}M bbl/day · {cp.seabornTradeSharePct}% seaborne trade
              </div>
              {cp.note && <div className={`text-[11px] mt-1 ${textMuted}`}>{cp.note}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
