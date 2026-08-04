import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Glossary | Global Economic Indicators',
  description:
    'Definitions for every metric, ratio and derived indicator the site tracks — GDP, inflation, Palma ratio, real policy rate, term spread and more.',
  keywords:
    'economics glossary, GDP definition, inflation definition, Palma ratio, real policy rate, term spread, monetary policy terms, macro terminology',
  alternates: { canonical: '/glossary' },
  openGraph: {
    type: 'article',
    title: 'Glossary — every metric explained',
    description:
      'Compact, jargon-light definitions for the indicators used across the site.',
  },
};

export default function GlossaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
