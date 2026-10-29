'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  POLITICS_PROFILES,
  GOVERNMENT_FORM_LABELS,
  STRUCTURE_LABELS,
  type PoliticalProfile,
} from '../services/politicsCurated';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG } from '../utils/countryMappings';
import { FORM_COLORS } from '../utils/politicsColors';
import { COUNTRY_FLAGS } from './CountryFlag';

type GroupBy = 'form' | 'structure' | 'electoral' | 'age';

const GROUP_LABELS: Record<GroupBy, string> = {
  form: 'System of government',
  structure: 'Federal vs unitary',
  electoral: 'Electoral system',
  age: 'Constitution age',
};

const FORM_BLURBS: Record<string, string> = {
  presidential: 'A directly elected president is both head of state and government, separate from the legislature.',
  parliamentary: 'The executive is drawn from, and can be dismissed by, the legislature; a separate ceremonial head of state.',
  'semi-presidential': 'An elected president shares executive power with a prime minister accountable to parliament.',
  'constitutional-monarchy': 'A hereditary monarch reigns; an elected parliament and prime minister govern.',
  'absolute-monarchy': 'The ruling dynasty holds executive, legislative and judicial authority.',
  'one-party-state': 'A single ruling party controls all state institutions by law.',
  'theocratic-republic': 'Elected bodies operate under the supervision of a supreme religious authority.',
  directorial: 'A collegial council of equals forms the executive; the presidency rotates yearly.',
};

function electoralFamily(p: PoliticalProfile): string {
  const s = p.system.electoralSystem.toLowerCase();
  if (s.includes('no national elections') || s.includes('appointed') || s.includes('party-vetted') || s.includes('indirect')) return 'No competitive national vote';
  if (s.startsWith('mixed') || s.includes('parallel') || s.includes('mixed-member')) return 'Mixed / parallel';
  if (s.includes('preferential') || s.includes('two-round system')) return 'Majoritarian (two-round or preferential)';
  if (s.includes('first-past-the-post') || s.includes('plurality') || s.includes('fptp')) return 'Majoritarian (first-past-the-post)';
  if (s.includes('proportional') || s.includes('list')) return 'Proportional representation';
  return 'Other';
}

function ageBucket(p: PoliticalProfile): string {
  const y = p.system.constitutionYear;
  if (y < 1900) return 'Before 1900';
  if (y < 1950) return '1900-1949';
  if (y < 1980) return '1950-1979';
  if (y < 2000) return '1980-1999';
  return '2000 or later';
}

interface Props {
  isDarkMode: boolean;
}

export default function GovernmentSystemsGrid({ isDarkMode }: Props) {
  const [groupBy, setGroupBy] = useState<GroupBy>('form');

  const groups = useMemo(() => {
    const keyFor = (p: PoliticalProfile): string => {
      switch (groupBy) {
        case 'form': return p.system.form;
        case 'structure': return p.system.structure;
        case 'electoral': return electoralFamily(p);
        case 'age': return ageBucket(p);
      }
    };
    const m = new Map<string, PoliticalProfile[]>();
    for (const p of POLITICS_PROFILES) {
      const k = keyFor(p);
      m.set(k, [...(m.get(k) ?? []), p]);
    }
    const entries = Array.from(m.entries());
    if (groupBy === 'age') {
      const order = ['Before 1900', '1900-1949', '1950-1979', '1980-1999', '2000 or later'];
      return entries.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
    }
    return entries.sort((a, b) => b[1].length - a[1].length);
  }, [groupBy]);

  const labelFor = (k: string) =>
    groupBy === 'form' ? GOVERNMENT_FORM_LABELS[k as PoliticalProfile['system']['form']]
      : groupBy === 'structure' ? STRUCTURE_LABELS[k as PoliticalProfile['system']['structure']]
        : k;

  const colorFor = (k: string, i: number) =>
    groupBy === 'form' ? FORM_COLORS[k as PoliticalProfile['system']['form']] : ['#6366f1', '#0ea5e9', '#16a34a', '#f59e0b', '#dc2626', '#db2777'][i % 6];

  const card = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const chip = isDarkMode ? 'bg-gray-900/60 hover:bg-gray-700 text-gray-200' : 'bg-gray-50 hover:bg-gray-100 text-gray-800';

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(Object.keys(GROUP_LABELS) as GroupBy[]).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroupBy(g)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
              groupBy === g
                ? isDarkMode ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200' : 'bg-indigo-50 border-indigo-400 text-indigo-700'
                : isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {GROUP_LABELS[g]}
          </button>
        ))}
      </div>

      <div className="flex h-3 w-full rounded-full overflow-hidden mb-5" aria-hidden>
        {groups.map(([k, list], i) => (
          <div key={k} style={{ width: `${(list.length / POLITICS_PROFILES.length) * 100}%`, backgroundColor: colorFor(k, i) }} title={`${labelFor(k)}: ${list.length}`} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups.map(([k, list], i) => (
          <div key={k} className={`rounded-lg border p-4 ${card}`}>
            <div className="flex items-center justify-between mb-1">
              <h4 className={`font-semibold flex items-center gap-2 ${textPrimary}`}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorFor(k, i) }} />
                {labelFor(k)}
              </h4>
              <span className={`text-xs tabular-nums ${textSec}`}>{list.length}</span>
            </div>
            {groupBy === 'form' && <p className={`text-xs mb-3 ${textSec}`}>{FORM_BLURBS[k]}</p>}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {list.map((p) => {
                const Flag = COUNTRY_FLAGS[p.key];
                return (
                  <Link
                    key={p.key}
                    href={`/politics-ledger/${COUNTRY_KEY_TO_SLUG[p.key]}`}
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs ${chip}`}
                    title={`${p.system.electoralSystem} Constitution: ${p.system.constitutionYear}.`}
                  >
                    {Flag && <Flag className="w-4 h-3 rounded-sm" />}
                    {COUNTRY_DISPLAY_NAMES[p.key]}
                    {groupBy === 'age' && <span className="opacity-60 tabular-nums">{p.system.constitutionYear}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
