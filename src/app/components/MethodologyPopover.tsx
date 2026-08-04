'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A small "?" pill that opens a popover explaining how a *derived* metric
 * is computed. Anywhere on the site that shows a value we compute
 * ourselves (rather than fetching directly from a source), we surface
 * one of these so the reader can inspect the formula, inputs, and any
 * caveats, and jump to the full write-up in /methodology.
 *
 * Keep the popover text short (< 60 words). Long explanations belong
 * on the anchored /methodology section.
 */
export interface MethodologyPopoverProps {
  /** Anchor slug on /methodology (e.g. "real-policy-rate"). */
  slug: string;
  /** Short label used in the popover header, e.g. "Real policy rate". */
  title: string;
  /**
   * Formula rendered verbatim. Prefer plain-text over KaTeX so we don't
   * need another dependency — a pre-formatted string reads fine.
   */
  formula: string;
  /** 1-2 sentence plain-language description. */
  description: string;
  /**
   * Bullets naming the underlying inputs and their source
   * (e.g. "Policy rate — FRED FEDFUNDS / OECD IRSTCI01").
   */
  inputs: string[];
  isDarkMode?: boolean;
  /** Optional additional classes on the trigger button. */
  className?: string;
}

export default function MethodologyPopover({
  slug,
  title,
  formula,
  description,
  inputs,
  isDarkMode = false,
  className = '',
}: MethodologyPopoverProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={`relative inline-block ${className}`} ref={wrapperRef}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`How is ${title} calculated?`}
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-semibold border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          isDarkMode
            ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
        }`}
      >
        ?
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={`${title} methodology`}
          className={`absolute left-1/2 -translate-x-1/2 z-50 mt-2 w-80 rounded-lg border shadow-lg text-left ${
            isDarkMode
              ? 'bg-gray-900 border-gray-700 text-gray-200'
              : 'bg-white border-gray-200 text-gray-800'
          }`}
        >
          <div
            className={`px-3 py-2 border-b flex items-center justify-between ${
              isDarkMode ? 'border-gray-800' : 'border-gray-100'
            }`}
          >
            <span className="text-xs font-semibold">{title}</span>
            <button
              type="button"
              aria-label="Close methodology popover"
              onClick={() => setOpen(false)}
              className={`text-xs px-1 rounded hover:bg-opacity-80 ${
                isDarkMode
                  ? 'text-gray-500 hover:bg-gray-800'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              ×
            </button>
          </div>
          <div className="p-3 space-y-2">
            <p className="text-xs leading-relaxed">{description}</p>
            <div
              className={`text-[11px] font-mono rounded px-2 py-1.5 whitespace-pre-wrap break-words ${
                isDarkMode ? 'bg-gray-800 text-emerald-300' : 'bg-gray-100 text-emerald-700'
              }`}
            >
              {formula}
            </div>
            {inputs.length > 0 && (
              <div>
                <p
                  className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}
                >
                  Inputs
                </p>
                <ul className="space-y-0.5 text-[11px] list-disc pl-4">
                  {inputs.map((input, i) => (
                    <li key={i}>{input}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div
            className={`px-3 py-2 border-t ${
              isDarkMode ? 'border-gray-800' : 'border-gray-100'
            }`}
          >
            <a
              href={`/methodology#${slug}`}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
            >
              Full definition →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
