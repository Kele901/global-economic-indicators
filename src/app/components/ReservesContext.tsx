'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { OIL_RESERVES_HISTORY, CRITICAL_MINERALS } from '../data/resourceStaticData';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

interface Props {
  isDarkMode: boolean;
}

const HORIZON_TITLE = 'The Receding Horizon';
const MINERALS_TITLE = 'Critical-Mineral Chokepoints';

export default function ReservesContext({ isDarkMode }: Props) {
  const data = OIL_RESERVES_HISTORY.map(p => ({
    ...p,
    rp: p.reserves / ((p.production * 365) / 1000),
  }));

  // Cumulative extraction between the first and last observation (trapezoid rule).
  let cumulative = 0;
  for (let i = 1; i < OIL_RESERVES_HISTORY.length; i++) {
    const a = OIL_RESERVES_HISTORY[i - 1];
    const b = OIL_RESERVES_HISTORY[i];
    cumulative += (((a.production + b.production) / 2) * 365 * (b.year - a.year)) / 1000;
  }
  const first = data[0];
  const last = data[data.length - 1];

  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const insetBg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = 'text-gray-500';
  const track = isDarkMode ? 'bg-gray-700/60' : 'bg-gray-100';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      <div id={slugify(HORIZON_TITLE)} className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
        <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
          <div>
            <h4 className={`text-base font-semibold ${textPrimary}`}>{HORIZON_TITLE}</h4>
            <p className={`text-xs mt-0.5 ${textSec}`}>
              Proven oil reserves (bars) and years of supply at that year&apos;s output (line)
            </p>
          </div>
          <SocialShareMenu title={HORIZON_TITLE} isDarkMode={isDarkMode} />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { k: 'Pumped since 1980', v: `~${Math.round(cumulative).toLocaleString()} bn`, s: 'barrels' },
            { k: 'Reserves added', v: `+${(last.reserves - first.reserves).toLocaleString()} bn`, s: `${first.year}→${last.year}` },
            { k: 'Years of supply', v: `${first.rp.toFixed(0)} → ${last.rp.toFixed(0)}`, s: `${first.year}→${last.year}` },
          ].map(t => (
            <div key={t.k} className={`rounded-md border px-3 py-2 ${insetBg}`}>
              <div className={`text-[10px] uppercase tracking-wider ${textMuted}`}>{t.k}</div>
              <div className={`text-base font-semibold tabular-nums ${textPrimary}`}>{t.v}</div>
              <div className={`text-[10px] ${textMuted}`}>{t.s}</div>
            </div>
          ))}
        </div>

        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 4, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} />
              <XAxis dataKey="year" stroke={axis} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="r" stroke={axis} tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}tn`} />
              <YAxis yAxisId="y" orientation="right" stroke={axis} tick={{ fontSize: 11 }} domain={[0, 70]} tickFormatter={(v: number) => `${v}y`} />
              <Tooltip
                contentStyle={isDarkMode
                  ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: 8, fontSize: 12 }
                  : { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: 8, fontSize: 12 }}
                formatter={(v: any, k: any) =>
                  k === 'reserves' ? [`${Number(v).toLocaleString()} bn bbl`, 'Proven reserves'] : [`${Number(v).toFixed(0)} years`, 'Reserves ÷ output']}
              />
              <Bar yAxisId="r" dataKey="reserves" fill={isDarkMode ? '#475569' : '#cbd5e1'} radius={[3, 3, 0, 0]} isAnimationActive={false} />
              <Line yAxisId="y" type="monotone" dataKey="rp" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className={`text-[11px] mt-2 leading-relaxed ${textMuted}`}>
          The world has extracted more oil since 1980 than its entire proven reserves in 1980 — yet reserves rose by over a
          trillion barrels. Reserves are an economic concept: higher prices and better technology (deepwater, oil sands, shale)
          turn known resources into &ldquo;proven&rdquo; ones, and OPEC members re-booked large volumes in the 1980s when quotas were
          tied to reserves. Source: BP Statistical Review 2021, the last edition to publish world reserves.
        </p>
      </div>

      <div id={slugify(MINERALS_TITLE)} className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
        <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
          <div>
            <h4 className={`text-base font-semibold ${textPrimary}`}>{MINERALS_TITLE}</h4>
            <p className={`text-xs mt-0.5 ${textSec}`}>
              Share of world mine output from the largest producer and the top three — and China&apos;s share of refining
            </p>
          </div>
          <SocialShareMenu title={MINERALS_TITLE} subject="dataset" isDarkMode={isDarkMode} />
        </div>

        <div className={`flex flex-wrap gap-3 text-[11px] mb-3 ${textSec}`}>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-600" />Largest producer</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-300" />Next two producers</span>
          <span className="flex items-center gap-1.5"><span className={`w-0.5 h-3 ${isDarkMode ? 'bg-rose-400' : 'bg-rose-600'}`} />China refining share</span>
        </div>

        <ul className="space-y-3">
          {CRITICAL_MINERALS.map(m => (
            <li key={m.mineral}>
              <div className="flex items-baseline justify-between gap-2 text-xs mb-1">
                <span className={`font-medium ${textPrimary}`}>
                  {m.mineral} <span className={`font-normal ${textMuted}`}>· {m.use}</span>
                </span>
                <span className={`tabular-nums shrink-0 ${textSec}`}>
                  {m.topProducer} {m.topProducerShare}%
                </span>
              </div>
              <div className={`relative h-3.5 rounded-sm overflow-hidden ${track}`}
                title={`${m.topProducer} ${m.topProducerShare}% · top 3 ${m.top3Share}% · China refines ${m.chinaRefiningShare}%`}>
                <div className="absolute inset-y-0 left-0 bg-amber-300" style={{ width: `${m.top3Share}%` }} />
                <div className="absolute inset-y-0 left-0 bg-amber-600" style={{ width: `${m.topProducerShare}%` }} />
                <div
                  className={`absolute -inset-y-0 w-0.5 ${isDarkMode ? 'bg-rose-400' : 'bg-rose-600'}`}
                  style={{ left: `${m.chinaRefiningShare}%` }}
                />
              </div>
              <div className={`flex justify-between text-[10px] mt-0.5 ${textMuted}`}>
                <span>Top 3 mine {m.top3Share}%</span>
                <span>China refines {m.chinaRefiningShare}%</span>
              </div>
            </li>
          ))}
        </ul>
        <p className={`text-[11px] mt-3 leading-relaxed ${textMuted}`}>
          Oil&apos;s top three producers supply about 40% of world crude. For battery and magnet minerals, one country
          often mines or processes most of the world&apos;s supply, which is why export controls — such as China&apos;s on
          graphite and rare-earth technology — move prices more than geology does. Mine output: USGS Mineral Commodity
          Summaries 2025; refining: IEA Global Critical Minerals Outlook 2024.
        </p>
      </div>
    </div>
  );
}
