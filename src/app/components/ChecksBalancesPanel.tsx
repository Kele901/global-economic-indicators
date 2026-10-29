'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  POLITICS_PROFILES,
  CHECKS_BY_KEY,
  CHECK_AXES,
  CHECK_LABELS,
  REGIME_COLORS,
  REGIME_LABELS,
  powerConcentration,
  type CheckAxis,
  type PoliticalProfile,
} from '../services/politicsCurated';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG } from '../utils/countryMappings';
import { scoreColor } from '../utils/politicsColors';

interface Props {
  isDarkMode: boolean;
  /** Profile mode: one country's eight axes with notes. */
  profile?: PoliticalProfile;
}

type SortKey = 'concentration' | CheckAxis;

export default function ChecksBalancesPanel({ isDarkMode, profile }: Props) {
  const [sort, setSort] = useState<SortKey>('concentration');
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const track = isDarkMode ? 'bg-gray-700' : 'bg-gray-100';

  const ranked = useMemo(
    () => [...POLITICS_PROFILES].map((p) => ({ p, pc: powerConcentration(p) })).sort((a, b) => b.pc - a.pc),
    [],
  );

  if (profile) {
    const c = CHECKS_BY_KEY[profile.key];
    if (!c) return null;
    const pc = powerConcentration(profile);
    const rank = ranked.findIndex((r) => r.p.key === profile.key) + 1;
    return (
      <div>
        <div className="flex items-end gap-4 flex-wrap mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">Power concentration</div>
            <div className="text-3xl font-bold tabular-nums" style={{ color: scoreColor(1 - pc / 100) }}>{pc}<span className="text-base font-medium text-gray-500">/100</span></div>
          </div>
          <div className={`text-xs ${textSec}`}>
            #{rank} most concentrated of {ranked.length}. 0 means a fully constrained executive; 100 means no institutional checks.
          </div>
        </div>
        <ul className="space-y-2">
          {CHECK_AXES.map((a) => (
            <li key={a} title={CHECK_LABELS[a].hint}>
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className={textPrimary}>{CHECK_LABELS[a].label}</span>
                <span className={`tabular-nums ${textSec}`}>{c[a]}/4</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${track}`}>
                <div className="h-full rounded-full" style={{ width: `${(c[a] / 4) * 100}%`, backgroundColor: scoreColor(c[a] / 4) }} />
              </div>
            </li>
          ))}
        </ul>
        <p className={`text-xs mt-3 ${textSec}`}>{c.notes}</p>
        <p className="text-[11px] mt-1 text-gray-500">Editorial scores (4 = strong constraint) informed by V-Dem constraint indicators and constitutional texts.</p>
      </div>
    );
  }

  const gridRows = [...ranked].sort((a, b) => {
    if (sort === 'concentration') return b.pc - a.pc;
    return CHECKS_BY_KEY[a.p.key][sort] - CHECKS_BY_KEY[b.p.key][sort] || b.pc - a.pc;
  });

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2">
        <div className={`text-xs font-medium mb-2 ${textPrimary}`}>Power concentration, most to least</div>
        <ul className="space-y-1 max-h-[640px] overflow-y-auto pr-1">
          {ranked.map(({ p, pc }) => (
            <li key={p.key}>
              <Link href={`/politics-ledger/${COUNTRY_KEY_TO_SLUG[p.key]}`} className="flex items-center gap-2 text-xs group">
                <span className={`w-24 truncate ${textSec} group-hover:underline`}>{COUNTRY_DISPLAY_NAMES[p.key]}</span>
                <span className={`flex-1 h-3 rounded-sm overflow-hidden ${track}`}>
                  <span className="block h-full rounded-sm" style={{ width: `${pc}%`, backgroundColor: REGIME_COLORS[p.system.regime] }} title={REGIME_LABELS[p.system.regime]} />
                </span>
                <span className={`w-7 text-right tabular-nums ${textPrimary}`}>{pc}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className={`text-[11px] mt-2 ${textSec}`}>Bars are coloured by regime type. 100 means no institutional checks on the executive.</p>
      </div>

      <div className="lg:col-span-3 overflow-x-auto">
        <div className={`text-xs font-medium mb-2 ${textPrimary}`}>Eight constraints on the executive (click a column to sort, weakest first)</div>
        <table className="text-[11px] border-separate" style={{ borderSpacing: 2 }}>
          <thead>
            <tr>
              <th className="text-left font-medium pr-2">
                <button type="button" onClick={() => setSort('concentration')} className={sort === 'concentration' ? 'underline' : ''}>Country</button>
              </th>
              {CHECK_AXES.map((a) => (
                <th key={a} className="font-medium align-bottom" title={CHECK_LABELS[a].hint}>
                  <button
                    type="button"
                    onClick={() => setSort(a)}
                    className={`block w-9 text-[10px] leading-tight ${sort === a ? 'underline' : ''} ${textSec}`}
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 76 }}
                  >
                    {CHECK_LABELS[a].label}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gridRows.map(({ p }) => {
              const c = CHECKS_BY_KEY[p.key];
              return (
                <tr key={p.key} title={c.notes}>
                  <td className={`pr-2 whitespace-nowrap ${textSec}`}>
                    <Link href={`/politics-ledger/${COUNTRY_KEY_TO_SLUG[p.key]}`} className="hover:underline">{COUNTRY_DISPLAY_NAMES[p.key]}</Link>
                  </td>
                  {CHECK_AXES.map((a) => (
                    <td key={a} className="w-9 h-5 text-center tabular-nums text-white font-medium rounded-sm" style={{ backgroundColor: scoreColor(c[a] / 4) }}>
                      {c[a]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className={`text-[11px] mt-2 ${textSec}`}>
          0 = no constraint, 4 = strong constraint. Scores are editorial judgements informed by V-Dem constraint indicators, constitutional texts and central-bank independence indices. Hover a row for the rationale.
        </p>
      </div>
    </div>
  );
}
