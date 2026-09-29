'use client';

// World military spending as a treemap. The ranked bars elsewhere on the
// ledger show the order; area shows the scale gap, which is the actual
// story — the top spender is larger than the next nine combined, and that
// is very hard to see in a bar chart with a shared axis.

import { useMemo } from 'react';
import type { CountryData } from '../services/worldbank';
import { latestEntry } from '../utils/countryData';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES } from '../utils/countryMappings';
import CompositionTreemap from './charts/CompositionTreemap';
import ChartMeta from './ChartMeta';

interface Props {
  isDarkMode: boolean;
  militaryExpenditureUsd: CountryData[] | undefined;
}

export default function DefenseSpendTreemap({ isDarkMode, militaryExpenditureUsd }: Props) {
  const { data, year, total, topShare, nextNine } = useMemo(() => {
    let latestYear = 0;
    const rows = COUNTRY_KEYS
      .map(key => {
        const entry = latestEntry(militaryExpenditureUsd, key);
        if (!entry) return null;
        if (entry.year > latestYear) latestYear = entry.year;
        // The series is in current US dollars; billions keep labels readable.
        return { name: COUNTRY_DISPLAY_NAMES[key] ?? key, value: entry.value / 1e9 };
      })
      .filter((r): r is { name: string; value: number } => r !== null)
      .sort((a, b) => b.value - a.value);

    const sum = rows.reduce((s, r) => s + r.value, 0);
    return {
      data: rows,
      year: latestYear,
      total: sum,
      topShare: sum > 0 && rows[0] ? (rows[0].value / sum) * 100 : 0,
      nextNine: rows.slice(1, 10).reduce((s, r) => s + r.value, 0),
    };
  }, [militaryExpenditureUsd]);

  const leader = data[0];

  return (
    <CompositionTreemap
      isDarkMode={isDarkMode}
      title="The Scale Gap"
      subtitle={`Military spending in current US dollars${year ? `, latest available year (${year})` : ''}. Tile area is proportional to absolute spending.`}
      data={data}
      topN={14}
      format={v => `$${v.toFixed(0)}B`}
      provenance={<ChartMeta sourceId="wb-military-spend" isDarkMode={isDarkMode} />}
      height="h-[320px] sm:h-[460px]"
      footnote={
        <>
          World Bank MS.MIL.XPND.CD with SIPRI used as a fallback where the World Bank series is
          blocked or missing, covering {data.length} roster countries and ${total.toFixed(0)}B of
          spending.
          {leader && ` ${leader.name} alone is ${topShare.toFixed(0)}% of that, against $${nextNine.toFixed(0)}B for the next nine spenders combined.`}
          {' '}Dollar comparisons overstate the gap in real capability: personnel and domestic
          procurement cost far less in China, India and Russia than in the US or Western Europe,
          so purchasing-power-adjusted budgets close a meaningful part of this picture without
          closing all of it.
        </>
      }
    />
  );
}
