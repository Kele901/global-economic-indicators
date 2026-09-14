import type { Metadata } from 'next';
import { SITE_NAME, absoluteUrl } from '../lib/site';

const title = `The Inequality Ledger | ${SITE_NAME}`;
const description =
  'Eight chapters on the distribution of income and wealth: live World Bank Gini across 47 countries, Piketty\'s r > g, the Kuznets curve, top income and wealth shares since 1910, capital/income ratios since 1700, inheritance flows and a century of top marginal tax rates.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'income inequality',
    'wealth inequality',
    'Gini coefficient',
    'Piketty',
    'r greater than g',
    'capital income ratio',
    'top 1 percent income share',
    'Kuznets curve',
    'elephant curve',
    'top marginal tax rate',
    'World Inequality Database',
  ],
  alternates: { canonical: absoluteUrl('/inequality') },
  openGraph: {
    title,
    description,
    url: absoluteUrl('/inequality'),
    siteName: SITE_NAME,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export const revalidate = 3600;

export default function InequalityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
