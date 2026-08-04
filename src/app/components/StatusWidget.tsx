'use client';

import { useEffect, useRef, useState } from 'react';

type ProbeStatus = 'ok' | 'degraded' | 'down';

interface HealthResponse {
  overall: ProbeStatus;
  lastCheckedAt: string;
  summary: {
    total: number;
    ok: number;
    degraded: number;
    down: number;
  };
  sources: Record<
    string,
    { name: string; status: ProbeStatus; latencyMs: number; httpStatus?: number; error?: string }
  >;
}

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const STATUS_META: Record<
  ProbeStatus | 'loading',
  { dot: string; label: string; textLight: string; textDark: string }
> = {
  ok: {
    dot: 'bg-emerald-500',
    label: 'All systems live',
    textLight: 'text-emerald-700',
    textDark: 'text-emerald-400',
  },
  degraded: {
    dot: 'bg-amber-500',
    label: 'Some sources degraded',
    textLight: 'text-amber-700',
    textDark: 'text-amber-400',
  },
  down: {
    dot: 'bg-red-500',
    label: 'Sources unavailable',
    textLight: 'text-red-700',
    textDark: 'text-red-400',
  },
  loading: {
    dot: 'bg-gray-400',
    label: 'Checking sources…',
    textLight: 'text-gray-600',
    textDark: 'text-gray-400',
  },
};

const PRETTY_NAMES: Record<string, string> = {
  worldBank: 'World Bank',
  fred: 'FRED',
  frankfurter: 'Frankfurter',
  eia: 'EIA',
};

export default function StatusWidget() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as HealthResponse;
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[StatusWidget] /api/health failed', err);
          setLoading(false);
        }
      }
    };

    load();
    timerRef.current = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const status: ProbeStatus | 'loading' = loading
    ? 'loading'
    : data?.overall ?? 'down';
  const meta = STATUS_META[status];

  const summaryText =
    data && !loading
      ? status === 'ok'
        ? `${data.summary.ok}/${data.summary.total} live`
        : `${data.summary.down} down · ${data.summary.degraded} degraded`
      : 'checking…';

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${meta.label} — click for source details`}
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-transparent"
      >
        <span
          className={`inline-block h-2 w-2 rounded-full ${meta.dot} ${
            status === 'loading' ? 'animate-pulse' : ''
          }`}
          aria-hidden="true"
        />
        <span className="hidden sm:inline">{meta.label}</span>
        <span className="sm:hidden">Status</span>
        <span className="text-gray-500 dark:text-gray-500">· {summaryText}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 bottom-full mb-2 w-72 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-50"
        >
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              Live upstream status
            </span>
            {data && (
              <span className="text-[10px] text-gray-500 dark:text-gray-500">
                {new Date(data.lastCheckedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
          <ul className="p-2 space-y-1">
            {data
              ? Object.values(data.sources).map(src => {
                  const srcMeta = STATUS_META[src.status];
                  return (
                    <li
                      key={src.name}
                      className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <span className="flex items-center gap-2 text-xs text-gray-800 dark:text-gray-200">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${srcMeta.dot}`}
                          aria-hidden="true"
                        />
                        {PRETTY_NAMES[src.name] ?? src.name}
                      </span>
                      <span className="text-[10px] tabular-nums text-gray-500 dark:text-gray-500">
                        {src.status === 'down'
                          ? src.error ?? 'down'
                          : `${src.latencyMs}ms`}
                      </span>
                    </li>
                  );
                })
              : (
                <li className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-500">
                  Checking…
                </li>
              )}
          </ul>
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
            <a
              href="/data-sources"
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all data sources →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
