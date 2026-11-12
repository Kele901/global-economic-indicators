'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ChartMeta from '../ChartMeta';
import DataQualityBadge from '../DataQualityBadge';
import DataDownloadButton from '../DataDownloadButton';
import PowerNetworkGraph from './PowerNetworkGraph';
import CompanyProfile from './CompanyProfile';
import ChokepointMap from './ChokepointMap';
import PowerRankings from './PowerRankings';
import CompanyDirectory from './CompanyDirectory';
import HubPicker from './HubPicker';
import type { NetworkDataset } from '../../services/network/types';
import { formatUsdBn, neighbourIds, neighbours, parseHubParam, secondDegree } from '../../utils/aiNetwork/network';

interface Props {
  isDarkMode: boolean;
  dataset: NetworkDataset;
}

function scrollIntoViewIfNeeded(el: HTMLElement | null) {
  if (!el) return;
  const { top } = el.getBoundingClientRect();
  if (top < 0 || top > window.innerHeight - 160) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function PowerNetworkChapter({ isDarkMode, dataset }: Props) {
  const { companies, links, companyById, categoryById, defaultHub, lastUpdated } = dataset;

  // Rendered client-only (dynamic import with ssr: false), so window is available on first render.
  const [hubId, setHubId] = useState(
    () => parseHubParam(window.location.search, new Set(companies.map((c) => c.id))) ?? defaultHub,
  );
  const [selectedId, setSelectedId] = useState<string>(hubId);
  const graphRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const shareUrl = useCallback(
    (id: string) => `${window.location.origin}${window.location.pathname}?hub=${encodeURIComponent(id)}${dataset.chapterHash}`,
    [dataset.chapterHash],
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    if (hubId === defaultHub) url.searchParams.delete('hub');
    else url.searchParams.set('hub', hubId);
    const next = `${url.pathname}${url.search}${url.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      // null state lets Next.js (14.1+) sync its router URL; passing its own state makes it skip the sync.
      window.history.replaceState(null, '', next);
    }
  }, [hubId, defaultHub]);

  const hubSummary = useMemo(() => {
    const direct = [...neighbourIds(links, hubId)].map((id) => companyById[id]).filter(Boolean);
    const biggest = [...direct].sort((a, b) => (b.valueUsdBn ?? 0) - (a.valueUsdBn ?? 0)).slice(0, 3);
    return { direct: direct.length, indirect: Object.keys(secondDegree(links, hubId)).length, biggest };
  }, [links, companyById, hubId]);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    requestAnimationFrame(() => scrollIntoViewIfNeeded(profileRef.current));
  }, []);

  // On desktop the graph stays in view while exploring; the phone list view has no hover card, so jump to the profile.
  const selectFromGraph = useCallback((id: string) => {
    if (window.innerWidth < 640) select(id);
    else setSelectedId(id);
  }, [select]);

  const recentre = useCallback((id: string) => {
    setHubId(id);
    setSelectedId(id);
    requestAnimationFrame(() => scrollIntoViewIfNeeded(graphRef.current));
  }, []);

  const stats = useMemo(() => {
    const listedValue = companies.filter((c) => c.listed).reduce((s, c) => s + (c.valueUsdBn ?? 0), 0);
    const degree = companies.map((c) => ({ c, n: new Set(neighbours(links, c.id).map((r) => r.id)).size }))
      .sort((a, b) => b.n - a.n);
    return {
      companies: companies.length,
      links: links.length,
      listedValue,
      countries: new Set(companies.map((c) => c.hqCountry)).size,
      mostConnected: degree[0],
    };
  }, [companies, links]);

  const hub = companyById[hubId];
  const selected = companyById[selectedId] ?? hub;

  const card = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const tiles = [
    { label: 'Companies mapped', value: String(stats.companies), note: `${stats.countries} countries, ${dataset.layersLabel}` },
    { label: 'Relationships', value: String(stats.links), note: 'supply, compute, investment and partnership links' },
    { label: 'Listed market value', value: formatUsdBn(stats.listedValue), note: `combined, as of ${lastUpdated}` },
    {
      label: 'Most connected',
      value: stats.mostConnected.c.name,
      note: `${stats.mostConnected.n} direct counterparties`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className={`p-3 rounded-lg border ${card}`}>
            <div className={`text-[11px] uppercase tracking-wider ${muted}`}>{t.label}</div>
            <div className={`text-xl font-semibold tabular-nums mt-0.5 ${text}`}>{t.value}</div>
            <div className={`text-[11px] ${muted}`}>{t.note}</div>
          </div>
        ))}
      </div>

      <div ref={graphRef} className={`rounded-xl border p-3 sm:p-5 scroll-mt-20 ${card}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <h3 className={`text-base sm:text-lg font-semibold ${text}`}>
            Who powers whom, centred on {hub.name}
          </h3>
          <span className={`text-xs ${muted}`}>
            Hub layer: <span style={{ color: categoryById[hub.category].color }}>{categoryById[hub.category].label}</span>
          </span>
        </div>
        <HubPicker
          isDarkMode={isDarkMode}
          dataset={dataset}
          hubId={hubId}
          onRecentre={recentre}
          shareUrl={shareUrl}
        />
        <PowerNetworkGraph
          isDarkMode={isDarkMode}
          dataset={dataset}
          hubId={hubId}
          selectedId={selectedId}
          onSelect={selectFromGraph}
          onRecentre={recentre}
        />
        {selected && (
          <div className={`mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-3 py-2 text-sm ${
            isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
          }`}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: categoryById[selected.category].color }} />
            <span className={`font-semibold ${text}`}>{selected.name}</span>
            <span className={`flex-1 min-w-[200px] ${muted}`}>{selected.oneLiner}</span>
            <button
              type="button"
              onClick={() => profileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className={`text-xs font-semibold ${isDarkMode ? 'text-violet-300' : 'text-violet-700'}`}
            >
              Full profile ↓
            </button>
            {selected.id !== hubId && (
              <button
                type="button"
                onClick={() => recentre(selected.id)}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700"
              >
                Centre on {selected.name}
              </button>
            )}
          </div>
        )}
        <p className={`mt-2 text-xs ${muted}`}>
          <span className={`font-semibold ${text}`}>{hub.name}</span>: {hubSummary.direct} direct
          {hubSummary.direct === 1 ? ' link' : ' links'}, {hubSummary.indirect} more {hubSummary.indirect === 1 ? 'company' : 'companies'} within
          two steps.
          {hubSummary.biggest.length > 0 && (
            <>
              {' '}Biggest ties:{' '}
              {hubSummary.biggest.map((c, i) => (
                <React.Fragment key={c.id}>
                  {i > 0 && ', '}
                  <button
                    type="button"
                    onClick={() => select(c.id)}
                    className={`font-medium underline-offset-2 hover:underline ${isDarkMode ? 'text-violet-300' : 'text-violet-700'}`}
                  >
                    {c.name}
                  </button>
                </React.Fragment>
              ))}
              .
            </>
          )}
        </p>
      </div>

      <div ref={profileRef} className="scroll-mt-20">
        {selected && (
          <CompanyProfile
            isDarkMode={isDarkMode}
            dataset={dataset}
            company={selected}
            hubId={hubId}
            onSelect={select}
            onRecentre={recentre}
          />
        )}
      </div>

      <ChokepointMap isDarkMode={isDarkMode} dataset={dataset} onSelect={select} />

      <PowerRankings isDarkMode={isDarkMode} dataset={dataset} selectedId={selectedId} onSelect={select} />

      <CompanyDirectory isDarkMode={isDarkMode} dataset={dataset} selectedId={selectedId} onSelect={select} onRecentre={recentre} hubId={hubId} />

      <div className={`flex flex-wrap items-center justify-between gap-3 text-xs ${muted}`}>
        <div className="flex flex-wrap items-center gap-2">
          <ChartMeta sourceId={dataset.sourceId} isDarkMode={isDarkMode} />
          <DataQualityBadge flag="curated" isDarkMode={isDarkMode} />
          <DataQualityBadge flag="estimate" isDarkMode={isDarkMode} />
        </div>
        <DataDownloadButton
          isDarkMode={isDarkMode}
          filename={dataset.filename}
          label="Data"
          shareTitle={dataset.shareTitle}
          getData={() => [
            ...companies.map((c) => ({
              record: 'company',
              id: c.id,
              name: c.name,
              category: categoryById[c.category].label,
              tier: c.tier ?? 'full',
              hqCountry: c.hqCountry,
              hqCity: c.hqCity,
              founded: c.founded,
              leader: c.leader ?? '',
              listed: c.listed,
              ticker: c.ticker ?? '',
              revenueUsdBn: c.revenueUsdBn,
              revenueBasis: c.revenueBasis,
              valueUsdBn: c.valueUsdBn,
              valueBasis: c.valueBasis,
              employees: c.employees ?? null,
              oneLiner: c.oneLiner,
              role: c.role,
              sources: c.sources.map((s) => s.url).join(' '),
            })),
            ...links.map((l) => ({
              record: 'link',
              source: l.source,
              target: l.target,
              kind: l.kind,
              commodity: l.commodity ?? '',
              note: l.note,
            })),
          ]}
        />
      </div>
      <p className={`text-[11px] leading-relaxed ${muted}`}>
        Figures are approximate. Listed values are market caps as of {lastUpdated}; private values are the latest
        reported funding round or deal. {dataset.footnote}
      </p>
    </div>
  );
}
