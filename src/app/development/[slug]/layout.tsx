import type { Metadata } from 'next';
import { COUNTRY_SLUGS, COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG } from '../../utils/countryMappings';
import { HDR, HDR_DATA_YEAR, getIncomeGroup } from '../../services/developmentCurated';
import { withOgImage } from '../../lib/og';
import { countryProfileRobots } from '../../lib/indexing';
import { absoluteUrl } from '../../lib/site';
import JsonLd from '../../components/JsonLd';

export function generateStaticParams() {
  return Object.values(COUNTRY_KEY_TO_SLUG).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const key = COUNTRY_SLUGS[params.slug?.toLowerCase() ?? ''];
  const r = key ? HDR[key] : undefined;

  if (!key || !r) {
    return {
      title: 'Development Profile | Global Economic Indicators',
      robots: 'noindex',
    };
  }

  const name = COUNTRY_DISPLAY_NAMES[key];
  const canonical = `/development/${COUNTRY_KEY_TO_SLUG[key]}`;
  const group = getIncomeGroup(key);
  const title = `${name} Human Development: HDI, Poverty, Health, Education & SDGs`;
  const description = `${name} ranks ${r.hdiRank ?? 'n/a'} in the world on the UNDP Human Development Index (${r.hdi?.toFixed(3) ?? 'n/a'}, ${HDR_DATA_YEAR}). Life expectancy, schooling, income, poverty lines, gender gaps, demographics, SDG progress and peer comparisons.`;
  const trend = Object.entries(r.trend)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, v]) => v);

  return withOgImage(canonical, {
    title: `${title} | Global Economic Indicators`,
    description,
    robots: countryProfileRobots(COUNTRY_KEY_TO_SLUG[key]),
    keywords: `${name} human development index, ${name} HDI, ${name} poverty, ${name} life expectancy, ${name} SDG progress, ${name} development`,
    alternates: { canonical },
    openGraph: { type: 'article', title, description, url: canonical },
    twitter: { card: 'summary_large_image', title, description },
  }, {
    section: `${name} \u00b7 Development profile`,
    metric: `HDI ${r.hdi?.toFixed(3) ?? 'n/a'} \u00b7 rank ${r.hdiRank ?? 'n/a'}`,
    description: `Life expectancy ${r.lifeExpectancy?.toFixed(1) ?? 'n/a'} years. ${group ? `${group} economy.` : ''}`,
    series: trend,
    subject: 'chart',
  });
}

export default function DevelopmentProfileLayout({ children, params }: { children: React.ReactNode; params: { slug: string } }) {
  const key = COUNTRY_SLUGS[params.slug?.toLowerCase() ?? ''];
  const r = key ? HDR[key] : undefined;
  if (!key || !r) return children;

  const name = COUNTRY_DISPLAY_NAMES[key];
  const url = absoluteUrl(`/development/${COUNTRY_KEY_TO_SLUG[key]}`);
  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'Country',
      name,
      url,
      containedInPlace: { '@type': 'Place', name: 'World' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: `${name} human development indicators`,
      description: `UNDP Human Development Index and components for ${name}, 1990-${HDR_DATA_YEAR}, with World Bank poverty, health, education and demographic series.`,
      url,
      creator: [
        { '@type': 'Organization', name: 'United Nations Development Programme' },
        { '@type': 'Organization', name: 'World Bank' },
      ],
      temporalCoverage: `1990/${HDR_DATA_YEAR}`,
      spatialCoverage: { '@type': 'Country', name },
    },
  ];

  return (
    <>
      <JsonLd data={data} />
      {children}
    </>
  );
}
