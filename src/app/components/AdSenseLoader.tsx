'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { adsAllowed, COOKIE_CONSENT_EVENT } from '../lib/cookieConsent';

// AdSense is loaded only after the visitor accepts advertising cookies.
// The google-adsense-account meta tag in layout.tsx is enough for publisher
// verification; the adsbygoogle script itself is the personalised cookie.

export default function AdSenseLoader() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(adsAllowed());
    sync();
    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (!allowed) return null;

  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1726759813423594"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
