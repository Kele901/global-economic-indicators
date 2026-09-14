'use client';

// Workshop: be the central banker.
//
// Twelve quarters, one decision each: move the policy rate. Inflation and
// unemployment respond to the rate, but only after a lag of two to three
// quarters, which is the entire difficulty of the job and the thing no
// static chart can teach.
//
// The model is a deliberately crude accelerationist Phillips curve plus an
// output gap. It is not calibrated to any real economy — it exists so that
// overcorrecting *feels* like something, because you watch inflation
// undershoot two quarters after you already fixed it.

import { useMemo, useState } from 'react';

interface Props { isDarkMode: boolean; }

interface Quarter {
  label: string;
  rate: number;
  inflation: number;
  unemployment: number;
  shock?: string;
}

const TARGET = 2.0;
const NEUTRAL_RATE = 2.5;   // the rate that neither stimulates nor restrains
const NATURAL_U = 4.5;      // unemployment when the economy is at capacity
const QUARTERS = 12;

// Exogenous shocks, so the reader is not just steering a smooth glide path.
// The values are added to inflation in that quarter regardless of policy.
const SHOCKS: Record<number, { size: number; label: string }> = {
  2: { size: 1.8, label: 'Energy prices spike after a supply disruption' },
  7: { size: -1.2, label: 'Global demand weakens; import prices fall' },
};

const START: Quarter = { label: 'Q0', rate: 2.5, inflation: 5.4, unemployment: 4.1 };

// One quarter of the toy economy. `laggedRate` is the rate set two quarters
// ago, because that is when a decision starts to bite.
function step(prev: Quarter, index: number, chosenRate: number, laggedRate: number): Quarter {
  const stance = laggedRate - NEUTRAL_RATE;      // positive = restrictive
  const shock = SHOCKS[index]?.size ?? 0;

  // Restrictive policy pushes unemployment up towards and past its natural
  // rate, with persistence so it does not snap back.
  const unemployment = Math.max(
    2.5,
    prev.unemployment + stance * 0.22 + (NATURAL_U - prev.unemployment) * 0.18,
  );

  // Inflation is sticky, falls when unemployment is above natural (slack),
  // and is nudged by shocks. The 0.85 on lagged inflation is what makes
  // inflation hard to kill once it is in the system.
  const inflation = Math.max(
    -2,
    prev.inflation * 0.82
      + TARGET * 0.18
      - (unemployment - NATURAL_U) * 0.55
      + shock,
  );

  return {
    label: `Q${index}`,
    rate: chosenRate,
    inflation: Number(inflation.toFixed(2)),
    unemployment: Number(unemployment.toFixed(2)),
    shock: SHOCKS[index]?.label,
  };
}

export default function CentralBankerWorkshop({ isDarkMode }: Props) {
  // One chosen rate per quarter played so far.
  const [decisions, setDecisions] = useState<number[]>([]);
  const [pendingRate, setPendingRate] = useState(START.rate);

  const history = useMemo(() => {
    const path: Quarter[] = [START];
    decisions.forEach((rate, i) => {
      const q = i + 1;
      // The rate that bites this quarter is the one set two quarters ago.
      const lagged = i >= 2 ? decisions[i - 2]! : START.rate;
      path.push(step(path[path.length - 1]!, q, rate, lagged));
    });
    return path;
  }, [decisions]);

  const current = history[history.length - 1]!;
  const done = decisions.length >= QUARTERS;

  const bg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const panel = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';

  const score = useMemo(() => {
    // Standard central-bank loss function: squared deviations from the
    // inflation target plus squared unemployment gap, equally weighted.
    const played = history.slice(1);
    if (played.length === 0) return null;
    const loss = played.reduce(
      (s, q) => s + Math.pow(q.inflation - TARGET, 2) + Math.pow(q.unemployment - NATURAL_U, 2),
      0,
    ) / played.length;
    return loss;
  }, [history]);

  const verdict = score === null ? null
    : score < 1.5 ? { label: 'Textbook. You would be reappointed.', tone: 'text-emerald-500' }
    : score < 4 ? { label: 'Solid. Inflation back near target without wrecking jobs.', tone: 'text-emerald-500' }
    : score < 8 ? { label: 'Mixed. You got there, but the path was rough.', tone: 'text-amber-500' }
    : { label: 'Rough. Either inflation ran loose or you caused a recession.', tone: 'text-red-500' };

  const commit = () => {
    if (done) return;
    setDecisions(prev => [...prev, pendingRate]);
  };

  const reset = () => {
    setDecisions([]);
    setPendingRate(START.rate);
  };

  const maxInf = Math.max(6, ...history.map(h => h.inflation));
  const minInf = Math.min(0, ...history.map(h => h.inflation));

  return (
    <div className={`rounded-md border p-4 ${bg}`}>
      <p className={`text-xs mb-3 ${muted}`}>
        Inflation is {START.inflation}% and your target is {TARGET}%. You set the policy rate once a
        quarter for {QUARTERS} quarters. The catch: a rate change takes about two quarters to affect
        anything, so you are always steering on old information.
      </p>

      {/* Scoreboard */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className={`rounded-md border p-2.5 ${panel}`}>
          <div className={`text-[10px] uppercase tracking-wider ${muted}`}>Inflation</div>
          <div className={`text-lg font-bold tabular-nums ${
            Math.abs(current.inflation - TARGET) < 0.5 ? 'text-emerald-500'
              : current.inflation > TARGET ? 'text-red-500' : 'text-sky-500'
          }`}>
            {current.inflation.toFixed(1)}%
          </div>
          <div className={`text-[10px] ${muted}`}>target {TARGET}%</div>
        </div>
        <div className={`rounded-md border p-2.5 ${panel}`}>
          <div className={`text-[10px] uppercase tracking-wider ${muted}`}>Unemployment</div>
          <div className={`text-lg font-bold tabular-nums ${current.unemployment > 6.5 ? 'text-red-500' : 'text-amber-500'}`}>
            {current.unemployment.toFixed(1)}%
          </div>
          <div className={`text-[10px] ${muted}`}>natural rate {NATURAL_U}%</div>
        </div>
        <div className={`rounded-md border p-2.5 ${panel}`}>
          <div className={`text-[10px] uppercase tracking-wider ${muted}`}>Your rate</div>
          <div className={`text-lg font-bold tabular-nums ${text}`}>{current.rate.toFixed(2)}%</div>
          <div className={`text-[10px] ${muted}`}>quarter {decisions.length} of {QUARTERS}</div>
        </div>
      </div>

      {/* Paths */}
      <div className={`rounded-md border p-3 mb-4 ${panel}`}>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-[10px] flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500" />Inflation</span>
          <span className="text-[10px] flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />Unemployment</span>
          <span className="text-[10px] flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />Policy rate</span>
        </div>
        <div className="flex items-end gap-1 h-28">
          {history.map((q, i) => {
            const span = Math.max(maxInf - minInf, 4);
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5" title={q.shock}>
                <div className="w-full flex items-end justify-center gap-px h-full">
                  <div className="w-1/3 bg-red-500 rounded-t" style={{ height: `${Math.max(2, ((q.inflation - minInf) / span) * 100)}%` }} />
                  <div className="w-1/3 bg-amber-500 rounded-t" style={{ height: `${Math.max(2, (q.unemployment / 12) * 100)}%` }} />
                  <div className="w-1/3 bg-blue-500 rounded-t" style={{ height: `${Math.max(2, (q.rate / 10) * 100)}%` }} />
                </div>
                <span className={`text-[8px] ${muted}`}>{q.label}</span>
                {q.shock && <span className="text-[9px]" aria-label={q.shock}>⚡</span>}
              </div>
            );
          })}
        </div>
        {current.shock && (
          <p className="text-[11px] mt-2 text-amber-500">⚡ {current.shock}</p>
        )}
      </div>

      {/* Decision */}
      {!done ? (
        <div className={`rounded-md border p-3 ${panel}`}>
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className={text}>Set the policy rate for Q{decisions.length + 1}</span>
              <span className={`tabular-nums font-semibold ${text}`}>{pendingRate.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={9}
              step={0.25}
              value={pendingRate}
              onChange={e => setPendingRate(Number(e.target.value))}
              aria-label="Policy rate"
              className="w-full"
            />
            <div className={`flex justify-between text-[10px] ${muted}`}>
              <span>0% · maximum stimulus</span>
              <span>neutral ≈ {NEUTRAL_RATE}%</span>
              <span>9% · slam the brakes</span>
            </div>
          </label>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={commit}
              className="text-xs font-medium px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Announce decision →
            </button>
            {decisions.length > 0 && (
              <button
                onClick={reset}
                className={`text-xs px-3 py-1.5 rounded-md border ${
                  isDarkMode ? 'border-gray-600 text-gray-300 hover:text-white' : 'border-gray-300 text-gray-600 hover:text-gray-900'
                }`}
              >
                Start over
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className={`rounded-md border p-3 ${panel}`}>
          <div className={`text-sm font-semibold ${verdict?.tone}`}>{verdict?.label}</div>
          <div className={`text-xs mt-1 ${muted}`}>
            Average loss score {score?.toFixed(2)} — lower is better. It penalises both missing the
            inflation target and pushing unemployment away from its natural rate, which is roughly
            how a central bank&apos;s mandate is written.
          </div>
          <button
            onClick={reset}
            className="text-xs font-medium px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors mt-3"
          >
            Play again
          </button>
        </div>
      )}

      <p className={`text-xs mt-3 ${muted}`}>
        Most people who play this hike too hard and hold too long, then watch inflation undershoot
        two quarters after it was already fixed. That is not a flaw in the game: it is the reason real
        central bankers talk about acting on <span className={`font-semibold ${text}`}>forecasts</span> rather
        than on today&apos;s reading. The model here is a toy — a sticky inflation equation, an
        unemployment gap and a two-quarter lag — not a forecast of any real economy.
      </p>
    </div>
  );
}
