'use client';

// Curated snapshot of the world's coal fleet: operating + under-construction
// + announced GW by country, with a colour-coded direction-of-travel chip.
// Sources: Global Energy Monitor's Global Coal Plant Tracker (see the
// curated dataset in ../services/climateCurated.ts).

import { COAL_PLANT_PIPELINE } from '../services/climateCurated';

interface Props {
  isDarkMode: boolean;
}

function formatGw(gw: number): string {
  if (gw === 0) return '—';
  return `${gw.toLocaleString(undefined, { maximumFractionDigits: 0 })} GW`;
}

const DIRECTION_STYLE = {
  expanding: { light: 'bg-rose-100 text-rose-800', dark: 'bg-rose-500/20 text-rose-300' },
  stable:    { light: 'bg-amber-100 text-amber-800', dark: 'bg-amber-500/20 text-amber-300' },
  declining: { light: 'bg-emerald-100 text-emerald-800', dark: 'bg-emerald-500/20 text-emerald-300' },
};

export default function CoalPipelineTable({ isDarkMode }: Props) {
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const rowHover = isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50';
  const border = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';

  const sorted = [...COAL_PLANT_PIPELINE].sort((a, b) => b.operatingGw - a.operatingGw);
  const totalOperating = sorted.reduce((s, r) => s + r.operatingGw, 0);

  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
      <div className="mb-4">
        <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>
          Global coal-plant tracker · latest release
        </div>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Operating + construction + announced GW, curated from Global Energy Monitor.
          Sum of operating capacity across tracked countries: <span className="font-semibold">{formatGw(totalOperating)}</span>.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          <thead>
            <tr className={`text-[11px] uppercase tracking-wider ${textMuted} border-b ${border}`}>
              <th className="text-left py-2 pr-4">Country</th>
              <th className="text-right py-2 pr-4">Operating</th>
              <th className="text-right py-2 pr-4">Under construction</th>
              <th className="text-right py-2 pr-4">Announced</th>
              <th className="text-right py-2 pr-4">Retired</th>
              <th className="text-right py-2 pr-0">Direction</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => {
              const styles = DIRECTION_STYLE[row.directionOfTravel];
              const chipClass = isDarkMode ? styles.dark : styles.light;
              return (
                <tr key={row.country} className={`border-b ${border} ${rowHover}`}>
                  <td className="py-2 pr-4 font-medium">{row.countryLabel}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{formatGw(row.operatingGw)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{formatGw(row.constructionGw)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{formatGw(row.announcedGw)}</td>
                  <td className={`py-2 pr-4 text-right tabular-nums ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatGw(row.retiredGw)}
                  </td>
                  <td className="py-2 pr-0 text-right">
                    <span className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${chipClass}`}>
                      {row.directionOfTravel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
