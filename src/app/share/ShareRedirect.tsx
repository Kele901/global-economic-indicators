'use client';

import { useEffect } from 'react';

// Forwarding happens in JS only. A server redirect or <meta http-equiv=refresh>
// would be followed by the Facebook/LinkedIn scrapers, which would then read
// the target page's generic tags instead of the share card.
export default function ShareRedirect({ href }: { href: string }) {
  useEffect(() => {
    window.location.replace(href);
  }, [href]);
  return null;
}
