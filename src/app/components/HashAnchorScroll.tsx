'use client';

// Charts mount after hydration (and often after a data fetch), so the
// browser's own #fragment scroll runs before the target exists. On first load
// this waits for the element, scrolls to it, and keeps it aligned while the
// charts above it finish sizing. Any user scroll input cancels it.

import { useEffect } from 'react';

const GIVE_UP_MS = 12000;
const SETTLE_MS = 2000;
const MARGIN_PX = 16;

export default function HashAnchorScroll() {
  useEffect(() => {
    let id = '';
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }
    if (!id) return;

    let foundAt = 0;
    let frame = 0;
    const align = () => {
      frame = 0;
      const el = document.getElementById(id);
      if (!el) return;
      if (!foundAt) foundAt = Date.now();
      else if (Date.now() - foundAt > SETTLE_MS) return stop();
      const top = el.getBoundingClientRect().top + window.scrollY - MARGIN_PX;
      if (Math.abs(window.scrollY - top) > 2) window.scrollTo({ top });
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(align);
    };

    const observer = new MutationObserver(schedule);
    const timer = window.setTimeout(() => stop(), GIVE_UP_MS);
    const stop = () => {
      observer.disconnect();
      window.clearTimeout(timer);
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      for (const type of ['wheel', 'touchstart', 'keydown', 'mousedown'] as const) {
        window.removeEventListener(type, stop);
      }
    };

    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    window.addEventListener('resize', schedule);
    for (const type of ['wheel', 'touchstart', 'keydown', 'mousedown'] as const) {
      window.addEventListener(type, stop, { passive: true });
    }
    schedule();
    return stop;
  }, []);

  return null;
}
