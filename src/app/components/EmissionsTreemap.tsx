'use client';

// Global CO₂ emissions by country as a treemap. The per-capita bar charts
// elsewhere on the climate ledger answer "who pollutes hardest"; this one
// answers "where is the tonnage", and the answer is far more concentrated
// than a 47-country bar chart makes it look.

import { useMemo } from 'react';
import type { CountryData } from '../services/worldbank';
import { latestEntry } from '../utils/countryData';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES } from '../utils/countryMappings';
import CompositionTreemap from './charts/CompositionTreemap';
import ChartMeta from './ChartMeta';

interface Props {
  isDarkMode: boolean;
  co2EmissionsKt: CountryData[] | undefined;
}

export default function EmissionsTreemap({ isDarkMode, co2EmissionsKt }: Props) {
  const { data, year, total } = useMemo(() => {
    let latestYear = 0;
    const rows = COUNTRY_KEYS
      .map(key => {
        const entry = latestEntry(co2EmissionsKt, key);
        if (!entry) return null;
        if (entry.year > latestYear) latestYear = entry.year;
        // Kilotonnes to megatonnes, which is the unit these are normally
        // quoted in and keeps the tile labels short.
        return { name: COUNTRY_DISPLAY_NAMES[key] ?? key, value: entry.value / 1000 };
      })
      .filter((r): r is { name: string; value: number } => r !== null);
    return {
      data: rows,
      year: latestYear,
      total: rows.reduce((s, r) => s + r.value, 0),
    };
  }, [co2EmissionsKt]);

  return (
    <CompositionTreemap
      isDarkMode={isDarkMode}
      title="Where the Tonnage Actually Is"
      subtitle={`Total CO₂ emissions by country${year ? `, latest available year (${year})` : ''}. Tile area is proportional to absolute emissions, not emissions per person.`}
      data={data}
      topN={14}
      format={v => `${v.toFixed(0)} Mt`}
      provenance={<ChartMeta sourceId="wb-ghg" isDarkMode={isDarkMode} />}
      height="h-[460px]"
      footnote={
        <>
          Live World Bank EN.ATM.CO2E.KT for the {data.length} roster countries that report it,
          totalling {total.toFixed(0)} megatonnes. This is a subset of world emissions, not all of
          it, so read the tiles as relative sizes within the roster. Two caveats change the meaning
          of this chart: these are <em>territorial</em> emissions, so goods manufactured in China
          and consumed in Europe count against China; and absolute tonnage is the right frame for
          the physics of the atmosphere but the wrong frame for fairness, which is what the
          per-capita views elsewhere on this page are for.
        </>
      }
    />
  );
}
