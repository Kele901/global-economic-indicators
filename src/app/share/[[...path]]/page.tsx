import type { Metadata } from 'next';
import { SITE_NAME, SITE_TAGLINE, absoluteUrl } from '../../lib/site';
import { OG_SIZE, ogImagePath, sectionLabel } from '../../lib/og';
import { parseShareRequest } from '../../lib/share';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_SLUGS } from '../../utils/countryMappings';
import ShareRedirect from '../ShareRedirect';

interface Props {
  params: { path?: string[] };
  searchParams: Record<string, string | string[] | undefined>;
}

function resolve({ params, searchParams }: Props) {
  const req = parseShareRequest(params.path, key => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  });
  const [first, second] = req.path.split('/').filter(Boolean);
  const country = first === 'country' && second ? COUNTRY_SLUGS[second.toLowerCase()] : undefined;
  const countryName = country ? COUNTRY_DISPLAY_NAMES[country] : '';
  const section = countryName ? `${countryName} \u00b7 Country profile` : sectionLabel(req.path);
  const place = countryName ? `${countryName} country profile` : section;
  const isPage = req.card.subject === 'page' || !req.anchor;
  const title = req.card.title || (req.path === '/' ? SITE_NAME : place);
  const description =
    [req.card.metric, req.card.description].filter(Boolean).join(' \u2014 ') ||
    (isPage
      ? `${place} on ${SITE_NAME}. ${SITE_TAGLINE}`
      : `Interactive chart from the ${place} on ${SITE_NAME}.`);
  return { ...req, section, title, description, isPage };
}

export function generateMetadata(props: Props): Metadata {
  const r = resolve(props);
  const image = ogImagePath({ ...r.card, title: r.title, section: r.section });
  return {
    title: `${r.title} | ${SITE_NAME}`,
    description: r.description,
    robots: { index: false, follow: true },
    alternates: { canonical: r.path },
    openGraph: {
      type: 'article',
      siteName: SITE_NAME,
      // Self-referencing: Facebook re-scrapes og:url when it differs, which
      // would land on the target page's generic card.
      url: r.landing,
      title: r.title,
      description: r.description,
      images: [{ url: image, ...OG_SIZE, alt: r.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: r.title,
      description: r.description,
      images: [image],
    },
  };
}

export default function SharePage(props: Props) {
  const r = resolve(props);
  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <ShareRedirect href={r.target} />
      <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">{r.section}</p>
      <h1 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">{r.title}</h1>
      {r.card.metric && <p className="mt-2 text-gray-700 dark:text-gray-300">{r.card.metric}</p>}
      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        Opening the {r.isPage ? 'page' : 'chart'}&hellip;{' '}
        <a href={r.target} className="text-blue-600 dark:text-blue-400 hover:underline">
          Continue to {absoluteUrl(r.path).replace(/^https?:\/\//, '')}
        </a>
      </p>
    </div>
  );
}
