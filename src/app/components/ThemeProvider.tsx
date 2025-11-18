'use client';

import { useEffect } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Function to update theme
    const updateTheme = () => {
      if (typeof window === 'undefined') return;
      
      const isDarkMode = localStorage.getItem('isDarkMode');
      const isDark = isDarkMode ? JSON.parse(isDarkMode) : false;
      
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.classList.remove('dark');
      }
    };

    // Initial theme setup - run immediately
    updateTheme();

    // Listen for storage changes (when theme is toggled in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isDarkMode') {
        updateTheme();
      }
    };

    // Listen for custom theme change events (from same tab)
    const handleThemeChange = () => {
      // Use setTimeout to ensure localStorage has been updated
      setTimeout(updateTheme, 0);
    };

    // Listen for any event that might indicate a theme change
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleThemeChange);

    // Aggressive polling for immediate updates (every 100ms)
    const pollInterval = setInterval(updateTheme, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange);
      clearInterval(pollInterval);
    };
  }, []);

  return <>{children}</>;
}

