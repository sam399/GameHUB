import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initialize state based on LocalStorage or System Preference
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('gameverse-theme') as Theme;
    if (savedTheme) return savedTheme;
    
    // Default to system preference if no save found
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // 2. Apply the theme class to the HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    // Remove the old theme class and add the new one on both html and body
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    root.classList.add(theme);
    body.classList.add(theme);

    // Expose theme as data attribute for CSS fallbacks
    root.setAttribute('data-theme', theme);
    body.setAttribute('data-theme', theme);

    // Save to local storage
    localStorage.setItem('gameverse-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for easy access
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};