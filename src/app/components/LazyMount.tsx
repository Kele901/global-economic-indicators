'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazyMountProps {
  children: ReactNode;
  minHeightClassName?: string;
  isDarkMode?: boolean;
  rootMargin?: string;
}

// Defers rendering (and, in combination with next/dynamic children,
// hydration + chart-lib work) until the section scrolls close to the
// viewport. Ledger pages use this for chapters 7 & 8 so the initial
// mobile paint doesn't have to compose the full 8-chapter tree.
export default function LazyMount({
  children,
  minHeightClassName = 'min-h-[600px]',
  isDarkMode = false,
  rootMargin = '400px 0px',
}: LazyMountProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visible || typeof window === 'undefined') return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref}>
      {visible ? (
        children
      ) : (
        <div
          className={`${minHeightClassName} rounded-xl border animate-pulse ${
            isDarkMode ? 'border-gray-800 bg-gray-900/40' : 'border-gray-200 bg-gray-100/60'
          }`}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
