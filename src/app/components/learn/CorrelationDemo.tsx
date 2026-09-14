'use client';

// Correlation demo: drag r and watch the scatter tighten or scatter,
// then flip to a famously spurious real-world pair with r near 0.95
// and nothing whatsoever connecting them. Plain SVG, no chart library.

import { useMemo, useState } from 'react';

interface Props { isDarkMode: boolean; }

// Fixed pseudo-normal pairs. Z1 becomes the x-axis and Z2 the noise
// blended in to hit whatever r the slider asks for, after both are
// standardised and Z2 is stripped of its Z1 component below.
const Z1 = [-1.8, -1.5, -1.3, -1.1, -0.9, -0.75, -0.6, -0.45, -0.3, -0.2, -0.1, 0,
            0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 0.95, 1.1, 1.3, 1.5, 1.7, 1.95];
const Z2 = [0.6, -1.2, 1.4, -0.3, 0.9, 1.8, -1.6, 0.2, -0.8, 1.1, -0.45, 1.55,
            -1.9, 0.35, -0.65, 1.25, -0.15, -1.35, 0.75, -0.55, 1.65, -1.05, 0.05, -0.95];

// Tyler Vigen's classic: US per-capita cheese consumption against
// deaths from becoming tangled in bedsheets, 2000-2009.
const CHEESE = [29.8, 30.1, 30.5, 30.6, 31.3, 31.7, 32.6, 33.1, 32.7, 32.8];
const BEDSHEETS = [327, 456, 509, 497, 596, 573, 661, 741, 809, 717];

/** Mean-zero, unit-variance copy of a series. */
function standardise(xs: number[]): number[] {
  const n = xs.length;
  const mean = xs.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / n) || 1;
  return xs.map(x => (x - mean) / sd);
}

/**
 * The r = a·z1 + √(1-r²)·z2 trick only lands on the requested r when z1
 * and z2 are standardised and uncorrelated. Z2 as written leans slightly
 * on Z1, so strip that component out before using it as noise — otherwise
 * the slider says 0.70 and the scatter measures 0.61.
 */
function orthogonalise(target: number[], against: number[]): number[] {
  const dot = target.reduce((sum, v, i) => sum + v * against[i], 0);
  const norm = against.reduce((sum, v) => sum + v * v, 0) || 1;
  const beta = dot / norm;
  return standardise(target.map((v, i) => v - beta * against[i]));
}

function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? 0 : num / den;
}

const X = standardise(Z1);
const NOISE = orthogonalise(Z2, X);

const W = 260;
const H = 160;

function describe(r: number): string {
  const a = Math.abs(r);
  if (a < 0.15) return 'basically no linear relationship — knowing x tells you nothing about y';
  if (a < 0.4) return 'a weak relationship you could easily mistake for noise';
  if (a < 0.7) return 'a moderate relationship — visible, but with plenty of exceptions';
  if (a < 0.9) return 'a strong relationship';
  return 'an extremely tight relationship, the kind that makes people reach for the word "causes"';
}

export default function CorrelationDemo({ isDarkMode }: Props) {
  const [targetR, setTargetR] = useState(0.7);
  const [spurious, setSpurious] = useState(false);

  const { xs, ys, r, xLabel, yLabel } = useMemo(() => {
    if (spurious) {
      return {
        xs: CHEESE,
        ys: BEDSHEETS,
        r: pearson(CHEESE, BEDSHEETS),
        xLabel: 'Cheese eaten per person (lbs)',
        yLabel: 'Bedsheet-tangling deaths',
      };
    }
    const k = Math.sqrt(Math.max(0, 1 - targetR * targetR));
    const generated = X.map((x, i) => targetR * x + k * NOISE[i]);
    return {
      xs: X,
      ys: generated,
      r: pearson(X, generated),
      xLabel: 'Variable x',
      yLabel: 'Variable y',
    };
  }, [targetR, spurious]);

  const dots = useMemo(() => {
    const xLo = Math.min(...xs);
    const xHi = Math.max(...xs);
    const yLo = Math.min(...ys);
    const yHi = Math.max(...ys);
    const xSpan = xHi - xLo || 1;
    const ySpan = yHi - yLo || 1;
    return xs.map((x, i) => ({
      cx: 6 + ((x - xLo) / xSpan) * (W - 12),
      cy: H - 6 - ((ys[i] - yLo) / ySpan) * (H - 12),
    }));
  }, [xs, ys]);

  const bg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const gridColour = isDarkMode ? '#374151' : '#e5e7eb';

  return (
    <div className={`rounded-md border p-4 ${bg}`}>
      <label className={`block ${spurious ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className={`flex justify-between text-xs mb-1 ${muted}`}>
          <span>Target correlation</span>
          <span className={`font-semibold ${text}`}>r = {targetR.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.05}
          value={targetR}
          onChange={e => setTargetR(Number(e.target.value))}
          aria-label="Target correlation coefficient"
          disabled={spurious}
          className="w-full"
        />
      </label>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-auto sm:flex-1 h-40"
          role="img"
          aria-label={`Scatter plot of ${xLabel} against ${yLabel}, correlation ${r.toFixed(2)}`}
        >
          <rect x="0" y="0" width={W} height={H} fill="none" stroke={gridColour} strokeWidth="1" />
          <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke={gridColour} strokeWidth="1" strokeDasharray="3 3" />
          <line x1={W / 2} y1="0" x2={W / 2} y2={H} stroke={gridColour} strokeWidth="1" strokeDasharray="3 3" />
          {dots.map((d, i) => (
            <circle key={i} cx={d.cx} cy={d.cy} r="4" fill={spurious ? '#f59e0b' : '#3b82f6'} fillOpacity="0.75" />
          ))}
        </svg>

        <div className="sm:w-40 shrink-0">
          <div className={`rounded-md p-3 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
            <div className={`text-[11px] uppercase tracking-wider ${muted}`}>Measured r</div>
            <div className={`text-2xl font-bold tabular-nums ${text}`}>{r >= 0 ? '+' : ''}{r.toFixed(2)}</div>
          </div>
          <div className={`text-[10px] mt-2 ${muted}`}>
            <div>x: {xLabel}</div>
            <div>y: {yLabel}</div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setSpurious(v => !v)}
        aria-pressed={spurious}
        className={`mt-4 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
          spurious
            ? 'bg-amber-500/15 border-amber-500/50 text-amber-500'
            : isDarkMode
              ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
        }`}
      >
        {spurious ? '← Back to the slider' : 'Show me a real spurious correlation'}
      </button>

      <p className={`text-xs mt-3 ${muted}`}>
        {spurious ? (
          <>
            This is real data. US cheese consumption and deaths from becoming tangled in bedsheets track each other at{' '}
            <span className={`font-semibold ${text}`}>r = {r.toFixed(2)}</span> across the 2000s. Nobody has ever died of cheddar-related bedding.
            Both series simply drifted upwards over the same decade, which is all it takes.
          </>
        ) : (
          <>
            At r = {r.toFixed(2)} this is {describe(r)}. Notice that the cloud looks convincing long before r gets anywhere near 1 — and that a
            convincing-looking cloud still tells you nothing at all about which variable, if either, is doing the causing.
          </>
        )}
      </p>
    </div>
  );
}
