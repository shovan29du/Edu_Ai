import React, { useState } from 'react';
import { useChild } from '../contexts/ChildContext.jsx';

export default function ParentalControlPanel() {
  const { isRestricted, setIsRestricted } = useChild();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Open parental control panel"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="rounded border px-2 py-1 focus:outline focus:outline-2 focus:outline-blue-500"
      >
        🔒
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Parental Control Panel"
          className="absolute right-0 z-10 mt-2 w-64 rounded border bg-white p-4 shadow-lg dark:bg-gray-800 dark:text-white"
        >
          <h2 className="mb-2 font-semibold">Parental Controls</h2>
          <label className="flex items-center justify-between gap-2">
            <span>Restricted Mode</span>
            <input
              type="checkbox"
              checked={isRestricted}
              onChange={(e) => setIsRestricted(e.target.checked)}
              aria-label="Toggle restricted mode"
            />
          </label>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            When enabled, only resources marked safe are shown.
          </p>
        </div>
      )}
    </div>
  );
}
