'use client';

// Ratings + CDS card grid. Joins the S&P / Moody's / Fitch letter
// grades with the 5-year CDS spread snapshot from debtCurated. Each
// card shows the "colour of money" — a coloured stripe on the left
// reflecting the composite score.

import { useMemo, useState } from 'react';
import { SOVEREIGN_RATINGS_2025, SOVEREIGN_CDS_SEP_2025 } from '../services/debtCurated';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

const TITLE = 'Ratings & CDS Grid';

interface Props {
  isDarkMode: boolean;
}

type SortKey = 'score' | 'cds' | 'name';

function scoreColor(s: number): string {
  if (s >= 90) return '#16a34a';
  if (s >= 70) return '#84cc16';
  if (s >= 50) return '#eab308';
  if (s >= 30) return '#f97316';
  return '#dc2626';
}
function outlookLabel(o: string) {
  const map: Record<string, { label: string; cls: string }> = {
    positive:   { label: 'Positive',   cls: 'bg-emerald-500/10 text-emerald-500' },
    stable:     { label: 'Stable',     cls: 'bg-blue-500/10 text-blue-500' },
    negative:   { label: 'Negative',   cls: 'bg-rose-500/10 text-rose-500' },
    developing: { label: 'Developing', cls: 'bg-amber-500/10 text-amber-500' },
  };
  return map[o] ?? map.stable;
}

export default function RatingsAndCdsGrid({ isDarkMode }: Props) {
  const [sort, setSort] = useState<SortKey>('score');
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const joined = useMemo(() => {
    return SOVEREIGN_RATINGS_2025.map(r => {
      const cds = SOVEREIGN_CDS_SEP_2025.find(c => c.iso3 === r.iso3);
      return { ...r, cds };
    });
  }, []);

  const sorted = useMemo(() => {
    const s = [...joined];
    if (sort === 'score') s.sort((a, b) => b.score - a.score);
    else if (sort === 'cds') s.sort((a, b) => (b.cds?.spreadBps ?? -1) - (a.cds?.spreadBps ?? -1));
    else s.sort((a, b) => a.name.localeCompare(b.name));
    return s;
  }, [joined, sort]);

  const btnBase = 'text-xs px-3 py-1.5 rounded-md border transition-colors';
  const btnActive = isDarkMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-blue-600 border-blue-600 text-white';
  const btnIdle = isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white' : 'bg-white border-gray-200 text-gray-700 hover:text-gray-900';

  return (
    <div id={slugify(TITLE)} className={`rounded-xl border p-4 sm:p-6 ${cardBg}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className={`text-base sm:text-lg font-semibold ${text}`}>{TITLE}</h3>
          <p className={`text-xs ${muted}`}>S&amp;P / Moody&apos;s / Fitch letter grades (mid-2025) alongside 5Y CDS spreads (Sep-2025).</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className={`${btnBase} ${sort === 'score' ? btnActive : btnIdle}`} onClick={() => setSort('score')} aria-pressed={sort === 'score'}>Sort: Score</button>
          <button className={`${btnBase} ${sort === 'cds'   ? btnActive : btnIdle}`} onClick={() => setSort('cds')}   aria-pressed={sort === 'cds'}>Sort: CDS</button>
          <button className={`${btnBase} ${sort === 'name'  ? btnActive : btnIdle}`} onClick={() => setSort('name')}  aria-pressed={sort === 'name'}>Sort: A→Z</button>
          <SocialShareMenu title={TITLE} isDarkMode={isDarkMode} subject="dataset" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map(r => {
          const ol = outlookLabel(r.outlookSp);
          return (
            <div key={r.iso3} className={`relative rounded-lg border p-3 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} overflow-hidden`}>
              <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: scoreColor(r.score) }} aria-hidden="true" />
              <div className="pl-2">
                <div className="flex items-center justify-between mb-2">
                  <div className={`text-sm font-semibold ${text}`}>{r.name}</div>
                  <div className={`text-xs px-2 py-0.5 rounded ${ol.cls}`}>{ol.label}</div>
                </div>
                <div className={`grid grid-cols-3 gap-1 text-[11px] tabular-nums ${muted}`}>
                  <div><span className="uppercase tracking-wider block text-[9px]">S&amp;P</span><span className={text}>{r.sp}</span></div>
                  <div><span className="uppercase tracking-wider block text-[9px]">Moody&apos;s</span><span className={text}>{r.moodys}</span></div>
                  <div><span className="uppercase tracking-wider block text-[9px]">Fitch</span><span className={text}>{r.fitch}</span></div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <div className={`text-[10px] uppercase tracking-wider ${muted}`}>5Y CDS</div>
                    <div className={`text-lg font-semibold tabular-nums ${text}`}>
                      {r.cds && r.cds.spreadBps > 0 ? `${r.cds.spreadBps} bps` : '—'}
                    </div>
                  </div>
                  {r.cds && r.cds.spreadBps > 0 && (
                    <div className={`text-xs tabular-nums ${r.cds.changeYtdBps >= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {r.cds.changeYtdBps >= 0 ? '▲' : '▼'} {Math.abs(r.cds.changeYtdBps)} bps YTD
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
