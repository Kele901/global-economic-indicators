'use client';

// Simple breadcrumb component used above ledger pages. Uses usePathname()
// so it stays in sync with client-side navigation.

import { usePathname } from 'next/navigation';
import { COUNTRY_SLUGS, COUNTRY_DISPLAY_NAMES } from '../utils/countryMappings';

interface Crumb { label: string; href?: string; }

const LEDGER_LABEL: Record<string, string> = {
  'defense-ledger':   'Defense Ledger',
  'climate-ledger':   'Climate Ledger',
  'trade-ledger':     'Trade Ledger',
  'migration-ledger': 'Migration Ledger',
  'debt':             'Debt Ledger',
  'ai-ledger':        'AI Ledger',
  'health-ledger':    'Health Ledger',
  'energy-ledger':    'Energy Ledger',
  'labor-ledger':     'Labor Ledger',
  'resources':        'Resource Atlas',
  'politics-ledger':  'Politics Ledger',
  'development':      'Development Ledger',
  'inequality':       'Inequality Ledger',
};

// Static sub-pages of a ledger that would otherwise be looked up as a country slug.
const SUBPAGE_LABEL: Record<string, string> = {
  'politics-ledger/match': 'Political Match',
  'development/where-do-you-stand': 'Global Income Calculator',
};

interface Props { isDarkMode?: boolean; }

export default function Breadcrumbs({ isDarkMode }: Props) {
  const path = usePathname();
  if (!path) return null;

  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return null;

  const crumbs: Crumb[] = [{ label: 'Home', href: '/' }];
  if (parts.length === 1 && LEDGER_LABEL[parts[0]]) {
    crumbs.push({ label: 'Ledgers' });
    crumbs.push({ label: LEDGER_LABEL[parts[0]] });
  } else if (parts.length === 2 && LEDGER_LABEL[parts[0]]) {
    crumbs.push({ label: 'Ledgers' });
    crumbs.push({ label: LEDGER_LABEL[parts[0]], href: '/' + parts[0] });
    const key = COUNTRY_SLUGS[parts[1].toLowerCase()];
    const sub = SUBPAGE_LABEL[`${parts[0]}/${parts[1]}`];
    crumbs.push({ label: sub ?? (key ? COUNTRY_DISPLAY_NAMES[key] : parts[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')) });
  } else {
    parts.forEach((p, i) => {
      const href = '/' + parts.slice(0, i + 1).join('/');
      const label = p.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      crumbs.push({ label, href: i === parts.length - 1 ? undefined : href });
    });
  }

  const dim = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const active = isDarkMode ? 'text-white' : 'text-gray-900';
  const link = isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900';

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center flex-wrap gap-1 text-xs">
        {crumbs.map((c, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span className={dim}>/</span>}
            {c.href ? (
              <a href={c.href} className={`${link} underline-offset-2 hover:underline`}>{c.label}</a>
            ) : (
              <span className={`${active} font-semibold`}>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
