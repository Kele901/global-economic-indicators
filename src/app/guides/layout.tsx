import type { Metadata } from 'next';
import { GUIDES } from '../data/guides';

export const metadata: Metadata = {
  title: 'Economic Guides | Global Economic Indicators',
  description: `${GUIDES.length} free guides on interest rates, inflation, GDP, global trade, currencies, government debt, central banks, employment, technology and AI, business and market cycles, and economic forecasting. Written for students, researchers and professionals.`,
  alternates: { canonical: '/guides' },
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
