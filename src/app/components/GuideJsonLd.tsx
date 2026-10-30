import JsonLd from './JsonLd';
import { getGuide } from '../data/guides';
import { SITE_NAME, absoluteUrl, PUBLISHER_JSONLD } from '../lib/site';

export default function GuideJsonLd({ slug }: { slug: string }) {
  const guide = getGuide(slug);
  if (!guide) return null;
  const url = absoluteUrl(`/guides/${guide.slug}`);

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: guide.title,
        description: guide.blurb,
        url,
        mainEntityOfPage: url,
        datePublished: guide.published,
        dateModified: guide.updated,
        author: { '@type': 'Organization', name: `${SITE_NAME} editorial team`, url: absoluteUrl('/about') },
        publisher: PUBLISHER_JSONLD,
        articleSection: guide.topic,
        timeRequired: `PT${guide.minutes}M`,
        educationalLevel: guide.level,
        inLanguage: 'en',
      }}
    />
  );
}
