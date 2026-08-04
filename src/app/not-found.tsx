import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found | Global Economic Indicators',
  description:
    'The page you are looking for does not exist. Explore our dashboards, epic ledgers, and data source registry instead.',
};

const SUGGESTIONS: { href: string; label: string; description: string }[] = [
  {
    href: '/',
    label: 'Dashboard',
    description: 'Live comparison of 30+ global economies across 60+ indicators.',
  },
  {
    href: '/resources',
    label: 'Resource Atlas',
    description: 'Oil, gas, metals and agricultural commodities in one scroll.',
  },
  {
    href: '/defense-ledger',
    label: 'Defense Ledger',
    description: 'Military spending, alliances, arms trade, nuclear arsenals.',
  },
  {
    href: '/climate-ledger',
    label: 'Climate Ledger',
    description: 'Emissions, energy mix, coal pipeline, climate finance.',
  },
  {
    href: '/data-sources',
    label: 'Data Sources',
    description: 'Every dataset the site consumes, with freshness stamps.',
  },
];

export default function NotFound() {
  return (
    <div className="min-h-[70vh] px-6 py-16 flex items-start justify-center bg-white dark:bg-gray-950">
      <div className="max-w-2xl w-full">
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase mb-2">
          404
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          We couldn&apos;t find that page.
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          The URL may be mistyped or the page may have moved. Here are some
          starting points that might have what you&apos;re looking for.
        </p>

        <ul className="space-y-3">
          {SUGGESTIONS.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 px-4 py-3 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                    {item.href}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-snug">
                  {item.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
