import type { Metadata } from 'next';
import { withOgImage } from '../lib/og';

export const revalidate = 3600;

export const metadata: Metadata = withOgImage('/defense-ledger', {
  title: 'Defense Ledger | Global Economic Indicators',
  description:
    'Eight-chapter epic on global military spending, alliances, arms trade, the arms industry, nuclear arsenals, active conflicts, and guns-vs-butter trade-offs. Live World Bank + SIPRI + FAS + UCDP data.',
  keywords:
    'military spending, defense budget, SIPRI, NATO 2% target, arms trade, arms industry, nuclear arsenal, active conflicts, guns vs butter, UCDP battle deaths',
  alternates: { canonical: '/defense-ledger' },
  openGraph: {
    type: 'article',
    title: 'Defense Ledger — global military spending in one scroll',
    description:
      'Superpower spending, NATO scorecard, arms trade flows, nuclear stockpiles, active conflicts. Live and curated data across eight chapters.',
  },
});

export default function DefenseLedgerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
