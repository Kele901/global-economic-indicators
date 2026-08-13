'use client';

// Debt demo: debt-to-GDP slider translated into "years of your
// allowance". Turns an abstract percentage into a mental model a
// teenager can feel.

import { useState } from 'react';

interface Props { isDarkMode: boolean; }

const BANDS: { max: number; label: string; color: string }[] = [
  { max: 60,  label: 'Comfortable',       color: '#10b981' },
  { max: 100, label: 'Getting heavy',     color: '#f59e0b' },
  { max: 200, label: 'Very heavy',        color: '#ef4444' },
  { max: 400, label: 'Extraordinary',     color: '#7f1d1d' },
];

export default function DebtDemo({ isDarkMode }: Props) {
  const [debtToGdp, setDebtToGdp] = useState(80);
  const allowanceYears = debtToGdp / 100;
  const band = BANDS.find(b => debtToGdp <= b.max) ?? BANDS[BANDS.length - 1];

  const bg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`rounded-md border p-4 ${bg}`}>
      <label className="block">
        <div className={`flex justify-between text-xs mb-1 ${muted}`}>
          <span>Government debt as % of GDP</span>
          <span className={`font-semibold ${text}`}>{debtToGdp}%</span>
        </div>
        <input
          type="range" min={0} max={300} step={5}
          value={debtToGdp}
          onChange={e => setDebtToGdp(Number(e.target.value))}
          aria-label="Debt to GDP percent"
          className="w-full"
        />
      </label>

      <div className={`mt-4 grid grid-cols-2 gap-3 text-sm`}>
        <div className={`rounded-md p-3 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
          <div className={`text-[11px] uppercase tracking-wider ${muted}`}>In allowance-speak</div>
          <div className={`text-lg font-bold tabular-nums ${text}`}>{allowanceYears.toFixed(2)} yr</div>
          <div className={`text-[11px] ${muted}`}>of the country&apos;s total yearly income</div>
        </div>
        <div className={`rounded-md p-3 border`} style={{ borderColor: band.color, backgroundColor: `${band.color}22` }}>
          <div className={`text-[11px] uppercase tracking-wider ${muted}`}>Risk band</div>
          <div className="text-lg font-bold" style={{ color: band.color }}>{band.label}</div>
          <div className={`text-[11px] ${muted}`}>Above 100% starts to hurt.</div>
        </div>
      </div>

      <p className={`text-xs mt-3 ${muted}`}>
        Real-world markers: 🇩🇪 Germany ≈ 63%, 🇺🇸 US ≈ 122%, 🇯🇵 Japan ≈ 250%. Debt isn&apos;t always bad — it depends on what it&apos;s spent on and how easy it is to pay back.
      </p>
    </div>
  );
}
