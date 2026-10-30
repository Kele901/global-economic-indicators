'use client';

import { useMemo, useState } from 'react';
import type { CommodityHistory } from '../services/commodities';
import Sparkline from './Sparkline';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

const TITLE = 'Commodity Scoreboard';

interface Props {
  isDarkMode: boolean;
  commodities: { [id: string]: CommodityHistory };
}

type SortKey = 'default' | 'ytd' | 'vs5y' | 'range';

interface Row {
  h: CommodityHistory;
  latest: number;
  ytd: number | null;
  vs5y: number | null;
  avg5y: number | null;
  lo: number;
  hi: number;
  pos: number; // 0..1 position of latest in 10-yr range
  loYear: number;
  hiYear: number;
}

function pct(a: number, b: number): number {
  return ((a - b) / b) * 100;
}

function fmtPrice(v: number): string {
  const digits = v >= 1000 ? 0 : v >= 100 ? 1 : 2;
  return `$${v.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

function fmtPct(v: number | null): string {
  if (v == null) return '—';
  return `${v >= 0 ? '+' : ''}${v.toFixed(Math.abs(v) >= 10 ? 0 : 1)}%`;
}

const CATEGORY_LABEL: Record<string, string> = { energy: 'Energy', metals: 'Metals', agriculture: 'Agriculture' };

export default function CommodityScoreboard({ isDarkMode, commodities }: Props) {
  const [sort, setSort] = useState<SortKey>('default');

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    Object.values(commodities).forEach(h => {
      if (!h.latest) return;
      const latest = h.latest.value;
      const latestYear = parseInt(h.latest.date.slice(0, 4));
      const complete = h.annual.filter(p => p.year < latestYear);
      const last5 = complete.slice(-5);
      const avg5y = last5.length ? last5.reduce((s, p) => s + p.value, 0) / last5.length : null;
      const last10 = h.annual.filter(p => p.year >= latestYear - 9);
      const window = last10.length ? last10 : h.annual;
      let lo = window[0], hi = window[0];
      window.forEach(p => {
        if (p.value < lo.value) lo = p;
        if (p.value > hi.value) hi = p;
      });
      const min = Math.min(lo.value, latest);
      const max = Math.max(hi.value, latest);
      out.push({
        h,
        latest,
        ytd: h.ytdStart && h.ytdStart.value ? pct(latest, h.ytdStart.value) : null,
        vs5y: avg5y ? pct(latest, avg5y) : null,
        avg5y,
        lo: min,
        hi: max,
        pos: max > min ? (latest - min) / (max - min) : 0.5,
        loYear: lo.year,
        hiYear: hi.year,
      });
    });
    return out;
  }, [commodities]);

  const sorted = useMemo(() => {
    if (sort === 'default') return rows;
    const key = (r: Row) => (sort === 'ytd' ? r.ytd : sort === 'vs5y' ? r.vs5y : r.pos) ?? -Infinity;
    return [...rows].sort((a, b) => key(b) - key(a));
  }, [rows, sort]);

  if (rows.length === 0) return null;

  const up = rows.filter(r => (r.ytd ?? 0) > 0).length;
  const best = [...rows].filter(r => r.ytd != null).sort((a, b) => (b.ytd ?? 0) - (a.ytd ?? 0))[0];
  const worst = [...rows].filter(r => r.ytd != null).sort((a, b) => (a.ytd ?? 0) - (b.ytd ?? 0))[0];
  const nearHigh = rows.filter(r => r.pos >= 0.8).map(r => r.h.meta.label.replace(/ \(.*\)$/, ''));

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = 'text-gray-500';
  const divider = isDarkMode ? 'divide-gray-700' : 'divide-gray-100';
  const deltaClass = (v: number | null) => (v == null ? textMuted : v >= 0 ? 'text-emerald-500' : 'text-rose-500');

  return (
    <div id={slugify(TITLE)} className={`rounded-lg border mt-4 ${cardBg}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap px-4 pt-4">
        <div>
          <h4 className={`text-base font-semibold ${textPrimary}`}>{TITLE}</h4>
          <p className={`text-xs mt-0.5 ${textSec}`}>
            {up} of {rows.length} commodities are up this year
            {best && worst && best !== worst && (
              <> · best <span className="text-emerald-500 font-medium">{best.h.meta.label.replace(/ \(.*\)$/, '')} {fmtPct(best.ytd)}</span>,
              worst <span className="text-rose-500 font-medium">{worst.h.meta.label.replace(/ \(.*\)$/, '')} {fmtPct(worst.ytd)}</span></>
            )}
            {nearHigh.length > 0 && <> · near 10-year highs: {nearHigh.join(', ')}</>}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className={`text-[11px] ${textMuted}`} htmlFor="scoreboard-sort">Sort</label>
          <select
            id="scoreboard-sort"
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className={`text-xs rounded-md border px-2 py-1 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700'}`}
          >
            <option value="default">By category</option>
            <option value="ytd">Year-to-date change</option>
            <option value="vs5y">vs 5-year average</option>
            <option value="range">Position in 10-yr range</option>
          </select>
          <SocialShareMenu title={TITLE} subject="dataset" isDarkMode={isDarkMode} />
        </div>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-xs min-w-[640px]">
          <thead className={`text-[10px] uppercase tracking-wider ${textMuted}`}>
            <tr>
              <th className="text-left font-medium px-4 py-2">Commodity</th>
              <th className="text-right font-medium px-2 py-2">Latest</th>
              <th className="text-right font-medium px-2 py-2">YTD</th>
              <th className="text-right font-medium px-2 py-2">vs 5-yr avg</th>
              <th className="text-left font-medium px-4 py-2 w-[30%]">10-year range (annual averages)</th>
              <th className="text-right font-medium px-4 py-2">Last 30 obs.</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${divider}`}>
            {sorted.map((r, i) => {
              const showCat = sort === 'default' && (i === 0 || sorted[i - 1].h.meta.category !== r.h.meta.category);
              return (
                <tr key={r.h.meta.id} className={showCat && i > 0 ? (isDarkMode ? 'border-t-2 border-gray-700' : 'border-t-2 border-gray-200') : ''}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.h.meta.color === '#0f172a' && isDarkMode ? '#94a3b8' : r.h.meta.color }} />
                      <div>
                        <div className={`font-medium ${textPrimary}`}>{r.h.meta.label}</div>
                        <div className={`text-[10px] ${textMuted}`}>
                          {showCat ? `${CATEGORY_LABEL[r.h.meta.category]} · ` : ''}{r.h.meta.unit}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-2 py-2 text-right tabular-nums font-semibold ${textPrimary}`}>
                    {fmtPrice(r.latest)}
                    <div className={`text-[10px] font-normal ${textMuted}`}>{r.h.latest?.date}</div>
                  </td>
                  <td className={`px-2 py-2 text-right tabular-nums font-medium ${deltaClass(r.ytd)}`}>{fmtPct(r.ytd)}</td>
                  <td className={`px-2 py-2 text-right tabular-nums ${deltaClass(r.vs5y)}`}>
                    {fmtPct(r.vs5y)}
                    {r.avg5y != null && <div className={`text-[10px] ${textMuted}`}>avg {fmtPrice(r.avg5y)}</div>}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`tabular-nums text-[10px] w-12 text-right ${textMuted}`} title={`10-yr low (${r.loYear})`}>{fmtPrice(r.lo)}</span>
                      <span className={`relative flex-1 h-1.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <span
                          className="absolute top-1/2 w-2.5 h-2.5 -mt-[5px] -ml-[5px] rounded-full border-2"
                          style={{
                            left: `${r.pos * 100}%`,
                            backgroundColor: r.pos >= 0.8 ? '#10b981' : r.pos <= 0.2 ? '#ef4444' : '#f59e0b',
                            borderColor: isDarkMode ? '#1f2937' : '#fff',
                          }}
                          title={`Latest sits ${Math.round(r.pos * 100)}% of the way from the 10-year low to the high`}
                        />
                      </span>
                      <span className={`tabular-nums text-[10px] w-12 ${textMuted}`} title={`10-yr high (${r.hiYear})`}>{fmtPrice(r.hi)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end">
                      <Sparkline points={r.h.sparkline} isDarkMode={isDarkMode} width={84} height={22} ariaLabel={`${r.h.meta.label} recent prices`} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className={`text-[11px] px-4 py-3 ${textMuted}`}>
        Daily series (WTI, Brent, Henry Hub) update each trading day; IMF metals, coal, EU gas and wheat are monthly averages,
        so their &ldquo;latest&rdquo; is last month. The range dot compares the latest print with the lowest and highest annual
        average of the last ten years — green near the top, red near the bottom.
      </p>
    </div>
  );
}
