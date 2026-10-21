"use client";
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ isDark: true, toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to true so that night mode does not flash before the saved settings are read
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark the component as mounted to avoid hydration errors
    setMounted(true);

    // Read the real state from localStorage
    const savedTheme = localStorage.getItem('blog-theme');
    // If nothing is stored, default to dark mode (fireflies in deep space)
    const isDarkMode = savedTheme !== 'light';
    setIsDark(isDarkMode);

    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Very important: watch isDark and force-update the html tag the moment it changes, so a route switch does not lose it
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark, mounted]);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('blog-theme', newDark ? 'dark' : 'light');
  };

  // Content is rendered from the server HTML and must stay visible: hiding it until
  // hydration is what caused the blank first paint on slow phones. The theme class is
  // applied by the inline script in app/layout.tsx before the first paint instead.
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);