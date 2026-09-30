import { createHash } from 'crypto';
import { BlobNotFoundError, head, put } from '@vercel/blob';
import { NextResponse, type NextRequest } from 'next/server';
import { SITE_URL } from '../../lib/site';
import { SHARE_IMAGE_PREFIX } from '../../lib/og';

// Stores the picture a visitor's browser took of a visual they are sharing, so
// the /og card can frame it. Pictures are content-addressed: the same visual
// shared twice is stored once, and a URL can never be pointed at another file.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 1.5 * 1024 * 1024;
const MIN_SIDE = 64;
const MAX_SIDE = 2400;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 30;

// Per-instance only, so it is a speed bump rather than a hard limit.
const recent = new Map<string, { count: number; reset: number }>();

function allowedOrigins(): Set<string> {
  const origins = new Set<string>();
  const site = new URL(SITE_URL);
  origins.add(site.origin);
  origins.add(`${site.protocol}//${site.host.replace(/^www\./, '')}`);
  if (process.env.VERCEL_URL) origins.add(`https://${process.env.VERCEL_URL}`);
  if (process.env.VERCEL_BRANCH_URL) origins.add(`https://${process.env.VERCEL_BRANCH_URL}`);
  return origins;
}

function originAllowed(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  if (allowedOrigins().has(origin)) return true;
  return process.env.NODE_ENV === 'development' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function rateLimited(req: NextRequest): boolean {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'unknown';
  const now = Date.now();
  const entry = recent.get(ip);
  if (!entry || entry.reset < now) {
    if (recent.size > 5000) recent.clear();
    recent.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_MAX;
}

type Picture = { type: 'image/png' | 'image/jpeg'; width: number; height: number };

/** Reads the format and pixel size from the file itself; the declared type is ignored. */
function inspect(buf: Buffer): Picture | null {
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47 && buf.readUInt32BE(4) === 0x0d0a1a0a && buf.toString('ascii', 12, 16) === 'IHDR') {
    return { type: 'image/png', width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) return null;
      const marker = buf[i + 1];
      const length = buf.readUInt16BE(i + 2);
      // SOF0-SOF15 carry the frame size; C4, C8 and CC are other segment types.
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { type: 'image/jpeg', height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      i += 2 + length;
    }
  }
  return null;
}

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: { 'cache-control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return fail(503, 'Share images are not configured');
  if (!originAllowed(req)) return fail(403, 'Forbidden');
  if (rateLimited(req)) return fail(429, 'Too many share images, try again shortly');

  const declared = Number(req.headers.get('content-length') ?? '0');
  if (declared > MAX_BYTES) return fail(413, 'Image too large');
  const buf = Buffer.from(await req.arrayBuffer());
  if (!buf.length || buf.length > MAX_BYTES) return fail(413, 'Image too large');

  const picture = inspect(buf);
  if (!picture) return fail(415, 'Only PNG or JPEG images are accepted');
  const { width, height, type } = picture;
  if (width < MIN_SIDE || height < MIN_SIDE || width > MAX_SIDE || height > MAX_SIDE) return fail(422, 'Unsupported image size');

  const id = createHash('sha256').update(buf).digest('hex');
  const pathname = `${SHARE_IMAGE_PREFIX}${id}`;
  try {
    await head(pathname);
  } catch (err) {
    if (!(err instanceof BlobNotFoundError)) return fail(502, 'Image storage unavailable');
    try {
      await put(pathname, buf, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: type,
        cacheControlMaxAge: 60 * 60 * 24 * 365,
      });
    } catch {
      return fail(502, 'Image storage unavailable');
    }
  }

  return NextResponse.json({ id, width, height }, { headers: { 'cache-control': 'no-store' } });
}
