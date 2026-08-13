'use client';

import { PANDEMIC_READINESS_2024, HEALTH_COUNTRY_META } from '../services/healthCurated';

interface Props { isDarkMode: boolean; }

function colorFor(score: number) {
  if (score >= 70) return { fg: '#059669', bg: 'rgba(16,185,129,0.15)' };
  if (score >= 55) return { fg: '#2563eb', bg: 'rgba(37,99,235,0.15)' };
  if (score >= 40) return { fg: '#f59e0b', bg: 'rgba(245,158,11,0.18)' };
  return               { fg: '#ef4444', bg: 'rgba(239,68,68,0.15)' };
}

export default function PandemicReadinessGrid({ isDarkMode }: Props) {
  const sorted = [...PANDEMIC_READINESS_2024].sort((a, b) => b.ghsIndex - a.ghsIndex);

  return (
    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {sorted.map(r => {
          const meta = HEALTH_COUNTRY_META.find(m => m.code === r.code);
          const c = colorFor(r.ghsIndex);
          return (
            <div key={r.code} className="rounded-md p-3 border" style={{ backgroundColor: c.bg, borderColor: c.fg }}>
              <div className={`text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{meta?.region ?? ''}</div>
              <div className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{meta?.name ?? r.code}</div>
              <div className="text-2xl font-bold tabular-nums mt-1" style={{ color: c.fg }}>{r.ghsIndex.toFixed(1)}</div>
              <div className={`text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>GHS Index · JEE {r.jeeCoreCapacity}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
