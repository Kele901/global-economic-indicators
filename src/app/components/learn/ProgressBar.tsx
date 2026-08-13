'use client';

// Sticky top progress bar for the /learn page. Shows overall lesson
// progress as a percentage plus a small badge when the wrap-up quiz
// has been passed.

interface Props {
  completed: number;
  total: number;
  wrapUpDone: boolean;
  isDarkMode: boolean;
}

export default function ProgressBar({ completed, total, wrapUpDone, isDarkMode }: Props) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      className={`sticky top-0 z-40 backdrop-blur border-b print:hidden transition-colors ${
        isDarkMode ? 'bg-gray-900/85 border-gray-700 text-gray-200' : 'bg-white/85 border-gray-200 text-gray-800'
      }`}
      role="region"
      aria-label="Course progress"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-4">
        <span className="text-xs uppercase tracking-wider text-blue-500 font-semibold shrink-0" aria-hidden>Learn</span>
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#16a34a' : '#3b82f6' }}
            aria-hidden
          />
        </div>
        <div className="text-xs tabular-nums shrink-0" aria-live="polite">
          {completed}/{total} lessons · {pct}%
        </div>
        {wrapUpDone && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 shrink-0"
            aria-label="Wrap-up quiz complete"
          >
            🏆 Certified
          </span>
        )}
      </div>
    </div>
  );
}
