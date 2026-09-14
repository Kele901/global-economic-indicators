'use client';

// Keeps the document-level theme classes in step with the stored
// preference. The pre-paint script in layout.tsx sets them before first
// paint; this keeps them correct afterwards, including for pages whose
// own dark-mode state lives in a child component.
//
// This used to poll localStorage every 100ms because nothing in the app
// announced a theme change reliably. useLocalStorage now dispatches both
// `themeChange` and a `local-storage:isDarkMode` event on every write, so
// the interval is gone.

import { useEffect } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const updateTheme = () => {
      let isDark = false;
      try {
        isDark = localStorage.getItem('isDarkMode') === 'true';
      } catch {
        // Storage is unavailable in some privacy modes; light mode is the
        // documented default.
      }
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      document.body.classList.toggle('dark', isDark);
    };

    updateTheme();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'isDarkMode') updateTheme();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('themeChange', updateTheme);
    window.addEventListener('local-storage:isDarkMode', updateTheme);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('themeChange', updateTheme);
      window.removeEventListener('local-storage:isDarkMode', updateTheme);
    };
  }, []);

  return <>{children}</>;
}
