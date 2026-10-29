'use client';

import { useMemo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { POLITICS_PROFILES, type PoliticalProfile } from '../services/politicsCurated';
import { COUNTRY_DISPLAY_NAMES, getRegionFor } from '../utils/countryMappings';
import { metricScore, type IndexMetric, type WgiByCountry, type WgiSnapshot } from '../utils/politicsColors';

interface Props {
  isDarkMode: boolean;
  profile: PoliticalProfile;
  wgi?: WgiByCountry;
  height?: number;
}

const CURATED_AXES: { id: IndexMetric; label: string }[] = [
  { id: 'eiu', label: 'Democracy (EIU)' },
  { id: 'freedomHouse', label: 'Freedom (FH)' },
  { id: 'vdem', label: 'Liberal democracy (V-Dem)' },
  { id: 'rsf', label: 'Press freedom (RSF)' },
  { id: 'cpi', label: 'Clean government (CPI)' },
  { id: 'women', label: 'Women in parliament' },
];

const WGI_AXES: { id: keyof WgiSnapshot; label: string }[] = [
  { id: 'effectiveness', label: 'Gov. effectiveness (WGI)' },
  { id: 'ruleOfLaw', label: 'Rule of law (WGI)' },
  { id: 'stability', label: 'Stability (WGI)' },
];

export default function GovernanceRadar({ isDarkMode, profile, wgi, height = 360 }: Props) {
  const region = getRegionFor(profile.key);

  const data = useMemo(() => {
    const peers = POLITICS_PROFILES.filter((p) => getRegionFor(p.key) === region);
    const avg = (list: PoliticalProfile[], f: (p: PoliticalProfile) => number | undefined) => {
      const vals = list.map(f).filter((v): v is number => v != null);
      return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : undefined;
    };
    const rows = CURATED_AXES.map((a) => ({
      axis: a.label,
      country: Math.round(metricScore(profile, a.id) * 100),
      region: Math.round((avg(peers, (p) => metricScore(p, a.id)) ?? 0) * 100),
      world: Math.round((avg(POLITICS_PROFILES, (p) => metricScore(p, a.id)) ?? 0) * 100),
    }));
    const own = wgi?.[profile.key];
    if (own) {
      for (const a of WGI_AXES) {
        const v = own[a.id];
        if (v == null) continue;
        const toPct = (x: number | undefined) => (x == null ? 0 : Math.round(((x + 2.5) / 5) * 100));
        rows.push({
          axis: a.label,
          country: toPct(v),
          region: toPct(avg(peers, (p) => wgi?.[p.key]?.[a.id])),
          world: toPct(avg(POLITICS_PROFILES, (p) => wgi?.[p.key]?.[a.id])),
        });
      }
    }
    return rows;
  }, [profile, region, wgi]);

  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const grid = isDarkMode ? '#374151' : '#e5e7eb';

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke={grid} />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: axis }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="47-country average" dataKey="world" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.08} strokeDasharray="4 3" />
          <Radar name={`${region ?? 'Region'} average`} dataKey="region" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
          <Radar name={COUNTRY_DISPLAY_NAMES[profile.key]} dataKey="country" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} strokeWidth={2} />
          <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${grid}`, fontSize: 12 }} formatter={(v: number) => `${v}/100`} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
