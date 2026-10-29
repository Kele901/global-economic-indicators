'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useSearchParams } from 'next/navigation';
import SocialShareMenu from '../../../components/SocialShareMenu';
import { POLITICS_BY_KEY } from '../../../services/politicsCurated';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_SLUGS, type CountryKey } from '../../../utils/countryMappings';
import { slugify } from '../../../lib/share';

const RegimeWorldMap = dynamic(() => import('../../../components/RegimeWorldMap'), { ssr: false });
const ParliamentHemicycle = dynamic(() => import('../../../components/ParliamentHemicycle'), { ssr: false });
const ElectionCalendar = dynamic(() => import('../../../components/ElectionCalendar'), { ssr: false });

const POLITICS_WIDGETS = ['regime-map', 'hemicycle', 'elections'] as const;

function resolveCountry(raw: string | null): CountryKey {
  if (!raw) return 'Germany' as CountryKey;
  const bySlug = COUNTRY_SLUGS[raw.toLowerCase()];
  if (bySlug) return bySlug;
  return (raw in COUNTRY_DISPLAY_NAMES ? raw : 'Germany') as CountryKey;
}

function PoliticsWidget() {
  const params = useParams();
  const searchParams = useSearchParams();
  const widget = (params?.widget as string) || 'regime-map';
  const isDark = searchParams?.get('theme') === 'dark';
  const key = resolveCountry(searchParams?.get('country') ?? null);
  const profile = POLITICS_BY_KEY[key];
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
  if (widget === 'hemicycle' && profile) {
    title = `${COUNTRY_DISPLAY_NAMES[key]}: seats in the ${profile.system.legislature.lowerHouse}`;
    body = <ParliamentHemicycle isDarkMode={isDark} profile={profile} />;
  } else if (widget === 'elections') {
    title = 'Upcoming national elections';
    body = <ElectionCalendar isDarkMode={isDark} />;
  } else if (widget === 'regime-map') {
    title = 'Political regimes of the world';
    body = <RegimeWorldMap isDarkMode={isDark} />;
  } else {
    title = 'Widget not found';
    body = <p className="text-sm text-gray-500">Unknown widget. Try one of: {POLITICS_WIDGETS.join(', ')}.</p>;
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

export default function EmbedPoliticsPage() {
  return (
    <Suspense fallback={<div className="h-[300px]" />}>
      <PoliticsWidget />
    </Suspense>
  );
}
