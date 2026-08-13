'use client';

import { useMemo, useState } from 'react';
import { AI_DISPLACEMENT_RISK_2024, LABOR_COUNTRY_META } from '../services/laborCurated';

interface Props { isDarkMode: boolean; }

type SortKey = 'highExposurePct' | 'complementarityScore';

export default function AiDisplacementRiskTable({ isDarkMode }: Props) {
  const [sort, setSort] = useState<SortKey>('highExposurePct');

  const rows = useMemo(() => {
    return [...AI_DISPLACEMENT_RISK_2024].sort((a, b) => (b[sort] as number) - (a[sort] as number));
  }, [sort]);

  const cellCls = isDarkMode ? 'border-gray-700 text-gray-200' : 'border-gray-200 text-gray-800';
  const headerCls = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const Sortable = (props: { keyName: SortKey; label: string }) => (
    <button className={`${headerCls} text-left text-xs uppercase tracking-wider font-semibold hover:text-blue-500`} onClick={() => setSort(props.keyName)}>
      {props.label}{sort === props.keyName ? ' ▾' : ''}
    </button>
  );

  return (
    <div className={`rounded-lg border p-4 overflow-x-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className={`border-b ${cellCls}`}>
            <th className={`text-left px-2 py-2 text-xs uppercase tracking-wider font-semibold ${headerCls}`}>Country</th>
            <th className="px-2 py-2 text-right"><Sortable keyName="highExposurePct" label="High-exposure jobs" /></th>
            <th className="px-2 py-2 text-right"><Sortable keyName="complementarityScore" label="AI complementarity" /></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const meta = LABOR_COUNTRY_META.find(m => m.code === r.code);
            const compColor = r.complementarityScore >= 0.6 ? 'text-emerald-500' : r.complementarityScore >= 0.5 ? 'text-amber-500' : 'text-rose-500';
            return (
              <tr key={r.code} className={`border-b ${cellCls}`}>
                <td className="px-2 py-2">{meta?.name ?? r.code}</td>
                <td className="px-2 py-2 text-right tabular-nums font-semibold">{r.highExposurePct.toFixed(1)}%</td>
                <td className={`px-2 py-2 text-right tabular-nums ${compColor}`}>{r.complementarityScore.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        High-exposure % = share of jobs with tasks that generative AI can do. Complementarity score = how likely AI is to augment rather than replace workers (higher = safer). Rich-world countries face more exposure but also higher complementarity.
      </p>
    </div>
  );
}
