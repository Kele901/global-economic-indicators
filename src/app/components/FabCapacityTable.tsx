'use client';

// Fab capacity table. Bar chart-style visualisation of leading-edge
// (sub-7nm) wafer capacity share by manufacturer. Curated from SEMI +
// TrendForce Q2-2025 data.

import { FAB_CAPACITY_2025Q2 } from '../services/aiCurated';

interface Props {
  isDarkMode: boolean;
}

export default function FabCapacityTable({ isDarkMode }: Props) {
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const border = isDarkMode ? 'border-gray-700' : 'border-gray-100';
  const headerBg = isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50';

  const sorted = [...FAB_CAPACITY_2025Q2].sort((a, b) => b.leadingEdgePct - a.leadingEdgePct);
  const total = sorted.reduce((s, r) => s + r.leadingEdgePct, 0);

  const barColor = (pct: number) => pct >= 60 ? '#dc2626' : pct >= 15 ? '#f59e0b' : '#3b82f6';

  return (
    <div className={`rounded-xl border ${cardBg}`}>
      <div className="p-4 sm:p-6">
        <h3 className={`text-base sm:text-lg font-semibold mb-1 ${text}`}>Leading-Edge Fab Capacity (Q2-2025)</h3>
        <p className={`text-xs mb-4 ${muted}`}>Share of global sub-7nm wafer capacity. TSMC alone runs {sorted[0]?.leadingEdgePct}% — a single-point-of-failure for the AI compute stack.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={headerBg}>
              <th className={`text-left px-4 py-2 font-medium ${text}`}>Manufacturer</th>
              <th className={`text-left px-4 py-2 font-medium ${text}`}>Country</th>
              <th className={`text-left px-4 py-2 font-medium ${text}`}>Leading-edge share</th>
              <th className={`text-right px-4 py-2 font-medium ${text}`}>CapEx 2024</th>
              <th className={`text-left px-4 py-2 font-medium ${text}`}>Process nodes</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(f => (
              <tr key={f.manufacturer} className={`border-t ${border}`}>
                <td className={`px-4 py-3 font-medium ${text}`}>{f.manufacturer}</td>
                <td className={`px-4 py-3 ${muted}`}>{f.country}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-[100px] max-w-[200px] h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
                      <div className="h-full" style={{ width: `${Math.min(100, f.leadingEdgePct)}%`, backgroundColor: barColor(f.leadingEdgePct) }} />
                    </div>
                    <span className={`text-xs tabular-nums font-medium ${text}`}>{f.leadingEdgePct}%</span>
                  </div>
                </td>
                <td className={`text-right px-4 py-3 tabular-nums ${text}`}>${f.capex2024Bn}bn</td>
                <td className={`px-4 py-3 text-xs ${muted}`}>{f.process}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={`border-t ${border}`}>
              <td colSpan={2} className={`px-4 py-3 text-xs font-medium ${muted}`}>Coverage of tracked manufacturers</td>
              <td colSpan={3} className={`px-4 py-3 text-xs ${muted}`}>{total}% of global leading-edge capacity</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
