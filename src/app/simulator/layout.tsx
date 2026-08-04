import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Economic Simulator | Global Economic Indicators',
  description:
    'Model shocks to interest rates, inflation, exchange rates and GDP. Explore counter-factual scenarios grounded in historical data.',
  keywords:
    'economic simulator, scenario analysis, rate hike simulation, currency shock, GDP forecast, inflation model, counterfactual',
  alternates: { canonical: '/simulator' },
  openGraph: {
    type: 'website',
    title: 'Economic Simulator — model shocks to the global economy',
    description:
      'Rate hikes, currency crises, GDP shocks — all as scenarios you can steer.',
  },
};

export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
