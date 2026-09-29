'use client';

// The sortable Numbeo cost-of-living index table and its commentary. Lifted
// out of inflation/page.tsx so the sort state lives next to the only markup
// that reads it.

import { useMemo, useState } from 'react';
import { costOfLivingData } from '../../data/costOfLiving';
import SocialShareMenu from '../SocialShareMenu';
import { slugify } from '../../lib/share';

const TABLE_TITLE = 'Cost of living index by city, 2026 (New York = 100)';

type Row = (typeof costOfLivingData)[number];

const COLUMNS: Array<{ key: keyof Row; label: string }> = [
  { key: 'rank', label: 'Rank' },
  { key: 'city', label: 'City' },
  { key: 'country', label: 'Country' },
  { key: 'colIndex', label: 'Cost of Living' },
  { key: 'rentIndex', label: 'Rent Index' },
  { key: 'colPlusRent', label: 'COL + Rent' },
  { key: 'groceriesIndex', label: 'Groceries' },
  { key: 'restaurantIndex', label: 'Restaurant' },
  { key: 'purchasingPower', label: 'Purchasing Power' },
];

export default function CostOfLivingOverview({ isDarkMode }: { isDarkMode: boolean }) {
  const [sortField, setSortField] = useState<keyof Row>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const rows = useMemo(() => {
    return [...costOfLivingData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });
  }, [sortField, sortDirection]);

  const sortBy = (field: keyof Row) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <>
      <div id={slugify(TABLE_TITLE)} className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden`}>
        <div className={`flex items-center justify-between gap-2 flex-wrap px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className="text-base font-semibold">{TABLE_TITLE}</h3>
          <SocialShareMenu title={TABLE_TITLE} subject="dataset" isDarkMode={isDarkMode} className="shrink-0" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Cost of living index by city, 2026, with New York City as the baseline of 100.
            </caption>
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                {COLUMNS.map(col => (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={
                      sortField === col.key
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                    className={`px-4 py-3 text-left font-semibold ${
                      sortField === col.key ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => sortBy(col.key)}
                      className="flex items-center gap-1 font-semibold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                    >
                      {col.label}
                      {sortField === col.key && <span aria-hidden="true">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rows.map((row, idx) => (
                <tr
                  key={row.rank}
                  className={`${
                    idx % 2 === 0
                      ? isDarkMode
                        ? 'bg-gray-800'
                        : 'bg-white'
                      : isDarkMode
                        ? 'bg-gray-750'
                        : 'bg-gray-50'
                  } hover:bg-opacity-80`}
                >
                  <td className="px-4 py-3 font-medium">{row.rank}</td>
                  <td className="px-4 py-3 font-medium">{row.city}</td>
                  <td className="px-4 py-3">{row.country}</td>
                  <td
                    className={`px-4 py-3 ${row.colIndex >= 100 ? 'text-red-500' : row.colIndex >= 70 ? 'text-yellow-500' : 'text-green-500'}`}
                  >
                    {row.colIndex.toFixed(1)}
                  </td>
                  <td
                    className={`px-4 py-3 ${row.rentIndex >= 50 ? 'text-red-500' : row.rentIndex >= 30 ? 'text-yellow-500' : 'text-green-500'}`}
                  >
                    {row.rentIndex.toFixed(1)}
                  </td>
                  <td className="px-4 py-3">{row.colPlusRent.toFixed(1)}</td>
                  <td className="px-4 py-3">{row.groceriesIndex.toFixed(1)}</td>
                  <td className="px-4 py-3">{row.restaurantIndex.toFixed(1)}</td>
                  <td
                    className={`px-4 py-3 ${row.purchasingPower >= 120 ? 'text-green-500' : row.purchasingPower >= 80 ? 'text-yellow-500' : 'text-red-500'}`}
                  >
                    {row.purchasingPower.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div id={slugify('Most Expensive Cities')} className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
            <h3 className="text-lg font-bold">Most Expensive Cities</h3>
            <SocialShareMenu title="Most Expensive Cities" subject="dataset" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <li><span className="font-semibold">Zurich, Switzerland</span> - Highest cost of living index (118.5)</li>
            <li><span className="font-semibold">Geneva, Switzerland</span> - Second highest (116.5)</li>
            <li><span className="font-semibold">New York, USA</span> - Baseline city for comparison (100.0)</li>
            <li><span className="font-semibold">San Francisco, USA</span> - Tech hub with high costs (97.6)</li>
          </ul>
        </div>
        <div id={slugify('Best Purchasing Power')} className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
            <h3 className="text-lg font-bold">Best Purchasing Power</h3>
            <SocialShareMenu title="Best Purchasing Power" subject="dataset" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <li><span className="font-semibold">Basel, Switzerland</span> - Highest purchasing power (183.7)</li>
            <li><span className="font-semibold">Zurich, Switzerland</span> - High salaries offset costs (164.4)</li>
            <li><span className="font-semibold">San Francisco, USA</span> - Strong tech salaries (151.0)</li>
            <li><span className="font-semibold">Brisbane, Australia</span> - Good value for money (145.3)</li>
          </ul>
        </div>
      </div>

      <div
        className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'} border`}
      >
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <span className="font-semibold">Data Source:</span> This data is sourced from{' '}
          <a
            href="https://www.numbeo.com/cost-of-living/rankings.jsp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Numbeo Cost of Living Index 2026
          </a>
          . Numbeo is the world&apos;s largest cost of living database, powered by user-contributed data. This table
          shows a representative sample of major global cities. Visit Numbeo for the complete dataset with 400+ cities.
        </p>
      </div>
    </>
  );
}
