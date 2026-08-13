'use client';

import { useMemo, useState } from 'react';
import { PHARMA_TOP_15_RD_2024, type PharmaFirm } from '../services/healthCurated';

interface Props { isDarkMode: boolean; }

type SortKey = 'rank' | 'rdBillionsUsd' | 'rdPctOfRevenue';

export default function PharmaConcentrationTable({ isDarkMode }: Props) {
  const [sort, setSort] = useState<SortKey>('rdBillionsUsd');

  const rows = useMemo(() => {
    const copy = [...PHARMA_TOP_15_RD_2024];
    if (sort === 'rank') return copy.sort((a, b) => a.rank - b.rank);
    return copy.sort((a, b) => (b[sort] as number) - (a[sort] as number));
  }, [sort]);

  const total = PHARMA_TOP_15_RD_2024.reduce((s, f) => s + f.rdBillionsUsd, 0);

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
            <th className="px-2 py-2"><Sortable keyName="rank" label="#" /></th>
            <th className="px-2 py-2 text-left"><span className={headerCls + ' text-xs uppercase tracking-wider'}>Firm</span></th>
            <th className="px-2 py-2 text-left"><span className={headerCls + ' text-xs uppercase tracking-wider'}>HQ</span></th>
            <th className="px-2 py-2 text-right"><Sortable keyName="rdBillionsUsd" label="R&D $bn" /></th>
            <th className="px-2 py-2 text-right"><Sortable keyName="rdPctOfRevenue" label="% Revenue" /></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((f: PharmaFirm) => (
            <tr key={f.firm} className={`border-b ${cellCls}`}>
              <td className="px-2 py-2 tabular-nums">{f.rank}</td>
              <td className="px-2 py-2">{f.firm}</td>
              <td className="px-2 py-2">{f.country}</td>
              <td className="px-2 py-2 text-right tabular-nums font-semibold">${f.rdBillionsUsd.toFixed(1)}</td>
              <td className="px-2 py-2 text-right tabular-nums">{f.rdPctOfRevenue.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Top-15 firms poured <span className="font-semibold">${total.toFixed(0)}B</span> into R&D in 2024 — roughly 60% of global pharma R&D. The remaining 40% is spread across thousands of biotechs, generics makers and Indian/Chinese producers.
      </p>
    </div>
  );
}
