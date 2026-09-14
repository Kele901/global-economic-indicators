import { ImageResponse } from 'next/og';

// Edge runtime: the Node build of @vercel/og resolves its bundled font via
// fileURLToPath, which throws on Windows project paths containing spaces.
export const runtime = 'edge';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
        }}
      >
        <svg width="132" height="132" viewBox="0 0 64 64">
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
      </div>
    ),
    { ...size },
  );
}
