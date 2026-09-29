'use client';

// Multi-country line chart of current-account balance as % of GDP.
// Positive = surplus (net exporter), negative = deficit (net importer).
// Uses BN.CAB.XOKA.GD.ZS from the World Bank.

import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import type { CountryData } from '../services/worldbank';
import { TRADE_COUNTRY_META } from '../services/tradeCurated';
import { useViewportSize } from '../hooks/useViewportSize';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

const TITLE = 'Current account balance';

interface Props {
  isDarkMode: boolean;
  currentAccount: CountryData[];
}

function shape(series: CountryData[], keys: string[], yearFrom = 2000) {
  if (!series || series.length === 0) return [];
  return series
    .filter(row => Number(row.year) >= yearFrom)
    .map(row => {
      const out: Record<string, number | undefined> = { year: Number(row.year) };
      keys.forEach(k => {
        const v = Number(row[k]);
        out[k] = !Number.isNaN(v) && v !== 0 ? v : undefined;
      });
      return out;
    });
}

export default function TradeBalanceChart({ isDarkMode, currentAccount }: Props) {
  const focus = useMemo(() => TRADE_COUNTRY_META.slice(0, 8), []);
  const wbKeys = focus.map(c => c.wbKey);
  const { isMobile } = useViewportSize();

  const data = useMemo(() => shape(currentAccount, wbKeys, 2000), [currentAccount, wbKeys]);

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: 6,
    color: isDarkMode ? '#f3f4f6' : '#111827',
    fontSize: 12,
  };

  return (
    <div id={slugify(TITLE)} className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
        <div className={`text-xs uppercase tracking-wider ${textMuted}`}>
          {TITLE}
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <SocialShareMenu title={TITLE} isDarkMode={isDarkMode} />
        </div>
      </div>
      <p className={`text-sm mb-4 ${textSec}`}>
        Net exports of goods, services, and primary/secondary income, as % of GDP. Above 0 = net exporter (Germany, China surplus); below 0 = net importer (US, UK deficit).
      </p>
      <div className={isMobile ? 'h-[320px]' : 'h-[420px]'}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={isMobile ? { top: 8, right: 8, bottom: 8, left: 0 } : { top: 10, right: 20, bottom: 20, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="year" stroke={axis} tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis stroke={axis} tickFormatter={v => `${v}%`} tick={{ fontSize: isMobile ? 10 : 12 }} width={isMobile ? 40 : 60} />
            <ReferenceLine y={0} stroke={isDarkMode ? '#9ca3af' : '#374151'} strokeDasharray="4 4" />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toFixed(1)}%`} />
            {!isMobile && <Legend wrapperStyle={{ fontSize: 11 }} />}
            {focus.map(meta => (
              <Line
                key={meta.iso3}
                type="monotone"
                dataKey={meta.wbKey}
                name={meta.name}
                stroke={meta.color}
                strokeWidth={isMobile ? 1.5 : 2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
