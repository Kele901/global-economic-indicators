import Link from 'next/link';
import { PAGE_TAKEAWAYS, TAKEAWAYS_REVIEWED, type TakeawayPage } from '../data/pageTakeaways';
import { formatLongDate } from '../lib/dates';

const reviewed = formatLongDate(TAKEAWAYS_REVIEWED);

export default function PageTakeaways({ page, isDarkMode, className = 'mb-6' }: { page: TakeawayPage; isDarkMode: boolean; className?: string }) {
  const t = PAGE_TAKEAWAYS[page];
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const body = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const heading = `text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`;

  return (
    <section
      aria-label="Editor's summary"
      className={`rounded-xl border p-4 sm:p-5 ${className} ${isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <p className={`text-sm sm:text-base font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{t.whatItShows}</p>
      <div className="mt-3 grid gap-4 md:grid-cols-[3fr_2fr]">
        <div>
          <h2 className={heading}>Why it matters</h2>
          <ul className={`text-sm space-y-1.5 list-disc pl-5 ${body}`}>
            {t.whyItMatters.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
        <div>
          <h2 className={heading}>What changed</h2>
          <ul className={`text-sm space-y-1.5 list-disc pl-5 ${body}`}>
            {t.whatChanged.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
      </div>
      <p className={`mt-3 text-[11px] ${muted}`}>
        Editor&apos;s summary, reviewed {reviewed}. Data: {t.dataNote}.{' '}
        <Link href="/editorial-policy" className="underline hover:no-underline">Editorial policy</Link>
      </p>
    </section>
  );
}
