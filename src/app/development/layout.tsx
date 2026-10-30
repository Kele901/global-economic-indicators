import type { Metadata } from 'next';
import { withOgImage } from '../lib/og';
import { absoluteUrl } from '../lib/site';
import { DEV_CURATED_LAST_UPDATED, HDR, HDR_DATA_YEAR } from '../services/developmentCurated';
import JsonLd from '../components/JsonLd';

export const revalidate = 3600;

const topHdi = Object.values(HDR)
  .map((r) => r?.hdi)
  .filter((v): v is number => v != null)
  .sort((a, b) => b - a);

export const metadata: Metadata = withOgImage(
  '/development',
  {
    title: 'Development Ledger: Human Development, Poverty & the SDGs | Global Economic Indicators',
    description:
      'The official UNDP Human Development Index and its inequality, gender and planetary adjustments, World Bank poverty at $3.00, $4.20 and $8.30 a day, human capital, health, demographics, SDG progress and an animated 60-year development chart for 47 economies, with a country profile for each.',
    keywords:
      'human development index, HDI 2025, IHDI, gender inequality index, poverty $3.00 a day, prosperity gap, human capital index, learning poverty, SDG tracker, Gapminder, middle-income trap, demographic dividend, development ledger',
    alternates: { canonical: '/development' },
    openGraph: {
      type: 'article',
      title: 'The Development Ledger: how far, how fast, and for whom',
      description:
        'Thirteen chapters on human development across 47 economies: official HDI, poverty, human capital, health, gender, structural change, demographics, sustainability, and a build-your-own index.',
    },
  },
  {
    section: 'Development Ledger',
    metric: `HDI ${HDR_DATA_YEAR}: ${topHdi[0]?.toFixed(3)} to ${topHdi[topHdi.length - 1]?.toFixed(3)}`,
    description: '47 economies, 13 chapters, official UNDP and World Bank data.',
    series: topHdi.slice().reverse(),
    subject: 'chart',
  }
);

const DATASET = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Development Ledger: human development indicators for 47 economies',
  description:
    'UNDP Human Development Report indices (HDI, IHDI, GDI, GII, PHDI) with trends since 1990, joined with live World Bank poverty, human capital, health, gender, demographic and structural indicators.',
  url: absoluteUrl('/development'),
  dateModified: DEV_CURATED_LAST_UPDATED,
  isAccessibleForFree: true,
  creator: { '@type': 'Organization', name: 'Global Economic Indicators' },
  spatialCoverage: { '@type': 'Place', name: 'World (47 countries)' },
  temporalCoverage: `1960/${DEV_CURATED_LAST_UPDATED.slice(0, 4)}`,
  variableMeasured: [
    'Human Development Index',
    'Inequality-adjusted HDI',
    'Gender Inequality Index',
    'Planetary pressures-adjusted HDI',
    'Poverty headcount at $3.00 a day',
    'Prosperity gap',
    'Human Capital Index',
    'Under-5 mortality',
    'Life expectancy',
  ],
};

export default function DevelopmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={DATASET} />
      {children}
    </>
  );
}
