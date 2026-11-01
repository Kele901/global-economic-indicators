'use client';

import { useEffect, useState } from 'react';
import { heatmapTheme } from './theme';

const SPEEDS = [0.5, 1, 2] as const;
const BASE_INTERVAL_MS = 1800;

interface Props {
  years: number[];
  year: number | null;
  playing: boolean;
  isDarkMode: boolean;
  onYearChange: (year: number) => void;
  onPlayingChange: (playing: boolean) => void;
}

export default function TimelinePlayer({ years, year, playing, isDarkMode, onYearChange, onPlayingChange }: Props) {
  const tc = heatmapTheme(isDarkMode);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [loop, setLoop] = useState(false);
  const index = year === null ? -1 : years.indexOf(year);

  useEffect(() => {
    if (!playing || years.length < 2) return;
    const timer = window.setTimeout(() => {
      if (index < years.length - 1) onYearChange(years[index + 1]);
      else if (loop) onYearChange(years[0]);
      else onPlayingChange(false);
    }, BASE_INTERVAL_MS / speed);
    return () => window.clearTimeout(timer);
  }, [playing, index, years, speed, loop, onYearChange, onPlayingChange]);

  if (years.length < 2) return null;

  const togglePlay = () => {
    if (!playing && index === years.length - 1) onYearChange(years[0]);
    onPlayingChange(!playing);
  };

  return (
    <div className={`rounded-xl border p-3 sm:p-4 mb-4 flex flex-wrap items-center gap-3 ${tc.card}`}>
      <button onClick={togglePlay} aria-label={playing ? 'Pause timeline' : 'Play timeline'}
        className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-white transition-colors ${playing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-500'}`}>
        {playing
          ? <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          : <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l11-7z" /></svg>}
      </button>
      <div className="flex-1 min-w-[180px]">
        <div className="flex justify-between text-[11px] mb-1">
          <span className={tc.textSec}>{years[0]}</span>
          <span className="font-semibold tabular-nums">{year ?? '\u2014'}</span>
          <span className={tc.textSec}>{years[years.length - 1]}</span>
        </div>
        <input type="range" min={0} max={years.length - 1} value={Math.max(0, index)}
          onChange={e => { onPlayingChange(false); onYearChange(years[Number(e.target.value)]); }}
          aria-label="Year" className="w-full accent-blue-600" />
      </div>
      <div className="flex items-center gap-1">
        {SPEEDS.map(s => (
          <button key={s} onClick={() => setSpeed(s)}
            className={`px-2 py-1 rounded-md border text-xs font-medium ${speed === s ? tc.chipActive : tc.chip}`}>{s}x</button>
        ))}
      </div>
      <label className={`flex items-center gap-1.5 text-xs ${tc.textSec}`}>
        <input type="checkbox" checked={loop} onChange={e => setLoop(e.target.checked)} className="accent-blue-600" />
        Loop
      </label>
    </div>
  );
}
