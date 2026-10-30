import type { Metadata } from 'next';
import { SITE_NAME, absoluteUrl } from '../../lib/site';
import { withOgImage } from '../../lib/og';
import { GLOBAL_INCOME_CDF, GLOBAL_INCOME_YEAR } from '../../services/developmentCurated';

const title = `Where Does Your Income Stand in the World? Global Income Calculator | ${SITE_NAME}`;
const description =
  'Convert your household income to dollars a day at purchasing power parity and see where it ranks among 8 billion people, against the World Bank $3.00, $4.20 and $8.30 poverty lines. Uses the World Bank Poverty and Inequality Platform global distribution.';

export const metadata: Metadata = withOgImage('/development/where-do-you-stand', {
  title,
  description,
  keywords: ['global income calculator', 'how rich am I', 'global income percentile', 'purchasing power parity', 'poverty line', 'world income distribution'],
  alternates: { canonical: absoluteUrl('/development/where-do-you-stand') },
  openGraph: { title, description, url: absoluteUrl('/development/where-do-you-stand'), siteName: SITE_NAME, type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
}, {
  section: 'Development Ledger \u00b7 Calculator',
  metric: 'Where does your income stand?',
  description: `The world's income distribution, ${GLOBAL_INCOME_YEAR}, in 2021 PPP dollars a day.`,
  series: GLOBAL_INCOME_CDF.map((p) => p.shareBelow),
  subject: 'chart',
});

export default function WhereDoYouStandLayout({ children }: { children: React.ReactNode }) {
  return children;
}
