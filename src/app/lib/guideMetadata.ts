import type { Metadata } from 'next';
import { getGuide } from '../data/guides';
import { SITE_NAME } from './site';
import { withOgImage } from './og';

// Each guide folder holds a four-line layout.tsx that calls this, so guide SEO
// copy stays in the registry rather than being duplicated per route.
export function guideMetadata(slug: string): Metadata {
  const guide = getGuide(slug);

  if (!guide) {
    return { title: `Economic Guides | ${SITE_NAME}` };
  }

  const canonical = `/guides/${guide.slug}`;

  return withOgImage(canonical, {
    title: `${guide.title} | ${SITE_NAME}`,
    description: guide.blurb,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title: guide.title,
      description: guide.blurb,
      url: canonical,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.blurb,
    },
  }, { section: 'Guide' });
}
