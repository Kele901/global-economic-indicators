'use client';

import { useEffect, useState } from 'react';

export interface NavChapter {
  id: string;
  label: string;
}

// Sticky in-page chapter menu. Targets are page-level wrappers that exist
// before their LazyMount children render, so every link can scroll.
export default function ChapterNav({ isDarkMode, chapters }: { isDarkMode: boolean; chapters: NavChapter[] }) {
  const [active, setActive] = useState(chapters[0]?.id);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    for (const c of chapters) {
      const el = document.getElementById(c.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [chapters]);

  return (
    <nav
      aria-label="Chapters"
      className={`sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 mb-8 backdrop-blur border-b ${
        isDarkMode ? 'bg-gray-900/85 border-gray-800' : 'bg-gray-50/90 border-gray-200'
      }`}
    >
      <ol className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {chapters.map((c, i) => (
          <li key={c.id} className="shrink-0">
            <a
              href={`#${c.id}`}
              aria-current={active === c.id ? 'true' : undefined}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border whitespace-nowrap transition-colors ${
                active === c.id
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : isDarkMode
                    ? 'border-gray-700 text-gray-300 hover:border-gray-500'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <span className="tabular-nums opacity-70">{i + 1}</span>
              {c.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
