'use client';

// Small data-quality flag rendered next to a chart title. Flags:
//   - estimate: model output or index rather than a direct measurement
//               (e.g. WGI governance scores, IMF WEO projections)
//   - curated:  hand-compiled snapshot rather than an API pull
//   - frozen:   snapshot that hasn't been refreshed in >12 months
//   - revised:  underlying source revises historical values regularly

export type QualityFlag = 'estimate' | 'curated' | 'frozen' | 'revised';

const FLAG_META: Record<QualityFlag, { label: string; fg: string; bg: string; help: string }> = {
  estimate: {
    label: 'estimate',
    fg: '#7c3aed',
    bg: 'rgba(124,58,237,0.12)',
    help: 'This series is a model output or composite index rather than a direct measurement — treat as a directional indicator.',
  },
  curated: {
    label: 'curated',
    fg: '#0284c7',
    bg: 'rgba(2,132,199,0.12)',
    help: 'Hand-compiled snapshot from a report rather than a live API pull. Refresh cadence set by the underlying publication.',
  },
  frozen: {
    label: 'frozen',
    fg: '#b45309',
    bg: 'rgba(180,83,9,0.14)',
    help: 'Snapshot has not been refreshed in more than 12 months. Values may lag the current environment.',
  },
  revised: {
    label: 'revised',
    fg: '#0f766e',
    bg: 'rgba(15,118,110,0.12)',
    help: 'Underlying source revises historical values regularly. Older prints may not match the current release.',
  },
};

interface Props {
  flag: QualityFlag;
  isDarkMode?: boolean;
  className?: string;
}

export default function DataQualityBadge({ flag, className = '' }: Props) {
  const meta = FLAG_META[flag];
  return (
    <span
      className={`inline-flex items-center shrink-0 whitespace-nowrap text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${className}`}
      style={{ color: meta.fg, backgroundColor: meta.bg }}
      title={meta.help}
      role="note"
      aria-label={`Data quality: ${meta.label}. ${meta.help}`}
    >
      {meta.label}
    </span>
  );
}
