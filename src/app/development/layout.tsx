import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Development Indicators | Global Economic Indicators',
  description:
    'Life expectancy, literacy, poverty, health spending, infrastructure and human-capital metrics across 30+ economies. Live World Bank data.',
  keywords:
    'development indicators, HDI, life expectancy, literacy, poverty rate, health spending, infrastructure, human capital, world bank development',
  alternates: { canonical: '/development' },
  openGraph: {
    type: 'website',
    title: 'Development Indicators — health, education, infrastructure',
    description:
      'A comprehensive development snapshot across 30+ economies drawn from live World Bank data.',
  },
};

export default function DevelopmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
