import { NextResponse } from 'next/server';
import https from 'https';
import dns from 'dns';

// Node runtime — we need `https` and `dns` for the same IPv4-first handling
// the /api/worldbank proxy uses.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

dns.setDefaultResultOrder('ipv4first');
const IPV4_AGENT = new https.Agent({ family: 4, keepAlive: true });

// Lightweight probe targets for each upstream. Kept intentionally cheap —
// no heavy series pulls, just a small ping that proves the endpoint is
// responsive and returns 2xx / 3xx.
const PROBES: { name: string; url: string; timeoutMs?: number }[] = [
  {
    name: 'worldBank',
    // A trivial 1-country / 1-indicator query with a tight date window.
    url: 'https://api.worldbank.org/v2/country/US/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=1&date=2023:2023',
  },
  {
    name: 'fred',
    // FRED root — even without an API key the domain should respond 200.
    url: 'https://fred.stlouisfed.org/',
  },
  {
    name: 'frankfurter',
    url: 'https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD',
  },
  {
    name: 'eia',
    url: 'https://www.eia.gov/opendata/',
  },
];

type ProbeStatus = 'ok' | 'degraded' | 'down';

interface ProbeResult {
  name: string;
  status: ProbeStatus;
  latencyMs: number;
  httpStatus?: number;
  error?: string;
}

async function probe(target: { name: string; url: string; timeoutMs?: number }): Promise<ProbeResult> {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), target.timeoutMs ?? 4000);

  try {
    // Use fetch with the IPv4 agent via undici's dispatcher option isn't
    // portable; we just rely on the dns setDefaultResultOrder + fetch's
    // default behaviour, which is good enough for a lightweight probe.
    void IPV4_AGENT; // retain reference so tree-shaking doesn't remove the import
    const res = await fetch(target.url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json,text/html;q=0.9,*/*;q=0.5',
        'User-Agent': 'GlobalRatesApp-HealthCheck/1.0',
      },
      cache: 'no-store',
    });
    const latencyMs = Date.now() - start;
    if (res.status >= 200 && res.status < 400) {
      // If it responded slowly (>2s), flag as degraded even though it's up.
      const status: ProbeStatus = latencyMs > 2000 ? 'degraded' : 'ok';
      return { name: target.name, status, latencyMs, httpStatus: res.status };
    }
    return {
      name: target.name,
      status: 'down',
      latencyMs,
      httpStatus: res.status,
      error: `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      name: target.name,
      status: 'down',
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'unknown error',
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const results = await Promise.all(PROBES.map(probe));

  const byName = Object.fromEntries(
    results.map(r => [r.name, r]),
  ) as Record<string, ProbeResult>;

  const downCount = results.filter(r => r.status === 'down').length;
  const degradedCount = results.filter(r => r.status === 'degraded').length;
  const overall: ProbeStatus =
    downCount > 0 ? 'down' : degradedCount > 0 ? 'degraded' : 'ok';

  return NextResponse.json(
    {
      overall,
      lastCheckedAt: new Date().toISOString(),
      sources: byName,
      summary: {
        total: results.length,
        ok: results.length - downCount - degradedCount,
        degraded: degradedCount,
        down: downCount,
      },
    },
    {
      // Cache for one minute at the CDN — a health check pinged once a
      // minute is enough for a footer widget, and keeps upstream ping load
      // low even if a lot of tabs are open.
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    },
  );
}
