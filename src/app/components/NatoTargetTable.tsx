'use client';

import { useMemo, useState } from 'react';
import { NATO_MEMBERS_2025, NATO_TARGET_PERCENT_GDP, type NatoMember } from '../services/defenseCurated';

interface Props {
  isDarkMode: boolean;
}

type SortKey = 'name' | 'percent' | 'joined';
type SortDir = 'asc' | 'desc';

export default function NatoTargetTable({ isDarkMode }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('percent');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const rows = useMemo(() => {
    const sorted = [...NATO_MEMBERS_2025].sort((a, b) => {
      let comp = 0;
      if (sortKey === 'name') comp = a.country.localeCompare(b.country);
      else if (sortKey === 'percent') comp = a.militaryPercentGdp2025 - b.militaryPercentGdp2025;
      else if (sortKey === 'joined') comp = a.joined - b.joined;
      return sortDir === 'asc' ? comp : -comp;
    });
    return sorted;
  }, [sortKey, sortDir]);

  const meetingTarget = NATO_MEMBERS_2025.filter(m => m.militaryPercentGdp2025 >= NATO_TARGET_PERCENT_GDP).length;
  const totalMembers = NATO_MEMBERS_2025.length;
  const maxPct = Math.max(...NATO_MEMBERS_2025.map(m => m.militaryPercentGdp2025)) * 1.05;

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';
  const rowHover = isDarkMode ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50';
  const headerText = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
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
          <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>
            NATO · The 2% Target
          </div>
          <p className={`text-sm ${textSec}`}>
            32 members ranked by estimated 2025 defense spending as a share of GDP. Line marks the 2% Wales-summit commitment.
          </p>
        </div>
        <div className={`text-sm font-medium ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
          {meetingTarget} / {totalMembers} <span className={textMuted}>meeting 2%</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <th className="text-left px-4 sm:px-6 py-2"><SortHeader label="Country" k="name" /></th>
              <th className="text-right px-4 py-2"><SortHeader label="Joined" k="joined" align="right" /></th>
              <th className="text-right px-4 py-2"><SortHeader label="% GDP (2025e)" k="percent" align="right" /></th>
              <th className="px-4 py-2 min-w-[240px]">
                <span className={`text-[11px] uppercase tracking-wider ${headerText}`}>Progress vs 2%</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m: NatoMember) => {
              const meets = m.militaryPercentGdp2025 >= NATO_TARGET_PERCENT_GDP;
              const barWidth = Math.min((m.militaryPercentGdp2025 / maxPct) * 100, 100);
              const targetPos = (NATO_TARGET_PERCENT_GDP / maxPct) * 100;
              return (
                <tr key={m.countryIso3} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${rowHover}`}>
                  <td className={`px-4 sm:px-6 py-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{m.country}</td>
                  <td className={`px-4 py-2 text-right tabular-nums ${textMuted}`}>{m.joined}</td>
                  <td className={`px-4 py-2 text-right tabular-nums font-semibold ${meets ? (isDarkMode ? 'text-emerald-300' : 'text-emerald-700') : (isDarkMode ? 'text-rose-300' : 'text-rose-600')}`}>
                    {m.militaryPercentGdp2025.toFixed(2)}%
                  </td>
                  <td className="px-4 py-2">
                    <div className={`relative h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className={`h-full rounded-full ${meets ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${barWidth}%` }}
                      />
                      <div
                        className={`absolute top-[-2px] bottom-[-2px] w-0.5 ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`}
                        style={{ left: `${targetPos}%` }}
                        title="2% target"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
