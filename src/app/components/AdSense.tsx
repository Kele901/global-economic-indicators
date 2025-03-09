'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[] | undefined;
  }
}

const AdSense: React.FC<{ className?: string }> = ({ className = '' }) => {
  const adRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && adRef.current) {
        // Initialize adsbygoogle array if it doesn't exist
        window.adsbygoogle = window.adsbygoogle || [];
        
        // Check if this ad slot has already been pushed
        const adElement = adRef.current.querySelector('.adsbygoogle');
        if (adElement && !adElement.getAttribute('data-adsbygoogle-status')) {
          window.adsbygoogle.push({});
        }
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div 
      ref={adRef} 
      className={`my-8 min-h-[280px] bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden ${className}`}
    >
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 p-2">
        Advertisement
      </div>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          minHeight: '250px',
          backgroundColor: 'transparent',
        }}
        data-ad-client="ca-pub-1726759813423594"
        data-ad-slot="4834833787"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSense; 