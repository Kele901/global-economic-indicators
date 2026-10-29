import type { Metadata } from 'next';
import { withOgImage } from '../lib/og';
import { absoluteUrl } from '../lib/site';
import { CURATED_LAST_UPDATED } from '../services/politicsCurated';
import JsonLd from '../components/JsonLd';

export const revalidate = 3600;

export const metadata: Metadata = withOgImage('/politics-ledger', {
  title: 'Politics Ledger | Global Economic Indicators',
  description:
    'Who governs the world: current leaders and ruling parties, systems of government, ideological maps, election calendar, democracy scorecards, checks and balances, leaders since 1945, political history, culture and founding philosophy for 47 countries.',
  keywords:
    'world leaders, ruling parties, political systems, democracy index, Freedom House, V-Dem, election calendar 2026, political philosophy, regime type, parliament seats, checks and balances, political quiz',
  alternates: { canonical: '/politics-ledger' },
  openGraph: {
    type: 'article',
    title: 'Politics Ledger: who governs the world, and how',
    description:
      'Leaders, parties, parliaments, elections, democracy scores, checks and balances and the ideas behind 47 political systems, in twelve chapters.',
  },
});

const DATASET = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Politics Ledger: political profiles of 47 countries',
  description:
    'Curated heads of state and government, ruling coalitions, parliamentary seats, election dates, leaders since 1945, recent vote shares, checks-and-balances scores and governance index readings for 47 countries.',
  url: absoluteUrl('/politics-ledger'),
  dateModified: CURATED_LAST_UPDATED,
  isAccessibleForFree: true,
  creator: { '@type': 'Organization', name: 'Global Economic Indicators' },
  spatialCoverage: { '@type': 'Place', name: 'World (47 countries)' },
  temporalCoverage: `1945/${CURATED_LAST_UPDATED.slice(0, 4)}`,
  variableMeasured: [
    'Regime type',
    'Head of state',
    'Head of government',
    'Parliamentary seats by party',
    'Vote share by party',
    'EIU Democracy Index',
    'Freedom House score',
    'V-Dem Liberal Democracy Index',
    'Power concentration',
  ],
};

export default function PoliticsLedgerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={DATASET} />
      {children}
    </>
  );
}
