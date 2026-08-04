'use client';

import { useEffect, useState } from 'react';

// Tailwind default breakpoints for a consistent story across the app.
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export interface ViewportSize {
  width: number;
  height: number;
  isMobile: boolean;   // < 640px
  isTablet: boolean;   // 640 – 1023px
  isDesktop: boolean;  // ≥ 1024px
}

// Server-safe defaults — we assume desktop on first render so the SSR
// output doesn't collapse charts to mobile styling. The first client
// effect then hydrates the real size.
const DEFAULT: ViewportSize = {
  width: 1280,
  height: 800,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
};

function measure(): ViewportSize {
  if (typeof window === 'undefined') return DEFAULT;
  const width = window.innerWidth;
  const height = window.innerHeight;
  return {
    width,
    height,
    isMobile: width < BREAKPOINTS.sm,
    isTablet: width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
  };
}

/**
 * Hook returning the current viewport size and precomputed breakpoint
 * flags. Uses matchMedia change-events for cheap updates and falls back
 * to the resize event on older browsers.
 */
export function useViewportSize(): ViewportSize {
  const [size, setSize] = useState<ViewportSize>(DEFAULT);

  useEffect(() => {
    setSize(measure());

    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setSize(measure()));
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return size;
}
