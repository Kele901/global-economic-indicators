'use client';

// The card every chart should live in. Replaces the inline
// `rounded-xl border p-6` + local theme-token block that each chart
// previously re-declared, and gives provenance, downloads, the
// screen-reader caption and the footnote a fixed place to go.
//
// Slots, all optional:
//   provenance  ChartMeta / DataQualityBadge row, rendered top-right
//   actions     download buttons, toggles, view switchers
//   caption     ChartA11yCaption (rendered before the chart, sr-only)
//   footnote    the "what this chart does and does not say" paragraph
//
// Height is set here rather than inside each chart so a chart can be
// dropped into a different layout without editing its internals.

import type { ReactNode } from 'react';

interface Props {
  isDarkMode: boolean;
  title?: string;
  subtitle?: string;
  provenance?: ReactNode;
  actions?: ReactNode;
  caption?: ReactNode;
  footnote?: ReactNode;
  children: ReactNode;
  // Tailwind height class for the plot area, or a pixel number when the
  // chart grows with its row count.
  height?: string | number;
  className?: string;
  padded?: boolean;
}

export default function ChartCard({
  isDarkMode,
  title,
  subtitle,
  provenance,
  actions,
  caption,
  footnote,
  children,
  height = 'h-[420px]',
  className = '',
  padded = true,
}: Props) {
  const shell = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const titleCls = isDarkMode ? 'text-white' : 'text-gray-900';
  const subtitleCls = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const footCls = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const divider = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  const hasHeader = Boolean(title || subtitle || provenance || actions);

  return (
    <figure className={`rounded-xl border ${shell} ${padded ? 'p-4 sm:p-5' : 'p-0'} ${className}`}>
      {hasHeader && (
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div className="min-w-0">
            {title && <h3 className={`text-base font-semibold ${titleCls}`}>{title}</h3>}
            {subtitle && <p className={`text-sm mt-0.5 max-w-2xl ${subtitleCls}`}>{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {provenance}
            {actions}
          </div>
        </div>
      )}

      {caption}

      <div
        className={typeof height === 'string' ? height : undefined}
        style={typeof height === 'number' ? { height } : undefined}
      >
        {children}
      </div>

      {footnote && (
        <figcaption className={`text-xs leading-relaxed mt-4 pt-3 border-t ${divider} ${footCls}`}>
          {footnote}
        </figcaption>
      )}
    </figure>
  );
}
