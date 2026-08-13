'use client';

import { useEffect, useMemo, useState } from 'react';

export interface TourStep {
  chapter: string;
  title: string;
  body: string;
}

interface GuidedTourProps {
  storageKey: string;
  steps: TourStep[];
  ctaLabel?: string;
  isDarkMode?: boolean;
}

// Hand-rolled coach-marks (no external lib). Dims the background,
// walks the reader through the given steps, and remembers via
// localStorage so it only fires once per browser per storageKey.
// Any component that already knows its 8-chapter narrative can
// re-use this by passing a shared storageKey + step array.
export default function GuidedTour({
  storageKey,
  steps,
  ctaLabel = 'Take the 60-second tour',
  isDarkMode = false,
}: GuidedTourProps) {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => { setReady(true); }, []);

  const hasSeen = useMemo(() => {
    if (typeof window === 'undefined') return true;
    try {
      return window.localStorage.getItem(storageKey) === 'seen';
    } catch { return true; }
  }, [storageKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  function markSeen() {
    if (typeof window === 'undefined') return;
    try { window.localStorage.setItem(storageKey, 'seen'); } catch { /* ignore */ }
  }

  function start() {
    setIndex(0);
    setOpen(true);
  }
  function close() {
    setOpen(false);
    markSeen();
  }
  function next() {
    setIndex(i => (i < steps.length - 1 ? i + 1 : i));
    if (index === steps.length - 1) close();
  }
  function prev() { setIndex(i => (i > 0 ? i - 1 : i)); }

  if (!ready || steps.length === 0) return null;

  const step = steps[index];

  return (
    <>
      {!open && (
        <button
          onClick={start}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            hasSeen
              ? (isDarkMode ? 'border-gray-700 text-gray-400 hover:border-gray-500' : 'border-gray-300 text-gray-500 hover:border-gray-500')
              : (isDarkMode ? 'border-blue-500/40 text-blue-300 hover:bg-blue-500/10' : 'border-blue-400 text-blue-700 hover:bg-blue-50')
          }`}
        >
          {hasSeen ? 'Restart tour' : `${ctaLabel} ▸`}
        </button>
      )}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={close} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tour-step-title"
            className={`relative w-full max-w-md rounded-xl border shadow-xl p-5 ${
              isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <div className={`text-[11px] uppercase tracking-widest mb-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              {step.chapter} · Step {index + 1} of {steps.length}
            </div>
            <h2 id="tour-step-title" className="text-lg font-semibold mb-2">{step.title}</h2>
            <p className={`text-sm leading-relaxed mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{step.body}</p>
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1">
                {steps.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i === index
                        ? (isDarkMode ? 'bg-blue-400' : 'bg-blue-600')
                        : (isDarkMode ? 'bg-gray-700' : 'bg-gray-300')
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  disabled={index === 0}
                  className={`text-xs px-2.5 py-1 rounded border ${
                    isDarkMode ? 'border-gray-700 text-gray-300 hover:border-gray-500 disabled:opacity-40' : 'border-gray-300 text-gray-600 hover:border-gray-500 disabled:opacity-40'
                  }`}
                >Back</button>
                <button
                  onClick={next}
                  className={`text-xs px-3 py-1 rounded font-medium ${
                    isDarkMode ? 'bg-blue-500 text-white hover:bg-blue-400' : 'bg-blue-600 text-white hover:bg-blue-500'
                  }`}
                >{index === steps.length - 1 ? 'Finish' : 'Next'}</button>
                <button
                  onClick={close}
                  className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                  aria-label="Skip tour"
                >Skip</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
