import React from 'react';

const GRADES = Array.from({ length: 10 }, (_, i) => i + 1);

export default function LevelSelector({ level, onChange }) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Grade</span>
      <select
        aria-label="Select grade"
        value={level}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border px-2 py-1 focus:outline focus:outline-2 focus:outline-blue-500 dark:bg-gray-800 dark:text-white"
      >
        {GRADES.map((g) => (
          <option key={g} value={String(g)}>
            Grade {g}
          </option>
        ))}
      </select>
    </label>
  );
}
