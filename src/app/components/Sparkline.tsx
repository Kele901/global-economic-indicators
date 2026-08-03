'use client';

// Compact inline sparkline. Renders whatever points are given (typically up to
// ~30) into a fixed-size SVG. Colour reflects direction of last vs first point:
// green for up, red for down.
//
// Kept intentionally schema-free — it only requires `{ value: number }` per
// point — so tickers of any data type (FX, commodities, rates, ...) can share
// a single visual grammar.

interface Point {
  value: number;
}

interface SparklineProps {
  points: Point[] | null | undefined;
  isDarkMode?: boolean;
  width?: number;
  height?: number;
  /** Force a colour instead of inferring from up / down direction */
  strokeColor?: string;
  /** Force an area fill colour (overrides derived light fill) */
  fillColor?: string;
}

export default function Sparkline({
  points,
  isDarkMode = false,
  width = 72,
  height = 22,
  strokeColor,
  fillColor,
}: SparklineProps) {
  if (!points || points.length < 2) {
    return <div style={{ width, height }} aria-hidden />;
  }

  const values = points.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p.value - min) / range) * (height - 2) - 1;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const up = points[points.length - 1].value >= points[0].value;
  const stroke = strokeColor ?? (up ? '#10b981' : '#ef4444');
  const fill = fillColor ?? (up
    ? (isDarkMode ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.10)')
    : (isDarkMode ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.10)'));

  const polyPoints = coords.join(' ');
  const areaPoints = `0,${height} ${polyPoints} ${width},${height}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="flex-shrink-0"
      aria-hidden
    >
      <polygon points={areaPoints} fill={fill} />
      <polyline
        points={polyPoints}
        fill="none"
        stroke={stroke}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
