import Link from 'next/link';
import { getGuide } from '../data/guides';
import { formatLongDate as fmt } from '../lib/dates';

export default function GuideByline({ slug, isDarkMode }: { slug: string; isDarkMode: boolean }) {
  const guide = getGuide(slug);
  if (!guide) return null;
  const revised = guide.updated !== guide.published;

  return (
    <p className={`-mt-2 mb-4 text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      By the Global Economic Indicators editorial team
      <span aria-hidden> &middot; </span>
      Published <time dateTime={guide.published}>{fmt(guide.published)}</time>
      {revised && (
        <>
          <span aria-hidden> &middot; </span>
          Updated <time dateTime={guide.updated}>{fmt(guide.updated)}</time>
        </>
      )}
      <span aria-hidden> &middot; </span>
      {guide.minutes} min read
      <span aria-hidden> &middot; </span>
      <Link href="/editorial-policy" className="underline hover:no-underline">How we write and review guides</Link>
    </p>
  );
}
