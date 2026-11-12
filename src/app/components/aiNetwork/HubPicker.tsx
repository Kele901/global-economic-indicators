'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import CountryFlag from '../CountryFlag';
import type { NetworkDataset } from '../../services/network/types';
import { matchesQuery, shortName, stackOrder as sortByStack } from '../../utils/aiNetwork/network';

// Fallback for browsers or embedded webviews that deny the async Clipboard API.
function legacyCopy(text: string): boolean {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(ta);
  }
}

interface Props {
  isDarkMode: boolean;
  dataset: NetworkDataset;
  hubId: string;
  onRecentre: (id: string) => void;
  shareUrl: (id: string) => string;
}

export default function HubPicker({ isDarkMode, dataset, hubId, onRecentre, shareUrl }: Props) {
  const { companies, categories, categoryById: CATEGORY_BY_ID, companyById: byId, quickPicks } = dataset;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const comboRef = useRef<HTMLDivElement>(null);

  const stackOrder = useMemo(
    () => sortByStack(companies, categories.map((c) => c.id)),
    [companies, categories],
  );
  const options = useMemo(
    () => (query.trim() ? stackOrder.filter((c) => matchesQuery(c, query)) : stackOrder),
    [stackOrder, query],
  );
  const hubIndex = stackOrder.findIndex((c) => c.id === hubId);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!comboRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);
  useEffect(() => {
    if (copyState === 'idle') return;
    const t = setTimeout(() => setCopyState('idle'), 1800);
    return () => clearTimeout(t);
  }, [copyState]);

  const choose = (id: string) => {
    onRecentre(id);
    setQuery('');
    setOpen(false);
  };
  const step = (delta: number) => {
    const n = stackOrder.length;
    choose(stackOrder[(hubIndex + delta + n) % n].id);
  };
  const copyLink = async () => {
    const url = shareUrl(hubId);
    try {
      await navigator.clipboard.writeText(url);
      setCopyState('copied');
    } catch {
      setCopyState(legacyCopy(url) ? 'copied' : 'failed');
    }
  };

  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const control = `px-2.5 py-1.5 rounded-md text-xs font-medium border ${
    isDarkMode ? 'border-gray-700 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
  }`;
  const chip = (on: boolean) => `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
    on
      ? 'bg-violet-600 border-violet-600 text-white'
      : isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
  }`;

  let lastCategory: string | null = null;

  return (
    <div className={`mb-4 rounded-lg border p-3 ${isDarkMode ? 'border-gray-700 bg-gray-900/40' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={`${listId}-input`} className={`text-sm font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Centre the map on:
        </label>
        <div className="relative" ref={comboRef}>
          <input
            id={`${listId}-input`}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && options[active] ? `${listId}-${options[active].id}` : undefined}
            value={query}
            placeholder={`${byId[hubId]?.name ?? 'Company'}: type to switch`}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, options.length - 1)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
              else if (e.key === 'Enter' && open && options[active]) { e.preventDefault(); choose(options[active].id); }
              else if (e.key === 'Escape') { setOpen(false); setQuery(''); }
            }}
            className={`w-64 px-3 py-1.5 rounded-md text-sm border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
              isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          {open && (
            <ul
              id={listId}
              ref={listRef}
              role="listbox"
              aria-label="Companies"
              className={`absolute z-30 mt-1 w-72 max-h-80 overflow-auto rounded-lg border shadow-xl py-1 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              {options.length === 0 && <li className={`px-3 py-2 text-sm ${muted}`}>No company matches</li>}
              {options.map((c, i) => {
                const cat = CATEGORY_BY_ID[c.category];
                const header = c.category !== lastCategory ? cat.label : null;
                lastCategory = c.category;
                return (
                  <React.Fragment key={c.id}>
                    {header && (
                      <li role="presentation" className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: cat.color }}>
                        {header}
                      </li>
                    )}
                    <li
                      id={`${listId}-${c.id}`}
                      role="option"
                      aria-selected={i === active}
                      data-index={i}
                      onMouseDown={(e) => { e.preventDefault(); choose(c.id); }}
                      onMouseEnter={() => setActive(i)}
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer ${
                        i === active ? (isDarkMode ? 'bg-gray-700' : 'bg-violet-50') : ''
                      } ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                      <CountryFlag countryKey={c.hqCountry} className="w-4 h-3 rounded-sm flex-shrink-0" />
                      <span className="flex-1 truncate">{c.name}</span>
                      {c.id === hubId && <span className={`text-[10px] ${muted}`}>current</span>}
                    </li>
                  </React.Fragment>
                );
              })}
            </ul>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => step(-1)} className={control} aria-label="Previous company">← Prev</button>
          <span className={`text-xs tabular-nums px-1 ${muted}`}>{hubIndex + 1} / {stackOrder.length}</span>
          <button type="button" onClick={() => step(1)} className={control} aria-label="Next company">Next →</button>
        </div>
        <button type="button" onClick={copyLink} className={`${control} sm:ml-auto`} aria-live="polite">
          {copyState === 'copied' ? 'Link copied' : copyState === 'failed' ? 'Copy failed' : 'Copy link to this view'}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2.5" role="group" aria-label="Quick picks">
        {quickPicks.filter((id) => byId[id]).map((id) => (
          <button key={id} type="button" aria-pressed={hubId === id} onClick={() => choose(id)} className={chip(hubId === id)}>
            <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_BY_ID[byId[id].category].color }} />
            {shortName(byId[id])}
          </button>
        ))}
      </div>
    </div>
  );
}
