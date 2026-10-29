'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CURATED_LAST_UPDATED,
  getRecentElections,
  getUpcomingElections,
  type UpcomingElection,
} from '../services/politicsCurated';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG } from '../utils/countryMappings';
import { COUNTRY_FLAGS } from './CountryFlag';

interface Props {
  isDarkMode: boolean;
}

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function daysUntil(iso: string, from: string): number {
  return Math.round((new Date(iso).getTime() - new Date(from).getTime()) / 86400000);
}

export default function ElectionCalendar({ isDarkMode }: Props) {
  const [view, setView] = useState<'upcoming' | 'recent'>('upcoming');
  const [horizon, setHorizon] = useState<12 | 24 | 60>(24);

  const upcoming = useMemo(() => {
    const limit = new Date(CURATED_LAST_UPDATED);
    limit.setMonth(limit.getMonth() + horizon);
    const cut = limit.toISOString().slice(0, 10);
    return getUpcomingElections().filter((e) => e.date <= cut);
  }, [horizon]);
  const recent = useMemo(() => getRecentElections(CURATED_LAST_UPDATED, 18), []);

  const list = view === 'upcoming' ? upcoming : recent;
  const grouped = useMemo(() => {
    const m = new Map<string, UpcomingElection[]>();
    for (const e of list) {
      const k = e.date.slice(0, 7);
      m.set(k, [...(m.get(k) ?? []), e]);
    }
    return Array.from(m.entries());
  }, [list]);

  const card = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const btn = (active: boolean) =>
    `px-2.5 py-1 rounded-md text-xs font-medium border ${
      active
        ? isDarkMode ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200' : 'bg-indigo-50 border-indigo-400 text-indigo-700'
        : isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
    }`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <button type="button" className={btn(view === 'upcoming')} onClick={() => setView('upcoming')}>Upcoming</button>
        <button type="button" className={btn(view === 'recent')} onClick={() => setView('recent')}>Last 18 months</button>
        {view === 'upcoming' && (
          <>
            <span className={`mx-1 ${textSec}`}>|</span>
            {([12, 24, 60] as const).map((h) => (
              <button key={h} type="button" className={btn(horizon === h)} onClick={() => setHorizon(h)}>
                {h === 60 ? '5 years' : `${h} months`}
              </button>
            ))}
          </>
        )}
        <span className={`text-xs ml-auto ${textSec}`}>{list.length} votes</span>
      </div>

      <ol className="relative border-l-2 ml-2 space-y-5" style={{ borderColor: isDarkMode ? '#4338ca' : '#a5b4fc' }}>
        {grouped.map(([month, items]) => (
          <li key={month} className="ml-4 relative">
            <span className="absolute -left-[23px] top-0.5 w-3 h-3 rounded-full bg-indigo-500" aria-hidden />
            <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
              {monthLabel(`${month}-01`)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {items.map((e) => {
                const Flag = COUNTRY_FLAGS[e.key];
                const d = daysUntil(e.date, CURATED_LAST_UPDATED);
                return (
                  <Link key={`${e.key}-${e.date}`} href={`/politics-ledger/${COUNTRY_KEY_TO_SLUG[e.key]}`} className={`block rounded-lg border p-3 hover:shadow-sm transition-shadow ${card}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`flex items-center gap-2 font-medium text-sm ${textPrimary}`}>
                        {Flag && <Flag className="w-5 h-3.5 rounded-sm" />}
                        {COUNTRY_DISPLAY_NAMES[e.key]}
                      </span>
                      <span className={`text-[11px] tabular-nums ${textSec}`}>
                        {e.approximate ? 'approx. ' : ''}
                        {new Date(e.date).toLocaleDateString('en-GB', { day: e.approximate ? undefined : 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className={`text-xs mt-1 ${textSec}`}>{e.type}</div>
                    {view === 'upcoming' && d >= 0 && d <= 120 && (
                      <div className="text-[11px] mt-1 font-medium text-amber-500">in {d} days</div>
                    )}
                    {view === 'recent' && e.summary && <div className={`text-xs mt-1 ${textSec}`}>{e.summary}</div>}
                  </Link>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
      {list.length === 0 && <p className={`text-sm ${textSec}`}>No scheduled votes in this window.</p>}
    </div>
  );
}
