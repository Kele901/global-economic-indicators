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

  const navLinks = [
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
          {/* Logo/Brand */}
          <div className={`text-base sm:text-lg font-semibold transition-colors duration-200 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Global Economic Indicators
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center space-x-0">
            {navLinks.map((link, index) => (
              <div key={link.href} className="flex items-center">
                <a 
                  href={link.href} 
                  className={`text-sm px-3 py-2 transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-blue-400' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {link.label}
                </a>
                {/* Add separator line between links (except after the last one) */}
                {index < navLinks.length - 1 && (
                  <div className={`w-px h-4 mx-1 transition-colors duration-200 ${
                    isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className={`md:hidden p-2 rounded-md transition-colors duration-200 ${
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
          <div className={`md:hidden mt-3 pb-3 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex flex-col space-y-0 pt-3">
              {navLinks.map((link, index) => (
                <div key={link.href}>
                  <a 
                    href={link.href} 
                    onClick={closeMobileMenu}
                    className={`block text-sm px-3 py-2 transition-colors duration-200 ${
                      isDarkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {link.label}
                  </a>
                  {/* Add separator line between links (except after the last one) */}
                  {index < navLinks.length - 1 && (
                    <div className={`h-px mx-3 transition-colors duration-200 ${
                      isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar; 