'use client';

// Small ★ Track button that flips to ★ Tracked when the (country, metric)
// pair is on the user's watchlist. Writes into the same store used by
// /watchlist via useWatchlist.

import { useMemo } from 'react';
import { useWatchlist } from '../hooks/useWatchlist';

interface Props {
  country: string;
  metric: string;
  isDarkMode?: boolean;
  className?: string;
}

export default function WatchlistChip({ country, metric, isDarkMode, className = '' }: Props) {
  const { items, addItem, removeItem } = useWatchlist();

  const existing = useMemo(
    () => items.find(i => i.country === country && i.metric === metric),
    [items, country, metric],
  );

  const onClick = () => {
    if (existing) removeItem(existing.id);
    else addItem({ country, metric });
  };

  const activeCls = isDarkMode
    ? 'border-amber-500 bg-amber-500/20 text-amber-300'
    : 'border-amber-500 bg-amber-50 text-amber-700';
  const inactiveCls = isDarkMode
    ? 'border-gray-700 bg-gray-800 text-gray-400 hover:text-white hover:border-gray-500'
    : 'border-gray-300 bg-white text-gray-500 hover:text-gray-900 hover:border-gray-400';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!existing}
      aria-label={existing ? `Untrack ${country} ${metric}` : `Track ${country} ${metric}`}
      title={existing ? 'On watchlist — click to remove' : 'Add to watchlist'}
      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border transition-colors ${existing ? activeCls : inactiveCls} ${className}`}
    >
      <span aria-hidden>{existing ? '★' : '☆'}</span>
      <span>{existing ? 'Tracked' : 'Track'}</span>
    </button>
  );
}
