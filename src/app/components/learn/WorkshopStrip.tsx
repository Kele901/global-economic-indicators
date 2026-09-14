'use client';

// Shortcut strip for the four workshops. They live inside lessons, which
// is the right place for them pedagogically and a terrible place to find
// them, so this sits under the hero and deep-links straight in.
//
// Built from the lesson list rather than a hardcoded array, so a workshop
// added to a lesson shows up here automatically.

import { LESSONS } from '../../learn/lessons';

interface Props { isDarkMode: boolean; }

const BLURBS: Record<string, string> = {
  buildIndex:    'Choose the weights and watch the country ranking rearrange.',
  balanceBudget: 'Cut spending, raise taxes, try to fix the deficit without tanking growth.',
  centralBanker: 'Twelve quarters of rate decisions, with a two-quarter lag working against you.',
  chartGame:     'Five charts, five tricks. Name what is wrong with each one.',
};

const ICONS: Record<string, string> = {
  buildIndex: '⚖️',
  balanceBudget: '🧮',
  centralBanker: '🏦',
  chartGame: '🔍',
};

export default function WorkshopStrip({ isDarkMode }: Props) {
  const workshops = LESSONS.filter(l => l.workshopKey);
  if (workshops.length === 0) return null;

  const card = isDarkMode
    ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
    : 'bg-white border-gray-200 hover:border-purple-400';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <section className="mb-12 print:hidden">
      <div className={`text-[11px] uppercase tracking-[0.2em] font-semibold mb-1 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
        Workshops
      </div>
      <p className={`text-sm mb-4 ${muted}`}>
        Four sandboxes where you make the decisions instead of reading about them. Each one lives
        inside the lesson it belongs to — these jump straight there.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {workshops.map(l => (
          <a
            key={l.id}
            href={`#lesson-${l.id}`}
            className={`rounded-lg border p-3.5 transition-colors block ${card}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0" aria-hidden>{ICONS[l.workshopKey!] ?? '🧪'}</span>
              <div className="min-w-0">
                <div className={`text-sm font-semibold ${text}`}>
                  {(l.workshopTitle ?? 'Workshop').replace(/^Workshop: /, '')
                    .replace(/^./, c => c.toUpperCase())}
                </div>
                <div className={`text-xs mt-0.5 ${muted}`}>{BLURBS[l.workshopKey!] ?? ''}</div>
                <div className={`text-[10px] mt-1.5 ${muted}`}>
                  Lesson {l.order} · {l.title}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
