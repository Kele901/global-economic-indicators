'use client';

import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { CommodityHistory } from '../services/commodities';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

const TITLE = 'Every Commodity Has Its Own Cycle';
const BASE_YEARS = [2000, 2010, 2020] as const;

interface Props {
  isDarkMode: boolean;
  commodities: { [id: string]: CommodityHistory };
}

function shortLabel(label: string): string {
  return label.replace(' Crude Oil', '').replace('Natural Gas ', 'Gas ').replace(/[()]/g, '');
}

export default function CommodityCycleComparison({ isDarkMode, commodities }: Props) {
  const [baseYear, setBaseYear] = useState<(typeof BASE_YEARS)[number]>(2000);
  const [hidden, setHidden] = useState<Set<string>>(new Set(['brent', 'euGas']));

  const series = useMemo(() => Object.values(commodities).filter(h => h.annual.length > 0), [commodities]);

  const { data, available } = useMemo(() => {
    const years = new Set<number>();
    const bases = new Map<string, number>();
    series.forEach(h => {
      const base = h.annual.find(p => p.year === baseYear)?.value;
      if (!base) return;
      bases.set(h.meta.id, base);
      h.annual.forEach(p => p.year >= baseYear && years.add(p.year));
    });
    const rows = Array.from(years).sort((a, b) => a - b).map(year => {
      const row: Record<string, number | null> = { year };
      series.forEach(h => {
        const base = bases.get(h.meta.id);
        const v = h.annual.find(p => p.year === year)?.value;
        row[h.meta.id] = base && v != null ? (v / base) * 100 : null;
      });
      return row;
    });
    return { data: rows, available: new Set(bases.keys()) };
  }, [series, baseYear]);

  const table = useMemo(() => series.map(h => {
    let peak = h.annual[0];
    h.annual.forEach(p => { if (p.value > peak.value) peak = p; });
    const latest = h.latest?.value ?? h.annual[h.annual.length - 1].value;
    const base = h.annual.find(p => p.year === baseYear)?.value;
    return {
      h,
      peak,
      latest,
      fromPeak: ((latest - peak.value) / peak.value) * 100,
      sinceBase: base ? ((latest - base) / base) * 100 : null,
    };
  }).sort((a, b) => (b.sinceBase ?? -Infinity) - (a.sinceBase ?? -Infinity)), [series, baseYear]);

  if (series.length === 0) return null;

  const colorFor = (h: CommodityHistory) => (isDarkMode && h.meta.color === '#0f172a' ? '#e2e8f0' : isDarkMode && h.meta.color === '#1c1917' ? '#a8a29e' : h.meta.color);
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = 'text-gray-500';

  const toggle = (id: string) => setHidden(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const leader = table[0];
  const laggard = [...table].reverse().find(r => r.sinceBase != null);

  return (
    <div id={slugify(TITLE)} className={`rounded-lg border p-4 sm:p-6 mt-4 ${cardBg}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div>
          <h4 className={`text-base font-semibold ${textPrimary}`}>{TITLE}</h4>
          <p className={`text-xs mt-0.5 ${textSec}`}>
            Annual average prices rebased to {baseYear} = 100. Oil gets the headlines, but metals, coal, gas and grain boom and bust on their own timetables.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex gap-1" role="group" aria-label="Base year">
            {BASE_YEARS.map(y => (
              <button
                key={y}
                type="button"
                onClick={() => setBaseYear(y)}
                aria-pressed={baseYear === y}
                className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                  baseYear === y
                    ? 'bg-amber-500 text-white'
                    : isDarkMode ? 'bg-gray-900 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                {y} = 100
              </button>
            ))}
          </div>
          <SocialShareMenu title={TITLE} isDarkMode={isDarkMode} />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {series.filter(h => available.has(h.meta.id)).map(h => {
          const on = !hidden.has(h.meta.id);
          return (
            <button
              key={h.meta.id}
              type="button"
              onClick={() => toggle(h.meta.id)}
              aria-pressed={on}
              className={`text-[11px] px-2 py-1 rounded-full border flex items-center gap-1.5 transition-opacity ${
                isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'
              } ${on ? '' : 'opacity-40'}`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorFor(h) }} />
              {shortLabel(h.meta.label)}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 16, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} />
              <XAxis dataKey="year" stroke={axis} tick={{ fontSize: 11 }} />
              <YAxis stroke={axis} tick={{ fontSize: 11 }} />
              <ReferenceLine y={100} stroke={axis} strokeDasharray="4 4" />
              <Tooltip
                contentStyle={isDarkMode
                  ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: 8, fontSize: 12 }
                  : { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: 8, fontSize: 12 }}
                itemSorter={(item: any) => -(item.value ?? 0)}
                formatter={(v: any, k: any) => {
                  const h = commodities[String(k)];
                  return [v == null ? '—' : Number(v).toFixed(0), h ? shortLabel(h.meta.label) : String(k)];
                }}
              />
              {series.filter(h => available.has(h.meta.id) && !hidden.has(h.meta.id)).map(h => (
                <Line
                  key={h.meta.id}
                  type="monotone"
                  dataKey={h.meta.id}
                  stroke={colorFor(h)}
                  strokeWidth={1.75}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <div className={`text-xs font-medium mb-2 ${textSec}`}>Latest vs. base year and vs. all-time annual peak</div>
          <table className="w-full text-xs">
            <thead className={`text-[10px] uppercase tracking-wider ${textMuted}`}>
              <tr>
                <th className="text-left font-medium py-1">Commodity</th>
                <th className="text-right font-medium py-1">Since {baseYear}</th>
                <th className="text-right font-medium py-1">From peak</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {table.map(r => (
                <tr key={r.h.meta.id}>
                  <td className={`py-1.5 ${textPrimary}`}>
                    <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: colorFor(r.h) }} />
                    {shortLabel(r.h.meta.label)}
                  </td>
                  <td className={`py-1.5 text-right tabular-nums ${r.sinceBase == null ? textMuted : r.sinceBase >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {r.sinceBase == null ? '—' : `${r.sinceBase >= 0 ? '+' : ''}${r.sinceBase.toFixed(0)}%`}
                  </td>
                  <td className={`py-1.5 text-right tabular-nums ${textSec}`} title={`Peak annual average ${r.peak.year}`}>
                    {r.fromPeak.toFixed(0)}% <span className={`text-[10px] ${textMuted}`}>({r.peak.year})</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leader && laggard && leader !== laggard && (
            <p className={`text-[11px] mt-3 leading-relaxed ${textMuted}`}>
              Since {baseYear}, {shortLabel(leader.h.meta.label)} has gained the most
              ({leader.sinceBase! >= 0 ? '+' : ''}{leader.sinceBase!.toFixed(0)}%) and {shortLabel(laggard.h.meta.label)} the least
              ({laggard.sinceBase! >= 0 ? '+' : ''}{laggard.sinceBase!.toFixed(0)}%). Prices are nominal; US consumer prices rose
              roughly {baseYear === 2000 ? '90' : baseYear === 2010 ? '50' : '28'}% over the same span, so anything below that has fallen in real terms.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
