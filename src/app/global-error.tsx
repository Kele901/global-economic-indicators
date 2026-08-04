'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global-error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          margin: 0,
          minHeight: '100vh',
          background: '#0f172a',
          color: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div style={{ maxWidth: '32rem', width: '100%', textAlign: 'center' }}>
          <div
            style={{
              margin: '0 auto 1.5rem',
              width: 56,
              height: 56,
              borderRadius: 999,
              background: 'rgba(220, 38, 38, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
            }}
            aria-hidden="true"
          >
            <span style={{ color: '#f87171' }}>!</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            The application encountered a fatal error
          </h1>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Something broke at the root of the page shell. This is rare and
            usually clears on retry. If it doesn&apos;t, reload the tab.
          </p>
          {error?.digest && (
            <p
              style={{
                color: '#64748b',
                fontSize: '0.75rem',
                fontFamily: 'ui-monospace, monospace',
                marginBottom: '1.5rem',
              }}
            >
              digest: {error.digest}
            </p>
          )}
          <button
            onClick={() => reset()}
            aria-label="Retry loading the application"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
