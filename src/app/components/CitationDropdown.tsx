'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Format = 'apa' | 'mla' | 'chicago' | 'bibtex' | 'url';

const FORMAT_LABEL: Record<Format, string> = {
  apa:     'APA',
  mla:     'MLA',
  chicago: 'Chicago',
  bibtex:  'BibTeX',
  url:     'URL',
};

const SITE_TITLE = 'Global Economic Indicators';
const SITE_ORIGIN = 'https://www.globaleconindicators.info';

function toBibKey(url: string): string {
  const slug = url.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '');
  return `gei_${slug || 'home'}`;
}

function format(format: Format, title: string, url: string): string {
  const today = new Date();
  const iso = today.toISOString().slice(0, 10);
  const long = today.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const year = today.getFullYear();
  switch (format) {
    case 'apa':
      return `${SITE_TITLE}. (${year}). ${title}. Retrieved ${long}, from ${url}`;
    case 'mla':
      return `"${title}." ${SITE_TITLE}, ${long}, ${url}. Accessed ${long}.`;
    case 'chicago':
      return `${SITE_TITLE}. "${title}." Last modified ${long}. ${url}.`;
    case 'bibtex':
      return [
        `@misc{${toBibKey(url)},`,
        `  title  = {${title}},`,
        `  author = {{${SITE_TITLE}}},`,
        `  year   = {${year}},`,
        `  url    = {${url}},`,
        `  note   = {Accessed ${iso}}`,
        `}`,
      ].join('\n');
    case 'url':
      return url;
  }
}

interface Props { isDarkMode?: boolean; }

export default function CitationDropdown({ isDarkMode = false }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Format>('apa');
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const { title, url } = useMemo(() => {
    if (typeof window === 'undefined' || !ready) {
      return { title: SITE_TITLE, url: SITE_ORIGIN };
    }
    const path = window.location.pathname;
    const canonical = `${SITE_ORIGIN}${path === '/' ? '' : path}`;
    return { title: document.title || SITE_TITLE, url: canonical };
  }, [ready]);

  const citation = format(active, title, url);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — no-op
    }
  };

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`text-xs px-3 py-1.5 rounded border transition-colors ${
          isDarkMode
            ? 'border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 bg-gray-900'
            : 'border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-500 bg-white'
        }`}
      >
        Cite this page ▾
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute right-0 mt-2 w-[min(92vw,420px)] z-40 rounded-md border shadow-lg p-3 ${
            isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
          }`}
        >
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(Object.keys(FORMAT_LABEL) as Format[]).map(f => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`text-[11px] px-2 py-1 rounded border ${
                  active === f
                    ? (isDarkMode ? 'bg-white text-gray-900 border-white' : 'bg-gray-900 text-white border-gray-900')
                    : (isDarkMode ? 'border-gray-700 text-gray-300 hover:border-gray-500' : 'border-gray-300 text-gray-600 hover:border-gray-500')
                }`}
              >
                {FORMAT_LABEL[f]}
              </button>
            ))}
          </div>
          <pre className={`text-xs whitespace-pre-wrap break-words rounded-md p-2 border max-h-40 overflow-auto ${
            isDarkMode ? 'bg-gray-950 border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
          }`}>
{citation}
          </pre>
          <div className="mt-2 flex items-center justify-between">
            <span className={`text-[11px] ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Auto-fills title + URL + today&apos;s date.
            </span>
            <button
              onClick={copy}
              className={`text-xs px-2.5 py-1 rounded border ${
                isDarkMode ? 'border-gray-700 text-gray-200 hover:border-gray-500' : 'border-gray-300 text-gray-700 hover:border-gray-500'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
