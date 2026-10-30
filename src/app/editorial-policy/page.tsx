import type { Metadata } from 'next';
import Link from 'next/link';
import { withOgImage } from '../lib/og';
import { CONTACT_EMAIL } from '../lib/site';
import { formatLongDate } from '../lib/dates';
import ThemeToggle from '../components/ThemeToggle';

const POLICY_UPDATED = '2026-10-30';

export const metadata: Metadata = withOgImage('/editorial-policy', {
  title: 'Editorial Policy: Sources, Review and Corrections | Global Economic Indicators',
  description:
    'How Global Economic Indicators chooses its sources, labels curated and estimated data, reviews its content and handles corrections.',
  alternates: { canonical: '/editorial-policy' },
});

const FLAGS: { flag: string; meaning: string }[] = [
  { flag: 'curated', meaning: 'Hand-compiled from a published report or dataset rather than pulled from a live API. It is refreshed when the publisher releases a new edition.' },
  { flag: 'estimate', meaning: 'A model output, projection or composite index (for example IMF forecasts or governance scores) rather than a direct measurement. Treat it as directional.' },
  { flag: 'frozen', meaning: 'A snapshot that has not been refreshed for more than twelve months, usually because the publisher has not released a newer edition.' },
  { flag: 'revised', meaning: 'The publisher regularly revises past values, so older figures may not match the latest release.' },
];

export default function EditorialPolicyPage() {
  const link = 'text-blue-600 dark:text-blue-400 hover:underline';
  const muted = 'text-gray-600 dark:text-gray-300';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="max-w-3xl mx-auto p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-3xl sm:text-4xl font-bold">Editorial Policy</h1>
          <ThemeToggle className="mt-2" />
        </div>
        <p className="text-sm mb-8 text-gray-500 dark:text-gray-400">
          Last updated <time dateTime={POLICY_UPDATED}>{formatLongDate(POLICY_UPDATED)}</time>
        </p>

        <div className="space-y-8 text-base leading-relaxed">
          <section>
            <p className={muted}>
              Global Economic Indicators publishes data, explainers and analysis about the world economy and politics.
              This page sets out how we decide what to publish, where the numbers come from, how we keep them current
              and what we do when we get something wrong.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Independence</h2>
            <p className="mb-3">
              The site is independent. We are not affiliated with any government, party, central bank or financial
              firm, and we do not accept payment for coverage. The site is funded by advertising; advertisers have no
              say over what we publish, and adverts are always visually separate from editorial content.
            </p>
            <p>
              Pages that describe political systems, leaders and ideologies aim to be neutral and descriptive.
              Where a claim is contested, we attribute it to its source rather than stating it as fact.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">How we choose sources</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                We prefer official statistics (national statistical offices, central banks) and the international
                institutions that harmonise them, such as the World Bank, IMF, OECD, BIS and UN agencies.
              </li>
              <li>
                For topics official statistics do not cover well, such as democracy scores, military spending or
                inequality, we use established research datasets (for example V-Dem, SIPRI or the World Inequality
                Database) and name the edition used.
              </li>
              <li>
                Every chart shows its source. The full list, with links and update schedules, is on the{' '}
                <Link href="/data-sources" className={link}>data sources page</Link>, and the{' '}
                <Link href="/methodology" className={link}>methodology</Link> explains how series are processed and
                compared.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Live, curated and estimated data</h2>
            <p className="mb-3">
              Some figures are fetched live from publisher APIs each time a page loads. Others are compiled by hand
              from reports, because the publisher has no API or because we need a specific edition. Charts that are not
              straightforward live measurements carry a label:
            </p>
            <dl className="space-y-3">
              {FLAGS.map((f) => (
                <div key={f.flag} className="rounded-lg border p-3 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                  <dt className="font-semibold">{f.flag}</dt>
                  <dd className={`text-sm ${muted}`}>{f.meaning}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Review and updates</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Curated tables are re-checked against the publisher whenever a new edition is released.</li>
              <li>
                Fast-moving facts, such as who holds office or the date of the next election, are checked at least
                monthly. Each ledger shows when its data was last verified.
              </li>
              <li>
                The written summaries on each dashboard, the guides and the{' '}
                <Link href="/insights" className={link}>Insights</Link> pieces carry a published or reviewed date, and
                are revised when the underlying data changes materially.
              </li>
              <li>
                Significant additions and corrections are recorded in the{' '}
                <Link href="/changelog" className={link}>changelog</Link>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">How we write</h2>
            <p className="mb-3">
              Guides and Insights pieces are written for a general audience. We explain technical terms the first time
              they appear and link to the{' '}
              <Link href="/glossary" className={link}>glossary</Link>. Every number in an Insights piece comes from a
              chart or table on this site, so readers can check it for themselves.
            </p>
            <p>
              We use software tools, including AI-assisted drafting, to help research and edit, but every figure is
              checked against its source and every piece is reviewed before it is published.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Corrections</h2>
            <p className="mb-3">
              If you think something on the site is wrong, please tell us. Email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className={link}>{CONTACT_EMAIL}</a> or use the{' '}
              <Link href="/contact" className={link}>contact form</Link>, and include the page and the figure
              concerned.
            </p>
            <p>
              We review every report. Confirmed errors are fixed promptly, and material corrections, meaning
              those that change a conclusion rather than a typo, are noted in the changelog.
            </p>
          </section>

          <section className="rounded-lg border p-5 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700">
            <h2 className="text-lg font-semibold mb-2">Not financial advice</h2>
            <p className="text-sm">
              Everything on this site is for information and education only. It is not investment, financial, legal
              or tax advice. See the <Link href="/disclaimer" className={link}>disclaimer</Link> for details.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
