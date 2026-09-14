'use client';

// Chart tricks demo: one fixed dataset, two toggles. Truncating the
// y-axis and cherry-picking the start year both change the picture
// dramatically while every underlying number stays identical. Plain
// SVG so there is no chart library in the teaching bundle.

import { useMemo, useState } from 'react';

interface Props { isDarkMode: boolean; }

// A stylised national house-price index. One crash, one dip, one
// long grind upwards — enough for both tricks to bite.
const SERIES: { year: number; value: number }[] = [
  { year: 2005, value: 100 },
  { year: 2006, value: 104 },
  { year: 2007, value: 108 },
  { year: 2008, value: 99 },
  { year: 2009, value: 88 },
  { year: 2010, value: 93 },
  { year: 2011, value: 97 },
  { year: 2012, value: 100 },
  { year: 2013, value: 104 },
  { year: 2014, value: 107 },
  { year: 2015, value: 109 },
  { year: 2016, value: 111 },
  { year: 2017, value: 114 },
  { year: 2018, value: 116 },
  { year: 2019, value: 118 },
  { year: 2020, value: 110 },
  { year: 2021, value: 118 },
  { year: 2022, value: 121 },
  { year: 2023, value: 123 },
  { year: 2024, value: 126 },
];

const W = 320;
const H = 120;

export default function ChartTricksDemo({ isDarkMode }: Props) {
  const [truncated, setTruncated] = useState(false);
  const [cherryPicked, setCherryPicked] = useState(false);

  const shown = cherryPicked ? SERIES.filter(d => d.year >= 2009) : SERIES;

  const { points, yMin, yMax, change } = useMemo(() => {
    const values = shown.map(d => d.value);
    const lo = Math.min(...values);
    const hi = Math.max(...values);
    const min = truncated ? lo - 2 : 0;
    const max = hi + 2;
    const span = max - min || 1;
    const path = shown
      .map((d, i) => {
        const x = (i / (shown.length - 1)) * W;
        const y = H - ((d.value - min) / span) * H;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
    const pct = ((values[values.length - 1] - values[0]) / values[0]) * 100;
    return { points: path, yMin: min, yMax: max, change: pct };
  }, [shown, truncated]);

  const bg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const gridColour = isDarkMode ? '#374151' : '#e5e7eb';

  const toggleClass = (on: boolean) =>
    `text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
      on
        ? 'bg-red-500/15 border-red-500/50 text-red-500'
        : isDarkMode
          ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
    }`;

  const headline = cherryPicked
    ? 'Prices have climbed relentlessly since 2009'
    : 'Prices crashed in 2008 and have barely recovered in real terms';

  return (
    <div className={`rounded-md border p-4 ${bg}`}>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setTruncated(v => !v)} aria-pressed={truncated} className={toggleClass(truncated)}>
          {truncated ? '✓ ' : ''}Truncate the y-axis
        </button>
        <button type="button" onClick={() => setCherryPicked(v => !v)} aria-pressed={cherryPicked} className={toggleClass(cherryPicked)}>
          {cherryPicked ? '✓ ' : ''}Start at 2009 instead
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <div className={`flex flex-col justify-between text-[10px] tabular-nums py-0.5 ${muted}`} aria-hidden>
          <span>{yMax.toFixed(0)}</span>
          <span>{yMin.toFixed(0)}</span>
        </div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="flex-1 h-32"
          preserveAspectRatio="none"
          role="img"
          aria-label={`House price index from ${shown[0].year} to ${shown[shown.length - 1].year}, y-axis from ${yMin.toFixed(0)} to ${yMax.toFixed(0)}`}
        >
          <line x1="0" y1={H - 0.5} x2={W} y2={H - 0.5} stroke={gridColour} strokeWidth="1" />
          <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke={gridColour} strokeWidth="1" strokeDasharray="3 3" />
          <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      <div className={`flex justify-between text-[10px] tabular-nums mt-1 pl-6 ${muted}`}>
        <span>{shown[0].year}</span>
        <span>{shown[shown.length - 1].year}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className={`rounded-md p-3 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
          <div className={`text-[11px] uppercase tracking-wider ${muted}`}>Change over window</div>
          <div className={`text-xl font-bold tabular-nums ${text}`}>+{change.toFixed(0)}%</div>
        </div>
        <div className={`rounded-md p-3 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-amber-50 border-amber-100'}`}>
          <div className={`text-[11px] uppercase tracking-wider ${muted}`}>Y-axis starts at</div>
          <div className={`text-xl font-bold tabular-nums ${truncated ? 'text-red-500' : text}`}>{yMin.toFixed(0)}</div>
        </div>
      </div>

      <p className={`text-xs mt-3 ${muted}`}>
        A journalist with this chart could honestly write: &ldquo;<span className={text}>{headline}</span>&rdquo;
      </p>

      <p className={`text-xs mt-2 ${muted}`}>
        Not one number changed when you clicked those buttons. Only the framing did — which is exactly why you check the axis and the start date before you believe the shape.
      </p>
    </div>
  );
}
