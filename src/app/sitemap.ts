import type { MetadataRoute } from 'next';
import { SITE_URL } from './lib/site';
import { GUIDES } from './data/guides';
import { COUNTRY_KEY_TO_SLUG } from './utils/countryMappings';

type Freq = MetadataRoute.Sitemap[number]['changeFrequency'];

interface Route {
  path: string;
  changeFrequency: Freq;
  priority: number;
}

// Hub pages and the live dashboards that change most often.
const CORE: Route[] = [
  { path: '/', changeFrequency: 'daily', priority: 1.0 },
  { path: '/compare', changeFrequency: 'daily', priority: 0.9 },
  { path: '/global-heatmap', changeFrequency: 'daily', priority: 0.8 },
  { path: '/watchlist', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/reports', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/outlook', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/monetary-policy', changeFrequency: 'weekly', priority: 0.8 },
];

// Topic dashboards and the nine ledgers.
const TOPICS: Route[] = [
  { path: '/inflation', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/inflation-calculator', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/debt', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/technology', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/development', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/inequality', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/economic-cycles', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/currency-hierarchy', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/economic-gravity', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/trading-places', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/trade-network', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/cultural-capital', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/defense-ledger', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/climate-ledger', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/trade-ledger', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/migration-ledger', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/ai-ledger', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/health-ledger', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/energy-ledger', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/labor-ledger', changeFrequency: 'weekly', priority: 0.8 },
];

// Interactive tools.
const TOOLS: Route[] = [
  { path: '/simulator', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/correlation-lab', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/embed-builder', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/embed-gallery', changeFrequency: 'monthly', priority: 0.6 },
];

// Learning and reference.
const LEARN: Route[] = [
  { path: '/learn', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/guides', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/glossary', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/resources', changeFrequency: 'monthly', priority: 0.6 },
];

// Transparency and institutional pages.
const SITE: Route[] = [
  { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/methodology', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/data-sources', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/changelog', changeFrequency: 'weekly', priority: 0.5 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/disclaimer', changeFrequency: 'yearly', priority: 0.3 },
];

// /embed/[type] is intentionally excluded: those are iframe payloads, not pages.
export default function sitemap(): MetadataRoute.Sitemap {
  const guideRoutes: Route[] = GUIDES.map((g) => ({
    path: `/guides/${g.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const countryRoutes: Route[] = Object.values(COUNTRY_KEY_TO_SLUG).map((slug) => ({
    path: `/country/${slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const lastModified = new Date();

  return [...CORE, ...TOPICS, ...TOOLS, ...LEARN, ...SITE, ...guideRoutes, ...countryRoutes].map(
    (route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }),
  );
}
