'use client';

import { CAPACITY_FACTORS_2023 } from '../services/energyCurated';

interface Props { isDarkMode: boolean; }

const SOURCE_COLORS: Record<string, string> = {
  'Nuclear':               '#a855f7',
  'Geothermal':            '#f97316',
  'Coal':                  '#78716c',
  'Combined-cycle gas':    '#94a3b8',
  'Biomass':               '#84cc16',
  'Hydro':                 '#3b82f6',
  'Onshore wind':          '#22c55e',
  'Offshore wind':         '#0ea5e9',
  'Utility solar':         '#fbbf24',
  'Rooftop solar':         '#f59e0b',
};

export default function CapacityFactorGrid({ isDarkMode }: Props) {
  const cardBg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200';
  const barBg = isDarkMode ? '#1f2937' : '#e5e7eb';

  return (
    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CAPACITY_FACTORS_2023.map(r => {
          const color = SOURCE_COLORS[r.source] ?? '#3b82f6';
          const co2color = r.co2gCO2eqKwh < 50 ? '#059669' : r.co2gCO2eqKwh < 300 ? '#f59e0b' : '#dc2626';
          return (
            <div key={r.source} className={`p-3 rounded-md border ${cardBg}`}>
              <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{r.source}</div>
              <div className="mt-2">
                <div className={`text-[10px] uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Capacity factor</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: barBg }}>
                    <div className="h-full rounded-full" style={{ width: `${r.capacityFactor}%`, backgroundColor: color }} />
                  </div>
                  <span className={`text-xs tabular-nums font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{r.capacityFactor}%</span>
                </div>
              </div>
              <div className="mt-1 text-[11px] tabular-nums" style={{ color: co2color }}>
                {r.co2gCO2eqKwh} gCO₂eq/kWh
              </div>
            </div>
          );
        })}
      </div>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Capacity factor = actual output / max possible output over a year. Nuclear runs near-flat all year; solar sits idle overnight and cloudy days. Storage exists to bridge the gap.
      </p>
    </div>
  );
}
