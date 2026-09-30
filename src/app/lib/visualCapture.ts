import { toSvg } from 'html-to-image';

// Photographs the visual a share control belongs to, for visuals the chart
// snapshot cannot redraw (maps, tables, tiles, heatmaps, hand-drawn SVG).
// Browser-only; every failure resolves to null so sharing carries on without it.

const SHARE_TRIGGER = 'button[aria-haspopup="menu"][aria-label^="Share this"]';
const EXCLUDE = '[data-share-exclude], [role="menu"], .recharts-tooltip-wrapper';
const MAX_ANCESTORS = 8;
const MIN_WIDTH = 240;
const MIN_HEIGHT = 100;
/** Taller visuals are cropped from the top so they stay legible inside a 1200x630 card. */
const MAX_ASPECT = 1.2;
const OUTPUT_WIDTH = 1200;
export const MAX_UPLOAD_BYTES = 1.5 * 1024 * 1024;

// 1x1 transparent GIF, drawn in place of cross-origin images that cannot be inlined.
const PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function isVisual(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.width >= MIN_WIDTH && r.height >= MIN_HEIGHT;
}

function holdsOtherShare(el: Element, own: Element | null): boolean {
  return Array.from(el.querySelectorAll(SHARE_TRIGGER)).some(b => b !== own);
}

/**
 * The element a share control belongs to: the anchor target it sits in, else the
 * largest ancestor that holds no other share control. Climbing stops at <main>
 * and at anything more than two screens tall, which is a page section, not a visual.
 */
export function findShareVisual(from: Element | null, anchorId?: string): HTMLElement | null {
  if (!from) return null;
  const own = from.querySelector(SHARE_TRIGGER);
  const tallest = window.innerHeight * 2.5;
  const anchored = anchorId ? document.getElementById(anchorId) : null;
  if (anchored && anchored.contains(from) && isVisual(anchored) && anchored.getBoundingClientRect().height <= tallest) return anchored;

  let best: HTMLElement | null = null;
  let el = from.parentElement;
  for (let depth = 0; el && depth < MAX_ANCESTORS; depth++, el = el.parentElement) {
    if (el === document.body || el.tagName === 'MAIN' || el.tagName === 'HEADER' || el.tagName === 'FOOTER' || el.tagName === 'NAV') break;
    if (holdsOtherShare(el, own)) break;
    if (el.getBoundingClientRect().height > tallest) break;
    if (isVisual(el)) best = el;
  }
  return best;
}

function backgroundOf(el: HTMLElement): string {
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    const bg = getComputedStyle(node).backgroundColor;
    if (bg && bg !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(bg)) return bg;
  }
  return document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff';
}

// html-to-image's own canvas step waits for an animation frame, which never
// comes once the share window has pushed this tab into the background; image
// load events still fire there.
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = 'anonymous';
    img.decoding = 'sync';
    img.src = src;
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality));
}

function scaled(canvas: HTMLCanvasElement, factor: number): HTMLCanvasElement {
  const out = document.createElement('canvas');
  out.width = Math.max(1, Math.round(canvas.width * factor));
  out.height = Math.max(1, Math.round(canvas.height * factor));
  out.getContext('2d')?.drawImage(canvas, 0, 0, out.width, out.height);
  return out;
}

export interface CapturedVisual {
  blob: Blob;
  width: number;
  height: number;
}

export async function captureVisual(el: HTMLElement): Promise<CapturedVisual | null> {
  const rect = el.getBoundingClientRect();
  const width = Math.ceil(rect.width);
  const height = Math.ceil(Math.min(rect.height, rect.width * MAX_ASPECT));
  if (width < MIN_WIDTH || height < MIN_HEIGHT) return null;

  let canvas = document.createElement('canvas');
  try {
    const svg = await toSvg(el, {
      width,
      height,
      cacheBust: false,
      imagePlaceholder: PLACEHOLDER,
      style: { margin: '0' },
      filter: node => !(node instanceof Element && node.matches(EXCLUDE)),
    });
    const img = await loadImage(svg);
    const ratio = Math.min(2, OUTPUT_WIDTH / width);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = backgroundOf(el);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  } catch {
    return null;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const png = await toBlob(canvas, 'image/png');
    if (png && png.size <= MAX_UPLOAD_BYTES) return { blob: png, width: canvas.width, height: canvas.height };
    const jpeg = await toBlob(canvas, 'image/jpeg', 0.85);
    if (jpeg && jpeg.size <= MAX_UPLOAD_BYTES) return { blob: jpeg, width: canvas.width, height: canvas.height };
    canvas = scaled(canvas, 0.7);
  }
  return null;
}

/** Uploads a captured visual; resolves to the card image id ("<sha256>-<w>x<h>") or null. */
export async function uploadVisual(visual: CapturedVisual, signal?: AbortSignal): Promise<string | null> {
  try {
    const res = await fetch('/api/share-image', {
      method: 'POST',
      headers: { 'content-type': visual.blob.type },
      body: visual.blob,
      signal,
    });
    if (!res.ok) return null;
    const { id, width, height } = (await res.json()) as { id?: unknown; width?: unknown; height?: unknown };
    return typeof id === 'string' && typeof width === 'number' && typeof height === 'number' ? `${id}-${width}x${height}` : null;
  } catch {
    return null;
  }
}
