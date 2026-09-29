'use client';

// Small dismissable banner shown at the top of the dashboard the
// first time a visitor lands, directing them to the /learn starter
// guide. Persists dismissal in localStorage so it doesn't nag
// returning users. Rendered client-side (localStorage guard).

import { useEffect, useState } from 'react';

const KEY = 'learn_banner_dismissed_v1';

export default function LearnBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const dismissed = window.localStorage.getItem(KEY);
      if (!dismissed) setVisible(true);
    } catch {
      // Ignore storage failures — banner just stays hidden.
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { window.localStorage.setItem(KEY, '1'); } catch { /* ignore */ }
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Beginner\u2019s guide callout"
      className="max-w-7xl mx-auto mb-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/20 px-4 py-3 flex items-start sm:items-center gap-3"
    >
      <span className="text-2xl shrink-0" aria-hidden>🎓</span>
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <div className="flex-1 text-sm text-gray-800 dark:text-gray-200">
          <span className="font-semibold">New to economics?</span>{' '}
          Start with our beginner&apos;s guide for ages 13+ — plain-English lessons, quick demos, and a printable certificate.
        </div>
        <a
          href="/learn"
          className="self-start sm:self-auto text-xs font-semibold px-3 py-2.5 sm:py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0"
        >
          Start learning →
        </a>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss beginner\u2019s guide banner"
        className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white shrink-0 p-1"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
