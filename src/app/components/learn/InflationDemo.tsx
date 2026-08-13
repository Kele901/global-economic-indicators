'use client';

// Inflation demo: two sliders (annual inflation %, years) show how a
// £10 note today shrinks in purchasing power over time. Pure client
// arithmetic — no chart library or API dependency.

import { useState } from 'react';

interface Props { isDarkMode: boolean; }

export default function InflationDemo({ isDarkMode }: Props) {
  const [rate, setRate] = useState(3);
  const [years, setYears] = useState(10);

  const start = 10;
  const growth = Math.pow(1 + rate / 100, years);
  const priceAfter = start * growth;
  const purchasing = start / growth;

  const bg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`rounded-md border p-4 ${bg}`}>
      <div className="grid gap-4">
        <label className="block">
          <div className={`flex justify-between text-xs mb-1 ${muted}`}>
            <span>Annual inflation rate</span>
            <span className={`font-semibold ${text}`}>{rate}%</span>
          </div>
          <input
            type="range" min={0} max={15} step={0.5}
            value={rate} onChange={e => setRate(Number(e.target.value))}
            aria-label="Annual inflation rate percent"
            className="w-full"
          />
        </label>

        <label className="block">
          <div className={`flex justify-between text-xs mb-1 ${muted}`}>
            <span>Years forward</span>
            <span className={`font-semibold ${text}`}>{years} yr{years === 1 ? '' : 's'}</span>
          </div>
          <input
            type="range" min={1} max={30} step={1}
            value={years} onChange={e => setYears(Number(e.target.value))}
            aria-label="Years forward"
            className="w-full"
          />
        </label>
      </div>

      <div className={`mt-4 grid grid-cols-2 gap-3 text-sm`}>
        <div className={`rounded-md p-3 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
          <div className={`text-[11px] uppercase tracking-wider ${muted}`}>Pizza slice today</div>
          <div className={`text-xl font-bold tabular-nums ${text}`}>£{start.toFixed(2)}</div>
        </div>
        <div className={`rounded-md p-3 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-rose-50 border-rose-100'}`}>
          <div className={`text-[11px] uppercase tracking-wider ${muted}`}>Same slice in {years} yr{years === 1 ? '' : 's'}</div>
          <div className={`text-xl font-bold tabular-nums text-rose-500`}>£{priceAfter.toFixed(2)}</div>
        </div>
      </div>
      <p className={`text-xs mt-3 ${muted}`}>
        Your £{start.toFixed(0)} kept under the mattress would buy only about{' '}
        <span className={`font-semibold ${text}`}>£{purchasing.toFixed(2)}</span> of pizza after {years} year{years === 1 ? '' : 's'}. That&apos;s inflation quietly at work.
      </p>
    </div>
  );
}
