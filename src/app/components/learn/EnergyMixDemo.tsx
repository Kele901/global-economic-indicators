'use client';

// Energy mix demo: build a grid from four sliders and see the cost,
// carbon intensity and — crucially — whether it can keep the lights on
// when the sun sets and the wind drops. Illustrative figures, roughly
// in line with published levelised-cost and emissions-factor ranges.

import { useMemo, useState } from 'react';

interface Props { isDarkMode: boolean; }

interface SourceMeta {
  key: 'solar' | 'wind' | 'gas' | 'nuclear';
  label: string;
  colour: string;
  /** £ per megawatt-hour, all-in. */
  cost: number;
  /** grams of CO2 per kilowatt-hour. */
  carbon: number;
  /** Share of nameplate capacity actually available on a still winter evening. */
  firmness: number;
}

const SOURCES: SourceMeta[] = [
  { key: 'solar',   label: 'Solar',   colour: '#f59e0b', cost: 45, carbon: 45,  firmness: 0 },
  { key: 'wind',    label: 'Wind',    colour: '#38bdf8', cost: 50, carbon: 12,  firmness: 0.1 },
  { key: 'gas',     label: 'Gas',     colour: '#ef4444', cost: 85, carbon: 490, firmness: 0.95 },
  { key: 'nuclear', label: 'Nuclear', colour: '#a78bfa', cost: 95, carbon: 12,  firmness: 0.9 },
];

export default function EnergyMixDemo({ isDarkMode }: Props) {
  const [mix, setMix] = useState<Record<SourceMeta['key'], number>>({
    solar: 20,
    wind: 30,
    gas: 35,
    nuclear: 15,
  });

  const total = SOURCES.reduce((sum, s) => sum + mix[s.key], 0);

  const { cost, carbon, firm } = useMemo(() => {
    if (total === 0) return { cost: 0, carbon: 0, firm: 0 };
    let c = 0;
    let co2 = 0;
    let f = 0;
    for (const s of SOURCES) {
      const share = mix[s.key] / total;
      c += share * s.cost;
      co2 += share * s.carbon;
      f += share * s.firmness;
    }
    return { cost: c, carbon: co2, firm: f * 100 };
  }, [mix, total]);

  const bg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const trackBg = isDarkMode ? '#1f2937' : '#eef2ff';

  const keepsLightsOn = firm >= 40;

  return (
    <div className={`rounded-md border p-4 ${bg}`}>
      <div className="grid gap-3">
        {SOURCES.map(s => (
          <label key={s.key} className="block">
            <div className={`flex justify-between text-xs mb-1 ${muted}`}>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.colour }} aria-hidden />
                {s.label}
              </span>
              <span className={`font-semibold ${text}`}>{total === 0 ? 0 : Math.round((mix[s.key] / total) * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={mix[s.key]}
              onChange={e => setMix(prev => ({ ...prev, [s.key]: Number(e.target.value) }))}
              aria-label={`${s.label} share of the grid`}
              className="w-full"
            />
          </label>
        ))}
      </div>

      {/* Stacked mix bar */}
      <div className="mt-4 h-4 rounded-full overflow-hidden flex" style={{ backgroundColor: trackBg }} aria-label="Electricity mix">
        {total > 0 && SOURCES.map(s => (
          <div key={s.key} className="h-full" style={{ width: `${(mix[s.key] / total) * 100}%`, backgroundColor: s.colour }} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div className={`rounded-md p-3 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
          <div className={`text-[11px] uppercase tracking-wider ${muted}`}>Cost</div>
          <div className={`text-lg font-bold tabular-nums ${text}`}>£{cost.toFixed(0)}</div>
          <div className={`text-[10px] ${muted}`}>per MWh</div>
        </div>
        <div className={`rounded-md p-3 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className={`text-[11px] uppercase tracking-wider ${muted}`}>Carbon</div>
          <div className="text-lg font-bold tabular-nums text-emerald-500">{carbon.toFixed(0)}</div>
          <div className={`text-[10px] ${muted}`}>g CO₂ per kWh</div>
        </div>
        <div className={`rounded-md p-3 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : keepsLightsOn ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
          <div className={`text-[11px] uppercase tracking-wider ${muted}`}>Still winter evening</div>
          <div className={`text-lg font-bold tabular-nums ${keepsLightsOn ? 'text-amber-500' : 'text-red-500'}`}>{firm.toFixed(0)}%</div>
          <div className={`text-[10px] ${muted}`}>of demand covered</div>
        </div>
      </div>

      <p className={`text-xs mt-3 ${muted}`}>
        {total === 0
          ? 'Move a slider to start building your grid.'
          : keepsLightsOn
            ? `Cheap and clean is easy until 6pm in January. Your mix covers ${firm.toFixed(0)}% of demand when there is no sun and no wind — enough to keep the lights on.`
            : `Your mix is only covering ${firm.toFixed(0)}% of demand on a dark, still evening. Cheap and low-carbon, but the lights go out. This is the hardest problem in the energy transition.`}
      </p>
    </div>
  );
}
