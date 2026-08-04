import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Vitest + jsdom does not ship with a global `fetch` implementation that
// matches the Node runtime; stub it before importing the route.
const originalFetch = global.fetch;

async function importRoute() {
  // Import inside the test so module-level `dns.setDefaultResultOrder`
  // doesn't run before our stubs are in place.
  return await import('../health/route');
}

describe('/api/health', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('reports overall "ok" when every probe returns 200 quickly', async () => {
    global.fetch = vi.fn(async () => new Response('ok', { status: 200 })) as unknown as typeof fetch;

    const { GET } = await importRoute();
    const response = await GET();
    const body = await response.json();

    expect(body.overall).toBe('ok');
    expect(body.summary.total).toBeGreaterThan(0);
    expect(body.summary.down).toBe(0);
    expect(body.summary.degraded).toBe(0);
    expect(Object.keys(body.sources)).toEqual(
      expect.arrayContaining(['worldBank', 'fred', 'frankfurter', 'eia']),
    );
  });

  it('reports overall "down" when a probe returns 500', async () => {
    let callCount = 0;
    global.fetch = vi.fn(async () => {
      callCount += 1;
      if (callCount === 1) return new Response('boom', { status: 500 });
      return new Response('ok', { status: 200 });
    }) as unknown as typeof fetch;

    const { GET } = await importRoute();
    const response = await GET();
    const body = await response.json();

    expect(body.overall).toBe('down');
    expect(body.summary.down).toBeGreaterThanOrEqual(1);
  });

  it('reports overall "down" when a probe rejects (network error)', async () => {
    let callCount = 0;
    global.fetch = vi.fn(async () => {
      callCount += 1;
      if (callCount === 1) throw new Error('ECONNRESET');
      return new Response('ok', { status: 200 });
    }) as unknown as typeof fetch;

    const { GET } = await importRoute();
    const response = await GET();
    const body = await response.json();

    expect(body.overall).toBe('down');
    // The failing source should carry the error string.
    const failing = Object.values(body.sources).find(
      (s: any) => s.status === 'down',
    ) as any;
    expect(failing).toBeDefined();
    expect(failing.error).toBeTruthy();
  });

  it('returns lastCheckedAt as a valid ISO timestamp', async () => {
    global.fetch = vi.fn(async () => new Response('ok', { status: 200 })) as unknown as typeof fetch;
    const { GET } = await importRoute();
    const response = await GET();
    const body = await response.json();
    expect(Number.isNaN(Date.parse(body.lastCheckedAt))).toBe(false);
  });
});
