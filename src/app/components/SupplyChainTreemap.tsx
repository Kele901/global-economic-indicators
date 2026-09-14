'use client';

// Supply-chain concentration as a treemap, one product at a time. The table
// version of this data reads as three columns of percentages; as area, the
// fact that one country holds 90% of refined rare earths is unmissable.

import { useMemo, useState } from 'react';
import { SUPPLY_CHAIN_CONCENTRATION } from '../services/tradeCurated';
import CompositionTreemap from './charts/CompositionTreemap';
import ChartMeta from './ChartMeta';
import DataQualityBadge from './DataQualityBadge';

interface Props {
  isDarkMode: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  'critical mineral': 'Critical minerals',
  semiconductor: 'Semiconductors',
  energy: 'Energy equipment',
  pharma: 'Pharmaceuticals',
  agri: 'Agriculture',
};

// "Rare earth elements (refined)" -> "Rare earth (refined)". The category
// heading above each row already carries the context the full name repeats.
function shortLabel(product: string): string {
  return product.replace(' elements', '').replace('Semiconductors ', 'Chips ');
}

export default function SupplyChainTreemap({ isDarkMode }: Props) {
  const [product, setProduct] = useState(SUPPLY_CHAIN_CONCENTRATION[0]!.product);
  const row = SUPPLY_CHAIN_CONCENTRATION.find(r => r.product === product) ?? SUPPLY_CHAIN_CONCENTRATION[0]!;

  const data = useMemo(() => {
    const named = [
      { name: row.top1Country, value: row.top1SharePct, color: '#dc2626' },
      { name: row.top2Country, value: row.top2SharePct, color: '#f59e0b' },
      { name: row.top3Country, value: row.top3SharePct, color: '#0891b2' },
    ].filter(d => d.value > 0);
    const rest = 100 - named.reduce((s, d) => s + d.value, 0);
    return rest > 0.5
      ? [...named, { name: 'Everyone else', value: rest, color: isDarkMode ? '#475569' : '#94a3b8' }]
      : named;
  }, [row, isDarkMode]);

  const grouped = useMemo(() => {
    const byCategory = new Map<string, typeof SUPPLY_CHAIN_CONCENTRATION>();
    for (const r of SUPPLY_CHAIN_CONCENTRATION) {
      const list = byCategory.get(r.category) ?? [];
      list.push(r);
      byCategory.set(r.category, list);
    }
    return [...byCategory.entries()];
  }, []);

  return (
    <CompositionTreemap
      isDarkMode={isDarkMode}
      title={`Who Controls ${row.product}`}
      subtitle={`Share of global supply. ${row.top1Country} alone holds ${row.top1SharePct}%.`}
      data={data}
      format={v => `${v.toFixed(0)}%`}
      provenance={
        <>
          <ChartMeta sourceId="trade-ledger-curated" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="curated" isDarkMode={isDarkMode} />
        </>
      }
      height="h-[340px]"
      actions={
        <div className="flex flex-col gap-1.5 items-end max-w-2xl">
          {grouped.map(([category, rows]) => (
            <div key={category} className="flex flex-wrap gap-1.5 justify-end items-center">
              <span className={`text-[10px] uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {CATEGORY_LABELS[category] ?? category}
              </span>
              {rows.map(r => (
                <button
                  key={r.product}
                  onClick={() => setProduct(r.product)}
                  aria-pressed={r.product === product}
                  className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                    r.product === product
                      ? 'bg-rose-500/15 border-rose-500 text-rose-400'
                      : isDarkMode
                        ? 'border-gray-600 text-gray-400 hover:text-gray-200'
                        : 'border-gray-300 text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {shortLabel(r.product)}
                </button>
              ))}
            </div>
          ))}
        </div>
      }
      footnote={
        <>
          Curated shares from USGS Mineral Commodity Summaries 2024, SEMI/TrendForce, IEA and FAO.
          {row.note ? ` ${row.note}.` : ''} The &ldquo;mine&rdquo; versus &ldquo;refined&rdquo; pairs
          are the ones worth sitting with: several minerals are mined in a spread of countries and
          then refined almost entirely in one, which means diversifying extraction does nothing for
          resilience on its own. A share above roughly 70% is the point at which a single export
          restriction becomes a global supply shock rather than a price move.
        </>
      }
    />
  );
}
