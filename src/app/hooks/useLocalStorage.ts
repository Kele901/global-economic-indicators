import { useState, useEffect } from 'react';

export const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] => {
  // Initialize state with a function to avoid unnecessary localStorage access on every render
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Sync with localStorage when value changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));

      // Handle theme-specific updates
      if (key === 'isDarkMode') {
        document.documentElement.setAttribute('data-theme', storedValue ? 'dark' : 'light');
        document.body.classList.toggle('dark', storedValue as boolean);
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Handle storage events from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue) as T;
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing storage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setStoredValue];
}; 