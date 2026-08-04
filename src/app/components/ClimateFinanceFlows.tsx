'use client';

// Paired-bar visualisation of climate finance: pledged vs disbursed by
// donor, from the curated CLIMATE_FINANCE_FLOWS in climateCurated.ts.
// Also renders a compact ratio-percentage on the right for at-a-glance
// donor comparison. Sourced from OECD DAC + Green Climate Fund reporting.

import { CLIMATE_FINANCE_FLOWS, CLIMATE_FINANCE_100BN } from '../services/climateCurated';

interface Props {
  isDarkMode: boolean;
}

function formatBn(bn: number): string {
  return `$${bn.toFixed(1)}B`;
}

export default function ClimateFinanceFlows({ isDarkMode }: Props) {
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const border = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';

  const sorted = [...CLIMATE_FINANCE_FLOWS].sort((a, b) => b.pledgedBn - a.pledgedBn);
  const maxPledged = Math.max(...sorted.map(r => r.pledgedBn));

  const latest100Bn = CLIMATE_FINANCE_100BN[CLIMATE_FINANCE_100BN.length - 1];

  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>
            Climate finance · pledged vs disbursed
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Cumulative bilateral donor commitments and Green Climate Fund flows. Ratio shows disbursement follow-through.
          </p>
        </div>
        <div className={`text-xs ${textMuted}`}>
          Copenhagen $100B/yr commitment · <span className={`font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
            ${latest100Bn.mobilisedBn.toFixed(0)}B mobilised in {latest100Bn.year}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map(row => {
          const pledgedWidth = (row.pledgedBn / maxPledged) * 100;
          const disbursedWidth = (row.disbursedBn / maxPledged) * 100;
          const ratioColor = row.disbursedPct >= 75
            ? 'text-emerald-500'
            : row.disbursedPct >= 50 ? 'text-amber-500' : 'text-rose-500';
          return (
            <div key={row.donor} className={`p-3 rounded-md border ${border}`}>
              <div className="flex items-baseline justify-between mb-2">
                <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {row.donorLabel}
                </div>
                <div className="flex items-baseline gap-3 text-xs">
                  <span className={textMuted}>{row.primaryVehicle}</span>
                  <span className={`font-semibold tabular-nums ${ratioColor}`}>
                    {row.disbursedPct}% disbursed
                  </span>
                </div>
              </div>
              <div className="relative h-6 rounded overflow-hidden bg-transparent">
                <div
                  className={`absolute inset-y-0 left-0 rounded ${isDarkMode ? 'bg-blue-500/25' : 'bg-blue-200'}`}
                  style={{ width: `${pledgedWidth}%` }}
                  aria-label={`Pledged ${formatBn(row.pledgedBn)}`}
                />
                <div
                  className={`absolute inset-y-0 left-0 rounded ${isDarkMode ? 'bg-emerald-500/60' : 'bg-emerald-500'}`}
                  style={{ width: `${disbursedWidth}%` }}
                  aria-label={`Disbursed ${formatBn(row.disbursedBn)}`}
                />
              </div>
              <div className={`flex justify-between mt-1 text-[11px] ${textMuted}`}>
                <span>Disbursed <span className={isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}>{formatBn(row.disbursedBn)}</span></span>
                <span>Pledged <span className={isDarkMode ? 'text-blue-400' : 'text-blue-700'}>{formatBn(row.pledgedBn)}</span></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
