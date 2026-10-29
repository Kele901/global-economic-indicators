'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { POLITICAL_TRADITIONS, POLITICS_PROFILES, type TraditionId } from '../services/politicsCurated';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG } from '../utils/countryMappings';
import { COUNTRY_FLAGS } from './CountryFlag';

interface Props {
  isDarkMode: boolean;
  /** Restrict to these traditions (profile page). */
  only?: TraditionId[];
}

export default function PoliticalTraditionsGrid({ isDarkMode, only }: Props) {
  const [open, setOpen] = useState<TraditionId | null>(null);

  const traditions = useMemo(() => {
    const list = only ? POLITICAL_TRADITIONS.filter((t) => only.includes(t.id)) : POLITICAL_TRADITIONS;
    return list
      .map((t) => ({ ...t, countries: POLITICS_PROFILES.filter((p) => p.traditions.includes(t.id)) }))
      .sort((a, b) => (only ? 0 : b.countries.length - a.countries.length));
  }, [only]);

  const card = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const chip = isDarkMode ? 'bg-gray-900/60 text-gray-300 hover:bg-gray-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100';
  const accent = isDarkMode ? 'text-indigo-300' : 'text-indigo-700';

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${only ? '' : 'xl:grid-cols-3'} gap-4`}>
      {traditions.map((t) => {
        const expanded = open === t.id || !!only;
        return (
          <div key={t.id} className={`rounded-lg border p-4 flex flex-col ${card}`}>
            <div className="flex items-start justify-between gap-2">
              <h4 className={`font-semibold ${textPrimary}`}>{t.name}</h4>
              {!only && <span className={`text-xs tabular-nums shrink-0 ${textSec}`}>{t.countries.length} countries</span>}
            </div>
            <p className={`text-sm mt-1 ${textSec}`}>{t.summary}</p>
            <div className={`text-[11px] uppercase tracking-wider mt-3 ${accent}`}>Hallmarks</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {t.hallmarks.map((h) => (
                <span key={h} className={`text-[11px] px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-indigo-500/15 text-indigo-200' : 'bg-indigo-50 text-indigo-700'}`}>{h}</span>
              ))}
            </div>
            {expanded && (
              <>
                <div className={`text-[11px] uppercase tracking-wider mt-3 ${accent}`}>Origins</div>
                <p className={`text-xs mt-1 ${textSec}`}>{t.origins}</p>
                <div className={`text-[11px] uppercase tracking-wider mt-3 ${accent}`}>Key thinkers</div>
                <p className={`text-xs mt-1 ${textSec}`}>{t.thinkers.join(' · ')}</p>
              </>
            )}
            {!only && (
              <>
                <div className="flex flex-wrap gap-1 mt-3">
                  {t.countries.map((p) => {
                    const Flag = COUNTRY_FLAGS[p.key];
                    return (
                      <Link key={p.key} href={`/politics-ledger/${COUNTRY_KEY_TO_SLUG[p.key]}`} className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded ${chip}`}>
                        {Flag && <Flag className="w-3.5 h-2.5 rounded-sm" />}
                        {COUNTRY_DISPLAY_NAMES[p.key]}
                      </Link>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : t.id)}
                  className={`mt-auto pt-3 text-xs font-medium self-start ${accent}`}
                  aria-expanded={expanded}
                >
                  {expanded ? 'Show less' : 'Origins and thinkers'}
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
