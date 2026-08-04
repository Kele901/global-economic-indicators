'use client';

// Remittance flows as % of GDP for the top receiving economies. Uses
// live WB BX.TRF.PWKR.CD.DT joined with NY.GDP.MKTP.CD (nominal GDP,
// USD) to compute the ratio. For countries where either series is
// missing we show the raw USD headline instead.

import { useMemo } from 'react';
import type { CountryData } from '../services/worldbank';
import { MIGRATION_COUNTRY_META } from '../services/migrationCurated';
import { latestEntry } from '../utils/countryData';

interface Props {
  isDarkMode: boolean;
  remittances: CountryData[];   // BX.TRF.PWKR.CD.DT
  gdpNominal?: CountryData[];   // NY.GDP.MKTP.CD (optional)
}

export default function DiasporaContributionsChart({ isDarkMode, remittances, gdpNominal }: Props) {
  const rows = useMemo(() => {
    return MIGRATION_COUNTRY_META
      .map(m => {
        const rem = latestEntry(remittances, m.wbKey);
        if (!rem) return null;
        const gdp = gdpNominal ? latestEntry(gdpNominal, m.wbKey) : null;
        const shareOfGdp = gdp && gdp.value > 0 ? (rem.value / gdp.value) * 100 : null;
        return {
          country: m.name,
          color: m.color,
          remittancesUsd: rem.value,
          year: rem.year,
          shareOfGdp,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.remittancesUsd - a.remittancesUsd)
      .slice(0, 15);
  }, [remittances, gdpNominal]);

  const maxUsd = rows.length ? Math.max(...rows.map(r => r.remittancesUsd)) : 0;

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';
  const rowHover = isDarkMode ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50';

  return (
    <div className={`rounded-lg border ${cardBg}`}>
      <div className="p-4 sm:p-6 border-b border-inherit">
        <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>Diaspora contributions</div>
        <p className={`text-sm ${textSec}`}>
          Personal remittances received (WB BX.TRF.PWKR.CD.DT). For countries with matching GDP data we compute the share of GDP — a stress-signal above 15% (Tajikistan, Lebanon, Nepal).
        </p>
      </div>

      <ul>
        {rows.map((r, i) => (
          <li key={r.country} className={`px-4 sm:px-6 py-2 border-t flex items-center gap-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${rowHover}`}>
            <div className={`text-[11px] font-bold w-5 text-right ${textMuted}`}>{i + 1}</div>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} aria-hidden="true" />
            <div className={`flex-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{r.country}</div>
            <div className={`w-1/2 relative h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(r.remittancesUsd / maxUsd) * 100}%` }} />
            </div>
            <div className={`text-xs tabular-nums w-24 text-right ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ${(r.remittancesUsd / 1e9).toFixed(1)}B
            </div>
            <div className={`text-xs tabular-nums w-14 text-right ${textSec}`}>
              {r.shareOfGdp != null ? `${r.shareOfGdp.toFixed(1)}%` : '—'}
            </div>
            <div className={`text-[10px] w-12 text-right ${textMuted}`}>{r.year}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
