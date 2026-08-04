'use client';

// Public vs Private debt by country. Combines live World Bank government
// debt (GC.DOD.TOTL.GD.ZS) with the curated BIS household debt snapshot
// (baked into debtCurated). Presented as a stacked bar for the latest
// available year so readers can see the *total* debt burden (public +
// private) rather than just the sovereign side.

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import type { CountryData } from '../services/worldbank';
import { DEBT_COUNTRY_META, HOUSEHOLD_DEBT_2024 } from '../services/debtCurated';
import { latestEntry } from '../utils/countryData';
import { useViewportSize } from '../hooks/useViewportSize';

interface Props {
  isDarkMode: boolean;
  governmentDebt: CountryData[];
}

export default function PublicPrivateDebtChart({ isDarkMode, governmentDebt }: Props) {
  const { isMobile } = useViewportSize();

  const data = useMemo(() => {
    return DEBT_COUNTRY_META
      .map(meta => {
        const publicEntry = latestEntry(governmentDebt, meta.wbKey);
        const household = HOUSEHOLD_DEBT_2024.find(h => h.iso3 === meta.iso3);
        if (!publicEntry && !household) return null;
        return {
          country: meta.name,
          iso3: meta.iso3,
          publicPct: publicEntry?.value ?? 0,
          privatePct: household?.pctGdp ?? 0,
          color: meta.color,
        };
      })
      .filter((d): d is NonNullable<typeof d> => d !== null)
      .sort((a, b) => (b.publicPct + b.privatePct) - (a.publicPct + a.privatePct))
      .slice(0, 15);
  }, [governmentDebt]);

  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const tooltipStyle: React.CSSProperties = isDarkMode
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px' }
    : { backgroundColor: '#fff',    border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

  return (
    <div className={`rounded-xl border p-4 sm:p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-base sm:text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Public vs Private Debt Stack</h3>
      <p className={`text-xs mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Stacked bars: government debt (WB latest) + household debt (BIS 2024). Total headline stress is the full column height.
      </p>
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: isMobile ? 8 : 20, left: isMobile ? 0 : 10, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="country" stroke={axis} tick={{ fontSize: isMobile ? 9 : 11 }} angle={-45} textAnchor="end" height={70} interval={0} />
            <YAxis stroke={axis} tick={{ fontSize: isMobile ? 9 : 11 }} tickFormatter={v => `${v}%`} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number, name: string) => [`${value.toFixed(0)}%`, name]}
            />
            {!isMobile && <Legend />}
            <Bar dataKey="publicPct" stackId="a" name="Government debt" radius={[0, 0, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={`pub-${i}`} fill={entry.color} />
              ))}
            </Bar>
            <Bar dataKey="privatePct" stackId="a" name="Household debt" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={`priv-${i}`} fill={entry.color} fillOpacity={0.45} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
