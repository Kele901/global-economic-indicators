import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Trade Ledger | Global Economic Indicators',
  description:
    'Eight-chapter epic on global trade — exports, imports, current-account balances, openness, tariff walls, freight shipping indices, regional trade agreements, supply-chain concentration, and 2018-2025 trade-war frictions. Live World Bank + curated WTO / PIIE / USGS / SEMI data.',
  keywords:
    'trade ledger, exports imports GDP, current account balance, WTO tariffs, US China trade war, RCEP CPTPP USMCA, Baltic Dry Index, container shipping, supply chain concentration, rare earths, semiconductors',
  alternates: { canonical: '/trade-ledger' },
  openGraph: {
    type: 'article',
    title: 'Trade Ledger — global trade in one scroll',
    description:
      'The global bazaar in eight chapters: exports and balances, openness, tariff walls, freight, FTAs, supply-chain concentration, trade wars. Live and curated data.',
  },
};

export default function TradeLedgerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
