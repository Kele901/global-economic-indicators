'use client';

import { useMemo, useState } from 'react';
import { CURATED_LAST_UPDATED, type PoliticalProfile } from '../services/politicsCurated';

interface Props {
  isDarkMode: boolean;
  profile: PoliticalProfile;
}

const ERA_COLORS = ['#6366f1', '#0ea5e9', '#14b8a6', '#f59e0b', '#ef4444', '#a855f7', '#22c55e', '#ec4899'];

export default function PoliticalHistoryTimeline({ isDarkMode, profile }: Props) {
  const [activeEra, setActiveEra] = useState<number | null>(null);
  const nowYear = Number(CURATED_LAST_UPDATED.slice(0, 4));
  const eras = profile.history.eras;
  const start = eras[0]?.start ?? nowYear;
  const span = Math.max(1, nowYear - start);

  const events = useMemo(() => {
    const sorted = [...profile.history.keyEvents].sort((a, b) => a.year - b.year);
    if (activeEra == null) return sorted;
    const e = eras[activeEra];
    return sorted.filter((k) => k.year >= e.start && k.year <= (e.end ?? nowYear));
  }, [profile, activeEra, eras, nowYear]);

  const card = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div>
      <div className="relative h-10 rounded-md overflow-hidden flex" role="list" aria-label="Political eras">
        {eras.map((e, i) => {
          const end = e.end ?? nowYear;
          const w = Math.max(2, ((end - e.start) / span) * 100);
          return (
            <button
              key={`${e.start}-${e.title}`}
              type="button"
              role="listitem"
              onClick={() => setActiveEra(activeEra === i ? null : i)}
              className="h-full text-[10px] text-white font-medium px-1 truncate transition-opacity"
              style={{ width: `${w}%`, backgroundColor: ERA_COLORS[i % ERA_COLORS.length], opacity: activeEra == null || activeEra === i ? 1 : 0.35 }}
              title={`${e.title} (${e.start}–${e.end ?? 'present'})`}
            >
              {e.title}
            </button>
          );
        })}
      </div>
      <div className={`flex justify-between text-[10px] mt-1 tabular-nums ${textSec}`}>
        <span>{start}</span>
        <span>{nowYear}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
        <div className="space-y-3">
          {eras.map((e, i) => (
            <button
              key={`${e.start}-${e.title}`}
              type="button"
              onClick={() => setActiveEra(activeEra === i ? null : i)}
              className={`w-full text-left rounded-lg border p-3 transition-shadow ${card} ${activeEra === i ? 'ring-2 ring-indigo-400' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ERA_COLORS[i % ERA_COLORS.length] }} />
                <span className={`font-semibold text-sm ${textPrimary}`}>{e.title}</span>
                <span className={`text-[11px] ml-auto tabular-nums ${textSec}`}>{e.start}–{e.end ?? 'present'}</span>
              </div>
              <p className={`text-xs mt-1 ${textSec}`}>{e.summary}</p>
            </button>
          ))}
        </div>

        <div>
          <div className={`text-[11px] uppercase tracking-wider mb-2 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
            Turning points{activeEra != null ? ` · ${eras[activeEra].title}` : ''}
          </div>
          <ol className="relative border-l-2 ml-1.5 space-y-3" style={{ borderColor: isDarkMode ? '#4338ca' : '#c7d2fe' }}>
            {events.map((k) => (
              <li key={`${k.year}-${k.event}`} className="ml-4 relative">
                <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-indigo-500 border-2" style={{ borderColor: isDarkMode ? '#111827' : '#fff' }} aria-hidden />
                <div className="flex items-baseline gap-2">
                  <span className={`text-xs font-bold tabular-nums ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>{k.year}</span>
                  <span className={`text-sm font-medium ${textPrimary}`}>{k.event}</span>
                </div>
                <p className={`text-xs ${textSec}`}>{k.significance}</p>
              </li>
            ))}
            {events.length === 0 && <li className={`ml-4 text-xs ${textSec}`}>No highlighted events in this era.</li>}
          </ol>
        </div>
      </div>
    </div>
  );
}
