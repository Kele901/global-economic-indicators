import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Economic Cycles | Global Economic Indicators',
  description: 'Explore historical business cycles, debt super-cycles, and financial crises with interactive timelines and maps. Analyze economic expansions, recessions, and recovery patterns across nations.',
};

export default function EconomicCyclesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
