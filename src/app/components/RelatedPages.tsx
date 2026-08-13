'use client';

// RelatedPages chip row. Rendered at the bottom of ledger + explore
// pages using the curated adjacency map in data/relatedPages.ts.

import { RELATED_PAGES } from '../data/relatedPages';

interface Props {
  currentPath: string;
  isDarkMode: boolean;
}

export default function RelatedPages({ currentPath, isDarkMode }: Props) {
  const related = RELATED_PAGES[currentPath];
  if (!related || related.length === 0) return null;

  const chipCls = isDarkMode
    ? 'bg-gray-800 border-gray-700 text-gray-200 hover:border-blue-500 hover:text-white'
    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-gray-900';

  return (
    <nav aria-label="Related pages" className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div className={`text-[11px] uppercase tracking-[0.2em] mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Related</div>
      <div className="flex flex-wrap gap-2">
        {related.map(r => (
          <a
            key={r.href}
            href={r.href}
            className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${chipCls}`}
          >
            <span aria-hidden>→</span>
            {r.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
