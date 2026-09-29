import type { Metadata } from 'next';
import { withOgImage } from '../lib/og';

export const revalidate = 3600;

export const metadata: Metadata = withOgImage('/debt', {
  title: 'Debt Ledger | Global Economic Indicators',
  description:
    'Sovereign, corporate and household debt across 30+ economies. Live World Bank + FRED balance-sheet data, curated ratings, CDS, defaults and IMF WEO projections.',
  keywords:
    'sovereign debt, government debt, household debt, central bank balance sheet, credit ratings, CDS spreads, sovereign defaults, IMF WEO, debt sustainability',
  alternates: { canonical: '/debt' },
  openGraph: {
    type: 'article',
    title: 'Debt Ledger — public, private, sovereign in one view',
    description:
      'World Bank debt, FRED central-bank balance sheets, IMF WEO projections, curated ratings and default history.',
  },
});

export default function DebtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
