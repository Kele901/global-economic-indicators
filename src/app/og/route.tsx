import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from '../lib/site';
import {
  OG_SIZE,
  PLOT_SCALE,
  cardFromParams,
  cleanText,
  parseImageId,
  shareImageUrl,
  type CardPlot,
  type CardSubject,
  type PlotSeries,
} from '../lib/og';

// Edge runtime: the Node build of @vercel/og resolves its bundled font via
// fileURLToPath, which throws on Windows project paths containing spaces.
export const runtime = 'edge';

const SKY = '#38bdf8';
const BAND = { width: 1072, height: 112 };
const DOMAIN = SITE_URL.replace(/^https?:\/\/(www\.)?/, '').toUpperCase();
const PALETTE = ['#38bdf8', '#f472b6', '#a3e635', '#fbbf24', '#c084fc', '#fb7185', '#34d399', '#f97316'];

const PAD_X = 56;
const CONTENT_WIDTH = OG_SIZE.width - PAD_X * 2;
const LEGEND_WIDTH = 300;
const LEGEND_GAP = 28;
const Y_LABEL_WIDTH = 84;

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

function plotTitleSize(title: string): number {
  const n = title.length;
  if (n <= 40) return 50;
  if (n <= 64) return 42;
  return 36;
}

function titleLines(title: string, size: number): number {
  return Math.min(2, Math.max(1, Math.ceil((title.length * size * 0.56) / CONTENT_WIDTH)));
}

// Chart colours are picked for white or dark-grey page backgrounds; near-black
// ones vanish on the card's navy.
function seriesColor(s: PlotSeries, i: number): string {
  if (!s.color) return PALETTE[i % PALETTE.length];
  const [r, g, b] = [0, 2, 4].map(o => parseInt(s.color!.slice(o, o + 2), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 0.18 ? PALETTE[i % PALETTE.length] : `#${s.color}`;
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

const r1 = (v: number) => Math.round(v * 10) / 10;

function PlotSvg({ plot, width, height }: { plot: CardPlot; width: number; height: number }) {
  const pad = 10;
  const Y = (v: number) => r1(pad + (1 - Math.max(0, Math.min(PLOT_SCALE, v)) / PLOT_SCALE) * (height - pad * 2));
  const base = plot.baseline ?? 0;
  const colored = plot.series.map((s, i) => ({ s, color: seriesColor(s, i) }));

  const bars = colored.filter(({ s }) => s.kind === 'b' || s.kind === 'B');
  const stacked = bars.some(({ s }) => s.kind === 'B');
  const barCount = Math.max(1, ...bars.map(({ s }) => s.points.length));
  const band = (width - pad * 2) / barCount;
  const slot = stacked || !bars.length ? band * 0.72 : (band * 0.8) / bars.length;
  // Stacked bars encode cumulative tops, so later series are drawn first.
  const barOrder = stacked ? [...bars].reverse() : bars;

  const curves = colored.filter(({ s }) => s.kind === 'l' || s.kind === 'a');
  const areaOrder = curves.filter(({ s }) => s.kind === 'a').reverse();
  const lines = curves.filter(({ s }) => s.kind === 'l');

  const xAt = (i: number, n: number) => r1(pad + (n <= 1 ? (width - pad * 2) / 2 : (i * (width - pad * 2)) / (n - 1)));
  const runs = (points: (number | null)[]) => {
    const out: [number, number][][] = [];
    let cur: [number, number][] = [];
    points.forEach((v, i) => {
      if (v === null) {
        if (cur.length) out.push(cur);
        cur = [];
      } else cur.push([xAt(i, points.length), Y(v)]);
    });
    if (cur.length) out.push(cur);
    return out;
  };

  const lastPoint = (points: (number | null)[]): [number, number] | null => {
    for (let i = points.length - 1; i >= 0; i--) {
      const v = points[i];
      if (v !== null) return [xAt(i, points.length), Y(v)];
    }
    return null;
  };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const y = r1(pad + f * (height - pad * 2));
        return <line key={f} x1={pad} x2={width - pad} y1={y} y2={y} stroke="#334155" strokeWidth="1.5" strokeDasharray="6 8" />;
      })}

      {barOrder.map(({ s, color }) => {
        const j = bars.findIndex(b => b.s === s);
        return s.points.map((v, i) => {
          if (v === null) return null;
          const y0 = Y(base);
          const y1 = Y(base + v);
          const x = pad + i * band + (band - (stacked ? slot : slot * bars.length)) / 2 + (stacked ? 0 : j * slot);
          return (
            <rect
              key={`${j}-${i}`}
              x={r1(x)}
              y={Math.min(y0, y1)}
              width={r1(Math.max(1, slot - (barCount > 24 ? 1 : 3)))}
              height={r1(Math.max(1.5, Math.abs(y1 - y0)))}
              rx={barCount > 24 ? 1 : 4}
              fill={color}
            />
          );
        });
      })}

      {areaOrder.map(({ s, color }, k) =>
        runs(s.points).map((run, r) => {
          if (run.length < 2) return null;
          const floor = r1(height - pad);
          const pts = run.map(([x, y]) => `${x},${y}`).join(' ');
          return (
            <g key={`a${k}-${r}`}>
              <polygon points={`${run[0][0]},${floor} ${pts} ${run[run.length - 1][0]},${floor}`} fill={color} fillOpacity="0.22" />
              <polyline points={pts} fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
            </g>
          );
        }),
      )}

      {lines.map(({ s, color }, k) =>
        runs(s.points).map((run, r) =>
          run.length < 2 ? null : (
            <polyline
              key={`l${k}-${r}`}
              points={run.map(([x, y]) => `${x},${y}`).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="4.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ),
        ),
      )}

      {lines.map(({ s, color }, k) => {
        const p = lastPoint(s.points);
        return p ? <circle key={`d${k}`} cx={p[0]} cy={p[1]} r="7" fill={color} stroke="#0f172a" strokeWidth="3" /> : null;
      })}
    </svg>
  );
}

function BarRows({ plot, height }: { plot: CardPlot; height: number }) {
  const labelWidth = 300;
  const gap = 18;
  const track = CONTENT_WIDTH - labelWidth - gap - 150;
  const rows = plot.series;
  const rowGap = 10;
  const rowHeight = Math.max(18, Math.min(40, Math.floor((height - rowGap * (rows.length - 1)) / rows.length)));
  const base = plot.baseline ?? 0;
  const px = (v: number) => (Math.max(0, Math.min(PLOT_SCALE, v)) / PLOT_SCALE) * track;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${rowGap}px`, width: '100%' }}>
      {rows.map((s, i) => {
        const v = s.points[0] ?? 0;
        const left = Math.min(px(base), px(base + v));
        const width = Math.max(4, Math.abs(px(base + v) - px(base)));
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', height: `${rowHeight}px` }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: `${labelWidth}px`,
                marginRight: `${gap}px`,
                fontSize: Math.min(26, rowHeight - 4),
                color: '#cbd5e1',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {s.label ?? ''}
            </div>
            <div style={{ display: 'flex', position: 'relative', width: `${track}px`, height: `${rowHeight}px` }}>
              <div
                style={{
                  position: 'absolute',
                  left: `${Math.round(left)}px`,
                  top: 0,
                  width: `${Math.round(width)}px`,
                  height: `${rowHeight}px`,
                  borderRadius: '6px',
                  background: seriesColor(s, i),
                }}
              />
            </div>
            {s.value && (
              <div style={{ display: 'flex', marginLeft: '14px', fontSize: Math.min(24, rowHeight - 4), fontWeight: 700, color: '#e2e8f0' }}>
                {s.value}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Legend({ series, height }: { series: PlotSeries[]; height: number }) {
  const count = series.filter(s => s.label).length;
  const fontSize = count > 6 ? 21 : 24;
  const gap = Math.max(4, Math.min(14, Math.floor((height - count * fontSize * 1.25) / Math.max(1, count - 1))));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: `${gap}px`, width: `${LEGEND_WIDTH}px`, height: `${height}px` }}>
      {series.map((s, i) =>
        s.label ? (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
            <div style={{ display: 'flex', width: '18px', height: '18px', borderRadius: '5px', background: seriesColor(s, i), flexShrink: 0 }} />
            <div
              style={{
                display: 'flex',
                flexGrow: 1,
                flexShrink: 1,
                fontSize,
                color: '#cbd5e1',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {s.label}
            </div>
            {s.value && <div style={{ display: 'flex', flexShrink: 0, fontSize, fontWeight: 700, color: '#f8fafc' }}>{s.value}</div>}
          </div>
        ) : null,
      )}
    </div>
  );
}

function Header() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <svg width="48" height="48" viewBox="0 0 64 64">
        <rect width="64" height="64" rx="14" fill={SKY} opacity="0.12" />
        <path d="M12 45 L25 31 L36 39 L51 18" fill="none" stroke={SKY} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="51" cy="18" r="5.5" fill={SKY} />
      </svg>
      <div style={{ display: 'flex', fontSize: 24, color: '#94a3b8', letterSpacing: '0.08em' }}>{DOMAIN}</div>
    </div>
  );
}

function Footer() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '18px',
        paddingTop: '14px',
        borderTop: '1px solid #334155',
        fontSize: 22,
        color: '#64748b',
      }}
    >
      <div style={{ display: 'flex', color: '#94a3b8', fontWeight: 700 }}>{SITE_NAME}</div>
      <div style={{ display: 'flex' }}>World Bank · IMF · OECD · FRED · BIS</div>
    </div>
  );
}

const ROOT_STYLE = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  fontFamily: 'sans-serif',
} as const;

function PlotCard({ title, kicker, metric, plot }: { title: string; kicker: string; metric: string; plot: CardPlot }) {
  const size = plotTitleSize(title);
  const lines = titleLines(title, size);
  const rows = plot.series.every(s => s.kind === 'h');
  const legend = !rows && plot.series.some(s => s.label);
  const hasX = !rows && !!plot.x;
  const hasY = !rows && !!plot.y;

  // Fixed vertical budget: padding 40 + header 48 + gap 20 + kicker 30 + title
  // + metric + gap 22 + x labels + footer 55 + padding 34.
  const fixed = 40 + 48 + 20 + (kicker ? 30 : 0) + Math.ceil(lines * size * 1.12) + (metric ? 42 : 0) + 22 + (hasX ? 34 : 0) + 55 + 34;
  const plotHeight = Math.max(140, OG_SIZE.height - fixed);
  const plotWidth = CONTENT_WIDTH - (legend ? LEGEND_WIDTH + LEGEND_GAP : 0) - (hasY ? Y_LABEL_WIDTH : 0);
  const axisText = { display: 'flex', fontSize: 20, color: '#94a3b8' } as const;

  return (
    <div style={{ ...ROOT_STYLE, padding: `40px ${PAD_X}px 34px` }}>
      <Header />
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '20px', gap: '6px' }}>
        {kicker && <div style={{ display: 'flex', fontSize: 22, fontWeight: 700, color: SKY, letterSpacing: '0.12em' }}>{kicker}</div>}
        <div style={{ display: 'flex', fontSize: size, fontWeight: 700, color: '#f8fafc', lineHeight: 1.1, maxWidth: `${CONTENT_WIDTH}px` }}>{title}</div>
        {metric && <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, color: '#e0f2fe', marginTop: '4px' }}>{metric}</div>}
      </div>

      <div style={{ display: 'flex', marginTop: '22px', flexGrow: 1, gap: `${LEGEND_GAP}px` }}>
        {rows ? (
          <BarRows plot={plot} height={plotHeight} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex' }}>
              {hasY && plot.y && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    width: `${Y_LABEL_WIDTH}px`,
                    height: `${plotHeight}px`,
                    paddingRight: '12px',
                  }}
                >
                  <div style={axisText}>{plot.y[1]}</div>
                  <div style={axisText}>{plot.y[0]}</div>
                </div>
              )}
              <PlotSvg plot={plot} width={plotWidth} height={plotHeight} />
            </div>
            {hasX && plot.x && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingLeft: `${hasY ? Y_LABEL_WIDTH : 0}px` }}>
                <div style={axisText}>{plot.x[0]}</div>
                <div style={axisText}>{plot.x[1]}</div>
              </div>
            )}
          </div>
        )}
        {legend && <Legend series={plot.series} height={plotHeight + (hasX ? 34 : 0)} />}
      </div>

      <Footer />
    </div>
  );
}

interface Picture {
  src: string;
  width: number;
  height: number;
}

const PICTURE_FETCH_MS = 4000;
const PICTURE_MAX_BYTES = 1.6 * 1024 * 1024;

/** Inlines the stored picture so a slow or missing file degrades to the text card instead of a broken image. */
async function loadPicture(id: string | undefined): Promise<Picture | undefined> {
  const parsed = parseImageId(id);
  const url = parsed ? shareImageUrl(parsed.hash) : undefined;
  if (!parsed || !url) return undefined;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(PICTURE_FETCH_MS) });
    if (!res.ok) return undefined;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length > PICTURE_MAX_BYTES) return undefined;
    const type = bytes[0] === 0x89 && bytes[1] === 0x50 ? 'image/png' : bytes[0] === 0xff && bytes[1] === 0xd8 ? 'image/jpeg' : '';
    if (!type) return undefined;
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return { src: `data:${type};base64,${btoa(binary)}`, width: parsed.width, height: parsed.height };
  } catch {
    return undefined;
  }
}

/** Squarish and tall pictures sit beside the title so they keep the card's full height. */
const SIDE_LAYOUT_MAX_ASPECT = 1.6;
const SIDE_TEXT_WIDTH = 360;
const SIDE_GAP = 36;

function sideTitleSize(title: string): number {
  const n = title.length;
  if (n <= 30) return 46;
  if (n <= 60) return 38;
  return 32;
}

function PictureCard({ title, kicker, picture }: { title: string; kicker: string; picture: Picture }) {
  if (picture.width / picture.height <= SIDE_LAYOUT_MAX_ASPECT) {
    // Padding 40 + header 48 + gap 20 + footer 55 + padding 34.
    const boxHeight = OG_SIZE.height - (40 + 48 + 20 + 55 + 34);
    const boxWidth = CONTENT_WIDTH - SIDE_TEXT_WIDTH - SIDE_GAP;
    const scale = Math.min(boxWidth / picture.width, boxHeight / picture.height);
    const width = Math.round(picture.width * scale);
    const height = Math.round(picture.height * scale);
    return (
      <div style={{ ...ROOT_STYLE, padding: `40px ${PAD_X}px 34px` }}>
        <Header />
        <div style={{ display: 'flex', flexGrow: 1, marginTop: '20px', gap: `${SIDE_GAP}px`, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: `${SIDE_TEXT_WIDTH}px`, gap: '12px' }}>
            {kicker && <div style={{ display: 'flex', fontSize: 20, fontWeight: 700, color: SKY, letterSpacing: '0.12em' }}>{kicker}</div>}
            <div style={{ display: 'flex', fontSize: sideTitleSize(title), fontWeight: 700, color: '#f8fafc', lineHeight: 1.12 }}>{title}</div>
          </div>
          <div style={{ display: 'flex', flexGrow: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', borderRadius: '14px', overflow: 'hidden', border: '1px solid #334155' }}>
              <img src={picture.src} width={width} height={height} alt="" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const size = plotTitleSize(title);
  const lines = titleLines(title, size);
  // Padding 40 + header 48 + gap 20 + kicker 30 + title + gap 20 + footer 55 + padding 34.
  const fixed = 40 + 48 + 20 + (kicker ? 30 : 0) + Math.ceil(lines * size * 1.12) + 20 + 55 + 34;
  const boxHeight = Math.max(160, OG_SIZE.height - fixed);
  const scale = Math.min(CONTENT_WIDTH / picture.width, boxHeight / picture.height);
  const width = Math.round(picture.width * scale);
  const height = Math.round(picture.height * scale);

  return (
    <div style={{ ...ROOT_STYLE, padding: `40px ${PAD_X}px 34px` }}>
      <Header />
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '20px', gap: '6px' }}>
        {kicker && <div style={{ display: 'flex', fontSize: 22, fontWeight: 700, color: SKY, letterSpacing: '0.12em' }}>{kicker}</div>}
        <div style={{ display: 'flex', fontSize: size, fontWeight: 700, color: '#f8fafc', lineHeight: 1.1, maxWidth: `${CONTENT_WIDTH}px` }}>{title}</div>
      </div>
      <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
        <div style={{ display: 'flex', borderRadius: '14px', overflow: 'hidden', border: '1px solid #334155' }}>
          <img src={picture.src} width={width} height={height} alt="" />
        </div>
      </div>
      <Footer />
    </div>
  );
}

function TextCard({ title, kicker, metric, description, series }: { title: string; kicker: string; metric: string; description: string; series?: readonly number[] }) {
  return (
    <div style={{ ...ROOT_STYLE, padding: '56px 64px 48px' }}>
      <Header />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, gap: '14px' }}>
        {kicker && <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: SKY, letterSpacing: '0.12em' }}>{kicker}</div>}
        <div style={{ display: 'flex', fontSize: titleSize(title), fontWeight: 700, color: '#f8fafc', lineHeight: 1.1, maxWidth: '1072px' }}>{title}</div>
        {metric && <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, color: '#e0f2fe', lineHeight: 1.2 }}>{metric}</div>}
        {description && <div style={{ display: 'flex', fontSize: 28, color: '#cbd5e1', lineHeight: 1.35, maxWidth: '1040px' }}>{description}</div>}
      </div>
      <div style={{ display: 'flex', marginTop: '8px' }}>{series ? <Sparkline series={series} /> : <ChartGlyph />}</div>
      <Footer />
    </div>
  );
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const card = cardFromParams(key => q.get(key));
  const title = card.title || SITE_NAME;
  const kicker = [card.section, card.subject ? SUBJECT_LABEL[card.subject] : '']
    .filter(Boolean)
    .join('  \u00b7  ')
    .toUpperCase();
  const picture = card.plot ? undefined : await loadPicture(card.image);

  const body = picture ? (
    <PictureCard title={title} kicker={kicker} picture={picture} />
  ) : card.plot ? (
    <PlotCard title={title} kicker={kicker} metric={card.metric} plot={card.plot} />
  ) : (
    <TextCard
      title={title}
      kicker={kicker}
      metric={card.metric}
      description={cleanText(card.description || (card.title ? '' : SITE_TAGLINE), card.metric ? 96 : 150)}
      series={card.series}
    />
  );

  return new ImageResponse(body, {
    ...OG_SIZE,
    headers: {
      // Lower-case so it replaces ImageResponse's default rather than merging with it.
      'cache-control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
    },
  });
}
