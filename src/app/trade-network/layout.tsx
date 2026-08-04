import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Global Trade Network | Global Economic Indicators',
  description:
    'Interactive network graph of bilateral trade flows across major economies. Explore export/import ties, dependency, and centrality.',
  keywords:
    'trade network, bilateral trade, export flows, import flows, trade centrality, trade dependency, global commerce, network graph',
  alternates: { canonical: '/trade-network' },
  openGraph: {
    type: 'website',
    title: 'Global Trade Network — bilateral flows visualised',
    description:
      'Force-directed graph of trade ties across major economies.',
  },
};

export default function TradeNetworkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
