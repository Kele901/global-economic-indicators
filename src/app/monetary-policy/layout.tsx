import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Monetary Policy Tracker | Global Economic Indicators',
  description:
    'Central-bank policy rates, long-term yields and term-spread signals for the Fed, ECB, BoE, BoJ, PBoC and more. Live FRED + BIS data.',
  keywords:
    'monetary policy, central bank, Fed funds rate, ECB rate, BoE bank rate, term spread, yield curve, policy rate, long-term yield',
  alternates: { canonical: '/monetary-policy' },
  openGraph: {
    type: 'article',
    title: 'Monetary Policy Tracker — every major central bank in one view',
    description:
      'Policy rates, long-term yields, real policy rates and term-spread signals from live FRED + BIS data.',
  },
};

export default function MonetaryPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
