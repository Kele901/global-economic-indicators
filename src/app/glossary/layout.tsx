import type { Metadata } from 'next';
import { withOgImage } from '../lib/og';

export const metadata: Metadata = withOgImage('/glossary', {
  title: 'Economic Glossary: Metrics and Terms | Global Economic Indicators',
  description:
    'Two glossaries in one. Metrics: the formula, unit and source behind every indicator charted on the site. Terms: plain-English definitions of macroeconomic vocabulary from aggregate demand to the zero lower bound.',
  keywords:
    'economics glossary, economic terms dictionary, GDP definition, inflation definition, Palma ratio, real policy rate, term spread, monetary policy terms, macro terminology',
  alternates: { canonical: '/glossary' },
  openGraph: {
    type: 'article',
    title: 'Economic Glossary: metrics and terms',
    description:
      'Compact, jargon-light definitions for every indicator on the site plus the macroeconomic vocabulary behind them.',
    url: '/glossary',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Economic Glossary: metrics and terms',
    description: 'Definitions for every indicator on the site plus the macro vocabulary behind them.',
  },
});

export default function GlossaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
