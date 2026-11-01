'use client';

import { useMemo } from 'react';
import { COUNTRY_DISPLAY_NAMES, type CountryKey } from '../../utils/countryMappings';
import { flagFor, getHeatmapColor, type HeatmapStyleId } from '../../utils/heatmap/palettes';
import { entries, type CountryValues } from '../../utils/heatmap/values';

const ROW = 30;

interface Props {
  values: CountryValues;
  min: number;
  max: number;
  style: HeatmapStyleId;
  isDarkMode: boolean;
  selected: CountryKey | null;
  highlight: Set<CountryKey> | null;
  format: (v: number) => string;
  onSelect: (country: CountryKey) => void;
}

// A ranked bar list whose rows are positioned by rank, so when the year
// changes during playback the bars slide past each other.
export default function RaceBars({ values, min, max, style, isDarkMode, selected, highlight, format, onSelect }: Props) {
  const rows = useMemo(() => entries(values).sort((a, b) => b[1] - a[1]), [values]);
  const rankOf = useMemo(() => new Map(rows.map(([ck], i) => [ck, i])), [rows]);
  // Keep every country mounted (in a stable order) so CSS can animate moves.
  const stable = useMemo(() => [...rows].sort((a, b) => a[0].localeCompare(b[0])), [rows]);
  const lo = Math.min(0, min);
  const hi = Math.max(0, max);
  const span = hi - lo || 1;
  const zero = ((0 - lo) / span) * 100;

  if (rows.length === 0) {
    return <p className={`py-12 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No data available for this metric and year.</p>;
  }

  return (
    <div className="relative" style={{ height: rows.length * ROW }}>
      {lo < 0 && <div className={`absolute top-0 bottom-0 w-px ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} style={{ left: `calc(7.5rem + (100% - 7.5rem - 4.5rem) * ${zero / 100})` }} />}
      {stable.map(([ck, v]) => {
        const rank = rankOf.get(ck)!;
        const left = v >= 0 ? zero : ((v - lo) / span) * 100;
        const width = (Math.abs(v) / span) * 100;
        const dim = highlight && !highlight.has(ck);
        const isSel = selected === ck;
        return (
          <button key={ck} onClick={() => onSelect(ck)}
            className="absolute left-0 right-0 flex items-center text-left group"
            style={{ height: ROW, transform: `translateY(${rank * ROW}px)`, transition: 'transform 1000ms ease-in-out, opacity 300ms', opacity: dim ? 0.25 : 1 }}>
            <span className={`w-[7.5rem] shrink-0 pr-2 truncate text-xs ${isSel ? 'font-bold' : ''} ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className={`inline-block w-6 tabular-nums ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{rank + 1}</span>
              {flagFor(ck)} {COUNTRY_DISPLAY_NAMES[ck]}
            </span>
            <span className="relative flex-1 h-5">
              <span className="absolute top-0 h-full rounded group-hover:brightness-110"
                style={{
                  left: `${left}%`, width: `${Math.max(width, 0.5)}%`,
                  backgroundColor: isSel ? '#f59e0b' : getHeatmapColor(style, v, min, max, isDarkMode),
                  transition: 'left 1000ms ease-in-out, width 1000ms ease-in-out, background-color 1000ms',
                }} />
            </span>
            <span className={`w-[4.5rem] shrink-0 pl-2 text-xs tabular-nums font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{format(v)}</span>
          </button>
        );
      })}
    </div>
  );
}
