import React from 'react';
import ChildSelector from './ChildSelector.jsx';
import DarkModeToggle from './DarkModeToggle.jsx';
import ParentalControlPanel from './ParentalControlPanel.jsx';

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b p-4 dark:bg-gray-900 dark:text-white">
      <h1 className="text-xl font-bold">Global Education Platform</h1>
      <div className="flex items-center gap-3">
        <ChildSelector />
        <DarkModeToggle />
        <ParentalControlPanel />
      </div>
    </header>
  );
}
