'use client';

// Debt-service peaks table. Sorts DEBT_COUNTRY_META by their latest
// debt-service value from the live WB DT.TDS.DECT.EX.ZS series (for
// developing countries only — advanced economies are not covered) and
// falls back to the "publicDebtService" bucket returned by
// fetchGlobalData otherwise.

import { useMemo, useState } from 'react';
import type { CountryData } from '../services/worldbank';
import { DEBT_COUNTRY_META } from '../services/debtCurated';
import { latestEntry } from '../utils/countryData';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

const TITLE = 'Debt Service Burden';

interface Props {
  isDarkMode: boolean;
  publicDebtService: CountryData[];
}

type SortKey = 'country' | 'debtService' | 'year';

export default function DebtServicePeaksTable({ isDarkMode, publicDebtService }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'debtService', dir: 'desc' });

  const rows = useMemo(() => {
    return DEBT_COUNTRY_META
      .map(meta => {
        const e = latestEntry(publicDebtService, meta.wbKey);
        return e ? {
          country: meta.name,
          iso3: meta.iso3,
          color: meta.color,
          debtService: e.value,
          year: e.year,
        } : null;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
  }, [publicDebtService]);

  const sorted = useMemo(() => {
    const s = [...rows];
    s.sort((a, b) => {
      const av = a[sort.key] as string | number;
      const bv = b[sort.key] as string | number;
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return s;
  }, [rows, sort]);

  const bg    = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text  = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const hdr   = isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50';
  const border = isDarkMode ? 'border-gray-700' : 'border-gray-100';

  const arrow = (k: SortKey) => sort.key === k ? (sort.dir === 'asc' ? '▲' : '▼') : '';
  const toggle = (k: SortKey) => setSort(s => s.key === k ? { key: k, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: 'desc' });
  const badge = (v: number) => v >= 20 ? 'text-red-500 font-semibold' : v >= 10 ? 'text-orange-500 font-semibold' : v >= 5 ? 'text-yellow-500' : 'text-emerald-500';

  return (
    <div id={slugify(TITLE)} className={`rounded-xl border ${bg}`}>
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
          <h3 className={`text-base sm:text-lg font-semibold ${text}`}>{TITLE}</h3>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <SocialShareMenu title={TITLE} isDarkMode={isDarkMode} subject="dataset" />
          </div>
        </div>
        <p className={`text-xs mb-4 ${muted}`}>
          Public + publicly-guaranteed external debt service as % of exports of goods, services and primary income.
          Above 20% is generally considered distress territory. Coverage limited to developing sovereigns.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={hdr}>
              <th className={`text-left px-4 py-2 font-medium cursor-pointer ${text}`} onClick={() => toggle('country')}>Country {arrow('country')}</th>
              <th className={`text-right px-4 py-2 font-medium cursor-pointer ${text}`} onClick={() => toggle('debtService')}>Debt service (% exports) {arrow('debtService')}</th>
              <th className={`text-right px-4 py-2 font-medium cursor-pointer ${text}`} onClick={() => toggle('year')}>Year {arrow('year')}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={3} className={`px-4 py-6 text-center ${muted}`}>No debt-service data available yet.</td>
              </tr>
            )}
            {sorted.map(r => (
              <tr key={r.iso3} className={`border-t ${border}`}>
                <td className={`px-4 py-3 ${text}`}>
                  <span className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle" style={{ backgroundColor: r.color }} aria-hidden="true" />
                  {r.country}
                </td>
                <td className={`text-right px-4 py-3 tabular-nums ${badge(r.debtService)}`}>{r.debtService.toFixed(1)}%</td>
                <td className={`text-right px-4 py-3 tabular-nums ${muted}`}>{r.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
