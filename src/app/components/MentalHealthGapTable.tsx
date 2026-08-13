'use client';

import { useMemo, useState } from 'react';
import { MENTAL_HEALTH_2020, HEALTH_COUNTRY_META } from '../services/healthCurated';

interface Props { isDarkMode: boolean; }

type SortKey = 'treatmentGapPct' | 'prevalencePct' | 'psychiatristsPer100k';

export default function MentalHealthGapTable({ isDarkMode }: Props) {
  const [sort, setSort] = useState<SortKey>('treatmentGapPct');

  const rows = useMemo(() => {
    return [...MENTAL_HEALTH_2020].sort((a, b) => (b[sort] as number) - (a[sort] as number));
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
            <th className="px-2 py-2 text-left"><span className={headerCls + ' text-xs uppercase tracking-wider'}>Country</span></th>
            <th className="px-2 py-2 text-right"><Sortable keyName="prevalencePct" label="Prevalence" /></th>
            <th className="px-2 py-2 text-right"><Sortable keyName="treatmentGapPct" label="Untreated" /></th>
            <th className="px-2 py-2 text-right"><Sortable keyName="psychiatristsPer100k" label="Psych/100k" /></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const meta = HEALTH_COUNTRY_META.find(m => m.code === r.code);
            const gapColor = r.treatmentGapPct >= 85 ? 'text-rose-500' : r.treatmentGapPct >= 65 ? 'text-amber-500' : 'text-emerald-500';
            return (
              <tr key={r.code} className={`border-b ${cellCls}`}>
                <td className="px-2 py-2">{meta?.name ?? r.code}</td>
                <td className="px-2 py-2 text-right tabular-nums">{r.prevalencePct.toFixed(1)}%</td>
                <td className={`px-2 py-2 text-right tabular-nums font-semibold ${gapColor}`}>{r.treatmentGapPct.toFixed(1)}%</td>
                <td className="px-2 py-2 text-right tabular-nums">{r.psychiatristsPer100k.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Even in high-income countries roughly half of adults with a diagnosable mental disorder receive no treatment; in low-income countries the gap is 90%+. Psychiatrist density is the single strongest system-side predictor.
      </p>
    </div>
  );
}
