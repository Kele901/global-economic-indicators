'use client';

import { useEffect, useRef, useState } from 'react';
import { adsAllowed, COOKIE_CONSENT_EVENT } from '../lib/cookieConsent';

declare global {
  interface Window {
    adsbygoogle: any[] | undefined;
  }
}

interface AdSenseProps {
  className?: string;
  /** Only render ads when content is ready - helps with AdSense policy compliance */
  show?: boolean;
}

const AdSense: React.FC<AdSenseProps> = ({ className = '', show = true }) => {
  const adRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    const sync = () => setConsent(adsAllowed());
    sync();
    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const visible = show && consent;

  useEffect(() => {
    if (!visible) return;
    
    try {
      if (typeof window !== 'undefined' && adRef.current && !hasInitialized.current) {
        // Initialize adsbygoogle array if it doesn't exist
        window.adsbygoogle = window.adsbygoogle || [];
        
        // Check if this ad slot has already been pushed
        const adElement = adRef.current.querySelector('.adsbygoogle');
        if (adElement && !adElement.getAttribute('data-adsbygoogle-status')) {
          window.adsbygoogle.push({});
          hasInitialized.current = true;
        }
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div 
      ref={adRef} 
      className={`my-4 sm:my-6 md:my-8 min-h-[200px] sm:min-h-[250px] md:min-h-[280px] bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden ${className}`}
    >
      <div className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 p-2">
        Advertisement
      </div>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          minHeight: '180px',
          backgroundColor: 'transparent',
        }}
        data-ad-client="ca-pub-1726759813423594"
        data-ad-slot="4834833787"
        data-ad-format="auto"
        data-full-width-responsive="true"
        title="Advertisement"
      />
    </div>
  );
};

export default AdSense; 