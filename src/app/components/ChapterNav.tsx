'use client';

import { useEffect, useState } from 'react';

export interface NavChapter {
  id: string;
  label: string;
}

export type ChapterAccent = 'emerald' | 'purple' | 'amber' | 'violet' | 'sky' | 'rose' | 'indigo' | 'blue';

// Full class strings so Tailwind can see them at build time.
const ACTIVE: Record<ChapterAccent, string> = {
  emerald: 'bg-emerald-600 text-white border-emerald-600',
  purple: 'bg-purple-600 text-white border-purple-600',
  amber: 'bg-amber-600 text-white border-amber-600',
  violet: 'bg-violet-600 text-white border-violet-600',
  sky: 'bg-sky-600 text-white border-sky-600',
  rose: 'bg-rose-600 text-white border-rose-600',
  indigo: 'bg-indigo-600 text-white border-indigo-600',
  blue: 'bg-blue-600 text-white border-blue-600',
};

// Sticky in-page chapter menu. Targets are page-level wrappers that exist
// before their LazyMount children render, so every link can scroll.
export default function ChapterNav({
  isDarkMode,
  chapters,
  accent = 'emerald',
}: {
  isDarkMode: boolean;
  chapters: NavChapter[];
  accent?: ChapterAccent;
}) {
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

  // Lazy chapters and charts above a deep-linked target keep changing height
  // while they mount and load, so re-align until the layout settles or the
  // reader takes over scrolling.
  useEffect(() => {
    let timers: number[] = [];
    const stop = () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];
    };
    const align = () => {
      stop();
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id || !chapters.some((c) => c.id === id)) return;
      setActive(id);
      timers = [300, 800, 1500, 2500].map((ms) =>
        window.setTimeout(() => document.getElementById(id)?.scrollIntoView(), ms)
      );
    };
    const events = ['wheel', 'touchstart', 'keydown'] as const;
    align();
    window.addEventListener('hashchange', align);
    events.forEach((e) => window.addEventListener(e, stop, { passive: true }));
    return () => {
      stop();
      window.removeEventListener('hashchange', align);
      events.forEach((e) => window.removeEventListener(e, stop));
    };
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
                  ? ACTIVE[accent]
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
