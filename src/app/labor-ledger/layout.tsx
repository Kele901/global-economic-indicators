import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Labor Ledger | Global Economic Indicators',
  description:
    'Wages, unions, informal work, working-age demographic cliff, AI displacement risk, gender labour-force gap and youth unemployment — live WB + curated ILO / OECD / UN DESA snapshots.',
  keywords:
    'wages, union density, collective bargaining, informal employment, demographic cliff, AI displacement, OECD, ILO, labour force, gender gap, youth unemployment',
  alternates: { canonical: '/labor-ledger' },
  openGraph: {
    type: 'article',
    title: 'The Labor Ledger — wages, unions, demographics, AI',
    description:
      'Eight chapters on the global labour market: wages, unions, informal work, working-age trajectory, AI risk, gender gap, youth unemployment.',
  },
};

export default function LaborLedgerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
