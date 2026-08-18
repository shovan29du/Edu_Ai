import React from 'react';
import { useChild } from '../contexts/ChildContext.jsx';

export default function DarkModeToggle() {
  const { darkMode, setDarkMode } = useChild();
  return (
    <button
      type="button"
      aria-pressed={darkMode}
      aria-label="Toggle dark mode"
      onClick={() => setDarkMode(!darkMode)}
      className="rounded border px-2 py-1 focus:outline focus:outline-2 focus:outline-blue-500"
    >
      {darkMode ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
