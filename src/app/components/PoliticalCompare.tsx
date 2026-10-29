'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  POLITICS_PROFILES,
  POLITICS_BY_KEY,
  GOVERNMENT_FORM_LABELS,
  REGIME_COLORS,
  REGIME_LABELS,
  STRUCTURE_LABELS,
  TRADITION_BY_ID,
  getEffectiveLeader,
  governmentSeatShare,
  yearsInPower,
  type PoliticalProfile,
} from '../services/politicsCurated';
import type { CountryKey } from '../utils/countryMappings';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG } from '../utils/countryMappings';
import { compositeScore, formatMetric, metricScore, scoreColor, type IndexMetric } from '../utils/politicsColors';
import { COUNTRY_FLAGS } from './CountryFlag';

interface Props {
  isDarkMode: boolean;
  initial?: CountryKey[];
}

const INDEX_ROWS: { id: IndexMetric; label: string }[] = [
  { id: 'eiu', label: 'EIU Democracy Index' },
  { id: 'freedomHouse', label: 'Freedom House' },
  { id: 'vdem', label: 'V-Dem Liberal Democracy' },
  { id: 'rsf', label: 'RSF press freedom rank' },
  { id: 'cpi', label: 'Corruption Perceptions' },
  { id: 'women', label: 'Women in parliament' },
];

export default function PoliticalCompare({ isDarkMode, initial = ['USA', 'China', 'India'] }: Props) {
  const [keys, setKeys] = useState<CountryKey[]>(initial);
  const profiles = keys.map((k) => POLITICS_BY_KEY[k]).filter((p): p is PoliticalProfile => !!p);

  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const border = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const input = isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900';

  const setAt = (i: number, k: CountryKey) => setKeys((cur) => cur.map((x, j) => (j === i ? k : x)));

  const Row = ({ label, render }: { label: string; render: (p: PoliticalProfile) => ReactNode }) => (
    <tr className={`border-b ${border}`}>
      <th className={`py-2 pr-3 text-left text-[11px] uppercase tracking-wider font-medium align-top w-40 ${textSec}`}>{label}</th>
      {profiles.map((p) => (
        <td key={p.key} className={`py-2 px-2 text-sm align-top ${textPrimary}`}>{render(p)}</td>
      ))}
    </tr>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {keys.map((k, i) => (
          <select key={i} value={k} onChange={(e) => setAt(i, e.target.value as CountryKey)} className={`px-2 py-1.5 rounded-md border text-sm ${input}`} aria-label={`Country ${i + 1}`}>
            {POLITICS_PROFILES.map((p) => (
              <option key={p.key} value={p.key}>{COUNTRY_DISPLAY_NAMES[p.key]}</option>
            ))}
          </select>
        ))}
        {keys.length < 4 && (
          <button type="button" onClick={() => setKeys((c) => [...c, POLITICS_PROFILES.find((p) => !c.includes(p.key))!.key])} className={`px-2.5 py-1.5 rounded-md border text-xs ${input}`}>
            + Add country
          </button>
        )}
        {keys.length > 2 && (
          <button type="button" onClick={() => setKeys((c) => c.slice(0, -1))} className={`px-2.5 py-1.5 rounded-md border text-xs ${input}`}>
            − Remove
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className={`border-b ${border}`}>
              <th />
              {profiles.map((p) => {
                const Flag = COUNTRY_FLAGS[p.key];
                return (
                  <th key={p.key} className="py-2 px-2 text-left">
                    <Link href={`/politics-ledger/${COUNTRY_KEY_TO_SLUG[p.key]}`} className={`flex items-center gap-2 font-semibold hover:underline ${textPrimary}`}>
                      {Flag && <Flag className="w-6 h-4 rounded-sm" />}
                      {COUNTRY_DISPLAY_NAMES[p.key]}
                    </Link>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <Row label="Regime" render={(p) => <span className="font-medium" style={{ color: REGIME_COLORS[p.system.regime] }}>{REGIME_LABELS[p.system.regime]}</span>} />
            <Row label="System" render={(p) => `${GOVERNMENT_FORM_LABELS[p.system.form]} · ${STRUCTURE_LABELS[p.system.structure]}`} />
            <Row label="Constitution" render={(p) => p.system.constitutionYear} />
            <Row label="Term limits" render={(p) => <span className={`text-xs ${textSec}`}>{p.system.termLimits}</span>} />
            <Row label="Electoral system" render={(p) => <span className={`text-xs ${textSec}`}>{p.system.electoralSystem}</span>} />
            <Row
              label="Effective leader"
              render={(p) => {
                const l = getEffectiveLeader(p);
                return (
                  <>
                    {l.name}
                    <div className={`text-xs ${textSec}`}>{l.title} · {yearsInPower(l.since).toFixed(1)} yrs</div>
                  </>
                );
              }}
            />
            <Row label="Ruling coalition" render={(p) => <span className="text-xs">{p.leadership.rulingCoalition}</span>} />
            <Row label="Gov. seat share" render={(p) => `${(governmentSeatShare(p) * 100).toFixed(0)}% of ${p.system.legislature.seats.toLocaleString()}`} />
            <Row label="Next vote" render={(p) => (p.leadership.nextElection.date ? `${p.leadership.nextElection.approximate ? '~' : ''}${p.leadership.nextElection.date.slice(0, 7)} · ${p.leadership.nextElection.type}` : 'None scheduled')} />
            <Row
              label="Composite score"
              render={(p) => {
                const c = compositeScore(p);
                return <span className="font-semibold tabular-nums" style={{ color: scoreColor(c / 100) }}>{c.toFixed(0)}/100</span>;
              }}
            />
            {INDEX_ROWS.map((r) => (
              <Row
                key={r.id}
                label={r.label}
                render={(p) => (
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums w-12">{formatMetric(p, r.id)}</span>
                    <div className={`h-1.5 flex-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className="h-1.5 rounded" style={{ width: `${metricScore(p, r.id) * 100}%`, backgroundColor: scoreColor(metricScore(p, r.id)) }} />
                    </div>
                  </div>
                )}
              />
            ))}
            <Row label="Traditions" render={(p) => <span className="text-xs">{p.traditions.map((t) => TRADITION_BY_ID[t].name).join(', ')}</span>} />
            <Row label="Core values" render={(p) => <span className="text-xs">{p.philosophy.coreValues.join(', ')}</span>} />
            <Row label="Alignment" render={(p) => <span className="text-xs">{p.foreignPolicy.alignment}</span>} />
            <Row label="Key cleavages" render={(p) => <span className="text-xs">{p.culture.cleavages.slice(0, 3).join('; ')}</span>} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
