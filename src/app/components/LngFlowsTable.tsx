'use client';

import { useMemo, useState } from 'react';
import { LNG_FLOWS_2023 } from '../services/energyCurated';

interface Props { isDarkMode: boolean; }

const EXPORTERS = Array.from(new Set(LNG_FLOWS_2023.map(f => f.exporter))).sort();

export default function LngFlowsTable({ isDarkMode }: Props) {
  const [filter, setFilter] = useState<string>('ALL');

  const rows = useMemo(() => {
    const filtered = filter === 'ALL' ? LNG_FLOWS_2023 : LNG_FLOWS_2023.filter(f => f.exporter === filter);
    return [...filtered].sort((a, b) => b.mtpa - a.mtpa);
  }, [filter]);

  const total = rows.reduce((s, r) => s + r.mtpa, 0);

  const cellCls = isDarkMode ? 'border-gray-700 text-gray-200' : 'border-gray-200 text-gray-800';
  const headerCls = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex flex-wrap gap-2 mb-3">
        <button onClick={() => setFilter('ALL')} className={`text-xs px-2 py-1 rounded border ${
          filter === 'ALL'
            ? 'bg-blue-600 border-blue-500 text-white'
            : isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700'
        }`}>All exporters</button>
        {EXPORTERS.map(exp => (
          <button key={exp} onClick={() => setFilter(exp)} className={`text-xs px-2 py-1 rounded border ${
            filter === exp
              ? 'bg-blue-600 border-blue-500 text-white'
              : isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700'
          }`}>{exp}</button>
        ))}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className={`border-b ${cellCls}`}>
            <th className={`text-left px-2 py-2 text-xs uppercase tracking-wider font-semibold ${headerCls}`}>Exporter</th>
            <th className={`text-left px-2 py-2 text-xs uppercase tracking-wider font-semibold ${headerCls}`}>Importer</th>
            <th className={`text-right px-2 py-2 text-xs uppercase tracking-wider font-semibold ${headerCls}`}>Mtpa</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-b ${cellCls}`}>
              <td className="px-2 py-2">{r.exporter}</td>
              <td className="px-2 py-2">{r.importer}</td>
              <td className="px-2 py-2 text-right tabular-nums font-semibold">{r.mtpa}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {filter === 'ALL' ? 'All 20 major flows' : filter} · Total: <span className="font-semibold">{total} Mtpa</span> · Post-Ukraine, US LNG dethroned Qatar as the world&apos;s biggest exporter and Europe replaced Asia as the biggest premium buyer.
      </p>
    </div>
  );
}
