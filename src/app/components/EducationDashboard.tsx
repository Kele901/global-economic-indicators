'use client';

import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis, LabelList,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { culturalChartColors } from '../data/culturalMetrics';
import {
  EducationLiveData,
  EducationProfile,
  PISA_OECD_AVG,
} from '../services/education';
import { qs2026Top100 } from '../data/universityRankings';

interface EducationDashboardProps {
  isDarkMode: boolean;
  educationData: EducationLiveData;
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

type TabId =
  | 'overview' | 'tertiary' | 'spending' | 'graduates'
  | 'literacyPisa' | 'rankings' | 'research' | 'teachers' | 'insights';

const DISPLAY_NAMES: Record<string, string> = {
  USA: 'United States', UK: 'United Kingdom', SouthKorea: 'South Korea',
  SouthAfrica: 'South Africa', SaudiArabia: 'Saudi Arabia', UAE: 'United Arab Emirates',
  NewZealand: 'New Zealand', CzechRepublic: 'Czech Republic', CostaRica: 'Costa Rica',
  HongKong: 'Hong Kong',
};

const displayName = (key: string): string =>
  DISPLAY_NAMES[key] || key.replace(/([A-Z])/g, ' $1').trim();

const colorFor = (country: string): string =>
  culturalChartColors[country] || '#6366F1';

const fmt = (v: number | null, digits = 1, suffix = ''): string =>
  v === null || v === undefined || Number.isNaN(v)
    ? '—'
    : `${v.toFixed(digits)}${suffix}`;

const fmtInt = (v: number | null): string =>
  v === null || v === undefined || Number.isNaN(v)
    ? '—'
    : Math.round(v).toLocaleString();

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  accent: string;
  isDarkMode: boolean;
}
const KpiCard: React.FC<KpiCardProps> = ({ label, value, sub, accent, isDarkMode }) => (
  <div className={`p-4 rounded-xl border ${
    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  }`}>
    <p className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
    <p className={`text-2xl font-bold mt-1 ${accent}`}>{value}</p>
    {sub && (
      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{sub}</p>
    )}
  </div>
);

const EducationDashboard: React.FC<EducationDashboardProps> = ({
  isDarkMode, educationData,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [rankingCountry, setRankingCountry] = useState<string>('USA');
  const [rankingMode, setRankingMode] = useState<'global' | 'country'>('global');
  const [globalSearch, setGlobalSearch] = useState('');
  const [globalCountryFilter, setGlobalCountryFilter] = useState<string>('all');
  const [pisaCountries, setPisaCountries] = useState<string[]>(
    ['USA', 'UK', 'China', 'Japan', 'Germany', 'Singapore'].filter(c => educationData.countries[c])
  );

  const t = {
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSec: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    textTer: isDarkMode ? 'text-gray-500' : 'text-gray-400',
    grid: isDarkMode ? '#374151' : '#E5E7EB',
    tick: isDarkMode ? '#9CA3AF' : '#6B7280',
    rowHover: isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50',
    headerBg: isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50',
    tooltip: isDarkMode
      ? { backgroundColor: '#1F2937', border: '1px solid #374151', color: '#fff', borderRadius: 8 }
      : { backgroundColor: '#fff', border: '1px solid #E5E7EB', color: '#111827', borderRadius: 8 },
  };

  const profiles = useMemo<EducationProfile[]>(
    () => Object.values(educationData.countries),
    [educationData],
  );

  const aggregate = useMemo(() => {
    const avg = (key: keyof EducationProfile): number | null => {
      const vals = profiles.map(p => p[key]).filter((v): v is number => typeof v === 'number');
      if (vals.length === 0) return null;
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    };
    const topByRanking = profiles
      .filter(p => p.rankings)
      .sort((a, b) => (b.rankings?.top200 ?? 0) - (a.rankings?.top200 ?? 0))[0];
    const topByLiteracy = profiles
      .filter(p => typeof p.adultLiteracy === 'number')
      .sort((a, b) => (b.adultLiteracy ?? 0) - (a.adultLiteracy ?? 0))[0];
    const topByPisaMath = profiles
      .filter(p => p.pisa)
      .sort((a, b) => (b.pisa?.math ?? 0) - (a.pisa?.math ?? 0))[0];

    return {
      avgTertiary: avg('tertiaryEnroll'),
      avgLiteracy: avg('adultLiteracy'),
      avgSpend: avg('educationSpendGDP'),
      avgStem: avg('stemGraduates'),
      topByRanking, topByLiteracy, topByPisaMath,
    };
  }, [profiles]);

  /* -------- Helpers used across charts -------- */
  const sortedBy = (
    key: keyof EducationProfile,
    direction: 'desc' | 'asc' = 'desc',
  ): EducationProfile[] => {
    const filtered = profiles.filter(p => typeof p[key] === 'number');
    return filtered.sort((a, b) => {
      const av = a[key] as number; const bv = b[key] as number;
      return direction === 'desc' ? bv - av : av - bv;
    });
  };

  const renderYear = (year: number | null): string =>
    year ? ` (${year})` : '';

  /* ============ TABS ============ */
  const TABS: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'tertiary', label: 'Tertiary Enrollment' },
    { id: 'spending', label: 'Education Spending' },
    { id: 'graduates', label: 'Graduates & Attainment' },
    { id: 'literacyPisa', label: 'Literacy & PISA' },
    { id: 'rankings', label: 'University Rankings' },
    { id: 'research', label: 'Research Output' },
    { id: 'teachers', label: 'Teachers & Quality' },
    { id: 'insights', label: 'Insights' },
  ];

  /* ============ OVERVIEW ============ */
  const renderOverview = () => {
    const rankingBar = profiles
      .filter(p => p.rankings)
      .map(p => ({
        name: displayName(p.country),
        country: p.country,
        top100: p.rankings!.top100,
        top200: p.rankings!.top200 - p.rankings!.top100,
        top500: p.rankings!.top500 - p.rankings!.top200,
      }))
      .sort((a, b) => (b.top100 + b.top200 + b.top500) - (a.top100 + a.top200 + a.top500))
      .slice(0, 20);

    const scatter = profiles
      .filter(p => typeof p.educationSpendGDP === 'number' && typeof p.tertiaryEnroll === 'number')
      .map(p => ({
        name: displayName(p.country),
        country: p.country,
        spend: p.educationSpendGDP!,
        enroll: p.tertiaryEnroll!,
        articles: p.scientificArticles ?? 1000,
      }));

    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Avg Tertiary Enrollment" value={fmt(aggregate.avgTertiary, 1, '%')}
                   sub="Gross enrollment, % of cohort" accent="text-purple-500" isDarkMode={isDarkMode} />
          <KpiCard label="Avg Adult Literacy" value={fmt(aggregate.avgLiteracy, 1, '%')}
                   sub="Population 15+, World Bank" accent="text-emerald-500" isDarkMode={isDarkMode} />
          <KpiCard label="Avg Education Spend" value={fmt(aggregate.avgSpend, 2, '% GDP')}
                   sub="General government, latest year" accent="text-amber-500" isDarkMode={isDarkMode} />
          <KpiCard label="Avg STEM Graduates" value={fmt(aggregate.avgStem, 1, '%')}
                   sub="Share of total graduates" accent="text-blue-500" isDarkMode={isDarkMode} />
        </div>

        <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
          <h3 className={`text-lg font-semibold ${t.text} mb-3`}>QS 2026 Ranking Concentration (top-500 unis)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={rankingBar}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
              <XAxis dataKey="name" tick={{ fill: t.tick, fontSize: 11 }} angle={-30} textAnchor="end" height={80} interval={0} />
              <YAxis tick={{ fill: t.tick }} />
              <Tooltip contentStyle={t.tooltip} />
              <Legend />
              <Bar dataKey="top100" stackId="a" fill="#7C3AED" name="Top 100" />
              <Bar dataKey="top200" stackId="a" fill="#A78BFA" name="Top 101-200" />
              <Bar dataKey="top500" stackId="a" fill="#DDD6FE" name="Top 201-500" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
          <h3 className={`text-lg font-semibold ${t.text} mb-1`}>Education Spend vs Tertiary Enrollment</h3>
          <p className={`text-sm ${t.textSec} mb-3`}>
            Each dot is a country. X = government education spending (% of GDP).
            Y = tertiary gross enrollment (% of cohort, can exceed 100% when mature
            learners and repeaters are counted). Bubble size reflects scientific journal
            articles published. Hover for exact values.
          </p>
          <ResponsiveContainer width="100%" height={460}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid stroke={t.grid} />
              <XAxis
                type="number"
                dataKey="spend"
                name="Spend"
                tick={{ fill: t.tick }}
                tickFormatter={(v: number) => `${v.toFixed(1)}%`}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                label={{ value: 'Education Spend (% of GDP)', position: 'insideBottom', offset: -15, fill: t.tick }}
              />
              <YAxis
                type="number"
                dataKey="enroll"
                name="Tertiary Enrollment"
                tick={{ fill: t.tick }}
                tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                domain={[0, 'dataMax + 10']}
                label={{ value: 'Tertiary Enrollment (% gross)', angle: -90, position: 'insideLeft', fill: t.tick }}
              />
              <ZAxis dataKey="articles" range={[60, 400]} name="Scientific Articles" />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={t.tooltip}
                formatter={(v: any, n: string) => {
                  if (n === 'Spend')                return [`${(v as number).toFixed(2)}% of GDP`, 'Edu. spend'];
                  if (n === 'Tertiary Enrollment')  return [`${(v as number).toFixed(1)}%`, 'Tertiary enrol.'];
                  if (n === 'Scientific Articles')  return [fmtInt(v as number), 'Sci. articles'];
                  return [v, n];
                }}
                labelFormatter={(_: any, payload: any) => payload?.[0]?.payload?.name ?? ''}
              />
              <Scatter data={scatter} fill="#8B5CF6">
                <LabelList dataKey="name" position="top" style={{ fontSize: 10, fill: t.tick }} />
                {scatter.map((entry, idx) => (
                  <Cell key={idx} fill={colorFor(entry.country)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  /* ============ TERTIARY ENROLLMENT ============ */
  const renderTertiary = () => {
    const data = sortedBy('tertiaryEnroll').map(p => ({
      name: displayName(p.country),
      country: p.country,
      value: p.tertiaryEnroll!,
      year: p.dataYears.tertiaryEnroll,
      secondary: p.secondaryEnroll,
      primary: p.primaryEnroll,
    }));
    return (
      <div className="space-y-6">
        <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
          <h3 className={`text-lg font-semibold ${t.text} mb-1`}>Tertiary Gross Enrollment Ratio (latest)</h3>
          <p className={`text-sm ${t.textSec} mb-3`}>
            World Bank <code>SE.TER.ENRR</code>. &gt;100% reflects mature learners and repeaters counted toward enrolment.
          </p>
          <ResponsiveContainer width="100%" height={Math.max(420, data.length * 22)}>
            <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
              <XAxis type="number" tick={{ fill: t.tick }} />
              <YAxis type="category" dataKey="name" tick={{ fill: t.tick, fontSize: 11 }} width={140} />
              <Tooltip contentStyle={t.tooltip}
                       formatter={(v: any) => `${(v as number).toFixed(1)}%`}
                       labelFormatter={(name: any, payload: any) => `${name}${renderYear(payload?.[0]?.payload?.year)}`} />
              <Bar dataKey="value" name="Tertiary % gross">
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={colorFor(entry.country)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
          <h3 className={`text-lg font-semibold ${t.text} mb-3`}>Enrollment Pyramid — Primary, Secondary, Tertiary</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.slice(0, 18)}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
              <XAxis dataKey="name" tick={{ fill: t.tick, fontSize: 10 }} angle={-30} textAnchor="end" height={80} interval={0} />
              <YAxis tick={{ fill: t.tick }} />
              <Tooltip contentStyle={t.tooltip} formatter={(v: any) => `${(v as number).toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="primary" name="Primary" fill="#10B981" />
              <Bar dataKey="secondary" name="Secondary" fill="#3B82F6" />
              <Bar dataKey="value" name="Tertiary" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  /* ============ SPENDING ============ */
  const renderSpending = () => {
    const dataGDP = sortedBy('educationSpendGDP').map(p => ({
      name: displayName(p.country),
      country: p.country,
      value: p.educationSpendGDP!,
      year: p.dataYears.educationSpendGDP,
    }));
    const dataPerStudent = sortedBy('spendPerTertiary').map(p => ({
      name: displayName(p.country),
      country: p.country,
      value: p.spendPerTertiary!,
    }));
    const scatter = profiles
      .filter(p => typeof p.educationSpendGDP === 'number' && typeof p.tertiaryEnroll === 'number')
      .map(p => ({
        name: displayName(p.country),
        country: p.country,
        spend: p.educationSpendGDP!,
        enroll: p.tertiaryEnroll!,
      }));
    return (
      <div className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
            <h3 className={`text-lg font-semibold ${t.text} mb-1`}>Government Spend (% of GDP)</h3>
            <p className={`text-xs ${t.textSec} mb-3`}>World Bank <code>SE.XPD.TOTL.GD.ZS</code>.</p>
            <ResponsiveContainer width="100%" height={Math.max(380, dataGDP.length * 20)}>
              <BarChart data={dataGDP} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis type="number" tick={{ fill: t.tick }} />
                <YAxis type="category" dataKey="name" tick={{ fill: t.tick, fontSize: 10 }} width={120} />
                <Tooltip contentStyle={t.tooltip} formatter={(v: any) => `${(v as number).toFixed(2)}% GDP`} />
                <Bar dataKey="value">
                  {dataGDP.map((e, i) => <Cell key={i} fill={colorFor(e.country)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
            <h3 className={`text-lg font-semibold ${t.text} mb-1`}>Spend per Tertiary Student (% GDP per capita)</h3>
            <p className={`text-xs ${t.textSec} mb-3`}>World Bank <code>SE.XPD.TERT.PC.ZS</code>.</p>
            <ResponsiveContainer width="100%" height={Math.max(380, dataPerStudent.length * 20)}>
              <BarChart data={dataPerStudent} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis type="number" tick={{ fill: t.tick }} />
                <YAxis type="category" dataKey="name" tick={{ fill: t.tick, fontSize: 10 }} width={120} />
                <Tooltip contentStyle={t.tooltip} formatter={(v: any) => `${(v as number).toFixed(1)}%`} />
                <Bar dataKey="value">
                  {dataPerStudent.map((e, i) => <Cell key={i} fill={colorFor(e.country)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
          <h3 className={`text-lg font-semibold ${t.text} mb-1`}>Does Spending Translate to Enrollment?</h3>
          <p className={`text-sm ${t.textSec} mb-3`}>
            Each dot is a country. X-axis = share of GDP spent on education by the government;
            Y-axis = tertiary gross enrollment ratio. A rising trend would suggest more
            spending drives more enrollment, but rich nations often spend less and still
            enroll more — hover any dot for the country name and exact figures.
          </p>
          <ResponsiveContainer width="100%" height={460}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid stroke={t.grid} />
              <XAxis
                type="number"
                dataKey="spend"
                name="Spend"
                tick={{ fill: t.tick }}
                tickFormatter={(v: number) => `${v.toFixed(1)}%`}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                label={{ value: 'Education Spend (% of GDP)', position: 'insideBottom', offset: -15, fill: t.tick }}
              />
              <YAxis
                type="number"
                dataKey="enroll"
                name="Enrollment"
                tick={{ fill: t.tick }}
                tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                domain={[0, 'dataMax + 10']}
                label={{ value: 'Tertiary Enrollment (% gross)', angle: -90, position: 'insideLeft', fill: t.tick }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={t.tooltip}
                formatter={(v: any, n: string) => {
                  if (n === 'Spend')      return [`${(v as number).toFixed(2)}% of GDP`, 'Edu. spend'];
                  if (n === 'Enrollment') return [`${(v as number).toFixed(1)}%`, 'Tertiary enrol.'];
                  return [v, n];
                }}
                labelFormatter={(_: any, p: any) => p?.[0]?.payload?.name ?? ''}
              />
              <Scatter data={scatter}>
                <LabelList dataKey="name" position="top" style={{ fontSize: 10, fill: t.tick }} />
                {scatter.map((e, i) => <Cell key={i} fill={colorFor(e.country)} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  /* ============ GRADUATES & ATTAINMENT ============ */
  const renderGraduates = () => {
    const stem = sortedBy('stemGraduates').map(p => ({
      name: displayName(p.country), country: p.country, value: p.stemGraduates!,
    }));
    const attainData = profiles
      .filter(p => typeof p.bachelorAttain === 'number' || typeof p.masterAttain === 'number')
      .map(p => ({
        name: displayName(p.country), country: p.country,
        bachelor: p.bachelorAttain ?? 0,
        master: p.masterAttain ?? 0,
      }))
      .sort((a, b) => (b.bachelor + b.master) - (a.bachelor + a.master));
    const labor = sortedBy('laborForceAdvanced').map(p => ({
      name: displayName(p.country), country: p.country,
      lf: p.laborForceAdvanced!,
      unemp: p.unemploymentAdvanced ?? null,
    }));

    return (
      <div className="space-y-6">
        <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
          <h3 className={`text-lg font-semibold ${t.text} mb-1`}>STEM Graduates (% of total tertiary grads)</h3>
          <p className={`text-xs ${t.textSec} mb-3`}>World Bank <code>SE.TER.GRAD.SC.ZS</code>.</p>
          <ResponsiveContainer width="100%" height={Math.max(400, stem.length * 22)}>
            <BarChart data={stem} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
              <XAxis type="number" tick={{ fill: t.tick }} />
              <YAxis type="category" dataKey="name" tick={{ fill: t.tick, fontSize: 11 }} width={140} />
              <Tooltip contentStyle={t.tooltip} formatter={(v: any) => `${(v as number).toFixed(1)}%`} />
              <Bar dataKey="value">
                {stem.map((e, i) => <Cell key={i} fill={colorFor(e.country)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
          <h3 className={`text-lg font-semibold ${t.text} mb-1`}>Tertiary Attainment — Population 25+ (%)</h3>
          <p className={`text-xs ${t.textSec} mb-3`}>
            World Bank <code>SE.TER.CUAT.BA.ZS</code> (bachelor's) &amp; <code>SE.TER.CUAT.MS.ZS</code> (master's/doctoral).
          </p>
          <ResponsiveContainer width="100%" height={Math.max(400, attainData.length * 22)}>
            <BarChart data={attainData} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
              <XAxis type="number" tick={{ fill: t.tick }} />
              <YAxis type="category" dataKey="name" tick={{ fill: t.tick, fontSize: 11 }} width={140} />
              <Tooltip contentStyle={t.tooltip} formatter={(v: any) => `${(v as number).toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="bachelor" stackId="a" name="Bachelor's" fill="#3B82F6" />
              <Bar dataKey="master" stackId="a" name="Master's/Doctoral" fill="#7C3AED" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
            <h3 className={`text-lg font-semibold ${t.text} mb-1`}>Labor Force with Advanced Education (%)</h3>
            <p className={`text-xs ${t.textSec} mb-3`}>World Bank <code>SL.TLF.ADVN.ZS</code>.</p>
            <ResponsiveContainer width="100%" height={Math.max(360, labor.length * 22)}>
              <BarChart data={labor} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis type="number" tick={{ fill: t.tick }} />
                <YAxis type="category" dataKey="name" tick={{ fill: t.tick, fontSize: 10 }} width={130} />
                <Tooltip contentStyle={t.tooltip} formatter={(v: any) => `${(v as number).toFixed(1)}%`} />
                <Bar dataKey="lf" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
            <h3 className={`text-lg font-semibold ${t.text} mb-1`}>Unemployment with Advanced Education (%)</h3>
            <p className={`text-xs ${t.textSec} mb-3`}>
              World Bank <code>SL.UEM.ADVN.ZS</code> — high values can signal credential inflation or brain drain.
            </p>
            <ResponsiveContainer width="100%" height={Math.max(360, labor.length * 22)}>
              <BarChart data={labor.filter(l => l.unemp !== null).sort((a, b) => (b.unemp! - a.unemp!))} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis type="number" tick={{ fill: t.tick }} />
                <YAxis type="category" dataKey="name" tick={{ fill: t.tick, fontSize: 10 }} width={130} />
                <Tooltip contentStyle={t.tooltip} formatter={(v: any) => `${(v as number).toFixed(1)}%`} />
                <Bar dataKey="unemp" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  /* ============ LITERACY & PISA ============ */
  const renderLiteracyPisa = () => {
    const litData = profiles
      .filter(p => typeof p.adultLiteracy === 'number' || typeof p.youthLiteracy === 'number')
      .map(p => ({
        name: displayName(p.country),
        country: p.country,
        adult: p.adultLiteracy ?? 0,
        youth: p.youthLiteracy ?? 0,
      }))
      .sort((a, b) => a.adult - b.adult);

    const pisaRadar = pisaCountries
      .filter(c => educationData.countries[c]?.pisa)
      .map(c => {
        const p = educationData.countries[c].pisa!;
        return {
          country: displayName(c),
          internalKey: c,
          Reading: p.reading,
          Math: p.math,
          Science: p.science,
        };
      });

    const pisaScatter = profiles
      .filter(p => p.pisa && typeof p.educationSpendGDP === 'number')
      .map(p => ({
        name: displayName(p.country),
        country: p.country,
        spend: p.educationSpendGDP!,
        pisa: ((p.pisa!.reading + p.pisa!.math + p.pisa!.science) / 3),
      }));

    return (
      <div className="space-y-6">
        <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
          <h3 className={`text-lg font-semibold ${t.text} mb-1`}>Adult vs Youth Literacy (%)</h3>
          <p className={`text-xs ${t.textSec} mb-3`}>
            World Bank <code>SE.ADT.LITR.ZS</code> (15+) &amp; <code>SE.ADT.1524.LT.ZS</code> (15-24).
            Latest available year per country.
          </p>
          <ResponsiveContainer width="100%" height={Math.max(400, litData.length * 24)}>
            <BarChart data={litData} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: t.tick }} />
              <YAxis type="category" dataKey="name" tick={{ fill: t.tick, fontSize: 10 }} width={120} />
              <Tooltip contentStyle={t.tooltip} formatter={(v: any) => `${(v as number).toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="adult" name="Adult 15+" fill="#0EA5E9" />
              <Bar dataKey="youth" name="Youth 15-24" fill="#22C55E" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
          <div className="flex flex-wrap justify-between items-center mb-3 gap-3">
            <div>
              <h3 className={`text-lg font-semibold ${t.text}`}>PISA {educationData.pisaAsOf} — Reading · Math · Science</h3>
              <p className={`text-xs ${t.textSec}`}>
                OECD mean for reference: Reading {PISA_OECD_AVG.reading} · Math {PISA_OECD_AVG.math} · Science {PISA_OECD_AVG.science}.
                Pick countries:
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {Object.keys(educationData.countries)
              .filter(c => educationData.countries[c].pisa)
              .map(c => {
                const active = pisaCountries.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => {
                      if (active) setPisaCountries(pisaCountries.filter(x => x !== c));
                      else if (pisaCountries.length < 8) setPisaCountries([...pisaCountries, c]);
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      active ? 'ring-2' : ''
                    } ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-100 hover:bg-gray-200'}`}
                    style={active ? { backgroundColor: colorFor(c) + (isDarkMode ? '60' : '30') } : undefined}
                  >
                    {displayName(c)}
                  </button>
                );
              })}
          </div>
          <ResponsiveContainer width="100%" height={420}>
            <RadarChart data={[
              { domain: 'Reading', ...Object.fromEntries(pisaRadar.map(r => [r.country, r.Reading])) },
              { domain: 'Math',    ...Object.fromEntries(pisaRadar.map(r => [r.country, r.Math])) },
              { domain: 'Science', ...Object.fromEntries(pisaRadar.map(r => [r.country, r.Science])) },
            ]}>
              <PolarGrid stroke={t.grid} />
              <PolarAngleAxis dataKey="domain" tick={{ fill: t.tick, fontSize: 12 }} />
              <PolarRadiusAxis domain={[300, 620]} tick={{ fill: t.tick, fontSize: 10 }} />
              {pisaRadar.map(r => (
                <Radar key={r.internalKey} name={r.country} dataKey={r.country}
                       stroke={colorFor(r.internalKey)}
                       fill={colorFor(r.internalKey)} fillOpacity={0.15} />
              ))}
              <Legend />
              <Tooltip contentStyle={t.tooltip} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
          <h3 className={`text-lg font-semibold ${t.text} mb-1`}>PISA Outcomes vs Education Spend</h3>
          <p className={`text-sm ${t.textSec} mb-3`}>
            Each dot is a country. X = government education spending (% of GDP).
            Y = average PISA {educationData.pisaAsOf} score across reading, math, and science
            (OECD mean ≈ {Math.round((PISA_OECD_AVG.reading + PISA_OECD_AVG.math + PISA_OECD_AVG.science) / 3)}).
          </p>
          <ResponsiveContainer width="100%" height={460}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid stroke={t.grid} />
              <XAxis
                type="number"
                dataKey="spend"
                name="Spend"
                tick={{ fill: t.tick }}
                tickFormatter={(v: number) => `${v.toFixed(1)}%`}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                label={{ value: 'Education Spend (% of GDP)', position: 'insideBottom', offset: -15, fill: t.tick }}
              />
              <YAxis
                type="number"
                dataKey="pisa"
                name="PISA average"
                tick={{ fill: t.tick }}
                tickFormatter={(v: number) => v.toFixed(0)}
                domain={[300, 620]}
                label={{ value: 'PISA mean (R + M + S) / 3', angle: -90, position: 'insideLeft', fill: t.tick }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={t.tooltip}
                formatter={(v: any, n: string) => {
                  if (n === 'Spend')        return [`${(v as number).toFixed(2)}% of GDP`, 'Edu. spend'];
                  if (n === 'PISA average') return [`${(v as number).toFixed(0)} points`, 'PISA mean'];
                  return [v, n];
                }}
                labelFormatter={(_: any, p: any) => p?.[0]?.payload?.name ?? ''}
              />
              <Scatter data={pisaScatter}>
                <LabelList dataKey="name" position="top" style={{ fontSize: 10, fill: t.tick }} />
                {pisaScatter.map((e, i) => <Cell key={i} fill={colorFor(e.country)} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <p className={`text-[11px] mt-2 ${t.textSec}`}>
            Source: OECD PISA {educationData.pisaAsOf} (most recent wave) ·
            <a className="underline ml-1" href={educationData.meta.pisaSourceUrl} target="_blank" rel="noopener noreferrer">
              oecd.org/pisa
            </a>
          </p>
        </div>
      </div>
    );
  };

  /* ============ UNIVERSITY RANKINGS ============ */
  const renderRankings = () => {
    const bar = profiles
      .filter(p => p.rankings)
      .map(p => ({
        name: displayName(p.country),
        country: p.country,
        top100: p.rankings!.top100,
        top200: p.rankings!.top200,
        top500: p.rankings!.top500,
        top1000: p.rankings!.top1000,
      }))
      .sort((a, b) => b.top200 - a.top200);

    const drill = educationData.countries[rankingCountry]?.rankings;

    return (
      <div className="space-y-6">
        <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
          <h3 className={`text-lg font-semibold ${t.text} mb-1`}>QS Top-N Counts by Country — {educationData.rankingsAsOf} edition</h3>
          <p className={`text-xs ${t.textSec} mb-3`}>
            Top-100 / Top-200 / Top-500 / Top-1000 university counts.
            Source: <a className="underline" href={educationData.meta.qsSourceUrl} target="_blank" rel="noopener noreferrer">QS World University Rankings 2026</a>.
            Curated snapshot — see <code>data/universityRankings.ts</code> to refresh.
          </p>
          <ResponsiveContainer width="100%" height={Math.max(420, bar.length * 26)}>
            <BarChart data={bar} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
              <XAxis type="number" tick={{ fill: t.tick }} />
              <YAxis type="category" dataKey="name" tick={{ fill: t.tick, fontSize: 11 }} width={150} />
              <Tooltip contentStyle={t.tooltip} />
              <Legend />
              <Bar dataKey="top100" name="Top 100" fill="#7C3AED" />
              <Bar dataKey="top200" name="Top 200" fill="#A78BFA" />
              <Bar dataKey="top500" name="Top 500" fill="#DDD6FE" />
              <Bar dataKey="top1000" name="Top 1000" fill="#EDE9FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
          <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${t.text}`}>
              {rankingMode === 'global' ? 'Global Top 100 — Drill Down' : 'Top 10 Universities — Country Drill Down'}
            </h3>
            <div className="flex flex-wrap gap-2 items-center">
              <div className={`inline-flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <button
                  onClick={() => setRankingMode('global')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    rankingMode === 'global'
                      ? isDarkMode ? 'bg-purple-600 text-white' : 'bg-white text-gray-900 shadow'
                      : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Global Top 100
                </button>
                <button
                  onClick={() => setRankingMode('country')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    rankingMode === 'country'
                      ? isDarkMode ? 'bg-purple-600 text-white' : 'bg-white text-gray-900 shadow'
                      : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  By Country
                </button>
              </div>
              {rankingMode === 'country' && (
                <select
                  value={rankingCountry}
                  onChange={e => setRankingCountry(e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${t.border} ${
                    isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'
                  } text-sm`}
                >
                  {Object.keys(educationData.countries)
                    .filter(c => educationData.countries[c].rankings)
                    .sort((a, b) => displayName(a).localeCompare(displayName(b)))
                    .map(c => (
                      <option key={c} value={c}>{displayName(c)}</option>
                    ))}
                </select>
              )}
            </div>
          </div>

          {rankingMode === 'global' ? (
            (() => {
              // Fall back to the static import if the live payload predates the v2 schema
              // (e.g. stale in-memory data from the previous education_live_v1 cache shape).
              const top100 = (educationData.globalTop100 && educationData.globalTop100.length > 0)
                ? educationData.globalTop100
                : qs2026Top100;
              const allCountries = Array.from(new Set(top100.map(u => u.countryLabel))).sort();
              const filtered = top100.filter(u => {
                const matchesSearch = globalSearch.trim() === '' ||
                  u.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
                  u.city.toLowerCase().includes(globalSearch.toLowerCase()) ||
                  u.countryLabel.toLowerCase().includes(globalSearch.toLowerCase());
                const matchesCountry = globalCountryFilter === 'all' || u.countryLabel === globalCountryFilter;
                return matchesSearch && matchesCountry;
              });

              const concentration = top100.reduce<Record<string, number>>((acc, u) => {
                acc[u.countryLabel] = (acc[u.countryLabel] ?? 0) + 1;
                return acc;
              }, {});
              const concentrationSorted = Object.entries(concentration)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

              return (
                <>
                  <p className={`text-xs ${t.textSec} mb-3`}>
                    The 100 highest-ranked universities globally in the QS World University Rankings {educationData.rankingsAsOf} edition,
                    spanning {allCountries.length} countries. Use the filters below to slice by country or search by name / city.
                  </p>
                  <div className="grid sm:grid-cols-5 gap-3 mb-4">
                    {concentrationSorted.map(([country, count]) => (
                      <KpiCard
                        key={country}
                        label={country}
                        value={`${count}`}
                        sub={`unis in global top 100`}
                        accent="text-purple-500"
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <input
                      type="text"
                      value={globalSearch}
                      onChange={e => setGlobalSearch(e.target.value)}
                      placeholder="Search by university, city, or country…"
                      className={`flex-1 min-w-[200px] px-3 py-2 rounded-lg border ${t.border} text-sm ${
                        isDarkMode ? 'bg-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'
                      }`}
                    />
                    <select
                      value={globalCountryFilter}
                      onChange={e => setGlobalCountryFilter(e.target.value)}
                      className={`px-3 py-2 rounded-lg border ${t.border} text-sm ${
                        isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'
                      }`}
                    >
                      <option value="all">All countries ({allCountries.length})</option>
                      {allCountries.map(c => (
                        <option key={c} value={c}>{c} ({concentration[c]})</option>
                      ))}
                    </select>
                    {(globalSearch || globalCountryFilter !== 'all') && (
                      <button
                        onClick={() => { setGlobalSearch(''); setGlobalCountryFilter('all'); }}
                        className={`px-3 py-2 rounded-lg text-xs font-medium ${
                          isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className={`text-xs mb-2 ${t.textSec}`}>
                    Showing {filtered.length} of {top100.length} universities.
                  </div>
                  <div className="overflow-x-auto">
                    <table className={`w-full text-sm ${t.text}`}>
                      <thead className={`${t.headerBg} sticky top-0`}>
                        <tr>
                          <th className="px-3 py-2 text-left">Rank</th>
                          <th className="px-3 py-2 text-left">University</th>
                          <th className="px-3 py-2 text-left">Country</th>
                          <th className="px-3 py-2 text-left">City</th>
                          <th className="px-3 py-2 text-right">QS Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((u, i) => (
                          <tr key={`${u.rank}-${u.name}-${i}`} className={`border-t ${t.border} ${t.rowHover}`}>
                            <td className="px-3 py-2 font-semibold">#{u.rank}</td>
                            <td className="px-3 py-2">{u.name}</td>
                            <td className="px-3 py-2">
                              <span
                                className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle"
                                style={{ backgroundColor: colorFor(u.countryKey) }}
                              />
                              {u.countryLabel}
                            </td>
                            <td className={`px-3 py-2 ${t.textSec}`}>{u.city}</td>
                            <td className="px-3 py-2 text-right font-mono">{u.score.toFixed(1)}</td>
                          </tr>
                        ))}
                        {filtered.length === 0 && (
                          <tr>
                            <td colSpan={5} className={`px-3 py-6 text-center ${t.textSec}`}>
                              No universities match your filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()
          ) : drill ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <KpiCard label="Top 100" value={String(drill.top100)} accent="text-purple-500" isDarkMode={isDarkMode} />
                <KpiCard label="Top 200" value={String(drill.top200)} accent="text-violet-500" isDarkMode={isDarkMode} />
                <KpiCard label="Top 500" value={String(drill.top500)} accent="text-fuchsia-500" isDarkMode={isDarkMode} />
                <KpiCard label="Top 1000" value={String(drill.top1000)} accent="text-pink-500" isDarkMode={isDarkMode} />
              </div>
              <div className="overflow-x-auto">
                <table className={`w-full text-sm ${t.text}`}>
                  <thead className={t.headerBg}>
                    <tr>
                      <th className="px-3 py-2 text-left">Rank</th>
                      <th className="px-3 py-2 text-left">University</th>
                      <th className="px-3 py-2 text-left">City</th>
                      <th className="px-3 py-2 text-right">QS Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drill.topUniversities
                      .slice()
                      .sort((a, b) => a.rank - b.rank)
                      .map((u, i) => (
                      <tr key={i} className={`border-t ${t.border} ${t.rowHover}`}>
                        <td className="px-3 py-2 font-semibold">#{u.rank}</td>
                        <td className="px-3 py-2">{u.name}</td>
                        <td className={`px-3 py-2 ${t.textSec}`}>{u.city}</td>
                        <td className="px-3 py-2 text-right font-mono">{u.score.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className={t.textSec}>No QS ranking data for this country in the snapshot.</p>
          )}
        </div>
      </div>
    );
  };

  /* ============ RESEARCH OUTPUT ============ */
  const renderResearch = () => {
    const articles = sortedBy('scientificArticles').map(p => ({
      name: displayName(p.country), country: p.country,
      value: p.scientificArticles!,
    }));
    const researchers = sortedBy('researchersPerMillion').map(p => ({
      name: displayName(p.country), country: p.country,
      value: p.researchersPerMillion!,
    }));
    const scatter = profiles
      .filter(p => typeof p.scientificArticles === 'number' && typeof p.researchersPerMillion === 'number')
      .map(p => ({
        name: displayName(p.country), country: p.country,
        researchers: p.researchersPerMillion!,
        articles: p.scientificArticles!,
      }));

    return (
      <div className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
            <h3 className={`text-lg font-semibold ${t.text} mb-1`}>Scientific & Technical Journal Articles</h3>
            <p className={`text-xs ${t.textSec} mb-3`}>World Bank <code>IP.JRN.ARTC.SC</code> · annual count.</p>
            <ResponsiveContainer width="100%" height={Math.max(380, articles.length * 22)}>
              <BarChart data={articles} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis type="number" tick={{ fill: t.tick, fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: t.tick, fontSize: 10 }} width={120} />
                <Tooltip contentStyle={t.tooltip} formatter={(v: any) => fmtInt(v as number)} />
                <Bar dataKey="value">
                  {articles.map((e, i) => <Cell key={i} fill={colorFor(e.country)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
            <h3 className={`text-lg font-semibold ${t.text} mb-1`}>Researchers in R&amp;D (per million)</h3>
            <p className={`text-xs ${t.textSec} mb-3`}>World Bank <code>SP.POP.SCIE.RD.P6</code>.</p>
            <ResponsiveContainer width="100%" height={Math.max(380, researchers.length * 22)}>
              <BarChart data={researchers} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis type="number" tick={{ fill: t.tick, fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: t.tick, fontSize: 10 }} width={120} />
                <Tooltip contentStyle={t.tooltip} formatter={(v: any) => fmtInt(v as number)} />
                <Bar dataKey="value">
                  {researchers.map((e, i) => <Cell key={i} fill={colorFor(e.country)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
          <h3 className={`text-lg font-semibold ${t.text} mb-1`}>Researchers vs Article Output</h3>
          <p className={`text-sm ${t.textSec} mb-3`}>
            Each dot is a country. X = researchers in R&amp;D per million people.
            Y = annual count of scientific &amp; technical journal articles published.
            Countries far to the upper-right combine talent depth with high publishing output.
          </p>
          <ResponsiveContainer width="100%" height={460}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid stroke={t.grid} />
              <XAxis
                type="number"
                dataKey="researchers"
                name="Researchers/M"
                tick={{ fill: t.tick }}
                tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)}
                domain={['dataMin - 200', 'dataMax + 200']}
                label={{ value: 'Researchers per million people', position: 'insideBottom', offset: -15, fill: t.tick }}
              />
              <YAxis
                type="number"
                dataKey="articles"
                name="Articles"
                tick={{ fill: t.tick }}
                tickFormatter={(v: number) =>
                  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` :
                  v >= 1_000     ? `${(v / 1_000).toFixed(0)}k`   : v.toFixed(0)
                }
                domain={[0, 'dataMax + 50000']}
                label={{ value: 'Scientific articles (annual)', angle: -90, position: 'insideLeft', fill: t.tick }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={t.tooltip}
                formatter={(v: any, n: string) => {
                  if (n === 'Researchers/M') return [`${fmtInt(v as number)} per million`, 'Researchers'];
                  if (n === 'Articles')      return [fmtInt(v as number), 'Sci. articles'];
                  return [v, n];
                }}
                labelFormatter={(_: any, p: any) => p?.[0]?.payload?.name ?? ''}
              />
              <Scatter data={scatter}>
                <LabelList dataKey="name" position="top" style={{ fontSize: 10, fill: t.tick }} />
                {scatter.map((e, i) => <Cell key={i} fill={colorFor(e.country)} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  /* ============ TEACHERS & QUALITY ============ */
  const renderTeachers = () => {
    const completion = sortedBy('primaryCompletion').map(p => ({
      name: displayName(p.country), country: p.country, value: p.primaryCompletion!,
    }));
    const pupilTeacher = sortedBy('pupilTeacherPrimary', 'asc').map(p => ({
      name: displayName(p.country), country: p.country, value: p.pupilTeacherPrimary!,
    }));
    const trained = sortedBy('trainedTeachers').map(p => ({
      name: displayName(p.country), country: p.country, value: p.trainedTeachers!,
    }));

    return (
      <div className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
            <h3 className={`text-lg font-semibold ${t.text} mb-1`}>Primary Completion Rate (%)</h3>
            <p className={`text-xs ${t.textSec} mb-3`}>World Bank <code>SE.PRM.CMPT.ZS</code>.</p>
            <ResponsiveContainer width="100%" height={Math.max(380, completion.length * 22)}>
              <BarChart data={completion} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis type="number" domain={[0, 110]} tick={{ fill: t.tick }} />
                <YAxis type="category" dataKey="name" tick={{ fill: t.tick, fontSize: 10 }} width={120} />
                <Tooltip contentStyle={t.tooltip} formatter={(v: any) => `${(v as number).toFixed(1)}%`} />
                <Bar dataKey="value">
                  {completion.map((e, i) => <Cell key={i} fill={colorFor(e.country)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
            <h3 className={`text-lg font-semibold ${t.text} mb-1`}>Pupil-Teacher Ratio (primary, lower is better)</h3>
            <p className={`text-xs ${t.textSec} mb-3`}>World Bank <code>SE.PRM.ENRL.TC.ZS</code>.</p>
            <ResponsiveContainer width="100%" height={Math.max(380, pupilTeacher.length * 22)}>
              <BarChart data={pupilTeacher} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis type="number" tick={{ fill: t.tick }} />
                <YAxis type="category" dataKey="name" tick={{ fill: t.tick, fontSize: 10 }} width={120} />
                <Tooltip contentStyle={t.tooltip} formatter={(v: any) => `${(v as number).toFixed(1)}`} />
                <Bar dataKey="value">
                  {pupilTeacher.map((e, i) => <Cell key={i} fill={colorFor(e.country)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4`}>
          <h3 className={`text-lg font-semibold ${t.text} mb-1`}>Trained Primary Teachers (%)</h3>
          <p className={`text-xs ${t.textSec} mb-3`}>World Bank <code>SE.PRM.TCAQ.ZS</code>.</p>
          <ResponsiveContainer width="100%" height={Math.max(380, trained.length * 22)}>
            <BarChart data={trained} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: t.tick }} />
              <YAxis type="category" dataKey="name" tick={{ fill: t.tick, fontSize: 10 }} width={120} />
              <Tooltip contentStyle={t.tooltip} formatter={(v: any) => `${(v as number).toFixed(1)}%`} />
              <Bar dataKey="value">
                {trained.map((e, i) => <Cell key={i} fill={colorFor(e.country)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  /* ============ INSIGHTS ============ */
  const renderInsights = () => {
    const stemLeaders = sortedBy('stemGraduates').slice(0, 5);
    const literacyLag = sortedBy('adultLiteracy', 'asc').slice(0, 5);
    const spendLeaders = sortedBy('educationSpendGDP').slice(0, 5);
    const pisaLeaders = profiles
      .filter(p => p.pisa)
      .sort((a, b) => ((b.pisa!.reading + b.pisa!.math + b.pisa!.science) - (a.pisa!.reading + a.pisa!.math + a.pisa!.science)))
      .slice(0, 5);
    const rankingConcentration = profiles
      .filter(p => p.rankings)
      .sort((a, b) => (b.rankings!.top200 - a.rankings!.top200))
      .slice(0, 5);
    const brainDrainSignals = profiles
      .filter(p => typeof p.unemploymentAdvanced === 'number' && typeof p.bachelorAttain === 'number')
      .sort((a, b) => (b.unemploymentAdvanced! - a.unemploymentAdvanced!))
      .slice(0, 5);

    const insightCard = (
      title: string, accent: string, items: { label: string; value: string }[], blurb: string,
    ) => (
      <div className={`rounded-xl border ${t.border} ${t.cardBg} p-5`}>
        <h3 className={`text-base font-bold mb-2 ${accent}`}>{title}</h3>
        <p className={`text-xs mb-3 ${t.textSec}`}>{blurb}</p>
        <ul className="space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span className={t.text}>{it.label}</span>
              <span className={`font-mono ${t.textSec}`}>{it.value}</span>
            </li>
          ))}
        </ul>
      </div>
    );

    return (
      <div className="grid md:grid-cols-2 gap-6">
        {insightCard(
          'STEM Superpowers',
          'text-blue-500',
          stemLeaders.map(p => ({ label: displayName(p.country), value: fmt(p.stemGraduates, 1, '%') })),
          'Highest share of graduates in science, technology, engineering & math.',
        )}
        {insightCard(
          'Literacy Frontiers',
          'text-amber-500',
          literacyLag.map(p => ({ label: displayName(p.country), value: fmt(p.adultLiteracy, 1, '%') })),
          'Lowest adult literacy rates — most urgent education access gaps.',
        )}
        {insightCard(
          'Spending Leaders',
          'text-emerald-500',
          spendLeaders.map(p => ({ label: displayName(p.country), value: fmt(p.educationSpendGDP, 2, '%') })),
          'Largest education investments as a share of GDP.',
        )}
        {insightCard(
          'PISA Leaders',
          'text-purple-500',
          pisaLeaders.map(p => ({
            label: displayName(p.country),
            value: ((p.pisa!.reading + p.pisa!.math + p.pisa!.science) / 3).toFixed(0),
          })),
          `Top mean PISA scores (R+M+S)/3 — wave ${educationData.pisaAsOf}.`,
        )}
        {insightCard(
          'Ranking Concentration',
          'text-violet-500',
          rankingConcentration.map(p => ({ label: displayName(p.country), value: `${p.rankings!.top200} in top-200` })),
          `Countries hosting the most QS top-200 universities — ${educationData.rankingsAsOf} edition.`,
        )}
        {insightCard(
          'Brain Drain Signals',
          'text-red-500',
          brainDrainSignals.map(p => ({
            label: displayName(p.country),
            value: `${p.unemploymentAdvanced?.toFixed(1)}% unemp · ${p.bachelorAttain?.toFixed(1)}% BA+`,
          })),
          'Highest unemployment among the advanced-educated — credential surplus or emigration pressure.',
        )}
      </div>
    );
  };

  /* ============ MAIN RENDER ============ */
  return (
    <div className="space-y-6">
      {/* Sub-tab nav */}
      <div className={`flex flex-wrap gap-2 p-2 rounded-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === tab.id
                ? isDarkMode ? 'bg-purple-600 text-white' : 'bg-white text-gray-900 shadow'
                : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active sub-tab content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'tertiary' && renderTertiary()}
      {activeTab === 'spending' && renderSpending()}
      {activeTab === 'graduates' && renderGraduates()}
      {activeTab === 'literacyPisa' && renderLiteracyPisa()}
      {activeTab === 'rankings' && renderRankings()}
      {activeTab === 'research' && renderResearch()}
      {activeTab === 'teachers' && renderTeachers()}
      {activeTab === 'insights' && renderInsights()}
    </div>
  );
};

export default EducationDashboard;
