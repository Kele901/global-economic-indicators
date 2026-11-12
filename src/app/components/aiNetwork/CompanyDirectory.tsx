'use client';

import React, { useMemo, useState } from 'react';
import CountryFlag from '../CountryFlag';
import type { NetworkDataset } from '../../services/network/types';
import { countryLabel, formatUsdBn, matchesQuery, neighbours } from '../../utils/aiNetwork/network';

interface Props {
  isDarkMode: boolean;
  dataset: NetworkDataset;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRecentre: (id: string) => void;
  hubId: string;
}

type SortKey = 'stack' | 'value' | 'links';

const PAGE = 30;
const PAGED_ABOVE = 80;

export default function CompanyDirectory({ isDarkMode, dataset, selectedId, onSelect, onRecentre, hubId }: Props) {
  const { companies, links, categories, categoryById: CATEGORY_BY_ID, sectors } = dataset;
  const [query, setQuery] = useState('');
  // Datasets with sectors filter by sector (8 chips) rather than category (20+).
  const [group, setGroup] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('stack');
  const [showAll, setShowAll] = useState(false);

  const filters = useMemo(
    () => (sectors
      ? sectors.map((s) => ({ id: s.id, label: s.label, color: s.color, categoryIds: s.categoryIds }))
      : categories.map((c) => ({ id: c.id, label: c.label, color: c.color, categoryIds: [c.id] }))),
    [sectors, categories],
  );

  const linkCount = useMemo(
    () => Object.fromEntries(companies.map((c) => [c.id, new Set(neighbours(links, c.id).map((r) => r.id)).size])),
    [companies, links],
  );

  const list = useMemo(() => {
    const order = categories.map((c) => c.id);
    const allowed = group === 'all' ? null : new Set(filters.find((f) => f.id === group)?.categoryIds ?? []);
    return companies
      .filter((c) => !allowed || allowed.has(c.category))
      .filter((c) => !query.trim() || matchesQuery(c, query) || c.oneLiner.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => {
        if (sort === 'value') return (b.valueUsdBn ?? -1) - (a.valueUsdBn ?? -1);
        if (sort === 'links') return linkCount[b.id] - linkCount[a.id];
        return order.indexOf(a.category) - order.indexOf(b.category) || (b.valueUsdBn ?? 0) - (a.valueUsdBn ?? 0);
      });
  }, [companies, categories, filters, group, query, sort, linkCount]);
  const paged = companies.length > PAGED_ABOVE && !query.trim() && list.length > PAGE;
  const shown = paged && !showAll ? list.slice(0, PAGE) : list;

  const card = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const chip = (on: boolean) => `px-2.5 py-1 rounded-full text-xs font-medium border ${
    on
      ? isDarkMode ? 'bg-gray-700 border-gray-500 text-white' : 'bg-gray-900 border-gray-900 text-white'
      : isDarkMode ? 'border-gray-700 text-gray-400 hover:text-gray-200' : 'border-gray-300 text-gray-600 hover:text-gray-900'
  }`;

  return (
    <div className={`rounded-xl border p-4 sm:p-6 ${card}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className={`text-base sm:text-lg font-semibold ${text}`}>Company directory</h3>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search names, tickers, descriptions"
            aria-label="Search the company directory"
            className={`w-60 px-3 py-1.5 rounded-md text-sm border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
              isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort companies"
            className={`px-2 py-1.5 rounded-md text-sm border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="stack">Sort: stack order</option>
            <option value="value">Sort: value</option>
            <option value="links">Sort: most connected</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4" role="group" aria-label={sectors ? 'Filter by sector' : 'Filter by category'}>
        <button type="button" className={chip(group === 'all')} aria-pressed={group === 'all'} onClick={() => setGroup('all')}>
          All {companies.length}
        </button>
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`${chip(group === f.id)} inline-flex items-center gap-1.5`}
            aria-pressed={group === f.id}
            onClick={() => setGroup(f.id)}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: f.color }} />
            {f.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className={`text-sm ${muted}`}>No companies match.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {shown.map((c) => {
            const cat = CATEGORY_BY_ID[c.category];
            const isSel = selectedId === c.id;
            return (
              <div key={c.id} className="relative">
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  className={`w-full h-full text-left rounded-lg border p-3 transition-colors border-l-4 ${
                    isSel
                      ? isDarkMode ? 'bg-gray-700 border-gray-500' : 'bg-violet-50 border-violet-300'
                      : isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  style={{ borderLeftColor: cat.color }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CountryFlag countryKey={c.hqCountry} className="w-5 h-3.5 rounded-sm" title={countryLabel(c.hqCountry)} />
                    <span className={`font-semibold text-sm flex-1 truncate ${text}`}>{c.name}</span>
                    <span className={`text-xs tabular-nums ${muted}`}>{formatUsdBn(c.valueUsdBn)}</span>
                  </div>
                  <p className={`text-xs leading-snug line-clamp-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{c.oneLiner}</p>
                  <div className={`flex items-center gap-2 mt-2 pr-16 text-[11px] ${muted}`}>
                    <span style={{ color: cat.color }} className="font-semibold">{cat.label}</span>
                    <span aria-hidden>·</span>
                    <span>{linkCount[c.id]} connections</span>
                    {!c.listed && (
                      <>
                        <span aria-hidden>·</span>
                        <span>private</span>
                      </>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onRecentre(c.id)}
                  disabled={hubId === c.id}
                  aria-label={`Centre the network map on ${c.name}`}
                  className={`absolute bottom-2 right-2 px-2 py-0.5 rounded text-[11px] font-semibold border disabled:opacity-50 disabled:cursor-default ${
                    isDarkMode ? 'border-gray-600 text-violet-300 hover:bg-gray-700' : 'border-gray-300 text-violet-700 hover:bg-white'
                  }`}
                >
                  {hubId === c.id ? 'On map' : 'Map'}
                </button>
              </div>
            );
          })}
        </div>
      )}
      {paged && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className={`mt-3 text-xs font-medium ${isDarkMode ? 'text-violet-300' : 'text-violet-700'}`}
        >
          {showAll ? `Show first ${PAGE}` : `Show all ${list.length}`}
        </button>
      )}
    </div>
  );
}
