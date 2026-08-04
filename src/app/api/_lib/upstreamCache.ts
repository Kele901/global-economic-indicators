// Small in-process memoisation layer for our upstream proxy routes
// (FRED, World Bank, Frankfurter, EIA). Wraps Next 14's unstable_cache
// so that repeated same-second requests for the same URL only hit the
// upstream once per Node process (per Vercel serverless instance),
// smoothing over the burst of concurrent requests that the ledger
// pages fire when they hydrate.
//
// This is a belt-and-braces layer on top of the CDN Cache-Control
// headers each route already sets. The CDN handles cross-region and
// cross-user reuse; unstable_cache handles same-instance reuse.

import { unstable_cache } from 'next/cache';

interface CacheOptions {
  /** Cache tag for programmatic revalidation (revalidateTag). */
  tag: string;
  /** TTL in seconds before the cache slot is considered stale. */
  revalidate: number;
}

/**
 * Wrap an async upstream fetch so its output is memoised keyed by
 * `key` (which should encode all params that matter — series id,
 * indicator, date range, etc).
 */
export function memoizeUpstream<T>(
  key: string,
  fetcher: () => Promise<T>,
  { tag, revalidate }: CacheOptions,
): Promise<T> {
  const wrapped = unstable_cache(fetcher, [key], {
    tags: [tag],
    revalidate,
  });
  return wrapped();
}
