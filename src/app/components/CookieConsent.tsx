'use client';

import { useState, useEffect } from 'react';
import { readCookieConsent, writeCookieConsent } from '../lib/cookieConsent';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!readCookieConsent()) {
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const acceptCookies = () => {
    writeCookieConsent('accepted');
    setShowBanner(false);
  };

  const declineCookies = () => {
    writeCookieConsent('declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-2xl z-50 border-t border-gray-700">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm sm:text-base mb-2">
              <strong>We use cookies to run the site and, if you allow it, to show ads</strong>
            </p>
            <p className="text-xs sm:text-sm text-gray-300">
              Essential cookies remember your theme and chart settings. Google AdSense cookies are used
              only if you click Accept All.{' '}
              <a href="/privacy" className="underline hover:text-blue-400 transition-colors">
                Learn more in our Privacy Policy
              </a>
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={declineCookies}
              className="flex-1 sm:flex-none bg-gray-700 hover:bg-gray-600 px-4 sm:px-6 py-2 rounded text-sm whitespace-nowrap transition-colors"
            >
              Essential only
            </button>
            <button
              onClick={acceptCookies}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 px-4 sm:px-6 py-2 rounded text-sm whitespace-nowrap transition-colors font-semibold"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
