import React from 'react';

const GRADES = Array.from({ length: 10 }, (_, i) => i + 1);

export default function GradeSelector({ standard, onChange }) {
  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">Select grade</span>
      <select
        aria-label="Select grade"
        value={standard}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded border px-2 py-1 focus:outline focus:outline-2 focus:outline-blue-500 dark:bg-gray-800 dark:text-white"
      >
        {GRADES.map((g) => (
          <option key={g} value={g}>
            Standard {g}
          </option>
        ))}
      </select>
    </label>
  );
}
