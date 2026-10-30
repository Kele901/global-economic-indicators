import type { Metadata } from 'next';
import Link from 'next/link';
import { INSIGHTS } from '../data/insights';
import { withOgImage } from '../lib/og';
import { formatLongDate } from '../lib/dates';
import ThemeToggle from '../components/ThemeToggle';

export const metadata: Metadata = withOgImage('/insights', {
  title: 'Insights: Dated Analysis of the World Economy and Politics | Global Economic Indicators',
  description:
    'Short, dated analysis pieces from the Global Economic Indicators editorial team: elections, human development, debt, trade and monetary policy, drawn from the data in our ledgers.',
  alternates: { canonical: '/insights' },
});

export default function InsightsIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-3xl sm:text-4xl font-bold">Insights</h1>
          <ThemeToggle className="mt-2" />
        </div>
        <p className="text-base leading-relaxed mb-8 max-w-3xl text-gray-600 dark:text-gray-300">
          Dated analysis from the editorial team. Each piece explains what recent data in the ledgers shows and why it
          matters, and every figure can be traced back to the charts and tables on this site.{' '}
          <Link href="/editorial-policy" className="text-blue-600 dark:text-blue-400 hover:underline">
            How we write and check these pieces
          </Link>
          .
        </p>

        <ol className="space-y-4">
          {INSIGHTS.map((a) => (
            <li key={a.slug}>
              <article className="rounded-xl border p-5 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  {a.topic} &middot; <time dateTime={a.date}>{formatLongDate(a.date)}</time> &middot; {a.minutes} min read
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  <Link href={`/insights/${a.slug}`} className="hover:underline">
                    {a.title}
                  </Link>
                </h2>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{a.summary}</p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
