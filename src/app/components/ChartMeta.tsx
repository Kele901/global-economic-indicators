'use client';

// Small "last updated + source" stamp rendered under any chart to make
// data provenance one glance away. Reads the source entry directly from
// data/dataProvenance.ts, then computes a fuzzy relative age string.

import { DATA_SOURCES } from '../data/dataProvenance';

interface Props {
  sourceId: string;
  isDarkMode?: boolean;
  updatedAt?: string; // Optional override, otherwise reads from registry.
  className?: string;
}

function relativeAge(iso: string): string {
  if (iso === 'live') return 'live';
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return iso;
  const days = Math.floor((Date.now() - parsed) / (1000 * 60 * 60 * 24));
  if (days < 1) return 'today';
  if (days < 2) return 'yesterday';
  if (days < 30) return `${days} d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;
  const years = (days / 365).toFixed(1);
  return `${years} yr ago`;
}

export default function ChartMeta({ sourceId, isDarkMode, updatedAt, className = '' }: Props) {
  const entry = DATA_SOURCES.find(s => s.id === sourceId);
  if (!entry) return null;

  const stamp = updatedAt ?? entry.lastUpdated;
  const age = relativeAge(stamp);

  const muted = isDarkMode ? 'text-gray-500' : 'text-gray-500';
  const provLink = isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900';

  return (
    <div className={`flex items-center gap-2 text-[11px] ${muted} ${className}`}>
      <span>Updated {age}</span>
      <span aria-hidden>·</span>
      <a href="/data-sources" className={`underline underline-offset-2 ${provLink}`} title={`Source: ${entry.provider}`}>
        source: {entry.provider}
      </a>
    </div>
  );
}
