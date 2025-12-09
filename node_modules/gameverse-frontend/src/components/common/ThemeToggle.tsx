import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500
                 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
      aria-label="Toggle Dark Mode"
    >
      {theme === 'dark' ? (
        <span className="text-yellow-400 text-xl">☀️</span>
      ) : (
        <span className="text-gray-700 text-xl">🌙</span>
      )}
    </button>
  );
};

export default ThemeToggle;