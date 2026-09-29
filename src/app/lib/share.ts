import { SITE_NAME } from './site';
import { appendCardParams, cardFromParams, type CardContent } from './og';

export type ShareNetwork = 'x' | 'substack' | 'reddit' | 'facebook' | 'linkedin' | 'whatsapp';

export const SHARE_NETWORK_LABEL: Record<ShareNetwork, string> = {
  x: 'X (Twitter)',
  substack: 'Substack',
  reddit: 'Reddit',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
};

export const SHARE_NETWORKS: ShareNetwork[] = ['x', 'substack', 'reddit', 'facebook', 'linkedin', 'whatsapp'];

export const SUBSTACK_URL = 'https://substack.com/';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function shareText(title: string): string {
  const clean = title.replace(/\s*[|\u2014-]\s*Global Economic Indicators\s*$/i, '').trim();
  return clean && clean !== SITE_NAME ? `${clean} \u2014 ${SITE_NAME}` : SITE_NAME;
}

// Substack has no share-intent endpoint, so it is handled as clipboard + open.
export function shareUrl(network: Exclude<ShareNetwork, 'substack'>, title: string, url: string): string {
  const text = encodeURIComponent(shareText(title));
  const u = encodeURIComponent(url);
  switch (network) {
    case 'x':
      return `https://twitter.com/intent/tweet?text=${text}&url=${u}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case 'reddit':
      return `https://www.reddit.com/submit?url=${u}&title=${text}`;
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(`${shareText(title)} ${url}`)}`;
  }
}

export function substackNote(title: string, url: string): string {
  return `${shareText(title)}\n${url}`;
}

// Share landing route. Crawlers ignore #anchors and read og:image from the
// exact URL shared, so charts are shared as /share/<page path>?c=<anchor>&t=...
// which serves chart-specific tags and forwards people to /<page path>#<anchor>.

export const SHARE_ROUTE = '/share';

const SHARE_KEYS = { anchor: 'c', query: 'q' } as const;
const MAX_SEGMENTS = 6;
const MAX_QUERY = 300;
const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._~-]{0,79}$/;
const ANCHOR = /^[a-z0-9][a-z0-9-]{0,79}$/;

export interface ShareTarget {
  /** Site-relative pathname, e.g. "/energy-ledger". */
  path: string;
  search?: string;
  hash?: string;
}

/** Only plain same-site paths survive; anything else collapses to "/". */
export function safeSharePath(segments: readonly string[] | undefined): string {
  if (!segments?.length) return '/';
  if (segments.length > MAX_SEGMENTS || segments[0] === SHARE_ROUTE.slice(1)) return '/';
  return segments.every(s => SEGMENT.test(s)) ? `/${segments.join('/')}` : '/';
}

export function safeAnchor(value: unknown): string {
  if (typeof value !== 'string') return '';
  const v = value.replace(/^#/, '');
  return ANCHOR.test(v) ? v : '';
}

export function safeQuery(value: unknown): string {
  if (typeof value !== 'string' || value.length > MAX_QUERY * 2) return '';
  const out = new URLSearchParams(value.replace(/^\?/, '')).toString();
  return out.length <= MAX_QUERY ? out : '';
}

export function shareLandingPath(target: ShareTarget, card: CardContent = {}): string {
  const segments = target.path.split('/').filter(Boolean);
  const params = new URLSearchParams();
  appendCardParams(params, card, ['title', 'metric', 'description', 'subject', 'series']);
  const anchor = safeAnchor(target.hash);
  if (anchor) params.set(SHARE_KEYS.anchor, anchor);
  const query = safeQuery(target.search);
  if (query) params.set(SHARE_KEYS.query, query);
  const qs = params.toString();
  const path = segments.length ? `${SHARE_ROUTE}/${segments.join('/')}` : SHARE_ROUTE;
  return qs ? `${path}?${qs}` : path;
}

export function parseShareRequest(segments: readonly string[] | undefined, get: (key: string) => string | undefined) {
  const path = safeSharePath(segments);
  const anchor = safeAnchor(get(SHARE_KEYS.anchor));
  const query = safeQuery(get(SHARE_KEYS.query));
  // The section label is derived from the path server-side, never taken from the URL.
  const card = { ...cardFromParams(get), section: '' };
  return {
    path,
    anchor,
    query,
    card,
    /** Where people are forwarded. Always site-relative. */
    target: `${path}${query ? `?${query}` : ''}${anchor ? `#${anchor}` : ''}`,
    /** Normalised form of the requested share URL, for og:url. */
    landing: shareLandingPath({ path, search: query, hash: anchor }, card),
  };
}
