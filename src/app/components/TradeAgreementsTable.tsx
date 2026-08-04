'use client';

// Membership matrix for the five biggest active FTAs: RCEP, USMCA,
// CPTPP, EU, and AfCFTA. Cell states are member / pending / not applicable.

import { useMemo, useState } from 'react';
import { TRADE_AGREEMENTS } from '../services/tradeCurated';

interface Props {
  isDarkMode: boolean;
}

const BLOCS = [
  { key: 'rcep',   label: 'RCEP',   note: 'ASEAN + China + Japan + Korea + Australia + NZ (2022)' },
  { key: 'usmca',  label: 'USMCA',  note: 'US + Mexico + Canada (2020)' },
  { key: 'cptpp',  label: 'CPTPP',  note: 'Pacific 12 minus US (2018); UK joined 2024' },
  { key: 'eu',     label: 'EU',     note: 'European Union single market' },
  { key: 'afcfta', label: 'AfCFTA', note: 'African Continental FTA (2021)' },
] as const;

type SortKey = 'name' | typeof BLOCS[number]['key'];
type SortDir = 'asc' | 'desc';

export default function TradeAgreementsTable({ isDarkMode }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const rows = useMemo(() => {
    const sorted = [...TRADE_AGREEMENTS].sort((a, b) => {
      let comp = 0;
      if (sortKey === 'name') {
        comp = a.countryLabel.localeCompare(b.countryLabel);
      } else {
        const va = a[sortKey as keyof typeof a] ? 1 : 0;
        const vb = b[sortKey as keyof typeof b] ? 1 : 0;
        comp = va - vb;
      }
      return sortDir === 'asc' ? comp : -comp;
    });
    return sorted;
  }, [sortKey, sortDir]);

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';
  const rowHover = isDarkMode ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50';
  const headerText = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir(key === 'name' ? 'asc' : 'desc'); }
  }

  function Cell({ state }: { state: 'member' | 'pending' | null }) {
    if (state === 'member') return <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${isDarkMode ? 'bg-emerald-900/60 text-emerald-300' : 'bg-emerald-100 text-emerald-800'}`}>member</span>;
    if (state === 'pending') return <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${isDarkMode ? 'bg-amber-900/60 text-amber-300' : 'bg-amber-100 text-amber-800'}`}>pending</span>;
    return <span className={textMuted}>—</span>;
  }

  return (
    <div className={`rounded-lg border ${cardBg}`}>
      <div className="p-4 sm:p-6 border-b border-inherit">
        <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>Regional trade agreements</div>
        <p className={`text-sm ${textSec}`}>Membership matrix for the five biggest active FTAs — where the world&apos;s trading blocs overlap.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <th className="text-left px-4 sm:px-6 py-2">
                <button onClick={() => toggleSort('name')} className={`text-[11px] uppercase tracking-wider font-medium transition-colors ${headerText}`}>
                  Country{sortKey === 'name' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </th>
              {BLOCS.map(b => (
                <th key={b.key} className="text-center px-3 py-2" title={b.note}>
                  <button onClick={() => toggleSort(b.key as SortKey)} className={`text-[11px] uppercase tracking-wider font-medium transition-colors ${headerText}`}>
                    {b.label}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.country} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${rowHover}`}>
                <td className={`px-4 sm:px-6 py-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{r.countryLabel}</td>
                <td className="px-3 py-2 text-center"><Cell state={r.rcep} /></td>
                <td className="px-3 py-2 text-center"><Cell state={r.usmca} /></td>
                <td className="px-3 py-2 text-center"><Cell state={r.cptpp} /></td>
                <td className="px-3 py-2 text-center"><Cell state={r.eu} /></td>
                <td className="px-3 py-2 text-center"><Cell state={r.afcfta} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
