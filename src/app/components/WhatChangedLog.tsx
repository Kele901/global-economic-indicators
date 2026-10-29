'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RECENT_CHANGES, type ChangeKind } from '../services/politicsCurated';
import type { CountryKey } from '../utils/countryMappings';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG } from '../utils/countryMappings';
import { COUNTRY_FLAGS } from './CountryFlag';

interface Props {
  isDarkMode: boolean;
  /** Profile mode: only this country's entries, without links. */
  countryKey?: CountryKey;
  /** Entries shown before "Show all". */
  initial?: number;
}

const KIND_META: Record<ChangeKind, { label: string; light: string; dark: string }> = {
  'new-leader': { label: 'New leader', light: 'bg-indigo-50 text-indigo-700', dark: 'bg-indigo-500/20 text-indigo-200' },
  election: { label: 'Election', light: 'bg-sky-50 text-sky-700', dark: 'bg-sky-500/20 text-sky-200' },
  coalition: { label: 'Coalition', light: 'bg-amber-50 text-amber-700', dark: 'bg-amber-500/20 text-amber-200' },
  constitution: { label: 'Constitution', light: 'bg-emerald-50 text-emerald-700', dark: 'bg-emerald-500/20 text-emerald-200' },
  other: { label: 'Other', light: 'bg-gray-100 text-gray-700', dark: 'bg-gray-700 text-gray-200' },
};

function fmtDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export default function WhatChangedLog({ isDarkMode, countryKey, initial = 6 }: Props) {
  const [all, setAll] = useState(false);
  const entries = countryKey ? RECENT_CHANGES.filter((c) => c.key === countryKey) : RECENT_CHANGES;
  const shown = all || countryKey ? entries : entries.slice(0, initial);
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  if (!entries.length) return null;

  return (
    <div>
      <ol className={`relative border-l pl-4 space-y-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {shown.map((c) => {
          const Flag = COUNTRY_FLAGS[c.key];
          const kind = KIND_META[c.kind];
          const body = (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <time className={`text-[11px] tabular-nums ${textSec}`} dateTime={c.date}>{fmtDate(c.date)}</time>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDarkMode ? kind.dark : kind.light}`}>{kind.label}</span>
                {!countryKey && (
                  <span className={`flex items-center gap-1 text-xs font-medium ${textPrimary}`}>
                    {Flag && <Flag className="w-4 h-3 rounded-sm" />}
                    {COUNTRY_DISPLAY_NAMES[c.key]}
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${textSec}`}>{c.summary}</p>
            </>
          );
          return (
            <li key={`${c.key}-${c.date}-${c.kind}`} className="relative">
              <span className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${isDarkMode ? 'bg-gray-900 border-indigo-400' : 'bg-white border-indigo-500'}`} />
              {countryKey ? body : (
                <Link href={`/politics-ledger/${COUNTRY_KEY_TO_SLUG[c.key]}`} className="block hover:opacity-80">{body}</Link>
              )}
            </li>
          );
        })}
      </ol>
      {!countryKey && entries.length > initial && (
        <button
          type="button"
          onClick={() => setAll((s) => !s)}
          className={`mt-3 text-xs underline underline-offset-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
        >
          {all ? 'Show fewer' : `Show all ${entries.length} changes`}
        </button>
      )}
    </div>
  );
}
