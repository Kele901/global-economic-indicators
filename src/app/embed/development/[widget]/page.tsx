'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useSearchParams } from 'next/navigation';
import SocialShareMenu from '../../../components/SocialShareMenu';
import type { DevMapMetric } from '../../../components/DevelopmentWorldMap';
import { useDevSeries } from '../../../development/useDevelopmentData';
import { HDR, HDR_DATA_YEAR, getIncomeGroup, latestObs } from '../../../services/developmentCurated';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_KEYS, COUNTRY_KEY_TO_SLUG, COUNTRY_SLUGS, type CountryKey } from '../../../utils/countryMappings';
import { absoluteUrl } from '../../../lib/site';
import { slugify } from '../../../lib/share';

const GapminderBubble = dynamic(() => import('../../../components/development/GapminderBubble'), { ssr: false });
const DevelopmentWorldMap = dynamic(() => import('../../../components/DevelopmentWorldMap'), { ssr: false });

const DEVELOPMENT_WIDGETS = ['bubble', 'hdi-map', 'profile-card'] as const;
const MAP_METRICS: DevMapMetric[] = ['hdi', 'ihdi', 'gdpPc', 'lifeExp', 'poverty'];

function resolveCountry(raw: string | null): CountryKey {
  if (!raw) return 'India';
  const bySlug = COUNTRY_SLUGS[raw.toLowerCase()];
  if (bySlug) return bySlug;
  return (raw in COUNTRY_DISPLAY_NAMES ? raw : 'India') as CountryKey;
}

function BubbleWidget({ isDark, year }: { isDark: boolean; year?: number }) {
  const { data, loading } = useDevSeries(['gdpPcConst', 'lifeExpectancy', 'population']);
  if (loading) return <div className="h-[420px]" />;
  return <GapminderBubble isDarkMode={isDark} data={data} initialYear={year} height={420} compact />;
}

function MapWidget({ isDark, initial }: { isDark: boolean; initial: DevMapMetric }) {
  const [metric, setMetric] = useState<DevMapMetric>(initial);
  const { data } = useDevSeries(['gdpPerCapitaPPP', 'lifeExpectancy', 'poverty300']);
  const scores = useMemo(
    () =>
      COUNTRY_KEYS.map((k) => ({
        country: k,
        hdi: HDR[k]?.hdi ?? null,
        ihdi: HDR[k]?.ihdi ?? null,
        gdpPc: latestObs(data.gdpPerCapitaPPP, k)?.value ?? null,
        lifeExp: latestObs(data.lifeExpectancy, k)?.value ?? null,
        poverty: latestObs(data.poverty300, k, 2010)?.value ?? null,
      })),
    [data]
  );
  return <DevelopmentWorldMap isDarkMode={isDark} scoreCards={scores} metric={metric} onMetricChange={setMetric} hideShare />;
}

function Sparkline({ values, isDark }: { values: number[]; isDark: boolean }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((v, i) => `${(i / (values.length - 1)) * 100},${30 - ((v - min) / span) * 28 - 1}`).join(' ');
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-12" aria-hidden>
      <polyline points={points} fill="none" stroke={isDark ? '#34d399' : '#059669'} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function ProfileCard({ isDark, country }: { isDark: boolean; country: CountryKey }) {
  const r = HDR[country];
  if (!r) return <p className="text-sm text-gray-500">No development data for this country.</p>;
  const years = Object.keys(r.trend).sort();
  const values = years.map((y) => r.trend[y]!);
  const muted = isDark ? 'text-gray-400' : 'text-gray-500';
  const tile = `rounded-md p-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`;
  const tiles: [string, string][] = [
    ['HDI', r.hdi?.toFixed(3) ?? '\u2014'],
    ['World rank', r.hdiRank != null ? String(r.hdiRank) : '\u2014'],
    ['Life expectancy', r.lifeExpectancy != null ? `${r.lifeExpectancy.toFixed(1)} yrs` : '\u2014'],
    ['Expected schooling', r.expectedSchooling != null ? `${r.expectedSchooling.toFixed(1)} yrs` : '\u2014'],
    ['GNI per person (PPP)', r.gniPerCapita != null ? `$${Math.round(r.gniPerCapita).toLocaleString()}` : '\u2014'],
    ['Lost to inequality', r.ihdiLoss != null ? `${r.ihdiLoss.toFixed(1)}%` : '\u2014'],
  ];
  return (
    <div>
      <div className={`text-xs mb-2 ${muted}`}>{getIncomeGroup(country) ?? ''} {'\u00b7'} UNDP HDR {HDR_DATA_YEAR}</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
        {tiles.map(([label, value]) => (
          <div key={label} className={tile}>
            <div className={`text-[10px] uppercase tracking-wider ${muted}`}>{label}</div>
            <div className="text-base font-semibold tabular-nums">{value}</div>
          </div>
        ))}
      </div>
      <div className={`text-[11px] ${muted}`}>HDI, {years[0]}{'\u2013'}{years[years.length - 1]}</div>
      <Sparkline values={values} isDark={isDark} />
      <a href={absoluteUrl(`/development/${COUNTRY_KEY_TO_SLUG[country]}`)} target="_blank" rel="noopener noreferrer" className={`text-xs underline ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
        Full development profile
      </a>
    </div>
  );
}

function DevelopmentWidget() {
  const params = useParams();
  const searchParams = useSearchParams();
  const widget = (params?.widget as string) || 'bubble';
  const isDark = searchParams?.get('theme') === 'dark';
  const country = resolveCountry(searchParams?.get('country') ?? null);
  const yearParam = Number(searchParams?.get('year'));
  const year = Number.isFinite(yearParam) && yearParam >= 1960 && yearParam <= 2030 ? yearParam : undefined;
  const metricParam = searchParams?.get('metric') as DevMapMetric | null;
  const metric: DevMapMetric = metricParam && MAP_METRICS.includes(metricParam) ? metricParam : 'hdi';
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    try {
      setShowShare(window.top === window.self || window.top?.location.origin !== window.location.origin);
    } catch {
      setShowShare(true);
    }
  }, []);

  let title: string;
  let body: React.ReactNode;
  if (widget === 'bubble') {
    title = 'Income and life expectancy since 1960';
    body = <BubbleWidget isDark={isDark} year={year} />;
  } else if (widget === 'hdi-map') {
    title = 'Human development around the world';
    body = <MapWidget isDark={isDark} initial={metric} />;
  } else if (widget === 'profile-card') {
    title = `${COUNTRY_DISPLAY_NAMES[country]}: human development`;
    body = <ProfileCard isDark={isDark} country={country} />;
  } else {
    title = 'Widget not found';
    body = <p className="text-sm text-gray-500">Unknown widget. Try one of: {DEVELOPMENT_WIDGETS.join(', ')}.</p>;
  }

  return (
    <div id={slugify(title)} className={`p-3 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {showShare && <SocialShareMenu title={title} isDarkMode={isDark} iconOnly />}
      </div>
      {body}
    </div>
  );
}

export default function EmbedDevelopmentPage() {
  return (
    <Suspense fallback={<div className="h-[300px]" />}>
      <DevelopmentWidget />
    </Suspense>
  );
}
