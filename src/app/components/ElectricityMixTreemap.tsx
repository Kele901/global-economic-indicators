'use client';

// One country's electricity mix as a treemap. The stacked bar in Chapter 2
// compares countries against each other; this shows a single grid's
// composition at a size where the small shares are still legible, which is
// where the interesting policy choices usually live.

import { useMemo, useState } from 'react';
import { ELECTRICITY_MIX_2023, ENERGY_COUNTRY_META } from '../services/energyCurated';
import CompositionTreemap from './charts/CompositionTreemap';
import ChartMeta from './ChartMeta';

interface Props {
  isDarkMode: boolean;
}

const SOURCE_COLORS: Record<string, string> = {
  Coal:             '#44403c',
  Gas:              '#ea580c',
  Oil:              '#78350f',
  Nuclear:          '#7c3aed',
  Hydro:            '#0284c7',
  'Wind & solar':   '#10b981',
  'Other renewable':'#65a30d',
};

export default function ElectricityMixTreemap({ isDarkMode }: Props) {
  const [code, setCode] = useState('DEU');

  const available = useMemo(
    () => ENERGY_COUNTRY_META.filter(m => ELECTRICITY_MIX_2023.some(r => r.code === m.code)),
    [],
  );

  const row = ELECTRICITY_MIX_2023.find(r => r.code === code) ?? ELECTRICITY_MIX_2023[0]!;
  const countryName = ENERGY_COUNTRY_META.find(m => m.code === row.code)?.name ?? row.code;

  const data = useMemo(() => ([
    { name: 'Coal',             value: row.coal,       color: SOURCE_COLORS.Coal },
    { name: 'Gas',              value: row.gas,        color: SOURCE_COLORS.Gas },
    { name: 'Oil',              value: row.oil,        color: SOURCE_COLORS.Oil },
    { name: 'Nuclear',          value: row.nuclear,    color: SOURCE_COLORS.Nuclear },
    { name: 'Hydro',            value: row.hydro,      color: SOURCE_COLORS.Hydro },
    { name: 'Wind & solar',     value: row.windSolar,  color: SOURCE_COLORS['Wind & solar'] },
    { name: 'Other renewable',  value: row.otherRenew, color: SOURCE_COLORS['Other renewable'] },
  ]), [row]);

  const lowCarbon = row.nuclear + row.hydro + row.windSolar + row.otherRenew;

  return (
    <CompositionTreemap
      isDarkMode={isDarkMode}
      title={`${countryName}: What the Grid Runs On`}
      subtitle={`Share of 2023 electricity generation by source. ${lowCarbon.toFixed(0)}% of this grid is low-carbon.`}
      data={data}
      format={v => `${v.toFixed(1)}%`}
      provenance={<ChartMeta sourceId="energy-ledger-curated" isDarkMode={isDarkMode} />}
      height="h-[380px]"
      actions={
        <div className="flex flex-wrap gap-1.5 max-w-xl justify-end">
          {available.map(m => (
            <button
              key={m.code}
              onClick={() => setCode(m.code)}
              aria-pressed={m.code === code}
              className={`text-[11px] px-2 py-1 rounded-full border transition-colors ${
                m.code === code
                  ? 'bg-amber-500/15 border-amber-500 text-amber-500'
                  : isDarkMode
                    ? 'border-gray-600 text-gray-400 hover:text-gray-200'
                    : 'border-gray-300 text-gray-500 hover:text-gray-800'
              }`}
            >
              {m.code}
            </button>
          ))}
        </div>
      }
      footnote={
        <>
          Curated IEA Electricity 2023/2025 generation shares. Generation shares are not the same as
          capacity shares — the capacity-factor grid further down this page explains why a grid can
          be half solar by nameplate and a fifth solar by output. Nor are they the same as emissions:
          a grid that is 47% wind and solar but 27% coal, like Germany&apos;s, still emits several
          times as much per kilowatt-hour as one that is 65% nuclear, like France&apos;s.
        </>
      }
    />
  );
}
