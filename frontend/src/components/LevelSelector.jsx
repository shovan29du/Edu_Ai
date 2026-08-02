import React, { useEffect, useState } from 'react';

// Static fallback so the selector still renders every level (school through
// master's) even if /api/levels hasn't responded yet — the backend
// (app/levels.py) remains the single source of truth once it answers.
const FALLBACK_LEVELS = [
  ...Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
    label: `Grade ${i + 1}`,
    category: 'school',
    category_label: 'School',
  })),
  { id: 'C1', label: 'College Level 1', category: 'college', category_label: 'College' },
  { id: 'C2', label: 'College Level 2', category: 'college', category_label: 'College' },
  { id: 'UG1', label: 'Undergraduate Year 1', category: 'undergraduate', category_label: 'Undergraduate' },
  { id: 'UG2', label: 'Undergraduate Year 2', category: 'undergraduate', category_label: 'Undergraduate' },
  { id: 'UG3', label: 'Undergraduate Year 3', category: 'undergraduate', category_label: 'Undergraduate' },
  { id: 'UG4', label: 'Undergraduate Year 4', category: 'undergraduate', category_label: 'Undergraduate' },
  { id: 'M1', label: "Master's Year 1", category: 'masters', category_label: "Master's" },
  { id: 'M2', label: "Master's Year 2", category: 'masters', category_label: "Master's" },
];

const CATEGORY_ORDER = ['school', 'college', 'undergraduate', 'masters'];

export default function LevelSelector({ level, onChange }) {
  const [levels, setLevels] = useState(FALLBACK_LEVELS);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/levels')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.levels?.length) setLevels(data.levels);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = {};
  for (const lvl of levels) {
    if (!grouped[lvl.category]) grouped[lvl.category] = [];
    grouped[lvl.category].push(lvl);
  }
  const categories = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return (
    <label className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Level</span>
      <select
        aria-label="Select academic level"
        value={level}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border px-2 py-1 focus:outline focus:outline-2 focus:outline-blue-500 dark:bg-gray-800 dark:text-white"
      >
        {categories.map((category) => (
          <optgroup key={category} label={grouped[category][0]?.category_label || category}>
            {grouped[category].map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
