'use client';

import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CountryFlag from '../CountryFlag';
import type { NetworkDataset } from '../../services/network/types';
import {
  categoryTotals,
  countryLabel,
  countryTotals,
  formatUsdBn,
  metricOf,
  rankBy,
  sectorTotals,
  shortName,
  type RankMetric,
} from '../../utils/aiNetwork/network';
import { useViewportSize } from '../../hooks/useViewportSize';

interface Props {
  isDarkMode: boolean;
  dataset: NetworkDataset;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const TOP_N = 25;

export default function PowerRankings({ isDarkMode, dataset, selectedId, onSelect }: Props) {
  const { companies, categoryById: CATEGORY_BY_ID, sectors } = dataset;
  const { isMobile } = useViewportSize();
  const [metric, setMetric] = useState<RankMetric>('value');
  const [showAll, setShowAll] = useState(false);

  const ranked = useMemo(() => rankBy(companies, metric), [companies, metric]);
  const rows = (showAll ? ranked : ranked.slice(0, TOP_N)).map((c) => ({
    id: c.id,
    label: `${shortName(c)}${c.listed ? '' : ' *'}`,
    value: metricOf(c, metric) ?? 0,
    color: CATEGORY_BY_ID[c.category].color,
    basis: metric === 'value' ? c.valueBasis : c.revenueBasis,
    category: CATEGORY_BY_ID[c.category].label,
  }));
  // Large datasets group by sector so the breakdown stays readable.
  const cats = useMemo(() => {
    const totals = sectors ? sectorTotals(companies, sectors, metric) : categoryTotals(companies, metric);
    const meta = (key: string) => {
      const s = sectors?.find((x) => x.id === key);
      return s ? { label: s.label, color: s.color } : CATEGORY_BY_ID[key];
    };
    return totals.filter((t) => t.total > 0).map((t) => ({ ...t, ...meta(t.key) }));
  }, [companies, sectors, CATEGORY_BY_ID, metric]);
  const countries = useMemo(() => countryTotals(companies, metric).filter((t) => t.total > 0), [companies, metric]);
  const grandTotal = cats.reduce((s, t) => s + t.total, 0);
  const missing = companies.length - ranked.length;

  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const tooltipStyle: React.CSSProperties = isDarkMode
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px' }
    : { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };
  const card = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const toggle = (on: boolean) => `px-2.5 py-1 text-xs font-medium rounded-md ${
    on ? 'bg-violet-600 text-white' : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
  }`;

  return (
    <div className={`rounded-xl border p-4 sm:p-6 ${card}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h3 className={`text-base sm:text-lg font-semibold ${text}`}>Power rankings</h3>
        <div className="flex gap-1" role="group" aria-label="Ranking metric">
          <button type="button" className={toggle(metric === 'value')} aria-pressed={metric === 'value'} onClick={() => setMetric('value')}>Market value</button>
          <button type="button" className={toggle(metric === 'revenue')} aria-pressed={metric === 'revenue'} onClick={() => setMetric('revenue')}>Revenue</button>
        </div>
      </div>
      <p className={`text-xs mb-4 ${muted}`}>
        USD, {metric === 'value' ? 'market cap or latest private valuation' : 'latest fiscal year, or annualised run-rate for AI labs'}.
        Bars are coloured by category; * marks a private company. Click a bar to open its profile.
        {missing > 0 && ` ${missing} companies have no comparable ${metric === 'value' ? 'valuation' : 'revenue'} figure and are left out.`}
      </p>

      <div style={{ height: Math.max(260, rows.length * 24 + 40) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 0, right: isMobile ? 8 : 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} horizontal={false} />
            <XAxis type="number" stroke={axis} tick={{ fontSize: isMobile ? 9 : 11 }} tickFormatter={(v: number) => formatUsdBn(v)} />
            <YAxis type="category" dataKey="label" stroke={axis} width={isMobile ? 84 : 110} tick={{ fontSize: isMobile ? 10 : 11 }} interval={0} />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
              formatter={(v: number, _n, item) => [`${formatUsdBn(v)} · ${item.payload.basis}`, item.payload.category]}
            />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              className="cursor-pointer"
              onClick={(d: { id?: string }) => d.id && onSelect(d.id)}
            >
              {rows.map((r) => (
                <Cell key={r.id} fill={r.color} fillOpacity={selectedId && selectedId !== r.id ? 0.55 : 1} stroke={selectedId === r.id ? (isDarkMode ? '#fff' : '#111827') : undefined} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {ranked.length > TOP_N && (
        <button type="button" onClick={() => setShowAll((v) => !v)} className={`mt-2 text-xs font-medium ${isDarkMode ? 'text-violet-300' : 'text-violet-700'}`}>
          {showAll ? `Show top ${TOP_N}` : `Show all ${ranked.length}`}
        </button>
      )}

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div>
          <h4 className={`text-xs uppercase tracking-wider font-semibold mb-2 ${muted}`}>
            {sectors ? 'By sector' : 'By layer of the stack'}
          </h4>
          <div className="flex h-3 rounded-full overflow-hidden mb-3" aria-hidden>
            {cats.map((t) => (
              <div key={t.key} style={{ width: `${(t.total / grandTotal) * 100}%`, background: t.color }} />
            ))}
          </div>
          <ul className="space-y-1 text-sm">
            {cats.map((t) => (
              <li key={t.key} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: t.color }} />
                <span className={`flex-1 ${text}`}>{t.label}</span>
                <span className={`tabular-nums ${muted}`}>{((t.total / grandTotal) * 100).toFixed(0)}%</span>
                <span className={`tabular-nums w-16 text-right font-medium ${text}`}>{formatUsdBn(t.total)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={`text-xs uppercase tracking-wider font-semibold mb-2 ${muted}`}>By headquarters</h4>
          <ul className="space-y-1 text-sm">
            {countries.map((t) => (
              <li key={t.key} className="flex items-center gap-2">
                <CountryFlag countryKey={t.key} className="w-5 h-3.5 rounded-sm" />
                <span className={`flex-1 ${text}`}>{countryLabel(t.key)}</span>
                <span className={`text-xs ${muted}`}>{t.count} {t.count === 1 ? 'company' : 'companies'}</span>
                <span className={`tabular-nums ${muted} w-10 text-right`}>{((t.total / grandTotal) * 100).toFixed(0)}%</span>
                <span className={`tabular-nums w-16 text-right font-medium ${text}`}>{formatUsdBn(t.total)}</span>
              </li>
            ))}
          </ul>
          <p className={`text-[11px] mt-2 ${muted}`}>
            Totals add up the companies in this network only, so they show where power in this network is concentrated, not national totals.
          </p>
        </div>
      </div>
    </div>
  );
}
