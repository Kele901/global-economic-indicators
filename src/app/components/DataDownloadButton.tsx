'use client';

// Small, generic "download the underlying data" button. Unlike
// ChartDownloadButton (which rasterises the visible chart), this one
// serialises the raw tabular data behind the visualisation. Two formats:
//   * CSV — first row is header, every subsequent row is a data point
//   * JSON — pretty-printed, top-level array of objects
//
// Consumers just pass a lazy `getData` closure returning an object[].
// Kept schema-free so every ledger can wire it without adaptation.

import { useContext, useEffect, useRef, useState } from 'react';
import SocialShareMenu, { ShareScopeContext } from './SocialShareMenu';
interface DataDownloadButtonProps {
  /** Called only when the user clicks a format; keeps large datasets lazy. */
  getData: () => Record<string, unknown>[];
  /** Base filename (no extension). Defaults to "data". */
  filename?: string;
  /** Optional label override for the trigger. */
  label?: string;
  isDarkMode?: boolean;
  /** Visual size — matches ChartDownloadButton's `sm/md/lg`. */
  size?: 'sm' | 'md';
  className?: string;
  /** Title used when sharing; defaults to the page title. */
  shareTitle?: string;
}

type Format = 'csv' | 'json';

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  // Union all keys — some rows may have sparse columns.
  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach(k => set.add(k));
      return set;
    }, new Set<string>()),
  );

  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    const s = typeof v === 'string' ? v : JSON.stringify(v);
    // Quote and double-up any embedded quotes if there's a comma, quote, or newline.
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
  ];
  return lines.join('\n');
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after a tick so the browser has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function DataDownloadButton({
  getData,
  filename = 'data',
  label = 'Data',
  isDarkMode = false,
  size = 'sm',
  className = '',
  shareTitle,
}: DataDownloadButtonProps) {
  const [open, setOpen] = useState(false);
  const inChartCard = useContext(ShareScopeContext);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const handleExport = (format: Format) => {
    try {
      const rows = getData();
      if (!Array.isArray(rows) || rows.length === 0) {
        console.warn('[DataDownloadButton] getData returned no rows');
        setOpen(false);
        return;
      }
      if (format === 'csv') {
        download(`${filename}.csv`, toCsv(rows), 'text/csv');
      } else {
        download(`${filename}.json`, JSON.stringify(rows, null, 2), 'application/json');
      }
    } catch (err) {
      console.warn('[DataDownloadButton] export failed', err);
    } finally {
      setOpen(false);
    }
  };

  const sizeClasses =
    size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs';

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
    {!inChartCard && (
      <SocialShareMenu title={shareTitle} isDarkMode={isDarkMode} subject="dataset" size={size} />
    )}
    <div className="relative inline-block" ref={menuRef}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Download ${label} as CSV or JSON`}
        onClick={() => setOpen(o => !o)}
        className={`${sizeClasses} inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-transparent ${
          isDarkMode
            ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
          />
        </svg>
        {label}
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute right-0 mt-1 w-36 rounded-md border shadow-lg z-50 ${
            isDarkMode
              ? 'bg-gray-900 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => handleExport('csv')}
            className={`w-full text-left px-3 py-2 text-xs font-medium ${
              isDarkMode
                ? 'text-gray-200 hover:bg-gray-800'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Download CSV
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => handleExport('json')}
            className={`w-full text-left px-3 py-2 text-xs font-medium border-t ${
              isDarkMode
                ? 'text-gray-200 border-gray-800 hover:bg-gray-800'
                : 'text-gray-700 border-gray-100 hover:bg-gray-50'
            }`}
          >
            Download JSON
          </button>
        </div>
      )}
    </div>
    </div>
  );
}
