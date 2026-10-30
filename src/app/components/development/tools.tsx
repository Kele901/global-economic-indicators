'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { COUNTRY_COLORS, COUNTRY_KEYS, COUNTRY_KEY_TO_SLUG, type CountryKey } from '../../utils/countryMappings';
import {
  HDR,
  SDG_TARGETS,
  getIncomeGroup,
  getPeers,
  latestObs,
  median,
  sdgStatus,
  seriesFor,
  yearsBehind,
} from '../../services/developmentCurated';
import type { DevAlias, DevData } from '../../development/useDevelopmentData';
import { INDEX_DIMENSIONS, dimensionScores } from './DevelopmentIndexBuilder';
import { STATUS_STYLE } from './ChapterSustainability';
import { countryName, fmt, theme } from './ui';

export interface MetricDef {
  alias: DevAlias;
  label: string;
  higherIsBetter: boolean;
  format: (v: number) => string;
}

export const COMPARE_METRICS: MetricDef[] = [
  { alias: 'lifeExpectancy', label: 'Life expectancy', higherIsBetter: true, format: (v) => `${v.toFixed(1)} yrs` },
  { alias: 'under5Mortality', label: 'Under-5 mortality (per 1,000)', higherIsBetter: false, format: (v) => v.toFixed(1) },
  { alias: 'gdpPcConst', label: 'GDP per person (2015 US$)', higherIsBetter: true, format: fmt.usd },
  { alias: 'poverty300', label: 'Below $3.00 a day', higherIsBetter: false, format: (v) => `${v.toFixed(1)}%` },
  { alias: 'tertiaryEnrollment', label: 'Tertiary enrolment', higherIsBetter: true, format: (v) => `${v.toFixed(0)}%` },
  { alias: 'electricityAccess', label: 'Electricity access', higherIsBetter: true, format: (v) => `${v.toFixed(1)}%` },
  { alias: 'basicSanitation', label: 'Basic sanitation', higherIsBetter: true, format: (v) => `${v.toFixed(1)}%` },
  { alias: 'internetUsers', label: 'Internet users', higherIsBetter: true, format: (v) => `${v.toFixed(0)}%` },
  { alias: 'femaleLaborForce', label: 'Female labour force participation', higherIsBetter: true, format: (v) => `${v.toFixed(0)}%` },
];

export const TOOLS_ALIASES: DevAlias[] = [...new Set([...COMPARE_METRICS.map((m) => m.alias), ...SDG_TARGETS.map((s) => s.series as DevAlias)])];

export function PeersPanel({ isDarkMode, data, country }: { isDarkMode: boolean; data: DevData; country: CountryKey }) {
  const t = theme(isDarkMode);
  const peers = getPeers(country);
  const rows = COMPARE_METRICS.map((m) => {
    const own = latestObs(data[m.alias], country);
    const med = median(peers.map((p) => latestObs(data[m.alias], p)?.value));
    const better = own && med != null ? (m.higherIsBetter ? own.value >= med : own.value <= med) : null;
    return { m, own, med, better };
  });
  const hdiMed = median(peers.map((p) => HDR[p]?.hdi));
  return (
    <div>
      <p className={`text-xs mb-3 ${t.textSec}`}>
        Peers: {getIncomeGroup(country)} economies, same region first:{' '}
        {peers.map((p, i) => (
          <span key={p}>
            <Link href={`/development/${COUNTRY_KEY_TO_SLUG[p]}`} className="underline underline-offset-2">
              {countryName(p)}
            </Link>
            {i < peers.length - 1 ? ', ' : ''}
          </span>
        ))}
        .
      </p>
      <table className={`w-full text-xs ${t.text}`}>
        <thead className={t.textSec}>
          <tr>
            <th className="text-left px-2 py-1 font-medium">Indicator</th>
            <th className="text-right px-2 py-1 font-medium">{countryName(country)}</th>
            <th className="text-right px-2 py-1 font-medium">Peer median</th>
          </tr>
        </thead>
        <tbody>
          <tr className={`border-t ${t.border}`}>
            <td className="px-2 py-1">HDI (UNDP)</td>
            <td className={`px-2 py-1 text-right tabular-nums font-semibold ${HDR[country]?.hdi != null && hdiMed != null ? (HDR[country]!.hdi! >= hdiMed ? 'text-emerald-500' : 'text-rose-500') : ''}`}>
              {fmt.idx(HDR[country]?.hdi)}
            </td>
            <td className="px-2 py-1 text-right tabular-nums">{fmt.idx(hdiMed)}</td>
          </tr>
          {rows.map(({ m, own, med, better }) => (
            <tr key={m.alias} className={`border-t ${t.border}`}>
              <td className="px-2 py-1">{m.label}</td>
              <td className={`px-2 py-1 text-right tabular-nums font-semibold ${better == null ? '' : better ? 'text-emerald-500' : 'text-rose-500'}`}>
                {own ? m.format(own.value) : '\u2014'}
                {own && <span className={`ml-1 text-[10px] font-normal ${t.textMuted}`}>{`'${String(own.year).slice(2)}`}</span>}
              </td>
              <td className="px-2 py-1 text-right tabular-nums">{med != null ? m.format(med) : '\u2014'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// The roster country with the best latest value acts as the frontier.
export function leaderFor(data: DevData, m: MetricDef, exclude?: CountryKey): CountryKey | null {
  let best: CountryKey | null = null;
  let bestV = 0;
  for (const k of COUNTRY_KEYS) {
    if (k === exclude) continue;
    const o = latestObs(data[m.alias], k);
    if (!o) continue;
    if (best == null || (m.higherIsBetter ? o.value > bestV : o.value < bestV)) {
      best = k;
      bestV = o.value;
    }
  }
  return best;
}

const BEHIND_METRICS = COMPARE_METRICS.filter((m) => m.alias !== 'poverty300' && m.alias !== 'femaleLaborForce');

export function YearsBehindTable({ isDarkMode, data, country }: { isDarkMode: boolean; data: DevData; country: CountryKey }) {
  const t = theme(isDarkMode);
  const [benchmark, setBenchmark] = useState<'leader' | CountryKey>('leader');
  const rows = BEHIND_METRICS.map((m) => {
    const leader = benchmark === 'leader' ? leaderFor(data, m, country) : benchmark;
    const res = leader ? yearsBehind(seriesFor(data[m.alias], country), seriesFor(data[m.alias], leader), m.higherIsBetter) : null;
    return { m, leader, res };
  });
  return (
    <div>
      <label className={`inline-flex items-center gap-2 text-xs mb-3 ${t.textSec}`}>
        Compare with
        <select value={benchmark} onChange={(e) => setBenchmark(e.target.value as 'leader' | CountryKey)} className={`text-xs rounded-md border px-2 py-1 ${t.input}`}>
          <option value="leader">The roster leader on each indicator</option>
          {[...COUNTRY_KEYS]
            .filter((k) => k !== country)
            .sort((a, b) => countryName(a).localeCompare(countryName(b)))
            .map((k) => (
              <option key={k} value={k}>
                {countryName(k)}
              </option>
            ))}
        </select>
      </label>
      <table className={`w-full text-xs ${t.text}`}>
        <thead className={t.textSec}>
          <tr>
            <th className="text-left px-2 py-1 font-medium">Indicator</th>
            <th className="text-right px-2 py-1 font-medium">{countryName(country)} today</th>
            <th className="text-left px-2 py-1 font-medium">Benchmark reached it</th>
            <th className="text-right px-2 py-1 font-medium">Years behind</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ m, leader, res }) => (
            <tr key={m.alias} className={`border-t ${t.border}`}>
              <td className="px-2 py-1">{m.label}</td>
              <td className="px-2 py-1 text-right tabular-nums">{res ? m.format(res.countryValue) : '\u2014'}</td>
              <td className="px-2 py-1">
                {!res || !leader ? (
                  '\u2014'
                ) : res.ahead ? (
                  <span className="text-emerald-500">Ahead of {countryName(leader)}</span>
                ) : (
                  <>
                    {countryName(leader)} in {res.beforeData ? `${res.leaderYear} or earlier` : res.leaderYear}
                  </>
                )}
              </td>
              <td className={`px-2 py-1 text-right tabular-nums font-semibold ${res && !res.ahead ? 'text-amber-500' : ''}`}>
                {!res || res.ahead ? '\u2014' : `${res.beforeData ? '\u2265' : ''}${res.gap}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={`text-[11px] mt-2 ${t.textMuted}`}>
        Years behind = the latest year for this country minus the first year the benchmark reached the same level. A {'\u2265'} sign means the benchmark was already there when its data series begins.
      </p>
    </div>
  );
}

export function ProjectionsTable({ isDarkMode, data, country }: { isDarkMode: boolean; data: DevData; country: CountryKey }) {
  const t = theme(isDarkMode);
  return (
    <table className={`w-full text-xs ${t.text}`}>
      <thead className={t.textSec}>
        <tr>
          <th className="text-left px-2 py-1 font-medium">SDG target</th>
          <th className="text-right px-2 py-1 font-medium">Latest</th>
          <th className="text-right px-2 py-1 font-medium">Trend to 2030</th>
          <th className="text-right px-2 py-1 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {SDG_TARGETS.map((s) => {
          const r = sdgStatus(seriesFor(data[s.series as DevAlias], country), s);
          return (
            <tr key={s.id} className={`border-t ${t.border}`}>
              <td className="px-2 py-1">
                <span className={t.textMuted}>{s.id}</span> {s.label}
              </td>
              <td className="px-2 py-1 text-right tabular-nums">
                {r.latest ? `${r.latest.value.toFixed(1)}${s.unit}` : '\u2014'}
                {r.latest && <span className={`ml-1 text-[10px] ${t.textMuted}`}>{`'${String(r.latest.year).slice(2)}`}</span>}
              </td>
              <td className="px-2 py-1 text-right tabular-nums">{r.projected != null && r.status !== 'achieved' ? `${r.projected.toFixed(1)}${s.unit}` : '\u2014'}</td>
              <td className="px-2 py-1 text-right">
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${STATUS_STYLE[r.status].cls}`}>{STATUS_STYLE[r.status].label}</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function RadarCompare({ isDarkMode, data, keys }: { isDarkMode: boolean; data: DevData; keys: CountryKey[] }) {
  const t = theme(isDarkMode);
  const rows = useMemo(() => {
    const scores = Object.fromEntries(keys.map((k) => [k, dimensionScores(k, data)]));
    return INDEX_DIMENSIONS.map((d) => {
      const row: Record<string, number | string> = { dimension: d.label };
      for (const k of keys) row[k] = Math.round(scores[k][d.id] ?? 0);
      return row;
    });
  }, [data, keys]);
  return (
    <div style={{ height: 420 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={rows} outerRadius="72%">
          <PolarGrid stroke={t.grid} />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: t.axis }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: t.axis }} angle={90} />
          <Tooltip contentStyle={t.tooltip} formatter={(v: number, n: string) => [v, countryName(n)]} />
          <Legend formatter={(v: string) => countryName(v)} wrapperStyle={{ fontSize: 11 }} />
          {keys.map((k) => (
            <Radar key={k} dataKey={k} stroke={COUNTRY_COLORS[k]} fill={COUNTRY_COLORS[k]} fillOpacity={0.12} strokeWidth={2} isAnimationActive={false} />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
