'use client';

// Shared Recharts tooltip. Pass it as `content={<ChartTooltip ... />}` so
// every chart gets the same surface, ordering and number formatting instead
// of each one inlining its own contentStyle object and formatter.

import type { ChartTheme } from '../../utils/chartTheme';

export interface TooltipEntry {
  name?: string | number;
  value?: number | string | (number | string)[];
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

interface Props {
  // Recharts injects these three.
  active?: boolean;
  label?: string | number;
  payload?: TooltipEntry[];

  theme: ChartTheme;
  // Formats a single row's value. Receives the raw value and the series name.
  format?: (value: number, name: string, payload?: Record<string, unknown>) => string;
  // Overrides the bold heading. Useful when the x-axis key is a code and you
  // want to show a display name.
  labelFormat?: (label: string | number, payload?: Record<string, unknown>) => string;
  // Extra line rendered under the rows, e.g. a survey year or a caveat.
  footer?: (payload: Record<string, unknown> | undefined) => string | null;
  unit?: string;
  precision?: number;
  // Descending by value rather than series order.
  sortByValue?: boolean;
}

function defaultFormat(value: number, unit: string, precision: number): string {
  if (!Number.isFinite(value)) return 'n/a';
  const abs = Math.abs(value);
  let body: string;
  if (abs >= 1e12) body = `${(value / 1e12).toFixed(1)}T`;
  else if (abs >= 1e9) body = `${(value / 1e9).toFixed(1)}B`;
  else if (abs >= 1e6) body = `${(value / 1e6).toFixed(1)}M`;
  else if (abs >= 10000) body = value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  else body = value.toFixed(precision);
  return `${body}${unit}`;
}

export default function ChartTooltip({
  active,
  label,
  payload,
  theme,
  format,
  labelFormat,
  footer,
  unit = '',
  precision = 1,
  sortByValue = false,
}: Props) {
  if (!active || !payload || payload.length === 0) return null;

  const rows = payload
    .filter(p => p.value !== undefined && p.value !== null)
    .map(p => ({
      name: String(p.name ?? p.dataKey ?? ''),
      raw: Array.isArray(p.value) ? Number(p.value[0]) : Number(p.value),
      color: p.color ?? theme.palette.neutral,
      payload: p.payload,
    }))
    .filter(r => Number.isFinite(r.raw));

  if (rows.length === 0) return null;
  if (sortByValue) rows.sort((a, b) => b.raw - a.raw);

  const first = payload[0]?.payload;
  const heading = labelFormat ? labelFormat(label ?? '', first) : String(label ?? '');
  const footNote = footer ? footer(first) : null;

  return (
    <div
      className="rounded-md border px-3 py-2 shadow-lg text-xs"
      style={{
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        color: theme.tooltipText,
      }}
    >
      {heading && <div className="font-semibold mb-1">{heading}</div>}
      <div className="space-y-0.5">
        {rows.map((r, i) => (
          <div key={`${r.name}-${i}`} className="flex items-center gap-2 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: r.color }} />
            {r.name && <span style={{ opacity: 0.75 }}>{r.name}</span>}
            <span className="tabular-nums font-medium ml-auto">
              {format ? format(r.raw, r.name, r.payload) : defaultFormat(r.raw, unit, precision)}
            </span>
          </div>
        ))}
      </div>
      {footNote && (
        <div className="mt-1.5 pt-1.5 border-t" style={{ borderColor: theme.tooltipBorder, opacity: 0.75 }}>
          {footNote}
        </div>
      )}
    </div>
  );
}

export { defaultFormat as formatTooltipValue };
