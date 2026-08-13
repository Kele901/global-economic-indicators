import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Energy Ledger | Global Economic Indicators',
  description:
    'Electricity generation mix, battery storage build-out, LNG flows, nuclear reactor status, capacity factors, hydrocarbon reserves and energy intensity — curated IEA/BNEF/IGU/IAEA/EIA snapshots.',
  keywords:
    'energy mix, electricity generation, battery storage, BNEF, LNG, nuclear power, IAEA, IEA, EIA, oil reserves, gas reserves, energy intensity',
  alternates: { canonical: '/energy-ledger' },
  openGraph: {
    type: 'article',
    title: 'The Energy Ledger — mix, storage, flows, reserves',
    description:
      'Eight chapters on the global energy system: electricity mix, battery storage, LNG flows, nuclear status, capacity factors, reserves, intensity.',
  },
};

export default function EnergyLedgerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
