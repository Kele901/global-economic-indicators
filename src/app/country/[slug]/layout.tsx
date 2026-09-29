import type { Metadata } from 'next';
import {
  COUNTRY_SLUGS,
  COUNTRY_DISPLAY_NAMES,
  COUNTRY_KEY_TO_SLUG,
} from '../../utils/countryMappings';
import { withOgImage } from '../../lib/og';

export function generateStaticParams() {
  return Object.values(COUNTRY_KEY_TO_SLUG).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const key = COUNTRY_SLUGS[params.slug?.toLowerCase() ?? ''];

  if (!key) {
    return {
      title: 'Country Profile | Global Economic Indicators',
      robots: 'noindex',
    };
  }

  const name = COUNTRY_DISPLAY_NAMES[key];
  const canonical = `/country/${COUNTRY_KEY_TO_SLUG[key]}`;
  const title = `${name} Economy: GDP, Inflation, Interest Rates & Debt`;
  const description = `Economic profile of ${name}. GDP growth, inflation, policy interest rates, unemployment, government debt, trade balance and 20 further indicators, charted from World Bank, IMF and FRED data.`;

  return withOgImage(canonical, {
    title: `${title} | Global Economic Indicators`,
    description,
    keywords: `${name} economy, ${name} GDP, ${name} inflation rate, ${name} interest rates, ${name} unemployment, ${name} government debt, ${name} economic indicators`,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }, { section: `${name} \u00b7 Country profile` });
}

export default function CountryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
