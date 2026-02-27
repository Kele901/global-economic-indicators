import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Global Economic Indicators',
  description: 'Learn about Global Economic Indicators — our mission, data sources, methodology, and the team behind the platform providing free access to economic data from the World Bank, IMF, FRED, and more.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
