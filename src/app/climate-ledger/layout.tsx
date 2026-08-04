import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Climate Ledger | Global Economic Indicators',
  description:
    'Eight-chapter epic on greenhouse-gas emissions, energy mix, the coal pipeline, renewable transition, climate finance, air pollution, NDC targets, and climate disasters.',
  keywords:
    'CO2 emissions, methane, energy mix, coal plants, renewables, climate finance, NDC targets, PM2.5 air pollution, climate disasters, EM-DAT, GISTEMP',
  alternates: { canonical: '/climate-ledger' },
  openGraph: {
    type: 'article',
    title: 'Climate Ledger — emissions, transition, finance, disasters',
    description:
      'Live World Bank emissions and energy data, curated Global Energy Monitor coal pipeline, OECD DAC climate finance, EM-DAT disaster history.',
  },
};

export default function ClimateLedgerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
