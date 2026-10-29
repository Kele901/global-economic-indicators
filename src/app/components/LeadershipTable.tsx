'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  POLITICS_PROFILES,
  REGIME_COLORS,
  REGIME_LABELS,
  getEffectiveLeader,
  governmentSeatShare,
  yearsInPower,
  type PoliticalProfile,
} from '../services/politicsCurated';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG, REGION_ORDER, getRegionFor } from '../utils/countryMappings';
import { COUNTRY_FLAGS } from './CountryFlag';

type SortKey = 'country' | 'leader' | 'tenure' | 'seatShare' | 'nextElection';

interface Props {
  isDarkMode: boolean;
}

const effectiveLeader = getEffectiveLeader;

function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

export default function LeadershipTable({ isDarkMode }: Props) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<string>('All');
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'country', dir: 1 });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = POLITICS_PROFILES.filter((p) => {
      if (region !== 'All' && getRegionFor(p.key) !== region) return false;
      if (!q) return true;
      const hay = [
        COUNTRY_DISPLAY_NAMES[p.key],
        p.leadership.headOfState.name,
        p.leadership.headOfGovernment?.name ?? '',
        p.leadership.rulingCoalition,
        ...p.parties.map((x) => x.name),
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
    const val = (p: PoliticalProfile): string | number => {
      switch (sort.key) {
        case 'country': return COUNTRY_DISPLAY_NAMES[p.key];
        case 'leader': return effectiveLeader(p).name;
        case 'tenure': return yearsInPower(effectiveLeader(p).since);
        case 'seatShare': return governmentSeatShare(p);
        case 'nextElection': return p.leadership.nextElection.date || '9999';
      }
    };
    return [...filtered].sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      return (typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb))) * sort.dir;
    });
  }, [query, region, sort]);

  const toggle = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : key === 'tenure' || key === 'seatShare' ? -1 : 1 }));

  const head = isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200';
  const rowCls = isDarkMode ? 'border-gray-800 hover:bg-gray-800/60' : 'border-gray-100 hover:bg-gray-50';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const input = isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900';

  const Th = ({ k, label, className = '' }: { k: SortKey; label: string; className?: string }) => (
    <th className={`py-2 px-2 font-medium text-left cursor-pointer select-none whitespace-nowrap ${className}`} onClick={() => toggle(k)}>
      {label}{sort.key === k ? (sort.dir === 1 ? ' ▲' : ' ▼') : ''}
    </th>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search country, leader or party…"
          className={`px-3 py-1.5 rounded-md border text-sm w-full sm:w-72 ${input}`}
          aria-label="Search leaders"
        />
        <select value={region} onChange={(e) => setRegion(e.target.value)} className={`px-2 py-1.5 rounded-md border text-sm ${input}`} aria-label="Filter by region">
          <option value="All">All regions</option>
          {REGION_ORDER.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <span className={`text-xs self-center ${textSec}`}>{rows.length} of {POLITICS_PROFILES.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={`border-b text-[11px] uppercase tracking-wider ${head}`}>
              <Th k="country" label="Country" />
              <Th k="leader" label="Effective leader" />
              <th className="py-2 px-2 font-medium text-left hidden lg:table-cell">Head of state</th>
              <th className="py-2 px-2 font-medium text-left hidden md:table-cell">Governing parties</th>
              <Th k="tenure" label="In power" className="text-right" />
              <Th k="seatShare" label="Gov. seats" className="text-right hidden sm:table-cell" />
              <Th k="nextElection" label="Next vote" className="text-right" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const Flag = COUNTRY_FLAGS[p.key];
              const lead = effectiveLeader(p);
              const share = governmentSeatShare(p);
              const isHeadOfState = lead === p.leadership.headOfState;
              return (
                <tr key={p.key} className={`border-b ${rowCls}`}>
                  <td className="py-2 px-2">
                    <Link href={`/politics-ledger/${COUNTRY_KEY_TO_SLUG[p.key]}`} className={`flex items-center gap-2 font-medium hover:underline ${textPrimary}`}>
                      {Flag && <Flag className="w-5 h-3.5 rounded-sm shrink-0" />}
                      {COUNTRY_DISPLAY_NAMES[p.key]}
                    </Link>
                    <span className="inline-flex items-center gap-1 text-[10px] mt-0.5" style={{ color: REGIME_COLORS[p.system.regime] }}>
                      ● {REGIME_LABELS[p.system.regime]}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <div className={textPrimary}>{lead.name}</div>
                    <div className={`text-[11px] ${textSec}`}>{lead.title}{lead.party ? ` · ${lead.party}` : ''}</div>
                  </td>
                  <td className={`py-2 px-2 hidden lg:table-cell text-xs ${textSec}`}>
                    {isHeadOfState ? <span className="opacity-60">same</span> : (
                      <>{p.leadership.headOfState.name}<div className="text-[11px] opacity-75">{p.leadership.headOfState.title}</div></>
                    )}
                  </td>
                  <td className={`py-2 px-2 hidden md:table-cell text-xs max-w-[260px] ${textSec}`}>
                    <div className="flex flex-wrap gap-1">
                      {p.parties.filter((x) => x.role === 'governing' || x.role === 'coalition').slice(0, 5).map((x) => (
                        <span key={x.abbr} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: `${x.color}22`, color: isDarkMode ? '#e5e7eb' : '#111827' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: x.color }} />
                          {x.abbr}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className={`py-2 px-2 text-right tabular-nums ${textPrimary}`}>
                    {yearsInPower(lead.since).toFixed(1)}y
                    <div className={`text-[11px] ${textSec}`}>since {formatDate(lead.since)}</div>
                  </td>
                  <td className="py-2 px-2 text-right hidden sm:table-cell">
                    <div className={`tabular-nums ${share >= 0.5 ? 'text-emerald-500' : 'text-amber-500'}`}>{(share * 100).toFixed(0)}%</div>
                    <div className={`h-1 mt-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className={`h-1 rounded ${share >= 0.5 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, share * 100)}%` }} />
                    </div>
                  </td>
                  <td className={`py-2 px-2 text-right text-xs ${textSec}`}>
                    <div className={textPrimary}>{p.leadership.nextElection.date ? `${p.leadership.nextElection.approximate ? '~' : ''}${formatDate(p.leadership.nextElection.date)}` : 'None'}</div>
                    <div className="text-[11px] truncate max-w-[140px] ml-auto">{p.leadership.nextElection.type}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className={`text-[11px] mt-2 ${textSec}`}>
        &quot;Effective leader&quot; is whoever holds real executive power: usually the head of government in parliamentary systems and the head of state in presidential, semi-presidential, monarchical and party-state systems, with exceptions such as Saudi Arabia&apos;s crown prince. Government seat share counts governing and coalition parties in the lower or sole chamber; &quot;~&quot; marks an approximate or latest-legal date.
      </p>
    </div>
  );
}
