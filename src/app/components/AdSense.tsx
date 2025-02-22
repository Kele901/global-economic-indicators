'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSense: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Set a reasonable timeout for ad loading

    try {
      if (typeof window !== 'undefined') {
        // Check if the AdSense script is loaded
        if (!window.adsbygoogle) {
          setError('AdSense script not loaded');
          setIsLoading(false);
          return;
        }

        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
      setError('Failed to load advertisement');
      setIsLoading(false);
    }

    return () => clearTimeout(timeout);
  }, []);

  if (error) {
    // Return an empty div with min height to prevent layout shift
    return <div className="min-h-[100px] bg-gray-50 dark:bg-gray-800" />;
  }

  return (
    <div className="relative min-h-[100px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
          <div className="animate-pulse text-sm text-gray-500 dark:text-gray-400">
            Loading advertisement...
          </div>
        </div>
      )}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1726759813423594"
        data-ad-slot="4834833787"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSense; 