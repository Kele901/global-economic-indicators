'use client';

import { useMemo } from 'react';
import {
  SIPRI_TOP_25_ARMS_COMPANIES,
  ARMS_COMPANY_COUNTRY_COLORS,
  CURATED_LAST_UPDATED,
  type ArmsCompany,
} from '../services/defenseCurated';

interface Props {
  isDarkMode: boolean;
}

export default function ArmsIndustryTable({ isDarkMode }: Props) {
  const { rows, totalRevenue, top5Share, byCountry } = useMemo(() => {
    const total = SIPRI_TOP_25_ARMS_COMPANIES.reduce((s, c) => s + c.armsRevenueUsdBn, 0);
    const top5 = SIPRI_TOP_25_ARMS_COMPANIES.slice(0, 5).reduce((s, c) => s + c.armsRevenueUsdBn, 0);

    const byCountryMap: Record<string, { country: string; iso3: string; revenue: number; count: number }> = {};
    SIPRI_TOP_25_ARMS_COMPANIES.forEach(c => {
      const key = c.countryIso3;
      if (!byCountryMap[key]) byCountryMap[key] = { country: c.country, iso3: key, revenue: 0, count: 0 };
      byCountryMap[key].revenue += c.armsRevenueUsdBn;
      byCountryMap[key].count += 1;
    });
    const countries = Object.values(byCountryMap).sort((a, b) => b.revenue - a.revenue);

    return {
      rows: SIPRI_TOP_25_ARMS_COMPANIES,
      totalRevenue: total,
      top5Share: (top5 / total) * 100,
      byCountry: countries,
    };
  }, []);

  const max = rows[0]?.armsRevenueUsdBn ?? 1;

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';
  const rowBorder = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`rounded-lg border ${cardBg}`}>
      <div className="p-4 sm:p-6 border-b border-inherit">
        <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
          <div>
            <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>
              The Arms Industry · SIPRI Top 25
            </div>
            <p className={`text-sm ${textSec}`}>
              Arms-related revenue of the 25 largest arms-producing and military-services companies (excluding China&apos;s
              share of secretive Rostec-style data outside SIPRI&apos;s reach).
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Top 25 revenue</div>
              <div className={`text-lg font-semibold tabular-nums ${textPrimary}`}>${totalRevenue.toFixed(1)}B</div>
            </div>
            <div>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Top-5 share</div>
              <div className={`text-lg font-semibold tabular-nums ${textPrimary}`}>{top5Share.toFixed(0)}%</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {byCountry.map(c => (
            <span
              key={c.iso3}
              className="text-[11px] px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${ARMS_COMPANY_COUNTRY_COLORS[c.iso3] ?? '#94a3b8'}22`,
                color: ARMS_COMPANY_COUNTRY_COLORS[c.iso3] ?? (isDarkMode ? '#cbd5e1' : '#475569'),
              }}
            >
              {c.country}: ${c.revenue.toFixed(0)}B <span className={textMuted}>({c.count})</span>
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <th className={`text-left px-4 sm:px-6 py-2 text-[11px] uppercase tracking-wider ${textMuted}`}>#</th>
              <th className={`text-left px-4 py-2 text-[11px] uppercase tracking-wider ${textMuted}`}>Company</th>
              <th className={`text-left px-4 py-2 text-[11px] uppercase tracking-wider ${textMuted}`}>Country</th>
              <th className={`text-right px-4 py-2 text-[11px] uppercase tracking-wider ${textMuted}`}>Arms Revenue ($B)</th>
              <th className={`text-right px-4 py-2 text-[11px] uppercase tracking-wider ${textMuted}`}>Arms % of Total</th>
              <th className={`px-4 py-2 text-[11px] uppercase tracking-wider min-w-[180px] ${textMuted}`}>Scale</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: ArmsCompany) => {
              const barWidth = (r.armsRevenueUsdBn / max) * 100;
              const color = ARMS_COMPANY_COUNTRY_COLORS[r.countryIso3] ?? '#94a3b8';
              return (
                <tr key={r.rank} className={`border-t ${rowBorder}`}>
                  <td className={`px-4 sm:px-6 py-2 tabular-nums ${textMuted}`}>{r.rank}</td>
                  <td className={`px-4 py-2 font-medium ${textPrimary}`}>{r.name}</td>
                  <td className={`px-4 py-2 ${textSec}`}>
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                      style={{ backgroundColor: color }}
                    />
                    {r.country}
                  </td>
                  <td className={`px-4 py-2 text-right tabular-nums font-semibold ${textPrimary}`}>
                    ${r.armsRevenueUsdBn.toFixed(1)}
                  </td>
                  <td className={`px-4 py-2 text-right tabular-nums ${textSec}`}>
                    {r.armsShareOfTotal.toFixed(0)}%
                  </td>
                  <td className="px-4 py-2">
                    <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${barWidth}%`, backgroundColor: color }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={`px-4 sm:px-6 py-3 text-[11px] border-t ${rowBorder} ${textMuted}`}>
        Source: SIPRI Top 100 Arms-Producing and Military Services Companies · 2023 revenue reporting · curated {CURATED_LAST_UPDATED}
      </div>
    </div>
  );
}
