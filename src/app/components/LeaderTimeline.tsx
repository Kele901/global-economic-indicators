'use client';

import { useMemo, useState } from 'react';
import {
  CURATED_LAST_UPDATED,
  turnoverSince1945,
  yearsInPower,
  type CountryHistory,
  type LeaderTerm,
  type PoliticalProfile,
} from '../services/politicsCurated';

interface Props {
  isDarkMode: boolean;
  profile: PoliticalProfile;
  history: CountryHistory;
}

const START = 1945;
const PALETTE = ['#6366f1', '#0ea5e9', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#64748b', '#84cc16'];
const ROUTE_LABELS: Record<LeaderTerm['route'], string> = {
  election: 'Won an election',
  'parliamentary-vote': 'Parliamentary vote',
  succession: 'Constitutional succession',
  appointment: 'Appointed',
  'party-selection': 'Chosen by party',
  coup: 'Coup or revolution',
  hereditary: 'Hereditary',
};

function toYear(iso: string): number {
  const d = new Date(iso);
  return d.getUTCFullYear() + (d.getUTCMonth() + d.getUTCDate() / 31) / 12;
}

function partyColor(party: string | undefined, profile: PoliticalProfile, fallback: Map<string, string>): string {
  if (!party) return '#94a3b8';
  const p = party.toLowerCase();
  const hit = profile.parties.find((x) => p.includes(x.abbr.toLowerCase()) || x.name.toLowerCase().includes(p) || p.includes(x.name.toLowerCase()));
  if (hit) return hit.color;
  if (/military|junta|derg|scaf/.test(p)) return '#57534e';
  if (!fallback.has(party)) fallback.set(party, PALETTE[fallback.size % PALETTE.length]);
  return fallback.get(party)!;
}

export default function LeaderTimeline({ isDarkMode, profile, history }: Props) {
  const [hover, setHover] = useState<LeaderTerm | null>(null);
  const [showList, setShowList] = useState(false);
  const end = toYear(CURATED_LAST_UPDATED);
  const span = end - START;

  const lanes = useMemo(() => {
    const fallback = new Map<string, string>();
    const roles = (['hos', 'hog'] as const).filter((r) => history.leaders.some((t) => t.role === r));
    return roles.map((role) => ({
      role,
      terms: history.leaders
        .filter((t) => t.role === role && (t.end === null || t.end >= `${START}-01-01`))
        .map((t) => ({ t, color: partyColor(t.party, profile, fallback) })),
    }));
  }, [history, profile]);

  const turnover = useMemo(() => turnoverSince1945(profile), [profile]);

  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const laneBg = isDarkMode ? '#1f2937' : '#f3f4f6';

  if (!history.leaders.length) {
    return <p className={`text-sm ${textSec}`}>{history.leadersNote ?? 'No leader history is available.'}</p>;
  }

  const W = 1000;
  const laneH = 34;
  const top = 26;
  const H = top + lanes.length * (laneH + 8) + 22;
  const x = (yr: number) => ((Math.max(START, yr) - START) / span) * W;
  const decades = Array.from({ length: Math.floor(span / 10) + 1 }, (_, i) => START + 5 + i * 10).filter((d) => d <= end);
  const eras = profile.history.eras.filter((e) => (e.end ?? 9999) > START);
  const roleLabel = (r: 'hos' | 'hog') => (r === 'hos' ? 'Head of state' : 'Head of government');

  return (
    <div>
      {turnover && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {[
            { label: 'Terms since 1945', value: String(turnover.terms) },
            { label: 'Different leaders', value: String(turnover.distinctLeaders) },
            { label: 'Leaders per decade', value: (turnover.terms / (span / 10)).toFixed(1) },
            { label: 'Average tenure', value: `${turnover.avgTenureYears.toFixed(1)} yrs` },
          ].map((k) => (
            <div key={k.label} className={`p-2.5 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-900/40' : 'border-gray-200 bg-gray-50'}`}>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">{k.label}</div>
              <div className={`text-lg font-semibold tabular-nums ${textPrimary}`}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[640px]" role="img" aria-label="Leaders since 1945">
          {eras.map((e, i) => (
            <g key={e.title}>
              <rect x={x(e.start)} y={0} width={Math.max(0, x(e.end ?? end) - x(e.start))} height={H - 18} fill={i % 2 ? (isDarkMode ? '#312e81' : '#e0e7ff') : 'transparent'} opacity={0.35} />
              <text x={x(e.start) + 4} y={12} fontSize={10} fill={isDarkMode ? '#a5b4fc' : '#4f46e5'}>
                {x(e.end ?? end) - x(e.start) > 90 ? e.title : ''}
              </text>
            </g>
          ))}
          {lanes.map((lane, li) => {
            const y = top + li * (laneH + 8);
            return (
              <g key={lane.role}>
                <rect x={0} y={y} width={W} height={laneH} fill={laneBg} rx={4} />
                {lane.terms.map(({ t, color }) => {
                  const x0 = x(toYear(t.start));
                  const x1 = x(t.end ? toYear(t.end) : end);
                  const w = Math.max(1.5, x1 - x0);
                  const surname = t.name.split(' ').slice(-1)[0];
                  return (
                    <g key={`${t.name}-${t.start}`} onMouseEnter={() => setHover(t)} onMouseLeave={() => setHover(null)} style={{ cursor: 'default' }}>
                      <rect
                        x={x0}
                        y={y + 2}
                        width={w}
                        height={laneH - 4}
                        fill={color}
                        opacity={hover && hover !== t ? 0.45 : 0.9}
                        stroke={t.route === 'coup' ? '#111827' : isDarkMode ? '#111827' : '#fff'}
                        strokeWidth={t.route === 'coup' ? 2 : 1}
                        strokeDasharray={t.route === 'coup' ? '3 2' : undefined}
                      />
                      {w > surname.length * 6.2 + 6 && (
                        <text x={x0 + w / 2} y={y + laneH / 2 + 4} textAnchor="middle" fontSize={10.5} fill="#fff" fontWeight={600} pointerEvents="none">
                          {surname}
                        </text>
                      )}
                    </g>
                  );
                })}
                <text x={4} y={y - 2} fontSize={9.5} fill={isDarkMode ? '#9ca3af' : '#6b7280'}>
                  {roleLabel(lane.role)}
                </text>
              </g>
            );
          })}
          {decades.map((d) => (
            <text key={d} x={x(d)} y={H - 4} textAnchor="middle" fontSize={10} fill={isDarkMode ? '#9ca3af' : '#6b7280'}>{d}</text>
          ))}
        </svg>
      </div>

      <div className={`min-h-[2.75rem] mt-1 text-xs ${textSec}`}>
        {hover ? (
          <div>
            <span className={`font-semibold ${textPrimary}`}>{hover.name}</span>
            {hover.party && <span> · {hover.party}</span>}
            <span className="tabular-nums"> · {hover.start.slice(0, 4)}-{hover.end ? hover.end.slice(0, 4) : 'present'} ({yearsInPower(hover.start, hover.end ?? CURATED_LAST_UPDATED).toFixed(1)} yrs)</span>
            <span> · {ROUTE_LABELS[hover.route]}</span>
            {hover.note && <div className="mt-0.5">{hover.note}</div>}
          </div>
        ) : (
          <span>Hover a bar for details. Bars are coloured by party; dashed outlines mark leaders who took power by coup or revolution. Shaded bands are historical eras.</span>
        )}
      </div>

      {history.leadersNote && <p className={`text-[11px] mt-1 ${textSec}`}>{history.leadersNote}</p>}

      <button
        type="button"
        onClick={() => setShowList((s) => !s)}
        className={`mt-2 text-xs underline underline-offset-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
      >
        {showList ? 'Hide list' : 'Show all terms as a list'}
      </button>
      {showList && (
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-xs">
            <thead>
              <tr className={textSec}>
                <th className="text-left py-1 pr-3 font-medium">Leader</th>
                <th className="text-left py-1 pr-3 font-medium">Office</th>
                <th className="text-left py-1 pr-3 font-medium">Party</th>
                <th className="text-left py-1 pr-3 font-medium">Term</th>
                <th className="text-left py-1 font-medium">Route to power</th>
              </tr>
            </thead>
            <tbody>
              {lanes.flatMap((l) => l.terms).sort((a, b) => a.t.start.localeCompare(b.t.start)).map(({ t, color }) => (
                <tr key={`${t.role}-${t.name}-${t.start}`} className={`border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                  <td className={`py-1 pr-3 ${textPrimary}`}>
                    <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: color }} />
                    {t.name}
                  </td>
                  <td className={`py-1 pr-3 ${textSec}`}>{t.role === 'hos' ? 'State' : 'Government'}</td>
                  <td className={`py-1 pr-3 ${textSec}`}>{t.party ?? ''}</td>
                  <td className={`py-1 pr-3 tabular-nums ${textSec}`}>{t.start.slice(0, 4)}-{t.end ? t.end.slice(0, 4) : 'now'}</td>
                  <td className={`py-1 ${textSec}`}>{ROUTE_LABELS[t.route]}{t.note ? ` · ${t.note}` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
