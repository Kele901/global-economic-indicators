import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inequality | Global Economic Indicators',
  description: 'Explore income inequality, wealth concentration, the Kuznets curve, Piketty\'s r > g framework, global Gini coefficients, tax policy, and 250 years of inequality dynamics across 30+ countries.',
};

export default function InequalityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
