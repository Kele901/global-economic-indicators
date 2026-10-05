'use client';

import * as Flags from 'country-flag-icons/react/3x2';

// Flag for any ISO 3166-1 alpha-2 code. It pulls in every flag, so load it
// with next/dynamic where a list can show any country; CountryFlag stays the
// lightweight choice for the site's own roster.
// SVGs rather than emoji because Windows renders flag emoji as letter pairs.

type FlagComponent = React.ComponentType<{ className?: string; title?: string }>;
const FLAGS = Flags as unknown as Record<string, FlagComponent | undefined>;

interface Props {
  iso2: string;
  className?: string;
  title?: string;
}

export default function IsoFlag({ iso2, className = 'w-6 h-4', title }: Props) {
  const Flag = FLAGS[iso2.toUpperCase()];
  if (!Flag) {
    return <span className={`inline-block ${className} rounded-sm bg-gray-300 dark:bg-gray-600`} aria-hidden="true" />;
  }
  return <Flag className={`inline-block ${className} rounded-sm shadow-sm`} title={title ?? iso2} />;
}
