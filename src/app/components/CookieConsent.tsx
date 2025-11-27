'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay to avoid layout shift
      setTimeout(() => {
        setShowBanner(true);
      }, 1000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-2xl z-50 border-t border-gray-700">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm sm:text-base mb-2">
              <strong>🍪 We use cookies to improve your experience</strong>
            </p>
            <p className="text-xs sm:text-sm text-gray-300">
              We use essential cookies for site functionality and third-party cookies (Google AdSense) for advertising. 
              By clicking "Accept", you consent to our use of cookies.{' '}
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
              Decline
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

