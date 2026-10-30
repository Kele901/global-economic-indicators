'use client';

import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COUNTRY_KEYS, type CountryKey } from '../../utils/countryMappings';
import { MPI, latestObs, seriesFor } from '../../services/developmentCurated';
import { useDevSeries, type DevAlias, type DevData } from '../../development/useDevelopmentData';
import { RankedBars, ScatterPlot, TrendLines } from './charts';
import { latestRows, rowsToCsv, type ChapterProps } from './data';
import { ChapterHeader, ChapterLoadingGuard, ChapterMeta, CountrySelect, Panel, Segmented, Stat, countryName, fmt, theme } from './ui';

const LINES: { alias: DevAlias; label: string; color: string }[] = [
  { alias: 'poverty300', label: '$3.00 a day', color: '#ef4444' },
  { alias: 'poverty420', label: '$4.20 a day', color: '#f59e0b' },
  { alias: 'poverty830', label: '$8.30 a day', color: '#3b82f6' },
];

const ALIASES: DevAlias[] = [
  'poverty300', 'poverty420', 'poverty830', 'povertyGap', 'prosperityGap', 'bottom40Growth', 'meanGrowth', 'population',
];

export function PovertyLinesChart({ isDarkMode, data, country, height = 300 }: { isDarkMode: boolean; data: DevData; country: CountryKey; height?: number }) {
  const t = theme(isDarkMode);
  const rows = useMemo(() => {
    const byYear = new Map<number, Record<string, number>>();
    for (const l of LINES) {
      for (const o of seriesFor(data[l.alias], country)) {
        const r = byYear.get(o.year) ?? { year: o.year };
        r[l.alias] = o.value;
        byYear.set(o.year, r);
      }
    }
    return [...byYear.values()].sort((a, b) => a.year - b.year);
  }, [data, country]);
  if (!rows.length) return <p className={`text-sm py-8 text-center ${t.textMuted}`}>No household survey for {countryName(country)} in the Poverty and Inequality Platform.</p>;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 10, right: 16, bottom: 4, left: 4 }}>
          <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
          <XAxis dataKey="year" type="number" domain={['dataMin', 'dataMax']} stroke={t.axis} tick={{ fontSize: 11 }} allowDecimals={false} />
          <YAxis stroke={t.axis} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} width={44} domain={[0, 'auto']} />
          <Tooltip contentStyle={t.tooltip} formatter={(v: number, n: string) => [`${v.toFixed(1)}%`, LINES.find((l) => l.alias === n)?.label ?? n]} />
          <Legend formatter={(v: string) => LINES.find((l) => l.alias === v)?.label ?? v} wrapperStyle={{ fontSize: 11 }} />
          {LINES.map((l) => (
            <Line key={l.alias} dataKey={l.alias} stroke={l.color} strokeWidth={2} dot={{ r: 3 }} connectNulls isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ChapterPoverty({ isDarkMode, selected }: ChapterProps) {
  const t = theme(isDarkMode);
  const { data, loading } = useDevSeries(ALIASES);
  const [country, setCountry] = useState<CountryKey>(selected.find((k) => k !== 'USA') ?? 'India');
  const [line, setLine] = useState<DevAlias>('poverty300');
  const [gapMetric, setGapMetric] = useState<'povertyGap' | 'prosperityGap'>('prosperityGap');

  const headcount = useMemo(() => {
    let covered = 0;
    const totals = LINES.map((l) => {
      let people = 0;
      for (const k of COUNTRY_KEYS) {
        const rate = latestObs(data[l.alias], k, 2010);
        const pop = latestObs(data.population, k);
        if (rate && pop) {
          people += (rate.value / 100) * pop.value;
          if (l.alias === 'poverty300') covered += pop.value;
        }
      }
      return { ...l, people };
    });
    return { totals, covered };
  }, [data]);

  const growth = useMemo(
    () =>
      COUNTRY_KEYS.map((k) => {
        const b = latestObs(data.bottom40Growth, k);
        const m = latestObs(data.meanGrowth, k);
        return b && m ? { key: k, x: m.value, y: b.value } : null;
      }).filter((r): r is NonNullable<typeof r> => r !== null),
    [data]
  );

  const mpiRows = useMemo(
    () =>
      (Object.keys(MPI) as CountryKey[])
        .map((k) => ({ key: k, ...MPI[k]!, monetary: latestObs(data.poverty300, k)?.value ?? null }))
        .sort((a, b) => b.headcount - a.headcount),
    [data.poverty300]
  );

  return (
    <section className="mb-14">
      <ChapterHeader
        isDarkMode={isDarkMode}
        number={4}
        title="Poverty"
        subtitle="The World Bank's international poverty lines were reset in 2025 to $3.00, $4.20 and $8.30 a day at 2021 prices. Each figure comes from a household survey, so every point on these charts is a real survey year, and some countries go a decade between surveys."
      />
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['wb-poverty', 'development-curated']}
        flags={['estimate']}
        download={{
          filename: 'development-poverty',
          title: 'Poverty lines',
          getData: () =>
            rowsToCsv({
              'poverty $3.00': data.poverty300,
              'poverty $4.20': data.poverty420,
              'poverty $8.30': data.poverty830,
              'poverty gap $3.00': data.povertyGap,
              'prosperity gap': data.prosperityGap,
            }),
        }}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {headcount.totals.map((l) => (
          <Stat
            key={l.alias}
            isDarkMode={isDarkMode}
            label={`Below ${l.label}`}
            value={loading ? '\u2026' : `${(l.people / 1e6).toFixed(0)}m people`}
            sub="Latest survey since 2010, roster countries"
            tone={l.alias === 'poverty300' ? 'text-rose-500' : undefined}
          />
        ))}
        <Stat
          isDarkMode={isDarkMode}
          label="Population covered"
          value={loading ? '\u2026' : `${(headcount.covered / 1e9).toFixed(2)}bn`}
          sub="Countries with a poverty survey since 2010"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2 mb-6">
        <Panel
          isDarkMode={isDarkMode}
          title="Three Poverty Lines, One Country"
          subtitle="Each dot is a household survey."
          actions={<CountrySelect isDarkMode={isDarkMode} value={country} onChange={setCountry} />}
          note="$3.00 is the median national poverty line of low-income countries; $4.20 and $8.30 are typical of lower- and upper-middle-income countries."
        >
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading} height={300}>
            <PovertyLinesChart isDarkMode={isDarkMode} data={data} country={country} />
          </ChapterLoadingGuard>
        </Panel>
        <Panel
          isDarkMode={isDarkMode}
          title="Extreme Poverty over Time"
          subtitle="Share below $3.00 a day for your selected countries, survey points marked."
        >
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading} height={300}>
            <TrendLines isDarkMode={isDarkMode} series={data.poverty300} keys={selected} fromYear={1990} markers format={(v) => `${v.toFixed(0)}%`} height={300} />
          </ChapterLoadingGuard>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2 mb-6">
        <Panel
          isDarkMode={isDarkMode}
          title="Poverty Headcount by Country"
          subtitle="Latest survey since 2010. The small number is the survey year."
          actions={
            <Segmented
              isDarkMode={isDarkMode}
              value={line}
              onChange={setLine}
              options={LINES.map((l) => ({ id: l.alias, label: l.label }))}
            />
          }
        >
          <RankedBars isDarkMode={isDarkMode} rows={latestRows(data[line], 2010)} higherIsBetter={false} highlight={selected} format={(v) => `${v.toFixed(1)}%`} domainMax={100} />
        </Panel>
        <Panel
          isDarkMode={isDarkMode}
          title={gapMetric === 'prosperityGap' ? 'Prosperity Gap' : 'Poverty Gap at $3.00'}
          subtitle={
            gapMetric === 'prosperityGap'
              ? 'Average factor by which incomes must rise to reach $28 a day. 1 would mean everyone is there already.'
              : 'Average shortfall below $3.00 a day, as a share of the line. Captures depth, not just headcount.'
          }
          actions={
            <Segmented
              isDarkMode={isDarkMode}
              value={gapMetric}
              onChange={setGapMetric}
              options={[
                { id: 'prosperityGap', label: 'Prosperity gap' },
                { id: 'povertyGap', label: 'Poverty gap' },
              ]}
            />
          }
        >
          <RankedBars
            isDarkMode={isDarkMode}
            rows={latestRows(data[gapMetric], 2010)}
            higherIsBetter={false}
            highlight={selected}
            format={(v) => (gapMetric === 'prosperityGap' ? v.toFixed(2) : `${v.toFixed(1)}%`)}
          />
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          isDarkMode={isDarkMode}
          title="Shared Prosperity: Bottom 40% vs Average"
          subtitle="Annual growth in survey income or consumption, over roughly five years. Points above the dashed line mean the poorest 40% gained faster than the average."
        >
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
            <ScatterPlot
              isDarkMode={isDarkMode}
              rows={growth}
              xLabel="Average growth %"
              yLabel="Bottom 40% growth %"
              xFormat={(v) => `${v.toFixed(0)}%`}
              yFormat={(v) => `${v.toFixed(0)}%`}
              highlight={selected}
              diagonal
              labelAll
            />
          </ChapterLoadingGuard>
        </Panel>
        <Panel
          isDarkMode={isDarkMode}
          title="Multidimensional Poverty"
          subtitle="UNDP/OPHI Global MPI: deprived in at least a third of 10 indicators across health, education and living standards."
          note="Estimates, rounded. Survey years vary widely; the MPI is published only for developing countries."
        >
          <div className="overflow-auto max-h-[380px]">
            <table className={`w-full text-xs ${t.text}`}>
              <thead className={t.textSec}>
                <tr>
                  <th className="text-left px-2 py-1 font-medium">Country</th>
                  <th className="text-right px-2 py-1 font-medium">MPI poor</th>
                  <th className="text-right px-2 py-1 font-medium">Intensity</th>
                  <th className="text-right px-2 py-1 font-medium">MPI</th>
                  <th className="text-right px-2 py-1 font-medium">Below $3</th>
                  <th className="text-right px-2 py-1 font-medium">Survey</th>
                </tr>
              </thead>
              <tbody>
                {mpiRows.map((r) => (
                  <tr key={r.key} className={`border-t ${t.border}`}>
                    <td className="px-2 py-1">{countryName(r.key)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt.pct(r.headcount)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt.pct(r.intensity)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt.idx(r.mpi)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt.pct(r.monetary)}</td>
                    <td className={`px-2 py-1 text-right tabular-nums ${t.textMuted}`}>{r.surveyYear}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </section>
  );
}
