'use client';

// Shared loading placeholder for dynamically imported chart chapters.
// Ledger pages pass this as the `loading` component to next/dynamic so a
// chapter reserves its final height before the chart bundle arrives,
// instead of collapsing to zero and shifting everything below it.

interface Props {
  isDarkMode?: boolean;
  height?: string;
  label?: string;
}

export default function SkeletonCard({
  isDarkMode = false,
  height = 'h-[420px]',
  label = 'Loading chart',
}: Props) {
  const shell = isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white';
  const bar = isDarkMode ? 'bg-gray-700' : 'bg-gray-200';

  return (
    <div className={`${height} rounded-xl border p-5 ${shell}`} role="status" aria-label={label}>
      <div className={`h-4 w-40 rounded animate-pulse ${bar}`} />
      <div className={`h-3 w-64 rounded mt-2 animate-pulse ${bar}`} />
      <div className="flex items-end gap-2 mt-8 h-2/3">
        {[55, 80, 40, 95, 65, 75, 35, 60, 85, 50, 70, 45].map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t animate-pulse ${bar}`}
            style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
