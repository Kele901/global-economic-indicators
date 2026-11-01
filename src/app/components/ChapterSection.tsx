'use client';

import { useEffect, type ReactNode } from 'react';
import LazyMount from './LazyMount';
import type { ChapterAccent } from './ChapterNav';

const EYEBROW: Record<ChapterAccent, [light: string, dark: string]> = {
  emerald: ['text-emerald-600', 'text-emerald-400'],
  purple: ['text-purple-600', 'text-purple-400'],
  amber: ['text-amber-600', 'text-amber-400'],
  violet: ['text-violet-600', 'text-violet-400'],
  sky: ['text-sky-600', 'text-sky-400'],
  rose: ['text-rose-600', 'text-rose-400'],
  indigo: ['text-indigo-600', 'text-indigo-400'],
  blue: ['text-blue-600', 'text-blue-400'],
};

// Render inside a lazy chapter to defer that chapter's data fetch until it scrolls into range.
export function RequestOnMount({ request }: { request: (v: boolean) => void }) {
  useEffect(() => request(true), [request]);
  return null;
}

// One ChapterNav target. The anchor div stays outside LazyMount so the strip
// can scroll to chapters that have not rendered yet.
export default function ChapterSection({
  id,
  index,
  title,
  isDarkMode,
  accent = 'emerald',
  lazy = false,
  children,
}: {
  id: string;
  index: number;
  title: string;
  isDarkMode: boolean;
  accent?: ChapterAccent;
  lazy?: boolean;
  children: ReactNode;
}) {
  const body = (
    <section className="mb-14">
      <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${EYEBROW[accent][isDarkMode ? 1 : 0]}`}>Chapter {index}</div>
      <h2 className={`text-2xl sm:text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      {children}
    </section>
  );
  return (
    <div id={id} className="scroll-mt-16">
      {lazy ? <LazyMount isDarkMode={isDarkMode}>{body}</LazyMount> : body}
    </div>
  );
}
