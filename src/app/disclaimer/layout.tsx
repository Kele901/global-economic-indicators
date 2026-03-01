import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer | Global Economic Indicators',
  description: 'Disclaimer for Global Economic Indicators. Important information about data accuracy, limitations, and the educational nature of our economic data platform.',
};

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
