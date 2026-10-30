import type { Metadata } from 'next';
import { COUNTRY_SLUGS, COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG } from '../../utils/countryMappings';
import { POLITICS_BY_KEY, getEffectiveLeader, governmentSeatShare, type Leader } from '../../services/politicsCurated';
import { withOgImage } from '../../lib/og';
import { countryProfileRobots } from '../../lib/indexing';
import { absoluteUrl } from '../../lib/site';
import JsonLd from '../../components/JsonLd';

export function generateStaticParams() {
  return Object.values(COUNTRY_KEY_TO_SLUG).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const key = COUNTRY_SLUGS[params.slug?.toLowerCase() ?? ''];
  const profile = key ? POLITICS_BY_KEY[key] : undefined;

  if (!key || !profile) {
    return {
      title: 'Political Profile | Global Economic Indicators',
      robots: 'noindex',
    };
  }

  const name = COUNTRY_DISPLAY_NAMES[key];
  const leader = getEffectiveLeader(profile);
  const canonical = `/politics-ledger/${COUNTRY_KEY_TO_SLUG[key]}`;
  const title = `${name} Politics: Government, Parties, History & Political Culture`;
  const description = `Who governs ${name}: ${leader.name} (${leader.title}), the ${profile.leadership.rulingCoalition}, parliament seats, the next election, political history, culture and founding philosophy.`;
  const next = profile.leadership.nextElection;
  const cardDescription = `Government holds ${(governmentSeatShare(profile) * 100).toFixed(0)}% of seats. Next vote: ${next.date ? `${next.type}, ${next.date.slice(0, 7)}` : 'none scheduled'}.`;

  return withOgImage(canonical, {
    title: `${title} | Global Economic Indicators`,
    description,
    robots: countryProfileRobots(COUNTRY_KEY_TO_SLUG[key]),
    keywords: `${name} politics, ${name} government, ${name} political parties, ${leader.name}, ${name} election, ${name} political system, ${name} political history`,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }, {
    section: `${name} \u00b7 Political profile`,
    metric: `${leader.name}, ${leader.title}`,
    description: cardDescription,
    series: profile.indices.vdemLibDem,
    subject: 'chart',
  });
}

function person(l: Leader, country: string) {
  return {
    '@type': 'Person',
    name: l.name,
    jobTitle: `${l.title} of ${country}`,
    ...(l.born ? { birthDate: String(l.born) } : {}),
    ...(l.party ? { affiliation: { '@type': 'Organization', name: l.party } } : {}),
  };
}

export default function PoliticalProfileLayout({ children, params }: { children: React.ReactNode; params: { slug: string } }) {
  const key = COUNTRY_SLUGS[params.slug?.toLowerCase() ?? ''];
  const profile = key ? POLITICS_BY_KEY[key] : undefined;
  if (!key || !profile) return children;

  const name = COUNTRY_DISPLAY_NAMES[key];
  const url = absoluteUrl(`/politics-ledger/${COUNTRY_KEY_TO_SLUG[key]}`);
  const { headOfState, headOfGovernment, nextElection } = profile.leadership;
  const leaders = [headOfState, headOfGovernment].filter((l): l is Leader => !!l && !/collective/i.test(l.name));
  const data: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Country',
      name,
      alternateName: profile.officialName,
      url,
      containedInPlace: { '@type': 'Place', name: 'World' },
      employee: leaders.map((l) => person(l, name)),
    },
  ];
  if (nextElection.date) {
    data.push({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: `${name} ${nextElection.type} election`,
      startDate: nextElection.date,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Country', name },
      description: nextElection.approximate ? 'Latest date allowed by law; exact date not yet set.' : `Scheduled national ${nextElection.type.toLowerCase()} vote.`,
      url,
    });
  }

  return (
    <>
      <JsonLd data={data} />
      {children}
    </>
  );
}
