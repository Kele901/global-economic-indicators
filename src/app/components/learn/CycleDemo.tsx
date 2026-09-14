'use client';

// Cycle demo: scrub a slider through a stylised business cycle and
// watch GDP growth and unemployment move in opposite directions, with
// unemployment lagging the turn. Numbers are illustrative, not real.

import { useState } from 'react';

interface Props { isDarkMode: boolean; }

interface Phase {
  label: string;
  growth: number;
  unemployment: number;
  note: string;
}

// Twelve steps around one full loop. Unemployment is deliberately
// offset from growth so the lag is visible when you scrub.
const TIMELINE: Phase[] = [
  { label: 'Recovery',  growth: 1.2, unemployment: 8.4, note: 'Growth turns positive again, but firms are still cautious about hiring.' },
  { label: 'Recovery',  growth: 2.1, unemployment: 7.8, note: 'Orders pick up. Unemployment finally starts falling.' },
  { label: 'Expansion', growth: 2.8, unemployment: 6.9, note: 'Hiring accelerates and wages begin to rise.' },
  { label: 'Expansion', growth: 3.4, unemployment: 5.7, note: 'Shops are busy, companies invest, confidence is high.' },
  { label: 'Expansion', growth: 3.6, unemployment: 4.6, note: 'Almost everyone who wants work has it.' },
  { label: 'Peak',      growth: 3.1, unemployment: 3.9, note: 'The economy is running hot. Firms cannot find workers and inflation climbs.' },
  { label: 'Peak',      growth: 1.8, unemployment: 3.8, note: 'Growth is fading but the jobs market still looks great. This is the trap.' },
  { label: 'Recession', growth: -0.6, unemployment: 4.3, note: 'GDP starts shrinking. Job losses have only just begun.' },
  { label: 'Recession', growth: -2.4, unemployment: 6.1, note: 'Spending drops sharply, companies cut costs and staff.' },
  { label: 'Recession', growth: -1.5, unemployment: 7.6, note: 'The worst of the fall in GDP is over — but unemployment is still climbing.' },
  { label: 'Trough',    growth: -0.2, unemployment: 8.6, note: 'GDP bottoms out. Unemployment peaks months later.' },
  { label: 'Recovery',  growth: 0.7, unemployment: 8.7, note: 'Growth returns first. The jobs market is the last thing to heal.' },
];

const PHASE_COLOR: Record<string, string> = {
  Recovery: 'text-sky-500',
  Expansion: 'text-emerald-500',
  Peak: 'text-amber-500',
  Recession: 'text-red-500',
  Trough: 'text-purple-500',
};

export default function CycleDemo({ isDarkMode }: Props) {
  const [step, setStep] = useState(3);
  const current = TIMELINE[step];

  const bg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const trackBg = isDarkMode ? '#1f2937' : '#eef2ff';

  // Growth runs -3 to +4; map onto a 0-100 bar with zero at ~43%.
  const growthPct = ((current.growth + 3) / 7) * 100;
  const unemploymentPct = (current.unemployment / 10) * 100;

  return (
    <div className={`rounded-md border p-4 ${bg}`}>
      <label className="block">
        <div className={`flex justify-between text-xs mb-1 ${muted}`}>
          <span>Scrub through the cycle</span>
          <span className={`font-semibold ${PHASE_COLOR[current.label] ?? text}`}>{current.label}</span>
        </div>
        <input
          type="range"
          min={0}
          max={TIMELINE.length - 1}
          step={1}
          value={step}
          onChange={e => setStep(Number(e.target.value))}
          aria-label="Business cycle position"
          className="w-full"
        />
      </label>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className={`rounded-md p-3 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className={`text-[11px] uppercase tracking-wider ${muted}`}>GDP growth</div>
          <div className={`text-xl font-bold tabular-nums ${current.growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {current.growth > 0 ? '+' : ''}{current.growth.toFixed(1)}%
          </div>
        </div>
        <div className={`rounded-md p-3 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-amber-50 border-amber-100'}`}>
          <div className={`text-[11px] uppercase tracking-wider ${muted}`}>Unemployment</div>
          <div className="text-xl font-bold tabular-nums text-amber-500">{current.unemployment.toFixed(1)}%</div>
        </div>
      </div>

      <div className="mt-4 space-y-2" aria-label="Growth and unemployment levels">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] w-20 ${muted}`}>GDP growth</span>
          <div className="flex-1 h-3 rounded-full relative" style={{ backgroundColor: trackBg }}>
            <div
              className={`absolute top-0 h-full rounded-full ${current.growth >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
              style={
                current.growth >= 0
                  ? { left: '42.9%', width: `${growthPct - 42.9}%` }
                  : { left: `${growthPct}%`, width: `${42.9 - growthPct}%` }
              }
            />
            <div className={`absolute top-0 h-full w-px ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ left: '42.9%' }} aria-hidden />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] w-20 ${muted}`}>Unemployment</span>
          <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: trackBg }}>
            <div className="h-full rounded-full bg-amber-500" style={{ width: `${unemploymentPct}%` }} />
          </div>
        </div>
      </div>

      <p className={`text-xs mt-3 ${muted}`}>{current.note}</p>

      <p className={`text-xs mt-2 ${muted}`}>
        Scrub to the end and watch the timing: GDP turns up before unemployment stops rising. That gap is why unemployment is called a{' '}
        <span className={`font-semibold ${text}`}>lagging indicator</span> — it confirms a recovery rather than predicting one.
      </p>
    </div>
  );
}
