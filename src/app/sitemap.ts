import type { MetadataRoute } from 'next';
import { SITE_URL } from './lib/site';
import { GUIDES } from './data/guides';
import { INSIGHTS } from './data/insights';
import { COUNTRY_KEY_TO_SLUG } from './utils/countryMappings';
import { isCountryIndexed } from './lib/indexing';

type Freq = MetadataRoute.Sitemap[number]['changeFrequency'];

interface Route {
  path: string;
  changeFrequency: Freq;
  priority: number;
  lastModified?: string;
}

// Bump the matching date when a section's written content or curated data
// changes. Only CORE, which renders live API data, uses the build time.
const TOPICS_UPDATED = '2026-10-30';
const TOOLS_UPDATED = '2026-10-01';
const LEARN_UPDATED = '2026-10-30';
const SITE_UPDATED = '2026-10-30';

// Hub pages and the live dashboards that change most often.
const CORE: Route[] = [
  { path: '/', changeFrequency: 'daily', priority: 1.0 },
  { path: '/compare', changeFrequency: 'daily', priority: 0.9 },
  { path: '/global-heatmap', changeFrequency: 'daily', priority: 0.8 },
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
  { path: '/development/where-do-you-stand', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/inequality', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/economic-cycles', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/currency-hierarchy', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/economic-gravity', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/trading-places', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/trade-network', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/cultural-capital', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/politics-ledger', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/politics-ledger/match', changeFrequency: 'monthly', priority: 0.6 },
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
  { path: '/editorial-policy', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/data-sources', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/changelog', changeFrequency: 'weekly', priority: 0.5 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/disclaimer', changeFrequency: 'yearly', priority: 0.3 },
];

const dated = (routes: Route[], lastModified: string): Route[] =>
  routes.map((r) => ({ ...r, lastModified: r.lastModified ?? lastModified }));

// /embed/[type] is intentionally excluded: those are iframe payloads, not pages.
// Tool-only pages (watchlist, embed builder and gallery) carry little text and
// are left out too; they stay reachable from the navigation.
export default function sitemap(): MetadataRoute.Sitemap {
  const guideRoutes: Route[] = GUIDES.map((g) => ({
    path: `/guides/${g.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
    lastModified: g.updated,
  }));

  const insightRoutes: Route[] = INSIGHTS.map((a) => ({
    path: `/insights/${a.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
    lastModified: a.updated ?? a.date,
  }));

  const indexedSlugs = Object.values(COUNTRY_KEY_TO_SLUG).filter(isCountryIndexed);
  const profileRoutes: Route[] = indexedSlugs.flatMap((slug) => [
    { path: `/country/${slug}`, changeFrequency: 'weekly' as Freq, priority: 0.7 },
    { path: `/politics-ledger/${slug}`, changeFrequency: 'monthly' as Freq, priority: 0.6 },
    { path: `/development/${slug}`, changeFrequency: 'monthly' as Freq, priority: 0.6 },
  ]);

  const buildTime = new Date().toISOString();

  return [
    ...dated(CORE, buildTime),
    ...dated(TOPICS, TOPICS_UPDATED),
    ...dated(TOOLS, TOOLS_UPDATED),
    ...dated(LEARN, LEARN_UPDATED),
    ...dated(SITE, SITE_UPDATED),
    ...guideRoutes,
    ...dated([{ path: '/insights', changeFrequency: 'weekly', priority: 0.8, lastModified: INSIGHTS[0]?.date }], SITE_UPDATED),
    ...insightRoutes,
    ...dated(profileRoutes, TOPICS_UPDATED),
  ].map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
