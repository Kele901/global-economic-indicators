'use client';

// AI talent grid. Each country shows two figures — where the world's
// top-tier AI researchers *originated* (undergraduate degree) and
// where they *currently work*. The gap reveals brain-flow direction.

import { AI_TALENT_FLOWS, AI_COUNTRY_META } from '../services/aiCurated';

interface Props {
  isDarkMode: boolean;
}

export default function AiTalentGrid({ isDarkMode }: Props) {
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const cellBg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const sorted = [...AI_TALENT_FLOWS].sort((a, b) => b.hostShare - a.hostShare);

  return (
    <div className={`rounded-xl border p-4 sm:p-6 ${cardBg}`}>
      <h3 className={`text-base sm:text-lg font-semibold mb-1 ${text}`}>Top-Tier AI Talent</h3>
      <p className={`text-xs mb-4 ${muted}`}>
        Share of the world&apos;s top-tier AI researchers by <em>undergraduate origin</em> vs current <em>host country</em>. When origin &gt; host, the country is a net exporter of talent (China, India); when host &gt; origin, it is a net importer (US, UK).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map(r => {
          const meta = AI_COUNTRY_META.find(m => m.iso3 === r.iso3);
          const netExporter = r.originShare > r.hostShare;
          return (
            <div key={r.iso3} className={`rounded-lg border p-4 ${cellBg}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`text-sm font-semibold ${text}`}>{r.name}</div>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: meta?.color ?? '#6b7280' }} aria-hidden="true" />
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <div className={`text-[10px] uppercase tracking-wider ${muted}`}>Origin share</div>
                  <div className={`text-xl font-semibold tabular-nums ${text}`}>{r.originShare}%</div>
                </div>
                <div className={`text-2xl ${netExporter ? 'text-rose-500' : 'text-emerald-500'}`} aria-hidden="true">→</div>
                <div className="text-right">
                  <div className={`text-[10px] uppercase tracking-wider ${muted}`}>Host share</div>
                  <div className={`text-xl font-semibold tabular-nums ${text}`}>{r.hostShare}%</div>
                </div>
              </div>
              <div className={`text-xs mt-2 ${r.netFlow2019to2024 > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                Net flow 2019-24: {r.netFlow2019to2024 > 0 ? '+' : ''}{r.netFlow2019to2024} researchers
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
