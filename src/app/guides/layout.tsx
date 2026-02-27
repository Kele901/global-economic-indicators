import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Economic Guides | Global Economic Indicators',
  description: 'Educational guides on interest rates, inflation, GDP, global trade, currencies, government debt, central banks, employment, technology innovation, AI, economic cycles, and a glossary of 55+ terms. Free resources for students, researchers, and professionals.',
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
