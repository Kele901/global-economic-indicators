'use client';

import { useEffect } from 'react';

interface AdSenseProps {
  style?: React.CSSProperties;
  className?: string;
}

const AdSense: React.FC<AdSenseProps> = ({ style, className }) => {
  useEffect(() => {
    try {
      // Push the command to run when the previous command is complete
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className || ''}`}
      style={style || { display: 'block' }}
      data-ad-client="ca-pub-1726759813423594"
      data-ad-slot="4834833787"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default AdSense; 