'use client';

// Sortable table of the top-25 remittance corridors. Uses the World Bank
// Bilateral Remittance Matrix (2024 estimates) from the migrationCurated
// snapshot.

import { useMemo, useState } from 'react';
import { REMITTANCE_CORRIDORS_2024 } from '../services/migrationCurated';

interface Props {
  isDarkMode: boolean;
}

type SortKey = 'from' | 'to' | 'amount';
type SortDir = 'asc' | 'desc';

export default function RemittanceCorridorTable({ isDarkMode }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('amount');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const rows = useMemo(() => {
    const sorted = [...REMITTANCE_CORRIDORS_2024].sort((a, b) => {
      let comp = 0;
      if (sortKey === 'from') comp = a.from.localeCompare(b.from);
      else if (sortKey === 'to') comp = a.to.localeCompare(b.to);
      else comp = a.amountBn - b.amountBn;
      return sortDir === 'asc' ? comp : -comp;
    });
    return sorted;
  }, [sortKey, sortDir]);

  const total = REMITTANCE_CORRIDORS_2024.reduce((s, r) => s + r.amountBn, 0);
  const maxAmount = Math.max(...REMITTANCE_CORRIDORS_2024.map(r => r.amountBn));

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';
  const rowHover = isDarkMode ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50';
  const headerText = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir(key === 'amount' ? 'desc' : 'asc'); }
  }

  function SortHeader({ label, k, align = 'left' }: { label: string; k: SortKey; align?: 'left' | 'right' }) {
    const active = sortKey === k;
    return (
      <button
        onClick={() => toggleSort(k)}
        className={`text-[11px] uppercase tracking-wider font-medium transition-colors ${headerText} ${active ? (isDarkMode ? 'text-white' : 'text-gray-900') : ''} ${align === 'right' ? 'text-right w-full' : ''}`}
      >
        {label}{active ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
      </button>
    );
  }

  return (
    <div className={`rounded-lg border ${cardBg}`}>
      <div className="p-4 sm:p-6 border-b border-inherit flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>Top-25 remittance corridors (2024)</div>
          <p className={`text-sm ${textSec}`}>World Bank Bilateral Remittance Matrix estimates. USD billions.</p>
        </div>
        <div className={`text-sm font-medium ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
          ${total.toFixed(1)}B <span className={textMuted}>total across top 25</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <th className="text-left px-4 sm:px-6 py-2"><SortHeader label="From (sender)" k="from" /></th>
              <th className="text-left px-4 py-2"><SortHeader label="To (receiver)" k="to" /></th>
              <th className="text-right px-4 py-2"><SortHeader label="USD bn" k="amount" align="right" /></th>
              <th className={`px-4 py-2 min-w-[220px] text-[11px] uppercase tracking-wider font-medium ${headerText}`}>Flow</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${rowHover}`}>
                <td className={`px-4 sm:px-6 py-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{r.from}</td>
                <td className={`px-4 py-2 ${textSec}`}>→ {r.to}</td>
                <td className={`px-4 py-2 text-right tabular-nums font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${r.amountBn.toFixed(1)}</td>
                <td className="px-4 py-2">
                  <div className={`relative h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className={`h-full rounded-full bg-emerald-500`} style={{ width: `${(r.amountBn / maxAmount) * 100}%` }} />
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
