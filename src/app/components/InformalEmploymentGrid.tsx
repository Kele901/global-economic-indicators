'use client';

import { INFORMAL_EMPLOYMENT_LATEST, LABOR_COUNTRY_META } from '../services/laborCurated';

interface Props { isDarkMode: boolean; }

function colorFor(pct: number) {
  if (pct >= 75) return { fg: '#dc2626', bg: 'rgba(220,38,38,0.15)' };
  if (pct >= 40) return { fg: '#f59e0b', bg: 'rgba(245,158,11,0.15)' };
  if (pct >= 20) return { fg: '#2563eb', bg: 'rgba(37,99,235,0.12)' };
  return               { fg: '#059669', bg: 'rgba(16,185,129,0.15)' };
}

export default function InformalEmploymentGrid({ isDarkMode }: Props) {
  const sorted = [...INFORMAL_EMPLOYMENT_LATEST].sort((a, b) => b.informalPct - a.informalPct);

  return (
    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {sorted.map(r => {
          const meta = LABOR_COUNTRY_META.find(m => m.code === r.code);
          const c = colorFor(r.informalPct);
          return (
            <div key={r.code} className="rounded-md p-3 border" style={{ backgroundColor: c.bg, borderColor: c.fg }}>
              <div className={`flex items-center justify-between text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>{meta?.region ?? ''}</span>
                <span className="tabular-nums normal-case tracking-normal">{r.year}</span>
              </div>
              <div className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{meta?.name ?? r.code}</div>
              <div className="text-2xl font-bold tabular-nums mt-1" style={{ color: c.fg }}>{r.informalPct.toFixed(1)}%</div>
              <div className={`text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>informal employment</div>
            </div>
          );
        })}
      </div>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Informal work = no contract, no social insurance, often no minimum wage. It dominates the labour force in most of Sub-Saharan Africa and South Asia and is a critical measure OECD-only wage figures miss entirely.
        ILOSTAT SDG 8.3.1, latest survey year shown on each tile. The US, Japan, Australia and China publish no estimate on this harmonised definition.
      </p>
    </div>
  );
}
