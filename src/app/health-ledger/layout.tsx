import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Health Ledger | Global Economic Indicators',
  description:
    'Global health spending, life expectancy, pandemic preparedness, pharma R&D concentration, obesity/undernutrition dual burden, mental-health treatment gap and disease-burden shift — live WB + curated WHO/IHME/JHU snapshots.',
  keywords:
    'health spending, WHO GHED, life expectancy, pandemic preparedness, JEE, GHS index, pharma R&D, obesity, mental health, disease burden, GBD',
  alternates: { canonical: '/health-ledger' },
  openGraph: {
    type: 'article',
    title: 'The Health Ledger — spending, outcomes, resilience',
    description:
      'Eight chapters on global health: spending vs outcomes, life-expectancy divergence, pandemic preparedness, pharma industry, dual burden, mental health, disease burden shift.',
  },
};

export default function HealthLedgerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
