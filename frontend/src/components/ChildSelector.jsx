import React from 'react';
import { useChild } from '../contexts/ChildContext.jsx';

export default function ChildSelector() {
  const { child, setChild } = useChild();

  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">Select profile</span>
      <select
        aria-label="Select profile"
        value={child}
        onChange={(e) => setChild(e.target.value)}
        className="rounded border px-2 py-1 focus:outline focus:outline-2 focus:outline-blue-500 dark:bg-gray-800 dark:text-white"
      >
        <option value="Aliza">Aliza</option>
        <option value="Saifan">Saifan</option>
        <option value="Parent">Parent</option>
      </select>
    </label>
  );
}
