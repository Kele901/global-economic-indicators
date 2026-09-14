'use client';

// Live Chapter 1 for /energy-ledger. Diverging bars of net energy imports
// (EG.IMP.CONS.ZS) across the country roster: positive means the country
// buys more energy than it produces, negative means it is a net exporter.
// Bar colour carries the renewable share of final energy consumption
// (EG.FEC.RNEW.ZS), so import dependence and decarbonisation read together.

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import type { CountryData } from '../services/worldbank';
import { latestEntry } from '../utils/countryData';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES } from '../utils/countryMappings';
import { useChartTheme } from '../utils/chartTheme';
import ChartCard from './charts/ChartCard';
import ChartTooltip from './charts/ChartTooltip';
import ChartA11yCaption from './ChartA11yCaption';

interface Props {
  isDarkMode: boolean;
  netEnergyImports: CountryData[] | undefined;
  renewableEnergy: CountryData[] | undefined;
}

const RENEWABLE_BANDS = [
  { min: 50, color: '#059669', label: '50%+' },
  { min: 25, color: '#10b981', label: '25-50%' },
  { min: 10, color: '#f59e0b', label: '10-25%' },
  { min: 0,  color: '#ef4444', label: 'under 10%' },
];
const NO_RENEWABLE_COLOR = '#94a3b8';

function renewableColor(share: number | null): string {
  if (share === null) return NO_RENEWABLE_COLOR;
  return RENEWABLE_BANDS.find(b => share >= b.min)?.color ?? NO_RENEWABLE_COLOR;
}

// Net imports can legitimately be negative, which the shared latestEntry
// helper treats as missing. Walk the rows directly and accept any finite
// non-zero number instead.
function latestNetImports(
  series: CountryData[] | undefined,
  key: string,
): { year: number; value: number } | null {
  if (!Array.isArray(series) || series.length === 0) return null;
  for (let i = series.length - 1; i >= 0; i--) {
    const row = series[i];
    if (!row) continue;
    const raw = row[key];
    if (raw === undefined || raw === null || raw === '') continue;
    const v = Number(raw);
    if (Number.isFinite(v) && v !== 0) return { year: Number(row.year), value: v };
  }
  return null;
}

export default function EnergyDependenceChart({ isDarkMode, netEnergyImports, renewableEnergy }: Props) {
  const theme = useChartTheme(isDarkMode);

  const rows = useMemo(() => (
    COUNTRY_KEYS
      .map(key => {
        const imports = latestNetImports(netEnergyImports, key);
        if (!imports) return null;
        const renew = latestEntry(renewableEnergy, key);
        return {
          key,
          name: COUNTRY_DISPLAY_NAMES[key] ?? key,
          netImports: imports.value,
          year: imports.year,
          renewable: renew ? renew.value : null,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.netImports - a.netImports)
  ), [netEnergyImports, renewableEnergy]);

  if (rows.length === 0) {
    return (
      <ChartCard isDarkMode={isDarkMode} height="h-auto">
        <p className={`text-sm ${theme.subtitleCls}`}>
          Live net-energy-import data has not arrived yet. The chapters below run on curated
          snapshots and are unaffected.
        </p>
      </ChartCard>
    );
  }

  const exporters = rows.filter(r => r.netImports < 0);

  return (
    <ChartCard
      isDarkMode={isDarkMode}
      height={Math.max(420, rows.length * 22)}
      caption={
        <ChartA11yCaption
          title="Net energy imports as a share of energy use, latest year"
          unit="%"
          rows={rows.map(r => ({ label: r.name, value: r.netImports }))}
          extra={`${exporters.length} of ${rows.length} countries shown are net energy exporters.`}
        />
      }
      footnote={
        <>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
            <span className="font-medium">Bar colour = renewable share of final energy:</span>
            {RENEWABLE_BANDS.map(b => (
              <span key={b.label} className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: b.color }} />{b.label}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: NO_RENEWABLE_COLOR }} />no figure
            </span>
          </div>
          Live World Bank EG.IMP.CONS.ZS and EG.FEC.RNEW.ZS, latest available year per country.
          Import dependence is a security exposure, not an inefficiency: Japan and Singapore sit
          near the top because they have almost no domestic hydrocarbons, while the net exporters
          at the bottom are the reserves holders ranked in Chapter 7. Renewables reduce the exposure
          only where they displace imported fuel rather than domestic production.
        </>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 10, right: 30, bottom: 24, left: 10 }}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            stroke={theme.axis}
            tick={{ fontSize: 11 }}
            label={{ value: 'Net energy imports, % of energy use (negative = net exporter)', position: 'bottom', offset: 6, fill: theme.axis, fontSize: 11 }}
          />
          <YAxis type="category" dataKey="name" stroke={theme.axis} width={110} tick={{ fontSize: 11 }} interval={0} />
          <ReferenceLine x={0} stroke={theme.axis} />
          <Tooltip
            cursor={{ fill: theme.cursor }}
            content={
              <ChartTooltip
                theme={theme}
                format={v => `${v > 0 ? '+' : ''}${v.toFixed(1)}% of energy use`}
                footer={p => {
                  const year = p?.year as number | undefined;
                  const renew = p?.renewable as number | null | undefined;
                  const value = p?.netImports as number | undefined;
                  const parts: string[] = [];
                  if (value !== undefined) parts.push(value >= 0 ? 'net importer' : 'net exporter');
                  if (year) parts.push(`${year}`);
                  if (renew !== null && renew !== undefined) parts.push(`${renew.toFixed(1)}% renewable`);
                  return parts.length > 0 ? parts.join(' · ') : null;
                }}
              />
            }
          />
          <Bar dataKey="netImports" name="Net energy imports" isAnimationActive={false}>
            {rows.map(r => (
              <Cell key={r.key} fill={renewableColor(r.renewable)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
