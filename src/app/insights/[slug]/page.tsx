import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { INSIGHTS, INSIGHT_BY_SLUG } from '../../data/insights';
import { withOgImage } from '../../lib/og';
import { absoluteUrl, SITE_NAME, PUBLISHER_JSONLD } from '../../lib/site';
import { formatLongDate } from '../../lib/dates';
import JsonLd from '../../components/JsonLd';
import ThemeToggle from '../../components/ThemeToggle';

export const dynamicParams = false;

export function generateStaticParams() {
  return INSIGHTS.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = INSIGHT_BY_SLUG[params.slug];
  if (!a) return { title: `Insights | ${SITE_NAME}` };
  const canonical = `/insights/${a.slug}`;
  return withOgImage(
    canonical,
    {
      title: `${a.title} | ${SITE_NAME}`,
      description: a.summary,
      alternates: { canonical },
      openGraph: {
        type: 'article',
        title: a.title,
        description: a.summary,
        url: canonical,
        publishedTime: a.date,
        modifiedTime: a.updated ?? a.date,
      },
      twitter: { card: 'summary_large_image', title: a.title, description: a.summary },
    },
    { section: `Insights \u00b7 ${a.topic}` },
  );
}

export default function InsightPage({ params }: { params: { slug: string } }) {
  const a = INSIGHT_BY_SLUG[params.slug];
  if (!a) notFound();
  const url = absoluteUrl(`/insights/${a.slug}`);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: a.title,
          description: a.summary,
          url,
          mainEntityOfPage: url,
          datePublished: a.date,
          dateModified: a.updated ?? a.date,
          author: { '@type': 'Organization', name: `${SITE_NAME} editorial team`, url: absoluteUrl('/about') },
          publisher: PUBLISHER_JSONLD,
          articleSection: a.topic,
          inLanguage: 'en',
        }}
      />
      <article className="max-w-3xl mx-auto p-6 sm:p-8">
        <div className="flex justify-between items-center gap-4 mb-4">
          <Link href="/insights" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            &larr; All insights
          </Link>
          <ThemeToggle />
        </div>
        <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{a.topic}</div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">{a.title}</h1>
        <p className="mb-2 text-base sm:text-lg text-gray-600 dark:text-gray-300">{a.summary}</p>
        <p className="mb-8 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          By the {SITE_NAME} editorial team &middot; Published <time dateTime={a.date}>{formatLongDate(a.date)}</time>
          {a.updated && a.updated !== a.date && (
            <>
              {' '}&middot; Updated <time dateTime={a.updated}>{formatLongDate(a.updated)}</time>
            </>
          )}{' '}
          &middot; {a.minutes} min read
        </p>

        <div className="space-y-5 text-base leading-relaxed">
          {a.body.map((b, i) => {
            if (b.type === 'h2') return <h2 key={i} className="text-2xl font-semibold pt-3">{b.text}</h2>;
            if (b.type === 'ul') {
              return (
                <ul key={i} className="list-disc pl-6 space-y-2">
                  {b.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              );
            }
            return <p key={i}>{b.text}</p>;
          })}
        </div>

        <section className="mt-10 rounded-xl border p-5 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3">Explore the data</h2>
          <ul className="space-y-1.5 text-sm">
            {a.related.map((r) => (
              <li key={r.href}>
                <Link href={r.href} className="text-blue-600 dark:text-blue-400 hover:underline">{r.label} &rarr;</Link>
              </li>
            ))}
          </ul>
          <h2 className="text-sm font-semibold uppercase tracking-wider mt-5 mb-2">Sources</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {a.sources.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Spotted an error? See our{' '}
            <Link href="/editorial-policy" className="underline hover:no-underline">editorial and corrections policy</Link>.
          </p>
        </section>
      </article>
    </div>
  );
}
