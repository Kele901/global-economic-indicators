'use client';

// Entrepôt trade as a three-column flow: where goods come from, the hub they
// clear customs in, and where they actually end up. This is the single best
// answer to "why don't bilateral trade balances add up" — a Chinese good
// landed in Rotterdam and trucked to Germany is recorded as a Dutch export.

import { useMemo, useState } from 'react';
import { RE_EXPORT_HUBS_2024 } from '../services/tradeCurated';
import FlowDiagram, { type FlowColumn, type FlowNode, type FlowLink } from './charts/FlowDiagram';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

const TITLE = 'Re-Exports: Goods That Only Pass Through';

interface Props {
  isDarkMode: boolean;
}

const ORIGIN_COLORS: Record<string, string> = {
  'Mainland China':     '#dc2626',
  'East Asia':          '#be185d',
  'Southeast Asia':     '#d97706',
  'South Asia':         '#f43f5e',
  'Europe':             '#6366f1',
  'North America':      '#2563eb',
  'Latin America':      '#16a34a',
  'Middle East':        '#059669',
  'Sub-Saharan Africa': '#0d9488',
  'Rest of world':      '#64748b',
};

function regionColor(region: string): string {
  return ORIGIN_COLORS[region] ?? '#64748b';
}

export default function TradeReExportFlow({ isDarkMode }: Props) {
  const [hubIso3, setHubIso3] = useState(RE_EXPORT_HUBS_2024[0]!.iso3);
  const hub = RE_EXPORT_HUBS_2024.find(h => h.iso3 === hubIso3) ?? RE_EXPORT_HUBS_2024[0]!;

  const { nodes, links } = useMemo(() => {
    const bn = (sharePct: number) => (hub.reExportsBnUsd * sharePct) / 100;

    const flowNodes: FlowNode[] = [
      ...hub.origins.map(o => ({
        id: `origin:${o.region}`,
        label: o.region,
        column: 'origin',
        value: o.sharePct,
        valueLabel: `$${bn(o.sharePct).toFixed(0)}B`,
        color: regionColor(o.region),
      })),
      {
        id: 'hub',
        label: hub.hub,
        column: 'hub',
        value: 100,
        valueLabel: `$${hub.reExportsBnUsd}B re-exported`,
        color: isDarkMode ? '#a78bfa' : '#7c3aed',
      },
      ...hub.destinations.map(d => ({
        id: `dest:${d.region}`,
        label: d.region,
        column: 'destination',
        value: d.sharePct,
        valueLabel: `$${bn(d.sharePct).toFixed(0)}B`,
        color: regionColor(d.region),
      })),
    ];

    const flowLinks: FlowLink[] = [
      ...hub.origins.map(o => ({ source: `origin:${o.region}`, target: 'hub', value: o.sharePct })),
      ...hub.destinations.map(d => ({ source: 'hub', target: `dest:${d.region}`, value: d.sharePct })),
    ];

    return { nodes: flowNodes, links: flowLinks };
  }, [hub, isDarkMode]);

  const columns: FlowColumn[] = [
    { id: 'origin',      label: 'Goods originate',  color: isDarkMode ? '#60a5fa' : '#2563eb' },
    { id: 'hub',         label: 'Clear customs in', color: isDarkMode ? '#a78bfa' : '#7c3aed' },
    { id: 'destination', label: 'End up in',        color: isDarkMode ? '#34d399' : '#059669' },
  ];

  const cardCls = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div id={slugify(TITLE)} className={`rounded-xl border p-4 sm:p-6 ${cardCls}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h3 className={`text-lg font-semibold ${textPrimary}`}>{TITLE}</h3>
          <p className={`text-sm mt-0.5 max-w-2xl ${textSec}`}>
            {hub.shareOfGoodsExportsPct}% of {hub.hub}&apos;s goods exports are re-exports — things it
            never made. Pick a hub to see what arrives and where it goes next.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {RE_EXPORT_HUBS_2024.map(h => (
            <button
              key={h.iso3}
              onClick={() => setHubIso3(h.iso3)}
              aria-pressed={h.iso3 === hubIso3}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                h.iso3 === hubIso3
                  ? 'bg-purple-500/15 border-purple-500 text-purple-400'
                  : isDarkMode
                    ? 'border-gray-600 text-gray-400 hover:text-gray-200'
                    : 'border-gray-300 text-gray-500 hover:text-gray-800'
              }`}
            >
              {h.hub}
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
        height={Math.max(360, Math.max(hub.origins.length, hub.destinations.length) * 78)}
        ariaLabel={`Re-export flows through ${hub.hub} in 2024, totalling ${hub.reExportsBnUsd} billion dollars, ${hub.shareOfGoodsExportsPct} percent of its goods exports.`}
      />

      <p className={`text-sm mt-4 ${textSec}`}>{hub.note}</p>

      <p className={`text-xs mt-3 leading-relaxed ${textSec}`}>
        Curated 2024 estimates from national statistics offices (CBS Netherlands, Enterprise
        Singapore, Hong Kong Census &amp; Statistics, Dubai Customs, NBB Belgium) and UNCTAD. The
        origin and destination splits are approximations from those offices&apos; published
        breakdowns, so read the ribbon widths as proportions rather than precise values. The
        practical consequence is in every bilateral balance on this site: trade recorded against a
        hub is not trade with that hub&apos;s economy, which is why the Netherlands appears to run a
        huge surplus with Germany and Hong Kong appears to be one of the world&apos;s great
        manufacturing exporters.
      </p>
    </div>
  );
}
