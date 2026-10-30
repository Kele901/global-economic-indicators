'use client';

import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COUNTRY_KEYS, type CountryKey } from '../../utils/countryMappings';
import { POPULATION_PROJECTIONS, latestObs, seriesFor } from '../../services/developmentCurated';
import { useDevSeries, type DevAlias, type DevData } from '../../development/useDevelopmentData';
import { TrendLines } from './charts';
import { rowsToCsv, type ChapterProps } from './data';
import { ChapterHeader, ChapterLoadingGuard, ChapterMeta, CountrySelect, Panel, countryName, theme } from './ui';

const ALIASES: DevAlias[] = ['birthRate', 'deathRate', 'fertilityRate', 'popAge0_14', 'popAge15_64', 'popAge65Plus', 'dependencyRatio'];

export function DemographicTransition({ isDarkMode, data, country, height = 300 }: { isDarkMode: boolean; data: DevData; country: CountryKey; height?: number }) {
  const t = theme(isDarkMode);
  const rows = useMemo(() => {
    const byYear = new Map<number, Record<string, number>>();
    const add = (alias: DevAlias, name: string) => {
      for (const o of seriesFor(data[alias], country)) {
        const r = byYear.get(o.year) ?? { year: o.year };
        r[name] = o.value;
        byYear.set(o.year, r);
      }
    };
    add('birthRate', 'Births');
    add('deathRate', 'Deaths');
    add('fertilityRate', 'Fertility');
    return [...byYear.values()].sort((a, b) => a.year - b.year);
  }, [data, country]);
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 10, right: 8, bottom: 4, left: 4 }}>
          <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
          <XAxis dataKey="year" stroke={t.axis} tick={{ fontSize: 11 }} />
          <YAxis yAxisId="rate" stroke={t.axis} tick={{ fontSize: 11 }} width={36} />
          <YAxis yAxisId="tfr" orientation="right" stroke={t.axis} tick={{ fontSize: 11 }} width={28} />
          <Tooltip contentStyle={t.tooltip} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line yAxisId="rate" dataKey="Births" name="Birth rate per 1,000" stroke="#22c55e" dot={false} strokeWidth={2} isAnimationActive={false} />
          <Line yAxisId="rate" dataKey="Deaths" name="Death rate per 1,000" stroke="#ef4444" dot={false} strokeWidth={2} isAnimationActive={false} />
          <Line yAxisId="tfr" dataKey="Fertility" name="Births per woman (right)" stroke="#6366f1" dot={false} strokeWidth={2} strokeDasharray="5 3" isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AgeStructure({ isDarkMode, data, country }: { isDarkMode: boolean; data: DevData; country: CountryKey }) {
  const t = theme(isDarkMode);
  const bands = [
    { band: '65+', alias: 'popAge65Plus' as DevAlias, fill: '#ef4444' },
    { band: '15-64', alias: 'popAge15_64' as DevAlias, fill: '#3b82f6' },
    { band: '0-14', alias: 'popAge0_14' as DevAlias, fill: '#22c55e' },
  ].map((b) => ({ ...b, percent: latestObs(data[b.alias], country)?.value ?? 0 }));
  const dep = latestObs(data.dependencyRatio, country);
  return (
    <div>
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bands} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
            <CartesianGrid stroke={t.grid} strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 80]} stroke={t.axis} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="band" stroke={t.axis} tick={{ fontSize: 11 }} width={44} />
            <Tooltip contentStyle={t.tooltip} formatter={(v: number) => `${v.toFixed(1)}%`} />
            <Bar dataKey="percent" isAnimationActive={false}>
              {bands.map((b) => (
                <Cell key={b.band} fill={b.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-xs mt-2 ${t.textSec}`}>
        Dependency ratio: <span className={`font-semibold ${t.text}`}>{dep ? dep.value.toFixed(1) : '\u2014'}</span> dependants (under 15 or over 64)
        per 100 people of working age{dep ? ` (${dep.year})` : ''}.
      </p>
    </div>
  );
}

export default function ChapterDemographics({ isDarkMode, selected }: ChapterProps) {
  const t = theme(isDarkMode);
  const { data, loading } = useDevSeries(ALIASES);
  const [country, setCountry] = useState<CountryKey>('Nigeria');

  const projections = useMemo(
    () =>
      COUNTRY_KEYS.map((k) => {
        const p = POPULATION_PROJECTIONS[k];
        if (!p?.['2023'] || !p['2050']) return null;
        return { key: k, now: p['2023'], y2030: p['2030'], y2050: p['2050'], change: (p['2050'] / p['2023'] - 1) * 100 };
      })
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .sort((a, b) => b.change - a.change),
    []
  );

  return (
    <section className="mb-14">
      <ChapterHeader
        isDarkMode={isDarkMode}
        number={10}
        title="Demographics"
        subtitle="Death rates fall first, then birth rates, and in between populations boom. The decades when the working-age share peaks are the demographic dividend, a window East Asia used and much of Africa is only now entering."
      />
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['wb-development-suite', 'development-curated']}
        flags={['curated']}
        download={{
          filename: 'development-demographics',
          title: 'Demographics',
          getData: () => [
            ...rowsToCsv(Object.fromEntries(ALIASES.map((a) => [a, data[a]]))),
            ...projections.map((p) => ({ series: 'population projection (m)', country: p.key, y2023: p.now, y2030: p.y2030, y2050: p.y2050 })),
          ],
        }}
      />

      <div className="grid gap-6 xl:grid-cols-3 mb-6">
        <Panel
          isDarkMode={isDarkMode}
          title="The Demographic Transition"
          subtitle={`Crude birth and death rates and total fertility in ${countryName(country)}.`}
          actions={<CountrySelect isDarkMode={isDarkMode} value={country} onChange={setCountry} />}
          className="xl:col-span-2"
        >
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading} height={300}>
            <DemographicTransition isDarkMode={isDarkMode} data={data} country={country} />
          </ChapterLoadingGuard>
        </Panel>
        <Panel isDarkMode={isDarkMode} title="Age Structure" subtitle={`Share of population by age band, ${countryName(country)}.`}>
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading} height={220}>
            <AgeStructure isDarkMode={isDarkMode} data={data} country={country} />
          </ChapterLoadingGuard>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          isDarkMode={isDarkMode}
          title="The Dividend Window"
          subtitle="Working-age (15-64) share of population for your selected countries. A rising line is a tailwind for growth; a falling one is ageing."
        >
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
            <TrendLines isDarkMode={isDarkMode} series={data.popAge15_64} keys={selected} fromYear={1960} format={(v) => `${v.toFixed(0)}%`} />
          </ChapterLoadingGuard>
        </Panel>
        <Panel
          isDarkMode={isDarkMode}
          title="Population to 2050"
          subtitle="UN World Population Prospects medium variant, millions."
          note="Projections assume continued fertility decline; the uncertainty range for high-fertility countries is wide."
        >
          <div className="overflow-auto max-h-[340px]">
            <table className={`w-full text-xs ${t.text}`}>
              <thead className={`sticky top-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${t.textSec}`}>
                <tr>
                  <th className="text-left px-2 py-1 font-medium">Country</th>
                  <th className="text-right px-2 py-1 font-medium">2023</th>
                  <th className="text-right px-2 py-1 font-medium">2030</th>
                  <th className="text-right px-2 py-1 font-medium">2050</th>
                  <th className="text-right px-2 py-1 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {projections.map((p) => (
                  <tr key={p.key} className={`border-t ${t.border}`}>
                    <td className="px-2 py-1">{countryName(p.key)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{p.now.toFixed(1)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{p.y2030?.toFixed(1) ?? '\u2014'}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{p.y2050.toFixed(1)}</td>
                    <td className={`px-2 py-1 text-right tabular-nums ${p.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {p.change >= 0 ? '+' : ''}
                      {p.change.toFixed(0)}%
                    </td>
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
