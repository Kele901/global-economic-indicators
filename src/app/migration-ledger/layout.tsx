import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Migration Ledger | Global Economic Indicators',
  description:
    'Eight-chapter epic on global migration — remittances, refugee flows, corridors, migrant stocks, EU asylum, brain drain/gain, diaspora contributions, and border safety. Live World Bank + curated UNHCR / KNOMAD / UN DESA / IOM data.',
  keywords:
    'migration ledger, remittances, refugee flows, UNHCR, migrant corridors, EU asylum, brain drain, brain gain, diaspora, Missing Migrants Project, IOM, KNOMAD',
  alternates: { canonical: '/migration-ledger' },
  openGraph: {
    type: 'article',
    title: 'Migration Ledger — global people flows in one scroll',
    description:
      'The world&apos;s people flows in eight chapters: remittances, refugees, corridors, migrant stocks, asylum, brain migration, diaspora, and border safety.',
  },
};

export default function MigrationLedgerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
