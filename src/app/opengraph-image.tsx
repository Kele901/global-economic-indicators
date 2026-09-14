import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TAGLINE } from './lib/site';

// Edge runtime: the Node build of @vercel/og resolves its bundled font via
// fileURLToPath, which throws on Windows project paths containing spaces.
export const runtime = 'edge';

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <svg width="72" height="72" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#38bdf8" opacity="0.12" />
            <path
              d="M12 45 L25 31 L36 39 L51 18"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="51" cy="18" r="5.5" fill="#38bdf8" />
          </svg>
          <div style={{ display: 'flex', fontSize: 30, color: '#94a3b8', letterSpacing: '0.08em' }}>
            GLOBALECONINDICATORS.INFO
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', fontSize: 82, fontWeight: 700, color: '#f8fafc', lineHeight: 1.1 }}>
            {SITE_NAME}
          </div>
          <div style={{ display: 'flex', fontSize: 36, color: '#cbd5e1', lineHeight: 1.35, maxWidth: '900px' }}>
            {SITE_TAGLINE}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: 26, color: '#64748b' }}>
          <div style={{ display: 'flex' }}>World Bank</div>
          <div style={{ display: 'flex' }}>·</div>
          <div style={{ display: 'flex' }}>IMF</div>
          <div style={{ display: 'flex' }}>·</div>
          <div style={{ display: 'flex' }}>OECD</div>
          <div style={{ display: 'flex' }}>·</div>
          <div style={{ display: 'flex' }}>FRED</div>
          <div style={{ display: 'flex' }}>·</div>
          <div style={{ display: 'flex' }}>BIS</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
