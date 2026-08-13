'use client';

// Small "You've visited X/24 pages" pill for the Navbar Info dropdown.
// Uses useSiteProgress to stay in sync with RouteTracker's writes.

import { useSiteProgress } from '../hooks/useSiteProgress';

interface Props { isDarkMode?: boolean; }

export default function ExploreProgressBadge({ isDarkMode }: Props) {
  const { visited, total, reset } = useSiteProgress();
  const count = Math.min(visited.length, total);
  const pct = Math.round((count / total) * 100);

  const bg = isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600';

  return (
    <div className={`mt-2 mx-2 mb-1 rounded-md border px-3 py-2 text-xs ${bg}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold">Site explored</span>
        <span className="tabular-nums">{count}/{total}</span>
      </div>
      <div className={`h-1.5 rounded-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
        <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
      </div>
      {count > 0 && (
        <button
          onClick={reset}
          className={`mt-2 text-[10px] uppercase tracking-wider hover:underline ${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Reset progress
        </button>
      )}
    </div>
  );
}
