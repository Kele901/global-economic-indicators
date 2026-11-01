'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { heatmapTheme } from './theme';

interface Props {
  targetRef: RefObject<HTMLElement>;
  filename: string;
  csv: () => (string | number | null)[][];
  isDarkMode: boolean;
}

function download(href: string, name: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function toCsv(rows: (string | number | null)[][]): string {
  return rows
    .map(r => r.map(c => {
      const s = c === null ? '' : String(c);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(','))
    .join('\n');
}

export default function ExportMenu({ targetRef, filename, csv, isDarkMode }: Props) {
  const tc = heatmapTheme(isDarkMode);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const png = async () => {
    if (!targetRef.current) return;
    setBusy(true);
    try {
      const { toPng } = await import('html-to-image');
      const url = await toPng(targetRef.current, {
        backgroundColor: isDarkMode ? '#111827' : '#ffffff',
        pixelRatio: 2,
        filter: node => !(node instanceof HTMLElement && node.dataset.exportIgnore !== undefined),
      });
      download(url, `${filename}.png`);
    } catch (err) {
      console.warn('Heatmap PNG export failed:', err);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  const csvDownload = () => {
    const blob = new Blob([toCsv(csv())], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    download(url, `${filename}.csv`);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <label className={`block text-xs uppercase tracking-wider mb-1 ${tc.textSec}`}>Export</label>
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} disabled={busy}
        className={`px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}>
        {busy ? 'Exporting\u2026' : 'Download \u25BE'}
      </button>
      {open && (
        <div className={`absolute right-0 z-30 mt-1 w-44 rounded-lg border shadow-lg py-1 ${tc.card}`}>
          <button onClick={png} className={`w-full text-left px-3 py-2 text-sm ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>Image of this view (PNG)</button>
          <button onClick={csvDownload} className={`w-full text-left px-3 py-2 text-sm ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>Data for this year (CSV)</button>
        </div>
      )}
    </div>
  );
}
