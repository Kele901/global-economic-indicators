'use client';

// AI regulation timeline. Vertical timeline of AI regulation events
// 2023-2025, filterable by impact severity or region.

import { useMemo, useState } from 'react';
import { AI_REGULATION_TIMELINE } from '../services/aiCurated';

interface Props {
  isDarkMode: boolean;
}

type ImpactFilter = 'all' | 'systemic' | 'sector' | 'signal';

const IMPACT_COLORS: Record<string, string> = {
  systemic: '#dc2626',
  sector:   '#f97316',
  signal:   '#3b82f6',
};

const CATEGORY_LABEL: Record<string, string> = {
  law: 'Law',
  executive: 'Executive',
  institute: 'Institute',
  framework: 'Framework',
  court: 'Court',
};

export default function AiRegulationTimeline({ isDarkMode }: Props) {
  const [filter, setFilter] = useState<ImpactFilter>('all');

  const events = useMemo(() => {
    const list = filter === 'all' ? AI_REGULATION_TIMELINE : AI_REGULATION_TIMELINE.filter(e => e.impact === filter);
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [filter]);

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const btnBase = 'text-xs px-3 py-1.5 rounded-md border transition-colors';
  const btnActive = isDarkMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-blue-600 border-blue-600 text-white';
  const btnIdle = isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white' : 'bg-white border-gray-200 text-gray-700 hover:text-gray-900';

  return (
    <div className={`rounded-xl border p-4 sm:p-6 ${cardBg}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className={`text-base sm:text-lg font-semibold ${text}`}>AI Regulation Timeline</h3>
          <p className={`text-xs ${muted}`}>Landmark AI laws, executive orders, safety institutes and international frameworks 2023-2025.</p>
        </div>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter regulation events by impact">
          {(['all', 'systemic', 'sector', 'signal'] as ImpactFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`${btnBase} ${filter === f ? btnActive : btnIdle}`}
              aria-pressed={filter === f}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <ol className="relative border-l ml-3" style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
        {events.map((e, i) => (
          <li key={`${e.date}-${i}`} className="mb-6 ml-6">
            <span
              className="absolute -left-2 w-4 h-4 rounded-full ring-4"
              style={{ backgroundColor: IMPACT_COLORS[e.impact], boxShadow: isDarkMode ? '0 0 0 4px #1f2937' : '0 0 0 4px #fff' }}
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-baseline gap-2 mb-1">
              <time className={`text-sm font-semibold tabular-nums ${text}`}>{e.date}</time>
              <span className={`text-sm font-medium ${text}`}>{e.title}</span>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>{e.region}</span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: `${IMPACT_COLORS[e.impact]}22`, color: IMPACT_COLORS[e.impact] }}>{e.impact} · {CATEGORY_LABEL[e.category]}</span>
            </div>
            <p className={`text-sm ${muted}`}>{e.summary}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
