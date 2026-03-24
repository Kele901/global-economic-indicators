import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cultural Capital Dashboard | Global Economic Indicators',
  description: 'Compare cultural capital across countries with 25+ metrics. Explore UNESCO heritage, intangible cultural heritage, music and gaming revenue, streaming originals, book publishing, IP trade flows, library density, performing arts, language diversity, endangered languages, cultural participation, and more.',
  keywords: 'cultural capital, UNESCO heritage sites, intangible heritage, creative economy, cultural tourism, soft power, museums, film production, music revenue, gaming revenue, streaming originals, book publishing, library density, performing arts, language diversity, endangered languages, IP trade, cultural participation',
};

export default function CulturalCapitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
