'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';

interface ThemeToggleProps {
  isDarkMode?: boolean;
  className?: string;
}

export default function ThemeToggle({ isDarkMode: shown, className = '' }: ThemeToggleProps) {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const dark = shown ?? isDarkMode;
  const label = `text-xs font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`;

  return (
    <div className={`flex items-center space-x-2 flex-shrink-0 ${className}`}>
      <span className={label}>Light</span>
      <button
        type="button"
        role="switch"
        aria-checked={dark}
        aria-label="Dark mode"
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${dark ? 'bg-blue-600' : 'bg-gray-300'}`}
        onClick={() => setIsDarkMode(!dark)}
      >
        <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 shadow-sm ${dark ? 'translate-x-6' : ''}`} />
      </button>
      <span className={label}>Dark</span>
    </div>
  );
}
