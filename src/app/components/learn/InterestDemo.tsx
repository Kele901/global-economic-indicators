'use client';

// Interest demo: compound-interest visualiser on a £100 starting
// balance with rate + years sliders. Renders a plain SVG bar row for
// each year so we don't drag in Recharts for a small teaching demo.

import { useMemo, useState } from 'react';

interface Props { isDarkMode: boolean; }

export default function InterestDemo({ isDarkMode }: Props) {
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(15);

  const data = useMemo(() => {
    const start = 100;
    const points: { year: number; value: number }[] = [];
    for (let y = 0; y <= years; y++) {
      points.push({ year: y, value: start * Math.pow(1 + rate / 100, y) });
    }
    return points;
  }, [rate, years]);

  const maxVal = data[data.length - 1].value;
  const bg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const barBg = isDarkMode ? '#1f2937' : '#eef2ff';

  return (
    <div className={`rounded-md border p-4 ${bg}`}>
      <div className="grid gap-4">
        <label className="block">
          <div className={`flex justify-between text-xs mb-1 ${muted}`}>
            <span>Interest rate</span>
            <span className={`font-semibold ${text}`}>{rate}%</span>
          </div>
          <input type="range" min={0} max={15} step={0.5} value={rate} onChange={e => setRate(Number(e.target.value))} aria-label="Interest rate percent" className="w-full" />
        </label>

        <label className="block">
          <div className={`flex justify-between text-xs mb-1 ${muted}`}>
            <span>Years saved</span>
            <span className={`font-semibold ${text}`}>{years} yr{years === 1 ? '' : 's'}</span>
          </div>
          <input type="range" min={1} max={30} step={1} value={years} onChange={e => setYears(Number(e.target.value))} aria-label="Years saved" className="w-full" />
        </label>
      </div>

      <div className={`mt-4 grid grid-cols-2 gap-3 text-sm`}>
        <div className={`rounded-md p-3 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
          <div className={`text-[11px] uppercase tracking-wider ${muted}`}>You saved</div>
          <div className={`text-xl font-bold tabular-nums ${text}`}>£100</div>
        </div>
        <div className={`rounded-md p-3 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className={`text-[11px] uppercase tracking-wider ${muted}`}>After {years} yr{years === 1 ? '' : 's'}</div>
          <div className={`text-xl font-bold tabular-nums text-emerald-500`}>£{maxVal.toFixed(2)}</div>
        </div>
      </div>

      <div className="mt-4 space-y-1" aria-label="Yearly balance chart">
        {data.filter(d => d.year > 0 && (d.year % Math.max(1, Math.floor(years / 10)) === 0 || d.year === years)).map(d => {
          const pct = Math.max(6, (d.value / maxVal) * 100);
          return (
            <div key={d.year} className="flex items-center gap-2">
              <span className={`text-[10px] w-8 tabular-nums ${muted}`}>Yr {d.year}</span>
              <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: barBg }}>
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
              </div>
              <span className={`text-[10px] w-16 text-right tabular-nums ${text}`}>£{d.value.toFixed(0)}</span>
            </div>
          );
        })}
      </div>

      <p className={`text-xs mt-3 ${muted}`}>
        This is called <span className={`font-semibold ${text}`}>compound interest</span>: each year you earn interest on the money you already earned last year, so growth speeds up.
      </p>
    </div>
  );
}
