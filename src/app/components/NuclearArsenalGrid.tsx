'use client';

import { useMemo } from 'react';
import { NUCLEAR_ARSENALS_2025, CURATED_LAST_UPDATED } from '../services/defenseCurated';

interface Props {
  isDarkMode: boolean;
}

// Each square represents this many warheads. Chosen so the largest arsenal
// (~5,600) fits into ~50 squares — enough visual detail without overflowing.
const WARHEADS_PER_SQUARE = 100;

// Country ISO3 → accent colour for its warhead squares.
const NUCLEAR_COLORS: Record<string, string> = {
  RUS: '#7c2d12',
  USA: '#3b82f6',
  CHN: '#dc2626',
  FRA: '#6366f1',
  GBR: '#1e40af',
  PAK: '#059669',
  IND: '#f97316',
  ISR: '#0891b2',
  PRK: '#a855f7',
};

interface Bucket {
  label: 'Deployed strategic' | 'Deployed non-strategic' | 'Reserve' | 'Retired';
  value: number;
  opacity: number;
}

export default function NuclearArsenalGrid({ isDarkMode }: Props) {
  const globalTotal = useMemo(
    () => NUCLEAR_ARSENALS_2025.reduce((s, c) => s + c.total, 0),
    [],
  );
  const deployedTotal = useMemo(
    () => NUCLEAR_ARSENALS_2025.reduce((s, c) => s + c.deployedStrategic + c.deployedNonStrategic, 0),
    [],
  );

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';
  const rowBorder = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`rounded-lg border ${cardBg}`}>
      <div className="p-4 sm:p-6 border-b border-inherit flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>
            The Nuclear Balance
          </div>
          <p className={`text-sm ${textSec} max-w-2xl`}>
            The nine nuclear-armed states hold roughly {globalTotal.toLocaleString()} warheads combined, {deployedTotal.toLocaleString()} of them actively deployed.
            Each square below represents {WARHEADS_PER_SQUARE} warheads.
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <div>
            <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Global total</div>
            <div className={`text-lg font-semibold tabular-nums ${textPrimary}`}>{globalTotal.toLocaleString()}</div>
          </div>
          <div>
            <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Deployed</div>
            <div className={`text-lg font-semibold tabular-nums ${textPrimary}`}>{deployedTotal.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {NUCLEAR_ARSENALS_2025.map(state => {
          const color = NUCLEAR_COLORS[state.countryIso3] ?? '#94a3b8';
          const buckets: Bucket[] = [
            { label: 'Deployed strategic',    value: state.deployedStrategic,     opacity: 1.0 },
            { label: 'Deployed non-strategic', value: state.deployedNonStrategic, opacity: 0.8 },
            { label: 'Reserve',                value: state.reserve,               opacity: 0.5 },
            { label: 'Retired',                value: state.retired,               opacity: 0.25 },
          ];

          const shareOfGlobal = (state.total / globalTotal) * 100;

          return (
            <div
              key={state.countryIso3}
              className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                  <div className={`font-semibold ${textPrimary}`}>{state.country}</div>
                </div>
                <div className={`text-xs tabular-nums ${textMuted}`}>
                  {state.total.toLocaleString()} · {shareOfGlobal.toFixed(1)}%
                </div>
              </div>

              <div className={`text-[11px] ${textMuted} mb-2`}>
                First test: {state.firstTest > 0 ? state.firstTest : 'undeclared'}
              </div>

              <div className="flex flex-wrap gap-[3px] mb-3">
                {buckets.map(b => {
                  const squares = Math.round(b.value / WARHEADS_PER_SQUARE);
                  return Array.from({ length: squares }).map((_, i) => (
                    <div
                      key={`${b.label}-${i}`}
                      className="w-2.5 h-2.5 rounded-[2px]"
                      style={{ backgroundColor: color, opacity: b.opacity }}
                      title={`${b.label}: ${b.value.toLocaleString()}`}
                    />
                  ));
                })}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {buckets.filter(b => b.value > 0).map(b => (
                  <div key={b.label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: color, opacity: b.opacity }} />
                    <span className={textSec}>{b.label}</span>
                    <span className={`ml-auto tabular-nums ${textPrimary}`}>{b.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={`px-4 sm:px-6 py-3 text-[11px] border-t ${rowBorder} ${textMuted}`}>
        Source: FAS Nuclear Notebook, Bulletin of the Atomic Scientists · curated {CURATED_LAST_UPDATED}
      </div>
    </div>
  );
}
