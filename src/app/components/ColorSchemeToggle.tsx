'use client';

import { useColorScheme, type ColorScheme } from '../hooks/useColorScheme';
import { COLOR_SCHEME_DESCRIPTIONS, COLOR_SCHEME_LABELS } from '../utils/colorSchemes';

interface ColorSchemeToggleProps {
  isDarkMode: boolean;
}

const OPTIONS: ColorScheme[] = ['default', 'deuteranopia', 'protanopia', 'tritanopia'];

export default function ColorSchemeToggle({ isDarkMode }: ColorSchemeToggleProps) {
  const [scheme, setScheme] = useColorScheme();

  return (
    <div className="px-4 py-3 border-t border-b space-y-2"
      style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
      <div className={`text-[11px] uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Colour palette
      </div>
      <label htmlFor="color-scheme-select" className="sr-only">
        Choose a colour-vision-safe palette
      </label>
      <select
        id="color-scheme-select"
        value={scheme}
        onChange={(e) => setScheme(e.target.value as ColorScheme)}
        className={`w-full text-sm rounded-md px-2 py-1.5 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          isDarkMode
            ? 'bg-gray-900 border-gray-700 text-gray-100'
            : 'bg-white border-gray-300 text-gray-800'
        }`}
        aria-describedby="color-scheme-help"
      >
        {OPTIONS.map((opt) => (
          <option key={opt} value={opt}>{COLOR_SCHEME_LABELS[opt]}</option>
        ))}
      </select>
      <p id="color-scheme-help" className={`text-[11px] leading-snug ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
        {COLOR_SCHEME_DESCRIPTIONS[scheme]}
      </p>
    </div>
  );
}
