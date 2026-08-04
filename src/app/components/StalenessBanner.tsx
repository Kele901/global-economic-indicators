'use client';

// Amber warning strip that any page can drop above a chapter to disclose
// that some of the data on the page comes from a curated snapshot with a
// fixed publication date. Renders nothing while the snapshot is fresh
// (< thresholdMonths old) so it disappears from view whenever the underlying
// data is up to date.
//
// Consumed by the Defense Ledger, Resources, and Cultural Capital pages
// today; wire it into any other page that ships a curated snapshot.

import Link from 'next/link';

export interface StalenessBannerProps {
  lastUpdated: string; // ISO date, e.g. '2025-06-30'
  label: string; // human-readable data description, e.g. 'SIPRI Top 100 (Dec 2024)'
  isDarkMode?: boolean;
  thresholdMonths?: number;
  hrefToDataSources?: string;
}

function monthsBetween(fromIso: string, now = Date.now()): number | null {
  const from = Date.parse(fromIso);
  if (Number.isNaN(from)) return null;
  const days = (now - from) / (24 * 60 * 60 * 1000);
  return days / 30;
}

function formatMonths(months: number): string {
  if (months < 1) return 'less than a month ago';
  if (months < 12) {
    const m = Math.round(months);
    return `${m} month${m === 1 ? '' : 's'} ago`;
  }
  const years = Math.floor(months / 12);
  const rem = Math.round(months - years * 12);
  if (rem === 0) return `${years} year${years === 1 ? '' : 's'} ago`;
  return `${years}y ${rem}mo ago`;
}

export default function StalenessBanner({
  lastUpdated,
  label,
  isDarkMode = false,
  thresholdMonths = 12,
  hrefToDataSources = '/data-sources',
}: StalenessBannerProps) {
  const months = monthsBetween(lastUpdated);
  if (months === null) return null;
  if (months < thresholdMonths) return null;

  const relative = formatMonths(months);

  return (
    <div
      role="status"
      className={`mb-4 flex items-start gap-3 rounded-md border px-3 py-2 text-xs ${
        isDarkMode
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
          : 'border-amber-400/40 bg-amber-50 text-amber-800'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="mt-0.5 h-4 w-4 flex-shrink-0"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M9.401 3.003c1.155-2.003 4.043-2.003 5.197 0l7.32 12.69c1.155 2.003-.29 4.507-2.599 4.507H4.68c-2.309 0-3.754-2.504-2.598-4.507L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
          clipRule="evenodd"
        />
      </svg>
      <div className="leading-snug">
        <span className="font-semibold">{label}</span> — snapshot dated{' '}
        <span className="tabular-nums">{lastUpdated}</span> ({relative}). Curated data may lag the live series.{' '}
        <Link
          href={hrefToDataSources}
          className={`underline underline-offset-2 ${
            isDarkMode ? 'text-amber-100' : 'text-amber-900'
          }`}
        >
          View data sources
        </Link>
        .
      </div>
    </div>
  );
}
