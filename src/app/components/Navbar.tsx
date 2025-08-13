'use client';

import { useState, useEffect } from 'react';
import React from 'react'; // Added missing import for React

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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/currency-hierarchy", label: "Currency Hierarchy" },
    { href: "/economic-gravity", label: "Economic Gravity" },
    { href: "/compare", label: "Compare Countries" },
    { href: "/inflation", label: "Inflation" }
  ];

  return (
    <header className={`shadow-sm border-b transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-4xl mx-auto py-3 sm:py-4 px-3 sm:px-4">
        <nav className="flex justify-between items-center">
          <div className={`text-base sm:text-lg font-semibold transition-colors duration-200 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Global Economic Indicators
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center justify-center space-x-6">
            {navItems.map((item, index) => (
              <React.Fragment key={item.href}>
                <a 
                  href={item.href} 
                  className={`text-sm px-2 transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-blue-400' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                </a>
                {index < navItems.length - 1 && (
                  <div className={`w-px h-4 transition-colors duration-200 ${
                    isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className={`sm:hidden p-2 rounded-md transition-colors duration-200 ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar; 