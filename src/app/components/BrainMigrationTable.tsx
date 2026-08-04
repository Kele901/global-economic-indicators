'use client';

// Brain migration ranking: % of tertiary-educated adults living abroad,
// with a net-talent label (gain / drain / balanced). OECD talent
// migration proxy.

import { useMemo, useState } from 'react';
import { BRAIN_MIGRATION_2024 } from '../services/migrationCurated';

interface Props {
  isDarkMode: boolean;
}

type Filter = 'all' | 'gain' | 'drain' | 'balanced';

const FILTER_LABEL: Record<Filter, string> = {
  all:      'All',
  gain:     'Brain gain',
  drain:    'Brain drain',
  balanced: 'Balanced',
};

const NET_COLOR: Record<'gain' | 'drain' | 'balanced', string> = {
  gain:     'bg-emerald-500',
  drain:    'bg-rose-500',
  balanced: 'bg-amber-500',
};

export default function BrainMigrationTable({ isDarkMode }: Props) {
  const [f, setF] = useState<Filter>('all');

  const rows = useMemo(() => {
    const filtered = f === 'all' ? BRAIN_MIGRATION_2024 : BRAIN_MIGRATION_2024.filter(r => r.netTalent === f);
    return [...filtered].sort((a, b) => b.brainDrainScore - a.brainDrainScore);
  }, [f]);

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';
  const rowHover = isDarkMode ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50';
  const headerText = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`rounded-lg border ${cardBg}`}>
      <div className="p-4 sm:p-6 border-b border-inherit flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>Brain migration</div>
          <p className={`text-sm ${textSec}`}>% of tertiary-educated adults from each country living abroad. High shares = talent leaks; low + immigration = brain gain.</p>
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by net-talent status">
          {(Object.keys(FILTER_LABEL) as Filter[]).map(k => (
            <button
              key={k}
              type="button"
              onClick={() => setF(k)}
              aria-pressed={f === k}
              className={`text-[11px] px-2 py-1 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                f === k
                  ? (isDarkMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-blue-600 border-blue-600 text-white')
                  : (isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')
              }`}
            >
              {FILTER_LABEL[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <th className={`text-left px-4 sm:px-6 py-2 text-[11px] uppercase tracking-wider font-medium ${headerText}`}>Country</th>
              <th className={`text-center px-4 py-2 text-[11px] uppercase tracking-wider font-medium ${headerText}`}>Net</th>
              <th className={`text-right px-4 py-2 text-[11px] uppercase tracking-wider font-medium ${headerText}`}>Tertiary emigrants (%)</th>
              <th className={`px-4 py-2 min-w-[200px] text-[11px] uppercase tracking-wider font-medium ${headerText}`}>Share</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.country} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${rowHover}`}>
                <td className={`px-4 sm:px-6 py-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{r.countryLabel}</td>
                <td className="px-4 py-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${NET_COLOR[r.netTalent]}`} aria-hidden="true" />
                    <span className={`text-xs ${textSec}`}>{r.netTalent}</span>
                  </div>
                </td>
                <td className={`px-4 py-2 text-right tabular-nums font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{r.brainDrainScore.toFixed(1)}%</td>
                <td className="px-4 py-2">
                  <div className={`relative h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className={`h-full rounded-full ${NET_COLOR[r.netTalent]}`} style={{ width: `${Math.min(r.brainDrainScore * 2.5, 100)}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
