'use client';

import { useMemo } from 'react';
import { COUNTRY_DISPLAY_NAMES, type CountryKey } from '../../utils/countryMappings';
import { COUNTRY_GROUPS, getGroup, groupStats } from '../../utils/heatmap/groups';
import type { CountryValues } from '../../utils/heatmap/values';
import { heatmapTheme } from './theme';

export function GroupSelect({ groupId, isDarkMode, onChange }: { groupId: string | null; isDarkMode: boolean; onChange: (id: string | null) => void }) {
  const tc = heatmapTheme(isDarkMode);
  return (
    <div className="min-w-[150px]">
      <label className={`block text-xs uppercase tracking-wider mb-1 ${tc.textSec}`}>Group lens</label>
      <select value={groupId ?? ''} onChange={e => onChange(e.target.value || null)}
        className={`w-full px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}>
        <option value="">All countries</option>
        <optgroup label="Blocs">
          {COUNTRY_GROUPS.filter(g => g.kind === 'bloc').map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
        </optgroup>
        <optgroup label="Regions">
          {COUNTRY_GROUPS.filter(g => g.kind === 'region').map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
        </optgroup>
      </select>
    </div>
  );
}

interface Props {
  groupId: string;
  values: CountryValues;
  format: (v: number) => string;
  isDarkMode: boolean;
  onSelectCountry: (country: CountryKey) => void;
  onGroupChange: (id: string) => void;
}

export default function GroupLens({ groupId, values, format, isDarkMode, onSelectCountry, onGroupChange }: Props) {
  const tc = heatmapTheme(isDarkMode);
  const group = getGroup(groupId);
  const stats = useMemo(() => (group ? groupStats(values, group.members) : null), [group, values]);
  const kind = group?.kind ?? 'bloc';
  const comparison = useMemo(() => {
    return COUNTRY_GROUPS.filter(g => g.kind === kind)
      .map(g => ({ g, s: groupStats(values, g.members) }))
      .filter((x): x is { g: typeof x.g; s: NonNullable<typeof x.s> } => x.s !== null)
      .sort((a, b) => b.s.mean - a.s.mean);
  }, [kind, values]);
  if (!group) return null;

  const lo = Math.min(0, ...comparison.map(c => c.s.mean));
  const hi = Math.max(0, ...comparison.map(c => c.s.mean));
  const span = hi - lo || 1;

  return (
    <section aria-label="Group lens" className={`rounded-xl border p-4 mb-4 ${tc.card}`}>
      <div className="flex items-baseline justify-between gap-2 flex-wrap mb-3">
        <h2 className="font-semibold">{group.label}</h2>
        <span className={`text-xs ${tc.textSec}`}>{stats ? `${stats.count} of ${group.members.length} members reporting` : 'No members reporting for this year'}</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {stats ? (
          <div className="grid grid-cols-2 gap-2 text-sm content-start">
            {[
              ['Average', format(stats.mean)],
              ['Median', format(stats.median)],
            ].map(([k, v]) => (
              <div key={k} className={`p-3 rounded-lg ${tc.subtle}`}>
                <p className={`text-[11px] uppercase tracking-wider ${tc.textSec}`}>{k}</p>
                <p className="text-lg font-semibold">{v}</p>
              </div>
            ))}
            {([['Highest', stats.top], ['Lowest', stats.bottom]] as const).map(([k, item]) => (
              <button key={k} onClick={() => onSelectCountry(item.country)} className={`text-left p-3 rounded-lg ${tc.subtle} hover:ring-1 hover:ring-blue-500/40`}>
                <p className={`text-[11px] uppercase tracking-wider ${tc.textSec}`}>{k}</p>
                <p className="font-semibold">{COUNTRY_DISPLAY_NAMES[item.country]}</p>
                <p className={`text-xs ${tc.textSec}`}>{format(item.value)}</p>
              </button>
            ))}
          </div>
        ) : <div />}
        <div>
          <p className={`text-xs uppercase tracking-wider mb-2 ${tc.textSec}`}>{kind === 'bloc' ? 'Bloc' : 'Region'} averages compared</p>
          <div className="space-y-1">
            {comparison.map(({ g, s }) => {
              const active = g.id === group.id;
              const left = s.mean >= 0 ? ((0 - lo) / span) * 100 : ((s.mean - lo) / span) * 100;
              return (
                <button key={g.id} onClick={() => onGroupChange(g.id)} className="w-full flex items-center gap-2 text-xs">
                  <span className={`w-36 shrink-0 text-left truncate ${active ? 'font-bold' : ''}`}>{g.label}</span>
                  <span className={`relative flex-1 h-4 rounded ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                    <span className={`absolute top-0 h-full rounded ${active ? 'bg-amber-500' : (isDarkMode ? 'bg-blue-500/70' : 'bg-blue-400')}`}
                      style={{ left: `${left}%`, width: `${Math.max((Math.abs(s.mean) / span) * 100, 0.5)}%` }} />
                  </span>
                  <span className="w-16 shrink-0 text-right tabular-nums">{format(s.mean)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
