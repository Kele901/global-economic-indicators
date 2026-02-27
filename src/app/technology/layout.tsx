import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Technology & Innovation | Global Economic Indicators',
  description: 'Compare R&D spending, patent applications, high-tech exports, AI development, venture capital, digital economy metrics, and innovation rankings across 30+ countries worldwide.',
};

export default function TechnologyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
