'use client';

import { createContext, useEffect, useRef, useState, type ComponentType } from 'react';
import { SITE_NAME, SITE_URL, absoluteUrl } from '../lib/site';
import { stripSiteName, type CardContent } from '../lib/og';
import { findChartSurface, snapshotChart, type SnapshotHints } from '../lib/chartSnapshot';
import { captureVisual, findShareVisual, uploadVisual } from '../lib/visualCapture';
import {
  SHARE_NETWORKS,
  SHARE_NETWORK_LABEL,
  SHARE_ROUTE,
  SUBSTACK_URL,
  shareLandingPath,
  shareUrl,
  slugify,
  substackNote,
  type ShareNetwork,
} from '../lib/share';
import {
  FacebookIcon,
  LinkedInIcon,
  RedditIcon,
  SubstackIcon,
  WhatsAppIcon,
  XIcon,
} from './icons/social';

const ICONS: Record<ShareNetwork, ComponentType<{ size?: number; className?: string }>> = {
  x: XIcon,
  substack: SubstackIcon,
  reddit: RedditIcon,
  facebook: FacebookIcon,
  linkedin: LinkedInIcon,
  whatsapp: WhatsAppIcon,
};

/** True inside a ChartCard, which already renders its own share control. */
export const ShareScopeContext = createContext(false);

type Subject = 'chart' | 'dataset' | 'page';

interface Props {
  title?: string;
  url?: string;
  /** Omit to follow the `dark` class on <html>. */
  isDarkMode?: boolean;
  subject?: Subject;
  align?: 'left' | 'right';
  placement?: 'down' | 'up';
  size?: 'sm' | 'md';
  /** Hide the "Share" text and show only the icon. */
  iconOnly?: boolean;
  className?: string;
  /** Headline figure for the preview card, e.g. "Germany: 59% low-carbon electricity". */
  metric?: string;
  /** One-line context for the preview card. Pages default to their meta description. */
  description?: string;
  /** Small numeric series drawn as a sparkline on the card (downsampled to 40 points). */
  series?: readonly number[];
  /** Latest values and x range for the chart this control belongs to, shown on its card. */
  hints?: SnapshotHints;
}

type Mode = 'light' | 'dark' | 'auto';

const STYLES: Record<Mode, { trigger: string; panel: string; item: string; muted: string; divider: string }> = {
  light: {
    trigger: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
    panel: 'bg-white border-gray-200 text-gray-900',
    item: 'text-gray-700 hover:bg-gray-50',
    muted: 'text-gray-500',
    divider: 'border-gray-100',
  },
  dark: {
    trigger: 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700',
    panel: 'bg-gray-900 border-gray-700 text-gray-100',
    item: 'text-gray-200 hover:bg-gray-800',
    muted: 'text-gray-400',
    divider: 'border-gray-800',
  },
  auto: {
    trigger: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700',
    panel: 'bg-white border-gray-200 text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100',
    item: 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800',
    muted: 'text-gray-500 dark:text-gray-400',
    divider: 'border-gray-100 dark:border-gray-800',
  },
};

type CardExtras = Pick<CardContent, 'metric' | 'description' | 'series' | 'plot' | 'image'>;

const CAPTURE_TIMEOUT_MS = 6000;
const CAPTURE_REUSE_MS = 60_000;

function chartPlot(from: Element | null, title: string | undefined, subject: Subject, hints?: SnapshotHints) {
  if (subject === 'page' || typeof document === 'undefined') return undefined;
  try {
    return snapshotChart(findChartSurface(from, title ? slugify(title) : undefined), hints);
  } catch {
    return undefined;
  }
}

/** Photographs and uploads the visual; null on any failure or after the time limit. */
async function visualImage(from: Element | null, title: string | undefined): Promise<string | null> {
  const el = findShareVisual(from, title ? slugify(title) : undefined);
  if (!el) return null;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), CAPTURE_TIMEOUT_MS);
  try {
    const shot = await Promise.race([
      captureVisual(el),
      new Promise<null>(resolve => controller.signal.addEventListener('abort', () => resolve(null))),
    ]);
    return shot ? await uploadVisual(shot, controller.signal) : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

// Opened synchronously inside the click so popup blockers allow it, then
// pointed at the network once the preview is ready.
function openPendingWindow(): Window | null {
  const win = window.open('', '_blank');
  if (!win) return null;
  try {
    win.opener = null;
    win.document.title = 'Preparing preview\u2026';
    win.document.body.style.cssText = 'margin:0;font:15px system-ui,sans-serif;color:#475569;display:flex;align-items:center;justify-content:center;height:100vh';
    win.document.body.textContent = 'Preparing preview\u2026';
  } catch {
    // Some browsers restrict about:blank documents; the window still navigates.
  }
  return win;
}

function sendTo(win: Window | null, href: string) {
  if (win && !win.closed) win.location.replace(href);
  else window.open(href, '_blank', 'noopener,noreferrer');
}

function isSiteOrigin(origin: string): boolean {
  if (origin === window.location.origin) return true;
  try {
    return origin === new URL(SITE_URL).origin;
  } catch {
    return false;
  }
}

// Networks share `landing` (the /share route, which carries the preview card);
// Copy link keeps the clean page URL.
function resolveTarget(title: string | undefined, url: string | undefined, subject: Subject, extras: CardExtras) {
  const shareTitle = title || (typeof document !== 'undefined' && document.title) || SITE_NAME;
  const pageDescription =
    subject === 'page' && typeof document !== 'undefined'
      ? document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content
      : undefined;
  const card: CardContent = {
    ...extras,
    title: stripSiteName(shareTitle),
    description: extras.description ?? pageDescription,
    subject,
  };

  if (url) {
    try {
      const u = new URL(url, window.location.href);
      const isShareRoute = u.pathname === SHARE_ROUTE || u.pathname.startsWith(`${SHARE_ROUTE}/`);
      if (!isSiteOrigin(u.origin) || isShareRoute) return { title: shareTitle, url, landing: url };
      const landing = absoluteUrl(shareLandingPath({ path: u.pathname, search: u.search, hash: u.hash }, card));
      return { title: shareTitle, url, landing };
    } catch {
      return { title: shareTitle, url, landing: url };
    }
  }

  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const slug = title && subject !== 'page' ? slugify(title) : '';
  const anchor = slug && typeof document !== 'undefined' && document.getElementById(slug) ? `#${slug}` : '';
  return {
    title: shareTitle,
    url: `${absoluteUrl(path)}${anchor}`,
    landing: absoluteUrl(shareLandingPath({ path, search, hash: anchor }, card)),
  };
}

export default function SocialShareMenu({
  title,
  url,
  isDarkMode,
  subject = 'chart',
  align = 'right',
  placement = 'down',
  size = 'sm',
  iconOnly = false,
  className = '',
  metric,
  description,
  series,
  hints,
}: Props) {
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const captured = useRef<{ id: Promise<string | null>; at: number } | null>(null);
  const mode: Mode = isDarkMode === undefined ? 'auto' : isDarkMode ? 'dark' : 'light';
  const s = STYLES[mode];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 1800);
    return () => window.clearTimeout(t);
  }, [notice]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const startCapture = () => {
    const cached = captured.current;
    if (cached && Date.now() - cached.at < CAPTURE_REUSE_MS) return cached.id;
    const id = visualImage(ref.current, title);
    captured.current = { id, at: Date.now() };
    id.then(result => { if (!result && captured.current?.id === id) captured.current = null; });
    return id;
  };

  // Photographing starts when the menu opens so it overlaps the user picking a network.
  const toggleMenu = () => {
    const opening = !open;
    setOpen(opening);
    if (opening && subject !== 'page' && !chartPlot(ref.current, title, subject, hints)) void startCapture();
  };

  const cardImage = async (): Promise<string | undefined> => {
    if (subject === 'page') return undefined;
    const early = captured.current;
    const id = await startCapture();
    // An early capture can lose to a page that is still loading; retry it once.
    if (id || !early) return id ?? undefined;
    return (await startCapture()) ?? undefined;
  };

  const share = async (network: ShareNetwork) => {
    if (busy) return;
    const plot = chartPlot(ref.current, title, subject, hints);
    const win = openPendingWindow();
    setBusy(true);
    try {
      const image = plot ? undefined : await cardImage();
      const target = resolveTarget(title, url, subject, { metric, description, series, plot, image });
      if (network === 'substack') {
        const ok = await copy(substackNote(target.title, target.landing));
        sendTo(win, SUBSTACK_URL);
        setNotice(ok ? 'Note copied. Paste it into Substack.' : 'Copy failed. Share the page link instead.');
        return;
      }
      sendTo(win, shareUrl(network, target.title, target.landing));
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    const ok = await copy(resolveTarget(title, url, subject, { metric, description, series }).url);
    setNotice(ok ? 'Link copied' : 'Copy failed');
  };

  const sizeCls = size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs';
  const subjectWord = subject === 'dataset' ? 'dataset' : subject === 'page' ? 'page' : 'chart';

  return (
    <div ref={ref} data-share-exclude className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Share this ${subjectWord}`}
        title={`Share this ${subjectWord}`}
        className={`${sizeCls} inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${s.trigger}`}
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {!iconOnly && <span>Share</span>}
      </button>
      {open && (
        <div
          role="menu"
          aria-label={`Share this ${subjectWord}`}
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} ${placement === 'up' ? 'bottom-full mb-1' : 'mt-1'} w-52 z-[60] rounded-md border shadow-lg py-1 ${s.panel}`}
        >
          {SHARE_NETWORKS.map(network => {
            const Icon = ICONS[network];
            const label = SHARE_NETWORK_LABEL[network];
            return (
              <button
                key={network}
                type="button"
                role="menuitem"
                onClick={() => share(network)}
                disabled={busy}
                aria-label={`Share this ${subjectWord} on ${label}`}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left disabled:opacity-60 disabled:cursor-wait ${s.item}`}
              >
                <Icon size={16} className="shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
          <button
            type="button"
            role="menuitem"
            onClick={copyLink}
            aria-label={`Copy link to this ${subjectWord}`}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left border-t ${s.divider} ${s.item}`}
          >
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Copy link</span>
          </button>
          {(busy || notice) && (
            <p role="status" className={`px-3 pt-1 pb-1.5 text-[11px] ${s.muted}`}>{busy ? 'Preparing preview\u2026' : notice}</p>
          )}
        </div>
      )}
    </div>
  );
}
