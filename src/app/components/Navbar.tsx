'use client';

import { useState, useEffect, useRef } from 'react';

interface NavItem {
  href?: string;
  label: string;
  children?: { href: string; label: string }[];
}

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedDarkMode = localStorage.getItem('isDarkMode');
      const hasDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
      const hasDarkClass = document.body.classList.contains('dark');
      return (savedDarkMode && JSON.parse(savedDarkMode)) || hasDarkTheme || hasDarkClass;
    }
    return false;
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const updateThemeState = () => {
      const savedDarkMode = localStorage.getItem('isDarkMode');
      const htmlElement = document.documentElement;
      const hasDarkTheme = htmlElement.getAttribute('data-theme') === 'dark';
      const hasDarkClass = document.body.classList.contains('dark');
      const shouldBeDark = (savedDarkMode && JSON.parse(savedDarkMode)) || hasDarkTheme || hasDarkClass;
      setIsDarkMode(shouldBeDark);
    };

    updateThemeState();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isDarkMode' && e.newValue !== null) {
        setIsDarkMode(JSON.parse(e.newValue));
      }
    };

    const observer = new MutationObserver(updateThemeState);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const handleThemeChange = () => updateThemeState();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleThemeChange);
    const interval = setInterval(updateThemeState, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange);
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => { setIsMobileMenuOpen(false); setOpenDropdown(null); };

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(label);
  };
  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  const navItems: NavItem[] = [
    { href: '/', label: 'Dashboard' },
    { href: '/compare', label: 'Compare' },
    { href: '/global-heatmap', label: 'Heatmap' },
    {
      label: 'Analysis',
      children: [
        { href: '/monetary-policy', label: 'Monetary Policy' },
        { href: '/debt', label: 'Debt Sustainability' },
        { href: '/outlook', label: 'Forecasts & Outlook' },
        { href: '/simulator', label: 'Scenario Simulator' },
        { href: '/development', label: 'Development Index' },
        { href: '/inequality', label: 'Inequality' },
        { href: '/trade-network', label: 'Trade Network' },
        { href: '/economic-gravity', label: 'Economic Gravity' },
        { href: '/economic-cycles', label: 'Economic Cycles' },
      ],
    },
    {
      label: 'Explore',
      children: [
        { href: '/currency-hierarchy', label: 'Currency Hierarchy' },
        { href: '/trading-places', label: 'Trading Places' },
        { href: '/inflation', label: 'Inflation' },
        { href: '/technology', label: 'Technology' },
        { href: '/cultural-capital', label: 'Cultural Capital' },
      ],
    },
    {
      label: 'Tools',
      children: [
        { href: '/inflation-calculator', label: 'Inflation Calculator' },
        { href: '/watchlist', label: 'Watchlist & Alerts' },
        { href: '/reports', label: 'Report Builder' },
        { href: '/embed-builder', label: 'Embed Builder' },
      ],
    },
    {
      label: 'Info',
      children: [
        { href: '/glossary', label: 'Glossary' },
        { href: '/guides/reading-economic-data', label: 'Guides' },
        { href: '/about', label: 'About' },
      ],
    },
  ];

  const linkClass = `text-sm px-3 py-2 transition-colors duration-200 whitespace-nowrap ${
    isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
  }`;

  const dropdownBg = isDarkMode
    ? 'bg-gray-800 border-gray-700 shadow-lg shadow-black/30'
    : 'bg-white border-gray-200 shadow-lg shadow-black/10';

  return (
    <header className={`shadow-sm border-b transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="w-full py-3 sm:py-4 px-3 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-center">
          <div className="flex items-center">
            <div className={`flex items-center space-x-3 text-base sm:text-lg font-semibold transition-colors duration-200 flex-shrink-0 mr-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <img src="/logo.png" alt="Global Economic Indicators Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              <span>Global Economic Indicators</span>
            </div>

            <div className="hidden md:flex items-center">
              <div className="flex items-center space-x-0">
                {navItems.map((item, index) => (
                  <div key={item.label} className="flex items-center">
                    {item.href ? (
                      <a href={item.href} className={linkClass}>{item.label}</a>
                    ) : (
                      <div
                        className="relative"
                        onMouseEnter={() => handleDropdownEnter(item.label)}
                        onMouseLeave={handleDropdownLeave}
                      >
                        <button className={`${linkClass} flex items-center gap-1`}>
                          {item.label}
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {openDropdown === item.label && (
                          <div className={`absolute top-full left-0 mt-1 py-1 rounded-lg border min-w-[200px] z-50 ${dropdownBg}`}>
                            {item.children!.map(child => (
                              <a
                                key={child.href}
                                href={child.href}
                                className={`block px-4 py-2 text-sm transition-colors ${
                                  isDarkMode
                                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                {child.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {index < navItems.length - 1 && (
                      <div className={`w-px h-4 mx-2 transition-colors duration-200 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={toggleMobileMenu}
            className={`md:hidden ml-auto p-2 rounded-md transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
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

        {isMobileMenuOpen && (
          <div className={`md:hidden mt-3 pb-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex flex-col space-y-0 pt-3">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.href ? (
                    <a
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`block text-sm px-3 py-2 transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <div>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                        className={`w-full flex items-center justify-between text-sm px-3 py-2 transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        {item.label}
                        <svg className={`w-3 h-3 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {openDropdown === item.label && (
                        <div className="pl-6">
                          {item.children!.map(child => (
                            <a
                              key={child.href}
                              href={child.href}
                              onClick={closeMobileMenu}
                              className={`block text-sm px-3 py-1.5 transition-colors duration-200 ${
                                isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                              }`}
                            >
                              {child.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
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
