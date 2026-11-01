'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getExplainer } from '../../utils/heatmap/explainers';
import { heatmapTheme } from './theme';

interface Props {
  metric: string;
  label: string;
  isDarkMode: boolean;
}

export default function MetricExplainer({ metric, label, isDarkMode }: Props) {
  const tc = heatmapTheme(isDarkMode);
  const [open, setOpen] = useState(false);
  const e = getExplainer(metric);
  return (
    <section className={`rounded-xl border mb-6 px-4 sm:px-6 py-3 ${tc.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`block text-xs uppercase tracking-wider ${tc.textSec}`}>About this metric: <span className="normal-case tracking-normal font-semibold">{label}</span></span>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{e.what}</p>
        </div>
        <button onClick={() => setOpen(o => !o)} aria-expanded={open}
          className={`shrink-0 flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border ${tc.chip}`}>
          {open ? 'Less' : 'How to read it'}
          <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
      {open && (
        <div className="pt-3">
          <div className="grid gap-2 sm:grid-cols-3 text-sm">
            <div className={`p-3 rounded-lg ${tc.subtle}`}>
              <p className={`text-[11px] uppercase tracking-wider mb-1 ${tc.textSec}`}>Reading high</p>
              <p>{e.high}</p>
            </div>
            <div className={`p-3 rounded-lg ${tc.subtle}`}>
              <p className={`text-[11px] uppercase tracking-wider mb-1 ${tc.textSec}`}>Reading low</p>
              <p>{e.low}</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
              <p className={`text-[11px] uppercase tracking-wider mb-1 ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>Watch out</p>
              <p>{e.caveat}</p>
            </div>
          </div>
          <Link href={e.link.href} className={`inline-block mt-3 text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
            Learn more: {e.link.label} &rarr;
          </Link>
        </div>
      )}
    </section>
  );
}
