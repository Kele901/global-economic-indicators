'use client';

// Remittance corridors as a two-column flow: sending economies on the left,
// receiving economies on the right, ribbon thickness proportional to the
// annual flow in billions of dollars. A table of corridors makes you read
// row by row; the flow shows at a glance that a handful of Gulf states and
// the US fund most of the money moving to South and South-East Asia.

import { useMemo, useState } from 'react';
import { REMITTANCE_CORRIDORS_2024 } from '../services/migrationCurated';
import FlowDiagram, { type FlowColumn, type FlowNode, type FlowLink } from './charts/FlowDiagram';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

const TITLE = 'Remittance Corridors, 2024';

interface Props {
  isDarkMode: boolean;
}

const TOP_CORRIDOR_COUNTS = [10, 16, REMITTANCE_CORRIDORS_2024.length] as const;

const SENDER_COLORS = ['#2563eb', '#0ea5e9', '#6366f1', '#7c3aed', '#0891b2', '#1d4ed8', '#4f46e5', '#0284c7'];
const RECEIVER_COLORS = ['#059669', '#10b981', '#16a34a', '#65a30d', '#84cc16', '#22c55e', '#0d9488', '#15803d'];

export default function MigrationCorridorFlow({ isDarkMode }: Props) {
  const [limit, setLimit] = useState<number>(TOP_CORRIDOR_COUNTS[1]);

  const corridors = useMemo(
    () => [...REMITTANCE_CORRIDORS_2024].sort((a, b) => b.amountBn - a.amountBn).slice(0, limit),
    [limit],
  );

  const { nodes, links, totalBn } = useMemo(() => {
    const senderTotals = new Map<string, number>();
    const receiverTotals = new Map<string, number>();
    for (const c of corridors) {
      senderTotals.set(c.from, (senderTotals.get(c.from) ?? 0) + c.amountBn);
      receiverTotals.set(c.to, (receiverTotals.get(c.to) ?? 0) + c.amountBn);
    }

    const senders = [...senderTotals.entries()].sort((a, b) => b[1] - a[1]);
    const receivers = [...receiverTotals.entries()].sort((a, b) => b[1] - a[1]);

    const flowNodes: FlowNode[] = [
      ...senders.map(([name, value], i) => ({
        id: `from:${name}`,
        label: name,
        column: 'sender',
        value,
        valueLabel: `$${value.toFixed(1)}B out`,
        color: SENDER_COLORS[i % SENDER_COLORS.length],
      })),
      ...receivers.map(([name, value], i) => ({
        id: `to:${name}`,
        label: name,
        column: 'receiver',
        value,
        valueLabel: `$${value.toFixed(1)}B in`,
        color: RECEIVER_COLORS[i % RECEIVER_COLORS.length],
      })),
    ];

    // Ribbons are ordered by receiver rank so the big destinations stack at
    // the top of each sender rather than criss-crossing the middle.
    const receiverRank = new Map(receivers.map(([name], i) => [name, i]));
    const flowLinks: FlowLink[] = corridors
      .slice()
      .sort((a, b) => (receiverRank.get(a.to)! - receiverRank.get(b.to)!) || b.amountBn - a.amountBn)
      .map(c => ({ source: `from:${c.from}`, target: `to:${c.to}`, value: c.amountBn }));

    return {
      nodes: flowNodes,
      links: flowLinks,
      totalBn: corridors.reduce((s, c) => s + c.amountBn, 0),
    };
  }, [corridors]);

  const columns: FlowColumn[] = [
    { id: 'sender',   label: 'Sending economy',   color: isDarkMode ? '#60a5fa' : '#2563eb' },
    { id: 'receiver', label: 'Receiving economy', color: isDarkMode ? '#34d399' : '#059669' },
  ];

  const cardCls = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  const biggest = corridors[0];

  return (
    <div id={slugify(TITLE)} className={`rounded-xl border p-4 sm:p-6 ${cardCls}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h3 className={`text-lg font-semibold ${textPrimary}`}>{TITLE}</h3>
          <p className={`text-sm mt-0.5 ${textSec}`}>
            Where migrant earnings actually go. Ribbon thickness is the annual flow in US dollars.
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          {TOP_CORRIDOR_COUNTS.map(n => (
            <button
              key={n}
              onClick={() => setLimit(n)}
              aria-pressed={limit === n}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                limit === n
                  ? 'bg-blue-500/15 border-blue-500 text-blue-500'
                  : isDarkMode
                    ? 'border-gray-600 text-gray-400 hover:text-gray-200'
                    : 'border-gray-300 text-gray-500 hover:text-gray-800'
              }`}
            >
              {n === REMITTANCE_CORRIDORS_2024.length ? 'All' : `Top ${n}`}
            </button>
          ))}
          <SocialShareMenu title={TITLE} isDarkMode={isDarkMode} />
        </div>
      </div>

      <FlowDiagram
        isDarkMode={isDarkMode}
        columns={columns}
        nodes={nodes}
        links={links}
        height={Math.max(360, Math.min(nodes.length, 24) * 30)}
        ariaLabel={`Top ${corridors.length} remittance corridors in 2024, totalling ${totalBn.toFixed(0)} billion US dollars. Largest corridor: ${biggest ? `${biggest.from} to ${biggest.to} at ${biggest.amountBn} billion dollars` : 'none'}.`}
      />

      <p className={`text-xs mt-4 leading-relaxed ${textSec}`}>
        Curated World Bank / KNOMAD bilateral corridor estimates for 2024, covering the
        {' '}{corridors.length} largest corridors and ${totalBn.toFixed(0)}B of flow. Bilateral
        remittance figures are themselves estimates — they are modelled from migrant stocks and
        income differences rather than counted transaction by transaction, and informal channels
        (hawala, cash carried home) are missing entirely, so real flows into South Asia and the
        Horn of Africa are higher than shown. Corridors are directional: this is money leaving
        the left column, not net transfers between the two.
      </p>
    </div>
  );
}
