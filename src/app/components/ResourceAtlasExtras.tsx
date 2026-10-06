'use client';

import { useMemo } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  OIL_RESERVES_HISTORY,
  CRITICAL_MINERALS,
  FISCAL_BREAKEVEN_2025,
  SOVEREIGN_WEALTH_FUNDS,
} from '../data/resourceStaticData';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

interface ThemeProps {
  isDarkMode: boolean;
}

function useTheme(isDarkMode: boolean) {
  return {
    cardBg: isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    insetBg: isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200',
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
    textSec: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    textMuted: 'text-gray-500',
    grid: isDarkMode ? '#374151' : '#e5e7eb',
    axis: isDarkMode ? '#9ca3af' : '#6b7280',
    tooltip: isDarkMode
      ? { backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12, color: '#f9fafb' }
      : { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, color: '#111827' },
  };
}

function yearsOfSupply(reservesBnBbl: number, productionMbd: number): number {
  return reservesBnBbl / ((productionMbd * 365) / 1000);
}

export function OilReserveGrowthChart({ isDarkMode }: ThemeProps) {
  const t = useTheme(isDarkMode);
  const data = useMemo(
    () =>
      OIL_RESERVES_HISTORY.map(p => ({
        ...p,
        rp: yearsOfSupply(p.reserves, p.production),
      })),
    [],
  );
  const first = data[0];
  const last = data[data.length - 1];
  const extracted = data.slice(1).reduce((sum, p, i) => {
    const prev = data[i];
    const avgMbd = (prev.production + p.production) / 2;
    return sum + (avgMbd * 365 * (p.year - prev.year)) / 1000;
  }, 0);

  return (
    <div id={slugify('Reserves Grew While We Extracted')} className={`rounded-lg border p-5 ${t.cardBg}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
        <div>
          <h4 className={`text-base font-semibold ${t.textPrimary}`}>Reserves Grew While We Extracted</h4>
          <p className={`text-xs mt-0.5 ${t.textMuted}`}>
            Booked proven oil reserves vs. annual output, 1980–2020 (BP Statistical Review 2021)
          </p>
        </div>
        <SocialShareMenu title="Reserves Grew While We Extracted" isDarkMode={isDarkMode} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { k: 'Reserves 1980→2020', v: `${first.reserves} → ${last.reserves}`, s: 'bn bbl' },
          { k: 'Approx. extracted', v: `~${Math.round(extracted).toLocaleString()}`, s: 'bn bbl over the period' },
          { k: 'Years of supply', v: `${first.rp.toFixed(0)} → ${last.rp.toFixed(0)}`, s: 'R/P ratio, years' },
        ].map(s => (
          <div key={s.k} className={`rounded-md border px-3 py-2 ${t.insetBg}`}>
            <div className={`text-[10px] uppercase tracking-wider ${t.textMuted}`}>{s.k}</div>
            <div className={`text-sm sm:text-base font-semibold tabular-nums ${t.textPrimary}`}>{s.v}</div>
            <div className={`text-[10px] ${t.textMuted}`}>{s.s}</div>
          </div>
        ))}
      </div>

      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
            <XAxis dataKey="year" stroke={t.axis} tick={{ fontSize: 11 }} />
            <YAxis
              yAxisId="res"
              stroke={t.axis}
              tick={{ fontSize: 11 }}
              tickFormatter={v => `${v}`}
              label={{ value: 'bn bbl', angle: -90, position: 'insideLeft', fill: t.axis, fontSize: 10 }}
            />
            <YAxis
              yAxisId="prod"
              orientation="right"
              stroke={t.axis}
              tick={{ fontSize: 11 }}
              tickFormatter={v => `${v}`}
              label={{ value: 'mb/d', angle: 90, position: 'insideRight', fill: t.axis, fontSize: 10 }}
            />
            <Tooltip
              contentStyle={t.tooltip}
              formatter={(v: number, name: string) => {
                if (name === 'reserves') return [`${v.toLocaleString()} bn bbl`, 'Proven reserves'];
                if (name === 'production') return [`${v.toFixed(1)} mb/d`, 'Production'];
                return [`${v.toFixed(0)} yr`, 'R/P'];
              }}
            />
            <Area
              yAxisId="res"
              type="monotone"
              dataKey="reserves"
              stroke="#d97706"
              fill="#d97706"
              fillOpacity={0.15}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Line
              yAxisId="prod"
              type="monotone"
              dataKey="production"
              stroke={isDarkMode ? '#94a3b8' : '#475569'}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-[11px] mt-3 leading-relaxed ${t.textMuted}`}>
        We produced on the order of a trillion barrels between 1980 and 2020, yet booked reserves more than doubled.
        The R/P ratio — the &ldquo;years left&rdquo; on the gauges above — lengthened from ~{first.rp.toFixed(0)} to
        ~{last.rp.toFixed(0)} years. Proven reserves are an economic inventory: they grow when prices or technology
        make previously uneconomic oil worth booking (Venezuelan extra-heavy, Canadian oil sands, US shale).
      </p>
    </div>
  );
}

export function CriticalMineralsPanel({ isDarkMode }: ThemeProps) {
  const t = useTheme(isDarkMode);
  const maxShare = Math.max(...CRITICAL_MINERALS.map(m => Math.max(m.topProducerShare, m.chinaRefiningShare)));

  return (
    <div id={slugify('Transition Metals Are More Concentrated Than Oil')} className={`rounded-lg border p-5 ${t.cardBg}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
        <div>
          <h4 className={`text-base font-semibold ${t.textPrimary}`}>Transition Metals Are More Concentrated Than Oil</h4>
          <p className={`text-xs mt-0.5 ${t.textMuted}`}>
            Mine output and China&apos;s share of refining — USGS MCS 2025 / IEA Critical Minerals Outlook
          </p>
        </div>
        <SocialShareMenu title="Transition Metals Are More Concentrated Than Oil" subject="dataset" isDarkMode={isDarkMode} />
      </div>

      <div className={`flex flex-wrap gap-3 text-[11px] mb-3 ${t.textSec}`}>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />Top miner&apos;s share
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />China refining share
        </span>
      </div>

      <ul className="space-y-3">
        {CRITICAL_MINERALS.map(m => (
          <li key={m.mineral}>
            <div className="flex items-baseline justify-between gap-2 text-xs mb-1">
              <span className={`font-medium ${t.textPrimary}`}>
                {m.mineral}
                <span className={`ml-2 font-normal ${t.textMuted}`}>{m.topProducer} {m.topProducerShare}%</span>
              </span>
              <span className={t.textMuted}>{m.use}</span>
            </div>
            <div className="space-y-1">
              <div className={`h-2 rounded-sm overflow-hidden ${isDarkMode ? 'bg-gray-700/60' : 'bg-gray-100'}`}>
                <div className="h-full rounded-sm bg-amber-500" style={{ width: `${(m.topProducerShare / maxShare) * 100}%` }} />
              </div>
              <div className={`h-2 rounded-sm overflow-hidden ${isDarkMode ? 'bg-gray-700/60' : 'bg-gray-100'}`}>
                <div className="h-full rounded-sm bg-rose-500" style={{ width: `${(m.chinaRefiningShare / maxShare) * 100}%` }} />
              </div>
            </div>
            <div className={`flex justify-between text-[10px] mt-0.5 ${t.textMuted}`}>
              <span>Top 3 miners {m.top3Share}%</span>
              <span>China refines {m.chinaRefiningShare}%</span>
            </div>
          </li>
        ))}
      </ul>
      <p className={`text-[11px] mt-3 leading-relaxed ${t.textMuted}`}>
        OPEC&apos;s share of oil production is about 35%. The top miner of graphite, cobalt or rare earths holds two-thirds
        or more — and refining is tighter still. The energy transition swaps a fuel-concentration problem for a
        processing-concentration problem, with China as the bottleneck rather than the Gulf.
      </p>
    </div>
  );
}

export function FiscalBreakevenPanel({ isDarkMode, brentPrice }: ThemeProps & { brentPrice?: number | null }) {
  const t = useTheme(isDarkMode);
  const data = useMemo(
    () => [...FISCAL_BREAKEVEN_2025].sort((a, b) => b.breakeven - a.breakeven),
    [],
  );
  const brent = brentPrice != null && brentPrice > 0 ? brentPrice : null;

  return (
    <div id={slugify('The Oil Price Each Budget Needs')} className={`rounded-lg border p-5 ${t.cardBg}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
        <div>
          <h4 className={`text-base font-semibold ${t.textPrimary}`}>The Oil Price Each Budget Needs</h4>
          <p className={`text-xs mt-0.5 ${t.textMuted}`}>
            IMF 2025 fiscal break-even: the Brent price that balances the government budget
          </p>
        </div>
        <SocialShareMenu title="The Oil Price Each Budget Needs" subject="dataset" isDarkMode={isDarkMode} />
      </div>

      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} horizontal={false} />
            <XAxis
              type="number"
              stroke={t.axis}
              tick={{ fontSize: 11 }}
              tickFormatter={v => `$${v}`}
              domain={[0, Math.max(140, ...data.map(d => d.breakeven))]}
            />
            <YAxis type="category" dataKey="country" stroke={t.axis} tick={{ fontSize: 11 }} width={88} />
            <Tooltip
              contentStyle={t.tooltip}
              formatter={(v: number) => [`$${v}/bbl`, 'Break-even']}
            />
            {brent != null && (
              <ReferenceLine
                x={brent}
                stroke="#d97706"
                strokeDasharray="4 4"
                label={{ value: `Brent $${brent.toFixed(0)}`, fill: t.axis, fontSize: 10, position: 'top' }}
              />
            )}
            <Bar dataKey="breakeven" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {data.map(d => (
                <Cell
                  key={d.country}
                  fill={brent != null && d.breakeven > brent ? '#ef4444' : '#10b981'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-[11px] mt-3 leading-relaxed ${t.textMuted}`}>
        {brent != null
          ? `At today's Brent of about $${brent.toFixed(0)}/bbl, bars in red are running a fiscal deficit on oil revenue alone.`
          : 'Bars in red would be in deficit at a typical mid-cycle Brent; green would still surplus.'}
        {' '}Saudi Arabia&apos;s break-even has climbed with Vision 2030 spending; Qatar and the UAE can balance the books
        well below $60 because gas and a smaller public-wage bill leave more of each barrel as surplus.
      </p>
    </div>
  );
}

export function SovereignWealthPanel({ isDarkMode }: ThemeProps) {
  const t = useTheme(isDarkMode);
  const rows = useMemo(
    () =>
      SOVEREIGN_WEALTH_FUNDS
        .map(f => ({ ...f, perHead: (f.assetsBn * 1000) / f.populationM }))
        .sort((a, b) => b.perHead - a.perHead),
    [],
  );
  const maxHead = rows[0]?.perHead ?? 1;

  return (
    <div id={slugify('Who Saved the Windfall')} className={`rounded-lg border p-5 ${t.cardBg}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
        <div>
          <h4 className={`text-base font-semibold ${t.textPrimary}`}>Who Saved the Windfall</h4>
          <p className={`text-xs mt-0.5 ${t.textMuted}`}>
            Commodity-funded sovereign wealth funds, assets per resident (2025 estimates)
          </p>
        </div>
        <SocialShareMenu title="Who Saved the Windfall" subject="dataset" isDarkMode={isDarkMode} />
      </div>

      <ul className="space-y-1.5">
        {rows.map(f => (
          <li key={f.country} className="grid grid-cols-[6.5rem_1fr_4.8rem] sm:grid-cols-[8rem_1fr_6rem] items-center gap-2 text-xs">
            <span className={`truncate ${t.textPrimary}`}>
              {f.country}
              <span className={`block text-[10px] font-normal truncate ${t.textMuted}`}>{f.source}</span>
            </span>
            <span className={`h-3 rounded-sm overflow-hidden ${isDarkMode ? 'bg-gray-700/60' : 'bg-gray-100'}`}>
              <span
                className="block h-full rounded-sm bg-amber-500"
                style={{ width: `${(f.perHead / maxHead) * 100}%` }}
              />
            </span>
            <span className={`text-right tabular-nums ${t.textSec}`}>
              {f.perHead >= 1000
                ? `$${(f.perHead / 1000).toFixed(f.perHead >= 10000 ? 0 : 1)}k`
                : `$${Math.round(f.perHead).toLocaleString()}`}
              <span className={`block text-[10px] ${t.textMuted}`}>${f.assetsBn.toLocaleString()}bn</span>
            </span>
          </li>
        ))}
      </ul>
      <p className={`text-[11px] mt-3 leading-relaxed ${t.textMuted}`}>
        Norway turned the same North Sea oil that the UK spent into roughly $320k per resident. Libya&apos;s fund is large
        on paper and frozen in practice. Chile&apos;s copper funds are small by Gulf standards but they are the reason
        a copper-price crash does not immediately blow the budget — the opposite of a classic resource curse.
      </p>
    </div>
  );
}
