'use client';

import { NUCLEAR_STATUS_2025, ENERGY_COUNTRY_META } from '../services/energyCurated';

interface Props { isDarkMode: boolean; }

const POLICY_BADGE: Record<string, { fg: string; bg: string; label: string }> = {
  expanding:    { fg: '#059669', bg: 'rgba(16,185,129,0.15)', label: 'Expanding'      },
  restarting:   { fg: '#2563eb', bg: 'rgba(37,99,235,0.15)',  label: 'Restarting'     },
  stable:       { fg: '#6b7280', bg: 'rgba(107,114,128,0.15)', label: 'Stable'        },
  'phasing-out':{ fg: '#dc2626', bg: 'rgba(220,38,38,0.15)',   label: 'Phasing out'   },
};

export default function NuclearStatusTable({ isDarkMode }: Props) {
  const cellCls = isDarkMode ? 'border-gray-700 text-gray-200' : 'border-gray-200 text-gray-800';
  const headerCls = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const sorted = [...NUCLEAR_STATUS_2025].sort((a, b) => (b.underConstruction + b.planned) - (a.underConstruction + a.planned));

  return (
    <div className={`rounded-lg border p-4 overflow-x-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className={`border-b ${cellCls}`}>
            <th className={`text-left px-2 py-2 text-xs uppercase tracking-wider font-semibold ${headerCls}`}>Country</th>
            <th className={`text-right px-2 py-2 text-xs uppercase tracking-wider font-semibold ${headerCls}`}>Operable</th>
            <th className={`text-right px-2 py-2 text-xs uppercase tracking-wider font-semibold ${headerCls}`}>Under construction</th>
            <th className={`text-right px-2 py-2 text-xs uppercase tracking-wider font-semibold ${headerCls}`}>Planned</th>
            <th className={`text-left px-2 py-2 text-xs uppercase tracking-wider font-semibold ${headerCls}`}>Policy</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(r => {
            const badge = POLICY_BADGE[r.policy];
            const meta = ENERGY_COUNTRY_META.find(m => m.code === r.code);
            return (
              <tr key={r.code} className={`border-b ${cellCls}`}>
                <td className="px-2 py-2">{meta?.name ?? r.code}</td>
                <td className="px-2 py-2 text-right tabular-nums">{r.operable}</td>
                <td className="px-2 py-2 text-right tabular-nums font-semibold" style={{ color: r.underConstruction > 0 ? '#2563eb' : undefined }}>{r.underConstruction}</td>
                <td className="px-2 py-2 text-right tabular-nums">{r.planned}</td>
                <td className="px-2 py-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ color: badge.fg, backgroundColor: badge.bg }}>{badge.label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        China leads on new build (30 under construction + 40 planned). The US and Japan are extending existing reactors. Germany completed its full phase-out in 2023; Italy is putting new nuclear back on the table.
      </p>
    </div>
  );
}
