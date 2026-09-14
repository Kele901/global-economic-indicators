// Canonical site identity. Every place that needs an absolute URL — metadataBase,
// the sitemap, robots, OG tags, citations — reads from here so they cannot drift
// apart again. Override with NEXT_PUBLIC_SITE_URL for preview deployments.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://globaleconindicators.info'
).replace(/\/$/, '');

export const SITE_NAME = 'Global Economic Indicators';

export const SITE_TAGLINE =
  'Interest rates, inflation, trade, debt and energy across the world economy.';

export const SITE_DESCRIPTION =
  'Comprehensive analysis of global economic indicators including interest rates, employment, GDP, inflation, and debt across major economies. Data sourced from the World Bank, IMF, OECD, FRED and BIS.';

// Used by the contact page when no hosted form endpoint is configured.
export const CONTACT_EMAIL = 'hello@globaleconindicators.info';

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
