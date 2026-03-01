import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://globaleconindicators.info';

  const routes = [
    { path: '/', changeFrequency: 'daily' as const, priority: 1.0 },
    { path: '/compare', changeFrequency: 'daily' as const, priority: 0.9 },
    { path: '/technology', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/inflation', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/inflation-calculator', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/economic-cycles', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/currency-hierarchy', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/economic-gravity', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/trading-places', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/about', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/methodology', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/guides/understanding-interest-rates', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/guides/global-trade-explained', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/guides/inflation-guide', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/guides/technology-innovation-metrics', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/guides/reading-economic-data', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/guides/economic-cycles-explained', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/guides/currencies-and-exchange-rates', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/guides/gdp-and-national-accounts', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/guides/government-debt-explained', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/guides/emerging-vs-developed-economies', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/guides/how-central-banks-work', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/guides/understanding-employment-data', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/guides/digital-economy-and-ai', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/guides/glossary', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/disclaimer', changeFrequency: 'yearly' as const, priority: 0.3 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
