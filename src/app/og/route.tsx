import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from '../lib/site';
import { OG_SIZE, cardFromParams, cleanText, type CardSubject } from '../lib/og';

// Edge runtime: the Node build of @vercel/og resolves its bundled font via
// fileURLToPath, which throws on Windows project paths containing spaces.
export const runtime = 'edge';

const SKY = '#38bdf8';
const BAND = { width: 1072, height: 112 };
const DOMAIN = SITE_URL.replace(/^https?:\/\//, '').toUpperCase();

const SUBJECT_LABEL: Record<CardSubject, string> = {
  chart: 'Chart',
  dataset: 'Dataset',
  page: '',
};

function titleSize(title: string): number {
  const n = title.length;
  if (n <= 34) return 74;
  if (n <= 56) return 62;
  if (n <= 80) return 52;
  return 44;
}

function Sparkline({ series }: { series: readonly number[] }) {
  const { width: w, height: h } = BAND;
  const pad = 8;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const pts = series.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (series.length - 1);
    const y = max === min ? h / 2 : pad + (1 - (v - min) / span) * (h - pad * 2);
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10] as const;
  });
  const line = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const area = `${pad},${h} ${line} ${w - pad},${h}`;
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polygon points={area} fill={SKY} fillOpacity="0.12" />
      <polyline points={line} fill="none" stroke={SKY} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="8" fill={SKY} />
    </svg>
  );
}

// Decorative stand-in when no data series is supplied.
function ChartGlyph() {
  const { width: w, height: h } = BAND;
  const bars = [38, 52, 44, 66, 58, 74, 62, 84, 78, 96, 88, 104];
  const step = w / bars.length;
  const line = bars.map((b, i) => `${Math.round(i * step + step / 2)},${h - b + 6}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {bars.map((b, i) => (
        <rect key={i} x={Math.round(i * step + step * 0.2)} y={h - b} width={Math.round(step * 0.6)} height={b} rx="6" fill="#334155" fillOpacity="0.55" />
      ))}
      <polyline points={line} fill="none" stroke={SKY} strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const card = cardFromParams(key => q.get(key));
  const title = card.title || SITE_NAME;
  const kicker = [card.section, card.subject ? SUBJECT_LABEL[card.subject] : '']
    .filter(Boolean)
    .join('  \u00b7  ')
    .toUpperCase();
  const description = cleanText(card.description || (card.title ? '' : SITE_TAGLINE), card.metric ? 96 : 150);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '56px 64px 48px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <svg width="56" height="56" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill={SKY} opacity="0.12" />
            <path d="M12 45 L25 31 L36 39 L51 18" fill="none" stroke={SKY} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="51" cy="18" r="5.5" fill={SKY} />
          </svg>
          <div style={{ display: 'flex', fontSize: 26, color: '#94a3b8', letterSpacing: '0.08em' }}>{DOMAIN}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, gap: '14px' }}>
          {kicker && (
            <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: SKY, letterSpacing: '0.12em' }}>{kicker}</div>
          )}
          <div style={{ display: 'flex', fontSize: titleSize(title), fontWeight: 700, color: '#f8fafc', lineHeight: 1.1, maxWidth: '1072px' }}>
            {title}
          </div>
          {card.metric && (
            <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, color: '#e0f2fe', lineHeight: 1.2 }}>{card.metric}</div>
          )}
          {description && (
            <div style={{ display: 'flex', fontSize: 28, color: '#cbd5e1', lineHeight: 1.35, maxWidth: '1040px' }}>{description}</div>
          )}
        </div>

        <div style={{ display: 'flex', marginTop: '8px' }}>
          {card.series ? <Sparkline series={card.series} /> : <ChartGlyph />}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '18px',
            paddingTop: '16px',
            borderTop: '1px solid #334155',
            fontSize: 22,
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', color: '#94a3b8', fontWeight: 700 }}>{SITE_NAME}</div>
          <div style={{ display: 'flex' }}>World Bank · IMF · OECD · FRED · BIS</div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      headers: {
        // Lower-case so it replaces ImageResponse's default rather than merging with it.
        'cache-control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      },
    },
  );
}
