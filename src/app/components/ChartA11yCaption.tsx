'use client';

import { useMemo } from 'react';

export interface A11yCaptionRow {
  label: string;
  value: number | null | undefined;
}

interface ChartA11yCaptionProps {
  title: string;
  rows: A11yCaptionRow[];
  unit?: string;
  precision?: number;
  extra?: string;
}

function formatValue(value: number, unit: string, precision: number): string {
  if (!Number.isFinite(value)) return 'n/a';
  const abs = Math.abs(value);
  let formatted: string;
  if (abs >= 1e12) formatted = `${(value / 1e12).toFixed(1)}T`;
  else if (abs >= 1e9) formatted = `${(value / 1e9).toFixed(1)}B`;
  else if (abs >= 1e6) formatted = `${(value / 1e6).toFixed(1)}M`;
  else if (abs >= 1000) formatted = value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  else formatted = value.toFixed(precision);
  return unit ? `${formatted}${unit}` : formatted;
}

// Screen-reader-only summary of a chart. Renders a <figcaption>
// with the top/bottom/median takeaways so people using assistive
// tech can extract the same insight as sighted users would from the
// bars/lines.
export default function ChartA11yCaption({
  title,
  rows,
  unit = '',
  precision = 1,
  extra,
}: ChartA11yCaptionProps) {
  const summary = useMemo(() => {
    const cleaned = rows
      .filter((r): r is { label: string; value: number } =>
        r.value !== null && r.value !== undefined && Number.isFinite(r.value))
      .sort((a, b) => b.value - a.value);
    if (cleaned.length === 0) return `${title}: no data available.`;
    const top = cleaned[0];
    const bottom = cleaned[cleaned.length - 1];
    const median = cleaned[Math.floor(cleaned.length / 2)];
    const parts: string[] = [];
    parts.push(`${title}. ${cleaned.length} data points.`);
    parts.push(`Top: ${top.label} at ${formatValue(top.value, unit, precision)}.`);
    if (cleaned.length > 2) {
      parts.push(`Median: ${median.label} at ${formatValue(median.value, unit, precision)}.`);
    }
    if (cleaned.length > 1) {
      parts.push(`Bottom: ${bottom.label} at ${formatValue(bottom.value, unit, precision)}.`);
    }
    if (extra) parts.push(extra);
    return parts.join(' ');
  }, [rows, title, unit, precision, extra]);

  return (
    <figcaption className="sr-only" aria-live="polite">
      {summary}
    </figcaption>
  );
}
