'use client';

// GDP demo: three curated countries side by side showing total GDP
// (nominal, 2024, USD trillions) vs GDP per person. Illustrative
// numbers only — not meant to be a live data feed.

interface Props { isDarkMode: boolean; }

const COUNTRIES = [
  { name: 'United States', flag: '🇺🇸', totalTn: 27.7,  perPersonK: 82,  color: '#2563eb', pop: 335 },
  { name: 'China',         flag: '🇨🇳', totalTn: 17.8,  perPersonK: 12.7, color: '#dc2626', pop: 1400 },
  { name: 'Nigeria',       flag: '🇳🇬', totalTn: 0.36,  perPersonK: 1.6,  color: '#059669', pop: 225 },
];

export default function GdpDemo({ isDarkMode }: Props) {
  const bg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const barBg = isDarkMode ? '#1f2937' : '#eef2ff';

  const maxTotal = Math.max(...COUNTRIES.map(c => c.totalTn));
  const maxPer   = Math.max(...COUNTRIES.map(c => c.perPersonK));

  return (
    <div className={`rounded-md border p-4 ${bg} space-y-4`}>
      <div>
        <div className={`text-xs mb-2 ${muted}`}>Total GDP (2024, USD trillions)</div>
        <div className="space-y-2">
          {COUNTRIES.map(c => (
            <div key={c.name} className="flex items-center gap-2">
              <span className="w-24 text-sm shrink-0" aria-hidden>{c.flag} {c.name}</span>
              <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: barBg }}>
                <div className="h-full rounded-full" style={{ width: `${(c.totalTn / maxTotal) * 100}%`, backgroundColor: c.color }} />
              </div>
              <span className={`w-14 text-right text-sm tabular-nums ${text}`}>${c.totalTn.toFixed(1)}T</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className={`text-xs mb-2 ${muted}`}>GDP per person (2024, USD thousands)</div>
        <div className="space-y-2">
          {COUNTRIES.map(c => (
            <div key={c.name + 'pp'} className="flex items-center gap-2">
              <span className="w-24 text-sm shrink-0" aria-hidden>{c.flag} {c.name}</span>
              <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: barBg }}>
                <div className="h-full rounded-full" style={{ width: `${(c.perPersonK / maxPer) * 100}%`, backgroundColor: c.color }} />
              </div>
              <span className={`w-14 text-right text-sm tabular-nums ${text}`}>${c.perPersonK.toFixed(1)}k</span>
            </div>
          ))}
        </div>
      </div>

      <p className={`text-xs ${muted}`}>
        Notice how China&apos;s total GDP is enormous, but divide by 1.4 billion people and per-person GDP is much smaller than the US. That&apos;s why journalists use both numbers.
      </p>
    </div>
  );
}
