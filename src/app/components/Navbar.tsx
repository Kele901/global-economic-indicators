'use client';

import { useState, useEffect } from 'react';

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize with the current theme state
    if (typeof window !== 'undefined') {
      const savedDarkMode = localStorage.getItem('isDarkMode');
      const hasDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
      const hasDarkClass = document.body.classList.contains('dark');
      
      return (savedDarkMode && JSON.parse(savedDarkMode)) || hasDarkTheme || hasDarkClass;
    }
    return false;
  });

  useEffect(() => {
    // Function to update theme state
    const updateThemeState = () => {
      const savedDarkMode = localStorage.getItem('isDarkMode');
      const htmlElement = document.documentElement;
      const hasDarkTheme = htmlElement.getAttribute('data-theme') === 'dark';
      const hasDarkClass = document.body.classList.contains('dark');
      
      // Use the most reliable indicator of dark mode
      const shouldBeDark = (savedDarkMode && JSON.parse(savedDarkMode)) || hasDarkTheme || hasDarkClass;
      setIsDarkMode(shouldBeDark);
    };

    // Initial theme check
    updateThemeState();

    // Listen for storage changes (when dark mode is toggled in other components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isDarkMode' && e.newValue !== null) {
        setIsDarkMode(JSON.parse(e.newValue));
      }
    };

    // Listen for DOM changes that might indicate theme changes
    const observer = new MutationObserver(updateThemeState);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Listen for custom theme change events
    const handleThemeChange = () => {
      updateThemeState();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleThemeChange);
    
    // Check theme state periodically to catch any missed updates
    const interval = setInterval(updateThemeState, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange);
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return (
    <header className={`shadow-sm border-b transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-4xl mx-auto py-4 px-4">
        <nav className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className={`text-lg font-semibold transition-colors duration-200 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Global Economic Indicators
          </div>
          <div className="flex items-center justify-center space-x-8">
            <a 
              href="/" 
              className={`text-sm px-2 transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-blue-400' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Dashboard
            </a>
            <div className={`w-px h-4 transition-colors duration-200 ${
              isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
            }`}></div>
            <a 
              href="/currency-hierarchy" 
              className={`text-sm px-4 text-center transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-blue-400' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Currency Hierarchy
            </a>
            <div className={`w-px h-4 transition-colors duration-200 ${
              isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
            }`}></div>
            <a 
              href="/economic-gravity" 
              className={`text-sm px-4 text-center transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-blue-400' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Economic Gravity
            </a>
            <div className={`w-px h-4 transition-colors duration-200 ${
              isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
            }`}></div>
            <a 
              href="/compare" 
              className={`text-sm px-4 text-center transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-blue-400' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Compare Countries
            </a>
            <div className={`w-px h-4 transition-colors duration-200 ${
              isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
            }`}></div>
            <a 
              href="/inflation" 
              className={`text-sm px-2 transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-blue-400' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Inflation
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar; 